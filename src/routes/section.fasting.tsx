import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import {
  ArrowLeft, Hourglass, Sparkles, Check, ChevronRight,
  Clock, Flame, Droplets, AlertCircle, ExternalLink, Salad, Leaf, Heart,
  Droplet, Moon, Footprints, Music,
} from "lucide-react";
import { BottomNav } from "@/components/BottomNav";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import {
  IF_WINDOWS, FAST_TIMELINE, IF_BENEFITS, IF_CAUTION, IF_RULES,
  EVOLUTION_GYAN, FASTING_TYPES, recommendMeals, savePlan,
  HUNGER_TIPS, FAST_CATEGORIES, IF_RECOMMENDATION_TIERS,
  type IFWindow, type MealCount, type Goal, type FastingPlan, type DaysPattern,
  type FastingType, type MealSuggestion, type RecTier,
} from "@/lib/fasting";
import { WLPipelineBanner } from "@/components/WLPipeline";
import { DiseasePipelineBanner } from "@/components/DiseasePipeline";
import {
  patchPlan, advancePipeline, getPipeline, PIPELINE_ROUTE, clearPipeline,
} from "@/lib/weight-loss";
import { QuizRunner } from "@/components/QuizRunner";
import { IFMealTimes } from "@/components/IFMealTimes";

export const Route = createFileRoute("/section/fasting")({
  head: () => ({
    meta: [
      { title: "Fasting & IF · AyuRaise" },
      { name: "description", content: "Intermittent fasting windows, Ayurvedic fasting and your personalized plan." },
    ],
  }),
  component: FastingSection,
});

function FastingSection() {
  const [tab, setTab] = useState<"if" | "fasting">("if");
  const [showPlan, setShowPlan] = useState<null | "if" | "fasting">(null);

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
            Fasting & IF
          </p>
          <div className="w-10" />
        </div>
        <WLPipelineBanner currentSlug="fasting" />
        <DiseasePipelineBanner currentSlug="fasting" />

        {/* Hero */}
        <div className="mt-4 rounded-3xl p-5 text-primary-foreground shadow-[var(--shadow-soft)]" style={{ background: "var(--gradient-dawn)" }}>
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-card/25 backdrop-blur-sm">
              <Hourglass size={22} strokeWidth={1.7} />
            </div>
            <div>
              <h1 className="font-display text-2xl font-semibold">Fasting & IF</h1>
              <p className="text-xs text-primary-foreground/80">Tuned to your body. Rooted in Ayurveda.</p>
            </div>
          </div>
        </div>

        {/* Pick IF or Fasting first */}
        <Tabs value={tab} onValueChange={(v) => setTab(v as "if" | "fasting")} className="mt-5">
          <TabsList className="grid w-full grid-cols-2 rounded-2xl bg-card/70 p-1 ring-1 ring-border/60">
            <TabsTrigger value="if" className="rounded-xl text-sm">Intermittent Fasting</TabsTrigger>
            <TabsTrigger value="fasting" className="rounded-xl text-sm">Fasting</TabsTrigger>
          </TabsList>

          <TabsContent value="if" className="mt-4">
            {/* Create my IF plan — inside the IF tab */}
            <button
              onClick={() => setShowPlan("if")}
              className="mb-4 flex w-full items-center justify-center gap-2 rounded-2xl bg-primary px-5 py-3 text-sm font-semibold text-primary-foreground shadow-[var(--shadow-glow)] transition-transform active:scale-[0.98]"
            >
              <Sparkles size={16} /> Create my IF plan
            </button>
            <SubTabs section="if" />
          </TabsContent>

          <TabsContent value="fasting" className="mt-4">
            <button
              onClick={() => setShowPlan("fasting")}
              className="mb-4 flex w-full items-center justify-center gap-2 rounded-2xl bg-card px-5 py-3 text-sm font-semibold text-foreground ring-1 ring-border/60 shadow-[var(--shadow-soft)] transition-transform active:scale-[0.98]"
            >
              <Sparkles size={16} /> Create my Fasting plan
            </button>
            <SubTabs section="fasting" />
          </TabsContent>
        </Tabs>
      </div>

      {showPlan && (
        <PlanFlow kind={showPlan} onClose={() => setShowPlan(null)} />
      )}

      <BottomNav />
    </div>
  );
}

/* ---------------- Sub-tabs (About / Hunger / Quiz) ---------------- */
function SubTabs({ section }: { section: "if" | "fasting" }) {
  return (
    <Tabs defaultValue="about" className="w-full">
      <TabsList className="grid w-full grid-cols-3 rounded-2xl bg-muted/70 p-1 ring-1 ring-border/60">
        <TabsTrigger value="about" className="rounded-xl text-xs">About</TabsTrigger>
        <TabsTrigger value="hunger" className="rounded-xl text-xs">Overcome Hunger</TabsTrigger>
        <TabsTrigger value="quiz" className="rounded-xl text-xs">Quiz</TabsTrigger>
      </TabsList>
      <TabsContent value="about" className="mt-4">
        {section === "if" ? <IFTab /> : <FastingTab />}
      </TabsContent>
      <TabsContent value="hunger" className="mt-4">
        <HungerTab variant={section} />
      </TabsContent>
      <TabsContent value="quiz" className="mt-4">
        <QuizRunner quizId={section === "if" ? "if" : "fasting"} />
      </TabsContent>
    </Tabs>
  );
}

/* ---------------- Overcome Hunger tab ---------------- */
function HungerTab({ variant }: { variant: "if" | "fasting" }) {
  return (
    <div className="space-y-4">
      <Card>
        <h2 className="font-display text-lg font-semibold">
          {variant === "if" ? "Ride out hunger — without breaking your fast" : "Long-fast survival kit"}
        </h2>
        <p className="mt-2 text-sm leading-relaxed text-foreground/80">
          Hunger comes in waves of ~20 minutes. The trick isn't to fight it — it's to ride the wave with water,
          warmth, distraction and electrolytes. Use these tools whenever a wave hits.
        </p>
      </Card>

      {HUNGER_TIPS.map((g) => (
        <Card key={g.group}>
          <h3 className="font-display text-base font-semibold text-foreground">{g.group}</h3>
          <ul className="mt-3 space-y-2 text-sm text-foreground/85">
            {g.items.map((t) => (
              <li key={t} className="flex items-start gap-2">
                <Check size={14} className="mt-0.5 shrink-0 text-primary" />
                <span>{t}</span>
              </li>
            ))}
          </ul>
        </Card>
      ))}

      {variant === "fasting" && (
        <Card tone="warn">
          <div className="flex items-center gap-2">
            <AlertCircle size={16} className="text-amber-700" />
            <h3 className="font-display text-base font-semibold text-amber-900">Extended-fast specific</h3>
          </div>
          <ul className="mt-2 space-y-1 text-xs text-amber-900/90">
            <li>• Beyond 48h, do it under medical supervision</li>
            <li>• Refeed slowly — bone broth, fruit, khichdi for the first day after</li>
            <li>• Stop and break the fast if you feel sustained dizziness, palpitations or confusion</li>
            <li>• Pregnancy, T1 diabetes, eating-disorder history — fasting is not for you</li>
          </ul>
        </Card>
      )}

      <div className="grid grid-cols-4 gap-2 pt-1">
        {[
          { icon: Droplet, label: "Hydrate" },
          { icon: Footprints, label: "Walk" },
          { icon: Music, label: "Distract" },
          { icon: Moon, label: "Sleep" },
        ].map(({ icon: Icon, label }) => (
          <div key={label} className="flex flex-col items-center gap-1.5 rounded-2xl bg-card p-3 ring-1 ring-border/60">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-accent/40 text-primary">
              <Icon size={16} />
            </div>
            <p className="text-[11px] font-semibold text-foreground">{label}</p>
          </div>
        ))}
      </div>
    </div>
  );
}


/* ---------------- IF Tab ---------------- */
function IFTab() {
  return (
    <div className="space-y-5">
      <Card>
        <h2 className="font-display text-lg font-semibold">What IF actually is</h2>
        <p className="mt-2 text-sm leading-relaxed text-foreground/80">
          Intermittent fasting isn't starving and it isn't a diet. You simply give your body a long, predictable
          break from food each day. During the fasting window only water, black coffee, plain tea — anything with
          calories ends the fast.
        </p>
      </Card>

      <Card>
        <h2 className="font-display text-lg font-semibold">Inside your body, hour by hour</h2>
        <ul className="mt-3 space-y-3">
          {FAST_TIMELINE.map((t) => (
            <li key={t.atHour} className="flex gap-3">
              <div className="flex h-10 w-12 shrink-0 items-center justify-center rounded-xl bg-accent/40 font-display text-sm font-semibold text-primary">
                {t.atHour}h
              </div>
              <div>
                <p className="text-sm font-semibold">{t.emoji} {t.title}</p>
                <p className="text-xs text-muted-foreground">{t.detail}</p>
              </div>
            </li>
          ))}
        </ul>
      </Card>

      <Card>
        <h2 className="font-display text-lg font-semibold">Benefits people actually feel</h2>
        <div className="mt-3 grid grid-cols-2 gap-2.5">
          {IF_BENEFITS.map((b) => (
            <div key={b.title} className="flex items-center gap-2 rounded-xl bg-secondary/40 px-3 py-2 text-xs">
              <span>{b.emoji}</span>{b.title}
            </div>
          ))}
        </div>
      </Card>

      <Card>
        <h2 className="font-display text-lg font-semibold">Pick a window — gradually</h2>
        <p className="mt-1 text-xs text-muted-foreground">
          Start gentle. Move up only when the current window feels easy for 2–3 weeks.
        </p>
        <div className="mt-3">
          <IFLadder />
        </div>
      </Card>

      <Card>
        <h2 className="font-display text-lg font-semibold">Why our body is wired for this</h2>
        <div className="mt-3 space-y-3">
          {EVOLUTION_GYAN.map((g) => (
            <div key={g.title}>
              <p className="text-sm font-semibold">{g.title}</p>
              <p className="text-xs leading-relaxed text-muted-foreground">{g.body}</p>
            </div>
          ))}
        </div>
        <a
          href="https://health.clevelandclinic.org/intermittent-fasting-4-different-types-explained"
          target="_blank" rel="noopener noreferrer"
          className="mt-4 inline-flex items-center gap-1.5 text-xs font-semibold text-primary"
        >
          Read more on Cleveland Clinic <ExternalLink size={12} />
        </a>
      </Card>

      <Card>
        <h2 className="font-display text-lg font-semibold">Do this, skip that</h2>
        <div className="mt-3 space-y-3">
          {IF_RULES.map((r) => (
            <div key={r.title} className="flex gap-3">
              <Check size={16} className="mt-0.5 shrink-0 text-primary" />
              <div>
                <p className="text-sm font-semibold">{r.title}</p>
                <p className="text-xs text-muted-foreground">{r.detail}</p>
              </div>
            </div>
          ))}
        </div>
      </Card>

      <Card tone="warn">
        <div className="flex items-center gap-2">
          <AlertCircle size={16} className="text-amber-700" />
          <h2 className="font-display text-base font-semibold text-amber-900">Not for everyone</h2>
        </div>
        <ul className="mt-2 space-y-1 text-xs text-amber-900/90">
          {IF_CAUTION.map((c) => <li key={c}>• {c}</li>)}
        </ul>
      </Card>
    </div>
  );
}

/* ---------------- Fasting Tab ---------------- */
function FastingTab() {
  return (
    <div className="space-y-5">
      <Card>
        <h2 className="font-display text-lg font-semibold">What we mean by Fasting</h2>
        <p className="mt-2 text-sm leading-relaxed text-foreground/80">
          A fasting day is more than just a long IF window. It's a chosen day — or several days — where you
          eat under ~500 calories, go grain-free, take only fruits, or drink only water. Done right, it
          triggers deeper autophagy and gives every organ a proper rest.
        </p>
      </Card>

      <Card>
        <h2 className="font-display text-lg font-semibold">Fasting vs Intermittent Fasting</h2>
        <div className="mt-3 grid grid-cols-2 gap-3 text-xs">
          <div className="rounded-2xl bg-accent/40 p-3">
            <p className="font-semibold text-primary">Intermittent Fasting</p>
            <ul className="mt-2 space-y-1 text-foreground/85">
              <li>• Daily rhythm</li>
              <li>• 12–23h fasting window</li>
              <li>• Normal eating in the window</li>
              <li>• Sustainable long term</li>
            </ul>
          </div>
          <div className="rounded-2xl bg-secondary/40 p-3">
            <p className="font-semibold">Fasting</p>
            <ul className="mt-2 space-y-1 text-foreground/85">
              <li>• Chosen days (not daily)</li>
              <li>• 24h to multi-day</li>
              <li>• Water / juice / fruit / khichdi</li>
              <li>• Therapeutic or spiritual</li>
            </ul>
          </div>
        </div>
      </Card>

      <Card>
        <h2 className="font-display text-lg font-semibold">Types of fasts</h2>
        <p className="mt-1 text-xs text-muted-foreground">From gentle vrat to extended water fasts.</p>
        <div className="mt-3 space-y-2.5">
          {FAST_CATEGORIES.map((c) => (
            <details key={c.title} className="rounded-2xl bg-secondary/30 p-3">
              <summary className="flex cursor-pointer items-center gap-2 text-sm font-semibold">
                <span className="text-base">{c.emoji}</span>
                <span className="flex-1">{c.title}</span>
              </summary>
              <ul className="mt-2 space-y-1 text-xs text-foreground/85">
                {c.items.map((i) => <li key={i}>• {i}</li>)}
              </ul>
              {c.note && <p className="mt-2 rounded-xl bg-amber-50 p-2 text-[11px] text-amber-900 dark:bg-amber-950/30 dark:text-amber-100">⚠ {c.note}</p>}
            </details>
          ))}
        </div>
      </Card>


      <Card>
        <h2 className="font-display text-lg font-semibold">Ramp into a long fast</h2>
        <p className="mt-2 text-sm text-foreground/80">
          For a 2-day water fast: eat fruits and light food the day before, switch to watermelon juice / coconut
          water on the prep day, then go water-only. Keep sodium, potassium and magnesium going — a pinch of
          pink salt or an electrolyte tab does the job. Anything beyond 48h needs medical clearance.
        </p>
      </Card>

      <Card tone="warn">
        <div className="flex items-center gap-2">
          <AlertCircle size={16} className="text-amber-700" />
          <h2 className="font-display text-base font-semibold text-amber-900">Stay safe</h2>
        </div>
        <p className="mt-2 text-xs text-amber-900/90">
          Long water fasts (more than 2 days) can stress the heart. Talk to a doctor first if you have any
          cardiac, kidney or blood pressure condition, or take regular medication.
        </p>
      </Card>
    </div>
  );
}

/* ---------------- Plan flow (modal sheet) ---------------- */

type Step =
  | "goal"
  | "if-goal"
  | "diet-or-not"
  | "window"
  | "meals"
  | "meal-combo"
  | "cycles"
  | "tips"
  | "name-save"
  | "days"
  | "fasting-type"
  | "summary";

type MealSlot = "Breakfast" | "Brunch" | "Lunch" | "Snack" | "Dinner";

function PlanFlow({ kind, onClose }: { kind: "if" | "fasting"; onClose: () => void }) {
  const navigate = useNavigate();
  // IF now starts with its own goal question. Fasting still starts at goal.
  const [step, setStep] = useState<Step>(kind === "if" ? "if-goal" : "goal");
  const [goal, setGoal] = useState<Goal>("healthy-living");
  const [windowId, setWindowId] = useState<IFWindow>("16:8");
  const [meals, setMeals] = useState<MealCount>(2);
  const [mealCombo, setMealCombo] = useState<MealSlot[] | null>(null);
  const [days, setDays] = useState<DaysPattern>("all");
  const [fastingType, setFastingType] = useState<FastingType>("traditional");
  const [planName, setPlanName] = useState<string>("");

  const mealPlan = useMemo(
    () => kind === "if" ? recommendMeals(windowId, meals) : [],
    [kind, windowId, meals]
  );

  const goalsList: { id: Goal; label: string; emoji: string }[] = [
    { id: "healthy-living", label: "Healthy living", emoji: "🌿" },
    { id: "autophagy",      label: "Autophagy / cellular reset", emoji: "♻️" },
    { id: "longevity",      label: "Longevity",     emoji: "⏳" },
    { id: "weight-loss",    label: "Weight loss",   emoji: "⚖️" },
    { id: "gut-reset",      label: "Gut reset",     emoji: "🌀" },
  ];

  const mealCombos: MealSlot[][] = useMemo(() => {
    const eatHrs = windowId === "OMAD" ? 1 : Number(windowId.split(":")[1]);
    if (meals === 1) return [["Lunch"], ["Dinner"]];
    if (meals === 2)
      return eatHrs <= 5
        ? [["Breakfast", "Lunch"], ["Brunch", "Dinner"], ["Lunch", "Dinner"]]
        : [["Breakfast", "Dinner"], ["Lunch", "Dinner"], ["Brunch", "Dinner"]];
    return [["Breakfast", "Lunch", "Dinner"], ["Brunch", "Snack", "Dinner"]];
  }, [windowId, meals]);

  function save() {
    const plan: FastingPlan = {
      kind,
      goal,
      windowId: kind === "if" ? windowId : undefined,
      meals: kind === "if" ? meals : undefined,
      mealPlan: kind === "if" ? mealPlan : undefined,
      daysPattern: days,
      fastingType: kind === "fasting" ? fastingType : undefined,
      createdAt: Date.now(),
    };
    savePlan(plan);
    try {
      const name = (planName.trim() || (kind === "if" ? "My IF plan" : "My fasting plan")).slice(0, 60);
      const existingRaw = localStorage.getItem("ayuraise.fastingPlans");
      const existing = existingRaw ? JSON.parse(existingRaw) : [];
      localStorage.setItem(
        "ayuraise.fastingPlans",
        JSON.stringify([{ id: `fp_${Date.now()}`, name, createdAt: Date.now(), plan }, ...existing]),
      );
    } catch {}
    // Pipeline integration
    const q = getPipeline();
    if (q[0] === "fasting") {
      patchPlan({
        fastingPrefs: { window: kind === "if" ? windowId : undefined, type: kind === "fasting" ? fastingType : "IF" },
        fastingWindow: kind === "if" ? (windowId as any) : undefined,
        includeFasting: true,
      });
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
          <h2 className="font-display text-xl font-semibold">
            {kind === "if" ? "Build my IF plan" : "Build my Fasting plan"}
          </h2>
          <button onClick={onClose} className="text-sm text-muted-foreground">Close</button>
        </div>

        {step === "goal" && kind === "fasting" && (
          <StepCard title="What's your goal?">
            <div className="space-y-2">
              {goalsList.map((g) => (
                <button
                  key={g.id}
                  onClick={() => setGoal(g.id)}
                  className={`flex w-full items-center gap-3 rounded-2xl border p-3 text-left text-sm ${
                    goal === g.id ? "border-primary bg-primary/10" : "border-border/60 bg-secondary/30"
                  }`}
                >
                  <span className="text-lg">{g.emoji}</span>
                  <span className="font-medium">{g.label}</span>
                </button>
              ))}
            </div>
            <NextBtn onClick={() => setStep("fasting-type")} />
          </StepCard>
        )}

        {step === "if-goal" && kind === "if" && (
          <StepCard title="What's your primary goal with IF?">
            <p className="-mt-2 mb-3 text-xs text-muted-foreground">
              Pick one — we'll take you to the right flow.
            </p>
            <div className="space-y-2">
              {[
                { id: "longevity",    label: "Longevity & healthy ageing", emoji: "⏳" },
                { id: "lose",         label: "Lose weight",                emoji: "⚖️" },
                { id: "gain",         label: "Gain healthy weight",        emoji: "💪" },
                { id: "improve",      label: "Improve an existing disease / illness", emoji: "🩺" },
                { id: "prevent",      label: "Prevent a disease",          emoji: "🛡️" },
              ].map((g) => (
                <button
                  key={g.id}
                  onClick={() => {
                    if (g.id === "lose" || g.id === "gain") {
                      onClose();
                      navigate({ to: "/section/weight-loss" });
                    } else if (g.id === "improve" || g.id === "prevent") {
                      onClose();
                      navigate({ to: "/section/$slug", params: { slug: "disease" } });
                    } else {
                      // Longevity — continue in the IF flow
                      setGoal("longevity");
                      setStep("diet-or-not");
                    }
                  }}
                  className="flex w-full items-center gap-3 rounded-2xl border border-border/60 bg-secondary/30 p-3 text-left"
                >
                  <span className="text-lg">{g.emoji}</span>
                  <span className="flex-1 text-sm font-medium">{g.label}</span>
                  <ChevronRight size={16} />
                </button>
              ))}
            </div>
          </StepCard>
        )}

        {step === "diet-or-not" && kind === "if" && (
          <StepCard title="Do you want a diet plan with your IF?">
            <p className="-mt-2 mb-3 text-xs text-muted-foreground">
              Pick one — we'll route you accordingly.
            </p>
            <div className="space-y-2">
              <button
                onClick={() => {
                  onClose();
                  navigate({ to: "/combined-plan", search: { goal: "diet" as const, from: "if" as const } });
                }}
                className="flex w-full items-center gap-3 rounded-2xl border border-primary bg-primary/10 p-3 text-left"
              >
                <span className="text-lg">🥗</span>
                <div className="flex-1">
                  <p className="text-sm font-semibold">Yes — IF + diet plan</p>
                </div>
                <ChevronRight size={16} className="text-primary" />
              </button>
              <button
                onClick={() => setStep("window")}
                className="flex w-full items-center gap-3 rounded-2xl border border-border/60 bg-secondary/30 p-3 text-left"
              >
                <span className="text-lg">⏱️</span>
                <div className="flex-1">
                  <p className="text-sm font-semibold">No — just my IF schedule</p>
                  <p className="text-xs text-muted-foreground">Schedule, meal timings and hunger tips only.</p>
                </div>
                <ChevronRight size={16} />
              </button>
            </div>
          </StepCard>
        )}

        {step === "window" && kind === "if" && (
          <StepCard title="Pick your fasting window — gradually">
            <p className="-mt-2 mb-3 text-xs text-muted-foreground">
              Start gentle. We recommend <b>12 or 14 hrs with 3 meals</b> before moving to 16/18.
            </p>
            <IFLadder windowId={windowId} setWindowId={setWindowId} />
            <NextBtn onClick={() => setStep("meals")} />
          </StepCard>
        )}

        {step === "meals" && kind === "if" && (() => {
          const eatHrs = windowId === "OMAD" ? 1 : Number(windowId.split(":")[1]);
          const opts = (windowId === "OMAD" ? [1] : (eatHrs >= 6 ? [2, 3] : [2])) as MealCount[];
          return (
            <StepCard title="Your meals in the eating window">
              <p className="-mt-2 mb-3 text-xs text-muted-foreground">
                Ayurveda recommends 2–3 meals a day — both are healthy.
              </p>
              <div className="rounded-2xl bg-accent/40 p-4 ring-1 ring-border/60">
                <ul className="grid gap-1.5 text-[13px] text-foreground/85">
                  <li className="flex items-start gap-2"><Check size={14} className="mt-0.5 shrink-0 text-primary" />Eat your heaviest meal between 12–2 pm when agni (digestive fire) peaks.</li>
                  <li className="flex items-start gap-2"><Check size={14} className="mt-0.5 shrink-0 text-primary" />Keep ~4 hrs between meals so digestion resets fully.</li>
                  <li className="flex items-start gap-2"><Check size={14} className="mt-0.5 shrink-0 text-primary" />Finish your last meal 2–3 hrs before sleep — supports detox & deep sleep.</li>
                  <li className="flex items-start gap-2"><Check size={14} className="mt-0.5 shrink-0 text-primary" />Warm, cooked, freshly prepared food beats cold or leftover meals.</li>
                  <li className="flex items-start gap-2"><Check size={14} className="mt-0.5 shrink-0 text-primary" />Both 2 and 3 meals work well in your {windowId} window — pick what fits your hunger.</li>
                </ul>
              </div>
              <div className="mt-3 space-y-2">
                {opts.map((n) => {
                  const active = meals === n;
                  const label = n === 1 ? "1 large meal (OMAD)" : `${n} meals`;
                  return (
                    <button
                      key={n}
                      onClick={() => { setMeals(n); setMealCombo(null); }}
                      className={`w-full rounded-2xl border p-3 text-left text-sm font-semibold ${
                        active ? "border-primary bg-primary/10" : "border-border/60 bg-secondary/30"
                      }`}
                    >
                      {label}
                    </button>
                  );
                })}
              </div>

              {windowId !== "OMAD" && (
                <IFMealTimes window={windowId} meals={meals} />
              )}

              <NextBtn onClick={() => setStep(meals === 1 ? "cycles" : "meal-combo")} />
            </StepCard>
          );
        })()}


        {step === "meal-combo" && kind === "if" && (
          <StepCard title="Pick your meal combination">
            <p className="-mt-2 mb-3 text-xs text-muted-foreground">
              For {meals} meal{meals > 1 ? "s" : ""} in a {windowId} window.
            </p>
            <div className="space-y-2">
              {mealCombos.map((c) => {
                const key = c.join(" + ");
                const active = mealCombo && mealCombo.join(" + ") === key;
                return (
                  <button
                    key={key}
                    onClick={() => setMealCombo(c)}
                    className={`w-full rounded-2xl border p-3 text-left text-sm font-semibold ${
                      active ? "border-primary bg-primary/10" : "border-border/60 bg-secondary/30"
                    }`}
                  >
                    {key}
                  </button>
                );
              })}
            </div>
            <NextBtn onClick={() => setStep("cycles")} />
          </StepCard>
        )}

        {step === "cycles" && kind === "if" && (
          <StepCard title="Your body follows cycles">
            <div className="rounded-2xl bg-accent/40 p-3 ring-1 ring-border/60 space-y-1.5 text-[12.5px] text-foreground/85">
              <p>✓ Hormones (insulin, ghrelin, cortisol) adapt over 2–4 weeks of consistent IF.</p>
              <p>✓ Constant flipping between IF and regular eating confuses the rhythm.</p>
              <p>✓ Do IF for a stretch (days/weeks), then return to regular eating for a phase.</p>
              <p>✓ Listen to your body — energy, sleep & digestion are your signals.</p>
            </div>
            <NextBtn onClick={() => setStep("tips")} label="Got it" />
          </StepCard>
        )}

        {step === "tips" && kind === "if" && (
          <StepCard title="Best IF practices to avoid feeling hungry">
            <div className="space-y-3">
              {HUNGER_TIPS.slice(0, 4).map((g) => (
                <div key={g.group} className="rounded-2xl bg-secondary/30 p-3">
                  <p className="text-sm font-semibold">{g.group}</p>
                  <ul className="mt-2 space-y-1 text-xs text-foreground/85">
                    {g.items.slice(0, 3).map((t) => (
                      <li key={t} className="flex items-start gap-1.5"><Check size={12} className="mt-0.5 shrink-0 text-primary" />{t}</li>
                    ))}
                  </ul>
                </div>
              ))}
              <p className="rounded-xl bg-accent/40 p-3 text-[11px] text-foreground/85">
                Read the full <b>Overcome Hunger</b> tab any time inside the IF section.
              </p>
            </div>
            <NextBtn onClick={() => setStep("name-save")} label="Continue" />
          </StepCard>
        )}

        {step === "name-save" && kind === "if" && (
          <StepCard title="Name & save your IF plan">
            <div className="rounded-2xl bg-card p-3 ring-1 ring-border/60">
              <label className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                Name this plan (optional)
              </label>
              <input
                value={planName}
                onChange={(e) => setPlanName(e.target.value)}
                placeholder="e.g. My 16:8 reset"
                maxLength={60}
                className="mt-2 w-full rounded-xl bg-background px-3 py-2 text-sm ring-1 ring-border focus:outline-none focus:ring-2 focus:ring-primary/40"
              />
            </div>

            <div className="mt-3 space-y-2 rounded-2xl bg-secondary/30 p-3 text-sm">
              <SumRow icon={<Clock size={14} />} label="Window" value={windowId} />
              <SumRow icon={<Salad size={14} />} label="Meals" value={mealCombo ? mealCombo.join(" + ") : String(meals)} />
            </div>

            <div className="mt-4 rounded-2xl bg-primary/10 p-3 text-[12px] text-foreground/85 ring-1 ring-primary/30">
              Want any changes? Talk to our bot <b>AyurAIse</b> before saving — tweak window, timings or meals.
            </div>

            <div className="mt-3 grid gap-2">
              <Link
                to="/health"
                className="flex w-full items-center justify-center gap-2 rounded-2xl bg-card px-4 py-3 text-sm font-semibold text-primary ring-1 ring-primary/40"
              >
                <Sparkles size={16} /> Talk to AyurAIse to refine my plan
              </Link>
              <button
                onClick={() => {
                  const lines: string[] = [];
                  lines.push((planName.trim() || "My IF plan"));
                  lines.push(`Window: ${windowId}`);
                  lines.push(`Meals: ${mealCombo ? mealCombo.join(" + ") : meals}`);
                  lines.push("");
                  mealPlan.forEach((m) => lines.push(`  ${m.time}  ${m.label} — ${m.idea}`));
                  const blob = new Blob([lines.join("\n")], { type: "text/plain;charset=utf-8" });
                  const url = URL.createObjectURL(blob);
                  const a = document.createElement("a");
                  a.href = url;
                  a.download = `${(planName.trim() || "if-plan").replace(/[^a-z0-9-_ ]/gi, "").replace(/\s+/g, "-").toLowerCase()}.txt`;
                  document.body.appendChild(a);
                  a.click();
                  document.body.removeChild(a);
                  URL.revokeObjectURL(url);
                }}
                className="flex w-full items-center justify-center gap-2 rounded-2xl bg-card px-4 py-3 text-sm font-semibold text-foreground ring-1 ring-border"
              >
                Download plan (.txt)
              </button>
              <button
                onClick={save}
                className="flex w-full items-center justify-center gap-2 rounded-2xl px-4 py-3 text-sm font-semibold text-primary-foreground"
                style={{ background: "var(--gradient-leaf)" }}
              >
                <Check size={16} /> Save plan to dashboard
              </button>
            </div>
          </StepCard>
        )}

        {step === "fasting-type" && kind === "fasting" && (
          <StepCard title="Pick your fasting style">
            <div className="space-y-2">
              {FASTING_TYPES.map((f) => (
                <button
                  key={f.id}
                  onClick={() => setFastingType(f.id)}
                  className={`flex w-full items-start gap-3 rounded-2xl border p-3 text-left ${
                    fastingType === f.id ? "border-primary bg-primary/10" : "border-border/60 bg-secondary/30"
                  }`}
                >
                  <div className="flex-1">
                    <p className="text-sm font-semibold">{f.title}</p>
                    <p className="text-xs text-muted-foreground">{f.blurb}</p>
                  </div>
                  <span className={`rounded-full px-2 py-0.5 text-[10px] font-bold uppercase ${
                    f.level === "easy" ? "bg-green-100 text-green-800" :
                    f.level === "medium" ? "bg-amber-100 text-amber-800" :
                    "bg-rose-100 text-rose-800"
                  }`}>{f.level}</span>
                </button>
              ))}
            </div>
            <NextBtn onClick={() => setStep("days")} />
          </StepCard>
        )}

        {step === "days" && kind === "fasting" && (
          <StepCard title="Which days?">
            <div className="space-y-2">
              {([
                { id: "all",       label: "Every day" },
                { id: "alternate", label: "Alternate days" },
                { id: "weekdays",  label: "Weekdays only" },
                { id: "custom",    label: "Custom — I'll pick later" },
              ] as { id: DaysPattern; label: string }[]).map((d) => (
                <button
                  key={d.id}
                  onClick={() => setDays(d.id)}
                  className={`w-full rounded-2xl border p-3 text-left text-sm font-medium ${
                    days === d.id ? "border-primary bg-primary/10" : "border-border/60 bg-secondary/30"
                  }`}
                >
                  {d.label}
                </button>
              ))}
            </div>
            <NextBtn onClick={() => setStep("summary")} label="Review" />
          </StepCard>
        )}

        {step === "summary" && kind === "fasting" && (
          <StepCard title="Your plan">
            <div className="space-y-3 rounded-2xl bg-secondary/30 p-4 text-sm">
              <SumRow icon={<Heart size={14} />} label="Goal" value={goalsList.find(g => g.id === goal)?.label ?? goal} />
              <SumRow icon={<Flame size={14} />} label="Style" value={FASTING_TYPES.find(f => f.id === fastingType)?.title ?? ""} />
              <SumRow icon={<Droplets size={14} />} label="Days" value={days} />
            </div>

            <div className="mt-4 rounded-2xl border border-primary/30 bg-primary/5 p-3">
              <p className="text-xs font-semibold uppercase tracking-wider text-primary">Pairs well with</p>
              <div className="mt-2 flex flex-wrap gap-2">
                <Link to="/section/$slug" params={{ slug: "diet" }} className="rounded-full bg-card px-3 py-1.5 text-xs ring-1 ring-border/60">
                  <Leaf size={12} className="-mt-0.5 mr-1 inline" /> Diet plan
                </Link>
                <Link to="/section/$slug" params={{ slug: "detox" }} className="rounded-full bg-card px-3 py-1.5 text-xs ring-1 ring-border/60">
                  Add a detox
                </Link>
              </div>
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

/* ---------------- tiny UI helpers ---------------- */

function Card({ children, tone }: { children: React.ReactNode; tone?: "warn" }) {
  return (
    <div className={`rounded-3xl p-5 shadow-[var(--shadow-soft)] ring-1 ${
      tone === "warn" ? "bg-amber-50 ring-amber-200" : "bg-card ring-border/60"
    }`}>
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

function SumRow({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div className="flex items-center justify-between">
      <span className="flex items-center gap-2 text-muted-foreground">{icon}{label}</span>
      <span className="font-semibold capitalize">{value}</span>
    </div>
  );
}

/* ---------------- IF gradient ladder ---------------- */
const TIER_STYLES: Record<RecTier, { ring: string; bg: string; chip: string; label: string }> = {
  green:  { ring: "ring-emerald-400",  bg: "bg-emerald-50 dark:bg-emerald-950/30", chip: "bg-emerald-500 text-white", label: "Recommended" },
  yellow: { ring: "ring-amber-400",    bg: "bg-amber-50 dark:bg-amber-950/30",     chip: "bg-amber-500 text-white",   label: "Step up gradually" },
  orange: { ring: "ring-orange-400",   bg: "bg-orange-50 dark:bg-orange-950/30",   chip: "bg-orange-500 text-white",  label: "Advanced" },
  red:    { ring: "ring-rose-400",     bg: "bg-rose-50 dark:bg-rose-950/30",       chip: "bg-rose-600 text-white",    label: "Doctor go-ahead" },
};
function IFLadder({ windowId, setWindowId }: { windowId?: IFWindow; setWindowId?: (w: IFWindow) => void }) {
  const interactive = Boolean(setWindowId);
  return (
    <div className="space-y-2">
      {IF_RECOMMENDATION_TIERS.map((t) => {
        const st = TIER_STYLES[t.tier];
        const active = windowId === t.id;
        const Wrapper: any = interactive ? "button" : "div";
        return (
          <Wrapper
            key={t.id}
            {...(interactive ? { onClick: () => setWindowId!(t.id) } : {})}
            className={`flex w-full items-start gap-3 rounded-2xl ${st.bg} p-3 text-left ring-1 ${
              active ? `${st.ring} ring-2` : "ring-border/60"
            }`}
          >
            <div className="flex h-12 w-14 shrink-0 items-center justify-center rounded-xl bg-primary text-primary-foreground font-display text-sm font-bold">
              {t.id}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-1.5 flex-wrap">
                <span className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${st.chip}`}>{st.label}</span>
                <span className="text-[11px] font-semibold text-foreground">{t.recommendedMeals}</span>
              </div>
              <p className="mt-1 text-[12.5px] font-semibold text-foreground">{t.headline}</p>
              <p className="text-[11px] text-muted-foreground">{t.note}</p>
            </div>
          </Wrapper>
        );
      })}
    </div>
  );
}
