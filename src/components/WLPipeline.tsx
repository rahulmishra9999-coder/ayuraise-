import { Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { ArrowRight, X, Sparkles } from "lucide-react";
import {
  getPipeline, advancePipeline, clearPipeline, PIPELINE_ROUTE,
  type PipelineStep,
} from "@/lib/weight-loss";

const LABEL: Record<PipelineStep, string> = {
  yoga: "Yoga",
  exercise: "Exercise",
  fasting: "Fasting",
  detox: "Detox",
  diet: "Diet plan",
};

export function useWLPipeline(currentSlug: PipelineStep) {
  const [queue, setQueue] = useState<PipelineStep[]>([]);
  useEffect(() => { setQueue(getPipeline()); }, []);
  const active = queue.length > 0 && queue[0] === currentSlug;
  const idx = queue.indexOf(currentSlug);
  const total = queue.length;
  const next = queue[idx + 1];
  return { active, queue, idx, total, next };
}

export function WLPipelineBanner({ currentSlug }: { currentSlug: PipelineStep }) {
  const navigate = useNavigate();
  const { active, queue, idx, total, next } = useWLPipeline(currentSlug);
  if (!active) return null;

  const skip = () => {
    advancePipeline();
    if (next) navigate({ to: PIPELINE_ROUTE[next] });
    else { clearPipeline(); navigate({ to: "/section/weight-loss" }); }
  };

  return (
    <div className="mt-3 flex items-center justify-between gap-3 rounded-2xl bg-primary/10 px-3 py-2.5 ring-1 ring-primary/30">
      <div className="flex items-center gap-2 text-xs">
        <Sparkles size={14} className="text-primary" />
        <span className="font-semibold text-primary">Weight plan</span>
        <span className="text-muted-foreground">· step {idx + 1} of {total} ({LABEL[currentSlug]})</span>
      </div>
      <button onClick={skip} className="flex items-center gap-1 rounded-full bg-card px-2.5 py-1 text-[11px] font-semibold text-foreground ring-1 ring-border/60">
        Skip <X size={11} />
      </button>
    </div>
  );
}

export function WLPipelineNext({ currentSlug, onAdvance }: { currentSlug: PipelineStep; onAdvance?: () => void }) {
  const navigate = useNavigate();
  const { active, next } = useWLPipeline(currentSlug);
  if (!active) return null;

  const go = () => {
    onAdvance?.();
    advancePipeline();
    if (next) navigate({ to: PIPELINE_ROUTE[next] });
    else { clearPipeline(); navigate({ to: "/section/weight-loss" }); }
  };

  return (
    <button
      onClick={go}
      className="mt-4 flex w-full items-center justify-center gap-2 rounded-2xl bg-primary px-5 py-3.5 text-sm font-semibold text-primary-foreground shadow-[var(--shadow-glow)]"
    >
      Continue to {next ? LABEL[next] : "your weight plan"} <ArrowRight size={16} />
    </button>
  );
}
