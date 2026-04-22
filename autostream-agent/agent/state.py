from typing import TypedDict, List, Dict, Optional, Any


class AgentState(TypedDict):
    messages: List[Dict[str, str]]          # Full conversation history
    intent: str                              # greeting | inquiry | high_intent | unknown
    lead_data: Dict[str, Optional[str]]     # name, email, platform
    lead_collected: bool                     # True when all 3 fields collected
    lead_capture_triggered: bool             # True after mock_lead_capture() called
    awaiting_field: Optional[str]            # name | email | platform | None
    rag_context: str                         # Retrieved knowledge base context
    turn_count: int                          # Conversation turn counter
    last_error: Optional[str]                # Track any errors gracefully
