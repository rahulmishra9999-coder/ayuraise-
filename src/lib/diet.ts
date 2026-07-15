// Diet Plan — Ayurveda-aligned meal planner
// Generates a personalized day plan based on prakriti (dosha), disease,
// dietary preference, current season (ritu) and meals per day.

export type Dosha = "vata" | "pitta" | "kapha";
export type Diet = "veg" | "vegan" | "eggetarian" | "non-veg" | "jain" | "sattvic";
export type MealsPerDay = 2 | 3 | 4 | 5;
export type DiseaseTag =
  | "none" | "diabetes" | "hypertension" | "thyroid" | "pcos"
  | "ibs" | "acidity" | "obesity" | "high-cholesterol" | "anemia"
  | "arthritis" | "fatty-liver";
export type Ritu = "vasanta" | "grishma" | "varsha" | "sharad" | "hemanta" | "shishira";
export type Activity = "sedentary" | "light" | "moderate" | "active";

export interface PrakritiAnswer { q: number; option: Dosha }

export const PRAKRITI_QUESTIONS: { q: string; options: { dosha: Dosha; label: string }[] }[] = [
  {
    q: "Body frame",
    options: [
      { dosha: "vata", label: "Thin, lean, hard to gain weight" },
      { dosha: "pitta", label: "Medium, athletic, easy to tone" },
      { dosha: "kapha", label: "Broad, sturdy, gains easily" },
    ],
  },
  {
    q: "Skin",
    options: [
      { dosha: "vata", label: "Dry, rough, cool" },
      { dosha: "pitta", label: "Warm, oily, prone to redness" },
      { dosha: "kapha", label: "Thick, smooth, cool & moist" },
    ],
  },
  {
    q: "Appetite",
    options: [
      { dosha: "vata", label: "Irregular, often forget meals" },
      { dosha: "pitta", label: "Strong, get hangry if delayed" },
      { dosha: "kapha", label: "Steady, can skip meals easily" },
    ],
  },
  {
    q: "Digestion",
    options: [
      { dosha: "vata", label: "Variable, bloating, gas" },
      { dosha: "pitta", label: "Fast, can cause acidity / loose stools" },
      { dosha: "kapha", label: "Slow, heavy feeling after meals" },
    ],
  },
  {
    q: "Sleep",
    options: [
      { dosha: "vata", label: "Light, restless, 5–6 hrs" },
      { dosha: "pitta", label: "Sound, moderate, 6–8 hrs" },
      { dosha: "kapha", label: "Deep, long, 8+ hrs, hard to wake" },
    ],
  },
  {
    q: "Temperament",
    options: [
      { dosha: "vata", label: "Quick, creative, anxious under stress" },
      { dosha: "pitta", label: "Sharp, focused, irritable under stress" },
      { dosha: "kapha", label: "Calm, steady, withdrawn under stress" },
    ],
  },
  {
    q: "Climate preference",
    options: [
      { dosha: "vata", label: "Love warm, dislike cold/wind" },
      { dosha: "pitta", label: "Love cool, dislike heat" },
      { dosha: "kapha", label: "Love warm/dry, dislike damp" },
    ],
  },
];

export function scorePrakriti(answers: PrakritiAnswer[]): { dosha: Dosha; score: Record<Dosha, number> } {
  const score: Record<Dosha, number> = { vata: 0, pitta: 0, kapha: 0 };
  answers.forEach((a) => { score[a.option] += 1; });
  const dosha = (Object.entries(score).sort((a, b) => b[1] - a[1])[0][0] as Dosha);
  return { dosha, score };
}

export function currentRitu(date = new Date()): Ritu {
  const m = date.getMonth() + 1;
  if (m === 2 || m === 3) return "vasanta";   // Spring
  if (m === 4 || m === 5) return "grishma";   // Summer
  if (m === 6 || m === 7) return "varsha";    // Monsoon
  if (m === 8 || m === 9) return "sharad";    // Autumn
  if (m === 10 || m === 11) return "hemanta"; // Pre-winter
  return "shishira";                          // Winter
}

export const RITU_NOTE: Record<Ritu, string> = {
  vasanta: "Spring — favor light, warm, bitter foods. Reduce heavy & sweet.",
  grishma: "Summer — cooling, hydrating, sweet & juicy foods. Avoid spicy & fried.",
  varsha: "Monsoon — warm, cooked, easy to digest. Avoid raw salads & leafy greens.",
  sharad: "Autumn — sweet, cooling & mildly bitter to calm pitta. Ghee & milk help.",
  hemanta: "Pre-winter — rich, warming, nourishing. Best season to build strength.",
  shishira: "Winter — warm, oily, sweet & sour. Nuts, ghee, root vegetables.",
};

// ---------- Food libraries ----------
type Meal = {
  time: string;
  name: string;
  items: string[];
  why?: string;
};

const FAVOR: Record<Dosha, string[]> = {
  vata: ["warm cooked oats", "ghee", "sweet potato", "moong dal", "stewed apple", "almonds (soaked)", "basmati rice", "warm milk + cardamom"],
  pitta: ["coconut water", "cucumber", "sweet ripe fruits", "coriander", "fennel", "bottle gourd", "basmati rice", "milk + dates"],
  kapha: ["barley", "millet (ragi/bajra)", "ginger tea", "leafy greens", "honey (raw)", "mung soup", "spiced veggies", "light buckwheat roti"],
};

const AVOID: Record<Dosha, string[]> = {
  vata: ["raw salads", "cold drinks", "dry crackers", "carbonated drinks"],
  pitta: ["chillies", "deep-fried", "sour fermented foods", "tomato + vinegar combos"],
  kapha: ["cheese", "fried snacks", "iced drinks", "wheat in excess", "bananas"],
};

const DISEASE_RULES: Record<DiseaseTag, { avoid: string[]; favor: string[]; note: string }> = {
  none: { avoid: [], favor: [], note: "" },
  diabetes: { avoid: ["white rice", "white sugar", "fruit juice", "potato"], favor: ["methi (fenugreek)", "bitter gourd", "millets", "cinnamon"], note: "Low GI; pair carbs with protein/fat." },
  hypertension: { avoid: ["salty pickles", "papad", "processed snacks"], favor: ["beetroot", "garlic", "amla", "low-salt cooked greens"], note: "Reduce sodium; emphasize potassium." },
  thyroid: { avoid: ["raw cruciferous in excess", "soy in excess"], favor: ["coconut oil (cook)", "brazil nuts", "seaweed (light)", "moong dal"], note: "Selenium & iodine support, cooked greens." },
  pcos: { avoid: ["sugary drinks", "white bread", "dairy in excess"], favor: ["flax seed", "cinnamon", "millets", "spearmint tea"], note: "Insulin-friendly, anti-inflammatory." },
  ibs: { avoid: ["raw onion/garlic", "raw salads", "carbonated drinks"], favor: ["cooked rice + ghee", "buttermilk + cumin", "moong khichdi", "stewed apple"], note: "Cooked, warm, simple meals." },
  acidity: { avoid: ["chillies", "coffee", "tomato sauce", "vinegar"], favor: ["coconut water", "boiled white rice", "cucumber", "fennel tea"], note: "Pitta-pacifying; avoid skipping meals." },
  obesity: { avoid: ["fried snacks", "sweets", "cheese", "soda"], favor: ["millets", "ginger tea", "leafy greens", "moong soup"], note: "Kapha-reducing; biggest meal at lunch." },
  "high-cholesterol": { avoid: ["butter in excess", "deep-fried", "red meat"], favor: ["oats", "amla", "garlic", "walnuts"], note: "Soluble fiber, healthy fats." },
  anemia: { avoid: ["tea/coffee with meals"], favor: ["dates", "raisins (soaked)", "beetroot", "spinach + lemon"], note: "Iron + vit C pairing." },
  arthritis: { avoid: ["nightshades in excess", "cold foods"], favor: ["turmeric milk", "ginger", "moong khichdi", "sesame oil"], note: "Warm, anti-inflammatory, vata-pacifying." },
  "fatty-liver": { avoid: ["alcohol", "fried foods", "sugar"], favor: ["bitter gourd", "amla", "green tea", "kulthi (horsegram)"], note: "Bitter & astringent to support liver." },
};

const DIET_SUBSTITUTE: Record<Diet, (item: string) => string> = {
  veg: (s) => s,
  vegan: (s) => s.replace(/ghee/gi, "coconut oil").replace(/milk/gi, "almond milk").replace(/curd|buttermilk/gi, "coconut yogurt"),
  eggetarian: (s) => s,
  "non-veg": (s) => s,
  jain: (s) => s.replace(/onion|garlic|potato|beetroot/gi, "bottle gourd"),
  sattvic: (s) => s.replace(/onion|garlic|chilli|chillies/gi, "ginger"),
};

// ---------- Meal timings ----------
function timesFor(n: MealsPerDay): { time: string; slot: string }[] {
  if (n === 2) return [
    { time: "11:00", slot: "Brunch" },
    { time: "18:30", slot: "Dinner" },
  ];
  if (n === 3) return [
    { time: "08:00", slot: "Breakfast" },
    { time: "13:00", slot: "Lunch" },
    { time: "19:00", slot: "Dinner" },
  ];
  if (n === 4) return [
    { time: "08:00", slot: "Breakfast" },
    { time: "13:00", slot: "Lunch" },
    { time: "16:30", slot: "Snack" },
    { time: "19:30", slot: "Dinner" },
  ];
  return [
    { time: "07:30", slot: "Breakfast" },
    { time: "11:00", slot: "Mid-morning" },
    { time: "13:30", slot: "Lunch" },
    { time: "16:30", slot: "Snack" },
    { time: "19:30", slot: "Dinner" },
  ];
}

// ---------- Plan builder ----------
export interface DietPlan {
  createdAt: number;
  dosha: Dosha;
  prakritiScore: Record<Dosha, number>;
  disease: DiseaseTag;
  diet: Diet;
  meals: MealsPerDay;
  ritu: Ritu;
  activity: Activity;
  includeDetox: boolean;
  schedule: Meal[];
  guidance: string[];
  favor: string[];
  avoid: string[];
}

function pick<T>(arr: T[], i: number): T { return arr[i % arr.length]; }

export function buildDietPlan(input: {
  dosha: Dosha;
  prakritiScore: Record<Dosha, number>;
  disease: DiseaseTag;
  diet: Diet;
  meals: MealsPerDay;
  activity: Activity;
  includeDetox: boolean;
  date?: Date;
}): DietPlan {
  const ritu = currentRitu(input.date);
  const slots = timesFor(input.meals);
  const fav = FAVOR[input.dosha];
  const sub = DIET_SUBSTITUTE[input.diet];
  const dr = DISEASE_RULES[input.disease];

  const schedule: Meal[] = slots.map((s, i) => {
    let items: string[] = [];
    let name = s.slot;
    if (s.slot === "Breakfast" || s.slot === "Brunch") {
      items = [pick(fav, 0), "warm herbal tea", "stewed fruit"];
      name = input.dosha === "kapha" ? "Light spiced breakfast" : "Warm grounding breakfast";
    } else if (s.slot === "Mid-morning") {
      items = ["soaked almonds (5)", "seasonal fruit"];
      name = "Mid-morning bite";
    } else if (s.slot === "Lunch") {
      items = ["dal + sabzi", "millet/basmati rice", "small salad (cooked if vata/kapha)", "buttermilk + cumin"];
      name = "Main meal — Lunch (largest)";
    } else if (s.slot === "Snack") {
      items = ["roasted makhana", "ginger-tulsi tea"];
      name = "Evening snack";
    } else {
      items = ["moong khichdi or vegetable soup", "ghee 1 tsp", "warm water"];
      name = "Light early Dinner";
    }
    items = items.concat(dr.favor.slice(0, 1));
    items = items.map(sub);
    return { time: s.time, name, items, why: i === Math.floor(slots.length / 2) ? "Sun is at peak — digestive fire (agni) is strongest." : undefined };
  });

  const guidance = [
    "Sip warm water through the day; avoid iced drinks.",
    "Eat in a calm seated posture, no screens.",
    "Stop when 75% full — leave room for digestion.",
    RITU_NOTE[ritu],
  ];
  if (dr.note) guidance.push(`For ${input.disease}: ${dr.note}`);
  if (input.activity === "active") guidance.push("Add 20g protein post-workout (sprouts / paneer / tofu).");
  if (input.includeDetox) guidance.push("Detox add-on: one mono-diet (kitchari) day per week.");

  return {
    createdAt: Date.now(),
    dosha: input.dosha,
    prakritiScore: input.prakritiScore,
    disease: input.disease,
    diet: input.diet,
    meals: input.meals,
    ritu,
    activity: input.activity,
    includeDetox: input.includeDetox,
    schedule,
    guidance,
    favor: [...FAVOR[input.dosha], ...dr.favor],
    avoid: [...AVOID[input.dosha], ...dr.avoid],
  };
}

// ---------- Persistence ----------
const KEY = "ayuraise.diet.plan";
export function savePlan(p: DietPlan) {
  if (typeof window === "undefined") return;
  localStorage.setItem(KEY, JSON.stringify(p));
}
export function loadPlan(): DietPlan | null {
  if (typeof window === "undefined") return null;
  try { const r = localStorage.getItem(KEY); return r ? JSON.parse(r) : null; } catch { return null; }
}

export const DISEASES: { tag: DiseaseTag; label: string }[] = [
  { tag: "none", label: "None / healthy" },
  { tag: "diabetes", label: "Diabetes / Pre-diabetes" },
  { tag: "hypertension", label: "Hypertension" },
  { tag: "thyroid", label: "Thyroid" },
  { tag: "pcos", label: "PCOS / PCOD" },
  { tag: "ibs", label: "IBS / Bloating" },
  { tag: "acidity", label: "Acidity / GERD" },
  { tag: "obesity", label: "Obesity" },
  { tag: "high-cholesterol", label: "High cholesterol" },
  { tag: "anemia", label: "Anemia" },
  { tag: "arthritis", label: "Arthritis / joint pain" },
  { tag: "fatty-liver", label: "Fatty liver" },
];

export const DIETS: { tag: Diet; label: string }[] = [
  { tag: "veg", label: "Vegetarian" },
  { tag: "vegan", label: "Vegan" },
  { tag: "eggetarian", label: "Eggetarian" },
  { tag: "non-veg", label: "Non-vegetarian" },
  { tag: "jain", label: "Jain (no roots)" },
  { tag: "sattvic", label: "Sattvic (no onion/garlic)" },
];

export const DOSHA_DESC: Record<Dosha, string> = {
  vata: "Air + ether — light, mobile, cool. Best with warm, oily, grounding foods.",
  pitta: "Fire + water — sharp, hot, intense. Best with cooling, mildly sweet foods.",
  kapha: "Earth + water — stable, heavy, cool. Best with light, warm, spiced foods.",
};
