import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useMemo, useRef, useState } from "react";
import { ArrowLeft, ChevronDown, ChevronLeft, ChevronRight, Play, Music, Info, Clock, X } from "lucide-react";
import { BottomNav } from "@/components/BottomNav";
import { AyuBot } from "@/components/AyuBot";
import { loadYogaPlans } from "@/lib/yoga-plan";
import { conditionMeta, resolvePlan } from "@/lib/clusters";
import { loadPersonalPlan, setToolOverride, setPlanTools, PLAN_TOOLS, type ToolOverride } from "@/lib/personalPlan";
import { buildMealPlan } from "@/lib/meal-plan";
import { MealPlanView } from "@/components/MealPlanView";
import type { ActivityLevel, Sex } from "@/lib/weight-loss";
import type { Dosha } from "@/lib/diet";
import { SessionPlayer, toYogaGoal } from "@/routes/section.yoga";
import { Player as ExercisePlayer } from "@/routes/section.exercise";
import { generatePlan, posesFor } from "@/lib/yoga";
import { bundleSteps, CLASSICS, getExercise, type Step } from "@/lib/exercise";

export const Route = createFileRoute("/myplan/$id")({ component: MyPlanPage });

/** One part of the plan. `onEdit` opens that part's own flow; `onRemove` takes it out of the plan. */
function Tool({ emoji, title, subtitle, onEdit, onRemove, children }: { emoji: string; title: string; subtitle?: string; onEdit?: () => void; onRemove?: () => void; children: React.ReactNode }) {
  return (
    <section className="overflow-hidden rounded-2xl bg-card ring-1 ring-border/60">
      <div className="flex items-center gap-2 px-3.5 py-2.5 text-primary-foreground" style={{ background: "var(--gradient-violet)" }}>
        <p className="font-display text-[13.5px] font-bold">{emoji} {title}</p>
        {subtitle && <p className="text-[10px] font-semibold opacity-85">{subtitle}</p>}
        <span className="ml-auto flex shrink-0 items-center gap-1">
          {onEdit && <button onClick={onEdit} className="rounded-full bg-white/20 px-2.5 py-0.5 text-[10px] font-bold">Edit</button>}
          {onRemove && <button onClick={onRemove} aria-label={`Remove ${title}`} className="rounded-full bg-white/20 px-2 py-0.5 text-[10px] font-bold">✕</button>}
        </span>
      </div>
      <div className="space-y-2 p-3.5 text-[12px] text-foreground/90">{children}</div>
    </section>
  );
}

const Chips = ({ items }: { items: string[] }) => (
  <div className="flex flex-wrap gap-1.5">{items.map((h, i) => <span key={i} className="rounded-full bg-secondary px-2.5 py-1 text-[11px] font-semibold text-foreground/85">{h}</span>)}</div>
);

const adjChip = (on: boolean) => `rounded-full px-2.5 py-1 text-[11px] font-bold ${on ? "bg-primary text-primary-foreground" : "bg-secondary text-foreground/75"}`;

/** Light edit — time & level only — written straight to the plan's overrides. */
function Adjust({ tool, ov, onChange }: { tool: string; ov: ToolOverride; onChange: (tool: string, o: ToolOverride) => void }) {
  return (
    <div className="mt-1 space-y-1.5 border-t border-border/50 pt-2">
      <p className="text-[10px] font-bold uppercase tracking-wide text-muted-foreground">Adjust</p>
      <div className="flex flex-wrap items-center gap-1.5">
        <span className="w-10 text-[10.5px] text-muted-foreground">Time</span>
        {[10, 20, 30, 45].map((m) => <button key={m} onClick={() => onChange(tool, { minutes: m })} className={adjChip(ov.minutes === m)}>{m}m</button>)}
      </div>
      <div className="flex flex-wrap items-center gap-1.5">
        <span className="w-10 text-[10.5px] text-muted-foreground">Level</span>
        {["Gentle", "Moderate", "Strong"].map((l) => <button key={l} onClick={() => onChange(tool, { level: l })} className={adjChip(ov.level === l)}>{l}</button>)}
      </div>
    </div>
  );
}

/** Compact day strip — the current 3 days are open (playable); the next days show locked. */
function DayStrip({ done, total, onPlay }: { done: number[]; total: number; onPlay: (day: number) => void }) {
  let base = 1;
  for (let i = 1; i <= total; i++) if (!done.includes(i)) { base = i; break; }
  base = Math.min(base, Math.max(1, total - 2));
  const open = [base, base + 1, base + 2].filter((d) => d <= total);
  const locked = [base + 3, base + 4].filter((d) => d <= total);
  return (
    <div>
      <div className="flex gap-1.5">
        {open.map((d) => {
          const isDone = done.includes(d);
          return (
            <button
              key={d}
              onClick={() => onPlay(d)}
              aria-label={`Day ${d}`}
              className={`flex h-9 flex-1 items-center justify-center gap-1.5 rounded-lg px-2 ${isDone ? "bg-secondary/50 text-foreground/55 ring-1 ring-border/50" : "bg-primary text-primary-foreground"}`}
            >
              <span className="text-[12px] font-bold">Day {d}</span>
              {isDone ? <span className="text-[10px]">✓</span> : <Play size={11} className="opacity-90" />}
            </button>
          );
        })}
        {locked.map((d) => (
          <div key={d} aria-label={`Day ${d} locked`} className="flex h-9 flex-1 items-center justify-center gap-1 rounded-lg bg-secondary/40 px-2 text-muted-foreground/60 ring-1 ring-border/40">
            <span className="text-[11px] font-bold">Day {d}</span>
            <span className="text-[9px]">🔒</span>
          </div>
        ))}
      </div>
      <p className="mt-1 text-[9px] leading-snug text-muted-foreground">At a given time 3 sessions can be accessed — the next open as you progress.</p>
    </div>
  );
}

/* ================= Workout-details intro (shown before the player) ================= */

type IntroItem = { name: string; emoji: string; sec: number; how?: string; steps?: string[] };
type IntroData = {
  tool: "yoga" | "exercise";
  title: string;
  level: string;
  focus: string;
  minutes: number;
  build: (min: number) => IntroItem[];
  onStart: (min: number) => void;
};

const INTRO_DURATIONS = [10, 15, 20, 30, 45];
const PLAYLISTS = ["Calm focus", "Upbeat energy", "Lo-fi flow", "No music"];
function introFmt(sec: number) { return `${Math.floor(sec / 60)}:${String(Math.round(sec) % 60).padStart(2, "0")}`; }

function WorkoutIntro({ data, onClose }: { data: IntroData; onClose: () => void }) {
  const [dur, setDur] = useState(data.minutes);
  const [playlist, setPlaylist] = useState(0);
  const [detail, setDetail] = useState<IntroItem | null>(null);
  const items = useMemo(() => data.build(dur), [dur, data]);
  const kcal = Math.round(dur * (data.tool === "exercise" ? 7 : 4));
  const noun = data.tool === "yoga" ? "poses" : "exercises";
  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-background">
      <div className="relative overflow-hidden px-5 pb-6 pt-[max(1rem,env(safe-area-inset-top))] text-primary-foreground" style={{ background: "var(--gradient-violet)" }}>
        <button onClick={onClose} className="flex h-9 w-9 items-center justify-center rounded-full bg-white/15"><ArrowLeft size={16} /></button>
        <h2 className="mt-4 text-center font-display text-[26px] font-extrabold">{data.title}</h2>
      </div>
      <div className="flex-1 overflow-y-auto px-5 pb-32 pt-4">
        <p className="font-display text-[16px] font-bold text-foreground">Workout Details</p>
        <div className="mt-2 grid grid-cols-2 gap-2.5">
          <div className="rounded-2xl bg-card p-3 ring-1 ring-border/60">
            <p className="text-[10px] font-bold uppercase tracking-wide text-primary">Basic</p>
            <p className="mt-1.5 text-[12.5px] text-foreground/85">🔥 {kcal} kcal</p>
            <p className="text-[12.5px] text-foreground/85">⏱ {dur} min</p>
            <p className="text-[12.5px] text-foreground/85">🎚 {data.level}</p>
          </div>
          <div className="rounded-2xl bg-card p-3 ring-1 ring-border/60">
            <p className="text-[10px] font-bold uppercase tracking-wide text-primary">Focus zones</p>
            <p className="mt-1.5 text-[12.5px] font-semibold text-foreground">{data.focus}</p>
          </div>
        </div>
        <button onClick={() => setPlaylist((p) => (p + 1) % PLAYLISTS.length)} className="mt-2.5 flex w-full items-center gap-2.5 rounded-2xl bg-card p-3 text-left ring-1 ring-border/60">
          <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary/10 text-primary"><Music size={16} /></span>
          <div className="min-w-0 flex-1"><p className="text-[10px] font-bold uppercase tracking-wide text-primary">Music</p><p className="text-[12.5px] font-semibold text-foreground">{PLAYLISTS[playlist]}</p></div>
          <ChevronRight size={16} className="text-muted-foreground" />
        </button>
        <div className="mt-2.5 rounded-2xl bg-card p-3 ring-1 ring-border/60">
          <p className="flex items-center gap-1 text-[10px] font-bold uppercase tracking-wide text-primary"><Clock size={11} /> Session length</p>
          <div className="mt-1.5 flex flex-wrap gap-1.5">
            {INTRO_DURATIONS.map((m) => <button key={m} onClick={() => setDur(m)} className={`rounded-full px-3 py-1 text-[12px] font-bold ${dur === m ? "bg-primary text-primary-foreground" : "bg-secondary text-foreground/75"}`}>{m} min</button>)}
          </div>
        </div>
        <p className="mt-4 font-display text-[15px] font-bold text-foreground">{items.length} {noun}</p>
        <div className="mt-2 space-y-1.5">
          {items.map((it, i) => (
            <button key={i} onClick={() => setDetail(it)} className="flex w-full items-center gap-3 rounded-2xl bg-card p-2.5 text-left ring-1 ring-border/60 active:scale-[0.99]">
              <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-accent/50 text-xl">{it.emoji}</span>
              <div className="min-w-0 flex-1"><p className="truncate text-[13px] font-semibold text-foreground">{it.name}</p><p className="text-[11px] text-muted-foreground">{introFmt(it.sec)}</p></div>
              <Info size={15} className="shrink-0 text-muted-foreground" />
            </button>
          ))}
        </div>
      </div>
      <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-background via-background/95 to-transparent px-5 pb-[max(1.25rem,env(safe-area-inset-bottom))] pt-4">
        <button onClick={() => data.onStart(dur)} className="w-full rounded-2xl bg-primary py-3.5 text-[15px] font-bold text-primary-foreground shadow-[var(--shadow-glow)] active:scale-[0.99]">Start</button>
      </div>

      {detail && (
        <div className="absolute inset-0 z-10 flex flex-col bg-background">
          <div className="relative flex items-center justify-center bg-accent/40 pt-[max(1rem,env(safe-area-inset-top))]">
            <button onClick={() => setDetail(null)} className="absolute right-4 top-[max(1rem,env(safe-area-inset-top))] flex h-9 w-9 items-center justify-center rounded-full bg-card/80 text-foreground"><X size={16} /></button>
            <span className="py-10 text-[110px] leading-none">{detail.emoji}</span>
          </div>
          <div className="flex-1 overflow-y-auto px-5 pb-32 pt-4">
            <h3 className="font-display text-[22px] font-extrabold text-foreground">{detail.name}</h3>
            <p className="mt-0.5 text-[11.5px] text-muted-foreground">{introFmt(detail.sec)}</p>
            <p className="mt-4 text-[11px] font-bold uppercase tracking-wide text-foreground/50">How to do it</p>
            {detail.steps?.length
              ? <ol className="mt-1 list-decimal space-y-0.5 pl-4">{detail.steps.map((s, i) => <li key={i} className="text-[12.5px] leading-relaxed text-foreground/85">{s}</li>)}</ol>
              : <p className="mt-1 text-[12.5px] leading-relaxed text-foreground/85">{detail.how ?? "Move with control through the full range. Keep your core engaged and shoulders relaxed."}</p>}
            <p className="mt-4 text-[11px] font-bold uppercase tracking-wide text-foreground/50">Breathing</p>
            {data.tool === "yoga"
              ? <p className="mt-1 text-[12.5px] leading-relaxed text-foreground/85">Breathe slow through the nose — lengthen on the inhale, soften deeper on the exhale. Never strain.</p>
              : <ul className="mt-1 space-y-0.5 text-[12.5px] leading-relaxed text-foreground/85"><li>• Exhale on the effort (the hard part).</li><li>• Inhale as you release / return.</li><li>• Never hold your breath.</li></ul>}
            <p className="mt-4 text-[11px] font-bold uppercase tracking-wide text-foreground/50">Common mistakes</p>
            <ul className="mt-1 space-y-0.5 text-[12.5px] leading-relaxed text-foreground/85">
              <li>• Rushing — keep it slow and controlled.</li>
              <li>• Losing form to finish faster — quality over speed.</li>
              {data.tool === "yoga" ? <li>• Holding your breath — keep it flowing.</li> : <li>• Locking the joints — keep knees & elbows soft.</li>}
            </ul>
          </div>
          <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-background via-background/95 to-transparent px-5 pb-[max(1.25rem,env(safe-area-inset-bottom))] pt-4">
            <button onClick={() => data.onStart(dur)} className="w-full rounded-2xl bg-primary py-3.5 text-[15px] font-bold text-primary-foreground shadow-[var(--shadow-glow)] active:scale-[0.99]">Start</button>
          </div>
        </div>
      )}
    </div>
  );
}

function MyPlanPage() {
  const { id } = Route.useParams();
  const navigate = useNavigate();
  const [profile, setProfile] = useState<Record<string, unknown> | null>(null);
  const [basics, setBasics] = useState<Record<string, unknown> | null>(null); // ayuraise.profile — age/sex/height/weight/activity/prakriti
  const [goalIds, setGoalIds] = useState<string[] | null | undefined>(undefined); // undefined = loading, null = not found
  const [name, setName] = useState("My personalized plan");
  const [medOpen, setMedOpen] = useState(false);
  const [ovr, setOvr] = useState<Record<string, ToolOverride>>({});
  const [enabled, setEnabled] = useState<string[]>(PLAN_TOOLS.map((t) => t.id));
  const [planStartedAt, setPlanStartedAt] = useState<number>(Date.now());
  const [yogaSession, setYogaSession] = useState<{ title: string; plan: ReturnType<typeof generatePlan> } | null>(null);
  const [exPlay, setExPlay] = useState<{ title: string; steps: Step[] } | null>(null);
  const [intro, setIntro] = useState<IntroData | null>(null); // workout-details screen shown before the player
  const [prog, setProg] = useState<{ yoga: { done: number[]; dates: Record<number, string> }; exercise: { done: number[]; dates: Record<number, string> } }>({ yoga: { done: [], dates: {} }, exercise: { done: [], dates: {} } });
  const [tab, setTab] = useState<"mine" | "recos">("mine");
  const [wizardMealMode, setWizardMealMode] = useState<"detailed" | "recos" | null>(null); // mealMode saved on a named plan's wizard
  const [dietAvoid, setDietAvoid] = useState<string[]>([]); // ingredients to leave out of the meal plan
  const changeOv = (tool: string, o: ToolOverride) => { setOvr((p) => ({ ...p, [tool]: { ...(p[tool] ?? {}), ...o } })); setToolOverride(tool, o); };

  useEffect(() => {
    try { const raw = localStorage.getItem("ayuraise.lifestyle"); setProfile(raw ? JSON.parse(raw) : null); } catch { /* ignore */ }
    try { const b = localStorage.getItem("ayuraise.profile"); setBasics(b ? JSON.parse(b) : null); } catch { /* ignore */ }
    if (id === "me") {
      const pp = loadPersonalPlan();
      setGoalIds(pp ? pp.goalIds : null);
      if (pp?.overrides) setOvr(pp.overrides);
      setEnabled(pp?.tools ?? PLAN_TOOLS.map((t) => t.id));
      if (pp?.createdAt) setPlanStartedAt(pp.createdAt);
      try { const pr = localStorage.getItem("ayuraise.myplan.prog"); if (pr) setProg(JSON.parse(pr)); } catch { /* ignore */ }
    } else {
      const yp = loadYogaPlans().find((p) => p.id === id);
      const w = (yp?.wizard ?? {}) as Record<string, unknown>;
      setGoalIds(yp ? ((w.goalIds as string[]) ?? []) : null);
      if (yp) setName(yp.name ?? yp.primary ?? "My plan");
      if (w.mealMode === "recos" || w.mealMode === "detailed") setWizardMealMode(w.mealMode);
      if (Array.isArray(w.avoidIng)) setDietAvoid(w.avoidIng as string[]);
    }
  }, [id]);

  // ---- engine + derivations (hooks must run before any early return) ----
  const conds = (profile?.conditions as string[]) ?? [];
  const cd = (profile?.condDetail as Record<string, Record<string, string>>) ?? {};
  const kind = cd.thyroid?.kind;
  const kg = Number(profile?.kg); const cm = Number(profile?.cm);
  const bmi = kg && cm ? kg / ((cm / 100) ** 2) : 0;
  const stressed = profile?.mood === "Low" || profile?.anxiety === "Often" || profile?.unwind === "Rarely";
  const sleepH = Number(profile?.sleep); const waking = Number(profile?.waking);
  const ctx = {
    thyroid: kind === "Hypo" ? ("hypo" as const) : kind === "Hyper" ? ("hyper" as const) : undefined,
    frail: bmi > 0 && bmi < 18.5,
    stressed,
    poorSleep: waking >= 4,
    sleepHours: sleepH,
  };

  const g = goalIds ?? [];
  const rp = useMemo(() => resolvePlan(g, ctx, conds, cd), [goalIds, profile]); // eslint-disable-line react-hooks/exhaustive-deps

  // derived tools the engine doesn't own: exercise / IF / fasting / meditation / habits / do's & don'ts
  const pregnant = conds.includes("pregnancy");
  const type1 = cd.diabetes?.type === "Type 1";
  const ifBlocked = pregnant || type1 || [...conds, ...g].some((x) => conditionMeta(x)?.ifBlock);
  const metabolicFocus = g.some((x) => conditionMeta(x)?.cluster === "metabolic");
  const wantsStrength = g.some((x) => ["strength", "muscles", "weight-loss", "obesity"].includes(x));
  const wantsMobility = g.some((x) => ["mobility", "flexibility", "posture", "bones-joints", "sr-fitness", "balance", "osteoarthritis", "osteoporosis"].includes(x));

  const exercise: string[] = [];
  if (wantsStrength) exercise.push("Strength training 3×/week — bodyweight or light weights");
  if (metabolicFocus) exercise.push("A brisk 30–40 min walk daily");
  if (wantsMobility) exercise.push("10 min of mobility & stretching daily");
  if (exercise.length === 0) exercise.push("A 30-min daily walk + light mobility");

  const herbs = Array.from(new Set([...rp.focus.flatMap((f) => f.herbs), ...rp.careLayers.flatMap((f) => f.herbs), ...rp.layers.flatMap((l) => l.herbs)]));
  const dos = Array.from(new Set(rp.focus.flatMap((f) => f.dietMods)));
  const donts = rp.safety;

  const meditation = useMemo(() => {
    const base = ["5 min mindful breathing (Nadi Shodhana)", "Bhramari (humming breath) in the evening"];
    if (ctx.stressed) base.push("A short 10-min Yoga Nidra");
    if (ctx.poorSleep) base.push("Legs-up-the-wall + slow breathing before bed");
    return base;
  }, [ctx.stressed, ctx.poorSleep]);

  const H = (profile?.habits as string[]) ?? [];
  const habits: string[] = [];
  if (H.includes("smoke")) habits.push("Cut smoking toward 1 a day");
  if (H.includes("sweets")) habits.push("Cut back on sweets & sugary drinks");
  if (H.includes("fried")) habits.push("Reduce fried & packaged food");
  if (H.includes("alcohol")) habits.push("Trim your drinking");
  const lastH = profile?.lastMeal ? parseInt(String(profile.lastMeal).split(":")[0], 10) : NaN;
  if (!Number.isNaN(lastH) && lastH >= 21) habits.push("Finish dinner by ~9 pm");
  habits.push("Keep a 12-hour gap between dinner & breakfast");
  if (profile?.water === "<1.5" || profile?.water === "1.5–2") habits.push("Drink a bit more water");
  if (Number(profile?.sleep ?? 7) < 6.5) habits.push("Aim for 7+ hours of sleep");

  const diet = rp.focus[0];
  const mealPlan = useMemo(() => buildMealPlan({
    age: Number(basics?.age) || undefined,
    sex: (basics?.gender as Sex) || undefined,
    heightCm: Number(basics?.heightCm ?? profile?.cm) || undefined,
    weightKg: Number(basics?.weightKg ?? profile?.kg) || undefined,
    activity: (basics?.activity as ActivityLevel) || undefined,
    dosha: (basics?.prakriti as { dosha?: Dosha } | null)?.dosha || undefined,
    cuisine: (basics?.cuisineRegion as string) || (basics?.cuisine as string) || (profile?.cuisineRegion as string) || (profile?.cuisine as string) || undefined,
    goalIds: g,
    conditions: conds,
  }), [basics, goalIds, profile]); // eslint-disable-line react-hooks/exhaustive-deps
  const yogaHas = rp.yoga.am.length + rp.yoga.pm.length + rp.yoga.anytime.length > 0;

  // Goals summary — Primary focus / Also covered (health) + Fitness goal, from the saved selections
  const labelOf = (x: string) => conditionMeta(x)?.label ?? x;
  const activeFocusP = (profile?.activeFocus as string[]) ?? [];
  const healthSel = Array.from(new Set([...conds, ...((profile?.prevention as string[]) ?? []), ...((profile?.women as string[]) ?? []), ...((profile?.everyday as string[]) ?? [])]));
  const primaryFocus = activeFocusP.filter((x) => healthSel.includes(x));
  const alsoCovered = healthSel.filter((x) => !primaryFocus.includes(x));
  const fitnessSel = (profile?.chosenGoals as string[]) ?? [];
  // Play a day's session inline using the real Yoga / Exercise players (3-a-day, sequential)
  const today = new Date().toISOString().slice(0, 10);
  const doneTodayCount = (tool: "yoga" | "exercise") => prog[tool].done.filter((d) => prog[tool].dates[d] === today).length;
  const markDone = (tool: "yoga" | "exercise", day: number) => setProg((p) => {
    if (p[tool].done.includes(day)) return p;
    const np = { ...p, [tool]: { done: [...p[tool].done, day], dates: { ...p[tool].dates, [day]: today } } };
    try { localStorage.setItem("ayuraise.myplan.prog", JSON.stringify(np)); } catch { /* ignore */ }
    return np;
  });
  const exCountFor = (min: number) => { const avg = CLASSICS.reduce((a, e) => a + e.sec, 0) / (CLASSICS.length || 1) || 40; return Math.max(4, Math.min(CLASSICS.length, Math.round((min * 60) / avg))); };
  const buildYogaItems = (min: number): IntroItem[] =>
    posesFor(generatePlan("none", toYogaGoal(g[0] ?? "wellness"), min)).map((p) => ({ name: p.name, emoji: p.emoji, sec: p.durationSec, steps: p.steps }));
  const buildExItems = (min: number): IntroItem[] =>
    bundleSteps(CLASSICS.slice(0, exCountFor(min)).map((e) => ({ exId: e.id, sets: 1, sec: e.sec })))
      .filter((s) => s.kind !== "break")
      .map((s) => ({ name: s.name, emoji: s.emoji, sec: s.sec, how: getExercise(s.exId)?.how }));

  // Tapping a day opens the workout-details screen first (choose time, see the list), then the player.
  const openYogaDay = (d: number) => setIntro({
    tool: "yoga", title: `Yoga · Day ${d}`, level: (ovr.yoga?.level as string) ?? "Beginner", focus: "Full body · flexibility & calm",
    minutes: Number(ovr.yoga?.minutes) || 20, build: buildYogaItems,
    onStart: (min) => { markDone("yoga", d); setIntro(null); setYogaSession({ title: `Yoga · Day ${d}`, plan: generatePlan("none", toYogaGoal(g[0] ?? "wellness"), min) }); },
  });
  const openExerciseDay = (d: number) => setIntro({
    tool: "exercise", title: `Exercise · Day ${d}`, level: (ovr.exercise?.level as string) ?? "Beginner", focus: "Full body",
    minutes: Number(ovr.exercise?.minutes) || 30, build: buildExItems,
    onStart: (min) => { markDone("exercise", d); setIntro(null); setExPlay({ title: `Exercise · Day ${d}`, steps: bundleSteps(CLASSICS.slice(0, exCountFor(min)).map((e) => ({ exId: e.id, sets: 1, sec: e.sec }))) }); },
  });
  // Edit a part → open that tool's own question flow in the Create wizard, plan goals carried (auto-selected)
  const editTool = (tool: string) => navigate({ to: "/create", search: { tool, goals: g.join(",") } });
  const removeTool = (tool: string) => {
    const label = PLAN_TOOLS.find((t) => t.id === tool)?.label ?? tool;
    if (typeof window !== "undefined" && !window.confirm(`Remove ${label} from your plan?`)) return;
    const next = enabled.filter((x) => x !== tool); setEnabled(next); setPlanTools(next);
  };
  const addTool = (tool: string) => { const next = [...enabled, tool]; setEnabled(next); setPlanTools(next); if (tool === "yoga" || tool === "exercise" || tool === "diet") editTool(tool); };

  if (goalIds === undefined) return <div className="flex min-h-svh items-center justify-center text-[13px] text-muted-foreground">Loading…</div>;
  if (goalIds === null) {
    return (
      <div className="flex min-h-svh flex-col items-center justify-center gap-3 p-8 text-center">
        <p className="text-[14px] font-semibold text-foreground">No plan yet</p>
        <Link to="/lifestyle" search={{ start: "conditions" }} className="rounded-full bg-primary px-4 py-2 text-[12.5px] font-bold text-primary-foreground">Create my personalized plan</Link>
      </div>
    );
  }

  return (
    <div className="min-h-svh pb-28" style={{ background: "var(--gradient-hero)" }}>
      <div className="relative overflow-hidden px-4 pb-5 pt-[max(1rem,env(safe-area-inset-top))]" style={{ background: "var(--gradient-night)" }}>
        <div className="absolute -right-16 -top-16 h-40 w-40 rounded-full bg-amber-400/20 blur-3xl" />
        <div className="relative flex items-center gap-2.5">
          <Link to="/home" className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-white/15 text-primary-foreground"><ArrowLeft size={15} /></Link>
          <div className="min-w-0">
            <h1 className="truncate font-display text-[19px] font-extrabold leading-tight text-primary-foreground">{name}</h1>
            <p className="truncate text-[11.5px] text-primary-foreground/80">28 days · gets extended based on your feedback</p>
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-xl space-y-3.5 px-4 pt-4">
        {/* Goals summary — your selections, with auto-covered extras below (if any) */}
        {id === "me" && (() => {
          const goalItems = Array.from(new Set([...healthSel, ...fitnessSel]));
          const items = goalItems.length ? goalItems : g;
          const covered = rp.layers.map((L) => L.label);
          return (
            <section className="overflow-hidden rounded-2xl bg-card ring-1 ring-border/60">
              <div className="flex items-center justify-between gap-2 px-3.5 py-2" style={{ background: "var(--gradient-leaf)" }}>
                <p className="font-display text-[12.5px] font-bold text-primary-foreground">🎯 Your goals</p>
                <Link to="/lifestyle" search={{ mode: "unified" }} className="shrink-0 rounded-full bg-white/20 px-2.5 py-0.5 text-[10px] font-bold text-primary-foreground active:opacity-70">Change</Link>
              </div>
              <div className="px-3.5 py-2.5">
                <div className="flex flex-wrap gap-1">
                  {items.map((x, i) => (
                    <span key={i} className="rounded-full bg-primary/10 px-2 py-0.5 text-[11px] font-semibold text-primary ring-1 ring-primary/20">{labelOf(x)}</span>
                  ))}
                </div>
                {covered.length > 0 && (
                  <>
                    <p className="mt-2 px-0.5 text-[9px] font-bold uppercase tracking-wide text-muted-foreground">Also covered</p>
                    <div className="mt-0.5 flex flex-wrap gap-1">
                      {covered.map((c, i) => <span key={i} className="rounded-full bg-secondary px-2 py-0.5 text-[10.5px] font-semibold text-foreground/75">{c}</span>)}
                    </div>
                  </>
                )}
              </div>
            </section>
          );
        })()}

        {/* Add not-added tools — quick add, right below goals */}
        {id === "me" && PLAN_TOOLS.some((t) => !enabled.includes(t.id)) && (
          <div className="flex flex-wrap items-center gap-1.5 rounded-xl bg-card/70 px-3 py-2 ring-1 ring-border/60">
            <span className="text-[10px] font-bold uppercase tracking-wide text-muted-foreground">Add</span>
            {PLAN_TOOLS.filter((t) => !enabled.includes(t.id)).map((t) => (
              <button key={t.id} onClick={() => addTool(t.id)} className="flex items-center gap-1 rounded-full bg-secondary px-2.5 py-1 text-[11px] font-semibold text-foreground/80 active:opacity-70">{t.emoji} {t.label} <span className="font-bold text-primary">＋</span></button>
            ))}
          </div>
        )}

        {/* My plan / Recommendations tabs */}
        <div className="flex gap-1.5">
          <button onClick={() => setTab("mine")} className={`flex-1 rounded-full py-1.5 text-[12px] font-bold ${tab === "mine" ? "bg-primary text-primary-foreground" : "bg-secondary text-foreground/70"}`}>My plan</button>
          <button onClick={() => setTab("recos")} className={`flex-1 rounded-full py-1.5 text-[12px] font-bold ${tab === "recos" ? "bg-primary text-primary-foreground" : "bg-secondary text-foreground/70"}`}>Recommendations</button>
        </div>

        {/* Conflict / safety banners */}
        {rp.conflicts.map((cf, i) => (
          <div key={i} className={`rounded-2xl p-3 text-[11.5px] leading-snug ring-1 ${cf.action === "block" ? "bg-red-50 text-red-800 ring-red-200 dark:bg-red-900/20 dark:text-red-300 dark:ring-red-800/60" : "bg-amber-50 text-amber-800 ring-amber-200 dark:bg-amber-900/20 dark:text-amber-300 dark:ring-amber-800/60"}`}>
            <b>{cf.action === "block" ? "Heads up — " : "Note — "}</b>{cf.note}
          </div>
        ))}

        {tab === "mine" && (<>
        {/* 1 · Yoga */}
        {yogaHas && enabled.includes("yoga") && (
          <Tool emoji="🧘" title="Yoga & pranayam" onEdit={id === "me" ? () => editTool("yoga") : undefined} onRemove={id === "me" ? () => removeTool("yoga") : undefined}>
            <DayStrip done={prog.yoga.done} total={28} onPlay={openYogaDay} />
          </Tool>
        )}

        {/* 2 · Exercise */}
        {enabled.includes("exercise") && (
          <Tool emoji="🏋️" title="Exercise" onEdit={id === "me" ? () => editTool("exercise") : undefined} onRemove={id === "me" ? () => removeTool("exercise") : undefined}>
            <DayStrip done={prog.exercise.done} total={28} onPlay={openExerciseDay} />
          </Tool>
        )}

        {/* 3 · Diet */}
        {diet && enabled.includes("diet") && (
          <Tool emoji="🥗" title="Diet" subtitle="your meal plan" onEdit={id === "me" ? () => editTool("diet") : undefined} onRemove={id === "me" ? () => removeTool("diet") : undefined}>
            <MealPlanView plan={mealPlan} mode={(id === "me" ? ovr.diet?.mealMode : wizardMealMode) ?? "detailed"} avoid={dietAvoid} onAvoidChange={setDietAvoid} />
            {dos.length > 0 && (
              <div className="border-t border-border/50 pt-2">
                <p className="mb-1 text-[10px] font-bold uppercase tracking-wide text-muted-foreground">For your focus</p>
                <ul className="list-disc space-y-1 pl-4">{dos.slice(0, 6).map((d, i) => <li key={i}>{d}</li>)}</ul>
              </div>
            )}
            <Link to="/section/diet" className="inline-block rounded-full bg-secondary px-3 py-1 text-[11px] font-bold text-foreground">Browse more diets →</Link>
          </Tool>
        )}

        </>)}

        {tab === "recos" && (<>
        {/* 4 · Detox (engine picks 2–3, across days) */}
        {rp.detox.protocols.length > 0 && enabled.includes("detox") && (
          <Tool emoji="✨" title="Detox" subtitle={rp.detox.protocols.length > 1 ? "across your week" : undefined} onEdit={() => navigate({ to: "/section/detox" })} onRemove={id === "me" ? () => removeTool("detox") : undefined}>
            {rp.detox.protocols.map((d) => (
              <div key={d.id}>
                <p className="font-semibold text-foreground">{d.label}</p>
                <ul className="list-disc space-y-0.5 pl-4">{d.home.map((h, i) => <li key={i}>{h}</li>)}</ul>
              </div>
            ))}
            <p className="rounded-xl bg-amber-50 px-3 py-2 text-[10.5px] leading-snug text-amber-800 ring-1 ring-amber-200 dark:bg-amber-900/20 dark:text-amber-300 dark:ring-amber-800/60">Do these at home when ready. Deeper cleanses (<b>Panchakarma</b>) are best at an Ayurveda centre.</p>
          </Tool>
        )}

        {/* 5 · Intermittent fasting */}
        {enabled.includes("fasting") && (
          <Tool emoji="⏱️" title="Intermittent fasting" onRemove={id === "me" ? () => removeTool("fasting") : undefined}>
            {ifBlocked
              ? <p className="text-muted-foreground">Fasting isn't advised for you right now{pregnant ? " (pregnancy)" : type1 ? " (type 1 — needs your doctor)" : ""}. We'll keep meals regular instead.</p>
              : <p>{metabolicFocus ? "A 14:10 window — e.g. finish dinner by 8 pm, first meal after 10 am." : "A gentle 12-hour overnight gap — finish dinner early, break it after ~12 hours."}</p>}
            {!ifBlocked && <Link to="/section/fasting" className="inline-block rounded-full bg-secondary px-3 py-1 text-[11px] font-bold text-foreground">Set my window →</Link>}
          </Tool>
        )}

        {/* 6 · Fasting */}
        {enabled.includes("fasting") && !ifBlocked && metabolicFocus && (
          <Tool emoji="🍽️" title="Fasting day">
            <p>One light day a week — fruit, buttermilk or a simple moong khichdi — to rest your system.</p>
            <Link to="/section/fasting" className="inline-block rounded-full bg-secondary px-3 py-1 text-[11px] font-bold text-foreground">Plan a fast day →</Link>
          </Tool>
        )}

        {/* 7 · Meditation (few + expand) */}
        {enabled.includes("meditation") && (
          <Tool emoji="🕉️" title="Meditation" onEdit={() => navigate({ to: "/section/meditation" })} onRemove={id === "me" ? () => removeTool("meditation") : undefined}>
            <ul className="list-disc space-y-1 pl-4">{(medOpen ? meditation : meditation.slice(0, 2)).map((m, i) => <li key={i}>{m}</li>)}</ul>
            {meditation.length > 2 && (
              <button onClick={() => setMedOpen((o) => !o)} className="inline-flex items-center gap-1 text-[11px] font-bold text-primary">
                {medOpen ? "Show less" : "Show all"} <ChevronDown size={13} className={medOpen ? "rotate-180 transition" : "transition"} />
              </button>
            )}
            <div><Link to="/section/meditation" className="inline-block rounded-full bg-secondary px-3 py-1 text-[11px] font-bold text-foreground">Open meditation library →</Link></div>
          </Tool>
        )}

        </>)}

        {tab === "mine" && (<>
        {/* 8 · Herbs */}
        {herbs.length > 0 && enabled.includes("herbs") && (
          <Tool emoji="🌱" title="Herbs & remedies" onRemove={id === "me" ? () => removeTool("herbs") : undefined}>
            <Chips items={herbs} />
          </Tool>
        )}

        {/* 9 · Do's & Don'ts */}
        {(dos.length > 0 || donts.length > 0) && (
          <Tool emoji="✅" title="Do's & Don'ts">
            {dos.length > 0 && <div><p className="text-[10.5px] font-bold uppercase tracking-wide text-emerald-600">Do</p><ul className="list-disc space-y-1 pl-4">{dos.map((d, i) => <li key={i}>{d}</li>)}</ul></div>}
            {donts.length > 0 && <div><p className="mt-1 text-[10.5px] font-bold uppercase tracking-wide text-rose-500">Take care</p><ul className="list-disc space-y-1 pl-4">{donts.map((d, i) => <li key={i}>{d}</li>)}</ul></div>}
          </Tool>
        )}

        {/* 10 · Habits */}
        {habits.length > 0 && (
          <Tool emoji="🔄" title="Habits to shift">
            <ul className="list-disc space-y-1 pl-4">{habits.map((h, i) => <li key={i}>{h}</li>)}</ul>
          </Tool>
        )}

        </>)}

        <p className="px-1 text-[10.5px] leading-snug text-muted-foreground">This plan supports your wellness alongside medical care — it doesn't replace your doctor. Seek urgent help for any severe or sudden symptoms.</p>

        <Link to="/home" className="block rounded-2xl bg-primary py-2.5 text-center text-[12.5px] font-bold text-primary-foreground">Done</Link>
      </div>
      {intro && <WorkoutIntro data={intro} onClose={() => setIntro(null)} />}
      {yogaSession && <SessionPlayer title={yogaSession.title} plan={yogaSession.plan} feedback={false} onClose={() => setYogaSession(null)} />}
      {exPlay && <ExercisePlayer src={{ title: exPlay.title, steps: exPlay.steps, startIndex: 0 }} onClose={() => setExPlay(null)} />}
      <AyuBot />
      <BottomNav />
    </div>
  );
}
