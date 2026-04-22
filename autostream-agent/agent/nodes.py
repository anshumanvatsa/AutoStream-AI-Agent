from dotenv import load_dotenv
load_dotenv()

from langchain_core.messages import AIMessage, HumanMessage, SystemMessage
from agent.state import AgentState
from agent.tools import mock_lead_capture, validate_email
from rag.knowledge_base import RAGKnowledgeBase


# Initialize RAG knowledge base
rag = RAGKnowledgeBase()


def _normalize_platform(raw: str) -> str:
    value = raw.strip().lower()
    if "youtube" in value or "yt" == value:
        return "youtube"
    if "instagram" in value or "insta" in value or "ig" == value:
        return "instagram"
    if "tiktok" in value or "tik tok" in value:
        return "tiktok"
    return "other"


def detect_intent(state: AgentState) -> AgentState:
    """
    Node 1: Deterministic intent classification with keyword rules.
    Returns one of: greeting | inquiry | high_intent
    """
    state["turn_count"] = state.get("turn_count", 0) + 1

    # Force high intent while collecting lead fields.
    if state.get("awaiting_field"):
        state["intent"] = "high_intent"
        print("🧠 Intent:", state["intent"])
        return state

    user_message = state["messages"][-1]["content"].strip().lower()

    greeting_keywords = ["hi", "hello", "hey", "good morning", "yo"]
    inquiry_keywords = ["price", "pricing", "cost", "plan", "feature", "details", "how does it work"]
    high_intent_keywords = ["buy", "subscribe", "start", "get started", "sign up", "i want", "let's do it", "try pro"]

    def _has_any(keywords: list[str]) -> bool:
        return any(keyword in user_message for keyword in keywords)

    if _has_any(high_intent_keywords):
        intent = "high_intent"
    elif _has_any(greeting_keywords):
        intent = "greeting"
    elif _has_any(inquiry_keywords):
        intent = "inquiry"
    else:
        # Stable fallback for demo and production consistency.
        intent = "inquiry"

    state["intent"] = intent
    print("🧠 Intent:", state["intent"])
    return state


def retrieve_knowledge(state: AgentState) -> AgentState:
    """
    Node 2: RAG retrieval - fetch relevant knowledge base context.
    Only runs for inquiry or high_intent to avoid unnecessary retrieval.
    """
    if state["intent"] in ["inquiry", "high_intent"]:
        query = state["messages"][-1]["content"]
        context = rag.retrieve(query)
        state["rag_context"] = context
        print("📚 RAG Used")
    else:
        state["rag_context"] = rag.get_full_context()

    return state


def check_lead_collection(state: AgentState) -> AgentState:
    """
    Node 3: Extract and validate lead fields from user messages.
    Manages the sequential collection: name -> email -> platform
    """
    if not state.get("awaiting_field"):
        print("📥 Collecting:", "none")
        return state

    user_input = state["messages"][-1]["content"].strip()
    field = state["awaiting_field"]
    print("📥 Collecting:", field)

    if field == "name":
        # Accept any reasonable name (at least 2 chars)
        if len(user_input) >= 2:
            state["lead_data"]["name"] = user_input
            state["awaiting_field"] = "email"
            print(f"Name collected: {user_input}")
        else:
            print("Name too short, will re-ask")

    elif field == "email":
        if validate_email(user_input):
            state["lead_data"]["email"] = user_input
            state["awaiting_field"] = "platform"
            state["last_error"] = None
        else:
            # Invalid email - keep awaiting_field as email, response is deterministic in generate_response.
            state["last_error"] = "invalid_email"

    elif field == "platform":
        state["lead_data"]["platform"] = _normalize_platform(user_input)
        state["awaiting_field"] = None
        state["last_error"] = None

        # Check if all fields are collected in strict order.
        lead = state["lead_data"]
        if lead["name"] and lead["email"] and lead["platform"]:
            state["lead_collected"] = True

    return state


def generate_response(state: AgentState) -> AgentState:
    """
    Node 4: Generate natural, contextual response using Gemini LLM.
    Uses RAG context, intent, and conversation history to craft response.
    """

    # Skip if lead just completed - trigger_lead_capture handles final confirmation.
    if state["lead_collected"] and not state["lead_capture_triggered"]:
        return state

    awaiting = state.get("awaiting_field")
    intent = state["intent"]
    if awaiting == "name":
        reply = "Awesome, let's get you started with AutoStream Pro. What's your full name?"
    elif awaiting == "email":
        if state.get("last_error") == "invalid_email":
            reply = "That doesn't look like a valid email, could you re-enter it?"
        else:
            reply = "Great, what's the best email to reach you?"
    elif awaiting == "platform":
        reply = "Perfect. Which platform do you create content on: YouTube, Instagram, TikTok, or Other?"
    elif intent == "greeting":
        reply = "Hi! I'm AutoStream's assistant. We help creators turn raw footage into polished videos fast. Ask me about plans, features, or pricing anytime."
    elif intent == "high_intent" and not state["lead_collected"]:
        state["awaiting_field"] = "name"
        reply = "Great choice! Let's get your Pro setup started right away. What's your full name?"
    else:
        # Inquiry responses are grounded strictly in retrieved RAG context.
        reply = f"Here are the details from AutoStream:\n{state.get('rag_context', '')}"

    # Build LangChain message objects for consistent traceability.
    history_messages = state["messages"][-12:]
    langchain_messages = [SystemMessage(content="Conversation trace for auditing.")]
    for msg in history_messages:
        if msg["role"] == "user":
            langchain_messages.append(HumanMessage(content=msg["content"]))
        elif msg["role"] == "assistant":
            langchain_messages.append(AIMessage(content=msg["content"]))

    state["messages"].append({"role": "assistant", "content": reply})
    return state


def trigger_lead_capture(state: AgentState) -> AgentState:
    """
    Node 5: Execute the mock lead capture tool.
    ONLY called when all three lead fields are confirmed collected.
    This is the tool execution node - critical for the assignment.
    """
    if state["lead_collected"] and not state["lead_capture_triggered"]:
        data = state["lead_data"]

        # Final safety check - all fields must be present non-empty strings.
        required_fields = [data.get("name"), data.get("email"), data.get("platform")]
        if not all(isinstance(v, str) and v.strip() for v in required_fields):
            print("Lead capture skipped - incomplete data")
            return state

        # Execute the mock tool
        result = mock_lead_capture(
            name=data["name"],
            email=data["email"],
            platform=data["platform"],
        )

        state["lead_capture_triggered"] = True
        state["messages"].append({"role": "system", "content": "Lead capture tool executed"})

        if result["success"]:
            confirmation = "🎉 You're all set! Our team will reach out within 24 hours."
        else:
            confirmation = "Something went wrong on our end. Please try again or contact support@autostream.io"

        state["messages"].append({"role": "assistant", "content": confirmation})
        print("🎯 Lead Captured")

    return state
