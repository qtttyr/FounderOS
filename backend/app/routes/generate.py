from pydantic import BaseModel
from fastapi import APIRouter, HTTPException
import requests
import os

router = APIRouter(prefix="/generate", tags=["generate"])

IMAGE_PROVIDERS = [
    {"id": "zsky", "name": "ZSky AI", "type": "image", "free_credits": 25},
    {"id": "krea", "name": "Krea AI", "type": "image", "free_credits": "daily"},
]


class ImageRequest(BaseModel):
    prompt: str
    provider: str = "zsky"
    style: str | None = None
    size: str = "1024x1024"


class VideoRequest(BaseModel):
    prompt: str
    provider: str = "zsky"
    duration: int = 5


@router.get("/providers")
def list_providers():
    return {"providers": IMAGE_PROVIDERS}


@router.post("/image")
async def generate_image(req: ImageRequest):
    if req.provider == "zsky":
        try:
            response = requests.post(
                "https://api.zsky.ai/v1/image",
                json={"prompt": req.prompt, "style": req.style},
                timeout=60
            )
            if response.ok:
                data = response.json()
                return {"url": data.get("url"), "provider": "zsky"}
            return {"error": "Generation failed", "detail": response.text}
        except Exception as e:
            return {"error": str(e)}
    
    return {"error": "Provider not supported"}


@router.post("/video")
async def generate_video(req: VideoRequest):
    if req.provider == "zsky":
        try:
            response = requests.post(
                "https://api.zsky.ai/v1/video",
                json={"prompt": req.prompt, "duration": req.duration},
                timeout=120
            )
            if response.ok:
                data = response.json()
                return {"url": data.get("url"), "provider": "zsky", "duration": req.duration}
            return {"error": "Generation failed", "detail": response.text}
        except Exception as e:
            return {"error": str(e)}
    
    return {"error": "Provider not supported"}