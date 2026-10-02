import os
import time
import json
import traceback
from sqlalchemy.orm import Session
from backend.database.models import SessionModel

from utils.audio_processor import process_input
from core.transcriber import transcribe_all
from core.summarizer import summarize, generate_title
from core.extractor import extract_action_items, extract_key_decisions, extract_questions
from core.vector_store import build_vector_store

def update_status(db: Session, session_id: str, status: str, progress: int, stage: str):
    session = db.query(SessionModel).filter(SessionModel.id == session_id).first()
    if session:
        if status:
            session.status = status
        session.progress = progress
        session.stage = stage
        db.commit()

def process_session_background(session_id: str, source: str, source_type: str, language: str, db: Session):
    try:
        update_status(db, session_id, "processing", 10, "downloading" if source_type == "youtube" else "extracting_audio")
        
        # 1-3. Acquire media, extract/convert, chunk
        chunks = process_input(source)
        
        # 4. Transcribe
        update_status(db, session_id, None, 30, "transcribing")
        transcript_raw = transcribe_all(chunks, language)
        
        # Structure transcript properly (Phase 2 requirement)
        structured_transcript = [{"start": 0.0, "end": 0.0, "text": transcript_raw, "speaker": None}]
        
        # 5. Generate Title
        update_status(db, session_id, None, 50, "generating_summary")
        title = generate_title(transcript_raw)
        
        # 6. Generate Summary
        summary = summarize(transcript_raw)
        
        # 7-9. Extract Insights
        update_status(db, session_id, None, 70, "extracting_insights")
        action_items = extract_action_items(transcript_raw)
        decisions = extract_key_decisions(transcript_raw)
        open_questions = extract_questions(transcript_raw)
        
        # 10. Build Vector Store
        update_status(db, session_id, None, 90, "building_knowledge_base")
        # Ensure we pass session_id to uniquely identify vectors if we had multi-tenant, 
        # but for now we'll just build it on the raw text. In a real system, Chroma collection 
        # should be segmented by session_id. 
        # We will slightly modify core to handle this in a real scenario, but for now we reuse.
        vector_store = build_vector_store(transcript_raw)
        
        # Save results
        session = db.query(SessionModel).filter(SessionModel.id == session_id).first()
        if session:
            session.title = title
            session.summary = summary
            session.transcript = json.dumps(structured_transcript)
            session.action_items = action_items
            session.decisions = decisions
            session.open_questions = open_questions
            session.status = "completed"
            session.progress = 100
            session.stage = "completed"
            db.commit()
            
    except Exception as e:
        traceback.print_exc()

        # Reset SQLAlchemy transaction after a failed commit/flush
        db.rollback()

        # Re-query the session after the rollback
        session = db.query(SessionModel).filter(
            SessionModel.id == session_id
        ).first()

        if session:
            session.status = "failed"
            session.stage = str(e)
            db.commit()