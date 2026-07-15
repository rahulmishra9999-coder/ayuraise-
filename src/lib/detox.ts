// Detox library — Ayurveda-inspired cleanses (gentle panchakarma-style)

export type DetoxGoal =
  | "gut-healing"
  | "liver-cleanse"
  | "kapha-reset"
  | "skin-glow"
  | "post-festive"
  | "weight-loss"
  | "energy-reset";

export type DetoxDuration = 3 | 5 | 7;

export type DetoxType =
  | "kitchari-mono"
  | "fruit-veg"
  | "liquid-only"
  | "gut-healing"
  | "liver-flush"
  | "kapha-light";

export interface DetoxTypeInfo {
  id: DetoxType;
  title: string;
  blurb: string;
  bestFor: DetoxGoal[];
  intensity: "gentle" | "moderate" | "deep";
  highlights: string[];
}

export interface DetoxBenefit {
  emoji: string;
  title: string;
  desc: string;
}

export interface DayPlan {
  day: number;
  theme: string;
  morning: string;
  meals: { time: string; food: string }[];
  evening: string;
  herb: string;
}

export interface DetoxPlan {
  goal: DetoxGoal;
  duration: DetoxDuration;
  type: DetoxType;
  days: DayPlan[];
  createdAt: number;
}

export const DETOX_BENEFITS: DetoxBenefit[] = [
  { emoji: "✨", title: "Clears ama (toxins)", desc: "Undigested residue is the root of most disease in Ayurveda. A reset helps clear it." },
  { emoji: "🔥", title: "Reignites Agni", desc: "Light foods rebuild digestive fire so future meals are properly digested." },
  { emoji: "🌿", title: "Resets the gut", desc: "Gives the gut lining a few days off from heavy, processed and inflammatory foods." },
  { emoji: "💧", title: "Better hydration", desc: "Warm water, CCF tea and broths flush the lymphatic and urinary channels." },
  { emoji: "🪷", title: "Mental clarity", desc: "A lighter body means a lighter mind — sleep, mood and focus all improve." },
  { emoji: "⚖️", title: "Kickstarts weight loss", desc: "Drops water weight and breaks sugar / snacking loops before a longer plan." },
];

export const DETOX_TYPES: DetoxTypeInfo[] = [
  {
    id: "kitchari-mono",
    title: "Kitchari mono-diet",
    blurb: "Classic Ayurvedic reset — just kitchari (rice + mung dal + spices + ghee) for every meal.",
    bestFor: ["gut-healing", "post-festive", "kapha-reset"],
    intensity: "gentle",
    highlights: ["Easy to digest", "Tridoshic", "No cravings crash"],
  },
  {
    id: "fruit-veg",
    title: "Fruit & vegetable",
    blurb: "Raw and steamed fruits / vegetables only. High fibre, high water, very alkalising.",
    bestFor: ["skin-glow", "weight-loss", "energy-reset"],
    intensity: "moderate",
    highlights: ["Loaded with antioxidants", "High fibre", "Cooling — best in summer"],
  },
  {
    id: "liquid-only",
    title: "Liquid-only",
    blurb: "Soups, broths, juices, smoothies, herbal teas. Deepest digestive rest short of fasting.",
    bestFor: ["liver-cleanse", "post-festive", "weight-loss"],
    intensity: "deep",
    highlights: ["Maximum digestive rest", "Quick ama clearance", "Needs prep + ramp-down"],
  },
  {
    id: "gut-healing",
    title: "Gut-healing",
    blurb: "Bone broth or veg broth, fermented foods, soaked seeds, stewed apple, slippery elm.",
    bestFor: ["gut-healing", "skin-glow"],
    intensity: "gentle",
    highlights: ["Soothes the lining", "Rebuilds microbiome", "Great for IBS / bloating"],
  },
  {
    id: "liver-flush",
    title: "Liver-supportive",
    blurb: "Bitter greens, beetroot, lemon water, triphala, turmeric, dandelion tea.",
    bestFor: ["liver-cleanse", "skin-glow", "post-festive"],
    intensity: "moderate",
    highlights: ["Bitter + pungent foods", "Boosts bile flow", "Clears Pitta heat"],
  },
  {
    id: "kapha-light",
    title: "Kapha-light cleanse",
    blurb: "Warm, dry, light foods — barley, millet, ginger, honey, black pepper. No dairy / sugar / fried.",
    bestFor: ["kapha-reset", "weight-loss", "energy-reset"],
    intensity: "moderate",
    highlights: ["Cuts mucus + sluggishness", "Spring & winter ideal", "Drops water weight"],
  },
];

export const DETOX_GOALS: { id: DetoxGoal; label: string; emoji: string }[] = [
  { id: "gut-healing",  label: "Gut healing",          emoji: "🌀" },
  { id: "liver-cleanse",label: "Liver cleanse",        emoji: "🫀" },
  { id: "kapha-reset",  label: "Kapha / sluggishness", emoji: "🌬️" },
  { id: "skin-glow",    label: "Skin glow",            emoji: "✨" },
  { id: "post-festive", label: "Post-festive reset",   emoji: "🎉" },
  { id: "weight-loss",  label: "Kickstart weight loss",emoji: "⚖️" },
  { id: "energy-reset", label: "Energy reset",         emoji: "⚡" },
];

const HERB_ROTATION = [
  "Triphala (1 tsp in warm water, before bed)",
  "CCF tea — cumin, coriander, fennel (sip through the day)",
  "Ginger + lemon + honey (first thing AM)",
  "Tulsi tea (afternoon)",
  "Ajwain water (after meals)",
  "Turmeric + black pepper milk (bedtime)",
  "Aloe vera juice (empty stomach)",
];

function mealsForType(type: DetoxType, day: number): { time: string; food: string }[] {
  switch (type) {
    case "kitchari-mono":
      return [
        { time: "08:30", food: "Stewed apple with cinnamon" },
        { time: "12:30", food: "Kitchari with ghee + cumin + curry leaves" },
        { time: "18:30", food: "Soft kitchari with steamed bottle gourd" },
      ];
    case "fruit-veg":
      return [
        { time: "08:30", food: day % 2 ? "Papaya + soaked raisins" : "Watermelon + dates" },
        { time: "12:30", food: "Steamed veg bowl (sweet potato, beets, carrots) + lemon" },
        { time: "18:30", food: "Cucumber + tomato + sprouts salad with rock salt" },
      ];
    case "liquid-only":
      return [
        { time: "08:30", food: "Warm lemon water → fresh seasonal juice" },
        { time: "12:30", food: "Moong dal soup or veg broth" },
        { time: "18:30", food: "Tomato-spinach soup with black pepper" },
      ];
    case "gut-healing":
      return [
        { time: "08:30", food: "Stewed apple + soaked chia" },
        { time: "12:30", food: "Bone / veg broth + soft khichdi + ghee" },
        { time: "18:30", food: "Steamed zucchini + fermented kanji (small)" },
      ];
    case "liver-flush":
      return [
        { time: "07:30", food: "Lemon water + ½ tsp turmeric" },
        { time: "12:30", food: "Bitter greens sauté + beetroot + millet" },
        { time: "18:30", food: "Dandelion tea + steamed broccoli + lentil soup" },
      ];
    case "kapha-light":
      return [
        { time: "09:00", food: "Ginger-honey water + roasted millet poha" },
        { time: "13:00", food: "Barley khichdi with ajwain + black pepper" },
        { time: "18:00", food: "Spiced moong soup (no rice after sunset)" },
      ];
  }
}

const THEMES = ["Prepare & lighten", "Release", "Reset", "Rebuild", "Stabilise", "Integrate", "Carry forward"];

export function buildDetoxPlan(goal: DetoxGoal, duration: DetoxDuration, type: DetoxType): DetoxPlan {
  const days: DayPlan[] = Array.from({ length: duration }, (_, i) => {
    const day = i + 1;
    return {
      day,
      theme: THEMES[i] ?? `Day ${day}`,
      morning: "Tongue scrape → warm water → 10 min pranayam (Nadi Shodhan)",
      meals: mealsForType(type, day),
      evening: day === duration
        ? "Light walk → self-oil massage (abhyanga) → early sleep"
        : "20 min slow walk → warm shower → journal one line",
      herb: HERB_ROTATION[i % HERB_ROTATION.length],
    };
  });
  return { goal, duration, type, days, createdAt: Date.now() };
}

const KEY = "ayuraise.detox.plan";

export function saveDetoxPlan(plan: DetoxPlan) {
  if (typeof window === "undefined") return;
  try { window.localStorage.setItem(KEY, JSON.stringify(plan)); } catch {}
}
export function loadDetoxPlan(): DetoxPlan | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem(KEY);
    return raw ? (JSON.parse(raw) as DetoxPlan) : null;
  } catch { return null; }
}

export function recommendTypesFor(goal: DetoxGoal): DetoxTypeInfo[] {
  return DETOX_TYPES.filter((t) => t.bestFor.includes(goal));
}

export const DETOX_CAUTION = [
  "Don't start a detox during fever, infection, period heavy days, or pregnancy.",
  "If you have diabetes, kidney or heart conditions, check with a doctor first.",
  "Liquid-only and 7-day cleanses need a 1-day ramp-up and ramp-down.",
  "Stop and eat if you feel dizzy, weak or heart-racy — listen to your body.",
];
