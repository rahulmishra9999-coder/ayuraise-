import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { ArrowLeft, FileX2 } from "lucide-react";
import { BottomNav } from "@/components/BottomNav";
import { loadPersonalPlan } from "@/lib/personalPlan";

export const Route = createFileRoute("/my-plans")({
  head: () => ({
    meta: [
      { title: "My plan · AyuRaise" },
      { name: "description", content: "Your one personalized plan — every tool in one place." },
    ],
  }),
  component: MyPlansPage,
});

// "My Plans" = the ONE personalized plan, shown with all its tools. If it exists we open it
// directly (/myplan/me); section favourites & customized templates live under their sections,
// not here.
function MyPlansPage() {
  const navigate = useNavigate();
  const [ready, setReady] = useState(false);

  useEffect(() => {
    if (loadPersonalPlan()) navigate({ to: "/myplan/$id", params: { id: "me" }, replace: true });
    else setReady(true);
  }, [navigate]);

  if (!ready) return <div className="flex min-h-svh items-center justify-center text-[13px] text-muted-foreground">Loading…</div>;

  return (
    <div className="min-h-svh pb-28 pt-[max(1.5rem,env(safe-area-inset-top))]" style={{ background: "var(--gradient-hero)" }}>
      <div className="mx-auto max-w-xl px-5">
        <header className="flex items-center gap-3">
          <Link to="/home" className="flex h-9 w-9 items-center justify-center rounded-full bg-card/70 ring-1 ring-border">
            <ArrowLeft size={16} />
          </Link>
          <h1 className="font-display text-2xl font-semibold text-foreground">My plan</h1>
        </header>

        <div className="mt-8 rounded-3xl bg-card p-6 text-center ring-1 ring-border/60">
          <FileX2 size={28} className="mx-auto text-muted-foreground" />
          <p className="mt-3 font-display text-base font-semibold text-foreground">No personalized plan yet</p>
          <p className="mt-1 text-[12px] text-muted-foreground">
            Create one and your yoga, diet, exercise, detox, fasting, herbs and more all live here together.
          </p>
          <Link
            to="/lifestyle"
            search={{ start: "conditions" }}
            className="mt-4 inline-flex items-center gap-2 rounded-xl bg-primary px-4 py-2 text-xs font-semibold text-primary-foreground"
          >
            Create my personalized plan
          </Link>
        </div>
      </div>

      <BottomNav />
    </div>
  );
}
