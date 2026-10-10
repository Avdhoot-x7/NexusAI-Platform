import os
import uuid
import json
import base64
from pathlib import Path
from fastapi import FastAPI, Request, HTTPException, UploadFile, File, Form
from fastapi.responses import HTMLResponse, StreamingResponse, JSONResponse
from fastapi.staticfiles import StaticFiles
from fastapi.templating import Jinja2Templates

# Load .env file automatically if present
BASE_DIR = Path(__file__).resolve().parent
ENV_PATH = BASE_DIR / ".env"
if ENV_PATH.exists():
    with open(ENV_PATH, "r", encoding="utf-8") as f:
        for line in f:
            line = line.strip()
            if line and not line.startswith("#") and "=" in line:
                k, v = line.split("=", 1)
                os.environ.setdefault(k.strip(), v.strip())

import database
import gemini_service

app = FastAPI(title="NexusAI - Conversational Intelligence Platform (ISE Project)")

STATIC_DIR = BASE_DIR / "static"
UPLOADS_DIR = STATIC_DIR / "uploads"
UPLOADS_DIR.mkdir(parents=True, exist_ok=True)

app.mount("/static", StaticFiles(directory=str(STATIC_DIR)), name="static")
templates = Jinja2Templates(directory=str(BASE_DIR / "templates"))

# Initialize Database tables
database.init_db()

@app.get("/", response_class=HTMLResponse)
async def index(request: Request):
    return templates.TemplateResponse("index.html", {"request": request})

@app.get("/api/sessions")
async def list_sessions():
    return database.list_sessions()

@app.post("/api/sessions")
async def create_session(data: dict = None):
    session_id = str(uuid.uuid4())
    title = (data or {}).get("title", "New Conversation")
    system_instruction = (data or {}).get("system_instruction", "")
    temperature = (data or {}).get("temperature", 0.7)
    top_p = (data or {}).get("top_p", 0.95)
    session = database.create_session(session_id, title, system_instruction, temperature, top_p)
    return session

@app.get("/api/sessions/{session_id}")
async def get_session(session_id: str):
    sess = database.get_session(session_id)
    if not sess:
        raise HTTPException(status_code=404, detail="Session not found")
    messages = database.get_messages(session_id)
    return {"session": sess, "messages": messages}

@app.delete("/api/sessions/{session_id}")
async def delete_session(session_id: str):
    database.delete_session(session_id)
    return {"status": "deleted"}

@app.put("/api/sessions/{session_id}")
async def update_session(session_id: str, data: dict):
    if "title" in data:
        database.update_session_title(session_id, data["title"])
    if "system_instruction" in data or "temperature" in data:
        sess = database.get_session(session_id)
        if sess:
            si = data.get("system_instruction", sess["system_instruction"])
            t = float(data.get("temperature", sess["temperature"]))
            p = float(data.get("top_p", sess["top_p"]))
            database.update_session_settings(session_id, si, t, p)
    return {"status": "updated"}

@app.post("/api/upload")
async def upload_file(file: UploadFile = File(...)):
    ext = Path(file.filename).suffix.lower()
    allowed_exts = [".png", ".jpg", ".jpeg", ".webp", ".gif", ".pdf", ".txt", ".py", ".csv", ".json"]
    if ext not in allowed_exts:
        raise HTTPException(status_code=400, detail="Unsupported file format")
    
    unique_filename = f"{uuid.uuid4().hex[:12]}_{file.filename}"
    file_path = UPLOADS_DIR / unique_filename
    
    content = await file.read()
    with open(file_path, "wb") as f:
        f.write(content)
        
    return {
        "filename": file.filename,
        "url": f"/static/uploads/{unique_filename}",
        "mime_type": file.content_type,
        "size": len(content)
    }

@app.post("/api/chat/stream")
async def chat_stream(data: dict):
    session_id = data.get("session_id")
    user_prompt = data.get("prompt", "").strip()
    image_url = data.get("image_url", "")
    api_key = data.get("api_key", "").strip() or None
    model_name = data.get("model", "gemini-3.5-flash")

    if not session_id:
        raise HTTPException(status_code=400, detail="session_id is required")
    if not user_prompt and not image_url:
        raise HTTPException(status_code=400, detail="Message prompt or attachment is required")

    sess = database.get_session(session_id)
    if not sess:
        sess = database.create_session(session_id, title="New Conversation")

    # Record User Message
    database.add_message(session_id, "user", user_prompt, image_url)

    # Auto-generate concise topic title for first message
    existing_messages = database.get_messages(session_id)
    if len(existing_messages) <= 2:
        new_title = gemini_service.generate_title(user_prompt or "Multimodal Query", api_key=api_key)
        database.update_session_title(session_id, new_title)

    # Build history context
    history_for_gemini = []
    for msg in existing_messages:
        item = {
            "role": msg["role"],
            "content": msg["content"]
        }
        if msg["image_url"]:
            rel_path = msg["image_url"].replace("/static/uploads/", "")
            full_path = UPLOADS_DIR / rel_path
            if full_path.exists():
                with open(full_path, "rb") as f:
                    item["image_bytes"] = f.read()
                ext = full_path.suffix.lower()
                mime = "image/jpeg"
                if ext == ".png": mime = "image/png"
                elif ext == ".webp": mime = "image/webp"
                elif ext == ".gif": mime = "image/gif"
                item["image_mime"] = mime
        history_for_gemini.append(item)

    system_instruction = sess.get("system_instruction", "")
    temperature = sess.get("temperature", 0.7)
    top_p = sess.get("top_p", 0.95)

    def event_generator():
        accumulated_text = ""
        try:
            stream = gemini_service.generate_chat_stream_sync(
                messages=history_for_gemini,
                model_name=model_name,
                system_instruction=system_instruction,
                temperature=temperature,
                top_p=top_p,
                api_key=api_key
            )
            for chunk in stream:
                accumulated_text += chunk
                payload = json.dumps({"text": chunk, "done": False})
                yield f"data: {payload}\n\n"
            
            # Save final response to DB
            database.add_message(session_id, "model", accumulated_text)
            payload = json.dumps({"text": "", "done": True})
            yield f"data: {payload}\n\n"
        except Exception as e:
            err_msg = str(e)
            yield f"data: {json.dumps({'error': err_msg, 'done': True})}\n\n"

    return StreamingResponse(event_generator(), media_type="text/event-stream")

if __name__ == "__main__":
    import uvicorn
    port = int(os.environ.get("PORT", 8000))
    uvicorn.run("app:app", host="127.0.0.1", port=port, reload=True)
