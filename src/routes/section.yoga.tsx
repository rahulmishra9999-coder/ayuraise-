import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useMemo, useRef, useState } from "react";
import { BottomNav } from "@/components/BottomNav";
import { loadYogaPlans, upsertYogaPlan, removeYogaPlan, setPrimaryPlan, loadBundles, addBundle, removeBundle, newPlanId, MAX_PLANS, WEEKDAYS, themeForWeek, blurbForWeek, dayName, loadYogaProgress, saveYogaProgress, sessionKey, totalSessions, isSessionReady, completeSession, doneToday, DAILY_CAP, BUFFER, type YogaPlan as SavedYogaConfig, type YogaProgress } from "@/lib/yoga-plan";
import { YogaPlanSheet } from "@/components/YogaPlanSheet";
import { YogaProgramSheet } from "@/components/YogaProgramSheet";
import { YOGA_TEMPLATES, CATEGORY_LABELS, CATEGORY_ORDER, templateToPlan, type YogaTemplate } from "@/lib/yoga-templates";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { toast } from "sonner";
import {
  ArrowLeft, Play, Pause, ChevronRight, ChevronLeft, X, Trash2, Volume2, VolumeX, History, Bot, Plus, Check, Sliders, Star, MoreHorizontal,
} from "lucide-react";
import {
  POSES, DURATIONS, GOALS, DISEASES, generatePlan, posesFor, speak, stopSpeaking,
  type Goal, type Disease, type YogaPlan,
} from "@/lib/yoga";
import {
  GOAL_GROUPS, ASANAS, PRANAYAMAS, BANDHAS, MUDRAS, TECH_INTRO,
  sessionFor, techniqueSession, buildBundleSession, yogaKcal,
  loadMyYogaPlans, saveMyYogaPlan, deleteMyYogaPlan, loadYogaHistory, addYogaHistory,
  type LibItem, type SavedYogaPlan, type Technique, type YogaHistoryEntry,
} from "@/lib/yoga-library";
import { YOGA_LEARN_SECTIONS, type LearnSection } from "@/lib/yoga-learn";
import { loadPlan as loadWLPlan } from "@/lib/weight-loss";
import { addCalEntry } from "@/lib/trackers";
import {
  STYLES, styleOf, programsOf, getStyleProgram, programMinutes, styleKcal,
  BALANCED_WEEKS, weeklyPlansFor, completedDays, setDayDone,
  type StyleId, type StyleProgram, type WeeklyPlan,
} from "@/lib/yoga-styles";

export const Route = createFileRoute("/section/yoga")({
  head: () => ({
    meta: [
      { title: "Yoga & Pranayam · AyuRaise" },
      { name: "description", content: "Practise yoga by technique or by goal, build a personalized plan, and learn the science behind it." },
    ],
  }),
  component: YogaSection,
});

type Tab = "popular" | "know" | "learn";

function bodyWeight() { return loadWLPlan()?.currentWeight ?? 68; }

/* Session shape passed to the player. onDone (plan sessions) → auto-punches cal, then asks for one-tap feedback. */
type Session = { title: string; plan: YogaPlan; feedback: boolean; onDone?: (choice: string | null) => void };

function YogaSection() {
  const [tab, setTab] = useState<Tab>("popular");
  const [session, setSession] = useState<Session | null>(null);
  const [createOpen, setCreateOpen] = useState(false);
  const [item, setItem] = useState<LibItem | null>(null);
  const [styleId, setStyleId] = useState<StyleId | null>(null);
  const [prog, setProg] = useState<StyleProgram | null>(null);
  const [week, setWeek] = useState<WeeklyPlan | null>(null);
  const [stylePlay, setStylePlay] = useState<StyleProgram | null>(null);
  const [plans, setPlans] = useState<SavedYogaConfig[]>([]);                  // My Plans (max 3)
  const [bundles, setBundles] = useState<SavedYogaConfig[]>([]);              // saved bundles (Poses tab)
  const [planSheet, setPlanSheet] = useState(false);
  const [sheetInit, setSheetInit] = useState<SavedYogaConfig | null>(null);   // null → brand-new; else edit
  const [program, setProgram] = useState<YogaTemplate | null>(null);         // a program being customised
  const [preview, setPreview] = useState<YogaTemplate | null>(null);         // a ready-made plan being previewed
  const [deletePlan, setDeletePlan] = useState<SavedYogaConfig | null>(null); // plan awaiting delete confirmation
  const [sameGoal, setSameGoal] = useState<{ incoming: SavedYogaConfig; existing: SavedYogaConfig } | null>(null);
  const [fullMsg, setFullMsg] = useState(false);                             // tried to add a 4th plan
  useEffect(() => { setPlans(loadYogaPlans()); setBundles(loadBundles()); }, []);

  const primId = plans.find((p) => p.isPrimary)?.id ?? plans[0]?.id;

  const openNew = () => { setSheetInit(null); setPlanSheet(true); };
  const openEdit = (p: SavedYogaConfig) => { setSheetInit(p); setPlanSheet(true); };
  const closeSheet = () => { setPlanSheet(false); setSheetInit(null); };
  const handleCreate = () => { if (plans.length >= MAX_PLANS) setFullMsg(true); else openNew(); };
  const makePrimary = (p: SavedYogaConfig) => { setPlans(setPrimaryPlan(p.id)); toast.success(`“${p.name ?? p.primary}” is now your primary plan ★`); };
  const toggleFav = (p: SavedYogaConfig) => { setPlans(upsertYogaPlan({ ...p, isFav: !p.isFav })); };
  const confirmDelete = () => { if (deletePlan) { setPlans(removeYogaPlan(deletePlan.id)); toast.success("Plan deleted"); } setDeletePlan(null); };

  /** Add a plan to My Plans (optionally primary); blocks at 3 with a message. */
  const addPlan = (p: SavedYogaConfig, makePrim = false): boolean => {
    const cur = loadYogaPlans();
    if (!cur.some((x) => x.id === p.id) && cur.length >= MAX_PLANS) { setFullMsg(true); return false; }
    let next = upsertYogaPlan(p);
    if (makePrim) next = setPrimaryPlan(p.id);
    setPlans(next);
    return true;
  };

  // Builder (New plan / Edit)
  const onSheetSave = (p: SavedYogaConfig) => {
    const cur = loadYogaPlans();
    if (p.id && cur.some((x) => x.id === p.id)) { setPlans(upsertYogaPlan(p)); closeSheet(); toast.success("Plan saved 🧘"); return; }  // edit in place
    const incoming = { ...p, id: newPlanId() };
    const existing = cur.find((x) => x.primary === incoming.primary);
    if (existing) { setPlanSheet(false); setSheetInit(null); setSameGoal({ incoming, existing }); return; }   // same goal → warn
    if (addPlan(incoming)) { closeSheet(); toast.success("Plan created — first 3 days are ready 🌱"); } else closeSheet();
  };
  const replaceSameGoal = () => { if (sameGoal) { removeYogaPlan(sameGoal.existing.id); addPlan(sameGoal.incoming); toast.success("Plan replaced 🧘"); } setSameGoal(null); };
  const editSameGoal = () => { const ex = sameGoal?.existing; setSameGoal(null); if (ex) openEdit(ex); };

  // Ready-made: customise (sheet) or save as-is (preview)
  const onSaveProgram = (plan: SavedYogaConfig) => { if (addPlan(plan)) toast.success("Added to My Plans 🧘"); setProgram(null); setPreview(null); };
  const onMakePrimaryProgram = (plan: SavedYogaConfig) => { if (addPlan(plan, true)) toast.success("Now your primary plan ★"); setProgram(null); setPreview(null); };

  // Bundles (Poses tab) — up to 3, newest first; a 4th drops the oldest
  const saveBundle = (poseIds: string[]) => {
    if (!poseIds.length) return;
    const plan: SavedYogaConfig = { id: newPlanId(), primary: "My Bundle", secondary: null, level: "Beginner", weeks: 1, daysPerWeek: 7, days: WEEKDAYS.map((w) => w.id), duration: Math.max(5, poseIds.length * 2), protect: [], updatedAt: Date.now(), poseIds };
    setBundles(addBundle(plan)); toast.success("Bundle saved");
  };

  return (
    <div className="min-h-svh pb-28" style={{ background: "var(--gradient-hero)" }}>
      {/* hero */}
      <div className="relative overflow-hidden px-4 pb-4 pt-[max(0.85rem,env(safe-area-inset-top))]" style={{ background: "var(--gradient-night)" }}>
        <div className="absolute -right-16 -top-16 h-40 w-40 rounded-full bg-amber-400/20 blur-3xl" />
        <div className="relative flex items-center gap-2.5">
          <Link to="/home" className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-white/15 text-primary-foreground">
            <ArrowLeft size={15} />
          </Link>
          <SuryaIcon />
          <div className="min-w-0">
            <h1 className="truncate font-display text-[18px] font-extrabold leading-tight text-primary-foreground">Yoga &amp; Pranayam</h1>
            <p className="text-[11.5px] text-primary-foreground/80">Move, breathe, heal — at your pace.</p>
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-xl px-5">
        {/* Create your personalized plan — always on top */}
        <button onClick={handleCreate} className="group mt-4 block w-full overflow-hidden rounded-3xl p-5 text-left text-primary-foreground shadow-[var(--shadow-glow)] transition active:scale-[0.985]" style={{ background: "var(--gradient-violet)" }}>
          <div className="flex items-center gap-3">
            <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-white/20 text-xl">✨</span>
            <div className="min-w-0 flex-1">
              <p className="font-display text-[16px] font-bold leading-tight">Create Your Personalized Yoga Plan</p>
              <p className="mt-1.5 text-[12px] leading-relaxed opacity-90">A yoga journey tailored to your body, goals and lifestyle — with optional real-time feedback from your AI Yoga Instructor.</p>
            </div>
          </div>
          <span className="mt-3.5 inline-flex items-center gap-1.5 rounded-full bg-white px-4 py-2 text-[12.5px] font-bold text-violet-700 shadow-sm transition group-active:gap-2.5">Get started <ChevronRight size={15} /></span>
        </button>

        {/* My Plans (up to 3; one ★ primary shows on the dashboard) */}
        {plans.length > 0 && (
          <section className="mt-4">
            <div className="flex items-baseline justify-between px-1">
              <h2 className="font-display text-[15px] font-bold text-foreground">My Plans</h2>
              <span className="text-[11px] text-muted-foreground">{plans.length}/{MAX_PLANS} · you can have up to {MAX_PLANS}</span>
            </div>
            <div className="mt-2 space-y-2">
              {plans.map((p) => (
                <PlanCard key={p.id} plan={p} isPrimary={p.id === primId} onEdit={() => openEdit(p)} onDelete={() => setDeletePlan(p)} onMakePrimary={() => makePrimary(p)} onToggleFav={() => toggleFav(p)} onPlay={setSession} />
              ))}
            </div>
          </section>
        )}

        {/* main tabs */}
        <div className="sticky top-0 z-30 -mx-5 mt-4 flex gap-1.5 overflow-x-auto bg-background/85 px-5 py-2.5 backdrop-blur-xl [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          {([["popular", "🧘‍♀️ Ready-made Plans"], ["know", "🧘 Select Poses & Practice"], ["learn", "🎓 Learn"]] as const).map(([id, label]) => (
            <button key={id} onClick={() => setTab(id)}
              className={`shrink-0 rounded-full px-3.5 py-1.5 text-[12.5px] font-semibold transition ${tab === id ? "bg-primary text-primary-foreground shadow-[var(--shadow-glow)]" : "bg-card text-foreground/70 ring-1 ring-border/60"}`}>
              {label}
            </button>
          ))}
        </div>

        {tab === "popular" && <PopularPlans favoriteIds={plans.map((p) => p.sourceId).filter(Boolean) as string[]} onPreview={setPreview} />}
        {tab === "know" && <KnowTab onPractise={(title, plan) => setSession({ title, plan, feedback: true })} bundles={bundles} onSaveBundle={saveBundle} onPlayBundle={(p) => setSession({ title: p.primary, plan: buildBundleSession(p.poseIds ?? []), feedback: false })} onDeleteBundle={(id) => setBundles(removeBundle(id))} />}
        {tab === "learn" && <LearnTab onPractise={(title, plan) => setSession({ title, plan, feedback: true })} />}
      </div>

      {item && (
        <DurationSheet item={item} onClose={() => setItem(null)}
          onStart={(plan, feedback) => { setSession({ title: item.label, plan, feedback }); setItem(null); }} />
      )}
      {createOpen && (
        <CreatePlanSheet onClose={() => setCreateOpen(false)}
          onPlay={(title, plan, feedback) => { setSession({ title, plan, feedback }); setCreateOpen(false); }} />
      )}
      {planSheet && (
        <YogaPlanSheet initial={sheetInit} onClose={closeSheet} onSave={onSheetSave} />
      )}
      {preview && (
        <ReadyMadePreview
          template={preview}
          onClose={() => setPreview(null)}
          onCustomize={(t) => { setPreview(null); setProgram(t); }}
          onSave={(t) => onSaveProgram(templateToPlan(t))}
          onMakePrimary={(t) => onMakePrimaryProgram(templateToPlan(t))}
          onPlay={(t) => setSession({ title: t.name, plan: generatePlan("none", toYogaGoal(t.primary), t.duration), feedback: false })}
        />
      )}
      {program && (
        <YogaProgramSheet template={program} onClose={() => setProgram(null)} onSave={onSaveProgram} onMakePrimary={onMakePrimaryProgram} />
      )}
      {sameGoal && (
        <Dialog open onOpenChange={(v) => { if (!v) setSameGoal(null); }}>
          <DialogContent className="max-w-sm">
            <DialogHeader>
              <DialogTitle className="font-display">You already have a {sameGoal.existing.primary} plan</DialogTitle>
              <DialogDescription>Creating another plan for the same goal will replace it — or you can just edit the one you have.</DialogDescription>
            </DialogHeader>
            <button onClick={replaceSameGoal} className="w-full rounded-2xl bg-primary px-4 py-3 text-sm font-semibold text-primary-foreground">🔄 Replace my {sameGoal.existing.primary} plan</button>
            <button onClick={editSameGoal} className="w-full rounded-2xl bg-secondary px-4 py-3 text-[13.5px] font-semibold text-foreground">✏️ Edit my existing plan instead</button>
            <button onClick={() => setSameGoal(null)} className="w-full rounded-2xl px-4 py-1.5 text-[12.5px] font-semibold text-muted-foreground">Cancel</button>
          </DialogContent>
        </Dialog>
      )}
      {fullMsg && (
        <Dialog open onOpenChange={(v) => { if (!v) setFullMsg(false); }}>
          <DialogContent className="max-w-sm">
            <DialogHeader>
              <DialogTitle className="font-display">You have {MAX_PLANS} plans</DialogTitle>
              <DialogDescription>Delete one from My Plans to create a new one.</DialogDescription>
            </DialogHeader>
            <button onClick={() => setFullMsg(false)} className="w-full rounded-2xl bg-primary px-4 py-3 text-sm font-semibold text-primary-foreground">Got it</button>
          </DialogContent>
        </Dialog>
      )}
      {deletePlan && (
        <Dialog open onOpenChange={(v) => { if (!v) setDeletePlan(null); }}>
          <DialogContent className="max-w-sm">
            <DialogHeader>
              <DialogTitle className="font-display">Delete “{deletePlan.name ?? deletePlan.primary}”?</DialogTitle>
              <DialogDescription>This plan and its progress will be removed. You can delete it, or replace it with a new plan.</DialogDescription>
            </DialogHeader>
            <button onClick={() => { const d = deletePlan; confirmDelete(); if (d) { setSheetInit(null); setPlanSheet(true); } }} className="w-full rounded-2xl bg-primary px-4 py-3 text-sm font-semibold text-primary-foreground">🔄 Replace with a new plan</button>
            <button onClick={confirmDelete} className="w-full rounded-2xl bg-rose-500 px-4 py-3 text-sm font-semibold text-white">🗑 Delete plan</button>
            <button onClick={() => setDeletePlan(null)} className="w-full rounded-2xl bg-secondary px-4 py-2.5 text-[13px] font-semibold text-foreground">Cancel</button>
          </DialogContent>
        </Dialog>
      )}
      {session && (
        <SessionPlayer title={session.title} plan={session.plan} feedback={session.feedback} onDone={session.onDone} onClose={() => setSession(null)} />
      )}

      {styleId && (
        <StyleView styleId={styleId} onClose={() => setStyleId(null)} onOpenProgram={setProg} onOpenWeek={setWeek} />
      )}
      {week && (
        <WeeklyPlanView plan={week} onClose={() => setWeek(null)} onOpenProgram={setProg} />
      )}
      {prog && (
        <StyleProgramDetail prog={prog} onClose={() => setProg(null)} onStart={() => { setStylePlay(prog); setProg(null); }} />
      )}
      {stylePlay && (
        <StylePlayer prog={stylePlay} onClose={() => setStylePlay(null)} />
      )}

      <BottomNav />
    </div>
  );
}

/* ================= Current yoga plan card (mirrors the workout plan) ================= */

/** Map a plan's primary focus to a generatable yoga goal (for dummy sessions via the pose engine). */
function toYogaGoal(primary: string): Goal {
  const p = primary.toLowerCase();
  if (/flex|mobil|posture|ache|knee|back|neck|hip|spine|arthritis|joint/.test(p)) return "flexibility";
  if (/strength|ageing|senior|sr\.|balance|osteo|muscle/.test(p)) return "strength";
  if (/weight|metabolic|fatigue|fatty|cholesterol|diabet|gut|belly/.test(p)) return "weight-loss";
  if (/stress|anxiety|sleep|mood|breath|pranayam|migraine|asthma|heart|bp|hypertension/.test(p)) return "stress-relief";
  return "general-wellness";
}

function PlanCard({ plan, isPrimary, onEdit, onDelete, onMakePrimary, onToggleFav, onPlay }: {
  plan: SavedYogaConfig; isPrimary: boolean; onEdit: () => void; onDelete: () => void; onMakePrimary: () => void; onToggleFav: () => void; onPlay: (s: Session) => void;
}) {
  const [progress, setProgress] = useState<YogaProgress>({ done: [], feedback: {} });
  const [showAll, setShowAll] = useState(false);
  const [capOpen, setCapOpen] = useState(false);
  const [menu, setMenu] = useState(false);
  useEffect(() => { setProgress(loadYogaProgress(plan.id)); }, [plan.id]);

  const goal = toYogaGoal(plan.primary);
  const N = totalSessions(plan);
  const doneN = progress.done.length;
  const bundle = !!plan.poseIds?.length;
  const label = plan.name ?? plan.primary;
  const isDone = (i: number) => progress.done.includes(sessionKey(i));

  const play = (i: number) => {
    if (!isDone(i) && doneToday(progress) >= DAILY_CAP) { setCapOpen(true); return; }
    onPlay({
      title: `${label} · Day ${i}`,
      plan: bundle ? buildBundleSession(plan.poseIds!) : generatePlan("none", goal, plan.duration),
      feedback: false,
      onDone: (choice) => {
        setProgress((p) => {
          const np = p.done.includes(sessionKey(i))
            ? { ...p, feedback: choice ? { ...p.feedback, [sessionKey(i)]: choice } : p.feedback }
            : completeSession(p, i, choice);
          saveYogaProgress(plan.id, np);
          return np;
        });
        if (choice && choice !== "good") toast.success("Noted — your sessions will adapt 🌱");
      },
    });
  };

  const open: number[] = [];
  for (let i = 1; i <= N && open.length < BUFFER; i++) if (!isDone(i) && isSessionReady(progress, i)) open.push(i);
  const complete = doneN >= N;
  const next = open[0];
  const menuBtn = "rounded-lg px-2.5 py-1.5 text-[11px] font-semibold text-foreground/80 ring-1 ring-border/60 active:scale-[0.97]";

  return (
    <div className="rounded-2xl bg-card ring-1 ring-border/60">
      <div className="flex items-center gap-2.5 p-2.5">
        <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-accent/50 text-[16px]">{bundle ? "🧺" : "🧘"}</span>
        <button onClick={() => (next ? play(next) : setShowAll(true))} className="min-w-0 flex-1 text-left">
          <div className="flex items-center gap-1.5">
            <p className="truncate text-[12.5px] font-bold text-foreground">{label}</p>
            {isPrimary && <span className="shrink-0 rounded-full bg-amber-400 px-1.5 py-0.5 text-[8.5px] font-bold text-amber-950">★ PRIMARY</span>}
            {plan.isFav && <Star size={12} className="shrink-0 text-amber-500" fill="currentColor" />}
          </div>
          <p className="truncate text-[10.5px] text-muted-foreground">{plan.level} · {plan.duration} min · {N} days · {plan.daysPerWeek}/week · {complete ? "done" : `${doneN}/${N}`}</p>
        </button>
        {!complete && next && <button onClick={() => play(next)} className="flex shrink-0 items-center gap-1 rounded-full bg-primary px-3 py-1.5 text-[11px] font-bold text-primary-foreground"><Play size={11} /> Day {next}</button>}
        <button onClick={() => setMenu((m) => !m)} title="More" className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-muted-foreground hover:bg-secondary"><MoreHorizontal size={16} /></button>
      </div>

      {menu && (
        <div className="flex flex-wrap gap-1.5 border-t border-border/60 p-2.5">
          <button onClick={() => { setMenu(false); onEdit(); }} className={menuBtn}>✏️ Edit</button>
          <button onClick={() => { setMenu(false); setShowAll(true); }} className={menuBtn}>📋 All sessions</button>
          {!isPrimary && <button onClick={() => { setMenu(false); onMakePrimary(); }} className={menuBtn}>★ Make primary</button>}
          <button onClick={() => { setMenu(false); onToggleFav(); }} className={menuBtn}>{plan.isFav ? "★ Favourited" : "☆ Mark fav"}</button>
          <button onClick={() => { setMenu(false); onDelete(); }} className={`${menuBtn} text-rose-500`}>🗑 Delete</button>
        </div>
      )}

      {showAll && (
        <Dialog open onOpenChange={(v) => { if (!v) setShowAll(false); }}>
          <DialogContent className="max-w-sm">
            <DialogHeader>
              <DialogTitle className="font-display">{label} · all sessions</DialogTitle>
              <DialogDescription>{N} sessions · {plan.daysPerWeek}/week. The next few are open now — we generate the rest as you progress.</DialogDescription>
            </DialogHeader>
            <div className="max-h-[62svh] space-y-1.5 overflow-y-auto pr-1">
              {Array.from({ length: N }, (_, k) => k + 1).map((i) => {
                const done = isDone(i);
                const locked = !done && !isSessionReady(progress, i);
                return (
                  <div key={i} className={`flex items-center gap-2.5 rounded-xl p-2 ${locked ? "bg-secondary/15" : "bg-card ring-1 ring-border/60"}`}>
                    <span className={`flex h-7 w-9 shrink-0 flex-col items-center justify-center rounded-md text-[10px] font-bold leading-none ${done ? "bg-primary text-primary-foreground" : locked ? "bg-secondary text-muted-foreground/70" : "bg-accent/60 text-foreground/70"}`}><span className="text-[6px] opacity-70">DAY</span>{i}</span>
                    <span className={`flex-1 truncate text-[12px] font-semibold ${locked ? "text-muted-foreground" : "text-foreground"}`}>Day {i}</span>
                    {done ? <span className="text-[10.5px] font-semibold text-emerald-600">✓ Done</span>
                      : locked ? <span className="text-[10px] text-muted-foreground">🔒 Opens as you go</span>
                      : <button onClick={() => play(i)} className="flex items-center gap-1 rounded-full bg-primary px-2.5 py-1 text-[11px] font-bold text-primary-foreground"><Play size={11} /> Play</button>}
                  </div>
                );
              })}
            </div>
          </DialogContent>
        </Dialog>
      )}

      {capOpen && (
        <Dialog open onOpenChange={(v) => { if (!v) setCapOpen(false); }}>
          <DialogContent className="max-w-sm">
            <DialogHeader>
              <DialogTitle className="font-display">That's {DAILY_CAP} for today 🙏</DialogTitle>
              <DialogDescription>You've completed {DAILY_CAP} sessions today — lovely work. Come back tomorrow and the next one will be ready. Rest is part of the practice.</DialogDescription>
            </DialogHeader>
            <button onClick={() => setCapOpen(false)} className="w-full rounded-2xl bg-primary px-4 py-3 text-sm font-semibold text-primary-foreground">Got it</button>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}

/* ================= Premium Surya Namaskar icon ================= */

function SuryaIcon() {
  return (
    <span className="relative flex h-9 w-9 shrink-0 items-center justify-center overflow-hidden rounded-xl shadow-inner" style={{ background: "linear-gradient(180deg,#fde68a 0%,#fb923c 55%,#c2410c 100%)" }}>
      <svg viewBox="0 0 64 64" className="h-full w-full">
        {/* setting sun disc */}
        <circle cx="32" cy="30" r="14" fill="#fffbeb" opacity="0.55" />
        <circle cx="32" cy="30" r="10" fill="#fff7ed" opacity="0.8" />
        {/* horizon ground */}
        <path d="M0 52 h64 v12 H0 Z" fill="#7c2d12" opacity="0.9" />
        {/* yoga figure — crescent lunge, arms sweeping overhead */}
        <g fill="none" stroke="#5b1e0a" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
          {/* back leg extended, front leg bent (lunge) */}
          <path d="M30 40 L18 52" />
          <path d="M30 40 L37 46 L37 52" />
          {/* torso leaning gently back */}
          <path d="M30 40 L33 24" />
          {/* arms reaching up together toward the sun */}
          <path d="M33 26 L40 12" />
          <path d="M33 26 L36 11" />
        </g>
        <circle cx="34.5" cy="20" r="3.1" fill="#5b1e0a" />
      </svg>
    </span>
  );
}

/* ================= Floating sub-tabs (scroll-to-section) ================= */

function SubTabs({ tabs }: { tabs: { id: string; label: string }[] }) {
  const [active, setActive] = useState(tabs[0]?.id);
  const key = tabs.map((t) => t.id).join(",");
  useEffect(() => {
    const onScroll = () => {
      let cur = tabs[0]?.id;
      for (const t of tabs) { const el = document.getElementById(t.id); if (el && el.getBoundingClientRect().top <= 150) cur = t.id; }
      setActive(cur);
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key]);
  const go = (id: string) => {
    const el = document.getElementById(id);
    if (el) window.scrollTo({ top: el.getBoundingClientRect().top + window.scrollY - 96, behavior: "smooth" });
  };
  return (
    <div className="sticky top-[46px] z-20 -mx-5 flex gap-1.5 overflow-x-auto bg-background/85 px-5 py-2 backdrop-blur-xl [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
      {tabs.map((t) => (
        <button key={t.id} onClick={() => { setActive(t.id); go(t.id); }}
          className={`shrink-0 rounded-full px-3 py-1.5 text-[11.5px] font-semibold transition ${active === t.id ? "bg-primary text-primary-foreground" : "bg-card text-foreground/65 ring-1 ring-border/60"}`}>
          {t.label}
        </button>
      ))}
    </div>
  );
}

function VideoCard({ label }: { label: string }) {
  return (
    <button onClick={() => toast("Intro video coming soon 🎬")} className="relative mt-2 flex h-28 w-full items-center justify-center overflow-hidden rounded-2xl ring-1 ring-border/60" style={{ background: "var(--gradient-night)" }}>
      <span className="absolute inset-0 opacity-40" style={{ background: "radial-gradient(circle at 30% 30%, #ffffff33, transparent 60%)" }} />
      <span className="relative flex h-12 w-12 items-center justify-center rounded-full bg-white/90 text-primary shadow-lg"><Play size={22} className="ml-0.5" /></span>
      <span className="absolute bottom-2 left-3 text-[11px] font-semibold text-white/90">{label}</span>
    </button>
  );
}

/* ================= Know Yoga Techniques & Practice ================= */

function KnowTab({ onPractise, bundles, onSaveBundle, onPlayBundle, onDeleteBundle }: {
  onPractise: (title: string, plan: YogaPlan) => void;
  bundles: SavedYogaConfig[];
  onSaveBundle: (poseIds: string[]) => void;
  onPlayBundle: (p: SavedYogaConfig) => void;
  onDeleteBundle: (id: string) => void;
}) {
  const [bundle, setBundle] = useState<string[]>(() => { try { return JSON.parse(localStorage.getItem("ayuraise.bundleDraft") || "[]"); } catch { return []; } });
  const [showAll, setShowAll] = useState<Record<string, boolean>>({});
  useEffect(() => { try { localStorage.setItem("ayuraise.bundleDraft", JSON.stringify(bundle)); } catch { /* ignore */ } }, [bundle]);
  const toggleBundle = (id: string) => setBundle((b) => b.includes(id) ? b.filter((x) => x !== id) : [...b, id]);

  const group = (id: string, title: string, intro: string, list: Technique[], videoLabel: string) => {
    const open = showAll[id];
    const shown = open ? list : list.slice(0, 8);
    return (
      <section id={id} className="scroll-mt-28 pt-4">
        <h2 className="px-1 font-display text-[16px] font-bold text-foreground">{title}</h2>
        <p className="mt-0.5 px-1 text-[11.5px] leading-snug text-muted-foreground">{intro}</p>
        <VideoCard label={videoLabel} />
        <div className="mt-3 grid grid-cols-4 gap-2">
          {shown.map((t) => {
            const inBundle = bundle.includes(t.id);
            const practisable = !!t.poseId;
            return (
              <div key={t.id} className="relative">
                <button
                  onClick={() => practisable ? onPractise(t.name, techniqueSession(t)) : toast(t.note)}
                  className="flex w-full flex-col items-center gap-1.5 rounded-2xl bg-card p-2.5 text-center ring-1 ring-border/60 active:scale-[0.97]">
                  <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-accent/50 text-xl">{t.emoji}</span>
                  <span className="text-[9.5px] font-medium leading-tight text-foreground/85">{t.name}</span>
                </button>
                {practisable && (
                  <button onClick={() => toggleBundle(t.id)} title="Add to bundle"
                    className={`absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full text-white shadow ${inBundle ? "bg-emerald-500" : "bg-primary/80"}`}>
                    {inBundle ? <Check size={11} strokeWidth={3} /> : <Plus size={11} strokeWidth={3} />}
                  </button>
                )}
              </div>
            );
          })}
        </div>
        {list.length > 8 && (
          <button onClick={() => setShowAll((s) => ({ ...s, [id]: !open }))} className="mt-2 w-full rounded-full bg-secondary px-3 py-1.5 text-[11.5px] font-semibold text-foreground/70">
            {open ? "Show less" : `Show all ${list.length}`}
          </button>
        )}
      </section>
    );
  };

  const allTech = [...ASANAS, ...PRANAYAMAS, ...BANDHAS];
  const bundleItems = bundle.map((id) => allTech.find((t) => t.id === id)).filter(Boolean) as Technique[];

  return (
    <div className="pb-24">
      {/* build-your-own-bundle bucket at the top */}
      <div className="mt-3 rounded-3xl bg-card p-4 ring-1 ring-border/60">
        <p className="text-[12.5px] font-semibold leading-snug text-foreground">🧺 My Bundle</p>
        <p className="mt-0.5 text-[11.5px] leading-snug text-muted-foreground">Tap ➕ on any asana or pranayam below and it drops in here — then practise or save it.</p>
        {bundleItems.length === 0 ? (
          <div className="mt-3 flex min-h-[52px] items-center justify-center rounded-2xl border border-dashed border-border/70 bg-secondary/30 px-3 text-center text-[11px] text-muted-foreground">
            Your picked poses will appear here
          </div>
        ) : (
          <>
            <div className="mt-3 flex flex-wrap gap-1.5">
              {bundleItems.map((t) => (
                <button key={t.id} onClick={() => toggleBundle(t.id)} title="Remove"
                  className="flex items-center gap-1 rounded-full bg-accent/60 px-2.5 py-1.5 text-[11.5px] font-semibold text-foreground ring-1 ring-border/50">
                  <span>{t.emoji}</span> {t.name} <X size={11} className="opacity-60" />
                </button>
              ))}
            </div>
            <div className="mt-3 space-y-2">
              <button onClick={() => onPractise("My Bundle", buildBundleSession(bundle))} className="flex w-full items-center justify-center gap-1.5 rounded-full bg-primary px-3 py-2 text-[12.5px] font-bold text-primary-foreground"><Play size={13} /> Practise</button>
              <div className="flex items-center gap-2">
                <button onClick={() => setBundle([])} className="rounded-full bg-secondary px-3 py-2 text-[11.5px] font-semibold text-foreground/70">Clear</button>
                <button onClick={() => { onSaveBundle(bundle); setBundle([]); }} className="flex flex-1 items-center justify-center gap-1.5 rounded-full bg-amber-400 px-3 py-2 text-[12px] font-bold text-amber-950"><Star size={13} /> Save bundle</button>
              </div>
            </div>
          </>
        )}
      </div>

      {/* saved bundles (up to 3) */}
      {bundles.length > 0 && (
        <div className="mt-3">
          <h3 className="px-1 text-[12.5px] font-bold text-foreground">🧺 My Bundles</h3>
          <div className="mt-1.5 space-y-1.5">
            {bundles.map((b) => (
              <div key={b.id} className="flex items-center gap-2.5 rounded-2xl bg-card p-2.5 ring-1 ring-border/60">
                <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-accent/50 text-[14px]">🧺</span>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-[12px] font-bold text-foreground">{b.primary}</p>
                  <p className="truncate text-[10px] text-muted-foreground">{b.poseIds?.length ?? 0} poses · practise daily</p>
                </div>
                <button onClick={() => onPlayBundle(b)} className="flex items-center gap-1 rounded-full bg-primary px-3 py-1.5 text-[11px] font-bold text-primary-foreground"><Play size={11} /> Practise</button>
                <button onClick={() => onDeleteBundle(b.id)} title="Delete bundle" className="rounded-full p-1.5 text-muted-foreground hover:text-rose-500"><Trash2 size={13} /></button>
              </div>
            ))}
          </div>
        </div>
      )}

      <SubTabs tabs={[{ id: "asanas", label: "🧘 Asanas" }, { id: "pranayam", label: "🌬️ Pranayam" }, { id: "bandh", label: "🔒 Bandh" }, { id: "mudra", label: "🙏 Mudras" }]} />
      {group("asanas", "Yoga Asanas", TECH_INTRO.asana, ASANAS, "About yoga — 2 min")}
      {group("pranayam", "Pranayam", TECH_INTRO.pranayama, PRANAYAMAS, "About pranayam — 2 min")}
      {group("bandh", "Bandh", TECH_INTRO.bandha, BANDHAS, "About bandh — 2 min")}
      {group("mudra", "Mudras", TECH_INTRO.mudra, MUDRAS, "About mudras — 2 min")}

      {/* floating bundle bar — quick access while scrolling */}
      {bundle.length > 0 && (
        <div className="fixed inset-x-0 bottom-[84px] z-30 px-5">
          <div className="mx-auto flex max-w-xl items-center gap-3 rounded-2xl bg-primary px-4 py-3 text-primary-foreground shadow-[var(--shadow-glow)]">
            <span className="flex-1 text-[13px] font-semibold">{bundle.length} in your bundle</span>
            <button onClick={() => setBundle([])} className="rounded-full bg-white/20 px-2.5 py-1 text-[11px] font-semibold">Clear</button>
            <button onClick={() => onPractise("My bundle", buildBundleSession(bundle))} className="flex items-center gap-1 rounded-full bg-white px-3 py-1.5 text-[12px] font-bold text-primary"><Play size={12} /> Practise</button>
          </div>
        </div>
      )}
    </div>
  );
}

/* ================= Choose your Goal & Practice ================= */

function GoalTab({ onPick }: { onPick: (i: LibItem) => void }) {
  return (
    <div className="pb-4">
      <SubTabs tabs={GOAL_GROUPS.map((g) => ({ id: g.id, label: g.title }))} />
      {GOAL_GROUPS.map((cat) => (
        <section key={cat.id} id={cat.id} className="scroll-mt-28 pt-4">
          <h2 className="px-1 font-display text-[15px] font-bold text-foreground">{cat.title}</h2>
          <div className="mt-2 grid grid-cols-4 gap-2">
            {cat.items.map((it) => (
              <button key={it.id} onClick={() => onPick(it)} className="flex flex-col items-center gap-1.5 rounded-2xl bg-card p-2.5 text-center ring-1 ring-border/60 active:scale-[0.97]">
                <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-accent/50 text-xl">{it.emoji}</span>
                <span className="text-[10px] font-medium leading-tight text-foreground/85">{it.label}</span>
              </button>
            ))}
          </div>
        </section>
      ))}
    </div>
  );
}

/* ================= My Plans ================= */

function TemplateCard({ t, favorite, onStart }: { t: YogaTemplate; favorite?: boolean; onStart: (t: YogaTemplate) => void }) {
  return (
    <button onClick={() => onStart(t)} className={`relative flex items-center gap-2.5 rounded-xl bg-card p-2.5 text-left ring-1 active:scale-[0.98] ${favorite ? "ring-2 ring-amber-400" : "ring-border/60"}`}>
      <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-accent/50 text-[15px]">{t.emoji}</span>
      <div className="min-w-0 flex-1">
        <p className="truncate text-[12px] font-bold leading-tight text-foreground">{t.name}{favorite ? " ⭐" : ""}</p>
        {t.tagline
          ? <p className="truncate text-[9.5px] font-semibold uppercase tracking-wide text-primary">{t.tagline}</p>
          : <p className="truncate text-[10px] text-muted-foreground">{t.duration} min · {t.daysCount}/wk</p>}
      </div>
    </button>
  );
}

function PopularPlans({ favoriteIds, onPreview }: { favoriteIds: string[]; onPreview: (t: YogaTemplate) => void }) {
  const isFav = (t: YogaTemplate) => favoriteIds.includes(t.id);
  return (
    <div className="py-4">
      {CATEGORY_ORDER.map((cat) => {
        const items = YOGA_TEMPLATES.filter((t) => t.category === cat);
        if (!items.length) return null;
        return (
          <section key={cat} className="pt-4 first:pt-0">
            <h2 className="px-1 font-display text-[15px] font-bold text-foreground">{CATEGORY_LABELS[cat]}</h2>
            <div className="mt-2 grid grid-cols-2 gap-2">
              {items.map((t) => <TemplateCard key={t.id} t={t} favorite={isFav(t)} onStart={onPreview} />)}
            </div>
          </section>
        );
      })}
    </div>
  );
}

/** Preview a ready-made plan: all sessions shown (unlocked), then Customise or add to Favourites. */
function ReadyMadePreview({ template, onClose, onCustomize, onSave, onMakePrimary, onPlay }: {
  template: YogaTemplate;
  onClose: () => void;
  onCustomize: (t: YogaTemplate) => void;
  onSave: (t: YogaTemplate) => void;
  onMakePrimary: (t: YogaTemplate) => void;
  onPlay: (t: YogaTemplate, w: number, d: number) => void;
}) {
  const base = templateToPlan(template);
  const N = totalSessions(base);
  const kcal = yogaKcal(base.duration, bodyWeight());
  const shown = Math.min(3, N);
  return (
    <Dialog open onOpenChange={(v) => { if (!v) onClose(); }}>
      <DialogContent className="max-w-sm">
        <DialogHeader>
          <DialogTitle className="font-display">{template.emoji} {template.name}</DialogTitle>
          <DialogDescription>{template.blurb}</DialogDescription>
        </DialogHeader>
        <div className="flex flex-wrap gap-1.5 text-[10.5px] font-semibold">
          <span className="rounded-full bg-secondary px-2.5 py-1 text-foreground/70">{N} days total</span>
          <span className="rounded-full bg-secondary px-2.5 py-1 text-foreground/70">{base.duration} min</span>
          <span className="rounded-full bg-emerald-100 px-2.5 py-1 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300">~{kcal} kcal/day</span>
        </div>
        <div className="space-y-1">
          {Array.from({ length: shown }, (_, k) => k + 1).map((i) => (
            <div key={i} className="flex items-center gap-2.5 rounded-xl bg-secondary/15 px-2.5 py-1.5">
              <span className="flex h-6 w-8 shrink-0 flex-col items-center justify-center rounded-md bg-accent/50 text-[9px] font-bold leading-none text-foreground/70"><span className="text-[6px] opacity-70">DAY</span>{i}</span>
              <span className="flex-1 truncate text-[11.5px] font-medium text-foreground/80">Day {i}</span>
              <span className="text-[10px] text-muted-foreground">{base.duration} min · ~{kcal} kcal</span>
              <button onClick={() => onPlay(template, 1, i)} className="rounded-full bg-primary/10 p-1 text-primary"><Play size={11} /></button>
            </div>
          ))}
          {N > shown && <p className="px-1 text-[10px] text-muted-foreground">+ {N - shown} more — the next sessions are created as you progress.</p>}
        </div>
        <p className="px-1 text-[10.5px] leading-snug text-muted-foreground">“Save to my plans” adds it as-is. “Customise” tailors it (you pick the schedule; first 3 sessions now, the rest built from your feedback).</p>
        <div className="flex gap-2">
          <button onClick={() => onSave(template)} className="flex-1 rounded-2xl bg-primary px-4 py-3 text-[13px] font-semibold text-primary-foreground">💾 Save to my plans</button>
          <button onClick={() => onCustomize(template)} className="flex-1 rounded-2xl bg-secondary px-4 py-3 text-[13px] font-semibold text-foreground">⚙ Customise</button>
        </div>
        {!template.noCurrent && <button onClick={() => onMakePrimary(template)} className="w-full rounded-2xl bg-amber-400 px-4 py-3 text-[13px] font-bold text-amber-950">★ Make it my primary plan</button>}
      </DialogContent>
    </Dialog>
  );
}

/** "Opened" saved plan: session queue (next 3 open), whole-plan list, adjust, make current (not for bundles). */
function PlansTab({ plans, onEdit, onDelete }: {
  plans: SavedYogaConfig[];
  onEdit: (p: SavedYogaConfig) => void;
  onDelete: (p: SavedYogaConfig) => void;
}) {
  return (
    <div className="py-4">
      <h2 className="px-1 font-display text-[15px] font-bold text-foreground">Your plans</h2>
      <p className="mt-0.5 px-1 text-[11px] text-muted-foreground">Your current plans (up to 2). Edit or remove them here — practise them from the top of the page.</p>
      {plans.length === 0 ? (
        <div className="mt-3 rounded-3xl bg-card p-6 text-center ring-1 ring-border/60">
          <p className="text-[13.5px] font-semibold text-foreground">No plans yet</p>
          <p className="mt-1 text-[12px] text-muted-foreground">Open a program in Popular Plans and tap “Save &amp; practice”, or build your own.</p>
        </div>
      ) : (
        <div className="mt-3 space-y-2">
          {plans.map((p) => (
            <div key={p.id} className="flex items-center gap-3 rounded-2xl bg-card p-3 ring-1 ring-border/60">
              <span className="flex h-10 w-10 items-center justify-center rounded-2xl bg-accent/50 text-lg">🧘</span>
              <div className="min-w-0 flex-1">
                <p className="truncate text-[13px] font-semibold text-foreground">{p.sourceId ? "⭐ " : ""}{p.primary}{p.variant ? ` · ${p.variant}` : ""}</p>
                <p className="truncate text-[11px] text-muted-foreground">{p.level} · {p.duration} min · {p.weeks} wk · {p.daysPerWeek}/wk</p>
              </div>
              <button onClick={() => onEdit(p)} title="Edit plan" className="flex items-center gap-1 rounded-full bg-primary px-3 py-2 text-[12px] font-bold text-primary-foreground"><Sliders size={12} /> Edit</button>
              <button onClick={() => onDelete(p)} title="Delete plan" className="rounded-full p-1.5 text-muted-foreground hover:text-rose-500"><Trash2 size={14} /></button>
            </div>
          ))}
        </div>
      )}

      <h2 className="mt-6 px-1 font-display text-[15px] font-bold text-foreground">📈 Practice trend</h2>
      <p className="mt-0.5 px-1 text-[11px] text-muted-foreground">Minutes and calories per day.</p>
      <div className="mt-3"><PracticeTrend /></div>

      <h2 className="mt-6 px-1 font-display text-[15px] font-bold text-foreground">📦 Session archive</h2>
      <p className="mt-0.5 px-1 text-[11px] text-muted-foreground">Every session you've completed, and the energy burnt.</p>
      <div className="mt-3"><YogaHistoryList /></div>
    </div>
  );
}

function PracticeTrend() {
  const byDay = useMemo(() => {
    const m = new Map<string, { min: number; kcal: number }>();
    for (const h of loadYogaHistory()) {
      const e = m.get(h.date) ?? { min: 0, kcal: 0 };
      e.min += h.minutes; e.kcal += h.kcal; m.set(h.date, e);
    }
    return [...m.entries()].sort((a, b) => (a[0] < b[0] ? -1 : 1)).slice(-14);
  }, []);
  if (!byDay.length) return <p className="rounded-2xl bg-secondary/50 p-4 text-center text-[12px] text-muted-foreground">No practice yet — your daily trend appears here.</p>;
  const maxMin = Math.max(...byDay.map(([, e]) => e.min), 1);
  const totalMin = byDay.reduce((a, [, e]) => a + e.min, 0);
  const totalKcal = byDay.reduce((a, [, e]) => a + e.kcal, 0);
  return (
    <div className="rounded-2xl bg-card p-3 ring-1 ring-border/60">
      <div className="flex gap-2 text-[11px] font-semibold">
        <span className="rounded-full bg-secondary px-2.5 py-1 text-foreground/70">{totalMin} min</span>
        <span className="rounded-full bg-emerald-100 px-2.5 py-1 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300">{totalKcal} kcal</span>
        <span className="rounded-full bg-secondary px-2.5 py-1 text-foreground/70">last {byDay.length} days</span>
      </div>
      <div className="mt-3 flex h-24 items-end gap-1">
        {byDay.map(([date, e]) => (
          <div key={date} className="flex flex-1 flex-col items-center gap-1" title={`${new Date(date).toLocaleDateString(undefined, { day: "numeric", month: "short" })} · ${e.min} min · ${e.kcal} kcal`}>
            <div className="flex w-full items-end justify-center" style={{ height: "100%" }}>
              <div className="w-full max-w-[16px] rounded-t bg-primary" style={{ height: `${Math.max(6, (e.min / maxMin) * 100)}%` }} />
            </div>
            <span className="text-[8px] tabular-nums text-muted-foreground">{new Date(date).getDate()}</span>
          </div>
        ))}
      </div>
      <p className="mt-1 text-[10px] text-muted-foreground">Bar height = minutes practised. Tap-hold a bar for the day's total.</p>
    </div>
  );
}

function YogaHistoryList() {
  const hist = useMemo(() => [...loadYogaHistory()].reverse(), []);
  if (hist.length === 0) return <p className="rounded-2xl bg-secondary/50 p-4 text-center text-[12px] text-muted-foreground">No sessions yet — practise one to see it here.</p>;
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

/* ================= Learn (About Yoga + Learn, merged) ================= */

function LearnTab({ onPractise }: { onPractise: (title: string, plan: YogaPlan) => void }) {
  const start = YOGA_LEARN_SECTIONS.filter((s) => s.group === "start");
  const master = YOGA_LEARN_SECTIONS.filter((s) => s.group === "master");
  return (
    <div className="pb-6">
      <SubTabs tabs={[{ id: "start", label: "🌱 Getting Started" }, { id: "master", label: "🎓 Master the Practice" }]} />

      <section id="start" className="scroll-mt-28 pt-4">
        <h2 className="px-1 font-display text-[16px] font-bold text-foreground">Getting Started</h2>
        <div className="mt-2 space-y-2">{start.map((s) => <LearnBlock key={s.id} s={s} onPractise={onPractise} />)}</div>
      </section>

      <section id="master" className="scroll-mt-28 pt-6">
        <h2 className="px-1 font-display text-[16px] font-bold text-foreground">Master the Practice</h2>
        <div className="mt-2 space-y-2">{master.map((s) => <LearnBlock key={s.id} s={s} onPractise={onPractise} />)}</div>
      </section>
    </div>
  );
}

function LearnBlock({ s, onPractise }: { s: LearnSection; onPractise: (title: string, plan: YogaPlan) => void }) {
  const [open, setOpen] = useState(false);
  const [showAll, setShowAll] = useState(false);
  const list = s.showAll === "asana" ? ASANAS : s.showAll === "pranayama" ? PRANAYAMAS : s.showAll === "bandha" ? BANDHAS : [];
  const shown = showAll ? list : list.slice(0, 4);
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

          {/* full technique list for guide sections */}
          {s.showAll && (
            <>
              <div className="grid grid-cols-4 gap-2">
                {shown.map((t) => (
                  <button key={t.id} onClick={() => t.poseId ? onPractise(t.name, techniqueSession(t)) : toast(t.note)}
                    className="flex flex-col items-center gap-1 rounded-2xl bg-secondary/40 p-2 text-center ring-1 ring-border/50">
                    <span className="text-lg">{t.emoji}</span>
                    <span className="text-[9px] font-medium leading-tight text-foreground/80">{t.name}</span>
                  </button>
                ))}
              </div>
              {list.length > 4 && (
                <button onClick={() => setShowAll(!showAll)} className="mt-2 w-full rounded-full bg-secondary px-3 py-1.5 text-[11px] font-semibold text-foreground/70">
                  {showAll ? "Show less" : `Show all ${list.length}`}
                </button>
              )}
            </>
          )}

          <div className="mt-2 space-y-2">
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

/* ================= Duration sheet ================= */

function DurationSheet({ item, onClose, onStart }: { item: LibItem; onClose: () => void; onStart: (plan: YogaPlan, feedback: boolean) => void }) {
  const options = item.durations ?? DURATIONS;
  const [dur, setDur] = useState(options.includes(20) ? 20 : options[0]);
  const [feedback, setFeedback] = useState(true);
  return (
    <Dialog open onOpenChange={(v) => { if (!v) onClose(); }}>
      <DialogContent className="max-w-sm">
        <DialogHeader>
          <DialogTitle className="font-display flex items-center gap-2"><span className="text-2xl">{item.emoji}</span> {item.label}</DialogTitle>
          <DialogDescription>Pick a duration and we'll build the session.</DialogDescription>
        </DialogHeader>
        <p className="text-[11px] font-bold uppercase tracking-wide text-foreground/50">Duration</p>
        <div className="flex flex-wrap gap-1.5">
          {options.map((d) => (
            <button key={d} onClick={() => setDur(d)} className={`rounded-full px-3.5 py-1.5 text-[12.5px] font-semibold ${dur === d ? "bg-primary text-primary-foreground" : "bg-secondary text-foreground/75"}`}>{d} min</button>
          ))}
        </div>
        <button onClick={() => setFeedback(!feedback)} className="flex items-center justify-between rounded-2xl bg-secondary/50 p-3 ring-1 ring-border/50">
          <span className="text-[12.5px] font-semibold text-foreground">🔊 AI instructor voice cues</span>
          <span className={`flex h-5 w-9 items-center rounded-full p-0.5 transition ${feedback ? "justify-end bg-primary" : "justify-start bg-border"}`}><span className="h-4 w-4 rounded-full bg-white shadow" /></span>
        </button>
        <button onClick={() => onStart(sessionFor(item, dur), feedback)} className="flex w-full items-center justify-center gap-2 rounded-2xl bg-primary px-4 py-3 text-sm font-semibold text-primary-foreground">
          <Play size={16} /> Start practising
        </button>
      </DialogContent>
    </Dialog>
  );
}

/* ================= Create personalized plan (single page) ================= */

const ORTHO: { id: Disease; label: string; emoji: string }[] = [
  { id: "none", label: "None", emoji: "✅" },
  { id: "knee-pain", label: "Knee pain", emoji: "🦵" },
  { id: "back-pain", label: "Back pain", emoji: "🦴" },
];

function CreatePlanSheet({ onClose, onPlay }: { onClose: () => void; onPlay: (title: string, plan: YogaPlan, feedback: boolean) => void }) {
  const [primary, setPrimary] = useState<Goal | null>(null);
  const [condition, setCondition] = useState<Disease>("none");
  const [ortho, setOrtho] = useState<Disease>("none");
  const [dur, setDur] = useState(20);
  const [feedback, setFeedback] = useState(true);

  const isDisease = primary === "disease-management";
  const disease: Disease = isDisease ? condition : ortho;

  const build = (play: boolean) => {
    if (!primary) { toast.error("Pick a goal first"); return; }
    const plan = generatePlan(disease, primary, dur);
    const dLabel = DISEASES.find((d) => d.id === disease)?.label;
    const gLabel = GOALS.find((g) => g.id === primary)?.label;
    const name = isDisease ? `${dLabel} yoga` : `${gLabel}${ortho !== "none" ? ` (safe for ${dLabel?.toLowerCase()})` : ""}`;
    if (play) { onPlay(name, plan, feedback); return; }
    saveMyYogaPlan({ ...plan, id: `yp_${Date.now().toString(36)}`, name, withFeedback: feedback });
    toast.success("Saved to My Plans 🧘");
    onClose();
  };

  return (
    <Dialog open onOpenChange={(v) => { if (!v) onClose(); }}>
      <DialogContent className="max-w-sm">
        <DialogHeader>
          <DialogTitle className="font-display">✨ Personalized yoga plan</DialogTitle>
          <DialogDescription>Answer a few things — Ayu builds it around you.</DialogDescription>
        </DialogHeader>

        <div className="max-h-[60svh] space-y-4 overflow-y-auto pr-1">
          <div>
            <p className="text-[11px] font-bold uppercase tracking-wide text-foreground/50">1 · What's your goal?</p>
            <div className="mt-1.5 grid grid-cols-2 gap-2">
              {GOALS.map((g) => (
                <button key={g.id} onClick={() => setPrimary(g.id)}
                  className={`rounded-2xl p-3 text-left ring-1 ${primary === g.id ? "bg-primary text-primary-foreground ring-primary" : "bg-secondary/60 text-foreground/80 ring-border/50"}`}>
                  <span className="block text-[12.5px] font-bold">{g.label}</span>
                  <span className={`block text-[10.5px] ${primary === g.id ? "opacity-90" : "text-muted-foreground"}`}>{g.desc}</span>
                </button>
              ))}
            </div>
          </div>

          {isDisease && (
            <div>
              <p className="text-[11px] font-bold uppercase tracking-wide text-foreground/50">2 · Which condition to manage?</p>
              <div className="mt-1.5 grid grid-cols-2 gap-1.5">
                {DISEASES.filter((d) => d.id !== "none").map((d) => (
                  <button key={d.id} onClick={() => setCondition(d.id)} className={`rounded-xl px-3 py-2 text-[12px] font-semibold ${condition === d.id ? "bg-primary text-primary-foreground" : "bg-secondary text-foreground/75"}`}>{d.label}</button>
                ))}
              </div>
              <Link to="/coach" className="mt-1.5 inline-flex items-center gap-1 text-[11px] font-semibold text-primary"><Bot size={12} /> Other condition? Tell Ayu →</Link>
            </div>
          )}
          {primary && !isDisease && (
            <div>
              <p className="text-[11px] font-bold uppercase tracking-wide text-foreground/50">2 · Any joint/ortho issue to avoid aggravating?</p>
              <div className="mt-1.5 flex flex-wrap gap-1.5">
                {ORTHO.map((o) => (
                  <button key={o.id} onClick={() => setOrtho(o.id)} className={`rounded-full px-3 py-1.5 text-[12px] font-semibold ${ortho === o.id ? "bg-primary text-primary-foreground" : "bg-secondary text-foreground/75"}`}>{o.emoji} {o.label}</button>
                ))}
              </div>
              <Link to="/coach" className="mt-1.5 inline-flex items-center gap-1 text-[11px] font-semibold text-primary"><Bot size={12} /> Neck/shoulder or something else? Tell Ayu →</Link>
            </div>
          )}

          {primary && (
            <div>
              <p className="text-[11px] font-bold uppercase tracking-wide text-foreground/50">3 · Duration</p>
              <div className="mt-1.5 flex flex-wrap gap-1.5">
                {DURATIONS.map((d) => (
                  <button key={d} onClick={() => setDur(d)} className={`rounded-full px-3.5 py-1.5 text-[12.5px] font-semibold ${dur === d ? "bg-primary text-primary-foreground" : "bg-secondary text-foreground/75"}`}>{d} min</button>
                ))}
              </div>
            </div>
          )}

          {primary && (
            <div>
              <p className="text-[11px] font-bold uppercase tracking-wide text-foreground/50">4 · AI instructor</p>
              <button onClick={() => setFeedback(!feedback)} className="mt-1.5 flex w-full items-center justify-between rounded-2xl bg-secondary/50 p-3 ring-1 ring-border/50">
                <span className="min-w-0 text-left"><span className="block text-[12.5px] font-semibold text-foreground">🔊 {feedback ? "With" : "Without"} live feedback</span><span className="block text-[10.5px] text-muted-foreground">{feedback ? "Spoken cues guide each pose." : "Silent self-practice, your own pace."}</span></span>
                <span className={`flex h-5 w-9 shrink-0 items-center rounded-full p-0.5 transition ${feedback ? "justify-end bg-primary" : "justify-start bg-border"}`}><span className="h-4 w-4 rounded-full bg-white shadow" /></span>
              </button>
            </div>
          )}
        </div>

        {primary && (
          <div className="flex gap-2">
            <button onClick={() => build(false)} className="flex-1 rounded-2xl bg-secondary px-3 py-2.5 text-[12.5px] font-semibold text-foreground ring-1 ring-border/60">Save for later</button>
            <button onClick={() => build(true)} className="flex-1 rounded-2xl bg-primary px-3 py-2.5 text-[12.5px] font-semibold text-primary-foreground">▶ Play now</button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}

/* ================= Session player ================= */

function SessionPlayer({ title, plan, feedback, onDone, onClose }: { title: string; plan: YogaPlan; feedback: boolean; onDone?: (choice: string | null) => void; onClose: () => void }) {
  const poses = useMemo(() => { const p = posesFor(plan); return p.length ? p : POSES.slice(0, 5); }, [plan]);
  const [idx, setIdx] = useState(0);
  const [secs, setSecs] = useState(poses[0]?.durationSec ?? 40);
  const [playing, setPlaying] = useState(true);
  const [voice, setVoice] = useState(feedback);
  const [done, setDone] = useState(false);
  const startRef = useRef(Date.now());
  const pose = poses[idx];

  useEffect(() => {
    if (!playing || done) return;
    if (secs <= 0) { next(); return; }
    const t = setTimeout(() => setSecs((s) => s - 1), 1000);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [secs, playing, done]);

  useEffect(() => {
    if (done) return;
    if (voice && pose) speak(`${pose.name}. ${pose.steps[0]}`);
    else stopSpeaking();
    return () => stopSpeaking();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [idx, voice, done]);

  function next() { stopSpeaking(); if (idx >= poses.length - 1) { finish(); return; } const n = idx + 1; setIdx(n); setSecs(poses[n].durationSec); }
  function prev() { stopSpeaking(); if (idx === 0) return; const n = idx - 1; setIdx(n); setSecs(poses[n].durationSec); }
  function finish() { stopSpeaking(); setPlaying(false); setDone(true); }

  const minutes = Math.max(1, Math.round((Date.now() - startRef.current) / 60000));
  const kcal = yogaKcal(minutes, bodyWeight());

  const punch = () => {
    addCalEntry({ kind: "out", label: `Yoga · ${title} (${minutes}m)`, kcal });
    addYogaHistory({ date: new Date().toISOString().slice(0, 10), label: title, minutes, kcal });
    toast.success(`${kcal} kcal added to your cal-out 🔥`);
    onClose();
  };
  const skipPunch = () => { addYogaHistory({ date: new Date().toISOString().slice(0, 10), label: title, minutes, kcal }); onClose(); };

  // Plan sessions auto-log the calories (no manual punch) the moment the session ends.
  const punchedRef = useRef(false);
  useEffect(() => {
    if (!done || !onDone || punchedRef.current) return;
    punchedRef.current = true;
    addCalEntry({ kind: "out", label: `Yoga · ${title} (${minutes}m)`, kcal });
    addYogaHistory({ date: new Date().toISOString().slice(0, 10), label: title, minutes, kcal });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [done]);
  const navigate = useNavigate();
  const complete = (choice: string | null) => { onDone?.(choice); onClose(); };
  // "tweak" / "change" record the feedback, then open Ayu so the user can say what they want changed
  const completeChat = (choice: string, seed: string) => { onDone?.(choice); navigate({ to: "/coach", search: { seed } }); };

  if (done) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-6 backdrop-blur-sm">
        <div className="w-full max-w-sm rounded-[32px] bg-card p-6 text-center shadow-xl animate-pop-in">
          <span className="text-5xl">🎉</span>
          <h3 className="mt-3 font-display text-xl font-bold text-foreground">Beautiful practice!</h3>
          <p className="mt-1 text-[13px] text-muted-foreground">{title} · {minutes} min · {poses.length} poses</p>
          {onDone ? (
            <>
              <div className="mt-4 rounded-2xl bg-accent/40 p-3 ring-1 ring-border/60">
                <p className="text-[12.5px] font-semibold text-foreground"><b className="text-primary">{kcal} kcal</b> added to your cal-out ✅</p>
              </div>
              <p className="mt-4 text-[13.5px] font-bold text-foreground">How did that feel?</p>
              <p className="mb-2 text-[11px] text-muted-foreground">Optional — it shapes what comes next.</p>
              <div className="space-y-2">
                <button onClick={() => complete("good")} className="w-full rounded-2xl bg-primary px-4 py-3 text-[13.5px] font-semibold text-primary-foreground">😌 Good — keep it coming</button>
                <button onClick={() => completeChat("tweak", "I'm following my personalized yoga plan and it's mostly good, but I'd like a few tweaks. Can you help me adjust it?")} className="w-full rounded-2xl bg-secondary px-4 py-3 text-[13.5px] font-semibold text-foreground">👍 Good, but I want some tweaks</button>
                <button onClick={() => completeChat("change", "I'm not happy with my personalized yoga plan and want major changes. Can you help me rework it?")} className="w-full rounded-2xl bg-secondary px-4 py-3 text-[13.5px] font-semibold text-foreground">👎 Not for me — I want major changes</button>
                <button onClick={() => complete(null)} className="w-full rounded-2xl px-4 py-1.5 text-[12.5px] font-semibold text-muted-foreground">Skip</button>
              </div>
            </>
          ) : (
            <>
              <div className="mt-4 rounded-2xl bg-accent/40 p-4 ring-1 ring-border/60">
                <p className="text-[13px] font-semibold text-foreground">You burnt about <b className="text-primary">{kcal} kcal</b> 🔥</p>
                <p className="mt-0.5 text-[11.5px] text-muted-foreground">Add it to today's cal-out on your dashboard?</p>
              </div>
              <button onClick={punch} className="mt-3 w-full rounded-2xl bg-primary px-4 py-3 text-sm font-semibold text-primary-foreground">➕ Punch {kcal} kcal to cal-out</button>
              <button onClick={skipPunch} className="mt-2 w-full rounded-2xl bg-secondary px-4 py-2.5 text-[13px] font-semibold text-foreground">Just save the session</button>
            </>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-[#0f1419] text-white">
      <div className="flex items-center justify-between px-5 pt-[max(1rem,env(safe-area-inset-top))]">
        <button onClick={() => { stopSpeaking(); onClose(); }} className="flex h-9 w-9 items-center justify-center rounded-full bg-white/10"><X size={16} /></button>
        <p className="text-[12px] font-semibold opacity-80">{idx + 1} / {poses.length} · {title}</p>
        <button onClick={() => setVoice(!voice)} className="flex h-9 w-9 items-center justify-center rounded-full bg-white/10">{voice ? <Volume2 size={16} /> : <VolumeX size={16} />}</button>
      </div>

      <div className="mt-3 flex gap-1 px-5">
        {poses.map((_, i) => (
          <div key={i} className="h-1 flex-1 overflow-hidden rounded-full bg-white/15">
            <div className="h-full bg-teal-400 transition-all" style={{ width: i < idx ? "100%" : i === idx ? `${100 - (secs / (pose.durationSec || 1)) * 100}%` : "0%" }} />
          </div>
        ))}
      </div>

      <div className="flex flex-1 flex-col items-center justify-center px-8 text-center">
        <span className="animate-breathe text-[92px] leading-none">{pose.emoji}</span>
        <h2 className="mt-5 font-display text-2xl font-bold">{pose.name}</h2>
        <p className="text-[13px] italic opacity-70">{pose.sanskrit}</p>
        <p className="mt-4 max-w-xs text-[14px] leading-relaxed opacity-90">{pose.steps[0]}</p>
        <p className="mt-6 font-display text-5xl font-bold tabular-nums">{Math.floor(secs / 60)}:{String(secs % 60).padStart(2, "0")}</p>
      </div>

      <div className="flex items-center justify-center gap-6 px-5">
        <button onClick={prev} disabled={idx === 0} className="flex h-12 w-12 items-center justify-center rounded-full bg-white/10 disabled:opacity-30"><ChevronLeft size={22} /></button>
        <button onClick={() => setPlaying(!playing)} className="flex h-16 w-16 items-center justify-center rounded-full bg-teal-500 shadow-lg">{playing ? <Pause size={26} /> : <Play size={26} />}</button>
        <button onClick={next} className="flex h-12 w-12 items-center justify-center rounded-full bg-white/10"><ChevronRight size={22} /></button>
      </div>
      <button onClick={finish} className="mx-auto mb-[max(1.5rem,env(safe-area-inset-bottom))] mt-4 text-[12px] font-semibold opacity-70">Finish session</button>
    </div>
  );
}

/* ================= Yoga Styles ================= */

function levelIdx(l: StyleProgram["level"]) { return l === "beginner" ? 0 : l === "medium" ? 1 : 2; }
function fmtS(sec: number) { return `${Math.floor(sec / 60)}:${String(sec % 60).padStart(2, "0")}`; }

function StylesTab({ onOpenStyle, onOpenWeek }: { onOpenStyle: (s: StyleId) => void; onOpenWeek: (w: WeeklyPlan) => void }) {
  return (
    <div className="pb-6">
      <section className="pt-4">
        <h2 className="px-1 font-display text-[15px] font-bold text-foreground">🗓️ Weekly Journeys</h2>
        <p className="mt-0.5 px-1 text-[11.5px] leading-snug text-muted-foreground">Follow a guided week — one session a day.</p>
        <div className="mt-2 space-y-2">
          {BALANCED_WEEKS.map((w) => <WeekRow key={w.id} w={w} onOpen={onOpenWeek} />)}
        </div>
      </section>

      <section className="pt-5">
        <h2 className="px-1 font-display text-[15px] font-bold text-foreground">Yoga Styles</h2>
        <p className="mt-0.5 px-1 text-[11.5px] leading-snug text-muted-foreground">Each style has beginner → advanced sessions and its own 7-day plan.</p>
        <div className="mt-2.5 grid grid-cols-4 gap-2">
          {STYLES.map((s) => (
            <button key={s.id} onClick={() => onOpenStyle(s.id)}
              className="flex flex-col items-center gap-1.5 rounded-2xl bg-card p-2.5 text-center ring-1 ring-border/60 active:scale-[0.97]">
              <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-accent/50 text-xl">{s.emoji}</span>
              <span className="text-[9.5px] font-medium leading-tight text-foreground/85">{s.label}</span>
            </button>
          ))}
        </div>
      </section>
    </div>
  );
}

function WeekRow({ w, onOpen }: { w: WeeklyPlan; onOpen: (w: WeeklyPlan) => void }) {
  const done = completedDays(w.id).length;
  return (
    <button onClick={() => onOpen(w)} className="flex w-full items-center gap-3 rounded-2xl bg-card p-3 text-left ring-1 ring-border/60 active:scale-[0.99]">
      <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-accent/50 text-xl">{w.emoji}</span>
      <div className="min-w-0 flex-1">
        <p className="truncate text-[13.5px] font-semibold text-foreground">{w.name}</p>
        <p className="truncate text-[11.5px] text-muted-foreground">{w.blurb}</p>
        <p className="text-[10.5px] font-semibold text-primary">7 days · {done}/7 done</p>
      </div>
      <ChevronRight size={17} className="shrink-0 text-muted-foreground" />
    </button>
  );
}

function StyleRow({ prog, kg, onOpen }: { prog: StyleProgram; kg: number; onOpen: (p: StyleProgram) => void }) {
  const st = styleOf(prog.styleId);
  return (
    <button onClick={() => onOpen(prog)} className="flex w-full items-center gap-3 rounded-2xl bg-card p-3 text-left ring-1 ring-border/60 active:scale-[0.99]">
      <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-accent/50 text-xl">{st.emoji}</span>
      <div className="min-w-0 flex-1">
        <p className="truncate text-[13.5px] font-semibold text-foreground">{prog.title}</p>
        <p className="text-[11px] text-muted-foreground">{st.levelLabels[levelIdx(prog.level)]} · {programMinutes(prog)} min · 🔥 {styleKcal(prog, kg)} kcal</p>
      </div>
      <ChevronRight size={16} className="shrink-0 text-muted-foreground" />
    </button>
  );
}

function StyleView({ styleId, onClose, onOpenProgram, onOpenWeek }: {
  styleId: StyleId; onClose: () => void; onOpenProgram: (p: StyleProgram) => void; onOpenWeek: (w: WeeklyPlan) => void;
}) {
  const st = styleOf(styleId);
  const progs = programsOf(styleId);
  const weeks = weeklyPlansFor(styleId);
  const kg = bodyWeight();
  return (
    <div className="fixed inset-0 z-50 flex flex-col" style={{ background: "var(--gradient-hero)" }}>
      <div className="px-5 pb-3 pt-[max(1rem,env(safe-area-inset-top))]" style={{ background: "var(--gradient-night)" }}>
        <div className="flex items-center gap-3">
          <button onClick={onClose} className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-white/15 text-primary-foreground"><ArrowLeft size={16} /></button>
          <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-white/15 text-2xl">{st.emoji}</span>
          <div className="min-w-0">
            <h2 className="truncate font-display text-[19px] font-bold leading-tight text-primary-foreground">{st.label}</h2>
            <p className="truncate text-[11.5px] text-primary-foreground/80">{st.blurb}</p>
          </div>
        </div>
      </div>
      <div className="flex-1 overflow-y-auto px-5 pb-[max(1.5rem,env(safe-area-inset-bottom))] pt-4">
        <p className="px-1 text-[11.5px] font-bold uppercase tracking-wide text-foreground/60">Sessions</p>
        <div className="mt-1.5 space-y-2">
          {progs.map((p) => <StyleRow key={p.id} prog={p} kg={kg} onOpen={onOpenProgram} />)}
        </div>
        {weeks.length > 0 && (
          <>
            <p className="mt-5 px-1 text-[11.5px] font-bold uppercase tracking-wide text-foreground/60">Weekly plan</p>
            <div className="mt-1.5 space-y-2">
              {weeks.map((w) => <WeekRow key={w.id} w={w} onOpen={onOpenWeek} />)}
            </div>
          </>
        )}
      </div>
    </div>
  );
}

function StyleProgramDetail({ prog, onClose, onStart }: { prog: StyleProgram; onClose: () => void; onStart: () => void }) {
  const st = styleOf(prog.styleId);
  const kg = bodyWeight();
  return (
    <div className="fixed inset-0 z-50 flex flex-col" style={{ background: "var(--gradient-hero)" }}>
      <div className="relative overflow-hidden px-5 pb-5 pt-[max(1rem,env(safe-area-inset-top))]" style={{ background: "var(--gradient-night)" }}>
        <div className="absolute -right-10 -top-10 h-40 w-40 rounded-full bg-amber-400/20 blur-3xl" />
        <div className="relative flex items-center justify-between">
          <button onClick={onClose} className="flex h-9 w-9 items-center justify-center rounded-full bg-white/15 text-primary-foreground"><ArrowLeft size={16} /></button>
          <button onClick={onStart} className="flex items-center gap-1.5 rounded-full bg-white px-5 py-2 text-[13px] font-bold text-amber-700 shadow"><Play size={14} className="fill-current" /> Start</button>
        </div>
        <div className="relative mt-4 flex items-center gap-3">
          <span className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-white/15 text-3xl">{st.emoji}</span>
          <div className="min-w-0">
            <h2 className="font-display text-[20px] font-extrabold leading-tight text-primary-foreground">{prog.title}</h2>
            <p className="mt-0.5 text-[12px] text-primary-foreground/80">{st.levelLabels[levelIdx(prog.level)]} · {programMinutes(prog)} min · {prog.poses.length} poses · 🔥 {styleKcal(prog, kg)} kcal</p>
          </div>
        </div>
      </div>
      <div className="flex-1 overflow-y-auto px-5 pb-8 pt-4">
        <p className="rounded-2xl bg-card p-3 text-[12px] leading-relaxed text-foreground/80 ring-1 ring-border/60">{prog.benefit}</p>
        {prog.caution && <p className="mt-2 rounded-2xl bg-amber-100 p-3 text-[11.5px] leading-relaxed text-amber-800 dark:bg-amber-900/30 dark:text-amber-300">⚠️ {prog.caution}</p>}
        <p className="mt-4 px-1 text-[11.5px] font-bold uppercase tracking-wide text-muted-foreground">The flow</p>
        <div className="mt-1.5 space-y-1.5">
          {prog.poses.map((ps, i) => (
            <button key={i} onClick={onStart} className="flex w-full items-center gap-3 rounded-2xl bg-card p-2.5 text-left ring-1 ring-border/60 active:scale-[0.99]">
              <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-accent/50 text-[11px] font-bold text-foreground/70">{i + 1}</span>
              <div className="min-w-0 flex-1">
                <p className="truncate text-[13px] font-semibold text-foreground">{ps.name}</p>
                {ps.cue && <p className="truncate text-[11px] text-muted-foreground">{ps.cue}</p>}
              </div>
              <span className="shrink-0 text-[11.5px] font-semibold text-muted-foreground">{fmtS(ps.sec)}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

function WeeklyPlanView({ plan, onClose, onOpenProgram }: { plan: WeeklyPlan; onClose: () => void; onOpenProgram: (p: StyleProgram) => void }) {
  const [done, setDone] = useState<number[]>([]);
  useEffect(() => { setDone(completedDays(plan.id)); }, [plan.id]);
  const toggle = (day: number) => setDone(setDayDone(plan.id, day, !done.includes(day)));
  const kg = bodyWeight();

  return (
    <div className="fixed inset-0 z-50 flex flex-col" style={{ background: "var(--gradient-hero)" }}>
      <div className="px-5 pb-4 pt-[max(1rem,env(safe-area-inset-top))]" style={{ background: "var(--gradient-night)" }}>
        <div className="flex items-center gap-3">
          <button onClick={onClose} className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-white/15 text-primary-foreground"><ArrowLeft size={16} /></button>
          <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-white/15 text-2xl">{plan.emoji}</span>
          <div className="min-w-0">
            <h2 className="truncate font-display text-[18px] font-bold leading-tight text-primary-foreground">{plan.name}</h2>
            <p className="truncate text-[11.5px] text-primary-foreground/80">{done.length}/7 days done</p>
          </div>
        </div>
      </div>
      <div className="flex-1 overflow-y-auto px-5 pb-[max(1.5rem,env(safe-area-inset-bottom))] pt-4">
        <p className="mb-3 px-1 text-[12px] text-muted-foreground">{plan.blurb}</p>
        <div className="space-y-2">
          {plan.days.map((d) => {
            const prog = d.programId ? getStyleProgram(d.programId) : undefined;
            const isDone = done.includes(d.day);
            return (
              <div key={d.day} className="flex items-center gap-3 rounded-2xl bg-card p-3 ring-1 ring-border/60">
                <span className={`flex h-9 w-9 shrink-0 flex-col items-center justify-center rounded-xl text-[9px] font-bold leading-none ${isDone ? "bg-primary text-primary-foreground" : "bg-accent/50 text-foreground/70"}`}>
                  <span className="text-[8px] opacity-70">DAY</span>{d.day}
                </span>
                <button onClick={() => prog && onOpenProgram(prog)} disabled={!prog} className="min-w-0 flex-1 text-left disabled:cursor-default">
                  <p className="truncate text-[13px] font-semibold text-foreground">{prog ? prog.title : "Rest day"}</p>
                  <p className="truncate text-[11px] text-muted-foreground">{d.note}{prog ? ` · ${programMinutes(prog)} min · 🔥 ${styleKcal(prog, kg)} kcal` : ""}</p>
                </button>
                {prog && <button onClick={() => onOpenProgram(prog)} className="shrink-0 rounded-full bg-primary/10 p-2 text-primary"><Play size={13} /></button>}
                <button onClick={() => toggle(d.day)} className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full ${isDone ? "bg-emerald-500 text-white" : "bg-secondary text-muted-foreground ring-1 ring-border/60"}`}>
                  <Check size={13} strokeWidth={3} />
                </button>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

function StylePlayer({ prog, onClose }: { prog: StyleProgram; onClose: () => void }) {
  const st = styleOf(prog.styleId);
  const poses = prog.poses;
  const [idx, setIdx] = useState(0);
  const cur = poses[idx];
  const [secs, setSecs] = useState(cur.sec);
  const [playing, setPlaying] = useState(true);
  const [voice, setVoice] = useState(true);
  const [done, setDone] = useState(false);
  const startRef = useRef(Date.now());

  useEffect(() => { setSecs(poses[idx].sec); }, [idx, poses]);

  useEffect(() => {
    if (!playing || done) return;
    if (secs <= 0) { next(); return; }
    const t = setTimeout(() => setSecs((s) => s - 1), 1000);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [secs, playing, done]);

  useEffect(() => {
    if (done) return;
    if (voice && cur) speak(`${cur.name}. ${cur.cue ?? ""}`);
    else stopSpeaking();
    return () => stopSpeaking();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [idx, voice, done]);

  function next() { stopSpeaking(); if (idx >= poses.length - 1) { finish(); return; } setIdx((i) => i + 1); }
  function prev() { stopSpeaking(); if (idx === 0) return; setIdx((i) => i - 1); }
  function finish() { stopSpeaking(); setPlaying(false); setDone(true); }

  const totalSec = poses.reduce((a, p) => a + p.sec, 0);
  const doneSec = poses.slice(0, idx).reduce((a, p) => a + p.sec, 0) + (cur.sec - secs);
  const minutes = Math.max(1, Math.round((Date.now() - startRef.current) / 60000));
  const kcal = Math.max(1, Math.round(styleKcal(prog, bodyWeight()) * Math.min(1, doneSec / totalSec || 1)));

  const punch = () => {
    addCalEntry({ kind: "out", label: `Yoga · ${prog.title} (${minutes}m)`, kcal });
    addYogaHistory({ date: new Date().toISOString().slice(0, 10), label: prog.title, minutes, kcal });
    toast.success(`${kcal} kcal added to your cal-out 🔥`);
    onClose();
  };
  const skipPunch = () => { addYogaHistory({ date: new Date().toISOString().slice(0, 10), label: prog.title, minutes, kcal }); onClose(); };

  if (done) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-6 backdrop-blur-sm">
        <div className="w-full max-w-sm rounded-[32px] bg-card p-6 text-center shadow-xl animate-pop-in">
          <span className="text-5xl">🎉</span>
          <h3 className="mt-3 font-display text-xl font-bold text-foreground">Beautiful practice!</h3>
          <p className="mt-1 text-[13px] text-muted-foreground">{prog.title} · {minutes} min</p>
          <div className="mt-4 rounded-2xl bg-accent/40 p-4 ring-1 ring-border/60">
            <p className="text-[13px] font-semibold text-foreground">You burnt about <b className="text-primary">{kcal} kcal</b> 🔥</p>
            <p className="mt-0.5 text-[11.5px] text-muted-foreground">Add it to today's cal-out on your dashboard?</p>
          </div>
          <button onClick={punch} className="mt-3 w-full rounded-2xl bg-primary px-4 py-3 text-sm font-semibold text-primary-foreground">➕ Punch {kcal} kcal to cal-out</button>
          <button onClick={skipPunch} className="mt-2 w-full rounded-2xl bg-secondary px-4 py-2.5 text-[13px] font-semibold text-foreground">Just save the session</button>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-[#0f1419] text-white">
      <div className="flex items-center justify-between px-5 pt-[max(1rem,env(safe-area-inset-top))]">
        <button onClick={() => { stopSpeaking(); onClose(); }} className="flex h-9 w-9 items-center justify-center rounded-full bg-white/10"><X size={16} /></button>
        <p className="text-[12px] font-semibold opacity-80">{idx + 1} / {poses.length} · {prog.title}</p>
        <button onClick={() => setVoice(!voice)} className="flex h-9 w-9 items-center justify-center rounded-full bg-white/10">{voice ? <Volume2 size={16} /> : <VolumeX size={16} />}</button>
      </div>

      <div className="mt-3 flex gap-1 px-5">
        {poses.map((_, i) => (
          <div key={i} className="h-1 flex-1 overflow-hidden rounded-full bg-white/15">
            <div className="h-full bg-teal-400 transition-all" style={{ width: i < idx ? "100%" : i === idx ? `${100 - (secs / (cur.sec || 1)) * 100}%` : "0%" }} />
          </div>
        ))}
      </div>

      <div className="flex flex-1 flex-col items-center justify-center px-8 text-center">
        <span className="animate-breathe text-[88px] leading-none">{st.emoji}</span>
        <h2 className="mt-5 font-display text-2xl font-bold">{cur.name}</h2>
        {cur.cue && <p className="mt-3 max-w-xs text-[13.5px] leading-relaxed opacity-85">{cur.cue}</p>}
        <p className="mt-6 font-display text-5xl font-bold tabular-nums">{fmtS(secs)}</p>
      </div>

      <div className="flex items-center justify-center gap-6 px-5">
        <button onClick={prev} disabled={idx === 0} className="flex h-12 w-12 items-center justify-center rounded-full bg-white/10 disabled:opacity-30"><ChevronLeft size={22} /></button>
        <button onClick={() => setPlaying(!playing)} className="flex h-16 w-16 items-center justify-center rounded-full bg-teal-500 shadow-lg">{playing ? <Pause size={26} /> : <Play size={26} />}</button>
        <button onClick={next} className="flex h-12 w-12 items-center justify-center rounded-full bg-white/10"><ChevronRight size={22} /></button>
      </div>
      <button onClick={finish} className="mx-auto mb-[max(1.5rem,env(safe-area-inset-bottom))] mt-4 text-[12px] font-semibold opacity-70">Finish session</button>
    </div>
  );
}
