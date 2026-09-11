import { Link } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { PROBLEMS } from "@/lib/exercise";
import { WEEKDAYS, type YogaPlan } from "@/lib/yoga-plan";

type GoalGroup = { id: string; label: string; emoji: string; items?: string[]; subs?: [string, string[]][] };
const GOAL_GROUPS: GoalGroup[] = [
  { id: "goals", label: "Wellness & fitness", emoji: "🎯", items: ["General Wellness", "Weight Loss", "Flexibility", "Mobility", "Strength", "Balance & Stability", "Better Posture", "Better Sleep", "Beat Fatigue", "Healthy Ageing", "Sr. Fitness", "Metabolic Health", "Breathwork / Pranayama", "Stress & Anxiety Relief", "Lift Mood"] },
  { id: "aches", label: "Ease aches & stiffness", emoji: "🩹", items: ["Knees & Ankles", "Back & Spine", "Neck & Shoulder", "Hips & Pelvis"] },
  { id: "health", label: "Health & conditions", emoji: "🩺", subs: [["Organ health", ["Heart", "Kidney", "Prostate", "Gut"]], ["Manage a condition", ["Acidity / GERD", "Constipation", "Indigestion", "IBS", "Fatty Liver", "Cholesterol", "Hypertension", "Diabetes", "Asthma", "Thyroid", "Arthritis", "Osteoporosis", "Migraine", "Sciatica"]]] },
  { id: "women", label: "Women's health", emoji: "🌸", items: ["Pregnancy", "Post-natal", "PCOS / PCOD", "Menopause"] },
];
const LEVELS = ["Beginner", "Intermediate", "Advanced"];
const WEEK_ITEMS = Array.from({ length: 12 }, (_, i) => ({ v: i + 1, label: `${i + 1}` }));
const DUR_ITEMS = [10, 15, 20, 30, 45, 60].map((n) => ({ v: n, label: `${n}` }));

type Step = "goal" | "level" | "length" | "days" | "duration" | "workaround";
const STEPS: Step[] = ["goal", "level", "length", "days", "duration", "workaround"];
const TITLES: Record<Step, string> = {
  goal: "Choose your focus", level: "Your level", length: "How many weeks?", days: "Weekly schedule",
  duration: "How long each session?", workaround: "Any areas we should protect?",
};

function WheelPicker({ items, value, onChange }: { items: { v: number; label: string }[]; value: number; onChange: (v: number) => void }) {
  const H = 40;
  const ref = useRef<HTMLDivElement>(null);
  const settle = useRef<ReturnType<typeof setTimeout> | null>(null);
  useEffect(() => {
    const el = ref.current; if (!el) return;
    el.scrollTop = Math.max(0, items.findIndex((x) => x.v === value)) * H;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  const onScroll = () => {
    if (settle.current) clearTimeout(settle.current);
    settle.current = setTimeout(() => {
      const el = ref.current; if (!el) return;
      const i = Math.max(0, Math.min(items.length - 1, Math.round(el.scrollTop / H)));
      if (items[i].v !== value) onChange(items[i].v);
    }, 80);
  };
  return (
    <div className="relative mx-auto w-full max-w-[220px]" style={{ height: H * 5 }}>
      <div className="pointer-events-none absolute inset-x-4 top-1/2 -translate-y-1/2 rounded-xl bg-primary/10 ring-1 ring-primary/20" style={{ height: H }} />
      <div ref={ref} onScroll={onScroll} className="h-full snap-y snap-mandatory overflow-y-scroll [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        <div style={{ height: H * 2 }} />
        {items.map((it) => (
          <button key={it.v} onClick={() => { onChange(it.v); const el = ref.current; if (el) el.scrollTo({ top: items.findIndex((x) => x.v === it.v) * H, behavior: "smooth" }); }}
            className={`flex w-full snap-center items-center justify-center text-[13px] font-semibold tabular-nums transition-colors ${it.v === value ? "text-foreground" : "text-muted-foreground/40"}`} style={{ height: H }}>{it.label}</button>
        ))}
        <div style={{ height: H * 2 }} />
      </div>
    </div>
  );
}

export function YogaPlanSheet({ initial, onClose, onSave }: { initial: YogaPlan | null; onClose: () => void; onSave: (p: YogaPlan) => void }) {
  const [step, setStep] = useState(0);
  const [primary, setPrimary] = useState<string | null>(initial?.primary ?? null);
  const [secondary, setSecondary] = useState<string | null>(initial?.secondary ?? null);
  const [level, setLevel] = useState(initial?.level ?? "Beginner");
  const [weeks, setWeeks] = useState(initial?.weeks ?? 4);
  const [days, setDays] = useState<string[]>(initial?.days?.length ? initial.days : ["mon", "tue", "wed", "thu", "fri"]);
  const [duration, setDuration] = useState(initial?.duration ?? 20);
  const [protect, setProtect] = useState<string[]>(initial?.protect ?? []);

  const cur = STEPS[step];
  const isLast = step === STEPS.length - 1;
  const chip = (on: boolean) => `rounded-full px-3.5 py-2 text-[12px] font-semibold transition ${on ? "bg-primary text-primary-foreground" : "bg-secondary text-foreground/75"}`;
  const goalChip = (c: string) => `rounded-full px-3 py-2 text-[12px] font-semibold transition ${c === primary ? "bg-primary text-primary-foreground" : c === secondary ? "bg-primary/10 text-primary ring-2 ring-primary" : "bg-secondary text-foreground/75"}`;

  const tapGoal = (g: string) => {
    if (g === primary) { setPrimary(secondary); setSecondary(null); }
    else if (g === secondary) setSecondary(null);
    else if (!primary) setPrimary(g);
    else if (!secondary) setSecondary(g);
    else setSecondary(g);
  };
  const togProtect = (p: string) => setProtect((c) => c.includes(p) ? c.filter((x) => x !== p) : [...c, p]);
  const togDay = (id: string) => setDays((c) => c.includes(id) ? c.filter((x) => x !== id) : [...c, id]);
  const canNext = (cur !== "goal" || !!primary) && (cur !== "days" || days.length > 0);
  const finish = () => {
    if (!primary || !days.length) return;
    const ord = WEEKDAYS.map((w) => w.id);
    const sorted = [...days].sort((a, b) => ord.indexOf(a) - ord.indexOf(b));
    onSave({ id: initial?.id ?? "", primary, secondary, level, weeks, daysPerWeek: sorted.length, days: sorted, duration, protect, updatedAt: Date.now() });
  };

  return (
    <Dialog open onOpenChange={(v) => { if (!v) onClose(); }}>
      <DialogContent className="max-w-sm">
        <DialogHeader>
          <DialogTitle className="font-display">{initial ? "Edit your yoga plan" : "Build your yoga plan"}</DialogTitle>
          <DialogDescription>Step {step + 1} of {STEPS.length} · {TITLES[cur]}</DialogDescription>
        </DialogHeader>

        <div className="flex gap-1">
          {STEPS.map((_, i) => <div key={i} className={`h-1 flex-1 rounded-full ${i <= step ? "bg-primary" : "bg-secondary"}`} />)}
        </div>

        <div className="min-h-[38svh] max-h-[54svh] overflow-y-auto pr-1">
          {cur === "goal" && (
            <div className="space-y-4">
              <p className="px-1 text-[11.5px] text-muted-foreground">Pick one. Add a second focus if you like — optional.</p>
              {GOAL_GROUPS.map((gr) => (
                <section key={gr.id}>
                  <h2 className="mb-2 px-1 text-[12.5px] font-bold text-foreground/70">{gr.emoji} {gr.label}</h2>
                  {gr.items && <div className="flex flex-wrap gap-1.5">{gr.items.map((g) => <button key={g} onClick={() => tapGoal(g)} className={goalChip(g)}>{g}</button>)}</div>}
                  {gr.subs && gr.subs.map(([slab, items]) => (
                    <div key={slab} className="mt-2">
                      <p className="mb-1.5 px-1 text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">{slab}</p>
                      <div className="flex flex-wrap gap-1.5">{items.map((g) => <button key={g} onClick={() => tapGoal(g)} className={goalChip(g)}>{g}</button>)}</div>
                    </div>
                  ))}
                </section>
              ))}
              <Link to="/coach" className="inline-flex items-center gap-1 px-1 text-[12px] font-semibold text-primary">🤖 Not sure? Ask the bot</Link>
            </div>
          )}
          {cur === "level" && <div className="flex flex-wrap gap-1.5">{LEVELS.map((l) => <button key={l} onClick={() => setLevel(l)} className={chip(level === l)}>{l}</button>)}</div>}
          {cur === "length" && (
            <><p className="pb-1 text-center text-[12px] text-muted-foreground">Scroll to pick — up to 12 weeks.</p><WheelPicker items={WEEK_ITEMS} value={weeks} onChange={setWeeks} /><p className="text-center text-[12px] font-semibold text-foreground">{weeks} week{weeks > 1 ? "s" : ""}</p></>
          )}
          {cur === "days" && (
            <div>
              <p className="pb-2 px-1 text-[11px] text-muted-foreground">Pick the days you'll practise — the rest are rest days.</p>
              <div className="grid grid-cols-7 gap-1">
                {WEEKDAYS.map((d) => {
                  const on = days.includes(d.id);
                  return (
                    <button key={d.id} onClick={() => togDay(d.id)} className={`flex h-11 items-center justify-center rounded-xl text-[11px] font-bold ring-1 ${on ? "bg-primary text-primary-foreground ring-primary" : "bg-secondary/40 text-foreground/65 ring-border/60"}`}>{d.label}</button>
                  );
                })}
              </div>
              <p className="mt-2.5 px-1 text-[11px] text-muted-foreground">{days.length} practice day{days.length !== 1 ? "s" : ""} a week{days.length < 7 ? ` · ${7 - days.length} rest` : ""}.</p>
            </div>
          )}
          {cur === "duration" && (
            <><p className="pb-1 text-center text-[12px] text-muted-foreground">Minutes per session.</p><WheelPicker items={DUR_ITEMS} value={duration} onChange={setDuration} /><p className="text-center text-[12px] font-semibold text-foreground">{duration} min</p></>
          )}
          {cur === "workaround" && (
            <div className="flex flex-wrap gap-1.5">
              <button onClick={() => setProtect([])} className={chip(protect.length === 0)}>None</button>
              {PROBLEMS.map((p) => <button key={p.id} onClick={() => togProtect(p.label)} className={chip(protect.includes(p.label))}>{p.label}</button>)}
            </div>
          )}
        </div>

        {cur === "goal" && primary && (
          <div className="rounded-2xl bg-secondary/40 px-3 py-2 text-[12px] leading-relaxed">
            <span className="text-muted-foreground">Focus: </span><span className="font-semibold text-foreground">{primary}</span>
            {secondary
              ? <><span className="text-muted-foreground"> · plus </span><span className="font-semibold text-foreground">{secondary}</span></>
              : <span className="text-muted-foreground"> · tap another for an optional second focus</span>}
          </div>
        )}

        <div className="flex gap-2">
          {step > 0 && <button onClick={() => setStep((s) => s - 1)} className="rounded-2xl bg-secondary px-5 py-3 text-sm font-semibold text-foreground">Back</button>}
          <button disabled={!canNext} onClick={() => isLast ? finish() : setStep((s) => s + 1)}
            className="flex-1 rounded-2xl bg-primary px-4 py-3 text-sm font-semibold text-primary-foreground disabled:opacity-40">
            {isLast ? (initial ? "Save plan" : "Create my plan") : "Next"}
          </button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
