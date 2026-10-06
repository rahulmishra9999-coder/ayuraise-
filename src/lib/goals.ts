// Unified, cross-modality goals for the redesigned home — aggregated from the yoga goal
// taxonomy, organ health and disease management, grouped under headers. Each group shows a
// few goals in a row on the home (`visibleCount`) with an "expand all" for the rest.

import { Dumbbell, Flower2, HeartPulse, Stethoscope, type LucideIcon } from "lucide-react";

export type Area = "yoga" | "exercise" | "diet" | "herbs" | "detox" | "fasting" | "meditation" | "learn";

export const AREA_META: Record<Area, { label: string; emoji: string; to: string }> = {
  yoga: { label: "Yoga", emoji: "🧘", to: "/section/yoga" },
  exercise: { label: "Exercise", emoji: "🏋️", to: "/section/exercise" },
  diet: { label: "Diet", emoji: "🥗", to: "/section/diet" },
  herbs: { label: "Herbs — do's & don'ts", emoji: "🌿", to: "/section/disease" },
  detox: { label: "Detox plan", emoji: "✨", to: "/section/detox" },
  fasting: { label: "Fasting / IF", emoji: "⏳", to: "/section/fasting" },
  meditation: { label: "Meditation", emoji: "🧠", to: "/section/meditation" },
  learn: { label: "Learn", emoji: "🎓", to: "/learn" },
};

export interface GoalItem { id: string; label: string; emoji: string }
export interface GoalGroup {
  id: string; header: string; emoji: string; icon: LucideIcon; gradient: string;
  areas: Area[];
  /** How many goals to show before "expand all" (conditions uses 10 = 2 rows, others 5 = 1 row). */
  visibleCount: number;
  goals: GoalItem[];
}

export const GOAL_GROUPS: GoalGroup[] = [
  {
    id: "fitness", header: "Fitness & Wellness", emoji: "💪", icon: Dumbbell, gradient: "var(--gradient-gold)",
    areas: ["yoga", "exercise", "diet", "fasting", "learn"], visibleCount: 5,
    goals: [
      { id: "weight-loss", label: "Weight Loss", emoji: "🔥" },
      { id: "better-sleep", label: "Better Sleep", emoji: "🌙" },
      { id: "stress", label: "Stress Relief", emoji: "🧘" },
      { id: "metabolic", label: "Metabolic Boost", emoji: "🍽️" },
      { id: "sr-fitness", label: "Sr. Fitness", emoji: "🧓" },
      { id: "general-wellness", label: "General Wellness", emoji: "🌿" },
      { id: "strength", label: "Strength", emoji: "💪" },
      { id: "flexibility", label: "Flexibility", emoji: "🤸" },
      { id: "mobility", label: "Mobility", emoji: "🔄" },
      { id: "balance", label: "Balance & Stability", emoji: "⚖️" },
      { id: "posture", label: "Better Posture", emoji: "🧍" },
      { id: "healthy-ageing", label: "Healthy Ageing", emoji: "🌳" },
      { id: "mood", label: "Lift Mood", emoji: "😊" },
      { id: "pranayam", label: "Breathwork / Pranayam", emoji: "🌬️" },
      { id: "muscle-building", label: "Muscle Building", emoji: "🏋️" },
    ],
  },
  {
    id: "womens", header: "Women's Health", emoji: "🌸", icon: Flower2, gradient: "var(--gradient-violet)",
    areas: ["yoga", "diet", "exercise", "herbs", "learn"], visibleCount: 5,
    goals: [
      { id: "pregnancy", label: "Pregnancy", emoji: "🤰" },
      { id: "post-natal", label: "Post-Natal", emoji: "👶" },
      { id: "pcos-pcod", label: "PCOS / PCOD", emoji: "🌸" },
      { id: "menopause", label: "Menopause", emoji: "🌼" },
      { id: "premenopause", label: "Pre-menopause", emoji: "🌷" },
      { id: "postmenopause", label: "Post-menopause", emoji: "🌺" },
    ],
  },
  {
    id: "organs", header: "Organ Health", emoji: "🫀", icon: HeartPulse, gradient: "var(--gradient-leaf)",
    areas: ["yoga", "diet", "herbs", "learn"], visibleCount: 5,
    goals: [
      { id: "heart", label: "Heart", emoji: "❤️" },
      { id: "kidney", label: "Kidney", emoji: "🫘" },
      { id: "liver", label: "Liver", emoji: "🟠" },
      { id: "gut", label: "Gut", emoji: "🌀" },
      { id: "lungs", label: "Lungs", emoji: "🫁" },
      { id: "brain", label: "Brain", emoji: "🧠" },
      { id: "pancreas", label: "Pancreas", emoji: "🩸" },
      { id: "prostate", label: "Prostate", emoji: "🚹" },
      { id: "skin", label: "Skin / Glow", emoji: "✨" },
      { id: "hair", label: "Hair", emoji: "💇" },
      { id: "bones-joints", label: "Bones & Joints", emoji: "🦴" },
      { id: "muscles", label: "Muscles", emoji: "💪" },
      { id: "eyes", label: "Eyes", emoji: "👁️" },
      { id: "immunity", label: "Immunity", emoji: "🛡️" },
    ],
  },
  {
    id: "conditions", header: "Lifestyle Conditions", emoji: "🩺", icon: Stethoscope, gradient: "var(--gradient-water)",
    areas: ["yoga", "diet", "herbs", "exercise", "learn"], visibleCount: 10,
    goals: [
      { id: "diabetes", label: "Diabetes", emoji: "💉" },
      { id: "hypertension", label: "BP / Hypertension", emoji: "🩺" },
      { id: "thyroid", label: "Thyroid", emoji: "🦋" },
      { id: "cholesterol", label: "Cholesterol", emoji: "🧈" },
      { id: "fatty-liver", label: "Fatty Liver", emoji: "🍔" },
      { id: "acidity-gerd", label: "Acidity / GERD", emoji: "🌶️" },
      { id: "migraine", label: "Migraine", emoji: "🤕" },
      { id: "asthma", label: "Asthma", emoji: "😮‍💨" },
      { id: "back-pain", label: "Back Pain", emoji: "🦴" },
      { id: "knee-pain", label: "Knee Pain", emoji: "🦵" },
      { id: "neck-pain", label: "Neck Pain", emoji: "💆" },
      { id: "hip-pain", label: "Hip Pain", emoji: "🩰" },
      { id: "sciatica", label: "Sciatica", emoji: "⚡" },
      { id: "arthritis", label: "Arthritis", emoji: "🖐️" },
      { id: "osteoarthritis", label: "Osteoarthritis", emoji: "🦿" },
      { id: "osteoporosis", label: "Osteoporosis", emoji: "🧬" },
      { id: "gout", label: "Gout / Uric Acid", emoji: "🦶" },
      { id: "obesity", label: "Obesity", emoji: "⚖️" },
      { id: "ibs", label: "IBS", emoji: "💢" },
      { id: "constipation", label: "Constipation", emoji: "🚽" },
      { id: "indigestion", label: "Indigestion", emoji: "🤢" },
      { id: "autoimmune", label: "Auto-immune", emoji: "🛡️" },
      { id: "hernia", label: "Hernia", emoji: "🩹" },
      { id: "hair-fall", label: "Hair fall / scalp", emoji: "💇" },
    ],
  },
];

/** Practices shown under "Browse by practice" on the home (no disease mgmt / weight-loss here). */
export const PRACTICE_SLUGS = ["yoga", "exercise", "diet", "detox", "fasting", "meditation"] as const;
export const PRACTICE_LABELS: Record<(typeof PRACTICE_SLUGS)[number], string> = {
  yoga: "Yoga", exercise: "Exercise", diet: "Diet", detox: "Detox", fasting: "Fasting / IF", meditation: "Meditation",
};

/** Flat registry of every goal → its label, emoji and owning group's gradient. */
export interface GoalMeta { label: string; emoji: string; gradient: string; groupId: string }
export const ALL_GOALS: Record<string, GoalMeta> = (() => {
  const m: Record<string, GoalMeta> = {};
  for (const g of GOAL_GROUPS) for (const it of g.goals) m[it.id] = { label: it.label, emoji: it.emoji, gradient: g.gradient, groupId: g.id };
  return m;
})();

/** Home "Browse by goal" is a grid of tiles: some are single goals (open), others are
 *  umbrellas that expand to reveal related goals. Every goal id lives in exactly one tile. */
export type HomeTile =
  | { kind: "goal"; id: string }
  | { kind: "umbrella"; id: string; label: string; emoji: string; gradient: string; goalIds: string[] };

// Browse-by-goals: five groups, each a tap-to-open umbrella listing all its items.
export const HOME_GOAL_TILES: HomeTile[] = [
  { kind: "umbrella", id: "u-manage", label: "Manage health conditions", emoji: "🩺", gradient: "var(--gradient-water)",
    goalIds: ["diabetes", "hypertension", "thyroid", "cholesterol", "fatty-liver", "asthma", "migraine", "gout", "autoimmune", "hernia", "knee-pain", "hip-pain", "back-pain", "neck-pain", "sciatica", "arthritis", "osteoporosis", "acidity-gerd", "ibs", "constipation", "indigestion"] },
  { kind: "umbrella", id: "u-fitness", label: "Fitness goals", emoji: "💪", gradient: "var(--gradient-gold)",
    goalIds: ["weight-loss", "general-wellness", "strength", "muscle-building", "flexibility", "mobility"] },
  { kind: "umbrella", id: "u-womens", label: "Women's health", emoji: "🌸", gradient: "var(--gradient-violet)",
    goalIds: ["pregnancy", "post-natal", "premenopause", "postmenopause", "pcos-pcod"] },
  { kind: "umbrella", id: "u-improve", label: "Improve & strengthen", emoji: "🫀", gradient: "var(--gradient-leaf)",
    goalIds: ["heart", "liver", "gut", "lungs", "brain", "pancreas", "bones-joints", "prostate", "hair-fall", "skin", "eyes", "immunity", "better-sleep", "stress"] },
];

export interface ResolvedGoal { id: string; label: string; emoji: string; areas: Area[]; group: string; groupId: string }
export function getGoal(id: string): ResolvedGoal | undefined {
  for (const g of GOAL_GROUPS) {
    const item = g.goals.find((x) => x.id === id);
    if (item) return { id: item.id, label: item.label, emoji: item.emoji, areas: g.areas, group: g.header, groupId: g.id };
  }
  return undefined;
}
