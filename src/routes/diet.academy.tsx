import { createFileRoute, Link } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import {
  ArrowLeft, GraduationCap, Sparkles, Volume2, Play, ChevronLeft, ChevronRight,
  BookOpen, Leaf, FlaskConical, Sun, ShieldAlert, Repeat,
} from "lucide-react";
import { BottomNav } from "@/components/BottomNav";

export const Route = createFileRoute("/diet/academy")({
  head: () => ({
    meta: [
      { title: "Nutrition Academy · AyuRaise" },
      { name: "description", content: "Interactive flash cards, audio & video lessons on nutrition, myths, science and Ayurveda." },
    ],
  }),
  component: AcademyPage,
});

type Track = {
  id: string;
  title: string;
  emoji: string;
  icon: React.ReactNode;
  gradient: string;
  cards: { title: string; body: string; emoji?: string }[];
};

const TRACKS: Track[] = [
  {
    id: "myths",
    title: "Nutrition Myths",
    emoji: "🧨",
    icon: <ShieldAlert size={18} />,
    gradient: "var(--gradient-clay)",
    cards: [
      { emoji: "🥔", title: "Carbs make you fat", body: "Excess calories do — not carbs. Whole-food carbs are fine." },
      { emoji: "🥚", title: "Eggs raise cholesterol", body: "Dietary cholesterol has little effect on blood cholesterol for most." },
      { emoji: "🧈", title: "All fat is bad", body: "Ghee, olive oil, nuts are essential. Trans fats aren't." },
      { emoji: "🌙", title: "Never eat after 7pm", body: "Total calories & sleep matter more than clock time." },
      { emoji: "🍎", title: "Fruit sugar = table sugar", body: "Whole fruit brings fibre, water, phytonutrients — very different." },
    ],
  },
  {
    id: "science",
    title: "Science Explained",
    emoji: "🧪",
    icon: <FlaskConical size={18} />,
    gradient: "var(--gradient-violet)",
    cards: [
      { emoji: "⚡", title: "TDEE", body: "Total daily energy = BMR × activity. Weight change = calories in vs out." },
      { emoji: "🩸", title: "Glycemic Index", body: "How fast a food raises blood sugar. Low GI = steadier energy." },
      { emoji: "💪", title: "Protein Turnover", body: "0.8–1.2g/kg protects muscle in fat loss and ageing." },
      { emoji: "🦠", title: "Microbiome", body: "Fibre and ferments feed the microbes that shape immunity and mood." },
    ],
  },
  {
    id: "ayurveda",
    title: "Ayurveda Explained",
    emoji: "🌿",
    icon: <Leaf size={18} />,
    gradient: "var(--gradient-sage)",
    cards: [
      { emoji: "🔥", title: "Agni", body: "Digestive fire. Strong agni → good digestion. Weak agni → ama (toxins)." },
      { emoji: "🌬️", title: "The 3 Doshas", body: "Vata (air), Pitta (fire), Kapha (earth) — balance is health." },
      { emoji: "☀️", title: "Ritucharya", body: "Seasonal eating — nature grows what your body needs each season." },
      { emoji: "🍽️", title: "6 Tastes", body: "Sweet, sour, salty, pungent, bitter, astringent — include all daily." },
    ],
  },
  {
    id: "seasonal",
    title: "Seasonal Nutrition",
    emoji: "🍂",
    icon: <Sun size={18} />,
    gradient: "var(--gradient-dawn)",
    cards: [
      { emoji: "☀️", title: "Summer", body: "Cool, sweet, hydrating. Coconut water, cucumber, sweet fruits." },
      { emoji: "❄️", title: "Winter", body: "Warm, oily, nourishing. Sesame, ghee, millets, root vegetables." },
      { emoji: "🌧️", title: "Monsoon", body: "Warm, cooked, easy on gut. Ginger, khichdi, avoid raw." },
    ],
  },
  {
    id: "habits",
    title: "Healthy Habits",
    emoji: "🔁",
    icon: <Repeat size={18} />,
    gradient: "var(--gradient-leaf)",
    cards: [
      { emoji: "💧", title: "Hydrate first", body: "Warm water on wake-up kick-starts digestion." },
      { emoji: "🚶", title: "Walk after meals", body: "100 steps → better glucose response." },
      { emoji: "🍽️", title: "Eat mindfully", body: "No screens. Chew 20+ times. Stop at 75%." },
      { emoji: "🌙", title: "Consistent sleep", body: "Bed by 10:30 supports weight, mood, digestion." },
    ],
  },
];

function AcademyPage() {
  const [activeId, setActiveId] = useState<string>(TRACKS[0].id);
  const active = useMemo(() => TRACKS.find((t) => t.id === activeId)!, [activeId]);

  return (
    <div className="min-h-svh pb-28" style={{ background: "var(--gradient-hero)" }}>
      <div className="mx-auto max-w-xl px-5 pt-[max(1rem,env(safe-area-inset-top))]">
        <div className="flex items-center justify-between pt-1">
          <Link
            to="/section/diet"
            className="flex h-10 w-10 items-center justify-center rounded-full bg-card shadow-[var(--shadow-soft)] ring-1 ring-border/60"
            aria-label="Back"
          >
            <ArrowLeft size={18} />
          </Link>
          <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-muted-foreground">Academy</p>
          <div className="w-10" />
        </div>

        {/* Hero */}
        <div className="mt-4 flex items-center gap-3 rounded-3xl p-5 text-primary-foreground shadow-[var(--shadow-soft)]" style={{ background: "var(--gradient-violet)" }}>
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-card/25 backdrop-blur-sm">
            <GraduationCap size={22} strokeWidth={1.7} />
          </div>
          <div>
            <h1 className="font-display text-2xl font-semibold leading-tight">Nutrition Academy</h1>
            <p className="text-xs text-primary-foreground/85">Learn nutrition in 60-second bites.</p>
          </div>
        </div>

        {/* Track chips */}
        <div className="-mx-5 mt-5 overflow-x-auto px-5">
          <div className="flex gap-2">
            {TRACKS.map((t) => (
              <button
                key={t.id}
                onClick={() => setActiveId(t.id)}
                className={`flex shrink-0 items-center gap-1.5 rounded-full px-3.5 py-2 text-xs font-semibold ring-1 transition-all ${
                  activeId === t.id
                    ? "bg-primary text-primary-foreground ring-primary shadow-[var(--shadow-glow)]"
                    : "bg-card text-foreground ring-border/60"
                }`}
              >
                <span>{t.emoji}</span> {t.title}
              </button>
            ))}
          </div>
        </div>

        {/* Deck */}
        <FlashSwipe track={active} />

        {/* Modes */}
        <div className="mt-5 grid grid-cols-2 gap-3">
          <ModeCard icon={<Volume2 size={18} />} title="AI Audio Lessons" desc="Listen on the go." tone="sage" />
          <ModeCard icon={<Play size={18} />} title="AI Video Lessons" desc="Watch bite-sized clips." tone="clay" />
          <ModeCard icon={<BookOpen size={18} />} title="Interactive Tutorials" desc="Guided walkthroughs." tone="dawn" />
          <ModeCard icon={<GraduationCap size={18} />} title="Learning Modules" desc="Structured mini-courses." tone="violet" />
        </div>

        {/* AI CTA */}
        <div className="relative mt-6 overflow-hidden rounded-[28px] p-6 shadow-[var(--shadow-glow)]" style={{ background: "var(--gradient-gold)" }}>
          <div className="absolute -right-10 -top-10 h-40 w-40 rounded-full bg-white/25 blur-2xl" />
          <div className="relative">
            <div className="inline-flex items-center gap-1.5 rounded-full bg-white/25 px-3 py-1 text-[10px] font-bold uppercase tracking-widest text-foreground backdrop-blur-sm">
              <Sparkles size={11} /> Turn learning into action
            </div>
            <h3 className="mt-3 font-display text-xl font-semibold leading-tight text-foreground">
              Ready to build your plan?
            </h3>
            <Link
              to="/combined-plan"
              search={{ goal: "diet" as const }}
              className="mt-4 inline-flex items-center gap-2 rounded-2xl bg-foreground px-5 py-3 text-sm font-semibold text-background shadow-lg transition-transform active:scale-[0.98]"
            >
              <Sparkles size={16} /> Personalize with AI
            </Link>
          </div>
        </div>
      </div>
      <BottomNav />
    </div>
  );
}

function FlashSwipe({ track }: { track: Track }) {
  const [i, setI] = useState(0);
  const [flipped, setFlipped] = useState(false);
  const c = track.cards[i];
  const go = (d: number) => {
    setFlipped(false);
    setI((p) => (p + d + track.cards.length) % track.cards.length);
  };
  return (
    <div className="mt-5">
      <button
        onClick={() => setFlipped((f) => !f)}
        className="relative flex min-h-[220px] w-full flex-col items-start justify-between overflow-hidden rounded-3xl p-6 text-left shadow-[var(--shadow-soft)] ring-1 ring-border/60 transition-transform active:scale-[0.99]"
        style={{ background: track.gradient }}
      >
        <div className="flex w-full items-center justify-between">
          <span className="text-5xl drop-shadow-sm">{c.emoji ?? track.emoji}</span>
          <span className="rounded-full bg-white/40 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-foreground backdrop-blur-sm">
            {i + 1} / {track.cards.length}
          </span>
        </div>
        <div className="mt-4 w-full">
          <h3 className="font-display text-xl font-semibold text-primary-foreground drop-shadow-sm">{c.title}</h3>
          <p className="mt-2 text-[13px] leading-relaxed text-primary-foreground/95">
            {flipped ? c.body : "Tap to reveal · 30–60 sec"}
          </p>
        </div>
      </button>
      <div className="mt-3 flex items-center justify-between">
        <button onClick={() => go(-1)} className="flex h-10 w-10 items-center justify-center rounded-full bg-card ring-1 ring-border/60"><ChevronLeft size={18} /></button>
        <div className="flex items-center gap-1.5">
          {track.cards.map((_, k) => (
            <span key={k} className={`h-1.5 rounded-full transition-all ${k === i ? "w-6 bg-primary" : "w-1.5 bg-border"}`} />
          ))}
        </div>
        <button onClick={() => go(1)} className="flex h-10 w-10 items-center justify-center rounded-full bg-card ring-1 ring-border/60"><ChevronRight size={18} /></button>
      </div>
    </div>
  );
}

function ModeCard({ icon, title, desc, tone }: { icon: React.ReactNode; title: string; desc: string; tone: "sage" | "clay" | "dawn" | "violet" }) {
  return (
    <div className="rounded-3xl bg-card p-4 ring-1 ring-border/60 shadow-[var(--shadow-soft)]">
      <div className="flex h-10 w-10 items-center justify-center rounded-2xl text-primary-foreground" style={{ background: `var(--gradient-${tone})` }}>
        {icon}
      </div>
      <p className="mt-3 font-display text-sm font-semibold">{title}</p>
      <p className="mt-0.5 text-[11px] text-muted-foreground">{desc}</p>
    </div>
  );
}
