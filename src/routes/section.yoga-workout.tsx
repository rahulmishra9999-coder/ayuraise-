import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import { ArrowLeft, Play, Pause, X, ChevronRight, Check, Plus, Sliders, Shuffle } from "lucide-react";
import { BottomNav } from "@/components/BottomNav";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { loadProfile } from "@/lib/weight-loss";
import {
  getProgram, startProgram, customizeProgram, toggleProgDay, editProgDay, readjustAfter, addProgWeek,
  weekUnlocked, canAddWeek, isProgDayDone, weekDoneCount, getSession, sessionKcal, bucketOf, stepsOf,
  sessionsIn, bucketsInGroup, PLAN_LIBRARY,
  OBJECTIVES, PROBLEMS, LEVELS, EQUIP_ALL, STYLE_CHOICES, focusChoicesFor, DEFAULT_WEEK_OPTIONS,
  type MyProgram, type WeekOptions, type Session, type Focus, type Level, type Equip, type Bucket,
} from "@/lib/exercise";
import { STYLES, programsOf, programMinutes, styleKcal, type StyleId, type StyleProgram } from "@/lib/yoga-styles";
import { POSES, type YogaPlan } from "@/lib/yoga";
import {
  ASANAS, PRANAYAMAS, BANDHAS, buildBundleSession, techniqueSession, yogaKcal,
  YOGA_LEARN, YOGA_ABOUT, type Technique,
} from "@/lib/yoga-library";

/** Mudras derived from the yoga library (gestures — practised as short holds). */
const MUDRAS: Technique[] = (YOGA_ABOUT.find((g) => g.id === "mudras")?.items ?? []).map((m, i) => ({ id: `mudra-${i}`, name: m.name, emoji: "🤲", note: m.note }));

export const Route = createFileRoute("/section/yoga-workout")({
  head: () => ({
    meta: [
      { title: "Yoga & Workout · AyuRaise" },
      { name: "description", content: "A combined view of yoga and workouts — one program builder plus separate yoga and exercise libraries." },
    ],
  }),
  component: YogaWorkoutPage,
});

function bodyWeight() { return loadProfile()?.weightKg ?? 65; }
function fmt(sec: number) { return `${Math.floor(sec / 60)}:${String(Math.round(sec) % 60).padStart(2, "0")}`; }

/* ---- ready-made plans: yoga-only / workout-only / mix ---- */
type PlanKind = "yoga" | "workout" | "mix";
type ReadyPlan = { id: string; name: string; weeks: number; emoji: string; kind: PlanKind; options: WeekOptions };
const merge = (o: Partial<WeekOptions>): WeekOptions => ({ ...DEFAULT_WEEK_OPTIONS, ...o });
const YOGA_READY: ReadyPlan[] = [
  { id: "yw-flow", name: "Daily Yoga Flow", weeks: 4, emoji: "🧘", kind: "yoga", options: merge({ styles: ["yoga"] }) },
  { id: "yw-hatha", name: "Hatha Yoga", weeks: 4, emoji: "🧘", kind: "yoga", options: merge({ styles: ["yoga"], objective: "general" }) },
  { id: "yw-strength", name: "Strength Yoga", weeks: 4, emoji: "🧘‍♀️", kind: "yoga", options: merge({ styles: ["yoga"], objective: "strength" }) },
  { id: "yw-power", name: "Power Yoga", weeks: 4, emoji: "🔥", kind: "yoga", options: merge({ styles: ["yoga"], objective: "tone" }) },
  { id: "yw-flex", name: "Yoga for Flexibility", weeks: 3, emoji: "🤸", kind: "yoga", options: merge({ styles: ["yoga", "stretching"], objective: "flexibility" }) },
  { id: "yw-yin", name: "Yin & Restore", weeks: 3, emoji: "🍃", kind: "yoga", options: merge({ styles: ["yoga", "somatic", "stretching"], objective: "flexibility" }) },
  { id: "yw-calm", name: "Calm & Restore", weeks: 2, emoji: "🌙", kind: "yoga", options: merge({ styles: ["yoga", "somatic"], objective: "stress-relief" }) },
];
const MIX_READY: ReadyPlan[] = [
  { id: "yw-mix-strength", name: "Yoga + Strength", weeks: 4, emoji: "🧘💪", kind: "mix", options: merge({ styles: ["yoga", "calisthenics", "gym"], objective: "strength" }) },
  { id: "yw-mix-burn", name: "Flow & Burn", weeks: 4, emoji: "🧘🔥", kind: "mix", options: merge({ styles: ["yoga", "hiit", "cardio"], objective: "lose-weight" }) },
  { id: "yw-mix-calm", name: "Calm Cardio + Yoga", weeks: 3, emoji: "🧘🚶", kind: "mix", options: merge({ styles: ["yoga", "walking", "stretching"], objective: "general" }) },
  { id: "yw-mix-tone", name: "Pilates + Yoga Sculpt", weeks: 4, emoji: "🧘🩰", kind: "mix", options: merge({ styles: ["yoga", "pilates"], objective: "tone" }) },
];
const EX_READY: ReadyPlan[] = PLAN_LIBRARY.map((p) => ({ id: p.id, name: p.name, weeks: p.weeks, emoji: p.emoji, kind: "workout" as PlanKind, options: merge(p.options) }));
const READY_PLANS: ReadyPlan[] = [...YOGA_READY, ...MIX_READY, ...EX_READY];
const KIND_BADGE: Record<PlanKind, string | null> = { yoga: "🧘 Yoga", mix: "🔀 Mix", workout: null };

/* generic play-source used by the compact player */
type PStep = { name: string; emoji: string; sec: number };
type PlaySrc = { title: string; steps: PStep[]; kcal: number };
function sessionPlay(s: Session): PlaySrc {
  const steps = stepsOf(s).map((st) => ({ name: st.name, emoji: st.emoji, sec: st.sec }));
  return { title: s.title, steps, kcal: sessionKcal(s, bodyWeight()) };
}
function yogaPlay(p: StyleProgram): PlaySrc {
  return { title: p.title, steps: p.poses.map((x) => ({ name: x.name, emoji: "🧘", sec: x.sec })), kcal: styleKcal(p, bodyWeight()) };
}
function yogaPlanPlay(plan: YogaPlan, title: string): PlaySrc {
  const steps = plan.poseIds
    .map((id) => POSES.find((p) => p.id === id))
    .filter((p): p is (typeof POSES)[number] => !!p)
    .map((p) => ({ name: p.name, emoji: p.emoji, sec: p.durationSec }));
  const mins = Math.max(1, Math.round(steps.reduce((a, s) => a + s.sec, 0) / 60));
  return { title, steps, kcal: yogaKcal(mins, bodyWeight()) };
}

type Tab = "practice" | "poses" | "learn";

function YogaWorkoutPage() {
  const [tab, setTab] = useState<Tab>("practice");
  const [player, setPlayer] = useState<PlaySrc | null>(null);
  const TABS: [Tab, string][] = [["practice", "🧘 Practice"], ["poses", "🤸 Poses & Bundle"], ["learn", "🎓 Learn"]];

  return (
    <div className="min-h-svh pb-28" style={{ background: "var(--gradient-hero)" }}>
      <div className="relative overflow-hidden px-4 pb-4 pt-[max(0.85rem,env(safe-area-inset-top))]" style={{ background: "var(--gradient-night)" }}>
        <div className="absolute -right-16 -top-16 h-40 w-40 rounded-full bg-emerald-400/20 blur-3xl" />
        <div className="relative flex items-center gap-2.5">
          <Link to="/home" className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-white/15 text-primary-foreground"><ArrowLeft size={15} /></Link>
          <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-2xl bg-white/15 text-xl">🧘‍♀️</span>
          <div className="min-w-0">
            <h1 className="truncate font-display text-[18px] font-extrabold leading-tight text-primary-foreground">Yoga &amp; Workout</h1>
            <p className="text-[11.5px] text-primary-foreground/80">Yoga and workouts, side by side — an experiment.</p>
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-xl px-5">
        <div className="sticky top-0 z-30 -mx-5 mb-1 bg-background/85 px-5 py-2 backdrop-blur-xl">
          <div className="flex gap-1.5 overflow-x-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
            {TABS.map(([id, label]) => (
              <button key={id} onClick={() => setTab(id)} className={`shrink-0 rounded-full px-3.5 py-1.5 text-[12.5px] font-semibold ${tab === id ? "bg-primary text-primary-foreground" : "bg-secondary text-foreground/75"}`}>{label}</button>
            ))}
          </div>
        </div>

        {tab === "practice" && <PracticeTab onPlaySrc={setPlayer} />}
        {tab === "poses" && <PosesTab onPlay={setPlayer} />}
        {tab === "learn" && <LearnTab />}
      </div>

      {player && <PlayerSheet src={player} onClose={() => setPlayer(null)} />}
      <BottomNav />
    </div>
  );
}

/* ================= Practice (create plan · plan card · ready-made · explore) ================= */

const STYLE_TILES: Bucket[] = bucketsInGroup("styles").filter((b) => !["dance", "zumba", "yoga"].includes(b.id));

function PracticeTab({ onPlaySrc }: { onPlaySrc: (src: PlaySrc) => void }) {
  const kg = bodyWeight();
  const [prog, setProg] = useState<MyProgram>(() => ({ name: "Current Fitness Plan", options: DEFAULT_WEEK_OPTIONS, weeks: [], totalWeeks: 4, done: [], onboarded: false, updatedAt: 0 }));
  const [expanded, setExpanded] = useState<number>(1);
  const [swap, setSwap] = useState<{ week: number; day: number } | null>(null);
  const [setupInit, setSetupInit] = useState<{ options: WeekOptions; weeks: number } | null>(null);
  const [planAction, setPlanAction] = useState<ReadyPlan | null>(null);
  const [readjust, setReadjust] = useState<{ week: number; day: number } | null>(null);
  const [kindFilter, setKindFilter] = useState<PlanKind | "all">("all");
  const [drill, setDrill] = useState<{ kind: "yoga" } | { kind: "style"; bucket: Bucket } | null>(null);
  useEffect(() => { setProg(getProgram()); }, []);
  const KIND_TABS: [PlanKind | "all", string][] = [["all", "✨ All"], ["yoga", "🧘 Yoga only"], ["workout", "🏋️ Workout only"], ["mix", "🔀 Mix"]];
  const readyList = READY_PLANS.filter((p) => kindFilter === "all" || p.kind === kindFilter);

  const openDay = (id?: string) => { if (id) { const s = getSession(id); if (s) onPlaySrc(sessionPlay(s)); } };

  if (drill?.kind === "yoga") return <YogaContent onBack={() => setDrill(null)} onPlay={onPlaySrc} />;
  if (drill?.kind === "style") return <BucketSessions bucket={drill.bucket} onBack={() => setDrill(null)} onPlay={(s) => onPlaySrc(sessionPlay(s))} />;

  return (
    <div className="pb-4">
      {!prog.onboarded ? (
        <button onClick={() => setSetupInit({ options: prog.options, weeks: prog.totalWeeks })} className="mt-3 flex w-full items-center gap-3 rounded-3xl p-4 text-left text-primary-foreground shadow-[var(--shadow-glow)]" style={{ background: "var(--gradient-violet)" }}>
          <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-white/20 text-xl">✨</span>
          <div className="min-w-0 flex-1"><p className="text-[15px] font-bold">Create my Yoga / Workout Plan</p><p className="mt-0.5 text-[11.5px] opacity-90">Answer a few questions and we'll build a plan for you.</p></div>
          <ChevronRight size={18} className="opacity-80" />
        </button>
      ) : (
      <section className="pt-3">
        <div className="flex items-center justify-between px-1">
          <h2 className="font-display text-[16px] font-bold text-foreground">{prog.name}</h2>
          <button onClick={() => setSetupInit({ options: prog.options, weeks: prog.totalWeeks })} className="flex items-center gap-1 rounded-full bg-primary px-3 py-1.5 text-[11.5px] font-bold text-primary-foreground"><Sliders size={12} /> Customize</button>
        </div>
        <p className="mt-0.5 px-1 text-[11px] leading-snug text-muted-foreground">{prog.totalWeeks}-week plan · tap ⇄ to edit any day; finish a week to unlock the next.</p>

        <div className="mt-2.5 space-y-2">
          {prog.weeks.map((wk, i) => {
            const wnum = i + 1;
            const unlocked = weekUnlocked(prog, wnum);
            const doneN = weekDoneCount(prog, wnum);
            const activeN = wk.days.filter((d) => !d.rest).length;
            const isOpen = expanded === wnum;
            return (
              <div key={wnum} className="overflow-hidden rounded-2xl bg-card ring-1 ring-border/60">
                <button onClick={() => setExpanded(isOpen ? 0 : wnum)} className="flex w-full items-center gap-3 p-3 text-left">
                  <span className={`flex h-9 w-9 shrink-0 flex-col items-center justify-center rounded-xl text-[9px] font-bold leading-none ${unlocked ? "bg-accent/60 text-foreground/70" : "bg-secondary text-muted-foreground"}`}><span className="text-[7px] opacity-70">WK</span>{wnum}</span>
                  <div className="min-w-0 flex-1">
                    <p className="text-[13.5px] font-bold text-foreground">Week {wnum}{!unlocked && " 🔒"}</p>
                    <p className="text-[11px] text-muted-foreground">{unlocked ? `${doneN}/${activeN} done` : `Unlocks after Week ${wnum - 1}`}</p>
                  </div>
                  <ChevronRight size={16} className={`text-muted-foreground transition-transform ${isOpen ? "rotate-90" : ""}`} />
                </button>
                {isOpen && (
                  <div className="space-y-1.5 border-t border-border/60 p-3">
                    {wk.days.map((d) => {
                      const s = d.sessionId ? getSession(d.sessionId) : undefined;
                      const dn = isProgDayDone(prog, wnum, d.day);
                      return (
                        <div key={d.day} className="flex items-center gap-2.5 rounded-2xl bg-secondary/40 p-2">
                          <span className={`flex h-8 w-8 shrink-0 flex-col items-center justify-center rounded-lg text-[9px] font-bold leading-none ${dn ? "bg-primary text-primary-foreground" : "bg-accent/60 text-foreground/70"}`}><span className="text-[7px] opacity-70">DAY</span>{d.day}</span>
                          <button onClick={() => openDay(d.sessionId)} disabled={!s} className="min-w-0 flex-1 text-left disabled:cursor-default">
                            <p className="truncate text-[12.5px] font-semibold text-foreground">{s ? s.title : "Rest day"}</p>
                            <p className="truncate text-[10.5px] text-muted-foreground">{s ? `${bucketOf(s.bucket)?.label} · ${s.minutes} min · 🔥 ${sessionKcal(s, kg)} kcal` : d.note}</p>
                          </button>
                          {unlocked && !d.rest && <button onClick={() => setSwap({ week: wnum, day: d.day })} title="Edit this day" className="shrink-0 rounded-full bg-secondary p-1.5 text-foreground/55"><Shuffle size={12} /></button>}
                          {s && <button onClick={() => openDay(d.sessionId)} className="shrink-0 rounded-full bg-primary/10 p-1.5 text-primary"><Play size={12} /></button>}
                          <button onClick={() => setProg((p) => toggleProgDay(p, wnum, d.day, !isProgDayDone(p, wnum, d.day)))} className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full ${dn ? "bg-emerald-500 text-white" : "bg-card text-muted-foreground ring-1 ring-border/60"}`}><Check size={11} strokeWidth={3} /></button>
                        </div>
                      );
                    })}
                    {!unlocked && <p className="px-1 pt-1 text-[10.5px] text-muted-foreground">Finish Week {wnum - 1} to edit this week.</p>}
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {canAddWeek(prog) && (
          <button onClick={() => setProg((p) => { const np = addProgWeek(p); setExpanded(np.totalWeeks); return np; })} className="mt-2 flex w-full items-center justify-center gap-1.5 rounded-2xl bg-primary/10 px-4 py-2.5 text-[12.5px] font-bold text-primary">
            ➕ Add Week {prog.totalWeeks + 1}
          </button>
        )}
      </section>
      )}

      <section className="pt-6">
        <h2 className="px-1 font-display text-[15px] font-bold text-foreground">Ready-made plans</h2>
        <p className="mt-0.5 px-1 text-[11px] leading-snug text-muted-foreground">No survey needed — pick one and go. Filter by yoga-only, workout-only or a mix.</p>
        <div className="sticky top-[3.1rem] z-20 -mx-5 mt-2 bg-background/85 px-5 py-2 backdrop-blur-xl">
          <div className="flex gap-1.5 overflow-x-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
            {KIND_TABS.map(([id, label]) => (
              <button key={id} onClick={() => setKindFilter(id)} className={`shrink-0 rounded-full px-3 py-1.5 text-[12px] font-semibold ${kindFilter === id ? "bg-primary text-primary-foreground" : "bg-secondary text-foreground/75"}`}>{label}</button>
            ))}
          </div>
        </div>
        <div className="mt-1 grid grid-cols-2 gap-2.5">
          {readyList.map((pl) => (
            <button key={pl.id} onClick={() => setPlanAction(pl)} className="relative flex items-center gap-3 rounded-2xl bg-card p-3 text-left ring-1 ring-border/60 active:scale-[0.98]">
              {KIND_BADGE[pl.kind] && <span className="absolute right-2 top-2 rounded-full bg-emerald-500/15 px-1.5 py-0.5 text-[8.5px] font-bold text-emerald-600">{KIND_BADGE[pl.kind]}</span>}
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-accent/50 text-xl">{pl.emoji}</span>
              <div className="min-w-0"><p className="truncate text-[12.5px] font-semibold text-foreground">{pl.name}</p><p className="text-[10.5px] text-muted-foreground">{pl.weeks} week{pl.weeks > 1 ? "s" : ""}</p></div>
            </button>
          ))}
        </div>
      </section>

      <section className="pt-6">
        <h2 className="px-1 font-display text-[15px] font-bold text-foreground">Explore &amp; practise</h2>
        <p className="mt-0.5 px-1 text-[11px] leading-snug text-muted-foreground">Yoga plus every workout style — tap to browse and play.</p>
        <div className="mt-2.5 grid grid-cols-4 gap-2">
          <button onClick={() => setDrill({ kind: "yoga" })} className="flex flex-col items-center gap-1.5 rounded-2xl bg-card p-2.5 text-center ring-1 ring-primary/40 active:scale-[0.97]">
            <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-xl">🧘‍♀️</span>
            <span className="text-[9.5px] font-bold leading-tight text-foreground">Yoga</span>
          </button>
          {STYLE_TILES.map((b) => (
            <button key={b.id} onClick={() => setDrill({ kind: "style", bucket: b })} className="flex flex-col items-center gap-1.5 rounded-2xl bg-card p-2.5 text-center ring-1 ring-border/60 active:scale-[0.97]">
              <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-accent/50 text-xl">{b.emoji}</span>
              <span className="text-[9.5px] font-medium leading-tight text-foreground/85">{b.label}</span>
            </button>
          ))}
        </div>
      </section>

      {setupInit && (
        <ProgramSetupSheet initial={setupInit.options} initialWeeks={setupInit.weeks} title="Build your plan"
          onClose={() => setSetupInit(null)}
          onCreate={(opts, weeks) => { setProg(customizeProgram(prog, opts, weeks)); setExpanded(1); setSetupInit(null); }} />
      )}
      {swap && (
        <DayEditorFull day={swap.day} base={prog.options} onClose={() => setSwap(null)}
          onSave={(spec, dayOpts) => { const s = swap; setProg((p) => editProgDay(p, s.week, s.day, spec, dayOpts)); setSwap(null); setReadjust({ week: s.week, day: s.day }); }} />
      )}

      {/* Use-as-is vs customize a ready-made plan */}
      <Dialog open={planAction !== null} onOpenChange={(v) => { if (!v) setPlanAction(null); }}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle className="font-display">{planAction?.name}{planAction && KIND_BADGE[planAction.kind] ? ` · ${KIND_BADGE[planAction.kind]}` : ""}</DialogTitle>
            <DialogDescription>Use it as is, or tailor it to your level, time & style — it becomes your current plan.</DialogDescription>
          </DialogHeader>
          <button onClick={() => { if (planAction) { const np = startProgram(planAction.name, planAction.options, planAction.weeks); setProg(np); setExpanded(1); } setPlanAction(null); }} className="w-full rounded-2xl bg-primary px-4 py-3 text-sm font-semibold text-primary-foreground">Use this plan as is</button>
          <button onClick={() => { if (planAction) setSetupInit({ options: planAction.options, weeks: planAction.weeks }); setPlanAction(null); }} className="w-full rounded-2xl bg-secondary px-4 py-3 text-sm font-semibold text-foreground">Customize it to my needs</button>
        </DialogContent>
      </Dialog>

      {/* Re-adjust remaining days */}
      <Dialog open={readjust !== null} onOpenChange={(v) => { if (!v) setReadjust(null); }}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle className="font-display">Day {readjust?.day} updated ✓</DialogTitle>
            <DialogDescription>Should I re-adjust your remaining days this week to flow with this change?</DialogDescription>
          </DialogHeader>
          <button onClick={() => { const r = readjust; if (r) setProg((p) => readjustAfter(p, r.week, r.day)); setReadjust(null); }} className="w-full rounded-2xl bg-primary px-4 py-3 text-sm font-semibold text-primary-foreground">Yes, re-adjust the rest</button>
          <button onClick={() => setReadjust(null)} className="w-full rounded-2xl bg-secondary px-4 py-2.5 text-[13px] font-semibold text-foreground">No, keep them as they are</button>
        </DialogContent>
      </Dialog>
    </div>
  );
}

/* ================= Yoga content (drill-down from the Yoga tile) ================= */

type YView = { kind: "style"; id: StyleId } | { kind: "tech"; id: "pranayama" | "bandhas" | "mudras" } | null;
function YogaContent({ onBack, onPlay }: { onBack: () => void; onPlay: (src: PlaySrc) => void }) {
  const kg = bodyWeight();
  const [view, setView] = useState<YView>(null);
  const back = () => (view ? setView(null) : onBack());
  const TECH: Record<"pranayama" | "bandhas" | "mudras", { label: string; list: Technique[] }> = {
    pranayama: { label: "Pranayama", list: PRANAYAMAS },
    bandhas: { label: "Bandhas", list: BANDHAS },
    mudras: { label: "Mudras", list: MUDRAS },
  };

  return (
    <div className="pb-4 pt-3">
      <button onClick={back} className="mb-2 flex items-center gap-1.5 text-[12.5px] font-semibold text-primary"><ArrowLeft size={14} /> {view ? "Yoga" : "Back"}</button>

      {view?.kind === "style" ? (
        <div>
          <h2 className="px-1 font-display text-[16px] font-bold text-foreground">{STYLES.find((s) => s.id === view.id)?.emoji} {STYLES.find((s) => s.id === view.id)?.label}</h2>
          <p className="mb-2 px-1 text-[11px] text-muted-foreground">{STYLES.find((s) => s.id === view.id)?.blurb}</p>
          <div className="space-y-1.5">
            {programsOf(view.id).map((p) => (
              <button key={p.id} onClick={() => onPlay(yogaPlay(p))} className="flex w-full items-center gap-3 rounded-2xl bg-card p-3 text-left ring-1 ring-border/60 active:scale-[0.99]">
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-accent/50 text-lg">🧘</span>
                <div className="min-w-0 flex-1"><p className="truncate text-[13px] font-semibold text-foreground">{p.title}</p><p className="truncate text-[11px] text-muted-foreground">{p.level} · {programMinutes(p)} min · {p.poses.length} poses · 🔥 {styleKcal(p, kg)} kcal</p></div>
                <Play size={14} className="shrink-0 text-primary" />
              </button>
            ))}
          </div>
        </div>
      ) : view?.kind === "tech" ? (
        <div>
          <h2 className="mb-2 px-1 font-display text-[16px] font-bold text-foreground">{TECH[view.id].label}</h2>
          <div className="space-y-1.5">
            {TECH[view.id].list.map((t) => (
              <button key={t.id} onClick={() => onPlay(yogaPlanPlay(techniqueSession(t), t.name))} className="flex w-full items-center gap-3 rounded-2xl bg-card p-3 text-left ring-1 ring-border/60 active:scale-[0.99]">
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-accent/50 text-lg">{t.emoji}</span>
                <div className="min-w-0 flex-1"><p className="truncate text-[13px] font-semibold text-foreground">{t.name}{t.sanskrit ? ` · ${t.sanskrit}` : ""}</p><p className="truncate text-[11px] text-muted-foreground">{t.note}</p></div>
                <Play size={14} className="shrink-0 text-primary" />
              </button>
            ))}
          </div>
        </div>
      ) : (
        <>
          <section>
            <h2 className="px-1 font-display text-[15px] font-bold text-foreground">Style</h2>
            <p className="mt-0.5 px-1 text-[11px] text-muted-foreground">Yoga styles, plus pranayama, bandhas & mudras.</p>
            <div className="mt-2 grid grid-cols-4 gap-2">
              {STYLES.map((s) => (
                <button key={s.id} onClick={() => setView({ kind: "style", id: s.id })} className="flex flex-col items-center gap-1.5 rounded-2xl bg-card p-2.5 text-center ring-1 ring-border/60 active:scale-[0.97]">
                  <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-accent/50 text-xl">{s.emoji}</span>
                  <span className="text-[9.5px] font-medium leading-tight text-foreground/85">{s.label}</span>
                </button>
              ))}
              {([["pranayama", "🌬️", "Pranayama"], ["bandhas", "🔩", "Bandhas"], ["mudras", "🤲", "Mudras"]] as ["pranayama" | "bandhas" | "mudras", string, string][]).map(([id, emoji, label]) => (
                <button key={id} onClick={() => setView({ kind: "tech", id })} className="flex flex-col items-center gap-1.5 rounded-2xl bg-card p-2.5 text-center ring-1 ring-border/60 active:scale-[0.97]">
                  <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-accent/50 text-xl">{emoji}</span>
                  <span className="text-[9.5px] font-medium leading-tight text-foreground/85">{label}</span>
                </button>
              ))}
            </div>
          </section>
          <section className="pt-5">
            <h2 className="px-1 font-display text-[15px] font-bold text-foreground">Practice</h2>
            <p className="mt-0.5 px-1 text-[11px] text-muted-foreground">Ready-to-play yoga flows.</p>
            <div className="mt-2 space-y-1.5">
              {sessionsIn("yoga").map((s) => (
                <button key={s.id} onClick={() => onPlay(sessionPlay(s))} className="flex w-full items-center gap-3 rounded-2xl bg-card p-3 text-left ring-1 ring-border/60 active:scale-[0.99]">
                  <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-accent/50 text-lg">🧘</span>
                  <div className="min-w-0 flex-1"><p className="truncate text-[13px] font-semibold text-foreground">{s.title}</p><p className="truncate text-[11px] text-muted-foreground">{s.level} · {s.minutes} min · 🔥 {sessionKcal(s, kg)} kcal</p></div>
                  <Play size={14} className="shrink-0 text-primary" />
                </button>
              ))}
            </div>
          </section>
        </>
      )}
    </div>
  );
}

/* ================= Poses & Bundle tab (collapsible categories + build a flow) ================= */

function PosesTab({ onPlay }: { onPlay: (src: PlaySrc) => void }) {
  const [sel, setSel] = useState<string[]>([]);
  const [open, setOpen] = useState<string>("Asanas");
  const tog = (id: string) => setSel((c) => c.includes(id) ? c.filter((x) => x !== id) : [...c, id]);
  const CATS: [string, string, Technique[]][] = [["Asanas", "🧘", ASANAS], ["Pranayama", "🌬️", PRANAYAMAS], ["Bandhas", "🔩", BANDHAS], ["Mudras", "🤲", MUDRAS]];
  return (
    <div className="pb-24 pt-3">
      <p className="px-1 pb-2 text-[11.5px] leading-snug text-muted-foreground">Select poses & create your own practice bundle — tap ➕ to add, then start your flow.</p>
      <div className="sticky top-[3.1rem] z-20 -mx-5 mb-2 bg-background/85 px-5 py-2 backdrop-blur-xl">
        <div className="flex gap-1.5 overflow-x-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          {CATS.map(([label, emoji]) => (
            <button key={label} onClick={() => setOpen(label)} className={`shrink-0 rounded-full px-3 py-1.5 text-[12px] font-semibold ${open === label ? "bg-primary text-primary-foreground" : "bg-secondary text-foreground/75"}`}>{emoji} {label}</button>
          ))}
        </div>
      </div>
      <div className="space-y-2">
        {CATS.map(([label, emoji, list]) => {
          const isOpen = open === label;
          const picked = list.filter((t) => sel.includes(t.id)).length;
          return (
            <div key={label} className="overflow-hidden rounded-2xl bg-card ring-1 ring-border/60">
              <button onClick={() => setOpen(isOpen ? "" : label)} className="flex w-full items-center gap-3 p-3 text-left">
                <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-accent/50 text-lg">{emoji}</span>
                <div className="min-w-0 flex-1"><p className="text-[13.5px] font-bold text-foreground">{label}</p><p className="text-[11px] text-muted-foreground">{list.length} techniques{picked ? ` · ${picked} added` : ""}</p></div>
                <ChevronRight size={16} className={`text-muted-foreground transition-transform ${isOpen ? "rotate-90" : ""}`} />
              </button>
              {isOpen && (
                <div className="grid grid-cols-1 gap-1.5 border-t border-border/60 p-3">
                  {list.map((t) => {
                    const on = sel.includes(t.id);
                    return (
                      <div key={t.id} className="flex items-center gap-2.5 rounded-2xl bg-secondary/40 p-2.5">
                        <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-accent/50 text-lg">{t.emoji}</span>
                        <div className="min-w-0 flex-1"><p className="truncate text-[12.5px] font-semibold text-foreground">{t.name}{t.sanskrit ? ` · ${t.sanskrit}` : ""}</p><p className="truncate text-[10.5px] text-muted-foreground">{t.note}</p></div>
                        <button onClick={() => tog(t.id)} className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-white ${on ? "bg-emerald-500" : "bg-primary/85"}`}>{on ? <Check size={13} strokeWidth={3} /> : <Plus size={13} strokeWidth={3} />}</button>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}
      </div>
      {sel.length > 0 && (
        <div className="fixed inset-x-0 bottom-[max(4.5rem,calc(env(safe-area-inset-bottom)+4.5rem))] z-30 mx-auto max-w-xl px-5">
          <button onClick={() => onPlay(yogaPlanPlay(buildBundleSession(sel), `Custom Practice · ${sel.length} poses`))} className="w-full rounded-2xl bg-primary px-4 py-3 text-sm font-bold text-primary-foreground shadow-[var(--shadow-glow)]">▶ Practice {sel.length} pose{sel.length > 1 ? "s" : ""}</button>
        </div>
      )}
    </div>
  );
}

/* ================= Learn tab ================= */

function LearnTab() {
  const [open, setOpen] = useState<string | null>(null);
  return (
    <div className="space-y-4 pb-4 pt-3">
      <section className="space-y-2">
        {YOGA_LEARN.map((l) => (
          <div key={l.title} className="rounded-3xl bg-card p-4 ring-1 ring-border/60">
            <p className="flex items-center gap-2 font-display text-[14.5px] font-bold text-foreground"><span className="text-xl">{l.emoji}</span> {l.title}</p>
            <p className="mt-1.5 text-[12.5px] leading-relaxed text-foreground/80">{l.body}</p>
          </div>
        ))}
      </section>
      <section>
        <h2 className="px-1 pb-1.5 font-display text-[15px] font-bold text-foreground">The building blocks</h2>
        <div className="space-y-2">
          {YOGA_ABOUT.map((g) => {
            const isOpen = open === g.id;
            return (
              <div key={g.id} className="overflow-hidden rounded-2xl bg-card ring-1 ring-border/60">
                <button onClick={() => setOpen(isOpen ? null : g.id)} className="flex w-full items-center gap-3 p-3.5 text-left">
                  <div className="min-w-0 flex-1"><p className="text-[13.5px] font-bold text-foreground">{g.title}</p><p className="text-[11px] text-muted-foreground">{g.blurb}</p></div>
                  <ChevronRight size={16} className={`text-muted-foreground transition-transform ${isOpen ? "rotate-90" : ""}`} />
                </button>
                {isOpen && (
                  <div className="space-y-1 border-t border-border/60 p-3">
                    {g.items.map((it) => (
                      <div key={it.name} className="rounded-xl bg-secondary/40 px-3 py-2">
                        <p className="text-[12.5px] font-semibold text-foreground">{it.name}</p>
                        <p className="text-[11px] text-muted-foreground">{it.note}</p>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </section>
    </div>
  );
}

function BucketSessions({ bucket, onBack, onPlay }: { bucket: Bucket; onBack: () => void; onPlay: (s: Session) => void }) {
  const kg = bodyWeight();
  const list = sessionsIn(bucket.id);
  return (
    <div className="pb-4 pt-3">
      <button onClick={onBack} className="mb-2 flex items-center gap-1.5 text-[12.5px] font-semibold text-primary"><ArrowLeft size={14} /> All styles</button>
      <div className="flex items-center gap-3 px-1 pb-2">
        <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-accent/50 text-2xl">{bucket.emoji}</span>
        <div className="min-w-0"><h2 className="font-display text-[16px] font-bold text-foreground">{bucket.label}</h2><p className="text-[11px] text-muted-foreground">{list.length} sessions</p></div>
      </div>
      {list.length === 0 ? (
        <p className="rounded-2xl bg-card p-4 text-center text-[12px] text-muted-foreground ring-1 ring-border/60">No sessions here yet.</p>
      ) : (
        <div className="space-y-1.5">
          {list.map((s) => (
            <button key={s.id} onClick={() => onPlay(s)} className="flex w-full items-center gap-3 rounded-2xl bg-card p-3 text-left ring-1 ring-border/60 active:scale-[0.99]">
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-accent/50 text-lg">💪</span>
              <div className="min-w-0 flex-1"><p className="truncate text-[13px] font-semibold text-foreground">{s.title}</p><p className="truncate text-[11px] text-muted-foreground">{s.level} · {s.minutes} min · 🔥 {sessionKcal(s, kg)} kcal</p></div>
              <Play size={14} className="shrink-0 text-primary" />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

/* ================= Compact full-screen player (shared for yoga & exercise) ================= */

function PlayerSheet({ src, onClose }: { src: PlaySrc; onClose: () => void }) {
  const [idx, setIdx] = useState(0);
  const [secs, setSecs] = useState(src.steps[0]?.sec ?? 0);
  const [playing, setPlaying] = useState(true);
  const [done, setDone] = useState(src.steps.length === 0);
  const timer = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    if (!playing || done) return;
    timer.current = setInterval(() => {
      setSecs((s) => {
        if (s > 1) return s - 1;
        setIdx((i) => {
          if (i >= src.steps.length - 1) { setDone(true); setPlaying(false); return i; }
          const n = i + 1; setSecs(src.steps[n].sec); return n;
        });
        return 0;
      });
    }, 1000);
    return () => { if (timer.current) clearInterval(timer.current); };
  }, [playing, done, src.steps]);

  const step = src.steps[idx];
  const go = (n: number) => { if (n < 0 || n >= src.steps.length) return; setIdx(n); setSecs(src.steps[n].sec); setDone(false); };

  return (
    <div className="fixed inset-0 z-50 flex flex-col text-primary-foreground" style={{ background: "var(--gradient-night)" }}>
      <div className="flex items-center justify-between px-5 pt-[max(1rem,env(safe-area-inset-top))]">
        <button onClick={onClose} className="flex h-9 w-9 items-center justify-center rounded-full bg-white/15"><X size={16} /></button>
        <p className="truncate px-3 text-[12.5px] font-semibold opacity-90">{src.title}</p>
        <span className="w-9" />
      </div>

      {done ? (
        <div className="flex flex-1 flex-col items-center justify-center px-8 text-center">
          <span className="text-5xl">🎉</span>
          <h2 className="mt-4 font-display text-2xl font-extrabold">Session complete</h2>
          <p className="mt-1.5 text-[13px] opacity-80">{src.steps.length} moves · 🔥 {src.kcal} kcal</p>
          <button onClick={onClose} className="mt-6 rounded-2xl bg-white px-8 py-3 text-sm font-bold text-violet-700">Done</button>
        </div>
      ) : (
        <>
          <div className="flex flex-1 flex-col items-center justify-center px-8 text-center">
            <span className="text-7xl">{step?.emoji}</span>
            <h2 className="mt-5 font-display text-2xl font-extrabold leading-tight">{step?.name}</h2>
            <p className="mt-6 font-display text-6xl font-black tabular-nums">{fmt(secs)}</p>
            <p className="mt-2 text-[12px] opacity-70">Move {idx + 1} of {src.steps.length}</p>
          </div>
          <div className="px-5">
            <div className="h-1.5 w-full overflow-hidden rounded-full bg-white/15">
              <div className="h-full bg-white transition-all" style={{ width: `${((idx + 1) / src.steps.length) * 100}%` }} />
            </div>
          </div>
          <div className="flex items-center justify-center gap-4 px-5 pb-[max(1.5rem,env(safe-area-inset-bottom))] pt-5">
            <button onClick={() => go(idx - 1)} disabled={idx === 0} className="flex h-12 w-12 items-center justify-center rounded-full bg-white/15 disabled:opacity-40">⏮</button>
            <button onClick={() => setPlaying((p) => !p)} className="flex h-16 w-16 items-center justify-center rounded-full bg-white text-violet-700">{playing ? <Pause size={26} className="fill-current" /> : <Play size={26} className="fill-current" />}</button>
            <button onClick={() => go(idx + 1)} disabled={idx >= src.steps.length - 1} className="flex h-12 w-12 items-center justify-center rounded-full bg-white/15 disabled:opacity-40">⏭</button>
          </div>
        </>
      )}
    </div>
  );
}

/* ================= Shared: setup survey sheet + day editor (copies, self-contained) ================= */

function Field({ title, children }: { title: string; children: React.ReactNode }) {
  return <div><p className="mb-1.5 px-1 text-[12px] font-bold uppercase tracking-wide text-foreground/60">{title}</p>{children}</div>;
}

function ProgramSetupSheet({ initial, initialWeeks, title, onClose, onCreate, onSkip }: {
  initial: WeekOptions; initialWeeks: number; title: string;
  onClose: () => void; onCreate: (o: WeekOptions, weeks: number) => void; onSkip?: () => void;
}) {
  const [planType, setPlanType] = useState<"yoga" | "exercise" | "both">("both");
  const [objective, setObjective] = useState(initial.objective);
  const [level, setLevel] = useState<Level>(initial.level === "any" ? "beginner" : initial.level);
  const [minutes, setMinutes] = useState(initial.minutes || 30);
  const [equip, setEquip] = useState<Equip[]>(initial.equip.length ? initial.equip : ["none"]);
  const [styles, setStyles] = useState<string[]>(initial.styles);
  const [problems, setProblems] = useState<string[]>(initial.problems);
  const [activeDays, setActiveDays] = useState(initial.activeDays);
  const [len, setLen] = useState<string>(initialWeeks >= 1 && initialWeeks <= 4 ? `${initialWeeks}w` : "ai");
  const initFocusKeys = () => {
    const opts = focusChoicesFor(initial.objective).options;
    return initial.focus.length ? opts.filter((o) => initial.focus.includes(o.focus)).map((o) => o.key) : [];
  };
  const [focusKeys, setFocusKeys] = useState<string[]>(initFocusKeys);
  const chip = (on: boolean) => `rounded-full px-3 py-1.5 text-[12px] font-semibold ${on ? "bg-primary text-primary-foreground" : "bg-secondary text-foreground/75"}`;
  const togS = (s: string) => setStyles((c) => c.includes(s) ? c.filter((x) => x !== s) : [...c, s]);
  const togP = (p: string) => setProblems((c) => c.includes(p) ? c.filter((x) => x !== p) : [...c, p]);
  const togFocusKey = (k: string) => setFocusKeys((c) => c.includes(k) ? c.filter((x) => x !== k) : [...c, k]);
  const togEquip = (id: Equip) => setEquip((c) => {
    if (id === "none") return ["none"];
    const b = c.filter((x) => x !== "none");
    return b.includes(id) ? (b.filter((x) => x !== id).length ? b.filter((x) => x !== id) : ["none"]) : [...b, id];
  });
  const pickObjective = (id: string) => { setObjective(id); setFocusKeys([]); if (id === "joint-relief") setStyles([]); };
  const LENGTHS = [{ k: "ai", label: "🤖 Let AI decide" }, { k: "1w", label: "1 week" }, { k: "2w", label: "2 weeks" }, { k: "3w", label: "3 weeks" }, { k: "4w", label: "4 weeks ⭐" }];
  const fc = focusChoicesFor(objective);
  const autoStyle = objective === "joint-relief";
  const YOGA_STYLE_IDS = ["yoga", "somatic", "stretching"];
  const styleOpts = planType === "yoga" ? STYLE_CHOICES.filter((s) => YOGA_STYLE_IDS.includes(s.id))
    : planType === "exercise" ? STYLE_CHOICES.filter((s) => !YOGA_STYLE_IDS.includes(s.id))
    : STYLE_CHOICES;
  const pickType = (t: "yoga" | "exercise" | "both") => { setPlanType(t); setStyles([]); };
  const create = () => {
    const weeks = len === "ai" ? 4 : parseInt(len, 10);
    const focus = Array.from(new Set(focusKeys.map((k) => fc.options.find((o) => o.key === k)?.focus).filter(Boolean))) as Focus[];
    let outStyles = autoStyle ? [] : styles;
    if (planType === "yoga" && outStyles.length === 0) outStyles = YOGA_STYLE_IDS; // keep a yoga-only plan yoga-only
    onCreate({ objective, level, focus, minutes, equip, styles: outStyles, problems, activeDays }, weeks);
  };

  return (
    <Dialog open onOpenChange={(v) => { if (!v) onClose(); }}>
      <DialogContent className="max-w-sm">
        <DialogHeader>
          <DialogTitle className="font-display">{title}</DialogTitle>
          <DialogDescription>If you are not sure about any option, let AI decide best for you. We recommend 4 weeks. Not sure where to start? <Link to="/coach" className="font-semibold text-primary underline">talk to the bot</Link>.</DialogDescription>
        </DialogHeader>
        <div className="max-h-[58svh] space-y-4 overflow-y-auto pr-1">
          <Field title="What should this plan be?">
            <div className="flex flex-wrap gap-1.5">
              {([["yoga", "🧘 Yoga plan"], ["exercise", "🏋️ Exercise plan"], ["both", "🔀 Include both"]] as [typeof planType, string][]).map(([id, label]) => (
                <button key={id} onClick={() => pickType(id)} className={chip(planType === id)}>{label}</button>
              ))}
            </div>
          </Field>
          <Field title="How long?">
            <div className="flex flex-wrap gap-1.5">{LENGTHS.map((l) => <button key={l.k} onClick={() => setLen(l.k)} className={chip(len === l.k)}>{l.label}</button>)}</div>
          </Field>
          <Field title="Objective / goal">
            <div className="flex flex-wrap gap-1.5">{OBJECTIVES.map((o) => <button key={o.id} onClick={() => pickObjective(o.id)} className={chip(objective === o.id)}>{o.label}</button>)}</div>
          </Field>
          {!fc.hide && (
            <Field title="Focus area">
              <div className="flex flex-wrap gap-1.5">{fc.options.map((o) => <button key={o.key} onClick={() => togFocusKey(o.key)} className={chip(focusKeys.includes(o.key))}>{o.label}{o.recommended ? " ⭐" : ""}</button>)}</div>
            </Field>
          )}
          <Field title="Any problems? (keeps it safe)">
            <div className="flex flex-wrap gap-1.5">{PROBLEMS.map((p) => <button key={p.id} onClick={() => togP(p.id)} className={chip(problems.includes(p.id))}>{p.label}</button>)}</div>
          </Field>
          <Field title="Level">
            <div className="flex flex-wrap gap-1.5">{LEVELS.map((l) => <button key={l.id} onClick={() => setLevel(l.id)} className={chip(level === l.id)}>{l.label}</button>)}</div>
          </Field>
          <Field title="Session duration">
            <div className="flex flex-wrap gap-1.5">{[10, 20, 30, 45].map((m) => <button key={m} onClick={() => setMinutes(m)} className={chip(minutes === m)}>{m} min</button>)}</div>
          </Field>
          <Field title="Equipment">
            <div className="flex flex-wrap gap-1.5">{EQUIP_ALL.map((e) => <button key={e.id} onClick={() => togEquip(e.id)} className={chip(equip.includes(e.id))}>{e.label}</button>)}</div>
          </Field>
          <Field title="Preferred style">
            {autoStyle ? (
              <p className="rounded-2xl bg-secondary/60 px-3 py-2 text-[11.5px] text-muted-foreground">🤖 For Joint & Pain Relief, AI auto-recommends the gentlest styles for you.</p>
            ) : (
              <div className="flex flex-wrap gap-1.5">
                <button onClick={() => setStyles([])} className={chip(styles.length === 0)}>🤖 Let AI pick</button>
                {styleOpts.map((b) => <button key={b.id} onClick={() => togS(b.id)} className={chip(styles.includes(b.id))}>{b.emoji} {b.label}</button>)}
              </div>
            )}
          </Field>
          <Field title="Workout days / week">
            <div className="flex flex-wrap gap-1.5">{[3, 4, 5, 6, 7].map((n) => <button key={n} onClick={() => setActiveDays(n)} className={chip(activeDays === n)}>{n} days</button>)}</div>
          </Field>
        </div>
        <button onClick={create} className="w-full rounded-2xl bg-primary px-4 py-3 text-sm font-semibold text-primary-foreground">Create my plan</button>
        {onSkip && <button onClick={onSkip} className="w-full rounded-2xl px-4 py-2 text-[12.5px] font-semibold text-muted-foreground underline">Skip — show me ready-made plans</button>}
      </DialogContent>
    </Dialog>
  );
}

function DayEditorFull({ day, base, onClose, onSave }: {
  day: number; base: WeekOptions; onClose: () => void;
  onSave: (spec: { style?: string; focus?: Focus; rest?: boolean }, dayOpts: Partial<WeekOptions>) => void;
}) {
  const fc = focusChoicesFor(base.objective);
  const [rest, setRest] = useState(false);
  const [level, setLevel] = useState<Level>(base.level === "any" ? "beginner" : base.level);
  const [problems, setProblems] = useState<string[]>([]);
  const [minutes, setMinutes] = useState<"ai" | number>("ai");
  const [equip, setEquip] = useState<Equip[]>(base.equip.length ? base.equip : ["none"]);
  const [focusKey, setFocusKey] = useState<"ai" | string>("ai");
  const [style, setStyle] = useState<"ai" | string>("ai");
  const chip = (on: boolean) => `rounded-full px-3 py-1.5 text-[12px] font-semibold ${on ? "bg-primary text-primary-foreground" : "bg-secondary text-foreground/75"}`;
  const ai = "🤖 AI auto-recommend";
  const togP = (p: string) => setProblems((c) => c.includes(p) ? c.filter((x) => x !== p) : [...c, p]);
  const togEquip = (id: Equip) => setEquip((c) => {
    if (id === "none") return ["none"];
    const b = c.filter((x) => x !== "none");
    return b.includes(id) ? (b.filter((x) => x !== id).length ? b.filter((x) => x !== id) : ["none"]) : [...b, id];
  });

  const save = () => {
    if (rest) { onSave({ rest: true }, {}); return; }
    const dayOpts: Partial<WeekOptions> = { level, objective: base.objective, equip };
    if (problems.length) dayOpts.problems = problems;
    if (minutes !== "ai") dayOpts.minutes = minutes;
    const spec: { style?: string; focus?: Focus } = {};
    if (focusKey !== "ai") spec.focus = fc.options.find((o) => o.key === focusKey)?.focus;
    if (style !== "ai") spec.style = style;
    onSave(spec, dayOpts);
  };

  return (
    <Dialog open onOpenChange={(v) => { if (!v) onClose(); }}>
      <DialogContent className="max-w-sm">
        <DialogHeader>
          <DialogTitle className="font-display">Edit Day {day}</DialogTitle>
          <DialogDescription>Set your level & equipment. For duration, focus area & style you can pick — or leave it on 🤖 AI auto-recommend.</DialogDescription>
        </DialogHeader>
        <button onClick={() => setRest(!rest)} className={`w-full rounded-2xl px-4 py-2.5 text-[12.5px] font-semibold ${rest ? "bg-primary text-primary-foreground" : "bg-secondary text-foreground ring-1 ring-border/60"}`}>😴 {rest ? "This is a rest day" : "Make it a rest day"}</button>
        {!rest && (
          <div className="max-h-[52svh] space-y-3.5 overflow-y-auto pr-1">
            <Field title="Level"><div className="flex flex-wrap gap-1.5">{LEVELS.map((l) => <button key={l.id} onClick={() => setLevel(l.id)} className={chip(level === l.id)}>{l.label}</button>)}</div></Field>
            {!fc.hide && (
              <Field title="Focus area"><div className="flex flex-wrap gap-1.5"><button onClick={() => setFocusKey("ai")} className={chip(focusKey === "ai")}>{ai}</button>{fc.options.map((o) => <button key={o.key} onClick={() => setFocusKey(o.key)} className={chip(focusKey === o.key)}>{o.label}{o.recommended ? " ⭐" : ""}</button>)}</div></Field>
            )}
            <Field title="Any problem?"><div className="flex flex-wrap gap-1.5">{PROBLEMS.map((p) => <button key={p.id} onClick={() => togP(p.id)} className={chip(problems.includes(p.id))}>{p.label}</button>)}</div></Field>
            <Field title="Session duration"><div className="flex flex-wrap gap-1.5"><button onClick={() => setMinutes("ai")} className={chip(minutes === "ai")}>{ai}</button>{[10, 20, 30, 45].map((m) => <button key={m} onClick={() => setMinutes(m)} className={chip(minutes === m)}>{m} min</button>)}</div></Field>
            <Field title="Equipment"><div className="flex flex-wrap gap-1.5">{EQUIP_ALL.map((e) => <button key={e.id} onClick={() => togEquip(e.id)} className={chip(equip.includes(e.id))}>{e.label}</button>)}</div></Field>
            <Field title="Style"><div className="flex flex-wrap gap-1.5"><button onClick={() => setStyle("ai")} className={chip(style === "ai")}>{ai}</button>{STYLE_CHOICES.map((s) => <button key={s.id} onClick={() => setStyle(s.id)} className={chip(style === s.id)}>{s.emoji} {s.label}</button>)}</div></Field>
          </div>
        )}
        <button onClick={save} className="w-full rounded-2xl bg-primary px-4 py-3 text-sm font-semibold text-primary-foreground">Save day</button>
      </DialogContent>
    </Dialog>
  );
}
