import os
from pathlib import Path
import chromadb
from chromadb.config import Settings

# Path to persistent Chroma vector database
BASE_DIR = Path(__file__).resolve().parent
CHROMA_DATA_DIR = BASE_DIR / "chroma_db"

# Academic Knowledge Base chunks covering Chatbot & Conversational AI Theory
CHATBOT_KNOWLEDGE_DOCUMENTS = [
    {
        "id": "concept_intro_types",
        "title": "Chatbot Architectures: Rule-Based vs AI-Based",
        "category": "Fundamentals",
        "content": (
            "Chatbots are primarily classified into Rule-Based and AI-Based (Generative / Retrieval). "
            "Rule-based chatbots rely on predefined decision trees, pattern matching (such as regular expressions or AIML), "
            "and static state machines. They operate deterministically and break when user queries deviate from expected grammars. "
            "AI-based conversational agents leverage Machine Learning, Deep Neural Networks, and Natural Language Understanding (NLU). "
            "They generalize to unseen linguistic variations, handle ambiguity through probabilistic ranking, and maintain multi-turn dialogue context."
        )
    },
    {
        "id": "concept_nlp_preprocessing",
        "title": "Natural Language Processing (NLP) Preprocessing Pipeline",
        "category": "NLP",
        "content": (
            "Text Preprocessing is the fundamental pipeline in conversational AI. It consists of: "
            "1. Tokenization: Splitting raw strings into discrete words or subword units (e.g., Byte-Pair Encoding BPE, WordPiece). "
            "2. Normalization: Lowercasing, punctuation stripping, and stop-word filtering. "
            "3. Stemming & Lemmatization: Stemming strips prefixes/suffixes heuristically (e.g., Porter Stemmer), "
            "while Lemmatization reduces words to their grammatically valid dictionary base form (lemma) using morphological analysis (e.g., WordNet). "
            "4. Part-of-Speech (POS) Tagging and Named Entity Recognition (NER) to locate named entities such as dates, locations, organizations, and quantities."
        )
    },
    {
        "id": "concept_feature_extraction",
        "title": "Feature Extraction: Bag-of-Words, TF-IDF, and Dense Embeddings",
        "category": "NLP",
        "content": (
            "Feature extraction transforms discrete textual tokens into numerical vectors for statistical algorithms. "
            "Bag-of-Words (BoW) represents text as word frequency histograms, ignoring word order and semantic relationships. "
            "Term Frequency-Inverse Document Frequency (TF-IDF) penalizes ubiquitously frequent words across a corpus, calculating: "
            "TF-IDF(t, d, D) = TF(t, d) * log(N / (1 + DF(t, D))). "
            "Dense word embeddings (Word2Vec, GloVe) and contextual embeddings (BERT, RoBERTa) map words into continuous multi-dimensional geometric spaces "
            "where cosine distance captures semantic similarity and syntactic analogies."
        )
    },
    {
        "id": "concept_dialogue_design",
        "title": "Conversational Agent Design: Intent Recognition, Slot Filling & Multi-Turn State",
        "category": "Dialogue Design",
        "content": (
            "Modern goal-oriented chatbots use a 3-part framework: "
            "1. Intent Recognition: Classifying the user's objective (e.g., BookFlight, CheckWeather) via supervised classifiers (SVM, Logistic Regression, or Transformer heads). "
            "2. Slot Filling & Entity Extraction: Identifying key parameter variables required to fulfill the intent (e.g., DepartureCity='Mumbai', Date='Tomorrow') typically framed as sequence labeling (IOB tagging with BiLSTM-CRF). "
            "3. Dialogue State Tracking (DST): Maintaining a persistent dialogue state representation over multi-turn interactions, deciding system actions, and invoking backend APIs."
        )
    },
    {
        "id": "concept_seq_models_rnn_lstm",
        "title": "Sequential Models: From RNNs to LSTMs",
        "category": "Deep Learning",
        "content": (
            "Recurrent Neural Networks (RNNs) process sequential input by maintaining a hidden recurrence vector h_t = f(W_h * h_{t-1} + W_x * x_t). "
            "However, when backpropagating gradients over extended sequences, repetitive multiplication by weight matrices causes vanishing or exploding gradients, "
            "preventing standard RNNs from capturing long-term dependencies. "
            "Long Short-Term Memory (LSTM) networks resolve this using an explicit memory cell (c_t) regulated by three multiplicative gating mechanisms: "
            "the Forget Gate (f_t = sigmoid(W_f[h_{t-1}, x_t])), the Input Gate (i_t), and the Output Gate (o_t). "
            "Gated Recurrent Units (GRUs) simplify this into Reset and Update gates."
        )
    },
    {
        "id": "concept_transformers_attention",
        "title": "Transformers and the Self-Attention Mechanism",
        "category": "Deep Learning",
        "content": (
            "The Transformer architecture (Vaswani et al., 2017) eliminated recurrence entirely, enabling full GPU parallelization. "
            "Its core is Scaled Dot-Product Attention: Attention(Q, K, V) = softmax((Q * K^T) / sqrt(d_k)) * V, "
            "where Queries (Q), Keys (K), and Values (V) are linear projections of input embeddings. "
            "Multi-Head Attention projects Q, K, and V into h distinct representation subspaces, allowing the model to simultaneously attend to syntax, "
            "coreference, and semantic context at various positions. "
            "Positional encodings (sinusoidal or rotary RoPE) provide sequence order information."
        )
    },
    {
        "id": "concept_pretrained_models",
        "title": "Pretrained Models: Encoder-Only, Decoder-Only, and Transfer Learning",
        "category": "Transformers",
        "content": (
            "Foundational Pretrained Language Models are grouped into three paradigms: "
            "1. Autoencoding (Encoder-only, e.g., BERT): Trained on Masked Language Modeling (MLM); ideal for NLU, classification, and NER. "
            "2. Autoregressive (Decoder-only, e.g., GPT series, LLaMA, Gemma): Trained on Causal Language Modeling (predicting next token); ideal for text generation and conversational dialogue. "
            "3. Sequence-to-Sequence (Encoder-Decoder, e.g., T5, BART): Ideal for translation, summarization, and task-oriented dialogue. "
            "Transfer learning allows fine-tuning these models with domain data or using Parameter-Efficient Fine-Tuning (PEFT / LoRA)."
        )
    },
    {
        "id": "concept_rag_architecture",
        "title": "Retrieval-Augmented Generation (RAG) for Chatbots",
        "category": "RAG",
        "content": (
            "Retrieval-Augmented Generation (RAG) mitigates LLM hallucinations and static training cutoff limits. "
            "The RAG architecture consists of: "
            "1. Ingestion: Documents are chunked into coherent segments and converted to dense vector embeddings. "
            "2. Vector Indexing: Embeddings are stored in high-dimensional vector databases (such as ChromaDB, FAISS, Milvus) using Approximate Nearest Neighbor (ANN) indexes. "
            "3. Retrieval: At query time, the user prompt is converted to a vector embedding, and Top-K relevant chunks are retrieved via Cosine Similarity. "
            "4. Augmented Generation: Retrieved passages are injected into the prompt context window, grounding the LLM's response in verified factual reference knowledge."
        )
    },
    {
        "id": "concept_evaluation_metrics",
        "title": "Chatbot Evaluation Metrics & A/B Testing",
        "category": "Evaluation",
        "content": (
            "Conversational systems are evaluated using both automated and human metrics: "
            "1. NLU / Intent Metrics: Precision, Recall, F1-Score, Confusion Matrix, and Slot Error Rate (SER). "
            "2. Generation Overlap Metrics: BLEU (Bilingual Evaluation Understudy measuring n-gram precision), ROUGE (Recall-Oriented Understudy measuring n-gram recall), and METEOR. "
            "3. Semantic & Embedding Metrics: BERTScore and Perplexity (PPL measuring how well a probability model predicts a sample). "
            "4. Human & Task Metrics: Task Completion Rate (TCR), Goal Success Rate (GSR), Average Turns to Completion, Customer Satisfaction (CSAT), and live online A/B testing."
        )
    },
    {
        "id": "concept_ethics_security",
        "title": "Ethical Considerations, Privacy, and Guardrails in Chatbots",
        "category": "Ethics",
        "content": (
            "Deploying conversational AI necessitates rigorous ethical and safety frameworks: "
            "1. Algorithmic Bias & Fairness: Models reflect biases present in training corpora; mitigation involves curated dataset balancing and Reinforcement Learning from Human Feedback (RLHF). "
            "2. Privacy & Data Protection: Strict compliance with GDPR, HIPAA, and DPDP laws. Sensitive personally identifiable information (PII) must be redacted. "
            "3. Security Guardrails: Defense against Prompt Injections, Jailbreaking, and System Prompt Extraction. "
            "4. Transparency & Disclaimers: Clearly informing users they are interacting with an AI system and providing disclaimers on potential hallucinated outputs."
        )
    }
]

_chroma_client = None
_collection = None

def get_chroma_client():
    global _chroma_client
    if _chroma_client is None:
        CHROMA_DATA_DIR.mkdir(parents=True, exist_ok=True)
        _chroma_client = chromadb.PersistentClient(
            path=str(CHROMA_DATA_DIR),
            settings=Settings(anonymized_telemetry=False)
        )
    return _chroma_client

def get_rag_collection():
    global _collection
    if _collection is None:
        client = get_chroma_client()
        _collection = client.get_or_create_collection(
            name="chatbot_theory_knowledge",
            metadata={"hnsw:space": "cosine"}
        )
        # Ensure knowledge base is seeded
        count = _collection.count()
        if count == 0:
            seed_rag_database()
    return _collection

def seed_rag_database():
    """Seeds the ChromaDB collection with conversational AI curriculum knowledge chunks."""
    client = get_chroma_client()
    col = client.get_or_create_collection(
        name="chatbot_theory_knowledge",
        metadata={"hnsw:space": "cosine"}
    )
    
    docs = [d["content"] for d in CHATBOT_KNOWLEDGE_DOCUMENTS]
    ids = [d["id"] for d in CHATBOT_KNOWLEDGE_DOCUMENTS]
    metas = [{"title": d["title"], "category": d["category"]} for d in CHATBOT_KNOWLEDGE_DOCUMENTS]

    col.upsert(
        documents=docs,
        ids=ids,
        metadatas=metas
    )
    return col.count()

def retrieve_rag_context(query_text: str, top_k: int = 2) -> list:
    """
    Retrieves the top-k most semantically relevant knowledge chunks
    matching the user query from the ChromaDB vector database.
    """
    try:
        col = get_rag_collection()
        results = col.query(
            query_texts=[query_text],
            n_results=min(top_k, col.count())
        )
        
        retrieved_items = []
        if results and "documents" in results and results["documents"]:
            docs = results["documents"][0]
            metas = results["metadatas"][0] if "metadatas" in results else [{}] * len(docs)
            distances = results["distances"][0] if "distances" in results else [0.0] * len(docs)
            
            for doc, meta, dist in zip(docs, metas, distances):
                # Filter chunks with reasonable relevance
                retrieved_items.append({
                    "title": meta.get("title", "Theory Reference"),
                    "category": meta.get("category", "General"),
                    "content": doc,
                    "relevance_score": round(1.0 - float(dist), 3) if dist is not None else 1.0
                })
        return retrieved_items
    except Exception as e:
        print(f"RAG retrieval error: {e}")
        return []
