document.addEventListener("DOMContentLoaded", () => {
  // Elements
  const sidebar = document.getElementById("sidebar");
  const toggleSidebarBtn = document.getElementById("toggle-sidebar-btn");
  const mobileToggleBtn = document.getElementById("mobile-toggle-btn");
  const newChatBtn = document.getElementById("new-chat-btn");
  const sessionsList = document.getElementById("sessions-list");
  const chatContainer = document.getElementById("chat-container");
  const heroScreen = document.getElementById("hero-screen");
  const messagesList = document.getElementById("messages-list");
  const chatForm = document.getElementById("chat-form");
  const chatTextarea = document.getElementById("chat-textarea");
  const sendBtn = document.getElementById("send-btn");
  const attachBtn = document.getElementById("attach-btn");
  const fileInput = document.getElementById("file-input");
  const attachmentPreview = document.getElementById("attachment-preview");
  const previewImg = document.getElementById("preview-img");
  const previewFileIcon = document.getElementById("preview-file-icon");
  const previewFileName = document.getElementById("preview-file-name");
  const removeAttachmentBtn = document.getElementById("remove-attachment-btn");
  const themeToggleBtn = document.getElementById("theme-toggle-btn");

  // Settings & Info modal
  const openSettingsBtn = document.getElementById("open-settings-btn");
  const closeSettingsBtn = document.getElementById("close-settings-btn");
  const settingsModal = document.getElementById("settings-modal");
  const saveSettingsBtn = document.getElementById("save-settings-btn");
  const apiKeyInput = document.getElementById("api-key-input");
  const toggleKeyVisibilityBtn = document.getElementById("toggle-key-visibility-btn");
  const modelSelect = document.getElementById("model-select");
  const systemPromptInput = document.getElementById("system-prompt-input");
  const tempSlider = document.getElementById("temperature-slider");
  const tempVal = document.getElementById("temp-val");
  const toppSlider = document.getElementById("topp-slider");
  const toppVal = document.getElementById("topp-val");
  const currentModelTag = document.getElementById("current-model-tag");

  const apiKeyPillBtn = document.getElementById("api-key-pill-btn");
  const apiStatusDot = document.getElementById("api-status-dot");
  const apiStatusText = document.getElementById("api-status-text");

  const openInfoBtn = document.getElementById("open-info-btn");
  const closeInfoBtn = document.getElementById("close-info-btn");
  const infoModal = document.getElementById("info-modal");

  // State in LocalStorage for client portal
  let sessions = JSON.parse(localStorage.getItem("nexus_sessions") || "[]");
  let currentSessionId = localStorage.getItem("nexus_current_session_id") || null;
  let userApiKey = (localStorage.getItem("nexus_user_api_key") || "").trim();
  let attachedBase64 = null;
  let attachedMime = null;
  let attachedFileName = null;
  let isGenerating = false;
  let currentModel = localStorage.getItem("nexus_model") || "gemini-3.5-flash";

  function updateApiKeyStatusUI() {
    if (userApiKey) {
      if (apiStatusDot) {
        apiStatusDot.style.background = "#10b981";
        apiStatusDot.style.boxShadow = "0 0 8px #10b981";
      }
      if (apiStatusText) {
        apiStatusText.textContent = "API Key Active";
        apiStatusText.style.color = "#a7f3d0";
      }
      if (apiKeyInput) {
        apiKeyInput.value = userApiKey;
      }
    } else {
      if (apiStatusDot) {
        apiStatusDot.style.background = "#eab308";
        apiStatusDot.style.boxShadow = "0 0 8px #eab308";
      }
      if (apiStatusText) {
        apiStatusText.textContent = "Click to Add API Key";
        apiStatusText.style.color = "#fef08a";
      }
    }
  }

  updateApiKeyStatusUI();

  if (apiKeyPillBtn) {
    apiKeyPillBtn.addEventListener("click", () => {
      settingsModal.style.display = "flex";
      if (apiKeyInput) apiKeyInput.focus();
    });
  }

  if (toggleKeyVisibilityBtn) {
    toggleKeyVisibilityBtn.addEventListener("click", () => {
      if (apiKeyInput.type === "password") {
        apiKeyInput.type = "text";
        toggleKeyVisibilityBtn.textContent = "Hide Key";
      } else {
        apiKeyInput.type = "password";
        toggleKeyVisibilityBtn.textContent = "Show Key";
      }
    });
  }

  // Configure marked.js
  marked.setOptions({
    highlight: function(code, lang) {
      const language = highlight.getLanguage(lang) ? lang : "plaintext";
      return highlight.highlight(code, { language }).value;
    },
    breaks: true
  });

  // Render KaTeX
  function renderMath(element) {
    if (window.renderMathInElement) {
      window.renderMathInElement(element, {
        delimiters: [
          { left: "$$", right: "$$", display: true },
          { left: "$", right: "$", display: false },
          { left: "\\(", right: "\\)", display: false },
          { left: "\\[", right: "\\]", display: true }
        ],
        throwOnError: false
      });
    }
  }

  // Sidebar toggle
  toggleSidebarBtn.addEventListener("click", () => {
    sidebar.classList.toggle("collapsed");
  });

  mobileToggleBtn.addEventListener("click", () => {
    sidebar.classList.toggle("mobile-open");
  });

  // Theme toggle
  themeToggleBtn.addEventListener("click", () => {
    document.body.classList.toggle("light-theme");
  });

  // Sliders
  tempSlider.addEventListener("input", (e) => {
    tempVal.textContent = e.target.value;
  });
  toppSlider.addEventListener("input", (e) => {
    toppVal.textContent = e.target.value;
  });

  // Modals
  openSettingsBtn.addEventListener("click", () => {
    settingsModal.style.display = "flex";
    if (apiKeyInput) apiKeyInput.focus();
  });
  closeSettingsBtn.addEventListener("click", () => {
    settingsModal.style.display = "none";
  });
  openInfoBtn.addEventListener("click", () => {
    infoModal.style.display = "flex";
  });
  closeInfoBtn.addEventListener("click", () => {
    infoModal.style.display = "none";
  });

  // Save Settings
  saveSettingsBtn.addEventListener("click", () => {
    currentModel = modelSelect.value;
    localStorage.setItem("nexus_model", currentModel);
    currentModelTag.textContent = currentModel === "gemini-3.8-flash" ? "Nexus Ultra 3.8" : "v3.5 Flash Engine";
    
    const inputKey = apiKeyInput.value.trim();
    if (inputKey) {
      userApiKey = inputKey;
      localStorage.setItem("nexus_user_api_key", userApiKey);
      updateApiKeyStatusUI();
    }
    settingsModal.style.display = "none";
  });

  // Starter Cards
  document.querySelectorAll(".starter-card").forEach(card => {
    card.addEventListener("click", () => {
      const prompt = card.getAttribute("data-prompt");
      chatTextarea.value = prompt;
      autoResizeTextarea();
      sendMessage();
    });
  });

  function autoResizeTextarea() {
    chatTextarea.style.height = "auto";
    chatTextarea.style.height = Math.min(chatTextarea.scrollHeight, 180) + "px";
    sendBtn.disabled = !chatTextarea.value.trim() && !attachedBase64;
  }

  chatTextarea.addEventListener("input", autoResizeTextarea);

  chatTextarea.addEventListener("keydown", (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      if (!sendBtn.disabled && !isGenerating) {
        sendMessage();
      }
    }
  });

  // File Attachment & Base64 Reader
  attachBtn.addEventListener("click", () => {
    fileInput.click();
  });

  fileInput.addEventListener("change", (e) => {
    const file = e.target.files[0];
    if (!file) return;

    attachedFileName = file.name;
    attachedMime = file.type || "text/plain";

    const reader = new FileReader();
    if (file.type.startsWith("image/")) {
      reader.onload = () => {
        const fullBase64 = reader.result;
        attachedBase64 = fullBase64.split(",")[1];
        previewImg.src = fullBase64;
        previewImg.style.display = "block";
        previewFileIcon.style.display = "none";
        previewFileName.textContent = file.name;
        attachmentPreview.style.display = "flex";
        sendBtn.disabled = false;
      };
      reader.readAsDataURL(file);
    } else {
      reader.onload = () => {
        const textContent = reader.result;
        chatTextarea.value += `\n\n--- Content from ${file.name} ---\n${textContent}\n--- End of File ---`;
        autoResizeTextarea();
      };
      reader.readAsText(file);
    }
  });

  removeAttachmentBtn.addEventListener("click", () => {
    attachedBase64 = null;
    attachedMime = null;
    attachedFileName = null;
    fileInput.value = "";
    attachmentPreview.style.display = "none";
    autoResizeTextarea();
  });

  // Session Management in LocalStorage
  function saveSessions() {
    localStorage.setItem("nexus_sessions", JSON.stringify(sessions));
    localStorage.setItem("nexus_current_session_id", currentSessionId);
    renderSessionsList();
  }

  function renderSessionsList() {
    sessionsList.innerHTML = "";
    sessions.forEach(sess => {
      const item = document.createElement("div");
      item.className = `session-item ${sess.id === currentSessionId ? "active" : ""}`;
      item.innerHTML = `
        <span class="session-title">${escapeHtml(sess.title)}</span>
        <button class="session-del-btn" title="Delete conversation">&times;</button>
      `;
      item.querySelector(".session-title").addEventListener("click", () => {
        selectSession(sess.id);
      });
      item.querySelector(".session-del-btn").addEventListener("click", (e) => {
        e.stopPropagation();
        deleteSession(sess.id);
      });
      sessionsList.appendChild(item);
    });
  }

  function createNewChat() {
    const newSess = {
      id: "sess_" + Date.now(),
      title: "New Conversation",
      messages: [],
      created_at: new Date().toISOString()
    };
    sessions.unshift(newSess);
    currentSessionId = newSess.id;
    messagesList.innerHTML = "";
    heroScreen.style.display = "flex";
    saveSessions();
  }

  newChatBtn.addEventListener("click", () => {
    createNewChat();
  });

  function selectSession(sessId) {
    currentSessionId = sessId;
    const sess = sessions.find(s => s.id === sessId);
    if (!sess) return;

    messagesList.innerHTML = "";
    if (sess.messages && sess.messages.length > 0) {
      heroScreen.style.display = "none";
      sess.messages.forEach(msg => {
        appendMessageUI(msg.role, msg.content, msg.image_src);
      });
    } else {
      heroScreen.style.display = "flex";
    }
    chatContainer.scrollTop = chatContainer.scrollHeight;
    saveSessions();
  }

  function deleteSession(sessId) {
    sessions = sessions.filter(s => s.id !== sessId);
    if (currentSessionId === sessId) {
      if (sessions.length > 0) {
        selectSession(sessions[0].id);
      } else {
        createNewChat();
      }
    } else {
      saveSessions();
    }
  }

  function appendMessageUI(role, content, imgSrc = "") {
    const item = document.createElement("div");
    item.className = `message-item ${role}`;

    const avatarHtml = role === "user" 
      ? `<div class="msg-avatar">AC</div>` 
      : `<div class="msg-avatar">
          <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2">
            <path stroke-linecap="round" stroke-linejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" />
          </svg>
        </div>`;

    let imageHtml = "";
    if (imgSrc) {
      imageHtml = `<img class="msg-attachment-img" src="${imgSrc}" alt="attachment" />`;
    }

    const bodyDiv = document.createElement("div");
    bodyDiv.className = "msg-body";

    if (role === "user") {
      bodyDiv.innerHTML = `${imageHtml}<div>${escapeHtml(content)}</div>`;
    } else {
      bodyDiv.innerHTML = marked.parse(content || "");
      addCopyButtons(bodyDiv);
      renderMath(bodyDiv);
    }

    item.innerHTML = avatarHtml;
    item.appendChild(bodyDiv);
    messagesList.appendChild(item);
    chatContainer.scrollTop = chatContainer.scrollHeight;

    return bodyDiv;
  }

  function addCopyButtons(container) {
    container.querySelectorAll("pre").forEach(pre => {
      if (!pre.querySelector(".code-copy-btn")) {
        const btn = document.createElement("button");
        btn.className = "code-copy-btn";
        btn.textContent = "Copy Code";
        btn.addEventListener("click", () => {
          const code = pre.querySelector("code") ? pre.querySelector("code").innerText : pre.innerText;
          navigator.clipboard.writeText(code);
          btn.textContent = "Copied!";
          setTimeout(() => btn.textContent = "Copy Code", 2000);
        });
        pre.appendChild(btn);
      }
    });
  }

  chatForm.addEventListener("submit", (e) => {
    e.preventDefault();
    if (!sendBtn.disabled && !isGenerating) {
      sendMessage();
    }
  });

  async function sendMessage() {
    const promptText = chatTextarea.value.trim();
    const curImgBase64 = attachedBase64;
    const curImgMime = attachedMime;
    const curImgSrc = previewImg.src;

    if (!promptText && !curImgBase64) return;

    // Check API Key
    if (!userApiKey) {
      settingsModal.style.display = "flex";
      if (apiKeyInput) apiKeyInput.focus();
      return;
    }

    let activeSess = sessions.find(s => s.id === currentSessionId);
    if (!activeSess) {
      createNewChat();
      activeSess = sessions.find(s => s.id === currentSessionId);
    }

    heroScreen.style.display = "none";
    chatTextarea.value = "";
    chatTextarea.style.height = "auto";
    sendBtn.disabled = true;

    // Clear attachment state
    attachedBase64 = null;
    attachedMime = null;
    attachedFileName = null;
    attachmentPreview.style.display = "none";
    fileInput.value = "";

    // Append user message
    appendMessageUI("user", promptText, curImgBase64 ? curImgSrc : "");

    // Add to session messages
    activeSess.messages.push({
      role: "user",
      content: promptText,
      image_src: curImgBase64 ? curImgSrc : ""
    });

    if (activeSess.messages.length === 1 && activeSess.title === "New Conversation") {
      activeSess.title = promptText.slice(0, 28) + (promptText.length > 28 ? "..." : "");
      renderSessionsList();
    }

    // Append empty placeholder for model reply
    const modelBody = appendMessageUI("model", "");
    modelBody.classList.add("streaming-cursor");
    isGenerating = true;

    let fullResponse = "";

    try {
      const formattedContents = [];
      activeSess.messages.forEach(m => {
        const parts = [];
        if (m.image_src && curImgBase64 && m === activeSess.messages[activeSess.messages.length - 1]) {
          parts.push({
            inlineData: {
              mimeType: curImgMime,
              data: curImgBase64
            }
          });
        }
        if (m.content) {
          parts.push({ text: m.content });
        }
        formattedContents.push({
          role: m.role === "user" ? "user" : "model",
          parts: parts
        });
      });

      const url = `https://generativelanguage.googleapis.com/v1beta/models/${currentModel}:streamGenerateContent?alt=sse&key=${userApiKey}`;
      const payload = {
        contents: formattedContents,
        generationConfig: {
          temperature: parseFloat(tempSlider.value),
          topP: parseFloat(toppSlider.value)
        }
      };

      if (systemPromptInput.value.trim()) {
        payload.systemInstruction = {
          parts: [{ text: systemPromptInput.value.trim() }]
        };
      }

      const response = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });

      if (!response.ok) {
        const errJson = await response.json().catch(() => ({}));
        const errMsg = (errJson.error && errJson.error.message) ? errJson.error.message : `HTTP ${response.status} Error`;
        throw new Error(errMsg);
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder("utf-8");
      let buffer = "";

      while (true) {
        const { value, done } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split("\n\n");
        buffer = lines.pop();

        for (const line of lines) {
          if (line.startsWith("data: ")) {
            try {
              const chunk = JSON.parse(line.slice(6));
              const candidates = chunk.candidates || [];
              if (candidates.length > 0 && candidates[0].content && candidates[0].content.parts) {
                for (const part of candidates[0].content.parts) {
                  if (part.text) {
                    fullResponse += part.text;
                  }
                }
                modelBody.innerHTML = marked.parse(fullResponse);
                addCopyButtons(modelBody);
                renderMath(modelBody);
                chatContainer.scrollTop = chatContainer.scrollHeight;
              }
            } catch (e) {
              console.error("Chunk parse error:", e);
            }
          }
        }
      }

      // Record in session
      activeSess.messages.push({
        role: "model",
        content: fullResponse
      });
      saveSessions();

    } catch (err) {
      fullResponse = `**Error communicating with inference engine:**\n\n> ${err.message}\n\nPlease click **"API Key & Parameters"** in the sidebar or top bar to ensure your Google Gemini API key is valid.`;
      modelBody.innerHTML = marked.parse(fullResponse);
    } finally {
      modelBody.classList.remove("streaming-cursor");
      isGenerating = false;
      autoResizeTextarea();
    }
  }

  function escapeHtml(text) {
    const div = document.createElement("div");
    div.textContent = text;
    return div.innerHTML;
  }

  // Initialize
  if (sessions.length === 0) {
    createNewChat();
  } else {
    renderSessionsList();
    if (currentSessionId) {
      selectSession(currentSessionId);
    } else {
      selectSession(sessions[0].id);
    }
  }
});
