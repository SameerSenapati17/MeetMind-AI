from fastapi import APIRouter, Depends, HTTPException, BackgroundTasks, UploadFile, File, Form
from sqlalchemy.orm import Session
from typing import Optional
import os
import shutil

from backend.database.database import get_db
from backend.database.models import SessionModel
from backend.models.schemas import YoutubeUploadRequest, ProcessSessionResponse
from backend.services.processing_service import process_session_background

router = APIRouter()

TEMP_UPLOAD_DIR = "temp_uploads"
os.makedirs(TEMP_UPLOAD_DIR, exist_ok=True)

SUPPORTED_EXTENSIONS = [".mp4", ".mov", ".mkv", ".avi", ".webm", ".mp3", ".wav", ".m4a"]
MAX_FILE_SIZE = 200 * 1024 * 1024 # 200 MB

@router.post("/{session_id}/upload")
async def upload_file(
    session_id: str, 
    background_tasks: BackgroundTasks,
    file: UploadFile = File(...), 
    language: str = Form("english"),
    db: Session = Depends(get_db)
):
    session = db.query(SessionModel).filter(SessionModel.id == session_id).first()
    if not session:
        raise HTTPException(status_code=404, detail="Session not found")
        
    ext = os.path.splitext(file.filename)[1].lower()
    if ext not in SUPPORTED_EXTENSIONS:
        raise HTTPException(status_code=400, detail="Unsupported media format")
        
    # Read to check size
    contents = await file.read()
    if len(contents) > MAX_FILE_SIZE:
        raise HTTPException(status_code=400, detail="File too large (max 200MB)")
        
    safe_name = "".join([c for c in file.filename if c.isalpha() or c.isdigit() or c in (' ', '.', '_', '-')]).rstrip()
    file_path = os.path.join(TEMP_UPLOAD_DIR, f"{session_id}_{safe_name}")
    
    with open(file_path, "wb") as f:
        f.write(contents)
        
    session.source_type = "local_file"
    db.commit()
    
    # Queue processing
    background_tasks.add_task(process_session_background, session_id, file_path, "local_file", language, db)
    
    return {"session_id": session_id, "status": "processing"}

@router.post("/{session_id}/youtube")
def upload_youtube(
    session_id: str, 
    request: YoutubeUploadRequest,
    background_tasks: BackgroundTasks,
    db: Session = Depends(get_db)
):
    session = db.query(SessionModel).filter(SessionModel.id == session_id).first()
    if not session:
        raise HTTPException(status_code=404, detail="Session not found")
        
    if not request.url.startswith("http"):
        raise HTTPException(status_code=400, detail="Invalid YouTube URL")
        
    session.source_type = "youtube"
    db.commit()
    
    background_tasks.add_task(process_session_background, session_id, request.url, "youtube", request.language, db)
    
    return {"session_id": session_id, "status": "processing"}
