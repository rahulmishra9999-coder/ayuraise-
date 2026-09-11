import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { PROBLEMS } from "@/lib/exercise";
import { templateToPlan, type YogaTemplate } from "@/lib/yoga-templates";
import type { YogaPlan } from "@/lib/yoga-plan";

const LEVELS = ["Beginner", "Intermediate", "Advanced"];
const DURS = [10, 15, 20, 30, 45, 60];
const TRIMS = ["1st trimester", "2nd trimester", "3rd trimester"];
const TECHS = ["Pranayam", "Mudras", "Both"];

const TITLES: Record<string, string> = {
  level: "Your level", trimester: "Which trimester?", technique: "What would you like?",
  time: "How long each session?", protect: "Any areas to protect?", start: "Ready to begin",
};

/** The short "start a program" flow: a few conditional questions → a 2-day plan → save or activate. */
export function YogaProgramSheet({ template, activePlans, onClose, onSave, onActivate }: {
  template: YogaTemplate;
  activePlans: YogaPlan[];
  onClose: () => void;
  onSave: (plan: YogaPlan) => void;                       // save & practice → favourite + in Plans
  onActivate: (plan: YogaPlan, replaceId?: string) => void; // make it a current plan board
}) {
  const t = template;
  const [level, setLevel] = useState(t.level);
  const [duration, setDuration] = useState(t.duration);
  const [protect, setProtect] = useState<string[]>([]);
  const [trimester, setTrimester] = useState(TRIMS[0]);
  const [technique, setTechnique] = useState<string>(TECHS[2]);

  const steps: string[] = [
    ...(t.noLevel ? [] : ["level"]),
    ...(t.trimester ? ["trimester"] : []),
    ...(t.technique ? ["technique"] : []),
    "time",
    ...(t.noProtect ? [] : ["protect"]),
    "start",
  ];
  const [i, setI] = useState(0);
  const cur = steps[i];
  const isLast = cur === "start";

  const togProtect = (p: string) => setProtect((c) => c.includes(p) ? c.filter((x) => x !== p) : [...c, p]);
  const chip = (on: boolean) => `rounded-full px-3.5 py-2 text-[12px] font-semibold transition ${on ? "bg-primary text-primary-foreground" : "bg-secondary text-foreground/75"}`;

  const build = (): YogaPlan => {
    const base = templateToPlan(t);
    const variant = t.trimester ? trimester : t.technique ? technique : undefined;
    return { ...base, level: t.noLevel ? base.level : level, duration, protect: t.noProtect ? [] : protect, variant };
  };
  const save = () => onSave(build());
  const activate = (replaceId?: string) => onActivate(build(), replaceId);

  return (
    <Dialog open onOpenChange={(v) => { if (!v) onClose(); }}>
      <DialogContent className="max-w-sm">
        <DialogHeader>
          <DialogTitle className="font-display">{t.emoji} {t.name}</DialogTitle>
          <DialogDescription>Step {i + 1} of {steps.length} · {TITLES[cur]}</DialogDescription>
        </DialogHeader>

        <div className="flex gap-1">
          {steps.map((_, k) => <div key={k} className={`h-1 flex-1 rounded-full ${k <= i ? "bg-primary" : "bg-secondary"}`} />)}
        </div>

        <div className="min-h-[30svh]">
          {cur === "level" && <div className="flex flex-wrap gap-1.5">{LEVELS.map((l) => <button key={l} onClick={() => setLevel(l as typeof level)} className={chip(level === l)}>{l}</button>)}</div>}
          {cur === "trimester" && (
            <>
              <div className="flex flex-wrap gap-1.5">{TRIMS.map((tr) => <button key={tr} onClick={() => setTrimester(tr)} className={chip(trimester === tr)}>{tr}</button>)}</div>
              <p className="mt-2 px-1 text-[11px] leading-snug text-muted-foreground">We'll pick a safe intensity for your trimester. Please practise only with your doctor's okay.</p>
            </>
          )}
          {cur === "technique" && <div className="flex flex-wrap gap-1.5">{TECHS.map((te) => <button key={te} onClick={() => setTechnique(te)} className={chip(technique === te)}>{te}</button>)}</div>}
          {cur === "time" && <div className="flex flex-wrap gap-1.5">{DURS.map((d) => <button key={d} onClick={() => setDuration(d)} className={chip(duration === d)}>{d} min</button>)}</div>}
          {cur === "protect" && (
            <div className="flex flex-wrap gap-1.5">
              <button onClick={() => setProtect([])} className={chip(protect.length === 0)}>None</button>
              {PROBLEMS.map((p) => <button key={p.id} onClick={() => togProtect(p.label)} className={chip(protect.includes(p.label))}>{p.label}</button>)}
            </div>
          )}
          {cur === "start" && (
            <div>
              <div className="rounded-2xl bg-secondary/40 p-3 ring-1 ring-border/50">
                <p className="text-[12.5px] font-semibold text-foreground">We'll create your first 2 days now 🌱</p>
                <p className="mt-1 text-[11.5px] leading-snug text-muted-foreground">The next days are generated as you go — shaped by how each session feels. {t.name}{t.noLevel ? "" : ` · ${level}`} · {duration} min{t.trimester ? ` · ${trimester}` : ""}{t.technique ? ` · ${technique}` : ""}.</p>
              </div>
              <div className="mt-3 space-y-2">
                <button onClick={save} className="w-full rounded-2xl bg-primary px-4 py-3 text-sm font-semibold text-primary-foreground">💾 Save &amp; practice</button>
                <p className="px-1 text-[10.5px] text-muted-foreground">Saved to your ⭐ Fav Plans and opened so you can start practising.</p>
                {!t.noCurrent && activePlans.length >= 1 && (
                  <>
                    <p className="px-1 pt-1 text-[11px] text-muted-foreground">…or replace a current plan instead:</p>
                    {activePlans.map((p) => (
                      <button key={p.id} onClick={() => activate(p.id)} className="w-full rounded-2xl bg-secondary px-4 py-3 text-[13.5px] font-semibold text-foreground">🔄 Replace “{p.primary}”</button>
                    ))}
                  </>
                )}
              </div>
            </div>
          )}
        </div>

        {!isLast && (
          <div className="flex gap-2">
            {i > 0 && <button onClick={() => setI((s) => s - 1)} className="rounded-2xl bg-secondary px-5 py-3 text-sm font-semibold text-foreground">Back</button>}
            <button onClick={() => setI((s) => s + 1)} className="flex-1 rounded-2xl bg-primary px-4 py-3 text-sm font-semibold text-primary-foreground">Next</button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
