import json
import os


class RAGKnowledgeBase:
    """
    Simulates a RAG pipeline using a local JSON knowledge base.
    In production, this would use vector embeddings (FAISS/ChromaDB).
    Here we use intelligent keyword matching to retrieve relevant chunks.
    """

    def __init__(self, path: str = "data/knowledge_base.json"):
        base_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
        full_path = os.path.join(base_dir, path)
        with open(full_path, "r", encoding="utf-8") as f:
            self.data = json.load(f)
        self._build_index()

    def _build_index(self):
        """Build a simple keyword index over the knowledge base chunks."""
        self.chunks = []

        # Product chunks
        for product in self.data["products"]:
            chunk = f"""
PLAN: {product['name']}
Price: {product['price']}
Videos: {product['videos']}
Resolution: {product['resolution']}
AI Captions: {'Yes' if product['captions'] else 'No'}
Support: {product['support']}
Features: {', '.join(product['features'])}
""".strip()
            self.chunks.append(
                {
                    "content": chunk,
                    "keywords": [
                        "price",
                        "plan",
                        "cost",
                        "basic",
                        "pro",
                        "video",
                        "resolution",
                        "caption",
                        "feature",
                        "4k",
                        "720p",
                        "unlimited",
                        "editing",
                        product["id"],
                    ],
                }
            )

        # Policy chunks
        for policy in self.data["policies"]:
            self.chunks.append(
                {
                    "content": f"POLICY - {policy['topic'].upper()}: {policy['detail']}",
                    "keywords": [
                        policy["topic"],
                        "policy",
                        "refund",
                        "support",
                        "trial",
                        "upgrade",
                        "cancel",
                    ],
                }
            )

        # Company chunk
        company = self.data["company"]
        self.chunks.append(
            {
                "content": f"ABOUT: {company['name']} - {company['description']} Website: {company['website']}",
                "keywords": ["about", "company", "what", "autostream", "who"],
            }
        )

    def _format_pricing_block(self) -> str:
        basic = next(p for p in self.data["products"] if p["id"] == "basic")
        pro = next(p for p in self.data["products"] if p["id"] == "pro")
        return (
            "Pricing:\n"
            f"- Basic Plan: {basic['price']} -> {basic['videos']}, {basic['resolution']}\n"
            f"- Pro Plan: {pro['price']} -> {pro['videos']}, {pro['resolution']}, AI captions"
        )

    def _format_policy_block(self, topics: list[str] | None = None) -> str:
        topic_filter = set(topics or [])
        selected = []
        for policy in self.data["policies"]:
            if not topic_filter or policy["topic"] in topic_filter:
                selected.append(f"- {policy['detail']}")
        if not selected:
            return "Policies:\n- No policy data found"
        return "Policies:\n" + "\n".join(selected)

    def _format_company_block(self) -> str:
        company = self.data["company"]
        return (
            "Company:\n"
            f"- Name: {company['name']}\n"
            f"- Tagline: {company['tagline']}\n"
            f"- Website: {company['website']}\n"
            f"- About: {company['description']}"
        )

    def retrieve(self, query: str) -> str:
        """
        Retrieve relevant knowledge base chunks for a given query.
        Returns formatted context string to inject into LLM prompt.
        """
        query_lower = query.lower()
        blocks = []

        pricing_terms = ["price", "pricing", "cost", "plan", "basic", "pro", "feature", "details"]
        policy_terms = ["policy", "refund", "support", "trial", "upgrade", "cancel"]
        company_terms = ["about", "company", "autostream", "who", "what"]

        wants_pricing = any(term in query_lower for term in pricing_terms)
        wants_policies = any(term in query_lower for term in policy_terms)
        wants_company = any(term in query_lower for term in company_terms)

        if wants_pricing:
            blocks.append(self._format_pricing_block())

        if wants_policies:
            topics = []
            for t in ["refund", "support", "trial", "upgrade"]:
                if t in query_lower:
                    topics.append(t)
            blocks.append(self._format_policy_block(topics if topics else None))

        if wants_company:
            blocks.append(self._format_company_block())

        if not blocks:
            blocks.append(self._format_pricing_block())
            blocks.append(self._format_policy_block(["support", "trial"]))

        return "\n\n".join(blocks)

    def get_full_context(self) -> str:
        """Return complete knowledge base as formatted string."""
        return "\n\n".join(
            [
                self._format_pricing_block(),
                self._format_policy_block(None),
                self._format_company_block(),
            ]
        )
