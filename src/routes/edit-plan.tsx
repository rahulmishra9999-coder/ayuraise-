import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { ArrowLeft, ChevronRight, X, Plus } from "lucide-react";
import { BottomNav } from "@/components/BottomNav";
import { PLAN_TOOLS, getPlanTools, setPlanTools } from "@/lib/personalPlan";

export const Route = createFileRoute("/edit-plan")({
  head: () => ({ meta: [{ title: "Adjust my plan · AyuRaise" }] }),
  component: EditPlanPage,
});

function EditPlanPage() {
  const navigate = useNavigate();
  const [view, setView] = useState<"menu" | "tools" | "edit">("menu");
  const [tools, setTools] = useState<string[]>([]);
  useEffect(() => { setTools(getPlanTools()); }, []);

  const toggle = (id: string, on: boolean) => {
    const next = on ? [...tools, id] : tools.filter((x) => x !== id);
    setTools(next);
    setPlanTools(next);
    if (on && (id === "yoga" || id === "exercise" || id === "diet")) navigate({ to: "/create", search: { tool: id } });
  };

  // open one part's own flow: yoga/exercise/diet run the Create tool flow; the rest open their section
  const openFlow = (id: string) => {
    if (id === "yoga" || id === "exercise" || id === "diet") { navigate({ to: "/create", search: { tool: id } }); return; }
    if (id === "detox") navigate({ to: "/section/detox" });
    else if (id === "meditation") navigate({ to: "/section/meditation" });
    else if (id === "fasting") navigate({ to: "/section/fasting" });
    else navigate({ to: "/section/disease" });
  };

  const added = PLAN_TOOLS.filter((t) => tools.includes(t.id));
  const notAdded = PLAN_TOOLS.filter((t) => !tools.includes(t.id));
  const title = view === "tools" ? "Add or remove parts" : view === "edit" ? "Edit a part" : "Adjust my plan";
  const sub = view === "tools" ? "Switch parts on or off" : view === "edit" ? "Pick a part to change" : "What would you like to change?";

  return (
    <div className="min-h-svh pb-28" style={{ background: "var(--gradient-hero)" }}>
      <div className="relative overflow-hidden px-4 pb-5 pt-[max(1rem,env(safe-area-inset-top))]" style={{ background: "var(--gradient-night)" }}>
        <div className="relative flex items-center gap-2.5">
          <button onClick={() => (view !== "menu" ? setView("menu") : navigate({ to: "/home" }))} className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-white/15 text-primary-foreground"><ArrowLeft size={15} /></button>
          <div className="min-w-0">
            <h1 className="truncate font-display text-[19px] font-extrabold leading-tight text-primary-foreground">{title}</h1>
            <p className="truncate text-[11.5px] text-primary-foreground/80">{sub}</p>
          </div>
        </div>
      </div>

      {view === "menu" && (
        <div className="mx-auto max-w-xl space-y-2.5 px-4 pt-4">
          <Link to="/lifestyle" search={{ mode: "unified" }} className="flex items-start gap-2.5 rounded-2xl bg-card p-3.5 ring-1 ring-border/60 active:scale-[0.99]">
            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl text-[18px]" style={{ background: "var(--gradient-violet)" }}>🎯</span>
            <div className="min-w-0 flex-1">
              <p className="text-[13px] font-bold text-foreground">Change my goals</p>
              <p className="text-[10.5px] leading-snug text-muted-foreground">Add or swap what your plan focuses on — conditions, organs, fitness.</p>
            </div>
            <ChevronRight size={15} className="mt-0.5 shrink-0 text-muted-foreground" />
          </Link>

          <button onClick={() => setView("tools")} className="flex w-full items-start gap-2.5 rounded-2xl bg-card p-3.5 text-left ring-1 ring-border/60 active:scale-[0.99]">
            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl text-[18px]" style={{ background: "var(--gradient-leaf)" }}>➕</span>
            <div className="min-w-0 flex-1">
              <p className="text-[13px] font-bold text-foreground">Add or remove a part</p>
              <p className="text-[10.5px] leading-snug text-muted-foreground">Turn parts of your plan on or off — yoga, diet, detox, fasting & more.</p>
            </div>
            <ChevronRight size={15} className="mt-0.5 shrink-0 text-muted-foreground" />
          </button>

          <button onClick={() => setView("edit")} className="flex w-full items-start gap-2.5 rounded-2xl bg-card p-3.5 text-left ring-1 ring-border/60 active:scale-[0.99]">
            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl text-[18px]" style={{ background: "var(--gradient-gold)" }}>✏️</span>
            <div className="min-w-0 flex-1">
              <p className="text-[13px] font-bold text-foreground">Change something inside a part</p>
              <p className="text-[10.5px] leading-snug text-muted-foreground">Tweak one part — open just that part's own questions.</p>
            </div>
            <ChevronRight size={15} className="mt-0.5 shrink-0 text-muted-foreground" />
          </button>
        </div>
      )}

      {view === "tools" && (
        <div className="mx-auto max-w-xl space-y-4 px-4 pt-4">
          <div>
            <p className="mb-1.5 px-1 text-[11px] font-bold uppercase tracking-wide text-muted-foreground">In your plan</p>
            <div className="space-y-2">
              {added.map((t) => (
                <div key={t.id} className="flex items-center gap-2.5 rounded-2xl bg-card p-3 ring-1 ring-border/60">
                  <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-accent/50 text-[18px]">{t.emoji}</span>
                  <span className="min-w-0 flex-1 truncate text-[12.5px] font-bold text-foreground">{t.label}</span>
                  <button onClick={() => toggle(t.id, false)} aria-label={`Remove ${t.label}`} className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-secondary text-foreground/70 active:opacity-70"><X size={14} /></button>
                </div>
              ))}
              {added.length === 0 && <p className="px-1 text-[11.5px] text-muted-foreground">No parts yet — add some below.</p>}
            </div>
          </div>
          {notAdded.length > 0 && (
            <div>
              <p className="mb-1.5 px-1 text-[11px] font-bold uppercase tracking-wide text-muted-foreground">Add to your plan</p>
              <div className="space-y-2">
                {notAdded.map((t) => (
                  <div key={t.id} className="flex items-center gap-2.5 rounded-2xl bg-card/70 p-3 ring-1 ring-border/60">
                    <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-accent/40 text-[18px]">{t.emoji}</span>
                    <span className="min-w-0 flex-1 truncate text-[12.5px] font-bold text-foreground/75">{t.label}</span>
                    <button onClick={() => toggle(t.id, true)} aria-label={`Add ${t.label}`} className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground active:opacity-70"><Plus size={14} /></button>
                  </div>
                ))}
              </div>
            </div>
          )}
          <Link to="/myplan/$id" params={{ id: "me" }} className="block rounded-2xl bg-primary py-2.5 text-center text-[12.5px] font-bold text-primary-foreground">Done</Link>
        </div>
      )}

      {view === "edit" && (
        <div className="mx-auto max-w-xl space-y-2 px-4 pt-4">
          <p className="px-1 pb-1 text-[11.5px] text-muted-foreground">Pick a part to open its own questions.</p>
          {added.map((t) => (
            <button key={t.id} onClick={() => openFlow(t.id)} className="flex w-full items-center gap-2.5 rounded-2xl bg-card p-3 text-left ring-1 ring-border/60 active:scale-[0.99]">
              <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-accent/50 text-[18px]">{t.emoji}</span>
              <span className="min-w-0 flex-1 truncate text-[12.5px] font-bold text-foreground">{t.label}</span>
              <ChevronRight size={15} className="shrink-0 text-muted-foreground" />
            </button>
          ))}
          {added.length === 0 && <p className="px-1 text-[11.5px] text-muted-foreground">No parts in your plan yet.</p>}
        </div>
      )}
      <BottomNav />
    </div>
  );
}
