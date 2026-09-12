// Ready-made yoga plans, grouped into categories. Tapping one opens it (with sensible
// defaults) so the user can customise, favourite, or make it their current plan.

import { WEEKDAYS, newPlanId, type YogaPlan } from "@/lib/yoga-plan";

export type YogaCategory = "styles" | "fitness" | "calm" | "quick" | "specific";

export const CATEGORY_LABELS: Record<YogaCategory, string> = {
  styles: "Styles",
  fitness: "Fitness",
  calm: "Calm & Sleep",
  quick: "Quick",
  specific: "Specific needs",
};
export const CATEGORY_ORDER: YogaCategory[] = ["styles", "fitness", "calm", "quick", "specific"];

export interface YogaTemplate {
  id: string;
  name: string;
  emoji: string;
  blurb: string;
  tagline?: string;          // shown only on style cards, e.g. "Wellness with Hatha"
  category: YogaCategory;
  primary: string;
  secondary?: string;
  level: "Beginner" | "Intermediate" | "Advanced";
  weeks: number;
  daysCount: number;         // → first N weekdays
  duration: number;          // default minutes / session
  // per-program start-flow tweaks
  noLevel?: boolean;
  noProtect?: boolean;
  trimester?: boolean;
  technique?: boolean;
  noCurrent?: boolean;   // can be favourited but not made the current plan (Quick)
}

/** Base YogaPlan from a template (defaults: 20 min / Beginner unless the template overrides). */
export function templateToPlan(t: YogaTemplate): YogaPlan {
  return {
    id: newPlanId(),
    name: t.name,
    sourceId: t.id,
    primary: t.primary,
    secondary: t.secondary ?? null,
    level: t.level,
    weeks: t.weeks,
    daysPerWeek: t.daysCount,
    days: WEEKDAYS.slice(0, t.daysCount).map((w) => w.id),
    duration: t.duration,
    protect: [],
    updatedAt: Date.now(),
  };
}

export const YOGA_TEMPLATES: YogaTemplate[] = [
  // ---------- Styles (taglines) ----------
  { id: "style-hatha", name: "Hatha", emoji: "🕉️", tagline: "Wellness with Hatha", blurb: "Classic, steady poses held with the breath — a calm foundation.", category: "styles", primary: "General Wellness", level: "Beginner", weeks: 4, daysCount: 4, duration: 20 },
  { id: "style-vinyasa", name: "Vinyasa", emoji: "🌀", tagline: "Fitness with Vinyasa", blurb: "Breath-linked flowing sequences that build heat.", category: "styles", primary: "General Wellness", secondary: "Strength", level: "Beginner", weeks: 4, daysCount: 4, duration: 20 },
  { id: "style-power", name: "Power Yoga", emoji: "⚡", tagline: "Get stronger with Power Yoga", blurb: "Vigorous, strength-focused flows for a real workout.", category: "styles", primary: "Strength", secondary: "Weight Loss", level: "Beginner", weeks: 6, daysCount: 5, duration: 20 },

  // ---------- Fitness ----------
  { id: "beginner-foundations", name: "Beginner Foundations", emoji: "🌱", blurb: "A gentle on-ramp — learn the core poses and breath.", category: "fitness", primary: "General Wellness", level: "Beginner", weeks: 2, daysCount: 5, duration: 20 },
  { id: "general-fitness", name: "General Fitness", emoji: "💪", blurb: "Balanced strength, flexibility and stamina for everyday life.", category: "fitness", primary: "General Wellness", secondary: "Strength", level: "Beginner", weeks: 4, daysCount: 4, duration: 20 },
  { id: "weight-loss", name: "Weight Loss", emoji: "🔥", blurb: "Active, calorie-burning flows to support fat loss.", category: "fitness", primary: "Weight Loss", secondary: "Metabolic Health", level: "Beginner", weeks: 8, daysCount: 5, duration: 20 },
  { id: "surya-namaskar", name: "Surya Namaskar", emoji: "🌅", blurb: "Build up to a flowing daily sun-salutation practice.", category: "fitness", primary: "General Wellness", secondary: "Strength", level: "Beginner", weeks: 4, daysCount: 6, duration: 20 },
  { id: "advanced-yoga", name: "Advanced Yoga", emoji: "🤸", blurb: "Arm balances, inversions and deep backbends — for experienced yogis.", category: "fitness", primary: "Flexibility", secondary: "Strength", level: "Beginner", weeks: 6, daysCount: 5, duration: 20 },

  // ---------- Calm & Sleep ----------
  { id: "stress-relief", name: "Stress Relief", emoji: "🧘", blurb: "Calming movement and breath to ease tension and worry.", category: "calm", primary: "Stress & Anxiety Relief", level: "Beginner", weeks: 4, daysCount: 3, duration: 20, noLevel: true, noProtect: true },
  { id: "better-sleep", name: "Better Sleep", emoji: "🌙", blurb: "Wind-down sequences to help you fall asleep faster.", category: "calm", primary: "Better Sleep", level: "Beginner", weeks: 3, daysCount: 5, duration: 20, noLevel: true },
  { id: "somatic", name: "Somatic", emoji: "🌊", blurb: "Slow, mindful movement to release held tension.", category: "calm", primary: "Mobility", secondary: "Stress & Anxiety Relief", level: "Beginner", weeks: 4, daysCount: 4, duration: 20, noLevel: true },
  { id: "yin", name: "Yin", emoji: "🧊", blurb: "Long, passive holds that open connective tissue and joints.", category: "calm", primary: "Flexibility", level: "Beginner", weeks: 4, daysCount: 3, duration: 20, noLevel: true, noProtect: true },
  { id: "restorative", name: "Restorative", emoji: "🛋️", blurb: "Fully supported rest poses for deep recovery.", category: "calm", primary: "Stress & Anxiety Relief", secondary: "Better Sleep", level: "Beginner", weeks: 4, daysCount: 3, duration: 20, noLevel: true, noProtect: true },
  { id: "pranayam", name: "Pranayam", emoji: "🌬️", blurb: "Daily breathwork to steady energy and the mind.", category: "calm", primary: "Breathwork / Pranayama", level: "Beginner", weeks: 4, daysCount: 6, duration: 15, noLevel: true, noProtect: true },

  // ---------- Quick (short daily sessions; ask duration only) ----------
  { id: "quick-office", name: "Office Yoga", emoji: "💻", blurb: "Desk resets for posture, neck and shoulders.", category: "quick", primary: "Better Posture", secondary: "Neck & Shoulder", level: "Beginner", weeks: 1, daysCount: 5, duration: 2, noLevel: true, noProtect: true },
  { id: "quick-before-bed", name: "Before Bed", emoji: "🛏️", blurb: "A short nightly stretch to unwind body and mind.", category: "quick", primary: "Better Sleep", level: "Beginner", weeks: 1, daysCount: 7, duration: 5, noLevel: true, noProtect: true },
  { id: "quick-wakeup", name: "Wake-up Yoga", emoji: "☀️", blurb: "A short morning wake-up to shake off sleep.", category: "quick", primary: "Beat Fatigue", level: "Beginner", weeks: 1, daysCount: 7, duration: 5, noLevel: true, noProtect: true },
  { id: "quick-evening", name: "Evening Relaxation", emoji: "🌆", blurb: "Decompress after the day.", category: "quick", primary: "Stress & Anxiety Relief", level: "Beginner", weeks: 1, daysCount: 7, duration: 10, noLevel: true, noProtect: true },

  // ---------- Specific needs (not in your 4 categories — kept here; tell me to drop/move) ----------
  { id: "sr-fitness", name: "Sr. Fitness", emoji: "🧓", blurb: "Safe, gentle practice for strength, balance and mobility.", category: "specific", primary: "Sr. Fitness", secondary: "Balance & Stability", level: "Beginner", weeks: 4, daysCount: 3, duration: 20 },
  { id: "chair-yoga", name: "Chair Yoga", emoji: "🪑", blurb: "Seated and supported — perfect if the floor is hard to reach.", category: "specific", primary: "Mobility", level: "Beginner", weeks: 4, daysCount: 4, duration: 20 },
  { id: "kids-3-6", name: "Kids 3–6", emoji: "🧒", blurb: "Playful animal poses and games — best done with a grown-up.", category: "specific", primary: "General Wellness", level: "Beginner", weeks: 4, daysCount: 3, duration: 20 },
  { id: "teen", name: "Teen", emoji: "🧑", blurb: "Energy, focus and calm for busy teenage days.", category: "specific", primary: "General Wellness", secondary: "Stress & Anxiety Relief", level: "Beginner", weeks: 4, daysCount: 4, duration: 20 },
  { id: "pregnancy", name: "Pregnancy", emoji: "🤰", blurb: "Gentle, trimester-safe movement — with your doctor's okay.", category: "specific", primary: "Pregnancy", level: "Beginner", weeks: 6, daysCount: 3, duration: 20, noLevel: true, trimester: true },
  { id: "diabetic-friendly", name: "Diabetic-Friendly", emoji: "🩺", blurb: "Gentle, supportive practice to complement diabetes care.", category: "specific", primary: "Diabetes", level: "Beginner", weeks: 8, daysCount: 5, duration: 20 },
  { id: "gut-rest", name: "One Gut Rest", emoji: "🌿", blurb: "Soothing twists and folds to ease bloating and digestion.", category: "specific", primary: "Gut", level: "Beginner", weeks: 4, daysCount: 4, duration: 20 },
];
