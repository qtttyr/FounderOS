from pydantic import BaseModel
from fastapi import APIRouter, HTTPException
from fastapi.responses import StreamingResponse
import os
import json
import asyncio

router = APIRouter(prefix="/chat", tags=["chat"])

AVAILABLE_MODELS = [
    {"id": "gemini-2.5-flash", "name": "Gemini 2.5 Flash", "provider": "Google", "status": "active"},
]


class ChatRequest(BaseModel):
    message: str
    context: str | None = None
    model: str = "gemini-2.5-flash"


class ChatResponse(BaseModel):
    response: str
    model: str


@router.get("/models")
def get_models():
    return {"models": AVAILABLE_MODELS}


@router.post("", response_model=ChatResponse)
async def chat(req: ChatRequest):
    import google.generativeai as genai
    
    if not os.getenv("GEMINI_API_KEY"):
        raise HTTPException(status_code=500, detail="GEMINI_API_KEY not set")
    
    try:
        genai.configure(api_key=os.getenv("GEMINI_API_KEY"))
        
        system_prompt = f"""You are Mira, a personal AI assistant for a founder.
Keep responses concise and professional.
If something should go to the glasses, keep it under 15 words.
Context: {req.context or 'None'}"""

        model = genai.GenerativeModel("gemini-2.5-flash", system_instruction=system_prompt)
        response = model.generate_content([req.message])
        return ChatResponse(response=response.text, model="gemini-2.5-flash")
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/stream")
async def chat_stream(req: ChatRequest):
    async def event_generator():
        try:
            import google.generativeai as genai
            
            genai.configure(api_key=os.getenv("GEMINI_API_KEY"))
            
            system_prompt = f"""You are Mira, a personal AI assistant for a founder.
Keep responses concise and professional.
Context: {req.context or 'None'}"""

            model = genai.GenerativeModel("gemini-2.5-flash", system_instruction=system_prompt)
            response = model.generate_content([req.message])
            text = response.text
            
            for word in text.split():
                chunk = {"chunk": word + " "}
                yield f"data: {json.dumps(chunk)}\n\n"
                await asyncio.sleep(0.02)
            
            yield f"data: {{'done': true}}\n\n"
        except Exception as e:
            yield f"data: {json.dumps({'error': str(e)})}\n\n"

    return StreamingResponse(event_generator(), media_type="text/event-stream")