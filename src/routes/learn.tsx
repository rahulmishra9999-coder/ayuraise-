import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { ArrowLeft, BookOpen, Play, Sparkles, X } from "lucide-react";
import { BottomNav } from "@/components/BottomNav";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { QUIZ_LIST, type QuizCategory } from "@/lib/quizzes";
import { QuizRunner } from "@/components/QuizRunner";

export const Route = createFileRoute("/learn")({
  head: () => ({
    meta: [
      { title: "Learn · AyuRaise" },
      { name: "description", content: "Quizzes and short videos to deepen your wellness knowledge." },
    ],
  }),
  component: LearnHub,
});

const SHORTS: { id: string; title: string; tag: QuizCategory; gradient: string }[] = [
  { id: "1", title: "Why your lunch should be your biggest meal", tag: "diet", gradient: "var(--gradient-sage)" },
  { id: "2", title: "The 16-hour window, explained in 30s", tag: "if", gradient: "var(--gradient-dawn)" },
  { id: "3", title: "Beat hunger pangs without breaking your fast", tag: "if", gradient: "var(--gradient-dawn)" },
  { id: "4", title: "Surya Namaskar — one round, full body", tag: "yoga", gradient: "var(--gradient-leaf)" },
  { id: "5", title: "Vata, Pitta, Kapha in 60 seconds", tag: "diet", gradient: "var(--gradient-sage)" },
  { id: "6", title: "Walk after meals — the cheapest medicine", tag: "exercise", gradient: "var(--gradient-clay)" },
  { id: "7", title: "What 'detox' actually means (and doesn't)", tag: "detox", gradient: "var(--gradient-water)" },
  { id: "8", title: "Bhramari for instant calm", tag: "meditation", gradient: "var(--gradient-violet)" },
  { id: "9", title: "Reverse T2 diabetes — what works", tag: "disease", gradient: "var(--gradient-clay)" },
  { id: "10", title: "Sustainable fat loss in 90 seconds", tag: "weight-loss", gradient: "var(--gradient-gold)" },
];

function LearnHub() {
  const [openQuiz, setOpenQuiz] = useState<QuizCategory | null>(null);

  return (
    <div className="min-h-svh pb-28" style={{ background: "var(--gradient-hero)" }}>
      <div className="mx-auto max-w-xl px-5 pt-[max(1rem,env(safe-area-inset-top))]">
        <div className="flex items-center justify-between pt-1">
          <Link
            to="/home"
            className="flex h-10 w-10 items-center justify-center rounded-full bg-card shadow-[var(--shadow-soft)] ring-1 ring-border/60"
            aria-label="Back to Health"
          >
            <ArrowLeft size={18} />
          </Link>
          <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-muted-foreground">Learn</p>
          <div className="w-10" />
        </div>

        {/* Hero */}
        <div
          className="mt-4 rounded-3xl p-5 text-primary-foreground shadow-[var(--shadow-soft)]"
          style={{ background: "var(--gradient-night)" }}
        >
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-card/20 backdrop-blur-sm">
              <Sparkles size={22} strokeWidth={1.7} />
            </div>
            <div>
              <h1 className="font-display text-2xl font-semibold">Learn</h1>
              <p className="text-xs text-primary-foreground/85">Quick quizzes & short videos to level up your wellness IQ.</p>
            </div>
          </div>
        </div>

        <Tabs defaultValue="quizzes" className="mt-5">
          <TabsList className="grid w-full grid-cols-2 rounded-2xl bg-card/70 p-1 ring-1 ring-border/60">
            <TabsTrigger value="quizzes" className="rounded-xl text-sm">
              <BookOpen size={14} className="mr-1.5" /> Quizzes
            </TabsTrigger>
            <TabsTrigger value="shorts" className="rounded-xl text-sm">
              <Play size={14} className="mr-1.5" /> Shorts
            </TabsTrigger>
          </TabsList>

          <TabsContent value="quizzes" className="mt-4 space-y-3">
            {QUIZ_LIST.map((quiz) => (
              <button
                key={quiz.id}
                onClick={() => setOpenQuiz(quiz.id)}
                className="flex w-full items-center gap-3 rounded-3xl bg-card p-4 text-left shadow-[var(--shadow-soft)] ring-1 ring-border/60 transition-transform active:scale-[0.98]"
              >
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-accent/40 text-2xl">
                  {quiz.emoji}
                </div>
                <div className="flex-1">
                  <p className="font-display text-base font-semibold text-foreground">{quiz.title}</p>
                  <p className="text-xs text-muted-foreground">{quiz.blurb}</p>
                  <p className="mt-1 text-[10px] font-semibold uppercase tracking-[0.18em] text-primary">
                    {quiz.questions.length} questions
                  </p>
                </div>
              </button>
            ))}
          </TabsContent>

          <TabsContent value="shorts" className="mt-4">
            <div className="rounded-2xl bg-amber-50 p-3 text-[11px] text-amber-900 ring-1 ring-amber-200 dark:bg-amber-950/30 dark:text-amber-100 dark:ring-amber-900">
              AI-generated shorts coming soon — here's a preview of what'll be in your feed.
            </div>
            <div className="mt-3 grid grid-cols-2 gap-3">
              {SHORTS.map((s) => (
                <div
                  key={s.id}
                  className="relative aspect-[9/16] overflow-hidden rounded-2xl p-3 text-primary-foreground shadow-[var(--shadow-soft)]"
                  style={{ background: s.gradient }}
                >
                  <div className="absolute inset-0 bg-gradient-to-t from-black/55 via-black/10 to-transparent" />
                  <div className="absolute inset-x-3 top-3 flex items-center justify-between">
                    <span className="rounded-full bg-white/25 px-2 py-0.5 text-[9px] font-semibold uppercase tracking-wider backdrop-blur-sm">
                      {s.tag}
                    </span>
                    <Play size={14} className="opacity-90" />
                  </div>
                  <div className="absolute inset-x-3 bottom-3">
                    <p className="font-display text-xs font-semibold leading-snug">{s.title}</p>
                  </div>
                </div>
              ))}
            </div>
          </TabsContent>
        </Tabs>
      </div>

      {openQuiz && (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/40 backdrop-blur-sm sm:items-center">
          <div className="max-h-[92svh] w-full max-w-xl overflow-y-auto rounded-t-3xl bg-card p-5 shadow-2xl sm:rounded-3xl">
            <div className="mb-3 flex items-center justify-between">
              <h2 className="font-display text-lg font-semibold">Quiz</h2>
              <button onClick={() => setOpenQuiz(null)} aria-label="Close" className="flex h-8 w-8 items-center justify-center rounded-full bg-muted">
                <X size={16} />
              </button>
            </div>
            <QuizRunner quizId={openQuiz} />
          </div>
        </div>
      )}

      <BottomNav />
    </div>
  );
}
