import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useMemo, useRef, useState } from "react";
import {
  ArrowLeft, ArrowRight, Sparkles, Check, Send, Camera, CameraOff,
  Volume2, VolumeX, Play, Pause, SkipForward, X, Mic, Salad, Hourglass, Droplets,
  PlayCircle, BookOpen, Heart, ChevronDown, AlertCircle, Flame,
} from "lucide-react";
import { BottomNav } from "@/components/BottomNav";
import {
  DISEASES, GOALS, DURATIONS, generatePlan, savePlan, posesFor, speak, stopSpeaking,
  type Disease, type Goal, type YogaPlan, type Pose,
} from "@/lib/yoga";
import { YOGA_TYPES, YOGA_BENEFITS, YOGA_CATEGORIES } from "@/lib/yoga-basics";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { QuizRunner } from "@/components/QuizRunner";
import { WLPipelineBanner, WLPipelineNext, useWLPipeline } from "@/components/WLPipeline";
import { DiseasePipelineBanner, DiseasePipelineNext } from "@/components/DiseasePipeline";
import { loadProfile, patchPlan, estimateBurn } from "@/lib/weight-loss";

export const Route = createFileRoute("/section/yoga")({
  head: () => ({
    meta: [
      { title: "Yoga & Pranayam · AyuRaise" },
      { name: "description", content: "Personalized yoga plans with optional AI form feedback." },
    ],
  }),
  component: YogaFlow,
});

type Step =
  | "intake"
  | "generating"
  | "plan"
  | "chat"
  | "saved"
  | "feedback-choice"
  | "practice"
  | "complete";

function YogaFlow() {
  const [tab, setTab] = useState<"practice" | "basics" | "quiz">("practice");
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
            Yoga & Pranayam
          </p>
          <div className="w-10" />
        </div>

        <Tabs value={tab} onValueChange={(v) => setTab(v as "practice" | "basics" | "quiz")} className="mt-4">
          <TabsList className="grid w-full grid-cols-3 rounded-full bg-card p-1 ring-1 ring-border/60 h-auto">
            <TabsTrigger value="practice" className="rounded-full data-[state=active]:bg-primary data-[state=active]:text-primary-foreground py-2 text-xs">
              <Sparkles size={14} className="mr-1" /> Practice
            </TabsTrigger>
            <TabsTrigger value="basics" className="rounded-full data-[state=active]:bg-primary data-[state=active]:text-primary-foreground py-2 text-xs">
              <BookOpen size={14} className="mr-1" /> Basics
            </TabsTrigger>
            <TabsTrigger value="quiz" className="rounded-full data-[state=active]:bg-primary data-[state=active]:text-primary-foreground py-2 text-xs">
              🧠 Quiz
            </TabsTrigger>
          </TabsList>

          <TabsContent value="practice" className="mt-2">
            <PracticeFlow />
          </TabsContent>
          <TabsContent value="basics" className="mt-2">
            <BasicsTab />
          </TabsContent>
          <TabsContent value="quiz" className="mt-4">
            <QuizRunner quizId="yoga" />
          </TabsContent>
        </Tabs>
      </div>
      <BottomNav />
    </div>
  );
}

function PracticeFlow() {
  const pipeline = useWLPipeline("yoga");
  const [step, setStep] = useState<Step>("intake");
  const [disease, setDisease] = useState<Disease>("none");
  const [goal, setGoal] = useState<Goal>(pipeline.active ? "weight-loss" : "general-wellness");
  const [duration, setDuration] = useState<number>(20);
  const [plan, setPlan] = useState<YogaPlan | null>(null);
  const [withFeedback, setWithFeedback] = useState(false);

  // When saving plan in pipeline mode, compute calorie burn and patch wlPlan
  const persistBurn = (p: YogaPlan) => {
    if (!pipeline.active) return;
    const prof = loadProfile();
    const kg = prof?.weightKg ?? 65;
    // ~3 MET hatha yoga * duration
    const cal = estimateBurn(3 * p.duration, kg);
    patchPlan({ yogaCalBurn: cal });
  };

  return (
    <div>
      <WLPipelineBanner currentSlug="yoga" />
      <DiseasePipelineBanner currentSlug="yoga" />
      {step !== "intake" && (
        <div className="mb-2 mt-2 flex items-center justify-between">
          <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-muted-foreground">
            {labelFor(step)}
          </p>
          <button
            onClick={() => setStep("intake")}
            className="flex h-9 w-9 items-center justify-center rounded-full bg-card shadow-[var(--shadow-soft)] ring-1 ring-border/60"
            aria-label="Restart"
          >
            <X size={16} />
          </button>
        </div>
      )}

      {step === "intake" && (
        <IntakeStep
          hideDisease={pipeline.active}
          disease={disease} setDisease={setDisease}
          goal={goal} setGoal={setGoal}
          duration={duration} setDuration={setDuration}
          onSubmit={() => {
            setStep("generating");
            setTimeout(() => {
              const p = generatePlan(disease, goal, duration);
              setPlan(p);
              setStep("plan");
            }, 1200);
          }}
        />
      )}
      {step === "generating" && <GeneratingStep />}
      {step === "plan" && plan && (
        <PlanStep plan={plan} onCustomize={() => setStep("chat")} onContinue={() => { savePlan(plan); persistBurn(plan); setStep("saved"); }} />
      )}
      {step === "chat" && plan && (
        <ChatStep plan={plan} onUpdated={(p) => setPlan(p)} onDone={() => { if (plan) { savePlan(plan); persistBurn(plan); } setStep("saved"); }} />
      )}
      {step === "saved" && plan && (
        <SavedStep plan={plan} onStart={() => setStep("feedback-choice")} />
      )}
      {step === "feedback-choice" && (
        <FeedbackChoiceStep onChoose={(fb) => { setWithFeedback(fb); setStep("practice"); }} />
      )}
      {step === "practice" && plan && (
        <PracticeStep plan={plan} withFeedback={withFeedback} onDone={() => setStep("complete")} />
      )}
      {step === "complete" && <CompleteStep onBack={() => setStep("intake")} />}
    </div>
  );
}



function BasicsTab() {
  const [openCat, setOpenCat] = useState<string | null>(null);
  return (
    <div className="animate-float-up">
      {/* Hero intro */}
      <div className="mt-3 overflow-hidden rounded-3xl text-primary-foreground shadow-[var(--shadow-tile)]" style={{ background: "var(--gradient-leaf)" }}>
        <div className="relative aspect-video w-full bg-foreground/20">
          <iframe
            className="absolute inset-0 h-full w-full"
            src="https://www.youtube.com/embed/v7AYKMP6rOE"
            title="Introduction to Yoga"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
          />
        </div>
        <div className="p-5">
          <p className="text-[11px] font-semibold uppercase tracking-wider opacity-90">Introduction</p>
          <h2 className="mt-1 font-display text-2xl font-semibold">What is yoga?</h2>
          <p className="mt-2 text-sm leading-relaxed opacity-90">
            Yoga is a 5,000-year-old practice from India that unites body, breath and mind.
            Through asana (posture), pranayam (breath) and dhyana (meditation), it builds health,
            calms the nervous system and awakens awareness.
          </p>
        </div>
      </div>

      {/* Benefits */}
      <section className="mt-6">
        <div className="flex items-center gap-2">
          <Heart size={16} className="text-primary" />
          <h2 className="font-display text-lg font-semibold">Benefits of yoga</h2>
        </div>
        <div className="mt-3 grid grid-cols-2 gap-2.5">
          {YOGA_BENEFITS.map((b) => (
            <div key={b.title} className="rounded-2xl bg-card p-3 ring-1 ring-border/60 shadow-[var(--shadow-soft)]">
              <p className="text-xl">{b.icon}</p>
              <p className="mt-1 text-sm font-semibold">{b.title}</p>
              <p className="mt-0.5 text-[11px] leading-snug text-muted-foreground">{b.text}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Types of yoga */}
      <section className="mt-6">
        <div className="flex items-center gap-2">
          <BookOpen size={16} className="text-primary" />
          <h2 className="font-display text-lg font-semibold">Types of yoga</h2>
        </div>
        <p className="mt-1 text-xs text-muted-foreground">Six classical styles. Each suits a different temperament.</p>
        <div className="mt-3 space-y-2.5">
          {YOGA_TYPES.map((t) => (
            <div key={t.id} className="rounded-2xl bg-card p-4 ring-1 ring-border/60 shadow-[var(--shadow-soft)]">
              <div className="flex items-start gap-3">
                <span className="text-2xl">{t.emoji}</span>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold">{t.name}</p>
                  <p className="text-[11px] text-muted-foreground">{t.origin}</p>
                  <p className="mt-1.5 text-xs leading-relaxed text-foreground/80">{t.description}</p>
                  <div className="mt-2 flex flex-wrap gap-1.5">
                    {t.bestFor.map((b) => (
                      <span key={b} className="rounded-full bg-accent/30 px-2 py-0.5 text-[10px] font-medium text-primary">{b}</span>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Specialized categories */}
      <section className="mt-7">
        <div className="flex items-center gap-2">
          <Sparkles size={16} className="text-primary" />
          <h2 className="font-display text-lg font-semibold">Yoga we offer</h2>
        </div>
        <p className="mt-1 text-xs text-muted-foreground">
          Specialized practices with recorded poses for every body and condition.
        </p>
        <div className="mt-3 space-y-3">
          {YOGA_CATEGORIES.map((c) => {
            const open = openCat === c.id;
            return (
              <div key={c.id} className="overflow-hidden rounded-3xl bg-card ring-1 ring-border/60 shadow-[var(--shadow-soft)]">
                <button
                  onClick={() => setOpenCat(open ? null : c.id)}
                  className="flex w-full items-center gap-3 p-4 text-left"
                >
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl text-2xl text-primary-foreground" style={{ background: c.gradient }}>
                    {c.emoji}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold">{c.name}</p>
                    <p className="text-[11px] text-muted-foreground">{c.audience} · {c.poses.length} poses</p>
                  </div>
                  <ChevronDown size={18} className={`shrink-0 text-muted-foreground transition-transform ${open ? "rotate-180" : ""}`} />
                </button>

                {open && (
                  <div className="border-t border-border/60 p-4 animate-float-up">
                    <p className="text-xs leading-relaxed text-foreground/80">{c.description}</p>

                    {c.precautions.length > 0 && (
                      <div className="mt-3 rounded-2xl bg-destructive/10 p-3">
                        <div className="flex items-center gap-1.5">
                          <AlertCircle size={13} className="text-destructive" />
                          <p className="text-[11px] font-semibold uppercase tracking-wider text-destructive">Precautions</p>
                        </div>
                        <ul className="mt-1.5 list-disc space-y-0.5 pl-5 text-[11px] text-foreground/80">
                          {c.precautions.map((p) => <li key={p}>{p}</li>)}
                        </ul>
                      </div>
                    )}

                    <p className="mt-4 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                      Recorded poses
                    </p>
                    <div className="mt-2 space-y-2">
                      {c.poses.map((p, i) => (
                        <div key={i} className="flex items-start gap-3 rounded-2xl bg-secondary/60 p-3">
                          <span className="text-xl">{p.emoji}</span>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-baseline justify-between gap-2">
                              <p className="truncate text-xs font-semibold">{p.name}</p>
                              <p className="shrink-0 text-[10px] font-medium text-muted-foreground">{p.duration}</p>
                            </div>
                            <p className="truncate text-[10px] italic text-muted-foreground">{p.sanskrit}</p>
                            <p className="mt-1 text-[11px] leading-snug text-foreground/75">{p.cue}</p>
                          </div>
                          <button
                            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-[var(--shadow-soft)]"
                            aria-label={`Play ${p.name}`}
                            onClick={() => speak(`${p.name}. ${p.cue}`)}
                          >
                            <PlayCircle size={18} />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </section>

      <p className="mt-6 text-center text-[11px] text-muted-foreground">
        Ready to start? Switch to the <span className="font-semibold text-primary">Practice</span> tab.
      </p>
    </div>
  );
}


function TopBar({ step, onBack }: { step: Step; onBack: () => void }) {
  return (
    <div className="flex items-center justify-between pt-1">
      <Link
        to="/home"
        className="flex h-10 w-10 items-center justify-center rounded-full bg-card shadow-[var(--shadow-soft)] ring-1 ring-border/60"
        aria-label="Back to Health"
      >
        <ArrowLeft size={18} />
      </Link>
      <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-muted-foreground">
        Yoga · {labelFor(step)}
      </p>
      {step !== "intake" ? (
        <button
          onClick={onBack}
          className="flex h-10 w-10 items-center justify-center rounded-full bg-card shadow-[var(--shadow-soft)] ring-1 ring-border/60"
          aria-label="Restart"
        >
          <X size={18} />
        </button>
      ) : <div className="w-10" />}
    </div>
  );
}

function labelFor(s: Step) {
  return {
    intake: "Setup",
    generating: "Building",
    plan: "Your plan",
    chat: "Customize",
    saved: "Saved",
    "feedback-choice": "Practice",
    practice: "In session",
    complete: "Done",
  }[s];
}

// ---------- Intake ----------
function IntakeStep({
  hideDisease = false, disease, setDisease, goal, setGoal, duration, setDuration, onSubmit,
}: {
  hideDisease?: boolean;
  disease: Disease; setDisease: (d: Disease) => void;
  goal: Goal; setGoal: (g: Goal) => void;
  duration: number; setDuration: (d: number) => void;
  onSubmit: () => void;
}) {
  return (
    <div className="mt-6 animate-float-up">
      <h1 className="font-display text-3xl font-semibold">Let's craft your yoga plan</h1>
      <p className="mt-1 text-sm text-muted-foreground">{hideDisease ? "2 quick questions" : "3 quick questions"} — fully personalized.</p>

      {!hideDisease && (
        <Section title="1. Are you suffering from any condition?" sub="We'll avoid poses that aren't safe for it.">
          <div className="flex flex-wrap gap-2">
            {DISEASES.map((d) => (
              <Chip key={d.id} active={disease === d.id} onClick={() => setDisease(d.id)}>{d.label}</Chip>
            ))}
          </div>
        </Section>
      )}

      <Section title="2. What's your goal with yoga?" sub="Even if you have a condition, you can still pick flexibility, strength, etc.">
        <div className="grid grid-cols-1 gap-2">
          {GOALS.map((g) => (
            <button
              key={g.id}
              onClick={() => setGoal(g.id)}
              className={`flex items-center justify-between rounded-2xl px-4 py-3 text-left ring-1 transition-all ${
                goal === g.id ? "bg-primary text-primary-foreground ring-primary shadow-[var(--shadow-glow)]" : "bg-card ring-border/60"
              }`}
            >
              <div>
                <p className="text-sm font-semibold">{g.label}</p>
                <p className={`text-xs ${goal === g.id ? "opacity-90" : "text-muted-foreground"}`}>{g.desc}</p>
              </div>
              {goal === g.id && <Check size={18} />}
            </button>
          ))}
        </div>
      </Section>

      <Section title="3. How long do you want to practice?" sub="You can change this anytime.">
        <div className="flex flex-wrap gap-2">
          {DURATIONS.map((d) => (
            <Chip key={d} active={duration === d} onClick={() => setDuration(d)}>{d} min</Chip>
          ))}
        </div>
      </Section>

      <button
        onClick={onSubmit}
        className="mt-7 flex w-full items-center justify-center gap-2 rounded-2xl bg-primary py-4 text-sm font-semibold text-primary-foreground shadow-[var(--shadow-glow)] transition-transform active:scale-[0.98]"
      >
        <Sparkles size={16} /> Build my yoga plan
      </button>
    </div>
  );
}

function Section({ title, sub, children }: { title: string; sub?: string; children: React.ReactNode }) {
  return (
    <section className="mt-6">
      <h2 className="font-display text-base font-semibold">{title}</h2>
      {sub && <p className="mt-0.5 text-xs text-muted-foreground">{sub}</p>}
      <div className="mt-3">{children}</div>
    </section>
  );
}

function Chip({ active, onClick, children }: { active: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button
      onClick={onClick}
      className={`rounded-full px-4 py-2 text-sm font-medium ring-1 transition-all ${
        active ? "bg-primary text-primary-foreground ring-primary shadow-[var(--shadow-soft)]" : "bg-card text-foreground/80 ring-border/60"
      }`}
    >
      {children}
    </button>
  );
}

// ---------- Generating ----------
function GeneratingStep() {
  return (
    <div className="mt-24 flex flex-col items-center text-center animate-float-up">
      <div className="flex h-24 w-24 items-center justify-center rounded-full text-primary-foreground animate-breathe" style={{ background: "var(--gradient-leaf)" }}>
        <Sparkles size={32} />
      </div>
      <h2 className="mt-6 font-display text-2xl font-semibold">Crafting your sequence…</h2>
      <p className="mt-2 max-w-xs text-sm text-muted-foreground">
        Matching poses to your dosha, condition and goal.
      </p>
    </div>
  );
}

// ---------- Plan review ----------
function PlanStep({ plan, onCustomize, onContinue }: { plan: YogaPlan; onCustomize: () => void; onContinue: () => void }) {
  const poses = useMemo(() => posesFor(plan), [plan]);
  const total = poses.reduce((a, p) => a + p.durationSec, 0);
  return (
    <div className="mt-6 animate-float-up">
      <div className="rounded-3xl p-5 text-primary-foreground shadow-[var(--shadow-tile)]" style={{ background: "var(--gradient-leaf)" }}>
        <p className="text-xs font-semibold uppercase tracking-wider opacity-90">Your yoga plan</p>
        <h1 className="mt-1 font-display text-2xl font-semibold">
          {poses.length} poses · {Math.round(total / 60)} min
        </h1>
        <p className="mt-1 text-sm opacity-90">
          Tailored for {GOALS.find((g) => g.id === plan.goal)?.label.toLowerCase()}
          {plan.disease !== "none" ? ` · safe for ${DISEASES.find((d) => d.id === plan.disease)?.label.toLowerCase()}` : ""}.
        </p>
      </div>

      <div className="mt-5 space-y-3">
        {poses.map((p, i) => <PoseCard key={p.id} pose={p} index={i + 1} />)}
      </div>

      <div className="mt-6 rounded-3xl bg-card p-5 ring-1 ring-border/60 shadow-[var(--shadow-soft)]">
        <p className="font-display text-lg font-semibold">🎉 Plan ready!</p>
        <p className="mt-1 text-sm text-muted-foreground">
          Continue with this plan, or chat with Ayu to tweak it.
        </p>
        <div className="mt-4 grid grid-cols-2 gap-3">
          <button
            onClick={onCustomize}
            className="rounded-2xl bg-secondary py-3 text-sm font-semibold text-foreground"
          >
            Customize
          </button>
          <button
            onClick={onContinue}
            className="rounded-2xl bg-primary py-3 text-sm font-semibold text-primary-foreground shadow-[var(--shadow-glow)]"
          >
            Continue
          </button>
        </div>
      </div>
    </div>
  );
}

function PoseCard({ pose, index }: { pose: Pose; index: number }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="rounded-2xl bg-card p-4 ring-1 ring-border/60 shadow-[var(--shadow-soft)]">
      <button onClick={() => setOpen((o) => !o)} className="flex w-full items-center gap-3 text-left">
        <span className="text-2xl">{pose.emoji}</span>
        <div className="flex-1 min-w-0">
          <p className="truncate text-sm font-semibold">{index}. {pose.name}</p>
          <p className="truncate text-xs text-muted-foreground">{pose.sanskrit} · {pose.durationSec}s</p>
        </div>
        <ArrowRight size={16} className={`transition-transform ${open ? "rotate-90" : ""} text-muted-foreground`} />
      </button>
      {open && (
        <div className="mt-3 border-t border-border/60 pt-3 animate-float-up">
          <p className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">Benefits</p>
          <div className="mt-1 flex flex-wrap gap-1.5">
            {pose.benefits.map((b) => (
              <span key={b} className="rounded-full bg-accent/30 px-2.5 py-1 text-[11px] font-medium text-primary">{b}</span>
            ))}
          </div>
          <p className="mt-3 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">How to</p>
          <ol className="mt-1 list-decimal space-y-1 pl-5 text-xs text-foreground/80">
            {pose.steps.map((s, i) => <li key={i}>{s}</li>)}
          </ol>
        </div>
      )}
    </div>
  );
}

// ---------- Chat customize ----------
type Msg = { role: "user" | "ai"; text: string };

function ChatStep({ plan, onUpdated, onDone }: { plan: YogaPlan; onUpdated: (p: YogaPlan) => void; onDone: () => void }) {
  const [messages, setMessages] = useState<Msg[]>([
    { role: "ai", text: "I've crafted your plan. Want it shorter, more relaxing, or focused on a body part? Tell me what to tweak." },
  ]);
  const [input, setInput] = useState("");

  function send() {
    const t = input.trim();
    if (!t) return;
    const next: Msg[] = [...messages, { role: "user", text: t }];
    setMessages(next);
    setInput("");

    setTimeout(() => {
      const lower = t.toLowerCase();
      let reply = "Got it — I've adjusted your plan.";
      let updated = plan;
      if (/(short|less|trim|reduce|quick)/.test(lower) && plan.duration > 10) {
        updated = { ...plan, duration: Math.max(10, plan.duration - 10), poseIds: plan.poseIds.slice(0, Math.max(4, plan.poseIds.length - 2)) };
        reply = `Trimmed to ~${updated.duration} min, ${updated.poseIds.length} poses.`;
      } else if (/(long|more|extend|add)/.test(lower)) {
        updated = { ...plan, duration: plan.duration + 10 };
        reply = `Extended to ~${updated.duration} min. I'll add a couple more poses on next save.`;
      } else if (/(relax|calm|stress|sleep)/.test(lower)) {
        reply = "Shifted toward calming pranayam and forward folds.";
      } else if (/(strength|stronger|tone)/.test(lower)) {
        reply = "Added more standing poses to build strength.";
      } else {
        reply = "Noted. Your plan now reflects that preference.";
      }
      onUpdated(updated);
      setMessages((m) => [...m, { role: "ai", text: reply }]);
    }, 600);
  }

  return (
    <div className="mt-6 animate-float-up">
      <div className="rounded-3xl bg-card p-5 ring-1 ring-border/60 shadow-[var(--shadow-soft)]">
        <p className="font-display text-lg font-semibold">Chat with Ayu</p>
        <p className="mt-1 text-xs text-muted-foreground">Tell me how to tweak your plan.</p>
        <div className="mt-4 max-h-[40svh] space-y-2 overflow-y-auto pr-1">
          {messages.map((m, i) => (
            <div key={i} className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}>
              <div className={`max-w-[80%] rounded-2xl px-3.5 py-2 text-sm ${
                m.role === "user" ? "bg-primary text-primary-foreground" : "bg-secondary text-foreground"
              }`}>
                {m.text}
              </div>
            </div>
          ))}
        </div>
        <div className="mt-3 flex items-center gap-2">
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && send()}
            placeholder="Make it shorter, focus on back…"
            className="flex-1 rounded-full bg-secondary px-4 py-2.5 text-sm outline-none ring-1 ring-border/60 focus:ring-primary"
          />
          <button onClick={send} className="flex h-10 w-10 items-center justify-center rounded-full bg-primary text-primary-foreground">
            <Send size={16} />
          </button>
        </div>
      </div>
      <button
        onClick={onDone}
        className="mt-4 w-full rounded-2xl bg-primary py-3 text-sm font-semibold text-primary-foreground shadow-[var(--shadow-glow)]"
      >
        Save plan & continue
      </button>
    </div>
  );
}

// ---------- Saved ----------
function SavedStep({ plan, onStart }: { plan: YogaPlan; onStart: () => void }) {
  const navigate = useNavigate();
  const pipeline = useWLPipeline("yoga");
  const prof = loadProfile();
  const burn = estimateBurn(3 * plan.duration, prof?.weightKg ?? 65);
  const suggestions: { slug: string; label: string; icon: React.ElementType; gradient: string }[] = [
    { slug: "diet", label: "Diet plan for this", icon: Salad, gradient: "var(--gradient-sage)" },
    { slug: "fasting", label: "Add a fasting window", icon: Hourglass, gradient: "var(--gradient-dawn)" },
    { slug: "detox", label: "Pair with a detox", icon: Droplets, gradient: "var(--gradient-water)" },
  ];


  return (
    <div className="mt-6 animate-float-up">
      <div className="rounded-3xl p-6 text-primary-foreground shadow-[var(--shadow-tile)]" style={{ background: "var(--gradient-leaf)" }}>
        <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-card/25 backdrop-blur-sm">
          <Check size={24} />
        </div>
        <h1 className="mt-4 font-display text-2xl font-semibold">Saved to your dashboard</h1>
        <p className="mt-1 text-sm opacity-90">
          {plan.poseIds.length} poses · {plan.duration} min. Find it any time under "Today".
        </p>
        {pipeline.active && (
          <div className="mt-4 flex items-center gap-2 rounded-2xl bg-white/15 px-3 py-2.5 text-xs ring-1 ring-white/25">
            <Flame size={14} /> With this practice you'll burn ~<b>{burn} kcal/day</b> — we'll factor it into your diet plan.
          </div>
        )}
      </div>

      <WLPipelineNext currentSlug="yoga" />
      <DiseasePipelineNext currentSlug="yoga" />


      <div className="mt-5 grid grid-cols-2 gap-3">
        <button
          onClick={() => navigate({ to: "/dashboard" })}
          className="rounded-2xl bg-card py-3 text-sm font-semibold text-foreground ring-1 ring-border/60"
        >
          Open dashboard
        </button>
        <button
          onClick={onStart}
          className="rounded-2xl bg-primary py-3 text-sm font-semibold text-primary-foreground shadow-[var(--shadow-glow)]"
        >
          Start practice
        </button>
      </div>

      <div className="mt-6 rounded-3xl bg-card p-5 ring-1 ring-border/60 shadow-[var(--shadow-soft)]">
        <p className="font-display text-base font-semibold">Boost your results</p>
        <p className="mt-1 text-xs text-muted-foreground">
          For {plan.disease !== "none" ? DISEASES.find((d) => d.id === plan.disease)?.label.toLowerCase() : "your goals"}, pair yoga with:
        </p>
        <div className="mt-3 space-y-2.5">
          {suggestions.map((s) => {
            const I = s.icon;
            return (
              <Link
                key={s.slug}
                to="/section/$slug"
                params={{ slug: s.slug }}
                className="flex items-center gap-3 rounded-2xl bg-secondary px-3 py-3"
              >
                <div className="flex h-10 w-10 items-center justify-center rounded-xl text-primary-foreground" style={{ background: s.gradient }}>
                  <I size={18} />
                </div>
                <span className="flex-1 text-sm font-semibold">{s.label}</span>
                <ArrowRight size={16} className="text-muted-foreground" />
              </Link>
            );
          })}
        </div>
        <p className="mt-3 text-[11px] text-muted-foreground">
          Or park it for later and just hit Start above.
        </p>
      </div>
    </div>
  );
}

// ---------- Feedback choice ----------
function FeedbackChoiceStep({ onChoose }: { onChoose: (withFeedback: boolean) => void }) {
  return (
    <div className="mt-6 animate-float-up">
      <h1 className="font-display text-2xl font-semibold">How would you like to practice?</h1>
      <p className="mt-1 text-sm text-muted-foreground">
        With AI feedback, your camera helps Ayu cue your form by voice. Camera footage stays on device.
      </p>
      <div className="mt-5 space-y-3">
        <button
          onClick={() => onChoose(true)}
          className="flex w-full items-center gap-4 rounded-3xl p-5 text-left text-primary-foreground shadow-[var(--shadow-tile)]"
          style={{ background: "var(--gradient-violet)" }}
        >
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-card/25">
            <Camera size={22} />
          </div>
          <div>
            <p className="font-display text-lg font-semibold">With AI form feedback</p>
            <p className="text-xs opacity-90">Voice cues from Ayu while you practice.</p>
          </div>
        </button>
        <button
          onClick={() => onChoose(false)}
          className="flex w-full items-center gap-4 rounded-3xl bg-card p-5 text-left ring-1 ring-border/60 shadow-[var(--shadow-soft)]"
        >
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-secondary">
            <CameraOff size={22} />
          </div>
          <div>
            <p className="font-display text-lg font-semibold">Without feedback</p>
            <p className="text-xs text-muted-foreground">Just guided voice cues — no camera.</p>
          </div>
        </button>
      </div>
    </div>
  );
}

// ---------- Practice ----------
function PracticeStep({ plan, withFeedback, onDone }: { plan: YogaPlan; withFeedback: boolean; onDone: () => void }) {
  const poses = useMemo(() => posesFor(plan), [plan]);
  const [idx, setIdx] = useState(0);
  const [secsLeft, setSecsLeft] = useState(poses[0]?.durationSec ?? 30);
  const [paused, setPaused] = useState(false);
  const [muted, setMuted] = useState(false);
  const [breakMode, setBreakMode] = useState(false);
  const [camOk, setCamOk] = useState<boolean | null>(null);
  const [camError, setCamError] = useState<string | null>(null);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const cueIdxRef = useRef(0);

  const pose = poses[idx];

  // Camera
  useEffect(() => {
    if (!withFeedback) return;
    let mounted = true;
    (async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: "user" }, audio: false });
        if (!mounted) { stream.getTracks().forEach((t) => t.stop()); return; }
        streamRef.current = stream;
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          await videoRef.current.play().catch(() => {});
        }
        setCamOk(true);
      } catch (e) {
        setCamOk(false);
        setCamError(e instanceof Error ? e.message : "Camera unavailable");
      }
    })();
    return () => {
      mounted = false;
      streamRef.current?.getTracks().forEach((t) => t.stop());
      streamRef.current = null;
    };
  }, [withFeedback]);

  // Speak on pose change
  useEffect(() => {
    if (!pose || breakMode) return;
    cueIdxRef.current = 0;
    setSecsLeft(pose.durationSec);
    if (!muted) speak(`Next pose: ${pose.name}. ${pose.steps[0] ?? ""}`);
    return () => stopSpeaking();
  }, [idx, breakMode, pose, muted]);

  // Timer
  useEffect(() => {
    if (paused || breakMode || !pose) return;
    const t = setInterval(() => {
      setSecsLeft((s) => {
        if (s <= 1) {
          // advance
          if (idx + 1 >= poses.length) {
            clearInterval(t);
            stopSpeaking();
            setTimeout(onDone, 200);
            return 0;
          }
          setIdx((i) => i + 1);
          return poses[idx + 1]?.durationSec ?? 30;
        }
        // periodic voice cues
        const elapsed = pose.durationSec - s;
        if (withFeedback && !muted && elapsed > 0 && elapsed % 10 === 0) {
          const nextCue = pose.steps[(cueIdxRef.current + 1) % pose.steps.length];
          cueIdxRef.current++;
          const formCue = withFeedback && camOk ? " I see your form — keep shoulders relaxed." : "";
          speak(`${nextCue}${formCue}`);
        }
        return s - 1;
      });
    }, 1000);
    return () => clearInterval(t);
  }, [paused, breakMode, idx, pose, poses, onDone, withFeedback, muted, camOk]);

  if (!pose) return null;

  const progress = ((pose.durationSec - secsLeft) / pose.durationSec) * 100;
  const overallProgress = ((idx + (pose.durationSec - secsLeft) / pose.durationSec) / poses.length) * 100;

  return (
    <div className="mt-4 animate-float-up">
      {/* Overall */}
      <div className="rounded-full bg-secondary p-1 ring-1 ring-border/60">
        <div className="h-1.5 rounded-full bg-primary transition-all" style={{ width: `${overallProgress}%` }} />
      </div>
      <p className="mt-2 text-center text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
        Pose {idx + 1} of {poses.length}
      </p>

      {/* Camera */}
      {withFeedback && (
        <div className="mt-3 overflow-hidden rounded-3xl bg-foreground/95 shadow-[var(--shadow-tile)]">
          <div className="relative aspect-[4/3] w-full">
            <video ref={videoRef} playsInline muted className="h-full w-full object-cover" style={{ transform: "scaleX(-1)" }} />
            {camOk === null && (
              <div className="absolute inset-0 grid place-items-center bg-foreground/80 text-card text-sm">Requesting camera…</div>
            )}
            {camOk === false && (
              <div className="absolute inset-0 grid place-items-center bg-foreground/80 px-6 text-center text-sm text-card">
                Camera unavailable. {camError}
              </div>
            )}
            {camOk && (
              <div className="absolute left-3 top-3 flex items-center gap-1.5 rounded-full bg-foreground/60 px-2.5 py-1 text-[10px] font-semibold text-card backdrop-blur">
                <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-destructive" /> AI watching
              </div>
            )}
            {camOk && !muted && (
              <div className="absolute right-3 top-3 flex items-center gap-1.5 rounded-full bg-foreground/60 px-2.5 py-1 text-[10px] font-semibold text-card backdrop-blur">
                <Mic size={11} /> Voice on
              </div>
            )}
          </div>
        </div>
      )}

      {/* Pose card */}
      <div className="mt-4 rounded-3xl p-6 text-center text-primary-foreground shadow-[var(--shadow-tile)]" style={{ background: "var(--gradient-leaf)" }}>
        <p className="text-5xl">{pose.emoji}</p>
        <h2 className="mt-3 font-display text-2xl font-semibold">{pose.name}</h2>
        <p className="text-xs opacity-85">{pose.sanskrit}</p>
        <div className="mx-auto mt-4 flex h-24 w-24 items-center justify-center rounded-full bg-card/20 text-3xl font-semibold backdrop-blur-sm">
          {secsLeft}
        </div>
        <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-card/25">
          <div className="h-full bg-card/90 transition-all" style={{ width: `${progress}%` }} />
        </div>
      </div>

      {/* Cue */}
      <div className="mt-4 rounded-2xl bg-card p-4 text-sm text-foreground/85 ring-1 ring-border/60">
        {pose.steps[Math.min(cueIdxRef.current, pose.steps.length - 1)]}
      </div>

      {/* Controls */}
      <div className="mt-4 flex items-center justify-center gap-3">
        <button
          onClick={() => setMuted((m) => { const n = !m; if (n) stopSpeaking(); return n; })}
          className="flex h-12 w-12 items-center justify-center rounded-full bg-card ring-1 ring-border/60"
          aria-label={muted ? "Unmute" : "Mute"}
        >
          {muted ? <VolumeX size={20} /> : <Volume2 size={20} />}
        </button>
        <button
          onClick={() => { setBreakMode((b) => !b); stopSpeaking(); }}
          className="rounded-full bg-secondary px-4 py-3 text-xs font-semibold"
        >
          {breakMode ? "Resume" : "Take break"}
        </button>
        <button
          onClick={() => setPaused((p) => !p)}
          className="flex h-14 w-14 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-[var(--shadow-glow)]"
          aria-label={paused ? "Play" : "Pause"}
        >
          {paused ? <Play size={22} /> : <Pause size={22} />}
        </button>
        <button
          onClick={() => {
            stopSpeaking();
            if (idx + 1 >= poses.length) onDone();
            else { setIdx((i) => i + 1); }
          }}
          className="flex h-12 w-12 items-center justify-center rounded-full bg-card ring-1 ring-border/60"
          aria-label="Skip"
        >
          <SkipForward size={20} />
        </button>
      </div>

      {breakMode && (
        <div className="mt-4 rounded-2xl bg-accent/30 p-4 text-center text-sm font-medium text-primary">
          Break mode — breathe and resume when ready.
        </div>
      )}
    </div>
  );
}

// ---------- Complete ----------
function CompleteStep({ onBack }: { onBack: () => void }) {
  const navigate = useNavigate();
  useEffect(() => { speak("Good job. You completed your practice."); return () => stopSpeaking(); }, []);
  return (
    <div className="mt-16 flex flex-col items-center text-center animate-float-up">
      <div className="flex h-28 w-28 items-center justify-center rounded-full text-primary-foreground animate-breathe" style={{ background: "var(--gradient-gold)" }}>
        <Sparkles size={36} />
      </div>
      <h1 className="mt-6 font-display text-3xl font-semibold">Good job! 🙏</h1>
      <p className="mt-2 max-w-xs text-sm text-muted-foreground">
        You showed up for yourself. Notice how your body and breath feel right now.
      </p>
      <div className="mt-7 grid w-full grid-cols-2 gap-3">
        <button
          onClick={onBack}
          className="rounded-2xl bg-card py-3 text-sm font-semibold ring-1 ring-border/60"
        >
          New plan
        </button>
        <button
          onClick={() => navigate({ to: "/dashboard" })}
          className="rounded-2xl bg-primary py-3 text-sm font-semibold text-primary-foreground shadow-[var(--shadow-glow)]"
        >
          Back to today
        </button>
      </div>
    </div>
  );
}
