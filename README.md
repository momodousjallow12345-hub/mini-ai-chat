# Calibur AI - Capstone Project

A small responsive chat app built with vanilla HTML, CSS, and JavaScript. It sends questions to an LLM through OpenRouter. There is no backend, account, login, or build step. Each visitor supplies their own OpenRouter API key.

- **Live site:** https://calibur-ai.netlify.app
- **GitHub repo:** https://github.com/momodousjallow12345-hub/mini-ai-chat

## Setup
1. Clone the repo or download the files.
2. Open `index.html` in a browser (or use VS Code Live Server), or deploy the folder to Netlify. No build command is needed.
3. Select the settings icon (bottom left), paste your own OpenRouter API key, and select Save.
4. Type a question and press Enter or the Send button.

## Model / router ID
`openrouter/free` (OpenRouter's free router). Free models have usage limits and can be unavailable. The app never silently switches to a paid model.

## localStorage usage
- `openrouter_api_key`: the visitor's API key. It is shown masked in the input. Forget key removes it from localStorage and clears the value held in memory.
- `calibur_history`: the saved conversation as JSON (messages only, never the API key). It is restored on refresh and cleared by New Chat.

The key is not in the GitHub repo because the visitor types it in the browser. It is still readable by any JavaScript running on the page, since it lives in localStorage.

## Core features
- Labelled password input with Save and Forget key buttons
- Blank questions are rejected and a key is required before sending
- Request to OpenRouter with `fetch`, `async`/`await`, and `stream: false`
- "Thinking..." message while waiting, and Send is disabled to prevent duplicate requests
- Clear errors for an invalid key (401), no credits (402), rate limit (429), service unavailable (5xx), and network failure; controls are restored in `finally` so the visitor can try again
- User questions and assistant answers are styled differently
- Responsive layout for phone and desktop, visible labels, real buttons, and keyboard focus styles
- A notice before the first request says that questions and attached content are sent to OpenRouter and its model provider
- "Connected" is never shown just because a key was saved; the key status only says the last request succeeded after a real API response

## Completed bonuses
- **New Chat (+2):** clears the display, the saved history, and the conversation context. The API key is kept.
- **Chat history (+4):** messages are saved and restored with JSON and localStorage. The last 10 messages are sent with each new question so the model can answer follow-ups. New Chat clears the saved history.
- **File upload (+4):** one `.txt` file up to 30 KB, read with `File.text()` and included in the prompt. The filename is shown, the file can be removed before Send, and unsupported or oversized files are rejected.

## Extra touches
Custom sword logo and favicon (SVG), settings dialog for the API key, suggestion chips, Enter to send (Shift+Enter for a new line), auto-growing textarea, animated "Thinking..." message, and a Copy button on answers.

## Known limitations
- Only the most recent 10 messages are sent as context.
- Only one saved conversation is kept.
- Free models can be slow, rate limited, or unavailable.
- Only plain `.txt` attachments are supported (no images or PDFs).
- The key is stored in localStorage, so it is visible to any script running on the page.

## Checks performed
- Real question and answer
- Follow-up question (memory)
- Blank question
- Missing key
- Invalid key
- Offline mode
- Repeated Send clicks
- Key persistence after refresh
- Forget key
- New Chat
- History restore after refresh
- File upload: valid `.txt`, wrong file type, and oversized file
- Phone and desktop layouts
- Live Netlify site in a fresh incognito window

## AI usage statement
I used Claude (Anthropic) to help refine the HTML, CSS, and JavaScript, including the interface design and error handling. I reviewed the code, tested every feature in the browser and on the deployed site, and made changes myself so that I understand how it works.