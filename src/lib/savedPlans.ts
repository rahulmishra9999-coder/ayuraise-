// Aggregates all saved plans across sections from localStorage.
// Each entry comes from a known key with a known shape — we normalize to
// a simple display record.

export type SavedPlan = {
  id: string;
  category: "Disease" | "Diet" | "Intermittent Fasting" | "Fasting" | "Weight" | "Detox" | "Yoga" | "Exercise" | "Wellness Plan";
  title: string;
  createdAt: number;
  href: string;
  meta?: string;
};

function read<T>(key: string, fb: T): T {
  if (typeof window === "undefined") return fb;
  try { const raw = localStorage.getItem(key); return raw ? JSON.parse(raw) as T : fb; }
  catch { return fb; }
}

export function getAllSavedPlans(): SavedPlan[] {
  const out: SavedPlan[] = [];

  // Disease-management plans
  const diseaseIndex = read<string[]>("ayuraise.disease.index", []);
  diseaseIndex.forEach((slug) => {
    const p = read<any | null>(`ayuraise.disease.${slug}.plan`, null);
    if (p) out.push({
      id: `disease_${slug}`,
      category: "Disease",
      title: p.name || slug,
      createdAt: p.createdAt ?? Date.now(),
      href: `/disease/${slug}`,
      meta: p.track === "prevent" ? "Prevention" : "Management",
    });
  });

  // Diet plans
  const dietList = read<any[]>("ayuraise.dietPlans", []);
  dietList.forEach((d, i) => out.push({
    id: `diet_${d.createdAt ?? i}`,
    category: "Diet",
    title: d.name || "Diet plan",
    createdAt: d.createdAt ?? Date.now(),
    href: "/section/diet",
    meta: d.goal,
  }));

  // Fasting + IF plans
  const fastingList = read<any[]>("ayuraise.fastingPlans", []);
  fastingList.forEach((f, i) => out.push({
    id: `fast_${f.createdAt ?? i}`,
    category: f.kind === "if" ? "Intermittent Fasting" : "Fasting",
    title: f.kind === "if" ? `IF ${f.windowId ?? ""}` : `${f.fastingType ?? "Fasting"}`,
    createdAt: f.createdAt ?? Date.now(),
    href: "/section/fasting",
    meta: f.goal,
  }));

  // Weight plans
  const weight = read<any | null>("ayuraise.weightPlan", null);
  if (weight) out.push({
    id: `weight_${weight.createdAt ?? "x"}`,
    category: "Weight",
    title: weight.targetWeightKg ? `Target ${weight.targetWeightKg} kg` : "Weight plan",
    createdAt: weight.createdAt ?? Date.now(),
    href: "/section/weight-loss",
  });

  // Detox plans
  const detoxList = read<any[]>("ayuraise.detoxPlans", []);
  detoxList.forEach((d, i) => out.push({
    id: `detox_${d.createdAt ?? i}`,
    category: "Detox",
    title: `${d.days ?? ""}-day ${d.kind ?? "detox"}`.trim(),
    createdAt: d.createdAt ?? Date.now(),
    href: "/section/detox",
  }));

  // Yoga plans
  const yogaList = read<any[]>("ayuraise.yogaPlans", []);
  yogaList.forEach((y, i) => out.push({
    id: `yoga_${y.createdAt ?? i}`,
    category: "Yoga",
    title: y.name || y.category || "Yoga plan",
    createdAt: y.createdAt ?? Date.now(),
    href: "/section/yoga",
  }));

  // Exercise plans
  const exerciseList = read<any[]>("ayuraise.exercisePlans", []);
  exerciseList.forEach((e, i) => out.push({
    id: `ex_${e.createdAt ?? i}`,
    category: "Exercise",
    title: e.name || "Exercise plan",
    createdAt: e.createdAt ?? Date.now(),
    href: "/section/exercise",
  }));

  // Combined wellness plan
  const wellness = read<any | null>("ayuraise.plan", null);
  if (wellness) out.push({
    id: `wp_main`,
    category: "Wellness Plan",
    title: "My wellness plan",
    createdAt: wellness.createdAt ?? Date.now(),
    href: "/plan",
  });

  return out.sort((a, b) => b.createdAt - a.createdAt);
}

export function groupByCategory(plans: SavedPlan[]) {
  const map = new Map<string, SavedPlan[]>();
  for (const p of plans) {
    if (!map.has(p.category)) map.set(p.category, []);
    map.get(p.category)!.push(p);
  }
  return map;
}

export function getPlansBySection(href: string): SavedPlan[] {
  return getAllSavedPlans().filter((p) => p.href === href);
}
