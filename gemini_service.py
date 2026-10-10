import os
import json
import base64
import requests

API_BASE = "https://generativelanguage.googleapis.com/v1beta"

def get_api_key(api_key: str = None):
    # Priority: explicit key passed from request -> environment variable -> raise error
    if api_key and api_key.strip():
        return api_key.strip()
    env_key = os.environ.get("GEMINI_API_KEY")
    if env_key and env_key.strip():
        return env_key.strip()
    raise ValueError(
        "API Key not found. Please configure the GEMINI_API_KEY environment variable "
        "or enter your API key in the NexusAI Model Settings modal."
    )

def generate_chat_stream_sync(messages, model_name="gemini-3.5-flash", system_instruction="", temperature=0.7, top_p=0.95, api_key=None):
    """
    Streams content using Google Gemini REST streaming API.
    Supports multi-turn messages and multimodal inline base64 images.
    """
    key = get_api_key(api_key)
    clean_model = model_name.replace("models/", "")
    url = f"{API_BASE}/models/{clean_model}:streamGenerateContent?alt=sse&key={key}"

    formatted_contents = []
    for msg in messages:
        role = msg.get("role")
        if role in ["assistant", "bot"]:
            role = "model"
        elif role != "model":
            role = "user"

        parts = []
        if msg.get("image_bytes"):
            b64_data = base64.b64encode(msg["image_bytes"]).decode("utf-8")
            mime = msg.get("image_mime", "image/jpeg")
            parts.append({
                "inlineData": {
                    "mimeType": mime,
                    "data": b64_data
                }
            })
        if msg.get("content"):
            parts.append({"text": msg["content"]})

        if parts:
            formatted_contents.append({"role": role, "parts": parts})

    payload = {
        "contents": formatted_contents,
        "generationConfig": {
            "temperature": float(temperature),
            "topP": float(top_p)
        }
    }

    if system_instruction and system_instruction.strip():
        payload["systemInstruction"] = {
            "parts": [{"text": system_instruction.strip()}]
        }

    response = requests.post(url, json=payload, stream=True, timeout=60)
    if response.status_code != 200:
        error_detail = response.text
        try:
            err_json = response.json()
            error_detail = err_json.get("error", {}).get("message", response.text)
        except Exception:
            pass
        raise Exception(f"Gemini API Error ({response.status_code}): {error_detail}")

    for line in response.iter_lines():
        if line:
            decoded = line.decode("utf-8")
            if decoded.startswith("data: "):
                try:
                    chunk_json = json.loads(decoded[6:])
                    candidates = chunk_json.get("candidates", [])
                    if candidates:
                        parts = candidates[0].get("content", {}).get("parts", [])
                        for part in parts:
                            if "text" in part:
                                yield part["text"]
                except Exception:
                    continue

def generate_title(first_prompt: str, api_key: str = None):
    try:
        key = get_api_key(api_key)
        url = f"{API_BASE}/models/gemini-3.5-flash:generateContent?key={key}"
        prompt = f"Summarize this query into a concise 3-4 word title for a chat sidebar. Reply ONLY with the title without quotation marks: {first_prompt[:180]}"
        payload = {"contents": [{"parts": [{"text": prompt}]}]}
        res = requests.post(url, json=payload, timeout=8)
        if res.status_code == 200:
            data = res.json()
            title = data["candidates"][0]["content"]["parts"][0]["text"].strip()
            return title.replace('"', '').replace("'", "")[:30]
    except Exception:
        pass
    return first_prompt[:25] + ("..." if len(first_prompt) > 25 else "")
