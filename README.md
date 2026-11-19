# Calibur AI - Capstone Project

A small responsive chat app built with vanilla HTML, CSS, and JavaScript. It sends questions to an LLM through OpenRouter. No backend, account, or build step.

Live site: (paste your Netlify URL here)

## Setup
1. Clone the repo or download the files.
2. Open `index.html`, or deploy the folder to Netlify (no build command needed).
3. Paste your own OpenRouter API key, select Save, then ask a question.

## Model / router ID
`openrouter/free` (free router; availability and rate limits vary, and the app never switches to a paid model).

## localStorage usage
- `openrouter_api_key`: the visitor's key. Forget key removes it and clears the in-memory value.
- `calibur_history`: the saved conversation as JSON (messages only, never the API key or image data). It is restored on refresh and cleared by New Chat.

## Completed bonuses
- **New Chat (+2):** clears the display, saved history, and conversation context. The API key stays.
- **Chat history (+4):** saves and restores messages with JSON and localStorage. The last 10 messages are sent with each new question so the model can answer follow-ups.
- **File upload (+4):** one `.txt` file up to 30 KB, read with `File.text()` and included in the prompt. The filename is shown, the file can be removed before Send, and unsupported or oversized files are rejected.

## Extra touches
Suggestion chips, Enter to send (Shift+Enter for a new line), auto-growing textarea, animated "Thinking..." message, and a Copy button on answers.

## Known limitations
- Only the most recent 10 messages are sent as context.
- Free models can be slow, rate limited, or unavailable.
- Only plain `.txt` attachments are supported (no images or PDFs).
- The key is stored in localStorage, so any JavaScript running on the page can read it.

## Checks performed
(List only what you actually tested, for example:) real question and answer, blank question, missing key, invalid key, offline mode, repeated Send clicks, refresh persistence, Forget key, New Chat, history restore, file upload (valid, wrong type, too large), phone and desktop layouts.

## AI usage statement
I used Claude to help structure the layout and JavaScript. I read through the code, tested each feature in the browser, and changed parts myself to make sure I understand it. (Edit this to describe your own changes.)