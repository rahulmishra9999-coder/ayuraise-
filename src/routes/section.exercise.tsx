import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useMemo, useRef, useState } from "react";
import {
  ArrowLeft, Play, Pause, X, ChevronRight, ChevronLeft, Heart, Trash2, History,
  Check, Plus, Minus, ListOrdered, Save, Music, Dumbbell, Sliders, Shuffle, Info,
} from "lucide-react";
import { toast } from "sonner";
import { BottomNav } from "@/components/BottomNav";
import { AyuBot } from "@/components/AyuBot";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { WLPipelineBanner, WLPipelineNext } from "@/components/WLPipeline";
import { DiseasePipelineBanner, DiseasePipelineNext } from "@/components/DiseasePipeline";
import { loadProfile, patchPlan, estimateBurn } from "@/lib/weight-loss";
import { addCalEntry } from "@/lib/trackers";
import { WORKOUT_LEARN } from "@/lib/exercise-learn";
import {
  PROG_GROUPS, headersInGroup, PROG_LEVELS, PROG_TARGETS, PROG_EQUIP, EMPTY_PROG_FILTERS,
  matchItem, progLevelLabel, progFocusLabel, progEquipLabel,
  type ProgramHeader, type ProgramItem, type ProgFilters, type ProgLevel, type ProgFocus,
  type ProgEquip, type ProgGroup,
} from "@/lib/programs";
import {
  GROUPS, bucketsInGroup, bucketOf, sessionsIn, getSession, getExercise, EXERCISES,
  buildBlocks, stepsOf, exerciseCount, stepKcal, sessionKcal, kcalFor,
  applyFilters, EMPTY_FILTERS, LEVELS, EQUIP_FILTERS, EQUIP_ALL, INTENSITIES,
  FOCUS_LIST, focusLabel, focusChoicesFor, styleChoicesFor, equipmentForStyles, coarseEquip, levelLabel, equipLabel, CLASSICS, buildExercisePlan,
  PLAN_BUCKETS, bundleSteps, bundleSeconds, bundleKcal, SET_OPTIONS, SEC_OPTIONS,
  BREAK_SEC, MUSIC_LINKS,
  loadFavs, toggleFav, loadBundles, saveBundle, deleteBundle,
  loadMyExPlans, saveMyExPlan, deleteMyExPlan, loadExHistory, addExHistory, addFeedback,
  OBJECTIVES, PROBLEMS, DEFAULT_WEEK_OPTIONS, getMyWeek, saveMyWeek, resetMyWeek, weekDone, setWeekDone,
  DAY_STYLES, STYLE_CHOICES, STYLE_EQUIPMENT, editDay,
  getProgram, startProgram, customizeProgram, toggleProgDay, editProgDay, readjustAfter, addProgWeek, moveRestDay,
  weekUnlocked, canAddWeek, isProgDayDone, weekDoneCount, recommendStyleByDay,
  type Bucket, type Session, type Step, type Exercise, type ExFilters, type Level,
  type Intensity, type Equip, type Focus, type BodyPart, type Bundle, type BundleItem,
  type SavedExPlan, type MyWeek, type WeekOptions, type MyProgram,
} from "@/lib/exercise";

export const Route = createFileRoute("/section/exercise")({
  head: () => ({
    meta: [
      { title: "Workouts · AyuRaise" },
      { name: "description", content: "Train by style, goal or program — ready-made sessions you can filter and edit, plus build your own bundle." },
    ],
  }),
  component: WorkoutsPage,
});

function bodyWeight() { return loadProfile()?.weightKg ?? 65; }
function fmt(sec: number) { return `${Math.floor(sec / 60)}:${String(Math.round(sec) % 60).padStart(2, "0")}`; }
function toMin(sec: number) { return Math.max(1, Math.round(sec / 60)); }

type Tab = "programs" | "library" | "classics" | "learn";
type PlaySource = { title: string; steps: Step[]; startIndex: number; preview?: boolean };

function WorkoutsPage() {
  const [tab, setTab] = useState<Tab>("programs");
  const [bucket, setBucket] = useState<Bucket | null>(null);
  const [detail, setDetail] = useState<Session | null>(null);
  const [programHeader, setProgramHeader] = useState<ProgramHeader | null>(null);
  const [programItem, setProgramItem] = useState<ProgramItem | null>(null);
  const [player, setPlayer] = useState<PlaySource | null>(null);
  const [editNonce, setEditNonce] = useState(0);
  const [favs, setFavs] = useState<string[]>([]);
  useEffect(() => { setFavs(loadFavs()); }, []);
  const onFav = (id: string) => setFavs(toggleFav(id));

  const previewPlay = (ex: Exercise) =>
    setPlayer({ title: ex.name, steps: bundleSteps([{ exId: ex.id, sets: 1, sec: ex.sec }]), startIndex: 0, preview: true });

  return (
    <div className="min-h-svh pb-28" style={{ background: "var(--gradient-hero)" }}>
      <div className="relative overflow-hidden px-4 pb-4 pt-[max(0.85rem,env(safe-area-inset-top))]" style={{ background: "var(--gradient-night)" }}>
        <div className="absolute -right-16 -top-16 h-40 w-40 rounded-full bg-rose-400/20 blur-3xl" />
        <div className="relative flex items-center gap-2.5">
          <Link to="/home" className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-white/15 text-primary-foreground">
            <ArrowLeft size={15} />
          </Link>
          <DumbbellIcon />
          <div className="min-w-0">
            <h1 className="truncate font-display text-[18px] font-extrabold leading-tight text-primary-foreground">Exercise / Workout</h1>
            <p className="text-[11.5px] text-primary-foreground/80">Desi kasrat to gym — move your way.</p>
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-xl px-5">
        <button onClick={() => { setTab("programs"); setEditNonce((n) => n + 1); }} className="group mt-4 w-full overflow-hidden rounded-3xl p-5 text-left text-primary-foreground shadow-[var(--shadow-glow)] transition active:scale-[0.985]" style={{ background: "var(--gradient-violet)" }}>
          <div className="flex items-center gap-3">
            <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-white/20 text-xl">✨</span>
            <div className="min-w-0 flex-1">
              <p className="font-display text-[16px] font-bold leading-tight">Build My Personalized Plan</p>
              <p className="mt-1.5 text-[12px] leading-relaxed opacity-90">Goal, focus, level, schedule, style & equipment — one question at a time.</p>
            </div>
          </div>
          <span className="mt-3.5 inline-flex items-center gap-1.5 rounded-full bg-white px-4 py-2 text-[12.5px] font-bold text-violet-700 shadow-sm transition group-active:gap-2.5">
            Get started <ChevronRight size={15} />
          </span>
        </button>

        <div className="sticky top-0 z-30 -mx-5 mt-3 flex gap-1.5 overflow-x-auto bg-background/85 px-5 py-2.5 backdrop-blur-xl [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          {([["programs", "🗓️ Ready-made plans"], ["library", "🏋️ Practice Library"], ["classics", "🥋 Create your own bundle"], ["learn", "🎓 Learn"]] as const).map(([id, label]) => (
            <button key={id} onClick={() => setTab(id)}
              className={`rounded-full px-3.5 py-1.5 text-[12.5px] font-semibold transition ${tab === id ? "bg-primary text-primary-foreground shadow-[var(--shadow-glow)]" : "bg-card text-foreground/70 ring-1 ring-border/60"}`}>
              {label}
            </button>
          ))}
        </div>

        {tab === "programs" && <MyProgramTab onOpenSession={setDetail} editSignal={editNonce} />}
        {tab === "library" && <LibraryTab onPick={setBucket} onOpenHeader={setProgramHeader} />}
        {tab === "classics" && (
          <ClassicsTab onPreviewPlay={previewPlay}
            onPlayBundle={(name, items) => setPlayer({ title: name, steps: bundleSteps(items), startIndex: 0 })} />
        )}
        {tab === "learn" && <LearnTab />}

        {tab === "library" && (
          <div className="mt-6">
            <WLPipelineBanner currentSlug="exercise" />
            <DiseasePipelineBanner currentSlug="exercise" />
            <WLPipelineNext currentSlug="exercise" onAdvance={() => patchPlan({ exerciseCalBurn: estimateBurn(6 * 20, bodyWeight()) })} />
            <DiseasePipelineNext currentSlug="exercise" />
          </div>
        )}
      </div>

      {bucket && (
        <BucketView bucket={bucket} favs={favs} onFav={onFav} onClose={() => setBucket(null)} onOpenSession={setDetail} />
      )}
      {detail && (
        <SessionDetail s={detail} fav={favs.includes(detail.id)} onFav={() => onFav(detail.id)}
          onClose={() => setDetail(null)}
          onStart={(steps, i) => setPlayer({ title: detail.title, steps, startIndex: i })} />
      )}
      {programHeader && (
        <ProgramHeaderView header={programHeader} onClose={() => setProgramHeader(null)} onOpen={setProgramItem} />
      )}
      {programItem && (
        <ProgramDetail item={programItem} onClose={() => setProgramItem(null)}
          onStart={(steps, i) => setPlayer({ title: programItem.title, steps, startIndex: i })} />
      )}
      {player && <Player src={player} onClose={() => setPlayer(null)} />}

      <AyuBot />
      <BottomNav />
    </div>
  );
}

/* ================= Icon ================= */

function DumbbellIcon() {
  return (
    <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl text-white shadow-sm" style={{ background: "linear-gradient(160deg,#fb7185,#e11d48)" }}>
      <Dumbbell size={18} strokeWidth={2.2} />
    </span>
  );
}

/* ================= Programs (accordion library) ================= */

const FOCUS_PARTS_P: Record<ProgFocus, BodyPart[]> = {
  "full-body": ["full-body"],
  "upper-body": ["chest", "arms", "shoulders", "back"],
  legs: ["legs", "butt"],
  abs: ["abs"],
  endurance: ["full-body", "legs"],
};
const FOCUS_EMOJI_P: Record<ProgFocus, string> = { "full-body": "💪", "upper-body": "💪", legs: "🦵", abs: "🔥", endurance: "🏃" };

function programSteps(item: ProgramItem): Step[] {
  let names = item.exercises;
  if (!names.length) {
    const parts = FOCUS_PARTS_P[item.focus];
    names = EXERCISES.filter((x) => x.kind === "main" && !x.tag && x.parts.some((p) => parts.includes(p))).slice(0, 8).map((x) => x.name);
    if (!names.length) names = ["Bodyweight Squat", "Push-ups", "Plank", "Lunges", "Mountain Climbers", "Glute Bridge"];
  }
  const count = names.length || 1;
  const even = Math.max(25, Math.min(75, Math.round((item.minutes * 60) / count)));
  const emoji = FOCUS_EMOJI_P[item.focus] ?? "💪";
  return names.map((n, i) => {
    const seg = n.match(/^(.*?)\s*[–-]\s*(\d+)\s*min\b/i);
    const name = seg ? seg[1].trim() : n;
    const sec = seg ? parseInt(seg[2], 10) * 60 : even;
    return { exId: `prog:${item.id}:${i}`, name, emoji, sec, kind: "main" as const, met: item.met };
  });
}

function ProgFilterRow({ group, filters, setFilters }: { group: ProgGroup; filters: ProgFilters; setFilters: (f: ProgFilters) => void }) {
  const chip = (on: boolean) => `shrink-0 rounded-full px-3.5 py-1.5 text-[12px] font-semibold transition ${on ? "bg-primary text-primary-foreground" : "bg-card text-foreground/70 ring-1 ring-border/60"}`;
  const togL = (l: ProgLevel) => setFilters({ ...filters, levels: filters.levels.includes(l) ? filters.levels.filter((x) => x !== l) : [...filters.levels, l] });
  const togT = (t: ProgFocus) => setFilters({ ...filters, targets: filters.targets.includes(t) ? filters.targets.filter((x) => x !== t) : [...filters.targets, t] });
  const togE = (e: ProgEquip) => setFilters({ ...filters, equips: filters.equips.includes(e) ? filters.equips.filter((x) => x !== e) : [...filters.equips, e] });
  return (
    <div className="-mx-5 flex gap-1.5 overflow-x-auto px-5 py-1.5 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
      {PROG_LEVELS.map((l) => <button key={l.id} onClick={() => togL(l.id)} className={chip(filters.levels.includes(l.id))}>{l.label}</button>)}
      {group === "target" ? (
        PROG_EQUIP.map((e) => <button key={e.id} onClick={() => togE(e.id)} className={chip(filters.equips.includes(e.id))}>{e.label}</button>)
      ) : (
        <>
          <button onClick={() => togE("none")} className={chip(filters.equips.includes("none"))}>No equipment</button>
          {PROG_TARGETS.map((t) => <button key={t.id} onClick={() => togT(t.id)} className={chip(filters.targets.includes(t.id))}>{t.label}</button>)}
        </>
      )}
    </div>
  );
}

function ProgCard({ it, onOpen }: { it: ProgramItem; onOpen: (i: ProgramItem) => void }) {
  const meta = it.target || progFocusLabel(it.focus);
  const eq = it.equip !== "none" ? ` · ${progEquipLabel(it.equip)}` : "";
  const sub = `${it.minutes} min · ${progLevelLabel(it.level)} · ${meta}${eq}`;
  return <ListRow seed={it.id} emoji={FOCUS_EMOJI_P[it.focus]} title={it.title} subtitle={sub} onClick={() => onOpen(it)} />;
}

function ProgramsSection({ onOpenHeader }: { onOpenHeader: (h: ProgramHeader) => void }) {
  return (
    <div className="pb-1">
      {PROG_GROUPS.map((g) => (
        <section key={g.id} className="pt-4">
          <h2 className="px-1 font-display text-[16px] font-bold text-foreground">{g.label}</h2>
          <p className="mt-0.5 px-1 text-[11.5px] leading-snug text-muted-foreground">{g.sub}</p>
          <div className="mt-2.5 grid grid-cols-4 gap-2">
            {headersInGroup(g.id).map((h) => (
              <button key={h.id} onClick={() => onOpenHeader(h)}
                className="flex flex-col items-center gap-1.5 rounded-2xl bg-card p-2.5 text-center ring-1 ring-border/60 active:scale-[0.97]">
                <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-accent/50 text-xl">{h.emoji}</span>
                <span className="text-[9.5px] font-medium leading-tight text-foreground/85">{h.label}</span>
              </button>
            ))}
          </div>
        </section>
      ))}
    </div>
  );
}

/* ================= Program header view (opens "inside") ================= */

function ProgramHeaderView({ header, onClose, onOpen }: {
  header: ProgramHeader; onClose: () => void; onOpen: (i: ProgramItem) => void;
}) {
  const [filters, setFilters] = useState<ProgFilters>(EMPTY_PROG_FILTERS);
  const subs = useMemo(() =>
    header.subs
      .map((s) => ({ ...s, items: s.items.filter((it) => matchItem(it, filters)) }))
      .filter((s) => s.items.length), [header, filters]);
  const total = subs.reduce((a, s) => a + s.items.length, 0);

  return (
    <div className="fixed inset-0 z-50 flex flex-col" style={{ background: "var(--gradient-hero)" }}>
      <div className="px-5 pb-3 pt-[max(1rem,env(safe-area-inset-top))]" style={{ background: "var(--gradient-night)" }}>
        <div className="flex items-center gap-3">
          <button onClick={onClose} className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-white/15 text-primary-foreground"><ArrowLeft size={16} /></button>
          <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-white/15 text-2xl">{header.emoji}</span>
          <div className="min-w-0">
            <h2 className="truncate font-display text-[19px] font-bold leading-tight text-primary-foreground">{header.label}</h2>
            <p className="truncate text-[11.5px] text-primary-foreground/80">{total} programs</p>
          </div>
        </div>
      </div>

      <div className="border-b border-border/60 bg-background/85 backdrop-blur-xl">
        <ProgFilterRow group={header.group} filters={filters} setFilters={setFilters} />
      </div>

      <div className="flex-1 overflow-y-auto px-5 pb-[max(1.5rem,env(safe-area-inset-bottom))] pt-3">
        {subs.length === 0 ? (
          <div className="mt-2 rounded-3xl bg-card p-6 text-center ring-1 ring-border/60">
            <p className="text-[13.5px] font-semibold text-foreground">No programs match</p>
            <p className="mt-1 text-[12px] text-muted-foreground">Try removing a filter or two.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {subs.map((s) => (
              <section key={s.label}>
                <p className="px-1 text-[11.5px] font-bold uppercase tracking-wide text-foreground/60">{s.emoji} {s.label}</p>
                <div className="mt-0.5 divide-y divide-border/50">
                  {s.items.map((it) => <ProgCard key={it.id} it={it} onOpen={onOpen} />)}
                </div>
              </section>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function ProgramDetail({ item, onClose, onStart }: {
  item: ProgramItem; onClose: () => void; onStart: (steps: Step[], i: number) => void;
}) {
  const kg = bodyWeight();
  const steps = useMemo(() => programSteps(item), [item]);
  const total = steps.reduce((a, x) => a + x.sec, 0);
  const kcal = steps.reduce((a, x) => a + stepKcal(x, kg), 0);

  return (
    <div className="fixed inset-0 z-50 flex flex-col" style={{ background: "var(--gradient-hero)" }}>
      <div className="relative overflow-hidden px-5 pb-5 pt-[max(1rem,env(safe-area-inset-top))]" style={{ background: "var(--gradient-night)" }}>
        <div className="absolute -right-10 -top-10 h-40 w-40 rounded-full bg-rose-400/20 blur-3xl" />
        <div className="relative flex items-center justify-between">
          <button onClick={onClose} className="flex h-9 w-9 items-center justify-center rounded-full bg-white/15 text-primary-foreground"><ArrowLeft size={16} /></button>
          <button onClick={() => onStart(steps, 0)} className="flex items-center gap-1.5 rounded-full bg-white px-5 py-2 text-[13px] font-bold text-rose-600 shadow"><Play size={14} className="fill-current" /> Start</button>
        </div>
        <div className="relative mt-4">
          <h2 className="font-display text-[21px] font-extrabold leading-tight text-primary-foreground">{item.title}</h2>
          <p className="mt-0.5 text-[12px] text-primary-foreground/80">{toMin(total)} min · {progLevelLabel(item.level)} · {steps.length} exercises · 🔥 {kcal} kcal</p>
        </div>
      </div>
      <div className="flex-1 overflow-y-auto px-5 pb-8 pt-4">
        <p className="mb-2 px-1 text-[11px] text-muted-foreground">Tap any exercise to start from there.</p>
        <div className="space-y-1.5">
          {steps.map((st, i) => (
            <button key={i} onClick={() => onStart(steps, i)} className="flex w-full items-center gap-3 rounded-2xl bg-card p-2.5 text-left ring-1 ring-border/60 active:scale-[0.99]">
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-accent/50 text-[11px] font-bold text-foreground/70">{i + 1}</span>
              <div className="min-w-0 flex-1">
                <p className="truncate text-[13px] font-semibold text-foreground">{st.name}</p>
                <p className="text-[11px] text-muted-foreground">{fmt(st.sec)} · 🔥 {stepKcal(st, kg)} kcal</p>
              </div>
              <Play size={14} className="shrink-0 text-primary" />
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

/* ================= Editable Weekly Plan template ================= */

function MyWeekCard({ onOpenSession }: { onOpenSession: (s: Session) => void }) {
  const kg = bodyWeight();
  const [week, setWeek] = useState<MyWeek>(() => ({ options: DEFAULT_WEEK_OPTIONS, days: [], updatedAt: 0 }));
  const [done, setDone] = useState<number[]>([]);
  const [editOpen, setEditOpen] = useState(false);
  const [swapNum, setSwapNum] = useState<number | null>(null);
  useEffect(() => { setWeek(getMyWeek()); setDone(weekDone()); }, []);

  const custom = week.updatedAt > 0;
  const styleSet = week.options.styles;
  const objLabel = OBJECTIVES.find((o) => o.id === week.options.objective)?.label ?? "General";
  const togStyle = (id: string) => {
    const styles = styleSet.includes(id) ? styleSet.filter((x) => x !== id) : [...styleSet, id];
    regen({ ...week.options, styles });
  };
  const toggle = (day: number) => setDone(setWeekDone(day, !done.includes(day)));
  const regen = (opts: WeekOptions) => { const m = saveMyWeek(opts); setWeek(m); setDone([]); setEditOpen(false); };
  const reset = () => { const m = resetMyWeek(); setWeek(m); setDone([]); };

  return (
    <section className="pt-4">
      <div className="rounded-3xl bg-card p-4 ring-1 ring-border/60">
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0">
            <p className="font-display text-[15px] font-bold text-foreground">🗓️ My Weekly Plan</p>
            <p className="mt-0.5 text-[11px] leading-snug text-muted-foreground">
              {custom ? `${objLabel} · ${week.options.level === "any" ? "all levels" : levelLabel(week.options.level as Level)} · ${week.options.activeDays} days/wk` : "Default balanced week — Customize to make it yours."}
            </p>
          </div>
          <button onClick={() => setEditOpen(true)} className="flex shrink-0 items-center gap-1 rounded-full bg-primary px-3 py-1.5 text-[11.5px] font-bold text-primary-foreground"><Sliders size={12} /> Customize</button>
        </div>

        {/* quick pickers: level · equipment · style */}
        <div className="mt-2.5 space-y-1.5">
          <PickRow label="Level" opts={[{ id: "any", label: "Any" }, ...LEVELS]} value={week.options.level}
            onPick={(v) => regen({ ...week.options, level: v as Level | "any" })} />
          <PickRow label="Equip" opts={[{ id: "any", label: "Any" }, { id: "none", label: "No equipment" }]} value={week.options.equip[0] ?? "any"}
            onPick={(v) => regen({ ...week.options, equip: v === "any" ? [] : [v as Equip] })} />
          <div className="flex items-start gap-2">
            <span className="mt-1 w-12 shrink-0 text-[10px] font-bold uppercase tracking-wide text-foreground/50">Style</span>
            <div className="-mr-4 flex flex-1 gap-1.5 overflow-x-auto pr-4 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
              <button onClick={() => regen({ ...week.options, styles: [] })}
                className={`shrink-0 rounded-full px-2.5 py-1 text-[11px] font-semibold transition ${styleSet.length === 0 ? "bg-primary text-primary-foreground" : "bg-secondary text-foreground/70"}`}>🎛️ Mix</button>
              {DAY_STYLES.map((sw) => (
                <button key={sw.id} onClick={() => togStyle(sw.id)}
                  className={`shrink-0 rounded-full px-2.5 py-1 text-[11px] font-semibold transition ${styleSet.includes(sw.id) ? "bg-primary text-primary-foreground" : "bg-secondary text-foreground/70"}`}>
                  {sw.emoji} {sw.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="mt-3 space-y-1.5">
          {week.days.map((d) => {
            const s = d.sessionId ? getSession(d.sessionId) : undefined;
            const isDone = done.includes(d.day);
            return (
              <div key={d.day} className="flex items-center gap-2.5 rounded-2xl bg-secondary/40 p-2">
                <span className={`flex h-8 w-8 shrink-0 flex-col items-center justify-center rounded-lg text-[9px] font-bold leading-none ${isDone ? "bg-primary text-primary-foreground" : "bg-accent/60 text-foreground/70"}`}>
                  <span className="text-[7px] opacity-70">DAY</span>{d.day}
                </span>
                <button onClick={() => s && onOpenSession(s)} disabled={!s} className="min-w-0 flex-1 text-left disabled:cursor-default">
                  <p className="truncate text-[12.5px] font-semibold text-foreground">{s ? s.title : "Rest day"}</p>
                  <p className="truncate text-[10.5px] text-muted-foreground">{s ? `${bucketOf(s.bucket)?.label} · ${s.minutes} min · 🔥 ${sessionKcal(s, kg)} kcal` : d.note}</p>
                </button>
                {!d.rest && <button onClick={() => setSwapNum(d.day)} title="Swap this day's style" className="shrink-0 rounded-full bg-secondary p-1.5 text-foreground/55"><Shuffle size={12} /></button>}
                {s && <button onClick={() => onOpenSession(s)} className="shrink-0 rounded-full bg-primary/10 p-1.5 text-primary"><Play size={12} /></button>}
                <button onClick={() => toggle(d.day)} className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full ${isDone ? "bg-emerald-500 text-white" : "bg-card text-muted-foreground ring-1 ring-border/60"}`}><Check size={11} strokeWidth={3} /></button>
              </div>
            );
          })}
        </div>
        {custom && <button onClick={reset} className="mt-2 text-[11px] font-semibold text-muted-foreground">Reset to default</button>}
      </div>
      {editOpen && <WeekEditorSheet initial={week.options} onClose={() => setEditOpen(false)} onGenerate={regen} />}
      {swapNum !== null && (
        <DayEditor day={swapNum} onClose={() => setSwapNum(null)}
          onPick={(spec) => { setWeek((w) => editDay(w, swapNum, spec)); setSwapNum(null); }} />
      )}
    </section>
  );
}

function PickRow({ label, opts, value, onPick }: { label: string; opts: { id: string; label: string }[]; value: string; onPick: (id: string) => void }) {
  return (
    <div className="flex items-center gap-2">
      <span className="w-12 shrink-0 text-[10px] font-bold uppercase tracking-wide text-foreground/50">{label}</span>
      <div className="flex flex-wrap gap-1.5">
        {opts.map((o) => (
          <button key={o.id} onClick={() => onPick(o.id)}
            className={`rounded-full px-2.5 py-1 text-[11px] font-semibold ${value === o.id ? "bg-primary text-primary-foreground" : "bg-secondary text-foreground/70"}`}>
            {o.label}
          </button>
        ))}
      </div>
    </div>
  );
}

function DayEditor({ day, onClose, onPick }: { day: number; onClose: () => void; onPick: (spec: { style?: string; focus?: Focus; rest?: boolean }) => void }) {
  return (
    <Dialog open onOpenChange={(v) => { if (!v) onClose(); }}>
      <DialogContent className="max-w-sm">
        <DialogHeader>
          <DialogTitle className="font-display">Edit Day {day}</DialogTitle>
          <DialogDescription>Set this day to a style, a target area, or a rest day.</DialogDescription>
        </DialogHeader>
        <div className="max-h-[62svh] space-y-3 overflow-y-auto pr-1">
          <button onClick={() => onPick({ rest: true })} className="w-full rounded-2xl bg-secondary px-4 py-2.5 text-[12.5px] font-semibold text-foreground ring-1 ring-border/60">😴 Make it a rest day</button>
          <div>
            <p className="mb-1.5 text-[11px] font-bold uppercase tracking-wide text-foreground/50">By style</p>
            <div className="grid grid-cols-3 gap-2">
              {DAY_STYLES.map((s) => (
                <button key={s.id} onClick={() => onPick({ style: s.id })} className="flex flex-col items-center gap-1 rounded-2xl bg-secondary/60 p-2.5 text-center ring-1 ring-border/50 active:scale-[0.97]">
                  <span className="text-lg">{s.emoji}</span>
                  <span className="text-[9.5px] font-semibold leading-tight text-foreground/80">{s.label}</span>
                </button>
              ))}
            </div>
          </div>
          <div>
            <p className="mb-1.5 text-[11px] font-bold uppercase tracking-wide text-foreground/50">By target area</p>
            <div className="flex flex-wrap gap-1.5">
              {FOCUS_LIST.map((f) => (
                <button key={f.id} onClick={() => onPick({ focus: f.id })} className="rounded-full bg-secondary px-3 py-1.5 text-[12px] font-semibold text-foreground/75">{f.label}</button>
              ))}
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

function WeekEditorSheet({ initial, onClose, onGenerate }: { initial: WeekOptions; onClose: () => void; onGenerate: (o: WeekOptions) => void }) {
  const [objective, setObjective] = useState(initial.objective);
  const [level, setLevel] = useState<Level | "any">(initial.level);
  const [focus, setFocus] = useState<Focus[]>(initial.focus);
  const [minutes, setMinutes] = useState(initial.minutes);
  const [equip, setEquip] = useState<Equip[]>(initial.equip);
  const [styles, setStyles] = useState<string[]>(initial.styles);
  const [problems, setProblems] = useState<string[]>(initial.problems);
  const [activeDays, setActiveDays] = useState(initial.activeDays);
  const chip = (on: boolean) => `rounded-full px-3 py-1.5 text-[12px] font-semibold ${on ? "bg-primary text-primary-foreground" : "bg-secondary text-foreground/75"}`;
  const togF = (f: Focus) => setFocus((c) => c.includes(f) ? c.filter((x) => x !== f) : [...c, f]);
  const togS = (s: string) => setStyles((c) => c.includes(s) ? c.filter((x) => x !== s) : [...c, s]);
  const togP = (p: string) => setProblems((c) => c.includes(p) ? c.filter((x) => x !== p) : [...c, p]);

  return (
    <Dialog open onOpenChange={(v) => { if (!v) onClose(); }}>
      <DialogContent className="max-w-sm">
        <DialogHeader>
          <DialogTitle className="font-display">Customize your week</DialogTitle>
          <DialogDescription>Set what you like — leave the rest on "Any" and we'll fill it.</DialogDescription>
        </DialogHeader>
        <div className="max-h-[62svh] space-y-4 overflow-y-auto pr-1">
          <Field title="Objective / goal">
            <div className="flex flex-wrap gap-1.5">{OBJECTIVES.map((o) => <button key={o.id} onClick={() => setObjective(o.id)} className={chip(objective === o.id)}>{o.label}</button>)}</div>
          </Field>
          <Field title="Any problems? (keeps it safe)">
            <div className="flex flex-wrap gap-1.5">{PROBLEMS.map((p) => <button key={p.id} onClick={() => togP(p.id)} className={chip(problems.includes(p.id))}>{p.label}</button>)}</div>
          </Field>
          <Field title="Level">
            <div className="flex flex-wrap gap-1.5">{([{ id: "any", label: "Any" }, ...LEVELS] as { id: string; label: string }[]).map((l) => <button key={l.id} onClick={() => setLevel(l.id as Level | "any")} className={chip(level === l.id)}>{l.label}</button>)}</div>
          </Field>
          <Field title="Muscle group (optional)">
            <div className="flex flex-wrap gap-1.5">{FOCUS_LIST.map((f) => <button key={f.id} onClick={() => togF(f.id)} className={chip(focus.includes(f.id))}>{f.label}</button>)}</div>
          </Field>
          <Field title="Duration">
            <div className="flex flex-wrap gap-1.5">{[{ v: 0, l: "Any" }, { v: 10, l: "10 min" }, { v: 20, l: "20 min" }, { v: 30, l: "30 min" }, { v: 45, l: "45 min" }].map((d) => <button key={d.v} onClick={() => setMinutes(d.v)} className={chip(minutes === d.v)}>{d.l}</button>)}</div>
          </Field>
          <Field title="Equipment">
            <div className="flex flex-wrap gap-1.5">{([{ id: "any", label: "Any" }, ...EQUIP_ALL] as { id: string; label: string }[]).map((e) => <button key={e.id} onClick={() => setEquip(e.id === "any" ? [] : [e.id as Equip])} className={chip(e.id === "any" ? equip.length === 0 : equip.includes(e.id as Equip))}>{e.label}</button>)}</div>
          </Field>
          <Field title="Type of exercise (optional)">
            <div className="flex flex-wrap gap-1.5">{PLAN_BUCKETS.map((b) => <button key={b.id} onClick={() => togS(b.id)} className={chip(styles.includes(b.id))}>{b.emoji} {b.label}</button>)}</div>
          </Field>
          <Field title="Workout days / week">
            <div className="flex flex-wrap gap-1.5">{[3, 4, 5, 6, 7].map((n) => <button key={n} onClick={() => setActiveDays(n)} className={chip(activeDays === n)}>{n} days</button>)}</div>
          </Field>
        </div>
        <button onClick={() => onGenerate({ objective, level, focus, minutes, equip, styles, problems, activeDays })} className="w-full rounded-2xl bg-primary px-4 py-3 text-sm font-semibold text-primary-foreground">Generate my week</button>
      </DialogContent>
    </Dialog>
  );
}

function DayEditorFull({ day, base, onClose, onSave }: {
  day: number; base: WeekOptions; onClose: () => void;
  onSave: (spec: { style?: string; focus?: Focus; rest?: boolean }, dayOpts: Partial<WeekOptions>) => void;
}) {
  const fc = focusChoicesFor(base.objective); // focus options follow the plan's goal
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
            <Field title="Equipment (pick any)"><div className="flex flex-wrap gap-1.5">{EQUIP_ALL.map((e) => <button key={e.id} onClick={() => togEquip(e.id)} className={chip(equip.includes(e.id))}>{e.label}</button>)}</div></Field>
            <Field title="Style"><div className="flex flex-wrap gap-1.5"><button onClick={() => setStyle("ai")} className={chip(style === "ai")}>{ai}</button>{STYLE_CHOICES.map((s) => <button key={s.id} onClick={() => setStyle(s.id)} className={chip(style === s.id)}>{s.emoji} {s.label}</button>)}</div></Field>
          </div>
        )}
        <button onClick={save} className="w-full rounded-2xl bg-primary px-4 py-3 text-sm font-semibold text-primary-foreground">Save day</button>
      </DialogContent>
    </Dialog>
  );
}

/* ================= Practice Library tab (all buckets & programs) ================= */

function LibraryTab({ onPick, onOpenHeader }: { onPick: (b: Bucket) => void; onOpenHeader: (h: ProgramHeader) => void }) {
  const [goalOpen, setGoalOpen] = useState(false);
  const main = GROUPS.filter((g) => g.id !== "goal");   // Styles + Programs stay prominent
  const goal = GROUPS.find((g) => g.id === "goal");
  const tile = (b: Bucket) => (
    <button key={b.id} onClick={() => onPick(b)}
      className="flex flex-col items-center gap-1.5 rounded-2xl bg-card p-2.5 text-center ring-1 ring-border/60 active:scale-[0.97]">
      <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-accent/50 text-xl">{b.emoji}</span>
      <span className="text-[9.5px] font-medium leading-tight text-foreground/85">{b.label}</span>
    </button>
  );
  return (
    <div className="pb-2">
      <ProgramsSection onOpenHeader={onOpenHeader} />
      {main.map((gr) => (
        <section key={gr.id} className="pt-4">
          <h2 className="px-1 font-display text-[16px] font-bold text-foreground">{gr.label}</h2>
          <p className="mt-0.5 px-1 text-[11.5px] leading-snug text-muted-foreground">{gr.sub}</p>
          <div className="mt-2.5 grid grid-cols-4 gap-2">{bucketsInGroup(gr.id).map(tile)}</div>
        </section>
      ))}

      {goal && (
        <section className="pt-6">
          <button onClick={() => setGoalOpen(!goalOpen)} className="flex w-full items-center gap-2 px-1 text-left">
            <div className="min-w-0 flex-1">
              <h2 className="font-display text-[13.5px] font-bold text-foreground/70">By goal <span className="text-[11px] font-normal text-muted-foreground">· quick single sessions</span></h2>
              <p className="text-[11px] leading-snug text-muted-foreground">Want a full goal-based <b>plan</b>? Use “Build My Personalized Plan”.</p>
            </div>
            <ChevronRight size={15} className={`shrink-0 text-muted-foreground transition-transform ${goalOpen ? "rotate-90" : ""}`} />
          </button>
          {goalOpen && <div className="mt-2 grid grid-cols-4 gap-2">{bucketsInGroup(goal.id).map(tile)}</div>}
        </section>
      )}
    </div>
  );
}

/* ================= My Programs tab (multi-week plan) ================= */

type MorePlan = { id: string; name: string; emoji: string; weeks: number; options: Partial<WeekOptions>; spec: string; default?: boolean; custom?: { lockFocusHidden?: boolean; hideStyleIds?: string[] } };
const GOAL_EMOJI: Record<string, string> = {
  general: "🏃", "lose-weight": "🔥", muscle: "💪", strength: "🏋️", tone: "✨", endurance: "🫀",
  metabolic: "⚡", flexibility: "🤸", posture: "🧍", "stress-relief": "🌙", senior: "🧓", "joint-relief": "🦵", diabetic: "🩺",
};
const GENTLE_GOALS = new Set(["flexibility", "posture", "stress-relief", "senior", "joint-relief", "diabetic"]);
// one ready-made plan per goal in the editor
const GOAL_PLANS: MorePlan[] = OBJECTIVES.map((o) => {
  const gentle = GENTLE_GOALS.has(o.id);
  const minutes = gentle ? 20 : 25;
  return {
    id: `goal-${o.id}`, name: o.label, emoji: GOAL_EMOJI[o.id] ?? "🎯", weeks: 4, default: o.id === "general",
    options: { objective: o.id, level: gentle ? "beginner" : "any", minutes, activeDays: 5 },
    spec: `${o.label} · 4 weeks · ${minutes} min/day · 5 days a week`,
  };
});
// curated specialty plans
const SPECIALTY_PLANS: MorePlan[] = [
  { id: "slim-belly", name: "Slim & Tone Belly", emoji: "🔥", weeks: 4,
    options: { objective: "lose-weight", focus: ["abs"], level: "beginner", minutes: 20, styles: ["cardio", "hiit"], equip: ["none"], activeDays: 5 },
    spec: "15–20 min · Abs & Core · Beginner · 4 weeks · Mix (more cardio) · No equipment (a dumbbell / water bottle works)",
    custom: { lockFocusHidden: true, hideStyleIds: ["gym"] } },
  { id: "slim-legs", name: "Slim Legs", emoji: "🦵", weeks: 4,
    options: { objective: "tone", focus: ["legs"], level: "beginner", minutes: 20, styles: ["cardio", "hiit"], equip: ["none"], activeDays: 5 },
    spec: "15–20 min · Beginner · 4 weeks · Mix (more cardio) · No equipment (a dumbbell / water bottle works)",
    custom: { hideStyleIds: ["gym"] } },
  { id: "full-sculpt", name: "Full-Body Sculpting", emoji: "✨", weeks: 4,
    options: { objective: "tone", focus: ["full-body"], level: "beginner", minutes: 30, styles: ["gym", "calisthenics"], activeDays: 5 },
    spec: "30 min · Full Body · 4 weeks · Gym + Calisthenics" },
  { id: "full-pilates", name: "Full-Body Pilates program", emoji: "🩰", weeks: 4,
    options: { objective: "tone", styles: ["pilates"], minutes: 30, activeDays: 5 },
    spec: "30 min · Pilates · 4 weeks" },
  { id: "abs-core", name: "Abs & Core program", emoji: "🎯", weeks: 3,
    options: { styles: ["abs-program"], focus: ["abs"], minutes: 20, activeDays: 5 },
    spec: "20 min · Abs & Core · 3 weeks" },
  { id: "bed", name: "Bed Workouts", emoji: "🛏️", weeks: 4,
    options: { styles: ["somatic", "senior"], equip: ["none"], minutes: 20, activeDays: 5 },
    spec: "20 min · Gentle · 4 weeks · No equipment" },
  { id: "limited-mobility", name: "Limited Mobility", emoji: "♿", weeks: 4,
    options: { objective: "joint-relief", level: "beginner", equip: ["none"], styles: ["senior", "somatic", "stretching"], minutes: 20, activeDays: 5 },
    spec: "20 min · Gentle & seated-friendly · 4 weeks · No equipment" },
  { id: "chair", name: "Chair Workout", emoji: "🪑", weeks: 4,
    options: { styles: ["senior"], equip: ["none"], minutes: 20, activeDays: 5 },
    spec: "20 min · Seated · 4 weeks · No equipment" },
];
const MORE_PLANS: MorePlan[] = [...GOAL_PLANS, ...SPECIALTY_PLANS];

type SetupInit = { options: WeekOptions; weeks: number; lockFocusHidden?: boolean; hideStyleIds?: string[] };

function MyProgramTab({ onOpenSession, editSignal = 0 }: { onOpenSession: (s: Session) => void; editSignal?: number }) {
  const kg = bodyWeight();
  const [prog, setProg] = useState<MyProgram>(() => ({ name: "Current Fitness Plan", options: DEFAULT_WEEK_OPTIONS, weeks: [], totalWeeks: 4, done: [], onboarded: false, updatedAt: 0 }));
  const [expanded, setExpanded] = useState<number>(1);
  const [setupInit, setSetupInit] = useState<SetupInit | null>(null);
  const [planAction, setPlanAction] = useState<MorePlan | null>(null);
  useEffect(() => { setProg(getProgram()); }, []);
  // "Build My Personalized Plan" hero button opens the same wizard for the current plan
  useEffect(() => { if (editSignal > 0) { const p = getProgram(); setSetupInit({ options: p.options, weeks: p.totalWeeks }); } }, [editSignal]);

  const openDay = (id?: string) => { if (id) { const s = getSession(id); if (s) onOpenSession(s); } };

  return (
    <div className="pb-4">
      {!prog.onboarded && (
        <button onClick={() => setSetupInit({ options: prog.options, weeks: prog.totalWeeks })} className="mt-4 flex w-full items-center gap-3 rounded-3xl p-4 text-left text-primary-foreground shadow-[var(--shadow-glow)]" style={{ background: "var(--gradient-violet)" }}>
          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-white/20 text-lg">✨</span>
          <div className="min-w-0 flex-1"><p className="text-[14px] font-bold">Personalize your plan</p><p className="text-[11px] opacity-90">Tell us your goal, time & preferences — or just follow the standard plan below.</p></div>
          <ChevronRight size={18} className="opacity-80" />
        </button>
      )}

      <section className="pt-4">
        <div className="flex items-center justify-between px-1">
          <h2 className="font-display text-[16px] font-bold text-foreground">{prog.name}</h2>
          <button onClick={() => setSetupInit({ options: prog.options, weeks: prog.totalWeeks })} className="flex items-center gap-1 rounded-full bg-primary px-3 py-1.5 text-[11.5px] font-bold text-primary-foreground"><Sliders size={12} /> Edit plan</button>
        </div>
        <p className="mt-0.5 px-1 text-[11px] leading-snug text-muted-foreground">{prog.totalWeeks}-week plan · use ↑ ↓ to move a rest day; finish a week to unlock the next.</p>

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
                        <div key={d.day} className={`flex items-center gap-2.5 rounded-2xl p-2 ${d.rest ? "bg-secondary/15" : "bg-secondary/40"}`}>
                          <span className={`flex h-8 w-8 shrink-0 flex-col items-center justify-center rounded-lg text-[9px] font-bold leading-none ${d.rest ? "bg-secondary text-muted-foreground/70" : dn ? "bg-primary text-primary-foreground" : "bg-accent/60 text-foreground/70"}`}><span className="text-[7px] opacity-70">DAY</span>{d.day}</span>
                          <button onClick={() => openDay(d.sessionId)} disabled={!s} className="min-w-0 flex-1 text-left disabled:cursor-default">
                            <p className={`truncate text-[12.5px] font-semibold ${d.rest ? "text-muted-foreground" : "text-foreground"}`}>{s ? s.title : "😴 Rest day"}</p>
                            <p className="truncate text-[10.5px] text-muted-foreground">{s ? `${bucketOf(s.bucket)?.label} · ${s.minutes} min · 🔥 ${sessionKcal(s, kg)} kcal` : "Light walk or gentle stretch"}</p>
                          </button>
                          {unlocked && d.rest && (
                            <div className="flex shrink-0 items-center gap-1">
                              <button onClick={() => setProg((p) => moveRestDay(p, wnum, d.day, -1))} title="Move rest day up" className="flex h-7 w-7 items-center justify-center rounded-full bg-secondary text-[13px] font-bold text-foreground/60">↑</button>
                              <button onClick={() => setProg((p) => moveRestDay(p, wnum, d.day, 1))} title="Move rest day down" className="flex h-7 w-7 items-center justify-center rounded-full bg-secondary text-[13px] font-bold text-foreground/60">↓</button>
                            </div>
                          )}
                          {s && <button onClick={() => openDay(d.sessionId)} className="shrink-0 rounded-full bg-primary/10 p-1.5 text-primary"><Play size={12} /></button>}
                          {!d.rest && <button onClick={() => setProg((p) => toggleProgDay(p, wnum, d.day, !isProgDayDone(p, wnum, d.day)))} className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full ${dn ? "bg-emerald-500 text-white" : "bg-card text-muted-foreground ring-1 ring-border/60"}`}><Check size={11} strokeWidth={3} /></button>}
                        </div>
                      );
                    })}
                    {!unlocked && <p className="px-1 pt-1 text-[10.5px] text-muted-foreground">Finish Week {wnum - 1} to unlock this week.</p>}
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

      <section className="pt-6">
        <h2 className="px-1 font-display text-[15px] font-bold text-foreground">Customizable ready-made plans</h2>
        <p className="mt-0.5 px-1 text-[11px] leading-snug text-muted-foreground">Use one as is, or customize and save it as your current plan.</p>
        <div className="mt-2.5 grid grid-cols-2 gap-2.5">
          {MORE_PLANS.map((pl) => (
            <button key={pl.id} onClick={() => setPlanAction(pl)} className="relative flex items-center gap-3 rounded-2xl bg-card p-3 text-left ring-1 ring-border/60 active:scale-[0.98]">
              {pl.default && <span className="absolute right-2 top-2 rounded-full bg-primary/15 px-1.5 py-0.5 text-[8.5px] font-bold text-primary">Default</span>}
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-accent/50 text-xl">{pl.emoji}</span>
              <div className="min-w-0"><p className="truncate text-[12.5px] font-semibold text-foreground">{pl.name}</p><p className="text-[10.5px] text-muted-foreground">{pl.weeks} week{pl.weeks > 1 ? "s" : ""}</p></div>
            </button>
          ))}
        </div>
      </section>

      {setupInit && (
        <ProgramSetupSheet initial={setupInit.options} initialWeeks={setupInit.weeks}
          lockFocusHidden={setupInit.lockFocusHidden} hideStyleIds={setupInit.hideStyleIds}
          onClose={() => setSetupInit(null)}
          onCreate={(opts, weeks) => { setProg(customizeProgram(prog, opts, weeks)); setExpanded(1); setSetupInit(null); }} />
      )}

      {/* More-plans detail: replace current plan, or customize it */}
      <Dialog open={planAction !== null} onOpenChange={(v) => { if (!v) setPlanAction(null); }}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle className="font-display">{planAction?.emoji} {planAction?.name}</DialogTitle>
            <DialogDescription>{planAction?.spec}</DialogDescription>
          </DialogHeader>
          <button onClick={() => { const pl = planAction; if (pl) { const np = startProgram(`Current Fitness Plan (${pl.name})`, { ...DEFAULT_WEEK_OPTIONS, ...pl.options }, pl.weeks); setProg(np); setExpanded(1); } setPlanAction(null); }} className="w-full rounded-2xl bg-primary px-4 py-3 text-sm font-semibold text-primary-foreground">Replace my plan with this</button>
          <button onClick={() => { const pl = planAction; if (pl) setSetupInit({ options: { ...DEFAULT_WEEK_OPTIONS, ...pl.options }, weeks: pl.weeks, lockFocusHidden: pl.custom?.lockFocusHidden, hideStyleIds: pl.custom?.hideStyleIds }); setPlanAction(null); }} className="w-full rounded-2xl bg-secondary px-4 py-3 text-sm font-semibold text-foreground">Customize it to my needs</button>
        </DialogContent>
      </Dialog>
    </div>
  );
}

const WEEKDAYS: { id: string; label: string }[] = [
  { id: "mon", label: "Mon" }, { id: "tue", label: "Tue" }, { id: "wed", label: "Wed" }, { id: "thu", label: "Thu" },
  { id: "fri", label: "Fri" }, { id: "sat", label: "Sat" }, { id: "sun", label: "Sun" },
];

/** iOS-style vertical wheel picker. */
function WheelPicker({ items, value, onChange }: { items: { v: number; label: string }[]; value: number; onChange: (v: number) => void }) {
  const H = 40;
  const ref = useRef<HTMLDivElement>(null);
  const settle = useRef<ReturnType<typeof setTimeout> | null>(null);
  useEffect(() => {
    const el = ref.current; if (!el) return;
    const i = Math.max(0, items.findIndex((x) => x.v === value));
    el.scrollTop = i * H;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  const onScroll = () => {
    if (settle.current) clearTimeout(settle.current);
    settle.current = setTimeout(() => {
      const el = ref.current; if (!el) return;
      const i = Math.max(0, Math.min(items.length - 1, Math.round(el.scrollTop / H)));
      if (items[i].v !== value) onChange(items[i].v);
    }, 80);
  };
  return (
    <div className="relative mx-auto w-full max-w-[220px]" style={{ height: H * 5 }}>
      <div className="pointer-events-none absolute inset-x-4 top-1/2 -translate-y-1/2 rounded-xl bg-primary/10 ring-1 ring-primary/20" style={{ height: H }} />
      <div ref={ref} onScroll={onScroll} className="h-full snap-y snap-mandatory overflow-y-scroll [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        <div style={{ height: H * 2 }} />
        {items.map((it) => (
          <button key={it.v} onClick={() => { onChange(it.v); const el = ref.current; if (el) el.scrollTo({ top: items.findIndex((x) => x.v === it.v) * H, behavior: "smooth" }); }}
            className={`flex w-full snap-center items-center justify-center text-[13px] font-semibold tabular-nums transition-colors ${it.v === value ? "text-foreground" : "text-muted-foreground/40"}`} style={{ height: H }}>{it.label}</button>
        ))}
        <div style={{ height: H * 2 }} />
      </div>
    </div>
  );
}

function ProgramSetupSheet({ initial, initialWeeks, onClose, onCreate, lockFocusHidden, hideStyleIds }: {
  initial: WeekOptions; initialWeeks: number; onClose: () => void; onCreate: (o: WeekOptions, weeks: number) => void;
  lockFocusHidden?: boolean; hideStyleIds?: string[];
}) {
  const [objective, setObjective] = useState(initial.objective);
  const [level, setLevel] = useState<Level>(initial.level === "any" ? "beginner" : initial.level);
  const [minutes, setMinutes] = useState(initial.minutes || 20);
  const [styles, setStyles] = useState<string[]>(initial.styles);
  const [problems, setProblems] = useState<string[]>(initial.problems);
  const [days, setDays] = useState<string[]>(initial.days?.length ? initial.days : ["mon", "tue", "wed", "thu", "fri"]);
  const [weeks, setWeeks] = useState(initialWeeks >= 1 ? initialWeeks : 4);
  const [equipLabels, setEquipLabels] = useState<string[]>(["No equipment"]);
  const [step, setStep] = useState(0);
  const initFocusKeys = () => {
    const opts = focusChoicesFor(initial.objective).options;
    return initial.focus.length ? opts.filter((o) => initial.focus.includes(o.focus)).map((o) => o.key) : [];
  };
  const [focusKeys, setFocusKeys] = useState<string[]>(initFocusKeys);
  const [splitMode, setSplitMode] = useState<"mix" | "perday" | "ai">(initial.styleByDay?.length ? "perday" : "mix");
  const [dayStyles, setDayStyles] = useState<string[]>(initial.styleByDay ?? []);
  const chip = (on: boolean) => `rounded-full px-3 py-1.5 text-[12px] font-semibold ${on ? "bg-primary text-primary-foreground" : "bg-secondary text-foreground/75"}`;
  const togS = (s: string) => { setStyles((c) => c.includes(s) ? c.filter((x) => x !== s) : [...c, s]); setEquipLabels(["No equipment"]); setSplitMode("mix"); setDayStyles([]); };
  const togP = (p: string) => setProblems((c) => c.includes(p) ? c.filter((x) => x !== p) : [...c, p]);
  const togDay = (d: string) => setDays((c) => c.includes(d) ? c.filter((x) => x !== d) : [...c, d]);
  const togFocusKey = (k: string) => setFocusKeys((c) => c.includes(k) ? c.filter((x) => x !== k) : [...c, k]);
  const togEquipLabel = (label: string) => setEquipLabels((c) => {   // "No equipment" is mutually exclusive
    if (label === "No equipment") return ["No equipment"];
    const base = c.filter((x) => x !== "No equipment");
    return base.includes(label) ? (base.filter((x) => x !== label).length ? base.filter((x) => x !== label) : ["No equipment"]) : [...base, label];
  });
  const pickObjective = (id: string) => { setObjective(id); setFocusKeys([]); setStyles([]); };
  const fc = focusChoicesFor(objective);
  const sc = styleChoicesFor(objective);
  const focusHidden = fc.hide || !!lockFocusHidden;
  const styleOptions = sc.options.filter((o) => !hideStyleIds?.includes(o.id));
  const equipItems = sc.auto ? equipmentForStyles(["yoga"]) : equipmentForStyles(styles); // auto goals → No equipment only
  const maxWeeks = objective === "lose-weight" ? 24 : 12;
  const weekValues = Array.from({ length: maxWeeks }, (_, i) => ({ v: i + 1, label: `${i + 1}` }));
  const durValues = [5, 10, 15, 20, 25, 30, 35, 40, 45].map((n) => ({ v: n, label: `${n}` }));
  const activeDays = Math.max(1, days.length);
  const multiStyle = !sc.auto && styles.length > 1;
  const styleLabel = (id: string) => STYLE_CHOICES.find((s) => s.id === id)?.label ?? id;
  const setDayStyle = (i: number, sid: string) => setDayStyles((c) => { const next = c.slice(); next[i] = sid; return next; });
  const initDayStyles = () => setDayStyles(Array.from({ length: activeDays }, (_, i) => styles[i % styles.length]));
  const aiDays = multiStyle ? recommendStyleByDay(objective, styles, activeDays) : [];

  // one question per screen; goal → focus → level → weeks → duration → schedule → protect → style → (mix/split) → equipment
  const steps: string[] = ["goal", ...(focusHidden ? [] : ["focus"]), "level", "length", "duration", "schedule", "protect", ...(sc.auto ? [] : ["style"]), ...(multiStyle ? ["mixsplit"] : []), "equipment"];
  const cur = steps[Math.min(step, steps.length - 1)];
  const isLast = step >= steps.length - 1;

  const create = () => {
    const focus = Array.from(new Set(focusKeys.map((k) => fc.options.find((o) => o.key === k)?.focus).filter(Boolean))) as Focus[];
    const equip = coarseEquip(equipItems, equipLabels);
    const restDay = days.length < 7;   // unscheduled weekdays become rest days
    const styleByDay = !multiStyle ? undefined
      : splitMode === "perday" && dayStyles.some(Boolean) ? dayStyles.slice(0, activeDays)
      : splitMode === "ai" ? aiDays : undefined;
    onCreate({ objective, level, focus, minutes, equip, styles: sc.auto ? [] : styles, problems, activeDays, restDay, days, styleByDay }, Math.min(weeks, maxWeeks));
  };

  const TITLES: Record<string, string> = {
    level: "Your level", goal: "What's your goal?", focus: "Focus area", length: "How many weeks?",
    duration: "How long each day?", schedule: "Weekly schedule", protect: "Any areas we should protect?",
    style: "Any preferred style?", mixsplit: "Mix, or choose per day?", equipment: "Which equipment can you use?",
  };

  return (
    <Dialog open onOpenChange={(v) => { if (!v) onClose(); }}>
      <DialogContent className="max-w-sm">
        <DialogHeader>
          <DialogTitle className="font-display">Edit your plan</DialogTitle>
          <DialogDescription>Step {step + 1} of {steps.length} · {TITLES[cur]}</DialogDescription>
        </DialogHeader>

        <div className="flex gap-1">
          {steps.map((_, i) => <div key={i} className={`h-1 flex-1 rounded-full ${i <= step ? "bg-primary" : "bg-secondary"}`} />)}
        </div>

        <div className="min-h-[34svh] max-h-[52svh] overflow-y-auto pr-1">
          {cur === "level" && (
            <div className="flex flex-wrap gap-1.5">{LEVELS.map((l) => <button key={l.id} onClick={() => setLevel(l.id)} className={chip(level === l.id)}>{l.label}</button>)}</div>
          )}
          {cur === "goal" && (
            <div className="flex flex-wrap gap-1.5">{OBJECTIVES.map((o) => <button key={o.id} onClick={() => pickObjective(o.id)} className={chip(objective === o.id)}>{o.label}</button>)}</div>
          )}
          {cur === "focus" && (
            <div className="flex flex-wrap gap-1.5">{fc.options.map((o) => <button key={o.key} onClick={() => togFocusKey(o.key)} className={chip(focusKeys.includes(o.key))}>{o.label}{o.recommended ? " ⭐" : ""}</button>)}</div>
          )}
          {cur === "length" && (
            <><p className="pb-1 text-center text-[12px] text-muted-foreground">Scroll to pick — up to {maxWeeks} weeks.</p><WheelPicker items={weekValues} value={Math.min(weeks, maxWeeks)} onChange={setWeeks} /><p className="text-center text-[12px] font-semibold text-foreground">{Math.min(weeks, maxWeeks)} week{weeks > 1 ? "s" : ""}</p></>
          )}
          {cur === "duration" && (
            <><p className="pb-1 text-center text-[12px] text-muted-foreground">Up to 45 minutes a day.</p><WheelPicker items={durValues} value={minutes} onChange={setMinutes} /><p className="text-center text-[12px] font-semibold text-foreground">{minutes} min / day</p></>
          )}
          {cur === "schedule" && (
            <div>
              <p className="pb-2 px-1 text-[11px] text-muted-foreground">Pick the days you'll work out — the rest become rest days.</p>
              <div className="grid grid-cols-7 gap-1">
                {WEEKDAYS.map((d) => {
                  const on = days.includes(d.id);
                  return (
                    <button key={d.id} onClick={() => togDay(d.id)} className={`flex h-11 items-center justify-center rounded-xl text-[11px] font-bold ring-1 ${on ? "bg-primary text-primary-foreground ring-primary" : "bg-secondary/40 text-foreground/65 ring-border/60"}`}>{d.label}</button>
                  );
                })}
              </div>
              <p className="mt-2.5 px-1 text-[11px] text-muted-foreground">{days.length} workout day{days.length !== 1 ? "s" : ""} a week{days.length < 7 ? ` · ${7 - days.length} rest` : ""}.</p>
            </div>
          )}
          {cur === "protect" && (
            <div className="flex flex-wrap gap-1.5">
              <button onClick={() => setProblems([])} className={chip(problems.length === 0)}>None</button>
              {PROBLEMS.map((p) => <button key={p.id} onClick={() => togP(p.id)} className={chip(problems.includes(p.id))}>{p.label}</button>)}
            </div>
          )}
          {cur === "style" && (
            <div className="flex flex-wrap gap-1.5">
              <button onClick={() => setStyles([])} className={chip(styles.length === 0)}>Let AI decide</button>
              {styleOptions.map((b) => <button key={b.id} onClick={() => togS(b.id)} className={chip(styles.includes(b.id))}>{b.label}</button>)}
            </div>
          )}
          {cur === "mixsplit" && (
            <div className="space-y-3">
              <p className="px-1 text-[11px] text-muted-foreground">You picked {styles.length} styles. Blend them across the week, or pick what to do on each day?</p>
              <div className="flex flex-wrap gap-1.5">
                <button onClick={() => setSplitMode("mix")} className={chip(splitMode === "mix")}>🎛️ Balanced mix</button>
                <button onClick={() => { if (!dayStyles.some(Boolean)) initDayStyles(); setSplitMode("perday"); }} className={chip(splitMode === "perday")}>📅 Choose per day</button>
                <button onClick={() => setSplitMode("ai")} className={chip(splitMode === "ai")}>🤖 Let AI decide</button>
              </div>
              {splitMode === "perday" && (
                <div className="space-y-1.5">
                  {Array.from({ length: activeDays }).map((_, i) => (
                    <div key={i} className="rounded-2xl bg-secondary/40 p-2.5">
                      <p className="mb-1 px-0.5 text-[11px] font-bold uppercase tracking-wide text-foreground/55">Day {i + 1}</p>
                      <div className="flex flex-wrap gap-1.5">
                        {styles.map((sid) => <button key={sid} onClick={() => setDayStyle(i, sid)} className={chip(dayStyles[i] === sid)}>{styleLabel(sid)}</button>)}
                      </div>
                    </div>
                  ))}
                </div>
              )}
              {splitMode === "ai" && (
                <div className="space-y-1.5">
                  <p className="px-1 text-[11px] text-muted-foreground">🤖 Suggested for your goal — you can switch to "Choose per day" to tweak:</p>
                  {aiDays.map((sid, i) => (
                    <div key={i} className="flex items-center justify-between rounded-2xl bg-secondary/40 px-3 py-2">
                      <span className="text-[11px] font-bold uppercase tracking-wide text-foreground/55">Day {i + 1}</span>
                      <span className="text-[12.5px] font-semibold text-foreground">{styleLabel(sid)}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
          {cur === "equipment" && ((sc.auto ? [] : styles).length > 1 ? (
            <div className="space-y-3">
              <p className="px-1 text-[11px] text-muted-foreground">Based on your styles — pick what you have.</p>
              <div className="flex flex-wrap gap-1.5">
                <button onClick={() => togEquipLabel("No equipment")} className={chip(equipLabels.includes("No equipment"))}>🙅 No equipment</button>
              </div>
              {styles.map((sid) => {
                const meta = STYLE_CHOICES.find((s) => s.id === sid);
                const items = STYLE_EQUIPMENT[sid] ?? [];
                if (!meta || !items.length) return null;
                return (
                  <div key={sid}>
                    <p className="mb-1 px-1 text-[11px] font-bold uppercase tracking-wide text-foreground/50">{meta.emoji} {meta.label}</p>
                    <div className="flex flex-wrap gap-1.5">
                      {items.map((e) => (
                        <button key={sid + e.label} onClick={() => togEquipLabel(e.label)} className={chip(equipLabels.includes(e.label))}>{e.emoji} {e.label}{e.note ? ` (${e.note})` : ""}</button>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <><p className="pb-2 px-1 text-[11px] text-muted-foreground">Based on your style — pick what you have.</p>
            <div className="flex flex-wrap gap-1.5">
              {equipItems.map((e) => (
                <button key={e.label} onClick={() => togEquipLabel(e.label)} className={chip(equipLabels.includes(e.label))}>{e.emoji} {e.label}{e.note ? ` (${e.note})` : ""}</button>
              ))}
            </div></>
          ))}
        </div>

        <div className="flex gap-2">
          {step > 0 && <button onClick={() => setStep((s) => s - 1)} className="rounded-2xl bg-secondary px-5 py-3 text-sm font-semibold text-foreground">Back</button>}
          {isLast
            ? <button onClick={create} className="flex-1 rounded-2xl bg-primary px-4 py-3 text-sm font-semibold text-primary-foreground">Create my plan</button>
            : <button onClick={() => setStep((s) => s + 1)} className="flex-1 rounded-2xl bg-primary px-4 py-3 text-sm font-semibold text-primary-foreground">Next</button>}
        </div>
      </DialogContent>
    </Dialog>
  );
}

/* ================= Practice — Weekly plan + Programs + Styles/Goal (legacy) ================= */

function PracticeTab({ onPick, onOpenHeader, onOpenSession }: { onPick: (b: Bucket) => void; onOpenHeader: (h: ProgramHeader) => void; onOpenSession: (s: Session) => void }) {
  return (
    <div className="pb-2">
      <MyWeekCard onOpenSession={onOpenSession} />
      <ProgramsSection onOpenHeader={onOpenHeader} />
      {GROUPS.map((gr) => (
        <section key={gr.id} className="pt-5">
          <h2 className="px-1 font-display text-[16px] font-bold text-foreground">{gr.label}</h2>
          <p className="mt-0.5 px-1 text-[11.5px] leading-snug text-muted-foreground">{gr.sub}</p>
          <div className="mt-2.5 grid grid-cols-4 gap-2">
            {bucketsInGroup(gr.id).map((b) => (
              <button key={b.id} onClick={() => onPick(b)}
                className="flex flex-col items-center gap-1.5 rounded-2xl bg-card p-2.5 text-center ring-1 ring-border/60 active:scale-[0.97]">
                <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-accent/50 text-xl">{b.emoji}</span>
                <span className="text-[9.5px] font-medium leading-tight text-foreground/85">{b.label}</span>
              </button>
            ))}
          </div>
        </section>
      ))}
    </div>
  );
}

/* ================= Single floating filter row ================= */

function FilterRow({ filters, setFilters }: { filters: ExFilters; setFilters: (f: ExFilters) => void }) {
  const chip = (on: boolean) => `shrink-0 rounded-full px-3.5 py-1.5 text-[12px] font-semibold transition ${on ? "bg-primary text-primary-foreground" : "bg-card text-foreground/70 ring-1 ring-border/60"}`;
  const togL = (l: Level) => setFilters({ ...filters, levels: filters.levels.includes(l) ? filters.levels.filter((x) => x !== l) : [...filters.levels, l] });
  const togE = (eq: Equip) => setFilters({ ...filters, equip: filters.equip.includes(eq) ? filters.equip.filter((x) => x !== eq) : [...filters.equip, eq] });
  const togF = (f: Focus) => setFilters({ ...filters, focus: filters.focus.includes(f) ? filters.focus.filter((x) => x !== f) : [...filters.focus, f] });
  return (
    <div className="border-b border-border/60 bg-background/85 backdrop-blur-xl">
      <div className="flex gap-1.5 overflow-x-auto px-5 py-2.5 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        {LEVELS.map((l) => <button key={l.id} onClick={() => togL(l.id)} className={chip(filters.levels.includes(l.id))}>{l.label}</button>)}
        {EQUIP_FILTERS.map((eq) => <button key={eq.id} onClick={() => togE(eq.id)} className={chip(filters.equip.includes(eq.id))}>{eq.label}</button>)}
        {FOCUS_LIST.map((f) => <button key={f.id} onClick={() => togF(f.id)} className={chip(filters.focus.includes(f.id))}>{f.label}</button>)}
      </div>
    </div>
  );
}

/* ================= Bucket view ================= */

function MusicBar() {
  return (
    <div className="mb-3 rounded-2xl bg-card p-3 ring-1 ring-border/60">
      <p className="flex items-center gap-1.5 text-[12.5px] font-bold text-foreground"><Music size={13} /> Put your music on</p>
      <p className="mt-0.5 text-[11px] text-muted-foreground">Opens your music app in a new tab — press play, then come back.</p>
      <div className="mt-2 flex flex-wrap gap-1.5">
        {MUSIC_LINKS.map((m) => (
          <a key={m.id} href={m.url} target="_blank" rel="noopener noreferrer" className="rounded-full bg-secondary px-3 py-1.5 text-[11.5px] font-semibold text-foreground/75">{m.emoji} {m.label}</a>
        ))}
      </div>
    </div>
  );
}

function BucketView({ bucket, favs, onFav, onClose, onOpenSession }: {
  bucket: Bucket; favs: string[]; onFav: (id: string) => void; onClose: () => void;
  onOpenSession: (s: Session) => void;
}) {
  const kg = bodyWeight();
  const [filters, setFilters] = useState<ExFilters>(EMPTY_FILTERS);
  const sessions = useMemo(() => applyFilters(sessionsIn(bucket.id), filters), [bucket.id, filters]);

  return (
    <div className="fixed inset-0 z-50 flex flex-col" style={{ background: "var(--gradient-hero)" }}>
      <div className="px-5 pb-3 pt-[max(1rem,env(safe-area-inset-top))]" style={{ background: "var(--gradient-night)" }}>
        <div className="flex items-center gap-3">
          <button onClick={onClose} className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-white/15 text-primary-foreground"><ArrowLeft size={16} /></button>
          <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-white/15 text-2xl">{bucket.emoji}</span>
          <div className="min-w-0">
            <h2 className="truncate font-display text-[19px] font-bold leading-tight text-primary-foreground">{bucket.label}</h2>
            <p className="truncate text-[11.5px] text-primary-foreground/80">{bucket.blurb}</p>
          </div>
        </div>
      </div>

      <FilterRow filters={filters} setFilters={setFilters} />

      <div className="flex-1 overflow-y-auto px-5 pb-[max(1.5rem,env(safe-area-inset-bottom))] pt-3">
        {bucket.music && <MusicBar />}
        <p className="px-1 text-[11.5px] font-bold uppercase tracking-wide text-muted-foreground">{sessions.length} sessions</p>
        {sessions.length === 0 ? (
          <div className="mt-2 rounded-3xl bg-card p-6 text-center ring-1 ring-border/60">
            <p className="text-[13.5px] font-semibold text-foreground">No sessions match</p>
            <p className="mt-1 text-[12px] text-muted-foreground">Try removing a filter or two.</p>
          </div>
        ) : bucket.curated && bucket.groups ? (
          <div className="mt-1 space-y-4">
            {bucket.groups.map((g) => {
              const gs = sessions.filter((s) => s.group === g);
              if (!gs.length) return null;
              return (
                <section key={g}>
                  <h3 className="px-1 font-display text-[14px] font-bold text-foreground">{g}</h3>
                  <div className="mt-0.5 divide-y divide-border/50">
                    {gs.map((s) => (
                      <SessionCard key={s.id} s={s} kg={kg} fav={favs.includes(s.id)} onFav={() => onFav(s.id)} onClick={() => onOpenSession(s)} />
                    ))}
                  </div>
                </section>
              );
            })}
          </div>
        ) : (
          <div className="mt-1 divide-y divide-border/50">
            {sessions.map((s) => (
              <SessionCard key={s.id} s={s} kg={kg} fav={favs.includes(s.id)} onFav={() => onFav(s.id)} onClick={() => onOpenSession(s)} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

/* ================= Classics tab — preview + build a bundle ================= */

function ClassicsTab({ onPreviewPlay, onPlayBundle }: {
  onPreviewPlay: (ex: Exercise) => void; onPlayBundle: (name: string, items: BundleItem[]) => void;
}) {
  return (
    <div className="pb-2">
      <section className="pt-4">
        <h2 className="px-1 font-display text-[16px] font-bold text-foreground">🥋 Create your own exercise bundle</h2>
        <p className="mt-0.5 px-1 text-[11.5px] leading-snug text-muted-foreground">
          The timeless staples. Tap any to preview it, then ➕ to build your own bundle and practise it.
        </p>
      </section>
      <BundleSection pool={CLASSICS} defaultName="My classics bundle" onPreviewPlay={onPreviewPlay} onPlayBundle={onPlayBundle} />
    </div>
  );
}

/* ================= Reusable bundle builder ================= */

function BundleSection({ pool, defaultName, onPreviewPlay, onPlayBundle }: {
  pool: Exercise[]; defaultName: string;
  onPreviewPlay: (ex: Exercise) => void; onPlayBundle: (name: string, items: BundleItem[]) => void;
}) {
  const kg = bodyWeight();
  const [items, setItems] = useState<BundleItem[]>([]);
  const [adding, setAdding] = useState<Exercise | null>(null);
  const [preview, setPreview] = useState<Exercise | null>(null);
  const [saveOpen, setSaveOpen] = useState(false);
  const [name, setName] = useState(defaultName);
  const totalSec = bundleSeconds(items);
  const totalKcal = bundleKcal(items, kg);

  const doSave = () => {
    if (!items.length) { toast.error("Add at least one exercise"); return; }
    saveBundle(name.trim() || "My bundle", items);
    toast.success("Bundle saved to My Plans 🧺");
    setSaveOpen(false);
    setItems([]);
  };

  return (
    <section className={`pt-4 ${items.length ? "pb-24" : ""}`}>
      {/* basket */}
      <div className="rounded-3xl bg-card p-4 ring-1 ring-border/60">
        <p className="text-[12.5px] font-semibold text-foreground">🧺 Your bundle</p>
        {items.length === 0 ? (
          <div className="mt-2 flex min-h-[52px] items-center justify-center rounded-2xl border border-dashed border-border/70 bg-secondary/30 px-3 text-center text-[11px] text-muted-foreground">
            Your picked exercises will appear here
          </div>
        ) : (
          <>
            <div className="mt-2 space-y-1.5">
              {items.map((it, i) => {
                const ex = getExercise(it.exId)!;
                return (
                  <div key={i} className="flex items-center gap-2.5 rounded-2xl bg-secondary/40 p-2.5">
                    <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-accent/50 text-base">{ex.emoji}</span>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-[12.5px] font-semibold text-foreground">{ex.name}</p>
                      <p className="text-[11px] text-muted-foreground">{it.sets} × {fmt(it.sec)} · 🔥 {kcalFor(ex.met, it.sets * it.sec, kg)} kcal</p>
                    </div>
                    <button onClick={() => setItems((c) => c.filter((_, x) => x !== i))} className="p-1 text-muted-foreground hover:text-rose-500"><X size={14} /></button>
                  </div>
                );
              })}
            </div>
            <p className="mt-2 text-[11.5px] font-semibold text-foreground/70">{items.length} exercises · {fmt(totalSec)} · 🔥 {totalKcal} kcal</p>
          </>
        )}
      </div>

      {/* pool grid */}
      <p className="mt-4 px-1 text-[11px] font-bold uppercase tracking-wide text-foreground/50">{pool.length} exercises</p>
      <div className="mt-2 grid grid-cols-4 gap-2">
        {pool.map((ex) => {
          const inBasket = items.some((it) => it.exId === ex.id);
          return (
            <div key={ex.id} className="relative">
              <button onClick={() => setPreview(ex)}
                className="flex w-full flex-col items-center gap-1 rounded-2xl bg-card p-2.5 text-center ring-1 ring-border/60 active:scale-[0.97]">
                <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-accent/50 text-xl">{ex.emoji}</span>
                <span className="text-[9px] font-medium leading-tight text-foreground/85">{ex.name}</span>
                <span className="text-[8.5px] text-muted-foreground">{fmt(ex.sec)}</span>
              </button>
              <button onClick={() => setAdding(ex)} title="Add to bundle"
                className={`absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full text-white shadow ${inBasket ? "bg-emerald-500" : "bg-primary/85"}`}>
                {inBasket ? <Check size={11} strokeWidth={3} /> : <Plus size={11} strokeWidth={3} />}
              </button>
            </div>
          );
        })}
      </div>

      {/* floating bar */}
      {items.length > 0 && (
        <div className="fixed inset-x-0 bottom-[92px] z-30 px-5">
          <div className="mx-auto flex max-w-xl items-center gap-2 rounded-2xl bg-primary px-3 py-2.5 text-primary-foreground shadow-[var(--shadow-glow)]">
            <span className="flex-1 text-[12.5px] font-semibold">{items.length} in bundle · {fmt(totalSec)}</span>
            <button onClick={() => setItems([])} className="rounded-full bg-white/20 px-2.5 py-1 text-[11px] font-semibold">Clear</button>
            <button onClick={() => setSaveOpen(true)} className="flex items-center gap-1 rounded-full bg-white/20 px-2.5 py-1.5 text-[11.5px] font-semibold"><Save size={11} /> Save</button>
            <button onClick={() => onPlayBundle(name.trim() || "My bundle", items)} className="flex items-center gap-1 rounded-full bg-white px-3 py-1.5 text-[12px] font-bold text-primary"><Play size={12} /> Practise</button>
          </div>
        </div>
      )}

      {preview && (
        <PreviewSheet ex={preview} kg={kg} onCancel={() => setPreview(null)}
          onPlay={() => { const ex = preview; setPreview(null); onPreviewPlay(ex); }}
          onAdd={() => { const ex = preview; setPreview(null); setAdding(ex); }} />
      )}
      {adding && <SetsSheet ex={adding} kg={kg} onCancel={() => setAdding(null)}
        onAdd={(sets, sec) => { setItems((c) => [...c, { exId: adding.id, sets, sec }]); setAdding(null); }} />}

      <Dialog open={saveOpen} onOpenChange={setSaveOpen}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle className="font-display">Save your bundle</DialogTitle>
            <DialogDescription>It'll show up under My Plans, ready to play anytime.</DialogDescription>
          </DialogHeader>
          <input value={name} onChange={(ev) => setName(ev.target.value)}
            className="w-full rounded-2xl bg-secondary px-3.5 py-3 text-[13.5px] font-semibold text-foreground outline-none ring-1 ring-border/60 focus:ring-primary" />
          <p className="text-[11.5px] text-muted-foreground">{items.length} exercises · {fmt(totalSec)} · 🔥 {totalKcal} kcal</p>
          <button onClick={doSave} className="w-full rounded-2xl bg-primary px-4 py-3 text-sm font-semibold text-primary-foreground">Save bundle</button>
        </DialogContent>
      </Dialog>
    </section>
  );
}

/* muted, image-like thumbnail tints (no rainbow) */
const TINTS = [
  "linear-gradient(135deg,#e9e0cf,#cdbfa2)",
  "linear-gradient(135deg,#e4ddd1,#c5baa4)",
  "linear-gradient(135deg,#e8dac9,#c9b298)",
  "linear-gradient(135deg,#dfe2d6,#bfc4aa)",
  "linear-gradient(135deg,#dfe4ea,#b7c2d0)",
  "linear-gradient(135deg,#eadfe6,#c9b3c4)",
];
function tintOf(seed: string): string {
  let h = 0;
  for (let i = 0; i < seed.length; i++) h = (h * 31 + seed.charCodeAt(i)) >>> 0;
  return TINTS[h % TINTS.length];
}

/** Shared BetterMe-style list row — used inside styles, programs and favourites so they all match. */
function ListRow({ seed, emoji, title, subtitle, fav, onFav, onClick }: {
  seed: string; emoji: string; title: string; subtitle: string;
  fav?: boolean; onFav?: () => void; onClick: () => void;
}) {
  return (
    <div className="flex items-center gap-3 py-2.5">
      <button onClick={onClick} className="flex h-16 w-16 shrink-0 items-center justify-center overflow-hidden rounded-2xl text-[27px] shadow-inner active:scale-[0.97]" style={{ background: tintOf(seed) }}>{emoji}</button>
      <button onClick={onClick} className="min-w-0 flex-1 text-left">
        <p className="truncate text-[14px] font-semibold text-foreground">{title}</p>
        <p className="mt-0.5 truncate text-[11.5px] text-muted-foreground">{subtitle}</p>
      </button>
      {fav !== undefined && (
        <button onClick={onFav} className="shrink-0 p-1.5" aria-label="Favourite">
          <Heart size={18} className={fav ? "fill-rose-500 text-rose-500" : "text-muted-foreground"} />
        </button>
      )}
      <ChevronRight size={17} className="shrink-0 text-muted-foreground" />
    </div>
  );
}

function SessionCard({ s, kg, fav, onFav, onClick }: { s: Session; kg: number; fav: boolean; onFav: () => void; onClick: () => void }) {
  const b = bucketOf(s.bucket)!;
  const kcal = useMemo(() => sessionKcal(s, kg), [s, kg]);
  const sub = `${s.minutes} min · ${levelLabel(s.level)} · 🔥 ${kcal} kcal${s.equip !== "none" ? ` · ${equipLabel(s.equip)}` : ""}`;
  return <ListRow seed={s.id} emoji={b.emoji} title={s.title} subtitle={sub} fav={fav} onFav={onFav} onClick={onClick} />;
}

function PreviewSheet({ ex, kg, onCancel, onPlay, onAdd }: { ex: Exercise; kg: number; onCancel: () => void; onPlay: () => void; onAdd: () => void }) {
  return (
    <Dialog open onOpenChange={(v) => { if (!v) onCancel(); }}>
      <DialogContent className="max-w-sm">
        <DialogHeader>
          <DialogTitle className="font-display flex items-center gap-2"><span className="text-2xl">{ex.emoji}</span> {ex.name}</DialogTitle>
          <DialogDescription>Have a look before you add it.</DialogDescription>
        </DialogHeader>
        <div className="flex items-center justify-center rounded-3xl bg-accent/40 py-8 ring-1 ring-border/60">
          <span className="text-[72px] leading-none">{ex.emoji}</span>
        </div>
        {ex.how && <p className="text-[12.5px] leading-relaxed text-foreground/80">{ex.how}</p>}
        <p className="text-[11.5px] text-muted-foreground">Suggested {fmt(ex.sec)} per set · 🔥 ~{kcalFor(ex.met, ex.sec, kg)} kcal</p>
        <div className="flex gap-2">
          <button onClick={onPlay} className="flex flex-1 items-center justify-center gap-1.5 rounded-2xl bg-secondary px-3 py-3 text-[13px] font-semibold text-foreground ring-1 ring-border/60"><Play size={14} /> Play</button>
          <button onClick={onAdd} className="flex flex-1 items-center justify-center gap-1.5 rounded-2xl bg-primary px-3 py-3 text-[13px] font-bold text-primary-foreground"><Plus size={14} strokeWidth={3} /> Add to bundle</button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

function SetsSheet({ ex, kg, onCancel, onAdd }: { ex: Exercise; kg: number; onCancel: () => void; onAdd: (sets: number, sec: number) => void }) {
  const [sets, setSets] = useState(3);
  const [sec, setSec] = useState(ex.sec);
  const chip = (on: boolean) => `rounded-full px-3.5 py-1.5 text-[12.5px] font-semibold ${on ? "bg-primary text-primary-foreground" : "bg-secondary text-foreground/75"}`;
  return (
    <Dialog open onOpenChange={(v) => { if (!v) onCancel(); }}>
      <DialogContent className="max-w-sm">
        <DialogHeader>
          <DialogTitle className="font-display flex items-center gap-2"><span className="text-2xl">{ex.emoji}</span> {ex.name}</DialogTitle>
          <DialogDescription>{ex.how ?? "Choose how many sets and how long each set runs."}</DialogDescription>
        </DialogHeader>
        <div>
          <p className="mb-1.5 text-[11px] font-bold uppercase tracking-wide text-foreground/50">Sets</p>
          <div className="flex flex-wrap gap-1.5">{SET_OPTIONS.map((n) => <button key={n} onClick={() => setSets(n)} className={chip(sets === n)}>{n} set{n > 1 ? "s" : ""}</button>)}</div>
        </div>
        <div>
          <p className="mb-1.5 text-[11px] font-bold uppercase tracking-wide text-foreground/50">Time for 1 set</p>
          <div className="flex flex-wrap gap-1.5">{SEC_OPTIONS.map((n) => <button key={n} onClick={() => setSec(n)} className={chip(sec === n)}>{fmt(n)}</button>)}</div>
        </div>
        <div className="rounded-2xl bg-accent/40 p-3 text-center ring-1 ring-border/60">
          <p className="text-[12.5px] font-semibold text-foreground">{sets} × {fmt(sec)} = <b className="text-primary">{fmt(sets * sec)}</b> of work</p>
          <p className="mt-0.5 text-[11px] text-muted-foreground">🔥 about {kcalFor(ex.met, sets * sec, kg)} kcal · {BREAK_SEC}s break between sets</p>
        </div>
        <button onClick={() => onAdd(sets, sec)} className="w-full rounded-2xl bg-primary px-4 py-3 text-sm font-semibold text-primary-foreground">Add to bundle</button>
      </DialogContent>
    </Dialog>
  );
}

/* ================= Session detail — editable ================= */

const GAP_STEP = 10, GAP_MIN = 5, GAP_MAX = 120;
function sectionOf(kind: Step["kind"]): string { return kind === "warmup" ? "Warm Up" : kind === "cooldown" ? "Cool Down" : "Workout"; }

function SessionDetail({ s, fav, onFav, onClose, onStart }: {
  s: Session; fav: boolean; onFav: () => void; onClose: () => void; onStart: (steps: Step[], i: number) => void;
}) {
  const kg = bodyWeight();
  const b = bucketOf(s.bucket)!;
  const [steps, setSteps] = useState<Step[]>(() => stepsOf(s));

  const total = steps.reduce((a, x) => a + x.sec, 0);
  const kcal = steps.reduce((a, x) => a + stepKcal(x, kg), 0);
  const exCount = steps.filter((x) => x.kind !== "break").length;

  const removeAt = (i: number) => setSteps((cur) => cur.filter((_, x) => x !== i));
  const adjustGap = (i: number, delta: number) => setSteps((cur) => cur.map((st, x) => x === i ? { ...st, sec: Math.max(GAP_MIN, Math.min(GAP_MAX, st.sec + delta)) } : st));
  const addGapAfter = (i: number) => setSteps((cur) => {
    const next = cur.slice();
    next.splice(i + 1, 0, { exId: "break", name: "Break", emoji: "⏸️", sec: BREAK_SEC, kind: "break" });
    return next;
  });

  let lastSection = "";

  return (
    <div className="fixed inset-0 z-50 flex flex-col" style={{ background: "var(--gradient-hero)" }}>
      <div className="relative overflow-hidden px-5 pb-5 pt-[max(1rem,env(safe-area-inset-top))]" style={{ background: "var(--gradient-night)" }}>
        <div className="absolute -right-10 -top-10 h-40 w-40 rounded-full bg-rose-400/20 blur-3xl" />
        <div className="relative flex items-center justify-between">
          <button onClick={onClose} className="flex h-9 w-9 items-center justify-center rounded-full bg-white/15 text-primary-foreground"><ArrowLeft size={16} /></button>
          <div className="flex items-center gap-2">
            <button onClick={onFav} className="flex h-9 w-9 items-center justify-center rounded-full bg-white/15"><Heart size={16} className={fav ? "fill-rose-400 text-rose-400" : "text-primary-foreground"} /></button>
            <button onClick={() => onStart(steps, 0)} className="flex items-center gap-1.5 rounded-full bg-white px-5 py-2 text-[13px] font-bold text-rose-600 shadow"><Play size={14} className="fill-current" /> Start</button>
          </div>
        </div>
        <div className="relative mt-4 flex items-center gap-3">
          <span className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-white/15 text-3xl">{b.emoji}</span>
          <div className="min-w-0">
            <h2 className="font-display text-[21px] font-extrabold leading-tight text-primary-foreground">{s.title}</h2>
            <p className="mt-0.5 text-[12px] text-primary-foreground/80">{toMin(total)} min · {levelLabel(s.level)} · {exCount} exercises · 🔥 {kcal} kcal</p>
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto px-5 pb-8 pt-4">
        <p className="mb-2 px-1 text-[11px] text-muted-foreground">Tap an exercise to start from there. Remove any you want to skip, or tweak the breaks.</p>
        <div className="space-y-1.5">
          {steps.map((st, i) => {
            const rows: React.ReactNode[] = [];
            const sec = sectionOf(st.kind);
            if (st.kind !== "break" && sec !== lastSection) {
              lastSection = sec;
              rows.push(
                <p key={`h-${i}`} className="px-1 pt-3 text-[11.5px] font-bold uppercase tracking-wide text-foreground/60">{sec}</p>
              );
            }
            if (st.kind === "break") {
              rows.push(
                <div key={i} className="flex items-center gap-2 rounded-2xl bg-secondary/40 px-3 py-2">
                  <span className="text-base">⏸️</span>
                  <p className="flex-1 text-[12px] font-semibold text-muted-foreground">Break · {fmt(st.sec)}</p>
                  <button onClick={() => adjustGap(i, -GAP_STEP)} className="flex h-7 w-7 items-center justify-center rounded-full bg-card ring-1 ring-border/60"><Minus size={13} /></button>
                  <button onClick={() => adjustGap(i, GAP_STEP)} className="flex h-7 w-7 items-center justify-center rounded-full bg-card ring-1 ring-border/60"><Plus size={13} /></button>
                  <button onClick={() => removeAt(i)} className="p-1 text-muted-foreground hover:text-rose-500"><X size={14} /></button>
                </div>
              );
            } else {
              const nextIsBreak = steps[i + 1]?.kind === "break";
              const isLast = i === steps.length - 1;
              rows.push(
                <div key={i} className="flex items-center gap-3 rounded-2xl bg-card p-2.5 ring-1 ring-border/60">
                  <button onClick={() => onStart(steps, i)} className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-accent/50 text-lg">{st.emoji}</button>
                  <button onClick={() => onStart(steps, i)} className="min-w-0 flex-1 text-left">
                    <p className="truncate text-[13px] font-semibold text-foreground">{st.name}</p>
                    <p className="text-[11px] text-muted-foreground">{fmt(st.sec)} · 🔥 {stepKcal(st, kg)} kcal</p>
                  </button>
                  {!nextIsBreak && !isLast && (
                    <button onClick={() => addGapAfter(i)} title="Add a break after" className="rounded-full bg-secondary px-2 py-1 text-[10px] font-semibold text-foreground/70">+ break</button>
                  )}
                  <button onClick={() => removeAt(i)} className="p-1 text-muted-foreground hover:text-rose-500"><X size={15} /></button>
                </div>
              );
            }
            return rows;
          })}
        </div>
        <p className="mt-4 text-center text-[12px] text-muted-foreground">💪 {exCount} exercises · {toMin(total)} min</p>
      </div>
    </div>
  );
}

/* ================= Player ================= */

export function Player({ src, onClose }: { src: PlaySource; onClose: () => void }) {
  const kg = bodyWeight();
  const steps = src.steps;
  const [idx, setIdx] = useState(Math.min(src.startIndex, steps.length - 1));
  const cur = steps[idx];
  const [secs, setSecs] = useState(cur.sec);
  const [playing, setPlaying] = useState(true);
  const [done, setDone] = useState(false);
  const [exitOpen, setExitOpen] = useState(false);
  const [listOpen, setListOpen] = useState(false);
  const [elapsed, setElapsed] = useState(0);
  const [rest, setRest] = useState<number | null>(null);
  const kcalRef = useRef(0);
  const [kcal, setKcal] = useState(0);
  const [readyLen, setReadyLen] = useState(3);           // GET READY countdown length (tap to change)
  const [ready, setReady] = useState<number | null>(cur.kind === "break" ? null : 3);
  const [infoOpen, setInfoOpen] = useState(false);

  // reset the per-step timer + GET READY countdown whenever the step changes
  useEffect(() => { setSecs(steps[idx].sec); setReady(steps[idx].kind === "break" ? null : readyLen); }, [idx, steps]); // eslint-disable-line react-hooks/exhaustive-deps
  useEffect(() => { if (done && src.preview) onClose(); }, [done, src.preview, onClose]);

  useEffect(() => {
    if (!playing || done) return;
    const t = setTimeout(() => {
      // GET READY countdown — the exercise demo runs but the timer below hasn't started yet
      if (ready !== null) { setReady(ready > 1 ? ready - 1 : null); return; }
      setElapsed((e) => e + 1);
      if (rest !== null) { setRest(rest > 1 ? rest - 1 : null); return; }
      const st = steps[idx];
      if (st.kind !== "break") {
        kcalRef.current += ((st.met ?? getExercise(st.exId)?.met ?? 4) * 3.5 * kg / 200) / 60;
        setKcal(Math.round(kcalRef.current));
      }
      if (secs <= 1) advance(); else setSecs(secs - 1);
    }, 1000);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [secs, playing, done, idx, rest, ready]);

  function advance() { if (idx >= steps.length - 1) { finish(); return; } setIdx((i) => i + 1); }
  function back() { if (idx > 0) setIdx((i) => i - 1); }
  function finish() { setDone(true); setPlaying(false); }

  const minutes = Math.max(1, Math.round(elapsed / 60));
  const isBreak = cur.kind === "break" || rest !== null;
  const nextStep = steps[idx + 1];
  const pct = rest !== null ? 100 - (rest / BREAK_SEC) * 100 : 100 - (secs / (cur.sec || 1)) * 100;
  const exCount = steps.filter((s) => s.kind !== "break").length;
  const exDone = steps.slice(0, idx).filter((s) => s.kind !== "break").length;

  if (done && src.preview) return null;
  if (done) return <FeedbackScreen title={src.title} minutes={minutes} kcal={kcal} exercises={exDone} onClose={onClose} />;

  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-[#0f1419] text-white">
      <div className="flex items-center justify-between px-5 pt-[max(1rem,env(safe-area-inset-top))]">
        <button onClick={() => { setPlaying(false); setExitOpen(true); }} className="flex h-9 w-9 items-center justify-center rounded-full bg-white/10"><X size={16} /></button>
        <p className="text-[12px] font-semibold opacity-80">{src.preview ? "Preview" : `${Math.min(exDone + 1, exCount)} / ${exCount}`} · {src.title}</p>
        <div className="flex items-center gap-2">
          {!isBreak && <button onClick={() => { setPlaying(false); setInfoOpen(true); }} aria-label="Exercise info" className="flex h-9 w-9 items-center justify-center rounded-full bg-white/10"><Info size={16} /></button>}
          <button onClick={() => { setPlaying(false); setListOpen(true); }} disabled={src.preview} className="flex h-9 w-9 items-center justify-center rounded-full bg-white/10 disabled:opacity-30"><ListOrdered size={16} /></button>
        </div>
      </div>

      <div className="mt-3 flex gap-1 px-5">
        {steps.map((_, i) => (
          <div key={i} className="h-1 flex-1 overflow-hidden rounded-full bg-white/15">
            <div className="h-full bg-teal-400 transition-all" style={{ width: i < idx ? "100%" : i === idx ? `${pct}%` : "0%" }} />
          </div>
        ))}
      </div>

      <div className="flex flex-1 flex-col items-center justify-center px-8 text-center">
        {ready !== null ? (
          <>
            <span className="animate-breathe text-[80px] leading-none">{cur.emoji}</span>
            <p className="mt-4 text-[12px] font-bold uppercase tracking-[0.2em] text-teal-300">Get ready</p>
            <h2 className="mt-1 font-display text-2xl font-bold">{cur.name}</h2>
            <button onClick={() => { const nx = readyLen === 3 ? 5 : readyLen === 5 ? 10 : 3; setReadyLen(nx); setReady(nx); }} className="mt-4 flex h-24 w-24 items-center justify-center rounded-full bg-teal-500/15 ring-2 ring-teal-400 active:scale-95">
              <span className="font-display text-6xl font-bold tabular-nums">{ready}</span>
            </button>
            <p className="mt-2 text-[11px] opacity-60">Tap the number to change the countdown</p>
          </>
        ) : isBreak ? (
          <>
            <span className="text-[80px] leading-none">⏸️</span>
            <h2 className="mt-4 font-display text-2xl font-bold text-teal-300">Break</h2>
            <p className="mt-1 text-[13px] opacity-70">{rest !== null ? "Shake it out — we'll resume automatically." : "Catch your breath — next up in a moment."}</p>
            {rest !== null && <button onClick={() => setRest(null)} className="mt-3 rounded-full bg-white/15 px-4 py-2 text-[12px] font-bold">Skip break</button>}
          </>
        ) : (
          <>
            <ProgressRing pct={pct} emoji={cur.emoji} />
            <h2 className="mt-5 font-display text-2xl font-bold">{cur.name}</h2>
            {cur.setLabel && <p className="mt-1 text-[12.5px] font-semibold text-teal-300">{cur.setLabel}</p>}
            {getExercise(cur.exId)?.how && <p className="mt-2 max-w-xs text-[12.5px] leading-relaxed opacity-70">{getExercise(cur.exId)!.how}</p>}
          </>
        )}
        {ready === null && <p className="mt-5 font-display text-5xl font-bold tabular-nums">{fmt(rest !== null ? rest : secs)}</p>}

        <div className="mt-5 flex items-center gap-6">
          <div>
            <p className="font-display text-lg font-bold tabular-nums">{fmt(elapsed)}</p>
            <p className="text-[10px] font-semibold uppercase tracking-wide opacity-60">Elapsed</p>
          </div>
          <span className="h-8 w-px bg-white/15" />
          <div>
            <p className="font-display text-lg font-bold tabular-nums">{kcal}</p>
            <p className="text-[10px] font-semibold uppercase tracking-wide opacity-60">Kcal</p>
          </div>
        </div>
      </div>

      {nextStep && (
        <div className="mx-5 mb-3 flex items-center gap-3 rounded-2xl bg-white/10 p-2.5">
          <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/10 text-lg">{nextStep.emoji}</span>
          <div className="min-w-0 flex-1">
            <p className="text-[10px] font-semibold uppercase tracking-wide opacity-60">Next up</p>
            <p className="truncate text-[13px] font-bold">{nextStep.name}</p>
          </div>
          <span className="text-[12px] font-semibold opacity-70">{fmt(nextStep.sec)}</span>
        </div>
      )}

      <div className="flex items-center justify-center gap-5 px-5">
        <button onClick={back} disabled={idx === 0} className="flex h-12 w-12 items-center justify-center rounded-full bg-white/10 disabled:opacity-30"><ChevronLeft size={22} /></button>
        <button onClick={() => setPlaying(!playing)} className="flex h-16 w-16 items-center justify-center rounded-full bg-teal-500 shadow-lg">{playing ? <Pause size={26} /> : <Play size={26} className="ml-0.5" />}</button>
        <button onClick={advance} className="flex h-12 w-12 items-center justify-center rounded-full bg-white/10"><ChevronRight size={22} /></button>
      </div>

      <div className="mx-auto mb-[max(1.5rem,env(safe-area-inset-bottom))] mt-3 flex gap-4">
        {!isBreak && !src.preview && <button onClick={() => { setRest(BREAK_SEC); setPlaying(true); }} className="text-[12px] font-semibold opacity-70">Take a {BREAK_SEC}s break</button>}
        <button onClick={() => (src.preview ? onClose() : finish())} className="text-[12px] font-semibold opacity-70">{src.preview ? "Close" : "Finish session"}</button>
      </div>

      <Dialog open={listOpen} onOpenChange={(v) => { setListOpen(v); if (!v) setPlaying(true); }}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle className="font-display">All exercises</DialogTitle>
            <DialogDescription>Tap any exercise to jump straight to it.</DialogDescription>
          </DialogHeader>
          <div className="max-h-[55svh] space-y-1.5 overflow-y-auto pr-1">
            {steps.map((st, i) => (
              <button key={i} onClick={() => { setIdx(i); setListOpen(false); setPlaying(true); }}
                className={`flex w-full items-center gap-2.5 rounded-2xl p-2.5 text-left ring-1 ${i === idx ? "bg-primary/10 ring-primary/40" : "bg-secondary/40 ring-border/50"}`}>
                <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-accent/50 text-base">{st.emoji}</span>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-[12.5px] font-semibold text-foreground">{st.name}{st.setLabel ? ` · ${st.setLabel}` : ""}</p>
                  <p className="text-[11px] text-muted-foreground">{fmt(st.sec)}{st.kind !== "break" ? ` · 🔥 ${stepKcal(st, kg)} kcal` : ""}</p>
                </div>
                {i < idx && <Check size={14} className="shrink-0 text-primary" />}
              </button>
            ))}
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={infoOpen} onOpenChange={(v) => { setInfoOpen(v); if (!v) setPlaying(true); }}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle className="font-display">{cur.name}</DialogTitle>
            <DialogDescription>How to do it well — form, breathing and what to avoid.</DialogDescription>
          </DialogHeader>
          <div className="max-h-[60svh] space-y-3 overflow-y-auto pr-1">
            <div>
              <p className="text-[11px] font-bold uppercase tracking-wide text-foreground/50">Instructions</p>
              <p className="mt-1 text-[12.5px] leading-relaxed text-foreground/85">{getExercise(cur.exId)?.how ?? "Move with control through the full range. Keep your core engaged and shoulders relaxed."}</p>
            </div>
            <div>
              <p className="text-[11px] font-bold uppercase tracking-wide text-foreground/50">Breathing</p>
              <ul className="mt-1 space-y-0.5 text-[12.5px] leading-relaxed text-foreground/85">
                <li>• Exhale on the effort (the hard part).</li>
                <li>• Inhale as you release / return.</li>
                <li>• Never hold your breath.</li>
              </ul>
            </div>
            <div>
              <p className="text-[11px] font-bold uppercase tracking-wide text-foreground/50">Common mistakes</p>
              <ul className="mt-1 space-y-0.5 text-[12.5px] leading-relaxed text-foreground/85">
                <li>• Rushing — keep the pace steady and controlled.</li>
                <li>• Locking the joints — keep knees & elbows soft.</li>
                <li>• Losing form to finish faster — quality over speed.</li>
              </ul>
            </div>
          </div>
          <button onClick={() => { setInfoOpen(false); setPlaying(true); }} className="w-full rounded-2xl bg-primary px-4 py-3 text-sm font-semibold text-primary-foreground">Got it</button>
        </DialogContent>
      </Dialog>

      <Dialog open={exitOpen} onOpenChange={(v) => { setExitOpen(v); if (!v) setPlaying(true); }}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle className="font-display">Leaving already?</DialogTitle>
            <DialogDescription>You're {exDone} of {exCount} exercises in — {fmt(elapsed)} done and {kcal} kcal burnt.</DialogDescription>
          </DialogHeader>
          <button onClick={() => { setExitOpen(false); setPlaying(true); }} className="w-full rounded-2xl bg-primary px-4 py-3 text-sm font-semibold text-primary-foreground">Keep going 💪</button>
          {!src.preview && <button onClick={() => { setExitOpen(false); finish(); }} className="w-full rounded-2xl bg-secondary px-4 py-2.5 text-[13px] font-semibold text-foreground">End &amp; save my progress</button>}
          <button onClick={onClose} className="w-full rounded-2xl px-4 py-2 text-[12.5px] font-semibold text-muted-foreground">Quit without saving</button>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function ProgressRing({ pct, emoji }: { pct: number; emoji: string }) {
  const r = 54, c = 2 * Math.PI * r;
  return (
    <div className="relative h-32 w-32">
      <svg viewBox="0 0 128 128" className="h-full w-full -rotate-90">
        <circle cx="64" cy="64" r={r} fill="none" stroke="rgba(255,255,255,0.12)" strokeWidth="7" />
        <circle cx="64" cy="64" r={r} fill="none" stroke="#2dd4bf" strokeWidth="7" strokeLinecap="round"
          strokeDasharray={c} strokeDashoffset={c - (c * Math.min(100, Math.max(0, pct))) / 100} />
      </svg>
      <span className="absolute inset-0 flex items-center justify-center text-[58px] leading-none">{emoji}</span>
    </div>
  );
}

/* ================= Feedback ================= */

const EFFORTS = [
  { id: "easy", emoji: "😌", label: "Too easy" },
  { id: "right", emoji: "💪", label: "Just right" },
  { id: "hard", emoji: "🥵", label: "Too hard" },
];
const MOODS = [
  { id: "great", emoji: "🤩", label: "Great" },
  { id: "good", emoji: "🙂", label: "Good" },
  { id: "ok", emoji: "😐", label: "Okay" },
  { id: "meh", emoji: "😮‍💨", label: "Drained" },
];

function FeedbackScreen({ title, minutes, kcal, exercises, onClose }: {
  title: string; minutes: number; kcal: number; exercises: number; onClose: () => void;
}) {
  const [effort, setEffort] = useState<string | null>(null);
  const [mood, setMood] = useState<string | null>(null);
  const [note, setNote] = useState("");

  const save = (punch: boolean) => {
    const date = new Date().toISOString().slice(0, 10);
    addExHistory({ date, label: title, minutes, kcal });
    if (effort || mood) addFeedback({ date, label: title, effort: effort ?? "-", mood: mood ?? "-", note: note.trim() || undefined });
    if (punch) { addCalEntry({ kind: "out", label: `Workout · ${title} (${minutes}m)`, kcal }); toast.success(`${kcal} kcal added to your cal-out 🔥`); }
    else toast.success("Session saved 💪");
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-[#0f1419] px-6 pb-10 pt-[max(2rem,env(safe-area-inset-top))] text-white">
      <div className="mx-auto max-w-sm">
        <div className="text-center">
          <span className="text-5xl">🎉</span>
          <h2 className="mt-3 font-display text-2xl font-extrabold">Session complete!</h2>
          <p className="mt-1 text-[13px] opacity-70">{title}</p>
        </div>
        <div className="mt-5 grid grid-cols-3 gap-2 text-center">
          {[[fmt(minutes * 60), "Time"], [String(kcal), "Kcal"], [String(exercises), "Exercises"]].map(([v, l]) => (
            <div key={l} className="rounded-2xl bg-white/10 py-3">
              <p className="font-display text-xl font-bold tabular-nums">{v}</p>
              <p className="text-[10px] font-semibold uppercase tracking-wide opacity-60">{l}</p>
            </div>
          ))}
        </div>
        <p className="mt-6 text-[13px] font-semibold">How did that feel?</p>
        <div className="mt-2 grid grid-cols-3 gap-2">
          {EFFORTS.map((e) => (
            <button key={e.id} onClick={() => setEffort(e.id)} className={`rounded-2xl py-3 text-center transition ${effort === e.id ? "bg-teal-500 text-white" : "bg-white/10"}`}>
              <span className="block text-2xl">{e.emoji}</span>
              <span className="mt-1 block text-[11px] font-semibold">{e.label}</span>
            </button>
          ))}
        </div>
        <p className="mt-5 text-[13px] font-semibold">And how are you feeling now?</p>
        <div className="mt-2 grid grid-cols-4 gap-2">
          {MOODS.map((m) => (
            <button key={m.id} onClick={() => setMood(m.id)} className={`rounded-2xl py-3 text-center transition ${mood === m.id ? "bg-teal-500 text-white" : "bg-white/10"}`}>
              <span className="block text-xl">{m.emoji}</span>
              <span className="mt-1 block text-[10px] font-semibold">{m.label}</span>
            </button>
          ))}
        </div>
        <p className="mt-5 text-[13px] font-semibold">Anything to note? <span className="opacity-50">(optional)</span></p>
        <textarea value={note} onChange={(e) => setNote(e.target.value)} rows={2} placeholder="Knee felt tight on lunges…"
          className="mt-2 w-full resize-none rounded-2xl bg-white/10 px-3.5 py-3 text-[13px] text-white outline-none placeholder:text-white/40 focus:ring-1 focus:ring-teal-400" />
        <button onClick={() => save(true)} className="mt-5 w-full rounded-2xl bg-teal-500 px-4 py-3.5 text-sm font-bold text-white">➕ Punch {kcal} kcal to cal-out</button>
        <button onClick={() => save(false)} className="mt-2 w-full rounded-2xl bg-white/10 px-4 py-3 text-[13px] font-semibold">Just save the session</button>
      </div>
    </div>
  );
}

/* ================= My Plans ================= */

function PlansTab({ favs, onFav, onOpenSession, onPlayBundle, onCreate }: {
  favs: string[]; onFav: (id: string) => void; onOpenSession: (s: Session) => void;
  onPlayBundle: (b: Bundle) => void; onCreate: () => void;
}) {
  const kg = bodyWeight();
  const [bundles, setBundles] = useState<Bundle[]>([]);
  const [plans, setPlans] = useState<SavedExPlan[]>([]);
  const [histOpen, setHistOpen] = useState(false);
  useEffect(() => { setBundles(loadBundles()); setPlans(loadMyExPlans()); }, []);
  const favSessions = favs.map(getSession).filter(Boolean) as Session[];

  return (
    <div className="py-4">
      <div className="flex items-center justify-between px-1">
        <h2 className="font-display text-[15px] font-semibold">My plans</h2>
        <button onClick={() => setHistOpen(true)} className="flex items-center gap-1 rounded-full bg-secondary px-2.5 py-1.5 text-[11px] font-semibold text-foreground/75"><History size={11} /> History</button>
      </div>

      <p className="mt-3 px-1 text-[11px] font-bold uppercase tracking-wide text-foreground/50">My bundles</p>
      {bundles.length === 0 ? (
        <p className="mt-1.5 rounded-2xl bg-card p-4 text-center text-[12px] text-muted-foreground ring-1 ring-border/60">
          Open any category and use <b>Create your own bundle</b> to build one.
        </p>
      ) : (
        <div className="mt-1.5 space-y-2">
          {bundles.map((b) => (
            <div key={b.id} className="flex items-center gap-3 rounded-2xl bg-card p-3.5 ring-1 ring-border/60">
              <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-accent/50 text-xl">🧺</span>
              <div className="min-w-0 flex-1">
                <p className="truncate text-[13.5px] font-semibold text-foreground">{b.name}</p>
                <p className="text-[11px] text-muted-foreground">{b.items.length} exercises · {fmt(bundleSeconds(b.items))} · 🔥 {bundleKcal(b.items, kg)} kcal</p>
              </div>
              <button onClick={() => onPlayBundle(b)} className="flex items-center gap-1 rounded-full bg-primary px-3 py-2 text-[12px] font-bold text-primary-foreground"><Play size={12} /> Play</button>
              <button onClick={() => setBundles(deleteBundle(b.id))} className="rounded-full p-1.5 text-muted-foreground hover:text-rose-500"><Trash2 size={14} /></button>
            </div>
          ))}
        </div>
      )}

      <p className="mt-5 px-1 text-[11px] font-bold uppercase tracking-wide text-foreground/50">Favourite sessions</p>
      {favSessions.length === 0 ? (
        <p className="mt-1.5 rounded-2xl bg-card p-4 text-center text-[12px] text-muted-foreground ring-1 ring-border/60">Tap the ♥ on any session to keep it here.</p>
      ) : (
        <div className="mt-0.5 divide-y divide-border/50">
          {favSessions.map((s) => <SessionCard key={s.id} s={s} kg={kg} fav onFav={() => onFav(s.id)} onClick={() => onOpenSession(s)} />)}
        </div>
      )}

      <p className="mt-5 px-1 text-[11px] font-bold uppercase tracking-wide text-foreground/50">Personalized plans</p>
      {plans.length === 0 ? (
        <button onClick={onCreate} className="mt-1.5 flex w-full items-center gap-3 rounded-2xl bg-card p-4 text-left ring-1 ring-border/60">
          <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-accent/50 text-xl">✨</span>
          <div className="flex-1"><p className="text-[13.5px] font-semibold text-foreground">Create your first plan</p><p className="text-[12px] text-muted-foreground">Tailored to your level, time and style.</p></div>
          <ChevronRight size={18} className="text-muted-foreground" />
        </button>
      ) : (
        <div className="mt-1.5 space-y-2">
          {plans.map((p) => (
            <div key={p.id} className="rounded-2xl bg-card p-3.5 ring-1 ring-border/60">
              <div className="flex items-center gap-3">
                <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-accent/50 text-xl">🗓️</span>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-[13.5px] font-semibold text-foreground">{p.title}</p>
                  <p className="text-[11px] text-muted-foreground">{p.minutes} min · {p.sessionIds.length} sessions</p>
                </div>
                <button onClick={() => setPlans(deleteMyExPlan(p.id))} className="rounded-full p-1.5 text-muted-foreground hover:text-rose-500"><Trash2 size={14} /></button>
              </div>
              <div className="mt-2 space-y-1.5">
                {p.sessionIds.map(getSession).filter(Boolean).map((s) => (
                  <button key={(s as Session).id} onClick={() => onOpenSession(s as Session)} className="flex w-full items-center gap-2 rounded-xl bg-secondary/40 px-2.5 py-2 text-left">
                    <span className="text-base">{bucketOf((s as Session).bucket)?.emoji}</span>
                    <span className="flex-1 truncate text-[12px] font-semibold text-foreground">{(s as Session).title}</span>
                    <span className="text-[11px] text-muted-foreground">{(s as Session).minutes}m</span>
                  </button>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      <Dialog open={histOpen} onOpenChange={setHistOpen}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle className="font-display">Workout history</DialogTitle>
            <DialogDescription>Every session you've finished, and the energy burnt.</DialogDescription>
          </DialogHeader>
          <ExHistoryList />
        </DialogContent>
      </Dialog>
    </div>
  );
}

function ExHistoryList() {
  const hist = useMemo(() => [...loadExHistory()].reverse(), []);
  if (hist.length === 0) return <p className="rounded-2xl bg-secondary/50 p-4 text-center text-[12px] text-muted-foreground">No sessions yet — finish a workout to see it here.</p>;
  const totalKcal = hist.reduce((a, h) => a + h.kcal, 0);
  const totalMin = hist.reduce((a, h) => a + h.minutes, 0);
  return (
    <>
      <div className="flex gap-2 text-[11.5px] font-semibold">
        <span className="rounded-full bg-secondary px-2.5 py-1 text-foreground/70">{hist.length} sessions</span>
        <span className="rounded-full bg-secondary px-2.5 py-1 text-foreground/70">{totalMin} min</span>
        <span className="rounded-full bg-emerald-100 px-2.5 py-1 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300">{totalKcal} kcal</span>
      </div>
      <div className="mt-2 max-h-64 space-y-1 overflow-y-auto">
        {hist.map((h, i) => (
          <div key={i} className={`flex items-center justify-between rounded-xl px-3 py-2 text-[12px] ${i % 2 === 0 ? "bg-secondary/40" : "bg-card"}`}>
            <span className="text-muted-foreground">{new Date(h.date).toLocaleDateString(undefined, { day: "numeric", month: "short" })}</span>
            <span className="flex-1 truncate px-2 font-semibold text-foreground">{h.label}</span>
            <span className="text-[11px] font-semibold text-primary">{h.minutes}m · {h.kcal} kcal</span>
          </div>
        ))}
      </div>
    </>
  );
}

/* ================= Learn ================= */

function LearnTab() {
  return <div className="space-y-2 py-4">{WORKOUT_LEARN.map((s) => <LearnBlock key={s.id} s={s} />)}</div>;
}

function LearnBlock({ s }: { s: (typeof WORKOUT_LEARN)[number] }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="overflow-hidden rounded-3xl bg-card ring-1 ring-border/60">
      <button onClick={() => setOpen(!open)} className="flex w-full items-center gap-3 p-4 text-left">
        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-accent/50 text-xl">{s.emoji}</span>
        <span className="flex-1 font-display text-[14.5px] font-bold text-foreground">{s.title}</span>
        <ChevronRight size={16} className={`text-muted-foreground transition-transform ${open ? "rotate-90" : ""}`} />
      </button>
      {open && (
        <div className="border-t border-border/60 p-3">
          {s.intro && <p className="mb-2 px-1 text-[12px] italic text-muted-foreground">{s.intro}</p>}
          <div className="space-y-2">
            {s.articles.map((a) => (
              <div key={a.title} className="rounded-2xl bg-secondary/40 p-3">
                <p className="text-[12.5px] font-bold text-foreground">{a.title}</p>
                <p className="mt-1 text-[12px] leading-relaxed text-foreground/80">{a.body}</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

/* ================= Personalized plan ================= */

function CreatePlanSheet({ onClose, onDone, onStart }: {
  onClose: () => void; onDone: () => void; onStart: (s: Session) => void;
}) {
  const [minutes, setMinutes] = useState(20);
  const [level, setLevel] = useState<Level>("beginner");
  const [intensity, setIntensity] = useState<Intensity>("medium");
  const [equip, setEquip] = useState<Equip>("none");
  const [focus, setFocus] = useState<Focus[]>([]);
  const [buckets, setBuckets] = useState<string[]>([]);

  const togF = (f: Focus) => setFocus((c) => c.includes(f) ? c.filter((x) => x !== f) : [...c, f]);
  const togB = (b: string) => setBuckets((c) => {
    if (c.includes(b)) return c.filter((x) => x !== b);
    if (c.length >= 2) { toast("Pick up to 2"); return c; }
    return [...c, b];
  });

  const build = () => buildExercisePlan({ minutes, level, intensity, equip, focus, buckets });
  const save = () => { saveMyExPlan(build()); toast.success("Plan saved to My Plans 🏋️"); onDone(); };
  const start = () => {
    const plan = build();
    const first = plan.sessionIds.map(getSession).find(Boolean) as Session | undefined;
    if (!first) { toast.error("No matching sessions — loosen a choice."); return; }
    saveMyExPlan(plan);
    onStart(first);
  };
  const chip = (on: boolean) => `rounded-full px-3.5 py-1.5 text-[12.5px] font-semibold ${on ? "bg-primary text-primary-foreground" : "bg-secondary text-foreground/75"}`;

  return (
    <Dialog open onOpenChange={(v) => { if (!v) onClose(); }}>
      <DialogContent className="max-w-sm">
        <DialogHeader>
          <DialogTitle className="font-display">✨ Personalized plan</DialogTitle>
          <DialogDescription>Tell us your preferences — we assemble the sessions.</DialogDescription>
        </DialogHeader>
        <div className="max-h-[62svh] space-y-4 overflow-y-auto pr-1">
          <Field title="1 · Level">
            <div className="flex flex-wrap gap-1.5">{LEVELS.map((l) => <button key={l.id} onClick={() => setLevel(l.id)} className={chip(level === l.id)}>{l.label}</button>)}</div>
          </Field>
          <Field title="2 · Intensity">
            <div className="flex flex-wrap gap-1.5">{INTENSITIES.map((i) => <button key={i.id} onClick={() => setIntensity(i.id)} className={chip(intensity === i.id)}>{i.label}</button>)}</div>
          </Field>
          <Field title="3 · Focus area (optional)">
            <div className="flex flex-wrap gap-1.5">{FOCUS_LIST.map((f) => <button key={f.id} onClick={() => togF(f.id)} className={chip(focus.includes(f.id))}>{f.label}</button>)}</div>
          </Field>
          <Field title="4 · Time">
            <div className="flex flex-wrap gap-1.5">{[10, 20, 30, 45].map((m) => <button key={m} onClick={() => setMinutes(m)} className={chip(minutes === m)}>{m} min</button>)}</div>
          </Field>
          <Field title="5 · Equipment">
            <div className="flex flex-wrap gap-1.5">{EQUIP_ALL.map((e) => <button key={e.id} onClick={() => setEquip(e.id)} className={chip(equip === e.id)}>{e.label}</button>)}</div>
          </Field>
          <Field title="6 · Pick up to 2">
            <div className="flex flex-wrap gap-1.5">
              {PLAN_BUCKETS.map((b) => {
                const on = buckets.includes(b.id);
                return <button key={b.id} onClick={() => togB(b.id)} className={`flex items-center gap-1 ${chip(on)}`}>{b.emoji} {b.label}{on && <Check size={12} strokeWidth={3} />}</button>;
              })}
            </div>
          </Field>
        </div>
        <div className="flex gap-2">
          <button onClick={save} className="flex-1 rounded-2xl bg-secondary px-3 py-2.5 text-[12.5px] font-semibold text-foreground ring-1 ring-border/60">Save for later</button>
          <button onClick={start} className="flex flex-1 items-center justify-center gap-1.5 rounded-2xl bg-primary px-3 py-2.5 text-[12.5px] font-semibold text-primary-foreground"><Play size={13} /> Build &amp; start</button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

function Field({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div>
      <p className="mb-1.5 text-[11px] font-bold uppercase tracking-wide text-foreground/50">{title}</p>
      {children}
    </div>
  );
}
