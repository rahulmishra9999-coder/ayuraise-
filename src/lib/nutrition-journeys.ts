// Ready-made Nutrition Journeys — data for the Diet section.
// Each journey follows the same template rendered by /diet/journey/$slug.

export type Difficulty = "Easy" | "Moderate" | "Advanced";
export type EvidenceLevel = "Traditional" | "Emerging" | "Well-studied";

export interface FlashLesson {
  title: string;
  body: string;
  emoji?: string;
}

export interface FoodItem {
  name: string;
  emoji: string;
  benefit: string;
  frequency?: string;
  season?: string;
}

export interface MealOption {
  name: string;
  emoji: string;
  desc: string;
}

export interface JourneyContent {
  benefits: string[];
  duration: string;
  evidence: EvidenceLevel;
  lessons: FlashLesson[];
  principles: { eat: string[]; avoid: string[] };
  northStar: FoodItem[];
  meals: {
    hydration: string[];
    breakfast: MealOption[];
    miniMorning: string[];
    lunch: string[];
    evening: string[];
    dinner: string[];
    water: string;
  };
  seasonal: {
    summer: { eat: string[]; reduce: string[] };
    winter: { eat: string[]; reduce: string[] };
    monsoon: { eat: string[]; reduce: string[] };
  };
  lifestyle: string[];
  fasting: {
    benefits: string[];
    avoid: string[];
    recommended: "12:12" | "14:10" | "16:8" | "none";
  };
  ayurveda: string[];
}

export interface Journey {
  slug: string;
  title: string;
  emoji: string;
  gradient: string;
  short: string;
  bestFor: string;
  difficulty: Difficulty;
  content: JourneyContent;
}

const commonHydration = [
  "Warm water",
  "Warm water + lemon",
  "Warm water + ginger",
  "Warm water + turmeric",
  "Amla water",
];

const commonBreakfast: MealOption[] = [
  { name: "Moong Dal Chilla", emoji: "🥞", desc: "Protein-rich savoury pancake" },
  { name: "Besan Chilla", emoji: "🥘", desc: "Gram flour + veggies" },
  { name: "Ragi Idli", emoji: "🍥", desc: "Steamed millet, easy to digest" },
  { name: "Mixed Millet Dosa", emoji: "🌾", desc: "Low-GI, crispy, filling" },
  { name: "Vegetable Oats", emoji: "🥣", desc: "Fibre + seasonal veggies" },
  { name: "Vegetable Dalia", emoji: "🍲", desc: "Cracked wheat porridge" },
  { name: "Poha with Peanuts", emoji: "🍚", desc: "Light, warm, satisfying" },
  { name: "Steamed Sprouts", emoji: "🌱", desc: "Plant protein + lemon" },
];

const commonSeasonal = {
  summer: {
    eat: ["Bel sharbat", "Sugarcane juice", "Cucumber", "Watermelon", "Coconut water", "Curd/Chaas"],
    reduce: ["Deep-fried", "Excess chillies", "Hot coffee", "Sour fermented"],
  },
  winter: {
    eat: ["Beetroot", "Carrot", "Sesame", "Ghee", "Millets (bajra/ragi)", "Warm soups"],
    reduce: ["Cold drinks", "Ice cream", "Raw salads"],
  },
  monsoon: {
    eat: ["Ginger tea", "Steamed vegetables", "Turmeric milk", "Warm khichdi"],
    reduce: ["Leafy raw salads", "Street food", "Curd at night"],
  },
};

const baseLifestyle = [
  "Eat mindfully — no screens.",
  "Chew each bite 20+ times.",
  "Walk 100 steps after meals.",
  "Avoid overeating — stop at 75%.",
  "Prefer seasonal, local foods.",
  "Keep regular meal timings.",
  "Finish dinner by sunset when possible.",
];

const baseAyurveda = [
  "Prefer satvik foods — fresh, warm, easy to digest.",
  "Eat with the season (ritucharya).",
  "2–3 meals a day is ideal.",
  "Avoid late-night eating — light dinner before sunset.",
  "Sit calmly, eat slowly, honour your food.",
];

function make(
  slug: string,
  title: string,
  emoji: string,
  gradient: string,
  short: string,
  bestFor: string,
  difficulty: Difficulty,
  overrides: Partial<JourneyContent> & Pick<JourneyContent, "lessons" | "principles" | "northStar" | "benefits" | "duration" | "evidence">,
): Journey {
  return {
    slug,
    title,
    emoji,
    gradient,
    short,
    bestFor,
    difficulty,
    content: {
      meals: {
        hydration: commonHydration,
        breakfast: commonBreakfast,
        miniMorning: ["Soaked almonds (5)", "Walnuts (2)", "Pumpkin seeds", "Seasonal fruit"],
        lunch: [
          "Millet roti + seasonal sabzi + dal + salad",
          "Brown rice + rajma + steamed veggies",
          "Quinoa pulao + curd (season-dependent)",
        ],
        evening: ["Roasted chana", "Peanuts", "Vegetable stir-fry", "Milk dalia", "Vegetable oats"],
        dinner: [
          "Millet roti + light sabzi + dal",
          "Moong khichdi + ghee",
          "Vegetable soup + toasted millet",
        ],
        water: "2.5–3 L, sipped warm through the day.",
      },
      seasonal: commonSeasonal,
      lifestyle: baseLifestyle,
      fasting: { benefits: ["Rests digestion", "Improves insulin sensitivity", "Cellular repair"], avoid: ["Pregnancy", "Underweight", "Active eating disorder"], recommended: "14:10" },
      ayurveda: baseAyurveda,
      ...overrides,
    },
  };
}

export const JOURNEYS: Journey[] = [
  make("weight-loss", "Weight Loss", "🔥", "var(--gradient-gold)", "Sustainable fat loss without crash diets.", "Kapha imbalance, higher BMI", "Moderate", {
    benefits: ["Steady fat loss", "Preserve muscle", "Improved energy"],
    duration: "8–16 weeks",
    evidence: "Well-studied",
    lessons: [
      { emoji: "⚖️", title: "Calories Explained", body: "Fat loss = small daily deficit sustained over weeks, not starvation." },
      { emoji: "💪", title: "Protein Priority", body: "0.8–1g per kg body weight preserves muscle while you lose fat." },
      { emoji: "🥗", title: "Satiety First", body: "Fibre + protein + water = feel full on fewer calories." },
      { emoji: "🚫", title: "Not Crash Dieting", body: "Aggressive cuts wreck metabolism, sleep and mood. Slow wins." },
      { emoji: "🏃", title: "Move Daily", body: "10k steps + 2 strength sessions beats hours of cardio." },
    ],
    principles: {
      eat: ["More protein", "Low-GI carbs", "Fibre-rich vegetables", "Healthy fats (ghee, nuts)", "Water"],
      avoid: ["Sugary drinks", "Refined flour", "Ultra-processed snacks", "Late-night meals"],
    },
    northStar: [
      { name: "Moong Dal", emoji: "🫘", benefit: "Plant protein", frequency: "Daily" },
      { name: "Millets", emoji: "🌾", benefit: "Low GI, fibre", frequency: "Daily" },
      { name: "Leafy greens", emoji: "🥬", benefit: "Volume, minerals", frequency: "Daily" },
      { name: "Curd/Chaas", emoji: "🥛", benefit: "Gut + protein", frequency: "Season-based" },
      { name: "Almonds", emoji: "🌰", benefit: "Satiety, fats", frequency: "Daily (5–7)" },
      { name: "Amla", emoji: "🍏", benefit: "Metabolism", frequency: "Daily" },
    ],
    fasting: { benefits: ["Simple deficit", "Better insulin sensitivity", "Less snacking"], avoid: ["Underweight", "Pregnancy", "Diabetes without supervision"], recommended: "14:10" },
  }),
  make("diabetes-friendly", "Diabetes Friendly", "🩸", "var(--gradient-clay)", "Steady blood sugar with low-GI Ayurvedic meals.", "Type 2 diabetes, pre-diabetes", "Moderate", {
    benefits: ["Fewer glucose spikes", "Better HbA1c trajectory", "Sustained energy"],
    duration: "Ongoing lifestyle",
    evidence: "Well-studied",
    lessons: [
      { emoji: "🩸", title: "What is Diabetes?", body: "Body struggles to use insulin — blood sugar stays high." },
      { emoji: "📈", title: "Why Sugar Spikes", body: "Refined carbs digest fast. Pair carbs with protein/fat to flatten spikes." },
      { emoji: "🌾", title: "Low GI Foods", body: "Millets, legumes, whole fruits keep glucose stable." },
      { emoji: "🥬", title: "Fibre Power", body: "Soluble fibre slows absorption of sugars." },
      { emoji: "🍽️", title: "Healthy Plate", body: "½ veggies, ¼ protein, ¼ whole grain." },
    ],
    principles: {
      eat: ["Millets", "Bitter gourd", "Methi", "Cinnamon", "Legumes", "Amla"],
      avoid: ["White sugar", "Fruit juice", "White rice in excess", "Refined flour"],
    },
    northStar: [
      { name: "Bitter Gourd", emoji: "🥒", benefit: "Lowers glucose", frequency: "3×/week" },
      { name: "Methi Seeds", emoji: "🌱", benefit: "Improves insulin sensitivity", frequency: "Daily soaked" },
      { name: "Millets", emoji: "🌾", benefit: "Low GI staple", frequency: "Daily" },
      { name: "Amla", emoji: "🍏", benefit: "Antioxidant", frequency: "Daily" },
      { name: "Cinnamon", emoji: "🪵", benefit: "Glycemic control", frequency: "1/4 tsp/day" },
    ],
    fasting: { benefits: ["Insulin sensitivity"], avoid: ["Insulin therapy without doctor guidance"], recommended: "12:12" },
  }),
  make("pcos", "PCOS", "🌸", "var(--gradient-violet)", "Balance hormones with insulin-friendly eating.", "PCOS, PCOD, irregular cycles", "Moderate", {
    benefits: ["Better cycles", "Reduced insulin resistance", "Skin & mood"],
    duration: "12+ weeks",
    evidence: "Well-studied",
    lessons: [
      { emoji: "⚗️", title: "Hormones 101", body: "PCOS = insulin resistance + androgen excess. Food strongly influences both." },
      { emoji: "🍚", title: "Insulin Resistance", body: "Low GI + protein-rich meals keep insulin calm." },
      { emoji: "🔥", title: "Inflammation", body: "Anti-inflammatory foods (turmeric, omega-3) reduce symptoms." },
      { emoji: "🥚", title: "Protein Priority", body: "Even distribution across the day helps blood sugar and satiety." },
      { emoji: "🧘", title: "Stress + Sleep", body: "Cortisol worsens PCOS — mind sleep and gentle movement." },
    ],
    principles: {
      eat: ["Flax seeds", "Cinnamon", "Millets", "Spearmint tea", "Leafy greens", "Nuts + seeds"],
      avoid: ["Sugary drinks", "White bread", "Excess dairy", "Ultra-processed"],
    },
    northStar: [
      { name: "Flax seeds", emoji: "🌰", benefit: "Lignans, hormone balance", frequency: "1 tbsp/day" },
      { name: "Cinnamon", emoji: "🪵", benefit: "Insulin sensitivity", frequency: "Daily" },
      { name: "Spearmint tea", emoji: "🍵", benefit: "Lowers androgens", frequency: "2 cups/day" },
      { name: "Pumpkin seeds", emoji: "🎃", benefit: "Zinc + magnesium", frequency: "Daily" },
    ],
    fasting: { benefits: ["Insulin sensitivity", "Weight regulation"], avoid: ["Amenorrhea, low body fat"], recommended: "14:10" },
  }),
  make("healthy-ageing", "Healthy Ageing", "🌿", "var(--gradient-sage)", "Nutrient-dense foods for longevity and vitality.", "40+, prevention focus", "Easy", {
    benefits: ["Muscle preservation", "Brain health", "Bone strength"],
    duration: "Lifelong",
    evidence: "Well-studied",
    lessons: [
      { emoji: "💪", title: "Sarcopenia", body: "Muscle loss accelerates after 40 — protein + strength are non-negotiable." },
      { emoji: "🧠", title: "Brain Foods", body: "Omega-3, ghee, walnuts, turmeric support cognition." },
      { emoji: "🦴", title: "Bones + Joints", body: "Calcium, vitamin D, weight-bearing movement." },
      { emoji: "🫐", title: "Antioxidants", body: "Colourful plants reduce inflammation and oxidative stress." },
    ],
    principles: {
      eat: ["Protein at every meal", "Turmeric + ghee", "Berries", "Walnuts", "Leafy greens"],
      avoid: ["Ultra-processed", "Excess sugar", "Sedentary snacking"],
    },
    northStar: [
      { name: "Turmeric", emoji: "🟡", benefit: "Anti-inflammatory", frequency: "Daily" },
      { name: "Walnuts", emoji: "🌰", benefit: "Omega-3, brain", frequency: "Daily" },
      { name: "Berries", emoji: "🫐", benefit: "Antioxidants", frequency: "3×/week" },
      { name: "Ghee", emoji: "🧈", benefit: "Absorption, joints", frequency: "1–2 tsp/day" },
    ],
    fasting: { benefits: ["Autophagy", "Insulin sensitivity"], avoid: ["Underweight", "Frailty"], recommended: "12:12" },
  }),
  make("anti-inflammatory", "Anti-inflammatory", "🌶️", "var(--gradient-leaf)", "Calm chronic inflammation with whole foods.", "Autoimmune, joint pain, skin", "Moderate", {
    benefits: ["Less pain & swelling", "Better recovery", "Clearer skin"],
    duration: "8–12 weeks",
    evidence: "Well-studied",
    lessons: [
      { emoji: "🔥", title: "Chronic Inflammation", body: "Low-grade inflammation drives many modern diseases." },
      { emoji: "🌿", title: "Golden Spices", body: "Turmeric, ginger, black pepper — daily, with fat." },
      { emoji: "🐟", title: "Omega-3s", body: "Flax, chia, walnuts (or fish) tilt inflammation down." },
      { emoji: "🍬", title: "Sugar & Ultra-processed", body: "The biggest inflammatory drivers to cut first." },
    ],
    principles: {
      eat: ["Turmeric + pepper", "Ginger", "Leafy greens", "Berries", "Extra virgin olive oil"],
      avoid: ["Refined sugar", "Trans fats", "Ultra-processed meats", "Excess alcohol"],
    },
    northStar: [
      { name: "Turmeric", emoji: "🟡", benefit: "Curcumin anti-inflammatory", frequency: "Daily" },
      { name: "Ginger", emoji: "🫚", benefit: "Anti-inflammatory", frequency: "Daily" },
      { name: "Leafy greens", emoji: "🥬", benefit: "Polyphenols", frequency: "Daily" },
      { name: "Flax + Chia", emoji: "🌰", benefit: "Omega-3 (ALA)", frequency: "1 tbsp/day" },
    ],
  }),
  make("fatty-liver", "Fatty Liver", "🫀", "var(--gradient-clay)", "Support the liver with bitter, astringent foods.", "NAFLD, elevated liver enzymes", "Moderate", {
    benefits: ["Lower liver fat", "Better enzymes"],
    duration: "12–24 weeks",
    evidence: "Well-studied",
    lessons: [
      { emoji: "🫀", title: "What is NAFLD?", body: "Fat accumulates in liver cells — often reversible with diet + movement." },
      { emoji: "🍬", title: "Fructose Load", body: "Sugary drinks and juices are the fastest liver-loaders." },
      { emoji: "🌿", title: "Bitter is Better", body: "Bitter gourd, methi and amla support liver detox pathways." },
    ],
    principles: {
      eat: ["Bitter gourd", "Amla", "Green tea", "Kulthi (horsegram)", "Millets"],
      avoid: ["Alcohol", "Sugary drinks", "Deep-fried", "Refined flour"],
    },
    northStar: [
      { name: "Amla", emoji: "🍏", benefit: "Antioxidant, liver-friendly", frequency: "Daily" },
      { name: "Bitter Gourd", emoji: "🥒", benefit: "Bitter → liver support", frequency: "3×/week" },
      { name: "Green tea", emoji: "🍵", benefit: "Catechins", frequency: "1–2 cups" },
    ],
  }),
  make("gut-health", "Gut Health", "🌱", "var(--gradient-leaf)", "Feed a happy microbiome — fibre, ferments, calm.", "Bloating, dysbiosis, low immunity", "Easy", {
    benefits: ["Better digestion", "Immunity", "Mood + skin"],
    duration: "4–8 weeks",
    evidence: "Well-studied",
    lessons: [
      { emoji: "🦠", title: "The Microbiome", body: "Trillions of microbes shape immunity, mood and metabolism." },
      { emoji: "🥛", title: "Fermented Foods", body: "Curd, chaas, idli, dosa, kanji feed beneficial bacteria." },
      { emoji: "🌾", title: "Prebiotic Fibre", body: "Onions, garlic, oats, bananas — food for your microbes." },
    ],
    principles: {
      eat: ["Curd/chaas", "Idli/dosa", "Kanji", "Cooked veggies", "Prebiotic fibres"],
      avoid: ["Antibiotics without need", "Ultra-processed", "Excess sugar"],
    },
    northStar: [
      { name: "Curd", emoji: "🥛", benefit: "Probiotic", frequency: "Daily (day)" },
      { name: "Chaas", emoji: "🥤", benefit: "Digestive", frequency: "After lunch" },
      { name: "Ginger", emoji: "🫚", benefit: "Agni booster", frequency: "Daily" },
    ],
  }),
  make("high-protein-veg", "High Protein Vegetarian", "🌱", "var(--gradient-sage)", "Hit 1g/kg protein without meat.", "Vegetarians, active adults", "Easy", {
    benefits: ["Muscle building", "Satiety", "Steady energy"],
    duration: "Lifestyle",
    evidence: "Well-studied",
    lessons: [
      { emoji: "🥚", title: "Complete Proteins", body: "Combine legumes + grains, or add dairy/paneer/eggs." },
      { emoji: "📏", title: "Portion Sizes", body: "20–30g protein per meal is the target." },
      { emoji: "🍶", title: "Whey / Plant Isolates", body: "Optional shortcut when whole-food protein is short." },
    ],
    principles: {
      eat: ["Dals & legumes", "Paneer / tofu", "Curd", "Sprouts", "Millets + rajma", "Nuts + seeds"],
      avoid: ["All-carb meals", "Empty snacks"],
    },
    northStar: [
      { name: "Paneer/Tofu", emoji: "🧀", benefit: "20g protein / 100g", frequency: "Daily" },
      { name: "Sprouts", emoji: "🌱", benefit: "Protein + enzymes", frequency: "Daily" },
      { name: "Dal", emoji: "🥣", benefit: "Complete with grain", frequency: "Daily" },
    ],
  }),
  make("heart-healthy", "Heart Healthy", "❤️", "var(--gradient-clay)", "Mediterranean × Ayurveda for cardio protection.", "High BP, cholesterol, prevention", "Easy", {
    benefits: ["Lower LDL", "Better BP", "Improved endothelial function"],
    duration: "Lifestyle",
    evidence: "Well-studied",
    lessons: [
      { emoji: "🫀", title: "Cholesterol 101", body: "It's a signal — inflammation + poor diet raise risk." },
      { emoji: "🧂", title: "Sodium & Potassium", body: "Cut ultra-processed. Add fruits & veggies." },
      { emoji: "🥜", title: "Healthy Fats", body: "Olive oil, ghee (moderate), nuts, seeds." },
    ],
    principles: {
      eat: ["Oats", "Olive oil", "Nuts", "Fruits", "Leafy greens", "Garlic"],
      avoid: ["Trans fats", "Excess salt", "Sugary drinks"],
    },
    northStar: [
      { name: "Oats", emoji: "🌾", benefit: "Beta-glucan → LDL", frequency: "Daily" },
      { name: "Walnuts", emoji: "🌰", benefit: "Omega-3", frequency: "Daily" },
      { name: "Garlic", emoji: "🧄", benefit: "BP + cholesterol", frequency: "Daily" },
    ],
  }),
  make("thyroid", "Thyroid Support", "🦋", "var(--gradient-violet)", "Nutrients your thyroid actually needs.", "Hypo/Hashimoto's, low energy", "Moderate", {
    benefits: ["Better energy", "Cycle regulation", "Weight regulation"],
    duration: "12+ weeks",
    evidence: "Emerging",
    lessons: [
      { emoji: "🦋", title: "Iodine + Selenium", body: "Micronutrient foundation for thyroid hormones." },
      { emoji: "🥬", title: "Cook Cruciferous", body: "Raw broccoli/cabbage in excess can interfere — cook them." },
      { emoji: "🌰", title: "Brazil Nuts", body: "1–2/day covers your selenium needs." },
    ],
    principles: {
      eat: ["Brazil nuts", "Cooked greens", "Coconut oil (cook)", "Moong dal"],
      avoid: ["Excess raw cruciferous", "Excess soy", "Ultra-processed"],
    },
    northStar: [
      { name: "Brazil nuts", emoji: "🌰", benefit: "Selenium", frequency: "1–2/day" },
      { name: "Moong dal", emoji: "🫘", benefit: "Easy protein", frequency: "Daily" },
      { name: "Cooked greens", emoji: "🥬", benefit: "Iron + folate", frequency: "Daily" },
    ],
  }),
  make("psoriasis", "Psoriasis", "✨", "var(--gradient-violet)", "Cool pitta, calm inflammation, love the gut.", "Skin flare-ups, autoimmune", "Advanced", {
    benefits: ["Fewer flare-ups", "Calmer skin"],
    duration: "12–24 weeks",
    evidence: "Traditional",
    lessons: [
      { emoji: "❄️", title: "Pacify Pitta", body: "Prefer cooling, sweet, bitter tastes over pungent/sour." },
      { emoji: "🦠", title: "Gut ↔ Skin", body: "Heal the gut and the skin often follows." },
      { emoji: "🚫", title: "Trigger Foods", body: "Alcohol, spicy, fried, nightshades in excess." },
    ],
    principles: {
      eat: ["Bitter gourd", "Neem tea (short courses)", "Bottle gourd", "Coconut", "Curd (day)"],
      avoid: ["Alcohol", "Fried", "Excess chillies", "Ultra-processed"],
    },
    northStar: [
      { name: "Neem", emoji: "🌿", benefit: "Blood purifier (traditional)", frequency: "As advised" },
      { name: "Bottle gourd", emoji: "🥒", benefit: "Cooling", frequency: "3×/week" },
      { name: "Coconut water", emoji: "🥥", benefit: "Hydration", frequency: "Daily" },
    ],
  }),
  make("ibs", "IBS", "🌾", "var(--gradient-sage)", "Soothe the gut with warm, simple, cooked meals.", "Bloating, IBS-D, IBS-C", "Moderate", {
    benefits: ["Less bloating", "Regular bowels", "Predictable digestion"],
    duration: "6–12 weeks",
    evidence: "Well-studied",
    lessons: [
      { emoji: "🍚", title: "Warm + Cooked", body: "Ayurveda's IBS answer: warm, simple, freshly cooked." },
      { emoji: "🧅", title: "Trigger Foods", body: "Raw onion/garlic, carbonated drinks, cold foods can trigger." },
      { emoji: "🌿", title: "Digestive Aids", body: "Cumin, fennel, ginger + buttermilk after lunch." },
    ],
    principles: {
      eat: ["Rice + ghee", "Buttermilk + cumin", "Moong khichdi", "Stewed apple"],
      avoid: ["Raw salads", "Carbonated drinks", "Excess raw onion/garlic"],
    },
    northStar: [
      { name: "Moong khichdi", emoji: "🥣", benefit: "Easy on gut", frequency: "As needed" },
      { name: "Buttermilk", emoji: "🥤", benefit: "Digestive", frequency: "After lunch" },
      { name: "Fennel tea", emoji: "🍵", benefit: "Reduces bloating", frequency: "Post meals" },
    ],
  }),
  make("seasonal", "Seasonal Nutrition", "🍂", "var(--gradient-dawn)", "Eat with the ritu — ancient wisdom, modern kitchen.", "Everyone, year-round", "Easy", {
    benefits: ["Natural immunity", "Better digestion", "Aligned energy"],
    duration: "Year-round",
    evidence: "Traditional",
    lessons: [
      { emoji: "☀️", title: "Ritucharya", body: "Body needs shift with seasons — food should too." },
      { emoji: "🌾", title: "Local + Seasonal", body: "Nature grows what your body needs this month." },
    ],
    principles: {
      eat: ["Whatever's in season locally", "Warm cooked in cold months", "Cooling in hot months"],
      avoid: ["Out-of-season imports as staples", "Cold in winter", "Hot spicy in summer"],
    },
    northStar: [
      { name: "Seasonal fruit", emoji: "🍎", benefit: "Nature's timing", frequency: "Daily" },
      { name: "Local grains", emoji: "🌾", benefit: "Regional harmony", frequency: "Daily" },
    ],
  }),
  make("vata", "Vata Balancing", "🍁", "var(--gradient-dawn)", "Warm, oily, grounding — for airy, mobile bodies.", "Vata prakriti or imbalance", "Easy", {
    benefits: ["Grounded energy", "Better sleep", "Regular digestion"],
    duration: "Lifestyle",
    evidence: "Traditional",
    lessons: [
      { emoji: "🌬️", title: "Vata Qualities", body: "Light, dry, cold, mobile — food must be the opposite." },
      { emoji: "🍯", title: "Warm & Sweet", body: "Cooked grains, root veggies, warm milk, ghee." },
    ],
    principles: {
      eat: ["Warm cooked oats", "Ghee", "Sweet potato", "Moong dal", "Warm milk + cardamom"],
      avoid: ["Raw salads", "Cold drinks", "Dry crackers", "Carbonated"],
    },
    northStar: [
      { name: "Ghee", emoji: "🧈", benefit: "Grounding, lubricating", frequency: "Daily" },
      { name: "Sweet potato", emoji: "🍠", benefit: "Warm sweet", frequency: "3×/week" },
      { name: "Almonds", emoji: "🌰", benefit: "Nourishing", frequency: "5–7/day" },
    ],
  }),
  make("pitta", "Pitta Balancing", "🌞", "var(--gradient-gold)", "Cool, sweet, mildly bitter — for fiery bodies.", "Pitta prakriti or imbalance", "Easy", {
    benefits: ["Calm skin", "Steady mood", "Clear digestion"],
    duration: "Lifestyle",
    evidence: "Traditional",
    lessons: [
      { emoji: "🔥", title: "Pitta Qualities", body: "Hot, sharp, oily — food should cool and soften." },
      { emoji: "🥒", title: "Cool + Sweet", body: "Coconut water, cucumber, sweet fruits, ghee." },
    ],
    principles: {
      eat: ["Coconut water", "Cucumber", "Sweet ripe fruit", "Coriander", "Fennel", "Basmati rice"],
      avoid: ["Chillies", "Deep-fried", "Sour ferments", "Tomato + vinegar combos"],
    },
    northStar: [
      { name: "Coconut water", emoji: "🥥", benefit: "Cooling", frequency: "Daily (summer)" },
      { name: "Cucumber", emoji: "🥒", benefit: "Cooling", frequency: "Daily" },
      { name: "Basmati rice", emoji: "🍚", benefit: "Sattvic", frequency: "Daily" },
    ],
  }),
  make("kapha", "Kapha Balancing", "🌱", "var(--gradient-leaf)", "Light, warm, spiced — for grounded, heavy bodies.", "Kapha prakriti or imbalance", "Moderate", {
    benefits: ["Lightness", "Better metabolism", "Clear sinuses"],
    duration: "Lifestyle",
    evidence: "Traditional",
    lessons: [
      { emoji: "🌊", title: "Kapha Qualities", body: "Heavy, cool, moist — food should be light, warm, dry, spiced." },
      { emoji: "🌶️", title: "Warm Spices", body: "Ginger, black pepper, turmeric wake up digestion." },
    ],
    principles: {
      eat: ["Barley", "Millets (ragi/bajra)", "Ginger tea", "Leafy greens", "Raw honey", "Mung soup"],
      avoid: ["Cheese", "Fried snacks", "Iced drinks", "Excess wheat", "Bananas"],
    },
    northStar: [
      { name: "Ginger tea", emoji: "🍵", benefit: "Kindles agni", frequency: "Daily" },
      { name: "Ragi/Bajra", emoji: "🌾", benefit: "Warming, light", frequency: "Daily" },
      { name: "Mung soup", emoji: "🥣", benefit: "Light protein", frequency: "Daily" },
    ],
  }),
  make("busy-professional", "Busy Professional", "💼", "var(--gradient-hero)", "Real food, real hours — 15-min meals, batch friendly.", "Long work days, meetings", "Easy", {
    benefits: ["Predictable energy", "No 3pm crash", "Sustainable habits"],
    duration: "Ongoing",
    evidence: "Traditional",
    lessons: [
      { emoji: "📅", title: "Prep, Don't Cook", body: "Batch dals, grains, and cut veggies once a week." },
      { emoji: "☕", title: "Coffee, then Food", body: "Never coffee on an empty stomach — pair with protein." },
      { emoji: "🥣", title: "One-bowl Meals", body: "Grain + protein + veggie in one bowl saves time." },
    ],
    principles: {
      eat: ["Batch-cooked dals", "Overnight oats", "Sprouts", "Chaas", "Fruits at desk"],
      avoid: ["Vending snacks", "Delivery UPFs", "Skipping breakfast"],
    },
    northStar: [
      { name: "Overnight oats", emoji: "🥣", benefit: "Grab-and-go", frequency: "Daily" },
      { name: "Sprout jars", emoji: "🌱", benefit: "Protein + prep-ahead", frequency: "3×/week" },
      { name: "Fruit bowl", emoji: "🍎", benefit: "Desk snack", frequency: "Daily" },
    ],
  }),
  make("travel-friendly", "Travel Friendly", "✈️", "var(--gradient-water)", "Stay balanced across time zones and airport food.", "Frequent travellers", "Moderate", {
    benefits: ["Steady digestion", "Less bloating", "Better sleep on the move"],
    duration: "Per trip",
    evidence: "Traditional",
    lessons: [
      { emoji: "✈️", title: "Vata on the Move", body: "Travel spikes vata — go extra warm, oily, grounding." },
      { emoji: "💧", title: "Hydration", body: "1 cup water per hour of flight; skip alcohol." },
      { emoji: "🍱", title: "Pack Wisely", body: "Roasted chana, khakhra, nuts, dates, fruit." },
    ],
    principles: {
      eat: ["Warm cooked meals when possible", "Nuts + dates", "Chaas / warm water"],
      avoid: ["Cold sandwiches as staple", "Alcohol on flights", "Excess coffee"],
    },
    northStar: [
      { name: "Dates + Nuts", emoji: "🌰", benefit: "Grounding travel snack", frequency: "Daily" },
      { name: "Khakhra", emoji: "🫓", benefit: "Light + portable", frequency: "As needed" },
      { name: "Ginger tea", emoji: "🍵", benefit: "Anti-nausea", frequency: "As needed" },
    ],
  }),
];

export function getJourney(slug: string): Journey | undefined {
  return JOURNEYS.find((j) => j.slug === slug);
}
