import { useState, Fragment } from "react";
import { TERM_EXAMPLES, FOOD_MACROS, type FoodMacro } from "@/lib/meal-plan";

/** A comma-separated list of foods/terms. Any term we have an example or macros for becomes
 *  tappable (dotted underline) and opens a small detail popover — same behaviour as the meal plan. */
export function TermList({ items }: { items: string[] }) {
  const [tip, setTip] = useState<{ text: string; ex?: string; macro?: FoodMacro; left: number; top: number } | null>(null);
  const W = Math.min(250, (typeof window !== "undefined" ? window.innerWidth : 360) - 16);
  const open = (text: string, rect: DOMRect) => {
    const vw = typeof window !== "undefined" ? window.innerWidth : 360;
    setTip({ text, ex: TERM_EXAMPLES[text], macro: FOOD_MACROS[text], left: Math.max(8, Math.min(rect.left, vw - W - 8)), top: rect.bottom + 6 });
  };
  return (
    <>
      {items.map((t, i) => (
        <Fragment key={i}>
          {(TERM_EXAMPLES[t] || FOOD_MACROS[t])
            ? <button onClick={(e) => open(t, e.currentTarget.getBoundingClientRect())} className="underline decoration-dotted underline-offset-2">{t}</button>
            : <span>{t}</span>}
          {i < items.length - 1 ? ", " : ""}
        </Fragment>
      ))}
      {tip && (
        <>
          <div onClick={() => setTip(null)} className="fixed inset-0 z-40" />
          <div className="fixed z-50 rounded-xl bg-card p-3 text-[11.5px] leading-snug text-foreground/85 shadow-xl ring-1 ring-border/70" style={{ left: tip.left, top: tip.top, width: W }}>
            <b className="mb-0.5 block text-[12px] text-foreground">{tip.text}</b>
            {tip.ex && <span className="block">e.g. {tip.ex}</span>}
            {tip.macro && (
              <span className="mt-1.5 block border-t border-border/50 pt-1.5">
                <span className="text-[10px] text-muted-foreground">Per {tip.macro.serving}</span>
                <span className="mt-0.5 block font-semibold">
                  <span className="text-emerald-600">P {tip.macro.p}g</span> · <span className="text-amber-600">C {tip.macro.c}g</span> · <span className="text-rose-500">F {tip.macro.f}g</span> · ~{tip.macro.kcal} kcal
                </span>
              </span>
            )}
          </div>
        </>
      )}
    </>
  );
}
