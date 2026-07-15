import { Star } from "lucide-react";

/** 0–5 star relevance rating, used for disease-management interventions. */
export function Stars({ n, max = 5, size = 11 }: { n: number; max?: number; size?: number }) {
  return (
    <span className="inline-flex gap-0.5">
      {Array.from({ length: max }, (_, i) => i + 1).map((i) => (
        <Star
          key={i}
          size={size}
          className={i <= n ? "fill-amber-400 text-amber-400" : "text-muted-foreground/40"}
        />
      ))}
    </span>
  );
}
