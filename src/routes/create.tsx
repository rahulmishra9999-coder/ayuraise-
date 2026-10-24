import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useMemo, useRef, useState } from "react";
import { ArrowLeft, Info, Mic, MicOff, X, Repeat } from "lucide-react";
import { BottomNav } from "@/components/BottomNav";
import { ALL_GOALS, getGoal } from "@/lib/goals";
import { loadYogaPlans, newPlanId, upsertYogaPlan, WEEKDAYS, type YogaPlan } from "@/lib/yoga-plan";
import { buildMealPlan } from "@/lib/meal-plan";
import { MealPlanView, MAIN_INGREDIENTS } from "@/components/MealPlanView";
import { ING_META, ingredientWhy } from "@/lib/ingredients";
import { TermList } from "@/components/TermTip";
import { CuisinePicker } from "@/components/CuisinePicker";
import { cuisineRegion } from "@/lib/cuisines";
import { calcBMR, ACTIVITY_LABEL, type ActivityLevel, type Sex } from "@/lib/weight-loss";
import type { Dosha } from "@/lib/diet";
import { SUPPORT } from "@/lib/support";

export const Route = createFileRoute("/create")({
  validateSearch: (s: Record<string, unknown>): { goal?: string; edit?: string; goals?: string; tool?: string } => ({
    goal: typeof s.goal === "string" ? s.goal : undefined,
    edit: typeof s.edit === "string" ? s.edit : undefined,
    goals: typeof s.goals === "string" ? s.goals : undefined,
    tool: typeof s.tool === "string" ? s.tool : undefined,
  }),
  component: CreatePlan,
});

/* ---------- interventions we let the user personalize + how important each is ---------- */
type IvKey = "diet" | "yoga" | "exercise" | "fasting" | "detox" | "meditation";
const SELECTABLE: IvKey[] = ["yoga", "exercise", "diet"];
const IV_META: Record<string, { label: string; emoji: string }> = {
  diet: { label: "Diet", emoji: "🥗" },
  yoga: { label: "Yoga", emoji: "🧘" },
  exercise: { label: "Exercise", emoji: "🏋️" },
};
const GROUP_DEFAULT: Record<string, Partial<Record<IvKey, number>>> = {
  fitness: { exercise: 5, yoga: 4, diet: 4 },
  womens: { yoga: 5, diet: 4, exercise: 3 },
  organs: { diet: 5, yoga: 4 },
  conditions: { diet: 5, yoga: 4, exercise: 4 },
};
const GOAL_RANK: Record<string, Partial<Record<IvKey, number>>> = {
  diabetes: { diet: 5, exercise: 5, yoga: 4 },
  "weight-loss": { exercise: 5, diet: 5, yoga: 4 },
  obesity: { exercise: 5, diet: 5, yoga: 4 },
  thyroid: { diet: 5, yoga: 4, exercise: 3 },
  hypertension: { diet: 5, yoga: 5, exercise: 4 },
  cholesterol: { diet: 5, exercise: 5, yoga: 3 },
  "better-sleep": { yoga: 5, diet: 3 },
  stress: { yoga: 5, exercise: 3, diet: 3 },
  metabolic: { exercise: 5, diet: 5, yoga: 3 },
  heart: { exercise: 5, diet: 5, yoga: 4 },
  "fatty-liver": { diet: 5, exercise: 4, yoga: 3 },
  gut: { diet: 5, yoga: 4 },
  "acidity-gerd": { diet: 5, yoga: 4 },
  ibs: { diet: 5, yoga: 4 },
  constipation: { diet: 5, yoga: 4 },
  indigestion: { diet: 5, yoga: 4 },
  migraine: { yoga: 4, diet: 4 },
  asthma: { yoga: 5, diet: 3 },
  "knee-pain": { yoga: 5, exercise: 4 },
  "hip-pain": { yoga: 5, exercise: 4 },
  "back-pain": { yoga: 5, exercise: 4 },
  "neck-pain": { yoga: 5, exercise: 4 },
  sciatica: { yoga: 5, exercise: 4 },
  arthritis: { yoga: 5, exercise: 4, diet: 3 },
  osteoporosis: { exercise: 5, yoga: 4, diet: 4 },
  "healthy-ageing": { exercise: 5, yoga: 4, diet: 4 },
  "general-wellness": { yoga: 4, exercise: 4, diet: 4 },
  pregnancy: { yoga: 5, diet: 4 },
  "post-natal": { yoga: 5, exercise: 4, diet: 4 },
  "pcos-pcod": { diet: 5, exercise: 5, yoga: 4 },
  menopause: { exercise: 5, diet: 4, yoga: 4 },
};
function rankFor(goalIds: string[]): { key: IvKey; imp: number }[] {
  const merged: Record<string, number> = { diet: 0, yoga: 0, exercise: 0 };
  for (const id of goalIds) {
    const g = getGoal(id);
    const base = GOAL_RANK[id] ?? (g ? GROUP_DEFAULT[g.groupId] : undefined) ?? GROUP_DEFAULT.fitness;
    for (const k of SELECTABLE) merged[k] = Math.max(merged[k], base[k] ?? 0);
  }
  return SELECTABLE.map((k) => ({ key: k, imp: merged[k] || 3 })).sort((a, b) => b.imp - a.imp);
}

/* ---------- options ---------- */
const LEVELS = ["Beginner", "Intermediate", "Advanced"];
const DURATIONS = [10, 15, 20, 30, 45, 60];
const PROTECT = ["Knees", "Lower back", "Neck", "Shoulders", "Wrists", "Hips"];
const EX_FOCUS = ["Full body", "Upper body", "Lower body", "Core / Abs", "Cardio"];
const EQUIP = ["None (bodyweight)", "Dumbbells", "Resistance bands", "Full gym"];
const DIET_PREFS = ["Vegetarian", "Vegan", "Eggetarian", "Jain (no roots)", "No onion / garlic", "Gluten-free"];
const ALLERGENS = ["Dairy", "Nuts", "Peanuts", "Gluten", "Soy", "Eggs"];
const MAIN_MEALS = [1, 2, 3];
const MINI_MEALS_D = [0, 1, 2];
const SHOW_ING = [...MAIN_INGREDIENTS, "Vegetables"]; // ingredients shown on the "ingredients we'll use" step

// kcal/min ranges for yoga & exercise, by level — the "know your meal" activity-burn screen
const YOGA_RATE: Record<string, [number, number]> = { Beginner: [4, 5], Intermediate: [5, 6], Advanced: [6, 7] };
const EX_RATE: Record<string, [number, number]> = { Beginner: [7.5, 9], Intermediate: [9, 10.5], Advanced: [10.5, 12] };
const r5 = (n: number) => Math.round(n / 5) * 5;
// incidental daily movement (walking + chores) by the activity level the user picked, as rough ranges
const BASE_ACTS: Record<string, { label: string; lo: number; hi: number }[]> = {
  sedentary: [{ label: "Mostly sitting · little walking", lo: 80, hi: 160 }],
  light: [{ label: "~30-min walk · ~5,000 steps", lo: 200, hi: 250 }, { label: "Office + light household chores", lo: 80, hi: 120 }],
  moderate: [{ label: "Walking · ~7,500 steps", lo: 280, hi: 350 }, { label: "On-your-feet work + chores", lo: 120, hi: 180 }],
  active: [{ label: "Walking · ~7,500 steps", lo: 280, hi: 350 }, { label: "On-your-feet work + chores", lo: 120, hi: 180 }],
  very: [{ label: "Lots of walking · ~10,000+ steps", lo: 420, hi: 520 }, { label: "Physical work / chores", lo: 160, hi: 240 }],
  very_active: [{ label: "Lots of walking · ~10,000+ steps", lo: 420, hi: 520 }, { label: "Physical work / chores", lo: 160, hi: 240 }],
};
// combined incidental daily burn (walking + chores + job) by activity level — one line, rough range
const BASE_ACTS_COMBINED: Record<string, { label: string; lo: number; hi: number }> = {
  sedentary: { label: "Mostly sitting — desk / driving, little walking", lo: 100, hi: 200 },
  light: { label: "Office work + household chores + ~5–7k steps walking", lo: 300, hi: 380 },
  moderate: { label: "On-your-feet work + chores + ~7.5–10k steps", lo: 420, hi: 520 },
  active: { label: "On-your-feet work + chores + ~7.5–10k steps", lo: 420, hi: 520 },
  very: { label: "Physical work + chores + 10k+ steps", lo: 600, hi: 760 },
  very_active: { label: "Physical work + chores + 10k+ steps", lo: 600, hi: 760 },
};
// calorie sense — common foods (page 1 of "know your meal")
const CAL_FOODS: { emoji: string; name: string; cal: string }[] = [
  { emoji: "🫓", name: "1 roti/phulka", cal: "~100" },
  { emoji: "🍚", name: "1 bowl rice", cal: "~200" },
  { emoji: "🥣", name: "1 bowl dal", cal: "~120" },
  { emoji: "🥬", name: "1 cup sabzi", cal: "~150" },
  { emoji: "🥛", name: "1 glass milk", cal: "~120" },
  { emoji: "🧈", name: "1 tsp ghee/oil", cal: "~45" },
  { emoji: "🥄", name: "1 tsp sugar", cal: "~20" },
  { emoji: "🍎", name: "1 fruit bowl", cal: "~90" },
];
const CAL_ZERO = ["💧 Water", "🍵 Green / black tea", "☕ Black coffee (no sugar)", "🫚 Ginger water", "🍋 Lemon water"];
// calorie sense — common activities (calories OUT), rough everyday burns
const CAL_OUT: { emoji: string; name: string; cal: string }[] = [
  { emoji: "🚶", name: "5,000 steps", cal: "~200" },
  { emoji: "🧘", name: "20 min yoga", cal: "~90" },
  { emoji: "🏋️", name: "20 min exercise", cal: "~180" },
  { emoji: "🚴", name: "20 min cycling", cal: "~160" },
  { emoji: "🏊", name: "20 min swimming", cal: "~200" },
  { emoji: "🧹", name: "30 min housework", cal: "~80" },
];

// "science of weight loss" cards — enjoyable, not plan-text
const SCIENCE_CARDS: { emoji: string; title: string; body: string }[] = [
  { emoji: "🍉", title: "Fill up on water-rich foods", body: "Fruits & salads are mostly water — they fill your stomach for very few calories, so you feel full and eat less." },
  { emoji: "✅", title: "Lean on near-zero-calorie foods", body: "Water, green & herbal tea, black coffee, most veg and spices barely count — enjoy them freely." },
  { emoji: "🚫", title: "Go easy on calorie-dense stuff", body: "Sweets, fried & processed food pack lots of fat + sugar into small bites — easy to overeat, hard to burn off." },
  { emoji: "🥚", title: "Make protein your friend", body: "Protein keeps you full for hours — so you naturally want to eat less later." },
  { emoji: "🌱", title: "Eat some things raw", body: "Raw sprouts & salads take effort to chew and fill you up — you simply can't eat as much, so intake drops." },
  { emoji: "🌾", title: "Choose low-GI foods", body: "Millets, lentils & besan digest slowly — steady energy, fewer cravings, full for longer." },
  { emoji: "⏱️", title: "Try a little fasting", body: "Once every 1–2 weeks, cap the day at ~500–600 kcal. Or try intermittent fasting — eat within a window like 12:12, 14:10 or 16:8." },
];

// per-meal "strategy" pages — a ritual, timing, pick-one option groups, and tips
type MealStrat = { emoji: string; title: string; share: number; time: string; start?: { note: string; items: string[] }; groups: { label: string; options: string[] }[]; plates: string[]; tips: string[] };
const MEAL_STRATEGY: Record<string, MealStrat> = {
  breakfast: {
    emoji: "🌅", title: "Breakfast", share: 0.25, time: "~9–10 am (about 30 min after your warm drink)",
    start: { note: "Start on an empty stomach, ~8–8:30 am", items: ["Turmeric + warm water", "Ginger + warm water", "Lemon + warm water"] },
    groups: [
      { label: "Base", options: ["2 besan chilla", "2 moong-dal chilla", "2 ragi + dal chilla", "2 parathas (very little ghee)", "½ plate daliya upma", "1 plate kodo-millet upma", "4 idlis (samak rice)", "1 plate veg poha"] },
      { label: "+ a protein", options: ["1 bowl moong sprouts", "1 bowl chana sprouts", "1 bowl curd", "paneer / tofu bhurji", "boiled moong", "a few soaked nuts"] },
      { label: "+ a fruit", options: ["1 apple", "1 bowl papaya", "1 pear", "1 guava", "1 orange", "1 bowl melon", "½ banana"] },
    ],
    plates: [
      "2 besan chilla + 1 bowl moong sprouts + 1 apple",
      "2 moong-dal chilla + 1 bowl curd + 1 pear",
      "1 plate veg poha + a few soaked nuts + 1 orange",
      "½ plate daliya upma + boiled moong + 1 guava",
      "4 idlis (samak rice) + sambar / chutney + 1 bowl papaya",
      "2 ragi + dal chilla + paneer / tofu bhurji + 1 bowl melon",
      "1 plate kodo-millet upma + 1 bowl curd + ½ banana",
      "2 oats chilla + 1 bowl moong sprouts + 1 apple",
      "veg vermicelli upma + paneer bhurji + 1 orange",
      "2 multigrain toast + peanut butter + 1 banana",
    ],
    tips: ["Tea / coffee only ~45 min after food (better absorption).", "Skip sugar & milk — prefer green or herbal tea."],
  },
  lunch: {
    emoji: "🍛", title: "Lunch", share: 0.35, time: "~1–2 pm — your biggest meal",
    start: { note: "Start with a plate of salad + warm water", items: ["Cucumber–carrot–tomato salad", "Warm water"] },
    groups: [
      { label: "Grain", options: ["2 roti", "1 cup rice", "2 bajra roti", "2 jowar roti", "ragi roti", "veg khichdi", "daliya"] },
      { label: "+ dal / protein", options: ["1 bowl dal", "rajma", "chana", "paneer sabzi", "tofu", "soya chunks", "sprouts curry"] },
      { label: "+ veg & curd", options: ["1 cup sabzi", "lauki / tinda sabzi", "palak / methi", "1 bowl curd / buttermilk", "steamed veg", "more salad"] },
    ],
    plates: [
      "2 roti + 1 bowl dal + 1 cup sabzi + salad",
      "1 cup rice + rajma + lauki sabzi + buttermilk",
      "2 bajra roti + chana + palak + 1 bowl curd",
      "veg khichdi + 1 bowl curd + steamed veg + salad",
      "2 jowar roti + paneer sabzi + methi + salad",
      "ragi roti + soya-chunk curry + mixed veg + buttermilk",
      "1 cup rice + sprouts curry + lauki / tinda + curd",
      "2 multigrain roti + mixed dal + bhindi sabzi + salad",
      "quinoa pulao + rajma + 1 bowl raita",
      "2 roti + kadhi + aloo-methi + buttermilk",
    ],
    tips: ["Chew slowly; stop at about 80% full.", "Keep lunch the heaviest meal of your day."],
  },
  snack: {
    emoji: "🫐", title: "Mini-meal (snack)", share: 0.12, time: "~4–5 pm — only if you need it",
    groups: [
      { label: "Light options", options: ["Roasted makhana + green tea", "Roasted chana", "1 fruit + 5 nuts", "sprouts chaat", "buttermilk + jeera", "coconut water", "hummus + carrot/cucumber sticks", "roasted peanuts"] },
    ],
    plates: [
      "Roasted makhana + green tea",
      "1 fruit + 5 soaked nuts",
      "1 bowl sprouts chaat",
      "Buttermilk + roasted jeera",
      "Roasted chana (1 small bowl)",
      "Hummus + carrot / cucumber sticks",
      "Coconut water + a few roasted peanuts",
      "1 bowl fruit chaat",
      "Roasted makhana + a handful of peanuts",
      "1 bowl curd + flaxseeds",
    ],
    tips: ["Keep it light — it just bridges lunch & dinner.", "Avoid fried snacks & packaged namkeen."],
  },
  dinner: {
    emoji: "🌙", title: "Dinner", share: 0.28, time: "~7–8 pm — light & early",
    start: { note: "A little salad + warm water first", items: ["Small salad", "Warm water"] },
    groups: [
      { label: "Light base", options: ["2 phulka", "millet roti", "small moong khichdi", "veg soup + 1 toast", "small bowl rice", "daliya"] },
      { label: "+ dal / protein", options: ["light dal", "grilled paneer", "tofu stir-fry", "masoor dal", "sprouts"] },
      { label: "+ cooked veg", options: ["lauki sabzi", "mixed veg", "palak", "steamed veg", "sautéed greens"] },
    ],
    plates: [
      "2 phulka + light dal + lauki sabzi",
      "millet roti + grilled paneer + mixed veg",
      "small moong khichdi + sautéed greens + salad",
      "veg soup + 1 toast + tofu stir-fry",
      "small bowl rice + masoor dal + palak",
      "daliya + sprouts + steamed veg",
      "2 phulka + light dal + sautéed greens + small salad",
      "2 jowar roti + baked lauki kofta + salad",
      "moong dosa + sambar + steamed veg",
      "vegetable stew + 1 millet roti + salad",
    ],
    tips: ["Finish by ~8 pm for better sleep & digestion.", "Optional: warm turmeric milk before bed."],
  },
};
const MEAL_ORDER = ["breakfast", "lunch", "snack", "dinner"];
// "ways to make it" for staples — e.g. roti → wheat, wheat+20% multigrain, bajra …
const MAKE_OPTIONS: Record<string, string[]> = {
  roti: ["whole wheat", "wheat + 20% multigrain", "bajra", "jowar", "ragi"],
  phulka: ["whole wheat", "multigrain", "bajra", "jowar"],
  paratha: ["whole wheat (little ghee)", "multigrain", "stuffed veg"],
  rice: ["brown rice", "hand-pounded", "samak (barnyard millet)", "small white portion"],
  khichdi: ["moong + rice", "moong + samak", "millet khichdi"],
  chilla: ["besan", "moong dal", "ragi + dal", "oats"],
  upma: ["daliya", "kodo millet", "oats", "samak"],
  idli: ["samak rice", "oats", "ragi", "regular (now & then)"],
  poha: ["red poha", "thin poha + peanuts", "millet poha"],
  dal: ["moong", "masoor", "toor", "chana dal", "mixed"],
};
function makeFor(opt: string): string[] | null {
  const low = opt.toLowerCase();
  for (const k of Object.keys(MAKE_OPTIONS)) if (low.includes(k)) return MAKE_OPTIONS[k];
  return null;
}

// why-we-recommend-it + rough macros for the meal options (matched by keyword, longest wins)
const FOOD_INFO: { k: string; why: string; macro: string }[] = [
  { k: "besan chilla", why: "Gram-flour protein + fibre, low-GI — keeps you full.", macro: "~180 kcal · P 9 · C 20 · F 6" },
  { k: "moong dal chilla", why: "Moong-dal protein, light and low-GI.", macro: "~170 kcal · P 10 · C 20 · F 4" },
  { k: "ragi", why: "Ragi = calcium + low-GI — slow, steady energy.", macro: "~150 kcal · P 4 · C 28 · F 2" },
  { k: "paratha", why: "Whole-grain carbs — keep the ghee minimal.", macro: "~250 kcal · P 6 · C 35 · F 9" },
  { k: "daliya", why: "Broken wheat — fibre and slow carbs.", macro: "~180 kcal · P 6 · C 34 · F 2" },
  { k: "upma", why: "Light carbs + veg; a millet/daliya base is best.", macro: "~200 kcal · P 5 · C 32 · F 6" },
  { k: "kodo", why: "Kodo millet — low-GI, high fibre, great for blood sugar.", macro: "~160 kcal · P 4 · C 30 · F 2" },
  { k: "idli", why: "Fermented & steamed — light and easy to digest.", macro: "~40 kcal each · P 2 · C 8 · F 0" },
  { k: "samak", why: "Samak = barnyard millet — a low-GI swap for rice.", macro: "~150 kcal · P 4 · C 30 · F 1" },
  { k: "poha", why: "Light carbs; peanuts add protein and crunch.", macro: "~250 kcal · P 6 · C 40 · F 7" },
  { k: "sprouts", why: "Raw protein + fibre — you can't overeat, so it's low-cal and very filling.", macro: "~120 kcal/cup · P 8 · C 20 · F 1" },
  { k: "curd", why: "Probiotic protein — cooling and good for the gut.", macro: "~95 kcal/bowl · P 5 · C 7 · F 5" },
  { k: "paneer", why: "High protein — keeps you full and builds muscle.", macro: "~200 kcal/100g · P 18 · C 4 · F 14" },
  { k: "tofu", why: "Light plant protein, low in fat.", macro: "~120 kcal/100g · P 12 · C 2 · F 7" },
  { k: "nuts", why: "Healthy fats + protein — satiating in small amounts.", macro: "~130 kcal · P 4 · C 3 · F 12" },
  { k: "apple", why: "Water-rich & fibre — fills you for few calories.", macro: "~90 kcal · fibre-rich" },
  { k: "papaya", why: "Water-rich, aids digestion, low-cal.", macro: "~60 kcal/bowl" },
  { k: "banana", why: "Quick energy + potassium; half is plenty.", macro: "~90 kcal each" },
  { k: "melon", why: "Mostly water — very low-cal and hydrating.", macro: "~50 kcal/bowl" },
  { k: "guava", why: "High fibre + vitamin C, low-GI.", macro: "~70 kcal" },
  { k: "pear", why: "Fibre-rich and water-heavy.", macro: "~90 kcal" },
  { k: "orange", why: "Vitamin C + water, fibre in the pulp.", macro: "~70 kcal" },
  { k: "fruit", why: "Water-rich, fibre & vitamins — fills you for few calories.", macro: "~60–90 kcal" },
  { k: "phulka", why: "Whole-grain fibre & steady energy.", macro: "~100 kcal each · P 3 · C 18 · F 1" },
  { k: "bajra", why: "Pearl millet — low-GI, iron & fibre.", macro: "~120 kcal/roti · P 4 · C 22 · F 1" },
  { k: "jowar", why: "Sorghum — gluten-free, low-GI, filling.", macro: "~115 kcal/roti · P 3 · C 24 · F 1" },
  { k: "roti", why: "Whole-grain fibre — millet flours add even more.", macro: "~100 kcal each · P 3 · C 18 · F 1" },
  { k: "khichdi", why: "Moong + rice — light, complete and easy to digest.", macro: "~300 kcal/bowl · P 10 · C 50 · F 5" },
  { k: "rice", why: "Easy energy — pair with dal for complete protein.", macro: "~200 kcal/cup · P 4 · C 44 · F 0" },
  { k: "rajma", why: "Protein + fibre — slow-digesting, keeps you full.", macro: "~140 kcal/bowl · P 8 · C 22 · F 1" },
  { k: "chana", why: "Protein, fibre & iron — low-GI, steadies blood sugar.", macro: "~160 kcal/bowl · P 9 · C 27 · F 3" },
  { k: "soya", why: "High protein — great for building muscle.", macro: "~170 kcal · P 16 · C 9 · F 7" },
  { k: "dal", why: "Plant protein + fibre — gentle on digestion.", macro: "~120 kcal/bowl · P 7 · C 18 · F 1" },
  { k: "salad", why: "Raw & water-rich — fills you with almost no calories.", macro: "~50 kcal" },
  { k: "buttermilk", why: "Light probiotic — cooling, very few calories.", macro: "~40 kcal/glass" },
  { k: "makhana", why: "Light roasted snack — low-cal with a good crunch.", macro: "~90 kcal/bowl · P 3 · C 18 · F 1" },
  { k: "coconut water", why: "Hydrating and light — natural electrolytes.", macro: "~45 kcal/glass" },
  { k: "hummus", why: "Chickpea protein + fibre.", macro: "~70 kcal/2 tbsp" },
  { k: "soup", why: "Warm & filling — low-cal, great before dinner.", macro: "~80 kcal/bowl" },
  { k: "toast", why: "Light carbs — pick multigrain.", macro: "~70 kcal/slice" },
  { k: "palak", why: "Iron + fibre, low-cal greens.", macro: "~60 kcal" },
  { k: "lauki", why: "Gourd — light, cooling, very low-cal.", macro: "~50 kcal/cup" },
  { k: "peanut", why: "Protein + healthy fat; keep the portion small.", macro: "~160 kcal/handful" },
  { k: "turmeric milk", why: "Calming & anti-inflammatory — good before bed.", macro: "~120 kcal/cup" },
  { k: "greens", why: "Fibre + micronutrients, very low-cal.", macro: "~50 kcal" },
  { k: "sabzi", why: "Fibre + vitamins — high volume, low calories.", macro: "~120 kcal/cup · P 3 · C 12 · F 6" },
  { k: "veg", why: "Fibre & micronutrients — fills you for few calories.", macro: "~80–150 kcal" },
];
function foodInfo(opt: string) {
  const low = opt.toLowerCase();
  let best: (typeof FOOD_INFO)[number] | null = null;
  for (const f of FOOD_INFO) if (low.includes(f.k) && (!best || f.k.length > best.k.length)) best = f;
  return best;
}
/** Option chips — each tappable to show why it's recommended + rough macros. */
function MealOptions({ options }: { options: string[] }) {
  const [tip, setTip] = useState<{ title: string; why: string; macro: string; left: number; top: number } | null>(null);
  const W = Math.min(260, (typeof window !== "undefined" ? window.innerWidth : 360) - 16);
  const open = (opt: string, rect: DOMRect) => {
    const f = foodInfo(opt); if (!f) return;
    const vw = typeof window !== "undefined" ? window.innerWidth : 360;
    setTip({ title: opt, why: f.why, macro: f.macro, left: Math.max(8, Math.min(rect.left, vw - W - 8)), top: rect.bottom + 6 });
  };
  return (
    <div className="flex flex-wrap gap-1.5">
      {options.map((o) => foodInfo(o)
        ? <button key={o} onClick={(e) => open(o, e.currentTarget.getBoundingClientRect())} className="rounded-full bg-secondary px-2.5 py-1 text-[11px] font-semibold text-foreground/80 underline decoration-dotted underline-offset-2">{o}</button>
        : <span key={o} className="rounded-full bg-secondary px-2.5 py-1 text-[11px] font-semibold text-foreground/80">{o}</span>)}
      {tip && (
        <>
          <div onClick={() => setTip(null)} className="fixed inset-0 z-40" />
          <div className="fixed z-50 rounded-xl bg-card p-3 shadow-xl ring-1 ring-border/70" style={{ left: tip.left, top: tip.top, width: W }}>
            <b className="mb-0.5 block text-[12px] text-foreground">{tip.title}</b>
            <span className="block text-[11.5px] leading-snug text-foreground/85">{tip.why}</span>
            <span className="mt-1.5 block border-t border-border/50 pt-1.5 text-[10.5px] font-semibold text-primary">{tip.macro}</span>
          </div>
        </>
      )}
    </div>
  );
}

/** A full plate ("2 roti + 1 bowl dal + salad") — each dish underlined & tappable for why / cal / ways to make. */
function PlateDishes({ plate }: { plate: string }) {
  const [tip, setTip] = useState<{ title: string; why: string; macro: string; makes: string[] | null; left: number; top: number } | null>(null);
  const W = Math.min(265, (typeof window !== "undefined" ? window.innerWidth : 360) - 16);
  const open = (opt: string, rect: DOMRect) => {
    const f = foodInfo(opt); if (!f) return;
    const vw = typeof window !== "undefined" ? window.innerWidth : 360;
    setTip({ title: opt, why: f.why, macro: f.macro, makes: makeFor(opt), left: Math.max(8, Math.min(rect.left, vw - W - 8)), top: rect.bottom + 6 });
  };
  const parts = plate.split(" + ");
  return (
    <span className="text-[12px] leading-relaxed text-foreground/90">
      {parts.flatMap((p, i) => {
        const nodes = i > 0 ? [<span key={`s${i}`} className="text-muted-foreground"> + </span>] : [];
        nodes.push(foodInfo(p)
          ? <button key={`d${i}`} onClick={(e) => open(p, e.currentTarget.getBoundingClientRect())} className="underline decoration-dotted underline-offset-2 active:text-primary">{p}</button>
          : <span key={`d${i}`}>{p}</span>);
        return nodes;
      })}
      {tip && (
        <>
          <span onClick={() => setTip(null)} className="fixed inset-0 z-40 block" />
          <span className="fixed z-50 block rounded-xl bg-card p-3 shadow-xl ring-1 ring-border/70" style={{ left: tip.left, top: tip.top, width: W }}>
            <b className="mb-0.5 block text-[12px] text-foreground">{tip.title}</b>
            <span className="block text-[11.5px] leading-snug text-foreground/85">{tip.why}</span>
            <span className="mt-1.5 block border-t border-border/50 pt-1.5 text-[10.5px] font-semibold text-primary">{tip.macro}</span>
            {tip.makes && <span className="mt-1.5 block border-t border-border/50 pt-1.5 text-[10.5px] leading-snug text-muted-foreground"><b className="text-foreground/70">Ways to make it:</b> {tip.makes.join(" · ")}</span>}
          </span>
        </>
      )}
    </span>
  );
}

/** One meal in the pick-&-choose "strategy" style, with a "ways to make it" expander. */
function MealStratCompact({ meal, kcalTarget }: { meal: string; kcalTarget: number }) {
  const [makeOpen, setMakeOpen] = useState(false);
  const s = MEAL_STRATEGY[meal];
  if (!s) return null;
  const kcal = Math.round((kcalTarget * s.share) / 10) * 10;
  const makes = s.groups.flatMap((grp) => grp.options).map((o) => ({ o, m: makeFor(o) })).filter((x) => x.m);
  const seen = new Set<string>();
  const uniqueMakes = makes.filter(({ m }) => { const key = m!.join(); if (seen.has(key)) return false; seen.add(key); return true; });
  return (
    <div className="rounded-2xl bg-card p-3 ring-1 ring-border/60">
      <div className="flex items-center justify-between">
        <p className="text-[12.5px] font-bold text-foreground">{s.emoji} {s.title.replace(" (snack)", "")}</p>
        <p className="text-[11px] font-bold text-primary">~{kcal} kcal · {s.time.split("—")[0].trim()}</p>
      </div>
      {s.groups.map((grp, gi) => (
        <div key={gi} className="mt-1.5">
          <p className="mb-1 text-[10px] font-bold text-foreground/55">{grp.label.replace("Pick ", "").replace("+ ", "+ ")}</p>
          <MealOptions options={grp.options} />
        </div>
      ))}
      {uniqueMakes.length > 0 && (
        <>
          <button onClick={() => setMakeOpen((o) => !o)} className="mt-1.5 text-[10px] font-bold text-primary">💡 Ways to make it {makeOpen ? "▲" : "▼"}</button>
          {makeOpen && (
            <div className="mt-1 space-y-0.5">
              {uniqueMakes.map(({ o, m }) => <p key={o} className="text-[10px] leading-snug text-muted-foreground"><b className="text-foreground/70">{o.replace(/^\d+\s*/, "").replace(/\s*\(.*\)/, "")}:</b> {m!.join(" · ")}</p>)}
            </div>
          )}
        </>
      )}
    </div>
  );
}
function levelFromFactor(f: number): string {
  if (f < 1.3) return "Sedentary";
  if (f < 1.46) return "Lightly active";
  if (f < 1.64) return "Moderately active";
  if (f < 1.8) return "Very active";
  return "Extra active";
}

// Rough kcal for common foods, used to estimate current intake from the free-text "describe your meals".
const EAT_KCAL: { re: RegExp; k: number }[] = [
  { re: /green tea/, k: 5 },
  { re: /\b(tea|chai|coffee)\b/, k: 60 },
  { re: /(turmeric|haldi)?\s*(milk|doodh)/, k: 120 },
  { re: /paratha/, k: 250 },
  { re: /\b(roti|phulka|chapati|chapatti)\b/, k: 110 },
  { re: /\b(rice|chawal|pulao|biryani|khichdi)\b/, k: 200 },
  { re: /\b(dal|daal)\b/, k: 120 },
  { re: /\b(sabzi|sabji|bhaji|vegetable|veg)\b/, k: 150 },
  { re: /\b(curd|dahi|yogurt|raita)\b/, k: 100 },
  { re: /\bsalad\b/, k: 50 },
  { re: /\bpaneer\b/, k: 200 },
  { re: /\b(biscuit|cookie)\b/, k: 35 },
  { re: /\bidli\b/, k: 60 },
  { re: /\bdosa\b/, k: 150 },
  { re: /\b(poha|upma|daliya)\b/, k: 250 },
  { re: /\b(bread|toast|sandwich)\b/, k: 90 },
  { re: /\b(samosa|pakora|kachori|vada)\b/, k: 150 },
  { re: /\b(banana|apple|mango|fruit|orange)\b/, k: 90 },
  { re: /\b(nuts|almond|peanut|cashew|makhana)\b/, k: 160 },
  { re: /\b(egg|omelette|omelet)\b/, k: 80 },
];
function estimateMeals(text: string): { kcal: number; found: number } {
  const t = text.toLowerCase();
  let kcal = 0, found = 0;
  for (const { re, k } of EAT_KCAL) {
    const idx = t.search(re);
    if (idx < 0) continue;
    const before = t.slice(Math.max(0, idx - 10), idx);
    const num = before.match(/(\d+)\D*$/);
    const qty = num ? Math.min(8, Math.max(1, parseInt(num[1], 10))) : 1;
    kcal += k * qty; found++;
  }
  return { kcal: Math.round(kcal / 10) * 10, found };
}
const EAT_EXAMPLE = "e.g. 8am: tea, 2 biscuits. Lunch ~1:30: 2 bowls rice, 1 bowl dal, 1 bowl curd, salad. Evening: tea + 3 biscuits, or green tea. Dinner: 2 rotis, 1 bowl sabzi. Before bed: turmeric milk.";

// Intermittent-fasting tiers: longer fasts leave room for fewer meals.
// maxMain / maxMini = the most meals that still fit inside that fasting window.
type FastTier = { lo: number; hi: number; meals: string; maxMain: number; maxMini: number };
const FAST_TIERS: FastTier[] = [
  { lo: 12, hi: 13, meals: "3 main + 1 mini / light meal", maxMain: 3, maxMini: 1 },
  { lo: 14, hi: 15, meals: "3 main meals", maxMain: 3, maxMini: 0 },
  { lo: 16, hi: 17, meals: "2 main + 1 light meal", maxMain: 2, maxMini: 1 },
  { lo: 18, hi: 19, meals: "2 main + a small drink", maxMain: 2, maxMini: 0 },
  { lo: 20, hi: 21, meals: "1 main + 1 mini meal", maxMain: 1, maxMini: 1 },
  { lo: 22, hi: 24, meals: "OMAD — one meal a day", maxMain: 1, maxMini: 0 },
];
const fastTier = (h: number): FastTier => FAST_TIERS.find((t) => h >= t.lo && h <= t.hi) ?? FAST_TIERS[FAST_TIERS.length - 1];
const fastLevel = (h: number) => (h <= 15 ? { name: "Beginner", color: "#22c55e" } : h <= 19 ? { name: "Medium", color: "#eab308" } : { name: "Advanced", color: "#ef4444" });
/** The longest fast that still fits the chosen number of meals. */
const maxFastForMeals = (main: number, mini: number): number => {
  const fit = FAST_TIERS.filter((t) => t.maxMain >= main && t.maxMini >= mini);
  return fit.length ? fit[fit.length - 1].hi : 12;
};
// What kicks in as the fast lengthens (hour reached → effect).
const FAST_STAGES: { h: number; t: string }[] = [
  { h: 12, t: "fat-burning begins" },
  { h: 14, t: "deeper fat-burn" },
  { h: 16, t: "ketosis starts" },
  { h: 18, t: "autophagy (cell clean-up)" },
  { h: 20, t: "deeper autophagy" },
  { h: 24, t: "growth-hormone peak" },
];
const DAYS_N = [2, 3, 4, 5, 6];

const MEDICAL_GROUPS = new Set(["conditions", "organs", "womens"]);
const DISEASE_Q: Record<string, { key: string; label: string; ph?: string }[]> = {
  diabetes: [{ key: "fbs", label: "Fasting sugar (mg/dL)", ph: "e.g. 130" }, { key: "hba1c", label: "HbA1c (%)", ph: "e.g. 7.2" }],
  hypertension: [{ key: "bp", label: "Usual BP", ph: "e.g. 140/90" }],
  cholesterol: [{ key: "ldl", label: "LDL (mg/dL)", ph: "e.g. 150" }],
  thyroid: [{ key: "tsh", label: "Latest TSH (mIU/L)", ph: "e.g. 4.2" }],
  "fatty-liver": [{ key: "grade", label: "Fatty-liver grade (if known)", ph: "e.g. Grade 2" }],
  asthma: [{ key: "trigger", label: "Main trigger (if known)", ph: "e.g. dust" }],
};

function chip(on: boolean) {
  return `rounded-full px-3.5 py-2 text-[12px] font-semibold transition ${on ? "bg-primary text-primary-foreground" : "bg-secondary text-foreground/75"}`;
}
function smChip(on: boolean) {
  return `rounded-lg px-2.5 py-1 text-[11px] font-bold transition ${on ? "bg-primary text-primary-foreground" : "bg-secondary text-foreground/75"}`;
}
/** A goal chip with a colored gradient emoji dot (keeps the picker from being a flat grey wall). */
function goalChipEl(id: string, selected: string[], toggle: (id: string) => void) {
  const g = ALL_GOALS[id];
  if (!g) return null;
  const on = selected.includes(id);
  const disabled = !on && selected.length >= 2;
  return (
    <button key={id} disabled={disabled} onClick={() => toggle(id)}
      className={`flex items-center gap-1.5 rounded-full py-1 pl-1 pr-3 text-[12px] font-semibold ring-1 transition ${on ? "bg-primary text-primary-foreground ring-primary" : disabled ? "bg-card/50 text-foreground/30 ring-border/40" : "bg-card text-foreground/85 ring-border/60"}`}>
      <span className="flex h-6 w-6 items-center justify-center rounded-full text-[12px] text-primary-foreground shadow-sm" style={{ background: g.gradient }}>{g.emoji}</span>
      {g.label}
    </button>
  );
}

const CREATE_COMMON = ["general-wellness", "weight-loss", "stress", "better-sleep", "healthy-ageing"];
const CREATE_CONDITIONS = ["diabetes", "thyroid", "migraine", "fatty-liver", "hypertension", "cholesterol", "gout", "asthma"];
const CREATE_UMBRELLAS: { id: string; label: string; emoji: string; gradient: string; ids: string[] }[] = [
  { id: "gut", label: "Gut & Digestion", emoji: "🌀", gradient: "var(--gradient-sage)", ids: ["gut", "acidity-gerd", "ibs", "constipation", "indigestion"] },
  { id: "joints", label: "Joints & Spine", emoji: "🦴", gradient: "var(--gradient-clay)", ids: ["knee-pain", "hip-pain", "back-pain", "neck-pain", "sciatica", "arthritis", "osteoporosis"] },
];
const CREATE_WOMENS = ["pregnancy", "post-natal", "pcos-pcod", "menopause"];


/** Small labelled screen wrapper so every question reads the same. */
function Q({ title, hint, children }: { title: string; hint?: string; children: React.ReactNode }) {
  return (
    <div>
      <h2 className="px-1 font-display text-[16px] font-bold text-foreground">{title}</h2>
      {hint && <p className="mb-3 mt-0.5 px-1 text-[11.5px] leading-snug text-muted-foreground">{hint}</p>}
      <div className={hint ? "" : "mt-3"}>{children}</div>
    </div>
  );
}

function CreatePlan() {
  const navigate = useNavigate();
  const { goal: preGoal, edit: editId, goals: preGoals, tool: preTool } = Route.useSearch();
  const editTool = preTool && SELECTABLE.includes(preTool as IvKey) ? (preTool as IvKey) : null; // "edit one tool" deep-link

  // Fitness is its own track (independent of the ≤2 "primary" condition/organ/etc. goals), so it always carries through.
  const FITNESS_SET = new Set(["weight-loss", "general-wellness", "strength", "muscle-building", "muscles", "flexibility", "mobility"]);
  const seedGoals = preGoals
    ? (() => {
        const all = preGoals.split(",").filter((id) => ALL_GOALS[id]);
        const primary = all.filter((id) => !FITNESS_SET.has(id)).slice(0, 2);
        const fitness = all.filter((id) => FITNESS_SET.has(id));
        return [...primary, ...fitness];
      })()
    : (preGoal && ALL_GOALS[preGoal] ? [preGoal] : []);
  // came from the profile with goals already chosen → skip the goal page (start at "what to personalize")
  const [step, setStep] = useState(preGoals && seedGoals.length && !editId ? 1 : 0);
  const [goals, setGoals] = useState<string[]>(seedGoals);
  const [ivs, setIvs] = useState<IvKey[]>(editTool ? [editTool] : ["yoga", "diet"]); // tool deep-link → just that tool
  const [openU, setOpenU] = useState<string | null>(null);

  // shared / yoga
  const [yogaLevel, setYogaLevel] = useState<string>(LEVELS[0]);
  const [duration, setDuration] = useState<number>(20);
  const [yogaDays, setYogaDays] = useState<number>(5);
  const [protect, setProtect] = useState<string[]>([]);
  // exercise
  const [exLevel, setExLevel] = useState<string>(LEVELS[0]);
  const [exDays, setExDays] = useState<number>(4);
  const [exDur, setExDur] = useState<number>(30);
  const [focus, setFocus] = useState<string>(EX_FOCUS[0]);
  const [equip, setEquip] = useState<string>(EQUIP[0]);
  // diet
  const [dietIF, setDietIF] = useState<boolean | null>(null);
  const [ifWindow, setIfWindow] = useState<string>("14:10");
  const [fastHrs, setFastHrs] = useState<number>(14);
  const [prefs, setPrefs] = useState<string[]>(["Vegetarian"]);
  const [allergies, setAllergies] = useState<string[]>([]);
  const [otherAllergy, setOtherAllergy] = useState("");
  const [meals, setMeals] = useState<number>(3);
  const [mini, setMini] = useState<number>(1);
  const [mealMode, setMealMode] = useState<"detailed" | "recos">("detailed");
  // cuisine + "describe your meals" — now part of the diet flow (seeded from any earlier lifestyle answers)
  const [cuisinePath, setCuisinePath] = useState<string[]>(() => { try { return (JSON.parse(localStorage.getItem("ayuraise.lifestyle") ?? "{}")?.cuisinePath as string[]) ?? []; } catch { return []; } });
  const [describeText, setDescribeText] = useState(() => { try { return (JSON.parse(localStorage.getItem("ayuraise.lifestyle") ?? "{}")?.eatText as string) ?? ""; } catch { return ""; } });
  const [listening, setListening] = useState(false);
  const recognitionRef = useRef<any>(null);
  const [dietModal, setDietModal] = useState<"detailed" | "recos" | null>(null); // full diet-plan sample popup (ⓘ icons)
  const [avoidIng, setAvoidIng] = useState<string[]>([]);   // ingredients removed / swapped out — asked BEFORE the plan is made
  const [ingReplace, setIngReplace] = useState<Record<string, string[]>>({}); // ingredient → chosen replacements
  const [addedIng, setAddedIng] = useState<string[]>([]);   // ingredients the user added
  const [addInput, setAddInput] = useState("");
  const [infoIng, setInfoIng] = useState<string | null>(null);    // ingredient whose info (ⓘ) popup is open
  const [swapIng, setSwapIng] = useState<string | null>(null);    // ingredient whose swap popup is open
  const [replacePick, setReplacePick] = useState<string[]>([]);   // temp replacement selection in the swap popup
  const [keepDishes, setKeepDishes] = useState("");          // dishes the user wants to keep (feedback)
  const [dietFeedback, setDietFeedback] = useState("");      // free-text dislikes / preferences (feedback)
  const [feedbackOpen, setFeedbackOpen] = useState(false);   // the "adjust my plan" feedback sheet
  const [savePopup, setSavePopup] = useState(false);         // "good to go?" confirm before saving
  const [botOpen, setBotOpen] = useState(false);             // show AyuBot chat only when the user wants changes
  const [calPopup, setCalPopup] = useState(false);           // "estimate my calories" popup on the describe step
  const [dietView, setDietView] = useState<"meals" | "plan">("meals"); // diet-plan step: pick-&-choose meals vs day-wise plan
  const [botMsgs, setBotMsgs] = useState<{ from: "you" | "ayu"; text: string }[]>([
    { from: "ayu", text: "Here's your plan 🌿 Tell me anything to change — an ingredient to drop, lighter dinners, more protein, a cuisine — and I'll adjust it." },
  ]);
  const [botInput, setBotInput] = useState("");
  const [ifConflict, setIfConflict] = useState<{ hrs: number; tier: FastTier } | null>(null); // meal-count vs fasting-window clash
  // about
  const [cleared, setCleared] = useState(false);
  const [dq, setDq] = useState<Record<string, string>>({});
  const [curWt, setCurWt] = useState("");
  const [tgtWt, setTgtWt] = useState("");
  const [tgtDate, setTgtDate] = useState("");
  const [pace, setPace] = useState(0.5); // kg to lose per week (0.1–0.75)

  // when editing an existing plan, load its saved answers once (client-side)
  const hydrated = useRef(false);
  useEffect(() => {
    if (hydrated.current || !editId) return;
    hydrated.current = true;
    const p = loadYogaPlans().find((x) => x.id === editId);
    const w = p?.wizard as Record<string, unknown> | undefined;
    if (!w) return;
    const S = <T,>(v: unknown, set: (x: T) => void) => { if (v !== undefined && v !== null) set(v as T); };
    S<string[]>(w.goalIds, setGoals); S<IvKey[]>(w.ivs, setIvs);
    S<string>(w.yogaLevel, setYogaLevel); S<number>(w.duration, setDuration); S<number>(w.yogaDays, setYogaDays); S<string[]>(w.protect, setProtect); S<number>(w.mini, setMini);
    S<string>(w.exLevel, setExLevel); S<number>(w.exDays, setExDays); S<number>(w.exDur, setExDur);
    S<string>(w.focus, setFocus); S<string>(w.equip, setEquip);
    S<"detailed" | "recos">(w.mealMode, setMealMode); S<boolean>(w.dietIF, setDietIF); S<string>(w.ifWindow, setIfWindow); S<number>(w.fastHrs, setFastHrs);
    S<string[]>(w.prefs, setPrefs); S<string[]>(w.allergies, setAllergies); S<number>(w.meals, setMeals);
    S<string[]>(w.avoidIng, setAvoidIng); S<Record<string, string[]>>(w.ingReplace, setIngReplace); S<string[]>(w.addedIng, setAddedIng); S<string>(w.keepDishes, setKeepDishes); S<string>(w.dietFeedback, setDietFeedback);
    S<string[]>(w.cuisinePath, setCuisinePath); S<string>(w.describeText, setDescribeText);
    S<Record<string, string>>(w.dq, setDq); S<string>(w.curWt, setCurWt); S<string>(w.tgtWt, setTgtWt); S<string>(w.tgtDate, setTgtDate); S<number>(w.pace, setPace);
  }, [editId]);

  const hasYoga = ivs.includes("yoga");
  const hasExercise = ivs.includes("exercise");
  const hasDiet = ivs.includes("diet");
  const medicalGoals = goals.filter((g) => MEDICAL_GROUPS.has(getGoal(g)?.groupId ?? ""));
  const anyMedical = medicalGoals.length > 0;
  const wantsWeight = goals.includes("weight-loss") || goals.includes("obesity");
  const ranked = useMemo(() => rankFor(goals), [goals]);

  const stepKeys = useMemo(() => {
    const s: string[] = ["goals", "interventions"];
    if (wantsWeight) s.push("about"); // conditions are asked earlier (in the profile); here only the weight target
    if (hasYoga) s.push("yoga-time");
    if (hasYoga || hasExercise) s.push("protect");
    if (hasExercise) s.push("ex-setup");
    if (hasDiet) {
      if (editTool === "diet") s.push("diet-edit"); // pick-what-to-change menu when editing
      // + "Know your meal": BMR → calorie sense → science → foods → prakriti → numbers → macros → each meal
      s.push("diet-cuisine", "diet-describe", "diet-prefs", "diet-allergies", "diet-meals",
        "diet-bmr", "diet-cal-learn", "diet-cal", "diet-science", "diet-foods", "diet-prakriti", "diet-macros",
        "diet-meal-breakfast", "diet-meal-lunch", "diet-meal-snack", "diet-meal-dinner");
      if (mealMode === "detailed") s.push("diet-ingredients"); // ingredients asked BEFORE the plan is built
      s.push("diet-plan"); // show the diet plan + a feedback button, before the overall review
    }
    s.push("review");
    return s;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [goals, ivs, dietIF, mealMode]);
  const key = stepKeys[Math.min(step, stepKeys.length - 1)];

  // "Edit one tool" deep-link → jump straight to that tool's first question screen
  const jumpedTool = useRef(false);
  useEffect(() => {
    if (jumpedTool.current || !editTool) return;
    const first = editTool === "yoga" ? "yoga-time" : editTool === "exercise" ? "ex-setup" : "diet-edit";
    const i = stepKeys.indexOf(first);
    if (i >= 0) { jumpedTool.current = true; setStep(i); }
  }, [editTool, stepKeys]);

  const toggleGoal = (id: string) => setGoals((c) => c.includes(id) ? c.filter((x) => x !== id) : c.length >= 2 ? c : [...c, id]);
  const toggleIv = (k: IvKey) => setIvs((c) => c.includes(k) ? c.filter((x) => x !== k) : [...c, k]);
  const tog = (arr: string[], set: (v: string[]) => void, v: string) => set(arr.includes(v) ? arr.filter((x) => x !== v) : [...arr, v]);
  const goalLabels = goals.map((g) => ALL_GOALS[g]?.label ?? g);

  const dailyDeficit = useMemo(() => {
    const cur = parseFloat(curWt), tgt = parseFloat(tgtWt);
    if (!cur || !tgt || tgt >= cur || !tgtDate) return null;
    const d = Math.ceil((new Date(tgtDate).getTime() - Date.now()) / 86400000);
    return d > 0 ? Math.round(((cur - tgt) * 7700) / d) : null;
  }, [curWt, tgtWt, tgtDate]);

  // Weekly-pace → target date: picking a pace (kg/week) drives the target date live.
  const paceBand = pace <= 0.25 ? { label: "Easy", cls: "text-emerald-600 dark:text-emerald-400" } : pace <= 0.5 ? { label: "Medium", cls: "text-amber-600 dark:text-amber-400" } : { label: "Advanced", cls: "text-rose-600 dark:text-rose-400" };
  const weightTarget = useMemo(() => {
    const cur = parseFloat(curWt), tgt = parseFloat(tgtWt);
    if (!cur || !tgt || tgt >= cur) return null;
    const weeks = Math.max(1, Math.ceil((cur - tgt) / pace));
    const date = new Date(Date.now() + weeks * 7 * 86400000);
    return { weeks, date, iso: date.toISOString().slice(0, 10), loss: cur - tgt };
  }, [curWt, tgtWt, pace]);
  useEffect(() => { if (weightTarget && weightTarget.iso !== tgtDate) setTgtDate(weightTarget.iso); }, [weightTarget, tgtDate]);

  const canNext =
    key === "goals" ? goals.length >= 1 :
    key === "interventions" ? ivs.length >= 1 :
    true;

  const goTo = (name: string) => { const i = stepKeys.indexOf(name); if (i >= 0) setStep(i); };

  // Inline AyuBot on the diet-plan screen — acts on what it can (drop ingredients) and notes the rest.
  const sendBot = () => {
    const text = botInput.trim();
    if (!text) return;
    const low = text.toLowerCase();
    const dropped = SHOW_ING.filter((ing) => low.includes(ing.toLowerCase()) && (low.includes("no ") || low.includes("remove") || low.includes("without") || low.includes("drop") || low.includes("avoid") || low.includes("don't") || low.includes("dont")));
    if (dropped.length) setAvoidIng((a) => Array.from(new Set([...a, ...dropped])));
    setDietFeedback((f) => (f ? f + "\n" : "") + text);
    let reply = "";
    if (dropped.length) reply = `Done — I've taken ${dropped.join(", ")} out and swapped those meals. Anything else?`;
    else if (low.includes("protein")) reply = "Noted — I'll lead more meals with dal, paneer, tofu & sprouts. You can also open Ingredients to fine-tune.";
    else if (low.includes("light") || low.includes("dinner")) reply = "Got it — lighter, earlier dinners (khichdi, soup, steamed veg). Noted for your plan.";
    else reply = "Noted 🌿 I've saved that and your plan will adapt. You can also remove ingredients above or swap any meal with ⟳.";
    setBotMsgs((m) => [...m, { from: "you", text }, { from: "ayu", text: reply }]);
    setBotInput("");
  };

  // Meal-plan preview for the review step (reads saved profile basics + conditions)
  const reviewMealPlan = useMemo(() => {
    let b: Record<string, any> = {}, lf: Record<string, any> = {};
    try { b = JSON.parse(localStorage.getItem("ayuraise.profile") ?? "{}") ?? {}; } catch { /* ignore */ }
    try { lf = JSON.parse(localStorage.getItem("ayuraise.lifestyle") ?? "{}") ?? {}; } catch { /* ignore */ }
    return buildMealPlan({
      age: Number(b.age) || undefined,
      sex: (b.gender as Sex) || undefined,
      heightCm: Number(b.heightCm ?? lf.cm) || undefined,
      weightKg: Number(b.weightKg ?? lf.kg) || undefined,
      activity: (b.activity as ActivityLevel) || undefined,
      dosha: ((b.prakriti as { dosha?: Dosha } | undefined)?.dosha) || undefined,
      cuisine: cuisinePath.length ? cuisineRegion(cuisinePath) : ((b.cuisineRegion as string) || (b.cuisine as string) || (lf.cuisineRegion as string) || undefined),
      goalIds: goals,
      conditions: (lf.conditions as string[]) ?? [],
    });
  }, [goals, cuisinePath]);

  // Calorie breakdown for the "Know your meal" screens — BMR, maintenance, deficit & the daily target
  const calInfo = useMemo(() => {
    let b: Record<string, any> = {}, lf: Record<string, any> = {};
    try { b = JSON.parse(localStorage.getItem("ayuraise.profile") ?? "{}") ?? {}; } catch { /* ignore */ }
    try { lf = JSON.parse(localStorage.getItem("ayuraise.lifestyle") ?? "{}") ?? {}; } catch { /* ignore */ }
    const sex = (b.gender as Sex) || undefined;
    const age = Number(b.age) || 0;
    const heightCm = Number(b.heightCm ?? lf.cm) || 0;
    const weightKg = Number(b.weightKg ?? lf.kg) || 0;
    const activity = (b.activity as ActivityLevel) || "light";
    const complete = !!(sex && age && heightCm && weightKg);
    const bmr = complete ? Math.round(calcBMR(sex!, weightKg, heightCm, age)) : 0;
    const maintenance = reviewMealPlan.maintenance;
    const kcalTarget = reviewMealPlan.kcalTarget;
    const deficit = Math.max(0, maintenance - kcalTarget);
    const surplus = Math.max(0, kcalTarget - maintenance);
    const lossKg = (deficit * 7) / 9000; // 1 kg fat ≈ 9,000 kcal
    return { complete, bmr, maintenance, kcalTarget, deficit, surplus, lossKg, weightKg: weightKg || 65, activity };
  }, [reviewMealPlan]);

  // Rough workout cal-out (what the chosen yoga / exercise burns), scaled by body weight
  const wScale = (calInfo.weightKg || 65) / 65;
  const yogaKcal = hasYoga ? Math.round(duration * 4 * wScale) : 0;
  const exKcal = hasExercise ? Math.round(exDur * 7 * wScale) : 0;

  // activity-burn as ranges — one combined "daily movement" line + yoga/exercise (level-aware)
  const YR = YOGA_RATE[yogaLevel] ?? YOGA_RATE.Beginner;
  const ER = EX_RATE[exLevel] ?? EX_RATE.Beginner;
  const yogaR: [number, number] | null = hasYoga ? [r5(duration * YR[0] * wScale), r5(duration * YR[1] * wScale)] : null;
  const exR: [number, number] | null = hasExercise ? [r5(exDur * ER[0] * wScale), r5(exDur * ER[1] * wScale)] : null;
  const ACT_LABEL: Record<string, string> = { sedentary: "mostly sitting", light: "slightly active", moderate: "moderately active", active: "active", very: "very active", very_active: "very active" };
  const baseC = BASE_ACTS_COMBINED[calInfo.activity] ?? BASE_ACTS_COMBINED.light;
  const actRows: { label: string; lo: number; hi: number; kind: "base" | "yoga" | "exercise" }[] = [
    { label: ACT_LABEL[calInfo.activity] ?? "slightly active", lo: baseC.lo, hi: baseC.hi, kind: "base" as const },
    ...(yogaR ? [{ label: `${duration} min yoga`, lo: yogaR[0], hi: yogaR[1], kind: "yoga" as const }] : []),
    ...(exR ? [{ label: `${exDur} min exercise`, lo: exR[0], hi: exR[1], kind: "exercise" as const }] : []),
  ];
  const actLo = actRows.reduce((s, a) => s + a.lo, 0);
  const actHi = actRows.reduce((s, a) => s + a.hi, 0);
  const actMid = Math.round((actLo + actHi) / 2);
  const effMaintenance = calInfo.bmr + actMid;
  const effTarget = Math.max(1000, effMaintenance - calInfo.deficit + calInfo.surplus);

  // "add yoga / exercise" from the calorie screen — keep the user on the diet-cal step after ivs changes
  const pinToCal = useRef(false);
  useEffect(() => { if (pinToCal.current) { pinToCal.current = false; goTo("diet-cal"); } }, [stepKeys]); // eslint-disable-line react-hooks/exhaustive-deps
  const addInterventionHere = (k: IvKey) => { pinToCal.current = true; if (!ivs.includes(k)) setIvs((c) => [...c, k]); };

  // rough estimate of current intake from the free-text "describe your meals"
  const eatEstimate = useMemo(() => estimateMeals(describeText), [describeText]);

  // voice dictation into the describe box (Web Speech API, where supported)
  const voiceSupported = typeof window !== "undefined" && !!((window as any).SpeechRecognition || (window as any).webkitSpeechRecognition);
  const toggleVoice = () => {
    if (listening) { recognitionRef.current?.stop(); return; }
    const SR = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SR) return;
    const rec = new SR();
    rec.lang = "en-IN"; rec.interimResults = false; rec.continuous = true;
    rec.onresult = (e: any) => { let add = ""; for (let i = e.resultIndex; i < e.results.length; i++) add += e.results[i][0].transcript; if (add) setDescribeText((t) => (t ? t + " " : "") + add.trim()); };
    rec.onend = () => setListening(false);
    rec.onerror = () => setListening(false);
    recognitionRef.current = rec;
    try { rec.start(); setListening(true); } catch { setListening(false); }
  };

  const back = () => (step === 0 ? navigate({ to: "/home" }) : setStep((s) => s - 1));
  const next = () => { if (canNext) setStep((s) => Math.min(stepKeys.length - 1, s + 1)); };

  const save = () => {
    const parts = ivs.map((k) => IV_META[k].label);
    const dietBits: string[] = [];
    if (hasDiet) { if (dietIF) dietBits.push(`IF ${ifWindow}`); dietBits.push(mealMode === "detailed" ? `${meals} main${mini ? `+${mini} mini` : ""}` : "Food tips"); if (prefs.length) dietBits.push(prefs.join("/")); }
    const days = WEEKDAYS.slice(0, hasExercise ? exDays : yogaDays).map((w) => w.id);
    const pid = editId ?? newPlanId();
    const wizard = { goalIds: goals, ivs, yogaLevel, duration, yogaDays, protect, exLevel, exDays, exDur, focus, equip, mealMode, dietIF, ifWindow, fastHrs, prefs, allergies, meals, mini, avoidIng, ingReplace, addedIng, keepDishes, dietFeedback, cuisinePath, describeText, dq, curWt, tgtWt, tgtDate, pace };
    // keep cuisine + what-you-eat on the lifestyle profile so the meal plan & coach can use them
    try {
      const lf = JSON.parse(localStorage.getItem("ayuraise.lifestyle") ?? "{}") ?? {};
      if (describeText.trim()) lf.eatText = describeText.trim();
      if (cuisinePath.length) { lf.cuisinePath = cuisinePath; lf.cuisine = cuisinePath[cuisinePath.length - 1] ?? ""; lf.cuisineRegion = cuisineRegion(cuisinePath); }
      localStorage.setItem("ayuraise.lifestyle", JSON.stringify(lf));
    } catch { /* ignore */ }
    const plan: YogaPlan = {
      id: pid,
      wizard,
      name: goalLabels.join(" + "),
      primary: goalLabels[0],
      secondary: goalLabels[1] ?? null,
      level: hasExercise ? exLevel : hasYoga ? yogaLevel : "Beginner",
      weeks: Math.max(1, Math.ceil(28 / days.length)), // ~28 sessions spread over the chosen days/week
      daysPerWeek: days.length,
      days,
      duration: hasYoga ? duration : exDur,
      protect: (hasYoga || hasExercise) ? protect : [],
      variant: [...parts, ...dietBits].join(" · "),
      updatedAt: Date.now(),
    };
    upsertYogaPlan(plan);
    try { localStorage.setItem("ayuraise.showPlanTour", "1"); } catch { /* ignore */ } // show the orientation popup once, on landing
    navigate({ to: "/myplan/$id", params: { id: pid } });
  };

  const STEP_LABEL: Record<string, string> = {
    goals: "What's your goal?", interventions: "What to personalize", about: "A little about you",
    "yoga-time": "Set up your yoga", protect: "Areas to protect",
    "ex-setup": "Your exercise",
    "diet-edit": "Edit your diet", "diet-meals": "Let's create your meal plan", "diet-prefs": "Dietary preferences", "diet-allergies": "Allergies",
    "diet-cuisine": "Cuisine you prefer", "diet-describe": "Describe your meals",
    "diet-bmr": "Basal Metabolic Rate (BMR)", "diet-cal-learn": "A quick calorie sense", "diet-cal": "Your daily calorie goal", "diet-science": "Know your meal", "diet-macros": "Know your meal", "diet-foods": "Know your meal", "diet-prakriti": "Know your meal",
    "diet-meal-breakfast": "Your breakfast", "diet-meal-lunch": "Your lunch", "diet-meal-snack": "Your mini-meal", "diet-meal-dinner": "Your dinner",
    "diet-ingredients": "Ingredients I'll use", "diet-plan": "Your diet plan", review: "Review your plan",
  };

  return (
    <div className="min-h-svh pb-28" style={{ background: "var(--gradient-hero)" }}>
      <div className="relative overflow-hidden px-4 pb-4 pt-[max(1rem,env(safe-area-inset-top))]" style={{ background: "var(--gradient-violet)" }}>
        <div className="relative flex items-center gap-2.5 text-primary-foreground">
          <button onClick={back} className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-white/15"><ArrowLeft size={15} /></button>
          <div className="min-w-0 flex-1">
            <h1 className="truncate font-display text-[17px] font-extrabold leading-tight">{STEP_LABEL[key]}</h1>
          </div>
        </div>
        <div className="relative mt-3 h-1.5 overflow-hidden rounded-full bg-white/20">
          <div className="absolute inset-y-0 left-0 rounded-full bg-white transition-[width] duration-300" style={{ width: `${((step + 1) / stepKeys.length) * 100}%` }} />
        </div>
      </div>

      <div className="mx-auto max-w-xl px-4 pt-3">
        {/* GOALS */}
        {key === "goals" && (
          <div className="space-y-4">
            <p className="px-1 text-[12.5px] text-muted-foreground">Pick <span className="font-semibold text-foreground">up to 2 goals</span> you want a plan for.</p>
            {goals.length > 0 && (
              <div className="flex flex-wrap gap-1.5">
                {goals.map((id) => (
                  <button key={id} onClick={() => toggleGoal(id)} className="flex items-center gap-1.5 rounded-full bg-primary py-1 pl-1 pr-3 text-[12px] font-bold text-primary-foreground">
                    <span className="flex h-6 w-6 items-center justify-center rounded-full bg-white/25 text-[12px]">{ALL_GOALS[id]?.emoji}</span>{ALL_GOALS[id]?.label} ✕
                  </button>
                ))}
              </div>
            )}
            <div>
              <p className="mb-1.5 px-1 text-[11px] font-bold uppercase tracking-wide text-amber-700 dark:text-amber-400">🌿 Common goals</p>
              <div className="flex flex-wrap gap-1.5">{CREATE_COMMON.map((id) => goalChipEl(id, goals, toggleGoal))}</div>
            </div>
            <div>
              <p className="px-1 text-[11px] font-bold uppercase tracking-wide text-sky-700 dark:text-sky-400">🩺 Manage conditions</p>
              <p className="mb-1.5 px-1 text-[10px] leading-snug text-muted-foreground/80">Supportive lifestyle plans <b>alongside your doctor's care</b> — not a cure.</p>
              <div className="flex flex-wrap gap-1.5">{CREATE_CONDITIONS.map((id) => goalChipEl(id, goals, toggleGoal))}</div>
              <div className="mt-2 flex flex-wrap gap-1.5">
                {CREATE_UMBRELLAS.map((u) => {
                  const open = openU === u.id;
                  const sel = u.ids.filter((id) => goals.includes(id)).length;
                  return (
                    <button key={u.id} onClick={() => setOpenU(open ? null : u.id)} className={`flex items-center gap-1.5 rounded-full py-1 pl-1 pr-2.5 text-[12px] font-semibold ring-1 transition ${open ? "bg-accent/60 ring-primary/40" : "bg-card text-foreground/85 ring-border/60"}`}>
                      <span className="flex h-6 w-6 items-center justify-center rounded-full text-[12px] text-primary-foreground shadow-sm" style={{ background: u.gradient }}>{u.emoji}</span>
                      {u.label}{sel > 0 ? ` (${sel})` : ""}<span className="text-[9px] text-muted-foreground">{open ? "▾" : "▸"}</span>
                    </button>
                  );
                })}
              </div>
              {(() => {
                const u = CREATE_UMBRELLAS.find((x) => x.id === openU);
                if (!u) return null;
                return <div className="mt-1.5 rounded-2xl bg-card/70 p-2.5 ring-1 ring-border/60"><div className="flex flex-wrap gap-1.5">{u.ids.map((id) => goalChipEl(id, goals, toggleGoal))}</div></div>;
              })()}
            </div>
            <div>
              <p className="mb-1.5 px-1 text-[11px] font-bold uppercase tracking-wide text-violet-700 dark:text-violet-400">🌸 Women's Health</p>
              <div className="flex flex-wrap gap-1.5">{CREATE_WOMENS.map((id) => goalChipEl(id, goals, toggleGoal))}</div>
            </div>
          </div>
        )}

        {/* INTERVENTIONS */}
        {key === "interventions" && (
          <Q title="What should we personalize?" hint={`Based on ${goalLabels.join(" & ")}. Yoga & Diet are on by default — add Exercise if you like. Meditation, fasting & detox come built into your plan and you start them anytime.`}>
            <div className="space-y-2">
              {ranked.map((r) => {
                const m = IV_META[r.key];
                const on = ivs.includes(r.key);
                return (
                  <button key={r.key} onClick={() => toggleIv(r.key)} className={`flex w-full items-center gap-3 rounded-2xl p-3 text-left ring-1 transition ${on ? "bg-primary/10 ring-primary" : "bg-card ring-border/60"}`}>
                    <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-accent/50 text-lg">{m.emoji}</span>
                    <div className="min-w-0 flex-1">
                      <p className="text-[13px] font-bold text-foreground">{m.label}</p>
                      <p className="text-[10.5px] text-muted-foreground">{"★".repeat(r.imp)}{"☆".repeat(5 - r.imp)} · {r.imp >= 5 ? "most important" : r.imp >= 4 ? "very helpful" : "supportive"}</p>
                    </div>
                    <span className={`flex h-5 w-5 items-center justify-center rounded-md text-[11px] font-bold ${on ? "bg-primary text-primary-foreground" : "bg-secondary text-transparent"}`}>✓</span>
                  </button>
                );
              })}
            </div>
          </Q>
        )}

        {/* ABOUT */}
        {key === "about" && (
          <Q title="Your weight target" hint="Pick a pace — we'll set your date.">
            <div className="space-y-3">
              <div className="rounded-2xl bg-card p-3 ring-1 ring-border/60">
                <div className="grid grid-cols-2 gap-2">
                  <label className="block"><span className="text-[10.5px] font-semibold text-muted-foreground">Current (kg)</span><input value={curWt} onChange={(e) => setCurWt(e.target.value)} inputMode="decimal" placeholder="72" className="mt-1 w-full rounded-xl bg-secondary/40 px-2 py-2 text-[13px] ring-1 ring-border/60" /></label>
                  <label className="block"><span className="text-[10.5px] font-semibold text-muted-foreground">Target (kg)</span><input value={tgtWt} onChange={(e) => setTgtWt(e.target.value)} inputMode="decimal" placeholder="66" className="mt-1 w-full rounded-xl bg-secondary/40 px-2 py-2 text-[13px] ring-1 ring-border/60" /></label>
                </div>
              </div>

              <div className="rounded-2xl bg-card p-3 ring-1 ring-border/60">
                <div className="flex items-baseline justify-between">
                  <span className="text-[10.5px] font-semibold text-muted-foreground">Weekly pace</span>
                  <span className="text-[12.5px] font-bold text-foreground">{pace.toFixed(2)} kg/week · <span className={paceBand.cls}>{paceBand.label}</span></span>
                </div>
                <input type="range" min={0.1} max={0.75} step={0.05} value={pace} onChange={(e) => setPace(parseFloat(e.target.value))} aria-label="Weekly weight-loss pace" className="mt-2.5 w-full accent-primary" />
                <div className="mt-0.5 flex justify-between text-[8.5px] font-semibold uppercase tracking-wide text-muted-foreground">
                  <span>Easy</span><span>Medium</span><span>Advanced</span>
                </div>
                {weightTarget ? (
                  <div className="mt-3 rounded-xl bg-primary/10 px-3 py-2.5 ring-1 ring-primary/20">
                    <p className="text-[12.5px] font-bold text-foreground">Reach {parseFloat(tgtWt)} kg by <span className="text-primary">{weightTarget.date.toLocaleDateString(undefined, { day: "numeric", month: "short", year: "numeric" })}</span></p>
                    <p className="mt-0.5 text-[10.5px] text-muted-foreground">Lose {weightTarget.loss.toFixed(1)} kg over ~{weightTarget.weeks} weeks{dailyDeficit ? ` · ≈ ${dailyDeficit} kcal/day` : ""}</p>
                  </div>
                ) : (
                  <p className="mt-3 rounded-xl bg-secondary/50 px-3 py-2.5 text-[10.5px] text-muted-foreground">Enter your current &amp; target weight above to see your date.</p>
                )}
              </div>
            </div>
          </Q>
        )}

        {/* YOGA — level + time */}
        {key === "yoga-time" && (
          <Q title="Set up your yoga">
            <p className="mb-1.5 px-1 text-[11px] font-bold uppercase tracking-wide text-muted-foreground">Your level</p>
            <div className="mb-3 flex flex-wrap gap-1.5">{LEVELS.map((l) => <button key={l} onClick={() => setYogaLevel(l)} className={chip(yogaLevel === l)}>{l}</button>)}</div>
            <p className="mb-1.5 px-1 text-[11px] font-bold uppercase tracking-wide text-muted-foreground">How long each session?</p>
            <div className="mb-3 flex flex-wrap gap-1.5">{DURATIONS.map((d) => <button key={d} onClick={() => setDuration(d)} className={chip(duration === d)}>{d} min</button>)}</div>
            <p className="mb-1.5 px-1 text-[11px] font-bold uppercase tracking-wide text-muted-foreground">Days per week</p>
            <div className="flex flex-wrap gap-1.5">{DAYS_N.map((d) => <button key={d} onClick={() => setYogaDays(d)} className={chip(yogaDays === d)}>{d} days</button>)}</div>
            <p className="mt-3 rounded-2xl bg-primary/10 px-3 py-2.5 text-[11px] leading-snug text-foreground/85 ring-1 ring-primary/20"><b>28 sessions are recommended</b> for real results — at {yogaDays} days/week that's about <b>{Math.ceil(28 / yogaDays)} weeks</b>. We'll build the full plan now and keep extending it as you progress, based on your feedback.</p>
          </Q>
        )}

        {/* PROTECT — shared by yoga & exercise */}
        {key === "protect" && (
          <Q title="Any areas to protect?" hint={hasYoga && hasExercise ? "Applies to both your yoga & exercise." : undefined}>
            <p className="mb-2 px-1 text-[10.5px] font-semibold text-red-500">⚠ Under review — may be removed once conditions cover this.</p>
            <div className="flex flex-wrap gap-1.5">
              <button onClick={() => setProtect([])} className={chip(protect.length === 0)}>None</button>
              {PROTECT.map((p) => <button key={p} onClick={() => tog(protect, setProtect, p)} className={chip(protect.includes(p))}>{p}</button>)}
            </div>
          </Q>
        )}

        {/* EXERCISE — everything on one screen, duration prominent at the top */}
        {key === "ex-setup" && (
          <div className="space-y-3">
            {/* duration — big & first, for a quick change */}
            <div className="rounded-2xl bg-primary/10 p-3 ring-1 ring-primary/25">
              <p className="mb-1.5 px-0.5 text-[11px] font-bold uppercase tracking-wide text-primary">⏱️ Workout length</p>
              <div className="flex flex-wrap gap-1.5">{DURATIONS.map((d) => <button key={d} onClick={() => setExDur(d)} className={chip(exDur === d)}>{d} min</button>)}</div>
            </div>
            {/* the rest, compact, with the current pick shown */}
            <div className="space-y-3 rounded-2xl bg-card p-3 ring-1 ring-border/60">
              <ExRow label="Level">{LEVELS.map((l) => <button key={l} onClick={() => setExLevel(l)} className={smChip(exLevel === l)}>{l}</button>)}</ExRow>
              <ExRow label="Days per week">{DAYS_N.map((d) => <button key={d} onClick={() => setExDays(d)} className={smChip(exDays === d)}>{d} days</button>)}</ExRow>
              <ExRow label="Focus">{EX_FOCUS.map((f) => <button key={f} onClick={() => setFocus(f)} className={smChip(focus === f)}>{f}</button>)}</ExRow>
              <ExRow label="Equipment">{EQUIP.map((e) => <button key={e} onClick={() => setEquip(e)} className={smChip(equip === e)}>{e}</button>)}</ExRow>
            </div>
            <p className="rounded-2xl bg-primary/10 px-3 py-2.5 text-[11px] leading-snug text-foreground/85 ring-1 ring-primary/20"><b>28 sessions are recommended</b> for real results — at {exDays} days/week that's about <b>{Math.ceil(28 / exDays)} weeks</b>. We'll build the full plan now and keep extending it as you progress.</p>
          </div>
        )}

        {key === "diet-edit" && (
          <div className="space-y-2">
            <p className="px-1 text-[12px] text-muted-foreground">Here's your current diet — tap <b>Edit</b> on anything you want to change, or save as is.</p>
            <ReviewRow label="Meal format" value={mealMode === "detailed" ? `Detailed · ${meals} main${mini ? ` + ${mini} mini` : ""}` : "Just food tips"} onEdit={() => goTo("diet-meals")} />
            <ReviewRow label="Preferences" value={prefs.join(", ") || "none"} onEdit={() => goTo("diet-prefs")} />
            <ReviewRow label="Allergies / avoid" value={allergies.join(", ") || "none"} onEdit={() => goTo("diet-allergies")} />
            {mealMode === "detailed" && <ReviewRow label="Ingredients" value={`${avoidIng.length ? `−${avoidIng.length}` : ""}${addedIng.length ? ` +${addedIng.length}` : ""}`.trim() || "default set"} onEdit={() => goTo("diet-ingredients")} />}
            <ReviewRow label="Diet plan" value="View & give feedback" onEdit={() => goTo("diet-plan")} />
            <button onClick={save} className="mt-2 w-full rounded-2xl bg-primary py-3 text-[13px] font-bold text-primary-foreground active:scale-[0.99]">Save my diet</button>
          </div>
        )}

        {/* CUISINE — layered picker, now in the diet flow */}
        {key === "diet-cuisine" && (
          <div>
            <p className="mb-3 px-1 text-[12px] text-muted-foreground">Pick a region, then narrow it down — your meal plan will use food you enjoy.</p>
            <CuisinePicker
              path={cuisinePath}
              setPath={(p) => {
                setCuisinePath(p);
                try { const lf = JSON.parse(localStorage.getItem("ayuraise.lifestyle") ?? "{}") ?? {}; lf.cuisinePath = p; lf.cuisine = p[p.length - 1] ?? ""; lf.cuisineRegion = cuisineRegion(p); localStorage.setItem("ayuraise.lifestyle", JSON.stringify(lf)); } catch { /* ignore */ }
              }}
            />
          </div>
        )}

        {/* DESCRIBE YOUR MEALS — just type (or dictate); estimate shown in a popup */}
        {key === "diet-describe" && (
          <div className="space-y-2.5">
            <p className="px-1 text-[11.5px] leading-snug text-muted-foreground">In your own words — a typical day of eating, with rough <b>amounts &amp; timings</b>. Prefer not to? You can skip.</p>
            <div className="relative">
              <textarea value={describeText} onChange={(e) => setDescribeText(e.target.value)} rows={5} placeholder={EAT_EXAMPLE} className="w-full rounded-2xl bg-card px-3 py-2.5 pb-10 text-[11.5px] leading-relaxed ring-1 ring-border/60 placeholder:text-muted-foreground/50 focus:outline-none focus:ring-2 focus:ring-primary/40" />
              {voiceSupported && (
                <button onClick={toggleVoice} aria-label={listening ? "Stop voice" : "Speak it"} className={`absolute bottom-2.5 right-2.5 flex items-center gap-1.5 rounded-full px-2.5 py-1.5 text-[11px] font-bold ring-1 ${listening ? "animate-pulse bg-rose-500 text-white ring-rose-500" : "bg-primary text-primary-foreground ring-primary"}`}>
                  {listening ? <><MicOff size={12} /> Listening…</> : <><Mic size={12} /> Speak</>}
                </button>
              )}
            </div>
            <button onClick={() => setCalPopup(true)} className="rounded-full bg-secondary px-3.5 py-1.5 text-[11.5px] font-bold text-foreground active:scale-95">🔢 Estimate my calories</button>
          </div>
        )}

        {key === "diet-meals" && (
          <div>
            <p className="px-1 text-[10.5px] leading-snug text-muted-foreground">We recommend 2–3 main meals, plus 1 mini-meal (snack) only if you need it.</p>

            {/* detailed vs food-recos — each with an ⓘ that opens a full sample popup */}
            <div className="mt-2.5 flex gap-2">
              {([["detailed", "Detailed meal plan"], ["recos", "Just food tips"]] as const).map(([m, label]) => (
                <div key={m} className="flex flex-1 items-stretch gap-1">
                  <button onClick={() => setMealMode(m)} className={`lf-btn min-w-0 flex-1 rounded-2xl py-2.5 text-[11.5px] font-bold ring-1 ${mealMode === m ? "bg-primary/10 text-primary ring-primary" : "bg-card ring-border/60"}`}>{label}</button>
                  <button onClick={() => setDietModal(m)} aria-label={`See a full ${label} sample`} title="See a full sample" className="flex w-8 shrink-0 items-center justify-center rounded-2xl bg-card text-muted-foreground ring-1 ring-border/60 active:scale-95"><Info size={14} /></button>
                </div>
              ))}
            </div>

            {/* sample of the picked mode — same sky-tinted card as the "Your calorie goal" boxes */}
            <div className="mt-2.5 rounded-2xl bg-sky-50 p-3 ring-1 ring-sky-200 dark:bg-sky-900/30 dark:ring-sky-800">
              <p className="mb-1.5 flex items-center justify-between text-[9.5px] font-bold uppercase tracking-wide text-sky-800 dark:text-sky-200"><span>👀 Sample · {mealMode === "detailed" ? "detailed plan" : "food tips"}</span> <button onClick={() => setDietModal(mealMode)} className="rounded-full bg-sky-600 px-2 py-0.5 text-[9px] font-bold normal-case text-white">see full →</button></p>
              {mealMode === "detailed" ? (
                <div className="space-y-0.5 text-[11px] text-sky-900/85 dark:text-sky-100/85">
                  <p><b className="text-sky-800 dark:text-sky-200">Breakfast · 8–10am</b> — Vegetable poha + peanuts</p>
                  <p className="text-[10px] text-sky-700/80 dark:text-sky-300/80">poha 60g · peanuts 15g · 1 bowl veg · ~460 kcal</p>
                  <p><b className="text-sky-800 dark:text-sky-200">Lunch · 1–3pm</b> — Dal + 2 roti + sabzi + salad</p>
                  <p className="text-[10px] text-sky-700/80 dark:text-sky-300/80">1 bowl dal · 2 phulka · 1 cup sabzi</p>
                </div>
              ) : (
                <div className="space-y-0.5 text-[11px] text-sky-900/85 dark:text-sky-100/85">
                  <p><b className="text-emerald-600">Favour:</b> dal, millets, lots of veg, curd; biggest meal at lunch</p>
                  <p><b className="text-rose-500">Limit:</b> sugar, maida, fried, late-night snacking</p>
                  <p className="text-[10px] text-sky-700/80 dark:text-sky-300/80">Flexible — no fixed menu, follow it your own way.</p>
                </div>
              )}
            </div>

            {mealMode === "detailed" ? (
              <div className="mt-3 flex gap-6">
                <div>
                  <p className="mb-1.5 px-1 text-[11px] font-bold uppercase tracking-wide text-muted-foreground">Main meals</p>
                  <div className="flex gap-1">{MAIN_MEALS.map((m) => <button key={m} onClick={() => setMeals(m)} className={smChip(meals === m)}>{m}</button>)}</div>
                </div>
                <div>
                  <p className="mb-1.5 px-1 text-[11px] font-bold uppercase tracking-wide text-muted-foreground">Mini-meals</p>
                  <div className="flex gap-1">{MINI_MEALS_D.map((m) => <button key={m} onClick={() => setMini(m)} className={smChip(mini === m)}>{m}</button>)}</div>
                </div>
              </div>
            ) : (
              <p className="mt-3 rounded-2xl bg-card/70 p-3 text-[11.5px] leading-snug text-muted-foreground ring-1 ring-border/50">No fixed meal plan — we'll give you flexible <b className="text-foreground">food recommendations</b> (what to eat more / less of) you can follow your own way. IF below is optional.</p>
            )}

            {/* IF — shown to everyone */}
            <div className="mt-4 rounded-2xl bg-secondary/40 p-3 ring-1 ring-border/50">
              <p className="text-[12px] font-bold text-foreground">⏳ Want to include intermittent fasting?</p>
              <div className="mt-2 flex gap-1.5">
                <button onClick={() => { setDietIF(true); if (mealMode === "detailed") { const h = maxFastForMeals(meals, mini); setFastHrs(h); setIfWindow(`${h}:${24 - h}`); } }} className={chip(dietIF === true)}>Yes, include IF</button>
                <button onClick={() => setDietIF(false)} className={chip(dietIF === false)}>No, thanks</button>
              </div>
              {dietIF === true && (() => {
                const tier = fastTier(fastHrs);
                const lvl = fastLevel(fastHrs);
                const maxH = maxFastForMeals(meals, mini);
                return (
                  <div className="mt-3">
                    <style>{`.if-range{-webkit-appearance:none;appearance:none;width:100%;height:10px;border-radius:9999px;outline:none;background:linear-gradient(to right,#22c55e 0 33.33%,#eab308 33.33% 66.66%,#ef4444 66.66% 100%);}.if-range::-webkit-slider-runnable-track{height:10px;border-radius:9999px;background:transparent;}.if-range::-webkit-slider-thumb{-webkit-appearance:none;appearance:none;margin-top:-4px;width:18px;height:18px;border-radius:9999px;background:#fff;border:2px solid rgba(0,0,0,.28);box-shadow:0 1px 3px rgba(0,0,0,.35);cursor:pointer;}.if-range::-moz-range-track{height:10px;border-radius:9999px;background:transparent;}.if-range::-moz-range-thumb{width:18px;height:18px;border-radius:9999px;background:#fff;border:2px solid rgba(0,0,0,.28);cursor:pointer;}`}</style>

                    {/* what kicks in as you fast + gap note (replaces the old benefit bullets) */}
                    <div className="rounded-xl bg-card/70 p-2.5 ring-1 ring-border/50">
                      <p className="text-[10px] font-bold uppercase tracking-wide text-muted-foreground">What kicks in as you fast</p>
                      <div className="mt-1 flex flex-wrap gap-x-2.5 gap-y-0.5 text-[10px]">
                        {FAST_STAGES.map((s) => <span key={s.h} className={fastHrs >= s.h ? "font-semibold text-foreground" : "text-muted-foreground/50"}>~{s.h}h {s.t}{fastHrs >= s.h ? " ✓" : ""}</span>)}
                      </div>
                    </div>
                    <p className="mt-1.5 px-0.5 text-[10px] text-muted-foreground">Keep a ~5-hour gap between main meals inside your window.</p>

                    {/* meal capacity at this window — small, above the bar */}
                    <p className="mt-3 px-0.5 text-[10px] text-muted-foreground">At <b className="text-foreground">{fastHrs}h fast</b> you can fit: <b className="text-foreground">{tier.meals}</b></p>

                    {/* single colored, selectable bar */}
                    <input type="range" min={12} max={24} value={fastHrs}
                      onChange={(e) => { const h = Number(e.target.value); setFastHrs(h); setIfWindow(`${h}:${24 - h}`); if (mealMode === "detailed") { const t = fastTier(h); if (t.maxMain < meals || t.maxMini < mini) setIfConflict({ hrs: h, tier: t }); } }}
                      className="if-range mt-1" />

                    <p className="mt-2 px-0.5 text-[11.5px] font-semibold text-foreground"><span className="mr-1 inline-block h-2 w-2 rounded-full align-middle" style={{ background: lvl.color }} />{fastHrs}h fast · {24 - fastHrs}h eating window · {lvl.name}</p>
                    {mealMode === "detailed" && <p className="px-0.5 text-[10px] text-muted-foreground">Your {meals} main{mini ? ` + ${mini} mini` : ""} → comfortable up to ~{maxH}h.</p>}
                  </div>
                );
              })()}
            </div>

            {/* meals-vs-fasting clash → offer to reduce meals */}
            {ifConflict && (
              <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-6" onClick={() => setIfConflict(null)}>
                <div className="w-full max-w-xs rounded-2xl bg-card p-4 shadow-xl" onClick={(e) => e.stopPropagation()}>
                  <p className="font-display text-[14px] font-bold text-foreground">Fewer meals for this window</p>
                  <p className="mt-1.5 text-[11.5px] leading-relaxed text-muted-foreground">A <b className="text-foreground">{ifConflict.hrs}h fast</b> fits at most <b className="text-foreground">{ifConflict.tier.meals}</b>. You've chosen {meals} main{mini ? ` + ${mini} mini` : ""}. Change your meals to match?</p>
                  <div className="mt-3 flex flex-col gap-2">
                    <button onClick={() => { setMeals(ifConflict.tier.maxMain); setMini(ifConflict.tier.maxMini); setIfConflict(null); }} className="rounded-xl bg-primary py-2 text-[12px] font-bold text-primary-foreground">Yes — set {ifConflict.tier.maxMain} main{ifConflict.tier.maxMini ? ` + ${ifConflict.tier.maxMini} mini` : ""}</button>
                    <button onClick={() => { const h = maxFastForMeals(meals, mini); setFastHrs(h); setIfWindow(`${h}:${24 - h}`); setIfConflict(null); }} className="rounded-xl bg-secondary py-2 text-[12px] font-bold text-foreground">Keep my meals — fast {maxFastForMeals(meals, mini)}h</button>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
        {key === "diet-prefs" && <Q title="Dietary preferences" hint="Pick all that apply."><div className="flex flex-wrap gap-1.5">{DIET_PREFS.map((p) => <button key={p} onClick={() => tog(prefs, setPrefs, p)} className={chip(prefs.includes(p))}>{p}</button>)}</div></Q>}
        {key === "diet-allergies" && (
          <Q title="Any allergies or foods to avoid?">
            <div className="flex flex-wrap gap-1.5">
              <button onClick={() => setAllergies([])} className={chip(allergies.length === 0)}>None</button>
              {ALLERGENS.map((a) => <button key={a} onClick={() => tog(allergies, setAllergies, a)} className={chip(allergies.includes(a))}>{a}</button>)}
              {allergies.filter((a) => !ALLERGENS.includes(a)).map((a) => <button key={a} onClick={() => tog(allergies, setAllergies, a)} className={chip(true)}>{a} ✕</button>)}
            </div>
            {/* Other — type your own */}
            <div className="mt-2.5 flex gap-2">
              <input
                value={otherAllergy}
                onChange={(e) => setOtherAllergy(e.target.value)}
                onKeyDown={(e) => { if (e.key === "Enter") { const v = otherAllergy.trim(); if (v && !allergies.includes(v)) setAllergies([...allergies, v]); setOtherAllergy(""); } }}
                placeholder="Other — type an allergy or food to avoid"
                className="min-w-0 flex-1 rounded-xl bg-card px-3 py-2 text-[12px] font-semibold ring-1 ring-border/60 placeholder:text-muted-foreground/50"
              />
              <button onClick={() => { const v = otherAllergy.trim(); if (v && !allergies.includes(v)) setAllergies([...allergies, v]); setOtherAllergy(""); }} className="shrink-0 rounded-xl bg-primary px-3.5 py-2 text-[12px] font-bold text-primary-foreground">Add</button>
            </div>
          </Q>
        )}

        {/* KNOW YOUR MEAL · BMR — first, what your body needs at rest */}
        {key === "diet-bmr" && (
          <div className="space-y-3">
            <div className="relative overflow-hidden rounded-3xl p-4 text-center text-primary-foreground shadow-[var(--shadow-glow)]" style={{ background: "var(--gradient-violet)" }}>
              <div className="absolute -right-6 -top-6 h-24 w-24 rounded-full bg-white/10 blur-xl" />
              <div className="absolute -bottom-8 -left-6 h-28 w-28 rounded-full bg-white/10 blur-xl" />
              <p className="relative text-[10px] font-bold uppercase tracking-[0.18em] opacity-85">🔥 Your BMR =</p>
              <p className="relative mt-0.5 font-display text-[32px] font-extrabold leading-none">{calInfo.complete ? calInfo.bmr.toLocaleString() : "~1,400"}</p>
              <p className="relative mt-1 text-[10.5px] font-semibold opacity-90">Kcal your body burns at rest, every single day</p>
            </div>
            {calInfo.complete && <p className="px-1 text-center text-[10.5px] text-muted-foreground">Calculated from your age, gender, height &amp; weight.</p>}
            <p className="px-1 text-[12.5px] leading-relaxed text-foreground/85"><b className="text-foreground">BMR</b> is the amount of energy (calories) your body needs at complete rest to keep you alive.</p>
            <div className="rounded-2xl bg-indigo-50 p-3 ring-1 ring-indigo-200 dark:bg-indigo-900/20 dark:ring-indigo-900/40">
              <p className="text-[10px] font-bold uppercase tracking-wide text-indigo-700 dark:text-indigo-300">How weight works</p>
              <div className="mt-1 space-y-1 text-[11.5px] leading-snug text-indigo-900/90 dark:text-indigo-100/90">
                <p>Weight change = <b>Kcal in − Kcal out</b>.</p>
                <p>Eat a little <b>less</b>, or move a little <b>more</b> → you lose weight.</p>
              </div>
            </div>
            {!calInfo.complete && (
              <button onClick={() => navigate({ to: "/onboarding", search: { step: "profile", returnTo: "/create", profileId: undefined } })} className="px-1 text-[10.5px] font-semibold text-primary underline">Add your age, height &amp; weight for your exact BMR →</button>
            )}
          </div>
        )}

        {/* KNOW YOUR MEAL · the science of eating for weight loss */}
        {key === "diet-science" && (
          <div className="space-y-2.5">
            <p className="px-1 text-[13px] font-bold text-foreground">The science of eating for weight loss 🔬</p>
            <p className="-mt-1 px-1 text-[11px] leading-snug text-muted-foreground">A few simple ideas that make eating less feel easy — not like starving.</p>
            {SCIENCE_CARDS.map((c) => (
              <div key={c.title} className="flex gap-2.5 rounded-2xl bg-card p-3 ring-1 ring-border/60">
                <span className="text-[20px] leading-none">{c.emoji}</span>
                <div className="min-w-0"><p className="text-[12.5px] font-bold text-foreground">{c.title}</p><p className="mt-0.5 text-[11px] leading-snug text-muted-foreground">{c.body}</p></div>
              </div>
            ))}
          </div>
        )}

        {/* KNOW YOUR MEAL · macros — how the day's calories split */}
        {key === "diet-macros" && (
          <div className="space-y-2.5">
            <p className="px-1 text-[13px] font-bold text-foreground">Your daily macros 🍱</p>
            <p className="-mt-1 px-1 text-[11px] leading-snug text-muted-foreground">How your ~{reviewMealPlan.kcalTarget.toLocaleString()} kcal splits across the day.</p>
            {[
              { emoji: "🥚", name: "Protein", amt: reviewMealPlan.macros.protein, chip: "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300", why: "builds & repairs muscle and keeps you full for longer." },
              { emoji: "🌾", name: "Carbs (low-GI)", amt: reviewMealPlan.macros.carbs, chip: "bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300", why: "your main energy — slow carbs give steady fuel, no spikes." },
              { emoji: "🥑", name: "Fats (healthy)", amt: reviewMealPlan.macros.fat, chip: "bg-rose-100 text-rose-600 dark:bg-rose-900/40 dark:text-rose-300", why: "supports hormones & skin — a little goes a long way." },
            ].map((m) => (
              <div key={m.name} className="flex items-center gap-2.5 rounded-2xl bg-card p-3 ring-1 ring-border/60">
                <span className="text-[20px]">{m.emoji}</span>
                <div className="min-w-0 flex-1"><p className="text-[12.5px] font-bold text-foreground">{m.name}</p><p className="text-[10.5px] leading-snug text-muted-foreground">{m.why}</p></div>
                <span className={`shrink-0 rounded-full px-2.5 py-1 text-[12px] font-bold ${m.chip}`}>{m.amt}g</span>
              </div>
            ))}
          </div>
        )}

        {/* KNOW YOUR MEAL · per-meal strategy (breakfast / lunch / snack / dinner) */}
        {key.startsWith("diet-meal-") && (() => {
          const meal = key.replace("diet-meal-", "");
          const s = MEAL_STRATEGY[meal];
          if (!s) return null;
          const kcal = Math.round((reviewMealPlan.kcalTarget * s.share) / 10) * 10;
          const idx = MEAL_ORDER.indexOf(meal);
          return (
            <div className="space-y-2.5">
              <div className="flex items-center justify-between rounded-2xl bg-secondary/50 px-3 py-2">
                <p className="text-[13px] font-bold text-foreground">{s.emoji} {s.title}</p>
                <p className="text-[12.5px] font-bold text-primary">~{kcal} kcal</p>
              </div>
              <p className="px-1 text-[11px] text-muted-foreground">⏰ {s.time}</p>
              {s.start && (
                <div className="rounded-2xl bg-amber-50 p-3 ring-1 ring-amber-200 dark:bg-amber-900/20 dark:ring-amber-800/50">
                  <p className="text-[11px] font-bold text-amber-800 dark:text-amber-200">☀️ {s.start.note}</p>
                  <p className="mt-1 text-[11px] text-amber-900/85 dark:text-amber-100/85">{s.start.items.join(" · ")}</p>
                </div>
              )}
              <p className="px-1 text-[11px] font-semibold text-muted-foreground">Complete plates — each ≈ your {s.title.toLowerCase().replace(" (snack)", "")} goal of ~{kcal} kcal. Tap any underlined dish for why it helps, its calories &amp; ways to make it.</p>
              <div className={meal === "dinner" ? "grid grid-cols-2 gap-1.5" : "space-y-1.5"}>
                {s.plates.map((p, pi) => (
                  <div key={pi} className="rounded-2xl bg-card p-2.5 ring-1 ring-border/60">
                    <PlateDishes plate={p} />
                  </div>
                ))}
              </div>
              <div className="rounded-2xl bg-emerald-50 p-3 ring-1 ring-emerald-200 dark:bg-emerald-900/20 dark:ring-emerald-900/40">
                <ul className="space-y-0.5">{s.tips.map((t, i) => <li key={i} className="text-[10.5px] leading-snug text-emerald-900/85 dark:text-emerald-100/85">• {t}</li>)}</ul>
              </div>
              {idx === MEAL_ORDER.length - 1 && <p className="px-1 text-[11px] leading-snug text-muted-foreground">Next — we'll turn these into a <b>day-wise plan</b> you can follow &amp; tweak.</p>}
            </div>
          );
        })()}

        {/* KNOW YOUR MEAL · calorie sense — what calories mean, before the numbers */}
        {key === "diet-cal-learn" && (
          <div className="space-y-1">
            <div className="rounded-2xl bg-card p-2.5 ring-1 ring-border/60">
              <p className="mb-1 text-[10px] font-bold uppercase tracking-wide text-muted-foreground">🍽️ Calories IN</p>
              <div className="grid grid-cols-2 gap-x-2 gap-y-0.5">
                {CAL_FOODS.map((f) => (
                  <div key={f.name} className="flex items-center gap-1">
                    <span className="shrink-0 text-[13px]">{f.emoji}</span>
                    <span className="min-w-0 flex-1 text-[10.5px] leading-tight text-foreground/85">{f.name}</span>
                    <span className="shrink-0 text-[12px] font-bold tabular-nums text-primary">{f.cal}</span>
                  </div>
                ))}
              </div>
            </div>
            <div className="rounded-2xl bg-card p-2.5 ring-1 ring-border/60">
              <p className="mb-1 text-[10px] font-bold uppercase tracking-wide text-muted-foreground">🔥 Calories OUT</p>
              <div className="grid grid-cols-2 gap-x-2 gap-y-0.5">
                {CAL_OUT.map((f) => (
                  <div key={f.name} className="flex items-center gap-1">
                    <span className="shrink-0 text-[13px]">{f.emoji}</span>
                    <span className="min-w-0 flex-1 text-[10.5px] leading-tight text-foreground/85">{f.name}</span>
                    <span className="shrink-0 text-[12px] font-bold tabular-nums text-emerald-600 dark:text-emerald-400">{f.cal}</span>
                  </div>
                ))}
              </div>
            </div>
            <div className="rounded-2xl bg-emerald-50 p-2.5 ring-1 ring-emerald-200 dark:bg-emerald-900/20 dark:ring-emerald-900/40">
              <p className="text-[11px] font-bold text-emerald-700 dark:text-emerald-300">✅ Almost zero calories (&lt; 5 kcal)</p>
              <p className="mt-0.5 text-[11px] leading-snug text-emerald-900/90 dark:text-emerald-100/90">{CAL_ZERO.join(" · ")}</p>
            </div>
          </div>
        )}

        {/* KNOW YOUR MEAL · your calorie goal: BMR → activity burn → deficit → target */}
        {key === "diet-cal" && (
          <div className="space-y-2">
            {/* result — compact */}
            <div className="flex items-center justify-between gap-2 rounded-2xl px-3.5 py-1.5 text-primary-foreground shadow-sm" style={{ background: "var(--gradient-violet)" }}>
              <p className="min-w-0 flex-1 text-[11px] font-semibold opacity-90">🎯 {reviewMealPlan.goalLabel}</p>
              <p className="shrink-0 font-display text-[20px] font-extrabold leading-none">{effTarget.toLocaleString()}<span className="ml-1 text-[10px] font-semibold opacity-80">kcal</span></p>
            </div>

            <div className="space-y-1.5">
              <p className="px-1 text-[10px] font-bold uppercase tracking-wide text-muted-foreground">How we got here</p>
              {!calInfo.complete && <p className="rounded-xl bg-secondary/50 px-3 py-2.5 text-[11px] leading-snug text-muted-foreground">We've used a typical estimate for now. Add your age, height &amp; weight below for your exact BMR &amp; breakdown.</p>}
              {calInfo.complete && <>
              <CalRow emoji="😴" tint="slate" label="At rest (BMR)" value={calInfo.bmr} unit="kcal/day" />

              {/* activity burn — one simple line (level base + yoga + exercise) */}
              <div className="rounded-xl bg-accent/35 p-2.5 ring-1 ring-accent/60 dark:bg-accent/15 dark:ring-accent/30">
                <div className="flex items-center justify-between gap-2">
                  <p className="text-[11.5px] font-bold text-accent-foreground dark:text-foreground/85">🚶 + Your activity burn</p>
                  <span className="font-display text-[15px] font-extrabold tabular-nums text-accent-foreground dark:text-foreground/90">~{actMid}</span>
                </div>
                <p className="mt-1 text-[10px] leading-snug text-foreground/70">{actRows.map((a) => a.label).join(", ")}</p>
              </div>

              {(calInfo.deficit > 0 || calInfo.surplus > 0) && <CalRow emoji="🍽️" tint="sky" label="= Maintain your weight" value={effMaintenance} unit="kcal/day" />}

              {calInfo.deficit > 0 && (
                <CalRow emoji="📉" tint="amber" label={`− To lose ~${calInfo.lossKg.toFixed(1)} kg/week`} sub={`A safe, steady pace — ${calInfo.deficit} kcal/day below maintenance`} value={`−${calInfo.deficit}`} unit="kcal/day" />
              )}
              {calInfo.surplus > 0 && <CalRow emoji="📈" tint="amber" label="+ To build muscle steadily" value={`+${calInfo.surplus}`} unit="kcal/day" />}
              </>}

              <CalRow emoji="🎯" tint="emerald" label="Your target — eat around" sub={calInfo.complete && calInfo.deficit > 0 ? `${effMaintenance.toLocaleString()} − ${calInfo.deficit} — burn more than you eat` : undefined} value={effTarget} unit="kcal/day" highlight />
            </div>
            {!calInfo.complete && (
              <button onClick={() => navigate({ to: "/onboarding", search: { step: "profile", returnTo: "/create", profileId: undefined } })} className="px-1 text-[10.5px] font-semibold text-primary underline">Add your age, height &amp; weight for exact numbers →</button>
            )}
          </div>
        )}

        {/* KNOW YOUR MEAL · 2 — one comprehensive "what to eat & why" (macros + goal extras + limits) */}
        {key === "diet-foods" && (() => {
          const goalFavour = Array.from(new Set(reviewMealPlan.perGoal.flatMap((p) => p.eat))).slice(0, 6);
          const limits = Array.from(new Set([...reviewMealPlan.perGoal.flatMap((p) => p.avoid), ...(reviewMealPlan.prakriti?.avoid ?? []), ...reviewMealPlan.ritucharya.avoid])).slice(0, 8);
          const MacroCard = ({ emoji, name, amt, chip, foods, why }: { emoji: string; name: string; amt: number; chip: string; foods: string[]; why: string }) => (
            <div className="rounded-2xl bg-card p-3 ring-1 ring-border/60">
              <div className="flex items-center gap-2">
                <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-accent/50 text-lg">{emoji}</span>
                <p className="flex-1 text-[13px] font-bold text-foreground">{name}</p>
                <span className={`rounded-full px-2 py-0.5 text-[11px] font-bold ${chip}`}>{amt}g/day</span>
              </div>
              <p className="mt-1.5 text-[11.5px] leading-snug text-foreground/85"><TermList items={foods} /></p>
              <p className="mt-1 text-[10.5px] leading-snug text-muted-foreground"><b className="text-foreground/70">Why:</b> {why}</p>
            </div>
          );
          return (
            <div className="space-y-2.5">
              <p className="px-1 text-[13px] font-bold text-foreground">What to eat — and why 🍎</p>
              <p className="-mt-1 px-1 text-[10px] text-muted-foreground">Tap any underlined food for an example & its macros.</p>
              <MacroCard emoji="🥚" name="Protein" amt={reviewMealPlan.macros.protein} chip="bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300" foods={reviewMealPlan.foodRecos.protein} why="keeps you full and protects muscle — so you eat less without feeling hungry." />
              <MacroCard emoji="🌾" name="Low-GI carbs" amt={reviewMealPlan.macros.carbs} chip="bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300" foods={reviewMealPlan.foodRecos.carbs} why="steady energy with fewer sugar spikes & cravings — millets, oats & whole grains over white rice/maida." />
              <MacroCard emoji="🥑" name="Healthy fats" amt={reviewMealPlan.macros.fat} chip="bg-rose-100 text-rose-600 dark:bg-rose-900/40 dark:text-rose-300" foods={reviewMealPlan.foodRecos.fats} why="support hormones & skin, and keep you satisfied — in small amounts." />
              <div className="rounded-2xl bg-card p-3 ring-1 ring-border/60">
                <div className="flex items-center gap-2"><span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-accent/50 text-lg">🍉</span><p className="flex-1 text-[13px] font-bold text-foreground">Water-rich fruit &amp; veg</p></div>
                <p className="mt-1 text-[10.5px] leading-snug text-muted-foreground"><b className="text-foreground/70">Why:</b> they fill you up for fewer calories and keep you hydrated.</p>
              </div>
              {goalFavour.length > 0 && (
                <div className="rounded-2xl bg-emerald-50 p-3 ring-1 ring-emerald-200 dark:bg-emerald-900/20 dark:ring-emerald-900/40">
                  <p className="text-[11px] font-bold text-emerald-700 dark:text-emerald-300">✅ Extra for your goal ({reviewMealPlan.perGoal.map((p) => p.label).join(", ")})</p>
                  <p className="mt-1 text-[11.5px] leading-snug text-emerald-900/90 dark:text-emerald-100/90"><TermList items={goalFavour} /></p>
                </div>
              )}
              {limits.length > 0 && (
                <div className="rounded-2xl bg-rose-50 p-3 ring-1 ring-rose-200 dark:bg-rose-900/20 dark:ring-rose-900/40">
                  <p className="text-[11px] font-bold text-rose-600 dark:text-rose-300">⛔ Go easy on</p>
                  <p className="mt-1 text-[11.5px] leading-snug text-rose-900/90 dark:text-rose-100/90"><TermList items={limits} /></p>
                </div>
              )}
            </div>
          );
        })()}

        {/* KNOW YOUR MEAL · 3 — body type (prakriti) & season (ritucharya), smooth visual cards */}
        {key === "diet-prakriti" && (
          <div className="space-y-2.5">
            <p className="px-1 text-[13px] font-bold text-foreground">Tuned to you &amp; the season 🧘</p>
            {reviewMealPlan.prakriti && (
              <div className="rounded-2xl bg-card p-3 ring-1 ring-border/60">
                <div className="flex items-center gap-2">
                  <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-accent/50 text-lg">{reviewMealPlan.prakriti.dosha === "vata" ? "🌬️" : reviewMealPlan.prakriti.dosha === "pitta" ? "🔥" : "🌊"}</span>
                  <p className="flex-1 text-[12.5px] font-bold capitalize text-foreground">Your {reviewMealPlan.prakriti.dosha} body type</p>
                </div>
                {reviewMealPlan.prakriti.note && <p className="mt-1 text-[10.5px] leading-snug text-muted-foreground">{reviewMealPlan.prakriti.note}</p>}
                <p className="mt-1 text-[11.5px] leading-snug text-foreground/85"><b className="text-emerald-600">Favour:</b> <TermList items={reviewMealPlan.prakriti.eat} /></p>
                <p className="text-[11.5px] leading-snug text-foreground/85"><b className="text-rose-500">Go easy:</b> <TermList items={reviewMealPlan.prakriti.avoid} /></p>
              </div>
            )}
            <div className="rounded-2xl bg-card p-3 ring-1 ring-border/60">
              <div className="flex items-center gap-2">
                <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-accent/50 text-lg">🍂</span>
                <p className="flex-1 text-[12.5px] font-bold text-foreground">This season — {reviewMealPlan.ritucharya.label}</p>
              </div>
              <p className="mt-1 text-[11.5px] leading-snug text-foreground/85"><b className="text-emerald-600">Favour:</b> <TermList items={reviewMealPlan.ritucharya.eat} /></p>
              <p className="text-[11.5px] leading-snug text-foreground/85"><b className="text-rose-500">Go easy:</b> <TermList items={reviewMealPlan.ritucharya.avoid} /></p>
            </div>
            <p className="rounded-2xl bg-primary/10 px-3 py-2.5 text-[11px] leading-snug text-foreground/85 ring-1 ring-primary/20">Tap any underlined food for details. Next — the <b>ingredients</b> we'll build your meals from.</p>
          </div>
        )}

        {/* DIET — the ingredients we'll build the plan from (asked BEFORE the plan is built) */}
        {key === "diet-ingredients" && (() => {
          const active = [...SHOW_ING.filter((i) => !avoidIng.includes(i)), ...addedIng];
          const addIngredient = () => { const v = addInput.trim(); if (v && !active.includes(v) && !addedIng.includes(v)) setAddedIng((a) => [...a, v]); setAddInput(""); };
          return (
            <div className="space-y-2.5">
              <p className="px-1 text-[12px] leading-snug text-muted-foreground">These are the ingredients I'll use to create your meal plan. <b>Add</b> any you'd like, or <b>remove</b> / <b>swap</b> ones you don't. Tap <Info size={11} className="mb-0.5 inline" /> to see why each fits you.</p>

              {/* add your own */}
              <div className="flex gap-2">
                <input value={addInput} onChange={(e) => setAddInput(e.target.value)} onKeyDown={(e) => { if (e.key === "Enter") addIngredient(); }} placeholder="Add an ingredient — e.g. quinoa, mushroom" className="min-w-0 flex-1 rounded-xl bg-card px-3 py-2 text-[12px] ring-1 ring-border/60 focus:outline-none focus:ring-2 focus:ring-primary/40" />
                <button onClick={addIngredient} className="shrink-0 rounded-xl bg-primary px-3.5 py-2 text-[12px] font-bold text-primary-foreground active:scale-95">+ Add</button>
              </div>

              {/* active ingredients — compact grid; ✕ remove + ⇄ swap icons, ⓘ for the rest */}
              <div className="grid grid-cols-2 gap-1.5">
                {active.map((ing) => {
                  const known = !!ING_META[ing];
                  const custom = addedIng.includes(ing);
                  return (
                    <div key={ing} className="flex items-center gap-1.5 rounded-xl bg-card p-2 ring-1 ring-border/60">
                      {known
                        ? <button onClick={() => setInfoIng(ing)} aria-label={`Why ${ing}`} className="shrink-0 text-muted-foreground/70 active:scale-90"><Info size={13} /></button>
                        : <span className="shrink-0 text-[11px]">🥕</span>}
                      <p className="min-w-0 flex-1 truncate text-[11.5px] font-bold text-foreground">{ing}</p>
                      {known && <button onClick={() => { setSwapIng(ing); setReplacePick(ingReplace[ing] ?? []); }} aria-label={`Swap ${ing}`} className="shrink-0 text-foreground/55 active:scale-90"><Repeat size={13} /></button>}
                      <button onClick={() => custom ? setAddedIng((a) => a.filter((x) => x !== ing)) : setAvoidIng((a) => [...a, ing])} aria-label={`Remove ${ing}`} className="shrink-0 text-rose-500 active:scale-90"><X size={14} /></button>
                    </div>
                  );
                })}
              </div>

              {/* changes summary — removed / swapped shown here, not on the tiles */}
              {(avoidIng.length > 0) && (
                <div className="rounded-2xl bg-secondary/40 p-3 ring-1 ring-border/60">
                  <p className="mb-1 text-[10px] font-bold uppercase tracking-wide text-muted-foreground">Your changes</p>
                  <div className="space-y-1">
                    {avoidIng.map((ing) => (
                      <div key={ing} className="flex items-center gap-2 text-[11px]">
                        <span className="flex-1 text-foreground/85">{ingReplace[ing]?.length ? <><span className="line-through text-muted-foreground">{ing}</span> → <b className="text-emerald-600">{ingReplace[ing].join(", ")}</b></> : <span className="line-through text-muted-foreground">{ing} (removed)</span>}</span>
                        <button onClick={() => { setAvoidIng((a) => a.filter((x) => x !== ing)); setIngReplace((m) => { const n = { ...m }; delete n[ing]; return n; }); }} className="shrink-0 text-[10.5px] font-bold text-primary">undo</button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              <p className="px-1 text-[10.5px] text-muted-foreground">You can also change these anytime later, right from your plan.</p>
            </div>
          );
        })()}

        {/* DIET — the plan itself, shown before My Plan, with an AyuBot to adjust it */}
        {key === "diet-plan" && (
          <div className="space-y-3">
            <div className="rounded-2xl bg-card p-2.5 ring-1 ring-border/60">
              <p className="mb-1.5 px-1 text-[10px] font-bold uppercase tracking-wide text-primary">Your day-wise plan — tap underlined foods for why &amp; macros</p>
              <MealPlanView plan={reviewMealPlan} mode={mealMode} avoid={avoidIng} onAvoidChange={setAvoidIng} />
            </div>

            <button onClick={save} className="w-full rounded-2xl bg-primary py-3 text-[13.5px] font-bold text-primary-foreground shadow-[var(--shadow-glow)] active:scale-[0.99]">✅ Looks good — save my plan</button>
            <button onClick={() => { setBotOpen(true); setSavePopup(true); }} className="w-full rounded-2xl bg-secondary py-2.5 text-[12.5px] font-semibold text-foreground active:scale-[0.99]">💬 Want to change something? Talk to AyuBot</button>
            <p className="px-1 text-[10.5px] leading-snug text-muted-foreground">You can change ingredients or swap any meal anytime from your plan.</p>
          </div>
        )}

        {/* REVIEW */}
        {key === "review" && (
          <div className="space-y-2.5">
            <div className="flex items-center justify-between px-1">
              <h2 className="font-display text-[16px] font-bold text-foreground">Review your plan</h2>
            </div>
            <ReviewRow label="Goal" value={goalLabels.join(" + ")} onEdit={() => goTo("goals")} />
            <ReviewRow label="Personalizing" value={ivs.map((k) => `${IV_META[k].emoji} ${IV_META[k].label}`).join("  ·  ")} onEdit={() => goTo("interventions")} />
            {hasYoga && <ReviewRow label="Yoga" value={`${yogaLevel} · ${duration} min/session${protect.length ? ` · protect: ${protect.join(", ")}` : ""}`} onEdit={() => goTo("yoga-time")} />}
            {hasExercise && <ReviewRow label="Exercise" value={`${exDur} min · ${exLevel} · ${exDays} days · ${focus} · ${equip}`} onEdit={() => goTo("ex-setup")} />}
            {hasDiet && <ReviewRow label="Diet" value={`${dietIF ? `IF ${ifWindow} · ` : ""}${mealMode === "detailed" ? `${meals} main${mini ? `+${mini} mini` : ""}` : "Food tips"} · ${prefs.join(", ") || "no prefs"}${allergies.length ? ` · avoid: ${allergies.join(", ")}` : ""}`} onEdit={() => goTo("diet-meals")} />}
            {wantsWeight && dailyDeficit && <ReviewRow label="Target" value={`${tgtWt} kg by ${tgtDate} (≈${dailyDeficit} kcal/day)`} onEdit={() => goTo("about")} />}

            {hasDiet && (
              <p className="px-1 text-[11px] leading-snug text-muted-foreground">Your {mealMode === "recos" ? "food tips" : "meal plan"} is set from the feedback you gave — you can fine-tune it anytime from your plan.</p>
            )}

            {goals.some((g) => { const s = SUPPORT[g]; return s && (s.detox || s.fasting || s.meditation || s.herbs); }) && (
              <p className="px-1 text-[11.5px] leading-snug text-muted-foreground">Next you'll see <b>Detox, Fasting, Meditation & Herbs</b> that support your goal — explained on your plan page, to start whenever you're ready.</p>
            )}
            <p className="px-1 pt-1 text-[11px] text-muted-foreground">Saved to <b>My Plans</b> (up to 3).</p>
          </div>
        )}
      </div>

      {/* Full diet-plan popup — opened from the ⓘ sample icons and the review "View & edit" button */}
      {dietModal && (
        <div className="fixed inset-0 z-[60] flex flex-col bg-black/50" onClick={() => setDietModal(null)}>
          <div className="mt-auto max-h-[92svh] w-full overflow-y-auto rounded-t-2xl bg-background p-4 pb-[max(1.25rem,env(safe-area-inset-bottom))]" onClick={(e) => e.stopPropagation()}>
            <div className="mx-auto mb-2 h-1 w-10 rounded-full bg-border" />
            <div className="mb-1.5 flex items-center justify-between gap-2">
              <h3 className="font-display text-[15px] font-bold text-foreground">{dietModal === "recos" ? "Food tips" : "Your meal plan"}</h3>
              <button onClick={() => setDietModal(null)} className="shrink-0 rounded-full bg-secondary px-3.5 py-1.5 text-[11px] font-bold text-foreground active:opacity-70">Done</button>
            </div>
            <p className="mb-2.5 text-[10.5px] leading-snug text-muted-foreground">Tap <b>Ingredients</b> to add/remove what you don't want{dietModal === "detailed" ? ", or Swap any meal" : ""} — changes apply right here.</p>
            <MealPlanView plan={reviewMealPlan} mode={dietModal} avoid={avoidIng} onAvoidChange={setAvoidIng} />
          </div>
        </div>
      )}

      {/* Estimate my calories — popup */}
      {calPopup && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/50 p-6" onClick={() => setCalPopup(false)}>
          <div className="w-full max-w-xs rounded-3xl bg-card p-5 text-center shadow-xl" onClick={(e) => e.stopPropagation()}>
            {eatEstimate.found >= 3 ? (
              <>
                <span className="text-3xl">🌿</span>
                <p className="mt-2 text-[12.5px] leading-relaxed text-foreground">You're eating about<br /><b className="font-display text-[22px] text-primary">~{eatEstimate.kcal.toLocaleString()} kcal/day</b></p>
                <p className="mt-1 text-[11px] leading-snug text-muted-foreground">Rough estimate from what you wrote. If it looks off, add amounts or timings.</p>
              </>
            ) : (
              <>
                <span className="text-3xl">✍️</span>
                <p className="mt-2 text-[13px] font-bold text-foreground">A little more detail?</p>
                <p className="mt-1 text-[11.5px] leading-snug text-muted-foreground">To estimate your calories, add rough <b>amounts &amp; timings</b> — e.g. "2 rotis, 1 bowl dal, 1 cup curd". It also helps us learn your eating habits. Don't want to? You can skip.</p>
              </>
            )}
            <button onClick={() => setCalPopup(false)} className="mt-4 w-full rounded-2xl bg-primary py-2.5 text-[13px] font-bold text-primary-foreground">{eatEstimate.found >= 3 ? "Got it" : "OK"}</button>
          </div>
        </div>
      )}

      {/* AyuBot — adjust the plan, then save (opened from "Want to change something?") */}
      {savePopup && (
        <div className="fixed inset-0 z-[60] flex items-end justify-center bg-black/50" onClick={() => setSavePopup(false)}>
          <div className="max-h-[88svh] w-full max-w-xl overflow-y-auto rounded-t-2xl bg-card p-4 pb-[max(1.25rem,env(safe-area-inset-bottom))]" onClick={(e) => e.stopPropagation()}>
            <div className="mx-auto mb-3 h-1 w-10 rounded-full bg-border" />
            <p className="font-display text-[15px] font-bold text-foreground">💬 Tell AyuBot what to change</p>
            <p className="mt-0.5 text-[11px] leading-snug text-muted-foreground">It keeps adjusting your plan as you ask.</p>
            <div className="mt-2.5 rounded-2xl bg-secondary/40 p-3 ring-1 ring-border/60">
              <div className="space-y-1.5">
                {botMsgs.map((m, i) => (
                  <div key={i} className={`flex ${m.from === "you" ? "justify-end" : "justify-start"}`}>
                    <p className={`max-w-[85%] rounded-2xl px-3 py-1.5 text-[11.5px] leading-snug ${m.from === "you" ? "bg-primary text-primary-foreground" : "bg-card text-foreground/85 ring-1 ring-border/50"}`}>{m.text}</p>
                  </div>
                ))}
              </div>
              <div className="mt-2 flex gap-2">
                <input value={botInput} onChange={(e) => setBotInput(e.target.value)} onKeyDown={(e) => { if (e.key === "Enter") sendBot(); }} placeholder="e.g. no paneer, lighter dinners, more protein" className="min-w-0 flex-1 rounded-xl bg-background px-3 py-2 text-[12px] ring-1 ring-border/60 focus:outline-none focus:ring-2 focus:ring-primary/40" />
                <button onClick={sendBot} className="shrink-0 rounded-xl bg-primary px-3.5 py-2 text-[12px] font-bold text-primary-foreground active:scale-95">Send</button>
              </div>
              <button onClick={() => setFeedbackOpen(true)} className="mt-2 text-[11px] font-semibold text-primary">More options — ingredients, dishes to keep →</button>
            </div>
            <button onClick={save} className="mt-3 w-full rounded-2xl bg-primary py-3 text-[13.5px] font-bold text-primary-foreground active:scale-[0.99]">💾 Save my plan →</button>
            <button onClick={() => setSavePopup(false)} className="mt-2 w-full rounded-2xl bg-secondary py-2.5 text-[12.5px] font-semibold text-foreground">← Back</button>
          </div>
        </div>
      )}

      {/* Ingredient INFO popup — ⓘ just explains why it fits you (no action buttons) */}
      {infoIng && (() => {
        const meta = ING_META[infoIng];
        const why = ingredientWhy(infoIng, goalLabels, reviewMealPlan.prakriti?.dosha, reviewMealPlan.ritucharya.label);
        return (
          <div className="fixed inset-0 z-[60] flex items-end justify-center bg-black/50" onClick={() => setInfoIng(null)}>
            <div className="max-h-[88svh] w-full max-w-xl overflow-y-auto rounded-t-2xl bg-card p-4 pb-[max(1.25rem,env(safe-area-inset-bottom))]" onClick={(e) => e.stopPropagation()}>
              <div className="mx-auto mb-3 h-1 w-10 rounded-full bg-border" />
              <p className="text-[15px] font-bold text-foreground">{infoIng}</p>
              {meta?.kinds && <p className="mt-0.5 text-[11px] text-muted-foreground"><b className="text-foreground/70">Includes:</b> {meta.kinds.join(", ")}</p>}
              <div className="mt-2 space-y-1">
                {why.map((l, i) => <p key={i} className="text-[11.5px] leading-snug text-foreground/85">{i === 0 ? "" : "• "}{l}</p>)}
              </div>
              <div className="mt-3 flex gap-2">
                <button onClick={() => { const n = infoIng; setInfoIng(null); setSwapIng(n); setReplacePick(ingReplace[n] ?? []); }} className="flex-1 rounded-xl bg-secondary py-2 text-[12px] font-bold text-foreground active:scale-95">⇄ Swap</button>
                <button onClick={() => { setAvoidIng((a) => a.includes(infoIng) ? a : [...a, infoIng]); setInfoIng(null); }} className="flex-1 rounded-xl bg-rose-50 py-2 text-[12px] font-bold text-rose-600 ring-1 ring-rose-200 active:scale-95 dark:bg-rose-900/30 dark:text-rose-300">Remove</button>
              </div>
              <button onClick={() => setInfoIng(null)} className="mt-2 w-full rounded-2xl bg-primary py-2.5 text-[13px] font-bold text-primary-foreground">Got it</button>
            </div>
          </div>
        );
      })()}

      {/* Ingredient SWAP popup — pick 1–2 alternatives (not ones already in the list) */}
      {swapIng && (() => {
        const replaceOpts = (ING_META[swapIng]?.replaceWith ?? []).filter((r) => !SHOW_ING.includes(r));
        return (
          <div className="fixed inset-0 z-[60] flex items-end justify-center bg-black/50" onClick={() => setSwapIng(null)}>
            <div className="w-full max-w-xl rounded-t-2xl bg-card p-4 pb-[max(1.25rem,env(safe-area-inset-bottom))]" onClick={(e) => e.stopPropagation()}>
              <div className="mx-auto mb-3 h-1 w-10 rounded-full bg-border" />
              <p className="text-[14px] font-bold text-foreground">Swap {swapIng}</p>
              <p className="mt-0.5 text-[11px] text-muted-foreground">Pick 1–2 alternatives that fill the same need.</p>
              <div className="mt-2.5 flex flex-wrap gap-1.5">
                {replaceOpts.map((r) => {
                  const on = replacePick.includes(r);
                  return <button key={r} onClick={() => setReplacePick((p) => on ? p.filter((x) => x !== r) : p.length >= 2 ? p : [...p, r])} className={`rounded-full px-3 py-1 text-[11.5px] font-semibold ring-1 ${on ? "bg-primary text-primary-foreground ring-primary" : "bg-card text-foreground/80 ring-border/60"}`}>{r}</button>;
                })}
              </div>
              <button disabled={!replacePick.length} onClick={() => { setIngReplace((m) => ({ ...m, [swapIng]: replacePick })); setAvoidIng((a) => a.includes(swapIng) ? a : [...a, swapIng]); setSwapIng(null); }}
                className={`mt-3 w-full rounded-2xl py-2.5 text-[13px] font-bold ${replacePick.length ? "bg-primary text-primary-foreground" : "bg-secondary text-muted-foreground"}`}>Swap{replacePick.length ? ` → ${replacePick.join(" & ")}` : ""}</button>
            </div>
          </div>
        );
      })()}

      {/* Feedback sheet — adjust the meals (dislikes, preferences, dishes to keep, ingredients to remove) */}
      {feedbackOpen && (
        <div className="fixed inset-0 z-[60] flex items-end justify-center bg-black/50" onClick={() => setFeedbackOpen(false)}>
          <div className="max-h-[88svh] w-full max-w-xl overflow-y-auto rounded-t-2xl bg-card p-4 pb-[max(1.25rem,env(safe-area-inset-bottom))]" onClick={(e) => e.stopPropagation()}>
            <div className="mx-auto mb-3 h-1 w-10 rounded-full bg-border" />
            <p className="text-[14px] font-bold text-foreground">Adjust your meals</p>
            <p className="mt-0.5 text-[11px] leading-snug text-muted-foreground">Tell us what to change — your plan updates right away, and next week's plan learns from it.</p>

            {mealMode === "detailed" && (
              <div className="mt-3">
                <p className="mb-1.5 text-[10.5px] font-bold uppercase tracking-wide text-muted-foreground">Ingredients to remove</p>
                <div className="flex flex-wrap gap-1.5">
                  {MAIN_INGREDIENTS.map((ing) => {
                    const off = avoidIng.includes(ing);
                    return (
                      <button key={ing} onClick={() => setAvoidIng((a) => off ? a.filter((x) => x !== ing) : [...a, ing])}
                        className={`rounded-full px-3 py-1 text-[11px] font-semibold ring-1 ${off ? "bg-rose-50 text-rose-600 line-through ring-rose-200" : "bg-secondary text-foreground/80 ring-border/50"}`}>
                        {ing}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            <div className="mt-3">
              <p className="mb-1 text-[10.5px] font-bold uppercase tracking-wide text-muted-foreground">Dishes you want to keep</p>
              <input value={keepDishes} onChange={(e) => setKeepDishes(e.target.value)} placeholder="e.g. keep the poha breakfast, keep khichdi dinner" className="w-full rounded-xl bg-background px-3 py-2 text-[12px] ring-1 ring-border/60 focus:outline-none focus:ring-2 focus:ring-primary/40" />
            </div>

            <div className="mt-3">
              <p className="mb-1 text-[10.5px] font-bold uppercase tracking-wide text-muted-foreground">Dislikes / preferences</p>
              <textarea value={dietFeedback} onChange={(e) => setDietFeedback(e.target.value)} rows={2} placeholder="e.g. don't like karela, prefer lighter dinners, more South-Indian" className="w-full resize-none rounded-xl bg-background px-3 py-2 text-[12px] ring-1 ring-border/60 focus:outline-none focus:ring-2 focus:ring-primary/40" />
            </div>

            <button onClick={() => setFeedbackOpen(false)} className="mt-4 w-full rounded-2xl bg-primary py-2.5 text-[13px] font-bold text-primary-foreground active:scale-[0.99]">Update my plan →</button>
          </div>
        </div>
      )}

      <div className="fixed inset-x-0 z-30 mx-auto flex max-w-xl justify-center gap-2 px-4" style={{ bottom: "calc(4.5rem + env(safe-area-inset-bottom))" }}>
        {key !== "review" ? (
          <button onClick={next} disabled={!canNext} className={`mx-auto w-full max-w-[18rem] rounded-2xl px-6 py-2.5 text-sm font-bold shadow-lg transition ${canNext ? "bg-primary text-primary-foreground active:scale-[0.99]" : "bg-secondary text-muted-foreground"}`}>Next →</button>
        ) : (
          <button onClick={save} className="mx-auto w-full max-w-[18rem] rounded-2xl bg-primary px-6 py-2.5 text-sm font-bold text-primary-foreground shadow-lg active:scale-[0.99]">💾 Save to My Plans</button>
        )}
      </div>

      <BottomNav />
    </div>
  );
}

/** One coloured step in the calorie breakdown — label on the left, big number on the right. */
const CAL_TINT: Record<string, string> = {
  slate: "bg-secondary/60 text-secondary-foreground ring-border/70 dark:bg-secondary/25 dark:text-foreground/85 dark:ring-border/50",
  sky: "bg-muted text-foreground/80 ring-border/55 dark:bg-muted/35 dark:text-foreground/80 dark:ring-border/45",
  amber: "bg-amber-100/60 text-amber-800 ring-amber-200/70 dark:bg-amber-900/25 dark:text-amber-200 dark:ring-amber-800/50",
  emerald: "bg-primary/10 text-foreground ring-primary/35 dark:bg-primary/15 dark:text-foreground dark:ring-primary/40",
};
function CalRow({ emoji, tint, label, sub, value, unit, highlight }: { emoji: string; tint: keyof typeof CAL_TINT; label: string; sub?: string; value: string | number; unit: string; highlight?: boolean }) {
  return (
    <div className={`flex items-center gap-2 rounded-xl px-3 py-1.5 ring-1 ${CAL_TINT[tint]} ${highlight ? "ring-2" : ""}`}>
      <span className="text-base leading-none">{emoji}</span>
      <div className="min-w-0 flex-1">
        <p className="text-[12px] font-bold leading-tight">{label}</p>
        {sub && <p className="text-[9.5px] font-medium leading-tight opacity-70">{sub}</p>}
      </div>
      <div className="shrink-0 text-right">
        <p className={`font-display font-extrabold leading-none tabular-nums ${highlight ? "text-[19px]" : "text-[15px]"}`}>{typeof value === "number" ? value.toLocaleString() : value}</p>
        <p className="mt-0.5 text-[8px] font-bold uppercase tracking-wide opacity-70">{unit}</p>
      </div>
    </div>
  );
}

/** A compact label + wrapping chips row for the single-screen exercise edit. */
function ExRow({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <p className="mb-1 px-0.5 text-[10.5px] font-bold uppercase tracking-wide text-muted-foreground">{label}</p>
      <div className="flex flex-wrap gap-1">{children}</div>
    </div>
  );
}

function ReviewRow({ label, value, onEdit }: { label: string; value: string; onEdit: () => void }) {
  return (
    <div className="flex items-center gap-2 rounded-2xl bg-card p-3 ring-1 ring-border/60">
      <div className="min-w-0 flex-1">
        <p className="text-[10.5px] font-bold uppercase tracking-wide text-muted-foreground">{label}</p>
        <p className="mt-0.5 text-[12.5px] font-semibold text-foreground">{value}</p>
      </div>
      <button onClick={onEdit} className="shrink-0 rounded-full bg-secondary px-3 py-1.5 text-[11px] font-bold text-foreground active:opacity-70">Edit</button>
    </div>
  );
}
