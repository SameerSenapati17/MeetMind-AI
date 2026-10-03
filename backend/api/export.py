from fastapi import APIRouter, Depends, HTTPException
from fastapi.responses import PlainTextResponse, Response
from sqlalchemy.orm import Session
import logging
import json

from backend.database.database import get_db
from backend.database.models import SessionModel

logger = logging.getLogger(__name__)
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
    try:
        from reportlab.lib.pagesizes import letter
        from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
        from reportlab.lib.units import inch
        from reportlab.lib import colors
        from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, HRFlowable, Table, TableStyle
        from reportlab.platypus import KeepTogether
        import io
        from datetime import datetime as dt
    except ImportError:
        raise HTTPException(status_code=500, detail="PDF generation library (reportlab) is not installed.")

    session = db.query(SessionModel).filter(SessionModel.id == session_id).first()
    if not session:
        raise HTTPException(status_code=404, detail="Session not found")
        
    if session.status != "completed":
        raise HTTPException(status_code=400, detail="Session not completed")

    buffer = io.BytesIO()
    doc = SimpleDocTemplate(
        buffer,
        pagesize=letter,
        rightMargin=0.75*inch,
        leftMargin=0.75*inch,
        topMargin=0.75*inch,
        bottomMargin=0.75*inch
    )

    styles = getSampleStyleSheet()
    
    # Custom styles
    title_style = ParagraphStyle(
        'MeetMindTitle',
        parent=styles['Title'],
        fontSize=22,
        textColor=colors.HexColor('#7C3AED'),
        spaceAfter=4,
    )
    brand_style = ParagraphStyle(
        'Brand',
        parent=styles['Normal'],
        fontSize=10,
        textColor=colors.HexColor('#9CA3AF'),
        spaceAfter=6,
    )
    heading_style = ParagraphStyle(
        'SectionHeading',
        parent=styles['Heading2'],
        fontSize=13,
        textColor=colors.HexColor('#7C3AED'),
        spaceBefore=14,
        spaceAfter=6,
        borderPad=4,
    )
    body_style = ParagraphStyle(
        'Body',
        parent=styles['Normal'],
        fontSize=10,
        leading=15,
        spaceAfter=4,
    )
    meta_style = ParagraphStyle(
        'Meta',
        parent=styles['Normal'],
        fontSize=9,
        textColor=colors.HexColor('#6B7280'),
        spaceAfter=2,
    )
    transcript_style = ParagraphStyle(
        'Transcript',
        parent=styles['Normal'],
        fontSize=9,
        leading=13,
        leftIndent=8,
        spaceAfter=3,
    )
    timestamp_style = ParagraphStyle(
        'Timestamp',
        parent=styles['Normal'],
        fontSize=8,
        textColor=colors.HexColor('#7C3AED'),
        leftIndent=0,
    )

    story = []

    # --- Header ---
    story.append(Paragraph("MeetMind AI", title_style))
    story.append(Paragraph("Turn every conversation into actionable intelligence.", brand_style))
    story.append(HRFlowable(width="100%", thickness=1, color=colors.HexColor('#7C3AED'), spaceAfter=10))
    
    story.append(Paragraph(f"<b>{session.title or 'Untitled Session'}</b>", styles['Heading1']))
    story.append(Paragraph(f"Session ID: {session.id}", meta_style))
    story.append(Paragraph(f"Generated: {dt.utcnow().strftime('%Y-%m-%d %H:%M UTC')}", meta_style))
    story.append(Spacer(1, 0.2*inch))

    # --- Summary ---
    story.append(Paragraph("Summary", heading_style))
    story.append(Paragraph(str(session.summary or "No summary available.").replace('\n', '<br/>'), body_style))
    story.append(Spacer(1, 0.1*inch))

    # --- Action Items ---
    story.append(Paragraph("Action Items", heading_style))
    raw_ai = session.action_items or "No action items found."
    try:
        ai_parsed = json.loads(raw_ai)
        if isinstance(ai_parsed, list):
            for item in ai_parsed:
                story.append(Paragraph(f"&bull; {str(item)}", body_style))
        else:
            story.append(Paragraph(str(ai_parsed).replace('\n', '<br/>'), body_style))
    except (json.JSONDecodeError, TypeError):
        story.append(Paragraph(str(raw_ai).replace('\n', '<br/>'), body_style))

    # --- Decisions ---
    story.append(Paragraph("Key Decisions", heading_style))
    raw_d = session.decisions or "No key decisions found."
    try:
        d_parsed = json.loads(raw_d)
        if isinstance(d_parsed, list):
            for item in d_parsed:
                story.append(Paragraph(f"&bull; {str(item)}", body_style))
        else:
            story.append(Paragraph(str(d_parsed).replace('\n', '<br/>'), body_style))
    except (json.JSONDecodeError, TypeError):
        story.append(Paragraph(str(raw_d).replace('\n', '<br/>'), body_style))

    # --- Open Questions ---
    story.append(Paragraph("Open Questions", heading_style))
    raw_q = session.open_questions or "No open questions found."
    try:
        q_parsed = json.loads(raw_q)
        if isinstance(q_parsed, list):
            for item in q_parsed:
                story.append(Paragraph(f"&bull; {str(item)}", body_style))
        else:
            story.append(Paragraph(str(q_parsed).replace('\n', '<br/>'), body_style))
    except (json.JSONDecodeError, TypeError):
        story.append(Paragraph(str(raw_q).replace('\n', '<br/>'), body_style))

    # --- Transcript ---
    story.append(Paragraph("Transcript", heading_style))
    raw_ts = session.transcript
    if raw_ts:
        try:
            segments = json.loads(raw_ts)
            if isinstance(segments, list) and segments:
                for seg in segments:
                    start = seg.get("start")
                    text = seg.get("text", "")
                    if start is not None:
                        # Format timestamp as HH:MM:SS
                        h = int(start // 3600)
                        m = int((start % 3600) // 60)
                        s = int(start % 60)
                        ts_str = f"[{h:02d}:{m:02d}:{s:02d}]"
                        story.append(Paragraph(f'<font color="#7C3AED"><b>{ts_str}</b></font> {text}', transcript_style))
                    else:
                        story.append(Paragraph(text, transcript_style))
            else:
                story.append(Paragraph("No transcript segments available.", body_style))
        except (json.JSONDecodeError, TypeError):
            story.append(Paragraph(str(raw_ts)[:2000], body_style))
    else:
        story.append(Paragraph("No transcript available.", body_style))

    story.append(Spacer(1, 0.3*inch))
    story.append(HRFlowable(width="100%", thickness=0.5, color=colors.HexColor('#374151')))
    story.append(Paragraph("Generated by MeetMind AI", meta_style))

    doc.build(story)
    pdf_bytes = buffer.getvalue()
    buffer.close()

    return Response(
        content=pdf_bytes,
        media_type="application/pdf",
        headers={"Content-Disposition": f"attachment; filename=meetmind-session-{session_id[:8]}.pdf"}
    )
