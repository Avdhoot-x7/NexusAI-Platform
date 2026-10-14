# NexusAI - Conversational Intelligence Platform

[![Python](https://img.shields.io/badge/Python-3.10%2B-blue.svg)](https://www.python.org/)
[![FastAPI](https://img.shields.io/badge/FastAPI-0.115%2B-009688.svg)](https://fastapi.tiangolo.com/)
[![License](https://img.shields.io/badge/License-MIT-purple.svg)](LICENSE)
[![GitHub Pages](https://img.shields.io/badge/Hosted-GitHub%20Pages-success.svg)](https://Avdhoot-x7.github.io/NexusAI-Platform/)

**NexusAI** is a modern, full-stack Conversational AI web platform engineered as an academic and practical demonstration for the **Information Science & Engineering (ISE)** Chatbot curriculum. Built with a high-performance **FastAPI** backend, real-time **Server-Sent Events (SSE)** token streaming, multi-turn conversational memory persisted via **SQLite**, and a responsive **cyber-glassmorphism** interface.

---

## 🌟 Live Demo & Preview
- 🌐 **Project Web Portal:** [https://Avdhoot-x7.github.io/NexusAI-Platform/](https://Avdhoot-x7.github.io/NexusAI-Platform/)
- 💻 **Local Interactive App:** `http://127.0.0.1:8000`

---

## ✨ Core Features

- **⚡ Real-Time Token Streaming**: Word-by-word streaming responses using Server-Sent Events (SSE) with an animated glowing cursor.
- **🔍 Vector Retrieval-Augmented Generation (RAG)**:
  - **ChromaDB Vector Store**: Embedded academic corpus of conversational AI and chatbot theory stored persistently using cosine similarity indexing.
  - **Dynamic In-Context Grounding**: System prompt dynamically augmented with retrieved theoretical passages to prevent hallucinations and provide textbook-level answers.
  - **Dual Backend + Edge Support**: ChromaDB backend retrieval for local FastAPI execution and client-side vectorized RAG knowledge retrieval for the hosted GitHub Pages portal.
- **🎨 Custom Cyber-Glassmorphism UI**:
  - Plus Jakarta Sans typography with ambient gradient glows.
  - Active neural & RAG status badges and quick prompt category cards.
  - Dark / Light theme toggle.
  - Collapsible conversations sidebar with auto-generated chat titles.
- **🧠 Multimodal Reasoning**: Ingest images (`.png`, `.jpg`, `.webp`) and source code/text files for in-context analysis.
- **💾 Local SQLite Session Persistence**: Multi-turn history, session titles, and timestamping safely stored offline in `gemini_chats.db`.
- **📐 Mathematical Formulas & Syntax-Highlighted Code**:
  - Full **LaTeX** math rendering powered by **KaTeX**.
  - Code blocks with **Tokyo-Night** syntax highlighting and a 1-click **Copy Code** button.
- **🔬 Hyperparameter & Persona Tuning Lab**:
  - Fine-tune Temperature (determinism vs creativity) and Top-P (nucleus sampling cutoff).
  - Customize System Persona prompts directly from the UI.
- **🛡️ Secure Key Isolation**: Zero hardcoded secrets in version control; keys are managed via local `.env` configuration.

---

## 📚 Curriculum Concepts Implemented (ISE Syllabus)

| Course Module | Practical Implementation |
| :--- | :--- |
| **Retrieval-Augmented Generation (RAG)** | Persistent ChromaDB vector database with Cosine metric, top-k chunk ranking, and grounded prompt augmentation. |
| **Conversational AI Architecture** | Asynchronous ASGI client-server architecture with SSE streaming endpoints. |
| **Natural Language Processing (NLP)** | Tokenization handling, lemmatization, BoW, TF-IDF, prompt formatting, context window preservation. |
| **Multi-turn Context Management** | State tracking using structured `(user, model)` role sequences stored in SQLite. |
| **Transformers & Self-Attention** | Scaled dot-product self-attention $\text{Attention}(Q, K, V) = \text{softmax}\left(\frac{QK^T}{\sqrt{d_k}}\right)V$. |
| **Evaluation Metrics & Ethics** | Evaluation metrics (BLEU, ROUGE, Perplexity), local offline session storage, privacy isolation, and output disclaimer notices. |

---

## 🚀 Quickstart Guide

### 1. Clone the Repository
```bash
git clone https://github.com/Avdhoot-x7/NexusAI-Platform.git
cd NexusAI-Platform
```

### 2. Set Up Virtual Environment & Dependencies
```bash
python -m venv venv
# On Windows:
venv\Scripts\activate
# On Linux / macOS:
source venv/bin/activate

pip install -r requirements.txt
```

### 3. Configure Your Environment Key
Create a `.env` file in the project root:
```env
GEMINI_API_KEY=your_google_api_key_here
PORT=8000
```
*(You can also input your key directly via the in-app "Parameters & Tuning" modal if desired.)*

### 4. Run the Application
```bash
python app.py
```
Open your browser and visit: **`http://127.0.0.1:8000`**

---

## 🗂️ Project Directory Structure

```
NexusAI-Platform/
├── app.py                  # FastAPI asynchronous application server & SSE endpoints
├── rag_service.py          # Persistent ChromaDB vector database & Cosine similarity retrieval
├── gemini_service.py       # Grounded Transformer inference, SSE streaming & offline RAG fallback
├── database.py             # SQLite relational schema & conversation persistence
├── requirements.txt        # Python package dependencies (FastAPI, ChromaDB, etc.)
├── .env.example            # Template for environment configuration
├── .gitignore              # Protects secrets, databases, Chroma embeddings, and uploaded media
├── PROJECT_REPORT.md       # Comprehensive ISE academic report & viva guide
├── README.md               # Project documentation
├── index.html              # Standalone web portal for GitHub Pages deployment
├── templates/
│   └── index.html          # Dynamic Jinja2 web interface for FastAPI
└── static/
    ├── css/
    │   └── style.css       # Cyber-glassmorphism theme & responsive layout
    ├── js/
    │   ├── app.js          # Local SSE consumer, Markdown parser, KaTeX math renderer
    │   ├── rag_client.js   # Client-side RAG vector knowledge base & semantic search
    │   └── portal.js       # GitHub Pages frontend with grounded RAG synthesis
    └── uploads/            # Multimodal attachment directory
```

---

## 📜 Academic Project Submission
- **Author:** Avadhut Chakradeo
- **Course:** Information Science & Engineering (ISE) - Conversational AI & Chatbots
- **License:** MIT License
