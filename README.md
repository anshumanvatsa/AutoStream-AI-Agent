🚀 AutoStream AI Agent
Conversational AI for Social-to-Lead Conversion

## 🎥 Demo Video  

👉 **[Watch Full Demo](https://drive.google.com/file/d/1eC8yLA_TcGHijT6EoqfC7Bq8VX4pzIxi/view?usp=drivesdk)**

📌 Overview
AutoStream is a full-stack Conversational AI Agent that transforms user conversations into qualified business leads. Built as part of a Social-to-Lead Agentic Workflow, it goes beyond traditional chatbots by combining intent detection, RAG-based responses, and controlled tool execution.

✨ Features
🧠 Intent Detection
Greeting 👋

Product/Inquiry 🔍

High Intent 🔥

Deterministic logic for consistent behavior

📚 RAG-Based Knowledge Retrieval
Uses a local knowledge base (JSON/Markdown)

Covers pricing, features, and policies

Prevents hallucination with structured responses

🔄 Multi-Turn Conversation
Maintains context across multiple turns

Tracks lead collection stages

Smooth transition: inquiry → conversion

🎯 Lead Capture Workflow
Detects high-intent users

Collects:

Name

Email

Creator Platform

Ensures sequential data collection

🔧 Tool Execution
def mock_lead_capture(name, email, platform):
    print(f"Lead captured successfully: {name}, {email}, {platform}")
Triggered only after all inputs are collected

Prevents premature execution

🌐 Full-Stack Integration
Frontend: React + TypeScript (Vite)

Backend: FastAPI + LangGraph

API: /chat endpoint

Session-based state tracking

🏗️ Architecture
🔹 Agent Workflow (LangGraph)
Intent Detection Node

RAG Retrieval Node

Lead Collection Node

Tool Execution Node

🧠 Architecture Explanation
This project uses LangGraph to design a structured and deterministic conversational workflow instead of relying on a purely generative chatbot. LangGraph was chosen because it allows explicit control over conversation flow using nodes and transitions, making it suitable for real-world systems where reliability is critical.

Each user message flows through multiple stages including intent detection, knowledge retrieval, and lead capture. This ensures responses are grounded and follow a defined logic instead of being unpredictable.

State management is handled using LangGraph’s state object, which persists across each interaction. The state stores conversation history, detected intent, lead stage (name, email, platform), and collected user data. This enables the system to maintain multi-turn conversations and transition smoothly from general queries to high-intent lead capture.

By combining structured workflows with persistent state, the system achieves both flexibility and consistency required for production-grade conversational AI.

⚙️ Tech Stack
Backend: FastAPI, LangGraph

Frontend: React, TypeScript, Vite

LLM: Groq

State Management: LangGraph

🚀 How to Run Locally
1️⃣ Clone Repository
git clone https://github.com/anshumanvatsa/AutoStream-AI-Agent.git
cd AutoStream-AI-Agent
2️⃣ Run Backend
cd autostream-agent
pip install -r requirements.txt
uvicorn api.server:app --reload
👉 http://localhost:8000

3️⃣ Run Frontend
npm install
npm run dev
👉 http://localhost:5173

🎥 Demo Flow
User asks about pricing

Agent retrieves data using RAG

User shows interest in Pro plan

Agent detects high intent

Collects name → email → platform

Lead successfully captured

📦 Knowledge Base
Stored locally (JSON/Markdown), includes:

Pricing (Basic & Pro plans)

Features

Policies

📱 WhatsApp Integration (Webhook-Based)
To integrate this agent with WhatsApp, the system uses the WhatsApp Business API via providers like Twilio or Meta Cloud API.

When a user sends a message on WhatsApp, it triggers a webhook configured on the backend. This webhook forwards the message to the /chat API.

The backend processes the message using the LangGraph workflow (intent detection, retrieval, lead capture). The generated response is then sent back to the user via WhatsApp API.

The user’s phone number is used as the session_id to maintain conversation state across multiple messages.

This enables real-time, scalable conversational lead capture directly on WhatsApp.

🔮 Future Improvements
Vector database for advanced RAG

Persistent lead storage

Analytics dashboard

Multi-platform deployment

🧠 Key Highlights
Deterministic intent routing

Structured RAG (no hallucination)

Controlled tool execution

Production-style architecture

📌 Summary
AutoStream demonstrates how modern AI agents can move beyond chat to become conversion-driven systems, bridging user interaction with real business outcomes.
