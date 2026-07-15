import { Link } from "@tanstack/react-router";
import { useState } from "react";
import { Stethoscope, Scale, Salad, Sparkles, ChevronRight } from "lucide-react";

type TabKey = "disease" | "weight" | "diet";

const TABS: { key: TabKey; label: string; icon: typeof Stethoscope; gradient: string }[] = [
  { key: "disease", label: "Disease Mgmt.", icon: Stethoscope, gradient: "var(--gradient-clay)" },
  { key: "weight", label: "Weight Loss & Gain", icon: Scale, gradient: "var(--gradient-gold)" },
  { key: "diet", label: "Ayurvedic Diet", icon: Salad, gradient: "var(--gradient-sage)" },
];

const CONTENT: Record<TabKey, { title: string; blurb: string; points: string[] }> = {
  disease: {
    title: "Reverse & manage chronic conditions",
    blurb:
      "Ayurvedic protocols for diabetes, hypertension, PCOS, thyroid, IBS and more — combining diet, IF, detox & yoga tuned to your dosha.",
    points: [
      "Condition-specific diet & herbs",
      "Restricted eating that fits your disease",
      "Gentle detox + yoga adapted to your body",
    ],
  },
  weight: {
    title: "Lose or gain weight, sustainably",
    blurb:
      "No crash diets. Set a target and a pace (0.1–1 kg/week). We blend diet, IF, yoga & exercise so the math works with your life.",
    points: [
      "Pace tracker 0.1 → 1 kg / week",
      "Calorie math from BMR + activity + yoga burn",
      "Diet plan tuned to your prakriti",
    ],
  },
  diet: {
    title: "Eat for your prakriti & the season",
    blurb:
      "A clean Ayurvedic diet plan based on your dosha and the current ritu (season) — with optional IF and detox layered in.",
    points: [
      "Prakriti + ritucharya based meals",
      "Optional IF windows (12:12 → 20:4)",
      "Optional seasonal detox (3 / 5 / 7 day)",
    ],
  },
};

export function CombinedTabsCard() {
  const [tab, setTab] = useState<TabKey>("disease");
  const c = CONTENT[tab];
  const active = TABS.find((t) => t.key === tab)!;

  return (
    <section className="rounded-3xl bg-card/80 p-4 shadow-[var(--shadow-soft)] ring-1 ring-border/60 backdrop-blur-sm">
      {/* CTA at top */}
      <Link
        to="/combined-plan"
        className="flex items-center gap-3 rounded-2xl p-3 text-primary-foreground shadow-[0_8px_22px_-12px_rgba(0,0,0,0.35)] ring-1 ring-white/20"
        style={{ background: "var(--gradient-night)" }}
      >
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white/15 ring-1 ring-white/25 backdrop-blur-sm">
          <Sparkles size={18} />
        </div>
        <div className="flex-1">
          <p className="text-[10px] font-semibold uppercase tracking-[0.2em] opacity-75">All-in-one</p>
          <p className="font-display text-sm font-semibold leading-tight">
            Create my personalized Weight, Disease & Diet plan
          </p>
        </div>
        <ChevronRight size={18} className="opacity-80" />
      </Link>

      {/* Tabs */}
      <div className="mt-4 grid grid-cols-3 gap-1.5 rounded-full bg-muted/70 p-1 ring-1 ring-border/60">
        {TABS.map((t) => {
          const isActive = t.key === tab;
          return (
            <button
              key={t.key}
              onClick={() => setTab(t.key)}
              className={`rounded-full px-2 py-1.5 text-[11px] font-semibold leading-tight transition-all ${
                isActive
                  ? "text-primary-foreground shadow-[0_6px_14px_-8px_rgba(0,0,0,0.4)]"
                  : "text-muted-foreground"
              }`}
              style={isActive ? { background: t.gradient } : undefined}
            >
              {t.label}
            </button>
          );
        })}
      </div>

      {/* Tab body */}
      <div className="mt-4 flex gap-3">
        <div
          className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl text-primary-foreground ring-1 ring-white/25"
          style={{ background: active.gradient }}
        >
          <active.icon size={20} strokeWidth={1.7} />
        </div>
        <div className="flex-1">
          <p className="font-display text-[15px] font-semibold leading-tight text-foreground">
            {c.title}
          </p>
          <p className="mt-1 text-[12.5px] leading-relaxed text-muted-foreground">{c.blurb}</p>
          <ul className="mt-2 space-y-1">
            {c.points.map((p) => (
              <li
                key={p}
                className="flex items-start gap-2 text-[12px] leading-snug text-foreground/85"
              >
                <span
                  className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full"
                  style={{ background: active.gradient }}
                />
                {p}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}
