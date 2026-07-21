"""One-off script to (re)build the local Chroma vector store from backend/rag/sources/.

Run with: venv/Scripts/python.exe -m rag.ingest
"""

from rag.chunker import chunk_documents
from rag.loader import load_source_documents
from services.chroma import get_collection
from services.embeddings import embed_texts


def ingest():
    documents = load_source_documents()
    chunks = chunk_documents(documents)
    print(f"Loaded {len(documents)} documents -> {len(chunks)} chunks")

    embeddings = embed_texts([c["text"] for c in chunks])

    collection = get_collection()
    collection.upsert(
        ids=[c["id"] for c in chunks],
        embeddings=embeddings,
        documents=[c["text"] for c in chunks],
        metadatas=[{"source": c["source"]} for c in chunks],
    )
    print(f"Ingested {len(chunks)} chunks into Chroma collection '{collection.name}'")


if __name__ == "__main__":
    ingest()
