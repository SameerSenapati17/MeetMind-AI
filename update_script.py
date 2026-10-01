import os
import re

def update_file(path, replacements):
    with open(path, "r", encoding="utf-8") as f:
        content = f.read()
    for old, new in replacements:
        content = content.replace(old, new)
    with open(path, "w", encoding="utf-8") as f:
        f.write(content)

# main.py
main_replacements = [
    ("starting AI Video Assistant", "starting MeetMind AI"),
    ("raw transcription", "raw transcript"),
    ("💬 Chat with your meeting", "💬 Chat with your session"),
]
update_file(r"c:\Users\samee\AI-Video-Assistant-\main.py", main_replacements)

# app.py
# Using regex for complex replacements
with open(r"c:\Users\samee\AI-Video-Assistant-\app.py", "r", encoding="utf-8") as f:
    app_content = f.read()

app_content = app_content.replace('page_title="AI Video Assistant"', 'page_title="MeetMind AI"')
app_content = app_content.replace('page_icon="🎬"', 'page_icon="🧠"')
app_content = app_content.replace('🎬 AI<br>Video', '🧠 MeetMind<br>AI')
app_content = app_content.replace('Meeting Intelligence', 'VIDEO → KNOWLEDGE → ACTION')
app_content = app_content.replace('AI Video Assistant', 'MeetMind AI')
app_content = app_content.replace('Transcribe · Summarise · Chat with your meetings', 'Turn every conversation into actionable intelligence.')
app_content = app_content.replace('💬 Chat with your Meeting', '💬 Ask MeetMind')
app_content = app_content.replace('Ask anything about your meeting transcript', 'Ask anything about your session transcript')

# App.py labels replacements
app_content = app_content.replace('"Audio Processing"', '"Preparing Media"')
app_content = app_content.replace('"Transcription"', '"Generating Transcript"')
app_content = app_content.replace('"Title Generation"', '"Understanding Session"')
app_content = app_content.replace('"Summarisation"', '"Generating Summary"')
app_content = app_content.replace('"Extraction"', '"Finding Decisions & Actions"')
app_content = app_content.replace('"RAG Engine"', '"Building AI Knowledge Base"')
app_content = app_content.replace('📌 Session Title', '📌 Session Overview')

# App.py source logic replacement
source_old = """    source = st.text_input("YouTube URL or File Path", placeholder="https://youtube.com/watch?v=... or /path/to/file.mp4")

    language = st.selectbox("Language", ["english", "hinglish"], index=0)"""

source_new = """    source_type = st.radio("Source", ["YouTube", "Local File"], horizontal=True, label_visibility="collapsed")
    
    source = ""
    local_path = ""
    if source_type == "YouTube":
        source = st.text_input("YouTube URL", placeholder="https://youtube.com/watch?v=...")
    else:
        uploaded_file = st.file_uploader("Upload Media", type=["mp4", "mov", "mkv", "avi", "webm", "mp3", "wav", "m4a"])
        if uploaded_file is not None:
            import os
            os.makedirs("temp_uploads", exist_ok=True)
            safe_name = "".join([c for c in uploaded_file.name if c.isalpha() or c.isdigit() or c in (' ', '.', '_', '-')]).rstrip()
            local_path = os.path.join("temp_uploads", safe_name)
            with open(local_path, "wb") as f:
                f.write(uploaded_file.getbuffer())
            source = local_path

    language = st.selectbox("Language", ["english", "hinglish"], index=0)"""
app_content = app_content.replace(source_old, source_new)

# App.py validation logic
val_old = """    if not source.strip():
        st.error("Please enter a YouTube URL or file path.")"""

val_new = """    if source_type == "YouTube" and not source.strip():
        st.error("Please enter a valid YouTube URL.")
    elif source_type == "Local File" and not source.strip():
        st.error("Please upload a supported video or audio file.")"""
app_content = app_content.replace(val_old, val_new)

with open(r"c:\Users\samee\AI-Video-Assistant-\app.py", "w", encoding="utf-8") as f:
    f.write(app_content)

print("done")
