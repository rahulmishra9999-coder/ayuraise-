import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { BottomNav } from "@/components/BottomNav";
import {
  Flower2, Brain, Salad, Sparkles, Droplet, Hourglass,
  Smile, Meh, Frown, Heart, TrendingDown, Plus, Minus, Check, ChevronDown,
  Stethoscope, ChevronRight,
} from "lucide-react";
import { loadAllDiseasePlans, diseaseTasks } from "@/lib/disease-plan";
import { getDisease } from "@/lib/diseases";


export const Route = createFileRoute("/dashboard")({
  head: () => ({
    meta: [
      { title: "Dashboard · AyuRaise" },
      { name: "description", content: "Your daily wellness dashboard." },
    ],
  }),
  component: Dashboard,
});

const DAYS = ["M", "T", "W", "T", "F", "S", "S"];
const FASTING_WINDOWS = ["16:8", "16:8", "18:6", "16:8", "16:8", "18:6", "24h"];

const moods = [
  { id: "great", label: "Great", icon: Heart, color: "var(--gradient-clay)" },
  { id: "good", label: "Good", icon: Smile, color: "var(--gradient-sage)" },
  { id: "okay", label: "Okay", icon: Meh, color: "var(--gradient-gold)" },
  { id: "low", label: "Low", icon: Frown, color: "var(--gradient-water)" },
];

function Dashboard() {
  const [water, setWater] = useState(4); // glasses
  const [weight, setWeight] = useState(74.2);
  const [mood, setMood] = useState<string | null>(null);
  const [todayIdx, setTodayIdx] = useState(0);

  useEffect(() => {
    const d = new Date().getDay(); // 0 sun .. 6 sat
    setTodayIdx((d + 6) % 7); // shift to Mon=0
  }, []);

  const target = 68;
  const start = 78;
  const progress = Math.min(100, Math.max(0, ((start - weight) / (start - target)) * 100));

  return (
    <div className="min-h-svh pb-28" style={{ background: "var(--gradient-hero)" }}>
      <div className="mx-auto max-w-xl px-5 pt-[max(1.25rem,env(safe-area-inset-top))]">
        <header className="pt-2 animate-shimmer-in">
          <p className="text-[13px] font-medium text-muted-foreground">
            {new Date().toLocaleDateString(undefined, { weekday: "long", month: "long", day: "numeric" })}
          </p>
          <h1 className="mt-1 font-display text-[30px] font-extrabold leading-[1.12] tracking-tight text-foreground">
            Make today<br /><span className="gradient-text">count.</span> ✨
          </h1>
        </header>

        {/* Mood */}
        <section className="mt-6 surface p-5">
          <h2 className="font-display text-base font-semibold">How are you feeling?</h2>
          <div className="mt-3 grid grid-cols-4 gap-2.5">
            {moods.map((m) => {
              const I = m.icon;
              const active = mood === m.id;
              return (
                <button
                  key={m.id}
                  onClick={() => setMood(m.id)}
                  className={`flex flex-col items-center gap-1.5 rounded-2xl py-3 text-xs font-medium transition-all ${
                    active ? "scale-105 text-primary-foreground shadow-[var(--shadow-soft)]" : "bg-secondary text-foreground/80"
                  }`}
                  style={active ? { background: m.color } : undefined}
                >
                  <I size={20} strokeWidth={1.8} />
                  {m.label}
                </button>
              );
            })}
          </div>
        </section>

        {/* Weight + Water row */}
        <div className="mt-4 grid grid-cols-2 gap-4">
          <div className="rounded-3xl p-5 text-primary-foreground shadow-[var(--shadow-tile)]" style={{ background: "var(--gradient-gold)" }}>
            <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider opacity-90">
              <TrendingDown size={14} /> Weight
            </div>
            <div className="mt-2 flex items-end gap-1">
              <span className="font-display text-3xl font-semibold">{weight.toFixed(1)}</span>
              <span className="mb-1 text-xs opacity-80">kg</span>
            </div>
            <p className="text-[11px] opacity-90">Target {target} kg · by Sep 30</p>
            <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-card/30">
              <div className="h-full bg-card/90" style={{ width: `${progress}%` }} />
            </div>
            <div className="mt-3 flex gap-1.5">
              <button onClick={() => setWeight((w) => +(w - 0.1).toFixed(1))} className="flex h-7 w-7 items-center justify-center rounded-full bg-card/30">
                <Minus size={12} />
              </button>
              <button onClick={() => setWeight((w) => +(w + 0.1).toFixed(1))} className="flex h-7 w-7 items-center justify-center rounded-full bg-card/30">
                <Plus size={12} />
              </button>
              <span className="ml-auto text-[11px] opacity-80">Punch in</span>
            </div>
          </div>

          <div className="rounded-3xl p-5 text-primary-foreground shadow-[var(--shadow-tile)]" style={{ background: "var(--gradient-water)" }}>
            <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider opacity-90">
              <Droplet size={14} /> Water
            </div>
            <div className="mt-2 flex items-end gap-1">
              <span className="font-display text-3xl font-semibold">{water}</span>
              <span className="mb-1 text-xs opacity-80">/ 8 glasses</span>
            </div>
            <div className="mt-3 grid grid-cols-8 gap-1">
              {Array.from({ length: 8 }).map((_, idx) => (
                <div key={idx} className={`h-6 rounded-md ${idx < water ? "bg-card/90" : "bg-card/20"}`} />
              ))}
            </div>
            <div className="mt-3 flex gap-1.5">
              <button onClick={() => setWater((w) => Math.max(0, w - 1))} className="flex h-7 w-7 items-center justify-center rounded-full bg-card/30"><Minus size={12} /></button>
              <button onClick={() => setWater((w) => Math.min(12, w + 1))} className="flex h-7 w-7 items-center justify-center rounded-full bg-card/30"><Plus size={12} /></button>
              <span className="ml-auto text-[11px] opacity-80">Reminder · 2h</span>
            </div>
          </div>
        </div>

        {/* Fasting window */}
        <section className="mt-4 surface p-5">
          <div className="flex items-center justify-between">
            <h2 className="flex items-center gap-2 font-display text-base font-semibold">
              <Hourglass size={16} className="text-primary" /> Fasting this week
            </h2>
            <span className="text-xs text-muted-foreground">16:8 plan</span>
          </div>
          <div className="mt-4 grid grid-cols-7 gap-2">
            {DAYS.map((d, i) => {
              const isToday = i === todayIdx;
              return (
                <div key={i} className="flex flex-col items-center gap-1.5">
                  <span className="text-[10px] font-medium text-muted-foreground">{d}</span>
                  <div className={`flex h-14 w-full flex-col items-center justify-center rounded-xl text-[10px] font-semibold ${
                    isToday ? "text-primary-foreground shadow-[var(--shadow-soft)]" : "bg-secondary text-foreground/70"
                  }`} style={isToday ? { background: "var(--gradient-leaf)" } : undefined}>
                    {FASTING_WINDOWS[i]}
                  </div>
                </div>
              );
            })}
          </div>
          <p className="mt-3 text-xs text-muted-foreground">
            Eating window <span className="font-semibold text-foreground">12:00 — 20:00</span> · breaks fast in 2h 14m
          </p>
        </section>

        {/* Disease-management plans */}
        <DiseasePlanCard />

        {/* Saved diet plan */}
        <DietPlanCard />

        {/* Today's plan */}
        <section className="mt-4 space-y-3">
          <h2 className="px-1 font-display text-lg font-semibold">Today's plan</h2>

          <PlanCard
            icon={Flower2}
            gradient="var(--gradient-leaf)"
            tag="Yoga · 25 min"
            title="Surya Namaskar + hip openers"
            sub="Morning · 7:00 AM"
          />
          <PlanCard
            icon={Brain}
            gradient="var(--gradient-violet)"
            tag="Meditation · 10 min"
            title="Anapana — breath awareness"
            sub="After yoga"
          />
          <PlanCard
            icon={Salad}
            gradient="var(--gradient-sage)"
            tag="Diet · Vata-pacifying"
            title="Warm kitchari · ghee · ginger tea"
            sub="Lunch · 12:30 PM"
          />
          <PlanCard
            icon={Sparkles}
            gradient="var(--gradient-water)"
            tag="Detox · Day 3 of 7"
            title="Triphala before bed · oil pulling AM"
            sub="Evening checklist"
          />
        </section>

      </div>
      <BottomNav />
    </div>
  );
}

function PlanCard({
  icon: Icon, gradient, tag, title, sub,
}: { icon: typeof Flower2; gradient: string; tag: string; title: string; sub: string }) {
  return (
    <div className="flex items-center gap-4 surface p-4">
      <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl text-primary-foreground" style={{ background: gradient }}>
        <Icon size={22} strokeWidth={1.8} />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">{tag}</p>
        <p className="truncate text-sm font-semibold text-foreground">{title}</p>
        <p className="truncate text-xs text-muted-foreground">{sub}</p>
      </div>
      <button className="rounded-full bg-secondary px-3 py-1.5 text-xs font-semibold text-foreground/80">Start</button>
    </div>
  );
}

function DiseasePlanCard() {
  const [plans, setPlans] = useState<ReturnType<typeof loadAllDiseasePlans>>([]);
  const [openSlug, setOpenSlug] = useState<string | null>(null);

  useEffect(() => { setPlans(loadAllDiseasePlans()); }, []);
  if (plans.length === 0) return null;

  return (
    <section className="mt-4 surface p-5">
      <h2 className="flex items-center gap-2 font-display text-base font-semibold">
        <Stethoscope size={16} className="text-primary" /> My condition plans
      </h2>
      <div className="mt-3 grid gap-2">
        {plans.map((p) => {
          const disease = getDisease(p.slug);
          const tasks = diseaseTasks(p);
          const isOpen = openSlug === p.slug;
          return (
            <div key={p.slug} className="overflow-hidden rounded-2xl bg-secondary/40 ring-1 ring-border/60">
              <button
                onClick={() => setOpenSlug(isOpen ? null : p.slug)}
                className="flex w-full items-center justify-between gap-2 px-3 py-2.5 text-left"
              >
                <div className="flex items-center gap-2">
                  <span className="text-sm font-semibold text-foreground">{disease?.name ?? p.name}</span>
                  <span className="rounded-full bg-primary/15 px-2 py-0.5 text-[10px] font-semibold text-primary">
                    {p.track === "prevent" ? "Prevent" : "Manage"}
                  </span>
                </div>
                <ChevronDown size={16} className={`text-muted-foreground transition-transform ${isOpen ? "rotate-180" : ""}`} />
              </button>
              {isOpen && (
                <div className="grid gap-2 border-t border-border/60 bg-card/60 p-3">
                  {tasks.map((t) => (
                    <div key={t.tool} className="rounded-xl bg-card p-3 ring-1 ring-border/60">
                      <p className="text-[12px] font-semibold text-foreground">{t.label}</p>
                      <ul className="mt-1.5 grid gap-1">
                        {t.items.slice(0, 4).map((it) => (
                          <li key={it} className="flex items-start gap-1.5 text-[12px] text-foreground/85">
                            <Check size={12} className="mt-0.5 shrink-0 text-primary" /> {it}
                          </li>
                        ))}
                      </ul>
                    </div>
                  ))}
                  <Link
                    to="/disease/$slug"
                    params={{ slug: p.slug }}
                    className="flex items-center justify-center gap-1 rounded-xl bg-primary/10 py-2 text-[12px] font-semibold text-primary"
                  >
                    Open full plan <ChevronRight size={13} />
                  </Link>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </section>
  );
}

interface DayMeal { slot: string; time: string; items: string[] }
interface WeeklyDay { day: string; isIF: boolean; window?: string; meals: DayMeal[] }
interface WeeklyPlan { dosha?: string; ritu?: string; days: WeeklyDay[]; createdAt?: number }

function DietPlanCard() {
  const [plan, setPlan] = useState<WeeklyPlan | null>(null);
  const [open, setOpen] = useState<string | null>(null);

  useEffect(() => {
    try {
      const raw = localStorage.getItem("ayuraise.dietPlan");
      if (raw) setPlan(JSON.parse(raw));
    } catch {}
  }, []);

  const todayLabel = useMemo(() => {
    const d = new Date().getDay();
    const idx = (d + 6) % 7;
    return ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"][idx];
  }, []);

  if (!plan?.days?.length) return null;

  return (
    <section className="mt-4 surface p-5">
      <div className="flex items-center justify-between">
        <h2 className="flex items-center gap-2 font-display text-base font-semibold">
          <Salad size={16} className="text-primary" /> My diet plan
        </h2>
        {plan.dosha && (
          <span className="rounded-full bg-primary/10 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-primary">
            {plan.dosha}
          </span>
        )}
      </div>
      <p className="mt-1 text-xs text-muted-foreground">
        Tap any day to see the full meal plan.
      </p>
      <div className="mt-3 grid gap-2">
        {plan.days.map((d) => {
          const isOpen = open === d.day;
          const isToday = d.day === todayLabel;
          return (
            <div
              key={d.day}
              className={`overflow-hidden rounded-2xl ring-1 ${
                isToday ? "bg-accent/40 ring-primary/30" : "bg-secondary/40 ring-border/60"
              }`}
            >
              <button
                onClick={() => setOpen(isOpen ? null : d.day)}
                className="flex w-full items-center justify-between gap-2 px-3 py-2.5 text-left"
              >
                <div className="flex items-center gap-2">
                  <span className="text-sm font-semibold text-foreground">
                    {d.day}{isToday ? " · Today" : ""}
                  </span>
                  {d.isIF ? (
                    <span className="rounded-full bg-primary/15 px-2 py-0.5 text-[10px] font-semibold text-primary">
                      IF · {d.window}
                    </span>
                  ) : (
                    <span className="rounded-full bg-card px-2 py-0.5 text-[10px] font-semibold text-foreground/80 ring-1 ring-border/60">
                      Regular
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-[11px] text-muted-foreground">
                    {d.meals.map((m) => m.time).filter(Boolean).slice(0, 3).join(" · ")}
                  </span>
                  <ChevronDown
                    size={16}
                    className={`text-muted-foreground transition-transform ${isOpen ? "rotate-180" : ""}`}
                  />
                </div>
              </button>
              {isOpen && (
                <div className="grid gap-2 border-t border-border/60 bg-card/60 p-3">
                  {d.meals.map((m, i) => (
                    <div key={i} className="rounded-xl bg-card p-3 ring-1 ring-border/60">
                      <div className="flex items-center justify-between">
                        <p className="text-[12px] font-semibold text-foreground">{m.slot}</p>
                        <span className="text-[11px] font-semibold text-primary">{m.time}</span>
                      </div>
                      <ul className="mt-1.5 grid gap-1">
                        {m.items.map((it) => (
                          <li key={it} className="flex items-start gap-1.5 text-[12px] text-foreground/85">
                            <Check size={12} className="mt-0.5 shrink-0 text-primary" /> {it}
                          </li>
                        ))}
                      </ul>
                    </div>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </section>
  );
}

