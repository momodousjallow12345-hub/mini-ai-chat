# Mini AI Chat - Capstone Project

A responsive web application built with vanilla HTML, CSS, and JavaScript that connects to LLMs via OpenRouter.

## Setup & Deployment
1. Clone or download this repository.
2. Open `index.html` locally or deploy the folder directly to **Netlify** with no build command required.
3. Supply your personal OpenRouter API key in the settings panel to begin chatting.

## Model / Router ID
* **Model:** `openrouter/free`

## LocalStorage Usage
* The application saves the visitor's OpenRouter API key in `localStorage` so it persists across page refreshes.
* Clicking **Forget key** clears the key from both active memory and `localStorage`.

## Completed Core Features & Checks Performed
* [x] Labelled password input with Save and Forget key functionality.
* [x] Prevention of blank questions and unauthenticated requests.
* [x] Asynchronous `fetch` integration with OpenRouter (`stream: false`).
* [x] Robust error handling (invalid key, rate limits, network failures) with state reset in `finally`.
* [x] Responsive layout tested for mobile stacking and text wrapping.

## Known Limitations
* Each message request is treated independently (conversation memory history is not sent in the core version).

## AI Usage Statement
Assistance from AI tools was used to structure the initial layout and error-handling logic. All code was reviewed, verified, and tested against project requirements.