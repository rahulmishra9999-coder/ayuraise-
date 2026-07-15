// Disease-management plan storage + cross-section materialization.
// A disease plan is the master record; when built, it also writes into the
// existing per-section localStorage keys (tagged source: "disease:<slug>")
// so Yoga/Diet/Exercise/etc. and the dashboard surface it automatically.

import { getDisease, planItems, TOOL_META, type ToolKey, type Track } from "./diseases";

export interface DiseasePlan {
  slug: string;
  name: string;
  track: Track;
  tools: ToolKey[];
  /** Optional second condition to sequence after `phaseGapDays`. */
  phase2?: { slug: string; name: string; startAfterDays: number };
  secondary?: string[]; // combined-plan case: worked on together
  durationDays: number;
  createdAt: number;
}

const KEY = (slug: string) => `ayuraise.disease.${slug}.plan`;
const INDEX_KEY = "ayuraise.disease.index"; // list of slugs with active plans

function read<T>(key: string, fb: T): T {
  if (typeof window === "undefined") return fb;
  try { const r = localStorage.getItem(key); return r ? (JSON.parse(r) as T) : fb; }
  catch { return fb; }
}
function write(key: string, val: unknown) {
  if (typeof window === "undefined") return;
  try { localStorage.setItem(key, JSON.stringify(val)); } catch {}
}

export function loadDiseasePlan(slug: string): DiseasePlan | null {
  return read<DiseasePlan | null>(KEY(slug), null);
}

export function loadDiseaseIndex(): string[] {
  return read<string[]>(INDEX_KEY, []);
}

export function loadAllDiseasePlans(): DiseasePlan[] {
  return loadDiseaseIndex()
    .map((s) => loadDiseasePlan(s))
    .filter((p): p is DiseasePlan => !!p);
}

export function deleteDiseasePlan(slug: string) {
  if (typeof window === "undefined") return;
  try {
    localStorage.removeItem(KEY(slug));
    write(INDEX_KEY, loadDiseaseIndex().filter((s) => s !== slug));
  } catch {}
}

/** Save the master record and mirror each tool into its section's plan list. */
export function saveDiseasePlan(plan: DiseasePlan) {
  write(KEY(plan.slug), plan);
  const idx = loadDiseaseIndex();
  if (!idx.includes(plan.slug)) write(INDEX_KEY, [...idx, plan.slug]);
  materialize(plan);
}

/* ---------------- per-section materialization ---------------- */

const SECTION_LIST_KEY: Partial<Record<ToolKey, string>> = {
  yoga: "ayuraise.yogaPlans",
  exercise: "ayuraise.exercisePlans",
  diet: "ayuraise.dietPlans",
  fasting: "ayuraise.fastingPlans",
  detox: "ayuraise.detoxPlans",
};

function pushSectionPlan(listKey: string, entry: Record<string, unknown>) {
  const list = read<any[]>(listKey, []);
  const source = entry.source as string;
  // replace any existing plan from the same disease source
  const filtered = list.filter((p) => p.source !== source);
  filtered.push(entry);
  write(listKey, filtered);
}

function materialize(plan: DiseasePlan) {
  const disease = getDisease(plan.slug);
  if (!disease) return;
  const source = `disease:${plan.slug}`;

  for (const tool of plan.tools) {
    const ready = disease.readyPlans[tool];
    const items = ready ? planItems(ready, plan.track) : [];
    const listKey = SECTION_LIST_KEY[tool];
    if (listKey) {
      pushSectionPlan(listKey, {
        createdAt: plan.createdAt,
        source,
        name: `${disease.short} · ${ready?.title ?? TOOL_META[tool].label}`,
        goal: disease.short,
        diseaseSlug: plan.slug,
        kind: tool === "fasting" ? "fasting" : undefined,
        items,
      });
    }
  }

  // Umbrella summary picked up by /home
  const pillars = plan.tools.map((t) => TOOL_META[t].label);
  write("ayuraise.plan", {
    createdAt: plan.createdAt,
    focus: `${disease.name} (${plan.track === "prevent" ? "prevention" : "management"})`,
    pillars,
    diseaseSlug: plan.slug,
  });
}

/** Today's checklist assembled from all picked tools' ready-plan items. */
export function diseaseTasks(plan: DiseasePlan): { tool: ToolKey; label: string; items: string[] }[] {
  const disease = getDisease(plan.slug);
  if (!disease) return [];
  return plan.tools
    .map((tool) => {
      const ready = disease.readyPlans[tool];
      return ready
        ? { tool, label: `${TOOL_META[tool].emoji} ${TOOL_META[tool].label}`, items: planItems(ready, plan.track) }
        : null;
    })
    .filter((x): x is { tool: ToolKey; label: string; items: string[] } => !!x);
}

/* ---------------- generalized cross-section pipeline ---------------- */
// Mirrors weight-loss's pipeline but tagged to a source so multiple plans
// don't collide. Steps are section slugs the user walks through after building.

export type PipelineStep = "yoga" | "exercise" | "fasting" | "detox" | "diet";

const PIPE_KEY = "ayuraise.disease.pipeline";

export const PIPELINE_ROUTE: Record<PipelineStep, string> = {
  yoga: "/section/yoga",
  exercise: "/section/exercise",
  fasting: "/section/fasting",
  detox: "/section/detox",
  diet: "/section/diet",
};

export const PIPELINE_LABEL: Record<PipelineStep, string> = {
  yoga: "Yoga",
  exercise: "Exercise",
  fasting: "Fasting",
  detox: "Detox",
  diet: "Diet plan",
};

export interface DiseasePipeline {
  slug: string;
  label: string; // disease short name
  steps: PipelineStep[];
}

const SECTION_TOOLS: PipelineStep[] = ["yoga", "exercise", "fasting", "detox", "diet"];

export function startDiseasePipeline(slug: string, label: string, tools: ToolKey[]) {
  if (typeof window === "undefined") return;
  const steps = SECTION_TOOLS.filter((s) => tools.includes(s) && s !== "diet");
  if (tools.includes("diet")) steps.push("diet"); // diet always last
  if (steps.length === 0) return;
  write(PIPE_KEY, { slug, label, steps } satisfies DiseasePipeline);
}

export function getDiseasePipeline(): DiseasePipeline | null {
  return read<DiseasePipeline | null>(PIPE_KEY, null);
}

export function advanceDiseasePipeline(): PipelineStep | null {
  const p = getDiseasePipeline();
  if (!p || p.steps.length === 0) return null;
  const rest = p.steps.slice(1);
  if (rest.length === 0) { clearDiseasePipeline(); return null; }
  write(PIPE_KEY, { ...p, steps: rest });
  return rest[0];
}

export function clearDiseasePipeline() {
  if (typeof window === "undefined") return;
  try { localStorage.removeItem(PIPE_KEY); } catch {}
}
