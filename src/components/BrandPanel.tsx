import { Film, Sparkles, Zap, Captions, ArrowUpRight, Check } from "lucide-react";

const pills = [
  { icon: Film, label: "4K Auto-editing" },
  { icon: Captions, label: "AI Captions" },
  { icon: Zap, label: "Unlimited renders" },
];

const proFeatures = ["Unlimited videos", "4K + AI captions", "24/7 priority support"];

export function BrandPanel() {
  return (
    <div className="surface relative h-full overflow-hidden rounded-2xl">
      <div className="pointer-events-none absolute inset-0 bg-grid-faint opacity-50" />

      <div className="relative flex h-full flex-col justify-between p-8">
        {/* Brand mark */}
        <div>
          <div className="flex items-center gap-2.5">
            <div className="flex h-8 w-8 items-center justify-center rounded-md border border-border bg-[oklch(0.18_0.005_280)]">
              <Film className="h-4 w-4 text-foreground" />
            </div>
            <span className="text-[15px] font-semibold tracking-tight text-foreground">
              AutoStream
            </span>
            <span className="ml-auto inline-flex items-center gap-1.5 rounded-full border border-border bg-[oklch(0.18_0.005_280)] px-2 py-0.5 text-[10px] font-medium text-muted-foreground">
              <span className="h-1.5 w-1.5 rounded-full bg-success" />
              v2.4
            </span>
          </div>

          {/* Headline */}
          <h1 className="mt-14 text-[2.5rem] font-semibold leading-[1.05] tracking-[-0.03em] text-foreground">
            Turn conversations
            <br />
            into{" "}
            <span className="relative inline-block text-[oklch(0.78_0.16_295)]">
              conversions
              <span
                className="absolute -bottom-1 left-0 h-[3px] w-full rounded-full bg-primary"
                style={{ boxShadow: "0 0 12px oklch(0.65 0.21 295 / 0.7)" }}
              />
            </span>
            .
          </h1>
          <p className="mt-5 max-w-md text-[15px] leading-relaxed text-muted-foreground">
            AI-powered video editing for creators. Drop your footage — get a polished cut with captions, cuts, and 4K rendering in minutes.
          </p>

          {/* Feature pills */}
          <div className="mt-8 flex flex-wrap gap-2">
            {pills.map((p, i) => (
              <div
                key={p.label}
                className="hover-glow lift flex items-center gap-1.5 rounded-full border border-border bg-[oklch(0.17_0.005_280)] px-3 py-1.5 text-xs text-foreground/85 animate-message-in"
                style={{ animationDelay: `${i * 0.08}s` }}
              >
                <p.icon className="h-3.5 w-3.5 text-muted-foreground" />
                {p.label}
              </div>
            ))}
          </div>
        </div>

        {/* Pricing */}
        <div className="mt-8 grid grid-cols-2 gap-3">
          {/* Basic */}
          <div className="hover-glow lift rounded-xl border border-border bg-[oklch(0.155_0.006_280)] p-4">
            <div className="flex items-center justify-between">
              <span className="text-[10px] uppercase tracking-[0.12em] text-muted-foreground">Basic</span>
              <ArrowUpRight className="h-3.5 w-3.5 text-muted-foreground/60" />
            </div>
            <div className="mt-2 text-[1.75rem] font-semibold tracking-tight text-foreground">
              $29<span className="ml-0.5 text-xs font-normal text-muted-foreground">/mo</span>
            </div>
            <ul className="mt-3 space-y-1.5 text-xs text-muted-foreground">
              <li>10 videos / month</li>
              <li>720p export</li>
            </ul>
          </div>

          {/* Pro — slightly brighter surface, thin violet border, hover glow */}
          <div className="hover-glow lift rounded-xl border border-[oklch(0.65_0.21_295/0.4)] bg-[oklch(0.18_0.008_285)] p-4">
            <div className="flex items-center justify-between">
              <span className="text-[10px] uppercase tracking-[0.12em] text-foreground">Pro</span>
              <span className="inline-flex items-center gap-1 rounded-full border border-[oklch(0.65_0.21_295/0.4)] px-1.5 py-0.5 text-[9px] font-medium text-[oklch(0.78_0.16_295)]">
                <Sparkles className="h-2.5 w-2.5" />
                Popular
              </span>
            </div>
            <div className="mt-2 text-[1.75rem] font-semibold tracking-tight text-foreground">
              $79<span className="ml-0.5 text-xs font-normal text-muted-foreground">/mo</span>
            </div>
            <ul className="mt-3 space-y-1.5 text-xs text-muted-foreground">
              {proFeatures.map((f, i) => (
                <li key={f} className={i === 0 ? "flex items-center gap-1.5 text-foreground/90" : "flex items-center gap-1.5"}>
                  <Check className="h-3 w-3 text-[oklch(0.78_0.16_295)]" />
                  {f}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
