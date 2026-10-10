// Personalized meal plan generator — builds a full 1-week vegetarian plan exactly as
// specified: calorie requirement, macros, recommended foods, PER-GOAL eat/avoid
// (as you chose X, Y, Z we favour/limit …), prakriti (dosha) eat/avoid, ritucharya
// (seasonal) eat/avoid, dish examples per meal, a dish-based view with quantities,
// and meal swap. Everything is vegetarian (the app is 18+ veg) and Ayurveda-aligned.

import { calcTDEE, type ActivityLevel, type Sex } from "./weight-loss";
import { currentRitu, DOSHA_DESC, type Dosha, type Ritu } from "./diet";

export interface MealSlot {
  slot: string;        // "Breakfast"
  time: string;        // "08:00"
  kcal: number;        // calorie budget for this meal
  options: string[];   // dish examples — index 0 is the day's default, swap cycles the rest
}
export interface MealDay { day: string; meals: MealSlot[] }
export interface MacroSplit { protein: number; carbs: number; fat: number } // grams/day

export interface EatAvoid { label: string; eat: string[]; avoid: string[] }

export interface GeneratedMealPlan {
  kcalTarget: number;
  maintenance: number;      // TDEE
  goalLabel: string;        // "to lose weight gently" etc.
  macros: MacroSplit;
  proteinPerKg: number;
  foodRecos: { protein: string[]; carbs: string[]; fats: string[] };
  principles: { what: string; why: string }[]; // plain-words "why this plan"
  perGoal: EatAvoid[];      // one block per chosen goal / condition — "for X avoid this & this"
  fitnessNote?: string;     // "For your fitness goal we kept high-protein & low-GI foods"
  prakriti?: EatAvoid & { dosha: Dosha; note: string };
  ritucharya: EatAvoid & { ritu: Ritu };
  week: MealDay[];
  complete: boolean;        // profile had enough to compute exact numbers
}

const DAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

// 4-meal structure with a calorie-share for each slot (sums to 1).
const SLOTS: { slot: string; time: string; share: number }[] = [
  { slot: "Breakfast", time: "8–10 am", share: 0.25 },
  { slot: "Lunch", time: "1–3 pm", share: 0.35 },
  { slot: "Snack", time: "11 am or 4 pm", share: 0.12 },
  { slot: "Dinner", time: "6–8 pm", share: 0.28 },
];

// ---------- Vegetarian dish banks (Ayurveda-friendly, Indian) ----------
const BANK: Record<string, string[]> = {
  Breakfast: [
    "Vegetable poha + peanuts",
    "Moong dal cheela (2) + mint chutney",
    "Oats upma with veggies",
    "Idli (3) + sambar",
    "Vegetable daliya (broken wheat)",
    "Ragi porridge + banana",
    "Besan chilla + curd",
    "Stuffed veg paratha (1) + curd",
  ],
  Lunch: [
    "Dal + 2 phulka + sabzi + salad",
    "Rajma + brown rice + cucumber raita",
    "Chana masala + jeera rice + salad",
    "Veg khichdi + ghee + kadhi",
    "Sambar + rice + poriyal",
    "Mixed veg + bajra roti + buttermilk",
    "Paneer bhurji + 2 roti + sabzi",
    "Lauki kofta + roti + salad",
  ],
  Snack: [
    "Roasted makhana + green tea",
    "Fruit bowl + 5 soaked almonds",
    "Sprouts chaat",
    "Buttermilk + jeera",
    "Roasted chana + tea",
    "Hummus + carrot & cucumber sticks",
    "Coconut water + 2 dates",
  ],
  Dinner: [
    "Moong khichdi + ghee",
    "Vegetable soup + 1 multigrain toast",
    "Palak dal + 2 phulka",
    "Dal + lauki sabzi + 1 roti",
    "Masoor dal + small rice + salad",
    "Mixed veg stew + millet roti",
    "Grilled paneer + sauteed veg",
    "Light curd rice + steamed veg",
  ],
};

// Protein-forward dishes to lead with when the goal needs more protein.
const PROTEIN_BANK: Record<string, string[]> = {
  Breakfast: ["Tofu/paneer bhurji + 2 roti", "Besan chilla (2) + curd", "Sprouts + moong cheela"],
  Lunch: ["Paneer + rajma bowl + rice", "Soya chunk curry + rice + salad", "Chana + quinoa khichdi"],
  Snack: ["Sprouts + peanut chaat", "Paneer tikka (few) + chutney", "Roasted chana + curd"],
  Dinner: ["Grilled paneer + sauteed veg", "Tofu stir-fry + millet roti", "Moong dal + paneer + salad"],
};

// Light / cleansing dishes to lead with for weight-loss or kapha.
const LIGHT_BANK: Record<string, string[]> = {
  Breakfast: ["Oats upma with veggies", "Ragi porridge + fruit", "Moong dal cheela (1)"],
  Lunch: ["Veg khichdi + ghee + salad", "Millet + dal + steamed veg", "Mixed veg + bajra roti + buttermilk"],
  Snack: ["Roasted makhana + green tea", "Buttermilk + jeera", "Cucumber & carrot sticks"],
  Dinner: ["Vegetable soup + 1 toast", "Moong khichdi (light) + ghee", "Steamed veg + clear dal"],
};

// Cuisine preference → dishes to lead with (all drawn from the banks above).
const CUISINE_LEAD: Record<string, Record<string, string[]>> = {
  "South Indian": {
    Breakfast: ["Idli (3) + sambar", "Oats upma with veggies"],
    Lunch: ["Sambar + rice + poriyal", "Light curd rice + steamed veg"],
    Snack: ["Roasted chana + tea", "Buttermilk + jeera"],
    Dinner: ["Light curd rice + steamed veg", "Steamed veg + clear dal"],
  },
  "North Indian": {
    Breakfast: ["Stuffed veg paratha (1) + curd", "Besan chilla + curd", "Moong dal cheela (2) + mint chutney"],
    Lunch: ["Dal + 2 phulka + sabzi + salad", "Rajma + brown rice + cucumber raita", "Chana masala + jeera rice + salad", "Paneer bhurji + 2 roti + sabzi"],
    Snack: ["Roasted makhana + green tea", "Sprouts chaat"],
    Dinner: ["Palak dal + 2 phulka", "Dal + lauki sabzi + 1 roti", "Moong khichdi + ghee"],
  },
  "West Indian": {
    Breakfast: ["Vegetable poha + peanuts", "Besan chilla + curd"],
    Lunch: ["Mixed veg + bajra roti + buttermilk", "Veg khichdi + ghee + kadhi"],
    Snack: ["Roasted makhana + green tea", "Sprouts + peanut chaat"],
    Dinner: ["Dal + lauki sabzi + 1 roti", "Mixed veg stew + millet roti"],
  },
  "East Indian": {
    Breakfast: ["Vegetable daliya (broken wheat)", "Moong dal cheela (2) + mint chutney"],
    Lunch: ["Masoor dal + small rice + salad", "Veg khichdi + ghee + salad"],
    Snack: ["Fruit bowl + 5 soaked almonds", "Buttermilk + jeera"],
    Dinner: ["Masoor dal + small rice + salad", "Palak dal + 2 phulka"],
  },
  "Continental / Western": {
    Breakfast: ["Oats upma with veggies", "Tofu/paneer bhurji + 2 roti"],
    Lunch: ["Grilled paneer + sauteed veg", "Chana + quinoa khichdi"],
    Snack: ["Hummus + carrot & cucumber sticks", "Fruit bowl + 5 soaked almonds"],
    Dinner: ["Vegetable soup + 1 multigrain toast", "Tofu stir-fry + millet roti"],
  },
};

function rotate<T>(arr: T[], by: number): T[] {
  if (arr.length === 0) return arr;
  const k = ((by % arr.length) + arr.length) % arr.length;
  return [...arr.slice(k), ...arr.slice(0, k)];
}
function dedupe(arr: string[]): string[] { return Array.from(new Set(arr)); }

// ---------- Eat / avoid by prakriti (dosha) ----------
const DOSHA_EAT: Record<Dosha, string[]> = {
  vata: ["Warm, cooked, moist foods", "Ghee & soaked nuts", "Sweet root veg & rice"],
  pitta: ["Cooling foods", "Sweet ripe fruit", "Coriander, fennel & mint"],
  kapha: ["Light, warm, spiced food", "Millets & leafy greens", "Ginger & honey"],
};
const DOSHA_AVOID: Record<Dosha, string[]> = {
  vata: ["Raw salads", "Cold & carbonated drinks"],
  pitta: ["Chillies & deep-fried", "Sour fermented food"],
  kapha: ["Fried & cheesy food", "Iced drinks & excess wheat"],
};

// ---------- Eat / avoid by ritucharya (season) ----------
const RITU_EAT_AVOID: Record<Ritu, { label: string; eat: string[]; avoid: string[] }> = {
  vasanta: { label: "Spring", eat: ["Light, warm, bitter foods", "Barley & millets", "Honey"], avoid: ["Heavy, sweet & oily", "Cold & day-sleep"] },
  grishma: { label: "Summer", eat: ["Cooling, sweet, juicy foods", "Coconut water & melons", "Cucumber & mint"], avoid: ["Spicy, fried & sour", "Excess salt"] },
  varsha: { label: "Monsoon", eat: ["Warm, cooked, light food", "Ginger, cumin & soups", "Khichdi"], avoid: ["Raw salads & leafy greens", "Heavy & stale food"] },
  sharad: { label: "Autumn", eat: ["Sweet, cooling, bitter foods", "Ghee & milk", "Amla & gourds"], avoid: ["Spicy & oily", "Fermented & sour"] },
  hemanta: { label: "Pre-winter", eat: ["Warm, nourishing, rich foods", "Nuts, ghee & whole grains", "Soups & root veg"], avoid: ["Cold & raw food", "Dry, light snacks"] },
  shishira: { label: "Winter", eat: ["Warm, oily, sweet & sour", "Sesame, nuts & ghee", "Root vegetables"], avoid: ["Cold drinks & raw salads", "Dry, light food"] },
};

// ---------- Per-goal / per-condition eat & avoid ----------
interface Rule { eat: string[]; avoid: string[] }
const DISEASE_EAT_AVOID: Record<string, Rule> = {
  diabetes: { eat: ["Low-GI millets", "Methi & bitter gourd", "Protein with every meal"], avoid: ["Sugar & sweets", "White rice & maida", "Fruit juice"] },
  "pre-diabetes": { eat: ["Whole grains & fibre", "Cinnamon", "Lots of veg"], avoid: ["Refined carbs", "Sugary drinks"] },
  pcos: { eat: ["Flax & cinnamon", "Millets", "Protein & fibre"], avoid: ["Sugar", "White bread", "Excess dairy"] },
  "pcos-pcod": { eat: ["Flax & cinnamon", "Millets", "Protein & fibre"], avoid: ["Sugar", "White bread", "Excess dairy"] },
  hypertension: { eat: ["Potassium-rich veg", "Garlic & beetroot", "Low-salt cooking"], avoid: ["Pickles & papad", "Processed & salty snacks"] },
  "high-bp": { eat: ["Potassium-rich veg", "Garlic & beetroot", "Low-salt cooking"], avoid: ["Pickles & papad", "Processed & salty snacks"] },
  thyroid: { eat: ["Cooked greens", "Nuts & seeds", "Coconut oil to cook"], avoid: ["Excess raw cruciferous", "Excess soy"] },
  acidity: { eat: ["Coconut water", "Cucumber & fennel", "Boiled rice"], avoid: ["Chillies & coffee", "Tomato & vinegar"] },
  "fatty-liver": { eat: ["Bitter greens", "Amla & oats", "Plenty of water"], avoid: ["Fried food & sugar", "Alcohol"] },
  "high-cholesterol": { eat: ["Oats & flax", "Walnuts & garlic", "Soluble fibre"], avoid: ["Deep-fried", "Excess butter & trans fat"] },
  arthritis: { eat: ["Turmeric & ginger", "Warm cooked food", "Sesame oil"], avoid: ["Nightshades in excess", "Cold food"] },
  hernia: { eat: ["Small frequent meals", "Fibre & fluids", "Cooling foods"], avoid: ["Large heavy meals", "Spicy & fried", "Lying down after eating"] },
  prostate: { eat: ["Pumpkin seeds & tomatoes", "Gourds (lauki, tinda) & water", "Whole grains"], avoid: ["Excess caffeine late", "Alcohol & processed"] },
};
const GOAL_EAT_AVOID: Record<string, Rule> = {
  "weight-loss": { eat: ["High fibre & protein", "Biggest meal at lunch", "Warm water"], avoid: ["Fried & refined carbs", "Late-night snacking"] },
  obesity: { eat: ["Millets & greens", "Protein & fibre", "Biggest meal at lunch"], avoid: ["Fried & sweets", "Soda & cheese"] },
  "muscle-building": { eat: ["Protein each meal (paneer, tofu, dal, sprouts)", "Complex carbs around training"], avoid: ["Empty carbs", "Skipping meals"] },
  muscles: { eat: ["Protein each meal (paneer, tofu, dal, sprouts)", "Complex carbs around training"], avoid: ["Empty carbs", "Skipping meals"] },
  strength: { eat: ["Adequate protein", "Complex carbs around training"], avoid: ["Under-eating", "Junk snacks"] },
  flexibility: { eat: ["Anti-inflammatory foods", "Turmeric & ginger", "Hydrating foods"], avoid: ["Fried & processed", "Excess caffeine"] },
  mobility: { eat: ["Calcium & vitamin-D foods", "Turmeric & sesame", "Warm soups"], avoid: ["Cold & very sour food", "Fried"] },
  "general-wellness": { eat: ["Balanced, seasonal, home-cooked", "Enough protein & fibre"], avoid: ["Packaged & fried food", "Excess sugar"] },
  "better-sleep": { eat: ["Warm milk + nutmeg", "Light early dinner", "Almonds"], avoid: ["Caffeine after 4 pm", "Heavy/late dinner"] },
  "de-stress": { eat: ["Warm sattvic meals", "Ashwagandha milk", "Bananas & nuts"], avoid: ["Excess caffeine", "Sugar highs & skipped meals"] },
  "hair-fall": { eat: ["Protein, iron + vitamin-C", "Amla, nuts & seeds", "Leafy greens"], avoid: ["Crash diets", "Junk & excess sugar"] },
  skin: { eat: ["Cooling veg & fruit", "Amla & neem", "Healthy fats & water"], avoid: ["Fried & excess sugar", "Very spicy & fermented"] },
};

const LABELS: Record<string, string> = {
  "weight-loss": "Weight loss", obesity: "Weight / obesity", "muscle-building": "Muscle building",
  muscles: "Muscle building", strength: "Strength", flexibility: "Flexibility", mobility: "Mobility",
  "general-wellness": "General wellness", "better-sleep": "Better sleep", "de-stress": "De-stress",
  "hair-fall": "Hair fall", skin: "Skin / glow",
  diabetes: "Diabetes", "pre-diabetes": "Pre-diabetes", pcos: "PCOS", "pcos-pcod": "PCOS / PCOD",
  hypertension: "High BP", "high-bp": "High BP", thyroid: "Thyroid", acidity: "Acidity",
  "fatty-liver": "Fatty liver", "high-cholesterol": "High cholesterol", arthritis: "Joint pain",
  hernia: "Hernia", prostate: "Prostate",
};

const FITNESS_IDS = ["weight-loss", "muscle-building", "muscles", "strength", "flexibility", "mobility", "general-wellness"];

// ---------- Main builder ----------
export interface MealPlanInput {
  age?: number;
  sex?: Sex;
  heightCm?: number;
  weightKg?: number;
  activity?: ActivityLevel;
  dosha?: Dosha;
  cuisine?: string; // onboarding preference — North/South/East/West Indian, Continental / Western
  goalIds: string[];
  conditions: string[];
  date?: Date;
}

export function buildMealPlan(input: MealPlanInput): GeneratedMealPlan {
  const { goalIds, conditions } = input;
  const all = [...goalIds, ...conditions];
  const has = (...ids: string[]) => ids.some((x) => all.includes(x));

  const wantsLoss = has("weight-loss", "obesity");
  const wantsGain = has("muscle-building", "muscles", "underweight");
  const wantsProtein = has("muscle-building", "muscles", "strength", "weight-loss");
  const metabolic = has("diabetes", "pre-diabetes", "pcos", "pcos-pcod", "obesity", "fatty-liver");
  const kapha = input.dosha === "kapha";

  // ---- calories ----
  const complete = !!(input.sex && input.age && input.heightCm && input.weightKg && input.activity);
  const kg = input.weightKg && input.weightKg > 0 ? input.weightKg : 65;
  const maintenance = complete
    ? calcTDEE(input.sex!, kg, input.heightCm!, input.age!, input.activity!)
    : input.sex === "male" ? 2200 : 1900;

  let kcalTarget = maintenance;
  let goalLabel = "to maintain a healthy weight";
  if (wantsLoss) { kcalTarget = maintenance - 400; goalLabel = "to lose weight gently (~0.4 kg/week)"; }
  else if (wantsGain) { kcalTarget = maintenance + 250; goalLabel = "to build muscle steadily"; }
  const floor = input.sex === "male" ? 1500 : 1200;
  kcalTarget = Math.max(floor, Math.round(kcalTarget / 10) * 10);

  // ---- macros ----
  const proteinPerKg = wantsProtein ? (wantsGain ? 1.9 : 1.6) : has("diabetes", "pcos", "pcos-pcod") ? 1.4 : 1.2;
  const fatPct = input.dosha === "vata" ? 0.3 : wantsLoss ? 0.25 : 0.27;
  const protein = Math.round(kg * proteinPerKg);
  const fat = Math.round((kcalTarget * fatPct) / 9);
  const carbs = Math.max(0, Math.round((kcalTarget - protein * 4 - fat * 9) / 4));

  // ---- recommended food kinds ----
  const foodRecos = {
    protein: ["Lentils (dals)", "Paneer / tofu", "Curd & buttermilk", "Sprouts"],
    carbs: metabolic
      ? ["Millets (ragi, bajra, jowar)", "Oats & daliya", "Whole-wheat roti", "Small portion brown rice"]
      : ["Whole-wheat roti", "Brown/red rice", "Millets & oats", "Daliya"],
    fats: ["Soaked almonds & walnuts", "Ghee (1–2 tsp)", "Pumpkin & flax seeds"],
  };

  // ---- why this plan (plain words) ----
  const principles: { what: string; why: string }[] = [
    { what: "Warm, cooked food", why: "easier to digest and kinder on your gut — it kindles agni, your digestive fire." },
  ];
  if (metabolic) principles.push({ what: "Low-GI (slow carbs)", why: "steady energy with fewer sugar spikes and cravings — millets, oats and whole grains instead of white rice and maida." });
  if (input.dosha === "kapha") principles.push({ what: "Kapha-reducing foods", why: "light, warm, spiced foods like millets, greens and ginger; go easy on fried, cheesy, cold and heavy foods." });
  else if (input.dosha === "vata") principles.push({ what: "Vata-pacifying foods", why: "warm, moist, grounding foods with a little ghee; avoid raw, dry and cold foods." });
  else if (input.dosha === "pitta") principles.push({ what: "Pitta-cooling foods", why: "cooling, mildly sweet foods; go easy on chilli, fried and sour-fermented foods." });
  principles.push({ what: "A short walk (~100 steps) after each meal", why: "it helps digestion and keeps blood sugar steady." });
  if (has("de-stress", "better-sleep")) principles.push({ what: "Calming foods", why: "warm sattvic meals and less caffeine; warm milk, nuts and banana help you feel calm and sleep better." });

  // ---- per-goal eat/avoid (the "for X avoid this & this" breakdown) ----
  const perGoal: EatAvoid[] = [];
  for (const id of [...goalIds, ...conditions]) {
    const r = GOAL_EAT_AVOID[id] ?? DISEASE_EAT_AVOID[id];
    if (r && !perGoal.some((p) => p.label === (LABELS[id] ?? id))) {
      perGoal.push({ label: LABELS[id] ?? id, eat: r.eat, avoid: r.avoid });
    }
  }

  const fitnessGoal = goalIds.find((x) => FITNESS_IDS.includes(x));
  const fitnessNote = fitnessGoal
    ? `For your fitness goal (${LABELS[fitnessGoal] ?? fitnessGoal}), we've kept high-protein & low-GI foods so you stay full and energised.`
    : undefined;

  const prakriti = input.dosha
    ? { dosha: input.dosha, note: DOSHA_DESC[input.dosha], label: `${input.dosha} body type`, eat: DOSHA_EAT[input.dosha], avoid: DOSHA_AVOID[input.dosha] }
    : undefined;

  const ritu = currentRitu(input.date);
  const r = RITU_EAT_AVOID[ritu];
  const ritucharya = { ritu, label: r.label, eat: r.eat, avoid: r.avoid };

  // ---- 7-day schedule ----
  const week: MealDay[] = DAYS.map((day, di) => {
    const meals: MealSlot[] = SLOTS.map((s) => {
      const cuisineLead = input.cuisine ? (CUISINE_LEAD[input.cuisine]?.[s.slot] ?? []) : [];
      const goalLead = wantsProtein ? PROTEIN_BANK[s.slot] : (wantsLoss || kapha) ? LIGHT_BANK[s.slot] : [];
      const pool = dedupe([...cuisineLead, ...goalLead, ...BANK[s.slot]]);
      return {
        slot: s.slot,
        time: s.time,
        kcal: Math.round((kcalTarget * s.share) / 10) * 10,
        options: rotate(pool, di),
      };
    });
    return { day, meals };
  });

  return {
    kcalTarget,
    maintenance,
    goalLabel,
    macros: { protein, carbs, fat },
    proteinPerKg,
    foodRecos,
    principles,
    perGoal,
    fitnessNote,
    prakriti,
    ritucharya,
    week,
    complete,
  };
}

// Examples for the vague favour/limit & recommended-food terms — shown on tap.
export const TERM_EXAMPLES: Record<string, string> = {
  // dosha
  "Warm, cooked, moist foods": "khichdi, dal, soups, cooked veg, porridge",
  "Ghee & soaked nuts": "1–2 tsp ghee; 5 soaked almonds or walnuts",
  "Sweet root veg & rice": "sweet potato, carrot, beetroot; basmati rice",
  "Cooling foods": "cucumber, coconut water, melon, mint, fennel",
  "Sweet ripe fruit": "banana, mango, grapes, dates, pear",
  "Coriander, fennel & mint": "coriander/fennel water; mint chutney",
  "Light, warm, spiced food": "millet khichdi, sautéed veg, ginger tea",
  "Millets & leafy greens": "ragi, bajra, jowar; spinach, methi, amaranth",
  "Ginger & honey": "ginger tea; 1 tsp raw honey (not heated)",
  "Raw salads": "raw cucumber / tomato / sprout salads",
  "Cold & carbonated drinks": "soda, cola, chilled & iced drinks",
  "Chillies & deep-fried": "red chilli; pakora, samosa, fries",
  "Sour fermented food": "pickle, vinegar, excess fermented batter",
  "Fried & cheesy food": "fries, pakora, cheese, excess paneer",
  "Iced drinks & excess wheat": "iced drinks; too much wheat / maida",
  // season
  "Warm, nourishing, rich foods": "ghee, nuts, whole grains, root veg, soups",
  "Nuts, ghee & whole grains": "almonds, walnuts, ghee, oats, millets",
  "Soups & root veg": "veg soup; carrot, beetroot, sweet potato",
  "Cold & raw food": "raw salads; cold / refrigerated food",
  "Dry, light snacks": "crackers, puffed & dry snacks",
  "Cooling, sweet, juicy foods": "melon, cucumber, coconut water",
  "Coconut water & melons": "tender coconut water, watermelon, muskmelon",
  "Light, warm, bitter foods": "methi, karela, barley, millets",
  "Warm, cooked, light food": "khichdi, soups, steamed veg",
  "Ginger, cumin & soups": "ginger-cumin tea; veg soup",
  "Sweet, cooling, bitter foods": "amla, gourds, ghee, milk",
  "Warm, oily, sweet & sour": "sesame, ghee, root veg, warm foods",
  "Sesame, nuts & ghee": "til (sesame), almonds, walnuts, ghee",
  "Root vegetables": "carrot, beetroot, sweet potato, radish",
  // conditions
  "Low-GI millets": "ragi, bajra, jowar, foxtail millet",
  "Methi & bitter gourd": "methi (fenugreek) water; karela sabzi/juice",
  "Protein with every meal": "dal, paneer, tofu, sprouts, curd",
  "Sugar & sweets": "sugar, mithai, chocolate, desserts",
  "White rice & maida": "polished rice, maida, white bread",
  "Fruit juice": "packaged / fresh fruit juice (sugar spike)",
  "Whole grains & fibre": "oats, millets, whole wheat; veg & fruit",
  "Lots of veg": "2–3 bowls of seasonal vegetables a day",
  "Refined carbs": "maida, white bread, biscuits",
  "Sugary drinks": "soda, packaged juice, sweetened tea",
  "Flax & cinnamon": "1 tsp ground flax; a pinch of cinnamon",
  "Protein & fibre": "dal, sprouts, paneer; veg, oats",
  "Potassium-rich veg": "banana, beans, spinach, sweet potato",
  "Garlic & beetroot": "1 garlic pod; beetroot salad / juice",
  "Low-salt cooking": "cook with less salt; skip pickles & papad",
  "Pickles & papad": "achaar, papad, salted snacks",
  "Cooked greens": "cooked spinach, methi, amaranth",
  "Nuts & seeds": "almonds, walnuts, pumpkin & flax seeds",
  "Bitter greens": "methi, karela, neem, bathua",
  "Plenty of water": "2.5–3 L water through the day",
  "Oats & flax": "oats; 1 tsp ground flax",
  "Walnuts & garlic": "2–3 walnuts; 1 garlic pod",
  "Soluble fibre": "oats, beans, apple, isabgol (psyllium)",
  "Turmeric & ginger": "turmeric milk; ginger tea",
  "Warm cooked food": "khichdi, soups, cooked veg",
  "Small frequent meals": "4–5 light meals through the day",
  "Pumpkin seeds & tomatoes": "a handful of pumpkin seeds; tomatoes",
  "Gourds (lauki, tinda) & water": "lauki, tinda, parwal, turai; plenty of water",
  "Whole grains": "whole wheat, millets, brown rice, oats, daliya",
  // recommended-food terms
  "Lentils (dals)": "moong, masoor, toor, chana, urad — vary the dal day to day",
  "Sprouts": "moong, chana, moth or matki sprouts",
  "Whole-wheat roti": "or mix in ragi, jowar, bajra or jau (barley) flour",
  // goals
  "High fibre & protein": "dal, sprouts, oats, millets, veg, curd",
  "Biggest meal at lunch": "a full dal-roti-sabzi-rice thali at midday",
  "Warm water": "plain warm water, or with lemon / ginger / jeera",
  "Fried & refined carbs": "fries, pakora, maida, white bread",
  "Late-night snacking": "snacking after dinner or before bed",
  "Millets & greens": "ragi, bajra; spinach, methi",
  "Complex carbs around training": "oats, rice, sweet potato pre/post workout",
  "Warm milk + nutmeg": "warm milk with a pinch of nutmeg at night",
  "Light early dinner": "a light dinner finished by 7–8 pm",
  "Warm sattvic meals": "khichdi, dal-rice, cooked veg, milk",
  "Ashwagandha milk": "warm milk with 1/2 tsp ashwagandha",
  "Bananas & nuts": "banana; almonds / walnuts",
  "Amla, nuts & seeds": "amla; almonds, pumpkin & flax seeds",
  "Leafy greens": "spinach, methi, amaranth",
  "Cooling veg & fruit": "cucumber, melon, coconut water",
  "Healthy fats & water": "nuts, seeds, ghee; plenty of water",
};

// Approx macros for the recommended foods (per a typical serving) — shown in the detail card.
export interface FoodMacro { serving: string; p: number; c: number; f: number; kcal: number }
export const FOOD_MACROS: Record<string, FoodMacro> = {
  "Lentils (dals)": { serving: "1 bowl cooked (≈30g dry)", p: 7, c: 18, f: 1, kcal: 110 },
  "Paneer / tofu": { serving: "100g", p: 18, c: 4, f: 20, kcal: 265 },
  "Curd & buttermilk": { serving: "1 bowl curd (150g)", p: 5, c: 7, f: 5, kcal: 95 },
  "Sprouts": { serving: "1 cup (100g)", p: 8, c: 20, f: 1, kcal: 120 },
  "Millets (ragi, bajra, jowar)": { serving: "1 roti / 30g flour", p: 2, c: 22, f: 1, kcal: 105 },
  "Oats & daliya": { serving: "40g dry", p: 5, c: 27, f: 3, kcal: 150 },
  "Whole-wheat roti": { serving: "1 roti (30g flour)", p: 3, c: 18, f: 1, kcal: 100 },
  "Brown/red rice": { serving: "1/2 cup cooked", p: 2, c: 22, f: 1, kcal: 108 },
  "Small portion brown rice": { serving: "1/2 cup cooked", p: 2, c: 22, f: 1, kcal: 108 },
  "Millets & oats": { serving: "30g dry", p: 3, c: 22, f: 1, kcal: 110 },
  "Daliya": { serving: "40g dry", p: 4, c: 30, f: 1, kcal: 150 },
  "Soaked almonds & walnuts": { serving: "5 almonds + 2 walnuts", p: 4, c: 3, f: 12, kcal: 130 },
  "Ghee (1–2 tsp)": { serving: "1 tsp (5g)", p: 0, c: 0, f: 5, kcal: 45 },
  "Pumpkin & flax seeds": { serving: "1 tbsp", p: 3, c: 4, f: 5, kcal: 70 },
};

