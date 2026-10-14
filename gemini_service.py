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

# Import RAG Service
try:
    import rag_service
except ImportError:
    rag_service = None

# OpenRouter Configuration
OPENROUTER_URL = "https://openrouter.ai/api/v1/chat/completions"
DEFAULT_MODEL = "google/gemma-4-26b-a4b-it:free"

def get_api_key(api_key: str = None):
    if api_key and api_key.strip():
        return api_key.strip()
    env_key = os.environ.get("OPENROUTER_API_KEY") or os.environ.get("GEMINI_API_KEY")
    if env_key and env_key.strip():
        return env_key.strip()
    return ""

def generate_rag_offline_response(user_query: str, retrieved_docs: list) -> str:
    """
    Generates a structured, grounded response strictly using the local ChromaDB
    vector database knowledge chunks when external API endpoints are unreachable.
    """
    if not retrieved_docs:
        return (
            "I searched the local RAG knowledge base for Conversational AI & Chatbot Theory, "
            "but could not find a sufficiently high-confidence match for your query. "
            "Please ask about chatbot architectures, NLP preprocessing, tokenization, TF-IDF, "
            "LSTMs, Transformers, Attention mechanisms, evaluation metrics, or ethical guidelines."
        )

    response = "### 📚 Grounded RAG Knowledge Retrieval\n\n"
    response += "Based on verified foundational theory indexed in the **NexusAI RAG Vector Database**:\n\n"

    for i, doc in enumerate(retrieved_docs, start=1):
        score_percent = int(doc.get("relevance_score", 1.0) * 100)
        response += f"#### {i}. {doc['title']} *({doc['category']} — Confidence: {score_percent}%)*\n"
        response += f"{doc['content']}\n\n"

    response += "> **RAG System Note**: This response was semantically retrieved and synthesized locally from ChromaDB's vector index using Cosine Similarity."
    return response

def generate_chat_stream_sync(messages, model_name=DEFAULT_MODEL, system_instruction="", temperature=0.7, top_p=0.95, api_key=None, enable_rag=True):
    """
    Streams conversational tokens using OpenRouter API with RAG grounding.
    Gracefully falls back to offline RAG knowledge synthesis if the remote provider is unreachable.
    """
    key = get_api_key(api_key)
    
    # 1. Base System Persona
    base_system = system_instruction.strip() if system_instruction and system_instruction.strip() else (
        "You are NexusAI, an academic and conversational AI tutor specialized in Natural Language Processing, "
        "Machine Learning, and Information Science & Engineering."
    )

    # 2. Extract latest user query for RAG vector retrieval
    latest_user_query = ""
    for msg in reversed(messages):
        if msg.get("role") in ["user", "human"]:
            latest_user_query = msg.get("content", "").strip()
            break

    retrieved_docs = []
    rag_context_text = ""
    if enable_rag and rag_service and latest_user_query:
        retrieved_docs = rag_service.retrieve_rag_context(latest_user_query, top_k=2)
        if retrieved_docs:
            rag_context_text = "\n\n--- [GROUNDED RAG KNOWLEDGE BASE CONTEXT] ---\n"
            for i, doc in enumerate(retrieved_docs, start=1):
                rag_context_text += f"Reference {i} [{doc['title']} - {doc['category']}]:\n{doc['content']}\n\n"
            rag_context_text += "--- [INSTRUCTION: Use the above verified theoretical knowledge to inform and ground your response when relevant] ---"

    augmented_system_prompt = base_system + rag_context_text

    formatted_messages = [
        {
            "role": "system",
            "content": augmented_system_prompt
        }
    ]

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

    chosen_model = model_name or DEFAULT_MODEL

    payload = {
        "model": chosen_model,
        "messages": formatted_messages,
        "temperature": float(temperature),
        "top_p": float(top_p),
        "stream": True
    }

    try:
        response = requests.post(OPENROUTER_URL, headers=headers, json=payload, stream=True, timeout=12)
        if response.status_code == 200:
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
            return
    except Exception as e:
        print(f"Cloud inference error: {e}")

    # Fallback to Local RAG Synthesis
    offline_reply = generate_rag_offline_response(latest_user_query, retrieved_docs)
    # Stream chunks of offline reply for smooth UX
    words = offline_reply.split(" ")
    for i in range(0, len(words), 3):
        chunk = " ".join(words[i:i+3]) + " "
        yield chunk

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
        res = requests.post(OPENROUTER_URL, headers=headers, json=payload, timeout=5)
        if res.status_code == 200:
            data = res.json()
            title = data["choices"][0]["message"].get("content", "").strip()
            title = title.replace('"', '').replace("'", "").replace(".", "")
            if title and len(title) > 3:
                return title[:28]
    except Exception:
        pass
    return first_prompt[:25] + ("..." if len(first_prompt) > 25 else "")
