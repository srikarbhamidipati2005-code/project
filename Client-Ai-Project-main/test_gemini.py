import os
from dotenv import load_dotenv

load_dotenv(".env")
from app.services.knowledge_base import generate_embeddings, client

print("API KEY:", os.getenv("GEMINI_API_KEY"))
print("Client:", client)

try:
    res = generate_embeddings(["test chunk"])
    print("Success. Embedded.", len(res))
except Exception as e:
    import traceback
    traceback.print_exc()
