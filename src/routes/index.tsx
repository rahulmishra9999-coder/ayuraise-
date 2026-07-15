import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Leaf, Sparkles, Sun, Bot, ChevronRight } from "lucide-react";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "AyuRaise — Live Healthy, Live Longer" },
      { name: "description", content: "AI-enabled Ayurveda companion for your complete wellness." },
    ],
  }),
  component: Welcome,
});

const slides = [
  {
    icon: Leaf,
    eyebrow: "AyuRaise",
    title: "Live Healthy, Live Longer.",
    body: "Your AI-enabled companion for every health solution — rooted in the wisdom of Ayurveda.",
    gradient: "var(--gradient-hero)",
  },
  {
    icon: Sun,
    eyebrow: "Know Your Self",
    title: "Eat for your Prakriti & Ritucharya.",
    body: "Discover your unique body type and follow a daily rhythm aligned with the seasons.",
    gradient: "var(--gradient-dawn)",
  },
  {
    icon: Sparkles,
    eyebrow: "Heal Naturally",
    title: "Ancient Yoga. Timeless Wellness.",
    body: "Improve chronic issues with personalized yoga, pranayam and meditation routines.",
    gradient: "var(--gradient-sage)",
  },
  {
    icon: Bot,
    eyebrow: "Ayu AI Coach",
    title: "Trained on every ayurvedic text.",
    body: "Talk to your personal coach for answers grounded in the Vedas, Yoga Sutras and Charaka Samhita.",
    gradient: "var(--gradient-violet)",
  },
];

function Welcome() {
  const navigate = useNavigate();
  const [i, setI] = useState(0);

  useEffect(() => {
    if (typeof window === "undefined") return;
    if (localStorage.getItem("ayuraise.onboarded") === "1") {
      navigate({ to: "/login" });
    }
  }, [navigate]);

  const next = () => {
    if (i < slides.length - 1) setI(i + 1);
    else finish();
  };
  const finish = () => {
    localStorage.setItem("ayuraise.onboarded", "1");
    navigate({ to: "/login" });
  };

  const s = slides[i];
  const Icon = s.icon;

  return (
    <div
      className="relative flex min-h-svh flex-col px-6 pb-10 pt-[max(2rem,env(safe-area-inset-top))]"
      style={{ background: s.gradient }}
    >
      <div className="flex items-center justify-between">
        <span className="font-display text-lg font-semibold text-foreground/80">AyuRaise</span>
        <button
          onClick={finish}
          className="rounded-full px-3 py-1 text-sm text-foreground/60 hover:text-foreground"
        >
          Skip
        </button>
      </div>

      <div key={i} className="animate-float-up flex flex-1 flex-col items-center justify-center text-center">
        <div className="mb-10 flex h-32 w-32 items-center justify-center rounded-full bg-card/60 shadow-[var(--shadow-glow)] backdrop-blur-sm">
          <div className="animate-breathe absolute h-40 w-40 rounded-full bg-primary/15" />
          <Icon size={56} className="text-primary" strokeWidth={1.6} />
        </div>
        <p className="mb-3 text-xs font-semibold uppercase tracking-[0.2em] text-primary/80">
          {s.eyebrow}
        </p>
        <h1 className="font-display text-4xl font-semibold leading-tight text-foreground sm:text-5xl">
          {s.title}
        </h1>
        <p className="mt-5 max-w-md text-base leading-relaxed text-foreground/70">{s.body}</p>
      </div>

      <div className="mb-6 flex justify-center gap-2">
        {slides.map((_, idx) => (
          <button
            key={idx}
            onClick={() => setI(idx)}
            aria-label={`Go to slide ${idx + 1}`}
            className={`h-1.5 rounded-full transition-all ${
              idx === i ? "w-8 bg-primary" : "w-1.5 bg-foreground/25"
            }`}
          />
        ))}
      </div>

      <button
        onClick={next}
        className="group flex items-center justify-center gap-2 rounded-full bg-primary px-8 py-4 text-base font-semibold text-primary-foreground shadow-[var(--shadow-glow)] transition-transform active:scale-[0.98]"
      >
        {i === slides.length - 1 ? "Get Started" : "Continue"}
        <ChevronRight size={18} className="transition-transform group-hover:translate-x-0.5" />
      </button>
    </div>
  );
}
