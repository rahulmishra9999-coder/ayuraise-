import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useMemo, useRef, useState } from "react";
import { BottomNav } from "@/components/BottomNav";
import { toast } from "sonner";
import { ArrowLeft, Bot, Play, Pause, X, Heart, ChevronRight, Clock } from "lucide-react";
import {
  MED_CATEGORIES, MED_TRACKS, MUSIC_TRACKS, MED_LEARN, tracksIn, getTrack,
  loadFavs, toggleFav, loadRecent, markPlayed,
  type MedTrack, type MedCategory,
} from "@/lib/meditation";

export const Route = createFileRoute("/section/meditation")({
  head: () => ({
    meta: [
      { title: "Meditation · AyuRaise" },
      { name: "description", content: "Guided meditations and soothing music, Calm-style — plus a caring bot for low moods." },
    ],
  }),
  component: MeditationSection,
});

type Tab = "meditate" | "music" | "favorites" | "learn";

function MeditationSection() {
  const [tab, setTab] = useState<Tab>("meditate");
  const [now, setNow] = useState<MedTrack | null>(null);
  const [cat, setCat] = useState<MedCategory>("quick");
  const [favs, setFavs] = useState<string[]>([]);
  useEffect(() => { setFavs(loadFavs()); }, [now, tab]);

  const play = (t: MedTrack) => setNow(t);

  return (
    <div className="min-h-svh pb-28" style={{ background: "var(--gradient-hero)" }}>
      {/* hero */}
      <div className="relative overflow-hidden px-5 pb-6 pt-[max(1rem,env(safe-area-inset-top))]" style={{ background: "linear-gradient(160deg,#1e1b4b,#4338ca)" }}>
        <div className="absolute -left-10 -top-10 h-40 w-40 rounded-full bg-white/10 blur-2xl" />
        <div className="relative">
          <Link to="/home" className="inline-flex h-9 w-9 items-center justify-center rounded-full bg-white/15 text-white">
            <ArrowLeft size={16} />
          </Link>
          <h1 className="mt-4 font-display text-[26px] font-extrabold leading-tight text-white">Meditation</h1>
          <p className="mt-1 text-[13px] text-white/75">Quiet the mind. Rest the body.</p>
        </div>
      </div>

      <div className="mx-auto max-w-xl px-5">
        {/* talk-to-bot for low mood — in place of a plan builder */}
        <Link to="/coach" className="mt-4 flex items-center gap-3 rounded-3xl p-4 text-white shadow-[var(--shadow-glow)]" style={{ background: "var(--gradient-violet)" }}>
          <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-white/15"><Bot size={22} /></span>
          <span className="flex-1">
            <span className="font-display text-[15px] font-bold">Feeling low or restless?</span>
            <span className="mt-0.5 block text-[11.5px] opacity-90">Talk to Ayu — it'll listen, and suggest the right meditation or breathing practice for you right now.</span>
          </span>
          <ChevronRight size={18} />
        </Link>

        {/* tabs */}
        <div className="sticky top-0 z-20 -mx-5 mt-3 flex gap-1.5 overflow-x-auto bg-background/80 px-5 py-2.5 backdrop-blur-xl [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          {([["meditate", "🧘 Meditate"], ["music", "🎵 Music"], ["favorites", "❤️ Favourites"], ["learn", "🎓 Learn"]] as const).map(([id, label]) => (
            <button key={id} onClick={() => setTab(id)}
              className={`shrink-0 rounded-full px-3.5 py-1.5 text-[12.5px] font-semibold transition ${tab === id ? "bg-primary text-primary-foreground shadow-[var(--shadow-glow)]" : "bg-card text-foreground/70 ring-1 ring-border/60"}`}>
              {label}
            </button>
          ))}
        </div>

        {tab === "meditate" && <MeditateTab cat={cat} setCat={setCat} favs={favs} onPlay={play} onFav={(id) => setFavs(toggleFav(id))} />}
        {tab === "music" && <MusicTab favs={favs} onPlay={play} onFav={(id) => setFavs(toggleFav(id))} />}
        {tab === "favorites" && <FavoritesTab favs={favs} onPlay={play} onFav={(id) => setFavs(toggleFav(id))} />}
        {tab === "learn" && <LearnTab />}
      </div>

      {now && <Player track={now} onClose={() => setNow(null)} />}
      <BottomNav />
    </div>
  );
}

function TrackRow({ t, fav, onPlay, onFav }: { t: MedTrack; fav: boolean; onPlay: (t: MedTrack) => void; onFav: (id: string) => void }) {
  return (
    <div className="flex items-center gap-3 rounded-2xl bg-card p-2.5 ring-1 ring-border/60">
      <button onClick={() => onPlay(t)} className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl text-xl" style={{ background: t.visual }}>{t.scene}</button>
      <button onClick={() => onPlay(t)} className="min-w-0 flex-1 text-left">
        <span className="block truncate text-[13px] font-semibold text-foreground">{t.title}</span>
        <span className="flex items-center gap-1 text-[11px] text-muted-foreground"><Clock size={10} /> {t.minutes} min{t.narrator ? ` · ${t.narrator}` : ""}</span>
      </button>
      <button onClick={() => onFav(t.id)} className="rounded-full p-2"><Heart size={16} className={fav ? "fill-rose-500 text-rose-500" : "text-muted-foreground"} /></button>
    </div>
  );
}

/* ================= Meditate tab ================= */

function MeditateTab({ cat, setCat, favs, onPlay, onFav }: { cat: MedCategory; setCat: (c: MedCategory) => void; favs: string[]; onPlay: (t: MedTrack) => void; onFav: (id: string) => void }) {
  const recent = useMemo(() => loadRecent().map((r) => ({ r, t: getTrack(r.id) })).filter((x) => x.t).slice(0, 5), []);
  const list = tracksIn(cat);
  return (
    <div className="py-4">
      {/* resume / recently played */}
      {recent.length > 0 && (
        <section className="mb-4">
          <h2 className="px-1 font-display text-[14px] font-bold text-foreground">Pick up where you left off</h2>
          <div className="mt-2 flex gap-2 overflow-x-auto pb-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
            {recent.map(({ r, t }) => (
              <button key={r.id} onClick={() => onPlay(t!)} className="w-28 shrink-0 overflow-hidden rounded-2xl text-left ring-1 ring-border/60">
                <span className="flex h-16 items-center justify-center text-2xl" style={{ background: t!.visual }}>{t!.scene}</span>
                <span className="block p-2">
                  <span className="block truncate text-[11px] font-semibold text-foreground">{t!.title}</span>
                  <span className="block text-[9.5px] text-muted-foreground">{r.done ? "done" : `${Math.round(r.posSec / 60)}m in`}</span>
                </span>
              </button>
            ))}
          </div>
        </section>
      )}

      {/* category chips */}
      <div className="flex gap-1.5 overflow-x-auto pb-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        {MED_CATEGORIES.map((c) => (
          <button key={c.id} onClick={() => setCat(c.id)}
            className={`shrink-0 rounded-full px-3 py-1.5 text-[11.5px] font-semibold ${cat === c.id ? "bg-primary text-primary-foreground" : "bg-card text-foreground/70 ring-1 ring-border/60"}`}>
            {c.emoji} {c.label}
          </button>
        ))}
      </div>

      <div className="mt-3 space-y-2">
        {list.map((t) => <TrackRow key={t.id} t={t} fav={favs.includes(t.id)} onPlay={onPlay} onFav={onFav} />)}
        {list.length === 0 && <p className="rounded-2xl bg-secondary/50 p-4 text-center text-[12px] text-muted-foreground">More coming soon in this category.</p>}
      </div>
    </div>
  );
}

/* ================= Music tab ================= */

function MusicTab({ favs, onPlay, onFav }: { favs: string[]; onPlay: (t: MedTrack) => void; onFav: (id: string) => void }) {
  return (
    <div className="py-4">
      <h2 className="px-1 font-display text-[15px] font-semibold">Soothing music</h2>
      <p className="px-1 text-[11.5px] text-muted-foreground">Nature sounds & calming tones — tap and drift.</p>
      <div className="mt-3 grid grid-cols-2 gap-2.5">
        {MUSIC_TRACKS.map((t) => (
          <button key={t.id} onClick={() => onPlay(t)} className="relative overflow-hidden rounded-3xl p-4 text-left text-white shadow-[var(--shadow-soft)]" style={{ background: t.visual, minHeight: 110 }}>
            <span className="text-3xl">{t.scene}</span>
            <span className="mt-2 block text-[13px] font-bold">{t.title}</span>
            <span className="text-[10.5px] opacity-85">{t.minutes} min</span>
            <span onClick={(e) => { e.stopPropagation(); onFav(t.id); }} className="absolute right-2 top-2 rounded-full bg-black/20 p-1.5">
              <Heart size={13} className={favs.includes(t.id) ? "fill-white text-white" : "text-white/80"} />
            </span>
          </button>
        ))}
      </div>
    </div>
  );
}

/* ================= Favorites tab ================= */

function FavoritesTab({ favs, onPlay, onFav }: { favs: string[]; onPlay: (t: MedTrack) => void; onFav: (id: string) => void }) {
  const favTracks = favs.map(getTrack).filter(Boolean) as MedTrack[];
  const recent = useMemo(() => loadRecent().map((r) => ({ r, t: getTrack(r.id) })).filter((x) => x.t), []);
  return (
    <div className="py-4">
      <h2 className="px-1 font-display text-[15px] font-semibold">❤️ Your favourites</h2>
      {favTracks.length === 0 ? (
        <p className="mt-2 rounded-2xl bg-secondary/50 p-4 text-center text-[12px] text-muted-foreground">Tap the heart on any track to save it here.</p>
      ) : (
        <div className="mt-2 space-y-2">
          {favTracks.map((t) => <TrackRow key={t.id} t={t} fav onPlay={onPlay} onFav={onFav} />)}
        </div>
      )}

      {recent.length > 0 && (
        <>
          <h2 className="mt-5 px-1 font-display text-[15px] font-semibold">🕒 Recently played</h2>
          <div className="mt-2 space-y-2">
            {recent.slice(0, 10).map(({ r, t }) => (
              <div key={r.id + r.at} className="flex items-center gap-3 rounded-2xl bg-card p-2.5 ring-1 ring-border/60">
                <button onClick={() => onPlay(t!)} className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl text-lg" style={{ background: t!.visual }}>{t!.scene}</button>
                <button onClick={() => onPlay(t!)} className="min-w-0 flex-1 text-left">
                  <span className="block truncate text-[13px] font-semibold text-foreground">{t!.title}</span>
                  <span className="text-[11px] text-muted-foreground">{r.done ? "completed" : `left at ${Math.round(r.posSec / 60)} min`}</span>
                </button>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}

/* ================= Learn tab ================= */

function LearnTab() {
  return (
    <div className="space-y-3 py-4">
      {MED_LEARN.map((a) => (
        <div key={a.title} className="rounded-3xl bg-card p-5 ring-1 ring-border/60">
          <div className="flex items-center gap-3">
            <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-accent/50 text-2xl">{a.emoji}</span>
            <h2 className="font-display text-[16px] font-bold text-foreground">{a.title}</h2>
          </div>
          <p className="mt-2.5 text-[13.5px] leading-relaxed text-foreground/80">{a.body}</p>
        </div>
      ))}
    </div>
  );
}

/* ================= Player ================= */

function Player({ track, onClose }: { track: MedTrack; onClose: () => void }) {
  const total = track.minutes * 60;
  const [secs, setSecs] = useState(0);
  const [playing, setPlaying] = useState(true);
  const [fav, setFav] = useState(false);
  useEffect(() => { setFav(loadFavs().includes(track.id)); }, [track.id]);

  useEffect(() => {
    if (!playing) return;
    if (secs >= total) { markPlayed(track.id, total, true); toast.success("Session complete 🌸"); onClose(); return; }
    const t = setTimeout(() => setSecs((s) => s + 1), 1000);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [secs, playing]);

  const close = () => { markPlayed(track.id, secs, secs >= total); onClose(); };
  const pct = (secs / total) * 100;
  const fmt = (s: number) => `${Math.floor(s / 60)}:${String(s % 60).padStart(2, "0")}`;

  return (
    <div className="fixed inset-0 z-50 flex flex-col items-center justify-between p-6 text-white" style={{ background: track.visual }}>
      <div className="absolute inset-0 bg-black/25" />
      <div className="relative flex w-full items-center justify-between">
        <button onClick={close} className="flex h-9 w-9 items-center justify-center rounded-full bg-white/15"><X size={16} /></button>
        <button onClick={() => { const next = toggleFav(track.id); setFav(next.includes(track.id)); }} className="flex h-9 w-9 items-center justify-center rounded-full bg-white/15">
          <Heart size={16} className={fav ? "fill-white text-white" : "text-white/80"} />
        </button>
      </div>

      <div className="relative flex flex-col items-center text-center">
        <span className="text-[110px] leading-none animate-breathe">{track.scene}</span>
        <h2 className="mt-6 font-display text-2xl font-bold">{track.title}</h2>
        {track.narrator && <p className="text-[13px] opacity-80">with {track.narrator}</p>}
        <p className="mt-1 text-[12px] opacity-70">{track.kind === "music" ? "Soothing music" : "Guided meditation"}</p>
        <p className="mt-2 text-[10.5px] opacity-60">Recorded audio streams here in the app.</p>
      </div>

      <div className="relative w-full max-w-sm">
        <div className="h-1.5 overflow-hidden rounded-full bg-white/25">
          <div className="h-full bg-white transition-all" style={{ width: `${pct}%` }} />
        </div>
        <div className="mt-1.5 flex justify-between text-[11px] opacity-80">
          <span>{fmt(secs)}</span><span>{fmt(total)}</span>
        </div>
        <div className="mt-4 flex items-center justify-center">
          <button onClick={() => setPlaying(!playing)} className="flex h-16 w-16 items-center justify-center rounded-full bg-white text-slate-900 shadow-lg">
            {playing ? <Pause size={26} /> : <Play size={26} />}
          </button>
        </div>
      </div>
    </div>
  );
}
