# Solandra Voice

A voice assistant ("Aria") for business websites that answers visitors in Hindi, Hinglish, or English using **only** that business's published content, with cited sources and action buttons shown on screen. If an answer isn't in the business's content, Aria says so and never guesses.

Includes 3 fictional demo businesses (tabs appear for each configured widget key):
- **Real estate** — Kesar Developers (`SOLANDRA_WIDGET_KEY`)
- **Clinic** — Sunrise Care Clinic (`SOLANDRA_WIDGET_KEY_CLINIC`)
- **Coaching** — Pragati Academy (`SOLANDRA_WIDGET_KEY_COACHING`)

## Architecture

```
browser ──POST /api/token {demo}──▶ server ──ai.authTokens.create──▶ Gemini API
browser ══WebSocket, audio both ways══▶ Gemini Live      (the server never handles audio)
Gemini Live ──toolCall lookup_answer(query)──▶ browser ──POST /api/lookup {query, demo, callId}──▶ server ──▶ Solandra API
browser ◀── { forModel, forScreen } ── server
browser ──sendToolResponse(forModel)──▶ Gemini Live ──▶ spoken answer
browser shows forScreen (source cards + action buttons)
```

- The Gemini API key stays on the server. Each call receives a single-use ephemeral token with the model, system prompt, and tool declaration locked inside `liveConnectConstraints`.
- Audio streams directly between the browser (16 kHz PCM mic input, 24 kHz PCM playback with barge-in) and Gemini Live.

## Google AI & Cloud Used

- **Gemini Live API (native audio)** — bidirectional low-latency voice conversation in Hindi, Hinglish, and English
- **Function calling** — `lookup_answer` grounds every factual answer in Solandra
- **Ephemeral tokens (`authTokens.create`)** — keeps `GEMINI_API_KEY` off the client while locking session prompts and tools
- **Cloud Run** — stateless container hosting for the Express API and built React frontend
- **Secret Manager** — injects Gemini and Solandra widget keys at runtime

## Run Locally

1. Install dependencies:
   ```bash
   pnpm install
   ```
2. Create `apps/server/.env` from `apps/server/.env.example` and fill in `GEMINI_API_KEY`, `LIVE_MODEL`, `SOLANDRA_API_URL`, `PORT` (e.g. `8090`), and at least one `SOLANDRA_WIDGET_KEY*`.
3. Start both server and frontend:
   ```bash
   pnpm dev
   # or with process-compose:
   pnpm dev:compose
   ```
4. Open `http://localhost:5173`.

## Deploy to Cloud Run

```bash
gcloud run deploy solandra-voice --source . --region asia-south1 --allow-unauthenticated --min-instances 1 \
  --set-env-vars LIVE_MODEL=gemini-3.8-live,SOLANDRA_API_URL=https://api.solandra.io \
  --set-secrets GEMINI_API_KEY=gemini-key:latest,SOLANDRA_WIDGET_KEY=widget-realestate:latest,SOLANDRA_WIDGET_KEY_CLINIC=widget-clinic:latest,SOLANDRA_WIDGET_KEY_COACHING=widget-coaching:latest
```
