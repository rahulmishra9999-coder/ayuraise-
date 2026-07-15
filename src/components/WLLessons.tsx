// Noom-grammar lesson experience for the Weight Loss section.
// See docs/content-style-guide.md: staircase lines, bare quiz options,
// answer screens, named concepts, if→try examples, recap into a tool.

import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "@tanstack/react-router";
import {
  X, ChevronLeft, ChevronRight, CheckCircle2, Sparkles, BookOpen, ThumbsUp, ArrowRight,
} from "lucide-react";
import { loadProfile } from "@/lib/weight-loss";
import {
  WL_LESSONS, WL_LESSON_CATEGORIES, loadLessonProgress, saveLessonProgress,
  type WLLesson, type LessonCard, type VisualKey,
} from "@/lib/wl-lessons";

/* ================= Animated visuals ================= */

function Bar({ emoji, label, pct, color, delay }: { emoji: string; label: string; pct: number; color: string; delay: number }) {
  return (
    <div className="mt-2 first:mt-0">
      <div className="flex items-center justify-between text-[11.5px] font-semibold text-foreground/80">
        <span>{emoji} {label}</span>
      </div>
      <div className="mt-1 h-4 w-full overflow-hidden rounded-full bg-card ring-1 ring-border/60">
        <div
          className="h-full origin-left rounded-full"
          style={{ width: `${pct}%`, background: color, animation: `grow-bar 900ms cubic-bezier(0.22,1,0.36,1) ${delay}ms both` }}
        />
      </div>
    </div>
  );
}

function CalorieBalance() {
  return (
    <div className="mt-5 w-full rounded-3xl bg-secondary/50 p-4">
      <Bar emoji="🍽️" label="Calories in" pct={62} color="linear-gradient(90deg,#fda4af,#fb7185)" delay={0} />
      <Bar emoji="🔥" label="Calories out" pct={84} color="linear-gradient(90deg,#6ee7b7,#34d399)" delay={350} />
    </div>
  );
}

function SugarCurve() {
  return (
    <div className="mt-5 w-full rounded-3xl bg-secondary/50 p-4">
      <svg viewBox="0 0 280 150" className="w-full" role="img" aria-label="Blood sugar: spike and crash vs steady">
        <line x1="12" y1="100" x2="268" y2="100" stroke="currentColor" strokeOpacity="0.18" strokeDasharray="4 4" />
        <text x="14" y="94" fontSize="9" fill="currentColor" opacity="0.5">normal sugar</text>
        <path
          d="M15,100 C40,20 62,18 88,105 C100,140 118,138 150,120 C185,102 230,101 265,100"
          fill="none" stroke="#fb7185" strokeWidth="3.5" strokeLinecap="round"
          pathLength={1} strokeDasharray="1" strokeDashoffset="1"
          style={{ animation: "draw-line 1400ms ease-out 200ms forwards" }}
        />
        <path
          d="M15,100 C55,78 95,74 140,84 C185,92 225,96 265,96"
          fill="none" stroke="#34d399" strokeWidth="3.5" strokeLinecap="round"
          pathLength={1} strokeDasharray="1" strokeDashoffset="1"
          style={{ animation: "draw-line 1400ms ease-out 900ms forwards" }}
        />
        <text x="52" y="14" fontSize="10" fontWeight="700" fill="#fb7185">spike 🍞</text>
        <text x="96" y="147" fontSize="10" fontWeight="700" fill="#fb7185">crash… snack time 😫</text>
        <text x="196" y="78" fontSize="10" fontWeight="700" fill="#10b981">steady 🥞 😊</text>
      </svg>
    </div>
  );
}

function MealClock() {
  const R = 54;
  const C = 2 * Math.PI * R;
  const eatFrac = 9.5 / 24;
  const meals = [
    { h: 9.5, emoji: "🍳", label: "9:30" },
    { h: 14, emoji: "🍛", label: "2 PM" },
    { h: 16, emoji: "🥜", label: "4 PM" },
    { h: 19, emoji: "🥣", label: "7 PM" },
  ];
  return (
    <div className="mt-5 w-full rounded-3xl bg-secondary/50 p-4">
      <div className="relative mx-auto h-44 w-44">
        <svg viewBox="0 0 140 140" className="h-full w-full">
          <circle cx="70" cy="70" r={R} fill="none" stroke="currentColor" strokeOpacity="0.12" strokeWidth="10" />
          <circle
            cx="70" cy="70" r={R} fill="none" stroke="#34d399" strokeWidth="10" strokeLinecap="round"
            strokeDasharray={`${C * eatFrac} ${C * (1 - eatFrac)}`}
            transform={`rotate(${(9.5 / 24) * 360 - 90} 70 70)`}
            className="animate-pop-in"
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
          <p className="font-display text-xl font-extrabold text-foreground">14h</p>
          <p className="text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">overnight fast</p>
        </div>
        {meals.map((m) => {
          const ang = ((m.h / 24) * 360 - 90) * (Math.PI / 180);
          const x = 50 + 46 * Math.cos(ang);
          const y = 50 + 46 * Math.sin(ang);
          return (
            <span
              key={m.h}
              className="absolute -translate-x-1/2 -translate-y-1/2 text-lg animate-pop-in"
              style={{ left: `${x}%`, top: `${y}%`, animationDelay: `${300 + m.h * 40}ms` }}
              title={m.label}
            >
              {m.emoji}
            </span>
          );
        })}
      </div>
      <div className="mt-2 flex flex-wrap items-center justify-center gap-1.5 text-[10.5px] font-semibold text-muted-foreground">
        <span className="rounded-full bg-card px-2 py-0.5 ring-1 ring-border/60">🍳 9:30 breakfast</span>
        <span className="rounded-full bg-card px-2 py-0.5 ring-1 ring-border/60">🍛 2 lunch</span>
        <span className="rounded-full bg-card px-2 py-0.5 ring-1 ring-border/60">🥜 11 / 4 mini</span>
        <span className="rounded-full bg-card px-2 py-0.5 ring-1 ring-border/60">🥣 7 dinner</span>
      </div>
    </div>
  );
}

function Visual({ v }: { v: VisualKey }) {
  if (v === "calorieBalance") return <CalorieBalance />;
  if (v === "sugarCurve") return <SugarCurve />;
  return <MealClock />;
}

/* ================= Science hero ================= */

export function WLScienceHero() {
  return (
    <div className="relative mt-4 overflow-hidden rounded-[28px] p-5 shadow-[var(--shadow-soft)] ring-1 ring-border/60" style={{ background: "var(--gradient-sage)" }}>
      <div className="absolute -right-10 -top-10 h-32 w-32 rounded-full bg-white/40 blur-2xl" />
      <div className="relative">
        <div className="inline-flex items-center gap-1.5 rounded-full bg-white/50 px-2.5 py-1 text-[10px] font-bold uppercase tracking-widest text-foreground backdrop-blur-sm">
          <Sparkles size={11} /> How weight works
        </div>
        <h3 className="mt-2 font-display text-[24px] font-bold leading-[1.12] text-foreground">
          Calories in − calories out.<br />
          <span className="italic">No need to eat less — eat right.</span>
        </h3>
        <p className="mt-2 text-[13px] leading-relaxed text-foreground/80">
          Four short courses. Two minutes a lesson. Each one changes how you see food — starting with raisins and grapes.
        </p>
        <div className="mt-4 rounded-2xl bg-white/40 p-3 backdrop-blur-sm">
          <Bar emoji="🍽️" label="Calories in" pct={62} color="linear-gradient(90deg,#fda4af,#fb7185)" delay={200} />
          <Bar emoji="🔥" label="Calories out" pct={84} color="linear-gradient(90deg,#6ee7b7,#10b981)" delay={550} />
        </div>
      </div>
    </div>
  );
}

/* ================= Lessons grid ================= */

export function WLLessonsGrid() {
  const [open, setOpen] = useState<WLLesson | null>(null);
  const [cat, setCat] = useState<string>("All");
  const [progress, setProgress] = useState<Record<string, number>>({});
  useEffect(() => { setProgress(loadLessonProgress()); }, [open]);
  const filtered = cat === "All" ? WL_LESSONS : WL_LESSONS.filter((l) => l.category === cat);

  return (
    <>
      <div className="-mx-5 mb-3 overflow-x-auto px-5 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        <div className="flex gap-1.5">
          {WL_LESSON_CATEGORIES.map((c) => {
            const on = cat === c;
            return (
              <button
                key={c}
                onClick={() => setCat(c)}
                className={`shrink-0 rounded-full px-3 py-1.5 text-[11.5px] font-semibold transition ${
                  on ? "bg-primary text-primary-foreground shadow-[var(--shadow-glow)]" : "bg-card text-foreground ring-1 ring-border/60"
                }`}
              >
                {c}
              </button>
            );
          })}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        {filtered.map((l, idx) => {
          const p = progress[l.id] ?? 0;
          const done = p >= 100;
          return (
            <button
              key={l.id}
              onClick={() => setOpen(l)}
              className="tile overflow-hidden rounded-3xl bg-card text-left ring-1 ring-border/60 animate-float-up"
              style={{ animationDelay: `${idx * 60}ms` }}
            >
              <div className="relative flex h-24 items-center justify-center text-5xl" style={{ background: l.tint }}>
                <span className="drop-shadow-sm">{l.emoji}</span>
                {done && (
                  <span className="absolute right-2 top-2 flex h-6 w-6 items-center justify-center rounded-full bg-white/85 text-emerald-600 shadow-sm">
                    <CheckCircle2 size={14} />
                  </span>
                )}
              </div>
              <div className="p-3">
                <p className="line-clamp-2 font-display text-[12.5px] font-semibold leading-tight">{l.title}</p>
                <div className="mt-2 flex items-center gap-1.5 text-[10px]">
                  <span className="rounded-full bg-secondary px-2 py-0.5 font-semibold">{l.minutes} min</span>
                  <span className="line-clamp-1 text-muted-foreground">· {l.category}</span>
                </div>
                {p > 0 && !done && (
                  <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-secondary">
                    <div className="h-full rounded-full transition-all" style={{ width: `${p}%`, background: "var(--gradient-sunrise)" }} />
                  </div>
                )}
              </div>
            </button>
          );
        })}
      </div>

      <Link
        to="/learn"
        className="mt-3 flex items-center justify-center gap-2 rounded-2xl bg-card px-4 py-3 text-sm font-semibold text-foreground shadow-[var(--shadow-soft)] ring-1 ring-border/60"
      >
        <BookOpen size={15} className="text-primary" /> More in Learn Academy <ChevronRight size={14} />
      </Link>

      {open && <WLLessonPlayer lesson={open} onClose={() => setOpen(null)} />}
    </>
  );
}

/* ================= Player ================= */

function useFirstName(): string {
  return useMemo(() => {
    const n = loadProfile()?.name?.trim().split(/\s+/)[0];
    return n && n.length > 1 ? n : "friend";
  }, []);
}

function fillName(s: string, name: string) {
  return s.replaceAll("{name}", name);
}

export function WLLessonPlayer({ lesson, onClose }: { lesson: WLLesson; onClose: () => void }) {
  const [step, setStep] = useState(0);
  const [picks, setPicks] = useState<Record<number, number>>({});
  const total = lesson.cards.length;
  const card = lesson.cards[step];
  const name = useFirstName();

  useEffect(() => {
    saveLessonProgress(lesson.id, Math.round(((step + 1) / total) * 100));
  }, [step, lesson.id, total]);

  const isQuiz = card.kind === "quiz";
  const picked = picks[step];

  const next = () => step < total - 1 && setStep(step + 1);
  const prev = () => step > 0 && setStep(step - 1);

  const pick = (i: number) => {
    if (picked !== undefined) return;
    setPicks((p) => ({ ...p, [step]: i }));
    window.setTimeout(() => setStep((s) => Math.min(s + 1, total - 1)), 450);
  };

  // for answer cards, find the quiz that precedes them
  const quizBefore = useMemo(() => {
    for (let i = step - 1; i >= 0; i--) {
      const c = lesson.cards[i];
      if (c.kind === "quiz") return { card: c, pick: picks[i] };
    }
    return null;
  }, [step, lesson.cards, picks]);

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/60 backdrop-blur-sm sm:items-center">
      <div className="relative flex max-h-[92svh] w-full max-w-md flex-col overflow-hidden rounded-t-[32px] bg-card sm:rounded-[32px]">
        {/* course label + progress */}
        <div className="px-4 pt-3">
          <p className="pr-10 text-center text-[10px] font-bold uppercase tracking-[0.18em] text-primary">{lesson.category}</p>
          <div className="mt-2 flex gap-1">
            {lesson.cards.map((_, i) => (
              <div key={i} className="h-1 flex-1 overflow-hidden rounded-full bg-secondary">
                <div className={`h-full transition-all duration-500 ${i <= step ? "w-full" : "w-0"}`} style={{ background: "var(--gradient-sunrise)" }} />
              </div>
            ))}
          </div>
        </div>
        <button onClick={onClose} className="absolute right-3 top-2.5 z-10 flex h-8 w-8 items-center justify-center rounded-full bg-card ring-1 ring-border/60">
          <X size={14} />
        </button>

        <div className="min-h-[440px] flex-1 overflow-y-auto p-6" key={step}>
          <CardView card={card} lesson={lesson} picked={picked} onPick={pick} quizBefore={quizBefore} name={name} onClose={onClose} />
        </div>

        <div className="flex items-center gap-2 border-t border-border/60 p-4">
          <button onClick={prev} disabled={step === 0} className="flex h-11 w-11 items-center justify-center rounded-2xl bg-secondary disabled:opacity-40">
            <ChevronLeft size={16} />
          </button>
          {step < total - 1 ? (
            <button
              onClick={next}
              disabled={isQuiz && picked === undefined}
              className="flex flex-1 items-center justify-center gap-2 rounded-2xl bg-primary px-4 py-3 text-sm font-semibold text-primary-foreground shadow-[var(--shadow-glow)] disabled:opacity-40"
            >
              {isQuiz && picked === undefined ? "Pick one" : "Continue"} <ChevronRight size={16} />
            </button>
          ) : (
            <button
              onClick={onClose}
              className="flex flex-1 items-center justify-center gap-2 rounded-2xl bg-primary px-4 py-3 text-sm font-semibold text-primary-foreground shadow-[var(--shadow-glow)]"
            >
              Done <CheckCircle2 size={16} />
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

function CardView({ card, lesson, picked, onPick, quizBefore, name, onClose }: {
  card: LessonCard;
  lesson: WLLesson;
  picked: number | undefined;
  onPick: (i: number) => void;
  quizBefore: { card: Extract<LessonCard, { kind: "quiz" }>; pick: number | undefined } | null;
  name: string;
  onClose: () => void;
}) {
  const navigate = useNavigate();

  if (card.kind === "cover") {
    return (
      <div className="flex flex-col items-center pt-4 text-center animate-shimmer-in">
        <div className="animate-breathe flex h-44 w-44 items-center justify-center rounded-[40px] text-7xl shadow-[var(--shadow-tile)]" style={{ background: lesson.tint }}>
          {card.emoji}
        </div>
        <p className="mt-6 text-[11px] font-semibold uppercase tracking-[0.2em] text-primary">{lesson.minutes} min</p>
        <h3 className="mt-2 font-display text-2xl font-bold leading-tight">{lesson.title}</h3>
        <p className="mt-3 text-[14.5px] leading-relaxed text-muted-foreground">{card.tagline}</p>
      </div>
    );
  }

  if (card.kind === "text") {
    return (
      <div className="animate-shimmer-in pt-2">
        <div className="space-y-4">
          {card.lines.map((line, i) => (
            <p
              key={i}
              className="text-[16.5px] leading-relaxed text-foreground/90 animate-float-up"
              style={{ animationDelay: `${i * 260}ms` }}
            >
              {card.highlight === i ? (
                <span className="rounded-md bg-accent/70 box-decoration-clone px-1 py-0.5 font-semibold text-foreground">
                  {fillName(line, name)}
                </span>
              ) : (
                fillName(line, name)
              )}
            </p>
          ))}
        </div>
        {card.visual && <Visual v={card.visual} />}
      </div>
    );
  }

  if (card.kind === "quiz") {
    return (
      <div className="animate-shimmer-in pt-2">
        <h4 className="font-display text-[21px] font-bold leading-snug">{fillName(card.q, name)}</h4>
        <div className="mt-6 space-y-3">
          {card.options.map((o, i) => {
            const isPick = picked === i;
            return (
              <button
                key={o}
                onClick={() => onPick(i)}
                className={`w-full rounded-2xl p-4 text-center text-[15px] font-semibold transition-all duration-200 ${
                  isPick
                    ? "bg-primary text-primary-foreground shadow-[var(--shadow-glow)] scale-[0.98]"
                    : picked !== undefined
                    ? "bg-secondary/40 text-foreground/60"
                    : "bg-secondary/60 text-foreground ring-1 ring-border/60 hover:ring-primary/50 active:scale-[0.97]"
                }`}
              >
                {o}
              </button>
            );
          })}
        </div>
      </div>
    );
  }

  if (card.kind === "answer") {
    const right = quizBefore && quizBefore.pick === quizBefore.card.best;
    const bestLabel = quizBefore ? quizBefore.card.options[quizBefore.card.best] : "";
    return (
      <div className="animate-shimmer-in pt-2">
        <div className="flex flex-col items-center pb-2 pt-4 text-center">
          <span className="animate-pop-in flex h-16 w-16 items-center justify-center rounded-full bg-accent/60 text-primary">
            <ThumbsUp size={28} />
          </span>
          <h4 className="mt-4 font-display text-2xl font-bold">
            {right ? "You're right!" : `Best answer: ${bestLabel}`}
          </h4>
        </div>
        <div className="mt-4 space-y-4">
          {card.beats.map((b, i) => (
            <p
              key={i}
              className="text-[16px] leading-relaxed text-foreground/90 animate-float-up"
              style={{ animationDelay: `${300 + i * 300}ms` }}
            >
              {fillName(b, name)}
            </p>
          ))}
          {card.cliffhanger && (
            <p
              className="flex items-start gap-2 text-[14.5px] font-semibold italic text-primary animate-float-up"
              style={{ animationDelay: `${300 + card.beats.length * 300}ms` }}
            >
              <ArrowRight size={16} className="mt-1 shrink-0" /> {fillName(card.cliffhanger, name)}
            </p>
          )}
        </div>
      </div>
    );
  }

  if (card.kind === "examples") {
    return (
      <div className="animate-shimmer-in pt-2">
        <h4 className="font-display text-[19px] font-bold leading-snug">{card.intro}</h4>
        <ul className="mt-5 space-y-4">
          {card.items.map((it, i) => (
            <li key={i} className="animate-float-up" style={{ animationDelay: `${i * 200}ms` }}>
              <p className="text-[15px] leading-relaxed text-foreground/90">
                <span className="mr-1.5 text-saffron">◆</span>
                If {fillName(it.when, name)},{" "}
                <span className="font-semibold">try this: {fillName(it.then, name)}.</span>
              </p>
            </li>
          ))}
        </ul>
      </div>
    );
  }

  // recap
  return (
    <div className="animate-shimmer-in pt-2">
      <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-primary">Putting it all together</p>
      <ul className="mt-4 space-y-3.5">
        {card.bullets.map((b, i) => (
          <li key={i} className="flex items-start gap-2.5 text-[15.5px] leading-relaxed text-foreground/90 animate-float-up" style={{ animationDelay: `${i * 200}ms` }}>
            <span className="mt-0.5 text-saffron">◆</span> {fillName(b, name)}
          </li>
        ))}
      </ul>
      <div className="mt-6 rounded-3xl p-4 ring-1 ring-border/60 animate-pop-in" style={{ background: "var(--gradient-hero)", animationDelay: `${card.bullets.length * 200 + 200}ms` }}>
        <p className="text-[11px] font-bold uppercase tracking-wide text-saffron">🎯 Get started today</p>
        <p className="mt-1.5 text-[14.5px] font-medium leading-relaxed text-foreground/90">{fillName(card.action, name)}</p>
        {card.cta && (
          <button
            onClick={() => { onClose(); navigate({ to: card.cta!.to }); }}
            className="mt-3 flex w-full items-center justify-center gap-2 rounded-2xl bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground shadow-[var(--shadow-glow)]"
          >
            {card.cta.label} <ArrowRight size={15} />
          </button>
        )}
      </div>
    </div>
  );
}
