// AutoStream simulated AI agent: intent detection + RAG-style knowledge retrieval

export type Intent = "greeting" | "inquiry" | "high_intent" | "lead_capture" | "smalltalk";

export type AgentResponse = {
  text: string;
  intent: Intent;
  triggerLeadCapture?: boolean;
  showPricingTable?: boolean;
};

const KNOWLEDGE = {
  pricing: {
    basic: { name: "Basic", price: "$29/month", features: ["10 videos/month", "720p export", "Standard rendering"] },
    pro: { name: "Pro", price: "$79/month", features: ["Unlimited videos", "4K export", "AI captions", "Priority rendering", "24/7 support"] },
  },
  policies: {
    refunds: "We offer a 7-day money-back guarantee. After 7 days, all sales are final.",
    support: "24/7 priority support is available exclusively for Pro subscribers. Basic users get email support during business hours.",
  },
};

const HIGH_INTENT_PATTERNS = [
  /\b(i want|i'd like|i would like|sign me up|get me|give me)\b.*\b(pro|basic|started|plan|subscription)\b/i,
  /\b(how (do|can) i (sign up|subscribe|get started|buy|purchase))\b/i,
  /\b(get started|sign up|subscribe|buy now|purchase|upgrade|let's go)\b/i,
  /\bready to (buy|start|subscribe|upgrade)\b/i,
];

const GREETING_PATTERNS = [/\b(hi|hello|hey|yo|sup|good (morning|afternoon|evening))\b/i];

const PRICING_PATTERNS = [/\b(price|pricing|cost|plan|plans|tier|basic|pro|difference|compare|comparison)\b/i];
const REFUND_PATTERNS = [/\b(refund|money back|cancel|cancellation)\b/i];
const SUPPORT_PATTERNS = [/\b(support|help desk|customer service|24\/7)\b/i];
const FEATURE_PATTERNS = [/\b(4k|caption|edit|render|video|feature|what (do|does) (you|autostream))\b/i];

export function classifyIntent(text: string): Intent {
  const t = text.trim().toLowerCase();
  if (!t) return "smalltalk";
  if (HIGH_INTENT_PATTERNS.some((r) => r.test(t))) return "high_intent";
  if (GREETING_PATTERNS.some((r) => r.test(t)) && t.length < 30) return "greeting";
  if (
    PRICING_PATTERNS.some((r) => r.test(t)) ||
    REFUND_PATTERNS.some((r) => r.test(t)) ||
    SUPPORT_PATTERNS.some((r) => r.test(t)) ||
    FEATURE_PATTERNS.some((r) => r.test(t))
  )
    return "inquiry";
  return "smalltalk";
}

export function generateResponse(text: string, history: { role: string; content: string }[]): AgentResponse {
  const intent = classifyIntent(text);
  const t = text.toLowerCase();

  if (intent === "greeting") {
    return {
      intent,
      text: "Hey there! 👋 Welcome to AutoStream. I can answer questions about our plans, features, or get you set up with Pro in under a minute. What brings you here today?",
    };
  }

  if (intent === "high_intent") {
    return {
      intent,
      triggerLeadCapture: true,
      text: "Awesome — let's get you on Pro 🚀. I just need a few quick details and our team will reach out within 24 hours to onboard you.",
    };
  }

  if (intent === "inquiry") {
    if (PRICING_PATTERNS.some((r) => r.test(t)) || /difference|compare/.test(t)) {
      return {
        intent,
        showPricingTable: true,
        text: "Great question — here's how Basic and Pro compare:",
      };
    }
    if (REFUND_PATTERNS.some((r) => r.test(t))) {
      return { intent, text: KNOWLEDGE.policies.refunds };
    }
    if (SUPPORT_PATTERNS.some((r) => r.test(t))) {
      return { intent, text: KNOWLEDGE.policies.support };
    }
    if (FEATURE_PATTERNS.some((r) => r.test(t))) {
      return {
        intent,
        text: "AutoStream automatically edits your raw footage into polished videos — 4K rendering, AI-generated captions, smart cuts, and unlimited renders on Pro. Want me to show you the plans?",
      };
    }
  }

  // Fallback with light memory awareness
  const recent = history.slice(-3).map((m) => m.content).join(" ");
  if (/pro|basic|plan/i.test(recent)) {
    return {
      intent: "inquiry",
      text: "Happy to dig deeper into the plans — were you leaning toward Pro for the 4K + AI captions, or is Basic enough for your volume?",
    };
  }
  return {
    intent: "smalltalk",
    text: "I'm here to help with anything AutoStream — pricing, features, or getting you started. What would you like to know?",
  };
}

export async function mockLeadCapture(name: string, email: string, platform: string) {
  await new Promise((r) => setTimeout(r, 900));
  // eslint-disable-next-line no-console
  console.log("[mock_lead_capture]", { name, email, platform, at: new Date().toISOString() });
  return { ok: true, id: `lead_${Date.now()}` };
}
