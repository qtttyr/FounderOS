from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from dotenv import load_dotenv

load_dotenv()

from app.routes import chat, models, history, capture, generate, settings

app = FastAPI(title="Mira AI Hub", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(chat.router, prefix="/api/v1")
app.include_router(models.router, prefix="/api/v1")
app.include_router(history.router, prefix="/api/v1")
app.include_router(capture.router, prefix="/api/v1")
app.include_router(generate.router, prefix="/api/v1")
app.include_router(settings.router, prefix="/api/v1")


@app.get("/health")
def health():
    return {"status": "ok", "service": "mira-ai-hub"}