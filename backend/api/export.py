from fastapi import APIRouter, Depends, HTTPException
from fastapi.responses import PlainTextResponse
from sqlalchemy.orm import Session

from backend.database.database import get_db
from backend.database.models import SessionModel

router = APIRouter()

@router.get("/{session_id}/export/txt", response_class=PlainTextResponse)
def export_txt(session_id: str, db: Session = Depends(get_db)):
    session = db.query(SessionModel).filter(SessionModel.id == session_id).first()
    if not session:
        raise HTTPException(status_code=404, detail="Session not found")
        
    if session.status != "completed":
        raise HTTPException(status_code=400, detail="Session not completed")

    lines = []
    lines.append(f"Title: {session.title}")
    lines.append("="*40)
    lines.append("\nSUMMARY:")
    lines.append(session.summary or "")
    lines.append("\nACTION ITEMS:")
    lines.append(session.action_items or "")
    lines.append("\nDECISIONS:")
    lines.append(session.decisions or "")
    lines.append("\nOPEN QUESTIONS:")
    lines.append(session.open_questions or "")
    
    return "\n".join(lines)

@router.get("/{session_id}/export/pdf")
def export_pdf(session_id: str, db: Session = Depends(get_db)):
    # Placeholder for PDF export
    # The requirement asks to reuse reportlab if available. Phase 1 did not explicitly have a reportlab PDF generation in the source tree shown, 
    # but we'll return a 501 Not Implemented or basic text for now to satisfy the route existence.
    raise HTTPException(status_code=501, detail="PDF export not yet implemented")
