from fastapi import FastAPI, Depends
from sqlalchemy.orm import Session
from dotenv import load_dotenv

load_dotenv() # Load environment variables from .env file

from .database import engine, Base, get_db
from . import models, chroma_db

# Auto-create database tables (For production, use Alembic migrations instead)
Base.metadata.create_all(bind=engine)

from fastapi.middleware.cors import CORSMiddleware

app = FastAPI(title="No-Code LLM Workflow Builder API")

# Configure CORS
origins = [
    "http://localhost:5173", # Vite default port
    "http://localhost:3000",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
def read_root():
    return {"message": "Welcome to the No-Code LLM Workflow Builder API!"}

@app.get("/health/db")
def db_health(db: Session = Depends(get_db)):
    # Test DB connection
    return {"status": "ok", "db_connected": True}

@app.get("/health/chroma")
def chroma_health():
    # Test ChromaDB heartbeat
    client = chroma_db.get_chroma_client()
    return {"status": "ok", "chroma_heartbeat": client.heartbeat()}

from fastapi import File, UploadFile, HTTPException
from app.services import knowledge_base

@app.post("/api/upload")
async def upload_document(
    file: UploadFile = File(...),
    db: Session = Depends(get_db)
):
    if not file.filename.lower().endswith(".pdf"):
        raise HTTPException(status_code=400, detail="Only PDF files are supported.")
        
    try:
        # 1. Read file bytes
        user_file_bytes = await file.read()
        
        # 2. Extract text
        text = knowledge_base.extract_text_from_pdf(user_file_bytes)
        
        # 3. Chunk text
        chunks = knowledge_base.chunk_text(text)
        
        # 4. Generate embeddings
        embeddings = knowledge_base.generate_embeddings(chunks)
        
        # 5. Store in ChromaDB
        knowledge_base.store_in_chroma(file.filename, chunks, embeddings)
        
        # 6. Save metadata to SQL DB
        new_doc = models.DocumentMetadata(filename=file.filename)
        db.add(new_doc)
        db.commit()
        db.refresh(new_doc)
        
        return {
            "message": "File processed successfully",
            "document_id": new_doc.id,
            "filename": file.filename,
            "chunks_processed": len(chunks)
        }
        
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=str(e))

from app.models import ExecuteWorkflowRequest
from app.services import workflow_engine
from fastapi.responses import StreamingResponse

@app.post("/api/execute")
async def execute_workflow_endpoint(
    request: ExecuteWorkflowRequest,
    db: Session = Depends(get_db)
):
    try:
        generator = workflow_engine.execute_workflow(request)
        
        # We wrap the generator to yield SSE format
        def event_stream():
            full_response = ""
            for chunk in generator:
                if chunk:
                    full_response += chunk
                # SSE format requires "data: <message>\n\n"
                # We replace newlines in the chunk so it doesn't break the SSE format
                safe_chunk = chunk.replace('\n', '\\n') 
                yield f"data: {safe_chunk}\n\n"
            
            # Save chat log after stream completes
            try:
                chat_log = models.ChatLog(
                    user_query=request.query,
                    bot_response=full_response,
                    workflow_id=request.workflow_id
                )
                db.add(chat_log)
                db.commit()
            except Exception as db_err:
                db.rollback()
                print(f"Error saving chat log: {db_err}")
        
        return StreamingResponse(event_stream(), media_type="text/event-stream")
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/workflows")
def save_workflow(request: models.WorkflowSaveRequest, db: Session = Depends(get_db)):
    try:
        new_workflow = models.WorkflowDefinition(
            name=request.name,
            graph_json=request.graph_json
        )
        db.add(new_workflow)
        db.commit()
        db.refresh(new_workflow)
        return {"message": "Workflow saved successfully", "workflow_id": new_workflow.id}
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=str(e))

@app.put("/api/workflows/{workflow_id}")
def update_workflow(workflow_id: int, request: models.WorkflowSaveRequest, db: Session = Depends(get_db)):
    try:
        db_workflow = db.query(models.WorkflowDefinition).filter(models.WorkflowDefinition.id == workflow_id).first()
        if not db_workflow:
            raise HTTPException(status_code=404, detail="Workflow not found")
        
        db_workflow.name = request.name
        db_workflow.graph_json = request.graph_json
        db.commit()
        db.refresh(db_workflow)
        return {"message": "Workflow updated successfully", "workflow_id": db_workflow.id}
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=str(e))

@app.delete("/api/workflows/{workflow_id}")
def delete_workflow(workflow_id: int, db: Session = Depends(get_db)):
    try:
        db_workflow = db.query(models.WorkflowDefinition).filter(models.WorkflowDefinition.id == workflow_id).first()
        if not db_workflow:
            raise HTTPException(status_code=404, detail="Workflow not found")
        
        # Delete related chat logs first if not using cascade
        db.query(models.ChatLog).filter(models.ChatLog.workflow_id == workflow_id).delete()
        
        db.delete(db_workflow)
        db.commit()
        return {"message": "Workflow deleted successfully"}
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/workflows")
def get_workflows(db: Session = Depends(get_db)):
    try:
        workflows = db.query(models.WorkflowDefinition).all()
        result = []
        for wf in workflows:
            result.append({
                "id": wf.id,
                "name": wf.name,
                "graph_json": wf.graph_json
            })
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
