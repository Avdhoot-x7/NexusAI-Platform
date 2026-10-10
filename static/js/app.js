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
  const modelSelect = document.getElementById("model-select");
  const systemPromptInput = document.getElementById("system-prompt-input");
  const tempSlider = document.getElementById("temperature-slider");
  const tempVal = document.getElementById("temp-val");
  const toppSlider = document.getElementById("topp-slider");
  const toppVal = document.getElementById("topp-val");
  const currentModelTag = document.getElementById("current-model-tag");

  const openInfoBtn = document.getElementById("open-info-btn");
  const closeInfoBtn = document.getElementById("close-info-btn");
  const infoModal = document.getElementById("info-modal");

  // State
  let currentSessionId = null;
  let attachedFileUrl = null;
  let attachedFileName = null;
  let isGenerating = false;
  let currentModel = "gemini-3.5-flash";

  // Configure marked.js
  marked.setOptions({
    highlight: function(code, lang) {
      const language = highlight.getLanguage(lang) ? lang : "plaintext";
      return highlight.highlight(code, { language }).value;
    },
    breaks: true
  });

  // Render KaTeX in an element
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

  // Slider controls
  tempSlider.addEventListener("input", (e) => {
    tempVal.textContent = e.target.value;
  });
  toppSlider.addEventListener("input", (e) => {
    toppVal.textContent = e.target.value;
  });

  // Modals open/close
  openSettingsBtn.addEventListener("click", () => {
    settingsModal.style.display = "flex";
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
  saveSettingsBtn.addEventListener("click", async () => {
    currentModel = modelSelect.value;
    currentModelTag.textContent = currentModel === "gemini-3.8-flash" ? "Nexus Ultra 3.8" : "v3.5 Flash Engine";
    if (currentSessionId) {
      await fetch(`/api/sessions/${currentSessionId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          system_instruction: systemPromptInput.value,
          temperature: parseFloat(tempSlider.value),
          top_p: parseFloat(toppSlider.value)
        })
      });
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

  // Auto-resize textarea & enable/disable submit
  function autoResizeTextarea() {
    chatTextarea.style.height = "auto";
    chatTextarea.style.height = Math.min(chatTextarea.scrollHeight, 180) + "px";
    sendBtn.disabled = !chatTextarea.value.trim() && !attachedFileUrl;
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

  // File Attachment
  attachBtn.addEventListener("click", () => {
    fileInput.click();
  });

  fileInput.addEventListener("change", async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const formData = new FormData();
    formData.append("file", file);

    try {
      const res = await fetch("/api/upload", {
        method: "POST",
        body: formData
      });
      const data = await res.json();
      if (res.ok) {
        attachedFileUrl = data.url;
        attachedFileName = data.filename;

        attachmentPreview.style.display = "flex";
        previewFileName.textContent = data.filename;

        if (file.type.startsWith("image/")) {
          previewImg.src = data.url;
          previewImg.style.display = "block";
          previewFileIcon.style.display = "none";
        } else {
          previewImg.style.display = "none";
          previewFileIcon.style.display = "block";
        }
        sendBtn.disabled = false;
      } else {
        alert("Upload failed: " + data.detail);
      }
    } catch (err) {
      alert("Error uploading file: " + err.message);
    }
  });

  removeAttachmentBtn.addEventListener("click", () => {
    attachedFileUrl = null;
    attachedFileName = null;
    fileInput.value = "";
    attachmentPreview.style.display = "none";
    autoResizeTextarea();
  });

  // Fetch Sessions
  async function loadSessions() {
    const res = await fetch("/api/sessions");
    const sessions = await res.json();
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
      item.querySelector(".session-del-btn").addEventListener("click", async (e) => {
        e.stopPropagation();
        await deleteSession(sess.id);
      });
      sessionsList.appendChild(item);
    });
  }

  // Create or switch Session
  async function createNewChat() {
    const res = await fetch("/api/sessions", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        title: "New Session",
        system_instruction: systemPromptInput.value,
        temperature: parseFloat(tempSlider.value),
        top_p: parseFloat(toppSlider.value)
      })
    });
    const session = await res.json();
    currentSessionId = session.id;
    messagesList.innerHTML = "";
    heroScreen.style.display = "flex";
    await loadSessions();
  }

  newChatBtn.addEventListener("click", () => {
    createNewChat();
  });

  async function selectSession(sessionId) {
    currentSessionId = sessionId;
    const res = await fetch(`/api/sessions/${sessionId}`);
    if (!res.ok) return;
    const data = await res.json();
    
    if (data.session) {
      systemPromptInput.value = data.session.system_instruction || "";
      tempSlider.value = data.session.temperature || 0.7;
      tempVal.textContent = tempSlider.value;
      toppSlider.value = data.session.top_p || 0.95;
      toppVal.textContent = toppSlider.value;
    }

    messagesList.innerHTML = "";
    if (data.messages && data.messages.length > 0) {
      heroScreen.style.display = "none";
      data.messages.forEach(msg => {
        appendMessageUI(msg.role, msg.content, msg.image_url);
      });
    } else {
      heroScreen.style.display = "flex";
    }
    chatContainer.scrollTop = chatContainer.scrollHeight;
    await loadSessions();
  }

  async function deleteSession(sessionId) {
    await fetch(`/api/sessions/${sessionId}`, { method: "DELETE" });
    if (currentSessionId === sessionId) {
      await createNewChat();
    } else {
      await loadSessions();
    }
  }

  // Append Message to UI
  function appendMessageUI(role, content, imageUrl = "") {
    const item = document.createElement("div");
    item.className = `message-item ${role}`;

    // Custom NexusAI Avatar Icons
    const avatarHtml = role === "user" 
      ? `<div class="msg-avatar">AC</div>` 
      : `<div class="msg-avatar">
          <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2">
            <path stroke-linecap="round" stroke-linejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" />
          </svg>
        </div>`;

    let imageHtml = "";
    if (imageUrl) {
      imageHtml = `<img class="msg-attachment-img" src="${imageUrl}" alt="attachment" />`;
    }

    const bodyDiv = document.createElement("div");
    bodyDiv.className = "msg-body";

    if (role === "user") {
      bodyDiv.innerHTML = `${imageHtml}<div>${escapeHtml(content)}</div>`;
    } else {
      bodyDiv.innerHTML = marked.parse(content);
      addCopyButtons(bodyDiv);
      renderMath(bodyDiv);
    }

    item.innerHTML = avatarHtml;
    item.appendChild(bodyDiv);
    messagesList.appendChild(item);
    chatContainer.scrollTop = chatContainer.scrollHeight;

    return bodyDiv;
  }

  // Copy Code Button Injector
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

  // Send Message
  chatForm.addEventListener("submit", (e) => {
    e.preventDefault();
    if (!sendBtn.disabled && !isGenerating) {
      sendMessage();
    }
  });

  async function sendMessage() {
    const promptText = chatTextarea.value.trim();
    const currentAttachment = attachedFileUrl;

    if (!promptText && !currentAttachment) return;
    if (!currentSessionId) {
      await createNewChat();
    }

    // Hide hero
    heroScreen.style.display = "none";

    // Clear input
    chatTextarea.value = "";
    chatTextarea.style.height = "auto";
    sendBtn.disabled = true;

    // Clear attachment state
    attachedFileUrl = null;
    attachedFileName = null;
    attachmentPreview.style.display = "none";
    fileInput.value = "";

    // Append User Message to UI
    appendMessageUI("user", promptText, currentAttachment);

    // Prepare Model message UI placeholder
    const modelBody = appendMessageUI("model", "");
    modelBody.classList.add("streaming-cursor");
    isGenerating = true;

    let fullResponse = "";

    try {
      const response = await fetch("/api/chat/stream", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          session_id: currentSessionId,
          prompt: promptText,
          image_url: currentAttachment || "",
          model: currentModel
        })
      });

      if (!response.ok) {
        throw new Error(`Server response error: ${response.status}`);
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
            const dataStr = line.slice(6);
            try {
              const data = JSON.parse(dataStr);
              if (data.error) {
                fullResponse += `\n\n**Error:** ${data.error}`;
              } else if (data.text) {
                fullResponse += data.text;
              }
              modelBody.innerHTML = marked.parse(fullResponse);
              addCopyButtons(modelBody);
              renderMath(modelBody);
              chatContainer.scrollTop = chatContainer.scrollHeight;
            } catch (err) {
              console.error("SSE parse error", err);
            }
          }
        }
      }
    } catch (err) {
      fullResponse += `\n\n*(Error generating response: ${err.message})*`;
      modelBody.innerHTML = marked.parse(fullResponse);
    } finally {
      modelBody.classList.remove("streaming-cursor");
      isGenerating = false;
      autoResizeTextarea();
      loadSessions();
    }
  }

  function escapeHtml(text) {
    const div = document.createElement("div");
    div.textContent = text;
    return div.innerHTML;
  }

  // Init
  createNewChat();
});
