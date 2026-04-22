import { createFileRoute } from "@tanstack/react-router";
import { BrandPanel } from "@/components/BrandPanel";
import { ChatPanel } from "@/components/ChatPanel";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "AutoStream — AI-powered video editing for creators" },
      {
        name: "description",
        content:
          "AutoStream turns raw footage into polished 4K videos with AI captions and unlimited renders. Chat with our AI assistant to get started.",
      },
      { property: "og:title", content: "AutoStream — AI video editing that converts" },
      {
        property: "og:description",
        content: "Talk to our AI assistant and get set up on Pro in under a minute.",
      },
    ],
  }),
  component: Index,
});

function Index() {
  return (
    <main className="app-bg relative min-h-screen overflow-hidden">
      <div
        className="pointer-events-none absolute inset-x-0 top-0 h-px bg-primary/70"
        style={{ boxShadow: "0 0 18px 2px oklch(0.65 0.21 295 / 0.55)" }}
      />
      <div className="pointer-events-none absolute inset-0 bg-grid-faint" />
      <div className="relative mx-auto grid h-screen max-w-[1500px] grid-cols-1 gap-4 p-3 md:h-screen md:grid-cols-5 md:gap-5 md:p-5">
        <div className="md:col-span-2">
          <BrandPanel />
        </div>
        <div className="min-h-[600px] md:col-span-3">
          <ChatPanel />
        </div>
      </div>
    </main>
  );
}
