def chunk_text(text: str, chunk_size: int = 800, overlap: int = 100) -> list[str]:
    paragraphs = [p.strip() for p in text.split("\n\n") if p.strip()]

    chunks = []
    current = ""
    for para in paragraphs:
        if current and len(current) + len(para) + 2 > chunk_size:
            chunks.append(current)
            # carry the tail of the previous chunk forward for overlap context
            current = current[-overlap:] + "\n\n" + para
        else:
            current = f"{current}\n\n{para}" if current else para
    if current:
        chunks.append(current)
    return chunks


def chunk_documents(documents: list[dict]) -> list[dict]:
    chunks = []
    for doc in documents:
        for i, chunk in enumerate(chunk_text(doc["text"])):
            chunks.append({
                "id": f"{doc['filename']}::{i}",
                "text": chunk,
                "source": doc["filename"],
            })
    return chunks
