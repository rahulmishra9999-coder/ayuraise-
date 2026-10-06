import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useMemo, useRef, useState } from "react";
import { ArrowLeft } from "lucide-react";
import { BottomNav } from "@/components/BottomNav";
import { ALL_GOALS, getGoal } from "@/lib/goals";
import { loadYogaPlans, newPlanId, upsertYogaPlan, WEEKDAYS, type YogaPlan } from "@/lib/yoga-plan";
import { SUPPORT } from "@/lib/support";

export const Route = createFileRoute("/create")({
  validateSearch: (s: Record<string, unknown>): { goal?: string; edit?: string; goals?: string; tool?: string } => ({
    goal: typeof s.goal === "string" ? s.goal : undefined,
    edit: typeof s.edit === "string" ? s.edit : undefined,
    goals: typeof s.goals === "string" ? s.goals : undefined,
    tool: typeof s.tool === "string" ? s.tool : undefined,
  }),
  component: CreatePlan,
});

/* ---------- interventions we let the user personalize + how important each is ---------- */
type IvKey = "diet" | "yoga" | "exercise" | "fasting" | "detox" | "meditation";
const SELECTABLE: IvKey[] = ["yoga", "exercise", "diet"];
const IV_META: Record<string, { label: string; emoji: string }> = {
  diet: { label: "Diet", emoji: "🥗" },
  yoga: { label: "Yoga", emoji: "🧘" },
  exercise: { label: "Exercise", emoji: "🏋️" },
};
const GROUP_DEFAULT: Record<string, Partial<Record<IvKey, number>>> = {
  fitness: { exercise: 5, yoga: 4, diet: 4 },
  womens: { yoga: 5, diet: 4, exercise: 3 },
  organs: { diet: 5, yoga: 4 },
  conditions: { diet: 5, yoga: 4, exercise: 4 },
};
const GOAL_RANK: Record<string, Partial<Record<IvKey, number>>> = {
  diabetes: { diet: 5, exercise: 5, yoga: 4 },
  "weight-loss": { exercise: 5, diet: 5, yoga: 4 },
  obesity: { exercise: 5, diet: 5, yoga: 4 },
  thyroid: { diet: 5, yoga: 4, exercise: 3 },
  hypertension: { diet: 5, yoga: 5, exercise: 4 },
  cholesterol: { diet: 5, exercise: 5, yoga: 3 },
  "better-sleep": { yoga: 5, diet: 3 },
  stress: { yoga: 5, exercise: 3, diet: 3 },
  metabolic: { exercise: 5, diet: 5, yoga: 3 },
  heart: { exercise: 5, diet: 5, yoga: 4 },
  "fatty-liver": { diet: 5, exercise: 4, yoga: 3 },
  gut: { diet: 5, yoga: 4 },
  "acidity-gerd": { diet: 5, yoga: 4 },
  ibs: { diet: 5, yoga: 4 },
  constipation: { diet: 5, yoga: 4 },
  indigestion: { diet: 5, yoga: 4 },
  migraine: { yoga: 4, diet: 4 },
  asthma: { yoga: 5, diet: 3 },
  "knee-pain": { yoga: 5, exercise: 4 },
  "hip-pain": { yoga: 5, exercise: 4 },
  "back-pain": { yoga: 5, exercise: 4 },
  "neck-pain": { yoga: 5, exercise: 4 },
  sciatica: { yoga: 5, exercise: 4 },
  arthritis: { yoga: 5, exercise: 4, diet: 3 },
  osteoporosis: { exercise: 5, yoga: 4, diet: 4 },
  "healthy-ageing": { exercise: 5, yoga: 4, diet: 4 },
  "general-wellness": { yoga: 4, exercise: 4, diet: 4 },
  pregnancy: { yoga: 5, diet: 4 },
  "post-natal": { yoga: 5, exercise: 4, diet: 4 },
  "pcos-pcod": { diet: 5, exercise: 5, yoga: 4 },
  menopause: { exercise: 5, diet: 4, yoga: 4 },
};
function rankFor(goalIds: string[]): { key: IvKey; imp: number }[] {
  const merged: Record<string, number> = { diet: 0, yoga: 0, exercise: 0 };
  for (const id of goalIds) {
    const g = getGoal(id);
    const base = GOAL_RANK[id] ?? (g ? GROUP_DEFAULT[g.groupId] : undefined) ?? GROUP_DEFAULT.fitness;
    for (const k of SELECTABLE) merged[k] = Math.max(merged[k], base[k] ?? 0);
  }
  return SELECTABLE.map((k) => ({ key: k, imp: merged[k] || 3 })).sort((a, b) => b.imp - a.imp);
}

/* ---------- options ---------- */
const LEVELS = ["Beginner", "Intermediate", "Advanced"];
const DURATIONS = [10, 15, 20, 30, 45, 60];
const PROTECT = ["Knees", "Lower back", "Neck", "Shoulders", "Wrists", "Hips"];
const EX_FOCUS = ["Full body", "Upper body", "Lower body", "Core / Abs", "Cardio"];
const EQUIP = ["None (bodyweight)", "Dumbbells", "Resistance bands", "Full gym"];
const DIET_PREFS = ["Vegetarian", "Vegan", "Eggetarian", "Jain (no roots)", "No onion / garlic", "Gluten-free"];
const ALLERGENS = ["Dairy", "Nuts", "Peanuts", "Gluten", "Soy", "Eggs"];
const MAIN_MEALS = [1, 2, 3];
const MINI_MEALS_D = [0, 1, 2];

// Intermittent-fasting tiers: longer fasts leave room for fewer meals.
// maxMain / maxMini = the most meals that still fit inside that fasting window.
type FastTier = { lo: number; hi: number; meals: string; maxMain: number; maxMini: number };
const FAST_TIERS: FastTier[] = [
  { lo: 12, hi: 13, meals: "3 main + 1 mini / light meal", maxMain: 3, maxMini: 1 },
  { lo: 14, hi: 15, meals: "3 main meals", maxMain: 3, maxMini: 0 },
  { lo: 16, hi: 17, meals: "2 main + 1 light meal", maxMain: 2, maxMini: 1 },
  { lo: 18, hi: 19, meals: "2 main + a small drink", maxMain: 2, maxMini: 0 },
  { lo: 20, hi: 21, meals: "1 main + 1 mini meal", maxMain: 1, maxMini: 1 },
  { lo: 22, hi: 24, meals: "OMAD — one meal a day", maxMain: 1, maxMini: 0 },
];
const fastTier = (h: number): FastTier => FAST_TIERS.find((t) => h >= t.lo && h <= t.hi) ?? FAST_TIERS[FAST_TIERS.length - 1];
const fastLevel = (h: number) => (h <= 15 ? { name: "Beginner", color: "#22c55e" } : h <= 19 ? { name: "Medium", color: "#eab308" } : { name: "Advanced", color: "#ef4444" });
/** The longest fast that still fits the chosen number of meals. */
const maxFastForMeals = (main: number, mini: number): number => {
  const fit = FAST_TIERS.filter((t) => t.maxMain >= main && t.maxMini >= mini);
  return fit.length ? fit[fit.length - 1].hi : 12;
};
// What kicks in as the fast lengthens (hour reached → effect).
const FAST_STAGES: { h: number; t: string }[] = [
  { h: 12, t: "fat-burning begins" },
  { h: 14, t: "deeper fat-burn" },
  { h: 16, t: "ketosis starts" },
  { h: 18, t: "autophagy (cell clean-up)" },
  { h: 20, t: "deeper autophagy" },
  { h: 24, t: "growth-hormone peak" },
];
const DAYS_N = [2, 3, 4, 5, 6];

const MEDICAL_GROUPS = new Set(["conditions", "organs", "womens"]);
const DISEASE_Q: Record<string, { key: string; label: string; ph?: string }[]> = {
  diabetes: [{ key: "fbs", label: "Fasting sugar (mg/dL)", ph: "e.g. 130" }, { key: "hba1c", label: "HbA1c (%)", ph: "e.g. 7.2" }],
  hypertension: [{ key: "bp", label: "Usual BP", ph: "e.g. 140/90" }],
  cholesterol: [{ key: "ldl", label: "LDL (mg/dL)", ph: "e.g. 150" }],
  thyroid: [{ key: "tsh", label: "Latest TSH (mIU/L)", ph: "e.g. 4.2" }],
  "fatty-liver": [{ key: "grade", label: "Fatty-liver grade (if known)", ph: "e.g. Grade 2" }],
  asthma: [{ key: "trigger", label: "Main trigger (if known)", ph: "e.g. dust" }],
};

function chip(on: boolean) {
  return `rounded-full px-3.5 py-2 text-[12px] font-semibold transition ${on ? "bg-primary text-primary-foreground" : "bg-secondary text-foreground/75"}`;
}
function smChip(on: boolean) {
  return `rounded-lg px-2.5 py-1 text-[11px] font-bold transition ${on ? "bg-primary text-primary-foreground" : "bg-secondary text-foreground/75"}`;
}
/** A goal chip with a colored gradient emoji dot (keeps the picker from being a flat grey wall). */
function goalChipEl(id: string, selected: string[], toggle: (id: string) => void) {
  const g = ALL_GOALS[id];
  if (!g) return null;
  const on = selected.includes(id);
  const disabled = !on && selected.length >= 2;
  return (
    <button key={id} disabled={disabled} onClick={() => toggle(id)}
      className={`flex items-center gap-1.5 rounded-full py-1 pl-1 pr-3 text-[12px] font-semibold ring-1 transition ${on ? "bg-primary text-primary-foreground ring-primary" : disabled ? "bg-card/50 text-foreground/30 ring-border/40" : "bg-card text-foreground/85 ring-border/60"}`}>
      <span className="flex h-6 w-6 items-center justify-center rounded-full text-[12px] text-primary-foreground shadow-sm" style={{ background: g.gradient }}>{g.emoji}</span>
      {g.label}
    </button>
  );
}

const CREATE_COMMON = ["general-wellness", "weight-loss", "stress", "better-sleep", "healthy-ageing"];
const CREATE_CONDITIONS = ["diabetes", "thyroid", "migraine", "fatty-liver", "hypertension", "cholesterol", "gout", "asthma"];
const CREATE_UMBRELLAS: { id: string; label: string; emoji: string; gradient: string; ids: string[] }[] = [
  { id: "gut", label: "Gut & Digestion", emoji: "🌀", gradient: "var(--gradient-sage)", ids: ["gut", "acidity-gerd", "ibs", "constipation", "indigestion"] },
  { id: "joints", label: "Joints & Spine", emoji: "🦴", gradient: "var(--gradient-clay)", ids: ["knee-pain", "hip-pain", "back-pain", "neck-pain", "sciatica", "arthritis", "osteoporosis"] },
];
const CREATE_WOMENS = ["pregnancy", "post-natal", "pcos-pcod", "menopause"];


/** Small labelled screen wrapper so every question reads the same. */
function Q({ title, hint, children }: { title: string; hint?: string; children: React.ReactNode }) {
  return (
    <div>
      <h2 className="px-1 font-display text-[16px] font-bold text-foreground">{title}</h2>
      {hint && <p className="mb-3 mt-0.5 px-1 text-[11.5px] leading-snug text-muted-foreground">{hint}</p>}
      <div className={hint ? "" : "mt-3"}>{children}</div>
    </div>
  );
}

function CreatePlan() {
  const navigate = useNavigate();
  const { goal: preGoal, edit: editId, goals: preGoals, tool: preTool } = Route.useSearch();
  const editTool = preTool && SELECTABLE.includes(preTool as IvKey) ? (preTool as IvKey) : null; // "edit one tool" deep-link

  const seedGoals = preGoals ? preGoals.split(",").filter((id) => ALL_GOALS[id]).slice(0, 2) : (preGoal && ALL_GOALS[preGoal] ? [preGoal] : []);
  // came from the profile with goals already chosen → skip the goal page (start at "what to personalize")
  const [step, setStep] = useState(preGoals && seedGoals.length && !editId ? 1 : 0);
  const [goals, setGoals] = useState<string[]>(seedGoals);
  const [ivs, setIvs] = useState<IvKey[]>(editTool ? [editTool] : ["yoga", "diet"]); // tool deep-link → just that tool
  const [openU, setOpenU] = useState<string | null>(null);

  // shared / yoga
  const [yogaLevel, setYogaLevel] = useState<string>(LEVELS[0]);
  const [duration, setDuration] = useState<number>(20);
  const [protect, setProtect] = useState<string[]>([]);
  // exercise
  const [exLevel, setExLevel] = useState<string>(LEVELS[0]);
  const [exDays, setExDays] = useState<number>(4);
  const [exDur, setExDur] = useState<number>(30);
  const [focus, setFocus] = useState<string>(EX_FOCUS[0]);
  const [equip, setEquip] = useState<string>(EQUIP[0]);
  // diet
  const [dietIF, setDietIF] = useState<boolean | null>(null);
  const [ifWindow, setIfWindow] = useState<string>("14:10");
  const [fastHrs, setFastHrs] = useState<number>(14);
  const [prefs, setPrefs] = useState<string[]>(["Vegetarian"]);
  const [allergies, setAllergies] = useState<string[]>([]);
  const [otherAllergy, setOtherAllergy] = useState("");
  const [meals, setMeals] = useState<number>(3);
  const [mini, setMini] = useState<number>(1);
  const [mealMode, setMealMode] = useState<"detailed" | "recos">("detailed");
  const [ifConflict, setIfConflict] = useState<{ hrs: number; tier: FastTier } | null>(null); // meal-count vs fasting-window clash
  // about
  const [cleared, setCleared] = useState(false);
  const [dq, setDq] = useState<Record<string, string>>({});
  const [curWt, setCurWt] = useState("");
  const [tgtWt, setTgtWt] = useState("");
  const [tgtDate, setTgtDate] = useState("");

  // when editing an existing plan, load its saved answers once (client-side)
  const hydrated = useRef(false);
  useEffect(() => {
    if (hydrated.current || !editId) return;
    hydrated.current = true;
    const p = loadYogaPlans().find((x) => x.id === editId);
    const w = p?.wizard as Record<string, unknown> | undefined;
    if (!w) return;
    const S = <T,>(v: unknown, set: (x: T) => void) => { if (v !== undefined && v !== null) set(v as T); };
    S<string[]>(w.goalIds, setGoals); S<IvKey[]>(w.ivs, setIvs);
    S<string>(w.yogaLevel, setYogaLevel); S<number>(w.duration, setDuration); S<string[]>(w.protect, setProtect); S<number>(w.mini, setMini);
    S<string>(w.exLevel, setExLevel); S<number>(w.exDays, setExDays); S<number>(w.exDur, setExDur);
    S<string>(w.focus, setFocus); S<string>(w.equip, setEquip);
    S<"detailed" | "recos">(w.mealMode, setMealMode); S<boolean>(w.dietIF, setDietIF); S<string>(w.ifWindow, setIfWindow); S<number>(w.fastHrs, setFastHrs);
    S<string[]>(w.prefs, setPrefs); S<string[]>(w.allergies, setAllergies); S<number>(w.meals, setMeals);
    S<Record<string, string>>(w.dq, setDq); S<string>(w.curWt, setCurWt); S<string>(w.tgtWt, setTgtWt); S<string>(w.tgtDate, setTgtDate);
  }, [editId]);

  const hasYoga = ivs.includes("yoga");
  const hasExercise = ivs.includes("exercise");
  const hasDiet = ivs.includes("diet");
  const medicalGoals = goals.filter((g) => MEDICAL_GROUPS.has(getGoal(g)?.groupId ?? ""));
  const anyMedical = medicalGoals.length > 0;
  const wantsWeight = goals.includes("weight-loss") || goals.includes("obesity");
  const ranked = useMemo(() => rankFor(goals), [goals]);

  const stepKeys = useMemo(() => {
    const s: string[] = ["goals", "interventions"];
    if (anyMedical || wantsWeight) s.push("about");
    if (hasYoga) s.push("yoga-time");
    if (hasYoga || hasExercise) s.push("protect");
    if (hasExercise) s.push("ex-level", "ex-days", "ex-duration", "ex-focus", "ex-equip");
    if (hasDiet) {
      s.push("diet-meals", "diet-prefs", "diet-allergies"); // IF lives inside the meal-plan page
    }
    s.push("review");
    return s;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [goals, ivs, dietIF]);
  const key = stepKeys[Math.min(step, stepKeys.length - 1)];

  // "Edit one tool" deep-link → jump straight to that tool's first question screen
  const jumpedTool = useRef(false);
  useEffect(() => {
    if (jumpedTool.current || !editTool) return;
    const first = editTool === "yoga" ? "yoga-time" : editTool === "exercise" ? "ex-level" : "diet-meals";
    const i = stepKeys.indexOf(first);
    if (i >= 0) { jumpedTool.current = true; setStep(i); }
  }, [editTool, stepKeys]);

  const toggleGoal = (id: string) => setGoals((c) => c.includes(id) ? c.filter((x) => x !== id) : c.length >= 2 ? c : [...c, id]);
  const toggleIv = (k: IvKey) => setIvs((c) => c.includes(k) ? c.filter((x) => x !== k) : [...c, k]);
  const tog = (arr: string[], set: (v: string[]) => void, v: string) => set(arr.includes(v) ? arr.filter((x) => x !== v) : [...arr, v]);
  const goalLabels = goals.map((g) => ALL_GOALS[g]?.label ?? g);

  const dailyDeficit = useMemo(() => {
    const cur = parseFloat(curWt), tgt = parseFloat(tgtWt);
    if (!cur || !tgt || tgt >= cur || !tgtDate) return null;
    const d = Math.ceil((new Date(tgtDate).getTime() - Date.now()) / 86400000);
    return d > 0 ? Math.round(((cur - tgt) * 7700) / d) : null;
  }, [curWt, tgtWt, tgtDate]);

  const canNext =
    key === "goals" ? goals.length >= 1 :
    key === "interventions" ? ivs.length >= 1 :
    key === "about" ? cleared :
    true;

  const goTo = (name: string) => { const i = stepKeys.indexOf(name); if (i >= 0) setStep(i); };
  const back = () => (step === 0 ? navigate({ to: "/home" }) : setStep((s) => s - 1));
  const next = () => { if (canNext) setStep((s) => Math.min(stepKeys.length - 1, s + 1)); };

  const save = () => {
    const parts = ivs.map((k) => IV_META[k].label);
    const dietBits: string[] = [];
    if (hasDiet) { if (dietIF) dietBits.push(`IF ${ifWindow}`); dietBits.push(mealMode === "detailed" ? `${meals} main${mini ? `+${mini} mini` : ""}` : "Food tips"); if (prefs.length) dietBits.push(prefs.join("/")); }
    const days = hasExercise ? WEEKDAYS.slice(0, exDays).map((w) => w.id) : ["mon", "tue", "wed", "thu", "fri"];
    const pid = editId ?? newPlanId();
    const wizard = { goalIds: goals, ivs, yogaLevel, duration, protect, exLevel, exDays, exDur, focus, equip, mealMode, dietIF, ifWindow, fastHrs, prefs, allergies, meals, mini, dq, curWt, tgtWt, tgtDate };
    const plan: YogaPlan = {
      id: pid,
      wizard,
      name: goalLabels.join(" + "),
      primary: goalLabels[0],
      secondary: goalLabels[1] ?? null,
      level: hasExercise ? exLevel : hasYoga ? yogaLevel : "Beginner",
      weeks: 4,
      daysPerWeek: days.length,
      days,
      duration: hasYoga ? duration : exDur,
      protect: (hasYoga || hasExercise) ? protect : [],
      variant: [...parts, ...dietBits].join(" · "),
      updatedAt: Date.now(),
    };
    upsertYogaPlan(plan);
    navigate({ to: "/myplan/$id", params: { id: pid } });
  };

  const STEP_LABEL: Record<string, string> = {
    goals: "What's your goal?", interventions: "What to personalize", about: "A little about you",
    "yoga-time": "Set up your yoga", protect: "Areas to protect",
    "ex-level": "Your exercise", "ex-days": "Exercise days", "ex-duration": "Workout length",
    "ex-focus": "Exercise focus", "ex-equip": "Equipment",
    "diet-meals": "Let's create your meal plan", "diet-prefs": "Dietary preferences", "diet-allergies": "Allergies", review: "Review your plan",
  };

  return (
    <div className="min-h-svh pb-28" style={{ background: "var(--gradient-hero)" }}>
      <div className="relative overflow-hidden px-4 pb-4 pt-[max(1rem,env(safe-area-inset-top))]" style={{ background: "var(--gradient-violet)" }}>
        <div className="relative flex items-center gap-2.5 text-primary-foreground">
          <button onClick={back} className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-white/15"><ArrowLeft size={15} /></button>
          <div className="min-w-0 flex-1">
            <p className="text-[10px] font-semibold uppercase tracking-wide opacity-80">Create my plan</p>
            <h1 className="truncate font-display text-[17px] font-extrabold leading-tight">{STEP_LABEL[key]}</h1>
          </div>
        </div>
        <div className="relative mt-3 h-1.5 overflow-hidden rounded-full bg-white/20">
          <div className="absolute inset-y-0 left-0 rounded-full bg-white transition-[width] duration-300" style={{ width: `${((step + 1) / stepKeys.length) * 100}%` }} />
        </div>
      </div>

      <div className="mx-auto max-w-xl px-4 pt-4">
        {/* GOALS */}
        {key === "goals" && (
          <div className="space-y-4">
            <p className="px-1 text-[12.5px] text-muted-foreground">Pick <span className="font-semibold text-foreground">up to 2 goals</span> you want a plan for.</p>
            {goals.length > 0 && (
              <div className="flex flex-wrap gap-1.5">
                {goals.map((id) => (
                  <button key={id} onClick={() => toggleGoal(id)} className="flex items-center gap-1.5 rounded-full bg-primary py-1 pl-1 pr-3 text-[12px] font-bold text-primary-foreground">
                    <span className="flex h-6 w-6 items-center justify-center rounded-full bg-white/25 text-[12px]">{ALL_GOALS[id]?.emoji}</span>{ALL_GOALS[id]?.label} ✕
                  </button>
                ))}
              </div>
            )}
            <div>
              <p className="mb-1.5 px-1 text-[11px] font-bold uppercase tracking-wide text-amber-700 dark:text-amber-400">🌿 Common goals</p>
              <div className="flex flex-wrap gap-1.5">{CREATE_COMMON.map((id) => goalChipEl(id, goals, toggleGoal))}</div>
            </div>
            <div>
              <p className="px-1 text-[11px] font-bold uppercase tracking-wide text-sky-700 dark:text-sky-400">🩺 Manage conditions</p>
              <p className="mb-1.5 px-1 text-[10px] leading-snug text-muted-foreground/80">Supportive lifestyle plans <b>alongside your doctor's care</b> — not a cure.</p>
              <div className="flex flex-wrap gap-1.5">{CREATE_CONDITIONS.map((id) => goalChipEl(id, goals, toggleGoal))}</div>
              <div className="mt-2 flex flex-wrap gap-1.5">
                {CREATE_UMBRELLAS.map((u) => {
                  const open = openU === u.id;
                  const sel = u.ids.filter((id) => goals.includes(id)).length;
                  return (
                    <button key={u.id} onClick={() => setOpenU(open ? null : u.id)} className={`flex items-center gap-1.5 rounded-full py-1 pl-1 pr-2.5 text-[12px] font-semibold ring-1 transition ${open ? "bg-accent/60 ring-primary/40" : "bg-card text-foreground/85 ring-border/60"}`}>
                      <span className="flex h-6 w-6 items-center justify-center rounded-full text-[12px] text-primary-foreground shadow-sm" style={{ background: u.gradient }}>{u.emoji}</span>
                      {u.label}{sel > 0 ? ` (${sel})` : ""}<span className="text-[9px] text-muted-foreground">{open ? "▾" : "▸"}</span>
                    </button>
                  );
                })}
              </div>
              {(() => {
                const u = CREATE_UMBRELLAS.find((x) => x.id === openU);
                if (!u) return null;
                return <div className="mt-1.5 rounded-2xl bg-card/70 p-2.5 ring-1 ring-border/60"><div className="flex flex-wrap gap-1.5">{u.ids.map((id) => goalChipEl(id, goals, toggleGoal))}</div></div>;
              })()}
            </div>
            <div>
              <p className="mb-1.5 px-1 text-[11px] font-bold uppercase tracking-wide text-violet-700 dark:text-violet-400">🌸 Women's Health</p>
              <div className="flex flex-wrap gap-1.5">{CREATE_WOMENS.map((id) => goalChipEl(id, goals, toggleGoal))}</div>
            </div>
          </div>
        )}

        {/* INTERVENTIONS */}
        {key === "interventions" && (
          <Q title="What should we personalize?" hint={`Based on ${goalLabels.join(" & ")}. Yoga & Diet are on by default — add Exercise if you like. Meditation, fasting & detox come built into your plan and you start them anytime.`}>
            <div className="space-y-2">
              {ranked.map((r) => {
                const m = IV_META[r.key];
                const on = ivs.includes(r.key);
                return (
                  <button key={r.key} onClick={() => toggleIv(r.key)} className={`flex w-full items-center gap-3 rounded-2xl p-3 text-left ring-1 transition ${on ? "bg-primary/10 ring-primary" : "bg-card ring-border/60"}`}>
                    <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-accent/50 text-lg">{m.emoji}</span>
                    <div className="min-w-0 flex-1">
                      <p className="text-[13px] font-bold text-foreground">{m.label}</p>
                      <p className="text-[10.5px] text-muted-foreground">{"★".repeat(r.imp)}{"☆".repeat(5 - r.imp)} · {r.imp >= 5 ? "most important" : r.imp >= 4 ? "very helpful" : "supportive"}</p>
                    </div>
                    <span className={`flex h-5 w-5 items-center justify-center rounded-md text-[11px] font-bold ${on ? "bg-primary text-primary-foreground" : "bg-secondary text-transparent"}`}>✓</span>
                  </button>
                );
              })}
            </div>
          </Q>
        )}

        {/* ABOUT */}
        {key === "about" && (
          <Q title="A little about you" hint="So your plan fits your condition.">
            <div className="space-y-3">
              {wantsWeight && (
                <div className="rounded-2xl bg-card p-3 ring-1 ring-border/60">
                  <p className="mb-2 text-[12px] font-bold text-foreground">🔥 Weight target</p>
                  <div className="grid grid-cols-3 gap-2">
                    <label className="block"><span className="text-[10.5px] font-semibold text-muted-foreground">Current (kg)</span><input value={curWt} onChange={(e) => setCurWt(e.target.value)} inputMode="decimal" placeholder="72" className="mt-1 w-full rounded-xl bg-secondary/40 px-2 py-2 text-[13px] ring-1 ring-border/60" /></label>
                    <label className="block"><span className="text-[10.5px] font-semibold text-muted-foreground">Target (kg)</span><input value={tgtWt} onChange={(e) => setTgtWt(e.target.value)} inputMode="decimal" placeholder="66" className="mt-1 w-full rounded-xl bg-secondary/40 px-2 py-2 text-[13px] ring-1 ring-border/60" /></label>
                    <label className="block"><span className="text-[10.5px] font-semibold text-muted-foreground">By</span><input type="date" value={tgtDate} onChange={(e) => setTgtDate(e.target.value)} className="mt-1 w-full rounded-xl bg-secondary/40 px-2 py-2 text-[12px] ring-1 ring-border/60" /></label>
                  </div>
                  {dailyDeficit && <p className="mt-2 text-[11.5px] font-semibold text-primary">≈ {dailyDeficit} kcal/day to reach your target.</p>}
                </div>
              )}
              {medicalGoals.map((g) => {
                const qs = DISEASE_Q[g]; if (!qs) return null;
                return (
                  <div key={g} className="rounded-2xl bg-card p-3 ring-1 ring-border/60">
                    <p className="mb-2 text-[12px] font-bold text-foreground">{ALL_GOALS[g]?.emoji} {ALL_GOALS[g]?.label}</p>
                    <div className="grid grid-cols-2 gap-2">
                      {qs.map((q) => <label key={q.key} className="block"><span className="text-[10.5px] font-semibold text-muted-foreground">{q.label}</span><input value={dq[q.key] ?? ""} onChange={(e) => setDq((c) => ({ ...c, [q.key]: e.target.value }))} placeholder={q.ph} className="mt-1 w-full rounded-xl bg-secondary/40 px-2 py-2 text-[13px] ring-1 ring-border/60" /></label>)}
                    </div>
                  </div>
                );
              })}
              <button onClick={() => setCleared((c) => !c)} className={`flex w-full items-start gap-2.5 rounded-2xl p-3 text-left ring-1 transition ${cleared ? "bg-amber-100 ring-amber-300 dark:bg-amber-900/30 dark:ring-amber-700" : "bg-amber-50 ring-amber-200 dark:bg-amber-900/20 dark:ring-amber-800/60"}`}>
                <span className={`mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded-[5px] text-[10px] font-bold ${cleared ? "bg-amber-500 text-white" : "bg-white ring-1 ring-amber-300 dark:bg-transparent"}`}>{cleared ? "✓" : ""}</span>
                <span className="text-[10.5px] leading-snug text-amber-800 dark:text-amber-300">I understand this is <b>supportive lifestyle guidance, not medical treatment</b>, and I'll check with my doctor about my condition.</span>
              </button>
            </div>
          </Q>
        )}

        {/* YOGA — level + time */}
        {key === "yoga-time" && (
          <Q title="Set up your yoga" hint="No fixed weeks or weekly schedule — practise at your pace; the next sessions adapt as you go.">
            <p className="mb-1.5 px-1 text-[11px] font-bold uppercase tracking-wide text-muted-foreground">Your level</p>
            <div className="mb-3 flex flex-wrap gap-1.5">{LEVELS.map((l) => <button key={l} onClick={() => setYogaLevel(l)} className={chip(yogaLevel === l)}>{l}</button>)}</div>
            <p className="mb-1.5 px-1 text-[11px] font-bold uppercase tracking-wide text-muted-foreground">How long each session?</p>
            <div className="flex flex-wrap gap-1.5">{DURATIONS.map((d) => <button key={d} onClick={() => setDuration(d)} className={chip(duration === d)}>{d} min</button>)}</div>
          </Q>
        )}

        {/* PROTECT — shared by yoga & exercise */}
        {key === "protect" && (
          <Q title="Any areas to protect?" hint={hasYoga && hasExercise ? "Applies to both your yoga & exercise." : undefined}>
            <p className="mb-2 px-1 text-[10.5px] font-semibold text-red-500">⚠ Under review — may be removed once conditions cover this.</p>
            <div className="flex flex-wrap gap-1.5">
              <button onClick={() => setProtect([])} className={chip(protect.length === 0)}>None</button>
              {PROTECT.map((p) => <button key={p} onClick={() => tog(protect, setProtect, p)} className={chip(protect.includes(p))}>{p}</button>)}
            </div>
          </Q>
        )}

        {/* EXERCISE — one per screen */}
        {key === "ex-level" && <Q title="Your exercise level"><div className="flex flex-wrap gap-1.5">{LEVELS.map((l) => <button key={l} onClick={() => setExLevel(l)} className={chip(exLevel === l)}>{l}</button>)}</div></Q>}
        {key === "ex-days" && <Q title="Exercise days per week"><div className="flex flex-wrap gap-1.5">{DAYS_N.map((d) => <button key={d} onClick={() => setExDays(d)} className={chip(exDays === d)}>{d} days</button>)}</div></Q>}
        {key === "ex-duration" && <Q title="How long each workout?"><div className="flex flex-wrap gap-1.5">{DURATIONS.map((d) => <button key={d} onClick={() => setExDur(d)} className={chip(exDur === d)}>{d} min</button>)}</div></Q>}
        {key === "ex-focus" && <Q title="Exercise focus"><div className="flex flex-wrap gap-1.5">{EX_FOCUS.map((f) => <button key={f} onClick={() => setFocus(f)} className={chip(focus === f)}>{f}</button>)}</div></Q>}
        {key === "ex-equip" && <Q title="What equipment do you have?"><div className="flex flex-wrap gap-1.5">{EQUIP.map((e) => <button key={e} onClick={() => setEquip(e)} className={chip(equip === e)}>{e}</button>)}</div></Q>}

        {key === "diet-meals" && (
          <div>
            <p className="px-1 text-[12px] leading-snug text-muted-foreground">We recommend 2–3 main meals, plus 1 mini-meal (snack) only if you need it.</p>

            {/* detailed vs food-recos */}
            <div className="mt-2.5 flex gap-2">
              <button onClick={() => setMealMode("detailed")} className={`lf-btn flex-1 rounded-2xl py-2.5 text-[12px] font-bold ring-1 ${mealMode === "detailed" ? "bg-primary/10 text-primary ring-primary" : "bg-card ring-border/60"}`}>Detailed meal plan</button>
              <button onClick={() => setMealMode("recos")} className={`lf-btn flex-1 rounded-2xl py-2.5 text-[12px] font-bold ring-1 ${mealMode === "recos" ? "bg-primary/10 text-primary ring-primary" : "bg-card ring-border/60"}`}>Just food tips</button>
            </div>

            {mealMode === "detailed" ? (
              <div className="mt-3 flex gap-6">
                <div>
                  <p className="mb-1.5 px-1 text-[11px] font-bold uppercase tracking-wide text-muted-foreground">Main meals</p>
                  <div className="flex gap-1">{MAIN_MEALS.map((m) => <button key={m} onClick={() => setMeals(m)} className={smChip(meals === m)}>{m}</button>)}</div>
                </div>
                <div>
                  <p className="mb-1.5 px-1 text-[11px] font-bold uppercase tracking-wide text-muted-foreground">Mini-meals</p>
                  <div className="flex gap-1">{MINI_MEALS_D.map((m) => <button key={m} onClick={() => setMini(m)} className={smChip(mini === m)}>{m}</button>)}</div>
                </div>
              </div>
            ) : (
              <p className="mt-3 rounded-2xl bg-card/70 p-3 text-[11.5px] leading-snug text-muted-foreground ring-1 ring-border/50">No fixed meal plan — we'll give you flexible <b className="text-foreground">food recommendations</b> (what to eat more / less of) you can follow your own way. IF below is optional.</p>
            )}

            {/* IF — shown to everyone */}
            <div className="mt-4 rounded-2xl bg-secondary/40 p-3 ring-1 ring-border/50">
              <p className="text-[12px] font-bold text-foreground">⏳ Want to include intermittent fasting?</p>
              <div className="mt-2 flex gap-1.5">
                <button onClick={() => { setDietIF(true); if (mealMode === "detailed") { const h = maxFastForMeals(meals, mini); setFastHrs(h); setIfWindow(`${h}:${24 - h}`); } }} className={chip(dietIF === true)}>Yes, include IF</button>
                <button onClick={() => setDietIF(false)} className={chip(dietIF === false)}>No, thanks</button>
              </div>
              {dietIF === true && (() => {
                const tier = fastTier(fastHrs);
                const lvl = fastLevel(fastHrs);
                const maxH = maxFastForMeals(meals, mini);
                return (
                  <div className="mt-3">
                    <style>{`.if-range{-webkit-appearance:none;appearance:none;width:100%;height:10px;border-radius:9999px;outline:none;background:linear-gradient(to right,#22c55e 0 33.33%,#eab308 33.33% 66.66%,#ef4444 66.66% 100%);}.if-range::-webkit-slider-runnable-track{height:10px;border-radius:9999px;background:transparent;}.if-range::-webkit-slider-thumb{-webkit-appearance:none;appearance:none;margin-top:-4px;width:18px;height:18px;border-radius:9999px;background:#fff;border:2px solid rgba(0,0,0,.28);box-shadow:0 1px 3px rgba(0,0,0,.35);cursor:pointer;}.if-range::-moz-range-track{height:10px;border-radius:9999px;background:transparent;}.if-range::-moz-range-thumb{width:18px;height:18px;border-radius:9999px;background:#fff;border:2px solid rgba(0,0,0,.28);cursor:pointer;}`}</style>

                    {/* what kicks in as you fast + gap note (replaces the old benefit bullets) */}
                    <div className="rounded-xl bg-card/70 p-2.5 ring-1 ring-border/50">
                      <p className="text-[10px] font-bold uppercase tracking-wide text-muted-foreground">What kicks in as you fast</p>
                      <div className="mt-1 flex flex-wrap gap-x-2.5 gap-y-0.5 text-[10px]">
                        {FAST_STAGES.map((s) => <span key={s.h} className={fastHrs >= s.h ? "font-semibold text-foreground" : "text-muted-foreground/50"}>~{s.h}h {s.t}{fastHrs >= s.h ? " ✓" : ""}</span>)}
                      </div>
                    </div>
                    <p className="mt-1.5 px-0.5 text-[10px] text-muted-foreground">Keep a ~5-hour gap between main meals inside your window.</p>

                    {/* meal capacity at this window — small, above the bar */}
                    <p className="mt-3 px-0.5 text-[10px] text-muted-foreground">At <b className="text-foreground">{fastHrs}h fast</b> you can fit: <b className="text-foreground">{tier.meals}</b></p>

                    {/* single colored, selectable bar */}
                    <input type="range" min={12} max={24} value={fastHrs}
                      onChange={(e) => { const h = Number(e.target.value); setFastHrs(h); setIfWindow(`${h}:${24 - h}`); if (mealMode === "detailed") { const t = fastTier(h); if (t.maxMain < meals || t.maxMini < mini) setIfConflict({ hrs: h, tier: t }); } }}
                      className="if-range mt-1" />

                    <p className="mt-2 px-0.5 text-[11.5px] font-semibold text-foreground"><span className="mr-1 inline-block h-2 w-2 rounded-full align-middle" style={{ background: lvl.color }} />{fastHrs}h fast · {24 - fastHrs}h eating window · {lvl.name}</p>
                    {mealMode === "detailed" && <p className="px-0.5 text-[10px] text-muted-foreground">Your {meals} main{mini ? ` + ${mini} mini` : ""} → comfortable up to ~{maxH}h.</p>}
                  </div>
                );
              })()}
            </div>

            {/* meals-vs-fasting clash → offer to reduce meals */}
            {ifConflict && (
              <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-6" onClick={() => setIfConflict(null)}>
                <div className="w-full max-w-xs rounded-2xl bg-card p-4 shadow-xl" onClick={(e) => e.stopPropagation()}>
                  <p className="font-display text-[14px] font-bold text-foreground">Fewer meals for this window</p>
                  <p className="mt-1.5 text-[11.5px] leading-relaxed text-muted-foreground">A <b className="text-foreground">{ifConflict.hrs}h fast</b> fits at most <b className="text-foreground">{ifConflict.tier.meals}</b>. You've chosen {meals} main{mini ? ` + ${mini} mini` : ""}. Change your meals to match?</p>
                  <div className="mt-3 flex flex-col gap-2">
                    <button onClick={() => { setMeals(ifConflict.tier.maxMain); setMini(ifConflict.tier.maxMini); setIfConflict(null); }} className="rounded-xl bg-primary py-2 text-[12px] font-bold text-primary-foreground">Yes — set {ifConflict.tier.maxMain} main{ifConflict.tier.maxMini ? ` + ${ifConflict.tier.maxMini} mini` : ""}</button>
                    <button onClick={() => { const h = maxFastForMeals(meals, mini); setFastHrs(h); setIfWindow(`${h}:${24 - h}`); setIfConflict(null); }} className="rounded-xl bg-secondary py-2 text-[12px] font-bold text-foreground">Keep my meals — fast {maxFastForMeals(meals, mini)}h</button>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
        {key === "diet-prefs" && <Q title="Dietary preferences" hint="Pick all that apply."><div className="flex flex-wrap gap-1.5">{DIET_PREFS.map((p) => <button key={p} onClick={() => tog(prefs, setPrefs, p)} className={chip(prefs.includes(p))}>{p}</button>)}</div></Q>}
        {key === "diet-allergies" && (
          <Q title="Any allergies or foods to avoid?">
            <div className="flex flex-wrap gap-1.5">
              <button onClick={() => setAllergies([])} className={chip(allergies.length === 0)}>None</button>
              {ALLERGENS.map((a) => <button key={a} onClick={() => tog(allergies, setAllergies, a)} className={chip(allergies.includes(a))}>{a}</button>)}
              {allergies.filter((a) => !ALLERGENS.includes(a)).map((a) => <button key={a} onClick={() => tog(allergies, setAllergies, a)} className={chip(true)}>{a} ✕</button>)}
            </div>
            {/* Other — type your own */}
            <div className="mt-2.5 flex gap-2">
              <input
                value={otherAllergy}
                onChange={(e) => setOtherAllergy(e.target.value)}
                onKeyDown={(e) => { if (e.key === "Enter") { const v = otherAllergy.trim(); if (v && !allergies.includes(v)) setAllergies([...allergies, v]); setOtherAllergy(""); } }}
                placeholder="Other — type an allergy or food to avoid"
                className="min-w-0 flex-1 rounded-xl bg-card px-3 py-2 text-[12px] font-semibold ring-1 ring-border/60 placeholder:text-muted-foreground/50"
              />
              <button onClick={() => { const v = otherAllergy.trim(); if (v && !allergies.includes(v)) setAllergies([...allergies, v]); setOtherAllergy(""); }} className="shrink-0 rounded-xl bg-primary px-3.5 py-2 text-[12px] font-bold text-primary-foreground">Add</button>
            </div>
          </Q>
        )}

        {/* REVIEW */}
        {key === "review" && (
          <div className="space-y-2.5">
            <div className="flex items-center justify-between px-1">
              <h2 className="font-display text-[16px] font-bold text-foreground">Review your plan</h2>
            </div>
            <ReviewRow label="Goal" value={goalLabels.join(" + ")} onEdit={() => goTo("goals")} />
            <ReviewRow label="Personalizing" value={ivs.map((k) => `${IV_META[k].emoji} ${IV_META[k].label}`).join("  ·  ")} onEdit={() => goTo("interventions")} />
            {hasYoga && <ReviewRow label="Yoga" value={`${yogaLevel} · ${duration} min/session${protect.length ? ` · protect: ${protect.join(", ")}` : ""}`} onEdit={() => goTo("yoga-time")} />}
            {hasExercise && <ReviewRow label="Exercise" value={`${exLevel} · ${exDays} days · ${exDur} min · ${focus} · ${equip}`} onEdit={() => goTo("ex-level")} />}
            {hasDiet && <ReviewRow label="Diet" value={`${dietIF ? `IF ${ifWindow} · ` : ""}${mealMode === "detailed" ? `${meals} main${mini ? `+${mini} mini` : ""}` : "Food tips"} · ${prefs.join(", ") || "no prefs"}${allergies.length ? ` · avoid: ${allergies.join(", ")}` : ""}`} onEdit={() => goTo("diet-meals")} />}
            {wantsWeight && dailyDeficit && <ReviewRow label="Target" value={`${tgtWt} kg by ${tgtDate} (≈${dailyDeficit} kcal/day)`} onEdit={() => goTo("about")} />}

            {goals.some((g) => { const s = SUPPORT[g]; return s && (s.detox || s.fasting || s.meditation || s.herbs); }) && (
              <p className="px-1 text-[11.5px] leading-snug text-muted-foreground">Next you'll see <b>Detox, Fasting, Meditation & Herbs</b> that support your goal — explained on your plan page, to start whenever you're ready.</p>
            )}
            <p className="px-1 pt-1 text-[11px] text-muted-foreground">Saved to <b>My Plans</b> (up to 3).</p>
          </div>
        )}
      </div>

      <div className="fixed inset-x-0 z-30 mx-auto flex max-w-xl gap-2 px-4" style={{ bottom: "calc(4.5rem + env(safe-area-inset-bottom))" }}>
        {key !== "review" ? (
          <button onClick={next} disabled={!canNext} className={`w-full rounded-2xl px-4 py-3 text-sm font-bold shadow-lg transition ${canNext ? "bg-primary text-primary-foreground active:scale-[0.99]" : "bg-secondary text-muted-foreground"}`}>Next →</button>
        ) : (
          <button onClick={save} className="w-full rounded-2xl bg-primary px-4 py-3 text-sm font-bold text-primary-foreground shadow-lg active:scale-[0.99]">💾 Save to My Plans</button>
        )}
      </div>

      <BottomNav />
    </div>
  );
}

function ReviewRow({ label, value, onEdit }: { label: string; value: string; onEdit: () => void }) {
  return (
    <div className="flex items-center gap-2 rounded-2xl bg-card p-3 ring-1 ring-border/60">
      <div className="min-w-0 flex-1">
        <p className="text-[10.5px] font-bold uppercase tracking-wide text-muted-foreground">{label}</p>
        <p className="mt-0.5 text-[12.5px] font-semibold text-foreground">{value}</p>
      </div>
      <button onClick={onEdit} className="shrink-0 rounded-full bg-secondary px-3 py-1.5 text-[11px] font-bold text-foreground active:opacity-70">Edit</button>
    </div>
  );
}
