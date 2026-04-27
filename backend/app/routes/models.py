from fastapi import APIRouter

router = APIRouter(prefix="/models", tags=["models"])

AVAILABLE_MODELS = [
    {"id": "gemini-2.5-flash", "name": "Gemini 2.5 Flash", "provider": "Google", "status": "active"},
]


@router.get("/list")
def list_models():
    return {"models": AVAILABLE_MODELS}