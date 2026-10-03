import os

from dotenv import load_dotenv
from langchain_mistralai import ChatMistralAI
from langchain_core.prompts import ChatPromptTemplate
from langchain_core.output_parsers import StrOutputParser

from core.vector_store import (
    build_vector_store,
    load_vector_store,
    get_retriever,
)

load_dotenv()


def get_llm():
    return ChatMistralAI(
        model="codestral-2508",
        mistral_api_key=os.getenv("MISTRAL_API_KEY"),
        temperature=0.3,
    )


def format_docs(docs):
    return "\n\n".join(
        doc.page_content
        for doc in docs
    )


def create_rag_chain(vector_store, session_id: str = None):

    # IMPORTANT:
    # get_retriever requires the vector_store.
    retriever = get_retriever(
        vector_store,
        session_id=session_id,
        k=4
    )

    llm = get_llm()

    prompt = ChatPromptTemplate.from_messages(
        [
            (
                "system",
                """
You are an expert session assistant.

Answer the user's question based ONLY on the
session transcript context provided below.

If the answer is not found in the context, say:

"I could not find this information in the session transcript."

Rules:
- Be concise and precise.
- Do not invent information.
- Use only the provided context.
- If quoting someone, mention it clearly.

Context from session transcript:
{context}
""",
            ),
            (
                "human",
                "{question}",
            ),
        ]
    )

    def invoke_rag(question: str):
        docs = retriever.invoke(question)
        context = format_docs(docs)
        answer = (prompt | llm | StrOutputParser()).invoke({
            "context": context,
            "question": question
        })
        return {"answer": answer, "sources": docs}

    return invoke_rag


def build_rag_chain(transcript: str, session_id: str):

    vector_store = build_vector_store(transcript, session_id)

    return create_rag_chain(vector_store, session_id)


def load_rag_chain(session_id: str = None):

    vector_store = load_vector_store()

    return create_rag_chain(vector_store, session_id)


def ask_question(rag_chain, question: str) -> dict:

    print(f"Question: {question}")

    result = rag_chain(question)

    print(f"Answer: {result['answer']}")

    return result