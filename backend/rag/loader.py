from pathlib import Path

SOURCES_DIR = Path(__file__).parent / "sources"


def load_source_documents() -> list[dict]:
    documents = []
    for path in sorted(SOURCES_DIR.glob("*.md")):
        text = path.read_text(encoding="utf-8")
        documents.append({"filename": path.name, "text": text})
    return documents
