import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { ArrowLeft, Sparkles, RotateCcw } from "lucide-react";
import { PRAKRITI_QUESTIONS, scorePrakriti, type Dosha, type PrakritiAnswer } from "@/lib/diet";

export const Route = createFileRoute("/prakriti-guest")({
  head: () => ({
    meta: [
      { title: "Know anyone's Prakriti · AyuRaise" },
      { name: "description", content: "Quickly find out a friend or family member's dosha — nothing is saved." },
    ],
  }),
  component: GuestPrakritiPage,
});

function GuestPrakritiPage() {
  const [answers, setAnswers] = useState<PrakritiAnswer[]>([]);
  const [qIdx, setQIdx] = useState(0);
  const [done, setDone] = useState(false);

  const reset = () => { setAnswers([]); setQIdx(0); setDone(false); };

  return (
    <div className="min-h-svh px-5 pb-20 pt-[max(1.5rem,env(safe-area-inset-top))]" style={{ background: "var(--gradient-hero)" }}>
      <div className="mx-auto max-w-xl">
        <div className="mb-5 flex items-center justify-between">
          <Link to="/profile" className="flex h-9 w-9 items-center justify-center rounded-full bg-card/70 ring-1 ring-border" aria-label="Back">
            <ArrowLeft size={16} />
          </Link>
          <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-muted-foreground">Guest prakriti — not saved</p>
          <div className="w-9" />
        </div>

        {!done && (
          <Quiz
            qIdx={qIdx}
            answers={answers}
            onAnswer={(dosha) => {
              const next = [...answers.filter((a) => a.q !== qIdx), { q: qIdx, option: dosha }];
              setAnswers(next);
              if (qIdx + 1 < PRAKRITI_QUESTIONS.length) setQIdx(qIdx + 1);
              else setDone(true);
            }}
          />
        )}

        {done && <GuestResult answers={answers} onRetake={reset} />}
      </div>
    </div>
  );
}

function Quiz({ qIdx, answers, onAnswer }: { qIdx: number; answers: PrakritiAnswer[]; onAnswer: (d: Dosha) => void }) {
  const q = PRAKRITI_QUESTIONS[qIdx];
  const selected = answers.find((a) => a.q === qIdx)?.option;
  return (
    <div className="animate-float-up">
      <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-muted-foreground">
        Question {qIdx + 1} of {PRAKRITI_QUESTIONS.length}
      </p>
      <h1 className="mt-1 font-display text-2xl font-semibold text-foreground">{q.q}</h1>
      <div className="mt-6 space-y-3">
        {q.options.map((opt) => {
          const active = selected === opt.dosha;
          return (
            <button key={opt.dosha} onClick={() => onAnswer(opt.dosha)}
              className={`flex w-full items-center justify-between gap-3 rounded-2xl p-4 text-left ring-1 transition-all ${active ? "bg-primary/10 ring-primary" : "bg-card ring-border"}`}>
              <span className="text-sm text-foreground">{opt.label}</span>
              <span className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">{opt.dosha}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}

function GuestResult({ answers, onRetake }: { answers: PrakritiAnswer[]; onRetake: () => void }) {
  const result = scorePrakriti(answers);
  const total = (result.score.vata + result.score.pitta + result.score.kapha) || 1;
  const pct = {
    vata: Math.round((result.score.vata / total) * 100),
    pitta: Math.round((result.score.pitta / total) * 100),
    kapha: Math.round((result.score.kapha / total) * 100),
  };
  const colors: Record<Dosha, string> = { vata: "bg-sky-500", pitta: "bg-rose-500", kapha: "bg-emerald-500" };
  const tips: Record<Dosha, string[]> = {
    vata: [
      "Favour warm, cooked, slightly oily meals — soups, stews, khichdi.",
      "Stay on a steady daily rhythm — sleep, meals and movement at the same time.",
      "Avoid raw salads, cold drinks and excess caffeine.",
      "Gentle yoga, slow walks and oil massage (abhyanga) calm vata.",
    ],
    pitta: [
      "Cooling foods — cucumber, melon, leafy greens, coconut water.",
      "Avoid skipping meals, spicy/fried food and too much sun.",
      "Take breaks. Pittas burn out when they push non-stop.",
      "Moon walks, swimming and shitali pranayama soothe pitta.",
    ],
    kapha: [
      "Light, warm, spiced meals — go easy on dairy, sweets and fried food.",
      "Move every day — brisk walks, vigorous yoga, dancing.",
      "Wake up before sunrise; avoid long daytime naps.",
      "Warming spices (ginger, black pepper, turmeric) lift kapha.",
    ],
  };

  return (
    <div className="animate-float-up">
      <p className="text-xs font-semibold uppercase tracking-[0.2em] text-primary/80">Guest result</p>
      <h1 className="mt-1 font-display text-3xl font-semibold capitalize text-foreground">{result.dosha}-dominant</h1>

      <div className="mt-5 rounded-3xl bg-card p-5 shadow-[var(--shadow-soft)] ring-1 ring-border/60">
        <p className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">Composition</p>
        <div className="mt-3 flex h-3 w-full overflow-hidden rounded-full bg-muted">
          <div className={colors.vata} style={{ width: `${pct.vata}%` }} />
          <div className={colors.pitta} style={{ width: `${pct.pitta}%` }} />
          <div className={colors.kapha} style={{ width: `${pct.kapha}%` }} />
        </div>
        <div className="mt-3 space-y-2 text-sm">
          {(["vata", "pitta", "kapha"] as Dosha[]).map((d) => (
            <div key={d} className="flex items-center justify-between">
              <span className="flex items-center gap-2 capitalize"><span className={`h-2.5 w-2.5 rounded-full ${colors[d]}`} />{d}</span>
              <span className="font-semibold">{pct[d]}%</span>
            </div>
          ))}
        </div>
      </div>

      <div className="mt-4 rounded-3xl bg-card p-5 ring-1 ring-border/60 shadow-[var(--shadow-soft)]">
        <p className="text-[11px] font-semibold uppercase tracking-wider text-primary">Basic recommendations</p>
        <ul className="mt-3 space-y-2 text-sm text-foreground/85">
          {tips[result.dosha].map((t) => (
            <li key={t} className="flex items-start gap-2"><span className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-primary" />{t}</li>
          ))}
        </ul>
      </div>

      <div className="mt-4 rounded-2xl bg-amber-50 p-3 text-[12px] text-amber-900 ring-1 ring-amber-200 dark:bg-amber-950/30 dark:text-amber-100 dark:ring-amber-900">
        Heads up — this result was <b>not saved</b>. To create full personalized plans for this person, add them as a separate profile from the home screen.
      </div>

      <div className="mt-5 grid gap-2">
        <button onClick={onRetake} className="flex items-center justify-center gap-2 rounded-2xl bg-card px-5 py-3 text-sm font-semibold text-foreground ring-1 ring-border">
          <RotateCcw size={14} /> Take again for someone else
        </button>
        <Link to="/onboarding" search={{ profileId: "new" }} className="flex items-center justify-center gap-2 rounded-2xl bg-primary px-5 py-3 text-sm font-semibold text-primary-foreground shadow-[var(--shadow-glow)]">
          <Sparkles size={14} /> Add as a new profile
        </Link>
      </div>
    </div>
  );
}
