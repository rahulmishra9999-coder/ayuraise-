// Ingredient knowledge for the "ingredients we'll use" step — the specific kinds under
// each ingredient (which dals / millets / rice / veg), why it's a good fit (mapped to the
// user's goal, prakriti and the season), and sensible swaps that fulfil the same need.

import type { Dosha } from "./diet";

type Role = "protein" | "carb" | "fat" | "veg" | "snack" | "dairy";

export interface IngredientInfo {
  role: Role;
  benefit: string;       // ingredient-specific, plain words
  kinds?: string[];      // specific sub-types to show (dal → moong, masoor …)
  replaceWith: string[]; // alternatives that fill the same need
}

export const ING_META: Record<string, IngredientInfo> = {
  Paneer: { role: "protein", benefit: "High-quality protein & calcium — keeps you full and protects muscle.", replaceWith: ["Sprouts", "Lobia", "Greek yogurt"] },
  Tofu: { role: "protein", benefit: "Light plant protein, easy to digest and low in fat.", replaceWith: ["Sprouts", "Tempeh", "Lobia"] },
  Dal: { role: "protein", benefit: "Everyday plant protein + fibre, gentle on digestion.", kinds: ["Moong", "Masoor", "Toor (arhar)", "Chana dal", "Urad"], replaceWith: ["Sprouts", "Lobia", "Moth beans"] },
  Rajma: { role: "protein", benefit: "Protein + fibre, slow-digesting so you stay full.", kinds: ["Red (laal)", "Chitra", "Kashmiri"], replaceWith: ["Lobia", "Moth beans", "Horse gram"] },
  Chana: { role: "protein", benefit: "Protein, fibre & iron; low-GI, steadies blood sugar.", kinds: ["Kabuli (white)", "Kala (black)", "Sprouted"], replaceWith: ["Lobia", "Green peas", "Moth beans"] },
  Rice: { role: "carb", benefit: "Easy-to-digest energy — pair with dal for complete protein.", kinds: ["Brown rice", "Red / matta rice", "Hand-pounded", "Basmati (small portion)"], replaceWith: ["Quinoa", "Buckwheat", "Samak (barnyard)"] },
  Roti: { role: "carb", benefit: "Whole-grain fibre and slow, steady energy.", kinds: ["Whole wheat", "Bajra", "Jowar", "Ragi", "Jau (barley)"], replaceWith: ["Quinoa", "Buckwheat", "Amaranth (rajgira)"] },
  Millet: { role: "carb", benefit: "Low-GI, high-fibre grains — great for blood sugar & weight.", kinds: ["Ragi (finger)", "Bajra (pearl)", "Jowar (sorghum)", "Foxtail", "Little millet"], replaceWith: ["Quinoa", "Buckwheat", "Amaranth"] },
  Oats: { role: "carb", benefit: "Soluble fibre — lowers cholesterol and keeps you full.", replaceWith: ["Daliya", "Barley", "Quinoa flakes"] },
  Curd: { role: "dairy", benefit: "Probiotic protein — cooling and good for the gut.", replaceWith: ["Buttermilk", "Greek yogurt", "Coconut yogurt"] },
  Peanut: { role: "fat", benefit: "Healthy fat + protein; satisfying in small amounts.", replaceWith: ["Almonds", "Walnuts", "Pumpkin seeds"] },
  Soya: { role: "protein", benefit: "High protein (chunks / tofu) — good for building muscle.", kinds: ["Soya chunks", "Tofu", "Soya granules"], replaceWith: ["Tempeh", "Sprouts", "Lobia"] },
  Ghee: { role: "fat", benefit: "Good fat in small amounts — aids digestion (kindles agni).", replaceWith: ["Cold-pressed oil", "Olive oil", "Seeds"] },
  Besan: { role: "protein", benefit: "Gram-flour protein & fibre — low-GI cheela / chilla.", replaceWith: ["Moong flour", "Sattu", "Oat flour"] },
  Makhana: { role: "snack", benefit: "Light roasted snack — low-calorie with a good crunch.", replaceWith: ["Roasted seeds", "Puffed jowar", "Fruit + nuts"] },
  // common veg bucket (shown when the plan leans on sabzi)
  Vegetables: { role: "veg", benefit: "Fibre, vitamins & minerals — the base of every meal.", kinds: ["Lauki", "Tinda", "Bhindi", "Palak / methi", "Gobi", "Mixed veg", "Tori / parwal"], replaceWith: ["Seasonal greens", "Gourds", "Salad"] },
};

const ROLE_GOAL: Record<Role, string> = {
  protein: "protein keeps you full, protects muscle and blunts sugar spikes",
  carb: "slow carbs give steady energy without sugar spikes",
  fat: "a little good fat supports hormones, skin and satiety",
  veg: "fibre and micronutrients aid digestion and keep you light",
  dairy: "it adds easy protein and supports your gut",
  snack: "a light snack bridges meals without heaviness",
};

const DOSHA_FIT: Record<Dosha, Partial<Record<Role, string>>> = {
  vata: { protein: "take it warm and well-cooked", carb: "warm grains with a little ghee suit you", fat: "grounding fats are good for vata", veg: "cooked (not raw) veg is kinder to vata", dairy: "warm, not cold", snack: "roast / warm it lightly" },
  pitta: { protein: "cooling, mild-spiced is best", carb: "cooling grains suit pitta", fat: "ghee over fried, keep it light", veg: "sweet, cooling veg suit pitta", dairy: "cooling and soothing for pitta", snack: "keep it un-fried" },
  kapha: { protein: "light, well-spiced portions suit kapha", carb: "millets over rice/wheat for kapha", fat: "keep fats small for kapha", veg: "light, warm, spiced veg are great", dairy: "go easy — buttermilk over heavy curd", snack: "dry-roasted, small portions" },
};

/** A short "why it fits you" for an ingredient, tied to goal, prakriti and season. */
export function ingredientWhy(name: string, goalLabels: string[], dosha?: Dosha, rituLabel?: string): string[] {
  const meta = ING_META[name];
  if (!meta) return [];
  const lines = [meta.benefit];
  if (goalLabels.length) lines.push(`For your ${goalLabels.slice(0, 2).join(" & ")} goal — ${ROLE_GOAL[meta.role]}.`);
  if (dosha) { const d = DOSHA_FIT[dosha]?.[meta.role]; if (d) lines.push(`For your ${dosha} body type — ${d}.`); }
  if (rituLabel) lines.push(`This ${rituLabel.toLowerCase()} season — favour it warm and seasonal.`);
  return lines;
}
