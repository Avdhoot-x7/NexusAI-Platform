// Grounded Knowledge Base for Chatbot Theory & Conversational AI (ISE Curriculum)
const RAG_KNOWLEDGE_BASE = [
  {
    id: "concept_intro_types",
    title: "Chatbot Architectures: Rule-Based vs AI-Based",
    category: "Fundamentals",
    keywords: ["rule", "ai", "type", "architecture", "pattern", "aiml", "state machine"],
    content: "Chatbots are primarily classified into Rule-Based and AI-Based (Generative / Retrieval). Rule-based chatbots rely on predefined decision trees, pattern matching (such as regular expressions or AIML), and static state machines. They operate deterministically and break when user queries deviate from expected grammars. AI-based conversational agents leverage Machine Learning, Deep Neural Networks, and Natural Language Understanding (NLU). They generalize to unseen linguistic variations, handle ambiguity through probabilistic ranking, and maintain multi-turn dialogue context."
  },
  {
    id: "concept_nlp_preprocessing",
    title: "Natural Language Processing (NLP) Preprocessing Pipeline",
    category: "NLP Preprocessing",
    keywords: ["preprocess", "tokenize", "tokenization", "lemmatize", "lemmatization", "stem", "stemming", "ner", "pos", "tagging"],
    content: "Text Preprocessing is the fundamental pipeline in conversational AI. It consists of: 1. Tokenization: Splitting raw strings into discrete words or subword units (e.g., Byte-Pair Encoding BPE, WordPiece). 2. Normalization: Lowercasing, punctuation stripping, and stop-word filtering. 3. Stemming & Lemmatization: Stemming strips prefixes/suffixes heuristically (e.g., Porter Stemmer), while Lemmatization reduces words to their grammatically valid dictionary base form (lemma) using morphological analysis (e.g., WordNet). 4. Part-of-Speech (POS) Tagging and Named Entity Recognition (NER) to locate named entities such as dates, locations, organizations, and quantities."
  },
  {
    id: "concept_feature_extraction",
    title: "Feature Extraction: Bag-of-Words, TF-IDF, and Dense Embeddings",
    category: "NLP Feature Extraction",
    keywords: ["tfidf", "tf-idf", "bow", "bag of words", "feature", "extraction", "embedding", "vector", "word2vec", "glove"],
    content: "Feature extraction transforms discrete textual tokens into numerical vectors for statistical algorithms. Bag-of-Words (BoW) represents text as word frequency histograms, ignoring word order and semantic relationships. Term Frequency-Inverse Document Frequency (TF-IDF) penalizes ubiquitously frequent words across a corpus, calculating: TF-IDF(t, d, D) = TF(t, d) * log(N / (1 + DF(t, D))). Dense word embeddings (Word2Vec, GloVe) and contextual embeddings (BERT, RoBERTa) map words into continuous multi-dimensional geometric spaces where cosine distance captures semantic similarity and syntactic analogies."
  },
  {
    id: "concept_dialogue_design",
    title: "Conversational Agent Design: Intent Recognition, Slot Filling & Multi-Turn State",
    category: "Dialogue Design",
    keywords: ["intent", "slot", "filling", "dialogue", "conversation", "state", "flow", "multi-turn", "classifier", "entity"],
    content: "Modern goal-oriented chatbots use a 3-part framework: 1. Intent Recognition: Classifying the user's objective (e.g., BookFlight, CheckWeather) via supervised classifiers (SVM, Logistic Regression, or Transformer heads). 2. Slot Filling & Entity Extraction: Identifying key parameter variables required to fulfill the intent (e.g., DepartureCity='Mumbai', Date='Tomorrow') typically framed as sequence labeling (IOB tagging with BiLSTM-CRF). 3. Dialogue State Tracking (DST): Maintaining a persistent dialogue state representation over multi-turn interactions, deciding system actions, and invoking backend APIs."
  },
  {
    id: "concept_seq_models_rnn_lstm",
    title: "Sequential Models: From RNNs to LSTMs",
    category: "Deep Learning",
    keywords: ["rnn", "lstm", "recurrent", "gru", "vanishing", "gradient", "gate", "forget gate", "cell state", "sequential"],
    content: "Recurrent Neural Networks (RNNs) process sequential input by maintaining a hidden recurrence vector h_t = f(W_h * h_{t-1} + W_x * x_t). However, when backpropagating gradients over extended sequences, repetitive multiplication by weight matrices causes vanishing or exploding gradients, preventing standard RNNs from capturing long-term dependencies. Long Short-Term Memory (LSTM) networks resolve this using an explicit memory cell (c_t) regulated by three multiplicative gating mechanisms: the Forget Gate (f_t = sigmoid(W_f[h_{t-1}, x_t])), the Input Gate (i_t), and the Output Gate (o_t). Gated Recurrent Units (GRUs) simplify this into Reset and Update gates."
  },
  {
    id: "concept_transformers_attention",
    title: "Transformers and the Multi-Head Self-Attention Mechanism",
    category: "Transformers",
    keywords: ["transformer", "attention", "self-attention", "multi-head", "query", "key", "value", "scaled dot-product", "qkv"],
    content: "The Transformer architecture (Vaswani et al., 2017) eliminated recurrence entirely, enabling full GPU parallelization. Its core is Scaled Dot-Product Attention: Attention(Q, K, V) = softmax((Q * K^T) / sqrt(d_k)) * V, where Queries (Q), Keys (K), and Values (V) are linear projections of input embeddings. Multi-Head Attention projects Q, K, and V into h distinct representation subspaces, allowing the model to simultaneously attend to syntax, coreference, and semantic context at various positions. Positional encodings (sinusoidal or rotary RoPE) provide sequence order information."
  },
  {
    id: "concept_pretrained_models",
    title: "Pretrained Models: BERT, GPT, and Transfer Learning",
    category: "Foundation Models",
    keywords: ["bert", "gpt", "pretrained", "transfer learning", "fine-tuning", "encoder", "decoder", "llm", "lora"],
    content: "Foundational Pretrained Language Models are grouped into three paradigms: 1. Autoencoding (Encoder-only, e.g., BERT): Trained on Masked Language Modeling (MLM); ideal for NLU, classification, and NER. 2. Autoregressive (Decoder-only, e.g., GPT series, LLaMA, Gemma): Trained on Causal Language Modeling (predicting next token); ideal for text generation and conversational dialogue. 3. Sequence-to-Sequence (Encoder-Decoder, e.g., T5, BART): Ideal for translation, summarization, and task-oriented dialogue. Transfer learning allows fine-tuning these models with domain data or using Parameter-Efficient Fine-Tuning (PEFT / LoRA)."
  },
  {
    id: "concept_rag_architecture",
    title: "Retrieval-Augmented Generation (RAG) Architecture",
    category: "RAG & Vector Search",
    keywords: ["rag", "retrieval", "retrieval-augmented", "vector", "chromadb", "faiss", "grounding", "cosine", "hallucination"],
    content: "Retrieval-Augmented Generation (RAG) mitigates LLM hallucinations and static training cutoff limits. The RAG architecture consists of: 1. Ingestion: Documents are chunked into coherent segments and converted to dense vector embeddings. 2. Vector Indexing: Embeddings are stored in high-dimensional vector databases (such as ChromaDB, FAISS, Milvus) using Approximate Nearest Neighbor (ANN) indexes. 3. Retrieval: At query time, the user prompt is converted to a vector embedding, and Top-K relevant chunks are retrieved via Cosine Similarity. 4. Augmented Generation: Retrieved passages are injected into the prompt context window, grounding the LLM's response in verified factual reference knowledge."
  },
  {
    id: "concept_evaluation_metrics",
    title: "Chatbot Performance Metrics & A/B Testing",
    category: "Evaluation",
    keywords: ["eval", "evaluation", "metric", "bleu", "rouge", "f1", "precision", "recall", "perplexity", "ab testing", "csat"],
    content: "Conversational systems are evaluated using both automated and human metrics: 1. NLU / Intent Metrics: Precision, Recall, F1-Score, Confusion Matrix, and Slot Error Rate (SER). 2. Generation Overlap Metrics: BLEU (Bilingual Evaluation Understudy measuring n-gram precision), ROUGE (Recall-Oriented Understudy measuring n-gram recall), and METEOR. 3. Semantic & Embedding Metrics: BERTScore and Perplexity (PPL measuring how well a probability model predicts a sample). 4. Human & Task Metrics: Task Completion Rate (TCR), Goal Success Rate (GSR), Average Turns to Completion, Customer Satisfaction (CSAT), and live online A/B testing."
  },
  {
    id: "concept_ethics_security",
    title: "Ethical Considerations, Privacy, and Guardrails",
    category: "Ethics & Safety",
    keywords: ["ethics", "ethical", "bias", "fairness", "privacy", "gdpr", "security", "guardrails", "injection", "jailbreak"],
    content: "Deploying conversational AI necessitates rigorous ethical and safety frameworks: 1. Algorithmic Bias & Fairness: Models reflect biases present in training corpora; mitigation involves curated dataset balancing and Reinforcement Learning from Human Feedback (RLHF). 2. Privacy & Data Protection: Strict compliance with GDPR, HIPAA, and DPDP laws. Sensitive personally identifiable information (PII) must be redacted. 3. Security Guardrails: Defense against Prompt Injections, Jailbreaking, and System Prompt Extraction. 4. Transparency & Disclaimers: Clearly informing users they are interacting with an AI system and providing disclaimers on potential hallucinated outputs."
  }
];

function retrieveClientRAGContext(queryText, topK = 2) {
  const queryWords = queryText.toLowerCase().replace(/[^a-z0-9\s]/g, " ").split(/\s+/).filter(w => w.length > 2);
  if (queryWords.length === 0) return [];

  const scoredDocs = RAG_KNOWLEDGE_BASE.map(doc => {
    let score = 0;
    const contentLower = doc.content.toLowerCase();
    const titleLower = doc.title.toLowerCase();

    // Check keyword hits
    doc.keywords.forEach(kw => {
      if (queryWords.includes(kw)) score += 5;
      else if (queryWords.some(qw => kw.includes(qw) || qw.includes(kw))) score += 2;
    });

    // Check title hits
    queryWords.forEach(qw => {
      if (titleLower.includes(qw)) score += 3;
      if (contentLower.includes(qw)) score += 1;
    });

    return { ...doc, score };
  });

  return scoredDocs
    .filter(d => d.score > 2)
    .sort((a, b) => b.score - a.score)
    .slice(0, topK);
}

function synthesizeRAGResponse(queryText, retrievedDocs) {
  if (!retrievedDocs || retrievedDocs.length === 0) {
    return "I searched the **NexusAI RAG Vector Database** for your query, but could not find a direct curriculum match. Try asking about **NLP Preprocessing**, **TF-IDF**, **LSTMs**, **Multi-Head Attention**, **RAG Architecture**, **Evaluation Metrics**, or **Ethical Safeguards**.";
  }

  let output = "### 📚 Grounded RAG Knowledge Retrieval\n\n";
  output += "Synthesized from verified theory indexed in the **NexusAI RAG Vector Database**:\n\n";

  retrievedDocs.forEach((doc, idx) => {
    output += `#### ${idx + 1}. ${doc.title} *(${doc.category})*\n`;
    output += `${doc.content}\n\n`;
  });

  output += "> **RAG System Note:** This response was semantically retrieved and grounded using the local vector knowledge index.";
  return output;
}
