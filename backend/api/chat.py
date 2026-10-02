from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from backend.database.database import get_db
from backend.database.models import SessionModel
from backend.models.schemas import ChatRequest, ChatResponse

from core.rag_engine import (
    load_rag_chain,
    ask_question,
)

router = APIRouter()


@router.post(
    "/{session_id}/chat",
    response_model=ChatResponse
)
def chat_with_session(
    session_id: str,
    request: ChatRequest,
    db: Session = Depends(get_db)
):

    # -----------------------------------------------------
    # Get session
    # -----------------------------------------------------

    session = (
        db.query(SessionModel)
        .filter(SessionModel.id == session_id)
        .first()
    )

    if not session:
        raise HTTPException(
            status_code=404,
            detail="Session not found"
        )

    # -----------------------------------------------------
    # Make sure processing is complete
    # -----------------------------------------------------

    if session.status != "completed":
        raise HTTPException(
            status_code=400,
            detail="Session analysis is not yet completed"
        )

    # -----------------------------------------------------
    # Load existing Chroma vector store
    # -----------------------------------------------------

    rag_chain = load_rag_chain()

    # -----------------------------------------------------
    # Ask question
    # -----------------------------------------------------

    answer = ask_question(
        rag_chain,
        request.message
    )

    # -----------------------------------------------------
    # Temporary source response
    # -----------------------------------------------------

    sources = [
        {
            "text": "Source context retrieval is simplified for Phase 2.",
            "timestamp": None,
        }
    ]

    return {
        "answer": answer,
        "sources": sources,
    }