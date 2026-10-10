import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { ArrowLeft } from "lucide-react";
import { BottomNav } from "@/components/BottomNav";
import { AyuBot } from "@/components/AyuBot";
import { loadYogaPlans, type YogaPlan } from "@/lib/yoga-plan";
import { ALL_GOALS } from "@/lib/goals";
import { resolvePlan, conditionMeta } from "@/lib/clusters";

export const Route = createFileRoute("/myplan/$id")({ component: MyPlanPage });

const IV_LABEL: Record<string, string> = { yoga: "🧘 Yoga", exercise: "🏋️ Exercise", diet: "🥗 Diet" };

function MyPlanPage() {
  const { id } = Route.useParams();
  const [plan, setPlan] = useState<YogaPlan | null | undefined>(undefined); // undefined = loading
  const [profile, setProfile] = useState<Record<string, unknown> | null>(null);
  useEffect(() => {
    setPlan(loadYogaPlans().find((p) => p.id === id) ?? null);
    try { const raw = localStorage.getItem("ayuraise.lifestyle"); setProfile(raw ? JSON.parse(raw) : null); } catch { /* ignore */ }
  }, [id]);

  if (plan === undefined) return <div className="flex min-h-svh items-center justify-center text-[13px] text-muted-foreground">Loading…</div>;
  if (plan === null) {
    return (
      <div className="flex min-h-svh flex-col items-center justify-center gap-3 p-8 text-center">
        <p className="text-[14px] font-semibold text-foreground">Plan not found</p>
        <Link to="/home" className="rounded-full bg-primary px-4 py-2 text-[12.5px] font-bold text-primary-foreground">Back home</Link>
      </div>
    );
  }

  const w = (plan.wizard ?? {}) as Record<string, unknown>;
  const goalIds = (w.goalIds as string[]) ?? [];
  const ivs = (w.ivs as string[]) ?? [];

  // The plan engine. Focus/diet come from the plan's chosen goals; the profile's full
  // conditions + context (thyroid direction, frail) make it safe for the whole person.
  const conds = (profile?.conditions as string[]) ?? [];
  const cd = (profile?.condDetail as Record<string, Record<string, string>>) ?? {};
  const kind = cd.thyroid?.kind;
  const kg = Number(profile?.kg); const cm = Number(profile?.cm);
  const bmi = kg && cm ? kg / ((cm / 100) ** 2) : 0;
  // assessed signals from the Mind & Sleep steps → light auto-layers
  const stressed = profile?.mood === "Low" || profile?.anxiety === "Often" || profile?.unwind === "Rarely";
  const sleepH = Number(profile?.sleep); const waking = Number(profile?.waking);
  const poorSleep = (sleepH > 0 && sleepH < 6.5) || (waking >= 4);
  const ctx = {
    thyroid: kind === "Hypo" ? "hypo" as const : kind === "Hyper" ? "hyper" as const : undefined,
    frail: bmi > 0 && bmi < 18.5,
    stressed,
    poorSleep,
  };
  const rp = resolvePlan(goalIds, ctx, conds, cd);
  const yogaHas = rp.yoga.am.length + rp.yoga.pm.length + rp.yoga.anytime.length > 0;

  return (
    <div className="min-h-svh pb-28" style={{ background: "var(--gradient-hero)" }}>
      <div className="relative overflow-hidden px-4 pb-5 pt-[max(1rem,env(safe-area-inset-top))]" style={{ background: "var(--gradient-night)" }}>
        <div className="absolute -right-16 -top-16 h-40 w-40 rounded-full bg-amber-400/20 blur-3xl" />
        <div className="relative flex items-center gap-2.5">
          <Link to="/home" className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-white/15 text-primary-foreground"><ArrowLeft size={15} /></Link>
          <div className="min-w-0">
            <h1 className="truncate font-display text-[19px] font-extrabold leading-tight text-primary-foreground">{plan.name ?? plan.primary}</h1>
            <p className="truncate text-[11.5px] text-primary-foreground/80">Your plan</p>
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-xl space-y-4 px-4 pt-4">
        {/* what's included */}
        <section className="rounded-2xl bg-card p-3 ring-1 ring-border/60">
          <p className="text-[11px] font-bold uppercase tracking-wide text-muted-foreground">What's in your plan</p>
          <div className="mt-1.5 flex flex-wrap gap-1.5">
            {(ivs.length ? ivs : ["yoga"]).map((k) => <span key={k} className="rounded-full bg-secondary px-2.5 py-1 text-[11.5px] font-semibold text-foreground/85">{IV_LABEL[k] ?? k}</span>)}
            {goalIds.map((g) => <span key={g} className="rounded-full bg-accent/50 px-2.5 py-1 text-[11.5px] font-semibold text-foreground/85">{ALL_GOALS[g]?.emoji ?? "🎯"} {ALL_GOALS[g]?.label ?? conditionMeta(g)?.label ?? g}</span>)}
          </div>
          <p className="mt-2 text-[11.5px] text-muted-foreground">{plan.variant ?? `${plan.level} · ${plan.duration} min`}</p>
        </section>

        {/* Conflict warnings — a chosen goal clashing with a condition/state */}
        {rp.conflicts.map((cf, i) => (
          <div key={i} className={`rounded-2xl p-3 text-[11.5px] leading-snug ring-1 ${cf.action === "block" ? "bg-red-50 text-red-800 ring-red-200 dark:bg-red-900/20 dark:text-red-300 dark:ring-red-800/60" : "bg-amber-50 text-amber-800 ring-amber-200 dark:bg-amber-900/20 dark:text-amber-300 dark:ring-amber-800/60"}`}>
            <b>{cf.action === "block" ? "Heads up — " : "Note — "}</b>{cf.note}
          </div>
        ))}

        {/* Your focus — Tier 1 clusters (diet + herbs) */}
        {rp.focus.map((f) => (
          <section key={f.cluster.id} className="overflow-hidden rounded-2xl bg-card ring-1 ring-border/60">
            <div className="px-3.5 py-2.5 text-primary-foreground" style={{ background: "var(--gradient-leaf)" }}>
              <p className="font-display text-[14px] font-bold">{f.cluster.emoji} {f.cluster.label}</p>
            </div>
            <div className="space-y-2 p-3.5">
              {f.conditionIds.length > 1 && (() => {
                const cp = (profile?.clusterPrimary as Record<string, string>) ?? {};
                const primary = cp[f.cluster.id] && f.conditionIds.includes(cp[f.cluster.id]) ? cp[f.cluster.id] : f.primaryId;
                return <p className="text-[10.5px] text-muted-foreground">Main focus: <b className="text-foreground">{conditionMeta(primary)?.label ?? primary}</b></p>;
              })()}
              <p className="text-[11.5px] leading-relaxed text-muted-foreground">{f.diet}</p>
              {f.dietMods.length > 0 && <ul className="list-disc space-y-1 pl-4 text-[12px] text-foreground/90">{f.dietMods.map((d, i) => <li key={i}>{d}</li>)}</ul>}
              {f.herbs.length > 0 && (
                <div>
                  <p className="mt-1 text-[11px] font-bold uppercase tracking-wide text-muted-foreground">Herbs &amp; remedies</p>
                  <div className="mt-1 flex flex-wrap gap-1.5">{f.herbs.map((h, i) => <span key={i} className="rounded-full bg-secondary px-2.5 py-1 text-[11px] font-semibold text-foreground/85">{h}</span>)}</div>
                </div>
              )}
            </div>
          </section>
        ))}

        {/* Care layers — Tier 2 (joint/spine) ride along */}
        {rp.careLayers.map((f) => (
          <section key={f.cluster.id} className="rounded-2xl bg-card/70 p-3.5 ring-1 ring-border/60">
            <p className="text-[12.5px] font-bold text-foreground">{f.cluster.emoji} {f.cluster.label}</p>
            <p className="mt-1 text-[11.5px] leading-relaxed text-muted-foreground">Included as a safe care-layer alongside your main focus — {f.diet.toLowerCase()}</p>
            {f.herbs.length > 0 && <div className="mt-1.5 flex flex-wrap gap-1.5">{f.herbs.map((h, i) => <span key={i} className="rounded-full bg-secondary px-2.5 py-1 text-[11px] font-semibold text-foreground/85">{h}</span>)}</div>}
          </section>
        ))}

        {/* Auto support layers — assessed stress / sleep (light, always-on) */}
        {rp.layers.map((L) => (
          <section key={L.id} className="rounded-2xl bg-card/70 p-3.5 ring-1 ring-border/60">
            <p className="text-[12.5px] font-bold text-foreground">🌿 {L.label}</p>
            <p className="mt-0.5 text-[10.5px] text-muted-foreground">{L.note}</p>
            <ul className="mt-1.5 list-disc space-y-1 pl-4 text-[12px] text-foreground/90">{L.practices.map((p, i) => <li key={i}>{p}</li>)}</ul>
            {L.herbs.length > 0 && <div className="mt-1.5 flex flex-wrap gap-1.5">{L.herbs.map((h, i) => <span key={i} className="rounded-full bg-secondary px-2.5 py-1 text-[11px] font-semibold text-foreground/85">{h}</span>)}</div>}
          </section>
        ))}

        {/* Your yoga — contraindication-filtered */}
        {yogaHas && (
          <section className="overflow-hidden rounded-2xl bg-card ring-1 ring-border/60">
            <div className="px-3.5 py-2.5 text-primary-foreground" style={{ background: "var(--gradient-violet)" }}>
              <p className="font-display text-[14px] font-bold">🧘 Your yoga &amp; breathwork</p>
            </div>
            <div className="space-y-1.5 p-3.5 text-[12px] text-foreground/90">
              {rp.yoga.am.length > 0 && <p><b className="text-foreground">Morning:</b> {rp.yoga.am.join(" · ")}</p>}
              {rp.yoga.pm.length > 0 && <p><b className="text-foreground">Evening:</b> {rp.yoga.pm.join(" · ")}</p>}
              {rp.yoga.anytime.length > 0 && <p><b className="text-foreground">Anytime:</b> {rp.yoga.anytime.join(" · ")}</p>}
              <p className="pt-0.5 text-[10.5px] text-muted-foreground">Kept safe for your conditions — poses that aren't suitable for you have been left out.</p>
            </div>
          </section>
        )}

        {/* Detox */}
        {rp.detox.protocols.map((d) => (
          <section key={d.id} className="overflow-hidden rounded-2xl bg-card ring-1 ring-border/60">
            <div className="px-3.5 py-2.5 text-primary-foreground" style={{ background: "var(--gradient-leaf)" }}>
              <p className="font-display text-[14px] font-bold">✨ Detox — {d.label}</p>
            </div>
            <div className="p-3.5">
              <ul className="list-disc space-y-1 pl-4 text-[12px] text-foreground/90">{d.home.map((h, i) => <li key={i}>{h}</li>)}</ul>
              <p className="mt-2 rounded-xl bg-amber-50 px-3 py-2 text-[10.5px] leading-snug text-amber-800 ring-1 ring-amber-200 dark:bg-amber-900/20 dark:text-amber-300 dark:ring-amber-800/60">Do this at home when you feel ready. Deeper cleanses (<b>Panchakarma</b>) are best done at an Ayurveda centre.</p>
            </div>
          </section>
        ))}

        {/* Concerns — hair, etc. (companion layers) */}
        {rp.concerns.map((cId) => {
          const m = conditionMeta(cId);
          if (!m) return null;
          return (
            <section key={cId} className="rounded-2xl bg-card/70 p-3.5 ring-1 ring-border/60">
              <p className="text-[12.5px] font-bold text-foreground">💛 {m.label}</p>
              {m.mods?.diet && <ul className="mt-1 list-disc space-y-1 pl-4 text-[12px] text-foreground/90">{m.mods.diet.map((d, i) => <li key={i}>{d}</li>)}</ul>}
              {m.mods?.herbs && <div className="mt-1.5 flex flex-wrap gap-1.5">{m.mods.herbs.map((h, i) => <span key={i} className="rounded-full bg-secondary px-2.5 py-1 text-[11px] font-semibold text-foreground/85">{h}</span>)}</div>}
            </section>
          );
        })}

        {/* Good to know — flips + safety lines */}
        {(rp.safety.length > 0 || rp.flips.length > 0) && (
          <section className="rounded-2xl bg-card/70 p-3.5 ring-1 ring-border/60">
            <p className="text-[11px] font-bold uppercase tracking-wide text-muted-foreground">Good to know</p>
            <ul className="mt-1.5 list-disc space-y-1 pl-4 text-[11.5px] text-foreground/85">
              {rp.flips.map((fl) => <li key={fl.id}>{fl.kind === "hypo-hyper" ? "We'll fine-tune this once you confirm hypo vs hyper." : "During a flare, keep everything gentle."}</li>)}
              {rp.safety.map((s, i) => <li key={i}>{s}</li>)}
            </ul>
          </section>
        )}

        <p className="px-1 text-[10.5px] leading-snug text-muted-foreground">This plan supports your wellness alongside medical care — it doesn't replace your doctor. See a doctor for diagnosis and treatment, and seek urgent help for any severe or sudden symptoms.</p>

        <div className="flex gap-2">
          <Link to="/create" search={{ edit: plan.id }} className="flex-1 rounded-2xl bg-secondary py-2.5 text-center text-[12.5px] font-bold text-foreground ring-1 ring-border/60">Edit plan</Link>
          <Link to="/home" className="flex-1 rounded-2xl bg-primary py-2.5 text-center text-[12.5px] font-bold text-primary-foreground">Done</Link>
        </div>
      </div>
      <AyuBot />
      <BottomNav />
    </div>
  );
}
