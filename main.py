from dotenv import load_dotenv
from utils.audio_processor import process_input
from core.transcriber import transcribe_all
from core.summarizer import summarize, generate_title
from core.extractor import extract_action_items, extract_key_decisions, extract_questions
from core.rag_engine import build_rag_chain, ask_question


load_dotenv()

def run_pipeline(source :str, language :str = "english") -> dict:
    print("starting MeetMind AI")

    # To track temporary files for cleanup
    wav_path = None
    chunks = []
    
    try:
        from utils.audio_processor import download_youtube_audio, convert_to_wav, chunk_audio
        if source.startswith("http://") or source.startswith("https://"):
            print("Detected YouTube URL. Downloading audio...")
            wav_path = download_youtube_audio(source)
        else:
            print("Detected local file. Converting to WAV...")
            wav_path = convert_to_wav(source)

        print("Chunking audio...")
        chunks = chunk_audio(wav_path)
        print(f"Audio ready — {len(chunks)} chunk(s) created.")

        transcript = transcribe_all(chunks, language)
        print(f"raw transcript (first 300 characters ) {str(transcript)[:300]}")

        title = generate_title(transcript)
        summary = summarize(transcript)
        action_item = extract_action_items(transcript)
        decisions = extract_key_decisions(transcript)
        questions = extract_questions(transcript)
        rag_chain = build_rag_chain(transcript)

        return {
            "title": title,
            "transcript": transcript,
            "summary": summary,
            "action_items": action_item,
            "key_decisions": decisions,
            "open_questions": questions,
            "rag_chain": rag_chain,
        }
    finally:
        from utils.audio_processor import cleanup_audio_files
        files_to_clean = chunks.copy()
        if wav_path:
            files_to_clean.append(wav_path)
        # In a real app we might want to keep the original source if it was downloaded,
        # but here we clean up the converted wav_path and chunks.
        cleanup_audio_files(files_to_clean)

if __name__ == "__main__":
    # CLI entry point
    source = input("Enter YouTube URL or local file path: ").strip()
    language = input("Language (english/hinglish): ").strip() or "english"
    result = run_pipeline(source, language)

    print("\n" + "=" * 60)
    print(f"📌 Title: {result['title']}")
    print(f"\n📋 Summary:\n{result['summary']}")
    print(f"\n✅ Action Items:\n{result['action_items']}")
    print(f"\n🔑 Key Decisions:\n{result['key_decisions']}")
    print(f"\n❓ Open Questions:\n{result['open_questions']}")
    print("=" * 60)

    # Phase 2 — Chat with your session via RAG
    print("\n💬 Chat with your session (type 'exit' to quit)\n")
    rag_chain = result["rag_chain"]
    while True:
        question = input("You: ").strip()
        if question.lower() in ["exit", "quit", "q"]:
            print("👋 Goodbye!")
            break
        if not question:
            continue
        answer = ask_question(rag_chain, question)
        print(f"\n🤖 Assistant: {answer}\n")