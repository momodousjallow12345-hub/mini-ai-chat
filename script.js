const MODEL = "openrouter/free";
const KEY_STORAGE = "openrouter_api_key";
const HISTORY_STORAGE = "calibur_history";
const MASK = "********";
const MAX_FILE_BYTES = 30 * 1024;
const MAX_CONTEXT_MESSAGES = 10;

const $ = (sel) => document.querySelector(sel);
const stage = $("#stage");
const keyForm = $("#key-form");
const apiKeyInput = $("#api-key");
const forgetKeyBtn = $("#forget-key");
const keyStatus = $("#key-status");
const settings = $("#settings");
const openSettingsBtn = $("#open-settings");
const closeSettingsBtn = $("#close-settings");
const chatForm = $("#chat-form");
const questionInput = $("#question");
const sendBtn = $("#send-btn");
const conversation = $("#conversation");
const statusEl = $("#status");
const errorEl = $("#error");
const newChatBtn = $("#new-chat");
const attachBtn = $("#attach-btn");
const fileInput = $("#file-input");
const fileChip = $("#file-chip");
const fileNameEl = $("#file-name");
const removeFileBtn = $("#remove-file");

let apiKey = localStorage.getItem(KEY_STORAGE) || "";
let history = loadHistory(); // [{ role, content, label, file }]
let attachment = null; // { name, text }

/* ---------- Setup ---------- */
if (apiKey) {
  apiKeyInput.value = MASK;
  keyStatus.textContent = "Key loaded from this browser. Messages are sent to OpenRouter.";
}
history.forEach(renderMessage);
updateEmpty();

/* ---------- Helpers ---------- */
function setStatus(text) { statusEl.textContent = `Status: ${text}`; }
function showError(text) { errorEl.textContent = text; }

function updateEmpty() {
  stage.classList.toggle("is-empty", conversation.querySelector(".message") === null);
}

function loadHistory() {
  try {
    const saved = JSON.parse(localStorage.getItem(HISTORY_STORAGE));
    return Array.isArray(saved) ? saved : [];
  } catch {
    return [];
  }
}

function saveHistory() {
  try {
    localStorage.setItem(HISTORY_STORAGE, JSON.stringify(history));
  } catch (err) {
    console.error("Could not save history", err);
  }
}

function renderMessage(msg) {
  const isUser = msg.role === "user";
  const div = document.createElement("div");
  div.className = `message ${isUser ? "user" : "assistant"}`;

  const role = document.createElement("div");
  role.className = "message-role";
  role.textContent = isUser ? "You" : "Calibur AI";

  const text = document.createElement("div");
  text.textContent = msg.label || msg.content; // textContent keeps model output safe
  div.append(role, text);

  if (msg.file) {
    const f = document.createElement("div");
    f.className = "message-file";
    f.textContent = `Attached: ${msg.file}`;
    div.append(f);
  }

  if (!isUser) {
    const copy = document.createElement("button");
    copy.type = "button";
    copy.className = "copy-btn";
    copy.textContent = "Copy";
    copy.addEventListener("click", async () => {
      try {
        await navigator.clipboard.writeText(msg.content);
        copy.textContent = "Copied";
      } catch {
        copy.textContent = "Copy failed";
      }
      setTimeout(() => (copy.textContent = "Copy"), 1500);
    });
    div.append(copy);
  }

  conversation.append(div);
  conversation.scrollTop = conversation.scrollHeight;
  updateEmpty();
  return div;
}

function renderPending() {
  const div = document.createElement("div");
  div.className = "message assistant pending";
  div.innerHTML = '<div class="message-role">Calibur AI</div><div>Thinking<span class="dots"></span></div>';
  conversation.append(div);
  conversation.scrollTop = conversation.scrollHeight;
  updateEmpty();
  return div;
}

function setAttachment(file) {
  attachment = file;
  fileChip.hidden = !file;
  fileNameEl.textContent = file ? file.name : "";
  if (!file) fileInput.value = "";
}

/* ---------- Settings dialog ---------- */
openSettingsBtn.addEventListener("click", () => settings.showModal());
closeSettingsBtn.addEventListener("click", () => settings.close());
settings.addEventListener("click", (e) => {
  if (e.target === settings) settings.close(); // click on the dark backdrop
});

/* ---------- API key ---------- */
keyForm.addEventListener("submit", (e) => {
  e.preventDefault();
  const entered = apiKeyInput.value.trim();
  if (!entered) {
    keyStatus.textContent = "Please enter a key before saving.";
    return;
  }
  if (entered === MASK) {
    keyStatus.textContent = "A key is already saved. Enter a new key to replace it.";
    return;
  }
  apiKey = entered;
  localStorage.setItem(KEY_STORAGE, apiKey);
  apiKeyInput.value = MASK;
  keyStatus.textContent = "Key saved in this browser. Messages are sent to OpenRouter.";
});

forgetKeyBtn.addEventListener("click", () => {
  apiKey = "";
  localStorage.removeItem(KEY_STORAGE);
  apiKeyInput.value = "";
  keyStatus.textContent = "Key removed from storage and memory.";
});

/* ---------- New Chat ---------- */
newChatBtn.addEventListener("click", () => {
  if (sendBtn.disabled) return;
  history = [];
  localStorage.removeItem(HISTORY_STORAGE);
  conversation.querySelectorAll(".message").forEach((m) => m.remove());
  setAttachment(null);
  showError("");
  setStatus("Ready");
  updateEmpty();
  questionInput.focus();
});

/* ---------- Suggestion chips ---------- */
document.querySelectorAll(".chip").forEach((chip) => {
  chip.addEventListener("click", () => {
    questionInput.value = chip.textContent;
    questionInput.focus();
  });
});

/* ---------- Textarea behavior ---------- */
questionInput.addEventListener("input", () => {
  questionInput.style.height = "auto";
  questionInput.style.height = `${Math.min(questionInput.scrollHeight, 200)}px`;
});

questionInput.addEventListener("keydown", (e) => {
  if (e.key === "Enter" && !e.shiftKey) {
    e.preventDefault();
    chatForm.requestSubmit();
  }
});

/* ---------- File attach (.txt only) ---------- */
attachBtn.addEventListener("click", () => fileInput.click());
removeFileBtn.addEventListener("click", () => setAttachment(null));

fileInput.addEventListener("change", async () => {
  const file = fileInput.files[0];
  if (!file) return;
  showError("");

  if (!file.name.toLowerCase().endsWith(".txt")) {
    showError("Unsupported file. Please attach a .txt file.");
    setAttachment(null);
    return;
  }
  if (file.size > MAX_FILE_BYTES) {
    showError("File is too large. The limit is 30 KB.");
    setAttachment(null);
    return;
  }
  try {
    setAttachment({ name: file.name, text: await file.text() });
  } catch {
    showError("Could not read that file. Try another one.");
    setAttachment(null);
  }
});

/* ---------- Send ---------- */
chatForm.addEventListener("submit", async (e) => {
  e.preventDefault();
  if (sendBtn.disabled) return; // blocks duplicate requests

  showError("");
  const question = questionInput.value.trim();

  if (!question) {
    showError("Please type a question before sending.");
    return;
  }
  if (!apiKey) {
    showError("Please save your OpenRouter API key first.");
    settings.showModal();
    return;
  }

  // The model sees the file text; the visitor sees just the question + filename.
  const content = attachment
    ? `${question}\n\n--- Attached file: ${attachment.name} ---\n${attachment.text}`
    : question;
  const userMsg = { role: "user", content, label: question, file: attachment?.name };

  const userEl = renderMessage(userMsg);
  const pendingEl = renderPending();
  const previous = history.slice(-MAX_CONTEXT_MESSAGES).map(({ role, content }) => ({ role, content }));

  questionInput.value = "";
  questionInput.style.height = "auto";
  setStatus("Thinking...");
  sendBtn.disabled = true;

  try {
    const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${apiKey}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        model: MODEL,
        messages: [...previous, { role: "user", content }],
        stream: false
      })
    });

    if (!response.ok) {
      if (response.status === 401) throw new Error("Invalid API key (401). Check your key and save it again.");
      if (response.status === 402) throw new Error("Insufficient credits (402). Check your OpenRouter account.");
      if (response.status === 429) throw new Error("Rate limit reached (429). Free models have limits, so wait a moment and try again.");
      if (response.status >= 500) throw new Error(`The service is unavailable right now (${response.status}). Please try again later.`);
      throw new Error(`Request failed with status ${response.status}.`);
    }

    const data = await response.json();
    const answer = data.choices?.[0]?.message?.content;
    if (!answer) throw new Error("The model returned an empty reply. Please try again.");

    pendingEl.remove();
    const assistantMsg = { role: "assistant", content: answer };
    renderMessage(assistantMsg);
    history.push(userMsg, assistantMsg);
    saveHistory();
    setAttachment(null);
    setStatus("Ready");
    keyStatus.textContent = "Last request succeeded. Messages are sent to OpenRouter.";
  } catch (error) {
    console.error(error);
    pendingEl.remove();
    userEl.remove(); // not in history, so remove it and let the visitor retry
    updateEmpty();
    questionInput.value = question;
    showError(error instanceof TypeError
      ? "Network error. Check your internet connection and try again."
      : error.message);
    setStatus("Ready");
  } finally {
    sendBtn.disabled = false;
  }
});