from fastapi import APIRouter, Depends, HTTPException, BackgroundTasks
from sqlalchemy.orm import Session
from typing import List

from backend.database.database import get_db
from backend.database.models import SessionModel
from backend.models.schemas import SessionCreateResponse, SessionStatusResponse, SessionResultResponse
import json

router = APIRouter()

@router.post("", response_model=SessionCreateResponse)
def create_session(db: Session = Depends(get_db)):
    # Default to local_file, can be updated later in the upload step
    new_session = SessionModel(status="queued", source_type="unknown")
    db.add(new_session)
    db.commit()
    db.refresh(new_session)
    return {"id": new_session.id, "status": new_session.status}

@router.get("", response_model=List[SessionResultResponse])
def list_sessions(db: Session = Depends(get_db)):
    sessions = db.query(SessionModel).order_by(SessionModel.created_at.desc()).all()
    results = []
    for s in sessions:
        try:
            ts = json.loads(s.transcript) if s.transcript else []
        except:
            ts = []
            
        results.append({
            "id": s.id,
            "title": s.title or "Untitled Session",
            "status": s.status,
            "summary": s.summary,
            "transcript": ts,
            "action_items": s.action_items,
            "decisions": s.decisions,
            "open_questions": s.open_questions,
        })
    return results

@router.get("/{id}/status", response_model=SessionStatusResponse)
def get_session_status(id: str, db: Session = Depends(get_db)):
    session = db.query(SessionModel).filter(SessionModel.id == id).first()
    if not session:
        raise HTTPException(status_code=404, detail="Session not found")
    
    return {
        "status": session.status,
        "progress": session.progress,
        "stage": session.stage
    }

@router.get("/{id}", response_model=SessionResultResponse)
def get_session(id: str, db: Session = Depends(get_db)):
    session = db.query(SessionModel).filter(SessionModel.id == id).first()
    if not session:
        raise HTTPException(status_code=404, detail="Session not found")
        
    try:
        ts = json.loads(session.transcript) if session.transcript else []
    except:
        ts = []
        
    return {
        "id": session.id,
        "title": session.title,
        "status": session.status,
        "summary": session.summary,
        "transcript": ts,
        "action_items": session.action_items,
        "decisions": session.decisions,
        "open_questions": session.open_questions,
    }
