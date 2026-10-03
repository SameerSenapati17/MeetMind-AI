import os
import time
import json
import logging
import traceback
from sqlalchemy.orm import Session
from backend.database.models import SessionModel

from utils.audio_processor import process_input
from core.transcriber import transcribe_all
from core.summarizer import summarize, generate_title
from core.extractor import extract_action_items, extract_key_decisions, extract_questions
from core.vector_store import build_vector_store

logger = logging.getLogger(__name__)

def update_status(db: Session, session_id: str, status: str, progress: int, stage: str):
    session = db.query(SessionModel).filter(SessionModel.id == session_id).first()
    if session:
        if status:
            session.status = status
        session.progress = progress
        session.stage = stage
        db.commit()

def process_session_background(session_id: str, source: str, source_type: str, language: str, db: Session):
    # Track files to clean up
    wav_path = None
    chunks = []
    
    try:
        # Stage: downloading or extracting_audio (matches frontend stage keys)
        init_stage = "downloading" if source_type == "youtube" else "extracting_audio"
        update_status(db, session_id, "processing", 10, init_stage)
        
        from utils.audio_processor import download_youtube_audio, convert_to_wav, chunk_audio
        
        # 1. Acquire media and convert
        if source_type == "youtube":
            wav_path = download_youtube_audio(source)
        else:
            wav_path = convert_to_wav(source)
            
        # 2. Chunk
        chunks = chunk_audio(wav_path)
        
        # Stage: transcribing
        update_status(db, session_id, None, 30, "transcribing")
        segments = transcribe_all(chunks, language)
        
        # Build transcript structures
        structured_transcript = segments
        transcript_raw = " ".join([s["text"] for s in segments])
        
        # Stage: generating_summary (matches frontend)
        update_status(db, session_id, None, 50, "generating_summary")
        title = generate_title(transcript_raw)
        summary = summarize(transcript_raw)
        
        # Stage: extracting_insights (matches frontend)
        update_status(db, session_id, None, 70, "extracting_insights")
        action_items = extract_action_items(transcript_raw)
        decisions = extract_key_decisions(transcript_raw)
        open_questions = extract_questions(transcript_raw)
        
        # Stage: building_knowledge_base (matches frontend)
        update_status(db, session_id, None, 85, "building_knowledge_base")
        build_vector_store(transcript_raw, session_id)
        
        # Save all results to DB
        session = db.query(SessionModel).filter(SessionModel.id == session_id).first()
        if session:
            session.title = title
            session.summary = summary
            session.transcript = json.dumps(structured_transcript)
            
            # Always serialize to JSON string for SQLite safety
            session.action_items = json.dumps(action_items) if not isinstance(action_items, str) else action_items
            session.decisions = json.dumps(decisions) if not isinstance(decisions, str) else decisions
            session.open_questions = json.dumps(open_questions) if not isinstance(open_questions, str) else open_questions
            
            session.status = "completed"
            session.progress = 100
            session.stage = "completed"
            db.commit()
            logger.info(f"Session {session_id} completed successfully.")
            
    except Exception as e:
        logger.error(f"Session {session_id} failed: {e}", exc_info=True)
        traceback.print_exc()

        # Reset SQLAlchemy transaction after a failed commit/flush
        db.rollback()

        # Re-query the session after the rollback
        session = db.query(SessionModel).filter(
            SessionModel.id == session_id
        ).first()

        if session:
            session.status = "failed"
            # Store a safe, concise error — not a raw traceback
            session.stage = str(e)[:200]
            db.commit()
    finally:
        from utils.audio_processor import cleanup_audio_files
        files_to_clean = chunks.copy()
        if wav_path:
            files_to_clean.append(wav_path)
        if source_type == "local_file" and source:
            files_to_clean.append(source)
            
        cleanup_audio_files(files_to_clean)