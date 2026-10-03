from pydantic import BaseModel
from typing import Optional, List, Dict, Any
from datetime import datetime

class SessionCreateResponse(BaseModel):
    id: str
    status: str

class YoutubeUploadRequest(BaseModel):
    url: str
    language: Optional[str] = "english"

class ProcessSessionResponse(BaseModel):
    session_id: str
    status: str

class SessionStatusResponse(BaseModel):
    status: str
    progress: int
    stage: str

class SessionResultResponse(BaseModel):
    id: str
    title: Optional[str] = None
    status: str
    summary: Optional[str] = None
    transcript: Optional[List[Dict[str, Any]]] = None
    action_items: Optional[str] = None
    decisions: Optional[str] = None
    open_questions: Optional[str] = None
    source_type: Optional[str] = None
    created_at: Optional[datetime] = None

class ChatRequest(BaseModel):
    message: str

class ChatSource(BaseModel):
    text: str
    timestamp: Optional[float] = None

class ChatResponse(BaseModel):
    answer: str
    sources: List[ChatSource]

class ChatMessageResponse(BaseModel):
    id: str
    role: str
    content: str
    created_at: datetime
