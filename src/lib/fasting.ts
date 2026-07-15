// Fasting & Intermittent Fasting library — frontend only.
// Persists user plan to localStorage.

export type IFWindow = "12:12" | "14:10" | "16:8" | "18:6" | "20:4" | "OMAD";

export interface IFWindowInfo {
  id: IFWindow;
  fastHours: number;
  eatHours: number;
  label: string;
  blurb: string;
  level: "starter" | "intermediate" | "advanced";
}

export const IF_WINDOWS: IFWindowInfo[] = [
  { id: "12:12", fastHours: 12, eatHours: 12, label: "12:12", blurb: "Gentle start. Mirror the sun cycle.", level: "starter" },
  { id: "14:10", fastHours: 14, eatHours: 10, label: "14:10", blurb: "Autophagy just begins around 14h.", level: "starter" },
  { id: "16:8", fastHours: 16, eatHours: 8,  label: "16:8",  blurb: "The classic. Real fat-burn window.", level: "intermediate" },
  { id: "18:6", fastHours: 18, eatHours: 6,  label: "18:6",  blurb: "Deep ketosis & autophagy.",            level: "intermediate" },
  { id: "20:4", fastHours: 20, eatHours: 4,  label: "20:4",  blurb: "Two balanced meals in a short window — breakfast & lunch, or brunch & early dinner. A 4–5 hr gap works too.", level: "advanced" },
  { id: "OMAD", fastHours: 23, eatHours: 1,  label: "OMAD",  blurb: "One Meal A Day. Works regularly only if one heavy meal can meet your full nutrition needs.", level: "advanced" },
];

// Color-coded recommendation ladder shown when the user opts into IF.
// Encourages gradual progression: green (start) → yellow → orange → red (doctor only).
export type RecTier = "green" | "yellow" | "orange" | "red";
export interface IFRecommendation {
  id: IFWindow;
  tier: RecTier;
  recommendedMeals: string;   // human-readable, e.g. "3 meals"
  headline: string;
  note: string;
}
export const IF_RECOMMENDATION_TIERS: IFRecommendation[] = [
  { id: "12:12", tier: "green",  recommendedMeals: "3 meals",
    headline: "12:12 — gentle start",
    note: "Recommended starting point. Easy to sustain — body learns the rhythm." },
  { id: "14:10", tier: "green",  recommendedMeals: "3 meals",
    headline: "14:10 — beginner",
    note: "Recommended. Move here once 12:12 feels easy for a week." },
  { id: "16:8",  tier: "yellow", recommendedMeals: "3 meals",
    headline: "16:8 — intermediate",
    note: "Step up gradually. Stay 2–3 weeks before going further." },
  { id: "18:6",  tier: "orange", recommendedMeals: "2 meals (or 2 + a snack)",
    headline: "18:6 — advanced",
    note: "Only after a few weeks of 16:8. Watch energy & sleep." },
  { id: "20:4",  tier: "orange", recommendedMeals: "2 meals — e.g. breakfast & lunch, or brunch & early dinner",
    headline: "20:4",
    note: "Move here once 18:6 feels comfortable. A 4–5 hr gap between the two meals also works — no need to be rigid about a 4-hour window." },
  { id: "OMAD",  tier: "red",    recommendedMeals: "1 large meal",
    headline: "OMAD — one meal a day",
    note: "Doctor go-ahead first. Regular OMAD only if one heavy meal can meet your full nutrition needs — otherwise try it 1–2 days a week and use 16/18 the rest of the days." },
];

// Hunger management tips — shared across IF & Fasting sections.
export const HUNGER_TIPS: { group: string; items: string[] }[] = [
  {
    group: "Drink your way through the wave",
    items: [
      "Warm water — first thing on waking, sip through the morning",
      "Warm water with lemon (no sugar)",
      "Warm water with grated ginger or saunf-jeera water",
      "Black coffee (no milk, no sugar) — appetite suppressant",
      "Green tea, herbal teas, mint tea",
      "Pinch of pink salt + lemon in water for electrolytes",
    ],
  },
  {
    group: "Watch the electrolytes",
    items: [
      "Sodium, potassium, magnesium drop during long fasts — that's what causes the dizziness, headaches & chakkar",
      "Especially critical in hot weather — sweat depletes electrolytes fast",
      "A teaspoon of Epsom salt in water can help with magnesium (don't overdo it)",
      "If you feel dizzy: stop, sit, sip salted water — break the fast if symptoms persist",
    ],
  },
  {
    group: "When opening the fast",
    items: [
      "Break with low-GI food — glucose released slowly, no insulin spike, no hunger crash 2h later",
      "Examples: fruit + soaked nuts, dal, sprouts, vegetables, dahi",
      "Avoid sweet, refined, fried first — sets up cravings for the rest of the day",
    ],
  },
  {
    group: "Distract & ride the wave (it lasts 20 min)",
    items: [
      "Go for a 10-minute walk — outdoors if possible",
      "Listen to your favourite song / podcast",
      "Call or message a friend",
      "5 minutes of meditation, anulom-vilom or bhramari",
      "Read about IF & its benefits — keeps motivation fresh",
    ],
  },
  {
    group: "Set yourself up the night before",
    items: [
      "Sleep by 10–10:30 pm — poor sleep raises ghrelin (hunger) the next day",
      "Don't sleep too late",
      "Wake by 6 am, warm water, light yoga / pranayam / meditation",
      "Push your first meal naturally to 10 am — that's a clean 16h gap from a 6 pm dinner",
    ],
  },
  {
    group: "Sample ideal day (16h IF)",
    items: [
      "Wake 6:00 — warm water, yoga, pranayam, meditation",
      "Detox sips: amla juice OR turmeric water OR methi-jeera water",
      "10:00 — first meal (brunch or breakfast)",
      "14:00 — lunch (biggest meal — Agni peaks)",
      "18:00 — light early dinner (close fast by 6 pm)",
      "22:00 — sleep",
    ],
  },
  {
    group: "Going to 18–20h",
    items: [
      "Two meals: 10:00 brunch + 14:30 lunch, then nothing till next morning",
      "Or: brunch at 11:00 + early dinner at 5:00 pm",
      "Hydrate aggressively — herbal teas, coconut water (only if not strict)",
    ],
  },
];

// (Religious / world fasting traditions removed by product decision.)

// Extended-fasting categories — what's practiced beyond IF.
export const FAST_CATEGORIES: { title: string; emoji: string; items: string[]; note?: string }[] = [
  {
    title: "Extended Fasting",
    emoji: "⏳",
    items: ["24-hour fast", "36-hour fast", "48-hour fast", "72-hour fast", "Multi-day (medical supervision)"],
    note: "Therapeutic or metabolic purpose. Beyond 48h, medical supervision strongly recommended.",
  },
  {
    title: "Water Fasting",
    emoji: "💧",
    items: ["24 hours", "3 days", "5 days", "7 days (supervised)"],
    note: "Only water. Electrolytes drop fast — risk of dizziness, arrhythmias. Refeed slowly.",
  },
  {
    title: "Juice Fasting",
    emoji: "🥤",
    items: ["Fresh fruit juices", "Vegetable juices", "1–3 day wellness reset"],
    note: "Easy detox. High in fructose — not a long-term strategy.",
  },
  {
    title: "Liquid Fasting",
    emoji: "🍵",
    items: ["Soups", "Bone / vegetable broth", "Coconut water", "Herbal teas", "Protein shakes (some protocols)"],
  },
  {
    title: "Ayurvedic Fasting",
    emoji: "🌿",
    items: ["Fruit fasting", "Khichdi cleanse (mono-diet)", "Mono-diet fasting", "Seasonal fasting (Ritucharya)", "Light digestive-rest days", "Prakriti-based (Vata / Pitta / Kapha)"],
  },
  {
    title: "Therapeutic / Medical",
    emoji: "🩺",
    items: ["Blood sugar management", "Fatty liver support", "Obesity management", "Pre-surgical fasting", "Diagnostic fasting"],
    note: "Always under clinical guidance.",
  },
  {
    title: "Disease Management",
    emoji: "❤️",
    items: ["Diabetes-friendly fasting", "Fatty liver fasting", "PCOS fasting", "Metabolic health fasting"],
    note: "Discuss with your physician before starting.",
  },
];

// Timeline of what happens inside the body while fasting.
export const FAST_TIMELINE: { atHour: number; title: string; detail: string; emoji: string }[] = [
  { atHour: 0,  title: "Last bite",              detail: "Insulin rises, body stores energy.",                       emoji: "🍽️" },
  { atHour: 4,  title: "Absorption complete",    detail: "Blood sugar normalizes. Insulin starts to drop.",          emoji: "💧" },
  { atHour: 8,  title: "Glycogen tap opens",     detail: "Liver glycogen becomes the main fuel.",                    emoji: "🔋" },
  { atHour: 12, title: "Glycogen depletion",     detail: "Stores running low. Body looks for fat.",                  emoji: "📉" },
  { atHour: 14, title: "Autophagy begins",       detail: "Cells start recycling damaged proteins.",                  emoji: "♻️" },
  { atHour: 16, title: "Fat-burning (ketosis)",  detail: "Liver makes ketones — clean fuel for brain & heart.",      emoji: "🔥" },
  { atHour: 18, title: "Deeper autophagy",       detail: "Cellular cleanup accelerates. HGH rises.",                 emoji: "🧬" },
  { atHour: 24, title: "Full reset",             detail: "Inflammation drops. Insulin sensitivity peaks.",           emoji: "✨" },
];

export const IF_BENEFITS: { title: string; emoji: string }[] = [
  { title: "Lowers inflammation",      emoji: "🌿" },
  { title: "Drops triglycerides",      emoji: "💚" },
  { title: "Curbs appetite",           emoji: "🍃" },
  { title: "Better blood sugar",       emoji: "🩸" },
  { title: "Better blood pressure",    emoji: "❤️" },
  { title: "Gut healing",              emoji: "🌀" },
  { title: "Stronger immunity",        emoji: "🛡️" },
  { title: "Sharper focus",            emoji: "🧠" },
  { title: "Deeper sleep",             emoji: "🌙" },
  { title: "Slows ageing",             emoji: "⏳" },
  { title: "Easier weight loss",       emoji: "⚖️" },
];

export const IF_CAUTION: string[] = [
  "Pregnant or nursing",
  "Underweight or malnourished",
  "Hypoglycemia (low blood sugar)",
  "Active chronic illness — check with your doctor",
  "Children & adolescents",
  "History of eating disorder — only with medical supervision",
];

export const IF_RULES: { title: string; detail: string }[] = [
  { title: "Keep a rhythm",         detail: "Same fasting window each day works better than randomly skipping meals." },
  { title: "Watch what you drink",  detail: "Water, sparkling water, black coffee, plain tea — anything with calories breaks the fast." },
  { title: "Skip sweeteners",       detail: "Aspartame, sucralose, saccharin can spike insulin and pull you out of the fast." },
  { title: "Mind your electrolytes",detail: "A pinch of pink salt + lemon, or an electrolyte tab, prevents headaches and fatigue." },
];

// --- Meal planner ---
export type DietStyle = "veg" | "vegan" | "non-veg";
export type MealCount = 1 | 2 | 3;

export interface MealSuggestion {
  time: string;          // "11:00"
  label: string;         // "Brunch"
  idea: string;          // veg suggestion
  ayurvedaNote?: string;
}

// Returns recommended meal layouts inside the eating window.
// We bias meals to 10am–7pm where Ayurveda says Agni (digestive fire) peaks.
export function recommendMeals(windowId: IFWindow, meals: MealCount): MealSuggestion[] {
  const w = IF_WINDOWS.find((x) => x.id === windowId)!;
  // Eating window chosen to keep meals inside 10–19h when possible.
  // Map (window, mealCount) -> meal schedule.
  const plans: Record<string, MealSuggestion[]> = {
    "12:12-3": [
      { time: "08:00", label: "Breakfast", idea: "Soaked almonds, fruit bowl, warm spiced milk", ayurvedaNote: "Light & warm — wake Agni gently" },
      { time: "13:00", label: "Lunch",     idea: "Dal, sabzi, 2 rotis, cucumber raita",         ayurvedaNote: "Heaviest meal at Agni peak" },
      { time: "19:00", label: "Dinner",    idea: "Khichdi with ghee, steamed veg",              ayurvedaNote: "Light, warm, easy to digest" },
    ],
    "12:12-2": [
      { time: "10:00", label: "Brunch",    idea: "Poha or upma + fruit + nuts" },
      { time: "18:00", label: "Early dinner", idea: "Mixed-veg khichdi with ghee" },
    ],
    "14:10-3": [
      { time: "09:00", label: "Breakfast", idea: "Fruit + soaked almonds" },
      { time: "13:00", label: "Lunch",     idea: "Dal-chawal-sabzi, salad" },
      { time: "18:30", label: "Early dinner", idea: "Vegetable soup + millet roti" },
    ],
    "14:10-2": [
      { time: "10:00", label: "Brunch",    idea: "Veg dalia + curd" },
      { time: "18:00", label: "Early dinner", idea: "Khichdi + steamed greens" },
    ],
    "16:8-3": [
      { time: "11:00", label: "Late brunch", idea: "Veg paratha + curd + fruit" },
      { time: "14:30", label: "Lunch",     idea: "Dal, sabzi, salad" },
      { time: "18:30", label: "Early dinner", idea: "Vegetable soup + millet" },
    ],
    "16:8-2": [
      { time: "11:00", label: "Brunch",    idea: "Fruit bowl + nuts + sprouts chaat" },
      { time: "17:00", label: "Early dinner", idea: "Khichdi with ghee" },
    ],
    "16:8-1": [
      { time: "14:00", label: "OMAD",      idea: "Generous thali: dal, sabzi, rice/roti, salad, curd" },
    ],
    "18:6-3": [
      { time: "11:00", label: "Brunch",    idea: "Some fruits + soaked nuts" },
      { time: "13:00", label: "Lunch",     idea: "Dal, sabzi, salad" },
      { time: "17:00", label: "Early dinner", idea: "Light khichdi" },
    ],
    "18:6-2": [
      { time: "11:00", label: "Brunch",    idea: "Fruit + nuts" },
      { time: "17:00", label: "Early dinner", idea: "Khichdi + steamed veg" },
    ],
    "18:6-1": [
      { time: "13:00", label: "OMAD",      idea: "Balanced thali — eat slow, chew well" },
    ],
    "20:4-2": [
      { time: "13:00", label: "Lunch",     idea: "Big balanced plate" },
      { time: "16:30", label: "Early dinner", idea: "Soup + fruit" },
    ],
    "20:4-1": [
      { time: "14:00", label: "OMAD",      idea: "Nutrient-dense thali" },
    ],
    "OMAD-1": [
      { time: "14:00", label: "OMAD", idea: "Big nutrient-dense thali — dal, sabzi, rice/roti, salad, ghee, curd, fruit", ayurvedaNote: "Eat slowly, chew well. One meal must cover the whole day." },
    ],
  };
  const key = `${windowId}-${meals}`;
  // Fallback: build something sensible from window.
  if (plans[key]) return plans[key];
  return [{ time: "13:00", label: "Main meal", idea: "Balanced thali inside your eating window" }];
}

// --- Days pattern ---
export type DaysPattern = "all" | "alternate" | "weekdays" | "custom";

// --- Fasting (Indian / extended) ---
export type FastingType =
  | "traditional"     // Ekadashi / vrat — fruits, sabudana, no grains
  | "fruit-only"      // 1 day of just fruits
  | "fruit-light"     // fruits + light meal
  | "no-grain"        // avoid grains for a day
  | "if-extended"     // 24–36h IF
  | "water-prep"      // multi-day water fast prep
  | "water-fast";     // pure water fast (advanced)

export const FASTING_TYPES: { id: FastingType; title: string; level: "easy"|"medium"|"advanced"; blurb: string; protocol: string[]; }[] = [
  {
    id: "traditional", title: "Traditional Vrat", level: "easy",
    blurb: "Indian-style fasting: fruits, sabudana, kuttu — no grains, no salt sometimes.",
    protocol: [
      "Eat fruits, milk, makhana, sabudana khichdi (sendha namak only)",
      "Skip wheat, rice and regular salt for the day",
      "Keep yourself hydrated with water, coconut water, lemon water",
    ],
  },
  {
    id: "fruit-only", title: "Fruit-only Day", level: "easy",
    blurb: "Single day of just seasonal fruits — easy gut reset.",
    protocol: [
      "3–5 small servings of seasonal fruit through the day",
      "Sip on water + a pinch of salt for electrolytes",
      "Break with khichdi the next morning, not heavy food",
    ],
  },
  {
    id: "fruit-light", title: "Fruit + 1 Light Meal", level: "easy",
    blurb: "Fruits during the day, one light cooked meal in the evening.",
    protocol: [
      "Fruits in morning + afternoon",
      "One bowl of khichdi or soup at sunset",
    ],
  },
  {
    id: "no-grain", title: "No-grain Day", level: "easy",
    blurb: "Drop wheat & rice for a day — go with sabzi, dal, curd, fruits.",
    protocol: ["Eat normally but skip rice, wheat, millets"],
  },
  {
    id: "if-extended", title: "Extended IF (24–36h)", level: "medium",
    blurb: "One meal yesterday → skip today → break tomorrow morning.",
    protocol: [
      "Last meal evening of day 1",
      "Day 2: only water, black coffee, plain tea + electrolytes",
      "Break with fruit + soaked nuts on day 3 morning",
    ],
  },
  {
    id: "water-prep", title: "Water-fast Prep (2-day ramp)", level: "advanced",
    blurb: "Smart ramp before a long water fast.",
    protocol: [
      "Day -2: fruits + light cooked food",
      "Day -1: watermelon juice / coconut water only",
      "Day 0: begin water fast with electrolytes",
    ],
  },
  {
    id: "water-fast", title: "Water Fast (24h+)", level: "advanced",
    blurb: "Only water + electrolytes. Doctor approval required beyond 48h.",
    protocol: [
      "Sip water through the day — 2 to 3 L",
      "Add a pinch of pink salt + magnesium / potassium",
      "Break gently: watermelon juice → fruit → khichdi",
      "More than 48h: get medical clearance, monitor heart rate & BP",
    ],
  },
];

// Why our body is wired for fasting — short, rewritten gyan.
export const EVOLUTION_GYAN: { title: string; body: string }[] = [
  {
    title: "We evolved hungry",
    body: "For 99% of human history we hunted and gathered — three full meals plus snacks is a very recent invention. Our genes are still tuned for cycles of feast and famine.",
  },
  {
    title: "Sharper on empty",
    body: "Hunger triggers BDNF, a protein that grows new neurons. Early humans had to think clearly to track prey — a foggy brain meant no dinner.",
  },
  {
    title: "Metabolic flexibility",
    body: "A successful hunt = feast, then days of nothing. The body learned to switch fuels: burn carbs when fed, burn fat & ketones when fasted.",
  },
  {
    title: "Built-in cleanup",
    body: "Without incoming food, cells turn on autophagy — recycling damaged proteins, lowering inflammation, repairing tissue. Modern non-stop eating switches this off.",
  },
];

// --- Plan storage ---
export type Goal = "healthy-living" | "autophagy" | "longevity" | "weight-loss" | "gut-reset";

export interface FastingPlan {
  kind: "if" | "fasting";
  goal: Goal;
  windowId?: IFWindow;
  startTime?: string;     // "20:00"
  endTime?: string;       // "12:00"
  meals?: MealCount;
  mealPlan?: MealSuggestion[];
  daysPattern?: DaysPattern;
  fastingType?: FastingType;
  createdAt: number;
}

const KEY = "ayuraise.fasting.plan";

export function savePlan(plan: FastingPlan): void {
  try { localStorage.setItem(KEY, JSON.stringify(plan)); } catch {}
}

export function loadPlan(): FastingPlan | null {
  try {
    const raw = localStorage.getItem(KEY);
    return raw ? (JSON.parse(raw) as FastingPlan) : null;
  } catch { return null; }
}

// Compute a sensible default fasting window start: end time = first meal.
export function deriveTimes(windowId: IFWindow, firstMealTime: string): { startTime: string; endTime: string } {
  const w = IF_WINDOWS.find((x) => x.id === windowId)!;
  const [hh, mm] = firstMealTime.split(":").map(Number);
  // fasting ends at first meal. start = end - fastHours wrap 24
  let startH = (hh - w.fastHours + 24) % 24;
  const pad = (n: number) => String(n).padStart(2, "0");
  return {
    startTime: `${pad(startH)}:${pad(mm)}`,
    endTime:   `${pad(hh)}:${pad(mm)}`,
  };
}
