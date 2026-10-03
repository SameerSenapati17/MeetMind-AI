from sqlalchemy import Column, String, Float, Integer, DateTime
from backend.database.database import Base
from datetime import datetime
import uuid

def generate_uuid():
    return str(uuid.uuid4())

class SessionModel(Base):
    __tablename__ = "sessions"

    id = Column(String, primary_key=True, index=True, default=generate_uuid)
    title = Column(String, nullable=True)
    source_type = Column(String, nullable=False) # 'youtube' or 'local_file'
    status = Column(String, default="queued") # queued, processing, completed, failed
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    # We will store the results as JSON strings or paths to files
    summary = Column(String, nullable=True)
    transcript = Column(String, nullable=True)
    action_items = Column(String, nullable=True)
    decisions = Column(String, nullable=True)
    open_questions = Column(String, nullable=True)
    
    # Track background processing progress (0-100) and stage
    progress = Column(Integer, default=0)
    stage = Column(String, default="queued")

class ChatMessage(Base):
    __tablename__ = "chat_messages"

    id = Column(String, primary_key=True, index=True, default=generate_uuid)
    session_id = Column(String, index=True)
    role = Column(String, nullable=False) # 'user' or 'assistant'
    content = Column(String, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)
