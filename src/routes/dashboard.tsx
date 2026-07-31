import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { BottomNav } from "@/components/BottomNav";
import {
  Salad, Droplet, Footprints, RefreshCw, Flame, Play, BookOpen,
  TrendingDown, Plus, Minus, Check, ChevronDown, PauseCircle, PlayCircle,
  Stethoscope, ChevronRight, Pencil, Activity, Bot, Bell, X, CalendarDays, History, Trash2,
} from "lucide-react";
import { toast } from "sonner";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Calendar } from "@/components/ui/calendar";
import { loadAllDiseasePlans, diseaseTasks } from "@/lib/disease-plan";
import { getDisease } from "@/lib/diseases";
import {
  loadDay, patchDay, loadTargets, saveTargets, addVitals, latestVital, loadVitals, deleteVital,
  loadReminder, saveReminder, reminderSummary, loadEnabled, saveEnabled, latestSleep,
  loadCustomReminders, saveCustomReminder, deleteCustomReminder,
  loadTasksDone, setTaskDone, loadCustomTasks, addCustomTask, deleteCustomTask,
  loadMealOverrides, setMealOverride, mealSlotKcal, altsForSlot,
  loadAllTasksDone, loadDays,
  loadIFConfig, saveIFConfig, ifStatus, loadIFHistory, addIFSession, markFastEnded, maybeAutoLogFast, fastEndedOn, setFastOverride,
  loadPause, savePause, clearPause, pauseActiveNow,
  loadVacationPlan, saveVacationPlan, defaultVacationItems, type VacationPlan,
  loadHiddenSections, toggleSection,
  loadMedicines, upsertMedicine, deleteMedicine, loadMedTaken, setMedTaken,
  loadCalEntries, addCalEntry, deleteCalEntry, calInTotal, calEntryForSrc,
  MEAL_SLOTS, kcalFor, CHORES, stepsKcal,
  vitalsTodayCount, vitalBand, type RangeBand, type PauseState,
  type TrackerTargets, type VitalsEntry, type ReminderCfg, type EnabledTrackers, type CustomReminder, type CustomTask,
} from "@/lib/trackers";
import {
  loadPlan as loadWLPlan, patchPlan as patchWLPlan, loadPunches, addPunch, removePunch,
  deriveThird, type WLPlan,
} from "@/lib/weight-loss";

export const Route = createFileRoute("/dashboard")({
  head: () => ({
    meta: [
      { title: "Dashboard · AyuRaise" },
      { name: "description", content: "Your daily wellness dashboard." },
    ],
  }),
  component: Dashboard,
});

/** Re-renders on any tracker change (and when the tab regains focus) so cards stay in sync. */
function useAyuTick() {
  const [t, setT] = useState(0);
  useEffect(() => {
    const bump = () => setT((x) => x + 1);
    window.addEventListener("ayu:change", bump);
    window.addEventListener("focus", bump);
    document.addEventListener("visibilitychange", bump);
    return () => {
      window.removeEventListener("ayu:change", bump);
      window.removeEventListener("focus", bump);
      document.removeEventListener("visibilitychange", bump);
    };
  }, []);
  return t;
}

function Dashboard() {
  const [water, setWater] = useState(0);
  const [steps, setSteps] = useState(0);
  const [targets, setTargets] = useState<TrackerTargets>({ waterGlasses: 10, steps: 8000 });
  const [weightKg, setWeightKg] = useState(68);

  useEffect(() => {
    const d = loadDay();
    setWater(d.water ?? 0);
    setSteps(d.steps ?? 0);
    setTargets(loadTargets());
    setWeightKg(loadWLPlan()?.currentWeight ?? 68);
  }, []);

  const punchWater = (delta: number) => {
    setWater((w) => {
      const next = Math.max(0, Math.min(20, w + delta));
      patchDay({ water: next });
      return next;
    });
  };
  const punchSteps = (delta: number) => {
    setSteps((s) => {
      const next = Math.max(0, s + delta);
      patchDay({ steps: next });
      return next;
    });
  };

  const tick = useAyuTick();
  const [customizeOpen, setCustomizeOpen] = useState(false);
  const hidden = useMemo(() => loadHiddenSections(), [tick, customizeOpen]);
  const show = (id: string) => !hidden.includes(id);

  return (
    <div className="min-h-svh pb-28" style={{ background: "var(--gradient-hero)" }}>
      <div className="mx-auto max-w-xl px-5 pt-[max(1.25rem,env(safe-area-inset-top))]">
        <header className="flex items-start justify-between pt-2 animate-shimmer-in">
          <div>
            <p className="text-[13px] font-medium text-muted-foreground">
              {new Date().toLocaleDateString(undefined, { weekday: "long", month: "long", day: "numeric" })}
            </p>
            <h1 className="mt-1 font-display text-[30px] font-extrabold leading-[1.12] tracking-tight text-foreground">
              Make today<br /><span className="gradient-text">count.</span> ✨
            </h1>
          </div>
          <button onClick={() => setCustomizeOpen(true)} className="mt-1 flex items-center gap-1 rounded-full bg-card px-2.5 py-1.5 text-[11px] font-semibold text-foreground/75 ring-1 ring-border/60">
            <Pencil size={11} /> Customise
          </button>
        </header>

        {/* ---- Pause / travel mode ---- */}
        <PauseControl />

        {/* ---- Targets row: water (one-tap) + steps ---- */}
        {show("targets") && (
          <div className="mt-5 grid grid-cols-2 gap-3">
            <WaterCard water={water} onPunch={punchWater} />
            <StepsCard steps={steps} target={targets.steps} weightKg={weightKg} onPunch={punchSteps} onTarget={(t) => setTargets(saveTargets({ steps: t }))} />
          </div>
        )}

        {show("calories") && <CalInOutCard weightKg={weightKg} steps={steps} />}
        {show("weight") && <WeightJourneyCard />}
        {show("fasting") && <IFCard />}
        {show("vitals") && <VitalsCard />}
        {show("disease") && <DiseasePlanCard />}
        {show("tasks") && <TodayTasks weightKg={weightKg} />}
        {show("diet") && <TodayDietCard />}
        {show("progress") && <ProgressCard />}
      </div>

      <CustomizeDialog open={customizeOpen} onClose={() => setCustomizeOpen(false)} />
      <BottomNav />
    </div>
  );
}

const DASHBOARD_SECTIONS: { id: string; label: string; emoji: string }[] = [
  { id: "targets", label: "Water & Steps", emoji: "💧" },
  { id: "calories", label: "Calories today", emoji: "🔥" },
  { id: "weight", label: "Weight journey", emoji: "⚖️" },
  { id: "fasting", label: "Intermittent fasting", emoji: "⏱️" },
  { id: "vitals", label: "Vitals & reminders", emoji: "🩸" },
  { id: "disease", label: "Condition plans", emoji: "🩺" },
  { id: "tasks", label: "Today's tasks", emoji: "✅" },
  { id: "diet", label: "Today's diet", emoji: "🥗" },
  { id: "progress", label: "Progress", emoji: "📈" },
];

function CustomizeDialog({ open, onClose }: { open: boolean; onClose: () => void }) {
  const tick = useAyuTick();
  const hidden = useMemo(() => loadHiddenSections(), [tick, open]);
  return (
    <Dialog open={open} onOpenChange={(v) => { if (!v) onClose(); }}>
      <DialogContent className="max-w-sm">
        <DialogHeader>
          <DialogTitle className="font-display">Customise your dashboard</DialogTitle>
          <DialogDescription>Keep only what you want to track. Hidden a section by mistake? Toggle it back on — or ask Ayu to bring it back anytime.</DialogDescription>
        </DialogHeader>
        <div className="max-h-80 space-y-1.5 overflow-y-auto">
          {DASHBOARD_SECTIONS.map((s) => {
            const on = !hidden.includes(s.id);
            return (
              <button key={s.id} onClick={() => toggleSection(s.id)}
                className="flex w-full items-center gap-3 rounded-2xl bg-secondary/50 px-3 py-2.5 text-left ring-1 ring-border/50">
                <span className="text-lg">{s.emoji}</span>
                <span className="flex-1 text-[13px] font-semibold text-foreground">{s.label}</span>
                <span className={`flex h-5 w-9 items-center rounded-full p-0.5 transition ${on ? "justify-end bg-primary" : "justify-start bg-border"}`}>
                  <span className="h-4 w-4 rounded-full bg-white shadow" />
                </span>
              </button>
            );
          })}
        </div>
      </DialogContent>
    </Dialog>
  );
}

/* ================= Calories in vs out ================= */

function CalInOutCard({ weightKg, steps }: { weightKg: number; steps: number }) {
  const [foodOpen, setFoodOpen] = useState(false);
  const [choreOpen, setChoreOpen] = useState(false);
  const [histOpen, setHistOpen] = useState(false);
  const tick = useAyuTick();

  const entries = useMemo(() => loadCalEntries(), [tick]);
  const calIn = useMemo(() => calInTotal(), [tick]);
  const calOutManualV = useMemo(() => loadCalEntries().filter((e) => e.kind === "out").reduce((a, e) => a + e.kcal, 0), [tick]);
  const stepsBurn = stepsKcal(steps, weightKg);
  const calOut = calOutManualV + stepsBurn;
  const net = calIn - calOut;
  // deleting an entry that came from a ticked task/meal also unticks it
  const del = (e: { id: string; src?: string }) => {
    deleteCalEntry(e.id);
    if (e.src) setTaskDone(e.src, false);
  };

  return (
    <section className="mt-3 surface p-4">
      <div className="flex items-center justify-between">
        <h2 className="flex items-center gap-2 font-display text-[15px] font-semibold">
          <Flame size={15} className="text-primary" /> Calories today
        </h2>
        <div className="flex items-center gap-2">
          <span className={`rounded-full px-2.5 py-1 text-[11px] font-bold ${net > 0 ? "bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300" : "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300"}`}>
            {net >= 0 ? `+${net}` : net} net
          </span>
          <button onClick={() => setHistOpen(true)} className="flex items-center gap-1 rounded-full bg-secondary px-2 py-1 text-[10.5px] font-semibold text-foreground/70 ring-1 ring-border/60">
            <History size={11} /> History
          </button>
        </div>
      </div>

      {/* two columns: in vs out */}
      <div className="mt-3 grid grid-cols-2 gap-2.5">
        <div className="rounded-2xl bg-rose-50 p-3 ring-1 ring-rose-200 dark:bg-rose-950/25 dark:ring-rose-900">
          <p className="text-[10.5px] font-bold uppercase tracking-wide text-rose-600 dark:text-rose-400">🍽️ Cal in</p>
          <p className="mt-0.5 font-display text-2xl font-bold text-foreground">{calIn}</p>
          <p className="text-[10px] text-muted-foreground">food eaten & punched</p>
        </div>
        <div className="rounded-2xl bg-emerald-50 p-3 ring-1 ring-emerald-200 dark:bg-emerald-950/25 dark:ring-emerald-900">
          <p className="text-[10.5px] font-bold uppercase tracking-wide text-emerald-600 dark:text-emerald-400">🔥 Cal out</p>
          <p className="mt-0.5 font-display text-2xl font-bold text-foreground">{calOut}</p>
          <p className="text-[10px] text-muted-foreground">{stepsBurn} from steps + activity</p>
        </div>
      </div>

      {/* punch buttons */}
      <div className="mt-2.5 grid grid-cols-2 gap-2">
        <button onClick={() => setFoodOpen(true)} className="rounded-2xl bg-primary px-3 py-2.5 text-[12.5px] font-semibold text-primary-foreground">
          + Punch food
        </button>
        <button onClick={() => setChoreOpen(true)} className="rounded-2xl bg-secondary px-3 py-2.5 text-[12.5px] font-semibold text-foreground ring-1 ring-border/60">
          + Other activities
        </button>
      </div>

      {/* punched list */}
      {entries.length > 0 && (
        <div className="mt-2.5 space-y-1">
          {entries.map((e) => (
            <div key={e.id} className="flex items-center gap-2 rounded-xl bg-secondary/40 px-2.5 py-1.5 text-[11px]">
              <span className={e.kind === "in" ? "text-rose-500" : "text-emerald-600"}>{e.kind === "in" ? "🍽️" : "🔥"}</span>
              <span className="flex-1 truncate text-foreground/80">{e.label}</span>
              <span className="font-bold text-foreground/80">{e.kind === "in" ? "+" : "−"}{e.kcal}</span>
              <button onClick={() => del(e)} className="text-muted-foreground hover:text-rose-500"><X size={12} /></button>
            </div>
          ))}
        </div>
      )}

      <FoodPunchDialog open={foodOpen} onClose={() => setFoodOpen(false)} />
      <ChorePunchDialog open={choreOpen} weightKg={weightKg} onClose={() => setChoreOpen(false)} />

      {/* full history across days */}
      <Dialog open={histOpen} onOpenChange={setHistOpen}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle className="font-display">🔥 Calorie history</DialogTitle>
            <DialogDescription>Everything you punched — swipe through days, delete any entry.</DialogDescription>
          </DialogHeader>
          <CalHistoryList />
        </DialogContent>
      </Dialog>
    </section>
  );
}

function CalHistoryList() {
  const tick = useAyuTick();
  // last 10 days that have entries
  const days = useMemo(() => {
    const out: { date: string; entries: ReturnType<typeof loadCalEntries> }[] = [];
    for (let i = 0; i < 10; i++) {
      const d = new Date(); d.setDate(d.getDate() - i);
      const key = d.toISOString().slice(0, 10);
      const entries = loadCalEntries(key);
      if (entries.length) out.push({ date: key, entries });
    }
    return out;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tick]);
  const del = (e: { id: string; src?: string }, date: string) => { deleteCalEntry(e.id, date); if (e.src) setTaskDone(e.src, false, date); };
  if (days.length === 0) return <p className="rounded-2xl bg-secondary/50 p-4 text-center text-[12px] text-muted-foreground">Nothing punched yet.</p>;
  return (
    <div className="max-h-80 space-y-3 overflow-y-auto">
      {days.map((d) => (
        <div key={d.date}>
          <p className="text-[10.5px] font-bold uppercase tracking-wide text-foreground/50">
            {new Date(d.date).toLocaleDateString(undefined, { weekday: "short", day: "numeric", month: "short" })}
          </p>
          <div className="mt-1 space-y-1">
            {d.entries.map((e) => (
              <div key={e.id} className="flex items-center gap-2 rounded-xl bg-secondary/40 px-2.5 py-1.5 text-[11.5px]">
                <span className={e.kind === "in" ? "text-rose-500" : "text-emerald-600"}>{e.kind === "in" ? "🍽️" : "🔥"}</span>
                <span className="flex-1 truncate text-foreground/80">{e.label}</span>
                <span className="font-bold text-foreground/80">{e.kind === "in" ? "+" : "−"}{e.kcal}</span>
                <button onClick={() => del(e, d.date)} className="text-muted-foreground hover:text-rose-500"><Trash2 size={12} /></button>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

function FoodPunchDialog({ open, onClose }: { open: boolean; onClose: () => void }) {
  const [slot, setSlot] = useState<string>("Breakfast");
  const [kcal, setKcal] = useState("");
  const [backfill, setBackfill] = useState(false);
  const [date, setDate] = useState(todayISO());
  const save = () => {
    const n = parseInt(kcal, 10);
    if (!Number.isFinite(n) || n <= 0 || n > 5000) return;
    addCalEntry({ kind: "in", label: date === todayISO() ? slot : `${slot} (${date.slice(5)})`, slot, kcal: n }, date);
    setKcal("");
    toast.success(date === todayISO() ? `+${n} kcal · ${slot}` : `+${n} kcal logged for ${date.slice(5)}`);
    onClose();
  };
  return (
    <Dialog open={open} onOpenChange={(v) => { if (!v) onClose(); }}>
      <DialogContent className="max-w-sm">
        <DialogHeader>
          <DialogTitle className="font-display">🍽️ Punch food calories</DialogTitle>
          <DialogDescription>Pick the meal, then the calories — or punch the whole day at once.</DialogDescription>
        </DialogHeader>
        <div className="flex flex-wrap gap-1.5">
          {MEAL_SLOTS.map((s) => (
            <button key={s} onClick={() => setSlot(s)}
              className={`rounded-full px-3 py-1.5 text-[11.5px] font-semibold ${slot === s ? "bg-primary text-primary-foreground" : "bg-secondary text-foreground/75"}`}>
              {s}
            </button>
          ))}
        </div>
        <div className="flex items-center gap-2">
          <input type="number" inputMode="numeric" placeholder="e.g. 350" value={kcal} onChange={(e) => setKcal(e.target.value)}
            className="w-full rounded-2xl bg-secondary px-3 py-2.5 text-lg font-semibold text-foreground outline-none ring-1 ring-border/60 focus:ring-primary" />
          <span className="text-sm text-muted-foreground">kcal</span>
        </div>
        {!backfill ? (
          <button onClick={() => setBackfill(true)} className="text-left text-[11.5px] font-semibold text-primary">
            📅 Forgot a past meal? Punch it for another day
          </button>
        ) : (
          <label className="flex items-center justify-between gap-2 text-[11px] font-semibold text-foreground/70">
            <span className="flex items-center gap-1"><CalendarDays size={12} /> Meal was on</span>
            <input type="date" value={date} max={todayISO()} onChange={(e) => setDate(e.target.value)}
              className="rounded-xl bg-secondary px-2.5 py-1.5 text-[12px] font-semibold text-foreground outline-none ring-1 ring-border/60 focus:ring-primary" />
          </label>
        )}
        <button onClick={save} className="w-full rounded-2xl bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground">
          Punch {slot}
        </button>
        <Link to="/coach" className="flex items-center justify-center gap-2 rounded-2xl bg-secondary px-4 py-2.5 text-[13px] font-semibold text-foreground">
          <Bot size={15} className="text-primary" /> Don't know the calories? Tell Ayu what you ate →
        </Link>
      </DialogContent>
    </Dialog>
  );
}

function ChorePunchDialog({ open, weightKg, onClose }: { open: boolean; weightKg: number; onClose: () => void }) {
  const [chore, setChore] = useState(0);
  const [mins, setMins] = useState("20");
  const c = CHORES[chore];
  const kcal = kcalFor(c.met, parseInt(mins, 10) || 0, weightKg);
  const save = () => {
    if (kcal <= 0) return;
    addCalEntry({ kind: "out", label: `${c.label} ${mins} min`, kcal, minutes: parseInt(mins, 10) });
    toast.success(`🔥 ${kcal} kcal out · ${c.label}`);
    onClose();
  };
  return (
    <Dialog open={open} onOpenChange={(v) => { if (!v) onClose(); }}>
      <DialogContent className="max-w-sm">
        <DialogHeader>
          <DialogTitle className="font-display">🔥 Other activities / household chores</DialogTitle>
          <DialogDescription>Mopping, cooking, washing — housework burns real energy most people never count.</DialogDescription>
        </DialogHeader>
        <div className="grid max-h-40 grid-cols-2 gap-1.5 overflow-y-auto">
          {CHORES.map((ch, i) => (
            <button key={ch.label} onClick={() => setChore(i)}
              className={`flex items-center gap-1.5 rounded-xl px-2.5 py-2 text-[11.5px] font-semibold ${chore === i ? "bg-primary text-primary-foreground" : "bg-secondary text-foreground/75"}`}>
              <span>{ch.emoji}</span> <span className="truncate">{ch.label}</span>
            </button>
          ))}
        </div>
        <div className="flex items-center justify-between gap-2">
          <span className="text-[12px] font-semibold text-foreground/70">Minutes</span>
          <input type="number" inputMode="numeric" value={mins} onChange={(e) => setMins(e.target.value)}
            className="w-24 rounded-xl bg-secondary px-3 py-2 text-[14px] font-semibold text-foreground outline-none ring-1 ring-border/60 focus:ring-primary" />
          <span className="rounded-full bg-emerald-100 px-3 py-1.5 text-[12.5px] font-bold text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300">≈ {kcal} kcal</span>
        </div>
        <button onClick={save} className="w-full rounded-2xl bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground">
          Punch to cal out
        </button>
      </DialogContent>
    </Dialog>
  );
}

/* ================= Water ================= */

function WaterCard({ water, onPunch }: { water: number; onPunch: (d: number) => void }) {
  const slots = Math.max(water, 8); // visual affordance; grows if you drink more
  return (
    <div className="relative rounded-3xl p-4 text-primary-foreground shadow-[var(--shadow-tile)]" style={{ background: "var(--gradient-water)" }}>
      <div className="flex items-center justify-between text-xs font-semibold uppercase tracking-wider opacity-90">
        <span className="flex items-center gap-1.5"><Droplet size={13} /> Water</span>
        {water > 0 && (
          <button onClick={() => onPunch(-1)} className="rounded-full bg-card/25 px-2 py-0.5 text-[10px] font-semibold">undo</button>
        )}
      </div>

      {/* one big tap target */}
      <button onClick={() => onPunch(1)} className="mt-2 flex w-full items-end gap-1 text-left active:scale-[0.98]">
        <span className="font-display text-3xl font-semibold">{water}</span>
        <span className="mb-1 text-xs opacity-80">glasses</span>
        <span className="mb-1 ml-auto flex h-8 w-8 items-center justify-center rounded-full bg-card/30"><Plus size={16} /></span>
      </button>

      <div className="mt-2.5 flex flex-wrap gap-1">
        {Array.from({ length: slots }).map((_, idx) => (
          <span key={idx} className={`text-[15px] leading-none ${idx < water ? "" : "opacity-25"}`}>🥛</span>
        ))}
      </div>

      <p className="mt-2 text-[10px] leading-snug opacity-90">
        Aim ~2.5–3 L/day. Tip: 2–3 glasses on waking flush like a gentle detox — then sip as you feel thirsty. Just tap to punch.
      </p>
    </div>
  );
}

/* ================= Steps ================= */

function StepsCard({ steps, target, weightKg, onPunch, onTarget }: {
  steps: number; target: number; weightKg: number; onPunch: (d: number) => void; onTarget: (t: number) => void;
}) {
  const [editing, setEditing] = useState(false);
  const [addVal, setAddVal] = useState("");
  const [lastAdd, setLastAdd] = useState(0);
  const pct = Math.min(100, Math.round((steps / target) * 100));
  const fmt = (n: number) => (n >= 1000 ? `${+(n / 1000).toFixed(1)}k` : String(n));
  const burn = stepsKcal(steps, weightKg);

  const add = () => {
    const n = parseInt(addVal, 10);
    if (!Number.isFinite(n) || n <= 0) return;
    onPunch(n);
    setLastAdd(n);
    setAddVal("");
  };
  const undo = () => { if (lastAdd > 0) { onPunch(-lastAdd); setLastAdd(0); } };

  return (
    <div className="rounded-3xl p-4 text-primary-foreground shadow-[var(--shadow-tile)]" style={{ background: "var(--gradient-leaf)" }}>
      <div className="flex items-center justify-between text-xs font-semibold uppercase tracking-wider opacity-90">
        <span className="flex items-center gap-1.5"><Footprints size={13} /> Steps</span>
        <button onClick={() => setEditing(!editing)} className="rounded-full bg-card/25 p-1"><Pencil size={11} /></button>
      </div>
      <div className="mt-2 flex items-end gap-1">
        <span className="font-display text-3xl font-semibold">{fmt(steps)}</span>
        <span className="mb-1 text-xs opacity-80">/ {fmt(target)}</span>
      </div>
      <div className="mt-1 flex items-center gap-1 text-[11px] font-semibold opacity-95">
        <Flame size={11} /> {burn} kcal burnt
      </div>
      <div className="mt-2 h-2 overflow-hidden rounded-full bg-card/25">
        <div className="h-full rounded-full bg-card/90 transition-all" style={{ width: `${pct}%` }} />
      </div>
      {editing ? (
        <div className="mt-2.5">
          <div className="flex items-center gap-1.5 text-[11px]">
            <span className="opacity-90">Target</span>
            <button onClick={() => onTarget(Math.max(2000, target - 1000))} className="flex h-6 w-6 items-center justify-center rounded-full bg-card/30"><Minus size={11} /></button>
            <input
              type="number" inputMode="numeric" value={target}
              onChange={(e) => { const n = parseInt(e.target.value, 10); if (Number.isFinite(n)) onTarget(Math.max(1000, Math.min(30000, n))); }}
              className="w-16 rounded-lg bg-card/30 px-1.5 py-1 text-center text-[12px] font-bold text-primary-foreground outline-none placeholder:text-primary-foreground/50"
            />
            <button onClick={() => onTarget(Math.min(30000, target + 1000))} className="flex h-6 w-6 items-center justify-center rounded-full bg-card/30"><Plus size={11} /></button>
          </div>
          <button onClick={() => setEditing(false)} className="mt-2 w-full rounded-full bg-card/90 px-3 py-1.5 text-[11px] font-bold text-emerald-700">
            Done
          </button>
        </div>
      ) : (
        <div className="mt-2 space-y-1.5">
          <div className="flex items-center gap-1.5">
            <input
              type="number" inputMode="numeric" value={addVal} onChange={(e) => setAddVal(e.target.value)}
              onKeyDown={(e) => { if (e.key === "Enter") add(); }}
              placeholder="add steps"
              className="w-full rounded-lg bg-card/30 px-2 py-1.5 text-[12px] font-bold text-primary-foreground outline-none placeholder:text-primary-foreground/60"
            />
            <button onClick={add} className="shrink-0 rounded-lg bg-card/90 px-3 py-1.5 text-[11px] font-bold text-emerald-700">Add</button>
          </div>
          {lastAdd > 0 && (
            <button onClick={undo} className="flex items-center gap-1 text-[10.5px] font-semibold opacity-90">
              <RefreshCw size={9} /> Undo last +{fmt(lastAdd)}
            </button>
          )}
        </div>
      )}
    </div>
  );
}

/* ================= Weight journey ================= */

const todayISO = () => new Date().toISOString().slice(0, 10);

function WeightJourneyCard() {
  const [plan, setPlan] = useState<WLPlan | null>(null);
  const [punchOpen, setPunchOpen] = useState(false);
  const [editVar, setEditVar] = useState<"target" | "date" | "pace" | null>(null);
  const [val, setVal] = useState("");
  const [punchDate, setPunchDate] = useState(todayISO());
  const [backfill, setBackfill] = useState(false);
  const [remOpen, setRemOpen] = useState(false);

  useEffect(() => { setPlan(loadWLPlan()); }, []);

  const punches = useMemo(() => loadPunches(), [punchOpen, plan]);
  const actualPace = useMemo(() => {
    const recent = punches.slice(-14);
    if (recent.length < 2) return null;
    const first = recent[0], last = recent[recent.length - 1];
    const days = Math.max(1, (new Date(last.date).getTime() - new Date(first.date).getTime()) / 86400000);
    return +(((first.weight - last.weight) / days) * 7).toFixed(2); // kg lost per week (+ = losing)
  }, [punches]);

  if (!plan) {
    return (
      <Link to="/section/weight-loss" className="tile mt-3 flex items-center gap-3 rounded-3xl bg-card p-4 ring-1 ring-border/60">
        <span className="flex h-11 w-11 items-center justify-center rounded-2xl text-primary-foreground" style={{ background: "var(--gradient-gold)" }}>
          <TrendingDown size={20} />
        </span>
        <span className="flex-1">
          <span className="text-[13.5px] font-semibold text-foreground">Start your weight journey</span>
          <span className="mt-0.5 block text-[12px] text-muted-foreground">Set a target and track the trend, not the Tuesday.</span>
        </span>
        <ChevronRight size={16} className="text-muted-foreground" />
      </Link>
    );
  }

  const { startWeight: start, currentWeight: current, targetWeight: target } = plan;
  const total = Math.abs(start - target) || 1;
  const journeyKg = +total.toFixed(1);
  const done = Math.min(100, Math.max(0, (Math.abs(start - current) / total) * 100));
  const lost = +Math.abs(start - current).toFixed(1) * (Math.sign(start - current) === Math.sign(start - target) ? 1 : -1);
  const toGo = +Math.abs(current - target).toFixed(1);
  const dateFmt = new Date(plan.targetDate).toLocaleDateString(undefined, { month: "short", day: "numeric" });

  const savePunch = () => {
    const w = parseFloat(val);
    if (!Number.isFinite(w) || w < 20 || w > 300) return;
    const date = punchDate || todayISO();
    const prev = punches.length ? punches[punches.length - 1].weight : plan!.currentWeight;
    const isLatest = punches.length === 0 || date >= punches[punches.length - 1].date;
    addPunch({ date, weight: w });
    // a backfilled old day must never overwrite today's current weight
    if (isLatest) setPlan(patchWLPlan({ currentWeight: w }));
    else setPlan(loadWLPlan());
    setPunchOpen(false);
    setVal("");
    if (date !== todayISO()) {
      const nice = new Date(date).toLocaleDateString(undefined, { day: "numeric", month: "short" });
      toast.success(`Logged ${w} kg for ${nice} — gap filled ✓`);
      return;
    }
    // celebrate every punch
    const delta = +(prev - w).toFixed(1);
    const sign = plan!.goal === "gain" ? -delta : delta; // positive = moving toward goal
    if (sign > 0) toast.success(`${Math.abs(delta)} kg closer since your last punch 🎉 Keep going!`);
    else if (sign < 0) toast(`Up ${Math.abs(delta)} kg — daily wobble is normal, the trend is what counts 🌱`);
    else toast(`Holding steady — consistency is a win too 🧘`);
  };

  const celebrate =
    toGo <= 0
      ? `Target reached — incredible! 🏆`
      : lost >= 0.5
        ? `Good going — you've already lost ${lost} kg 🎉`
        : lost > 0
          ? `First ${lost} kg down — the trend has begun 🌱`
          : `Your ${journeyKg} kg journey starts now 💪`;

  return (
    <section className="mt-3 rounded-3xl bg-card p-5 shadow-[var(--shadow-soft)] ring-1 ring-border/60">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-primary">⚖️ Weight journey</p>
          <p className="font-display text-[17px] font-bold leading-tight text-foreground">
            {plan.goal === "gain" ? "Gaining" : "Losing"} · {journeyKg} kg journey
          </p>
        </div>
        <Link
          to="/section/weight-loss"
          className="flex items-center gap-1 rounded-full bg-secondary px-2.5 py-1.5 text-[11px] font-semibold text-foreground/75"
          title="Edit the whole weight-loss plan"
        >
          <Pencil size={10} /> Edit plan
        </Link>
      </div>

      {/* celebration — its own colour, changes with every punch */}
      <div className="mt-3 rounded-2xl px-3.5 py-2.5" style={{ background: "var(--gradient-hero)" }}>
        <p className="text-[13.5px] font-semibold text-saffron">{celebrate}</p>
        {toGo > 0 && <p className="text-[11.5px] text-foreground/70">{toGo} kg to target · {punches.length} {punches.length === 1 ? "punch" : "punches"} so far</p>}
      </div>

      {/* horizontal journey graph — green road, gold flag */}
      <div className="relative mt-9 h-3 rounded-full bg-secondary">
        <div className="h-full rounded-full transition-all" style={{ width: `${done}%`, background: "linear-gradient(90deg,#34d399,#10b981)" }} />
        {[25, 50, 75].map((m) => (
          <span
            key={m}
            className={`absolute top-1/2 h-2.5 w-2.5 -translate-y-1/2 rounded-full border-2 border-card ${done >= m ? "bg-emerald-500" : "bg-border"}`}
            style={{ left: `calc(${m}% - 5px)` }}
          />
        ))}
        {/* current-position knob with value bubble */}
        <div className="absolute top-1/2 -translate-y-1/2" style={{ left: `calc(${done}% - 11px)` }}>
          <span className="absolute -top-8 left-1/2 -translate-x-1/2 whitespace-nowrap rounded-full bg-primary px-2.5 py-1 text-[10.5px] font-bold text-primary-foreground shadow-md">
            {current.toFixed(1)} kg
          </span>
          <span className="block h-[22px] w-[22px] rounded-full border-[3px] border-card bg-primary shadow-md" />
        </div>
        {/* target flag */}
        <span className="absolute -right-1 -top-6 text-sm">🏁</span>
      </div>
      <div className="mt-2 flex justify-between text-[10.5px]">
        <span className="rounded-full bg-secondary px-2 py-0.5 font-semibold text-foreground/70">Start · {start} kg</span>
        <span className="rounded-full bg-amber-100 px-2 py-0.5 font-semibold text-amber-700 dark:bg-amber-900/40 dark:text-amber-300">Target · {target} kg</span>
      </div>

      {/* edit pills — tap one, the rest re-calculate */}
      <div className="mt-4 grid grid-cols-3 gap-2">
        <EditPill tint="#fef3c7" label="Target" value={`${target} kg`} onClick={() => setEditVar("target")} />
        <EditPill tint="#ddd6fe" label="Date" value={dateFmt} onClick={() => setEditVar("date")} />
        <EditPill tint="#fecaca" label="Pace" value={`${plan.paceKgWeek} kg/wk`} onClick={() => setEditVar("pace")} />
      </div>
      <p className="mt-2 text-[10.5px] text-muted-foreground">
        Tap any pill to edit — the other values re-calculate automatically.
        {actualPace !== null && ` Actual pace: ${Math.abs(actualPace)} kg/wk ${actualPace > 0 ? "↓" : "↑"}.`}
      </p>

      <div className="mt-3 grid grid-cols-2 gap-2">
        <button
          onClick={() => { setVal(""); setPunchDate(todayISO()); setBackfill(false); setPunchOpen(true); }}
          className="rounded-2xl bg-primary px-4 py-3 text-[13.5px] font-semibold text-primary-foreground shadow-[var(--shadow-glow)] active:scale-[0.98]"
        >
          ⚖️ Punch weight
        </button>
        <button
          onClick={() => setRemOpen(true)}
          className="rounded-2xl bg-secondary px-4 py-3 text-[13.5px] font-semibold text-foreground ring-1 ring-border/60 active:scale-[0.98]"
        >
          🔔 Set reminder
        </button>
      </div>

      {/* punch dialog */}
      <Dialog open={punchOpen} onOpenChange={setPunchOpen}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle className="font-display">⚖️ Punch your weight</DialogTitle>
            <DialogDescription>Saved for today automatically. The trend is what matters.</DialogDescription>
          </DialogHeader>
          <div className="flex items-center gap-2">
            <input
              type="number" inputMode="decimal" step="0.1" placeholder={String(current)}
              value={val} onChange={(e) => setVal(e.target.value)}
              className="w-full rounded-2xl bg-secondary px-3 py-2.5 text-lg font-semibold text-foreground outline-none ring-1 ring-border/60 focus:ring-primary"
            />
            <button onClick={savePunch} className="shrink-0 rounded-2xl bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground">
              Save
            </button>
          </div>

          {/* backfill a missed day */}
          {!backfill ? (
            <button onClick={() => setBackfill(true)} className="text-left text-[11.5px] font-semibold text-primary">
              📅 Forgot to punch a past day? Log it here
            </button>
          ) : (
            <label className="flex items-center justify-between gap-2 text-[11px] font-semibold text-foreground/70">
              <span className="flex items-center gap-1"><CalendarDays size={12} /> Punching for</span>
              <input
                type="date" value={punchDate} max={todayISO()}
                onChange={(e) => setPunchDate(e.target.value)}
                className="rounded-xl bg-secondary px-2.5 py-1.5 text-[12px] font-semibold text-foreground outline-none ring-1 ring-border/60 focus:ring-primary"
              />
            </label>
          )}
          {punchDate !== todayISO() && (
            <p className="text-[10.5px] text-muted-foreground">Filling a missed day — your current weight stays from your latest punch.</p>
          )}

          {/* recent punches, deletable */}
          {punches.length > 0 && (
            <div className="rounded-2xl ring-1 ring-border/60">
              <p className="px-3 pt-2 text-[10px] font-bold uppercase tracking-wide text-foreground/50">Recent punches</p>
              {[...punches].slice(-5).reverse().map((p) => (
                <div key={p.date} className="flex items-center justify-between px-3 py-1.5 text-[12.5px]">
                  <span className="text-muted-foreground">{new Date(p.date).toLocaleDateString(undefined, { day: "numeric", month: "short" })}</span>
                  <span className="font-bold text-foreground">{p.weight} kg</span>
                  <button
                    onClick={() => { removePunch(p.date); setPlan(loadWLPlan()); toast(`Punch for ${p.date} deleted`); }}
                    className="rounded-full p-1 text-muted-foreground hover:text-rose-500"
                  >
                    <Trash2 size={13} />
                  </button>
                </div>
              ))}
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* reminder dialog */}
      <Dialog open={remOpen} onOpenChange={setRemOpen}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle className="font-display">🔔 Weight punch reminder</DialogTitle>
            <DialogDescription>Tip: punch your weight at the <b>same time each day</b> (morning, empty stomach) — consistency makes the trend honest.</DialogDescription>
          </DialogHeader>
          <ReminderConfig trackerKey="weight" />
          <button
            onClick={() => { setRemOpen(false); toast.success("Reminder saved ✓"); }}
            className="w-full rounded-2xl bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground"
          >
            Save reminder
          </button>
        </DialogContent>
      </Dialog>

      <EditVarDialog editVar={editVar} plan={plan} onClose={() => setEditVar(null)} onSaved={setPlan} />
    </section>
  );
}

function EditPill({ tint, label, value, onClick }: { tint: string; label: string; value: string; onClick: () => void }) {
  return (
    <button onClick={onClick} className="flex items-center gap-2 rounded-2xl bg-secondary/60 px-2.5 py-2 text-left ring-1 ring-border/50 active:scale-[0.97]">
      <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full" style={{ background: tint }}>
        <Pencil size={11} className="text-foreground/70" />
      </span>
      <span className="min-w-0">
        <span className="block text-[9.5px] font-bold uppercase tracking-wide text-muted-foreground">{label}</span>
        <span className="block truncate text-[12px] font-bold text-foreground">{value}</span>
      </span>
    </button>
  );
}

/** Single-variable editors: change ONE thing, watch the dependent value re-calculate live. */
function EditVarDialog({ editVar, plan, onClose, onSaved }: {
  editVar: "target" | "date" | "pace" | null;
  plan: WLPlan;
  onClose: () => void;
  onSaved: (p: WLPlan | null) => void;
}) {
  const [target, setTarget] = useState(String(plan.targetWeight));
  const [date, setDate] = useState(plan.targetDate);
  const [pace, setPace] = useState(plan.paceKgWeek);

  useEffect(() => {
    if (editVar) { setTarget(String(plan.targetWeight)); setDate(plan.targetDate); setPace(plan.paceKgWeek); }
  }, [editVar, plan]);

  // live derivation: the edited variable + the kept one → the third
  const derived = useMemo(() => {
    const t = parseFloat(target);
    if (editVar === "target") {
      // target edited, date kept → pace adjusts
      return deriveThird({ currentKg: plan.currentWeight, goal: plan.goal, targetKg: Number.isFinite(t) ? t : plan.targetWeight, targetDate: date });
    }
    if (editVar === "date") {
      // date edited, target kept → pace adjusts
      return deriveThird({ currentKg: plan.currentWeight, goal: plan.goal, targetKg: plan.targetWeight, targetDate: date });
    }
    // pace edited, target kept → date adjusts
    return deriveThird({ currentKg: plan.currentWeight, goal: plan.goal, targetKg: plan.targetWeight, paceKgWeek: pace });
  }, [editVar, target, date, pace, plan]);

  const save = () => {
    onSaved(patchWLPlan({ targetWeight: derived.targetKg, paceKgWeek: derived.paceKgWeek, targetDate: derived.targetDate }));
    onClose();
  };

  const title = editVar === "target" ? "Edit target weight" : editVar === "date" ? "Edit target date" : "Edit pace";
  const keptNote =
    editVar === "pace" ? <>Target weight stays at <b>{plan.targetWeight} kg</b>. Target date will auto-adjust.</> :
    editVar === "date" ? <>Target weight stays at <b>{plan.targetWeight} kg</b>. Pace will auto-adjust.</> :
    <>Pace will auto-adjust to keep your target date.</>;

  return (
    <Dialog open={editVar !== null} onOpenChange={(v) => { if (!v) onClose(); }}>
      <DialogContent className="max-w-sm">
        <DialogHeader>
          <DialogTitle className="font-display">{title}</DialogTitle>
        </DialogHeader>

        {editVar === "target" && (
          <>
            <label className="text-[10.5px] font-bold uppercase tracking-wide text-foreground/60">
              Target weight (kg)
              <input type="number" inputMode="decimal" step="0.5" value={target} onChange={(e) => setTarget(e.target.value)}
                className="mt-1 w-full rounded-2xl bg-secondary px-3 py-2.5 text-[15px] font-semibold text-foreground outline-none ring-1 ring-border/60 focus:ring-primary" />
            </label>
            <label className="mt-1 text-[10.5px] font-bold uppercase tracking-wide text-foreground/60">
              Keep target date at
              <input type="date" value={date} onChange={(e) => setDate(e.target.value)}
                className="mt-1 w-full rounded-2xl bg-secondary px-3 py-2.5 text-[14px] font-semibold text-foreground outline-none ring-1 ring-border/60 focus:ring-primary" />
            </label>
          </>
        )}

        {editVar === "date" && (
          <label className="text-[10.5px] font-bold uppercase tracking-wide text-foreground/60">
            Target date
            <input type="date" value={date} onChange={(e) => setDate(e.target.value)}
              className="mt-1 w-full rounded-2xl bg-secondary px-3 py-2.5 text-[15px] font-semibold text-foreground outline-none ring-1 ring-border/60 focus:ring-primary" />
          </label>
        )}

        {editVar === "pace" && (
          <div>
            <div className="flex items-center justify-between">
              <span className="text-[10.5px] font-bold uppercase tracking-wide text-foreground/60">Pace</span>
              <span className="font-display text-[15px] font-bold text-foreground">{pace} kg/week</span>
            </div>
            <input
              type="range" min="0.1" max="1" step="0.05" value={pace}
              onChange={(e) => setPace(parseFloat(e.target.value))}
              className="mt-2 w-full accent-primary"
            />
          </div>
        )}

        <p className="text-[11.5px] leading-snug text-muted-foreground">{keptNote}</p>

        {/* live summary */}
        <div className="rounded-2xl bg-secondary/50 p-3 text-[12.5px] ring-1 ring-border/50">
          <div className="flex justify-between py-0.5"><span className="text-muted-foreground">Target</span><b>{derived.targetKg} kg</b></div>
          <div className="flex justify-between py-0.5"><span className="text-muted-foreground">Target date</span><b>{derived.targetDate}</b></div>
          <div className="flex justify-between py-0.5"><span className="text-muted-foreground">Pace</span><b>{derived.paceKgWeek} kg/week</b></div>
        </div>

        <button onClick={save} className="w-full rounded-2xl bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground">
          Save changes
        </button>
      </DialogContent>
    </Dialog>
  );
}

/** Reusable punch-reminder block. variant="interval" = water-style (every N hours in a window). */
function ReminderConfig({ trackerKey, variant = "standard" }: { trackerKey: string; variant?: "standard" | "interval" }) {
  const [cfg, setCfg] = useState<ReminderCfg | null>(null);
  const [showCal, setShowCal] = useState(false);
  useEffect(() => { setCfg(loadReminder(trackerKey)); }, [trackerKey]);
  if (!cfg) return null;

  const upd = (patch: Partial<ReminderCfg>) => setCfg(saveReminder(trackerKey, { ...cfg, ...patch }));
  const W = ["S", "M", "T", "W", "T", "F", "S"];
  const toggleDay = (d: number) =>
    upd({ weekdays: cfg.weekdays.includes(d) ? cfg.weekdays.filter((x) => x !== d) : [...cfg.weekdays, d] });

  const chip = (on: boolean) =>
    `rounded-full px-3 py-1.5 text-[11.5px] font-semibold transition ${on ? "bg-primary text-primary-foreground" : "bg-card text-foreground/75 ring-1 ring-border/60"}`;

  const timeInput = (
    <div className="mt-2 flex items-center justify-between gap-2">
      <span className="text-[11px] font-semibold text-foreground/70">⏰ Remind me at</span>
      <input
        type="time" value={cfg.time ?? ""}
        onChange={(e) => upd({ time: e.target.value })}
        className="rounded-xl bg-card px-2.5 py-1.5 text-[12px] font-semibold text-foreground outline-none ring-1 ring-border/60 focus:ring-primary"
      />
    </div>
  );

  return (
    <div className="mt-3 rounded-2xl bg-secondary/50 p-3 ring-1 ring-border/50">
      <div className="flex items-center justify-between">
        <p className="flex items-center gap-1 text-[10.5px] font-bold uppercase tracking-wide text-foreground/60">
          <Bell size={11} /> Remind me
        </p>
        <span className="text-[11px] font-semibold text-foreground/70">{reminderSummary(cfg)}</span>
      </div>

      <div className="mt-2 grid grid-cols-3 gap-1.5">
        <button onClick={() => upd({ channel: "off" })} className={chip(cfg.channel === "off")}>Off</button>
        <button onClick={() => upd({ channel: "inapp" })} className={chip(cfg.channel === "inapp")}>In-app</button>
        <button onClick={() => upd({ channel: "wa" })} className={chip(cfg.channel === "wa")}>WhatsApp</button>
      </div>

      {cfg.channel !== "off" && variant === "interval" && (
        <>
          <p className="mt-2.5 text-[10px] font-bold uppercase tracking-wide text-foreground/50">How often</p>
          <div className="mt-1.5 grid grid-cols-3 gap-1.5">
            {[1, 2, 3].map((h) => (
              <button key={h} onClick={() => upd({ intervalHrs: h })} className={chip(cfg.intervalHrs === h)}>
                Every {h}h
              </button>
            ))}
          </div>
          <div className="mt-2 flex items-center justify-between gap-2 text-[11px] font-semibold text-foreground/70">
            <span>Between</span>
            <span className="flex items-center gap-1.5">
              <input type="time" value={cfg.windowStart ?? "10:00"} onChange={(e) => upd({ windowStart: e.target.value })}
                className="rounded-xl bg-card px-2 py-1.5 text-[12px] font-semibold text-foreground outline-none ring-1 ring-border/60 focus:ring-primary" />
              <span>—</span>
              <input type="time" value={cfg.windowEnd ?? "22:00"} onChange={(e) => upd({ windowEnd: e.target.value })}
                className="rounded-xl bg-card px-2 py-1.5 text-[12px] font-semibold text-foreground outline-none ring-1 ring-border/60 focus:ring-primary" />
            </span>
          </div>
        </>
      )}

      {cfg.channel !== "off" && variant === "standard" && (
        <>
          <p className="mt-2.5 text-[10px] font-bold uppercase tracking-wide text-foreground/50">Frequency</p>
          <div className="mt-1.5 grid grid-cols-3 gap-1.5">
            <button onClick={() => upd({ freq: "daily" })} className={chip(cfg.freq === "daily")}>Daily</button>
            <button onClick={() => upd({ freq: "weekly" })} className={chip(cfg.freq === "weekly")}>Weekly</button>
            <button onClick={() => upd({ freq: "custom" })} className={chip(cfg.freq === "custom")}>Custom</button>
          </div>

          {(cfg.freq === "weekly" || cfg.freq === "custom") && (
            <>
              <p className="mt-2 text-[10.5px] text-muted-foreground">Pick the recurring days you want us to remind you on:</p>
              <div className="mt-1.5 flex justify-between gap-1">
                {W.map((w, d) => (
                  <button
                    key={d}
                    onClick={() => toggleDay(d)}
                    className={`h-8 w-8 rounded-full text-[11px] font-bold transition ${
                      cfg.weekdays.includes(d) ? "bg-primary text-primary-foreground" : "bg-card text-foreground/70 ring-1 ring-border/60"
                    }`}
                  >
                    {w}
                  </button>
                ))}
              </div>
            </>
          )}

          {cfg.freq === "custom" && (
            <>
              <button
                onClick={() => setShowCal(!showCal)}
                className="mt-2 flex w-full items-center justify-center gap-1.5 rounded-xl bg-card px-3 py-2 text-[11.5px] font-semibold text-foreground/80 ring-1 ring-border/60"
              >
                <CalendarDays size={12} /> Pick dates on the calendar{cfg.dates.length ? ` · ${cfg.dates.length} picked` : ""}
              </button>
              {showCal && (
                <div className="mt-2 flex justify-center rounded-xl bg-card ring-1 ring-border/60">
                  <Calendar
                    mode="multiple"
                    selected={cfg.dates.map((d) => new Date(`${d}T00:00:00`))}
                    onSelect={(ds) => upd({ dates: (ds ?? []).map((d: Date) => d.toISOString().slice(0, 10)) })}
                  />
                </div>
              )}
            </>
          )}

          {timeInput}
        </>
      )}

      {cfg.channel !== "off" && (
        <p className="mt-2 text-[10.5px] leading-snug text-muted-foreground">
          {cfg.channel === "wa"
            ? "WhatsApp reminders coming soon — your schedule is saved and will activate automatically."
            : "For in-app alerts: add AyuRaise to your phone's home screen and allow notifications."}
        </p>
      )}
    </div>
  );
}

/* ================= Vitals (sugar + BP) ================= */

function VitalsCard() {
  const [open, setOpen] = useState<"sugar" | "bp" | "sleep" | null>(null);
  const [manage, setManage] = useState(false);
  const [enabled, setEnabled] = useState<EnabledTrackers>({ sugar: true, bp: true, sleep: false, screen: false });
  const [tick, setTick] = useState(0); // refresh after save
  const [sugar, setSugar] = useState("");
  const [sugarType, setSugarType] = useState<VitalsEntry["sugarType"]>("fasting");
  const [sys, setSys] = useState("");
  const [dia, setDia] = useState("");
  const [sleepH, setSleepH] = useState("");

  useEffect(() => { setEnabled(loadEnabled()); setCustoms(loadCustomReminders()); }, []);

  const [hist, setHist] = useState<"sugar" | "bp" | null>(null);
  const [pDate, setPDate] = useState(todayISO());
  const [pTime, setPTime] = useState("");
  const [vBackfill, setVBackfill] = useState(false);
  const [customs, setCustoms] = useState<CustomReminder[]>([]);
  const [newRem, setNewRem] = useState<{ id: string; emoji: string; label: string } | null>(null);
  const lastSugar = useMemo(() => latestVital("sugar"), [tick]);
  const lastBp = useMemo(() => latestVital("bp"), [tick]);
  const lastSleep = useMemo(() => latestSleep(), [tick]);
  const sugarToday = useMemo(() => vitalsTodayCount("sugar"), [tick]);
  const bpToday = useMemo(() => vitalsTodayCount("bp"), [tick]);

  const stopTracking = (k: keyof EnabledTrackers) => setEnabled(saveEnabled({ [k]: false }));
  const startTracking = (k: keyof EnabledTrackers) => { setEnabled(saveEnabled({ [k]: true })); setManage(false); };
  const offList = (["sugar", "bp", "sleep"] as const).filter((k) => !enabled[k]);
  const LABEL: Record<string, string> = { sugar: "🩸 Sugar", bp: "❤️ BP", sleep: "😴 Sleep" };

  const save = () => {
    const backdated = pDate !== todayISO();
    // for old days default the time to noon so ordering stays sensible
    const time = pTime || (backdated ? "12:00" : undefined);
    if (open === "sugar") {
      const v = parseFloat(sugar);
      if (!Number.isFinite(v) || v < 30 || v > 600) return;
      addVitals({ kind: "sugar", sugar: v, sugarType, date: pDate, time });
    } else if (open === "bp") {
      const s = parseInt(sys, 10), d = parseInt(dia, 10);
      if (!Number.isFinite(s) || !Number.isFinite(d) || s < 60 || s > 260 || d < 30 || d > 160) return;
      addVitals({ kind: "bp", sys: s, dia: d, date: pDate, time });
    } else if (open === "sleep") {
      const h = parseFloat(sleepH);
      if (!Number.isFinite(h) || h < 0 || h > 16) return;
      patchDay({ sleepHrs: h }, pDate);
    }
    if (backdated) {
      const nice = new Date(pDate).toLocaleDateString(undefined, { day: "numeric", month: "short" });
      toast.success(`Logged for ${nice} — gap filled ✓`);
    }
    setSugar(""); setSys(""); setDia(""); setSleepH("");
    setOpen(null);
    setTick((t) => t + 1);
  };

  const openPunch = (k: "sugar" | "bp" | "sleep") => {
    const now = new Date();
    setPDate(todayISO());
    setPTime(`${String(now.getHours()).padStart(2, "0")}:${String(now.getMinutes()).padStart(2, "0")}`);
    setVBackfill(false);
    setOpen(k);
  };

  const tile = "relative rounded-2xl bg-secondary/60 p-3 text-left ring-1 ring-border/50 active:scale-[0.98]";
  const removeBtn = (k: keyof EnabledTrackers) => manage && (
    <span
      onClick={(e) => { e.stopPropagation(); stopTracking(k); }}
      className="absolute -right-1.5 -top-1.5 flex h-6 w-6 items-center justify-center rounded-full bg-rose-500 text-white shadow-sm"
    >
      <X size={12} />
    </span>
  );

  return (
    <section className="mt-3 surface p-4">
      <div className="flex items-center justify-between">
        <h2 className="flex items-center gap-2 font-display text-[15px] font-semibold">
          <Activity size={15} className="text-primary" /> Track your vitals & reminders
        </h2>
        <button onClick={() => setManage(!manage)} className="flex items-center gap-1 rounded-full bg-secondary px-2.5 py-1.5 text-[11px] font-semibold text-foreground/75">
          <Pencil size={11} /> {manage ? "Done" : "Add / remove"}
        </button>
      </div>
      <p className="mt-1 text-[11px] leading-snug text-muted-foreground">
        Add the vitals & reminders you want to track or punch — sugar, BP, sleep, screen time, medicines and more. Tap a tile to punch or see trends.
      </p>

      <div className="mt-3 grid grid-cols-2 gap-2.5">
        {enabled.sugar && (
          <button onClick={() => !manage && openPunch("sugar")} className={tile}>
            {removeBtn("sugar")}
            <p className="text-[10.5px] font-bold uppercase tracking-wide text-foreground/60">🩸 Sugar</p>
            {lastSugar ? (
              <>
                <p className={`mt-1 font-display text-xl font-bold ${BAND_META[vitalBand(lastSugar)].text}`}>
                  {lastSugar.sugar} <span className="text-[11px] font-normal text-muted-foreground">mg/dL</span>
                </p>
                <p className="text-[10.5px] text-muted-foreground">
                  {lastSugar.sugarType} · {relDate(lastSugar.date)} {lastSugar.time}
                </p>
                {sugarToday > 1 && <p className="text-[10.5px] font-semibold text-primary">Punched {sugarToday}× today</p>}
              </>
            ) : (
              <p className="mt-1 text-[12px] text-muted-foreground">no readings yet</p>
            )}
            <div className="mt-1.5 flex items-center justify-between text-[11px] font-bold">
              <span className="text-primary">+ Punch</span>
              {!manage && lastSugar && (
                <span
                  onClick={(e) => { e.stopPropagation(); setHist("sugar"); }}
                  className="flex items-center gap-1 rounded-full bg-card px-2 py-0.5 text-muted-foreground ring-1 ring-border/60"
                >
                  <History size={10} /> Trends
                </span>
              )}
            </div>
          </button>
        )}

        {enabled.bp && (
          <button onClick={() => !manage && openPunch("bp")} className={tile}>
            {removeBtn("bp")}
            <p className="text-[10.5px] font-bold uppercase tracking-wide text-foreground/60">❤️ BP</p>
            {lastBp ? (
              <>
                <p className={`mt-1 font-display text-xl font-bold ${BAND_META[vitalBand(lastBp)].text}`}>{lastBp.sys}/{lastBp.dia}</p>
                <p className="text-[10.5px] text-muted-foreground">{relDate(lastBp.date)} {lastBp.time}</p>
                {bpToday > 1 && <p className="text-[10.5px] font-semibold text-primary">Punched {bpToday}× today</p>}
              </>
            ) : (
              <p className="mt-1 text-[12px] text-muted-foreground">no readings yet</p>
            )}
            <div className="mt-1.5 flex items-center justify-between text-[11px] font-bold">
              <span className="text-primary">+ Punch</span>
              {!manage && lastBp && (
                <span
                  onClick={(e) => { e.stopPropagation(); setHist("bp"); }}
                  className="flex items-center gap-1 rounded-full bg-card px-2 py-0.5 text-muted-foreground ring-1 ring-border/60"
                >
                  <History size={10} /> Trends
                </span>
              )}
            </div>
          </button>
        )}

        {enabled.sleep && (
          <button onClick={() => !manage && openPunch("sleep")} className={tile}>
            {removeBtn("sleep")}
            <p className="text-[10.5px] font-bold uppercase tracking-wide text-foreground/60">😴 Sleep</p>
            {lastSleep ? (
              <>
                <p className="mt-1 font-display text-xl font-bold text-foreground">{lastSleep.hrs} <span className="text-[11px] font-normal text-muted-foreground">hrs</span></p>
                <p className="text-[10.5px] text-muted-foreground">{relDate(lastSleep.date)}</p>
              </>
            ) : (
              <p className="mt-1 text-[12px] text-muted-foreground">no nights logged yet</p>
            )}
            <div className="mt-1.5 text-[11px] font-bold text-primary">+ Punch</div>
          </button>
        )}

      </div>

      {/* medicines — multiple, each with times + a daily taken-tick */}
      <MedicinesBlock />

      {/* reminder-only entries: doctor visits, anything else… */}
      {customs.length > 0 && (
        <div className="mt-2.5 space-y-1.5">
          {customs.map((r) => (
            <div key={r.id} className="flex items-center gap-2.5 rounded-2xl bg-secondary/60 px-3 py-2 ring-1 ring-border/50">
              <span className="text-lg">{r.emoji}</span>
              <button onClick={() => setNewRem({ id: r.id, emoji: r.emoji, label: r.label })} className="min-w-0 flex-1 text-left">
                <span className="block truncate text-[12.5px] font-semibold text-foreground">{r.label}</span>
                <span className="block text-[10.5px] text-muted-foreground">{reminderSummary(r.cfg)}</span>
              </button>
              <button
                onClick={() => { setCustoms(deleteCustomReminder(r.id)); toast(`"${r.label}" reminder deleted`); }}
                className="rounded-full p-1 text-muted-foreground hover:text-rose-500"
              >
                <Trash2 size={13} />
              </button>
            </div>
          ))}
        </div>
      )}

      {/* add trackers & reminders */}
      {(manage || offList.length === 3) && (
        <div className="mt-2.5 space-y-1.5">
          {offList.length > 0 && (
            <div className="flex flex-wrap items-center gap-1.5">
              <span className="text-[11px] font-semibold text-muted-foreground">Add a tracker:</span>
              {offList.map((k) => (
                <button key={k} onClick={() => startTracking(k)} className="rounded-full bg-primary/10 px-3 py-1.5 text-[11.5px] font-semibold text-primary">
                  + {LABEL[k]}
                </button>
              ))}
            </div>
          )}
          <div className="flex flex-wrap items-center gap-1.5">
            <span className="text-[11px] font-semibold text-muted-foreground">Add a reminder (no punching):</span>
            <button
              onClick={() => setNewRem({ id: `cr_${Date.now().toString(36)}`, emoji: "🩺", label: "Doctor visit" })}
              className="rounded-full bg-primary/10 px-3 py-1.5 text-[11.5px] font-semibold text-primary"
            >
              + 🩺 Doctor visit
            </button>
            <button
              onClick={() => setNewRem({ id: `cr_${Date.now().toString(36)}`, emoji: "🔔", label: "" })}
              className="rounded-full bg-primary/10 px-3 py-1.5 text-[11.5px] font-semibold text-primary"
            >
              + 🔔 Anything else
            </button>
          </div>
        </div>
      )}

      <Dialog open={open !== null} onOpenChange={(v) => { if (!v) setOpen(null); }}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle className="font-display">
              {open === "sugar" ? "🩸 Punch blood sugar" : open === "bp" ? "❤️ Punch blood pressure" : "😴 Punch last night's sleep"}
            </DialogTitle>
            <DialogDescription>Tracked over time so you and your doctor can see the trend.</DialogDescription>
          </DialogHeader>
          {open === "sugar" && (
            <>
              <div className="flex gap-1.5">
                {(["fasting", "post-meal", "random"] as const).map((t) => (
                  <button key={t} onClick={() => setSugarType(t)}
                    className={`rounded-full px-3 py-1.5 text-[11.5px] font-semibold ${sugarType === t ? "bg-primary text-primary-foreground" : "bg-secondary text-foreground/75"}`}>
                    {t}
                  </button>
                ))}
              </div>
              <div className="mt-1 flex items-center gap-2">
                <input type="number" inputMode="numeric" placeholder="98" value={sugar} onChange={(e) => setSugar(e.target.value)}
                  className="w-full rounded-2xl bg-secondary px-3 py-2.5 text-lg font-semibold text-foreground outline-none ring-1 ring-border/60 focus:ring-primary" />
                <span className="text-sm text-muted-foreground">mg/dL</span>
              </div>
            </>
          )}
          {open === "bp" && (
            <div className="flex items-center gap-2">
              <input type="number" inputMode="numeric" placeholder="120" value={sys} onChange={(e) => setSys(e.target.value)}
                className="w-full rounded-2xl bg-secondary px-3 py-2.5 text-lg font-semibold text-foreground outline-none ring-1 ring-border/60 focus:ring-primary" />
              <span className="text-lg text-muted-foreground">/</span>
              <input type="number" inputMode="numeric" placeholder="80" value={dia} onChange={(e) => setDia(e.target.value)}
                className="w-full rounded-2xl bg-secondary px-3 py-2.5 text-lg font-semibold text-foreground outline-none ring-1 ring-border/60 focus:ring-primary" />
            </div>
          )}
          {open === "sleep" && (
            <div className="flex items-center gap-2">
              <input type="number" inputMode="decimal" step="0.5" placeholder={open === "sleep" ? "7.5" : "4"} value={sleepH} onChange={(e) => setSleepH(e.target.value)}
                className="w-full rounded-2xl bg-secondary px-3 py-2.5 text-lg font-semibold text-foreground outline-none ring-1 ring-border/60 focus:ring-primary" />
              <span className="text-sm text-muted-foreground">hours</span>
            </div>
          )}
          {!vBackfill ? (
            <div className="flex items-center justify-between">
              <p className="text-[11px] text-muted-foreground">Saved as now · {pTime}</p>
              <button onClick={() => setVBackfill(true)} className="text-left text-[11.5px] font-semibold text-primary">
                📅 Forgot a past reading?
              </button>
            </div>
          ) : (
            <div className="flex items-center justify-between gap-2 text-[11px] font-semibold text-foreground/70">
              <span className="flex items-center gap-1">
                <CalendarDays size={12} /> {open === "sleep" ? "Which night?" : "Reading was on"}
              </span>
              <span className="flex gap-1.5">
                <input
                  type="date" value={pDate} max={todayISO()}
                  onChange={(e) => setPDate(e.target.value)}
                  className="rounded-xl bg-secondary px-2 py-1.5 text-[12px] font-semibold text-foreground outline-none ring-1 ring-border/60 focus:ring-primary"
                />
                {open !== "sleep" && (
                  <input
                    type="time" value={pTime}
                    onChange={(e) => setPTime(e.target.value)}
                    className="rounded-xl bg-secondary px-2 py-1.5 text-[12px] font-semibold text-foreground outline-none ring-1 ring-border/60 focus:ring-primary"
                  />
                )}
              </span>
            </div>
          )}
          <button onClick={save} className="mt-1 w-full rounded-2xl bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground">
            Save reading
          </button>
          {open && <ReminderConfig trackerKey={open} />}
        </DialogContent>
      </Dialog>

      {hist && <VitalsHistoryDialog kind={hist} onClose={() => setHist(null)} />}

      {/* create / edit a reminder-only entry */}
      <Dialog open={newRem !== null} onOpenChange={(v) => { if (!v) setNewRem(null); }}>
        <DialogContent className="max-w-sm">
          {newRem && (
            <>
              <DialogHeader>
                <DialogTitle className="font-display">{newRem.emoji} Reminder</DialogTitle>
                <DialogDescription>No punching needed — we'll just remind you.</DialogDescription>
              </DialogHeader>
              <input
                value={newRem.label}
                onChange={(e) => setNewRem({ ...newRem, label: e.target.value })}
                placeholder="Name it — e.g. Thyroid tablet, Dr. Sharma visit"
                className="w-full rounded-2xl bg-secondary px-3 py-2.5 text-[14px] font-semibold text-foreground outline-none ring-1 ring-border/60 focus:ring-primary"
              />
              <ReminderConfig trackerKey={`custom.${newRem.id}`} />
              <button
                onClick={() => {
                  if (!newRem.label.trim()) { toast.error("Give the reminder a name first"); return; }
                  setCustoms(saveCustomReminder({ id: newRem.id, emoji: newRem.emoji, label: newRem.label.trim(), cfg: loadReminder(`custom.${newRem.id}`) }));
                  setNewRem(null);
                  toast.success("Reminder saved ✓");
                }}
                className="w-full rounded-2xl bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground"
              >
                Save reminder
              </button>
            </>
          )}
        </DialogContent>
      </Dialog>
    </section>
  );
}

/** Colour meanings for readings — guidance, not diagnosis. */
const BAND_META: Record<RangeBand, { text: string; dot: string; label: string }> = {
  good:       { text: "text-emerald-600 dark:text-emerald-400", dot: "#10b981", label: "Healthy" },
  borderline: { text: "text-amber-600 dark:text-amber-400",     dot: "#f59e0b", label: "Borderline" },
  high:       { text: "text-orange-600 dark:text-orange-400",   dot: "#f97316", label: "High" },
  severe:     { text: "text-rose-600 dark:text-rose-400",       dot: "#e11d48", label: "Very high — see a doctor" },
};

function VitalsHistoryDialog({ kind, onClose }: { kind: "sugar" | "bp"; onClose: () => void }) {
  const [view, setView] = useState<"list" | "graph">("list");
  const [tick, setTick] = useState(0);
  const entries = useMemo(() => loadVitals().filter((v) => v.kind === kind).slice(-30), [kind, tick]);
  const rev = [...entries].reverse();
  const del = (e: VitalsEntry) => { deleteVital(e); setTick((t) => t + 1); toast("Reading deleted"); };

  return (
    <Dialog open onOpenChange={(v) => { if (!v) onClose(); }}>
      <DialogContent className="max-w-sm">
        <DialogHeader>
          <DialogTitle className="font-display">{kind === "sugar" ? "🩸 Sugar history" : "❤️ BP history"}</DialogTitle>
          <DialogDescription>Every punch, colour-coded. Multiple readings a day are all kept.</DialogDescription>
        </DialogHeader>

        <div className="grid grid-cols-2 gap-1.5">
          {(["list", "graph"] as const).map((v) => (
            <button key={v} onClick={() => setView(v)}
              className={`rounded-full px-3 py-1.5 text-[12px] font-semibold capitalize ${view === v ? "bg-primary text-primary-foreground" : "bg-secondary text-foreground/75"}`}>
              {v}
            </button>
          ))}
        </div>

        {view === "list" ? (
          <div className="max-h-72 overflow-y-auto rounded-2xl ring-1 ring-border/60">
            {rev.map((e, i) => {
              const band = vitalBand(e);
              return (
                <div key={i} className={`flex items-center gap-2.5 px-3 py-2 ${i % 2 === 0 ? "bg-secondary/40" : "bg-card"}`}>
                  <span className="h-2.5 w-2.5 shrink-0 rounded-full" style={{ background: BAND_META[band].dot }} />
                  <span className="w-24 shrink-0 text-[11.5px] text-muted-foreground">{relDate(e.date)} · {e.time}</span>
                  <span className={`flex-1 text-[13px] font-bold ${BAND_META[band].text}`}>
                    {kind === "sugar" ? `${e.sugar} mg/dL` : `${e.sys}/${e.dia}`}
                  </span>
                  <span className="text-[10.5px] text-muted-foreground">{kind === "sugar" ? e.sugarType : BAND_META[band].label.split(" —")[0]}</span>
                  <button onClick={() => del(e)} className="rounded-full p-1 text-muted-foreground hover:text-rose-500">
                    <Trash2 size={12} />
                  </button>
                </div>
              );
            })}
          </div>
        ) : (
          <VitalsGraph kind={kind} entries={entries} />
        )}

        {/* colour legend */}
        <div className="flex flex-wrap gap-x-3 gap-y-1">
          {(Object.keys(BAND_META) as RangeBand[]).map((b) => (
            <span key={b} className="flex items-center gap-1 text-[10.5px] text-muted-foreground">
              <span className="h-2 w-2 rounded-full" style={{ background: BAND_META[b].dot }} /> {BAND_META[b].label}
            </span>
          ))}
        </div>
      </DialogContent>
    </Dialog>
  );
}

function VitalsGraph({ kind, entries }: { kind: "sugar" | "bp"; entries: VitalsEntry[] }) {
  if (entries.length < 2) {
    return <p className="rounded-2xl bg-secondary/50 p-4 text-center text-[12px] text-muted-foreground">Punch at least two readings to see the graph.</p>;
  }
  const vals = kind === "sugar" ? entries.map((e) => e.sugar!) : entries.map((e) => e.sys!);
  const dias = kind === "bp" ? entries.map((e) => e.dia!) : [];
  const all = [...vals, ...dias];
  const min = Math.min(...all) - 10, max = Math.max(...all) + 10;
  const X = (i: number) => 8 + (i / (entries.length - 1)) * 84;
  const Y = (v: number) => 8 + (1 - (v - min) / (max - min)) * 64;
  const line = (arr: number[]) => arr.map((v, i) => `${X(i)},${Y(v)}`).join(" ");
  return (
    <svg viewBox="0 0 100 80" className="h-44 w-full rounded-2xl bg-secondary/40 ring-1 ring-border/50">
      <polyline points={line(vals)} fill="none" stroke="currentColor" strokeOpacity="0.35" strokeWidth="1.5" className="text-foreground" />
      {kind === "bp" && <polyline points={line(dias)} fill="none" stroke="currentColor" strokeOpacity="0.25" strokeWidth="1.2" strokeDasharray="3 2" className="text-foreground" />}
      {entries.map((e, i) => (
        <circle key={i} cx={X(i)} cy={Y(vals[i])} r="2.4" fill={BAND_META[vitalBand(e)].dot} />
      ))}
      <text x="8" y="6" fontSize="4.5" fill="currentColor" opacity="0.5">{max - 10}</text>
      <text x="8" y="78" fontSize="4.5" fill="currentColor" opacity="0.5">{min + 10}</text>
    </svg>
  );
}

function relDate(iso: string): string {
  const days = Math.round((Date.now() - new Date(iso).getTime()) / 86400000);
  if (days <= 0) return "today";
  if (days === 1) return "yesterday";
  return `${days}d ago`;
}

/* ================= Intermittent-fasting live card ================= */

const IF_SOS_TIPS = [
  { q: "Hunger hit suddenly?", a: "Drink a full glass of water first — thirst wears hunger's costume. Wait 10 minutes." },
  { q: "Feeling weak or light-headed?", a: "A pinch of rock salt in warm water restores electrolytes without breaking the fast. If it persists — eat. Health first, always." },
  { q: "Stomach growling loudly?", a: "Growls come in waves and pass in 15–20 minutes. Start any small task — the wave rides itself out." },
  { q: "Craving something specific?", a: "That's appetite, not hunger. Brush your teeth or sip warm jeera water — cravings hate mint and warmth." },
  { q: "Can't sleep because of hunger?", a: "Tonight, allow warm water or plain chamomile. Tomorrow, shift dinner 30 minutes later — the window should fit your life." },
  { q: "It's genuinely unbearable?", a: "End the fast — one shorter fast is data, not failure. Eat something light and warm, and note what made today hard." },
];

function IFCard() {
  const [cfg, setCfg] = useState(() => ({ fastStart: "19:00", fastHours: 14 }));
  const [status, setStatus] = useState<ReturnType<typeof ifStatus> | null>(null);
  const [sos, setSos] = useState(false);
  const [histOpen, setHistOpen] = useState(false);
  const [cfgOpen, setCfgOpen] = useState(false);
  const [tick, setTick] = useState(0);

  useEffect(() => {
    const c = loadIFConfig();
    setCfg(c);
    const refresh = () => {
      const s = ifStatus(c);
      // a fast that completed on its own (never manually ended) is logged as completed
      const endDate = new Date(new Date(`${s.beginDate}T${c.fastStart}:00`).getTime() + c.fastHours * 3600000).toISOString().slice(0, 10);
      maybeAutoLogFast(s.beginDate, endDate, c, s.phase);
      setStatus(s);
    };
    refresh();
    const t = setInterval(refresh, 60000);
    return () => clearInterval(t);
  }, [tick]);

  if (!status) return null;
  const fasting = status.phase === "fasting";
  const rest = status.phase === "rest";
  const pct = status.totalHrs > 0 ? Math.min(100, (status.doneHrs / status.totalHrs) * 100) : 0;
  const hm = (h: number) => `${Math.floor(h)}h ${String(Math.round((h % 1) * 60)).padStart(2, "0")}m`;

  const endedThisCycle = fastEndedOn() === status.beginDate;

  const endNow = () => {
    addIFSession({
      date: new Date().toISOString().slice(0, 10),
      plannedHrs: status.hoursToday,
      actualHrs: +status.doneHrs.toFixed(1),
      endedEarly: status.doneHrs < status.hoursToday - 0.1,
    });
    setFastOverride(null);
    markFastEnded(status.beginDate);
    setTick((t) => t + 1);
    toast.success(`Fast ended at ${hm(status.doneHrs)} — logged. Eat something warm and gentle 🌿`);
  };

  const startAgain = () => {
    // begin a fresh fast counting from NOW
    setFastOverride(new Date().toISOString());
    markFastEnded("");
    setTick((t) => t + 1);
    toast.success("New fast started — timer running from now 💪");
  };

  return (
    <section className="mt-3 rounded-3xl bg-card p-5 shadow-[var(--shadow-soft)] ring-1 ring-border/60">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-primary">⏱️ Intermittent fasting</p>
          <p className="font-display text-[17px] font-bold leading-tight text-foreground">
            {rest ? "Rest day — no fast" : fasting ? "Fasting now" : "Eating window"}
          </p>
        </div>
        <button onClick={() => setCfgOpen(true)} className="flex items-center gap-1 rounded-full bg-secondary px-2.5 py-1.5 text-[11px] font-semibold text-foreground/75">
          <Pencil size={10} /> Edit
        </button>
      </div>

      <p className="mt-2 text-[13px] text-foreground/85">
        {rest
          ? <>Today's a rest day in your schedule — eat normally, no fasting window.</>
          : fasting
          ? <><b>{hm(status.doneHrs)}</b> done of {status.hoursToday}h · eating opens at <b>{status.endsAt}</b></>
          : <>window closes at <b>{status.endsAt}</b> — dinner before then starts tonight's {status.hoursToday}h fast</>}
      </p>

      {!rest && (
        <div className="mt-3 h-2.5 rounded-full bg-secondary">
          <div
            className="h-full rounded-full transition-all"
            style={{ width: `${pct}%`, background: fasting ? "linear-gradient(90deg,#2dd4bf,#0d9488)" : "linear-gradient(90deg,#fbbf24,#f59e0b)" }}
          />
        </div>
      )}

      {/* End fast while fasting; Start again if manually ended this cycle; auto-completes if left */}
      {!rest && (fasting ? (
        <button onClick={endNow} className="mt-3 w-full rounded-2xl bg-teal-600 px-3 py-3 text-[13.5px] font-bold text-white shadow-[var(--shadow-glow)] active:scale-[0.98]">
          ✋ End fast now
        </button>
      ) : endedThisCycle ? (
        <button onClick={startAgain} className="mt-3 w-full rounded-2xl bg-teal-600 px-3 py-3 text-[13.5px] font-bold text-white shadow-[var(--shadow-glow)] active:scale-[0.98]">
          ▶ Start the fast again
        </button>
      ) : null)}
      {!rest && (
        <p className="mt-1.5 text-[10.5px] leading-snug text-muted-foreground">
          {fasting ? "End early anytime — or leave it, and we'll mark it done automatically when the window opens." : endedThisCycle ? "Ended early — you can pick it back up." : "Fast completed. It starts again after tonight's dinner."}
        </p>
      )}

      <div className="mt-2.5 flex gap-2">
        <button onClick={() => setSos(true)} className="flex-1 rounded-2xl bg-rose-50 px-3 py-2.5 text-[12.5px] font-bold text-rose-600 ring-1 ring-rose-200 dark:bg-rose-950/30 dark:text-rose-300 dark:ring-rose-900">
          🆘 Hunger SOS
        </button>
        <button onClick={() => setCfgOpen(true)} className="flex-1 rounded-2xl bg-secondary px-3 py-2.5 text-[12.5px] font-semibold text-foreground ring-1 ring-border/60">
          🔔 Notifications
        </button>
        <button onClick={() => setHistOpen(true)} className="flex-1 rounded-2xl bg-secondary px-3 py-2.5 text-[12.5px] font-semibold text-foreground ring-1 ring-border/60">
          See Trends
        </button>
      </div>

      {/* Hunger SOS */}
      <Dialog open={sos} onOpenChange={setSos}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle className="font-display">🆘 Hunger SOS</DialogTitle>
            <DialogDescription>The wave passes — here's how to ride it.</DialogDescription>
          </DialogHeader>
          <div className="max-h-72 space-y-2.5 overflow-y-auto">
            {IF_SOS_TIPS.map((t) => (
              <div key={t.q} className="rounded-2xl bg-secondary/50 p-3 ring-1 ring-border/50">
                <p className="text-[12.5px] font-bold text-foreground">{t.q}</p>
                <p className="mt-1 text-[12.5px] leading-snug text-foreground/80">{t.a}</p>
              </div>
            ))}
          </div>
          <Link to="/coach" className="flex items-center justify-center gap-2 rounded-2xl bg-primary px-4 py-2.5 text-[13px] font-semibold text-primary-foreground">
            <Bot size={15} /> Still struggling? Chat with Ayu
          </Link>
        </DialogContent>
      </Dialog>

      {/* history */}
      <Dialog open={histOpen} onOpenChange={setHistOpen}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle className="font-display">Your fasting record</DialogTitle>
            <DialogDescription>Ended-early days are data, not failures.</DialogDescription>
          </DialogHeader>
          <IFHistoryList />
        </DialogContent>
      </Dialog>

      {/* config */}
      <Dialog open={cfgOpen} onOpenChange={setCfgOpen}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle className="font-display">Fasting window</DialogTitle>
            <DialogDescription>Fast begins after dinner and runs this many hours.</DialogDescription>
          </DialogHeader>
          <div className="flex items-center justify-between gap-2 text-[12px] font-semibold text-foreground/75">
            <span>Fast starts (dinner done)</span>
            <input
              type="time" value={cfg.fastStart}
              onChange={(e) => { setCfg(saveIFConfig({ fastStart: e.target.value })); }}
              className="rounded-xl bg-secondary px-2.5 py-1.5 text-[12.5px] font-semibold text-foreground outline-none ring-1 ring-border/60 focus:ring-primary"
            />
          </div>
          <div className="grid grid-cols-3 gap-1.5">
            {[12, 14, 16].map((h) => (
              <button
                key={h}
                onClick={() => setCfg(saveIFConfig({ fastHours: h }))}
                className={`rounded-full px-3 py-1.5 text-[12px] font-semibold ${cfg.fastHours === h ? "bg-primary text-primary-foreground" : "bg-secondary text-foreground/75"}`}
              >
                {h}h fast
              </button>
            ))}
          </div>

          <PerDayWindows cfg={cfg} onChange={setCfg} />

          <IFReminders fastStart={cfg.fastStart} fastHours={cfg.fastHours} />
          <button
            onClick={() => { setCfgOpen(false); setTick((t) => t + 1); toast.success("Fasting window saved ✓"); }}
            className="w-full rounded-2xl bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground"
          >
            Save
          </button>
        </DialogContent>
      </Dialog>
    </section>
  );
}

/** Medicines: add several at once (Med 1/2/3), each with its own times, reminder, and daily taken-tick. */
function MedicinesBlock() {
  const tick = useAyuTick();
  const [addOpen, setAddOpen] = useState(false);
  const meds = useMemo(() => loadMedicines(), [tick]);
  const taken = useMemo(() => loadMedTaken(), [tick]);

  return (
    <div className="mt-2.5">
      {meds.length > 0 && (
        <div className="space-y-1.5">
          {meds.map((m) => (
            <div key={m.id} className="flex items-center gap-2.5 rounded-2xl bg-secondary/60 px-3 py-2 ring-1 ring-border/50">
              <button
                onClick={() => setMedTaken(m.id, !taken[m.id])}
                className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full ring-2 transition ${taken[m.id] ? "bg-emerald-500 text-white ring-emerald-500" : "bg-card text-transparent ring-border"}`}
                title="Mark taken today"
              >
                <Check size={12} strokeWidth={3} />
              </button>
              <div className="min-w-0 flex-1">
                <span className={`block truncate text-[12.5px] font-semibold ${taken[m.id] ? "text-muted-foreground line-through" : "text-foreground"}`}>💊 {m.name}</span>
                <span className="block text-[10.5px] text-muted-foreground">
                  {m.times.length ? m.times.join(" · ") : "no time set"}{m.channel !== "off" ? ` · ${m.channel === "wa" ? "WhatsApp" : "in-app"}` : ""}
                </span>
              </div>
              <button onClick={() => deleteMedicine(m.id)} className="rounded-full p-1 text-muted-foreground hover:text-rose-500"><Trash2 size={13} /></button>
            </div>
          ))}
        </div>
      )}
      <button onClick={() => setAddOpen(true)} className="mt-1.5 rounded-full bg-primary/10 px-3 py-1.5 text-[11.5px] font-semibold text-primary">
        + 💊 Add medicine{meds.length ? "s" : ""}
      </button>

      <MedicineAddDialog open={addOpen} onClose={() => setAddOpen(false)} />
    </div>
  );
}

function MedicineAddDialog({ open, onClose }: { open: boolean; onClose: () => void }) {
  type Row = { name: string; times: string[]; channel: "off" | "inapp" | "wa" };
  const blank = (): Row => ({ name: "", times: ["09:00"], channel: "inapp" });
  const [rows, setRows] = useState<Row[]>([blank()]);

  useEffect(() => { if (open) setRows([blank()]); }, [open]);

  const upd = (i: number, patch: Partial<Row>) => setRows((r) => r.map((x, j) => (j === i ? { ...x, ...patch } : x)));
  const addTime = (i: number) => upd(i, { times: [...rows[i].times, "21:00"] });
  const setTime = (i: number, ti: number, v: string) => upd(i, { times: rows[i].times.map((t, k) => (k === ti ? v : t)) });
  const delTime = (i: number, ti: number) => upd(i, { times: rows[i].times.filter((_, k) => k !== ti) });

  const save = () => {
    const valid = rows.filter((r) => r.name.trim());
    if (valid.length === 0) { toast.error("Add at least one medicine name"); return; }
    valid.forEach((r) => upsertMedicine({ id: `med_${Date.now().toString(36)}${Math.random().toString(36).slice(2, 5)}`, name: r.name.trim(), times: r.times, channel: r.channel }));
    toast.success(`${valid.length} medicine${valid.length > 1 ? "s" : ""} saved 💊`);
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={(v) => { if (!v) onClose(); }}>
      <DialogContent className="max-w-sm">
        <DialogHeader>
          <DialogTitle className="font-display">💊 Add medicines</DialogTitle>
          <DialogDescription>Add one or several at once — each with its own timing and reminder.</DialogDescription>
        </DialogHeader>
        <div className="max-h-72 space-y-2.5 overflow-y-auto">
          {rows.map((r, i) => (
            <div key={i} className="rounded-2xl bg-secondary/50 p-3 ring-1 ring-border/50">
              <div className="flex items-center justify-between">
                <span className="text-[10.5px] font-bold uppercase tracking-wide text-foreground/50">Medicine {i + 1}</span>
                {rows.length > 1 && <button onClick={() => setRows((x) => x.filter((_, j) => j !== i))} className="text-muted-foreground hover:text-rose-500"><X size={12} /></button>}
              </div>
              <input
                value={r.name} onChange={(e) => upd(i, { name: e.target.value })}
                placeholder="Name — e.g. Thyroxine 50mcg"
                className="mt-1.5 w-full rounded-xl bg-card px-3 py-2 text-[13px] font-semibold text-foreground outline-none ring-1 ring-border/60 focus:ring-primary"
              />
              <div className="mt-2 flex flex-wrap items-center gap-1.5">
                {r.times.map((t, ti) => (
                  <span key={ti} className="flex items-center gap-1 rounded-lg bg-card px-1.5 py-1 ring-1 ring-border/60">
                    <input type="time" value={t} onChange={(e) => setTime(i, ti, e.target.value)} className="bg-transparent text-[11.5px] font-semibold text-foreground outline-none" />
                    {r.times.length > 1 && <button onClick={() => delTime(i, ti)} className="text-muted-foreground"><X size={10} /></button>}
                  </span>
                ))}
                <button onClick={() => addTime(i)} className="rounded-lg bg-primary/10 px-2 py-1 text-[11px] font-semibold text-primary">+ time</button>
              </div>
              <div className="mt-2 grid grid-cols-3 gap-1.5">
                {(["off", "inapp", "wa"] as const).map((c) => (
                  <button key={c} onClick={() => upd(i, { channel: c })}
                    className={`rounded-full px-2 py-1 text-[10.5px] font-semibold ${r.channel === c ? "bg-primary text-primary-foreground" : "bg-card text-foreground/70 ring-1 ring-border/60"}`}>
                    {c === "off" ? "No reminder" : c === "inapp" ? "In-app" : "WhatsApp"}
                  </button>
                ))}
              </div>
            </div>
          ))}
        </div>
        <button onClick={() => setRows((r) => [...r, blank()])} className="w-full rounded-2xl bg-secondary px-4 py-2 text-[12.5px] font-semibold text-foreground ring-1 ring-border/60">
          + Add another medicine
        </button>
        <button onClick={save} className="w-full rounded-2xl bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground">
          Save
        </button>
      </DialogContent>
    </Dialog>
  );
}

/** Optional per-day fasting windows (some people fast longer/shorter or rest on certain days). */
function PerDayWindows({ cfg, onChange }: { cfg: ReturnType<typeof loadIFConfig>; onChange: (c: ReturnType<typeof loadIFConfig>) => void }) {
  const [on, setOn] = useState(!!cfg.perDay);
  const DOW = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
  const opts: (number | null)[] = [null, 12, 14, 16];
  const perDay = cfg.perDay ?? Array(7).fill(cfg.fastHours);

  const enable = (v: boolean) => {
    setOn(v);
    onChange(saveIFConfig({ perDay: v ? [...perDay] : undefined }));
  };
  const setDay = (i: number, v: number | null) => {
    const next = [...perDay]; next[i] = v;
    onChange(saveIFConfig({ perDay: next }));
  };

  return (
    <div className="rounded-2xl bg-secondary/50 p-3 ring-1 ring-border/50">
      <button onClick={() => enable(!on)} className="flex w-full items-center justify-between">
        <span className="text-[12px] font-semibold text-foreground/85">Different windows on different days?</span>
        <span className={`flex h-5 w-9 items-center rounded-full p-0.5 transition ${on ? "justify-end bg-primary" : "justify-start bg-border"}`}>
          <span className="h-4 w-4 rounded-full bg-white shadow" />
        </span>
      </button>
      {on && (
        <div className="mt-2 space-y-1">
          {DOW.map((d, i) => (
            <div key={d} className="flex items-center gap-1.5">
              <span className="w-8 text-[11px] font-bold text-foreground/70">{d}</span>
              {opts.map((v) => (
                <button key={String(v)} onClick={() => setDay(i, v)}
                  className={`flex-1 rounded-full px-1.5 py-1 text-[10.5px] font-semibold ${(perDay[i] ?? cfg.fastHours) === v || (v === null && perDay[i] === null) ? "bg-primary text-primary-foreground" : "bg-card text-foreground/70 ring-1 ring-border/60"}`}>
                  {v === null ? "Rest" : `${v}h`}
                </button>
              ))}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

/** Two IF-specific reminders: when the fast starts, and when it ends (eating opens). */
function IFReminders({ fastStart, fastHours }: { fastStart: string; fastHours: number }) {
  const [start, setStart] = useState<ReminderCfg["channel"]>("off");
  const [end, setEnd] = useState<ReminderCfg["channel"]>("off");
  useEffect(() => {
    setStart(loadReminder("fasting.start").channel);
    setEnd(loadReminder("fasting.end").channel);
  }, []);

  const eatOpens = (() => {
    const [h, m] = fastStart.split(":").map(Number);
    const d = new Date(); d.setHours(h, m, 0, 0); d.setTime(d.getTime() + fastHours * 3600000);
    return `${String(d.getHours()).padStart(2, "0")}:${String(d.getMinutes()).padStart(2, "0")}`;
  })();

  const Row = ({ label, at, val, set, keyName }: { label: string; at: string; val: ReminderCfg["channel"]; set: (c: ReminderCfg["channel"]) => void; keyName: string }) => (
    <div className="rounded-2xl bg-secondary/50 p-3 ring-1 ring-border/50">
      <p className="text-[12px] font-semibold text-foreground/85">{label} <span className="text-muted-foreground">· {at}</span></p>
      <div className="mt-1.5 grid grid-cols-3 gap-1.5">
        {(["off", "inapp", "wa"] as const).map((c) => (
          <button key={c} onClick={() => { set(c); saveReminder(keyName, { ...loadReminder(keyName), channel: c, time: at }); }}
            className={`rounded-full px-2 py-1.5 text-[11px] font-semibold ${val === c ? "bg-primary text-primary-foreground" : "bg-card text-foreground/75 ring-1 ring-border/60"}`}>
            {c === "off" ? "Off" : c === "inapp" ? "In-app" : "WhatsApp"}
          </button>
        ))}
      </div>
    </div>
  );

  return (
    <div className="space-y-2">
      <p className="flex items-center gap-1 text-[10.5px] font-bold uppercase tracking-wide text-foreground/60"><Bell size={11} /> Fasting reminders</p>
      <Row label="When my fast starts" at={fastStart} val={start} set={setStart} keyName="fasting.start" />
      <Row label="When my fast ends (eating opens)" at={eatOpens} val={end} set={setEnd} keyName="fasting.end" />
      <p className="text-[10.5px] text-muted-foreground">WhatsApp reminders activate once connected; in-app needs notifications enabled.</p>
    </div>
  );
}

function IFHistoryList() {
  const hist = useMemo(() => [...loadIFHistory()].reverse(), []);
  if (hist.length === 0) {
    return <p className="rounded-2xl bg-secondary/50 p-4 text-center text-[12.5px] text-muted-foreground">No fasts logged yet — sessions appear here when a fast completes or you end one manually.</p>;
  }
  const full = hist.filter((h) => !h.endedEarly).length;
  const avg = (hist.reduce((a, h) => a + h.actualHrs, 0) / hist.length).toFixed(1);
  return (
    <>
      <div className="flex gap-2 text-[11.5px] font-semibold">
        <span className="rounded-full bg-emerald-100 px-2.5 py-1 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300">{full}/{hist.length} completed</span>
        <span className="rounded-full bg-secondary px-2.5 py-1 text-foreground/70">avg {avg}h</span>
      </div>
      <div className="max-h-64 overflow-y-auto rounded-2xl ring-1 ring-border/60">
        {hist.map((h, i) => (
          <div key={h.date} className={`flex items-center justify-between px-3 py-2 text-[12.5px] ${i % 2 === 0 ? "bg-secondary/40" : "bg-card"}`}>
            <span className="text-muted-foreground">{new Date(h.date).toLocaleDateString(undefined, { day: "numeric", month: "short" })}</span>
            <span className="font-bold text-foreground">{h.actualHrs}h / {h.plannedHrs}h</span>
            <span className={`text-[10.5px] font-semibold ${h.endedEarly ? "text-amber-600" : "text-emerald-600"}`}>
              {h.endedEarly ? "ended early" : "completed ✓"}
            </span>
          </div>
        ))}
      </div>
    </>
  );
}

/* ================= Pause & travel mode ================= */

function PauseControl() {
  const navigate = useNavigate();
  const [pause, setPause] = useState<PauseState | null>(null);
  const [open, setOpen] = useState(false);
  const [reason, setReason] = useState<PauseState["reason"] | null>(null);
  const [from, setFrom] = useState(todayISO());
  const [until, setUntil] = useState("");

  useEffect(() => { setPause(loadPause()); }, []);
  const active = pauseActiveNow(pause);
  const scheduled = pause?.active && pause.from > todayISO();

  const reset = () => { setReason(null); setFrom(todayISO()); setUntil(""); };

  // UNWELL: no dates. Pause current plan, Ayu builds a recovery plan (empty until bot fills).
  const startRecovery = () => {
    savePause({ active: true, reason: "sick", from: todayISO() });
    saveVacationPlan({ createdAt: Date.now(), reason: "sick", items: [] }); // bot fills it
    setPause(loadPause());
    setOpen(false); reset();
    toast.success("Current plan paused. Let's build your recovery plan 🌿");
    navigate({ to: "/coach" });
  };

  // TRAVEL: date range + a light plan (prewritten, Ayu can tailor).
  const startTravel = (withPlan: boolean) => {
    savePause({ active: true, reason: "travel", from, until: until || undefined });
    if (withPlan) saveVacationPlan({ createdAt: Date.now(), reason: "travel", items: defaultVacationItems("travel") });
    setPause(loadPause());
    setOpen(false); reset();
    toast.success(from > todayISO() ? `Vacation pause scheduled from ${from} ✓` : "Travel mode on — notifications paused ✈️");
  };

  const resume = () => { clearPause(); setPause(null); toast.success("Welcome back — plans resumed 🌿"); };

  if (active || scheduled) {
    const isSick = pause!.reason === "sick";
    return (
      <div className="mt-4 rounded-3xl bg-amber-50 p-4 ring-1 ring-amber-200 dark:bg-amber-950/25 dark:ring-amber-900">
        <p className="text-[13px] font-bold text-amber-800 dark:text-amber-300">
          {isSick ? "🤒 Recovery mode — regular plan on hold" : `✈️ Travel mode ${scheduled ? `from ${pause!.from}` : "on"}${pause!.until ? ` · until ${pause!.until}` : ""}`}
        </p>
        <p className="mt-0.5 text-[11.5px] text-amber-700/80 dark:text-amber-400/80">
          {isSick ? "Progress paused. Your recovery plan shows below." : "Notifications paused. A lighter plan shows below."}
        </p>
        <div className="mt-2.5 flex items-center gap-2">
          <button onClick={resume} className="flex items-center gap-1 rounded-full bg-amber-600 px-4 py-2 text-[12px] font-bold text-white">
            <PlayCircle size={13} /> {isSick ? "I'm fit — restore my plan" : "End travel — resume plan"}
          </button>
          <Link to="/coach" className="rounded-full bg-white/70 px-3 py-2 text-[11.5px] font-semibold text-amber-800 ring-1 ring-amber-200 dark:bg-amber-900/40 dark:text-amber-200">
            {isSick ? "Chat with Ayu" : "Ask Ayu to tailor"}
          </Link>
        </div>
      </div>
    );
  }

  return (
    <>
      <button
        onClick={() => { reset(); setOpen(true); }}
        className="mt-4 flex w-full items-center gap-3 rounded-3xl p-3.5 text-left text-primary-foreground shadow-[var(--shadow-tile)] active:scale-[0.99]"
        style={{ background: "var(--gradient-night)" }}
      >
        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-white/15">
          <PauseCircle size={20} />
        </span>
        <span className="flex-1">
          <span className="text-[13.5px] font-semibold">Unwell or travelling away?</span>
          <span className="mt-0.5 block text-[11.5px] opacity-90">Pause your current plan & get a customised one.</span>
        </span>
        <ChevronRight size={16} className="shrink-0 opacity-90" />
      </button>

      <Dialog open={open} onOpenChange={(v) => { setOpen(v); if (!v) reset(); }}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle className="font-display">Pause &amp; customise</DialogTitle>
            <DialogDescription>What's happening? We'll adjust accordingly.</DialogDescription>
          </DialogHeader>

          {/* step 1 — choose */}
          {reason === null && (
            <div className="grid grid-cols-2 gap-2">
              <button onClick={() => setReason("sick")} className="rounded-2xl bg-secondary/60 p-4 text-center ring-1 ring-border/60 active:scale-[0.98]">
                <span className="text-2xl">🤒</span>
                <p className="mt-1 text-[13px] font-bold text-foreground">I'm unwell</p>
                <p className="text-[10.5px] text-muted-foreground">Recovery plan by Ayu</p>
              </button>
              <button onClick={() => setReason("travel")} className="rounded-2xl bg-secondary/60 p-4 text-center ring-1 ring-border/60 active:scale-[0.98]">
                <span className="text-2xl">✈️</span>
                <p className="mt-1 text-[13px] font-bold text-foreground">Travelling away</p>
                <p className="text-[10.5px] text-muted-foreground">Pause + light plan</p>
              </button>
            </div>
          )}

          {/* UNWELL — no dates */}
          {reason === "sick" && (
            <>
              <div className="rounded-2xl bg-accent/40 p-3 ring-1 ring-border/60">
                <p className="text-[12.5px] font-semibold text-foreground/90">We'll put your current plan on hold and Ayu will build a recovery plan just for now — light food, rest, gentle support.</p>
                <p className="mt-1 text-[11px] text-muted-foreground">No dates needed. When you feel fit, one tap restores your old plan.</p>
              </div>
              <button onClick={startRecovery} className="flex w-full items-center justify-center gap-2 rounded-2xl bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground">
                <Bot size={15} /> Pause &amp; build my recovery plan
              </button>
              <button onClick={() => setReason(null)} className="text-[11.5px] font-semibold text-muted-foreground">← back</button>
            </>
          )}

          {/* TRAVEL — dates + light plan */}
          {reason === "travel" && (
            <>
              <div className="flex items-center gap-2 text-[11px] font-semibold text-foreground/70">
                <span>From</span>
                <input type="date" value={from} min={todayISO()} onChange={(e) => setFrom(e.target.value)}
                  className="flex-1 rounded-xl bg-secondary px-2 py-1.5 text-[12px] font-semibold text-foreground outline-none ring-1 ring-border/60" />
                <span>until</span>
                <input type="date" value={until} min={from} onChange={(e) => setUntil(e.target.value)}
                  className="flex-1 rounded-xl bg-secondary px-2 py-1.5 text-[12px] font-semibold text-foreground outline-none ring-1 ring-border/60" />
              </div>
              <p className="text-[10.5px] text-muted-foreground">We'll pause reminders for these days and auto-resume when you're back.</p>

              <div className="rounded-2xl bg-secondary/40 p-3 ring-1 ring-border/60">
                <p className="text-[11.5px] font-bold text-foreground/80">A light travel plan (Ayu can tailor):</p>
                <ul className="mt-1 space-y-0.5">
                  {defaultVacationItems("travel").map((t) => (
                    <li key={t.label} className="text-[11.5px] text-foreground/75">{t.emoji} {t.label}</li>
                  ))}
                </ul>
              </div>

              <div className="flex gap-2">
                <button onClick={() => startTravel(true)} className="flex-1 rounded-2xl bg-primary px-3 py-2.5 text-[12.5px] font-semibold text-primary-foreground">
                  Pause + use light plan
                </button>
                <button onClick={() => startTravel(false)} className="flex-1 rounded-2xl bg-secondary px-3 py-2.5 text-[12.5px] font-semibold text-foreground ring-1 ring-border/60">
                  Just pause fully
                </button>
              </div>
              <button onClick={() => setReason(null)} className="text-[11.5px] font-semibold text-muted-foreground">← back</button>
            </>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}

/* ================= Progress ================= */

function ProgressCard() {
  const [view, setView] = useState<"weight" | "vitals" | "tasks" | "water">("weight");
  const [ready, setReady] = useState(false);
  useEffect(() => { setReady(true); }, []);
  if (!ready) return null;
  const tabs = [
    { id: "weight", label: "Weight", e: "⚖️" },
    { id: "vitals", label: "Vitals", e: "🩸" },
    { id: "tasks", label: "Tasks", e: "✅" },
    { id: "water", label: "Water", e: "💧" },
  ] as const;
  return (
    <section className="mt-4 surface p-4">
      <h2 className="px-1 font-display text-[15px] font-semibold">📈 Your progress</h2>
      <div className="mt-2.5 grid grid-cols-4 gap-1.5">
        {tabs.map((t) => (
          <button key={t.id} onClick={() => setView(t.id)}
            className={`rounded-full px-2 py-1.5 text-[11.5px] font-semibold ${view === t.id ? "bg-primary text-primary-foreground" : "bg-secondary text-foreground/75"}`}>
            {t.e} {t.label}
          </button>
        ))}
      </div>
      <div className="mt-3">
        {view === "weight" && <WeightProgress />}
        {view === "vitals" && <VitalsProgress />}
        {view === "tasks" && <HabitsProgress />}
        {view === "water" && <WaterProgress />}
      </div>
    </section>
  );
}

function WeightProgress() {
  const punches = loadPunches().slice(-15);
  const plan = loadWLPlan();
  if (punches.length < 2) return <EmptyProgress text="Punch your weight a few times and the trend appears here." />;
  const vals = punches.map((p) => p.weight);
  const min = Math.min(...vals) - 0.5, max = Math.max(...vals) + 0.5;
  const X = (i: number) => 6 + (i / (vals.length - 1)) * 88;
  const Y = (v: number) => 6 + (1 - (v - min) / (max - min)) * 48;
  const lost = plan ? +(plan.startWeight - plan.currentWeight).toFixed(1) : 0;
  return (
    <>
      {plan && <p className="text-[12.5px] font-semibold text-foreground/85">{lost > 0 ? `${lost} kg down since ${plan.startWeight} kg 🎉` : "The journey is young — keep punching."}</p>}
      <svg viewBox="0 0 100 60" className="mt-2 h-32 w-full rounded-2xl bg-secondary/40 ring-1 ring-border/50">
        <polyline points={vals.map((v, i) => `${X(i)},${Y(v)}`).join(" ")} fill="none" stroke="#10b981" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        {vals.map((v, i) => <circle key={i} cx={X(i)} cy={Y(v)} r="1.8" fill="#059669" />)}
        <text x="6" y="58" fontSize="4.5" fill="currentColor" opacity="0.5">{punches[0].date.slice(5)}</text>
        <text x="78" y="58" fontSize="4.5" fill="currentColor" opacity="0.5">{punches[punches.length - 1].date.slice(5)}</text>
      </svg>
    </>
  );
}

function VitalsProgress() {
  const sugar = loadVitals().filter((v) => v.kind === "sugar").slice(-10);
  const bp = loadVitals().filter((v) => v.kind === "bp").slice(-10);
  if (sugar.length + bp.length === 0) return <EmptyProgress text="Punch sugar or BP readings and their trends appear here." />;

  const Bars = ({ items, valOf, max, unit }: { items: VitalsEntry[]; valOf: (v: VitalsEntry) => number; max: number; unit: string }) => (
    <div className="mt-2 flex h-24 items-end gap-1.5">
      {items.map((v, i) => (
        <div key={i} className="flex h-full flex-1 flex-col items-center justify-end gap-1">
          <span className="text-[8.5px] font-bold text-foreground/60">{valOf(v)}</span>
          <span className="w-full rounded-t-md" style={{ height: `${Math.max(6, Math.min(100, (valOf(v) / max) * 100))}%`, background: BAND_META[vitalBand(v)].dot }} title={`${valOf(v)} ${unit} · ${v.date}`} />
        </div>
      ))}
    </div>
  );

  return (
    <div className="space-y-2.5">
      {sugar.length > 0 && (
        <div className="rounded-2xl bg-secondary/40 p-3 ring-1 ring-border/50">
          <p className="text-[11px] font-bold text-foreground/70">🩸 Sugar — last {sugar.length}</p>
          <Bars items={sugar} valOf={(v) => v.sugar!} max={250} unit="mg/dL" />
        </div>
      )}
      {bp.length > 0 && (
        <div className="rounded-2xl bg-secondary/40 p-3 ring-1 ring-border/50">
          <p className="text-[11px] font-bold text-foreground/70">❤️ BP (systolic) — last {bp.length}</p>
          <Bars items={bp} valOf={(v) => v.sys!} max={200} unit="mmHg" />
        </div>
      )}
    </div>
  );
}

function HabitsProgress() {
  const all = loadAllTasksDone();
  const days: { label: string; count: number }[] = [];
  for (let i = 6; i >= 0; i--) {
    const d = new Date(); d.setDate(d.getDate() - i);
    const key = d.toISOString().slice(0, 10);
    const dayDone = all[key] ?? {};
    days.push({ label: d.toLocaleDateString(undefined, { weekday: "short" }).slice(0, 2), count: Object.values(dayDone).filter(Boolean).length });
  }
  const max = Math.max(1, ...days.map((d) => d.count));
  const activeDays = days.filter((d) => d.count > 0).length;
  if (activeDays === 0) return <EmptyProgress text="Tick off tasks in Today's Tasks — this shows how many you completed each day this week." />;
  return (
    <>
      <p className="text-[12.5px] font-semibold text-foreground/85">Tasks completed each day · {activeDays}/7 active days {activeDays >= 5 ? "🔥" : ""}</p>
      <div className="mt-2 flex items-end gap-2 rounded-2xl bg-secondary/40 p-3 ring-1 ring-border/50">
        {days.map((d, i) => (
          <div key={i} className="flex flex-1 flex-col items-center gap-1">
            <span className="text-[9.5px] font-bold text-foreground/70">{d.count || ""}</span>
            <span className="w-full rounded-t-md bg-emerald-500/80" style={{ height: `${(d.count / max) * 44 + (d.count ? 6 : 2)}px` }} />
            <span className="text-[9.5px] font-semibold text-muted-foreground">{d.label}</span>
          </div>
        ))}
      </div>
    </>
  );
}

function WaterProgress() {
  const all = loadDays();
  const target = loadTargets().waterGlasses;
  const days: { label: string; v: number }[] = [];
  for (let i = 6; i >= 0; i--) {
    const d = new Date(); d.setDate(d.getDate() - i);
    const key = d.toISOString().slice(0, 10);
    days.push({ label: d.toLocaleDateString(undefined, { weekday: "short" }).slice(0, 2), v: all[key]?.water ?? 0 });
  }
  if (days.every((d) => d.v === 0)) return <EmptyProgress text="Punch water glasses and your hydration week shows here." />;
  return (
    <>
      <p className="text-[12.5px] font-semibold text-foreground/85">Glasses per day · target {target}</p>
      <div className="mt-2 flex items-end gap-2 rounded-2xl bg-secondary/40 p-3 ring-1 ring-border/50">
        {days.map((d, i) => (
          <div key={i} className="flex flex-1 flex-col items-center gap-1">
            <span className="text-[10px] font-bold text-sky-600 dark:text-sky-400">{d.v ? `💧${d.v}` : ""}</span>
            <span className={`w-full rounded-t-md ${d.v >= target ? "bg-sky-500" : "bg-sky-300/70"}`} style={{ height: `${Math.min(52, (d.v / target) * 44 + (d.v ? 6 : 2))}px` }} />
            <span className="text-[9.5px] font-semibold text-muted-foreground">{d.label}</span>
          </div>
        ))}
      </div>
    </>
  );
}

function EmptyProgress({ text }: { text: string }) {
  return <p className="rounded-2xl bg-secondary/50 p-4 text-center text-[12px] text-muted-foreground">{text}</p>;
}

/* ================= Today's Tasks ================= */

interface TodayTask {
  id: string;
  emoji: string;
  label: string;
  sub?: string;
  time?: string;
  to?: string;       // edit/open destination
  play?: string;     // practice destination (yoga, exercise)
  met?: number;      // for computing cal-out from actual minutes done
  defaultMins?: number;
  energyKcal?: number; // display estimate
  swapSlot?: string; // meal rows: which slot this is, for swapping
  custom?: boolean;
}

function TodayTasks({ weightKg }: { weightKg: number }) {
  const tick = useAyuTick();
  const [ready, setReady] = useState(false);
  const [wl, setWl] = useState<WLPlan | null>(null);
  const [dz, setDz] = useState<ReturnType<typeof loadAllDiseasePlans>>([]);
  const [customs, setCustoms] = useState<CustomTask[]>([]);
  const [newTask, setNewTask] = useState("");
  const [addOpen, setAddOpen] = useState(false);

  const [paused, setPaused] = useState(false);
  const [vac, setVac] = useState<VacationPlan | null>(null);

  useEffect(() => {
    setWl(loadWLPlan());
    setDz(loadAllDiseasePlans());
    setPaused(pauseActiveNow());
    setVac(loadVacationPlan());
    setReady(true);
  }, []);

  // tick-sensitive: re-read live on any tracker change
  const done = useMemo(() => loadTasksDone(), [tick]);
  const calIn = useMemo(() => calInTotal(), [tick]);
  useEffect(() => { setCustoms(loadCustomTasks()); }, [tick]);

  const tasks: TodayTask[] = [];
  if (wl?.includeYoga) {
    tasks.push({ id: "yoga", emoji: "🧘", label: "Yoga session · 25 min", sub: `≈ ${kcalFor(3, 25, weightKg)} kcal · practise here, or tick if done offline`, to: "/section/yoga", play: "/section/yoga", met: 3, defaultMins: 25, energyKcal: kcalFor(3, 25, weightKg) });
  }
  if (wl?.includeExercise) {
    tasks.push({ id: "exercise", emoji: "🏋️", label: "Exercise session · 30 min", sub: `≈ ${kcalFor(5, 30, weightKg)} kcal · practise here, or tick if done offline`, to: "/section/exercise", play: "/section/exercise", met: 5, defaultMins: 30, energyKcal: kcalFor(5, 30, weightKg) });
  }
  if (wl?.includeDetox) {
    tasks.push({ id: "detox", emoji: "🌿", label: "Detox ritual", sub: "Triphala at night · oil pulling AM — tap ✏️ to see the plan", to: "/section/detox" });
  }

  for (const p of dz) {
    const t0 = diseaseTasks(p)[0];
    if (t0) tasks.push({ id: `dz-${p.slug}`, emoji: "🩺", label: `${p.name} — ${t0.label}`, sub: t0.items[0], to: `/disease/${p.slug}` });
  }

  for (const c of customs) tasks.push({ id: c.id, emoji: "✅", label: c.label, custom: true });

  const doneCount = tasks.filter((t) => done[t.id]).length;

  const [minsTask, setMinsTask] = useState<TodayTask | null>(null);
  const [minsVal, setMinsVal] = useState("");

  // checkbox click
  const toggle = (t: TodayTask) => {
    const nowDone = !done[t.id];
    if (nowDone && t.met) {
      // ask how long it actually took, then compute the real burn
      setMinsVal(String(t.defaultMins ?? 20));
      setMinsTask(t);
      return;
    }
    setTaskDone(t.id, nowDone);
    // untick → remove the linked cal-out entry (matched by src, robust across reloads)
    if (!nowDone && t.met) {
      const linked = calEntryForSrc(t.id);
      if (linked) deleteCalEntry(linked.id);
      toast("Removed from cal-out too");
    }
  };

  const confirmMins = () => {
    if (!minsTask) return;
    const mins = parseInt(minsVal, 10) || minsTask.defaultMins || 20;
    const kcal = kcalFor(minsTask.met!, mins, weightKg);
    setTaskDone(minsTask.id, true);
    addCalEntry({ kind: "out", label: `${minsTask.label.split(" ·")[0]} ${mins} min`, kcal, src: minsTask.id });
    toast.success(`Done! ${mins} min · ${kcal} kcal added to cal-out 🔥`);
    setMinsTask(null);
  };

  const practise = (t: TodayTask) => {
    toast(`Opening your ${t.id} plan to practise…`);
  };

  const addTask = () => {
    const label = newTask.trim();
    if (!label) return;
    setCustoms(addCustomTask(label));
    setNewTask("");
    toast.success("Task added ✓");
  };

  if (!ready) return null;

  if (paused) {
    const isSick = vac?.reason === "sick";
    return (
      <section className="mt-4 rounded-3xl bg-card p-5 ring-1 ring-border/60">
        {vac && vac.items.length > 0 ? (
          <>
            <p className="text-[14px] font-semibold text-foreground">{isSick ? "🌿 Your recovery plan" : "✈️ Your travel plan"}</p>
            <p className="mt-0.5 text-[11.5px] text-muted-foreground">Lighter tasks while your regular plan rests.</p>
            <ul className="mt-3 space-y-1.5">
              {vac.items.map((it, i) => (
                <li key={i} className="flex items-center gap-2.5 rounded-2xl bg-secondary/50 px-3 py-2 text-[12.5px] text-foreground/85">
                  <span className="text-base">{it.emoji}</span> {it.label}
                </li>
              ))}
            </ul>
            <Link to="/coach" className="mt-3 flex items-center justify-center gap-2 rounded-2xl bg-secondary px-4 py-2 text-[12px] font-semibold text-foreground">
              <Bot size={14} className="text-primary" /> Ask Ayu to tailor this
            </Link>
          </>
        ) : vac && isSick ? (
          <div className="text-center">
            <p className="text-[14px] font-semibold text-foreground">🌿 Recovery mode</p>
            <p className="mt-1 text-[12px] text-muted-foreground">Your regular plan is on hold. Let Ayu build a recovery plan for how you're feeling.</p>
            <Link to="/coach" className="mt-3 inline-flex items-center gap-2 rounded-2xl bg-primary px-4 py-2.5 text-[12.5px] font-semibold text-primary-foreground">
              <Bot size={15} /> Build my recovery plan
            </Link>
          </div>
        ) : (
          <div className="text-center">
            <p className="text-[14px] font-semibold text-foreground">⏸ Tasks are on pause</p>
            <p className="mt-1 text-[12px] text-muted-foreground">No tracking, no guilt. Resume from the banner up top whenever you're ready.</p>
          </div>
        )}
      </section>
    );
  }

  return (
    <section className="mt-4">
      <div className="flex items-center justify-between px-1">
        <h2 className="font-display text-lg font-semibold">Today's tasks</h2>
        {tasks.length > 0 && (
          <span className={`rounded-full px-2.5 py-1 text-[11px] font-bold ${doneCount === tasks.length ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300" : "bg-secondary text-foreground/70"}`}>
            {doneCount}/{tasks.length} done{doneCount === tasks.length ? " 🎉" : ""}
          </span>
        )}
      </div>

      {/* daily calorie line — plan target vs punched */}
      {wl && (
        <div className="mt-3 flex items-center gap-3 rounded-2xl bg-accent/40 px-3.5 py-2.5 ring-1 ring-border/60">
          <span className="text-lg">🔥</span>
          <p className="flex-1 text-[12.5px] font-medium text-foreground/85">
            Eat about <b>{wl.dailyCalories} kcal</b> today · eaten <b>{calIn}</b> so far
          </p>
        </div>
      )}

      <ul className="mt-3 space-y-2">
        {tasks.map((t) => {
          const isDone = !!done[t.id];
          return (
            <li key={t.id} className="flex items-center gap-3 surface p-3.5">
              <button
                onClick={() => toggle(t)}
                className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full ring-2 transition ${
                  isDone ? "bg-emerald-500 text-white ring-emerald-500" : "bg-card text-transparent ring-border"
                }`}
              >
                <Check size={14} strokeWidth={3} />
              </button>
              <div className="min-w-0 flex-1">
                <p className={`truncate text-[13.5px] font-semibold ${isDone ? "text-muted-foreground line-through" : "text-foreground"}`}>
                  {t.emoji} {t.label}
                </p>
                {(t.sub || t.time) && (
                  <p className="truncate text-[11.5px] text-muted-foreground">
                    {[t.time, t.sub].filter(Boolean).join(" · ")}
                  </p>
                )}
              </div>
              {t.play && !isDone && (
                <Link to={t.play} onClick={() => practise(t)} className="flex items-center gap-1 rounded-full bg-primary px-2.5 py-1.5 text-[11px] font-bold text-primary-foreground" title="Practise now">
                  <Play size={11} /> Practise
                </Link>
              )}
              {t.custom ? (
                <button onClick={() => setCustoms(deleteCustomTask(t.id))} className="rounded-full p-1.5 text-muted-foreground hover:text-rose-500">
                  <Trash2 size={13} />
                </button>
              ) : t.to ? (
                <Link to={t.to} className="rounded-full bg-secondary p-2 text-foreground/70" title="See / edit plan">
                  <Pencil size={13} />
                </Link>
              ) : null}
            </li>
          );
        })}
      </ul>

      {tasks.length === 0 && (
        <div className="mt-3 rounded-3xl bg-card p-5 text-center ring-1 ring-border/60">
          <p className="text-[13.5px] font-semibold text-foreground">No tasks yet — plans create them.</p>
          <p className="mt-1 text-[12px] text-muted-foreground">Build a weight-loss, diet or condition plan and your day fills itself in here.</p>
          <div className="mt-3 flex justify-center gap-2">
            <Link to="/section/weight-loss" className="rounded-full bg-primary px-3.5 py-2 text-[12px] font-semibold text-primary-foreground">Weight loss</Link>
            <Link to="/section/disease" className="rounded-full bg-secondary px-3.5 py-2 text-[12px] font-semibold text-foreground">Heal</Link>
          </div>
        </div>
      )}

      {/* add your own checklist item — click reveals a clearly-labelled input */}
      {!addOpen ? (
        <button
          onClick={() => setAddOpen(true)}
          className="mt-2.5 flex w-full items-center justify-center gap-2 rounded-2xl bg-secondary/60 px-4 py-2.5 text-[12.5px] font-semibold text-foreground/75 ring-1 ring-border/60"
        >
          <Plus size={15} /> Add your own task
        </button>
      ) : (
        <div className="mt-2.5">
          <p className="mb-1 px-1 text-[11px] font-semibold text-foreground/70">Type your task and press add:</p>
          <div className="flex items-center gap-2">
            <input
              autoFocus
              value={newTask}
              onChange={(e) => setNewTask(e.target.value)}
              onKeyDown={(e) => { if (e.key === "Enter") { addTask(); } }}
              placeholder="e.g. Oil pulling · 10-min walk after lunch"
              className="w-full rounded-2xl bg-card px-3.5 py-2.5 text-[12.5px] text-foreground outline-none ring-1 ring-border/60 placeholder:text-muted-foreground focus:ring-primary"
            />
            <button onClick={addTask} className="shrink-0 rounded-2xl bg-primary px-4 py-2.5 text-[12.5px] font-semibold text-primary-foreground">Add</button>
          </div>
        </div>
      )}

      {/* how long did you practise? — computes the real cal-out */}
      <Dialog open={minsTask !== null} onOpenChange={(v) => { if (!v) setMinsTask(null); }}>
        <DialogContent className="max-w-xs">
          {minsTask && (
            <>
              <DialogHeader>
                <DialogTitle className="font-display">{minsTask.emoji} How long did you do?</DialogTitle>
                <DialogDescription>We'll add the exact energy burnt to your cal-out.</DialogDescription>
              </DialogHeader>
              <div className="flex items-center justify-between gap-2">
                <div className="flex flex-wrap gap-1.5">
                  {[10, 15, 20, 30, 45].map((m) => (
                    <button key={m} onClick={() => setMinsVal(String(m))}
                      className={`rounded-full px-3 py-1.5 text-[12px] font-semibold ${minsVal === String(m) ? "bg-primary text-primary-foreground" : "bg-secondary text-foreground/75"}`}>
                      {m}m
                    </button>
                  ))}
                </div>
              </div>
              <div className="flex items-center gap-2">
                <input type="number" inputMode="numeric" value={minsVal} onChange={(e) => setMinsVal(e.target.value)}
                  className="w-full rounded-2xl bg-secondary px-3 py-2.5 text-lg font-semibold text-foreground outline-none ring-1 ring-border/60 focus:ring-primary" />
                <span className="text-sm text-muted-foreground">min · ≈ {kcalFor(minsTask.met!, parseInt(minsVal, 10) || 0, weightKg)} kcal</span>
              </div>
              <button onClick={confirmMins} className="w-full rounded-2xl bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground">
                Mark done
              </button>
            </>
          )}
        </DialogContent>
      </Dialog>
    </section>
  );
}

/* ================= existing cards ================= */

function DiseasePlanCard() {
  const [plans, setPlans] = useState<ReturnType<typeof loadAllDiseasePlans>>([]);
  const [openSlug, setOpenSlug] = useState<string | null>(null);

  useEffect(() => { setPlans(loadAllDiseasePlans()); }, []);
  if (plans.length === 0) return null;

  return (
    <section className="mt-4 surface p-5">
      <h2 className="flex items-center gap-2 font-display text-base font-semibold">
        <Stethoscope size={16} className="text-primary" /> My condition plans
      </h2>
      <div className="mt-3 grid gap-2">
        {plans.map((p) => {
          const disease = getDisease(p.slug);
          const tasks = diseaseTasks(p);
          const isOpen = openSlug === p.slug;
          return (
            <div key={p.slug} className="overflow-hidden rounded-2xl bg-secondary/40 ring-1 ring-border/60">
              <button
                onClick={() => setOpenSlug(isOpen ? null : p.slug)}
                className="flex w-full items-center justify-between gap-2 px-3 py-2.5 text-left"
              >
                <div className="flex items-center gap-2">
                  <span className="text-sm font-semibold text-foreground">{disease?.name ?? p.name}</span>
                  <span className="rounded-full bg-primary/15 px-2 py-0.5 text-[10px] font-semibold text-primary">
                    {p.track === "prevent" ? "Prevent" : "Manage"}
                  </span>
                </div>
                <ChevronDown size={16} className={`text-muted-foreground transition-transform ${isOpen ? "rotate-180" : ""}`} />
              </button>
              {isOpen && (
                <div className="grid gap-2 border-t border-border/60 bg-card/60 p-3">
                  {tasks.map((t) => (
                    <div key={t.tool} className="rounded-xl bg-card p-3 ring-1 ring-border/60">
                      <p className="text-[12px] font-semibold text-foreground">{t.label}</p>
                      <ul className="mt-1.5 grid gap-1">
                        {t.items.slice(0, 4).map((it) => (
                          <li key={it} className="flex items-start gap-1.5 text-[12px] text-foreground/85">
                            <Check size={12} className="mt-0.5 shrink-0 text-primary" /> {it}
                          </li>
                        ))}
                      </ul>
                    </div>
                  ))}
                  <Link
                    to="/disease/$slug"
                    params={{ slug: p.slug }}
                    className="flex items-center justify-center gap-1 rounded-xl bg-primary/10 py-2 text-[12px] font-semibold text-primary"
                  >
                    Open full plan <ChevronRight size={13} />
                  </Link>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </section>
  );
}

interface DayMeal { slot: string; time: string; items: string[] }
interface WeeklyDay { day: string; isIF: boolean; window?: string; meals: DayMeal[] }
interface WeeklyPlan { dosha?: string; ritu?: string; days: WeeklyDay[]; createdAt?: number }

const labelForOffset = (off: number) => {
  const d = new Date(); d.setDate(d.getDate() + off);
  return ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"][(d.getDay() + 6) % 7];
};

function TodayDietCard() {
  const tick = useAyuTick();
  const [plan, setPlan] = useState<WeeklyPlan | null>(null);
  const [nextOpen, setNextOpen] = useState(false);

  useEffect(() => {
    try { const raw = localStorage.getItem("ayuraise.dietPlan"); if (raw) setPlan(JSON.parse(raw)); } catch {}
  }, []);

  const overrides = useMemo(() => loadMealOverrides(), [tick]);

  const todayLabel = labelForOffset(0);
  const day = plan?.days.find((d) => d.day === todayLabel);
  const nextLabel = labelForOffset(1);
  const nextDay = plan?.days.find((d) => d.day === nextLabel);

  if (!plan?.days?.length || !day) {
    return (
      <Link to="/section/diet" className="tile mt-4 flex items-center gap-3 rounded-3xl bg-card p-4 ring-1 ring-border/60">
        <span className="flex h-11 w-11 items-center justify-center rounded-2xl text-primary-foreground" style={{ background: "var(--gradient-sage)" }}>
          <Salad size={20} />
        </span>
        <span className="flex-1">
          <span className="text-[13.5px] font-semibold text-foreground">Build your diet plan</span>
          <span className="mt-0.5 block text-[12px] text-muted-foreground">Get a weekly meal plan — then see today's meals here.</span>
        </span>
        <ChevronRight size={16} className="text-muted-foreground" />
      </Link>
    );
  }

  const mealText = (m: DayMeal) => overrides[m.slot] ?? m.items.join(", ");

  return (
    <section className="mt-4 surface p-4">
      <div className="flex items-center justify-between">
        <h2 className="flex items-center gap-2 font-display text-[15px] font-semibold">
          <Salad size={16} className="text-primary" /> Today's diet
        </h2>
        <Link to="/section/diet" className="flex items-center gap-1 rounded-full bg-secondary px-2.5 py-1.5 text-[11px] font-semibold text-foreground/75">
          <Pencil size={11} /> Edit plan
        </Link>
      </div>
      <div className="mt-2.5 divide-y divide-border/50">
        {day.meals.map((m) => (
          <div key={m.slot} className="flex items-baseline gap-2 py-1.5">
            <span className="w-20 shrink-0 text-[11.5px] font-bold text-foreground/80">{m.slot}</span>
            <span className="min-w-0 flex-1 truncate text-[12px] text-foreground/75">{mealText(m)}</span>
            {m.time && <span className="shrink-0 text-[10px] font-semibold text-primary">{m.time}</span>}
          </div>
        ))}
      </div>

      <div className="mt-2.5 flex gap-2">
        <button onClick={() => setNextOpen(true)} className="flex-1 rounded-2xl bg-secondary px-3 py-2 text-[12px] font-semibold text-foreground ring-1 ring-border/60">
          👀 Tomorrow
        </button>
        <Link to="/section/diet" className="flex-1 rounded-2xl bg-secondary px-3 py-2 text-center text-[12px] font-semibold text-foreground ring-1 ring-border/60">
          Open whole plan →
        </Link>
      </div>

      {/* tomorrow peek */}
      <Dialog open={nextOpen} onOpenChange={setNextOpen}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle className="font-display">👀 Tomorrow · {nextLabel}</DialogTitle>
            <DialogDescription>A peek at what's planned next.</DialogDescription>
          </DialogHeader>
          {nextDay ? (
            <div className="space-y-2">
              {nextDay.meals.map((m) => (
                <div key={m.slot} className="rounded-2xl bg-secondary/40 p-3 ring-1 ring-border/50">
                  <p className="flex items-center gap-2 text-[12.5px] font-bold text-foreground">{m.slot} {m.time && <span className="text-[10.5px] font-semibold text-primary">{m.time}</span>}</p>
                  <p className="text-[12px] text-foreground/80">{m.items.join(", ")}</p>
                </div>
              ))}
            </div>
          ) : (
            <p className="rounded-2xl bg-secondary/50 p-4 text-center text-[12px] text-muted-foreground">No plan for tomorrow yet.</p>
          )}
        </DialogContent>
      </Dialog>
    </section>
  );
}
