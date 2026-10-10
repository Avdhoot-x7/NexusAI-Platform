import os
import json
import base64
import requests
from pathlib import Path

# Load local .env
BASE_DIR = Path(__file__).resolve().parent
ENV_PATH = BASE_DIR / ".env"
if ENV_PATH.exists():
    with open(ENV_PATH, "r", encoding="utf-8") as f:
        for line in f:
            line = line.strip()
            if line and not line.startswith("#") and "=" in line:
                k, v = line.split("=", 1)
                os.environ[k.strip()] = v.strip()

# OpenRouter Configuration
OPENROUTER_URL = "https://openrouter.ai/api/v1/chat/completions"
DEFAULT_MODEL = "apodex/apodex-1.1-mini:free"

def get_api_key(api_key: str = None):
    if api_key and api_key.strip():
        return api_key.strip()
    env_key = os.environ.get("OPENROUTER_API_KEY") or os.environ.get("GEMINI_API_KEY")
    if env_key and env_key.strip():
        return env_key.strip()
    raise ValueError("OpenRouter API key not found. Please provide your key in .env or via the web interface.")

def generate_chat_stream_sync(messages, model_name=DEFAULT_MODEL, system_instruction="", temperature=0.7, top_p=0.95, api_key=None):
    """
    Streams conversational tokens using OpenRouter OpenAI-compatible API.
    Supports multi-turn messages, system persona conditioning, and temperature tuning.
    """
    key = get_api_key(api_key)
    
    formatted_messages = []
    if system_instruction and system_instruction.strip():
        formatted_messages.append({
            "role": "system",
            "content": system_instruction.strip()
        })
    else:
        formatted_messages.append({
            "role": "system",
            "content": "You are NexusAI, an academic and conversational AI tutor specialized in Natural Language Processing, Machine Learning, and Information Science & Engineering."
        })

    for msg in messages:
        role = msg.get("role", "user")
        if role in ["assistant", "model", "bot"]:
            role = "assistant"
        else:
            role = "user"

        content = msg.get("content", "")
        if msg.get("image_bytes"):
            content += " [User uploaded an attachment for reference]"

        if content.strip():
            formatted_messages.append({
                "role": role,
                "content": content
            })

    headers = {
        "Authorization": f"Bearer {key}",
        "HTTP-Referer": "https://avdhoot-x7.github.io/NexusAI-Platform/",
        "X-Title": "NexusAI Platform",
        "Content-Type": "application/json"
    }

    chosen_model = model_name if (model_name and ":" in model_name) else DEFAULT_MODEL

    payload = {
        "model": chosen_model,
        "messages": formatted_messages,
        "temperature": float(temperature),
        "top_p": float(top_p),
        "stream": True
    }

    response = requests.post(OPENROUTER_URL, headers=headers, json=payload, stream=True, timeout=60)
    if response.status_code != 200:
        error_detail = response.text
        try:
            err_json = response.json()
            error_detail = err_json.get("error", {}).get("message", response.text)
        except Exception:
            pass
        raise Exception(f"OpenRouter API Error ({response.status_code}): {error_detail}")

    for line in response.iter_lines():
        if line:
            decoded = line.decode("utf-8")
            if decoded.startswith("data: ") and not decoded.startswith("data: [DONE]"):
                try:
                    chunk_json = json.loads(decoded[6:])
                    choices = chunk_json.get("choices", [])
                    if choices:
                        delta = choices[0].get("delta", {})
                        chunk_text = delta.get("content", "")
                        if chunk_text:
                            yield chunk_text
                except Exception:
                    continue

def generate_title(first_prompt: str, api_key: str = None):
    try:
        key = get_api_key(api_key)
        headers = {
            "Authorization": f"Bearer {key}",
            "HTTP-Referer": "https://avdhoot-x7.github.io/NexusAI-Platform/",
            "X-Title": "NexusAI Platform",
            "Content-Type": "application/json"
        }
        payload = {
            "model": DEFAULT_MODEL,
            "messages": [
                {"role": "system", "content": "You are a title generator. Respond ONLY with a 3-4 word title with no quotes or punctuation."},
                {"role": "user", "content": f"Title for query: {first_prompt[:150]}"}
            ],
            "max_tokens": 12
        }
        res = requests.post(OPENROUTER_URL, headers=headers, json=payload, timeout=8)
        if res.status_code == 200:
            data = res.json()
            title = data["choices"][0]["message"].get("content", "").strip()
            title = title.replace('"', '').replace("'", "").replace(".", "")
            if title and len(title) > 3:
                return title[:28]
    except Exception:
        pass
    return first_prompt[:25] + ("..." if len(first_prompt) > 25 else "")
