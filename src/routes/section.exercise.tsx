import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import {
  ArrowLeft, Dumbbell, Sun, Activity, HeartPulse, Timer, Check, Sparkles,
  Flame, Zap,
} from "lucide-react";
import { BottomNav } from "@/components/BottomNav";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { QuizRunner } from "@/components/QuizRunner";
import { WLPipelineBanner, WLPipelineNext, useWLPipeline } from "@/components/WLPipeline";
import { DiseasePipelineBanner, DiseasePipelineNext } from "@/components/DiseasePipeline";
import { loadProfile, patchPlan, estimateBurn } from "@/lib/weight-loss";

export const Route = createFileRoute("/section/exercise")({
  head: () => ({
    meta: [
      { title: "Exercise & Vyayam · AyuRaise" },
      {
        name: "description",
        content:
          "Traditional vyayam, surya namaskar, mobility and functional strength — calibrated to your prakriti and energy.",
      },
    ],
  }),
  component: ExercisePage,
});

type Level = "beginner" | "intermediate" | "advanced";
type Focus = "strength" | "mobility" | "cardio" | "surya";

const FOCUS_OPTIONS: { id: Focus; label: string; icon: typeof Dumbbell; blurb: string }[] = [
  { id: "surya", label: "Surya Namaskar", icon: Sun, blurb: "Full-body salutations — warmth, breath, rhythm." },
  { id: "strength", label: "Strength", icon: Dumbbell, blurb: "Bodyweight + traditional vyayam for muscle tone." },
  { id: "mobility", label: "Mobility", icon: Activity, blurb: "Joints, spine, hips — release stiffness." },
  { id: "cardio", label: "Cardio", icon: HeartPulse, blurb: "Skipping, jog-in-place, dand-baithak intervals." },
];

const DURATIONS: { mins: number; label: string }[] = [
  { mins: 10, label: "10 min" },
  { mins: 20, label: "20 min" },
  { mins: 30, label: "30 min" },
  { mins: 45, label: "45 min" },
];

interface Drill {
  name: string;
  detail: string;
  reps: string;
  why: string;
}

const DRILLS: Record<Focus, Drill[]> = {
  surya: [
    { name: "Surya Namaskar A", detail: "12-step classical flow, breath-led", reps: "5–12 rounds", why: "Warms agni, mobilises whole body." },
    { name: "Bhastrika before start", detail: "Bellows breath, 30 strokes", reps: "2 sets", why: "Lights inner fire, oxygenates." },
    { name: "Shavasana close", detail: "Lie flat, soften everything", reps: "3 min", why: "Allows prana to settle." },
  ],
  strength: [
    { name: "Dand (Hindu push-ups)", detail: "Wave-motion push-up", reps: "3 × 8–15", why: "Classic vyayam — chest, shoulders, core." },
    { name: "Baithak (Hindu squats)", detail: "Deep squat, arms swing", reps: "3 × 20–40", why: "Pillar of wrestler training — legs + lungs." },
    { name: "Plank hold", detail: "Forearm or full", reps: "3 × 30–60s", why: "Deep core, stabilises spine." },
    { name: "Glute bridge", detail: "Lift hips, squeeze", reps: "3 × 15", why: "Counters sitting; opens hip flexors." },
  ],
  mobility: [
    { name: "Cat-Cow", detail: "Spinal waves on all fours", reps: "10 cycles", why: "Lubricates spine." },
    { name: "Hip CARs", detail: "Controlled hip circles", reps: "5 each side", why: "Restores hip range." },
    { name: "Neck rolls + shoulder shrugs", detail: "Slow, breath-led", reps: "8 each", why: "Releases tech-neck tension." },
    { name: "Malasana hold", detail: "Deep yogi squat", reps: "60–90s", why: "Opens hips, ankles, pelvic floor." },
  ],
  cardio: [
    { name: "Rope skipping", detail: "Steady pace", reps: "5 × 1 min", why: "Cheapest, best cardio — agni booster." },
    { name: "Jog in place / high knees", detail: "Light → strong", reps: "4 × 45s", why: "No equipment, raises HR." },
    { name: "Dand-Baithak intervals", detail: "10 dand + 20 baithak", reps: "5 rounds", why: "Functional + cardio + strength." },
  ],
};

function buildPlan(focus: Focus, mins: number, level: Level): Drill[] {
  const base = DRILLS[focus];
  const factor = level === "beginner" ? 0.7 : level === "advanced" ? 1.3 : 1;
  // Just scale visible drills count by duration
  const count = Math.max(2, Math.min(base.length, Math.round((mins / 15) + 1)));
  return base.slice(0, count).map((d) => ({
    ...d,
    reps: factor === 1 ? d.reps : `${d.reps}  (${factor < 1 ? "lighter" : "push harder"})`,
  }));
}

function ExercisePage() {
  const [tab, setTab] = useState<"plan" | "basics" | "quiz">("plan");

  return (
    <div className="min-h-svh pb-28" style={{ background: "var(--gradient-hero)" }}>
      <div className="mx-auto max-w-xl px-5 pt-[max(1rem,env(safe-area-inset-top))]">
        <div className="flex items-center justify-between pt-1">
          <Link
            to="/home"
            className="flex h-10 w-10 items-center justify-center rounded-full bg-card shadow-[var(--shadow-soft)] ring-1 ring-border/60"
            aria-label="Back to Health"
          >
            <ArrowLeft size={18} />
          </Link>
          <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-muted-foreground">
            Exercise & Vyayam
          </p>
          <div className="w-10" />
        </div>
        <WLPipelineBanner currentSlug="exercise" />
        <DiseasePipelineBanner currentSlug="exercise" />


        <div
          className="mt-4 rounded-3xl p-5 text-primary-foreground shadow-[var(--shadow-soft)]"
          style={{ background: "var(--gradient-clay)" }}
        >
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-card/25 backdrop-blur-sm">
              <Dumbbell size={26} strokeWidth={1.8} />
            </div>
            <div>
              <h1 className="font-display text-2xl font-semibold">Strong body, calm mind</h1>
              <p className="text-xs text-primary-foreground/85">Traditional vyayam meets modern functional training.</p>
            </div>
          </div>
        </div>

        <Tabs value={tab} onValueChange={(v) => setTab(v as "plan" | "basics" | "quiz")} className="mt-5">
          <TabsList className="grid w-full grid-cols-3 rounded-full bg-card p-1 ring-1 ring-border/60 h-auto">
            <TabsTrigger value="plan" className="rounded-full data-[state=active]:bg-primary data-[state=active]:text-primary-foreground py-2 text-xs">
              <Sparkles size={14} className="mr-1" /> Plan
            </TabsTrigger>
            <TabsTrigger value="basics" className="rounded-full data-[state=active]:bg-primary data-[state=active]:text-primary-foreground py-2 text-xs">
              <Flame size={14} className="mr-1" /> Basics
            </TabsTrigger>
            <TabsTrigger value="quiz" className="rounded-full data-[state=active]:bg-primary data-[state=active]:text-primary-foreground py-2 text-xs">
              🧠 Quiz
            </TabsTrigger>
          </TabsList>

          <TabsContent value="plan" className="mt-5">
            <PlanBuilder />
          </TabsContent>

          <TabsContent value="basics" className="mt-5 space-y-4">
            <BasicsCard
              icon={Sun}
              title="Why traditional vyayam"
              text="Surya namaskar, dand and baithak have trained Indian wrestlers and yogis for centuries — they need zero equipment and train the body as one integrated unit."
            />
            <BasicsCard
              icon={Zap}
              title="Match intensity to your prakriti"
              text="Vata thrives on grounding, slow strength. Pitta needs cooling, moderate effort. Kapha gains from vigorous, sweat-inducing sessions."
            />
            <BasicsCard
              icon={Timer}
              title="When to train"
              text="Early morning (kapha time, 6–10 AM) is ideal for vigorous exercise. Evening sessions should stay gentler so sleep is not disturbed."
            />
            <BasicsCard
              icon={HeartPulse}
              title="Rest is part of training"
              text="Take 1–2 full rest days a week. Sleep, hydration and food carry 70% of your progress — exercise only the remaining 30%."
            />
          </TabsContent>

          <TabsContent value="quiz" className="mt-5">
            <QuizRunner quizId="exercise" />
          </TabsContent>
        </Tabs>
      </div>

      <BottomNav />
    </div>
  );
}

const MET_FOCUS: Record<Focus, number> = { surya: 5, strength: 5, mobility: 3, cardio: 7 };

function PlanBuilder() {
  const pipeline = useWLPipeline("exercise");
  const [focus, setFocus] = useState<Focus>("surya");
  const [mins, setMins] = useState<number>(20);
  const [level, setLevel] = useState<Level>("beginner");
  const plan = useMemo(() => buildPlan(focus, mins, level), [focus, mins, level]);

  const prof = loadProfile();
  const burn = estimateBurn(MET_FOCUS[focus] * mins, prof?.weightKg ?? 65);
  useEffect(() => {
    if (pipeline.active) patchPlan({ exerciseCalBurn: burn });
  }, [pipeline.active, burn]);


  return (
    <div className="space-y-5">
      <div className="rounded-3xl bg-card p-5 shadow-[var(--shadow-soft)] ring-1 ring-border/60">
        <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-muted-foreground">Focus</p>
        <div className="mt-3 grid grid-cols-2 gap-2.5">
          {FOCUS_OPTIONS.map((f) => {
            const Icon = f.icon;
            const active = f.id === focus;
            return (
              <button
                key={f.id}
                onClick={() => setFocus(f.id)}
                className={`flex flex-col items-start gap-1.5 rounded-2xl p-3 text-left ring-1 transition ${
                  active ? "bg-primary text-primary-foreground ring-primary" : "bg-background ring-border/60"
                }`}
              >
                <Icon size={18} strokeWidth={1.8} />
                <span className="text-sm font-semibold">{f.label}</span>
                <span className={`text-[11px] leading-snug ${active ? "text-primary-foreground/85" : "text-muted-foreground"}`}>
                  {f.blurb}
                </span>
              </button>
            );
          })}
        </div>

        <p className="mt-5 text-[11px] font-semibold uppercase tracking-[0.2em] text-muted-foreground">Duration</p>
        <div className="mt-3 grid grid-cols-4 gap-2">
          {DURATIONS.map((d) => {
            const active = d.mins === mins;
            return (
              <button
                key={d.mins}
                onClick={() => setMins(d.mins)}
                className={`rounded-full py-2 text-xs font-semibold ring-1 transition ${
                  active ? "bg-primary text-primary-foreground ring-primary" : "bg-background ring-border/60"
                }`}
              >
                {d.label}
              </button>
            );
          })}
        </div>

        <p className="mt-5 text-[11px] font-semibold uppercase tracking-[0.2em] text-muted-foreground">Level</p>
        <div className="mt-3 grid grid-cols-3 gap-2">
          {(["beginner", "intermediate", "advanced"] as Level[]).map((l) => {
            const active = level === l;
            return (
              <button
                key={l}
                onClick={() => setLevel(l)}
                className={`rounded-full py-2 text-xs font-semibold capitalize ring-1 transition ${
                  active ? "bg-primary text-primary-foreground ring-primary" : "bg-background ring-border/60"
                }`}
              >
                {l}
              </button>
            );
          })}
        </div>
      </div>

      <div className="rounded-3xl bg-card p-5 shadow-[var(--shadow-soft)] ring-1 ring-border/60">
        <div className="flex items-center justify-between">
          <h2 className="font-display text-lg font-semibold">Your session</h2>
          <span className="text-xs text-muted-foreground">{mins} min · {level}</span>
        </div>
        <ul className="mt-3 space-y-3">
          {plan.map((d) => (
            <li key={d.name} className="rounded-2xl bg-background p-3.5 ring-1 ring-border/50">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-sm font-semibold">{d.name}</p>
                  <p className="text-[12px] text-muted-foreground">{d.detail}</p>
                </div>
                <span className="shrink-0 rounded-full bg-accent/40 px-2.5 py-1 text-[11px] font-semibold text-primary">
                  {d.reps}
                </span>
              </div>
              <p className="mt-2 flex items-start gap-1.5 text-[11px] text-muted-foreground">
                <Check size={12} className="mt-0.5 shrink-0 text-primary" strokeWidth={3} />
                {d.why}
              </p>
            </li>
          ))}
        </ul>
        {pipeline.active && (
          <div className="mt-4 flex items-center gap-2 rounded-2xl bg-primary/10 px-3 py-2.5 text-xs ring-1 ring-primary/30">
            <Flame size={14} className="text-primary" /> Estimated burn ~<b>{burn} kcal/session</b> — we'll factor it into your diet plan.
          </div>
        )}
      </div>
      <WLPipelineNext currentSlug="exercise" onAdvance={() => patchPlan({ exerciseCalBurn: burn })} />
      <DiseasePipelineNext currentSlug="exercise" />
    </div>
  );
}


function BasicsCard({ icon: Icon, title, text }: { icon: typeof Sun; title: string; text: string }) {
  return (
    <div className="rounded-3xl bg-card p-5 shadow-[var(--shadow-soft)] ring-1 ring-border/60">
      <div className="flex items-start gap-3">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-accent/40 text-primary">
          <Icon size={18} strokeWidth={1.8} />
        </div>
        <div>
          <h3 className="font-display text-base font-semibold">{title}</h3>
          <p className="mt-1 text-sm leading-relaxed text-muted-foreground">{text}</p>
        </div>
      </div>
    </div>
  );
}
