from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from backend.database.database import engine, Base
from backend.api import sessions, upload, chat, export
import os
import logging

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(name)s: %(message)s"
)

# Create database tables
Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="MeetMind AI API",
    description="Backend API for MeetMind AI processing and chat",
    version="1.0.0"
)

# Set up CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(sessions.router, prefix="/api/sessions", tags=["sessions"])
app.include_router(upload.router, prefix="/api/sessions", tags=["upload"])
app.include_router(chat.router, prefix="/api/sessions", tags=["chat"])
app.include_router(export.router, prefix="/api/sessions", tags=["export"])

@app.get("/api/health")
def health_check():
    return {
        "status": "ok",
        "service": "MeetMind AI"
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("backend.main:app", host="0.0.0.0", port=8000, reload=True)
