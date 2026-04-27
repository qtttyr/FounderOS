from pydantic import BaseModel
from fastapi import APIRouter
from datetime import datetime

router = APIRouter(prefix="/history", tags=["history"])

chat_history: list[dict] = []


class Message(BaseModel):
    role: str
    text: str
    createdAt: str


class HistoryResponse(BaseModel):
    messages: list[dict]


@router.get("/")
def get_history():
    return {"messages": chat_history}


@router.post("/")
def add_message(msg: Message):
    chat_history.append({
        "role": msg.role,
        "text": msg.text,
        "createdAt": msg.createdAt or datetime.utcnow().isoformat()
    })
    return {"status": "ok"}


@router.delete("/")
def clear_history():
    global chat_history
    chat_history = []
    return {"status": "ok"}