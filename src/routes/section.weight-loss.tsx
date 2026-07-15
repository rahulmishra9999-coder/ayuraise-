import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useMemo, useRef, useState } from "react";
import {
  ArrowLeft, Scale, Sparkles, ChevronRight, TrendingDown, TrendingUp, Target,
  Apple, Calendar, Plus, AlertCircle, HeartPulse, Activity, Hourglass, Droplets,
  Footprints, Dumbbell, Flower2, Brain, Moon, GlassWater, Wand2,
  Home, GraduationCap, LineChart, Bot, CheckCircle2, Circle,
  ChevronLeft, X, Trophy, Flame, Award, Zap, Repeat, Utensils, Sun,
  BookOpen, Pencil, Trash2, Bell, MessageCircle,
} from "lucide-react";
import { BottomNav } from "@/components/BottomNav";
import { WLScienceHero, WLLessonsGrid } from "@/components/WLLessons";
import { WLArticlesSection } from "@/components/WLArticles";
import {
  loadPlan, savePlan, loadPunches, addPunch,
  loadProfile, calcTDEE,
  computeIntake, paceLabel, projectedDateFromPace, deriveThird,
  startPipeline, PIPELINE_ROUTE, type PipelineStep,
  projectedDate,
  type WLGoal, type WLPlan, type PunchEntry,
} from "@/lib/weight-loss";

const PLAN_KEY = "ayuraise.wl.plan";

export const Route = createFileRoute("/section/weight-loss")({
  head: () => ({
    meta: [
      { title: "Weight Loss · AyuRaise" },
      { name: "description", content: "Your personalized weight loss plan — diet, movement, sleep, and stress in one place." },
    ],
  }),
  component: WLSection,
});

/* ============================================================
   Root
============================================================ */
function WLSection() {
  const [plan, setPlan] = useState<WLPlan | null>(null);
  const [showFlow, setShowFlow] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);

  const reload = () => setPlan(loadPlan());
  useEffect(() => { reload(); }, [showFlow]);

  const [active, setActive] = useState<string>("");
  const [navVisible, setNavVisible] = useState(false);
  const heroRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!heroRef.current) return;
    const io = new IntersectionObserver(([e]) => setNavVisible(!e.isIntersecting), { threshold: 0.05 });
    io.observe(heroRef.current);
    return () => io.disconnect();
  }, []);

  const ids = plan ? ["plan", "modules", "checkin", "tasks", "learn"] : ["learn"];
  useEffect(() => {
    const io = new IntersectionObserver(
      (entries) => entries.forEach((en) => { if (en.isIntersecting) setActive(en.target.id); }),
      { rootMargin: "-45% 0px -50% 0px", threshold: 0 }
    );
    ids.forEach((id) => { const el = document.getElementById(id); if (el) io.observe(el); });
    return () => io.disconnect();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [!!plan]);

  const scrollTo = (id: string) => {
    const el = document.getElementById(id); if (!el) return;
    const y = el.getBoundingClientRect().top + window.scrollY - 72;
    window.scrollTo({ top: y, behavior: "smooth" });
  };

  const deletePlan = () => {
    try { localStorage.removeItem(PLAN_KEY); } catch {}
    setConfirmDelete(false);
    reload();
  };

  return (
    <div className="min-h-svh pb-28" style={{ background: "var(--gradient-hero)" }}>
      <div className="mx-auto max-w-xl px-5 pt-[max(0.75rem,env(safe-area-inset-top))]">
        {/* Top bar */}
        <div className="flex items-center justify-between">
          <Link to="/home" className="flex h-10 w-10 items-center justify-center rounded-full bg-card shadow-[var(--shadow-soft)] ring-1 ring-border/60" aria-label="Back">
            <ArrowLeft size={18} />
          </Link>
          <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-muted-foreground">Weight Loss</p>
          <div className="w-10" />
        </div>

        <div ref={heroRef} className="mt-3">
          <CompactHero onBuild={() => setShowFlow(true)} hasPlan={!!plan} />
        </div>
      </div>

      <FloatingNav visible={navVisible} active={active} hasPlan={!!plan} onSelect={scrollTo} />

      <div className="mx-auto max-w-xl px-5">
        {plan ? (
          <PlanState
            plan={plan}
            onRebuild={() => setShowFlow(true)}
            onDelete={() => setConfirmDelete(true)}
            reload={reload}
          />
        ) : (
          <EducationState onBuild={() => setShowFlow(true)} />
        )}
      </div>

      {showFlow && <PlanFlow onClose={() => setShowFlow(false)} existing={plan} />}
      {confirmDelete && <ConfirmDeleteDialog onCancel={() => setConfirmDelete(false)} onConfirm={deletePlan} />}
      <BotFab />
      <BottomNav />
    </div>
  );
}

/* ============================================================
   Hero
============================================================ */
function CompactHero({ onBuild, hasPlan }: { onBuild: () => void; hasPlan: boolean }) {
  return (
    <section className="relative overflow-hidden rounded-[28px] p-5 shadow-[var(--shadow-glow)]" style={{ background: "var(--gradient-gold)" }}>
      <div className="absolute -right-8 -top-8 h-32 w-32 rounded-full bg-white/30 blur-2xl" />
      <div className="relative">
        <div className="inline-flex items-center gap-1.5 rounded-full bg-white/30 px-2.5 py-1 text-[10px] font-bold uppercase tracking-widest text-foreground backdrop-blur-sm">
          <Sparkles size={11} /> Ayuraise
        </div>
        <h1 className="mt-2 font-display text-[26px] font-semibold leading-[1.1] text-foreground">Weight Loss</h1>
        <p className="mt-1.5 text-[13px] leading-relaxed text-foreground/80">
          {hasPlan
            ? "Your personalized plan is active. Small daily wins compound."
            : "Learn how weight loss really works, then build a plan made for your body."}
        </p>
        <button
          onClick={onBuild}
          className="mt-4 flex w-full items-center justify-center gap-2 rounded-2xl bg-foreground px-5 py-3 text-sm font-semibold text-background shadow-lg transition-transform active:scale-[0.98]"
        >
          {hasPlan ? (<><Pencil size={16} /> Edit My Plan</>) : (<><Sparkles size={16} /> Create My Personalized Weight Loss Plan</>)}
        </button>
      </div>
    </section>
  );
}

/* ============================================================
   Floating nav
============================================================ */
function FloatingNav({ visible, active, hasPlan, onSelect }: { visible: boolean; active: string; hasPlan: boolean; onSelect: (id: string) => void }) {
  const chips = hasPlan
    ? [
        { id: "plan",    label: "Journey", icon: Home },
        { id: "modules", label: "Plans",   icon: Flower2 },
        { id: "checkin", label: "Weight",  icon: LineChart },
        { id: "tasks",   label: "Today",   icon: CheckCircle2 },
        { id: "learn",   label: "Learn",   icon: GraduationCap },
      ]
    : [{ id: "learn", label: "Learn", icon: GraduationCap }];
  return (
    <div
      className={`sticky top-3 z-40 mx-auto mt-3 flex w-[calc(100%-2rem)] max-w-md items-center justify-between gap-1 rounded-full bg-card/85 p-1.5 shadow-[var(--shadow-soft)] ring-1 ring-border/60 backdrop-blur-xl transition-all duration-300 ${
        visible ? "opacity-100 translate-y-0" : "pointer-events-none -translate-y-3 opacity-0"
      }`}
    >
      {chips.map((c) => {
        const Icon = c.icon; const on = active === c.id;
        return (
          <button
            key={c.id}
            onClick={() => onSelect(c.id)}
            className={`flex flex-1 items-center justify-center gap-1.5 rounded-full px-2 py-2 text-[11px] font-semibold transition-all ${
              on ? "bg-primary text-primary-foreground shadow-[var(--shadow-glow)]" : "text-muted-foreground"
            }`}
          >
            <Icon size={14} /><span>{c.label}</span>
          </button>
        );
      })}
    </div>
  );
}

function SectionTitle({ title, subtitle }: { title: string; subtitle?: string }) {
  return (
    <div className="mt-7 mb-3">
      <h2 className="font-display text-xl font-semibold leading-tight">{title}</h2>
      {subtitle && <p className="mt-0.5 text-[12px] text-muted-foreground">{subtitle}</p>}
    </div>
  );
}

/* ============================================================
   STATE 1 — Education (no plan) — flat, ungrouped
============================================================ */
function EducationState({ onBuild }: { onBuild: () => void }) {
  return (
    <>
      <section id="learn" className="scroll-mt-24">
        <WLScienceHero />
        <div className="mt-4">
          <SectionTitle title="Science of Weight Loss" subtitle="Bite-sized lessons across four pillars." />
          <WLLessonsGrid />
        </div>
      </section>

      <section className="mt-8">
        <SectionTitle title="Coach Reads" subtitle="Evidence-based deep dives — Indian kitchen, real numbers." />
        <WLArticlesSection />
      </section>

      <section className="mt-8">
        <SectionTitle title="Do's & Don'ts" subtitle="Simple guardrails while you get started." />
        <DoDontGrid />
      </section>

      <section className="mt-10 overflow-hidden rounded-[28px] p-6 text-primary-foreground shadow-[var(--shadow-glow)]" style={{ background: "var(--gradient-violet)" }}>
        <div className="inline-flex items-center gap-1.5 rounded-full bg-white/25 px-2.5 py-1 text-[10px] font-bold uppercase tracking-widest backdrop-blur-sm">
          <Sparkles size={11} /> Ready when you are
        </div>
        <h3 className="mt-2 font-display text-xl font-semibold leading-tight">Build my personalized weight loss plan</h3>
        <p className="mt-2 text-[13px] leading-relaxed text-primary-foreground/90">
          Your AI coach will craft a diet target, movement recommendations, a realistic timeline and daily habits — tuned to your body.
        </p>
        <button
          onClick={onBuild}
          className="mt-4 flex w-full items-center justify-center gap-2 rounded-2xl bg-foreground px-5 py-3 text-sm font-semibold text-background shadow-lg transition-transform active:scale-[0.98]"
        >
          <Sparkles size={16} /> Create My Plan
        </button>
      </section>
    </>
  );
}


const DOS = [
  { emoji: "💧", text: "Drink water before meals" },
  { emoji: "🥚", text: "Anchor meals with protein" },
  { emoji: "🚶", text: "Walk 10 min after eating" },
  { emoji: "🌙", text: "Sleep 7–8 hours" },
  { emoji: "🌬️", text: "3 deep breaths before snacking" },
  { emoji: "🍽️", text: "Eat slowly, chew well" },
];
const DONTS = [
  { emoji: "🥤", text: "Skip liquid calories" },
  { emoji: "🍟", text: "Avoid ultra-processed snacks" },
  { emoji: "🌙", text: "No late-night heavy meals" },
  { emoji: "📱", text: "Don't eat while scrolling" },
  { emoji: "⏰", text: "Don't skip meals then binge" },
  { emoji: "⚖️", text: "Don't weigh in daily" },
];
function DoDontGrid() {
  return (
    <div className="grid grid-cols-2 gap-3">
      <div className="rounded-3xl bg-card p-4 shadow-[var(--shadow-soft)] ring-1 ring-border/60">
        <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-emerald-600">Do</p>
        <ul className="mt-2 space-y-1.5">
          {DOS.map((d, i) => (
            <li key={i} className="flex items-start gap-2 text-[12px] leading-snug text-foreground/85">
              <span>{d.emoji}</span><span>{d.text}</span>
            </li>
          ))}
        </ul>
      </div>
      <div className="rounded-3xl bg-card p-4 shadow-[var(--shadow-soft)] ring-1 ring-border/60">
        <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-rose-600">Don't</p>
        <ul className="mt-2 space-y-1.5">
          {DONTS.map((d, i) => (
            <li key={i} className="flex items-start gap-2 text-[12px] leading-snug text-foreground/85">
              <span>{d.emoji}</span><span>{d.text}</span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

/* ============================================================
   STATE 2 — Plan active
============================================================ */
function PlanState({ plan, onRebuild, onDelete, reload }: {
  plan: WLPlan; onRebuild: () => void; onDelete: () => void; reload: () => void;
}) {
  const [punches, setPunches] = useState<PunchEntry[]>([]);
  useEffect(() => { setPunches(loadPunches()); }, []);
  const refreshPunches = () => setPunches(loadPunches());

  return (
    <>
      <section id="plan" className="scroll-mt-24">
        <SectionTitle title="My Journey" subtitle="Your journey at a glance." />
        <MyPlanCard plan={plan} punches={punches} onEdit={onRebuild} onDelete={onDelete} reload={reload} />
      </section>

      <section id="modules" className="scroll-mt-24">
        <SectionTitle title="My Plans" subtitle="Open any plan to practice." />
        <SavedModulesRow plan={plan} />
      </section>

      <section id="checkin" className="scroll-mt-24">
        <SectionTitle title="Punch My Weight" subtitle="Log whenever you like." />
        <SimpleCheckIn plan={plan} onLogged={refreshPunches} />
        {punches.length > 0 && <ProgressBlock plan={plan} punches={punches} />}
      </section>

      <section id="tasks" className="scroll-mt-24">
        <SectionTitle title="Today's Tasks" subtitle="Small wins. Every day." />
        <TodaysTasks plan={plan} />
      </section>

      <section id="learn" className="scroll-mt-24">
        <SectionTitle title="Keep Learning" subtitle="One concept a day keeps momentum going." />
        <WLLessonsGrid />
      </section>

      <section className="mt-8">
        <SectionTitle title="Coach Reads" subtitle="Evidence-based deep dives — Indian kitchen, real numbers." />
        <WLArticlesSection />
      </section>

      {/* Bottom actions */}
      <section className="mt-8 grid grid-cols-2 gap-3">
        <button
          onClick={onRebuild}
          className="flex items-center justify-center gap-2 rounded-2xl bg-card px-4 py-3 text-sm font-semibold shadow-[var(--shadow-soft)] ring-1 ring-border/60 active:scale-[0.98]"
        >
          <Pencil size={15} /> Edit My Plan
        </button>
        <button
          onClick={onDelete}
          className="flex items-center justify-center gap-2 rounded-2xl bg-rose-50 px-4 py-3 text-sm font-semibold text-rose-700 ring-1 ring-rose-200 active:scale-[0.98]"
        >
          <Trash2 size={15} /> Delete Plan
        </button>
      </section>
    </>
  );
}

/* ---------------- My Plan card ---------------- */
function MyPlanCard({ plan, punches, onEdit, onDelete, reload }: {
  plan: WLPlan; punches: PunchEntry[]; onEdit: () => void; onDelete: () => void; reload: () => void;
}) {
  const latest = punches.at(-1)?.weight;
  const current = latest ?? plan.currentWeight;
  const hasPunches = punches.length > 0;
  const total = plan.startWeight - plan.targetWeight;
  const done = plan.startWeight - current;
  const pct = total !== 0 ? Math.max(0, Math.min(100, Math.round((done / total) * 100))) : 0;
  // position of current between start and target for the timeline bar
  const barPos = total !== 0 ? Math.max(0, Math.min(100, (done / total) * 100)) : 0;

  const [editField, setEditField] = useState<null | "target" | "date" | "pace">(null);
  const [botDialog, setBotDialog] = useState<null | { newPace: number }>(null);

  return (
    <div
      className="relative overflow-hidden rounded-[28px] p-5 text-primary-foreground shadow-[var(--shadow-glow)]"
      style={{ background: "var(--gradient-leaf)" }}
    >
      <div className="absolute -right-10 -top-10 h-32 w-32 rounded-full bg-white/25 blur-2xl" />
      <div className="relative">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-[0.22em] opacity-85">My Plan</p>
            <h3 className="font-display text-lg font-semibold">
              {plan.goal === "lose" ? "Losing" : plan.goal === "gain" ? "Gaining" : "Maintaining"} · {Math.abs(plan.startWeight - plan.targetWeight).toFixed(1)} kg journey
            </h3>
          </div>
          <div className="flex items-center gap-1.5">
            <button onClick={onEdit} className="flex h-9 items-center gap-1.5 rounded-full bg-white/25 px-3 text-[11px] font-semibold backdrop-blur">
              <Pencil size={12} /> Edit
            </button>
            <button onClick={onDelete} className="flex h-9 w-9 items-center justify-center rounded-full bg-white/25 backdrop-blur" aria-label="Delete plan">
              <Trash2 size={13} />
            </button>
          </div>
        </div>

        {/* Timeline: Start → Current → Target */}
        <div className="mt-5">
          <div className="flex items-end justify-between text-[11px]">
            <div>
              <p className="opacity-80">Start</p>
              <p className="font-display text-base font-semibold">{plan.startWeight} kg</p>
            </div>
            <div className="text-center">
              <p className="opacity-80">{hasPunches ? "Current" : "Starting"}</p>
              <p className="font-display text-2xl font-semibold leading-none">{current} <span className="text-xs opacity-80">kg</span></p>
            </div>
            <div className="text-right">
              <p className="opacity-80">Target</p>
              <p className="font-display text-base font-semibold">{plan.targetWeight} kg</p>
            </div>
          </div>
          <div className="relative mt-2 h-2 rounded-full bg-white/25">
            <div className="absolute inset-y-0 left-0 rounded-full bg-white/85" style={{ width: `${barPos}%` }} />
            <div
              className="absolute -top-1 h-4 w-4 -translate-x-1/2 rounded-full bg-white shadow ring-2 ring-primary"
              style={{ left: `${barPos}%` }}
            />
          </div>
          {hasPunches && (
            <p className="mt-2 text-[11px] opacity-90">
              {pct}% of your journey complete · {(plan.startWeight - current).toFixed(1)} kg down
            </p>
          )}
        </div>

        {/* Sparkline of punches */}
        {hasPunches && (
          <div className="mt-3">
            <MiniSparkline start={plan.startWeight} target={plan.targetWeight} punches={punches} />
          </div>
        )}

        {/* Editable stat pills */}
        <div className="mt-4 grid grid-cols-3 gap-2">
          <StatPill tint="linear-gradient(135deg,#fef3c7,#fbbf24)" label="Target" value={`${plan.targetWeight} kg`} onClick={() => setEditField("target")} />
          <StatPill tint="linear-gradient(135deg,#ddd6fe,#a78bfa)" label="Date" value={formatShort(plan.targetDate)} onClick={() => setEditField("date")} />
          <StatPill tint="linear-gradient(135deg,#fecaca,#fb923c)" label="Pace" value={`${plan.paceKgWeek} kg/wk`} onClick={() => setEditField("pace")} />
        </div>

        <p className="mt-3 text-[10.5px] opacity-80">
          Tap any pill to edit. Change two and the third re-calculates automatically.
        </p>
      </div>

      {editField && (
        <EditFieldSheet
          plan={plan}
          field={editField}
          onClose={() => setEditField(null)}
          onSaved={(next, changedPace) => {
            savePlan(next);
            reload();
            setEditField(null);
            if (changedPace) setBotDialog({ newPace: next.paceKgWeek });
          }}
        />
      )}
      {botDialog && <BotAdjustDialog newPace={botDialog.newPace} onClose={() => setBotDialog(null)} />}
    </div>
  );
}

function StatPill({ tint, label, value, onClick }: { tint: string; label: string; value: string; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className="group flex items-center gap-2 overflow-hidden rounded-2xl bg-white/95 p-2.5 text-left text-foreground shadow-[var(--shadow-soft)] transition active:scale-[0.98]"
    >
      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl" style={{ background: tint }}>
        <Pencil size={12} className="text-foreground/70" />
      </div>
      <div className="min-w-0 flex-1">
        <p className="text-[9px] font-semibold uppercase tracking-wider text-muted-foreground">{label}</p>
        <p className="truncate font-display text-[13px] font-semibold">{value}</p>
      </div>
    </button>
  );
}

function MiniSparkline({ start, target, punches }: { start: number; target: number; punches: PunchEntry[] }) {
  const w = 320, h = 60, padX = 6, padY = 8;
  const yMin = Math.min(start, target, ...punches.map((p) => p.weight)) - 0.5;
  const yMax = Math.max(start, target, ...punches.map((p) => p.weight)) + 0.5;
  const range = Math.max(0.5, yMax - yMin);
  const n = punches.length;
  const sx = (i: number) => padX + (n <= 1 ? (w - padX * 2) : (i / (n - 1)) * (w - padX * 2));
  const sy = (v: number) => padY + ((yMax - v) / range) * (h - padY * 2);
  const pts = punches.map((p, i) => `${sx(i)},${sy(p.weight)}`).join(" ");
  const targetY = sy(target);
  return (
    <svg viewBox={`0 0 ${w} ${h}`} className="w-full">
      <line x1={padX} x2={w - padX} y1={targetY} y2={targetY} stroke="white" strokeOpacity="0.6" strokeDasharray="3 4" strokeWidth="1.5" />
      {n >= 2 && <polyline points={pts} fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />}
      {punches.map((p, i) => <circle key={p.date + i} cx={sx(i)} cy={sy(p.weight)} r="3" fill="white" />)}
    </svg>
  );
}

function formatShort(iso: string): string {
  try {
    const d = new Date(iso);
    return d.toLocaleDateString(undefined, { month: "short", day: "numeric" });
  } catch { return iso; }
}

/* ---------------- Edit sheet ---------------- */
function EditFieldSheet({ plan, field, onClose, onSaved }: {
  plan: WLPlan;
  field: "target" | "date" | "pace";
  onClose: () => void;
  onSaved: (next: WLPlan, changedPace: boolean) => void;
}) {
  const [target, setTarget] = useState<number>(plan.targetWeight);
  const [date, setDate] = useState<string>(plan.targetDate);
  const [pace, setPace] = useState<number>(plan.paceKgWeek);

  // Which two are locked (the other two — the one being edited + the previously-unchanged one that we'll keep).
  // Rule from user: user edits ONE field at a time on this sheet; keep TARGET locked when editing date/pace unless target itself is being edited. If editing target, keep DATE locked and recompute pace.
  const preview = useMemo(() => {
    if (field === "target") {
      return deriveThird({ currentKg: plan.currentWeight, targetKg: target, targetDate: date, goal: plan.goal });
    }
    if (field === "date") {
      return deriveThird({ currentKg: plan.currentWeight, targetKg: target, targetDate: date, goal: plan.goal });
    }
    // pace
    return deriveThird({ currentKg: plan.currentWeight, targetKg: target, paceKgWeek: pace, goal: plan.goal });
  }, [field, target, date, pace, plan.currentWeight, plan.goal]);

  const save = () => {
    const next: WLPlan = {
      ...plan,
      targetWeight: +preview.targetKg,
      targetDate: preview.targetDate,
      paceKgWeek: +preview.paceKgWeek,
    };
    const changedPace = Math.abs(next.paceKgWeek - plan.paceKgWeek) > 0.02;
    onSaved(next, changedPace);
  };

  const title = field === "target" ? "Edit target weight" : field === "date" ? "Edit target date" : "Edit pace";

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/50 backdrop-blur-sm sm:items-center" onClick={onClose}>
      <div className="w-full max-w-md rounded-t-[28px] bg-card p-5 text-foreground shadow-2xl sm:rounded-[28px]" onClick={(e) => e.stopPropagation()}>
        <div className="mb-3 flex items-center justify-between">
          <h3 className="font-display text-lg font-semibold">{title}</h3>
          <button onClick={onClose} className="flex h-8 w-8 items-center justify-center rounded-full bg-secondary"><X size={14} /></button>
        </div>

        {field === "target" && (
          <>
            <label className="block text-xs font-semibold uppercase tracking-wider text-muted-foreground">Target weight (kg)</label>
            <input
              type="number" step="0.1" value={target}
              onChange={(e) => setTarget(parseFloat(e.target.value) || 0)}
              className="mt-1.5 w-full rounded-xl border border-border/60 bg-card px-3 py-2.5 text-base font-semibold"
            />
            <label className="mt-4 block text-xs font-semibold uppercase tracking-wider text-muted-foreground">Keep target date at</label>
            <input
              type="date" value={date}
              onChange={(e) => setDate(e.target.value)}
              className="mt-1.5 w-full rounded-xl border border-border/60 bg-card px-3 py-2.5 text-base font-semibold"
            />
          </>
        )}

        {field === "date" && (
          <>
            <label className="block text-xs font-semibold uppercase tracking-wider text-muted-foreground">Target date</label>
            <input
              type="date" value={date}
              onChange={(e) => setDate(e.target.value)}
              className="mt-1.5 w-full rounded-xl border border-border/60 bg-card px-3 py-2.5 text-base font-semibold"
            />
            <p className="mt-2 text-[11px] text-muted-foreground">Target weight stays at <b>{target} kg</b>. Pace will auto-adjust.</p>
          </>
        )}

        {field === "pace" && (
          <>
            <div className="flex items-center justify-between">
              <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Pace</label>
              <span className="font-display text-base font-semibold">{pace.toFixed(1)} kg/week</span>
            </div>
            <input
              type="range" min={0.1} max={1.0} step={0.1} value={pace}
              onChange={(e) => setPace(parseFloat(e.target.value))}
              className="mt-2 w-full accent-primary"
            />
            <p className="mt-2 text-[11px] text-muted-foreground">Target weight stays at <b>{target} kg</b>. Target date will auto-adjust.</p>
          </>
        )}

        <div className="mt-5 rounded-2xl bg-secondary/40 p-3 text-[12px]">
          <div className="flex justify-between"><span className="text-muted-foreground">Target</span><span className="font-semibold">{preview.targetKg} kg</span></div>
          <div className="flex justify-between"><span className="text-muted-foreground">Target date</span><span className="font-semibold">{preview.targetDate}</span></div>
          <div className="flex justify-between"><span className="text-muted-foreground">Pace</span><span className="font-semibold">{preview.paceKgWeek} kg/week</span></div>
        </div>

        <button
          onClick={save}
          className="mt-4 flex w-full items-center justify-center gap-2 rounded-2xl bg-primary px-5 py-3 text-sm font-semibold text-primary-foreground shadow-[var(--shadow-glow)]"
        >
          Save changes
        </button>
      </div>
    </div>
  );
}

/* ---------------- Bot adjust dialog after pace change ---------------- */
function BotAdjustDialog({ newPace, onClose }: { newPace: number; onClose: () => void }) {
  const links: { label: string; to: string; icon: any }[] = [
    { label: "Adjust Diet",     to: "/section/diet",     icon: Apple },
    { label: "Adjust Yoga",     to: "/section/yoga",     icon: Flower2 },
    { label: "Adjust Exercise", to: "/section/exercise", icon: Dumbbell },
  ];
  return (
    <div className="fixed inset-0 z-[60] flex items-end justify-center bg-black/50 backdrop-blur-sm sm:items-center" onClick={onClose}>
      <div className="w-full max-w-md rounded-t-[28px] bg-card p-5 shadow-2xl sm:rounded-[28px]" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-2xl" style={{ background: "var(--gradient-violet)" }}>
            <Bot size={20} className="text-primary-foreground" />
          </div>
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-primary">AI Coach</p>
            <h3 className="font-display text-lg font-semibold">Your new pace is {newPace} kg/week</h3>
          </div>
        </div>
        <p className="mt-3 text-[13px] text-foreground/80">
          Want me to re-tune your diet, yoga or exercise plan to match? Or keep them as they are.
        </p>
        <div className="mt-4 grid grid-cols-1 gap-2">
          {links.map((l) => {
            const Icon = l.icon;
            return (
              <Link key={l.to} to={l.to as any} onClick={onClose} className="flex items-center gap-3 rounded-2xl bg-secondary/50 p-3 text-sm font-semibold ring-1 ring-border/60">
                <Icon size={16} className="text-primary" /> {l.label}
                <ChevronRight size={14} className="ml-auto text-muted-foreground" />
              </Link>
            );
          })}
          <button onClick={onClose} className="mt-1 rounded-2xl bg-primary px-5 py-3 text-sm font-semibold text-primary-foreground">
            Keep plans as they are
          </button>
        </div>
      </div>
    </div>
  );
}

function ConfirmDeleteDialog({ onCancel, onConfirm }: { onCancel: () => void; onConfirm: () => void }) {
  return (
    <div className="fixed inset-0 z-[60] flex items-end justify-center bg-black/50 backdrop-blur-sm sm:items-center" onClick={onCancel}>
      <div className="w-full max-w-sm rounded-t-[28px] bg-card p-5 shadow-2xl sm:rounded-[28px]" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-rose-100">
            <Trash2 size={18} className="text-rose-600" />
          </div>
          <div>
            <h3 className="font-display text-lg font-semibold">Delete your plan?</h3>
            <p className="text-[12px] text-muted-foreground">Your weight punches will stay saved.</p>
          </div>
        </div>
        <div className="mt-4 flex gap-2">
          <button onClick={onCancel} className="flex-1 rounded-2xl bg-secondary px-4 py-2.5 text-sm font-semibold">Cancel</button>
          <button onClick={onConfirm} className="flex-1 rounded-2xl bg-rose-600 px-4 py-2.5 text-sm font-semibold text-white">Delete</button>
        </div>
      </div>
    </div>
  );
}

/* ---------------- Saved modules row ---------------- */
type ModuleDef = { id: string; label: string; icon: any; to: string; tint: string };

function computeModuleProgress(id: string, plan: WLPlan): { pct: number; label: string } {
  const daysSince = Math.max(1, Math.floor((Date.now() - plan.createdAt) / 86400000));
  const totalDays = Math.max(1, Math.round((new Date(plan.targetDate).getTime() - plan.createdAt) / 86400000));
  const pct = Math.max(2, Math.min(100, Math.round((daysSince / totalDays) * 100)));

  // Try to count completions from today's mission (shared across tasks)
  let doneToday = false;
  try {
    const raw = JSON.parse(localStorage.getItem(`ayuraise.wl.mission.${new Date().toISOString().slice(0,10)}`) || "{}");
    doneToday = !!raw[id];
  } catch {}

  const label = doneToday ? `Day ${daysSince} · done today` : `Day ${daysSince} of ${totalDays}`;
  return { pct, label };
}

function SavedModulesRow({ plan }: { plan: WLPlan }) {
  const dietSaved = typeof window !== "undefined" && !!localStorage.getItem("ayuraise.dietPlan");
  const yogaSaved = plan.includeYoga;
  const exSaved   = plan.includeExercise;
  const fastSaved = plan.includeFasting;

  const active: ModuleDef[] = [];
  const missing: ModuleDef[] = [];
  const push = (arr: ModuleDef[], m: ModuleDef) => arr.push(m);

  (dietSaved ? push.bind(null, active) : push.bind(null, missing))({
    id: "diet", label: "Diet",     icon: Apple,      to: "/section/diet",
    tint: "linear-gradient(135deg,#bbf7d0,#4ade80)"
  });
  (yogaSaved ? push.bind(null, active) : push.bind(null, missing))({
    id: "yoga", label: "Yoga",     icon: Flower2,    to: "/section/yoga",
    tint: "linear-gradient(135deg,#ddd6fe,#a78bfa)"
  });
  (exSaved ? push.bind(null, active) : push.bind(null, missing))({
    id: "exercise", label: "Exercise", icon: Dumbbell, to: "/section/exercise",
    tint: "linear-gradient(135deg,#fecaca,#fb923c)"
  });
  (fastSaved ? push.bind(null, active) : push.bind(null, missing))({
    id: "fasting", label: "Fasting", icon: Hourglass, to: "/section/fasting",
    tint: "linear-gradient(135deg,#fef3c7,#fbbf24)"
  });
  push(missing, {
    id: "meditation", label: "Meditation", icon: Brain, to: "/coach",
    tint: "linear-gradient(135deg,#fbcfe8,#f472b6)"
  });

  return (
    <div className="space-y-3">
      {active.length > 0 && (
        <div className="-mx-5 overflow-x-auto px-5 pb-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          <div className="flex gap-3">
            {active.map((m) => {
              const Icon = m.icon;
              const { pct, label } = computeModuleProgress(m.id, plan);
              return (
                <Link
                  key={m.id} to={m.to as any}
                  className="w-[160px] shrink-0 overflow-hidden rounded-3xl bg-card shadow-[var(--shadow-soft)] ring-1 ring-border/60 transition-transform active:scale-[0.98]"
                >
                  <div className="flex h-16 items-center justify-center" style={{ background: m.tint }}>
                    <Icon size={22} className="text-foreground" />
                  </div>
                  <div className="p-3">
                    <div className="flex items-center justify-between">
                      <p className="font-display text-[13px] font-semibold">{m.label}</p>
                      <p className="text-[10px] font-semibold text-primary">{pct}%</p>
                    </div>
                    <div className="mt-1.5 h-1 w-full overflow-hidden rounded-full bg-secondary">
                      <div className="h-full rounded-full bg-primary transition-all" style={{ width: `${pct}%` }} />
                    </div>
                    <p className="mt-1.5 truncate text-[10px] text-muted-foreground">{label}</p>
                  </div>
                </Link>
              );
            })}
          </div>
        </div>
      )}
      {missing.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {missing.map((m) => {
            const Icon = m.icon;
            return (
              <Link
                key={m.id} to={m.to as any}
                className="flex items-center gap-1.5 rounded-full bg-card px-3 py-1.5 text-[11px] font-semibold text-foreground shadow-[var(--shadow-soft)] ring-1 ring-border/60"
              >
                <Icon size={12} className="text-primary" /> <Plus size={10} /> {m.label}
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}

/* ---------------- Today's tasks (kept, tightened) ---------------- */
type MissionTask = { id: string; label: string; icon: any };
const DEFAULT_MISSIONS: MissionTask[] = [
  { id: "breakfast",  label: "Protein breakfast", icon: Sun },
  { id: "walk",       label: "Walk 30 min",       icon: Footprints },
  { id: "yoga",       label: "Yoga",              icon: Flower2 },
  { id: "meditation", label: "Meditation 5 min",  icon: Brain },
  { id: "hydration",  label: "2L water",          icon: GlassWater },
  { id: "dinner",     label: "Light dinner",      icon: Utensils },
  { id: "sleep",      label: "7h sleep",          icon: Moon },
];
function todayKey() { return `ayuraise.wl.mission.${new Date().toISOString().slice(0,10)}`; }

function TodaysTasks({ plan }: { plan: WLPlan }) {
  const [done, setDone] = useState<Record<string, boolean>>({});
  useEffect(() => {
    try { const r = localStorage.getItem(todayKey()); setDone(r ? JSON.parse(r) : {}); } catch {}
  }, []);
  const toggle = (id: string) => {
    setDone((prev) => {
      const next = { ...prev, [id]: !prev[id] };
      try { localStorage.setItem(todayKey(), JSON.stringify(next)); } catch {}
      return next;
    });
  };
  const tasks = useMemo(() => DEFAULT_MISSIONS.filter((t) => {
    if (t.id === "yoga" && !plan.includeYoga) return false;
    return true;
  }), [plan]);
  const completed = tasks.filter((t) => done[t.id]).length;

  return (
    <div className="overflow-hidden rounded-[28px] bg-card p-5 shadow-[var(--shadow-soft)] ring-1 ring-border/60">
      <div className="flex items-center justify-between">
        <p className="font-display text-[15px] font-semibold">Tap to complete</p>
        <div className="rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold text-primary">{completed}/{tasks.length}</div>
      </div>
      <div className="mt-3 h-1.5 w-full overflow-hidden rounded-full bg-secondary">
        <div className="h-full rounded-full bg-primary transition-all duration-500" style={{ width: `${(completed / tasks.length) * 100}%` }} />
      </div>
      <ul className="mt-4 space-y-1.5">
        {tasks.map((t) => {
          const Icon = t.icon; const on = !!done[t.id];
          return (
            <li key={t.id}>
              <button
                onClick={() => toggle(t.id)}
                className={`flex w-full items-center gap-3 rounded-2xl px-3 py-2.5 text-left text-sm font-medium transition ${
                  on ? "bg-primary/10 text-foreground" : "bg-secondary/40 text-foreground"
                }`}
              >
                <Icon size={16} className={on ? "text-primary" : "text-muted-foreground"} />
                <span className={`flex-1 ${on ? "line-through opacity-60" : ""}`}>{t.label}</span>
                {on ? <CheckCircle2 size={18} className="text-primary" /> : <Circle size={18} className="text-muted-foreground" />}
              </button>
            </li>
          );
        })}
      </ul>
    </div>
  );
}

/* ---------------- Simplified check-in ---------------- */
const REMIND_KEY = "ayuraise.wl.remind.v2";
type RemindChannel = "off" | "app" | "wa";
type RemindFrequency = "daily" | "weekly" | "custom";
type RemindSettings = {
  channel: RemindChannel;
  frequency: RemindFrequency;
  days: number[]; // 0=Sun..6=Sat
};
const DEFAULT_REMIND: RemindSettings = { channel: "off", frequency: "weekly", days: [1] };
const DAY_LABELS = ["S", "M", "T", "W", "T", "F", "S"];
const DAY_FULL = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

function SimpleCheckIn({ plan, onLogged }: { plan: WLPlan; onLogged: () => void }) {
  const today = new Date().toISOString().slice(0, 10);
  const [weight, setWeight] = useState<string>(String(plan.currentWeight));
  const [remind, setRemind] = useState<RemindSettings>(DEFAULT_REMIND);
  useEffect(() => {
    try {
      const raw = localStorage.getItem(REMIND_KEY);
      if (raw) setRemind({ ...DEFAULT_REMIND, ...JSON.parse(raw) });
    } catch {}
  }, []);
  const save = (next: RemindSettings) => {
    setRemind(next);
    try { localStorage.setItem(REMIND_KEY, JSON.stringify(next)); } catch {}
  };
  const setChannel = (channel: RemindChannel) => {
    save({ ...remind, channel });
    if (channel === "app" && typeof window !== "undefined" && "Notification" in window && Notification.permission === "default") {
      Notification.requestPermission().catch(() => {});
    }
  };
  const setFrequency = (frequency: RemindFrequency) => {
    let days = remind.days;
    if (frequency === "daily") days = [0, 1, 2, 3, 4, 5, 6];
    else if (frequency === "weekly") days = remind.days.length ? [remind.days[0]] : [1];
    save({ ...remind, frequency, days });
  };
  const toggleDay = (d: number) => {
    const has = remind.days.includes(d);
    const days = has ? remind.days.filter((x) => x !== d) : [...remind.days, d].sort();
    save({ ...remind, days });
  };
  const punch = () => {
    const w = parseFloat(weight); if (!w || isNaN(w)) return;
    addPunch({ date: today, weight: w });
    savePlan({ ...plan, currentWeight: w });
    onLogged();
  };

  const summary =
    remind.channel === "off"
      ? "No reminders"
      : `${remind.channel === "app" ? "In-app" : "WhatsApp"} · ${
          remind.frequency === "daily"
            ? "every day"
            : remind.frequency === "weekly"
            ? `weekly (${DAY_FULL[remind.days[0] ?? 1]})`
            : `${remind.days.length || 0} days/wk`
        }`;

  return (
    <div className="rounded-[28px] bg-card p-5 shadow-[var(--shadow-soft)] ring-1 ring-border/60">
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-2xl" style={{ background: "var(--gradient-gold)" }}>
          <Scale size={18} className="text-foreground" />
        </div>
        <div>
          <p className="font-display text-[15px] font-semibold">Punch your weight</p>
          <p className="text-[11px] text-muted-foreground">Whenever you like. No pressure.</p>
        </div>
      </div>
      <div className="mt-4 flex items-end gap-2">
        <label className="flex-1 text-[11px] text-muted-foreground">
          Weight (kg)
          <input
            type="number" step="0.1" value={weight}
            onChange={(e) => setWeight(e.target.value)}
            className="mt-1 w-full rounded-xl border border-border/60 bg-card px-3 py-2.5 text-base font-semibold"
          />
        </label>
        <button onClick={punch} className="rounded-xl bg-primary px-5 py-3 text-sm font-semibold text-primary-foreground shadow-[var(--shadow-glow)]">
          Save
        </button>
      </div>

      {/* Reminder panel */}
      <div className="mt-4 rounded-2xl bg-secondary/40 p-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
            <Bell size={12} className="text-primary" /> Remind me to punch
          </div>
          <span className="text-[10.5px] font-semibold text-primary">{summary}</span>
        </div>

        {/* Channel */}
        <div className="mt-2 flex gap-2">
          {([
            { id: "off", label: "Off" },
            { id: "app", label: "In-app" },
            { id: "wa",  label: "WhatsApp" },
          ] as const).map((o) => (
            <button
              key={o.id} onClick={() => setChannel(o.id)}
              className={`flex-1 rounded-full px-3 py-1.5 text-[11px] font-semibold transition ${
                remind.channel === o.id ? "bg-primary text-primary-foreground" : "bg-card text-foreground ring-1 ring-border/60"
              }`}
            >{o.label}</button>
          ))}
        </div>

        {remind.channel !== "off" && (
          <>
            {/* Frequency */}
            <p className="mt-3 text-[10.5px] font-semibold uppercase tracking-wider text-muted-foreground">Frequency</p>
            <div className="mt-1.5 flex gap-2">
              {([
                { id: "daily",  label: "Daily" },
                { id: "weekly", label: "Weekly" },
                { id: "custom", label: "Custom" },
              ] as const).map((o) => (
                <button
                  key={o.id} onClick={() => setFrequency(o.id)}
                  className={`flex-1 rounded-full px-3 py-1.5 text-[11px] font-semibold transition ${
                    remind.frequency === o.id ? "bg-foreground text-background" : "bg-card text-foreground ring-1 ring-border/60"
                  }`}
                >{o.label}</button>
              ))}
            </div>

            {/* Weekly picker: single day */}
            {remind.frequency === "weekly" && (
              <div className="mt-2 flex gap-1.5">
                {DAY_LABELS.map((l, i) => {
                  const on = remind.days[0] === i;
                  return (
                    <button
                      key={i}
                      onClick={() => save({ ...remind, days: [i] })}
                      className={`h-8 flex-1 rounded-full text-[11px] font-semibold transition ${
                        on ? "bg-primary text-primary-foreground shadow-[var(--shadow-glow)]" : "bg-card ring-1 ring-border/60 text-foreground"
                      }`}
                    >{l}</button>
                  );
                })}
              </div>
            )}

            {/* Custom picker: multi day */}
            {remind.frequency === "custom" && (
              <div className="mt-2 flex gap-1.5">
                {DAY_LABELS.map((l, i) => {
                  const on = remind.days.includes(i);
                  return (
                    <button
                      key={i}
                      onClick={() => toggleDay(i)}
                      className={`h-8 flex-1 rounded-full text-[11px] font-semibold transition ${
                        on ? "bg-primary text-primary-foreground shadow-[var(--shadow-glow)]" : "bg-card ring-1 ring-border/60 text-foreground"
                      }`}
                    >{l}</button>
                  );
                })}
              </div>
            )}

            {remind.channel === "wa" && (
              <p className="mt-2 text-[10.5px] text-muted-foreground">WhatsApp reminders coming soon.</p>
            )}
          </>
        )}
      </div>
    </div>
  );
}

/* ---------------- Progress + milestones (kept) ---------------- */
function ProgressBlock({ plan, punches }: { plan: WLPlan; punches: PunchEntry[] }) {
  const status = weeklyStatus(plan, punches);
  const enoughForStatus = punches.length >= 3;

  return (
    <>
      <div className="mt-4 overflow-hidden rounded-[28px] bg-card p-5 shadow-[var(--shadow-soft)] ring-1 ring-border/60">
        <div className="flex items-center justify-between">
          <p className="font-display text-[15px] font-semibold">Weight over time</p>
          <div className="text-right text-[10px]">
            <p><span className="inline-block h-1.5 w-3 rounded-full bg-muted-foreground/40" /> Expected</p>
            <p><span className="inline-block h-1.5 w-3 rounded-full bg-primary" /> Actual</p>
          </div>
        </div>
        <WeightChart plan={plan} punches={punches} />
        <div className="mt-1 flex items-center justify-between text-[11px]">
          <span className="text-muted-foreground">Start · {plan.startWeight} kg</span>
          <span className="text-muted-foreground">Target · {plan.targetWeight} kg</span>
        </div>
      </div>

      {enoughForStatus && (
        <>
          <div className="mt-4 overflow-hidden rounded-[28px] p-5 text-primary-foreground shadow-[var(--shadow-soft)]" style={{ background: status.gradient }}>
            <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-primary-foreground/85">This week</p>
            <div className="mt-1 flex items-center gap-3">
              <status.icon size={26} />
              <h3 className="font-display text-2xl font-semibold">{status.label}</h3>
            </div>
            <p className="mt-2 text-sm text-primary-foreground/90">{status.message}</p>
          </div>
          {status.needsCoaching && <CourseCorrection />}
        </>
      )}
      <Milestones plan={plan} punches={punches} />
    </>
  );
}

function WeightChart({ plan, punches }: { plan: WLPlan; punches: PunchEntry[] }) {
  const start = plan.startWeight, target = plan.targetWeight;
  const days = 60;
  const w = 320, h = 140, padX = 8, padY = 12;
  const yRange = Math.max(1, Math.abs(start - target) + 2);
  const yTop = Math.max(start, target) + 1;
  const scaleX = (i: number) => padX + (i / days) * (w - padX * 2);
  const scaleY = (v: number) => padY + ((yTop - v) / yRange) * (h - padY * 2);
  const expectedPts = Array.from({ length: days + 1 }, (_, i) => {
    const t = i / days; const v = start + (target - start) * t;
    return `${scaleX(i)},${scaleY(v)}`;
  }).join(" ");
  const actualPts = punches
    .map((p, i) => `${scaleX(i * Math.max(1, Math.floor(days / Math.max(1, punches.length))))},${scaleY(p.weight)}`)
    .join(" ");
  return (
    <svg viewBox={`0 0 ${w} ${h}`} className="mt-3 w-full">
      <polyline points={expectedPts} fill="none" stroke="currentColor" strokeOpacity="0.35" strokeWidth="2" strokeDasharray="4 5" />
      {punches.length > 0 && <polyline points={actualPts} fill="none" stroke="hsl(var(--primary))" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />}
      {punches.map((p, i) => (
        <circle key={p.date} cx={scaleX(i * Math.max(1, Math.floor(days / Math.max(1, punches.length))))} cy={scaleY(p.weight)} r="3.5" fill="hsl(var(--primary))" />
      ))}
    </svg>
  );
}

function weeklyStatus(plan: WLPlan, punches: PunchEntry[]) {
  const latest = punches.at(-1)?.weight ?? plan.currentWeight;
  const daysIn = Math.max(1, Math.round((Date.now() - plan.createdAt) / 86400000));
  const expectedLoss = (plan.paceKgWeek / 7) * daysIn;
  const actualLoss = plan.startWeight - latest;
  const ratio = expectedLoss > 0 ? actualLoss / expectedLoss : 1;
  if (ratio >= 1.05) return { label: "Ahead of Plan", icon: Trophy, gradient: "linear-gradient(135deg,#10b981,#059669)", message: "You're crushing it. Stay consistent — sustainable pace wins.", needsCoaching: false };
  if (ratio >= 0.85) return { label: "On Track",      icon: CheckCircle2, gradient: "var(--gradient-sage)", message: "Right on target. Keep your daily habits rolling.", needsCoaching: false };
  if (ratio >= 0.5)  return { label: "Slightly Behind", icon: Activity, gradient: "linear-gradient(135deg,#f59e0b,#f97316)", message: "A small dip — normal. Let's tune your plan gently.", needsCoaching: true };
  return { label: "Needs Attention", icon: AlertCircle, gradient: "linear-gradient(135deg,#f43f5e,#e11d48)", message: "Let's review your journey with your AI coach.", needsCoaching: true };
}

function CourseCorrection() {
  return (
    <div className="mt-4 overflow-hidden rounded-[28px] p-5 shadow-[var(--shadow-soft)]" style={{ background: "var(--gradient-gold)" }}>
      <div className="flex items-center gap-2">
        <div className="flex h-9 w-9 items-center justify-center rounded-2xl bg-white/30 backdrop-blur">
          <Wand2 size={16} className="text-foreground" />
        </div>
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-foreground/80">Course correction</p>
          <h3 className="font-display text-lg font-semibold text-foreground">Let's review together</h3>
        </div>
      </div>
      <p className="mt-2 text-sm leading-relaxed text-foreground/85">
        Progress has slowed — that's normal. Let's fine-tune sleep, stress, protein or steps before changing calories.
      </p>
      <Link to="/coach" className="mt-3 inline-flex items-center gap-2 rounded-2xl bg-foreground px-4 py-2.5 text-sm font-semibold text-background">
        <Bot size={15} /> Review with AI Coach
      </Link>
    </div>
  );
}

function Milestones({ plan, punches }: { plan: WLPlan; punches: PunchEntry[] }) {
  const done = +(plan.startWeight - (punches.at(-1)?.weight ?? plan.currentWeight)).toFixed(1);
  const halfTotal = (plan.startWeight - plan.targetWeight) / 2;
  const items = [
    { id: "first-kg", label: "First Kg",   icon: Flame,  unlocked: done >= 1 },
    { id: "7day",     label: "7-Day",      icon: Zap,    unlocked: punches.length >= 7 },
    { id: "30day",    label: "Consistent", icon: Award,  unlocked: punches.length >= 15 },
    { id: "halfway",  label: "Halfway",    icon: Target, unlocked: done >= halfTotal },
    { id: "target",   label: "Target",     icon: Trophy, unlocked: done >= (plan.startWeight - plan.targetWeight) },
  ];
  return (
    <div className="mt-4 rounded-[28px] bg-card p-5 shadow-[var(--shadow-soft)] ring-1 ring-border/60">
      <p className="font-display text-[15px] font-semibold">Milestones</p>
      <div className="mt-3 grid grid-cols-5 gap-2">
        {items.map((m) => {
          const Icon = m.icon;
          return (
            <div key={m.id} className="flex flex-col items-center text-center">
              <div
                className={`flex h-12 w-12 items-center justify-center rounded-2xl transition ${m.unlocked ? "shadow-[var(--shadow-glow)]" : "bg-secondary opacity-50"}`}
                style={m.unlocked ? { background: "var(--gradient-gold)" } : undefined}
              >
                <Icon size={18} className={m.unlocked ? "text-foreground" : "text-muted-foreground"} />
              </div>
              <p className={`mt-1.5 text-[9px] font-semibold leading-tight ${m.unlocked ? "text-foreground" : "text-muted-foreground"}`}>{m.label}</p>
            </div>
          );
        })}
      </div>
    </div>
  );
}


/* ============================================================
   Floating Bot FAB
============================================================ */
function BotFab() {
  return (
    <Link
      to="/coach"
      aria-label="Talk to your AI coach"
      className="fixed bottom-24 right-4 z-40 flex h-14 w-14 items-center justify-center rounded-full shadow-[var(--shadow-glow)] ring-2 ring-white/40 transition-transform active:scale-95"
      style={{ background: "var(--gradient-violet)" }}
    >
      <MessageCircle size={22} className="text-primary-foreground" />
    </Link>
  );
}

/* ============================================================
   Plan flow (unchanged)
============================================================ */
type Step = "profile-check" | "goal" | "current" | "conditions" | "target" | "addons" | "summary";
const COMMON_CONDITIONS = ["Diabetes", "Hypertension", "PCOS", "Thyroid", "Heart disease", "Pregnancy"];

function PlanFlow({ onClose, existing }: { onClose: () => void; existing: WLPlan | null }) {
  const navigate = useNavigate();
  const profile = useMemo(() => loadProfile(), []);
  const needProfile = !profile || !profile.age || !profile.heightCm || !profile.weightKg || !profile.gender || !profile.activity;

  const [step, setStep] = useState<Step>(needProfile ? "profile-check" : "goal");
  const [goal, setGoal] = useState<WLGoal>(existing?.goal ?? "lose");
  const [currentWeight, setCurrentWeight] = useState<number>(existing?.currentWeight ?? profile?.weightKg ?? 70);
  const [conditions, setConditions] = useState<string[]>(existing?.conditions ?? []);
  const [otherCondition, setOtherCondition] = useState<string>("");
  const [targetWeight, setTargetWeight] = useState<number>(existing?.targetWeight ?? 62);
  const [paceKgWeek, setPaceKgWeek] = useState<number>(existing?.paceKgWeek ?? 0.5);
  const [includeYoga, setIncludeYoga] = useState<boolean>(existing?.includeYoga ?? true);
  const [includeExercise, setIncludeExercise] = useState<boolean>(existing?.includeExercise ?? false);
  const [includeFasting, setIncludeFasting] = useState<boolean>(existing?.includeFasting ?? false);
  const [fastingWindow, setFastingWindow] = useState<"12:12" | "14:10" | "16:8">(existing?.fastingWindow ?? "14:10");
  const [includeDetox, setIncludeDetox] = useState<boolean>(existing?.includeDetox ?? false);

  const tdee = useMemo(() => {
    if (!profile?.gender || !profile.age || !profile.heightCm || !profile.activity) return 2000;
    return calcTDEE(profile.gender, currentWeight, profile.heightCm, profile.age, profile.activity);
  }, [profile, currentWeight]);
  const projDate = useMemo(() => projectedDateFromPace(currentWeight, targetWeight, paceKgWeek), [currentWeight, targetWeight, paceKgWeek]);
  const pLabel = paceLabel(paceKgWeek);
  const dailyKcal = useMemo(() => computeIntake({ tdee, goal, paceKgWeek, sex: profile?.gender ?? "female" }), [tdee, goal, paceKgWeek, profile?.gender]);
  const toggleCondition = (c: string) => setConditions((cs) => cs.includes(c) ? cs.filter((x) => x !== c) : [...cs, c]);

  function save() {
    if (!profile) return;
    const allConditions = [...conditions];
    const other = otherCondition.trim(); if (other) allConditions.push(other);
    const signedRate = goal === "lose" ? -paceKgWeek : goal === "gain" ? paceKgWeek : 0;
    const plan: WLPlan = {
      goal, sex: profile.gender ?? "female", age: profile.age ?? 30, heightCm: profile.heightCm ?? 165,
      startWeight: existing?.startWeight ?? currentWeight, currentWeight, targetWeight, targetDate: projDate,
      activity: profile.activity ?? "light", conditions: allConditions, paceKgWeek,
      includeYoga, includeExercise, includeFasting, includeDetox,
      fastingWindow: includeFasting ? fastingWindow : undefined,
      dailyCalories: dailyKcal, dailyProtein: Math.round(currentWeight * (goal === "gain" ? 1.6 : 1.4)),
      weeklyRateKg: +signedRate.toFixed(2), tdee, createdAt: existing?.createdAt ?? Date.now(),
    };
    savePlan(plan);
    const queue: PipelineStep[] = [];
    if (includeYoga) queue.push("yoga");
    if (includeExercise) queue.push("exercise");
    if (includeFasting) queue.push("fasting");
    if (includeDetox) queue.push("detox");
    queue.push("diet");
    startPipeline(queue);
    onClose();
    const first = queue[0];
    navigate({ to: PIPELINE_ROUTE[first] });
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/40 backdrop-blur-sm sm:items-center">
      <div className="max-h-[92svh] w-full max-w-xl overflow-y-auto rounded-t-3xl bg-card p-5 shadow-2xl sm:rounded-3xl">
        <div className="mb-3 flex items-center justify-between">
          <h2 className="font-display text-xl font-semibold">Build my weight plan</h2>
          <button onClick={onClose} className="text-sm text-muted-foreground">Close</button>
        </div>

        {step === "profile-check" && (
          <StepCard title="Finish your profile first">
            <p className="text-sm text-muted-foreground">
              We need your basics (age, height, weight, gender, activity) to compute your daily calories.
            </p>
            <button
              onClick={() => { onClose(); navigate({ to: "/onboarding" }); }}
              className="mt-5 flex w-full items-center justify-center gap-2 rounded-2xl bg-primary px-5 py-3 text-sm font-semibold text-primary-foreground"
            >
              Go to onboarding <ChevronRight size={16} />
            </button>
          </StepCard>
        )}

        {step === "goal" && (
          <StepCard title="What's your goal?">
            <div className="space-y-2">
              {([
                { id: "lose",     label: "Lose weight",     icon: <TrendingDown size={16} /> },
                { id: "gain",     label: "Gain weight",     icon: <TrendingUp size={16} /> },
                { id: "maintain", label: "Maintain & tone", icon: <Target size={16} /> },
              ] as { id: WLGoal; label: string; icon: React.ReactNode }[]).map((g) => (
                <button
                  key={g.id} onClick={() => setGoal(g.id)}
                  className={`flex w-full items-center gap-3 rounded-2xl border p-3 text-left text-sm font-medium ${
                    goal === g.id ? "border-primary bg-primary/10" : "border-border/60 bg-secondary/30"
                  }`}
                >
                  <span className="text-primary">{g.icon}</span>{g.label}
                </button>
              ))}
            </div>
            <NextBtn onClick={() => setStep("current")} />
          </StepCard>
        )}

        {step === "current" && (
          <StepCard title="Confirm your current weight">
            <Field label="Current weight (kg)"><NumInput value={currentWeight} setValue={setCurrentWeight} step={0.1} /></Field>
            <div className="mt-3 rounded-xl bg-accent/30 p-3 text-xs text-foreground/80">
              At this weight your maintenance is about <b>{tdee} kcal/day</b>.
            </div>
            <NextBtn onClick={() => setStep("conditions")} />
          </StepCard>
        )}

        {step === "conditions" && (
          <StepCard title="Any health conditions?">
            <div className="mt-2 flex flex-wrap gap-2">
              {COMMON_CONDITIONS.map((c) => {
                const on = conditions.includes(c);
                return (
                  <button
                    key={c} onClick={() => toggleCondition(c)}
                    className={`rounded-full px-3 py-1.5 text-xs font-medium ring-1 transition ${
                      on ? "bg-primary text-primary-foreground ring-primary" : "bg-secondary/40 text-foreground ring-border/60"
                    }`}
                  >{c}</button>
                );
              })}
            </div>
            <Field label="Anything else?">
              <input value={otherCondition} onChange={(e) => setOtherCondition(e.target.value)} placeholder="e.g. arthritis" className="w-full rounded-xl border border-border/60 bg-card px-3 py-2 text-sm" />
            </Field>
            <div className="mt-3 flex gap-2">
              <button onClick={() => { setConditions([]); setOtherCondition(""); setStep("target"); }} className="flex-1 rounded-2xl bg-secondary px-4 py-2.5 text-sm font-semibold">None</button>
              <button onClick={() => setStep("target")} className="flex-1 rounded-2xl bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground">Continue</button>
            </div>
          </StepCard>
        )}

        {step === "target" && (
          <StepCard title="Target & pace">
            <Field label="Target weight (kg)"><NumInput value={targetWeight} setValue={setTargetWeight} step={0.1} /></Field>
            <div className="mt-5">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Pace</span>
                <span className="font-display text-base font-semibold">{paceKgWeek.toFixed(1)} kg/week</span>
              </div>
              <input type="range" min={0.1} max={1.0} step={0.1} value={paceKgWeek} onChange={(e) => setPaceKgWeek(parseFloat(e.target.value))} className="mt-2 w-full accent-primary" />
              <div className={`mt-3 rounded-xl p-3 text-xs ${
                pLabel.tone === "good" ? "bg-emerald-50 text-emerald-900" :
                pLabel.tone === "warn" ? "bg-amber-50 text-amber-900" :
                pLabel.tone === "bad"  ? "bg-rose-50 text-rose-900" : "bg-secondary/40"
              }`}><b>{pLabel.label}.</b> Recommended pace is up to 0.5 kg/week.</div>
            </div>
            <div className="mt-4 rounded-2xl bg-secondary/40 p-3 text-xs">
              <div className="flex items-center justify-between"><span className="text-muted-foreground">Projected target date</span><span className="font-semibold">{projDate}</span></div>
              <div className="mt-1 flex items-center justify-between"><span className="text-muted-foreground">Daily intake (preview)</span><span className="font-semibold">{dailyKcal} kcal</span></div>
            </div>
            <NextBtn onClick={() => setStep("addons")} />
          </StepCard>
        )}

        {step === "addons" && (
          <StepCard title="Pair with what helps">
            <div className="mt-2 space-y-2">
              <ToggleRow icon={HeartPulse} label="Yoga & Pranayam"      checked={includeYoga}     onChange={setIncludeYoga} />
              <ToggleRow icon={Activity}   label="Exercise & Vyayam"    checked={includeExercise} onChange={setIncludeExercise} />
              <ToggleRow icon={Hourglass}  label="Intermittent fasting" checked={includeFasting}  onChange={setIncludeFasting} />
              {includeFasting && (
                <div className="ml-2 mt-1 flex gap-2">
                  {(["12:12", "14:10", "16:8"] as const).map((w) => (
                    <button key={w} onClick={() => setFastingWindow(w)}
                      className={`rounded-full px-3 py-1 text-xs font-semibold ${
                        fastingWindow === w ? "bg-primary text-primary-foreground" : "bg-secondary text-foreground"
                      }`}>{w}</button>
                  ))}
                </div>
              )}
              <ToggleRow icon={Droplets} label="Detox kickstart" checked={includeDetox} onChange={setIncludeDetox} />
            </div>
            <NextBtn onClick={() => setStep("summary")} label="Review" />
          </StepCard>
        )}

        {step === "summary" && (
          <StepCard title="Your plan">
            <div className="space-y-2 rounded-2xl bg-secondary/30 p-4 text-sm">
              <Row label="Goal" value={goal === "lose" ? "Lose weight" : goal === "gain" ? "Gain weight" : "Maintain"} />
              <Row label="Current → Target" value={`${currentWeight} → ${targetWeight} kg`} />
              <Row label="Pace" value={`${paceKgWeek.toFixed(1)} kg/week`} />
              <Row label="Projected date" value={projDate} />
              <Row label="Daily intake" value={`${dailyKcal} kcal`} />
              {conditions.length > 0 && <Row label="Conditions" value={conditions.join(", ")} />}
            </div>
            <button onClick={save} className="mt-5 flex w-full items-center justify-center gap-2 rounded-2xl bg-primary px-5 py-3 text-sm font-semibold text-primary-foreground shadow-[var(--shadow-glow)]">
              <Sparkles size={16} /> Save & start journey
            </button>
          </StepCard>
        )}
      </div>
    </div>
  );
}

/* ---------------- tiny UI helpers ---------------- */
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
    <button onClick={onClick} className="mt-5 flex w-full items-center justify-center gap-2 rounded-2xl bg-primary px-5 py-3 text-sm font-semibold text-primary-foreground shadow-[var(--shadow-glow)]">
      {label} <ChevronRight size={16} />
    </button>
  );
}
function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="mt-3 block text-xs text-muted-foreground">
      {label}<div className="mt-1">{children}</div>
    </label>
  );
}
function NumInput({ value, setValue, step = 1 }: { value: number; setValue: (n: number) => void; step?: number }) {
  return (
    <input type="number" step={step} value={value} onChange={(e) => setValue(parseFloat(e.target.value) || 0)}
      className="w-full rounded-xl border border-border/60 bg-card px-3 py-2 text-sm" />
  );
}
function ToggleRow({ icon: Icon, label, checked, onChange }: { icon: any; label: string; checked: boolean; onChange: (b: boolean) => void }) {
  return (
    <button onClick={() => onChange(!checked)}
      className={`flex w-full items-center justify-between rounded-2xl border p-3 text-left text-sm font-medium ${
        checked ? "border-primary bg-primary/10" : "border-border/60 bg-secondary/30"
      }`}>
      <span className="flex items-center gap-2"><Icon size={16} className="text-primary" />{label}</span>
      <span className={`h-5 w-9 rounded-full p-0.5 transition ${checked ? "bg-primary" : "bg-muted"}`}>
        <span className={`block h-4 w-4 rounded-full bg-white transition ${checked ? "translate-x-4" : ""}`} />
      </span>
    </button>
  );
}
function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-muted-foreground">{label}</span>
      <span className="font-semibold">{value}</span>
    </div>
  );
}
