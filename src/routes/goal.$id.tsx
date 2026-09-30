import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { ArrowLeft, ChevronRight } from "lucide-react";
import { BottomNav } from "@/components/BottomNav";
import { getGoal, AREA_META } from "@/lib/goals";

export const Route = createFileRoute("/goal/$id")({
  component: GoalHub,
});

const LEVELS = ["New to this", "Some experience", "Advanced"];
const MINUTES = [10, 15, 20, 30];
/** Groups that need a doctor-clearance acknowledgement before showing plans. */
const MEDICAL_GROUPS = new Set(["conditions", "organs", "womens"]);

function GoalHub() {
  const { id } = Route.useParams();
  const goal = getGoal(id);

  const [level, setLevel] = useState<string | null>(null);
  const [minutes, setMinutes] = useState<number | null>(null);
  const [cleared, setCleared] = useState(false);
  const [ready, setReady] = useState(false);

  if (!goal) {
    return (
      <div className="flex min-h-svh flex-col items-center justify-center gap-3 p-8 text-center">
        <p className="text-[14px] font-semibold text-foreground">Goal not found</p>
        <Link to="/home" className="rounded-full bg-primary px-4 py-2 text-[12.5px] font-bold text-primary-foreground">Back home</Link>
      </div>
    );
  }

  const medical = MEDICAL_GROUPS.has(goal.groupId);
  const canContinue = !!level && !!minutes && (!medical || cleared);
  const chip = (on: boolean) => `rounded-full px-3.5 py-2 text-[12px] font-semibold transition ${on ? "bg-primary text-primary-foreground" : "bg-secondary text-foreground/75"}`;

  return (
    <div className="min-h-svh pb-28" style={{ background: "var(--gradient-hero)" }}>
      <div className="relative overflow-hidden px-4 pb-5 pt-[max(1rem,env(safe-area-inset-top))]" style={{ background: "var(--gradient-night)" }}>
        <div className="absolute -right-16 -top-16 h-40 w-40 rounded-full bg-amber-400/20 blur-3xl" />
        <div className="relative flex items-center gap-2.5">
          <Link to="/home" className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-white/15 text-primary-foreground"><ArrowLeft size={15} /></Link>
          <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-white/15 text-2xl">{goal.emoji}</span>
          <div className="min-w-0">
            <h1 className="truncate font-display text-[19px] font-extrabold leading-tight text-primary-foreground">{goal.label}</h1>
            <p className="truncate text-[11.5px] text-primary-foreground/80">{goal.group}</p>
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-xl px-4 pt-4">
        {!ready ? (
          /* ---- A few relevant questions before we show the plans ---- */
          <div className="space-y-4">
            <p className="px-1 text-[12.5px] leading-snug text-muted-foreground">A couple of quick questions so we can show you the right plans for <span className="font-semibold text-foreground">{goal.label}</span>.</p>

            <div>
              <p className="mb-1.5 px-1 text-[11px] font-bold uppercase tracking-wide text-muted-foreground">Where are you right now?</p>
              <div className="flex flex-wrap gap-1.5">
                {LEVELS.map((l) => <button key={l} onClick={() => setLevel(l)} className={chip(level === l)}>{l}</button>)}
              </div>
            </div>

            <div>
              <p className="mb-1.5 px-1 text-[11px] font-bold uppercase tracking-wide text-muted-foreground">How long each day?</p>
              <div className="flex flex-wrap gap-1.5">
                {MINUTES.map((m) => <button key={m} onClick={() => setMinutes(m)} className={chip(minutes === m)}>{m} min</button>)}
              </div>
            </div>

            {medical && (
              <button onClick={() => setCleared((c) => !c)} className={`flex w-full items-start gap-2.5 rounded-2xl p-3 text-left ring-1 transition ${cleared ? "bg-amber-100 ring-amber-300 dark:bg-amber-900/30 dark:ring-amber-700" : "bg-amber-50 ring-amber-200 dark:bg-amber-900/20 dark:ring-amber-800/60"}`}>
                <span className={`mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded-[5px] text-[10px] font-bold ${cleared ? "bg-amber-500 text-white" : "bg-white ring-1 ring-amber-300 dark:bg-transparent"}`}>{cleared ? "✓" : ""}</span>
                <span className="text-[10.5px] leading-snug text-amber-800 dark:text-amber-300">I understand these are <b>supportive lifestyle plans, not medical treatment</b>, and I'll check with my doctor for anything to do with my condition.</span>
              </button>
            )}

            <button
              onClick={() => canContinue && setReady(true)}
              disabled={!canContinue}
              className={`w-full rounded-2xl px-4 py-3 text-sm font-bold transition ${canContinue ? "bg-primary text-primary-foreground active:scale-[0.99]" : "bg-secondary text-muted-foreground"}`}>
              Show my plans →
            </button>
          </div>
        ) : (
          /* ---- Plans for this goal ---- */
          <>
            <div className="flex items-center justify-between px-1">
              <p className="text-[11px] font-semibold uppercase tracking-wide text-primary/70">Everything for this goal</p>
              <button onClick={() => setReady(false)} className="text-[10.5px] font-semibold text-muted-foreground active:opacity-70">Edit answers</button>
            </div>
            <div className="mt-2 grid grid-cols-2 gap-2.5">
              {goal.areas.map((area) => {
                const m = AREA_META[area];
                return (
                  <Link key={area} to={m.to} className="tile surface flex items-center gap-2.5 p-3 active:scale-[0.98]">
                    <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-accent/50 text-lg">{m.emoji}</span>
                    <span className="min-w-0 flex-1 truncate font-display text-[12.5px] font-semibold text-foreground">{m.label}</span>
                    <ChevronRight size={15} className="shrink-0 text-muted-foreground" />
                  </Link>
                );
              })}
            </div>

            <Link to="/create" search={{ goal: goal.id }} className="mt-2.5 flex items-center justify-center gap-1.5 rounded-2xl bg-secondary/60 py-3 text-[12.5px] font-bold text-foreground ring-1 ring-border/60 active:scale-[0.99]">
              ✨ Create my own {goal.label} plan
            </Link>

            {medical && (
              <p className="mt-4 rounded-2xl bg-amber-50 px-3 py-2.5 text-[10.5px] leading-snug text-amber-800 ring-1 ring-amber-200 dark:bg-amber-900/20 dark:text-amber-300 dark:ring-amber-800/60">
                Supportive lifestyle guidance — not a substitute for medical care. For any health condition, check with your doctor.
              </p>
            )}
          </>
        )}
      </div>
      <BottomNav />
    </div>
  );
}
