# FounderOS + Mira AI Hub

Personal operating system for a founder — smart glasses HUD + PWA control center with AI backend.

## Project Structure

```
FounderOS/
├── frontend/          # React PWA (main app)
│   ├── src/
│   │   ├── pages/   # Dashboard, Projects, AI, Capture, Settings
│   │   ├── services/  # glasses.ts, weather.ts, mira.ts (API calls to backend)
│   │   ├── store/   # founder-store.tsx (React context + localStorage)
│   │   └── types/   # app.ts (TypeScript types)
├── backend/          # FastAPI (Mira AI Hub)
│   ├── app/
│   │   ├── routes/  # chat.py, models.py, history.py, capture.py
│   │   └── main.py  # FastAPI app
│   └── .env         # GEMINI_API_KEY
└── AGENTS.md
```

## Running the App

```bash
# Terminal 1 - Backend (FastAPI)
cd backend
python -m uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload

# Terminal 2 - Frontend
cd frontend
npm run dev
```

## Architecture

- **Frontend** → **Backend API** (Vite proxy `/api` → `localhost:8000`)
- **Backend** → **Gemini API** (server-side)
- **Data**: localStorage key `founder-os-state-v1` (frontend)
- **Glasses**: HTTP REST API (ESP32 on local network)

## Pages & Routes

| Route | Page | Purpose |
|-------|------|--------|
| `/` | Dashboard | Time, weather, tasks, focus score |
| `/projects` | Projects | Projects + tasks management |
| `/ai` | AI Chat | Mira AI chat (backend API) |
| `/capture` | Voice | One-tap voice capture + auto-classify |
| `/settings` | Settings | API keys, glasses IP |

## Backend API Endpoints

| Endpoint | Method | Purpose |
|----------|--------|---------|
| `/api/v1/chat` | POST | Chat with Mira AI |
| `/api/v1/models/list` | GET | Available AI models |
| `/api/v1/history` | GET/POST/DELETE | Chat history |
| `/api/v1/capture` | POST | Auto-classify voice capture |
| `/api/v1/generate/image` | POST | Generate AI images (ZSky) |
| `/api/v1/generate/video` | POST | Generate AI videos (ZSky) |
| `/health` | GET | Backend health check |

## Key Services (Frontend)

```typescript
// mira.ts (backend API via proxy)
askMira(message, context, model) → {response, model}
getModels() → {models: [...]}
capture(text, context) → {kind, classification, suggestedProject}

// glasses.ts
pingGlasses() → boolean
sendCmd({cmd, ...}) → boolean
updateHUD({time, date, temp, city, projects, tasks})

// weather.ts
fetchWeather() → {temp, city} | null
```

## localStorage Keys

| Key | Used By |
|-----|--------|
| `glasses_ip` | glasses.ts |
| `weather_city` | weather.ts |
| `openweather_key` | weather.ts |
| `gemini_key` | (legacy, now in backend .env) |
| `notion_token` | future |
| `notion_db_id` | future |
| `vip_contacts` | Settings UI |

## Non-Obvious Details

- **Glasses HUD limit**: 15-20 chars/line, 128x64 display
- **AI responses**: Keep under 15 words for HUD display
- **Backend API key**: Set in `backend/.env` as `GEMINI_API_KEY`
- **Vite proxy**: `/api` → `http://localhost:8000`

## External APIs

- OpenWeatherMap (free tier) — weather
- Google Gemini API — AI chat (via backend)

No direct frontend → Gemini calls — all go through FastAPI backend.