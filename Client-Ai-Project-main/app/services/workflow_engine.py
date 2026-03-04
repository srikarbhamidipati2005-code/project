import os
import requests
from typing import Dict, Any, Optional
from app.models import ExecuteWorkflowRequest, NodeSchema
from app.services.knowledge_base import query_chroma
from google import genai

GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")
SERPAPI_API_KEY = os.getenv("SERPAPI_API_KEY")

if GEMINI_API_KEY:
    client = genai.Client(api_key=GEMINI_API_KEY)
else:
    client = None

def execute_web_search(query: str) -> str:
    """Uses SerpAPI to search the web for context."""
    if not SERPAPI_API_KEY:
        return "Web search is disabled. No SERPAPI_API_KEY provided."
    
    try:
        response = requests.get(
            "https://serpapi.com/search",
            params={
                "engine": "google",
                "q": query,
                "api_key": SERPAPI_API_KEY
            }
        )
        response.raise_for_status()
        results = response.json()
        
        # Simple extraction of snippet texts
        snippets = []
        if "organic_results" in results:
            for result in results["organic_results"][:3]:
                if "snippet" in result:
                    snippets.append(result["snippet"])
        
        return "\n".join(snippets)
    except Exception as e:
        return f"Error performing web search: {str(e)}"

def execute_llm(prompt: str, context: str, output_format: str = "text"):
    """Calls Gemini to generate a response iteratively (Streaming)."""
    if not client:
        yield "Error: Gemini API key not configured."
        return
        
    full_prompt = f"""
        Context Information:
        ---------------------
        {context}
        ---------------------
        
        Given the context above, answer the following query:
        {prompt}
        
        IMPORTANT FORMATTING:
        The requested output format is: {output_format.upper()}
        Please ensure the response is well-structured. 
        If 'MARKDOWN', use headings, bullet points, and bold text to make it readable.
        If 'JSON', return strictly valid JSON.
    """
    
    try:
        response_stream = client.models.generate_content_stream(
            model='gemini-2.5-flash',
            contents=full_prompt,
        )
        for chunk in response_stream:
            if chunk.text:
                yield chunk.text
    except Exception as e:
        yield f"Error generating text: {str(e)}"

def execute_workflow(request: ExecuteWorkflowRequest) -> str:
    """Orchestrates the workflow execution given the nodes and edges."""
    context_collected = []
    llm_node = None
    output_format = "markdown"
    
    # Strategy: Find Knowledge Base nodes, gather context, then find LLM.
    for current_node in request.nodes:
        node_type = current_node.type.lower()
        node_data = current_node.data or {}
        node_label = node_data.get("label", "").lower()
        
        if "knowledgebase" in node_type or "knowledge base" in node_label:
            filename = node_data.get("uploadedFilename")
            chroma_results = query_chroma(request.query, filename=filename)
            if chroma_results:
                context_collected.extend(chroma_results)
                
        elif "websearch" in node_type or "web search" in node_label:
            web_results = execute_web_search(request.query)
            context_collected.append(web_results)
            
        elif "llm" in node_type or "llm engine" in node_label:
            llm_node = current_node
            
        elif "output" in node_type or "customoutput" in node_type:
            output_format = node_data.get("format", "markdown")
            
    # Now execute LLM
    if llm_node:
        combined_context = "\n".join(context_collected)
        return execute_llm(request.query, combined_context, output_format)
        
    # Fallback
    combined_context = "\n".join(context_collected)
    def fallback_generator():
        if combined_context:
            yield f"Execution finished. Context gathered:\n{combined_context}"
        else:
            yield f"Workflow executed but no LLM node was found to evaluate the query: {request.query}"
            
    return fallback_generator()
