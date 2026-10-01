from dotenv import load_dotenv
load_dotenv()   # MUST be before any core/ imports

import os
import sys

from utils.audio_processor import process_input
from core.transcriber import transcribe_all
from core.summarizer import summarize, generate_title
from core.extractor import extract_action_items, extract_key_decisions, extract_questions

# Use an environment variable for the test source, or fallback to prompting the user
source = os.getenv("TEST_MEDIA_SOURCE")
if not source:
    print("TEST_MEDIA_SOURCE environment variable not set.")
    print("Please provide a valid YouTube URL or local file path to test.")
    source = input("Source URL or File Path: ").strip()
    
    if not source:
        print("No source provided. Exiting.")
        sys.exit(1)

language = os.getenv("TEST_LANGUAGE", "english")  # "english" → Whisper, "hinglish" → Sarvam

print(f"\n🚀 Running test pipeline for source: {source}")
print(f"Language: {language}\n")

chunks = process_input(source)

transcript = transcribe_all(chunks, language=language)
print("\n" + "=" * 60)
print("📝 TRANSCRIPT")
print("=" * 60)
print(transcript[:500] + "..." if len(transcript) > 500 else transcript)


title = generate_title(transcript)
summary = summarize(transcript)

print("\n" + "=" * 60)
print(f"📌 TITLE: {title}")
print("=" * 60)
print("\n📋 SUMMARY")
print("-" * 60)
print(summary)


action_items = extract_action_items(transcript)
decisions = extract_key_decisions(transcript)
questions = extract_questions(transcript)

print("\n" + "=" * 60)
print("✅ ACTION ITEMS")
print("=" * 60)
print(action_items)

print("\n" + "=" * 60)
print("🔑 KEY DECISIONS")
print("=" * 60)
print(decisions)

print("\n" + "=" * 60)
print("❓ OPEN QUESTIONS")
print("=" * 60)
print(questions)