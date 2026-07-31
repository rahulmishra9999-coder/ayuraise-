// Weight Loss / Weight Gain library

export type WLGoal = "lose" | "gain" | "maintain";
export type ActivityLevel = "sedentary" | "light" | "moderate" | "active" | "very_active";
export type Sex = "female" | "male" | "other";

export interface WLPlan {
  goal: WLGoal;
  sex: Sex;
  age: number;
  heightCm: number;
  startWeight: number;        // kg
  currentWeight: number;      // kg
  targetWeight: number;       // kg
  targetDate: string;         // ISO yyyy-mm-dd — projected
  activity: ActivityLevel;
  conditions: string[];       // health conditions
  paceKgWeek: number;         // 0.1 .. 1.0
  includeYoga: boolean;
  includeExercise: boolean;
  includeFasting: boolean;
  includeDetox: boolean;
  fastingWindow?: "12:12" | "14:10" | "16:8";
  yogaCalBurn?: number;       // kcal/day from yoga
  exerciseCalBurn?: number;   // kcal/day from exercise
  fastingPrefs?: { window?: string; type?: string };
  detoxPrefs?: { type?: string; days?: number };
  dailyCalories: number;      // suggested intake
  dailyProtein: number;
  weeklyRateKg: number;       // signed
  tdee: number;
  createdAt: number;
}

export interface PunchEntry { date: string; weight: number; mood?: string; note?: string }

const PLAN_KEY = "ayuraise.wl.plan";
const PUNCH_KEY = "ayuraise.wl.punches";
const QUEUE_KEY = "ayuraise.wl.queue";

export function savePlan(p: WLPlan) {
  if (typeof window === "undefined") return;
  try { window.localStorage.setItem(PLAN_KEY, JSON.stringify(p)); } catch {}
}
export function loadPlan(): WLPlan | null {
  if (typeof window === "undefined") return null;
  try { const r = window.localStorage.getItem(PLAN_KEY); return r ? JSON.parse(r) : null; } catch { return null; }
}
export function patchPlan(patch: Partial<WLPlan>): WLPlan | null {
  const cur = loadPlan(); if (!cur) return null;
  const next = { ...cur, ...patch };
  savePlan(next); return next;
}
export function loadPunches(): PunchEntry[] {
  if (typeof window === "undefined") return [];
  try { const r = window.localStorage.getItem(PUNCH_KEY); return r ? JSON.parse(r) : []; } catch { return []; }
}
export function addPunch(entry: PunchEntry) {
  if (typeof window === "undefined") return;
  const all = loadPunches().filter((e) => e.date !== entry.date);
  all.push(entry);
  all.sort((a, b) => a.date.localeCompare(b.date));
  try { window.localStorage.setItem(PUNCH_KEY, JSON.stringify(all)); } catch {}
}

/** Delete a punch; if it was the latest, current weight rolls back to the previous punch. */
export function removePunch(date: string): PunchEntry[] {
  if (typeof window === "undefined") return [];
  const all = loadPunches().filter((e) => e.date !== date);
  try { window.localStorage.setItem(PUNCH_KEY, JSON.stringify(all)); } catch {}
  const latest = all[all.length - 1];
  if (latest) patchPlan({ currentWeight: latest.weight });
  return all;
}

/* ---------------- math ---------------- */
export const ACTIVITY_FACTOR: Record<ActivityLevel, number> = {
  sedentary: 1.2, light: 1.375, moderate: 1.55, active: 1.725, very_active: 1.9,
};
export const ACTIVITY_LABEL: Record<ActivityLevel, { label: string; desc: string }> = {
  sedentary:   { label: "Sedentary",         desc: "Desk job, little/no exercise" },
  light:       { label: "Lightly active",    desc: "Light walks, 1–3 workouts/wk" },
  moderate:    { label: "Moderately active", desc: "3–5 workouts/wk" },
  active:      { label: "Very active",       desc: "6–7 workouts/wk or physical job" },
  very_active: { label: "Extra active",      desc: "Twice-daily training, athlete" },
};

// Mifflin-St Jeor
export function calcBMR(sex: Sex, weightKg: number, heightCm: number, age: number): number {
  const base = 10 * weightKg + 6.25 * heightCm - 5 * age;
  if (sex === "male") return base + 5;
  if (sex === "female") return base - 161;
  return base - 78;
}
export function calcTDEE(sex: Sex, weightKg: number, heightCm: number, age: number, a: ActivityLevel): number {
  return Math.round(calcBMR(sex, weightKg, heightCm, age) * ACTIVITY_FACTOR[a]);
}
// legacy aliases
export const bmr = calcBMR;
export const tdee = calcTDEE;

export function bmi(weightKg: number, heightCm: number): number {
  const m = heightCm / 100; return +(weightKg / (m * m)).toFixed(1);
}
export function bmiBand(b: number): string {
  if (b < 18.5) return "Underweight";
  if (b < 25)   return "Healthy";
  if (b < 30)   return "Overweight";
  return "Obese";
}

export interface PaceLabel { label: string; tone: "good" | "ok" | "warn" | "bad"; }
export function paceLabel(kgWeek: number): PaceLabel {
  const v = Math.abs(kgWeek);
  if (v <= 0.25) return { label: "Easy", tone: "good" };
  if (v <= 0.5)  return { label: "Moderate (recommended)", tone: "good" };
  if (v <= 0.75) return { label: "Fast", tone: "warn" };
  return { label: "Very fast — risky", tone: "bad" };
}

export function projectedDateFromPace(currentKg: number, targetKg: number, paceKgWeek: number): string {
  const today = new Date().toISOString().slice(0, 10);
  const c = Number(currentKg), t = Number(targetKg), p = Number(paceKgWeek);
  if (!Number.isFinite(c) || !Number.isFinite(t) || !Number.isFinite(p)) return today;
  const diff = Math.abs(t - c);
  if (p <= 0 || diff === 0) return today;
  const weeks = diff / p;
  if (!Number.isFinite(weeks)) return today;
  const days = Math.min(3650, Math.max(0, Math.round(weeks * 7)));
  const d = new Date();
  d.setDate(d.getDate() + days);
  return d.toISOString().slice(0, 10);
}

/** Derive the missing third of {targetKg, paceKgWeek, targetDate} from the other two. */
export function deriveThird(opts: {
  currentKg: number;
  targetKg?: number;
  paceKgWeek?: number;
  targetDate?: string;
  goal?: WLGoal;
}): { targetKg: number; paceKgWeek: number; targetDate: string } {
  const today = new Date();
  const todayIso = today.toISOString().slice(0, 10);
  let { targetKg, paceKgWeek, targetDate } = opts;
  const { currentKg } = opts;
  const goal = opts.goal ?? "lose";
  const sign = goal === "gain" ? 1 : -1;

  const hasT = typeof targetKg === "number" && Number.isFinite(targetKg);
  const hasP = typeof paceKgWeek === "number" && Number.isFinite(paceKgWeek) && paceKgWeek! > 0;
  const hasD = !!targetDate;

  if (hasT && hasP && !hasD) {
    targetDate = projectedDateFromPace(currentKg, targetKg!, paceKgWeek!);
  } else if (hasT && hasD && !hasP) {
    const days = Math.max(1, Math.round((new Date(targetDate!).getTime() - today.getTime()) / 86400000));
    const weeks = Math.max(0.15, days / 7);
    paceKgWeek = Math.max(0.05, +(Math.abs((targetKg! - currentKg) / weeks)).toFixed(2));
  } else if (hasP && hasD && !hasT) {
    const days = Math.max(1, Math.round((new Date(targetDate!).getTime() - today.getTime()) / 86400000));
    const weeks = days / 7;
    targetKg = +(currentKg + sign * paceKgWeek! * weeks).toFixed(1);
  }
  return {
    targetKg: hasT || typeof targetKg === "number" ? +(targetKg as number).toFixed(1) : currentKg,
    paceKgWeek: paceKgWeek ?? 0.5,
    targetDate: targetDate ?? todayIso,
  };
}

// Daily calorie target, given pace + burns
export function computeIntake({
  tdee, goal, paceKgWeek, yogaCalBurn = 0, exerciseCalBurn = 0, sex,
}: { tdee: number; goal: WLGoal; paceKgWeek: number; yogaCalBurn?: number; exerciseCalBurn?: number; sex: Sex }) {
  // 1 kg fat ≈ 7700 kcal → daily delta from pace
  const dailyDelta = (paceKgWeek * 7700) / 7;
  const sign = goal === "lose" ? -1 : goal === "gain" ? +1 : 0;
  // Pace deficit (positive number for kcal cut/added)
  const paceKcal = Math.round(dailyDelta);
  // For weight loss, activity burns are additional deficit already captured in TDEE if reported in activity multiplier — to be safe, treat add-ons as EXTRA burn beyond baseline by subtracting them once on top of pace.
  const eat = Math.round(tdee + sign * (paceKcal + yogaCalBurn + exerciseCalBurn));
  const floor = sex === "female" ? 1200 : 1500;
  return Math.max(floor, eat);
}

export function projectedDate(p: WLPlan): string {
  return projectedDateFromPace(p.currentWeight, p.targetWeight, p.paceKgWeek);
}

export const KAPHA_FOODS = {
  eat: ["Barley, millet, quinoa", "Mung dal, lentils", "Bitter greens, cabbage, broccoli", "Apples, pears, berries", "Ginger, black pepper, turmeric", "Honey (raw, not heated)"],
  avoid: ["Wheat & refined flour", "Dairy (esp. cold milk, cheese)", "Fried, oily, deep-fried foods", "Bananas, dates, heavy fruits", "Sugar, sweets, cold drinks", "Late-night eating"],
};

export const GAIN_FOODS = {
  eat: ["Soaked almonds, walnuts, dates", "Ghee, milk (warm, with spices)", "Bananas, mangoes, figs", "Rice, sweet potatoes, oats", "Ashwagandha, shatavari", "Paneer, eggs, legumes"],
  avoid: ["Skipping meals", "Stimulants & excess coffee", "Cold, raw, dry foods", "Excess bitter / pungent foods"],
};

/* ---------------- pipeline orchestration ---------------- */
export type PipelineStep = "yoga" | "exercise" | "fasting" | "detox" | "diet";

export function startPipeline(steps: PipelineStep[]) {
  if (typeof window === "undefined") return;
  // diet always last
  const ordered = [...steps.filter((s) => s !== "diet"), "diet" as PipelineStep];
  try { window.localStorage.setItem(QUEUE_KEY, JSON.stringify(ordered)); } catch {}
}
export function getPipeline(): PipelineStep[] {
  if (typeof window === "undefined") return [];
  try { const r = window.localStorage.getItem(QUEUE_KEY); return r ? JSON.parse(r) : []; } catch { return []; }
}
export function currentPipelineStep(slug: string): boolean {
  const q = getPipeline(); return q[0] === slug;
}
export function advancePipeline(): PipelineStep | null {
  if (typeof window === "undefined") return null;
  const q = getPipeline();
  if (q.length === 0) return null;
  const next = q.slice(1);
  try { window.localStorage.setItem(QUEUE_KEY, JSON.stringify(next)); } catch {}
  return next[0] ?? null;
}
export function clearPipeline() {
  if (typeof window === "undefined") return;
  try { window.localStorage.removeItem(QUEUE_KEY); } catch {}
}
export const PIPELINE_ROUTE: Record<PipelineStep, string> = {
  yoga: "/section/yoga",
  exercise: "/section/exercise",
  fasting: "/section/fasting",
  detox: "/section/detox",
  diet: "/section/diet",
};

/* ---------------- profile helper ---------------- */
export interface AyuProfile {
  name?: string; age?: number; gender?: Sex; heightCm?: number; weightKg?: number;
  location?: string; activity?: ActivityLevel; bmr?: number; tdee?: number;
  prakriti?: { dosha: string; score: Record<string, number> } | null;
}
export function loadProfile(): AyuProfile | null {
  if (typeof window === "undefined") return null;
  try { const r = window.localStorage.getItem("ayuraise.profile"); return r ? JSON.parse(r) : null; } catch { return null; }
}

/* MET-based daily burn estimate */
export function estimateBurn(metMin: number, weightKg: number): number {
  // kcal = MET * 3.5 * kg / 200 per minute
  return Math.round((metMin * 3.5 * weightKg) / 200);
}
