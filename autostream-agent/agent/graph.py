from langgraph.graph import END, StateGraph

from agent.nodes import (
    check_lead_collection,
    detect_intent,
    generate_response,
    retrieve_knowledge,
    trigger_lead_capture,
)
from agent.state import AgentState


def build_graph():
    """
    Build the LangGraph StateGraph for the AutoStream conversational agent.

    Flow:
    detect_intent -> retrieve_knowledge -> check_lead_collection -> generate_response
                                                                        |
                                                         [conditional routing]
                                                        |                    |
                                              trigger_lead_capture          END
    """
    graph = StateGraph(AgentState)

    # Register all nodes
    graph.add_node("detect_intent", detect_intent)
    graph.add_node("retrieve_knowledge", retrieve_knowledge)
    graph.add_node("check_lead_collection", check_lead_collection)
    graph.add_node("generate_response", generate_response)
    graph.add_node("trigger_lead_capture", trigger_lead_capture)

    # Set the entry point
    graph.set_entry_point("detect_intent")

    # Linear edges
    graph.add_edge("detect_intent", "retrieve_knowledge")
    graph.add_edge("retrieve_knowledge", "check_lead_collection")
    graph.add_edge("check_lead_collection", "generate_response")

    # Conditional edge after response generation
    def route_after_response(state: AgentState) -> str:
        """Route to lead capture tool only when all fields collected."""
        if state["lead_collected"] and not state["lead_capture_triggered"]:
            return "trigger_lead_capture"
        return END

    graph.add_conditional_edges(
        "generate_response",
        route_after_response,
        {
            "trigger_lead_capture": "trigger_lead_capture",
            END: END,
        },
    )

    graph.add_edge("trigger_lead_capture", END)

    return graph.compile()
