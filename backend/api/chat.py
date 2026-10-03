from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
import logging

from backend.database.database import get_db
from backend.database.models import SessionModel, ChatMessage
from backend.models.schemas import ChatRequest, ChatResponse, ChatMessageResponse

from core.rag_engine import (
    load_rag_chain,
    ask_question,
)

logger = logging.getLogger(__name__)
router = APIRouter()

@router.get("/{session_id}/chat", response_model=List[ChatMessageResponse])
def get_chat_history(session_id: str, db: Session = Depends(get_db)):
    session = db.query(SessionModel).filter(SessionModel.id == session_id).first()
    if not session:
        raise HTTPException(status_code=404, detail="Session not found")
        
    messages = db.query(ChatMessage).filter(ChatMessage.session_id == session_id).order_by(ChatMessage.created_at.asc()).all()
    return messages

@router.post("/{session_id}/chat", response_model=ChatResponse)
def chat_with_session(
    session_id: str,
    request: ChatRequest,
    db: Session = Depends(get_db)
):
    session = db.query(SessionModel).filter(SessionModel.id == session_id).first()
    if not session:
        raise HTTPException(status_code=404, detail="Session not found")

    if session.status != "completed":
        raise HTTPException(status_code=400, detail="Session analysis is not yet completed")

    # Save user message
    user_msg = ChatMessage(session_id=session_id, role="user", content=request.message)
    db.add(user_msg)
    db.commit()

    # Load existing Chroma vector store scoped to session
    try:
        rag_chain = load_rag_chain(session_id=session_id)
        result = ask_question(rag_chain, request.message)
        # Guard: if no sources were retrieved, the session may not have been indexed
        if not result.get("sources"):
            logger.warning(f"No vector sources found for session {session_id}. Knowledge base may be empty.")
    except Exception as e:
        logger.error(f"RAG chain error for session {session_id}: {e}", exc_info=True)
        # Save a failure message for history
        error_msg = ChatMessage(session_id=session_id, role="assistant", content="I encountered an error processing your question. Please try again.")
        db.add(error_msg)
        db.commit()
        raise HTTPException(status_code=500, detail="Failed to process question. Please try again.")

    # Save assistant message
    assistant_msg = ChatMessage(session_id=session_id, role="assistant", content=result["answer"])
    db.add(assistant_msg)
    db.commit()

    # Format sources with real retrieved chunks
    sources = []
    for doc in result.get("sources", []):
        sources.append({
            "text": doc.page_content,
            "timestamp": None  # Timestamps not stored in vector chunks yet; can extend in future
        })

    return {
        "answer": result["answer"],
        "sources": sources,
    }