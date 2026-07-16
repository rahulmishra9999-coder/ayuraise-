import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { BottomNav } from "@/components/BottomNav";
import { getSection } from "@/lib/sections";
import { getChronicConditions, getOrganHealth, getSeasonalDiseases, type DiseaseInfo } from "@/lib/diseases";
import { Sparkles, Bot, Stethoscope, Thermometer, ShieldCheck, Search, X } from "lucide-react";

export const Route = createFileRoute("/section/disease")({
  head: () => ({
    meta: [
      { title: "Disease Management · AyuRaise" },
      { name: "description", content: "Manage chronic conditions and seasonal illnesses with Ayurvedic protocols — pick a condition or build a personalized plan." },
    ],
  }),
  component: DiseaseHub,
});

function DiseaseHub() {
  const section = getSection("disease")!;
  const Icon = section.icon;
  const [q, setQ] = useState("");
  const match = (d: DiseaseInfo) =>
    d.name.toLowerCase().includes(q.toLowerCase()) || d.short.toLowerCase().includes(q.toLowerCase());
  const conditions = getChronicConditions().filter(match);
  const organs = getOrganHealth().filter(match);
  const seasonal = getSeasonalDiseases().filter(match);

  return (
    <div className="min-h-svh pb-32" style={{ background: "var(--gradient-hero)" }}>
      <div className="mx-auto max-w-xl px-5 pt-[max(1.5rem,env(safe-area-inset-top))]">
        <header className="flex items-start justify-between pt-2 animate-shimmer-in">
          <div>
            <p className="text-[13px] font-medium text-muted-foreground">Heal 🌿</p>
            <h1 className="mt-1 font-display text-[30px] font-extrabold leading-[1.12] tracking-tight text-foreground">
              Let's get you<br /><span className="gradient-text">feeling great.</span>
            </h1>
          </div>
          <div
            className="flex h-14 w-14 items-center justify-center rounded-[20px] text-primary-foreground shadow-[var(--shadow-tile)]"
            style={{ background: section.gradient }}
          >
            <Icon size={26} strokeWidth={1.7} />
          </div>
        </header>
        <p className="mt-3 max-w-md text-[13.5px] leading-relaxed text-muted-foreground animate-shimmer-in" style={{ animationDelay: "60ms" }}>
          {section.blurb}
        </p>
      </div>

      <div className="mx-auto mt-5 max-w-xl px-4">
        {/* Personalized plan bot CTA — always above the ready-made grids */}
        <Link
          to="/disease-bot"
          search={{ mode: "open" as const }}
          className="tile flex items-center gap-3 rounded-[26px] p-5 text-primary-foreground"
          style={{ background: "var(--gradient-night)" }}
        >
          <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-white/15">
            <Bot size={22} />
          </span>
          <div className="flex-1">
            <p className="font-display text-[15px] font-semibold">Create my plan</p>
            <p className="text-[12px] text-primary-foreground/85">A short chat — tell me your problem, upload reports, and I'll build the plan around you.</p>
          </div>
          <Sparkles size={18} />
        </Link>

        <p className="mt-3 px-1 text-center text-[11.5px] text-muted-foreground">
          …or start from a ready-made plan below
        </p>

        {/* Search */}
        <div className="mt-3 flex items-center gap-2 rounded-2xl bg-card px-3.5 py-2.5 ring-1 ring-border/60">
          <Search size={15} className="shrink-0 text-muted-foreground" />
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search: BP, acidity, knee, hair…"
            className="w-full bg-transparent text-[13.5px] text-foreground outline-none placeholder:text-muted-foreground"
          />
          {q && (
            <button onClick={() => setQ("")} className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-secondary text-muted-foreground">
              <X size={11} />
            </button>
          )}
        </div>

        {conditions.length > 0 && (
          <DiseaseGrid
            title="Chronic Conditions"
            hint="Conditions you can manage — or prevent — with food, herbs & practice."
            icon={<Stethoscope size={14} />}
            diseases={conditions}
          />
        )}

        {organs.length > 0 && (
          <DiseaseGrid
            title="Protect & Strengthen"
            hint="Keep every part of you strong — before anything starts."
            icon={<ShieldCheck size={14} />}
            diseases={organs}
          />
        )}

        {seasonal.length > 0 && (
          <DiseaseGrid
            title="Seasonal & Acute"
            hint="Short-term illness. Herbs, home remedies and recovery diet — fast relief."
            icon={<Thermometer size={14} />}
            diseases={seasonal}
          />
        )}

        {conditions.length + organs.length + seasonal.length === 0 && (
          <div className="mt-6 rounded-3xl bg-card p-6 text-center ring-1 ring-border/60">
            <p className="text-[14px] font-medium text-foreground">Nothing matches "{q}"</p>
            <p className="mt-1 text-[12px] text-muted-foreground">Try another word — or ask the bot above, it understands symptoms too.</p>
          </div>
        )}
      </div>

      <BottomNav />
    </div>
  );
}

function DiseaseGrid({
  title,
  hint,
  icon,
  diseases,
}: {
  title: string;
  hint: string;
  icon: React.ReactNode;
  diseases: DiseaseInfo[];
}) {
  return (
    <div className="surface mt-5 p-4">
      <div className="flex items-center gap-2 px-1">
        <span className="flex h-6 w-6 items-center justify-center rounded-lg bg-accent/60 text-primary">{icon}</span>
        <h2 className="font-display text-[13px] font-semibold uppercase tracking-wide text-foreground/80">{title}</h2>
      </div>
      <p className="px-1 pb-2.5 pt-1 text-[11.5px] leading-snug text-muted-foreground">{hint}</p>
      <ul className="grid grid-cols-4 gap-1.5">
        {diseases.map((d) => {
          const Icn = d.icon;
          const inner = (
            <>
              <span
                className="flex h-9 w-9 items-center justify-center rounded-xl text-primary-foreground ring-1 ring-white/25"
                style={{ background: d.gradient }}
              >
                <Icn size={15} strokeWidth={1.9} />
              </span>
              <span className="text-[10px] font-medium leading-tight text-foreground/85">{d.short}</span>
            </>
          );
          const cls = "flex h-full flex-col items-center gap-1.5 rounded-2xl bg-background/70 p-2 text-center ring-1 ring-border/50 transition-transform active:scale-[0.97]";
          return (
            <li key={d.slug}>
              {d.slug === "obesity" ? (
                // Obesity's real home is the full Weight Loss section — no duplicate page.
                <Link to="/section/weight-loss" className={cls}>{inner}</Link>
              ) : (
                <Link to="/disease/$slug" params={{ slug: d.slug }} className={cls}>{inner}</Link>
              )}
            </li>
          );
        })}
      </ul>
    </div>
  );
}
