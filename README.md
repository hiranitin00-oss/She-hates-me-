# SHE HATES ME — interactive visual novel

A React + Vite front end with an Express AI proxy. The story keeps Hira player-controlled, gives Isha independent agency, tracks Love / Hate / Trust / Tension, and unlocks relationship moments as trust and affection develop. Original character artwork is kept in `public/images/`.

## Run locally

1. Install Node.js 20 or newer.
2. In this folder run `npm install`.
3. Copy `.env.example` to `.env`.
4. Add your provider key to `AI_API_KEY` in `.env`. The key stays on the server and must never be placed in `src/`.
5. Run `npm run dev` and open `http://localhost:5173`.

Without an API key the app still opens in offline fallback mode. Offline mode is a small scripted fallback, not a real AI model.

## AI configuration

The default endpoint is the OpenAI-compatible Chat Completions endpoint. Set these server environment variables:

- `AI_API_KEY` — your private provider key
- `AI_BASE_URL` — provider Chat Completions URL (default: `https://api.openai.com/v1/chat/completions`)
- `AI_MODEL` — model name (default: `gpt-4o-mini`)
- `PORT` — optional server port

The app calls `POST /api/roleplay`; `GET /api/health` reports whether a key is configured. The server enforces the character rules and returns structured JSON for the reply, stats, route and suggested choices. Do not expose the API key in frontend settings or commit `.env`.

## Build

`npm run build` creates the production site in `dist/`. The Express server serves `dist/` when `NODE_ENV=production`. Deploy the Node server and set the environment variables in your hosting provider. A static-only host is not enough for private AI keys; deploy the Express API as well.

## Mature content

All romantic leads are adults (20). Relationship moments are unlocked by earned trust and affection. Intimacy is consensual and non-graphic, with fade-to-black transitions; the app does not contain explicit sexual videos.
