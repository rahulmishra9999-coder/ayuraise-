import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { ArrowLeft, FolderOpen, ChevronRight, FileX2 } from "lucide-react";
import { BottomNav } from "@/components/BottomNav";
import { getAllSavedPlans, groupByCategory, type SavedPlan } from "@/lib/savedPlans";

export const Route = createFileRoute("/my-plans")({
  head: () => ({
    meta: [
      { title: "My plans · AyuRaise" },
      { name: "description", content: "All saved plans across sections in one place." },
    ],
  }),
  component: MyPlansPage,
});

function MyPlansPage() {
  const [plans, setPlans] = useState<SavedPlan[]>([]);

  useEffect(() => {
    setPlans(getAllSavedPlans());
  }, []);

  const grouped = groupByCategory(plans);
  const categories = Array.from(grouped.keys());

  return (
    <div className="min-h-svh pb-28 pt-[max(1.5rem,env(safe-area-inset-top))]" style={{ background: "var(--gradient-hero)" }}>
      <div className="mx-auto max-w-xl px-5">
        <header className="flex items-center gap-3">
          <Link to="/home" className="flex h-9 w-9 items-center justify-center rounded-full bg-card/70 ring-1 ring-border">
            <ArrowLeft size={16} />
          </Link>
          <div>
            <p className="flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-[0.18em] text-primary/80">
              <FolderOpen size={12} /> All in one place
            </p>
            <h1 className="font-display text-2xl font-semibold text-foreground">See your plans</h1>
          </div>
        </header>

        <p className="mt-3 text-[13px] text-muted-foreground">
          Every plan you've saved — across diet, fasting, weight, detox, yoga and more.
        </p>

        {plans.length === 0 ? (
          <div className="mt-8 rounded-3xl bg-card p-6 text-center ring-1 ring-border/60">
            <FileX2 size={28} className="mx-auto text-muted-foreground" />
            <p className="mt-3 font-display text-base font-semibold text-foreground">No saved plans yet</p>
            <p className="mt-1 text-[12px] text-muted-foreground">
              Build a plan from any section and save it — it'll show up here.
            </p>
            <Link
              to="/home"
              className="mt-4 inline-flex items-center gap-2 rounded-xl bg-primary px-4 py-2 text-xs font-semibold text-primary-foreground"
            >
              Explore sections
            </Link>
          </div>
        ) : (
          <div className="mt-5 space-y-5">
            {categories.map((cat) => {
              const items = grouped.get(cat)!;
              return (
                <section key={cat}>
                  <div className="flex items-center justify-between px-1">
                    <h2 className="font-display text-base font-semibold text-foreground">{cat}</h2>
                    <span className="text-[11px] font-semibold text-muted-foreground">{items.length}</span>
                  </div>
                  <div className="mt-2 space-y-2">
                    {items.map((p) => (
                      <Link
                        key={p.id}
                        to={p.href}
                        className="flex items-center gap-3 rounded-2xl bg-card p-3 ring-1 ring-border/60"
                      >
                        <div className="flex-1 min-w-0">
                          <p className="truncate text-[13.5px] font-semibold text-foreground">{p.title}</p>
                          <p className="text-[11px] text-muted-foreground">
                            {new Date(p.createdAt).toLocaleDateString()}{p.meta ? ` · ${p.meta}` : ""}
                          </p>
                        </div>
                        <ChevronRight size={16} className="text-muted-foreground" />
                      </Link>
                    ))}
                  </div>
                </section>
              );
            })}
          </div>
        )}
      </div>

      <BottomNav />
    </div>
  );
}
