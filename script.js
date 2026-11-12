const keyForm = document.querySelector("#key-form");
const apiKeyInput = document.querySelector("#api-key");
const forgetKeyBtn = document.querySelector("#forget-key");
const keyStatus = document.querySelector("#key-status");

const chatForm = document.querySelector("#chat-form");
const questionInput = document.querySelector("#question");
const sendBtn = document.querySelector("#send-btn");
const conversation = document.querySelector("#conversation");
const statusEl = document.querySelector("#status");

let apiKey = localStorage.getItem("openrouter_api_key") || "";

if (apiKey) {
  apiKeyInput.value = "********"; // Don't show plain text key
  keyStatus.textContent = "Key loaded from browser storage.";
}

// Save Key Event
keyForm.addEventListener("submit", (e) => {
  e.preventDefault();
  const enteredKey = apiKeyInput.value.trim();
 
  if (enteredKey && enteredKey !== "********") {
    apiKey = enteredKey;
    localStorage.setItem("openrouter_api_key", apiKey);
    apiKeyInput.value = "********";
    keyStatus.textContent = "Key saved successfully.";
  }
});

// Forget Key Event
forgetKeyBtn.addEventListener("click", () => {
  apiKey = "";
  localStorage.removeItem("openrouter_api_key");
  apiKeyInput.value = "";
  keyStatus.textContent = "Key removed from storage and memory.";
});

// Send Question Event
chatForm.addEventListener("submit", async (e) => {
  e.preventDefault();
  const question = questionInput.value.trim();

  if (!question) {
    statusEl.textContent = "Error: Please enter a question.";
    return;
  }

  if (!apiKey) {
    statusEl.textContent = "Error: Please save a valid OpenRouter API key first.";
    return;
  }

  // Append user message
  appendMessage("You", question, "user");
  questionInput.value = "";
 
  // UI Loading State
  statusEl.textContent = "Thinking...";
  sendBtn.disabled = true;

  try {
    const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${apiKey}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        model: "openrouter/free",
        messages: [{ role: "user", content: question }],
        stream: false
      })
    });

    if (!response.ok) {
      if (response.status === 401) {
        throw new Error("Invalid API key (401 Unauthorized). Check your key.");
      } else if (response.status === 429) {
        throw new Error("Rate limit exceeded or free tier unavailable (429). Try again later.");
      } else {
        throw new Error(`Request failed with status ${response.status}`);
      }
    }

    const data = await response.json();
    const answer = data.choices?.[0]?.message?.content;

    if (!answer) {
      throw new Error("Received an empty reply from the model.");
    }

    appendMessage("Assistant", answer, "assistant");
    statusEl.textContent = "Ready";

  } catch (error) {
    console.error(error);
    statusEl.textContent = `Error: ${error.message}`;
  } finally {
    sendBtn.disabled = false;
  }
});

function appendMessage(role, text, className) {
  const msgDiv = document.createElement("div");
  msgDiv.className = `message ${className}`;
 
  const roleDiv = document.createElement("div");
  roleDiv.className = "message-role";
  roleDiv.textContent = role;
 
  const textDiv = document.createElement("div");
  textDiv.textContent = text;
 
  msgDiv.appendChild(roleDiv);
  msgDiv.appendChild(textDiv);
  conversation.appendChild(msgDiv);
  conversation.scrollTop = conversation.scrollHeight;
}