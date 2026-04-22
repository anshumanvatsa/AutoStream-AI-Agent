# AutoStream Conversational AI Agent
### Social-to-Lead Agentic Workflow | Built with LangGraph + Gemini 1.5 Flash

## Setup & Run

### 1. Clone and install
git clone <your-repo-url>
cd autostream-agent
pip install -r requirements.txt

### 2. Configure API key
cp .env.example .env
# Open .env and add your Google Gemini API key:
# Get free key at: https://aistudio.google.com
GOOGLE_API_KEY=your_key_here

### 3. Run
# API mode (connect to frontend):
python main.py --mode api

# Terminal mode (test in CLI):
python main.py --mode terminal

# API docs available at:
http://localhost:8000/docs

---

## Architecture Explanation

This agent is built using LangGraph, a framework for building stateful, 
multi-step AI agent workflows as explicit directed graphs. LangGraph was 
chosen over AutoGen because it provides deterministic node execution order, 
making the agent's behavior predictable and debuggable — critical for a 
production lead capture system where premature tool execution would be costly.

The agent flows through five sequential nodes per conversation turn:

1. detect_intent — Gemini 1.5 Flash classifies user message into greeting, 
inquiry, high_intent, or unknown using a structured system prompt
2. retrieve_knowledge — RAG retrieval fetches relevant chunks from the local 
JSON knowledge base using keyword matching, simulating a vector search pipeline
3. check_lead_collection — Validates and stores lead fields sequentially 
(name → email → platform), with email regex validation
4. generate_response — Gemini generates a contextual reply using injected RAG 
context, conversation history, and current state
5. trigger_lead_capture — Conditional node that only fires when all three lead 
fields are confirmed, calling mock_lead_capture() with zero risk of premature execution

State is managed via AgentState TypedDict, which carries the full conversation 
history, lead collection progress, intent, and RAG context across all turns. 
Sessions are stored server-side by session_id, enabling true multi-turn memory 
across API calls without sending history from the client.

---

## WhatsApp Webhook Integration

To deploy this agent on WhatsApp using Meta's Business API:

**Step 1 — Register Webhook**
In Meta Developer Console, register your server URL as the webhook endpoint.
Add a new route to server.py:
POST /webhook/whatsapp — receives incoming messages
GET /webhook/whatsapp — handles Meta's verification challenge using hub.verify_token

**Step 2 — Parse Incoming Messages**
On POST, extract: sender phone number (use as session_id), message body text.
Pass to existing /chat logic — session management works automatically.

**Step 3 — Send Response**
After getting agent response, POST to Meta's send API:
https://graph.facebook.com/v18.0/{PHONE_NUMBER_ID}/messages
with Authorization: Bearer {WHATSAPP_TOKEN} and the response text as body.

**Step 4 — Production Requirements**
- Replace in-memory sessions dict with Redis for persistence across restarts
- Deploy on Railway, Render, or AWS with HTTPS (required by Meta)
- Set WHATSAPP_TOKEN and PHONE_NUMBER_ID as environment variables
- Add message deduplication using WhatsApp message IDs to prevent double-processing

The existing session_id pattern maps perfectly to WhatsApp phone numbers, 
making this integration straightforward with minimal code changes.
