import os
import chromadb

CHROMA_DATA_PATH = os.getenv("CHROMA_DATA_PATH", "./chroma_data")

# Initialize ChromaDB Persistent Client. Data is saved to local disk.
chroma_client = chromadb.PersistentClient(path=CHROMA_DATA_PATH)

def get_chroma_client():
    return chroma_client

def get_document_collection():
    """Returns the collection used for document embeddings."""
    return chroma_client.get_or_create_collection(name="documents_collection")
