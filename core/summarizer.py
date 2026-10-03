import os
import json

from dotenv import load_dotenv
from langchain_mistralai import ChatMistralAI
from langchain_core.prompts import ChatPromptTemplate
from langchain_core.output_parsers import StrOutputParser
from langchain_text_splitters import RecursiveCharacterTextSplitter

load_dotenv()


def get_llm():
    return ChatMistralAI(
        model="codestral-2508",
        mistral_api_key=os.getenv("MISTRAL_API_KEY"),
        temperature=0.2,
    )


def split_transcript(transcript: str) -> list:
    splitter = RecursiveCharacterTextSplitter(
        chunk_size=6000,
        chunk_overlap=300,
    )

    return splitter.split_text(transcript)


_analysis_cache = {}


def _to_text(value) -> str:
    """
    Convert LLM output into a SQLite-safe string.
    Handles strings, lists and dictionaries.
    """

    if value is None:
        return ""

    if isinstance(value, str):
        return value

    if isinstance(value, (list, dict)):
        return json.dumps(
            value,
            ensure_ascii=False
        )

    return str(value)



def analyze_transcript(transcript: str) -> dict:

    cache_key = hash(transcript)

    if cache_key in _analysis_cache:
        print("Using cached session analysis.")
        return _analysis_cache[cache_key]

    llm = get_llm()

    prompt = ChatPromptTemplate.from_messages(
        [
            (
                "system",
                """
You are an expert meeting and session intelligence analyst.

Analyze the provided session transcript and return ONLY valid JSON.

The JSON must contain exactly these five fields:

title
summary
action_items
decisions
open_questions

Requirements:

- title:
  Short professional session title.
  Maximum 8 words.

- summary:
  Concise professional summary.
  Use multiple bullet points if useful.

- action_items:
  Extract all action items.
  Include task, owner and deadline.
  If owner or deadline is not mentioned, write "Not specified".
  If none exist, write "No action items found."

- decisions:
  Extract important decisions.
  If none exist, write "No key decisions found."

- open_questions:
  Extract unresolved questions or follow-up topics.
  If none exist, write "No open questions found."

Important:

- Do not invent information.
- Only use information present in the transcript.
- Keep the output concise.
- Return JSON only.
- Do not use Markdown code fences.
""",
            ),
            (
                "human",
                "{transcript}",
            ),
        ]
    )

    chain = prompt | llm | StrOutputParser()

    chunks = split_transcript(transcript)

    if len(chunks) == 1:

        analysis_input = transcript

    else:

        chunk_prompt = ChatPromptTemplate.from_messages(
            [
                (
                    "system",
                    """
Create a concise factual summary of this transcript section.

Preserve:
- Names
- Tasks
- Owners
- Deadlines
- Decisions
- Questions
- Follow-up topics

Do not invent information.
Return only the factual summary.
""",
                ),
                (
                    "human",
                    "{text}",
                ),
            ]
        )

        chunk_chain = chunk_prompt | llm | StrOutputParser()

        summaries = []

        for i, chunk in enumerate(chunks):

            print(
                f"Analyzing transcript section "
                f"{i + 1}/{len(chunks)}..."
            )

            summaries.append(
                chunk_chain.invoke(
                    {"text": chunk}
                )
            )

        analysis_input = "\n\n".join(summaries)

    print("Running unified session analysis...")

    raw_result = chain.invoke(
        {
            "transcript": analysis_input
        }
    )

    raw_result = raw_result.strip()

    # Remove Markdown code fences if model adds them
    if raw_result.startswith("```json"):
        raw_result = raw_result[7:].strip()

    elif raw_result.startswith("```"):
        raw_result = raw_result[3:].strip()

    if raw_result.endswith("```"):
        raw_result = raw_result[:-3].strip()

    try:

        result = json.loads(raw_result)

    except json.JSONDecodeError:

        print("WARNING: Model did not return valid JSON.")
        print(raw_result)

        result = {
            "title": "Session Analysis",
            "summary": raw_result,
            "action_items": "No action items found.",
            "decisions": "No key decisions found.",
            "open_questions": "No open questions found.",
        }

    # Ensure every expected field exists
    result.setdefault(
        "title",
        "Session Analysis"
    )

    result.setdefault(
        "summary",
        "No summary available."
    )

    result.setdefault(
        "action_items",
        "No action items found."
    )

    result.setdefault(
        "decisions",
        "No key decisions found."
    )

    result.setdefault(
        "open_questions",
        "No open questions found."
    )

    # -----------------------------------------------------
    # IMPORTANT:
    # Convert every field into SQLite-safe text
    # -----------------------------------------------------

    result["title"] = _to_text(
        result["title"]
    )

    result["summary"] = _to_text(
        result["summary"]
    )

    result["action_items"] = _to_text(
        result["action_items"]
    )

    result["decisions"] = _to_text(
        result["decisions"]
    )

    result["open_questions"] = _to_text(
        result["open_questions"]
    )

    _analysis_cache[cache_key] = result

    return result


# ---------------------------------------------------------
# Compatibility functions
# ---------------------------------------------------------

def generate_title(transcript: str) -> str:

    return analyze_transcript(transcript).get(
        "title",
        "Session Analysis"
    )


def summarize(transcript: str) -> str:

    return analyze_transcript(transcript).get(
        "summary",
        "No summary available."
    )