import os
from dotenv import load_dotenv
load_dotenv(".env")

from app.models import ExecuteWorkflowRequest, NodeSchema, EdgeSchema
from app.services.workflow_engine import execute_workflow

req = ExecuteWorkflowRequest(
    query="Explain quantum computing in 1 sentence.",
    nodes=[
        NodeSchema(id="u1", type="userQuery", position={"x":0,"y":0}, data={"label":"User Query"}),
        NodeSchema(id="llm1", type="llmEngine", position={"x":0,"y":0}, data={"label":"LLM Engine"}),
        NodeSchema(id="o1", type="customOutput", position={"x":0,"y":0}, data={"label":"Output", "format": "text"})
    ],
    edges=[
        EdgeSchema(id="e1", source="u1", target="llm1"),
        EdgeSchema(id="e2", source="llm1", target="o1")
    ],
    workflow_id=None
)

gen = execute_workflow(req)
for chunk in gen:
    print(chunk, end="")
print()
