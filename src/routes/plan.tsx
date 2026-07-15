import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { ArrowLeft, Sparkles, Check, Flower2, Brain, Salad, Hourglass, Scale, Dumbbell, Stethoscope } from "lucide-react";

export const Route = createFileRoute("/plan")({
  head: () => ({
    meta: [
      { title: "My Wellness Plan · AyuRaise" },
      { name: "description", content: "Build a personalized wellness plan tuned to your prakriti and goals." },
    ],
  }),
  component: PlanPage,
});

const PILLAR_OPTIONS = [
  { id: "yoga", label: "Yoga & Pranayam", icon: Flower2 },
  { id: "meditation", label: "Meditation", icon: Brain },
  { id: "diet", label: "Diet Plan", icon: Salad },
  { id: "fasting", label: "Fasting", icon: Hourglass },
  { id: "weight", label: "Weight Loss", icon: Scale },
  { id: "exercise", label: "Exercise", icon: Dumbbell },
  { id: "detox", label: "Detox", icon: Sparkles },
  { id: "disease", label: "Disease Care", icon: Stethoscope },
];
const FOCUS = [
  { id: "energy", label: "More energy" },
  { id: "calm", label: "Calm & focus" },
  { id: "shape", label: "Lose weight" },
  { id: "heal", label: "Heal a condition" },
  { id: "sleep", label: "Better sleep" },
  { id: "longevity", label: "Longevity" },
];
const TIME = ["15 min/day", "30 min/day", "45 min/day", "60 min/day"];
const INTENSITY = ["Gentle", "Balanced", "Intense"];

const KEY = "ayuraise.plan";

function PlanPage() {
  const navigate = useNavigate();
  const [pillars, setPillars] = useState<string[]>([]);
  const [focus, setFocus] = useState<string>("");
  const [time, setTime] = useState<string>(TIME[1]);
  const [intensity, setIntensity] = useState<string>(INTENSITY[1]);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(KEY);
      if (raw) {
        const p = JSON.parse(raw);
        setPillars(p.pillars ?? []);
        setFocus(p.focus ?? "");
        setTime(p.time ?? TIME[1]);
        setIntensity(p.intensity ?? INTENSITY[1]);
      }
    } catch {}
  }, []);

  const toggle = (id: string) =>
    setPillars(pillars.includes(id) ? pillars.filter((x) => x !== id) : [...pillars, id]);

  const save = () => {
    const plan = { pillars, focus, time, intensity, updatedAt: new Date().toISOString() };
    localStorage.setItem(KEY, JSON.stringify(plan));
    setSaved(true);
    setTimeout(() => navigate({ to: "/home" }), 700);
  };

  const valid = pillars.length > 0 && focus;

  return (
    <div className="min-h-svh px-5 pb-12 pt-[max(1.5rem,env(safe-area-inset-top))]" style={{ background: "var(--gradient-hero)" }}>
      <div className="mx-auto max-w-xl">
        <div className="mb-6 flex items-center justify-between">
          <Link to="/home" className="flex h-9 w-9 items-center justify-center rounded-full bg-card/70 ring-1 ring-border" aria-label="Back">
            <ArrowLeft size={16} />
          </Link>
          <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-muted-foreground">My Plan</p>
          <div className="w-9" />
        </div>

        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-primary/80">Personalize</p>
        <h1 className="mt-1 font-display text-2xl font-semibold text-foreground">Build my wellness plan</h1>
        <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
          We'll weave these into a daily rhythm tuned to your prakriti and the season.
        </p>

        <Section title="Pillars I want">
          <div className="grid grid-cols-2 gap-2.5">
            {PILLAR_OPTIONS.map((p) => {
              const Icon = p.icon;
              const active = pillars.includes(p.id);
              return (
                <button key={p.id} onClick={() => toggle(p.id)}
                  className={`relative flex items-center gap-2.5 rounded-2xl p-3 text-left ring-1 transition-all ${active ? "bg-primary/10 ring-primary" : "bg-card ring-border"}`}>
                  <span className={`flex h-8 w-8 items-center justify-center rounded-xl ${active ? "bg-primary text-primary-foreground" : "bg-accent/40 text-primary"}`}>
                    <Icon size={16} strokeWidth={1.8} />
                  </span>
                  <span className="text-[13px] font-semibold text-foreground">{p.label}</span>
                  {active && <Check size={12} strokeWidth={3} className="absolute right-2 top-2 text-primary" />}
                </button>
              );
            })}
          </div>
        </Section>

        <Section title="My main focus">
          <div className="flex flex-wrap gap-2">
            {FOCUS.map((f) => (
              <Chip key={f.id} active={focus === f.id} onClick={() => setFocus(f.id)}>{f.label}</Chip>
            ))}
          </div>
        </Section>

        <Section title="Time I can give daily">
          <div className="flex flex-wrap gap-2">
            {TIME.map((t) => <Chip key={t} active={time === t} onClick={() => setTime(t)}>{t}</Chip>)}
          </div>
        </Section>

        <Section title="Intensity">
          <div className="flex gap-2">
            {INTENSITY.map((i) => <Chip key={i} active={intensity === i} onClick={() => setIntensity(i)}>{i}</Chip>)}
          </div>
        </Section>

        <button disabled={!valid} onClick={save}
          className="mt-8 flex w-full items-center justify-center gap-2 rounded-2xl bg-primary px-5 py-3.5 text-sm font-semibold text-primary-foreground shadow-[var(--shadow-glow)] transition-transform active:scale-[0.98] disabled:opacity-50">
          {saved ? <><Check size={16} /> Saved</> : <><Sparkles size={16} /> Save my plan</>}
        </button>
      </div>
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="mt-6">
      <p className="mb-2.5 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">{title}</p>
      {children}
    </div>
  );
}

function Chip({ active, onClick, children }: { active: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button onClick={onClick}
      className={`rounded-full px-3.5 py-2 text-[12px] font-semibold ring-1 transition-all ${active ? "bg-primary text-primary-foreground ring-primary" : "bg-card text-foreground ring-border"}`}>
      {children}
    </button>
  );
}
