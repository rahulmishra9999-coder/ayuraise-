import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { SECTIONS } from "@/lib/sections";
import { BottomNav } from "@/components/BottomNav";
import { ProfileSwitcher } from "@/components/ProfileSwitcher";
import { Sparkles, ChevronRight, ClipboardList, FolderOpen, Flower2, Bot } from "lucide-react";
import { loadDay, patchDay } from "@/lib/trackers";

export const Route = createFileRoute("/home")({
  head: () => ({
    meta: [
      { title: "Health · AyuRaise" },
      { name: "description", content: "Your personalized Ayurvedic wellness home." },
    ],
  }),
  component: HomePage,
});

type Dosha = "vata" | "pitta" | "kapha";
interface Profile {
  name?: string;
  prakriti?: { dosha: Dosha; score: Record<Dosha, number> } | null;
}
interface PlanData {
  pillars?: string[];
  focus?: string;
}

/** Once-a-day mood check-in that greets the user on arrival, then answers with a matching line. */
const MOOD_FLASH = [
  { id: "great", emoji: "🤩", label: "Great", quote: "Ride that wave — do one hard thing today, it'll feel easy. 🌊" },
  { id: "good", emoji: "🙂", label: "Good", quote: "Good energy compounds. Keep it gentle and steady. 🌿" },
  { id: "okay", emoji: "😐", label: "Okay", quote: "Okay is a fine place to start. Small steps count double today. 🪷" },
  { id: "low", emoji: "😔", label: "Low", quote: "Be soft with yourself today. One glass of water, one deep breath. 🤍" },
];

function MoodFlash({ name }: { name?: string }) {
  const [stage, setStage] = useState<"hidden" | "ask" | "quote">("hidden");
  const [picked, setPicked] = useState<typeof MOOD_FLASH[number] | null>(null);

  useEffect(() => {
    if (!loadDay().mood) {
      const t = setTimeout(() => setStage("ask"), 600);
      return () => clearTimeout(t);
    }
  }, []);

  const pick = (m: typeof MOOD_FLASH[number]) => {
    patchDay({ mood: m.id });
    setPicked(m);
    setStage("quote");
    setTimeout(() => setStage("hidden"), 2600);
  };

  if (stage === "hidden") return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-6 backdrop-blur-sm" onClick={() => setStage("hidden")}>
      <div className="w-full max-w-sm rounded-[32px] bg-card p-6 text-center shadow-xl animate-pop-in" onClick={(e) => e.stopPropagation()}>
        {stage === "ask" ? (
          <>
            <p className="font-display text-[20px] font-bold text-foreground">How are you feeling{name ? `, ${name}` : ""}?</p>
            <div className="mt-4 grid grid-cols-4 gap-2">
              {MOOD_FLASH.map((m) => (
                <button
                  key={m.id}
                  onClick={() => pick(m)}
                  className="flex flex-col items-center gap-1.5 rounded-2xl bg-secondary py-3 text-[11.5px] font-semibold text-foreground/80 transition-transform active:scale-95"
                >
                  <span className="text-2xl">{m.emoji}</span>
                  {m.label}
                </button>
              ))}
            </div>
            <button onClick={() => setStage("hidden")} className="mt-3 text-[11.5px] font-medium text-muted-foreground">
              Skip for now
            </button>
          </>
        ) : (
          <>
            <span className="text-5xl">{picked?.emoji}</span>
            <p className="mt-3 text-[15px] font-semibold leading-relaxed text-foreground">{picked?.quote}</p>
          </>
        )}
      </div>
    </div>
  );
}

function HomePage() {
  const hour = new Date().getHours();
  const greeting = hour < 12 ? "Good morning ☀️" : hour < 17 ? "Good afternoon 🌤️" : "Good evening 🌙";

  const [profile, setProfile] = useState<Profile | null>(null);
  const [plan, setPlan] = useState<PlanData | null>(null);

  useEffect(() => {
    try {
      const p = localStorage.getItem("ayuraise.profile");
      if (p) setProfile(JSON.parse(p));
      const pl = localStorage.getItem("ayuraise.plan");
      if (pl) setPlan(JSON.parse(pl));
    } catch {}
  }, []);

  const firstName = profile?.name?.split(" ")[0];
  const prakriti = profile?.prakriti ?? null;

  return (
    <div className="min-h-svh pb-32" style={{ background: "var(--gradient-hero)" }}>
      <MoodFlash name={firstName} />
      <div className="mx-auto max-w-xl px-5 pt-[max(1.5rem,env(safe-area-inset-top))]">

        {/* Editorial header */}
        <header className="flex items-start justify-between pt-2">
          <div className="animate-shimmer-in">
            <p className="text-[13px] font-medium text-muted-foreground">
              {greeting}{firstName ? `, ${firstName}` : ""}
            </p>
            <h1 className="mt-1 font-display text-[30px] font-extrabold leading-[1.12] tracking-tight text-foreground">
              Live healthy,<br /><span className="gradient-text">live longer.</span>
            </h1>
          </div>
          <ProfileSwitcher />
        </header>

        {/* Hero focus card */}
        <section className="mt-6 animate-shimmer-in" style={{ animationDelay: "60ms" }}>
          {plan ? <PlanEditCard plan={plan} /> : <PlanCTA />}
        </section>

        {/* Quick actions */}
        <section className="mt-4 grid grid-cols-3 gap-2.5 animate-shimmer-in" style={{ animationDelay: "120ms" }}>
          <QuickAction to="/my-plans" icon={<FolderOpen size={18} />} label="My plans" gradient="var(--gradient-water)" />
          <QuickAction to="/coach" icon={<Bot size={18} />} label="Ask Ayu" gradient="var(--gradient-violet)" />
          <QuickAction to="/onboarding" icon={<Flower2 size={18} />} label="Prakriti" gradient="var(--gradient-gold)" />
        </section>

        {/* Explore — spacious 2-col tiles */}
        <section className="mt-9">
          <div className="mb-4 flex items-end justify-between px-1">
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-primary/70">Your pillars</p>
              <h2 className="font-display text-xl font-bold text-foreground">Explore</h2>
            </div>
            <span className="pb-0.5 text-xs text-muted-foreground">{SECTIONS.length} paths</span>
          </div>

          <div className="grid grid-cols-2 gap-3">
            {SECTIONS.map((s, idx) => {
              const Icon = s.icon;
              return (
                <Link
                  key={s.slug}
                  to="/section/$slug"
                  params={{ slug: s.slug }}
                  className="tile surface group flex flex-col gap-3 p-4 animate-float-up"
                  style={{ animationDelay: `${idx * 45}ms` }}
                >
                  <div
                    className="flex h-11 w-11 items-center justify-center rounded-2xl text-primary-foreground shadow-sm"
                    style={{ background: s.gradient }}
                  >
                    <Icon size={20} strokeWidth={1.8} />
                  </div>
                  <div>
                    <p className="font-display text-[14.5px] font-semibold leading-tight text-foreground">{s.title}</p>
                    <p className="mt-1 line-clamp-2 text-[11.5px] leading-snug text-muted-foreground">{s.blurb}</p>
                  </div>
                </Link>
              );
            })}
          </div>
        </section>

        {/* Prakriti */}
        <section className="mt-8">
          {prakriti ? <PrakritiResultCard p={prakriti} /> : <PrakritiCTA />}
        </section>

        {/* Quote */}
        <section className="mt-9 overflow-hidden rounded-[26px] p-7 text-center" style={{ background: "var(--gradient-night)" }}>
          <p className="font-display text-[17px] font-medium leading-relaxed text-primary-foreground/95">
            "When diet is wrong, medicine is of no use. When diet is correct, medicine is of no need."
          </p>
          <p className="mt-4 text-[10.5px] uppercase tracking-[0.25em] text-primary-foreground/55">Ayurvedic proverb</p>
        </section>
      </div>
      <BottomNav />
    </div>
  );
}

function QuickAction({ to, icon, label, gradient }: { to: string; icon: React.ReactNode; label: string; gradient: string }) {
  return (
    <Link
      to={to}
      className="surface tile flex flex-col items-center gap-1.5 px-2 py-3.5 text-center"
    >
      <span
        className="flex h-9 w-9 items-center justify-center rounded-full text-primary-foreground shadow-sm"
        style={{ background: gradient }}
      >
        {icon}
      </span>
      <span className="text-[11.5px] font-semibold text-foreground/85">{label}</span>
    </Link>
  );
}

// --- Prakriti ---
function PrakritiCTA() {
  return (
    <Link to="/onboarding" className="tile flex items-center gap-4 rounded-[26px] p-5" style={{ background: "var(--gradient-violet)" }}>
      <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-white/20 text-primary-foreground ring-1 ring-white/30 backdrop-blur-sm">
        <Flower2 size={22} />
      </div>
      <div className="flex-1 text-primary-foreground">
        <p className="text-[10.5px] font-semibold uppercase tracking-[0.22em] opacity-80">Know yourself</p>
        <p className="font-display text-[16px] font-bold">Take your Prakriti test</p>
        <p className="mt-0.5 text-[12px] opacity-85">1 min — unlocks tuned diet, yoga & detox.</p>
      </div>
      <ChevronRight size={18} className="text-primary-foreground/80" />
    </Link>
  );
}

function PrakritiResultCard({ p }: { p: { dosha: Dosha; score: Record<Dosha, number> } }) {
  const total = (p.score.vata + p.score.pitta + p.score.kapha) || 1;
  const pct = {
    vata: Math.round((p.score.vata / total) * 100),
    pitta: Math.round((p.score.pitta / total) * 100),
    kapha: Math.round((p.score.kapha / total) * 100),
  };
  const colors: Record<Dosha, string> = { vata: "bg-sky-400", pitta: "bg-rose-400", kapha: "bg-emerald-400" };
  return (
    <div className="surface p-5">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-[10.5px] font-semibold uppercase tracking-[0.22em] text-primary/70">Your Prakriti</p>
          <p className="font-display text-lg font-bold capitalize text-foreground">{p.dosha}-dominant</p>
        </div>
        <Link to="/onboarding" className="rounded-full bg-secondary px-3.5 py-1.5 text-[11px] font-semibold text-secondary-foreground">
          Retake
        </Link>
      </div>
      <div className="mt-4 flex h-2 w-full overflow-hidden rounded-full bg-muted">
        <div className={colors.vata} style={{ width: `${pct.vata}%` }} />
        <div className={colors.pitta} style={{ width: `${pct.pitta}%` }} />
        <div className={colors.kapha} style={{ width: `${pct.kapha}%` }} />
      </div>
      <div className="mt-3 flex justify-between text-[11px] text-muted-foreground">
        <span><span className="mr-1 inline-block h-2 w-2 rounded-full bg-sky-400 align-middle" />Vata {pct.vata}%</span>
        <span><span className="mr-1 inline-block h-2 w-2 rounded-full bg-rose-400 align-middle" />Pitta {pct.pitta}%</span>
        <span><span className="mr-1 inline-block h-2 w-2 rounded-full bg-emerald-400 align-middle" />Kapha {pct.kapha}%</span>
      </div>
    </div>
  );
}

// --- Plan ---
function PlanCTA() {
  return (
    <div className="tile overflow-hidden rounded-[26px] p-6" style={{ background: "var(--gradient-night)" }}>
      <div className="flex items-start gap-3 text-primary-foreground">
        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-white/15 ring-1 ring-white/25 backdrop-blur-sm">
          <Sparkles size={20} />
        </div>
        <div className="flex-1">
          <p className="text-[10.5px] font-semibold uppercase tracking-[0.22em] opacity-75">Personalized</p>
          <p className="font-display text-[17px] font-bold">Build my wellness plan</p>
          <p className="mt-1 text-[12.5px] leading-relaxed opacity-85">A daily rhythm weaving yoga, diet, fasting & detox — tuned to your prakriti.</p>
        </div>
      </div>
      <div className="mt-5 grid grid-cols-2 gap-2.5">
        <Link to="/plan" className="flex items-center justify-center gap-1.5 rounded-2xl bg-primary-foreground/95 px-4 py-3 text-[13px] font-bold text-foreground transition-transform active:scale-[0.97]">
          <Sparkles size={14} /> Build it now
        </Link>
        <Link to="/section/disease" className="flex items-center justify-center rounded-2xl bg-white/10 px-4 py-3 text-[13px] font-semibold text-primary-foreground ring-1 ring-white/20 transition-transform active:scale-[0.97]">
          Explore first
        </Link>
      </div>
    </div>
  );
}

function PlanEditCard({ plan }: { plan: PlanData }) {
  const count = plan.pillars?.length ?? 0;
  return (
    <Link to="/plan" className="surface tile flex items-center gap-4 p-5">
      <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl text-primary-foreground" style={{ background: "var(--gradient-leaf)" }}>
        <ClipboardList size={20} />
      </div>
      <div className="flex-1">
        <p className="text-[10.5px] font-semibold uppercase tracking-[0.22em] text-primary/70">Your plan</p>
        <p className="font-display text-[16px] font-bold text-foreground">Personalized wellness plan</p>
        <p className="mt-0.5 text-[12px] text-muted-foreground">{count} pillar{count === 1 ? "" : "s"} active{plan.focus ? ` · focus: ${plan.focus}` : ""}</p>
      </div>
      <ChevronRight size={18} className="text-muted-foreground" />
    </Link>
  );
}
