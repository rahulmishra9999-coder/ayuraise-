// Per-dish detail for the meal plan: real ingredient amounts ("how much"), the dish's
// macros (protein / carbs / fat in grams) and calories, and a short recipe. Used to power
// the "Detail" view, the per-dish macros, and "See recipe". Vegetarian, Indian, home-style.

import type { FoodMacro } from "./meal-plan";

export interface DishDetail {
  kcal: number;
  p: number; c: number; f: number; // grams
  ingredients: string[];           // with amounts — the "how much"
  recipe: string[];                // short steps
}

export const DISH_DETAILS: Record<string, DishDetail> = {
  // ---------- Breakfast ----------
  "Vegetable poha + peanuts": { kcal: 460, p: 12, c: 70, f: 14, ingredients: ["Poha (flattened rice) 60g dry", "Peanuts 15g", "Onion + peas + carrot 1/2 cup", "Oil 1 tsp, mustard, curry leaves", "Lemon + coriander"], recipe: ["Rinse poha and drain.", "Temper mustard, curry leaves and peanuts in oil.", "Add veg and sauté; mix in poha with salt and turmeric.", "Finish with lemon and coriander."] },
  "Moong dal cheela (2) + mint chutney": { kcal: 420, p: 22, c: 48, f: 14, ingredients: ["Yellow moong dal 60g (soaked, ground)", "Onion, green chilli, coriander", "Oil 2 tsp", "Mint-coriander chutney 2 tbsp"], recipe: ["Grind soaked dal to a batter; mix in chopped veg and salt.", "Spread thin on a hot tawa, drizzle oil.", "Cook both sides; serve with mint chutney."] },
  "Oats upma with veggies": { kcal: 390, p: 12, c: 58, f: 11, ingredients: ["Rolled oats 50g", "Mixed veg (beans, carrot, peas) 1 cup", "Oil 1 tsp, mustard, curry leaves", "Lemon + coriander"], recipe: ["Dry-roast oats lightly.", "Temper spices and sauté veg.", "Add water and oats; cook till fluffy.", "Finish with lemon."] },
  "Idli (3) + sambar": { kcal: 420, p: 14, c: 78, f: 6, ingredients: ["Idli 3", "Sambar (toor dal + veg) 1 bowl", "Coconut chutney 1 tbsp (optional)"], recipe: ["Steam idli batter 10–12 min.", "Serve hot with sambar and chutney."] },
  "Vegetable daliya (broken wheat)": { kcal: 400, p: 12, c: 70, f: 8, ingredients: ["Broken wheat (daliya) 50g", "Mixed veg 1 cup", "Oil 1 tsp, cumin", "Coriander"], recipe: ["Roast daliya lightly.", "Pressure-cook with veg and water (2–3 whistles).", "Season and serve warm."] },
  "Ragi porridge + banana": { kcal: 350, p: 9, c: 66, f: 6, ingredients: ["Ragi flour 40g", "Milk 150 ml (or water)", "Banana 1 small", "Jaggery 1 tsp (optional)"], recipe: ["Cook ragi flour in water till thick, stirring.", "Add milk and sweeten lightly.", "Top with banana."] },
  "Besan chilla + curd": { kcal: 430, p: 18, c: 44, f: 18, ingredients: ["Besan (gram flour) 60g", "Onion, tomato, coriander", "Oil 2 tsp", "Curd 1 small bowl"], recipe: ["Whisk besan to a batter with chopped veg and spices.", "Spread on a tawa and cook both sides.", "Serve with curd."] },
  "Stuffed veg paratha (1) + curd": { kcal: 480, p: 14, c: 62, f: 20, ingredients: ["Whole-wheat dough (1 paratha)", "Veg stuffing (potato/mix) 1/2 cup", "Ghee/oil 1 tsp", "Curd 1 small bowl"], recipe: ["Stuff dough with spiced veg.", "Roll and cook on a tawa with a little ghee.", "Serve with curd."] },
  "Tofu/paneer bhurji + 2 roti": { kcal: 520, p: 30, c: 52, f: 20, ingredients: ["Paneer or tofu 100g", "Onion, tomato, capsicum 1 cup", "Oil 2 tsp", "Whole-wheat roti 2"], recipe: ["Sauté onion, tomato and capsicum.", "Crumble in paneer/tofu with spices.", "Serve with roti."] },
  "Besan chilla (2) + curd": { kcal: 470, p: 20, c: 48, f: 20, ingredients: ["Besan 75g", "Onion, tomato, coriander", "Oil 2 tsp", "Curd 1 bowl"], recipe: ["Whisk besan with veg and spices.", "Make 2 chillas on a tawa.", "Serve with curd."] },
  "Sprouts + moong cheela": { kcal: 430, p: 24, c: 50, f: 12, ingredients: ["Moong dal 50g (ground, for cheela)", "Mixed sprouts 1/2 cup", "Oil 1 tsp", "Chutney"], recipe: ["Make a cheela from ground moong.", "Serve with steamed sprouts and chutney."] },
  "Ragi porridge + fruit": { kcal: 330, p: 9, c: 62, f: 6, ingredients: ["Ragi flour 40g", "Milk/water 150 ml", "Seasonal fruit 1/2 cup"], recipe: ["Cook ragi flour into a porridge.", "Top with chopped fruit."] },
  "Moong dal cheela (1)": { kcal: 230, p: 12, c: 26, f: 7, ingredients: ["Moong dal 35g (ground)", "Onion, chilli, coriander", "Oil 1 tsp"], recipe: ["Grind dal to batter with veg.", "Make 1 cheela on a tawa."] },

  // ---------- Lunch ----------
  "Dal + 2 phulka + sabzi + salad": { kcal: 620, p: 24, c: 92, f: 16, ingredients: ["Toor/moong dal 1 bowl (30g dry)", "Whole-wheat phulka 2", "Seasonal sabzi 1 cup", "Salad (cucumber, carrot) 1 cup", "Ghee 1 tsp"], recipe: ["Cook dal with turmeric and temper.", "Make phulka and sauté the sabzi.", "Serve with fresh salad."] },
  "Rajma + brown rice + cucumber raita": { kcal: 680, p: 24, c: 110, f: 14, ingredients: ["Rajma 1 bowl (40g dry)", "Brown rice 1 cup cooked", "Cucumber raita 1/2 cup"], recipe: ["Cook rajma in onion-tomato gravy.", "Serve over brown rice with raita."] },
  "Chana masala + jeera rice + salad": { kcal: 680, p: 22, c: 112, f: 14, ingredients: ["Kabuli chana 1 bowl (40g dry)", "Jeera rice 1 cup", "Onion-tomato masala", "Salad 1 cup"], recipe: ["Cook chana in a spiced onion-tomato gravy.", "Serve with jeera rice and salad."] },
  "Veg khichdi + ghee + kadhi": { kcal: 600, p: 20, c: 98, f: 14, ingredients: ["Rice + moong dal 60g", "Mixed veg 1 cup", "Ghee 1 tsp", "Besan kadhi 1 bowl"], recipe: ["Pressure-cook rice, dal and veg into khichdi.", "Serve with kadhi and a little ghee."] },
  "Sambar + rice + poriyal": { kcal: 620, p: 18, c: 108, f: 12, ingredients: ["Sambar (toor dal + veg) 1 bowl", "Rice 1 cup", "Vegetable poriyal 1/2 cup"], recipe: ["Cook sambar with veg and tamarind.", "Make poriyal (stir-fried veg + coconut).", "Serve with rice."] },
  "Mixed veg + bajra roti + buttermilk": { kcal: 560, p: 16, c: 90, f: 14, ingredients: ["Mixed veg sabzi 1.5 cups", "Bajra roti 2", "Buttermilk 1 glass"], recipe: ["Cook seasonal mixed veg.", "Serve with bajra roti and buttermilk."] },
  "Paneer bhurji + 2 roti + sabzi": { kcal: 640, p: 30, c: 70, f: 26, ingredients: ["Paneer 100g", "Onion, tomato, capsicum", "Roti 2", "Sabzi 1/2 cup"], recipe: ["Make paneer bhurji with onion-tomato.", "Serve with roti and a side sabzi."] },
  "Lauki kofta + roti + salad": { kcal: 600, p: 18, c: 82, f: 20, ingredients: ["Lauki kofta 4–5 (besan-bound)", "Gravy 1 cup", "Roti 2", "Salad"], recipe: ["Grate lauki, bind with besan, shallow-fry koftas.", "Simmer in gravy; serve with roti and salad."] },
  "Paneer + rajma bowl + rice": { kcal: 720, p: 34, c: 96, f: 22, ingredients: ["Paneer 80g", "Rajma 1/2 bowl", "Rice 1 cup", "Salad"], recipe: ["Combine cooked rajma with sautéed paneer.", "Serve over rice with salad."] },
  "Soya chunk curry + rice + salad": { kcal: 680, p: 38, c: 92, f: 16, ingredients: ["Soya chunks 40g dry", "Onion-tomato gravy", "Rice 1 cup", "Salad"], recipe: ["Boil soya chunks and squeeze out water.", "Cook in gravy; serve with rice and salad."] },
  "Chana + quinoa khichdi": { kcal: 640, p: 26, c: 96, f: 16, ingredients: ["Quinoa 50g", "Chana or moong 30g", "Veg 1 cup", "Ghee 1 tsp"], recipe: ["Pressure-cook quinoa, chana and veg.", "Season and serve warm."] },
  "Veg khichdi + ghee + salad": { kcal: 520, p: 18, c: 84, f: 12, ingredients: ["Rice + moong dal 55g", "Veg 1 cup", "Ghee 1 tsp", "Salad"], recipe: ["Cook a soft khichdi.", "Serve with ghee and salad."] },
  "Millet + dal + steamed veg": { kcal: 540, p: 20, c: 88, f: 12, ingredients: ["Millet (foxtail/little) 50g", "Dal 1 bowl", "Steamed veg 1 cup"], recipe: ["Cook millet and dal separately.", "Steam veg; plate together."] },

  // ---------- Snack ----------
  "Roasted makhana + green tea": { kcal: 180, p: 5, c: 28, f: 6, ingredients: ["Makhana (fox nuts) 25g", "Ghee/oil 1 tsp", "Green tea 1 cup"], recipe: ["Roast makhana in a little ghee with salt and pepper.", "Serve with green tea."] },
  "Fruit bowl + 5 soaked almonds": { kcal: 220, p: 6, c: 38, f: 7, ingredients: ["Seasonal fruit 1 cup (apple, papaya, pear)", "Soaked almonds 5"], recipe: ["Chop seasonal fruit.", "Serve with soaked almonds."] },
  "Sprouts chaat": { kcal: 200, p: 12, c: 30, f: 4, ingredients: ["Mixed sprouts 1 cup", "Onion, tomato, cucumber", "Lemon, chaat masala"], recipe: ["Steam sprouts lightly.", "Toss with veg, lemon and chaat masala."] },
  "Buttermilk + jeera": { kcal: 90, p: 5, c: 9, f: 3, ingredients: ["Curd 1/2 cup (whisked) + water", "Roasted jeera, salt, coriander"], recipe: ["Whisk curd with water.", "Add roasted jeera and salt."] },
  "Roasted chana + tea": { kcal: 190, p: 10, c: 28, f: 5, ingredients: ["Roasted chana 30g", "Tea 1 cup (less sugar)"], recipe: ["Serve roasted chana with tea."] },
  "Hummus + carrot & cucumber sticks": { kcal: 210, p: 7, c: 22, f: 11, ingredients: ["Hummus 3 tbsp", "Carrot + cucumber sticks 1 cup"], recipe: ["Serve hummus with fresh veg sticks."] },
  "Coconut water + 2 dates": { kcal: 150, p: 2, c: 35, f: 0, ingredients: ["Tender coconut water 1 glass", "Dates 2"], recipe: ["Serve chilled coconut water with dates."] },
  "Sprouts + peanut chaat": { kcal: 240, p: 13, c: 28, f: 9, ingredients: ["Sprouts 3/4 cup", "Roasted peanuts 15g", "Onion, lemon, chaat masala"], recipe: ["Mix steamed sprouts, peanuts, veg and lemon."] },
  "Paneer tikka (few) + chutney": { kcal: 240, p: 16, c: 8, f: 16, ingredients: ["Paneer 80g (cubes)", "Curd marinade + spices", "Mint chutney"], recipe: ["Marinate paneer in spiced curd.", "Grill or pan-roast; serve with chutney."] },
  "Roasted chana + curd": { kcal: 220, p: 13, c: 26, f: 7, ingredients: ["Roasted chana 30g", "Curd 1/2 cup"], recipe: ["Serve roasted chana with curd."] },
  "Cucumber & carrot sticks": { kcal: 70, p: 2, c: 14, f: 0, ingredients: ["Cucumber + carrot 1.5 cups", "Lemon, salt, pepper"], recipe: ["Cut into sticks and season with lemon."] },

  // ---------- Dinner ----------
  "Moong khichdi + ghee": { kcal: 480, p: 18, c: 78, f: 12, ingredients: ["Rice + moong dal 55g", "Ghee 1 tsp", "Cumin, ginger"], recipe: ["Pressure-cook rice and dal soft.", "Temper cumin and ginger in ghee; mix in."] },
  "Vegetable soup + 1 multigrain toast": { kcal: 300, p: 10, c: 44, f: 9, ingredients: ["Mixed veg soup 1.5 bowls (carrot, beans, tomato)", "Multigrain toast 1"], recipe: ["Simmer veg; blend if you like.", "Serve hot with toast."] },
  "Palak dal + 2 phulka": { kcal: 470, p: 20, c: 66, f: 12, ingredients: ["Moong/toor dal + spinach 1 bowl", "Phulka 2", "Ghee 1 tsp"], recipe: ["Cook dal with spinach and garlic.", "Serve with phulka."] },
  "Dal + lauki sabzi + 1 roti": { kcal: 440, p: 18, c: 64, f: 11, ingredients: ["Dal 1 bowl", "Lauki sabzi 1 cup", "Roti 1"], recipe: ["Cook dal and lauki sabzi.", "Serve with roti."] },
  "Masoor dal + small rice + salad": { kcal: 460, p: 20, c: 74, f: 8, ingredients: ["Masoor dal 1 bowl", "Rice 1/2 cup", "Salad"], recipe: ["Cook masoor dal.", "Serve with rice and salad."] },
  "Mixed veg stew + millet roti": { kcal: 460, p: 14, c: 72, f: 12, ingredients: ["Veg stew (light coconut) 1.5 cups", "Millet roti 1–2"], recipe: ["Simmer veg in a light coconut stew.", "Serve with millet roti."] },
  "Grilled paneer + sauteed veg": { kcal: 420, p: 26, c: 20, f: 26, ingredients: ["Paneer 100g", "Mixed veg (broccoli, beans, capsicum, carrot) 1.5 cups", "Oil 1 tsp, garlic, herbs"], recipe: ["Grill or pan-roast marinated paneer.", "Sauté the veg in a little oil with garlic.", "Plate together."] },
  "Light curd rice + steamed veg": { kcal: 420, p: 14, c: 66, f: 10, ingredients: ["Curd 1/2 cup", "Cooked rice 3/4 cup", "Steamed veg 1 cup", "Tempering (mustard, curry leaf)"], recipe: ["Mix curd and rice; add tempering.", "Serve with steamed veg."] },
  "Tofu stir-fry + millet roti": { kcal: 450, p: 26, c: 48, f: 18, ingredients: ["Tofu 100g", "Mixed veg 1.5 cups", "Oil 1 tsp, ginger-garlic", "Millet roti 1"], recipe: ["Stir-fry tofu and veg on high heat.", "Serve with millet roti."] },
  "Moong dal + paneer + salad": { kcal: 440, p: 28, c: 44, f: 14, ingredients: ["Moong dal 1 bowl", "Paneer 60g", "Salad"], recipe: ["Cook dal; add sautéed paneer.", "Serve with salad."] },
  "Veg khichdi (light) + ghee": { kcal: 420, p: 16, c: 70, f: 9, ingredients: ["Rice + moong dal 50g", "Veg 1 cup", "Ghee 1 tsp"], recipe: ["Cook a soft, light khichdi.", "Serve with a little ghee."] },
  "Vegetable soup + 1 toast": { kcal: 290, p: 9, c: 42, f: 9, ingredients: ["Veg soup 1.5 bowls", "Toast 1"], recipe: ["Simmer mixed veg into a soup.", "Serve with toast."] },
  "Steamed veg + clear dal": { kcal: 320, p: 16, c: 44, f: 6, ingredients: ["Steamed veg 1.5 cups", "Clear moong dal soup 1 bowl"], recipe: ["Steam the veg.", "Cook a thin moong dal; serve together."] },
  "Moong khichdi (light) + ghee": { kcal: 400, p: 16, c: 66, f: 9, ingredients: ["Rice + moong dal 48g", "Ghee 1 tsp", "Cumin"], recipe: ["Cook a light khichdi.", "Temper cumin in ghee; mix in."] },
};

/** Fallback when a dish isn't in the table: split the meal's calorie budget into macros
 *  and list the dish's components as the ingredients. */
export function getDishDetail(name: string, mealKcal: number): DishDetail {
  const found = DISH_DETAILS[name];
  if (found) return found;
  const f = Math.round((mealKcal * 0.27) / 9);
  const p = Math.round((mealKcal * 0.2) / 4);
  const c = Math.max(0, Math.round((mealKcal - p * 4 - f * 9) / 4));
  const ingredients = name.split(/[+,]/).map((s) => s.trim()).filter(Boolean).map((s) => `${s} — a sensible portion`);
  return { kcal: mealKcal, p, c, f, ingredients, recipe: ["Prepare the listed items fresh and warm, lightly spiced."] };
}

// Which weather / ritucharya a dish suits best (keyword-based, plain language).
export function dishSeason(name: string): string {
  const s = name.toLowerCase();
  const cooling = ["curd rice", "buttermilk", "coconut water", "coconut", "cucumber", "raita", "fruit bowl", "melon", "hummus"];
  const warming = ["khichdi", "soup", "porridge", "stew", "paratha", "daliya", "upma", "sambar", "kadhi", "dal", "cheela", "chilla", "poha", "idli", "bhurji", "ragi"];
  if (cooling.some((k) => s.includes(k))) return "best in hot / summer weather — light & cooling";
  if (warming.some((k) => s.includes(k))) return "best in cool, rainy or winter weather — have it warm";
  return "good year-round — have it fresh & warm";
}

// ---------- Approx per-ingredient macros ----------
// "g" foods carry macros per 100g (scaled by the grams / tsp / tbsp / cup / bowl in the
// text); "piece" foods carry macros per piece (scaled by the count). Spices and flavourings
// have no entry and stay plain text.
interface Base { p: number; c: number; f: number; kcal: number; unit?: "g" | "piece"; defG?: number; bowlG?: number }
const BASE_FOODS: Record<string, Base> = {
  "poha": { p: 6, c: 78, f: 1, kcal: 346 }, "flattened rice": { p: 6, c: 78, f: 1, kcal: 346 },
  "peanut": { p: 26, c: 16, f: 49, kcal: 567 }, "moong dal": { p: 24, c: 59, f: 1, kcal: 347 },
  "masoor dal": { p: 25, c: 60, f: 1, kcal: 352 }, "toor dal": { p: 22, c: 63, f: 1, kcal: 343 },
  "besan": { p: 22, c: 58, f: 6, kcal: 387 }, "gram flour": { p: 22, c: 58, f: 6, kcal: 387 },
  "oats": { p: 13, c: 67, f: 7, kcal: 389 }, "ragi": { p: 7, c: 72, f: 1, kcal: 328 },
  "paneer": { p: 18, c: 4, f: 20, kcal: 265 }, "tofu": { p: 8, c: 2, f: 5, kcal: 76 },
  "curd": { p: 3.5, c: 4.7, f: 4, kcal: 60, defG: 150, bowlG: 150 }, "buttermilk": { p: 1.5, c: 4, f: 1, kcal: 30, defG: 200 },
  "brown rice": { p: 2.6, c: 23, f: 0.9, kcal: 112, defG: 120 }, "jeera rice": { p: 2.7, c: 28, f: 0.8, kcal: 140, defG: 120 },
  "rice": { p: 2.7, c: 28, f: 0.3, kcal: 130, defG: 120 }, "rajma": { p: 24, c: 60, f: 1, kcal: 333 },
  "chana": { p: 19, c: 61, f: 6, kcal: 364 }, "chickpea": { p: 19, c: 61, f: 6, kcal: 364 },
  "quinoa": { p: 14, c: 64, f: 6, kcal: 368 }, "soya chunk": { p: 52, c: 33, f: 0.5, kcal: 345 },
  "daliya": { p: 12, c: 76, f: 1.5, kcal: 360 }, "broken wheat": { p: 12, c: 76, f: 1.5, kcal: 360 },
  "bajra": { p: 11, c: 67, f: 5, kcal: 361 }, "millet": { p: 11, c: 73, f: 4, kcal: 360 },
  "makhana": { p: 9.7, c: 77, f: 0.1, kcal: 347 }, "ghee": { p: 0, c: 0, f: 100, kcal: 900 },
  "oil": { p: 0, c: 0, f: 100, kcal: 884 }, "hummus": { p: 8, c: 14, f: 18, kcal: 230, defG: 45 },
  "sambar": { p: 3, c: 10, f: 2, kcal: 70, defG: 150, bowlG: 150 }, "pumpkin seed": { p: 30, c: 11, f: 49, kcal: 559 },
  "flax": { p: 18, c: 29, f: 42, kcal: 534 }, "sprout": { p: 3, c: 6, f: 0.2, kcal: 30, defG: 100 },
  "milk": { p: 3.4, c: 5, f: 3.3, kcal: 62, defG: 150 }, "coconut water": { p: 0.7, c: 4, f: 0.2, kcal: 19, defG: 200 },
  "spinach": { p: 2.9, c: 3.6, f: 0.4, kcal: 23, defG: 80 }, "lauki": { p: 0.6, c: 3.4, f: 0.1, kcal: 15, defG: 150 },
  "mixed veg": { p: 2, c: 7, f: 0.3, kcal: 40, defG: 150, bowlG: 150 }, "veg": { p: 2, c: 7, f: 0.3, kcal: 40, defG: 150, bowlG: 150 },
  "salad": { p: 1, c: 5, f: 0.2, kcal: 25, defG: 100 }, "soup": { p: 2, c: 7, f: 1, kcal: 45, defG: 300, bowlG: 200 },
  "kadhi": { p: 3, c: 8, f: 5, kcal: 90, defG: 150, bowlG: 150 }, "dal": { p: 24, c: 60, f: 1, kcal: 340 },
  "fruit": { p: 0.6, c: 14, f: 0.2, kcal: 60, defG: 120 }, "apple": { p: 0.3, c: 14, f: 0.2, kcal: 52, defG: 150 },
  // per-piece foods
  "almond": { p: 0.26, c: 0.23, f: 0.58, kcal: 7, unit: "piece" }, "walnut": { p: 0.45, c: 0.42, f: 1.95, kcal: 20, unit: "piece" },
  "date": { p: 0.15, c: 6, f: 0, kcal: 23, unit: "piece" }, "banana": { p: 1, c: 23, f: 0.3, kcal: 80, unit: "piece" },
  "idli": { p: 2, c: 8, f: 0.3, kcal: 45, unit: "piece" }, "phulka": { p: 3, c: 18, f: 0.5, kcal: 100, unit: "piece" },
  "roti": { p: 3, c: 18, f: 0.5, kcal: 100, unit: "piece" }, "paratha": { p: 6, c: 36, f: 8, kcal: 250, unit: "piece" },
  "toast": { p: 3, c: 13, f: 1, kcal: 75, unit: "piece" }, "cheela": { p: 8, c: 12, f: 4, kcal: 120, unit: "piece" },
  "chilla": { p: 8, c: 12, f: 4, kcal: 120, unit: "piece" },
};
const BASE_KEYS = Object.keys(BASE_FOODS).sort((a, b) => b.length - a.length);
// Dry legumes/grains: a "bowl"/"cup" of the cooked dish is only ~35g dry, not 150g.
const DRY_STAPLE = new Set(["dal", "moong dal", "masoor dal", "toor dal", "rajma", "chana", "chickpea", "quinoa", "soya chunk"]);

/** Rough per-ingredient macros from its amount text. null → no match (stays plain text). */
export function ingredientMacro(text: string): FoodMacro | null {
  const s = text.toLowerCase();
  const key = BASE_KEYS.find((k) => s.includes(k));
  if (!key) return null;
  const base = BASE_FOODS[key];
  const num = (re: RegExp): number | null => { const m = s.match(re); return m ? parseFloat(m[1]) : null; };
  const r = (n: number) => Math.round(n);

  if (base.unit === "piece") {
    const count = num(/\((\d+)\)/) ?? num(/(\d+)/) ?? 1;
    return { serving: text, p: r(base.p * count), c: r(base.c * count), f: r(base.f * count), kcal: Math.round(base.kcal * count) };
  }
  let grams = num(/(\d+(?:\.\d+)?)\s*g\b/) ?? num(/(\d+(?:\.\d+)?)\s*ml\b/);
  if (grams == null) {
    const servG = DRY_STAPLE.has(key) ? 35 : null; // a bowl/cup/default serving, dry-weight
    const tsp = num(/(\d+(?:\.\d+)?)\s*tsp/), tbsp = num(/(\d+(?:\.\d+)?)\s*tbsp/);
    const cup = num(/(\d+(?:\.\d+)?)\s*cup/), bowl = num(/(\d+(?:\.\d+)?)\s*bowl/), glass = num(/(\d+(?:\.\d+)?)\s*glass/);
    if (tsp != null) grams = tsp * 5;
    else if (tbsp != null) grams = tbsp * 15;
    else if (cup != null) grams = cup * (servG ?? 150);
    else if (bowl != null) grams = bowl * (servG ?? base.bowlG ?? 150);
    else if (glass != null) grams = glass * 200;
    else grams = servG ?? base.defG ?? 100;
  }
  const fac = grams / 100;
  return { serving: text, p: r(base.p * fac), c: r(base.c * fac), f: r(base.f * fac), kcal: Math.round(base.kcal * fac) };
}
