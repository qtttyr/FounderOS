from pydantic import BaseModel
from fastapi import APIRouter, HTTPException
import google.generativeai as genai
import os

router = APIRouter(prefix="/capture", tags=["capture"])

CAPTURE_KINDS = ["task", "idea", "note", "contact"]


class CaptureRequest(BaseModel):
    text: str
    context: str | None = None


class CaptureResponse(BaseModel):
    kind: str
    classification: str
    suggestedProject: str | None


@router.post("/", response_model=CaptureResponse)
async def capture(req: CaptureRequest):
    if not os.getenv("GEMINI_API_KEY"):
        raise HTTPException(status_code=500, detail="GEMINI_API_KEY not set")

    try:
        genai.configure(api_key=os.getenv("GEMINI_API_KEY"))
        
        prompt = f"""Analyze this voice capture and classify it.
Available kinds: {', '.join(CAPTURE_KINDS)}
Respond with JSON: {{"kind": "one of {CAPTURE_KINDS}", "reason": "short explanation", "project": "project name if related to existing project, else null"}}

Capture: {req.text}
Context: {req.context or 'none'}"""
        
        model = genai.GenerativeModel("gemini-2.0-flash")
        response = model.generate_content([prompt])
        
        text = response.text.strip()
        if text.startswith("```json"):
            text = text[7:]
        if text.endswith("```"):
            text = text[:-3]
        
        import json
        data = json.loads(text)
        
        return CaptureResponse(
            kind=data.get("kind", "note"),
            classification=data.get("reason", ""),
            suggestedProject=data.get("project")
        )
    except Exception as e:
        return CaptureResponse(kind="note", classification="", suggestedProject=None)