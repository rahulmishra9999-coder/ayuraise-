import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useMemo, useRef, useState } from "react";
import { BottomNav } from "@/components/BottomNav";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { toast } from "sonner";
import {
  ArrowLeft, Play, Pause, ChevronRight, ChevronLeft, X, Trash2, Volume2, VolumeX, History, Bot, Plus, Check,
} from "lucide-react";
import {
  POSES, DURATIONS, GOALS, DISEASES, generatePlan, posesFor, speak, stopSpeaking,
  type Goal, type Disease, type YogaPlan,
} from "@/lib/yoga";
import {
  GOAL_GROUPS, ASANAS, PRANAYAMAS, BANDHAS, TECH_INTRO,
  sessionFor, techniqueSession, buildBundleSession, yogaKcal,
  loadMyYogaPlans, saveMyYogaPlan, deleteMyYogaPlan, loadYogaHistory, addYogaHistory,
  type LibItem, type SavedYogaPlan, type Technique,
} from "@/lib/yoga-library";
import { YOGA_LEARN_SECTIONS, type LearnSection } from "@/lib/yoga-learn";
import { loadPlan as loadWLPlan } from "@/lib/weight-loss";
import { addCalEntry } from "@/lib/trackers";

export const Route = createFileRoute("/section/yoga")({
  head: () => ({
    meta: [
      { title: "Yoga & Pranayam · AyuRaise" },
      { name: "description", content: "Practise yoga by technique or by goal, build a personalized plan, and learn the science behind it." },
    ],
  }),
  component: YogaSection,
});

type Tab = "know" | "goal" | "plans" | "learn";

function bodyWeight() { return loadWLPlan()?.currentWeight ?? 68; }

/* Session shape passed to the player */
type Session = { title: string; plan: YogaPlan; feedback: boolean };

function YogaSection() {
  const [tab, setTab] = useState<Tab>("goal");
  const [session, setSession] = useState<Session | null>(null);
  const [createOpen, setCreateOpen] = useState(false);
  const [item, setItem] = useState<LibItem | null>(null);

  return (
    <div className="min-h-svh pb-28" style={{ background: "var(--gradient-hero)" }}>
      {/* hero */}
      <div className="relative overflow-hidden px-5 pb-6 pt-[max(1rem,env(safe-area-inset-top))]" style={{ background: "var(--gradient-night)" }}>
        <div className="absolute -right-16 -top-16 h-48 w-48 rounded-full bg-amber-400/20 blur-3xl" />
        <div className="relative">
          <Link to="/home" className="inline-flex h-9 w-9 items-center justify-center rounded-full bg-white/15 text-primary-foreground">
            <ArrowLeft size={16} />
          </Link>
          <div className="mt-4 flex items-center gap-3">
            <SuryaIcon />
            <div>
              <h1 className="font-display text-[24px] font-extrabold leading-tight text-primary-foreground">Yoga &amp; Pranayam</h1>
              <p className="text-[13px] text-primary-foreground/80">Move, breathe, heal — at your pace.</p>
            </div>
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-xl px-5">
        {/* create personalized plan — the entry point */}
        <button onClick={() => setCreateOpen(true)} className="group mt-4 w-full overflow-hidden rounded-3xl p-5 text-left text-primary-foreground shadow-[var(--shadow-glow)] transition active:scale-[0.985]" style={{ background: "var(--gradient-violet)" }}>
          <div className="flex items-center gap-3">
            <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-white/20 text-xl">✨</span>
            <div className="min-w-0 flex-1">
              <p className="font-display text-[16px] font-bold leading-tight">Create Your Personalized Yoga Plan</p>
              <p className="mt-1.5 text-[12px] leading-relaxed opacity-90">A yoga journey tailored to your body, goals, and lifestyle — with optional real-time feedback from your AI Yoga Instructor.</p>
            </div>
          </div>
          <span className="mt-3.5 inline-flex items-center gap-1.5 rounded-full bg-white px-4 py-2 text-[12.5px] font-bold text-violet-700 shadow-sm transition group-active:gap-2.5">
            Get started <ChevronRight size={15} />
          </span>
        </button>

        {/* main tabs */}
        <div className="sticky top-0 z-30 -mx-5 mt-3 flex gap-1.5 overflow-x-auto bg-background/85 px-5 py-2.5 backdrop-blur-xl [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          {([["goal", "🎯 Select a Goal & Practice"], ["know", "🧘 Select Poses & Practice"], ["plans", "📋 My Plans"], ["learn", "🎓 Learn"]] as const).map(([id, label]) => (
            <button key={id} onClick={() => setTab(id)}
              className={`shrink-0 rounded-full px-3.5 py-1.5 text-[12.5px] font-semibold transition ${tab === id ? "bg-primary text-primary-foreground shadow-[var(--shadow-glow)]" : "bg-card text-foreground/70 ring-1 ring-border/60"}`}>
              {label}
            </button>
          ))}
        </div>

        {tab === "know" && <KnowTab onPractise={(title, plan) => setSession({ title, plan, feedback: true })} />}
        {tab === "goal" && <GoalTab onPick={setItem} />}
        {tab === "plans" && <PlansTab onPlay={(p) => setSession({ title: p.name, plan: p, feedback: p.withFeedback })} />}
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
      {session && (
        <SessionPlayer title={session.title} plan={session.plan} feedback={session.feedback} onClose={() => setSession(null)} />
      )}

      <BottomNav />
    </div>
  );
}

/* ================= Premium Surya Namaskar icon ================= */

function SuryaIcon() {
  return (
    <span className="relative flex h-14 w-14 shrink-0 items-center justify-center overflow-hidden rounded-2xl shadow-inner" style={{ background: "linear-gradient(180deg,#fde68a 0%,#fb923c 55%,#c2410c 100%)" }}>
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

function KnowTab({ onPractise }: { onPractise: (title: string, plan: YogaPlan) => void }) {
  const [bundle, setBundle] = useState<string[]>([]);
  const [showAll, setShowAll] = useState<Record<string, boolean>>({});
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
        <p className="text-[12.5px] font-semibold leading-snug text-foreground">🧺 Build your own bundle</p>
        <p className="mt-0.5 text-[11.5px] leading-snug text-muted-foreground">Tap ➕ on any asana or pranayam below and it drops in here — then practise them together.</p>
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
            <div className="mt-3 flex items-center gap-2">
              <button onClick={() => setBundle([])} className="rounded-full bg-secondary px-3 py-2 text-[11.5px] font-semibold text-foreground/70">Clear</button>
              <button onClick={() => onPractise("My bundle", buildBundleSession(bundle))} className="flex flex-1 items-center justify-center gap-1.5 rounded-full bg-primary px-3 py-2 text-[12.5px] font-bold text-primary-foreground"><Play size={13} /> Practise {bundleItems.length} together</button>
            </div>
          </>
        )}
      </div>

      <SubTabs tabs={[{ id: "asanas", label: "🧘 Asanas" }, { id: "pranayam", label: "🌬️ Pranayam" }, { id: "bandh", label: "🔒 Bandh" }]} />
      {group("asanas", "Yoga Asanas", TECH_INTRO.asana, ASANAS, "About yoga — 2 min")}
      {group("pranayam", "Pranayam", TECH_INTRO.pranayama, PRANAYAMAS, "About pranayam — 2 min")}
      {group("bandh", "Bandh", TECH_INTRO.bandha, BANDHAS, "About bandh — 2 min")}

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

function PlansTab({ onPlay }: { onPlay: (p: SavedYogaPlan) => void }) {
  const [plans, setPlans] = useState<SavedYogaPlan[]>([]);
  const [histOpen, setHistOpen] = useState(false);
  useEffect(() => { setPlans(loadMyYogaPlans()); }, []);

  return (
    <div className="py-4">
      <div className="flex items-center justify-between px-1">
        <h2 className="font-display text-[15px] font-semibold">My saved plans</h2>
        <button onClick={() => setHistOpen(true)} className="flex items-center gap-1 rounded-full bg-secondary px-2.5 py-1.5 text-[11px] font-semibold text-foreground/75">
          <History size={11} /> History
        </button>
      </div>

      {plans.length === 0 ? (
        <div className="mt-3 rounded-3xl bg-card p-6 text-center ring-1 ring-border/60">
          <p className="text-[13.5px] font-semibold text-foreground">No saved plans yet</p>
          <p className="mt-1 text-[12px] text-muted-foreground">Create a personalized plan and save it here to practise anytime.</p>
        </div>
      ) : (
        <div className="mt-3 space-y-2">
          {plans.map((p) => (
            <div key={p.id} className="flex items-center gap-3 rounded-2xl bg-card p-3.5 ring-1 ring-border/60">
              <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-accent/50 text-xl">🧘</span>
              <div className="min-w-0 flex-1">
                <p className="truncate text-[13.5px] font-semibold text-foreground">{p.name}</p>
                <p className="text-[11px] text-muted-foreground">{p.duration} min · {p.poseIds.length} poses · {p.withFeedback ? "with feedback" : "no feedback"}</p>
              </div>
              <button onClick={() => onPlay(p)} className="flex items-center gap-1 rounded-full bg-primary px-3 py-2 text-[12px] font-bold text-primary-foreground"><Play size={12} /> Play</button>
              <button onClick={() => setPlans(deleteMyYogaPlan(p.id))} className="rounded-full p-1.5 text-muted-foreground hover:text-rose-500"><Trash2 size={14} /></button>
            </div>
          ))}
        </div>
      )}

      <Dialog open={histOpen} onOpenChange={setHistOpen}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle className="font-display">Practice history</DialogTitle>
            <DialogDescription>Every session you've practised, and the energy burnt.</DialogDescription>
          </DialogHeader>
          <YogaHistoryList />
        </DialogContent>
      </Dialog>
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

function SessionPlayer({ title, plan, feedback, onClose }: { title: string; plan: YogaPlan; feedback: boolean; onClose: () => void }) {
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

  if (done) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-6 backdrop-blur-sm">
        <div className="w-full max-w-sm rounded-[32px] bg-card p-6 text-center shadow-xl animate-pop-in">
          <span className="text-5xl">🎉</span>
          <h3 className="mt-3 font-display text-xl font-bold text-foreground">Beautiful practice!</h3>
          <p className="mt-1 text-[13px] text-muted-foreground">{title} · {minutes} min · {poses.length} poses</p>
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
