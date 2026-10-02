from core.summarizer import analyze_transcript


def extract_action_items(transcript: str) -> str:
    return analyze_transcript(transcript).get(
        "action_items",
        "No action items found."
    )


def extract_key_decisions(transcript: str) -> str:
    return analyze_transcript(transcript).get(
        "decisions",
        "No key decisions found."
    )


def extract_questions(transcript: str) -> str:
    return analyze_transcript(transcript).get(
        "open_questions",
        "No open questions found."
    )