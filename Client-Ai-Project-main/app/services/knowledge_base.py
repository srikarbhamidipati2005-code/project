import fitz  # PyMuPDF
from google import genai
import os
from typing import List

# Configure Gemini API
# Expected to be set in environment variables
GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")
client = None
if GEMINI_API_KEY:
    client = genai.Client(api_key=GEMINI_API_KEY)

def extract_text_from_pdf(file_bytes: bytes) -> str:
    """Extracts text from a given PDF file in bytes."""
    doc = fitz.open(stream=file_bytes, filetype="pdf")
    text = ""
    for page in doc:
        text += page.get_text()
    return text

def chunk_text(text: str, chunk_size: int = 1000, chunk_overlap: int = 100) -> List[str]:
    """Splits a large text into manageable chunks with overlap."""
    if not text:
        return []
    
    chunks = []
    start = 0
    text_length = len(text)
    
    while start < text_length:
        end = start + chunk_size
        chunk = text[start:end]
        chunks.append(chunk)
        start += (chunk_size - chunk_overlap)
        
    return chunks

def generate_embeddings(chunks: List[str]) -> List[List[float]]:
    """Generates embeddings for a list of text chunks using Gemini."""
    if not chunks:
        return []
        
    if not client:
        raise ValueError("GEMINI_API_KEY environment variable is not set.")
    
    embeddings = []
    # Gemini's text embedding model that this key currently has access to
    model = "gemini-embedding-001"
    
    # Process in batches of 100 to avoid Gemini API limits
    batch_size = 100
    for i in range(0, len(chunks), batch_size):
        batch = chunks[i:i + batch_size]
        result = client.models.embed_content(
            model=model,
            contents=batch,
        )
        
        for embedding in result.embeddings:
            embeddings.append(embedding.values)
        
    return embeddings

def store_in_chroma(filename: str, chunks: List[str], embeddings: List[List[float]]) -> str:
    """Stores chunks and embeddings into ChromaDB."""
    from app.chroma_db import get_document_collection
    import uuid
    
    collection = get_document_collection()
    
    ids = [str(uuid.uuid4()) for _ in range(len(chunks))]
    metadatas = [{"filename": filename, "chunk_index": i} for i in range(len(chunks))]
    
    collection.add(
        documents=chunks,
        embeddings=embeddings,
        metadatas=metadatas,
        ids=ids
    )
    
    return ids[0] # Return the first chunk ID or some identifier, or handle returning a Document ID from caller instead

def query_chroma(query: str, n_results: int = 3, filename: str = None) -> List[str]:
    """Queries ChromaDB for chunks similar to the query."""
    from app.chroma_db import get_document_collection
    collection = get_document_collection()
    
    # Generate embedding for the query
    query_embedding = generate_embeddings([query])
    if not query_embedding:
        return []
        
    query_kwargs = {
        "query_embeddings": query_embedding,
        "n_results": n_results
    }
    
    if filename:
        query_kwargs["where"] = {"filename": filename}
        
    results = collection.query(**query_kwargs)
    
    if results and results.get("documents") and len(results["documents"]) > 0:
        return results["documents"][0]
    return []
