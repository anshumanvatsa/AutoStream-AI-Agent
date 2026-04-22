import uuid
from typing import Optional

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel

from agent.graph import build_graph

app = FastAPI(
    title="AutoStream AI Agent API",
    description="Social-to-Lead Agentic Workflow powered by LangGraph + Gemini",
    version="1.0.0",
)

# CORS - allow frontend and any other origin
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Compile graph once at startup
graph = build_graph()

# In-memory session store
sessions: dict = {}


class ChatRequest(BaseModel):
    message: str
    session_id: Optional[str] = None


class ChatResponse(BaseModel):
    response: str
    intent: str
    lead_stage: str
    lead_captured: bool
    session_id: str


def create_initial_state() -> dict:
    return {
        "messages": [],
        "intent": "",
        "lead_data": {"name": None, "email": None, "platform": None},
        "lead_collected": False,
        "lead_capture_triggered": False,
        "awaiting_field": None,
        "rag_context": "",
        "turn_count": 0,
        "last_error": None,
    }


@app.post("/chat", response_model=ChatResponse)
def chat(req: ChatRequest):
    """Main chat endpoint. Maintains session state across turns."""
    session_id = req.session_id or str(uuid.uuid4())

    # Get or create session
    state = sessions.get(session_id, create_initial_state())

    # Append user message
    state["messages"].append({"role": "user", "content": req.message})

    # Run agent graph
    try:
        state = graph.invoke(state)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Agent error: {str(e)}")

    # Keep a bounded history window (last 6 turns => 12 messages).
    state["messages"] = state.get("messages", [])[-12:]

    # Persist updated full state
    sessions[session_id] = state

    # Get last assistant message
    assistant_messages = [m for m in state["messages"] if m["role"] == "assistant"]
    last_response = (
        assistant_messages[-1]["content"] if assistant_messages else "Sorry, something went wrong."
    )

    return ChatResponse(
        response=last_response,
        intent=state["intent"],
        lead_stage=state.get("awaiting_field") or "none",
        lead_captured=state["lead_capture_triggered"],
        session_id=session_id,
    )


@app.get("/health")
def health():
    return {
        "status": "ok",
        "agent": "AutoStream AI",
        "version": "1.0.0",
        "framework": "LangGraph + Gemini 1.5 Flash",
    }


@app.delete("/session/{session_id}")
def clear_session(session_id: str):
    """Clear a session to start fresh conversation."""
    if session_id in sessions:
        del sessions[session_id]
        return {"message": f"Session {session_id} cleared"}
    raise HTTPException(status_code=404, detail="Session not found")


@app.get("/session/{session_id}")
def get_session(session_id: str):
    """Debug endpoint - view full session state."""
    if session_id in sessions:
        return sessions[session_id]
    raise HTTPException(status_code=404, detail="Session not found")
