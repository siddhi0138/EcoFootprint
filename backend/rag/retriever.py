from services.chroma import get_collection
from services.embeddings import embed_texts


def retrieve(query: str, top_k: int = 4, max_distance: float | None = None) -> list[dict]:
    query_embedding = embed_texts([query])[0]
    collection = get_collection()
    results = collection.query(query_embeddings=[query_embedding], n_results=top_k)

    chunks = []
    ids = results["ids"][0]
    documents = results["documents"][0]
    metadatas = results["metadatas"][0]
    distances = results["distances"][0]
    for i in range(len(ids)):
        if max_distance is not None and distances[i] > max_distance:
            continue
        chunks.append({
            "id": ids[i],
            "text": documents[i],
            "source": metadatas[i]["source"],
            "distance": distances[i],
        })
    return chunks
