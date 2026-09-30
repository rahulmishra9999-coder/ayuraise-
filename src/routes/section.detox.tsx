import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import {
  ArrowLeft, Sparkles, ChevronRight, AlertCircle, Leaf, Sun, Moon, FlaskConical, Clock,
} from "lucide-react";
import { BottomNav } from "@/components/BottomNav";
import { AyuBot } from "@/components/AyuBot";
import {
  DETOX_BENEFITS, DETOX_TYPES, DETOX_GOALS, DETOX_CAUTION,
  buildDetoxPlan, saveDetoxPlan, recommendTypesFor,
  type DetoxGoal, type DetoxDuration, type DetoxType, type DetoxPlan,
} from "@/lib/detox";
import { WLPipelineBanner } from "@/components/WLPipeline";
import { DiseasePipelineBanner } from "@/components/DiseasePipeline";
import {
  patchPlan, advancePipeline, getPipeline, PIPELINE_ROUTE, clearPipeline,
} from "@/lib/weight-loss";

export const Route = createFileRoute("/section/detox")({
  head: () => ({
    meta: [
      { title: "Detox · AyuRaise" },
      { name: "description", content: "Gentle Ayurveda-inspired 3, 5 and 7 day cleanses — kitchari resets, gut healing, liver flush." },
    ],
  }),
  component: DetoxSection,
});

function DetoxSection() {
  const [showPlan, setShowPlan] = useState(false);

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
          <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-muted-foreground">Detox</p>
          <div className="w-10" />
        </div>
        <WLPipelineBanner currentSlug="detox" />
        <DiseasePipelineBanner currentSlug="detox" />


        {/* Hero */}
        <div className="mt-4 rounded-3xl p-5 text-primary-foreground shadow-[var(--shadow-soft)]" style={{ background: "var(--gradient-water)" }}>
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-card/25 backdrop-blur-sm">
              <Sparkles size={22} strokeWidth={1.7} />
            </div>
            <div>
              <h1 className="font-display text-2xl font-semibold">Detox</h1>
              <p className="text-xs text-primary-foreground/80">Clear ama. Reignite agni. Feel light.</p>
            </div>
          </div>
        </div>

        {/* CTA — TOP */}
        <button
          onClick={() => setShowPlan(true)}
          className="mt-4 flex w-full items-center justify-center gap-2 rounded-2xl bg-primary px-5 py-3.5 text-sm font-semibold text-primary-foreground shadow-[var(--shadow-glow)] transition-transform active:scale-[0.98]"
        >
          <Sparkles size={16} /> Create my detox plan
        </button>

        {/* Benefits */}
        <Card className="mt-5">
          <h2 className="font-display text-lg font-semibold">Why detox?</h2>
          <p className="mt-1 text-xs text-muted-foreground">
            In Ayurveda, most disease begins with <em>ama</em> — undigested residue from food, emotions and the
            environment. A short reset clears it before it settles into the tissues.
          </p>
          <div className="mt-4 grid grid-cols-2 gap-2.5">
            {DETOX_BENEFITS.map((b) => (
              <div key={b.title} className="rounded-2xl bg-secondary/40 p-3">
                <div className="text-xl">{b.emoji}</div>
                <p className="mt-1 text-sm font-semibold leading-tight">{b.title}</p>
                <p className="mt-0.5 text-[11px] leading-snug text-muted-foreground">{b.desc}</p>
              </div>
            ))}
          </div>
        </Card>

        {/* Duration overview */}
        <Card className="mt-5">
          <h2 className="font-display text-lg font-semibold">3, 5 or 7 days?</h2>
          <div className="mt-3 space-y-3">
            <DurationRow days={3} title="Weekend reset" desc="Great if you're new to detox or just over-ate for a few days. Low commitment, real results." />
            <DurationRow days={5} title="Mid-week cleanse" desc="Deeper ama clearance. Sweet spot for most people doing this 2–3 times a year." />
            <DurationRow days={7} title="Seasonal cleanse" desc="Aligned with ritu sandhi (season change). Recommended in early spring & autumn." />
          </div>
        </Card>

        {/* Types */}
        <Card className="mt-5">
          <h2 className="font-display text-lg font-semibold">Types of detox</h2>
          <p className="mt-1 text-xs text-muted-foreground">Pick by goal — gut healing, liver, kapha, skin and more.</p>
          <div className="mt-3 space-y-3">
            {DETOX_TYPES.map((t) => (
              <details key={t.id} className="rounded-2xl bg-secondary/30 p-3">
                <summary className="flex cursor-pointer items-center justify-between gap-3 text-sm font-semibold">
                  <span>{t.title}</span>
                  <span className={`rounded-full px-2 py-0.5 text-[10px] font-bold uppercase ${
                    t.intensity === "gentle" ? "bg-green-100 text-green-800" :
                    t.intensity === "moderate" ? "bg-amber-100 text-amber-800" :
                    "bg-rose-100 text-rose-800"
                  }`}>{t.intensity}</span>
                </summary>
                <p className="mt-2 text-xs text-muted-foreground">{t.blurb}</p>
                <ul className="mt-2 space-y-1 text-xs">
                  {t.highlights.map((h) => <li key={h}>• {h}</li>)}
                </ul>
              </details>
            ))}
          </div>
        </Card>

        {/* Caution */}
        <Card className="mt-5" tone="warn">
          <div className="flex items-center gap-2">
            <AlertCircle size={16} className="text-amber-700" />
            <h2 className="font-display text-base font-semibold text-amber-900">Stay safe</h2>
          </div>
          <ul className="mt-2 space-y-1 text-xs text-amber-900/90">
            {DETOX_CAUTION.map((c) => <li key={c}>• {c}</li>)}
          </ul>
        </Card>

        {/* Cross-promo */}
        <div className="mt-5 rounded-3xl border border-primary/30 bg-primary/5 p-4">
          <p className="text-xs font-semibold uppercase tracking-wider text-primary">Pairs well with</p>
          <div className="mt-2 flex flex-wrap gap-2">
            <Link to="/section/fasting" className="rounded-full bg-card px-3 py-1.5 text-xs ring-1 ring-border/60">
              <Clock size={12} className="-mt-0.5 mr-1 inline" /> Fasting & IF
            </Link>
            <Link to="/section/$slug" params={{ slug: "diet" }} className="rounded-full bg-card px-3 py-1.5 text-xs ring-1 ring-border/60">
              <Leaf size={12} className="-mt-0.5 mr-1 inline" /> Diet plan
            </Link>
            <Link to="/section/yoga" className="rounded-full bg-card px-3 py-1.5 text-xs ring-1 ring-border/60">
              Yoga
            </Link>
          </div>
        </div>
      </div>

      {showPlan && <PlanFlow onClose={() => setShowPlan(false)} />}
      <AyuBot />
      <BottomNav />
    </div>
  );
}

function DurationRow({ days, title, desc }: { days: number; title: string; desc: string }) {
  return (
    <div className="flex items-start gap-3 rounded-2xl bg-secondary/30 p-3">
      <div className="flex h-12 w-12 shrink-0 flex-col items-center justify-center rounded-xl bg-primary text-primary-foreground">
        <span className="font-display text-lg font-bold leading-none">{days}</span>
        <span className="text-[9px] uppercase tracking-wider">days</span>
      </div>
      <div>
        <p className="text-sm font-semibold">{title}</p>
        <p className="text-xs text-muted-foreground">{desc}</p>
      </div>
    </div>
  );
}

/* ---------------- Plan flow ---------------- */

type Step = "goal" | "duration" | "type" | "summary";

function PlanFlow({ onClose, initialGoal }: { onClose: () => void; initialGoal?: DetoxGoal }) {
  const navigate = useNavigate();
  const [step, setStep] = useState<Step>("goal");
  const [goal, setGoal] = useState<DetoxGoal>(initialGoal ?? "gut-healing");
  const [duration, setDuration] = useState<DetoxDuration>(3);
  const [type, setType] = useState<DetoxType>("kitchari-mono");

  const recommended = useMemo(() => recommendTypesFor(goal), [goal]);
  const plan = useMemo(() => buildDetoxPlan(goal, duration, type), [goal, duration, type]);

  function save() {
    saveDetoxPlan(plan);
    const q = getPipeline();
    if (q[0] === "detox") {
      patchPlan({ detoxPrefs: { type, days: duration }, includeDetox: true });
      advancePipeline();
      onClose();
      const next = getPipeline()[0];
      if (next) navigate({ to: PIPELINE_ROUTE[next] });
      else { clearPipeline(); navigate({ to: "/section/weight-loss" }); }
      return;
    }
    onClose();
    navigate({ to: "/dashboard" });
  }


  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/40 backdrop-blur-sm sm:items-center">
      <div className="max-h-[92svh] w-full max-w-xl overflow-y-auto rounded-t-3xl bg-card p-5 shadow-2xl sm:rounded-3xl">
        <div className="mb-3 flex items-center justify-between">
          <h2 className="font-display text-xl font-semibold">Build my detox</h2>
          <button onClick={onClose} className="text-sm text-muted-foreground">Close</button>
        </div>

        {step === "goal" && (
          <StepCard title="What's your goal?">
            <div className="space-y-2">
              {DETOX_GOALS.map((g) => (
                <button
                  key={g.id}
                  onClick={() => { setGoal(g.id); const recs = recommendTypesFor(g.id); if (recs[0]) setType(recs[0].id); }}
                  className={`flex w-full items-center gap-3 rounded-2xl border p-3 text-left text-sm ${
                    goal === g.id ? "border-primary bg-primary/10" : "border-border/60 bg-secondary/30"
                  }`}
                >
                  <span className="text-lg">{g.emoji}</span>
                  <span className="font-medium">{g.label}</span>
                </button>
              ))}
            </div>
            <NextBtn onClick={() => setStep("duration")} />
          </StepCard>
        )}

        {step === "duration" && (
          <StepCard title="How many days?">
            <div className="grid grid-cols-3 gap-2">
              {([3, 5, 7] as DetoxDuration[]).map((d) => (
                <button
                  key={d}
                  onClick={() => setDuration(d)}
                  className={`rounded-2xl border p-4 text-center ${
                    duration === d ? "border-primary bg-primary/10" : "border-border/60 bg-secondary/30"
                  }`}
                >
                  <p className="font-display text-2xl font-bold">{d}</p>
                  <p className="text-xs text-muted-foreground">days</p>
                </button>
              ))}
            </div>
            <p className="mt-3 text-[11px] text-muted-foreground">
              First time? Start with 3. Already eat clean? Try 5 or 7.
            </p>
            <NextBtn onClick={() => setStep("type")} />
          </StepCard>
        )}

        {step === "type" && (
          <StepCard title="Pick a detox style">
            {recommended.length > 0 && (
              <p className="mb-2 text-[11px] font-semibold uppercase tracking-wider text-primary">
                Recommended for your goal
              </p>
            )}
            <div className="space-y-2">
              {[...recommended, ...DETOX_TYPES.filter(t => !recommended.includes(t))].map((t) => (
                <button
                  key={t.id}
                  onClick={() => setType(t.id)}
                  className={`flex w-full items-start gap-3 rounded-2xl border p-3 text-left ${
                    type === t.id ? "border-primary bg-primary/10" : "border-border/60 bg-secondary/30"
                  }`}
                >
                  <div className="flex-1">
                    <p className="text-sm font-semibold">{t.title}</p>
                    <p className="text-xs text-muted-foreground">{t.blurb}</p>
                  </div>
                </button>
              ))}
            </div>
            <NextBtn onClick={() => setStep("summary")} label="Preview plan" />
          </StepCard>
        )}

        {step === "summary" && (
          <StepCard title={`Your ${duration}-day plan`}>
            <div className="rounded-2xl bg-secondary/30 p-3 text-sm">
              <p><span className="text-muted-foreground">Goal:</span> <span className="font-semibold">{DETOX_GOALS.find(g => g.id === goal)?.label}</span></p>
              <p><span className="text-muted-foreground">Style:</span> <span className="font-semibold">{DETOX_TYPES.find(t => t.id === type)?.title}</span></p>
            </div>

            <div className="mt-4 space-y-3">
              {plan.days.map((d) => (
                <div key={d.day} className="rounded-2xl border border-border/60 bg-card p-3">
                  <div className="flex items-center justify-between">
                    <p className="font-display text-base font-semibold">Day {d.day}</p>
                    <span className="text-[10px] font-semibold uppercase tracking-wider text-primary">{d.theme}</span>
                  </div>
                  <div className="mt-2 space-y-1.5 text-xs">
                    <p className="flex items-start gap-2"><Sun size={12} className="mt-0.5 shrink-0 text-amber-600" /><span><b>Morning:</b> {d.morning}</span></p>
                    {d.meals.map((m) => (
                      <p key={m.time} className="flex items-start gap-2">
                        <span className="mt-0.5 w-10 shrink-0 rounded bg-secondary px-1 text-center text-[10px] font-bold text-primary">{m.time}</span>
                        <span>{m.food}</span>
                      </p>
                    ))}
                    <p className="flex items-start gap-2"><Moon size={12} className="mt-0.5 shrink-0 text-indigo-500" /><span><b>Evening:</b> {d.evening}</span></p>
                    <p className="flex items-start gap-2"><FlaskConical size={12} className="mt-0.5 shrink-0 text-emerald-600" /><span><b>Herb of the day:</b> {d.herb}</span></p>
                  </div>
                </div>
              ))}
            </div>

            <button
              onClick={save}
              className="mt-5 flex w-full items-center justify-center gap-2 rounded-2xl bg-primary px-5 py-3 text-sm font-semibold text-primary-foreground shadow-[var(--shadow-glow)]"
            >
              <Sparkles size={16} /> Save & go to dashboard
            </button>
          </StepCard>
        )}
      </div>
    </div>
  );
}

/* tiny UI helpers */
function Card({ children, className = "", tone }: { children: React.ReactNode; className?: string; tone?: "warn" }) {
  return (
    <div className={`rounded-3xl p-5 shadow-[var(--shadow-soft)] ring-1 ${
      tone === "warn" ? "bg-amber-50 ring-amber-200" : "bg-card ring-border/60"
    } ${className}`}>
      {children}
    </div>
  );
}
function StepCard({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div>
      <p className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">Step</p>
      <h3 className="mt-1 font-display text-lg font-semibold">{title}</h3>
      <div className="mt-4">{children}</div>
    </div>
  );
}
function NextBtn({ onClick, label = "Continue" }: { onClick: () => void; label?: string }) {
  return (
    <button
      onClick={onClick}
      className="mt-5 flex w-full items-center justify-center gap-2 rounded-2xl bg-primary px-5 py-3 text-sm font-semibold text-primary-foreground shadow-[var(--shadow-glow)]"
    >
      {label} <ChevronRight size={16} />
    </button>
  );
}
