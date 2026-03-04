import requests
import json
import time
import os
from dotenv import load_dotenv

load_dotenv()

BASE_URL = "http://localhost:8000"

def test_db_health():
    print("Testing DB Health Endpoint...")
    try:
        response = requests.get(f"{BASE_URL}/health/db")
        print(f"Status Code: {response.status_code}")
        print(f"Response: {json.dumps(response.json(), indent=2)}")
        print("-" * 30)
    except Exception as e:
        print(f"Failed to connect: {e}")

def test_chroma_health():
    print("Testing ChromaDB Health Endpoint...")
    try:
        response = requests.get(f"{BASE_URL}/health/chroma")
        print(f"Status Code: {response.status_code}")
        print(f"Response: {json.dumps(response.json(), indent=2)}")
        print("-" * 30)
    except Exception as e:
        print(f"Failed to connect: {e}")

def test_upload_endpoint(pdf_path):
    print(f"Testing Upload Endpoint with {pdf_path}...")
    if not os.path.exists(pdf_path):
        print(f"Error: {pdf_path} not found. Please create it first.")
        return
        
    try:
        with open(pdf_path, 'rb') as f:
            files = {'file': (os.path.basename(pdf_path), f, 'application/pdf')}
            response = requests.post(f"{BASE_URL}/api/upload", files=files)
            
        print(f"Status Code: {response.status_code}")
        if response.status_code != 200:
             print(f"Error Response: {response.text}")
        else:
             print(f"Response: {json.dumps(response.json(), indent=2)}")
        print("-" * 30)
    except Exception as e:
        import traceback
        print(f"Failed to connect or upload: {e}")
        traceback.print_exc()

if __name__ == "__main__":
    print("Beginning API tests. Make sure your server is running (uvicorn app.main:app --reload)")
    print("Waiting a second for server to be ready...\n")
    time.sleep(1)
    
    test_db_health()
    test_chroma_health()
    test_upload_endpoint("test.pdf")
