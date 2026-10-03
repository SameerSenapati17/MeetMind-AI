import os
import glob
import sqlite3
import shutil

def cleanup():
    # 1. Clean generated media directories
    dirs_to_clean = ["temp_uploads", "downloads", "uploads", "generated", "exports"]
    
    files_removed = []
    
    for d in dirs_to_clean:
        if os.path.exists(d):
            for root, dirs, files in os.walk(d):
                for f in files:
                    if f == ".gitkeep":
                        continue
                    path = os.path.join(root, f)
                    os.remove(path)
                    files_removed.append(path)
                    
    # Clean loose temporary files in root and core directories
    loose_patterns = ["*.wav", "*.mp3", "*.mp4", "*.mov", "*.mkv", "*.avi", "*.tmp", "*.part", "*.chunk", "*_sv_*.wav", "*_chunk_*.wav", "*_converted.wav"]
    for pattern in loose_patterns:
        for f in glob.glob(pattern):
            os.remove(f)
            files_removed.append(f)
            
    print(f"Removed {len(files_removed)} runtime artifacts.")
    
    # 2. Session Data Cleanup
    db_path = "backend/database/meetmind.db"
    sessions_removed = 0
    if not os.path.exists(db_path):
        db_path = "meetmind.db"
        
    if os.path.exists(db_path):
        try:
            conn = sqlite3.connect(db_path)
            c = conn.cursor()
            c.execute("SELECT COUNT(*) FROM sessions")
            sessions_removed = c.fetchone()[0]
            c.execute("DELETE FROM sessions")
            conn.commit()
            conn.close()
            print(f"Removed {sessions_removed} session records. Database schema preserved.")
        except Exception as e:
            print(f"Database cleanup error: {e}")
            
    with open("cleanup_report.txt", "w") as f:
        f.write(f"Removed {len(files_removed)} files.\n")
        f.write(f"Removed {sessions_removed} sessions.\n")
        
if __name__ == "__main__":
    cleanup()
