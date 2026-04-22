import { useEffect, useRef, useState } from "react";
import { Send, Sparkles, Bot, CheckCircle2 } from "lucide-react";
import { cn } from "@/lib/utils";

type Intent = "greeting" | "inquiry" | "high_intent";
type LeadStage = "name" | "email" | "platform" | "none";

type Message = {
  id: string;
  role: "user" | "assistant";
  content: string;
  time: string;
  intent?: Intent;
};

type ChatApiResponse = {
  response: string;
  intent: Intent;
  lead_stage: LeadStage;
  lead_captured: boolean;
  session_id: string;
};

function formatNow() {
  return new Date()
    .toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    })
    .toUpperCase();
}

function createSessionId() {
  if (typeof window === "undefined") return "";
  const existing = window.localStorage.getItem("session_id");
  if (existing) return existing;
  const id = window.crypto?.randomUUID?.() ?? `${Date.now()}-${Math.random().toString(36).slice(2)}`;
  window.localStorage.setItem("session_id", id);
  return id;
}

const initialMessages: Message[] = [
  {
    id: "m1",
    role: "assistant",
    intent: "greeting",
    content:
      "Hey! 👋 I'm AutoStream's AI assistant. Ask me about our plans, features, or say \"get started\" and I'll set you up on Pro.",
    time: "09:00 AM",
  },
];

function IntentBadge({ intent }: { intent: Intent }) {
  if (intent === "high_intent") {
    return (
      <span className="animate-violet-pulse inline-flex items-center gap-1 rounded-full border border-[oklch(0.65_0.21_295/0.5)] bg-[oklch(0.65_0.21_295/0.1)] px-2 py-0.5 text-[10px] font-medium text-[oklch(0.82_0.14_295)]">
        <span>🔥</span> High Intent
      </span>
    );
  }
  if (intent === "inquiry") {
    return (
      <span className="inline-flex items-center gap-1 rounded-full border border-cyan-400/40 bg-cyan-400/10 px-2 py-0.5 text-[10px] font-medium text-cyan-300">
        <span>🔍</span> Inquiry
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-1 rounded-full border border-border bg-[oklch(0.18_0.005_280)] px-2 py-0.5 text-[10px] font-medium text-muted-foreground">
      <span>👋</span> Greeting
    </span>
  );
}

export function ChatPanel() {
  const [messages, setMessages] = useState<Message[]>(initialMessages);
  const [input, setInput] = useState("");
  const [sessionId, setSessionId] = useState("");
  const [leadStage, setLeadStage] = useState<LeadStage>("none");
  const [leadCaptured, setLeadCaptured] = useState(false);
  const [inputError, setInputError] = useState("");
  const [typing, setTyping] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setSessionId(createSessionId());
  }, []);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages, typing]);

  const send = async (text: string) => {
    const trimmed = text.trim();
    if (!trimmed || typing || !sessionId) return;

    if (leadStage === "email") {
      const valid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmed);
      if (!valid) {
        setInputError("Please enter a valid email address.");
        return;
      }
    }

    setInputError("");
    const userMsg: Message = { id: `u-${crypto.randomUUID()}`, role: "user", content: trimmed, time: formatNow() };
    setMessages((m) => [...m, userMsg]);
    setInput("");
    setTyping(true);

    try {
      const res = await fetch("http://localhost:8000/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: trimmed,
          session_id: sessionId,
        }),
      });

      if (!res.ok) {
        throw new Error(`Request failed: ${res.status}`);
      }

      const data: ChatApiResponse = await res.json();
      if (typeof window !== "undefined") {
        window.localStorage.setItem("session_id", data.session_id);
      }
      setSessionId(data.session_id);
      setLeadStage(data.lead_stage);
      setLeadCaptured(data.lead_captured);

      const assistantMsg: Message = {
        id: `a-${crypto.randomUUID()}`,
        role: "assistant",
        intent: data.intent,
        content: data.response,
        time: formatNow(),
      };
      setMessages((m) => [...m, assistantMsg]);
    } catch {
      setMessages((m) => [
        ...m,
        {
          id: `a-${crypto.randomUUID()}`,
          role: "assistant",
          intent: "inquiry",
          content: "I couldn't reach AutoStream right now. Please try again in a moment.",
          time: formatNow(),
        },
      ]);
    } finally {
      setTyping(false);
    }
  };

  const placeholder =
    leadStage === "name"
      ? "Enter your name"
      : leadStage === "email"
        ? "Enter your email"
        : leadStage === "platform"
          ? "Select your platform"
          : "Ask about plans, pricing, or type get started";

  return (
    <div className="surface relative flex h-full flex-col overflow-hidden rounded-2xl">
      {/* Header */}
      <div className="relative flex items-center justify-between border-b border-border px-5 py-4">
        <div className="flex items-center gap-3">
          <div className="flex h-8 w-8 items-center justify-center rounded-md border border-border bg-[oklch(0.18_0.005_280)]">
            <Bot className="h-4 w-4 text-foreground" />
          </div>
          <div>
            <div className="text-sm font-semibold tracking-tight text-foreground">AutoStream AI Assistant</div>
            <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
              <span className="relative flex h-2 w-2">
                <span className="absolute inline-flex h-full w-full rounded-full bg-success opacity-60 animate-pulse-ring" />
                <span className="relative inline-flex h-2 w-2 rounded-full bg-success" />
              </span>
              Online · Avg reply 2s
            </div>
          </div>
        </div>
        <div className="flex items-center gap-1.5 rounded-full border border-border bg-[oklch(0.18_0.005_280)] px-2.5 py-1 text-[10px] uppercase tracking-[0.1em] text-muted-foreground">
          <Sparkles className="h-3 w-3 text-muted-foreground" />
          Live Agent API
        </div>
      </div>

      {/* Messages */}
      <div ref={scrollRef} className="relative flex-1 space-y-5 overflow-y-auto scrollbar-thin px-5 py-6">
        {messages.map((m) => (
          <div
            key={m.id}
            className={cn(
              "group flex animate-message-in gap-3",
              m.role === "user" ? "justify-end" : "justify-start",
            )}
          >
            {m.role === "assistant" && (
              <div className="mt-0.5 flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-md border border-border bg-[oklch(0.18_0.005_280)]">
                <Bot className="h-3.5 w-3.5 text-muted-foreground" />
              </div>
            )}
            <div className={cn("max-w-[78%]", m.role === "user" ? "items-end" : "items-start")}>
              {m.role === "assistant" && m.intent && (
                <div className="mb-1.5">
                  <IntentBadge intent={m.intent} />
                </div>
              )}

              <div
                className={cn(
                  "relative rounded-2xl px-4 py-2.5 text-sm leading-relaxed transition-all duration-200",
                  m.role === "user"
                    ? "rounded-br-md border border-[oklch(0.6_0.24_295)] bg-[oklch(0.58_0.24_295)] text-white shadow-[0_8px_24px_-8px_oklch(0.58_0.24_295/0.55)]"
                    : "rounded-bl-md border border-border bg-[oklch(0.21_0.012_285)] text-foreground hover:border-[oklch(0.34_0.008_280)]",
                )}
              >
                {/* Subtle agent accent line */}
                {m.role === "assistant" && (
                  <span className="absolute left-0 top-3 bottom-3 w-px rounded-full bg-[oklch(0.65_0.21_295/0.35)]" />
                )}
                <div className={m.role === "assistant" ? "pl-1 whitespace-pre-line" : ""}>{m.content}</div>
              </div>
              <div
                className={cn(
                  "mt-1.5 text-[10px] tracking-wide text-muted-foreground/70",
                  m.role === "user" ? "text-right" : "text-left",
                )}
              >
                {m.time}
              </div>
            </div>
          </div>
        ))}

        {typing && (
          <div className="flex animate-message-in gap-3">
            <div className="mt-0.5 flex h-7 w-7 items-center justify-center rounded-md border border-border bg-[oklch(0.18_0.005_280)]">
              <Bot className="h-3.5 w-3.5 text-muted-foreground" />
            </div>
            <div className="rounded-2xl rounded-bl-md border border-border bg-[oklch(0.17_0.005_280)] px-4 py-3">
              <div className="animate-typing flex items-end gap-1">
                <span />
                <span />
                <span />
              </div>
            </div>
          </div>
        )}

        {leadCaptured && (
          <div className="animate-message-in rounded-xl border border-success/30 bg-[oklch(0.17_0.02_160/0.4)] p-4">
            <div className="flex items-start gap-3">
              <CheckCircle2 className="mt-0.5 h-5 w-5 text-success" />
              <div>
                <div className="text-sm font-semibold text-foreground">Lead Captured</div>
                <div className="mt-1 text-sm text-muted-foreground">🎉 You're all set! Our team will reach out within 24 hours.</div>
              </div>
            </div>
          </div>
        )}
      </div>

      <form
        onSubmit={(e) => {
          e.preventDefault();
          send(input);
        }}
        className="px-5 pb-4"
      >
        <div className="surface-raised flex items-center gap-2 rounded-xl p-2">
          {leadStage === "platform" ? (
            <select
              value={input}
              onChange={(e) => setInput(e.target.value)}
              disabled={typing || !sessionId}
              className="flex-1 bg-transparent text-sm outline-none"
            >
              <option value="">Select platform</option>
              <option value="YouTube">YouTube</option>
              <option value="Instagram">Instagram</option>
              <option value="TikTok">TikTok</option>
              <option value="Other">Other</option>
            </select>
          ) : (
            <input
              value={input}
              type={leadStage === "email" ? "email" : "text"}
              onChange={(e) => {
                setInput(e.target.value);
                if (inputError) setInputError("");
              }}
              placeholder={placeholder}
              disabled={typing || !sessionId}
              className="flex-1 bg-transparent text-sm outline-none placeholder:text-muted-foreground/70"
            />
          )}

          <button
            type="submit"
            disabled={typing || !input.trim()}
            className="rounded-lg bg-violet-600 px-3 py-2 disabled:cursor-not-allowed disabled:opacity-40"
          >
            <Send className="h-4 w-4 text-white" />
          </button>
        </div>

        {inputError && <p className="mt-1 text-xs text-red-400">{inputError}</p>}

        <div className="mt-2 text-[10px] text-muted-foreground">
          Session: {sessionId ? `${sessionId.slice(0, 8)}...` : "initializing..."}
        </div>

        <div className="mt-2 flex flex-wrap gap-1.5">
          {["What's in Pro?", "Refund policy?", "I want Pro"].map((s) => (
            <button
              key={s}
              type="button"
              onClick={() => send(s)}
              className="hover-glow rounded-full border border-border bg-[oklch(0.17_0.005_280)] px-2.5 py-1 text-[11px] text-muted-foreground transition hover:text-foreground"
            >
              {s}
            </button>
          ))}
        </div>
      </form>
    </div>
  );
}
