import { createFileRoute, Link, notFound, useRouter } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { BottomNav } from "@/components/BottomNav";
import { Stars } from "@/components/Stars";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { QuizRunner } from "@/components/QuizRunner";
import {
  getDisease, planItems, TOOL_META,
  loadTrack, saveTrack, organsForCondition,
  type ToolKey, type ReadyPlan, type Track, type DiseaseInfo,
} from "@/lib/diseases";
import { loadDiseasePlan, type DiseasePlan } from "@/lib/disease-plan";
import {
  RISK, maxScore, riskBand, topContributors, BAND_META, type RiskFactor,
} from "@/lib/disease-risk";
import {
  ArrowLeft, Sparkles, Download, Check, AlertTriangle, HelpCircle, Bot,
  ShieldCheck, HeartPulse, BookOpen, Activity, ChevronRight, RefreshCw,
} from "lucide-react";

export const Route = createFileRoute("/disease/$slug")({
  loader: ({ params }) => {
    const d = getDisease(params.slug);
    if (!d) throw notFound();
    return { slug: d.slug };
  },
  head: ({ params }) => {
    const d = params ? getDisease(params.slug) : undefined;
    return {
      meta: d
        ? [
            { title: `${d.name} · AyuRaise` },
            { name: "description", content: d.basic.what },
          ]
        : [{ title: "Condition · AyuRaise" }],
    };
  },
  component: DiseasePage,
  notFoundComponent: () => (
    <div className="flex min-h-svh items-center justify-center p-6 text-center">
      <div>
        <h1 className="font-display text-2xl">Condition not found</h1>
        <Link to="/section/disease" className="mt-3 inline-block text-primary underline">Back</Link>
      </div>
    </div>
  ),
  errorComponent: ({ reset }) => {
    const router = useRouter();
    return (
      <div className="flex min-h-svh items-center justify-center p-6 text-center">
        <div>
          <h1 className="font-display text-2xl">Something went wrong</h1>
          <button onClick={() => { router.invalidate(); reset(); }} className="mt-3 rounded-full bg-primary px-4 py-2 text-sm text-primary-foreground">Try again</button>
        </div>
      </div>
    );
  },
});

function DiseasePage() {
  const { slug } = Route.useLoaderData();
  const disease = getDisease(slug)!;
  if (disease.kind === "seasonal") return <SeasonalPage disease={disease} />;
  return <ChronicPage disease={disease} />;
}

/* ================================================================== */
/*  CHRONIC                                                           */
/* ================================================================== */

function ChronicPage({ disease }: { disease: DiseaseInfo }) {
  const Icon = disease.icon;
  const isOrgan = disease.group === "organ";
  const [track, setTrack] = useState<Track>(isOrgan ? "prevent" : "manage");
  const [plan, setPlan] = useState<DiseasePlan | null>(null);
  const [openPlan, setOpenPlan] = useState<{ tool: ToolKey; plan: ReadyPlan } | null>(null);
  const [downloadView, setDownloadView] = useState(false);
  const [quizOpen, setQuizOpen] = useState(false);

  useEffect(() => {
    setTrack(loadTrack(disease.slug));
    setPlan(loadDiseasePlan(disease.slug));
  }, [disease.slug]);

  function switchTrack(t: Track) {
    setTrack(t);
    saveTrack(disease.slug, t);
  }

  const tools = (Object.keys(disease.relevance) as ToolKey[])
    .filter((t) => disease.relevance[t] > 0 && disease.readyPlans[t])
    .sort((a, b) => disease.relevance[b] - disease.relevance[a]);

  return (
    <div className="min-h-svh pb-32" style={{ background: "var(--gradient-hero)" }}>
      {/* Hero */}
      <div className="relative px-5 pb-8 pt-[max(1rem,env(safe-area-inset-top))]" style={{ background: disease.gradient }}>
        <Link to="/section/disease" className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-card/40 text-primary-foreground backdrop-blur-sm">
          <ArrowLeft size={18} />
        </Link>
        <div className="mt-6 flex items-center gap-4">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-card/30 backdrop-blur-sm">
            <Icon size={26} className="text-primary-foreground" strokeWidth={1.7} />
          </div>
          <div>
            <p className="text-[11px] uppercase tracking-[0.2em] text-primary-foreground/70">
              {isOrgan ? "Organ Health · Prevention-first" : "Chronic · Lifestyle"}
            </p>
            <h1 className="font-display text-2xl font-semibold text-primary-foreground">{disease.name}</h1>
          </div>
        </div>

        {/* Track switch */}
        <div className="mt-5 flex gap-2 rounded-2xl bg-card/25 p-1 backdrop-blur-sm">
          {isOrgan ? (
            <>
              <TrackBtn active={track === "prevent"} onClick={() => switchTrack("prevent")} icon={<ShieldCheck size={14} />} label="Strengthen & protect" />
              <TrackBtn active={track === "manage"} onClick={() => switchTrack("manage")} icon={<HeartPulse size={14} />} label="I have an issue here" />
            </>
          ) : (
            <>
              <TrackBtn active={track === "manage"} onClick={() => switchTrack("manage")} icon={<HeartPulse size={14} />} label="I have this" />
              <TrackBtn active={track === "prevent"} onClick={() => switchTrack("prevent")} icon={<ShieldCheck size={14} />} label="I want to prevent it" />
            </>
          )}
        </div>
      </div>

      {/* Floating step nav — the page is a 4-step story */}
      <SectionNav
        items={[
          { id: "what", label: "1 · What" },
          { id: "why", label: "2 · Why" },
          { id: "tackle", label: "3 · Tackle" },
          ...(track === "prevent" && RISK[disease.slug] ? [{ id: "risk", label: "🛡️ Risk" }] : []),
          { id: "tools", label: "4 · Tools" },
        ]}
      />

      <div className="mx-auto -mt-2 max-w-xl px-5">
        {/* Plan state banner (State B entry) */}
        {plan && <ActivePlanCard plan={plan} />}

        {/* ---- 01 · WHAT ---- */}
        <section id="what" className="scroll-mt-16 pt-5 animate-float-up">
          <NumberHead n="01" title="What is it?" />
          <Lead text={disease.basic.what} />

          <p className="mt-5 text-[11px] font-bold uppercase tracking-wide text-foreground/50">You might notice</p>
          <div className="mt-2 flex flex-wrap gap-1.5">
            {disease.basic.symptoms.map((s) => (
              <span key={s} className="rounded-full bg-card px-3 py-1.5 text-[12px] font-medium leading-snug text-foreground/85 ring-1 ring-border/60">
                {s}
              </span>
            ))}
          </div>

          <Collapse tone="alert" label="⚠️ When to see a doctor">
            <ul className="space-y-2">
              {disease.basic.redFlags.map((r) => (
                <li key={r} className="flex items-start gap-2 text-[13px] leading-snug text-foreground/85">
                  <AlertTriangle size={13} className="mt-0.5 shrink-0 text-rose-500" /> {r}
                </li>
              ))}
            </ul>
          </Collapse>
        </section>

        {/* ---- 02 · WHY ---- */}
        <section id="why" className="mt-8 scroll-mt-16 border-t border-border/50 pt-6 animate-float-up" style={{ animationDelay: "60ms" }}>
          <NumberHead n="02" title="Why it happens" />
          <ul className="mt-4 space-y-2.5">
            {disease.basic.causes.map((c) => (
              <li key={c} className="flex items-start gap-2.5 text-[13.5px] leading-snug text-foreground/85">
                <span className="mt-0.5 shrink-0 text-saffron">◆</span> {c}
              </li>
            ))}
          </ul>
        </section>

        {/* ---- 03 · TACKLE ---- */}
        <section id="tackle" className="mt-8 scroll-mt-16 border-t border-border/50 pt-6 animate-float-up" style={{ animationDelay: "120ms" }}>
          <NumberHead n="03" title="How to tackle it" sub="The moves that matter most" />
          <ul className="mt-4 space-y-2.5">
            {disease.dosDonts.dos.map((d) => (
              <li key={d} className="flex items-start gap-2.5 text-[13.5px] leading-snug text-foreground/90">
                <span className="mt-0.5 flex h-[18px] w-[18px] shrink-0 items-center justify-center rounded-full bg-emerald-100 text-emerald-700 dark:bg-emerald-900/50 dark:text-emerald-300">
                  <Check size={11} strokeWidth={3} />
                </span>
                {d}
              </li>
            ))}
          </ul>
          <Collapse label="✋ And what to avoid">
            <ul className="space-y-2.5">
              {disease.dosDonts.donts.map((d) => (
                <li key={d} className="flex items-start gap-2.5 text-[13px] leading-snug text-foreground/80">
                  <span className="mt-0.5 shrink-0 text-rose-400">✕</span> {d}
                </li>
              ))}
            </ul>
          </Collapse>
        </section>

        {/* ---- RISK CHECK (prevent track) ---- */}
        {track === "prevent" && RISK[disease.slug] && (
          <section id="risk" className="mt-6 scroll-mt-16">
            <RiskCheck slug={disease.slug} />
          </section>
        )}

        {/* ---- 04 · TOOLS ---- */}
        <section id="tools" className="mt-8 scroll-mt-16 border-t border-border/50 pb-2 pt-6 animate-float-up" style={{ animationDelay: "180ms" }}>
          <NumberHead
            n="04"
            title={track === "prevent" ? "Best tools to keep it away" : "Best tools to tackle it"}
            sub="Ranked by impact · tap one for its best practices"
          />
          <ul className="mt-4 space-y-2">
            {tools.map((t) => {
              const meta = TOOL_META[t];
              const ready = disease.readyPlans[t]!;
              return (
                <li key={t}>
                  <button
                    onClick={() => { setDownloadView(false); setOpenPlan({ tool: t, plan: ready }); }}
                    className="flex w-full items-center gap-3 rounded-2xl bg-card p-3 text-left ring-1 ring-border/60 transition-transform active:scale-[0.98]"
                  >
                    <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-accent/60 text-lg">{meta.emoji}</span>
                    <span className="flex-1">
                      <span className="flex items-center justify-between gap-2">
                        <span className="text-[13px] font-semibold text-foreground/90">{meta.label}</span>
                        <Stars n={disease.relevance[t]} />
                      </span>
                      <span className="mt-0.5 block text-[12px] text-muted-foreground">{ready.title}</span>
                    </span>
                    <ChevronRight size={15} className="shrink-0 text-muted-foreground" />
                  </button>
                </li>
              );
            })}
          </ul>

          {/* Organ ↔ condition links, tucked at the end of the journey */}
          <CrossLinks disease={disease} />

          <button
            onClick={() => setQuizOpen(true)}
            className="mt-3 flex w-full items-center gap-3 rounded-2xl bg-card p-3.5 text-left ring-1 ring-border/60 transition-transform active:scale-[0.98]"
          >
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-accent/60 text-lg">🎓</span>
            <span className="flex-1">
              <span className="text-[13px] font-semibold text-foreground/90">Know it in 2 minutes</span>
              <span className="mt-0.5 block text-[12px] text-muted-foreground">A quick quiz that teaches as you tap</span>
            </span>
            <ChevronRight size={15} className="shrink-0 text-muted-foreground" />
          </button>
        </section>
      </div>

      {/* Sticky Build-my-plan CTA */}
      <div className="fixed inset-x-0 bottom-[76px] z-30 px-4 pb-2">
        <Link
          to="/disease-bot"
          search={{ slug: disease.slug, mode: "verify" as const }}
          className="mx-auto flex max-w-xl items-center justify-center gap-2 rounded-2xl bg-primary px-5 py-3.5 text-sm font-semibold text-primary-foreground shadow-[var(--shadow-glow)]"
        >
          <Bot size={16} /> {plan ? `Rebuild my ${disease.short} plan` : `Build my personalized ${disease.short} plan`}
        </Link>
      </div>

      {/* Quiz popup */}
      <Dialog open={quizOpen} onOpenChange={setQuizOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="font-display">Quick knowledge check</DialogTitle>
            <DialogDescription>Answer a few — learn as you go.</DialogDescription>
          </DialogHeader>
          <QuizRunner quizId="disease" />
        </DialogContent>
      </Dialog>

      {/* Ready-made plan sheet */}
      <PlanSheet
        openPlan={openPlan}
        track={track}
        diseaseShort={disease.short}
        diseaseSlug={disease.slug}
        downloadView={downloadView}
        setDownloadView={setDownloadView}
        onClose={() => { setOpenPlan(null); setDownloadView(false); }}
      />

      <BottomNav />
    </div>
  );
}

/* ================================================================== */
/*  SEASONAL                                                          */
/* ================================================================== */

function SeasonalPage({ disease }: { disease: DiseaseInfo }) {
  const Icon = disease.icon;
  const [openPlan, setOpenPlan] = useState<{ tool: ToolKey; plan: ReadyPlan } | null>(null);
  const [downloadView, setDownloadView] = useState(false);

  const tools = (Object.keys(disease.relevance) as ToolKey[])
    .filter((t) => disease.relevance[t] > 0 && disease.readyPlans[t])
    .sort((a, b) => disease.relevance[b] - disease.relevance[a]);

  return (
    <div className="min-h-svh pb-32" style={{ background: "var(--gradient-hero)" }}>
      <div className="relative px-5 pb-8 pt-[max(1rem,env(safe-area-inset-top))]" style={{ background: disease.gradient }}>
        <Link to="/section/disease" className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-card/40 text-primary-foreground backdrop-blur-sm">
          <ArrowLeft size={18} />
        </Link>
        <div className="mt-6 flex items-center gap-4">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-card/30 backdrop-blur-sm">
            <Icon size={26} className="text-primary-foreground" strokeWidth={1.7} />
          </div>
          <div>
            <p className="text-[11px] uppercase tracking-[0.2em] text-primary-foreground/70">Seasonal · Acute</p>
            <h1 className="font-display text-2xl font-semibold text-primary-foreground">{disease.name}</h1>
          </div>
        </div>
        <p className="mt-4 max-w-md text-[13.5px] leading-relaxed text-primary-foreground/90">{disease.blurb}</p>
      </div>

      <div className="mx-auto -mt-4 max-w-xl px-4">
        {/* RED FLAGS FIRST — non-negotiable for acute illness */}
        <div className="rounded-3xl bg-rose-50 p-4 shadow-[var(--shadow-soft)] ring-1 ring-rose-200 dark:bg-rose-950/30 dark:ring-rose-900">
          <div className="flex items-center gap-2 text-rose-700 dark:text-rose-300">
            <AlertTriangle size={16} />
            <p className="text-[12px] font-bold uppercase tracking-wide">See a doctor immediately if</p>
          </div>
          <ul className="mt-2 ml-4 list-disc space-y-1 text-[13px] leading-snug text-foreground/90">
            {disease.basic.redFlags.map((r) => <li key={r}>{r}</li>)}
          </ul>
        </div>

        {/* Talk to bot */}
        <Link
          to="/disease-bot"
          search={{ slug: disease.slug, mode: "acute" as const }}
          className="mt-4 flex items-center gap-3 rounded-3xl bg-primary p-4 text-primary-foreground shadow-[var(--shadow-glow)]"
        >
          <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-white/15"><Bot size={22} /></span>
          <div className="flex-1">
            <p className="font-display text-[15px] font-semibold">Talk to Ayu about my symptoms</p>
            <p className="text-[12px] text-primary-foreground/85">Quick check + a remedy plan for the next few days.</p>
          </div>
          <Sparkles size={18} />
        </Link>

        {/* Quick Relief ready-made plans */}
        <div className="mt-4 rounded-3xl bg-card p-4 shadow-[var(--shadow-soft)] ring-1 ring-border/60">
          <h2 className="px-1 pb-1 font-display text-[14px] font-semibold text-foreground/90">Quick Relief</h2>
          <p className="px-1 pb-3 text-[12px] text-muted-foreground">Ready-made — start right away. Tap any for the full protocol.</p>
          <ul className="space-y-2">
            {tools.map((t) => {
              const meta = TOOL_META[t];
              const ready = disease.readyPlans[t]!;
              return (
                <li key={t}>
                  <button
                    onClick={() => { setDownloadView(false); setOpenPlan({ tool: t, plan: ready }); }}
                    className="flex w-full items-center gap-3 rounded-2xl bg-background/70 p-3 text-left ring-1 ring-border/50 transition-transform active:scale-[0.98]"
                  >
                    <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-accent/60 text-lg">{meta.emoji}</span>
                    <span className="flex-1">
                      <span className="flex items-center justify-between gap-2">
                        <span className="text-[13px] font-semibold text-foreground/90">{meta.label}</span>
                        <Stars n={disease.relevance[t]} />
                      </span>
                      <span className="mt-0.5 block text-[12px] text-muted-foreground">{ready.title}</span>
                    </span>
                  </button>
                </li>
              );
            })}
          </ul>
        </div>

        {/* Know it */}
        <div className="mt-4 rounded-3xl bg-card p-4 shadow-[var(--shadow-soft)] ring-1 ring-border/60">
          <h2 className="px-1 pb-2 font-display text-[14px] font-semibold text-foreground/90">Know it</h2>
          <p className="px-1 text-[13px] leading-relaxed text-foreground/85">{disease.basic.what}</p>
          <MiniSection title="How you get it">
            {disease.basic.causes.map((c) => <li key={c}>{c}</li>)}
          </MiniSection>
          <MiniSection title="Signs">
            {disease.basic.symptoms.map((c) => <li key={c}>{c}</li>)}
          </MiniSection>
          <div className="mt-3 grid grid-cols-2 gap-2">
            <DoCard tone="do" title="Do's" items={disease.dosDonts.dos} />
            <DoCard tone="dont" title="Don'ts" items={disease.dosDonts.donts} />
          </div>
        </div>
      </div>

      <PlanSheet
        openPlan={openPlan}
        track="manage"
        diseaseShort={disease.short}
        diseaseSlug={disease.slug}
        downloadView={downloadView}
        setDownloadView={setDownloadView}
        acute
        onClose={() => { setOpenPlan(null); setDownloadView(false); }}
      />

      <BottomNav />
    </div>
  );
}

/* ================================================================== */
/*  Shared pieces                                                     */
/* ================================================================== */

/** Smooth glide with an instant fallback — some environments freeze smooth scrolling. */
function glideTo(id: string) {
  const el = document.getElementById(id);
  if (!el) return;
  const target = Math.max(0, el.getBoundingClientRect().top + window.scrollY - 58); // clear the sticky nav
  const start = window.scrollY;
  window.scrollTo({ top: target, behavior: "smooth" });
  window.setTimeout(() => {
    // smooth didn't move us (throttled tab / reduced motion quirk) → jump
    if (Math.abs(window.scrollY - start) < 4 && Math.abs(target - start) > 8) window.scrollTo(0, target);
  }, 250);
}

/** Floating pill nav that follows the scroll — tapping a pill glides to its section. */
function SectionNav({ items }: { items: { id: string; label: string }[] }) {
  const [active, setActive] = useState(items[0]?.id);
  const key = items.map((i) => i.id).join(",");

  useEffect(() => {
    const onScroll = () => {
      let current = items[0]?.id;
      for (const i of items) {
        const el = document.getElementById(i.id);
        if (el && el.getBoundingClientRect().top <= 130) current = i.id;
      }
      setActive(current);
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key]);

  return (
    <div
      className="sticky top-0 z-30 px-4 py-2 backdrop-blur-xl"
      style={{ background: "color-mix(in oklab, var(--background) 80%, transparent)" }}
    >
      <div className="mx-auto flex max-w-xl gap-1.5 overflow-x-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        {items.map((i) => (
          <button
            key={i.id}
            onClick={() => { setActive(i.id); glideTo(i.id); }}
            className={`shrink-0 rounded-full px-3.5 py-1.5 text-[12px] font-semibold transition-all ${
              active === i.id
                ? "bg-primary text-primary-foreground shadow-[var(--shadow-glow)]"
                : "bg-card text-foreground/70 ring-1 ring-border/60"
            }`}
          >
            {i.label}
          </button>
        ))}
      </div>
    </div>
  );
}

/** Ghost step number + title — orientation without card chrome. */
function NumberHead({ n, title, sub }: { n: string; title: string; sub?: string }) {
  return (
    <div className="flex items-baseline gap-3">
      <span className="font-display text-[28px] font-extrabold leading-none text-primary/25">{n}</span>
      <div>
        <h2 className="font-display text-[18px] font-bold leading-tight text-foreground">{title}</h2>
        {sub && <p className="mt-0.5 text-[12px] leading-snug text-muted-foreground">{sub}</p>}
      </div>
    </div>
  );
}

/** Light disclosure — keeps heavy-but-important content one tap away, not on screen. */
function Collapse({ label, tone = "neutral", children }: { label: string; tone?: "neutral" | "alert"; children: React.ReactNode }) {
  const [open, setOpen] = useState(false);
  return (
    <div
      className={`mt-4 overflow-hidden rounded-2xl ring-1 ${
        tone === "alert"
          ? "bg-rose-50/60 ring-rose-200 dark:bg-rose-950/20 dark:ring-rose-900"
          : "bg-card ring-border/60"
      }`}
    >
      <button onClick={() => setOpen(!open)} className="flex w-full items-center justify-between px-4 py-3 text-left">
        <span className={`text-[13px] font-semibold ${tone === "alert" ? "text-rose-700 dark:text-rose-300" : "text-foreground/85"}`}>
          {label}
        </span>
        <ChevronRight size={15} className={`shrink-0 text-muted-foreground transition-transform ${open ? "rotate-90" : ""}`} />
      </button>
      {open && <div className="px-4 pb-4">{children}</div>}
    </div>
  );
}

function SectionHead({ emoji, title, sub }: { emoji: string; title: string; sub?: string }) {
  return (
    <div className="flex items-center gap-3">
      <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-accent/60 text-xl">{emoji}</span>
      <div>
        <h2 className="font-display text-[16.5px] font-bold leading-tight text-foreground">{title}</h2>
        {sub && <p className="mt-0.5 text-[11.5px] leading-snug text-muted-foreground">{sub}</p>}
      </div>
    </div>
  );
}

/** First sentence gets display treatment; the rest flows as body text. */
function Lead({ text }: { text: string }) {
  const m = text.match(/^(.+?[.!?])\s+(.+)$/s);
  const first = m ? m[1] : text;
  const rest = m ? m[2] : "";
  return (
    <>
      <p className="mt-4 font-display text-[17px] font-semibold leading-snug text-foreground">{first}</p>
      {rest && <p className="mt-2 text-[13.5px] leading-relaxed text-foreground/80">{rest}</p>}
    </>
  );
}

/** Organ pages link down to their conditions; condition pages link up to their organ(s). */
function CrossLinks({ disease }: { disease: DiseaseInfo }) {
  const isOrgan = disease.group === "organ";
  const targets = isOrgan
    ? (disease.related ?? []).map(getDisease).filter((d): d is DiseaseInfo => !!d)
    : organsForCondition(disease.slug);
  if (targets.length === 0) return null;

  return (
    <div className="mt-3 rounded-3xl bg-card p-3.5 shadow-[var(--shadow-soft)] ring-1 ring-border/60">
      <p className="px-0.5 text-[11px] font-semibold uppercase tracking-wide text-foreground/70">
        {isOrgan ? "Already diagnosed with something here?" : "Protect the whole organ"}
      </p>
      <div className="mt-2 flex flex-wrap gap-1.5">
        {targets.map((t) => {
          const TIcon = t.icon;
          return (
            <Link
              key={t.slug}
              to="/disease/$slug"
              params={{ slug: t.slug }}
              className="inline-flex items-center gap-1.5 rounded-full bg-secondary px-3 py-1.5 text-[12px] font-medium text-secondary-foreground ring-1 ring-border/50 transition-transform active:scale-[0.97]"
            >
              <span className="flex h-5 w-5 items-center justify-center rounded-full text-primary-foreground" style={{ background: t.gradient }}>
                <TIcon size={11} strokeWidth={2} />
              </span>
              {t.short}
              <ChevronRight size={12} className="text-muted-foreground" />
            </Link>
          );
        })}
      </div>
    </div>
  );
}

function TrackBtn({ active, onClick, icon, label }: { active: boolean; onClick: () => void; icon: React.ReactNode; label: string }) {
  return (
    <button
      onClick={onClick}
      className={`flex flex-1 items-center justify-center gap-1.5 rounded-xl px-2 py-2 text-[12px] font-semibold transition ${
        active ? "bg-card text-foreground shadow-sm" : "text-primary-foreground/85"
      }`}
    >
      {icon} {label}
    </button>
  );
}

function MiniSection({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="mt-3">
      <p className="text-[11px] font-semibold uppercase tracking-wide text-foreground/70">{title}</p>
      <ul className="mt-1 ml-4 list-disc space-y-0.5 text-[12.5px] leading-snug text-foreground/85">
        {children}
      </ul>
    </div>
  );
}

function RedFlags({ items }: { items: string[] }) {
  return (
    <div className="mt-3 rounded-2xl bg-rose-50 p-3 ring-1 ring-rose-200 dark:bg-rose-950/30 dark:ring-rose-900">
      <div className="flex items-center gap-2 text-rose-700 dark:text-rose-300">
        <AlertTriangle size={14} />
        <p className="text-[11px] font-semibold uppercase tracking-wide">Red flags — see a doctor</p>
      </div>
      <ul className="mt-1.5 ml-4 list-disc space-y-0.5 text-[12.5px] leading-snug text-foreground/85">
        {items.map((r) => <li key={r}>{r}</li>)}
      </ul>
    </div>
  );
}

function DoCard({ tone, title, items }: { tone: "do" | "dont"; title: string; items: string[] }) {
  const ok = tone === "do";
  return (
    <div className={`rounded-2xl p-3 ring-1 ${ok ? "bg-emerald-50 ring-emerald-200 dark:bg-emerald-950/25 dark:ring-emerald-900" : "bg-amber-50 ring-amber-200 dark:bg-amber-950/25 dark:ring-amber-900"}`}>
      <p className={`text-[11px] font-bold uppercase tracking-wide ${ok ? "text-emerald-700 dark:text-emerald-300" : "text-amber-700 dark:text-amber-300"}`}>{title}</p>
      <ul className="mt-1.5 space-y-1 text-[12px] leading-snug text-foreground/85">
        {items.map((it) => (
          <li key={it} className="flex items-start gap-1.5">
            <span className={ok ? "text-emerald-600" : "text-amber-600"}>{ok ? "✓" : "✕"}</span>
            <span>{it}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

function ActivePlanCard({ plan }: { plan: DiseasePlan }) {
  return (
    <div className="rounded-3xl bg-gradient-to-br from-primary/15 via-primary/5 to-secondary/10 p-4 shadow-[var(--shadow-soft)] ring-1 ring-primary/30">
      <div className="flex items-center gap-2 text-primary">
        <Activity size={16} />
        <p className="text-[13px] font-semibold text-foreground/90">Your active plan</p>
      </div>
      <p className="mt-1 text-[12.5px] text-foreground/80">
        {plan.track === "prevent" ? "Prevention" : "Management"} · {plan.tools.length} tools · started {new Date(plan.createdAt).toLocaleDateString()}
      </p>
      <div className="mt-2 flex flex-wrap gap-1.5">
        {plan.tools.map((t) => (
          <span key={t} className="rounded-full bg-card px-2 py-0.5 text-[11px] font-medium text-foreground/80 ring-1 ring-border/60">
            {TOOL_META[t].emoji} {TOOL_META[t].label}
          </span>
        ))}
      </div>
      {plan.phase2 && (
        <p className="mt-2 rounded-xl bg-card/70 px-2.5 py-1.5 text-[11.5px] text-foreground/75 ring-1 ring-border/50">
          Phase 2 — {plan.phase2.name} — begins after {plan.phase2.startAfterDays} days.
        </p>
      )}
      <Link to="/my-plans" className="mt-2.5 inline-flex items-center gap-1 text-[12px] font-semibold text-primary">
        View in My Plans <ChevronRight size={13} />
      </Link>
    </div>
  );
}

function PlanSheet({
  openPlan, track, diseaseShort, diseaseSlug, downloadView, setDownloadView, onClose, acute,
}: {
  openPlan: { tool: ToolKey; plan: ReadyPlan } | null;
  track: Track;
  diseaseShort: string;
  diseaseSlug: string;
  downloadView: boolean;
  setDownloadView: (v: boolean) => void;
  onClose: () => void;
  acute?: boolean;
}) {
  return (
    <Dialog open={!!openPlan} onOpenChange={(v) => { if (!v) onClose(); }}>
      <DialogContent className="max-w-md">
        {openPlan && (
          <>
            <DialogHeader>
              <DialogTitle className="font-display flex items-center gap-2">
                <span>{TOOL_META[openPlan.tool].emoji}</span> {openPlan.plan.title}
              </DialogTitle>
              <DialogDescription>
                {track === "prevent" ? "Prevention" : "Ready-made"} {TOOL_META[openPlan.tool].label.toLowerCase()} for {diseaseShort.toLowerCase()}.
              </DialogDescription>
            </DialogHeader>

            <ul className="mt-1 space-y-2">
              {planItems(openPlan.plan, track).map((it) => (
                <li key={it} className="flex items-start gap-2 text-[13px] leading-snug text-foreground/90">
                  <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-accent/40 text-primary">
                    <Check size={12} strokeWidth={3} />
                  </span>
                  {it}
                </li>
              ))}
            </ul>

            {!downloadView ? (
              <div className="mt-4 rounded-2xl bg-accent/40 p-3 ring-1 ring-border/60">
                <p className="text-[13px] font-medium text-foreground/90">
                  {acute ? "Want this tailored to your symptoms?" : "Customize this to your prakriti?"}
                </p>
                <p className="mt-0.5 text-[12px] text-muted-foreground">
                  {acute ? "A quick chat adjusts remedies to how you're feeling." : "A short chat personalises timings, foods & intensity."}
                </p>
                <DialogFooter className="mt-3 flex-col gap-2 sm:flex-col">
                  <Link
                    to="/disease-bot"
                    search={{ slug: diseaseSlug, tool: openPlan.tool, mode: acute ? ("acute" as const) : ("verify" as const) }}
                    className="flex w-full items-center justify-center gap-2 rounded-2xl bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground"
                  >
                    <Sparkles size={14} /> {acute ? "Chat & tailor" : "Yes, customize for me"}
                  </Link>
                  <button
                    onClick={() => setDownloadView(true)}
                    className="flex w-full items-center justify-center gap-2 rounded-2xl bg-secondary px-4 py-2.5 text-sm font-semibold text-secondary-foreground"
                  >
                    <Download size={14} /> Use as-is
                  </button>
                </DialogFooter>
              </div>
            ) : (
              <div className="mt-4 rounded-2xl bg-secondary/50 p-3 ring-1 ring-border/60 text-center">
                <p className="text-[13px] font-medium text-foreground/90">Saved for you.</p>
                <p className="mt-0.5 text-[12px] text-muted-foreground">Use your browser's Print → Save as PDF to keep a copy.</p>
                <button
                  onClick={() => window.print()}
                  className="mt-3 inline-flex items-center gap-2 rounded-full bg-primary px-4 py-2 text-[12.5px] font-semibold text-primary-foreground"
                >
                  <Download size={13} /> Print / save PDF
                </button>
              </div>
            )}
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}

/* ---------------- prevention risk check ---------------- */

function RiskCheck({ slug }: { slug: string }) {
  const profile = RISK[slug];
  const factors = profile.factors;
  const [answers, setAnswers] = useState<Record<string, number>>({});
  const [submitted, setSubmitted] = useState(false);

  const answeredAll = factors.every((f) => answers[f.id] !== undefined);
  const total = Object.values(answers).reduce((a, b) => a + b, 0);
  const max = maxScore(factors);
  const band = riskBand(total, max);
  const meta = BAND_META[band];
  const top = topContributors(factors, answers);

  if (submitted) {
    return (
      <div className="mt-4 rounded-3xl bg-card p-4 shadow-[var(--shadow-soft)] ring-1 ring-border/60">
        <div className="flex items-center gap-2">
          <ShieldCheck size={16} className="text-primary" />
          <p className="font-display text-[14px] font-semibold text-foreground/90">Your risk check</p>
        </div>
        <p className={`mt-3 text-[15px] font-bold ${meta.tone}`}>{meta.label}</p>
        <p className="mt-1 text-[12.5px] leading-snug text-foreground/80">{meta.horizon}</p>
        {top.length > 0 && (
          <div className="mt-3">
            <p className="text-[11px] font-semibold uppercase tracking-wide text-foreground/70">These move your risk the most</p>
            <ul className="mt-1 space-y-1">
              {top.map((f) => (
                <li key={f.id} className="flex items-start gap-1.5 text-[12.5px] text-foreground/85">
                  <span className="text-primary">→</span> {factorHabit(f)}
                </li>
              ))}
            </ul>
          </div>
        )}
        <button
          onClick={() => { setSubmitted(false); setAnswers({}); }}
          className="mt-3 inline-flex items-center gap-1.5 rounded-full bg-secondary px-3 py-1.5 text-[12px] font-medium text-secondary-foreground"
        >
          <RefreshCw size={12} /> Retake
        </button>
      </div>
    );
  }

  return (
    <div className="mt-4 rounded-3xl bg-card p-4 shadow-[var(--shadow-soft)] ring-1 ring-border/60">
      <div className="flex items-center gap-2">
        <ShieldCheck size={16} className="text-primary" />
        <p className="font-display text-[14px] font-semibold text-foreground/90">Risk check</p>
      </div>
      <p className="mt-1 text-[12px] text-muted-foreground">{profile.note}</p>

      <div className="mt-3 space-y-3">
        {factors.map((f) => (
          <div key={f.id}>
            <p className="text-[12.5px] font-medium text-foreground/85">{f.question}</p>
            <div className="mt-1.5 flex flex-wrap gap-1.5">
              {f.options.map((o) => (
                <button
                  key={o.label}
                  onClick={() => setAnswers((a) => ({ ...a, [f.id]: o.score }))}
                  className={`rounded-full px-3 py-1.5 text-[12px] font-medium ring-1 transition ${
                    answers[f.id] === o.score
                      ? "bg-primary text-primary-foreground ring-primary"
                      : "bg-background/70 text-foreground/80 ring-border/60 hover:bg-accent/50"
                  }`}
                >
                  {o.label}
                </button>
              ))}
            </div>
          </div>
        ))}
      </div>

      <button
        disabled={!answeredAll}
        onClick={() => setSubmitted(true)}
        className="mt-4 flex w-full items-center justify-center gap-2 rounded-2xl bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground disabled:opacity-40"
      >
        See my risk
      </button>
    </div>
  );
}

// Turn a scored risk factor into an actionable habit line.
function factorHabit(f: RiskFactor): string {
  const map: Record<string, string> = {
    family: "Family history is fixed — but it just means start prevention earlier.",
    activity: "Move more — aim for a daily walk and 2 strength sessions a week.",
    sleep: "Protect 7–8 hrs of sleep on a fixed schedule.",
    stress: "Add a daily 10-min breathing or meditation break.",
    weight: "Trim toward a healthy weight — even 5% helps a lot.",
    sugar: "Cut sugary drinks and refined carbs to a couple of times a week.",
    salt: "Reduce packaged and salty food — cook with measured salt.",
    smoking: "Quitting tobacco is the single biggest risk-reducer here.",
    age: "Age is a nudge to get regular screening — book a check-up.",
    screens: "Cap late-night screens; take breaks through the day.",
    hydration: "Drink 2.5–3 L of water spread across the day.",
    painkillers: "Avoid routine painkillers — ask a doctor for alternatives.",
    bpsugar: "Keep BP and sugar in range — they drive this risk hard.",
    airquality: "Reduce dust/smoke exposure; mask on high-pollution days.",
    colds: "Build immunity — steam, tulsi, and rest at the first sign.",
    alcohol: "Cut alcohol — it's a leading reversible factor here.",
    energy: "Track fatigue/cold signs and get a blood test if persistent.",
    stiffness: "Daily mobility work keeps joints supple.",
    sitting: "Break up long sitting every 45 minutes.",
    stairs: "Strengthen the muscles around the joint.",
    breath: "Build lung capacity with daily pranayam.",
    caffeine: "No caffeine after 2 PM.",
    schedule: "Fix your bed and wake times, even on weekends.",
    dinner: "Eat dinner before 8 PM.",
    meals: "Never skip meals — keep them regular.",
    mealtimes: "Eat at consistent times daily.",
    processed: "Cut packaged and outside food.",
    symptoms: "Don't ignore early symptoms — act on them now.",
  };
  return map[f.id] ?? "Work on this habit consistently.";
}
