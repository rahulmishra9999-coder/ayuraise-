import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useMemo, useRef, useState } from "react";
import {
  ArrowLeft, Play, Pause, X, ChevronRight, ChevronLeft, Heart, Trash2, History,
  Check, Plus, Minus, ListOrdered, Save, Music,
} from "lucide-react";
import { toast } from "sonner";
import { BottomNav } from "@/components/BottomNav";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { WLPipelineBanner, WLPipelineNext } from "@/components/WLPipeline";
import { DiseasePipelineBanner, DiseasePipelineNext } from "@/components/DiseasePipeline";
import { loadProfile, patchPlan, estimateBurn } from "@/lib/weight-loss";
import { addCalEntry } from "@/lib/trackers";
import { WORKOUT_LEARN } from "@/lib/exercise-learn";
import {
  GROUPS, bucketsInGroup, bucketOf, sessionsIn, getSession, getExercise,
  buildBlocks, stepsOf, exerciseCount, stepKcal, sessionKcal, kcalFor,
  applyFilters, EMPTY_FILTERS, LEVELS, EQUIP_FILTERS, EQUIP_ALL, INTENSITIES,
  FOCUS_LIST, focusLabel, levelLabel, equipLabel, bundlePool, buildExercisePlan,
  PLAN_BUCKETS, bundleSteps, bundleSeconds, bundleKcal, SET_OPTIONS, SEC_OPTIONS,
  BREAK_SEC, MUSIC_LINKS,
  loadFavs, toggleFav, loadBundles, saveBundle, deleteBundle,
  loadMyExPlans, saveMyExPlan, deleteMyExPlan, loadExHistory, addExHistory, addFeedback,
  type Bucket, type Session, type Step, type Exercise, type ExFilters, type Level,
  type Intensity, type Equip, type Focus, type Group, type Bundle, type BundleItem,
  type SavedExPlan,
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

type Tab = "practice" | "plans" | "learn";
type PlaySource = { title: string; steps: Step[]; startIndex: number; preview?: boolean };

function WorkoutsPage() {
  const [tab, setTab] = useState<Tab>("practice");
  const [bucket, setBucket] = useState<Bucket | null>(null);
  const [detail, setDetail] = useState<Session | null>(null);
  const [player, setPlayer] = useState<PlaySource | null>(null);
  const [createOpen, setCreateOpen] = useState(false);
  const [favs, setFavs] = useState<string[]>([]);
  useEffect(() => { setFavs(loadFavs()); }, []);
  const onFav = (id: string) => setFavs(toggleFav(id));

  const previewPlay = (ex: Exercise) =>
    setPlayer({ title: ex.name, steps: bundleSteps([{ exId: ex.id, sets: 1, sec: ex.sec }]), startIndex: 0, preview: true });

  return (
    <div className="min-h-svh pb-28" style={{ background: "var(--gradient-hero)" }}>
      <div className="relative overflow-hidden px-5 pb-6 pt-[max(1rem,env(safe-area-inset-top))]" style={{ background: "var(--gradient-night)" }}>
        <div className="absolute -right-16 -top-16 h-48 w-48 rounded-full bg-rose-400/20 blur-3xl" />
        <div className="relative">
          <Link to="/home" className="inline-flex h-9 w-9 items-center justify-center rounded-full bg-white/15 text-primary-foreground">
            <ArrowLeft size={16} />
          </Link>
          <div className="mt-4 flex items-center gap-3">
            <DumbbellIcon />
            <div>
              <h1 className="font-display text-[24px] font-extrabold leading-tight text-primary-foreground">Workouts</h1>
              <p className="text-[13px] text-primary-foreground/80">Desi kasrat to gym — move your way.</p>
            </div>
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-xl px-5">
        <button onClick={() => setCreateOpen(true)} className="group mt-4 w-full overflow-hidden rounded-3xl p-5 text-left text-primary-foreground shadow-[var(--shadow-glow)] transition active:scale-[0.985]" style={{ background: "var(--gradient-violet)" }}>
          <div className="flex items-center gap-3">
            <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-white/20 text-xl">✨</span>
            <div className="min-w-0 flex-1">
              <p className="font-display text-[16px] font-bold leading-tight">Build My Personalized Plan</p>
              <p className="mt-1.5 text-[12px] leading-relaxed opacity-90">Level, intensity, focus area, time, equipment and the styles you like.</p>
            </div>
          </div>
          <span className="mt-3.5 inline-flex items-center gap-1.5 rounded-full bg-white px-4 py-2 text-[12.5px] font-bold text-violet-700 shadow-sm transition group-active:gap-2.5">
            Get started <ChevronRight size={15} />
          </span>
        </button>

        <div className="sticky top-0 z-30 -mx-5 mt-3 flex gap-1.5 bg-background/85 px-5 py-2.5 backdrop-blur-xl">
          {([["practice", "🎯 Practice"], ["plans", "📋 My Plans"], ["learn", "🎓 Learn"]] as const).map(([id, label]) => (
            <button key={id} onClick={() => setTab(id)}
              className={`rounded-full px-3.5 py-1.5 text-[12.5px] font-semibold transition ${tab === id ? "bg-primary text-primary-foreground shadow-[var(--shadow-glow)]" : "bg-card text-foreground/70 ring-1 ring-border/60"}`}>
              {label}
            </button>
          ))}
        </div>

        {tab === "practice" && <PracticeTab onPick={setBucket} />}
        {tab === "plans" && (
          <PlansTab favs={favs} onFav={onFav} onOpenSession={setDetail}
            onPlayBundle={(b) => setPlayer({ title: b.name, steps: bundleSteps(b.items), startIndex: 0 })}
            onCreate={() => setCreateOpen(true)} />
        )}
        {tab === "learn" && <LearnTab />}

        {tab === "practice" && (
          <div className="mt-6">
            <WLPipelineBanner currentSlug="exercise" />
            <DiseasePipelineBanner currentSlug="exercise" />
            <WLPipelineNext currentSlug="exercise" onAdvance={() => patchPlan({ exerciseCalBurn: estimateBurn(6 * 20, bodyWeight()) })} />
            <DiseasePipelineNext currentSlug="exercise" />
          </div>
        )}
      </div>

      {bucket && (
        <BucketView bucket={bucket} favs={favs} onFav={onFav} onClose={() => setBucket(null)}
          onOpenSession={setDetail} onPreviewPlay={previewPlay}
          onPlayBundle={(name, items) => setPlayer({ title: name, steps: bundleSteps(items), startIndex: 0 })} />
      )}
      {detail && (
        <SessionDetail s={detail} fav={favs.includes(detail.id)} onFav={() => onFav(detail.id)}
          onClose={() => setDetail(null)}
          onStart={(steps, i) => setPlayer({ title: detail.title, steps, startIndex: i })} />
      )}
      {player && <Player src={player} onClose={() => setPlayer(null)} />}
      {createOpen && (
        <CreatePlanSheet onClose={() => setCreateOpen(false)}
          onDone={() => { setCreateOpen(false); setTab("plans"); }}
          onStart={(s) => { setCreateOpen(false); setDetail(s); }} />
      )}

      <BottomNav />
    </div>
  );
}

/* ================= Icon ================= */

function DumbbellIcon() {
  return (
    <span className="relative flex h-14 w-14 shrink-0 items-center justify-center overflow-hidden rounded-2xl shadow-inner" style={{ background: "linear-gradient(160deg,#fda4af 0%,#f43f5e 55%,#9f1239 100%)" }}>
      <svg viewBox="0 0 64 64" className="h-full w-full">
        <g stroke="#7f1d1d" strokeLinecap="round">
          <line x1="20" y1="32" x2="44" y2="32" strokeWidth="4" />
          <line x1="15" y1="23" x2="15" y2="41" strokeWidth="7" />
          <line x1="49" y1="23" x2="49" y2="41" strokeWidth="7" />
          <line x1="9" y1="27" x2="9" y2="37" strokeWidth="5" />
          <line x1="55" y1="27" x2="55" y2="37" strokeWidth="5" />
        </g>
      </svg>
    </span>
  );
}

/* ================= Practice — Style / Goal / Program floating sub-tabs ================= */

const GROUP_TABS: Record<Group, string> = { styles: "Choose a Style", goal: "Choose a Goal", programs: "Choose a Program" };

function PracticeTab({ onPick }: { onPick: (b: Bucket) => void }) {
  const [active, setActive] = useState<Group>("styles");

  useEffect(() => {
    const onScroll = () => {
      let cur: Group = "styles";
      for (const gr of GROUPS) {
        const el = document.getElementById(`grp-${gr.id}`);
        if (el && el.getBoundingClientRect().top <= 150) cur = gr.id;
      }
      setActive(cur);
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const go = (id: Group) => {
    const el = document.getElementById(`grp-${id}`);
    if (el) window.scrollTo({ top: el.getBoundingClientRect().top + window.scrollY - 92, behavior: "smooth" });
  };

  return (
    <div className="pb-2">
      {/* floating jump-to nav */}
      <div className="sticky top-[46px] z-20 -mx-5 flex gap-1.5 overflow-x-auto bg-background/85 px-5 py-2 backdrop-blur-xl [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        {GROUPS.map((gr) => (
          <button key={gr.id} onClick={() => { setActive(gr.id); go(gr.id); }}
            className={`shrink-0 rounded-full px-3.5 py-1.5 text-[12px] font-semibold transition ${active === gr.id ? "bg-primary text-primary-foreground" : "bg-card text-foreground/65 ring-1 ring-border/60"}`}>
            {GROUP_TABS[gr.id]}
          </button>
        ))}
      </div>

      {/* all groups stacked on one page */}
      {GROUPS.map((gr) => (
        <section key={gr.id} id={`grp-${gr.id}`} className="scroll-mt-24 pt-5">
          <h2 className="px-1 font-display text-[16px] font-bold text-foreground">{GROUP_TABS[gr.id]}</h2>
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

function BucketView({ bucket, favs, onFav, onClose, onOpenSession, onPreviewPlay, onPlayBundle }: {
  bucket: Bucket; favs: string[]; onFav: (id: string) => void; onClose: () => void;
  onOpenSession: (s: Session) => void; onPreviewPlay: (ex: Exercise) => void;
  onPlayBundle: (name: string, items: BundleItem[]) => void;
}) {
  const kg = bodyWeight();
  const [filters, setFilters] = useState<ExFilters>(EMPTY_FILTERS);
  const [items, setItems] = useState<BundleItem[]>([]);
  const [adding, setAdding] = useState<Exercise | null>(null);
  const [preview, setPreview] = useState<Exercise | null>(null);
  const [saveOpen, setSaveOpen] = useState(false);
  const [name, setName] = useState(`My ${bucket.label} bundle`);

  const sessions = useMemo(() => applyFilters(sessionsIn(bucket.id), filters), [bucket.id, filters]);
  const pool = useMemo(() => bundlePool(bucket, filters), [bucket, filters]);
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

      <div className={`flex-1 overflow-y-auto px-5 pt-3 ${items.length ? "pb-28" : "pb-[max(1.5rem,env(safe-area-inset-bottom))]"}`}>
        {bucket.music && <MusicBar />}

        <p className="px-1 text-[11.5px] font-bold uppercase tracking-wide text-muted-foreground">{sessions.length} sessions</p>
        {sessions.length === 0 ? (
          <div className="mt-2 rounded-3xl bg-card p-6 text-center ring-1 ring-border/60">
            <p className="text-[13.5px] font-semibold text-foreground">No sessions match</p>
            <p className="mt-1 text-[12px] text-muted-foreground">Try removing a filter or two.</p>
          </div>
        ) : (
          <div className="mt-2 grid grid-cols-2 gap-2.5">
            {sessions.map((s) => (
              <SessionCard key={s.id} s={s} kg={kg} fav={favs.includes(s.id)} onFav={() => onFav(s.id)} onClick={() => onOpenSession(s)} />
            ))}
          </div>
        )}

        {/* build your own bundle */}
        <section className="pt-6">
          <h3 className="px-1 font-display text-[15px] font-bold text-foreground">🧺 Create your own bundle</h3>
          <p className="mt-0.5 px-1 text-[11.5px] leading-snug text-muted-foreground">
            Tap an exercise to preview it first, then add it with your sets and time. The filters above narrow this list too.
          </p>

          <div className="mt-2.5 rounded-3xl bg-card p-4 ring-1 ring-border/60">
            {items.length === 0 ? (
              <div className="flex min-h-[52px] items-center justify-center rounded-2xl border border-dashed border-border/70 bg-secondary/30 px-3 text-center text-[11px] text-muted-foreground">
                Your picked exercises will appear here
              </div>
            ) : (
              <>
                <div className="space-y-1.5">
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

          <p className="mt-4 px-1 text-[11px] font-bold uppercase tracking-wide text-foreground/50">{pool.length} exercises available</p>
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
        </section>
      </div>

      {items.length > 0 && (
        <div className="absolute inset-x-0 bottom-0 px-5 pb-[max(1rem,env(safe-area-inset-bottom))] pt-4" style={{ background: "linear-gradient(to top, var(--background) 65%, transparent)" }}>
          <div className="flex items-center gap-2 rounded-2xl bg-primary px-3 py-2.5 text-primary-foreground shadow-[var(--shadow-glow)]">
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
    </div>
  );
}

function SessionCard({ s, kg, fav, onFav, onClick }: { s: Session; kg: number; fav: boolean; onFav: () => void; onClick: () => void }) {
  const b = bucketOf(s.bucket)!;
  const kcal = useMemo(() => sessionKcal(s, kg), [s, kg]);
  return (
    <div className="relative">
      <button onClick={onClick} className="flex w-full flex-col rounded-2xl bg-card p-3 text-left ring-1 ring-border/60 active:scale-[0.98]">
        <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-accent/50 text-xl">{b.emoji}</span>
        <p className="mt-2 line-clamp-2 min-h-[2.4em] text-[12.5px] font-semibold leading-tight text-foreground">{s.title}</p>
        <p className="mt-1 text-[10.5px] text-muted-foreground">{s.minutes} min · {levelLabel(s.level)}</p>
        <p className="text-[10.5px] text-muted-foreground">🔥 {kcal} kcal · {focusLabel(s.focus)}</p>
        {s.equip !== "none" && <p className="mt-0.5 text-[10px] font-semibold text-primary">{equipLabel(s.equip)}</p>}
      </button>
      <button onClick={onFav} className="absolute right-1.5 top-1.5 p-1.5" aria-label="Favourite">
        <Heart size={15} className={fav ? "fill-rose-500 text-rose-500" : "text-muted-foreground"} />
      </button>
    </div>
  );
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

function Player({ src, onClose }: { src: PlaySource; onClose: () => void }) {
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

  useEffect(() => { setSecs(steps[idx].sec); }, [idx, steps]);
  useEffect(() => { if (done && src.preview) onClose(); }, [done, src.preview, onClose]);

  useEffect(() => {
    if (!playing || done) return;
    const t = setTimeout(() => {
      setElapsed((e) => e + 1);
      if (rest !== null) { setRest(rest > 1 ? rest - 1 : null); return; }
      const st = steps[idx];
      if (st.kind !== "break") {
        kcalRef.current += ((getExercise(st.exId)?.met ?? 4) * 3.5 * kg / 200) / 60;
        setKcal(Math.round(kcalRef.current));
      }
      if (secs <= 1) advance(); else setSecs(secs - 1);
    }, 1000);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [secs, playing, done, idx, rest]);

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
        <button onClick={() => { setPlaying(false); setListOpen(true); }} disabled={src.preview} className="flex h-9 w-9 items-center justify-center rounded-full bg-white/10 disabled:opacity-30"><ListOrdered size={16} /></button>
      </div>

      <div className="mt-3 flex gap-1 px-5">
        {steps.map((_, i) => (
          <div key={i} className="h-1 flex-1 overflow-hidden rounded-full bg-white/15">
            <div className="h-full bg-teal-400 transition-all" style={{ width: i < idx ? "100%" : i === idx ? `${pct}%` : "0%" }} />
          </div>
        ))}
      </div>

      <div className="flex flex-1 flex-col items-center justify-center px-8 text-center">
        {isBreak ? (
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
        <p className="mt-5 font-display text-5xl font-bold tabular-nums">{fmt(rest !== null ? rest : secs)}</p>

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
        <div className="mt-1.5 grid grid-cols-2 gap-2.5">
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
