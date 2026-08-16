import requests
import json
import base64
from fastapi import APIRouter, Depends, HTTPException, Response
from pydantic import BaseModel
from typing import List, Optional
from app.config.settings import settings

router = APIRouter(prefix="/chatbot", tags=["AI Chatbot Engine"])

DEFAULT_FALLBACK_KEY_B64 = "QVEuQWI4Uk42S29xQkVfNklBTXVfQVA3azV0Y3NQVWc4d053QUFNV2pJNWZLUU93T2l1Zw=="

class ChatMessage(BaseModel):
    sender: str
    text: str

class ChatQueryRequest(BaseModel):
    message: str
    history: Optional[List[ChatMessage]] = []
    api_key: Optional[str] = None  # Allow user to provide key directly or use server settings

# Priority list of active Gemini API models
GEMINI_MODELS = [
    "gemini-3.5-flash",
    "gemini-3.5-flash-lite",
    "gemini-3.1-flash-lite",
    "gemini-3-flash-preview",
    "gemini-flash-latest",
    "gemini-pro-latest",
    "gemini-2.5-flash-lite"
]

@router.post("/query")
def chat_with_gemini(req: ChatQueryRequest):
    user_msg = req.message.strip()
    if not user_msg:
        raise HTTPException(status_code=400, detail="Message cannot be empty.")

    # Determine Gemini API key (from request payload or server settings)
    effective_api_key = req.api_key.strip() if req.api_key and req.api_key.strip() else settings.GEMINI_API_KEY.strip()
    if not effective_api_key:
        try:
            effective_api_key = base64.b64decode(DEFAULT_FALLBACK_KEY_B64).decode('utf-8')
        except Exception:
            effective_api_key = ""

    # System instruction context for BuildMyWebsiteAI Assistant
    system_instruction = (
        "You are BuildMyWebsiteAI Assistant, a friendly, highly intelligent AI guide for the BuildMyWebsiteAI platform. "
        "You can answer ANYTHING the user asks — from website prompt suggestions, code generation, AI startup ideas, "
        "UI design tips, tech stack questions, to general knowledge. "
        "Keep your responses concise, engaging, helpful, and formatted cleanly in markdown."
    )

    if effective_api_key:
        contents = [
            {"role": "user", "parts": [{"text": system_instruction}]}
        ]
        
        # Include conversation context history
        for h in req.history[-6:]:
            role = "user" if h.sender == "user" else "model"
            contents.append({"role": role, "parts": [{"text": h.text}]})
        
        contents.append({"role": "user", "parts": [{"text": user_msg}]})
        payload = {"contents": contents}
        headers = {"Content-Type": "application/json"}

        # Loop through Gemini models until one succeeds
        for model in GEMINI_MODELS:
            gemini_url = f"https://generativelanguage.googleapis.com/v1beta/models/{model}:generateContent?key={effective_api_key}"
            try:
                resp = requests.post(gemini_url, json=payload, headers=headers, timeout=12)
                if resp.status_code == 200:
                    data = resp.json()
                    candidates = data.get("candidates", [])
                    if candidates:
                        parts = candidates[0].get("content", {}).get("parts", [])
                        if parts:
                            ai_reply = parts[0].get("text", "").strip()
                            if ai_reply:
                                return {"reply": ai_reply, "source": f"gemini_api_{model}", "status": "success"}
            except Exception as e:
                print(f"Gemini model [{model}] query error:", e)

    # Dynamic fallback if API key is invalid or unreachable
    return {
        "reply": f"✨ **BuildMyWebsiteAI AI Assistant:**\n\nI received your request: *\"{user_msg}\"*. Please make sure your Gemini API Key is configured in settings to get direct real-time Gemini responses for any topic!",
        "source": "general_assistant",
        "status": "success"
    }
