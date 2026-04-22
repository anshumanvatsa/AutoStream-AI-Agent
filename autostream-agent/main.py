import argparse

import uvicorn
from dotenv import load_dotenv

load_dotenv()


def _fresh_state() -> dict:
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


def run_terminal():
    """Run the agent in terminal mode for local testing."""
    from agent.graph import build_graph

    print("\n" + "=" * 60)
    print("  AutoStream AI Agent - Terminal Mode")
    print("  Type 'quit' to exit | Type 'reset' to start over")
    print("=" * 60 + "\n")

    graph = build_graph()
    state = _fresh_state()

    while True:
        try:
            user_input = input("You: ").strip()
        except KeyboardInterrupt:
            print("\nGoodbye!")
            break

        if not user_input:
            continue
        if user_input.lower() == "quit":
            print("Goodbye!")
            break
        if user_input.lower() == "reset":
            state = _fresh_state()
            print("--- Conversation reset ---\n")
            continue

        state["messages"].append({"role": "user", "content": user_input})
        state = graph.invoke(state)

        # Get last assistant response
        assistant_msgs = [m for m in state["messages"] if m["role"] == "assistant"]
        if assistant_msgs:
            print(f"\nAutoStream AI: {assistant_msgs[-1]['content']}\n")


def run_api():
    """Run the FastAPI server."""
    from api.server import app

    print("\nAutoStream AI Agent API starting...")
    print("API docs: http://localhost:8000/docs")
    print("Chat endpoint: POST http://localhost:8000/chat\n")
    uvicorn.run(app, host="0.0.0.0", port=8000, reload=True)


if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="AutoStream AI Agent")
    parser.add_argument(
        "--mode",
        choices=["api", "terminal"],
        default="api",
        help="Run mode: 'api' for FastAPI server, 'terminal' for CLI chat",
    )
    args = parser.parse_args()

    if args.mode == "terminal":
        run_terminal()
    else:
        run_api()
