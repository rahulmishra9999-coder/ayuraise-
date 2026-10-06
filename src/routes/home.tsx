import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { SECTIONS } from "@/lib/sections";
import { HOME_GOAL_TILES, ALL_GOALS, PRACTICE_SLUGS, PRACTICE_LABELS } from "@/lib/goals";
import { loadYogaPlans, type YogaPlan } from "@/lib/yoga-plan";
import { clearPersonalPlan } from "@/lib/personalPlan";
import { BottomNav } from "@/components/BottomNav";
import { AyuBot } from "@/components/AyuBot";
import { ProfileSwitcher } from "@/components/ProfileSwitcher";
import { ChevronRight, Sparkles } from "lucide-react";
import { affirmationForToday } from "@/lib/affirmations";

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
interface Profile { name?: string; prakriti?: { dosha: Dosha } | null }

/** A calm, no-action line shown briefly once a day when the app opens. */
function DailyAffirmation() {
  const [show, setShow] = useState(false);
  const [line, setLine] = useState("");
  useEffect(() => {
    const today = new Date().toISOString().slice(0, 10);
    let last = "";
    try { last = localStorage.getItem("ayuraise.affirmation.date") || ""; } catch { /* ignore */ }
    if (last === today) return;
    setLine(affirmationForToday());
    try { localStorage.setItem("ayuraise.affirmation.date", today); } catch { /* ignore */ }
    const t = setTimeout(() => setShow(true), 500);
    return () => clearTimeout(t);
  }, []);
  useEffect(() => { if (!show) return; const t = setTimeout(() => setShow(false), 4200); return () => clearTimeout(t); }, [show]);
  if (!show) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/45 p-6 backdrop-blur-sm" onClick={() => setShow(false)}>
      <div className="w-full max-w-xs rounded-[24px] bg-card p-6 text-center shadow-xl animate-pop-in" onClick={(e) => e.stopPropagation()}>
        <span className="text-3xl">🌿</span>
        <p className="mt-3 font-display text-[15.5px] font-semibold leading-relaxed text-foreground">{line}</p>
      </div>
    </div>
  );
}

function HomePage() {
  const hour = new Date().getHours();
  const greeting = hour < 12 ? "Good morning ☀️" : hour < 17 ? "Good afternoon 🌤️" : "Good evening 🌙";
  const [profile, setProfile] = useState<Profile | null>(null);
  const [plans, setPlans] = useState<YogaPlan[]>([]);
  const [openUmbrella, setOpenUmbrella] = useState<string | null>(null);
  const [hasPersonalPlan, setHasPersonalPlan] = useState(false);

  useEffect(() => {
    try { const p = localStorage.getItem("ayuraise.profile"); if (p) setProfile(JSON.parse(p)); } catch { /* ignore */ }
    try { setHasPersonalPlan(!!localStorage.getItem("ayuraise.personalPlan")); } catch { /* ignore */ }
    setPlans(loadYogaPlans());
  }, []);
  const firstName = profile?.name?.split(" ")[0];
  const primId = plans.find((p) => p.isPrimary)?.id ?? plans[0]?.id;

  return (
    <div className="min-h-svh pb-28" style={{ background: "var(--gradient-hero)" }}>
      <DailyAffirmation />
      <div className="mx-auto max-w-xl px-4 pt-[max(1rem,env(safe-area-inset-top))]">

        <header className="flex items-start justify-between pt-1">
          <div>
            <p className="text-[12px] font-medium text-muted-foreground">{greeting}{firstName ? `, ${firstName}` : ""}</p>
            <h1 className="mt-0.5 font-display text-[22px] font-extrabold leading-[1.1] tracking-tight text-foreground">Live healthy, <span className="gradient-text">live longer.</span></h1>
          </div>
          <ProfileSwitcher />
        </header>

        {/* Create / adjust CTA — create goes to the wizard; adjust goes to the edit menu */}
        {hasPersonalPlan
          ? <Link to="/edit-plan" className="mt-4 flex items-center gap-2.5 rounded-2xl px-3.5 py-2.5 text-primary-foreground shadow-[var(--shadow-glow)] active:scale-[0.99]" style={{ background: "var(--gradient-violet)" }}>
              <Sparkles size={16} className="shrink-0" />
              <span className="min-w-0 flex-1 text-[13px] font-bold leading-tight">Adjust / edit my personalized plan</span>
              <ChevronRight size={15} className="shrink-0 opacity-80" />
            </Link>
          : <Link to="/lifestyle" search={{ mode: "unified" }} className="mt-4 flex items-center gap-2.5 rounded-2xl px-3.5 py-2.5 text-primary-foreground shadow-[var(--shadow-glow)] active:scale-[0.99]" style={{ background: "var(--gradient-violet)" }}>
              <Sparkles size={16} className="shrink-0" />
              <span className="min-w-0 flex-1 text-[13px] font-bold leading-tight">Create my personalized plan</span>
              <ChevronRight size={15} className="shrink-0 opacity-80" />
            </Link>}

        {/* Create my profile — full lifestyle flow (basics + picker); moves into onboarding later */}
        <Link to="/lifestyle" className="mt-2 flex items-center gap-2.5 rounded-2xl bg-card px-3.5 py-2.5 ring-1 ring-border/60 active:scale-[0.99]">
          <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-accent/50 text-[15px]">🪷</span>
          <div className="min-w-0 flex-1">
            <p className="text-[12.5px] font-bold text-foreground">Create my profile</p>
            <p className="text-[10.5px] text-muted-foreground">A few lifestyle questions so every plan fits you.</p>
          </div>
          <ChevronRight size={15} className="shrink-0 text-muted-foreground" />
        </Link>

        {/* My Plans — the ONE personalized plan (opens the full plan with every tool) */}
        {hasPersonalPlan && (
          <section className="mt-4">
            <div className="flex items-baseline justify-between px-1">
              <h2 className="font-display text-[15px] font-bold text-foreground">My Plan</h2>
            </div>
            <div className="mt-2 flex items-center gap-2.5 rounded-2xl bg-card p-3 ring-1 ring-border/60">
              <Link to="/myplan/$id" params={{ id: "me" }} className="flex min-w-0 flex-1 items-center gap-2.5 active:opacity-80">
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-accent/50 text-[18px]">🌿</span>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-[13px] font-bold text-foreground">My personalized plan</p>
                  <p className="truncate text-[10.5px] text-muted-foreground">Yoga · diet · exercise · detox · fasting · herbs & more</p>
                </div>
              </Link>
              <div className="flex shrink-0 items-center gap-1">
                <Link to="/edit-plan" className="rounded-full bg-secondary px-2.5 py-1 text-[10.5px] font-bold text-foreground active:opacity-70">Edit</Link>
                <button onClick={() => { if (typeof window !== "undefined" && window.confirm("Delete your personalized plan?")) { clearPersonalPlan(); setHasPersonalPlan(false); } }} aria-label="Delete plan" className="rounded-full bg-secondary px-2.5 py-1 text-[11px] active:opacity-70">🗑</button>
              </div>
            </div>
          </section>
        )}

        {/* Browse by practice — compact tiles, small font */}
        <section className="mt-5">
          <h2 className="px-1 font-display text-[13.5px] font-bold text-foreground">Browse by practice</h2>
          <div className="mt-2 grid grid-cols-6 gap-1.5">
            {PRACTICE_SLUGS.map((slug) => {
              const s = SECTIONS.find((x) => x.slug === slug);
              if (!s) return null;
              const Icon = s.icon;
              return (
                <Link key={slug} to="/section/$slug" params={{ slug }} className="flex flex-col items-center gap-1 rounded-xl bg-card p-1.5 text-center ring-1 ring-border/60 active:scale-[0.97]">
                  <span className="flex h-8 w-8 items-center justify-center rounded-lg text-primary-foreground shadow-sm" style={{ background: s.gradient }}><Icon size={15} strokeWidth={1.9} /></span>
                  <span className="text-[9px] font-semibold leading-tight text-foreground/85">{PRACTICE_LABELS[slug]}</span>
                </Link>
              );
            })}
          </div>
        </section>

        {/* Browse by goal — grid of goals + umbrellas that expand */}
        <section className="mt-5">
          <h2 className="px-1 font-display text-[13.5px] font-bold text-foreground">Browse by goal</h2>
          <div className="mt-2 grid grid-cols-5 gap-1.5">
            {HOME_GOAL_TILES.map((t) => {
              if (t.kind === "goal") {
                const g = ALL_GOALS[t.id];
                if (!g) return null;
                return (
                  <Link key={t.id} to="/goal/$id" params={{ id: t.id }} className="flex flex-col items-center gap-1 rounded-xl bg-card p-1.5 text-center ring-1 ring-border/60 active:scale-[0.97]">
                    <span className="flex h-8 w-8 items-center justify-center rounded-lg text-[15px] shadow-sm" style={{ background: g.gradient }}>{g.emoji}</span>
                    <span className="text-[9px] font-semibold leading-tight text-foreground/85">{g.label}</span>
                  </Link>
                );
              }
              const open = openUmbrella === t.id;
              return (
                <button key={t.id} onClick={() => setOpenUmbrella(open ? null : t.id)} className={`relative flex flex-col items-center gap-1 rounded-xl p-1.5 text-center ring-1 active:scale-[0.97] ${open ? "bg-accent/60 ring-primary/40" : "bg-card ring-border/60"}`}>
                  <span className="absolute right-1 top-1 rounded-full bg-foreground/10 px-1 text-[7.5px] font-bold text-foreground/60">{t.goalIds.length}</span>
                  <span className="flex h-8 w-8 items-center justify-center rounded-lg text-[15px] text-primary-foreground shadow-sm" style={{ background: t.gradient }}>{t.emoji}</span>
                  <span className="text-[9px] font-semibold leading-tight text-foreground/85">{t.label}</span>
                </button>
              );
            })}
          </div>

          {/* Expanded umbrella — its goals */}
          {(() => {
            const u = HOME_GOAL_TILES.find((t) => t.kind === "umbrella" && t.id === openUmbrella);
            if (!u || u.kind !== "umbrella") return null;
            return (
              <div className="mt-2 rounded-2xl bg-card/70 p-2.5 ring-1 ring-border/60">
                <p className="mb-1.5 px-1 text-[11px] font-bold uppercase tracking-wide text-muted-foreground">{u.emoji} {u.label}</p>
                <div className="grid grid-cols-5 gap-1.5">
                  {u.goalIds.map((id) => {
                    const g = ALL_GOALS[id];
                    if (!g) return null;
                    return (
                      <Link key={id} to="/goal/$id" params={{ id }} className="flex flex-col items-center gap-1 rounded-xl bg-background/60 p-1.5 text-center ring-1 ring-border/50 active:scale-[0.97]">
                        <span className="flex h-8 w-8 items-center justify-center rounded-lg text-[15px] shadow-sm" style={{ background: g.gradient }}>{g.emoji}</span>
                        <span className="text-[9px] font-semibold leading-tight text-foreground/85">{g.label}</span>
                      </Link>
                    );
                  })}
                </div>
              </div>
            );
          })()}
        </section>
      </div>
      <AyuBot />
      <BottomNav />
    </div>
  );
}
