from pathlib import Path

import chromadb

PERSIST_DIR = Path(__file__).parent.parent / "chroma_store"
COLLECTION_NAME = "sustainability_docs"

_client: chromadb.ClientAPI | None = None


def get_client() -> chromadb.ClientAPI:
    global _client
    if _client is None:
        _client = chromadb.PersistentClient(path=str(PERSIST_DIR))
    return _client


def get_collection():
    return get_client().get_or_create_collection(COLLECTION_NAME)
