import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowLeft, Sparkles, GraduationCap, BookOpen, ChevronRight, Salad } from "lucide-react";
import { BottomNav } from "@/components/BottomNav";
import { JOURNEYS } from "@/lib/nutrition-journeys";
import { DiseasePipelineBanner, DiseasePipelineNext } from "@/components/DiseasePipeline";

export const Route = createFileRoute("/section/diet")({
  head: () => ({
    meta: [
      { title: "Diet · AyuRaise" },
      { name: "description", content: "Premium AI-personalized nutrition and ready-made nutrition journeys rooted in Ayurveda." },
    ],
  }),
  component: DietHome,
});

function DietHome() {
  return (
    <div className="min-h-svh pb-28" style={{ background: "var(--gradient-hero)" }}>
      <div className="mx-auto max-w-xl px-5 pt-[max(1rem,env(safe-area-inset-top))]">
        {/* Top bar */}
        <div className="flex items-center justify-between pt-1">
          <Link
            to="/home"
            className="flex h-10 w-10 items-center justify-center rounded-full bg-card shadow-[var(--shadow-soft)] ring-1 ring-border/60"
            aria-label="Back"
          >
            <ArrowLeft size={18} />
          </Link>
          <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-muted-foreground">Diet</p>
          <div className="w-10" />
        </div>

        <DiseasePipelineBanner currentSlug="diet" />

        {/* Hero */}
        <section className="mt-4 overflow-hidden rounded-[28px] p-6 text-primary-foreground shadow-[var(--shadow-soft)]" style={{ background: "var(--gradient-sage)" }}>
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-card/25 backdrop-blur-sm">
              <Salad size={22} strokeWidth={1.7} />
            </div>
            <div>
              <p className="text-[11px] uppercase tracking-[0.2em] text-primary-foreground/80">Nutrition</p>
              <h1 className="font-display text-2xl font-semibold leading-tight">Your food, your medicine.</h1>
            </div>
          </div>
          <p className="mt-3 text-sm leading-relaxed text-primary-foreground/90">
            Choose a ready-made nutrition journey, learn the science, or let AI craft a plan for your body and life.
          </p>
        </section>

        {/* 1. AI Personalized */}
        <PrimaryAICard />

        {/* 2. Ready-made journeys */}
        <section className="mt-8">
          <div className="mb-3 flex items-end justify-between">
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-primary">Ready-made</p>
              <h2 className="font-display text-xl font-semibold">Nutrition Journeys</h2>
            </div>
            <p className="text-[11px] text-muted-foreground">{JOURNEYS.length} journeys</p>
          </div>
          <div className="grid grid-cols-2 gap-3">
            {JOURNEYS.map((j) => (
              <Link
                key={j.slug}
                to="/diet/journey/$slug"
                params={{ slug: j.slug }}
                className="group flex flex-col overflow-hidden rounded-3xl bg-card ring-1 ring-border/60 shadow-[var(--shadow-soft)] transition-transform active:scale-[0.98]"
              >
                <div
                  className="flex h-24 items-center justify-center text-4xl"
                  style={{ background: j.gradient }}
                >
                  <span className="drop-shadow-sm">{j.emoji}</span>
                </div>
                <div className="flex flex-1 flex-col p-3">
                  <h3 className="font-display text-[15px] font-semibold leading-tight">{j.title}</h3>
                  <p className="mt-1 line-clamp-2 text-[11px] text-muted-foreground">{j.short}</p>
                  <div className="mt-2 flex items-center gap-1.5">
                    <span className="rounded-full bg-accent/30 px-2 py-0.5 text-[10px] font-semibold text-primary">
                      {j.difficulty}
                    </span>
                  </div>
                  <p className="mt-2 line-clamp-1 text-[10px] uppercase tracking-wider text-muted-foreground">
                    Best for · {j.bestFor}
                  </p>
                  <div className="mt-2 flex items-center gap-1 text-[11px] font-semibold text-primary">
                    View journey <ChevronRight size={12} />
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </section>

        {/* 3. Nutrition Academy */}
        <section className="mt-8">
          <div className="mb-3">
            <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-primary">Learn</p>
            <h2 className="font-display text-xl font-semibold">Nutrition Academy</h2>
          </div>
          <Link
            to="/diet/academy"
            className="flex items-center gap-4 rounded-3xl bg-card p-5 ring-1 ring-border/60 shadow-[var(--shadow-soft)] transition-transform active:scale-[0.98]"
          >
            <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl" style={{ background: "var(--gradient-violet)" }}>
              <GraduationCap size={26} className="text-primary-foreground" strokeWidth={1.7} />
            </div>
            <div className="min-w-0 flex-1">
              <h3 className="font-display text-base font-semibold">Flash cards, tutorials, myths</h3>
              <p className="mt-0.5 text-xs text-muted-foreground">
                60-second lessons, science explained, Ayurveda demystified.
              </p>
            </div>
            <ChevronRight size={18} className="text-muted-foreground" />
          </Link>

          {/* Quick topic chips */}
          <div className="mt-3 flex flex-wrap gap-2">
            {[
              "Nutrition Myths",
              "Science Explained",
              "Ayurveda Explained",
              "Seasonal Nutrition",
              "Healthy Habits",
            ].map((t) => (
              <Link
                key={t}
                to="/diet/academy"
                className="rounded-full bg-card px-3 py-1.5 text-[11px] font-semibold text-foreground/80 ring-1 ring-border/60"
              >
                <BookOpen size={11} className="mr-1 inline" />
                {t}
              </Link>
            ))}
          </div>
        </section>

        <DiseasePipelineNext currentSlug="diet" />
      </div>

      <BottomNav />
    </div>
  );
}

function PrimaryAICard() {
  return (
    <section className="mt-5">
      <div className="relative overflow-hidden rounded-[28px] p-6 shadow-[var(--shadow-glow)]" style={{ background: "var(--gradient-gold)" }}>
        <div className="absolute -right-8 -top-8 h-40 w-40 rounded-full bg-white/20 blur-2xl" />
        <div className="relative">
          <div className="inline-flex items-center gap-1.5 rounded-full bg-white/25 px-3 py-1 text-[10px] font-bold uppercase tracking-widest text-foreground backdrop-blur-sm">
            <Sparkles size={11} /> AI Personalized
          </div>
          <h2 className="mt-3 font-display text-2xl font-semibold leading-tight text-foreground">
            Create your own nutrition plan
          </h2>
          <p className="mt-2 max-w-md text-sm leading-relaxed text-foreground/80">
            Tailored to your goals, health conditions, food preferences, prakriti and daily routine.
          </p>
          <Link
            to="/combined-plan"
            search={{ goal: "diet" as const }}
            className="mt-4 inline-flex items-center gap-2 rounded-2xl bg-foreground px-5 py-3 text-sm font-semibold text-background shadow-lg transition-transform active:scale-[0.98]"
          >
            <Sparkles size={16} /> Create with AI
          </Link>
        </div>
      </div>
    </section>
  );
}
