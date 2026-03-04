import requests
import json
import time
import subprocess

# Start the server locally in a background process
print("Starting FastAPI server...")
server_process = subprocess.Popen(["uvicorn", "app.main:app", "--host", "127.0.0.1", "--port", "8000"])

# Wait for server to start
time.sleep(3)

url = "http://127.0.0.1:8000/api/execute"

payload = {
    "query": "What is the capital of France?",
    "nodes": [
        {
            "id": "node-1",
            "type": "input",
            "data": {"label": "User Query"}
        },
        {
            "id": "node-2",
            "type": "default",
            "data": {"label": "Knowledge Base"}
        },
        {
            "id": "node-3",
            "type": "output",
            "data": {"label": "LLM Engine"}
        }
    ],
    "edges": [
        {
            "id": "edge-1",
            "source": "node-1",
            "target": "node-2"
        },
        {
            "id": "edge-2",
            "source": "node-2",
            "target": "node-3"
        }
    ]
}

headers = {
    "Content-Type": "application/json"
}

print(f"Sending POST request to {url}...")
try:
    response = requests.post(url, json=payload, headers=headers)
    
    print(f"Status Code: {response.status_code}")
    print("Response JSON:")
    print(json.dumps(response.json(), indent=2))
except Exception as e:
    print(f"Error during request: {e}")
finally:
    print("Shutting down server...")
    server_process.terminate()
    server_process.wait()
    print("Done.")
