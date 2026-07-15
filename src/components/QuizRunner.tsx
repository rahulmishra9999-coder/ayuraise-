import { useMemo, useState } from "react";
import { Check, X, ExternalLink, RotateCcw, Trophy, BookOpen } from "lucide-react";
import { QUIZZES, type QuizCategory } from "@/lib/quizzes";

export function QuizRunner({ quizId }: { quizId: QuizCategory }) {
  const quiz = QUIZZES[quizId];
  const [idx, setIdx] = useState(0);
  const [picked, setPicked] = useState<number | null>(null);
  const [score, setScore] = useState(0);
  const [done, setDone] = useState(false);

  const total = quiz.questions.length;
  const q = quiz.questions[idx];

  const progress = useMemo(() => Math.round(((idx + (picked != null ? 1 : 0)) / total) * 100), [idx, picked, total]);

  function pick(i: number) {
    if (picked != null) return;
    setPicked(i);
    if (i === q.correct) setScore((s) => s + 1);
  }
  function next() {
    if (idx + 1 >= total) {
      setDone(true);
      return;
    }
    setIdx((i) => i + 1);
    setPicked(null);
  }
  function reset() {
    setIdx(0); setPicked(null); setScore(0); setDone(false);
  }

  if (done) {
    const pct = Math.round((score / total) * 100);
    return (
      <div className="rounded-3xl bg-card p-5 shadow-[var(--shadow-soft)] ring-1 ring-border/60 text-center">
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/15 text-primary">
          <Trophy size={26} />
        </div>
        <h3 className="mt-3 font-display text-xl font-semibold">{quiz.emoji} {pct >= 80 ? "Crushed it!" : pct >= 50 ? "Solid effort" : "Keep learning"}</h3>
        <p className="mt-1 text-sm text-muted-foreground">You scored <b className="text-foreground">{score}/{total}</b> · {pct}%</p>
        <button
          onClick={reset}
          className="mt-5 inline-flex items-center gap-2 rounded-2xl bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground"
        >
          <RotateCcw size={14} /> Retake
        </button>
      </div>
    );
  }

  return (
    <div className="rounded-3xl bg-card p-5 shadow-[var(--shadow-soft)] ring-1 ring-border/60">
      {/* Progress */}
      <div className="mb-3 flex items-center justify-between text-[11px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">
        <span>{quiz.emoji} {quiz.title}</span>
        <span>{idx + 1} / {total}</span>
      </div>
      <div className="h-1.5 w-full overflow-hidden rounded-full bg-muted">
        <div className="h-full rounded-full bg-primary transition-all" style={{ width: `${progress}%` }} />
      </div>

      {/* Question */}
      <h4 className="mt-4 font-display text-base font-semibold leading-snug text-foreground">{q.q}</h4>
      <div className="mt-3 space-y-2">
        {q.options.map((opt, i) => {
          const isCorrect = picked != null && i === q.correct;
          const isWrongPick = picked != null && i === picked && picked !== q.correct;
          return (
            <button
              key={i}
              onClick={() => pick(i)}
              disabled={picked != null}
              className={`flex w-full items-start gap-3 rounded-2xl border p-3 text-left text-sm transition-all ${
                isCorrect
                  ? "border-green-500 bg-green-50 text-green-900 dark:bg-green-950/40 dark:text-green-100"
                  : isWrongPick
                  ? "border-rose-500 bg-rose-50 text-rose-900 dark:bg-rose-950/40 dark:text-rose-100"
                  : picked != null
                  ? "border-border/60 bg-secondary/30 opacity-60"
                  : "border-border/60 bg-secondary/30 hover:border-primary/50"
              }`}
            >
              <span className={`mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full text-[10px] font-bold ${
                isCorrect ? "bg-green-600 text-white" : isWrongPick ? "bg-rose-600 text-white" : "bg-card ring-1 ring-border"
              }`}>
                {isCorrect ? <Check size={12} /> : isWrongPick ? <X size={12} /> : String.fromCharCode(65 + i)}
              </span>
              <span className="flex-1">{opt}</span>
            </button>
          );
        })}
      </div>

      {/* Concept reveal */}
      {picked != null && (
        <div className="mt-4 rounded-2xl bg-accent/40 p-4 ring-1 ring-border/60">
          <div className="flex items-center gap-2 text-primary">
            <BookOpen size={14} />
            <p className="text-[11px] font-semibold uppercase tracking-[0.18em]">The concept</p>
          </div>
          <p className="mt-1.5 text-sm leading-relaxed text-foreground/90">{q.concept}</p>
          {q.readMore && (
            <a
              href={q.readMore.url}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-3 inline-flex items-center gap-1.5 text-xs font-semibold text-primary"
            >
              {q.readMore.label} <ExternalLink size={12} />
            </a>
          )}
          <button
            onClick={next}
            className="mt-4 w-full rounded-2xl bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground"
          >
            {idx + 1 >= total ? "See my score" : "Next question"}
          </button>
        </div>
      )}
    </div>
  );
}
