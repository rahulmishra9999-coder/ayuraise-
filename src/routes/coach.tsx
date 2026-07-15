import { createFileRoute } from "@tanstack/react-router";
import { BottomNav } from "@/components/BottomNav";
import { Bot, Sparkles } from "lucide-react";

export const Route = createFileRoute("/coach")({
  head: () => ({
    meta: [
      { title: "Ayu AI · AyuRaise" },
      { name: "description", content: "Your personal Ayurveda + yoga AI coach." },
    ],
  }),
  component: CoachPage,
});

const suggestions = [
  "Build me a personalized plan",
  "What's my prakriti?",
  "Help with acidity",
  "Best pranayam for anxiety",
  "What should I eat this season?",
];

function CoachPage() {
  return (
    <div className="min-h-svh pb-28" style={{ background: "var(--gradient-hero)" }}>
      <div className="mx-auto max-w-xl px-5 pt-[max(1.25rem,env(safe-area-inset-top))]">
        <header className="flex items-center gap-3 pt-2">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl text-primary-foreground shadow-[var(--shadow-glow)]" style={{ background: "var(--gradient-violet)" }}>
            <Bot size={22} />
          </div>
          <div>
            <h1 className="font-display text-2xl font-semibold">Ayu AI Coach</h1>
            <p className="text-xs text-muted-foreground">Trained on Vedas, Charaka & Yoga Sutras</p>
          </div>
        </header>

        <div className="mt-6 rounded-3xl p-6 text-center text-primary-foreground shadow-[var(--shadow-tile)]" style={{ background: "var(--gradient-night)" }}>
          <Sparkles size={28} className="mx-auto opacity-90" />
          <h2 className="mt-3 font-display text-xl">Your personalized plan is one chat away</h2>
          <p className="mt-2 text-sm opacity-85">
            Tell Ayu about your health concerns, lifestyle and goals — get a complete plan covering yoga, diet, meditation, fasting and detox.
          </p>
        </div>

        <div className="mt-6">
          <p className="px-1 text-xs font-semibold uppercase tracking-wider text-muted-foreground">Try asking</p>
          <div className="mt-3 flex flex-wrap gap-2">
            {suggestions.map((s) => (
              <button key={s} className="rounded-full bg-card px-4 py-2 text-sm font-medium text-foreground shadow-[var(--shadow-soft)] ring-1 ring-border/60">
                {s}
              </button>
            ))}
          </div>
        </div>

        <div className="mt-8 rounded-3xl bg-card p-5 text-center ring-1 ring-border/60">
          <p className="text-sm text-muted-foreground">
            AI coach coming online soon. Your wellness journey starts here.
          </p>
        </div>
      </div>
      <BottomNav />
    </div>
  );
}
