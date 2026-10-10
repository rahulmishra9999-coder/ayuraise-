import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { ArrowLeft, ChevronRight, Sparkles } from "lucide-react";
import { BottomNav } from "@/components/BottomNav";
import { getGoal, AREA_META } from "@/lib/goals";
import { loadPersonalPlan } from "@/lib/personalPlan";

export const Route = createFileRoute("/goal/$id")({
  component: GoalHub,
});

/** Groups that are browse-only — personalize happens through the actual condition instead. */
const BROWSE_ONLY = new Set(["organs"]);
/** Groups that get a doctor-clearance note (shown passively, not as a gate). */
const MEDICAL_GROUPS = new Set(["conditions", "organs", "womens"]);

function GoalHub() {
  const { id } = Route.useParams();
  const navigate = useNavigate();
  const goal = getGoal(id);
  const [popup, setPopup] = useState(false);   // "you already have a plan — add this?"
  const [choose, setChoose] = useState(false); // "make it a focus area" vs "add other things too"

  if (!goal) {
    return (
      <div className="flex min-h-svh flex-col items-center justify-center gap-3 p-8 text-center">
        <p className="text-[14px] font-semibold text-foreground">Goal not found</p>
        <Link to="/home" className="rounded-full bg-primary px-4 py-2 text-[12.5px] font-bold text-primary-foreground">Back home</Link>
      </div>
    );
  }

  const medical = MEDICAL_GROUPS.has(goal.groupId);
  const canPersonalize = !BROWSE_ONLY.has(goal.groupId);
  const openFull = () => navigate({ to: "/lifestyle", search: { mode: "unified", preselect: goal.id } });       // this + the other goal screens
  const openOnly = () => navigate({ to: "/lifestyle", search: { mode: "unified", preselect: goal.id, only: "1" } }); // just this screen + focus
  const personalize = () => { if (loadPersonalPlan()) setPopup(true); else setChoose(true); };

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
        {/* Customize for me — personalize this goal into the one plan (except browse-only organ health) */}
        {canPersonalize && (
          <button onClick={personalize} className="flex w-full items-center gap-2.5 rounded-2xl px-3.5 py-3 text-primary-foreground shadow-[var(--shadow-glow)] active:scale-[0.99]" style={{ background: "var(--gradient-violet)" }}>
            <Sparkles size={16} className="shrink-0" />
            <span className="min-w-0 flex-1 text-left text-[13px] font-bold leading-tight">Customize for me</span>
            <span className="shrink-0 rounded-full bg-white/20 px-2 py-0.5 text-[10px] font-semibold">Add to my plan</span>
          </button>
        )}

        {/* Ready-made plans for this goal — yoga/exercise/diet open their own question flow (blank) */}
        <p className="mt-4 px-1 text-[11px] font-semibold uppercase tracking-wide text-primary/70">Explore &amp; build</p>
        <div className="mt-2 grid grid-cols-2 gap-2.5">
          {goal.areas.map((area) => {
            const m = AREA_META[area];
            const toCreate = area === "yoga" || area === "exercise" || area === "diet";
            const cls = "tile surface flex items-center gap-2.5 p-3 active:scale-[0.98]";
            const inner = (
              <>
                <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-accent/50 text-lg">{m.emoji}</span>
                <span className="min-w-0 flex-1 truncate font-display text-[12.5px] font-semibold text-foreground">{m.label}</span>
                <ChevronRight size={15} className="shrink-0 text-muted-foreground" />
              </>
            );
            return toCreate
              ? <button key={area} onClick={() => navigate({ to: "/create", search: { tool: area } })} className={`${cls} text-left`}>{inner}</button>
              : <Link key={area} to={m.to} className={cls}>{inner}</Link>;
          })}
        </div>

        {medical && (
          <p className="mt-4 rounded-2xl bg-amber-50 px-3 py-2.5 text-[10.5px] leading-snug text-amber-800 ring-1 ring-amber-200 dark:bg-amber-900/20 dark:text-amber-300 dark:ring-amber-800/60">
            Supportive lifestyle guidance — not a substitute for medical care. For any health condition, check with your doctor.
          </p>
        )}
      </div>

      {/* Already-have-a-plan popup */}
      {popup && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/45 p-6 backdrop-blur-sm" onClick={() => setPopup(false)}>
          <div className="w-full max-w-xs rounded-[24px] bg-card p-5 text-center shadow-xl" onClick={(e) => e.stopPropagation()}>
            <span className="text-3xl">🌿</span>
            <p className="mt-2 font-display text-[15px] font-bold text-foreground">You already have a plan</p>
            <p className="mt-1 text-[12px] leading-snug text-muted-foreground">Want to customize it by adding <b className="text-foreground">{goal.label}</b> as well?</p>
            <div className="mt-4 flex gap-2">
              <button onClick={() => setPopup(false)} className="flex-1 rounded-xl bg-secondary py-2.5 text-[12.5px] font-bold text-foreground">No</button>
              <button onClick={openFull} className="flex-1 rounded-xl bg-primary py-2.5 text-[12.5px] font-bold text-primary-foreground">Add it</button>
            </div>
          </div>
        </div>
      )}

      {/* Customize choice (no plan yet): just this as a focus, or build the fuller plan */}
      {choose && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/45 p-6 backdrop-blur-sm" onClick={() => setChoose(false)}>
          <div className="w-full max-w-xs rounded-[24px] bg-card p-5 shadow-xl" onClick={(e) => e.stopPropagation()}>
            <p className="font-display text-[15px] font-bold text-foreground">Customize for {goal.label}</p>
            <button onClick={openOnly} className="mt-3 w-full rounded-2xl bg-card p-3 text-left ring-1 ring-primary/40 active:scale-[0.99]">
              <p className="text-[12.5px] font-bold text-foreground">Make this my focus area</p>
              <p className="mt-0.5 text-[10.5px] leading-snug text-muted-foreground">Just a few quick questions about {goal.label} — nothing else.</p>
            </button>
            <button onClick={openFull} className="mt-2 w-full rounded-2xl bg-card p-3 text-left ring-1 ring-border/60 active:scale-[0.99]">
              <p className="text-[12.5px] font-bold text-foreground">Add other things too</p>
              <p className="mt-0.5 text-[10.5px] leading-snug text-muted-foreground">Also manage a condition, strengthen organs, hair &amp; skin and more.</p>
            </button>
            <button onClick={() => setChoose(false)} className="mt-2 w-full rounded-xl bg-secondary py-2 text-[12px] font-bold text-foreground">Cancel</button>
          </div>
        </div>
      )}

      <BottomNav />
    </div>
  );
}
