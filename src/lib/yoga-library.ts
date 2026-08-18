// Premium yoga library — Calm/Down-Dog-style taxonomy, saved plans, practice history.
// Each library item maps to the existing pose engine (yoga.ts) via a goal/disease pair.

import { POSES, generatePlan, type Goal, type Disease, type YogaPlan } from "./yoga";

export interface LibItem {
  id: string;
  label: string;
  emoji: string;
  goal?: Goal;
  disease?: Disease;
  blurb?: string;
  durations?: number[]; // custom time options for this item
}

export interface LibCategory { id: string; title: string; items: LibItem[] }

/** "Select a Goal & Practice" — outcome-driven categories. */
export const GOAL_GROUPS: LibCategory[] = [
  {
    id: "quick",
    title: "Quick Start",
    items: [
      { id: "beginner", label: "Beginner Friendly", emoji: "🌱", goal: "general-wellness", durations: [10, 20, 30, 40] },
      { id: "advanced", label: "Advanced", emoji: "🔥", goal: "strength", durations: [10, 20, 30, 40] },
      { id: "only-pranayam", label: "Only Pranayam", emoji: "🌬️", goal: "stress-relief", durations: [10, 20, 30, 40] },
      { id: "full-body", label: "Full Body Yoga", emoji: "🧘", goal: "general-wellness", durations: [10, 20, 30, 40, 50, 60] },
      { id: "morning-wake", label: "2-Min Morning Wake-up", emoji: "🌅", goal: "general-wellness", durations: [2, 5, 10] },
      { id: "surya", label: "Surya Namaskars", emoji: "☀️", goal: "weight-loss", durations: [10, 20, 30, 40] },
      { id: "chair", label: "Chair Yoga", emoji: "🪑", goal: "general-wellness", durations: [5, 10, 20, 30, 40] },
      { id: "desk", label: "5-Min Desk Stretch", emoji: "💼", goal: "flexibility", durations: [1, 2, 5, 10] },
      { id: "evening-relax", label: "10-Min Evening Relaxation", emoji: "🌇", goal: "stress-relief", durations: [5, 10, 20, 30] },
      { id: "before-bed", label: "5-Min Before Bed", emoji: "🌙", goal: "stress-relief", durations: [2, 5, 10, 15] },
    ],
  },
  {
    id: "goal-based",
    title: "Goal-based",
    items: [
      { id: "flexibility", label: "Flexibility", emoji: "🤸", goal: "flexibility" },
      { id: "strength", label: "Strength", emoji: "💪", goal: "strength" },
      { id: "weight-loss", label: "Weight Loss", emoji: "🔥", goal: "weight-loss" },
      { id: "stress", label: "Stress Relief", emoji: "🧘", goal: "stress-relief" },
      { id: "anxiety", label: "Anxiety Support", emoji: "🫧", goal: "stress-relief", disease: "anxiety" },
      { id: "low-mood", label: "Low Mood", emoji: "🌷", goal: "stress-relief" },
    ],
  },
  {
    id: "joint-spine",
    title: "Joint & Spine Care",
    items: [
      { id: "knees-ankles", label: "Knees & Ankles", emoji: "🦿", goal: "strength", disease: "knee-pain" },
      { id: "back-spine", label: "Back & Spine", emoji: "🔙", goal: "flexibility", disease: "back-pain" },
      { id: "neck-shoulder", label: "Neck & Shoulder", emoji: "💆", goal: "flexibility" },
      { id: "hips-pelvis", label: "Hips & Pelvis", emoji: "🌸", goal: "flexibility" },
      { id: "joint-mobility", label: "Joint Mobility", emoji: "🔄", goal: "flexibility" },
      { id: "posture", label: "Improve Posture", emoji: "🧍", goal: "strength" },
    ],
  },
  {
    id: "conditions",
    title: "Manage Health Conditions",
    items: [
      { id: "bp", label: "BP / Hypertension", emoji: "🫀", goal: "disease-management", disease: "hypertension" },
      { id: "heart", label: "Heart Health", emoji: "❤️", goal: "disease-management", disease: "hypertension" },
      { id: "diabetes", label: "Diabetes", emoji: "🍬", goal: "disease-management", disease: "diabetes" },
      { id: "kidney", label: "Kidney Health", emoji: "🫘", goal: "general-wellness" },
      { id: "prostate", label: "Prostate Health", emoji: "💧", goal: "general-wellness" },
      { id: "gut", label: "Digestive System & Gut", emoji: "🌱", goal: "general-wellness", disease: "acidity" },
      { id: "asthma", label: "Asthma", emoji: "🌬️", goal: "disease-management", disease: "asthma" },
      { id: "pcos", label: "PCOS", emoji: "🌺", goal: "disease-management", disease: "pcos" },
      { id: "thyroid", label: "Thyroid", emoji: "🦋", goal: "disease-management", disease: "thyroid" },
      { id: "arthritis", label: "Arthritis", emoji: "🌿", goal: "disease-management", disease: "knee-pain" },
      { id: "sciatica", label: "Sciatica", emoji: "⚡", goal: "disease-management", disease: "back-pain" },
    ],
  },
  {
    id: "women",
    title: "Women's Wellness",
    items: [
      { id: "w-pcos", label: "PCOS", emoji: "🌸", goal: "disease-management", disease: "pcos" },
      { id: "pregnancy", label: "Pregnancy", emoji: "🤰", goal: "general-wellness" },
      { id: "postpartum", label: "Postpartum", emoji: "🌱", goal: "strength" },
      { id: "menopause", label: "Menopause", emoji: "🍃", goal: "stress-relief" },
    ],
  },
  {
    id: "kids",
    title: "For Kids",
    items: [
      { id: "kids", label: "Kids 3–6", emoji: "🧒", goal: "general-wellness" },
      { id: "teens", label: "Teens", emoji: "🧑", goal: "strength" },
      { id: "family", label: "Family Fun", emoji: "👨‍👩‍👧", goal: "general-wellness" },
    ],
  },
];

/* ---- "Know Yoga Techniques & Practice" — asanas, pranayama, bandhas ---- */

export interface Technique { id: string; name: string; sanskrit?: string; emoji: string; note: string; poseId?: string }

export const TECH_INTRO = {
  asana: "Asanas are physical postures — held with breath, they build strength, flexibility and steadiness of body and mind.",
  pranayama: "Pranayama is breath regulation — the fastest lever on the nervous system, calming or energising you at will.",
  bandha: "Bandhas are internal 'locks' — gentle muscular engagements that contain and channel energy through the body.",
};

/** Asanas mirror the pose engine so each is practisable. */
export const ASANAS: Technique[] = POSES.map((p) => ({ id: p.id, name: p.name, sanskrit: p.sanskrit, emoji: p.emoji, note: p.benefits.join(" · "), poseId: p.id }));

export const PRANAYAMAS: Technique[] = [
  { id: "anulom-vilom", name: "Anulom Vilom", sanskrit: "Nadi Shodhana", emoji: "🌬️", note: "Alternate-nostril — balance & calm", poseId: "anulom-vilom" },
  { id: "bhramari", name: "Bhramari", sanskrit: "Humming Bee", emoji: "🐝", note: "Instant calm, eases anxiety", poseId: "bhramari" },
  { id: "kapalbhati", name: "Kapalbhati", sanskrit: "Skull Shining", emoji: "☀️", note: "Energising, clears the mind" },
  { id: "bhastrika", name: "Bhastrika", sanskrit: "Bellows Breath", emoji: "🔥", note: "Heat & vigour" },
  { id: "sheetali", name: "Sheetali", sanskrit: "Cooling Breath", emoji: "❄️", note: "Cools pitta & acidity" },
  { id: "ujjayi", name: "Ujjayi", sanskrit: "Ocean Breath", emoji: "🌊", note: "Focus during asana" },
];

export const BANDHAS: Technique[] = [
  { id: "mula", name: "Mula Bandha", sanskrit: "Root Lock", emoji: "🌱", note: "Pelvic floor — stability & energy" },
  { id: "uddiyana", name: "Uddiyana Bandha", sanskrit: "Abdominal Lock", emoji: "🔩", note: "Core & digestion" },
  { id: "jalandhara", name: "Jalandhara Bandha", sanskrit: "Throat Lock", emoji: "🧣", note: "Calm & focus" },
];

/** Build a session from a hand-picked bundle of technique ids (that map to poses). */
export function buildBundleSession(techIds: string[]): YogaPlan {
  const poseIds = techIds
    .map((id) => (ASANAS.find((a) => a.id === id)?.poseId) ?? (PRANAYAMAS.find((p) => p.id === id)?.poseId))
    .filter((x): x is string => !!x);
  return { createdAt: Date.now(), disease: "none", goal: "general-wellness", duration: Math.max(5, poseIds.length * 1), poseIds: poseIds.length ? poseIds : [POSES[0].id] };
}

/** A single technique → a short practisable session. */
export function techniqueSession(t: Technique): YogaPlan {
  const id = t.poseId ?? POSES[0].id;
  return { createdAt: Date.now(), disease: "none", goal: "general-wellness", duration: 5, poseIds: [id] };
}

export function findLibItem(id: string): LibItem | undefined {
  for (const c of GOAL_GROUPS) { const it = c.items.find((x) => x.id === id); if (it) return it; }
  return undefined;
}

/* ---- Learn + About Yoga ---- */

export const YOGA_LEARN = [
  { emoji: "🌿", title: "Why yoga works", body: "Yoga trains the nervous system, not just muscles. Slow breath + held postures shift you out of fight-or-flight, lower cortisol, and improve heart-rate variability — the body's core resilience marker." },
  { emoji: "⏳", title: "Yoga & anti-aging", body: "Regular practice preserves mobility, balance and muscle — the three things that decide independence in later life. Studies link yoga to longer telomeres and lower inflammation, both markers of slower biological aging." },
  { emoji: "🔄", title: "Reversing chronic disease", body: "For BP, type-2 diabetes, back pain and PCOS, yoga is a proven adjunct: it improves insulin sensitivity, lowers resting BP, and eases pain by strengthening the muscles that protect joints — often reducing the medication needed, with your doctor." },
];

export interface AboutGroup { id: string; title: string; blurb: string; items: { name: string; note: string }[] }

export const YOGA_ABOUT: AboutGroup[] = [
  {
    id: "asanas", title: "Asanas", blurb: "Physical postures that build strength, flexibility and steadiness.",
    items: [
      { name: "Tadasana", note: "Mountain — posture & grounding" },
      { name: "Vrikshasana", note: "Tree — balance & focus" },
      { name: "Bhujangasana", note: "Cobra — spine & chest opener" },
      { name: "Marjariasana", note: "Cat-Cow — spinal mobility" },
      { name: "Trikonasana", note: "Triangle — side body & legs" },
      { name: "Setu Bandhasana", note: "Bridge — back & glutes" },
      { name: "Balasana", note: "Child — rest & release" },
      { name: "Paschimottanasana", note: "Seated forward fold — hamstrings" },
      { name: "Shavasana", note: "Corpse — deep integration" },
    ],
  },
  {
    id: "pranayama", title: "Pranayama", blurb: "Breath regulation — the fastest lever on the nervous system.",
    items: [
      { name: "Anulom Vilom", note: "Alternate-nostril — balance & calm" },
      { name: "Bhramari", note: "Humming bee — instant calm" },
      { name: "Kapalbhati", note: "Skull-shining — energising" },
      { name: "Bhastrika", note: "Bellows — heat & vigour" },
      { name: "Sheetali", note: "Cooling breath — for pitta/acidity" },
      { name: "Ujjayi", note: "Ocean breath — focus during asana" },
    ],
  },
  {
    id: "mudras", title: "Mudras", blurb: "Hand gestures that subtly steer energy and attention.",
    items: [
      { name: "Gyan Mudra", note: "Knowledge — focus in meditation" },
      { name: "Prana Mudra", note: "Vitality — energy & immunity" },
      { name: "Apana Mudra", note: "Elimination — digestion & detox" },
      { name: "Dhyana Mudra", note: "Meditation — deep stillness" },
    ],
  },
  {
    id: "bandhas", title: "Bandhas", blurb: "Internal 'locks' that contain and direct energy.",
    items: [
      { name: "Mula Bandha", note: "Root lock — pelvic floor" },
      { name: "Uddiyana Bandha", note: "Abdominal lock — core & digestion" },
      { name: "Jalandhara Bandha", note: "Throat lock — calm & focus" },
    ],
  },
  {
    id: "dhyana", title: "Dhyana", blurb: "Meditation — the goal the postures prepare you for.",
    items: [
      { name: "Breath awareness", note: "Anchor attention on the breath" },
      { name: "Trataka", note: "Candle gazing — concentration" },
      { name: "Body scan", note: "Systematic relaxation" },
      { name: "Mantra japa", note: "Repetition for stillness" },
    ],
  },
];

/* ---- My saved plans ---- */

export interface SavedYogaPlan extends YogaPlan {
  id: string;
  name: string;
  withFeedback: boolean;
  secondaryGoal?: Goal;
}

const PLANS_KEY = "ayuraise.yoga.myPlans";

function read<T>(key: string, fb: T): T {
  if (typeof window === "undefined") return fb;
  try { const r = window.localStorage.getItem(key); return r ? (JSON.parse(r) as T) : fb; } catch { return fb; }
}
function write(key: string, v: unknown) {
  if (typeof window === "undefined") return;
  try { window.localStorage.setItem(key, JSON.stringify(v)); } catch {}
}

export function loadMyYogaPlans(): SavedYogaPlan[] { return read<SavedYogaPlan[]>(PLANS_KEY, []); }
export function saveMyYogaPlan(p: SavedYogaPlan): SavedYogaPlan[] {
  const all = [...loadMyYogaPlans().filter((x) => x.id !== p.id), p];
  write(PLANS_KEY, all);
  return all;
}
export function deleteMyYogaPlan(id: string): SavedYogaPlan[] {
  const all = loadMyYogaPlans().filter((x) => x.id !== id);
  write(PLANS_KEY, all);
  return all;
}

/* ---- Practice history ---- */

export interface YogaHistoryEntry { date: string; label: string; minutes: number; kcal: number }

const HIST_KEY = "ayuraise.yoga.history";

export function loadYogaHistory(): YogaHistoryEntry[] { return read<YogaHistoryEntry[]>(HIST_KEY, []); }
export function addYogaHistory(e: YogaHistoryEntry): YogaHistoryEntry[] {
  const all = [...loadYogaHistory(), e].slice(-60);
  write(HIST_KEY, all);
  return all;
}

/** Yoga is ~3 MET; kcal = MET × 3.5 × kg / 200 × minutes. */
export function yogaKcal(minutes: number, weightKg = 68): number {
  return Math.round((3 * 3.5 * weightKg / 200) * minutes);
}

/** Build a session (list of poses) for a library item at a chosen duration. */
export function sessionFor(item: LibItem, minutes: number): YogaPlan {
  return generatePlan(item.disease ?? "none", item.goal ?? "general-wellness", minutes);
}
