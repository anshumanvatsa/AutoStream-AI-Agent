🚀 AutoStream AI Agent
Conversational AI for Social-to-Lead Conversion

AutoStream is a full-stack Conversational AI Agent that transforms user conversations into qualified business leads. Built as part of a Social-to-Lead Agentic Workflow, it goes beyond traditional chatbots by combining intent detection, RAG-based responses, and controlled tool execution.

✨ Features
🧠 Intent Detection
Classifies user input into:

Greeting 👋

Product/Inquiry 🔍

High Intent 🔥

Uses deterministic logic for reliable and consistent behavior.

📚 RAG-Based Knowledge Retrieval
Answers queries using a local knowledge base

Covers:

Pricing (Basic & Pro plans)

Features (4K editing, AI captions)

Policies (refunds, support)

Prevents hallucinations by grounding responses

🔄 Multi-Turn Conversation
Maintains conversation state across multiple turns

Handles smooth transitions from inquiry → conversion

Tracks lead collection stages

🎯 Lead Capture Workflow
Detects high-intent users

Collects:

Name

Email

Creator Platform

Triggers backend tool only after all inputs are validated

🔧 Tool Execution
def mock_lead_capture(name, email, platform):
    print(f"Lead captured successfully: {name}, {email}, {platform}")
Ensures safe and controlled execution (no premature calls).

🌐 Full-Stack Integration
Frontend: React + TypeScript (Vite)

Backend: FastAPI + LangGraph

Real-time API communication via /chat

Persistent sessions using session_id

🏗️ Architecture
🔹 Agent Workflow (LangGraph)
Intent Detection Node

RAG Retrieval Node

Lead Collection Node

Tool Execution Node

🔹 State Management
Maintains:

Conversation history

Current intent

Lead stage (name/email/platform)

Collected user data

🔹 API Layer
POST /chat → Handles full agent lifecycle per message

GET /health → Server health check

⚙️ Tech Stack
Backend: FastAPI, LangGraph

Frontend: React, TypeScript, Vite

LLM: Groq (fast inference, LangChain compatible)

State Management: LangGraph state

🚀 Getting Started
1️⃣ Clone Repository
git clone https://github.com/anshumanvatsa/AutoStream-AI-Agent.git
cd AutoStream-AI-Agent
2️⃣ Run Backend
cd autostream-agent
pip install -r requirements.txt
uvicorn api.server:app --reload
Backend runs at:
👉 http://localhost:8000

3️⃣ Run Frontend
npm install
npm run dev
Frontend runs at:
👉 http://localhost:5173

🎥 Demo Flow
User asks about pricing

Agent retrieves data using RAG

User shows interest in Pro plan

Agent detects high intent

Collects name → email → platform

Successfully captures lead

📦 Knowledge Base
Stored locally (JSON/Markdown), includes:

Pricing (Basic & Pro plans)

Features

Policies

📱 WhatsApp Integration (Design)
To integrate with WhatsApp:

Use WhatsApp Business API (via Twilio or Meta Cloud API)

Configure webhook endpoint:

Incoming messages → /chat API

Maintain session using user phone number

Send agent responses back via WhatsApp API

This enables real-time conversational lead capture on WhatsApp.

🔮 Future Improvements
Vector database for advanced RAG

Persistent database for leads

Analytics dashboard

Multi-channel deployment (WhatsApp, Slack)

🧠 Key Highlights
Deterministic intent routing (reliable behavior)

Structured RAG (no hallucination)

Controlled tool execution

Production-like architecture

📌 Summary
AutoStream demonstrates how modern AI agents can go beyond chat to become conversion-driven systems, bridging the gap between user interaction and real business outcomes.
