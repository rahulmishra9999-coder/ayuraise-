// Prevention-track risk assessment per chronic condition.
// Each disease gets a short questionnaire; answers sum to a score that maps
// to a band (low / moderate / high) with an honest, banded horizon statement —
// never a fake-precise date.

export interface RiskOption {
  label: string;
  score: number;
}

export interface RiskFactor {
  id: string;
  question: string;
  options: RiskOption[];
}

export interface RiskProfile {
  note: string; // why prevention matters for this condition
  factors: RiskFactor[];
}

export type RiskBand = "low" | "moderate" | "high";

/* ---------------- shared factor builders ---------------- */

const family = (name: string): RiskFactor => ({
  id: "family",
  question: `Does a parent or sibling have ${name}?`,
  options: [
    { label: "No", score: 0 },
    { label: "One of them", score: 3 },
    { label: "More than one", score: 5 },
  ],
});

const activity: RiskFactor = {
  id: "activity",
  question: "How active are you in a typical week?",
  options: [
    { label: "Active most days", score: 0 },
    { label: "2–3 sessions a week", score: 1 },
    { label: "Mostly sedentary", score: 3 },
  ],
};

const sleep: RiskFactor = {
  id: "sleep",
  question: "How is your sleep on most nights?",
  options: [
    { label: "7–8 hrs, regular", score: 0 },
    { label: "Irregular timing", score: 2 },
    { label: "Under 6 hrs often", score: 3 },
  ],
};

const stress: RiskFactor = {
  id: "stress",
  question: "How stressed do you feel day to day?",
  options: [
    { label: "Rarely", score: 0 },
    { label: "Sometimes", score: 1 },
    { label: "Most of the time", score: 3 },
  ],
};

const weight: RiskFactor = {
  id: "weight",
  question: "How would you describe your weight?",
  options: [
    { label: "Healthy range", score: 0 },
    { label: "Slightly above", score: 2 },
    { label: "Well above healthy", score: 4 },
  ],
};

const sugarDiet: RiskFactor = {
  id: "sugar",
  question: "Sweets, sugary drinks or refined carbs — how often?",
  options: [
    { label: "Rarely", score: 0 },
    { label: "Few times a week", score: 2 },
    { label: "Almost daily", score: 4 },
  ],
};

const saltDiet: RiskFactor = {
  id: "salt",
  question: "Packaged, fried or salty food — how often?",
  options: [
    { label: "Rarely", score: 0 },
    { label: "Few times a week", score: 2 },
    { label: "Almost daily", score: 4 },
  ],
};

const smoking: RiskFactor = {
  id: "smoking",
  question: "Do you smoke or use tobacco?",
  options: [
    { label: "Never", score: 0 },
    { label: "Occasionally / quit", score: 2 },
    { label: "Regularly", score: 5 },
  ],
};

const age40: RiskFactor = {
  id: "age",
  question: "Your age group?",
  options: [
    { label: "Under 30", score: 0 },
    { label: "30–45", score: 1 },
    { label: "Over 45", score: 3 },
  ],
};

const screens: RiskFactor = {
  id: "screens",
  question: "Daily screen time outside work?",
  options: [
    { label: "Under 2 hrs", score: 0 },
    { label: "2–4 hrs", score: 1 },
    { label: "4+ hrs", score: 3 },
  ],
};

const hydration: RiskFactor = {
  id: "hydration",
  question: "How much water do you drink daily?",
  options: [
    { label: "2.5 L or more", score: 0 },
    { label: "1–2 L", score: 2 },
    { label: "Under 1 L", score: 4 },
  ],
};

const painkillers: RiskFactor = {
  id: "painkillers",
  question: "How often do you take painkillers?",
  options: [
    { label: "Rarely", score: 0 },
    { label: "Monthly", score: 2 },
    { label: "Weekly or more", score: 4 },
  ],
};

const bpSugar: RiskFactor = {
  id: "bpsugar",
  question: "Do you already have high BP or high sugar?",
  options: [
    { label: "Neither", score: 0 },
    { label: "One of them", score: 3 },
    { label: "Both", score: 5 },
  ],
};

/* ---------------- per-disease profiles ---------------- */

export const RISK: Record<string, RiskProfile> = {
  diabetes: {
    note: "Type-2 diabetes builds silently for years — insulin resistance is reversible long before sugar readings turn bad.",
    factors: [family("diabetes"), weight, sugarDiet, activity, sleep, stress, age40],
  },
  hypertension: {
    note: "Vessels stiffen slowly under salt, stress and poor sleep. Caught early, BP responds beautifully to lifestyle.",
    factors: [family("high blood pressure"), saltDiet, stress, weight, activity, smoking, age40],
  },
  heart: {
    note: "Heart disease is decades in the making — cholesterol, BP and stress do quiet damage. Every year of prevention counts double.",
    factors: [family("heart disease"), smoking, saltDiet, stress, activity, weight, bpSugar, age40],
  },
  migraine: {
    note: "Migraine attacks are triggered — irregular meals, poor sleep and screen strain lower the threshold. Trigger discipline prevents most attacks.",
    factors: [family("migraine"), sleep, stress, screens, hydration,
      { id: "meals", question: "Do you skip or delay meals?", options: [
        { label: "Rarely", score: 0 }, { label: "Sometimes", score: 2 }, { label: "Often", score: 4 }] }],
  },
  asthma: {
    note: "Airway sensitivity often runs in families and flares with dust, cold and stress. Strong lungs built now mean fewer flares later.",
    factors: [family("asthma or allergies"), smoking,
      { id: "airquality", question: "Your daily air exposure?", options: [
        { label: "Mostly clean air", score: 0 }, { label: "City traffic", score: 2 }, { label: "Dust / smoke daily", score: 4 }] },
      { id: "colds", question: "How often do colds go to your chest?", options: [
        { label: "Rarely", score: 0 }, { label: "Sometimes", score: 2 }, { label: "Most colds", score: 4 }] },
      stress, activity],
  },
  kidney: {
    note: "Kidneys fail quietly — dehydration, salt, painkillers, BP and sugar all chip away. Protection is far easier than repair.",
    factors: [family("kidney disease"), hydration, saltDiet, painkillers, bpSugar, age40],
  },
  pancreas: {
    note: "Your pancreas works hardest on spikes. Insulin resistance shows up years before sugar readings do — which is exactly when it's easiest to reverse.",
    factors: [family("diabetes"), sugarDiet, weight, activity,
      { id: "grazing", question: "How often do you eat between meals?", options: [
        { label: "Rarely — proper meals only", score: 0 }, { label: "A snack or two", score: 2 }, { label: "Grazing all day", score: 4 }] },
      { id: "spike-crash", question: "Do you crash or crave sweets 2 hours after eating?", options: [
        { label: "Rarely", score: 0 }, { label: "Sometimes", score: 2 }, { label: "Most days", score: 4 }] },
      sleep, age40],
  },
  pcod: {
    note: "PCOD is driven by insulin resistance — food, movement and sleep now can keep cycles regular later.",
    factors: [family("PCOD or diabetes"), weight, sugarDiet, activity, sleep, stress],
  },
  "fatty-liver": {
    note: "Fatty liver is the most reversible chronic condition — but only in the early, silent stage.",
    factors: [weight, sugarDiet,
      { id: "alcohol", question: "How often do you drink alcohol?", options: [
        { label: "Never", score: 0 }, { label: "Socially", score: 2 }, { label: "Weekly or more", score: 4 }] },
      activity, family("diabetes or fatty liver")],
  },
  liver: {
    note: "The liver regenerates like no other organ — but only if you stop the daily load and give it food-free hours.",
    factors: [weight, sugarDiet,
      { id: "alcohol", question: "How often do you drink alcohol?", options: [
        { label: "Never", score: 0 }, { label: "Socially", score: 2 }, { label: "Weekly or more", score: 4 }] },
      { id: "fried", question: "How often do you eat fried or packaged food?", options: [
        { label: "Rarely", score: 0 }, { label: "A few times a week", score: 2 }, { label: "Most days", score: 4 }] },
      painkillers, activity, family("fatty liver or diabetes")],
  },
  thyroid: {
    note: "Thyroid trouble often follows years of stress, poor sleep and family history — early support keeps it in range.",
    factors: [family("thyroid disorder"), stress, sleep, weight,
      { id: "energy", question: "Unexplained fatigue or feeling cold?", options: [
        { label: "No", score: 0 }, { label: "Sometimes", score: 2 }, { label: "Often", score: 4 }] }],
  },
  arthritis: {
    note: "Joint wear accelerates with weight, inactivity and poor digestion (ama). Mobility built now is pain avoided later.",
    factors: [family("arthritis"), weight, activity, age40,
      { id: "stiffness", question: "Morning joint stiffness?", options: [
        { label: "Never", score: 0 }, { label: "Occasionally", score: 2 }, { label: "Most mornings", score: 4 }] }],
  },
  "knee-pain": {
    note: "Knees age fastest when the muscles around them are weak. Strength now is the best insurance.",
    factors: [weight, activity, age40,
      { id: "sitting", question: "Hours of continuous sitting daily?", options: [
        { label: "Under 4", score: 0 }, { label: "4–8", score: 2 }, { label: "8+", score: 4 }] },
      { id: "stairs", question: "Any discomfort on stairs?", options: [
        { label: "None", score: 0 }, { label: "Occasionally", score: 2 }, { label: "Often", score: 4 }] }],
  },
  lungs: {
    note: "Lung capacity peaks at 25 and declines after — pranayam and clean air slow the slope dramatically.",
    factors: [smoking,
      { id: "airquality", question: "Your daily air exposure?", options: [
        { label: "Mostly clean air", score: 0 }, { label: "City traffic", score: 2 }, { label: "Dust / smoke daily", score: 4 }] },
      activity,
      { id: "breath", question: "Breathless on 2 flights of stairs?", options: [
        { label: "Not at all", score: 0 }, { label: "Slightly", score: 2 }, { label: "Very", score: 4 }] }],
  },
  brain: {
    note: "Brain health compounds — sleep, movement and calm now are memory and focus decades later.",
    factors: [sleep, screens, stress, activity, family("dementia or stroke"), age40],
  },
  sleep: {
    note: "Poor sleep multiplies the risk of nearly every chronic condition — fixing it first makes everything else easier.",
    factors: [screens, stress,
      { id: "caffeine", question: "Caffeine after 2 PM?", options: [
        { label: "Never", score: 0 }, { label: "Sometimes", score: 2 }, { label: "Daily", score: 4 }] },
      { id: "schedule", question: "Same bed / wake time daily?", options: [
        { label: "Yes, consistent", score: 0 }, { label: "Varies ±1 hr", score: 1 }, { label: "All over the place", score: 4 }] }],
  },
  obesity: {
    note: "Weight creeps ~0.5 kg a year unnoticed. Habits set now decide the next decade's number.",
    factors: [family("obesity or diabetes"), sugarDiet, activity, sleep, stress,
      { id: "dinner", question: "When is dinner usually?", options: [
        { label: "Before 8 PM", score: 0 }, { label: "8–9:30 PM", score: 2 }, { label: "After 9:30 PM", score: 3 }] }],
  },
  gut: {
    note: "Agni (digestive fire) weakens slowly with irregular eating — most gut disease starts as ignorable discomfort.",
    factors: [stress,
      { id: "mealtimes", question: "Are meal timings regular?", options: [
        { label: "Yes, fixed", score: 0 }, { label: "Somewhat", score: 2 }, { label: "Random", score: 4 }] },
      { id: "processed", question: "Packaged / outside food — how often?", options: [
        { label: "Rarely", score: 0 }, { label: "Few times a week", score: 2 }, { label: "Daily", score: 4 }] },
      sleep,
      { id: "symptoms", question: "Bloating, acidity or irregularity now?", options: [
        { label: "Rarely", score: 0 }, { label: "Weekly", score: 2 }, { label: "Most days", score: 4 }] }],
  },
  cholesterol: {
    note: "LDL does silent damage for decades. Food and cardio move it within 12 weeks.",
    factors: [family("high cholesterol or heart disease"), saltDiet, weight, activity, smoking, age40],
  },
};

/* ---------------- scoring ---------------- */

export function maxScore(factors: RiskFactor[]): number {
  return factors.reduce((s, f) => s + Math.max(...f.options.map((o) => o.score)), 0);
}

export function riskBand(score: number, max: number): RiskBand {
  const pct = max > 0 ? score / max : 0;
  if (pct < 0.25) return "low";
  if (pct < 0.55) return "moderate";
  return "high";
}

export const BAND_META: Record<RiskBand, { label: string; horizon: string; tone: string }> = {
  low: {
    label: "Low risk",
    horizon: "Your current habits are protective. Keep them up — a light prevention routine locks it in.",
    tone: "text-emerald-600",
  },
  moderate: {
    label: "Moderate risk",
    horizon: "If habits stay as they are, risk rises meaningfully over the next ~5–10 years. Small consistent changes now can bring this down to low.",
    tone: "text-amber-600",
  },
  high: {
    label: "High risk",
    horizon: "Without changes, this could develop within the next few years. The good news: at this stage it is still largely preventable — the plan below targets your biggest factors first.",
    tone: "text-rose-600",
  },
};

/** Top scoring factor ids from a set of answers — "these habits move your risk the most". */
export function topContributors(
  factors: RiskFactor[],
  answers: Record<string, number>, // factor id -> chosen score
  n = 3,
): RiskFactor[] {
  return [...factors]
    .filter((f) => (answers[f.id] ?? 0) > 0)
    .sort((a, b) => (answers[b.id] ?? 0) - (answers[a.id] ?? 0))
    .slice(0, n);
}
