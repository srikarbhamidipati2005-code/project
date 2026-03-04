import datetime
from sqlalchemy import Column, Integer, String, DateTime, ForeignKey, JSON
from sqlalchemy.orm import relationship
from .database import Base

class DocumentMetadata(Base):
    __tablename__ = "document_metadata"
    
    id = Column(Integer, primary_key=True, index=True)
    filename = Column(String, index=True)
    upload_date = Column(DateTime, default=datetime.datetime.utcnow)

class WorkflowDefinition(Base):
    __tablename__ = "workflow_definitions"
    
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, index=True)
    graph_json = Column(JSON) # Stores the node-edge configuration
    
    chat_logs = relationship("ChatLog", back_populates="workflow")

class ChatLog(Base):
    __tablename__ = "chat_logs"
    
    id = Column(Integer, primary_key=True, index=True)
    workflow_id = Column(Integer, ForeignKey("workflow_definitions.id"))
    user_query = Column(String)
    bot_response = Column(String)
    workflow = relationship("WorkflowDefinition", back_populates="chat_logs")

from pydantic import BaseModel
from typing import List, Dict, Any, Optional

class NodeSchema(BaseModel):
    id: str
    type: str
    data: Dict[str, Any]

class EdgeSchema(BaseModel):
    id: str
    source: str
    target: str

class ExecuteWorkflowRequest(BaseModel):
    query: str
    nodes: List[NodeSchema]
    edges: List[EdgeSchema]
    workflow_id: Optional[int] = None

class WorkflowSaveRequest(BaseModel):
    name: str
    graph_json: Dict[str, Any]

class WorkflowResponse(BaseModel):
    id: int
    name: str
    graph_json: Dict[str, Any]
