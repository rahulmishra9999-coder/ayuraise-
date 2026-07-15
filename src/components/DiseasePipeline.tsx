import { useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { ArrowRight, X, Sparkles } from "lucide-react";
import {
  getDiseasePipeline, advanceDiseasePipeline, clearDiseasePipeline,
  PIPELINE_ROUTE, PIPELINE_LABEL, type PipelineStep, type DiseasePipeline,
} from "@/lib/disease-plan";

export function useDiseasePipeline(currentSlug: PipelineStep) {
  const [pipe, setPipe] = useState<DiseasePipeline | null>(null);
  useEffect(() => { setPipe(getDiseasePipeline()); }, []);
  const steps = pipe?.steps ?? [];
  const active = steps.length > 0 && steps[0] === currentSlug;
  const idx = steps.indexOf(currentSlug);
  const next = steps[idx + 1];
  return { active, pipe, idx, total: steps.length, next };
}

export function DiseasePipelineBanner({ currentSlug }: { currentSlug: PipelineStep }) {
  const navigate = useNavigate();
  const { active, pipe, idx, total, next } = useDiseasePipeline(currentSlug);
  if (!active || !pipe) return null;

  const skip = () => {
    advanceDiseasePipeline();
    if (next) navigate({ to: PIPELINE_ROUTE[next] });
    else { clearDiseasePipeline(); navigate({ to: "/section/disease" }); }
  };

  return (
    <div className="mt-3 flex items-center justify-between gap-3 rounded-2xl bg-primary/10 px-3 py-2.5 ring-1 ring-primary/30">
      <div className="flex items-center gap-2 text-xs">
        <Sparkles size={14} className="text-primary" />
        <span className="font-semibold text-primary">{pipe.label} plan</span>
        <span className="text-muted-foreground">· step {idx + 1} of {total} ({PIPELINE_LABEL[currentSlug]})</span>
      </div>
      <button onClick={skip} className="flex items-center gap-1 rounded-full bg-card px-2.5 py-1 text-[11px] font-semibold text-foreground ring-1 ring-border/60">
        Skip <X size={11} />
      </button>
    </div>
  );
}

export function DiseasePipelineNext({ currentSlug, onAdvance }: { currentSlug: PipelineStep; onAdvance?: () => void }) {
  const navigate = useNavigate();
  const { active, pipe, next } = useDiseasePipeline(currentSlug);
  if (!active || !pipe) return null;

  const go = () => {
    onAdvance?.();
    advanceDiseasePipeline();
    if (next) navigate({ to: PIPELINE_ROUTE[next] });
    else { clearDiseasePipeline(); navigate({ to: "/disease/$slug", params: { slug: pipe.slug } }); }
  };

  return (
    <button
      onClick={go}
      className="mt-4 flex w-full items-center justify-center gap-2 rounded-2xl bg-primary px-5 py-3.5 text-sm font-semibold text-primary-foreground shadow-[var(--shadow-glow)]"
    >
      Continue to {next ? PIPELINE_LABEL[next] : `your ${pipe.label} plan`} <ArrowRight size={16} />
    </button>
  );
}
