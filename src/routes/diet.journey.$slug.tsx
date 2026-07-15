import { createFileRoute, Link, notFound, useRouter } from "@tanstack/react-router";
import { useState } from "react";
import {
  ArrowLeft, Sparkles, Check, X, ChevronDown, ChevronLeft, ChevronRight,
  Clock, Award, Leaf, Sun, Moon, Utensils, Coffee, Droplet, Snowflake, CloudRain,
  BookOpen, Volume2, Play, Hourglass,
} from "lucide-react";
import { BottomNav } from "@/components/BottomNav";
import { getJourney, type Journey, type FlashLesson } from "@/lib/nutrition-journeys";

export const Route = createFileRoute("/diet/journey/$slug")({
  loader: ({ params }) => {
    const j = getJourney(params.slug);
    if (!j) throw notFound();
    return { slug: j.slug };
  },
  head: ({ params }) => {
    const j = params ? getJourney(params.slug) : undefined;
    return {
      meta: j ? [
        { title: `${j.title} · Nutrition Journey · AyuRaise` },
        { name: "description", content: j.short },
      ] : [],
    };
  },
  component: JourneyPage,
  notFoundComponent: () => (
    <div className="flex min-h-svh items-center justify-center p-6 text-center">
      <div>
        <h1 className="font-display text-2xl">Journey not found</h1>
        <Link to="/section/diet" className="mt-3 inline-block text-primary underline">Back to Diet</Link>
      </div>
    </div>
  ),
  errorComponent: ({ reset }) => {
    const router = useRouter();
    return (
      <div className="flex min-h-svh items-center justify-center p-6 text-center">
        <div>
          <h1 className="font-display text-2xl">Something went wrong</h1>
          <button onClick={() => { router.invalidate(); reset(); }} className="mt-3 rounded-full bg-primary px-4 py-2 text-sm text-primary-foreground">Try again</button>
        </div>
      </div>
    );
  },
});

function JourneyPage() {
  const { slug } = Route.useLoaderData();
  const j = getJourney(slug)!;

  return (
    <div className="min-h-svh pb-28" style={{ background: "var(--gradient-hero)" }}>
      {/* Header hero */}
      <div className="relative px-5 pb-8 pt-[max(1rem,env(safe-area-inset-top))]" style={{ background: j.gradient }}>
        <Link
          to="/section/diet"
          className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-card/40 text-primary-foreground backdrop-blur-sm"
          aria-label="Back"
        >
          <ArrowLeft size={18} />
        </Link>
        <div className="mt-6 flex items-center gap-4">
          <div className="flex h-20 w-20 items-center justify-center rounded-3xl bg-card/30 text-5xl backdrop-blur-sm">
            {j.emoji}
          </div>
          <div className="min-w-0">
            <p className="text-[11px] uppercase tracking-[0.2em] text-primary-foreground/80">Nutrition Journey</p>
            <h1 className="font-display text-2xl font-semibold leading-tight text-primary-foreground">{j.title}</h1>
            <p className="mt-1 text-[12px] text-primary-foreground/90">Best for · {j.bestFor}</p>
          </div>
        </div>

        <div className="mt-4 flex flex-wrap gap-2">
          <Chip icon={<Award size={11} />} label={j.difficulty} />
          <Chip icon={<Clock size={11} />} label={j.content.duration} />
          <Chip icon={<Leaf size={11} />} label={j.content.evidence} />
        </div>
      </div>

      <div className="mx-auto -mt-5 max-w-xl px-5">
        {/* Benefits */}
        <div className="rounded-3xl bg-card p-4 shadow-[var(--shadow-soft)] ring-1 ring-border/60">
          <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-primary">Benefits</p>
          <ul className="mt-2 space-y-1.5">
            {j.content.benefits.map((b) => (
              <li key={b} className="flex items-start gap-2 text-sm">
                <span className="mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-accent/40 text-primary">
                  <Check size={10} strokeWidth={3} />
                </span>
                {b}
              </li>
            ))}
          </ul>
        </div>

        <AICTA compact />

        {/* Section 1 — Learn */}
        <SectionHeader n={1} title="Learn Before You Start" subtitle="60-second interactive lessons." />
        <FlashDeck lessons={j.content.lessons} />

        {/* Section 2 — Principles */}
        <SectionHeader n={2} title="Nutrition Principles" />
        <div className="grid grid-cols-2 gap-3">
          <PrinciplesCard title="Eat more" tone="good" items={j.content.principles.eat} />
          <PrinciplesCard title="Avoid" tone="bad" items={j.content.principles.avoid} />
        </div>

        {/* Section 3 — North star foods */}
        <SectionHeader n={3} title="North Star Foods" />
        <div className="-mx-5 overflow-x-auto px-5">
          <div className="flex snap-x snap-mandatory gap-3 pb-2">
            {j.content.northStar.map((f) => (
              <div key={f.name} className="w-40 shrink-0 snap-start rounded-3xl bg-card p-4 shadow-[var(--shadow-soft)] ring-1 ring-border/60">
                <div className="flex h-16 items-center justify-center rounded-2xl text-4xl" style={{ background: "var(--gradient-sage)" }}>
                  {f.emoji}
                </div>
                <p className="mt-2 font-display text-sm font-semibold">{f.name}</p>
                <p className="mt-0.5 text-[11px] text-muted-foreground">{f.benefit}</p>
                {f.frequency && <p className="mt-1 text-[10px] uppercase tracking-wider text-primary/80">{f.frequency}</p>}
              </div>
            ))}
          </div>
        </div>

        {/* Section 4 — Daily framework */}
        <SectionHeader n={4} title="Daily Nutrition Framework" subtitle="Meal phases, not clock times." />
        <div className="space-y-3">
          <PhaseCard icon={<Droplet size={16} />} title="Morning · Hydration" items={j.content.meals.hydration} />
          <MealOptionsCard icon={<Sun size={16} />} title="Breakfast" options={j.content.meals.breakfast} />
          <PhaseCard icon={<Coffee size={16} />} title="Mini Morning Meal" items={j.content.meals.miniMorning} optional />
          <PhaseCard icon={<Utensils size={16} />} title="Lunch — Balanced Plate" items={j.content.meals.lunch} note="Largest meal, agni is strongest." />
          <PhaseCard icon={<Leaf size={16} />} title="Evening Snack" items={j.content.meals.evening} />
          <PhaseCard icon={<Moon size={16} />} title="Dinner — Light Meal" items={j.content.meals.dinner} note="Before sunset when possible." />
          <PhaseCard icon={<Droplet size={16} />} title="Water Target" items={[j.content.meals.water]} />
        </div>

        {/* Section 5 — Seasonal */}
        <SectionHeader n={5} title="Seasonal Recommendations" />
        <div className="grid grid-cols-1 gap-3">
          <SeasonCard icon={<Sun size={16} />} name="Summer" eat={j.content.seasonal.summer.eat} reduce={j.content.seasonal.summer.reduce} />
          <SeasonCard icon={<Snowflake size={16} />} name="Winter" eat={j.content.seasonal.winter.eat} reduce={j.content.seasonal.winter.reduce} />
          <SeasonCard icon={<CloudRain size={16} />} name="Monsoon" eat={j.content.seasonal.monsoon.eat} reduce={j.content.seasonal.monsoon.reduce} />
        </div>

        {/* Section 6 — Lifestyle */}
        <SectionHeader n={6} title="Lifestyle Tips" />
        <div className="rounded-3xl bg-card p-4 ring-1 ring-border/60 shadow-[var(--shadow-soft)]">
          <ul className="space-y-2">
            {j.content.lifestyle.map((l) => (
              <li key={l} className="flex items-start gap-2 text-sm">
                <span className="mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-accent/40 text-primary">
                  <Check size={10} strokeWidth={3} />
                </span>
                {l}
              </li>
            ))}
          </ul>
        </div>

        {/* Section 7 — IF */}
        <SectionHeader n={7} title="Intermittent Fasting" />
        <FastingCard j={j} />

        {/* Section 8 — Ayurveda */}
        <SectionHeader n={8} title="Ayurveda Recommendations" />
        <div className="rounded-3xl p-4 ring-1 ring-border/60 shadow-[var(--shadow-soft)]" style={{ background: "var(--gradient-leaf)" }}>
          <ul className="space-y-2">
            {j.content.ayurveda.map((a) => (
              <li key={a} className="flex items-start gap-2 text-sm text-primary-foreground">
                <span className="mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-card/30 text-primary-foreground">
                  <Check size={10} strokeWidth={3} />
                </span>
                {a}
              </li>
            ))}
          </ul>
        </div>

        {/* Section 9 — Big AI CTA */}
        <div className="mt-8">
          <AICTA />
        </div>
      </div>

      <BottomNav />
    </div>
  );
}

/* ---------------- small components ---------------- */

function Chip({ icon, label }: { icon: React.ReactNode; label: string }) {
  return (
    <span className="inline-flex items-center gap-1 rounded-full bg-card/30 px-2.5 py-1 text-[11px] font-semibold text-primary-foreground backdrop-blur-sm">
      {icon} {label}
    </span>
  );
}

function SectionHeader({ n, title, subtitle }: { n: number; title: string; subtitle?: string }) {
  return (
    <div className="mb-3 mt-7">
      <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-primary/70">Section {n}</p>
      <h2 className="font-display text-xl font-semibold">{title}</h2>
      {subtitle && <p className="mt-0.5 text-xs text-muted-foreground">{subtitle}</p>}
    </div>
  );
}

function FlashDeck({ lessons }: { lessons: FlashLesson[] }) {
  const [i, setI] = useState(0);
  const [flipped, setFlipped] = useState(false);
  const l = lessons[i];
  const go = (d: number) => {
    setFlipped(false);
    setI((prev) => (prev + d + lessons.length) % lessons.length);
  };
  return (
    <div>
      <button
        onClick={() => setFlipped((f) => !f)}
        className="relative flex min-h-[180px] w-full flex-col items-start justify-between overflow-hidden rounded-3xl p-5 text-left shadow-[var(--shadow-soft)] ring-1 ring-border/60 transition-all active:scale-[0.99]"
        style={{ background: "var(--gradient-dawn)" }}
      >
        <div className="flex w-full items-center justify-between">
          <span className="text-4xl">{l.emoji ?? "📖"}</span>
          <span className="rounded-full bg-white/40 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-foreground backdrop-blur-sm">
            {i + 1} / {lessons.length}
          </span>
        </div>
        <div className="mt-3 w-full">
          <h3 className="font-display text-lg font-semibold text-foreground">{l.title}</h3>
          <p className="mt-2 text-[13px] leading-relaxed text-foreground/80">
            {flipped ? l.body : "Tap to reveal · 30–60 sec"}
          </p>
        </div>
      </button>
      <div className="mt-2 flex items-center justify-between">
        <button onClick={() => go(-1)} className="flex h-9 w-9 items-center justify-center rounded-full bg-card ring-1 ring-border/60"><ChevronLeft size={16} /></button>
        <div className="flex items-center gap-3 text-[11px] text-muted-foreground">
          <span className="inline-flex items-center gap-1"><Volume2 size={12} /> AI audio</span>
          <span className="inline-flex items-center gap-1"><Play size={12} /> AI video</span>
        </div>
        <button onClick={() => go(1)} className="flex h-9 w-9 items-center justify-center rounded-full bg-card ring-1 ring-border/60"><ChevronRight size={16} /></button>
      </div>
    </div>
  );
}

function PrinciplesCard({ title, tone, items }: { title: string; tone: "good" | "bad"; items: string[] }) {
  return (
    <div className={`rounded-3xl p-4 ring-1 shadow-[var(--shadow-soft)] ${tone === "good" ? "bg-accent/20 ring-accent/40" : "bg-destructive/5 ring-destructive/20"}`}>
      <p className={`text-[11px] font-bold uppercase tracking-[0.2em] ${tone === "good" ? "text-primary" : "text-destructive"}`}>{title}</p>
      <ul className="mt-2 space-y-1.5">
        {items.map((x) => (
          <li key={x} className="flex items-start gap-2 text-[13px]">
            <span className={`mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded-full ${tone === "good" ? "bg-primary text-primary-foreground" : "bg-destructive/80 text-destructive-foreground"}`}>
              {tone === "good" ? <Check size={10} strokeWidth={3} /> : <X size={10} strokeWidth={3} />}
            </span>
            {x}
          </li>
        ))}
      </ul>
    </div>
  );
}

function PhaseCard({ icon, title, items, note, optional }: { icon: React.ReactNode; title: string; items: string[]; note?: string; optional?: boolean }) {
  const [open, setOpen] = useState(true);
  return (
    <div className="overflow-hidden rounded-3xl bg-card ring-1 ring-border/60 shadow-[var(--shadow-soft)]">
      <button onClick={() => setOpen((o) => !o)} className="flex w-full items-center justify-between gap-3 p-4">
        <div className="flex items-center gap-2.5">
          <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-accent/30 text-primary">{icon}</span>
          <div className="text-left">
            <h3 className="font-display text-[15px] font-semibold">{title}</h3>
            {optional && <p className="text-[10px] uppercase tracking-wider text-muted-foreground">Optional</p>}
          </div>
        </div>
        <ChevronDown size={16} className={`text-muted-foreground transition-transform ${open ? "rotate-180" : ""}`} />
      </button>
      {open && (
        <div className="border-t border-border/60 px-4 py-3">
          <ul className="space-y-1.5">
            {items.map((it) => (
              <li key={it} className="flex items-start gap-2 text-[13px]">
                <span className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-primary/60" />
                {it}
              </li>
            ))}
          </ul>
          {note && <p className="mt-2 text-[11px] italic text-muted-foreground">{note}</p>}
        </div>
      )}
    </div>
  );
}

function MealOptionsCard({ icon, title, options }: { icon: React.ReactNode; title: string; options: { name: string; emoji: string; desc: string }[] }) {
  return (
    <div className="overflow-hidden rounded-3xl bg-card ring-1 ring-border/60 shadow-[var(--shadow-soft)]">
      <div className="flex items-center gap-2.5 p-4">
        <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-accent/30 text-primary">{icon}</span>
        <h3 className="font-display text-[15px] font-semibold">{title}</h3>
        <span className="ml-auto text-[10px] uppercase tracking-wider text-muted-foreground">{options.length} options</span>
      </div>
      <div className="-mx-1 overflow-x-auto px-4 pb-4">
        <div className="flex snap-x snap-mandatory gap-3">
          {options.map((o) => (
            <div key={o.name} className="w-36 shrink-0 snap-start rounded-2xl bg-secondary/50 p-3 ring-1 ring-border/60">
              <div className="flex h-14 items-center justify-center rounded-xl text-3xl" style={{ background: "var(--gradient-dawn)" }}>{o.emoji}</div>
              <p className="mt-2 text-[13px] font-semibold leading-tight">{o.name}</p>
              <p className="mt-0.5 text-[11px] text-muted-foreground">{o.desc}</p>
              <button className="mt-2 w-full rounded-lg bg-primary/10 py-1 text-[11px] font-semibold text-primary">Recipe</button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function SeasonCard({ icon, name, eat, reduce }: { icon: React.ReactNode; name: string; eat: string[]; reduce: string[] }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="overflow-hidden rounded-3xl bg-card ring-1 ring-border/60 shadow-[var(--shadow-soft)]">
      <button onClick={() => setOpen((o) => !o)} className="flex w-full items-center justify-between gap-3 p-4">
        <div className="flex items-center gap-2.5">
          <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-accent/30 text-primary">{icon}</span>
          <h3 className="font-display text-[15px] font-semibold">{name}</h3>
        </div>
        <ChevronDown size={16} className={`text-muted-foreground transition-transform ${open ? "rotate-180" : ""}`} />
      </button>
      {open && (
        <div className="grid grid-cols-2 gap-3 border-t border-border/60 p-4">
          <div>
            <p className="text-[10px] font-bold uppercase tracking-wider text-primary">Eat</p>
            <ul className="mt-1 space-y-1">
              {eat.map((x) => <li key={x} className="text-[12px]">• {x}</li>)}
            </ul>
          </div>
          <div>
            <p className="text-[10px] font-bold uppercase tracking-wider text-destructive">Reduce</p>
            <ul className="mt-1 space-y-1">
              {reduce.map((x) => <li key={x} className="text-[12px]">• {x}</li>)}
            </ul>
          </div>
        </div>
      )}
    </div>
  );
}

function FastingCard({ j }: { j: Journey }) {
  const f = j.content.fasting;
  return (
    <div className="rounded-3xl bg-card p-4 ring-1 ring-border/60 shadow-[var(--shadow-soft)]">
      <div className="flex items-center gap-2 text-primary">
        <Hourglass size={16} />
        <h3 className="font-display text-[15px] font-semibold text-foreground">Try intermittent fasting</h3>
      </div>
      <div className="mt-3 grid grid-cols-3 gap-2">
        {(["12:12", "14:10", "16:8"] as const).map((w) => (
          <div key={w} className={`rounded-2xl p-3 text-center ring-1 ${f.recommended === w ? "bg-primary text-primary-foreground ring-primary" : "bg-secondary/40 ring-border/60"}`}>
            <p className="text-sm font-bold">{w}</p>
            <p className={`mt-0.5 text-[10px] ${f.recommended === w ? "text-primary-foreground/80" : "text-muted-foreground"}`}>
              {w === "12:12" ? "Gentle" : w === "14:10" ? "Balanced" : "Focused"}
            </p>
          </div>
        ))}
      </div>
      <div className="mt-3 grid grid-cols-2 gap-3 text-[12px]">
        <div>
          <p className="text-[10px] font-bold uppercase tracking-wider text-primary">Benefits</p>
          <ul className="mt-1 space-y-0.5">{f.benefits.map((b) => <li key={b}>• {b}</li>)}</ul>
        </div>
        <div>
          <p className="text-[10px] font-bold uppercase tracking-wider text-destructive">Avoid if</p>
          <ul className="mt-1 space-y-0.5">{f.avoid.map((b) => <li key={b}>• {b}</li>)}</ul>
        </div>
      </div>
      <Link
        to="/section/fasting"
        className="mt-3 inline-flex items-center gap-1 text-[12px] font-semibold text-primary"
      >
        Explore Intermittent Fasting <ChevronRight size={12} />
      </Link>
    </div>
  );
}

function AICTA({ compact = false }: { compact?: boolean }) {
  return (
    <div className={`${compact ? "mt-4" : "mt-6"} relative overflow-hidden rounded-[28px] p-6 shadow-[var(--shadow-glow)]`} style={{ background: "var(--gradient-gold)" }}>
      <div className="absolute -right-10 -top-10 h-40 w-40 rounded-full bg-white/25 blur-2xl" />
      <div className="relative">
        <div className="inline-flex items-center gap-1.5 rounded-full bg-white/25 px-3 py-1 text-[10px] font-bold uppercase tracking-widest text-foreground backdrop-blur-sm">
          <Sparkles size={11} /> Customize with AI
        </div>
        <h3 className="mt-3 font-display text-xl font-semibold leading-tight text-foreground">
          Make this journey truly yours.
        </h3>
        {!compact && (
          <p className="mt-2 text-[13px] leading-relaxed text-foreground/80">
            AI personalizes goals, diseases, food preference, calories, meal timings, recipes, portions, prakriti, budget and cooking time.
          </p>
        )}
        <Link
          to="/combined-plan"
          search={{ goal: "diet" as const }}
          className="mt-4 inline-flex items-center gap-2 rounded-2xl bg-foreground px-5 py-3 text-sm font-semibold text-background shadow-lg transition-transform active:scale-[0.98]"
        >
          <Sparkles size={16} /> Personalize with AI
        </Link>
      </div>
    </div>
  );
}
