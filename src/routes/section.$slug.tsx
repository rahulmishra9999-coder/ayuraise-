import { createFileRoute, Link, notFound, useRouter } from "@tanstack/react-router";
import { getSection } from "@/lib/sections";
import { BottomNav } from "@/components/BottomNav";
import { ArrowLeft, Check, Sparkles } from "lucide-react";

export const Route = createFileRoute("/section/$slug")({
  loader: ({ params }) => {
    const section = getSection(params.slug);
    if (!section) throw notFound();
    return { slug: section.slug };
  },
  head: ({ params }) => {
    const section = params ? getSection(params.slug) : undefined;
    return {
      meta: section
        ? [
            { title: `${section.title} · AyuRaise` },
            { name: "description", content: section.blurb },
          ]
        : [],
    };
  },
  component: SectionPage,
  notFoundComponent: () => (
    <div className="flex min-h-svh items-center justify-center p-6 text-center">
      <div>
        <h1 className="font-display text-2xl">Section not found</h1>
        <Link to="/home" className="mt-3 inline-block text-primary underline">Back to Health</Link>
      </div>
    </div>
  ),
  errorComponent: ({ reset }) => {
    const router = useRouter();
    return (
      <div className="flex min-h-svh items-center justify-center p-6 text-center">
        <div>
          <h1 className="font-display text-2xl">Something went wrong</h1>
          <button
            onClick={() => { router.invalidate(); reset(); }}
            className="mt-3 rounded-full bg-primary px-4 py-2 text-sm text-primary-foreground"
          >Try again</button>
        </div>
      </div>
    );
  },
});

function SectionPage() {
  const { slug } = Route.useLoaderData();
  const section = getSection(slug)!;
  const Icon = section.icon;


  return (
    <div className="min-h-svh pb-28" style={{ background: "var(--gradient-hero)" }}>
      {/* Hero */}
      <div className="relative px-5 pb-10 pt-[max(1rem,env(safe-area-inset-top))]" style={{ background: section.gradient }}>
        <Link
          to="/home"
          className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-card/40 text-primary-foreground backdrop-blur-sm"
        >
          <ArrowLeft size={18} />
        </Link>
        <div className="mt-8 flex items-center gap-4">
          <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-card/30 backdrop-blur-sm">
            <Icon size={32} className="text-primary-foreground" strokeWidth={1.7} />
          </div>
          <div>
            <p className="text-xs uppercase tracking-[0.2em] text-primary-foreground/70">{section.short}</p>
            <h1 className="font-display text-3xl font-semibold text-primary-foreground">{section.title}</h1>
          </div>
        </div>
        <p className="mt-5 max-w-md text-[15px] leading-relaxed text-primary-foreground/90">{section.blurb}</p>
      </div>

      <div className="mx-auto -mt-6 max-w-xl px-5">
        <div className="rounded-3xl bg-card p-5 shadow-[var(--shadow-soft)] ring-1 ring-border/60">
          <h2 className="font-display text-lg font-semibold">What's inside</h2>
          <ul className="mt-3 space-y-2.5">
            {section.highlights.map((h: string) => (
              <li key={h} className="flex items-start gap-3 text-sm text-foreground/85">
                <span className="mt-0.5 flex h-5 w-5 items-center justify-center rounded-full bg-accent/40 text-primary">
                  <Check size={12} strokeWidth={3} />
                </span>
                {h}
              </li>
            ))}
          </ul>
          {section.slug === "disease" ? (
            <Link
              to="/combined-plan"
              search={{ goal: "disease" as const }}
              className="mt-5 flex items-center justify-center gap-2 rounded-2xl bg-primary px-5 py-3 text-sm font-semibold text-primary-foreground shadow-[var(--shadow-glow)] transition-transform active:scale-[0.98]"
            >
              <Sparkles size={16} /> Build my disease management plan
            </Link>
          ) : (
            <Link
              to="/coach"
              className="mt-5 flex items-center justify-center gap-2 rounded-2xl bg-primary px-5 py-3 text-sm font-semibold text-primary-foreground shadow-[var(--shadow-glow)] transition-transform active:scale-[0.98]"
            >
              <Sparkles size={16} /> Build my {section.short.toLowerCase()} plan
            </Link>
          )}
        </div>

        <div className="mt-5 rounded-3xl bg-card/70 p-5 shadow-[var(--shadow-soft)] ring-1 ring-border/60">
          <h3 className="font-display text-base font-semibold">How AyuRaise personalizes this</h3>
          <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
            Answer a short prakriti quiz and share your current health concerns — your plan adapts to your dosha,
            the current season (ritucharya), and your daily progress.
          </p>
        </div>
      </div>

      <BottomNav />
    </div>
  );
}
