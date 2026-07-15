import { useEffect, useMemo, useState } from "react";
import { Hourglass } from "lucide-react";

export type IFWindowStr = "12:12" | "14:10" | "16:8" | "18:6" | "20:4" | "OMAD";

export function IFMealTimes({
  window,
  meals,
  normalTimes = [],
}: {
  window: IFWindowStr;
  meals: number;
  normalTimes?: string[];
}) {
  const eat = window === "OMAD" ? 1 : Number(window.split(":")[1]);

  function fmt(h: number) {
    const hr = Math.floor(h);
    const min = Math.round((h - hr) * 60);
    return `${String(hr).padStart(2, "0")}:${String(min).padStart(2, "0")}`;
  }
  function toHr(t: string) {
    const [h, m] = t.split(":").map(Number);
    return h + (m || 0) / 60;
  }

  const lastNormal =
    normalTimes.length > 0
      ? Math.min(20, Math.max(...normalTimes.map(toHr)))
      : 19;
  const endHour = Math.min(20, lastNormal);
  const startHour = Math.max(6, endHour - eat);

  const initial = useMemo(() => {
    const inWin = normalTimes
      .map(toHr)
      .filter((h) => h >= startHour && h <= endHour)
      .sort((a, b) => a - b);
    if (inWin.length >= meals) return inWin.slice(-meals).map(fmt);
    const gap = meals > 1 ? (endHour - startHour) / (meals - 1) : 0;
    return Array.from({ length: meals }, (_, i) => fmt(startHour + i * gap));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [window, meals, normalTimes.join(",")]);

  const [times, setTimes] = useState<string[]>(initial);
  useEffect(() => setTimes(initial), [initial]);

  return (
    <div className="mt-4 rounded-2xl bg-accent/40 p-3 ring-1 ring-border/60">
      <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
        Suggested IF meal times (edit if you like)
      </p>
      <div className="mt-2 grid grid-cols-2 gap-2">
        {times.map((t, i) => (
          <label key={i} className="flex items-center gap-2 rounded-xl bg-card px-3 py-2 ring-1 ring-border">
            <Hourglass size={14} className="text-primary" />
            <span className="text-[11px] text-muted-foreground">Meal {i + 1}</span>
            <input
              type="time"
              value={t}
              onChange={(e) => {
                const arr = [...times];
                arr[i] = e.target.value;
                setTimes(arr);
              }}
              className="flex-1 bg-transparent text-sm font-semibold text-foreground focus:outline-none"
            />
          </label>
        ))}
      </div>
      <p className="mt-2 text-[10px] text-muted-foreground">
        Window {window} · eat {fmt(startHour)}–{fmt(endHour)} · {meals} meal{meals > 1 ? "s" : ""}
      </p>
    </div>
  );
}
