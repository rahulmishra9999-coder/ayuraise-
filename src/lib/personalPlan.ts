// The ONE personalized plan. Created from the "Create my personalized plan" flow
// (disease list → focus → fitness goal). Rebuilding replaces it — only one exists.
// The plan content itself is computed live by the engine (clusters.ts) from the
// saved profile; here we only persist WHAT was chosen + any per-tool time/level tweaks.

export interface ToolOverride { minutes?: number; level?: string }

export interface PersonalPlan {
  createdAt: number;
  updatedAt: number;
  goalIds: string[];                         // union of conditions + active focus + chosen fitness goal
  overrides?: Record<string, ToolOverride>;  // keyed by tool id (yoga / exercise …) for light edits
  tools?: string[];                          // which parts are switched on; undefined = all
}

const KEY = "ayuraise.personalPlan";

// The parts a user can add/remove from their plan.
export const PLAN_TOOLS: { id: string; label: string; emoji: string }[] = [
  { id: "yoga", label: "Yoga & breathwork", emoji: "🧘" },
  { id: "exercise", label: "Exercise", emoji: "🏋️" },
  { id: "diet", label: "Diet", emoji: "🥗" },
  { id: "detox", label: "Detox", emoji: "✨" },
  { id: "fasting", label: "Fasting / IF", emoji: "⏱️" },
  { id: "meditation", label: "Meditation", emoji: "🕉️" },
  { id: "herbs", label: "Herbs & remedies", emoji: "🌱" },
];

export function getPlanTools(): string[] {
  const p = loadPersonalPlan();
  return p?.tools ?? PLAN_TOOLS.map((t) => t.id); // default: everything on
}

export function setPlanTools(tools: string[]) {
  const p = loadPersonalPlan();
  if (!p) return;
  p.tools = tools;
  p.updatedAt = Date.now();
  try { localStorage.setItem(KEY, JSON.stringify(p)); } catch { /* ignore */ }
}

export function loadPersonalPlan(): PersonalPlan | null {
  if (typeof window === "undefined") return null;
  try { const r = localStorage.getItem(KEY); return r ? (JSON.parse(r) as PersonalPlan) : null; }
  catch { return null; }
}

export function savePersonalPlan(goalIds: string[]): PersonalPlan {
  const prev = loadPersonalPlan();
  const plan: PersonalPlan = {
    createdAt: prev?.createdAt ?? Date.now(),
    updatedAt: Date.now(),
    goalIds,
    overrides: prev?.overrides ?? {},
  };
  try { localStorage.setItem(KEY, JSON.stringify(plan)); } catch { /* ignore */ }
  return plan;
}

export function setToolOverride(tool: string, ov: ToolOverride) {
  const plan = loadPersonalPlan();
  if (!plan) return;
  plan.overrides = { ...(plan.overrides ?? {}), [tool]: { ...(plan.overrides?.[tool] ?? {}), ...ov } };
  plan.updatedAt = Date.now();
  try { localStorage.setItem(KEY, JSON.stringify(plan)); } catch { /* ignore */ }
}

// Plan-selection fields stored on the profile — cleared when the plan is deleted so the
// wizard no longer re-selects them. Basics (name, age, sex, height, sleep, mood…) are kept.
const PLAN_SELECTION_KEYS = [
  "conditions", "condDetail", "openCond", "openGroup", "prevention", "women", "everyday",
  "chosenGoals", "activeFocus", "fitnessFocus", "areas", "clusterPrimary", "planMode",
];

export function clearPersonalPlan() {
  try { localStorage.removeItem(KEY); } catch { /* ignore */ }
  try {
    const raw = localStorage.getItem("ayuraise.lifestyle");
    if (raw) {
      const p = JSON.parse(raw) as Record<string, unknown>;
      for (const k of PLAN_SELECTION_KEYS) delete p[k];
      localStorage.setItem("ayuraise.lifestyle", JSON.stringify(p));
    }
  } catch { /* ignore */ }
}
