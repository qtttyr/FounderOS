from pydantic import BaseModel
from fastapi import APIRouter
from dotenv import load_dotenv, set_key
import os
from pathlib import Path

router = APIRouter(prefix="/settings", tags=["settings"])

ENV_PATH = Path(__file__).parent.parent / ".env"


def ensure_env():
    if not ENV_PATH.exists():
        ENV_PATH.write_text("")
    load_dotenv(ENV_PATH, override=True)


class SettingsUpdate(BaseModel):
    openweather_key: str | None = None
    gemini_api_key: str | None = None
    glasses_ip: str | None = None
    weather_city: str | None = None


@router.get("/")
def get_settings():
    ensure_env()
    return {
        "openweather_key": os.getenv("OPENWEATHER_KEY", ""),
        "gemini_api_key": "***" if os.getenv("GEMINI_API_KEY") else "",
        "glasses_ip": os.getenv("GLASSES_IP", ""),
        "weather_city": os.getenv("WEATHER_CITY", "Astana"),
    }


@router.post("/")
def update_settings(update: SettingsUpdate):
    ensure_env()
    
    if update.openweather_key is not None:
        set_key(ENV_PATH, "OPENWEATHER_KEY", update.openweather_key)
    if update.gemini_api_key is not None:
        set_key(ENV_PATH, "GEMINI_API_KEY", update.gemini_api_key)
    if update.glasses_ip is not None:
        set_key(ENV_PATH, "GLASSES_IP", update.glasses_ip)
    if update.weather_city is not None:
        set_key(ENV_PATH, "WEATHER_CITY", update.weather_city)
    
    load_dotenv(ENV_PATH, override=True)
    return {"status": "ok"}