// Ayurvedic / lifestyle tips per condition. Keys must match labels in
// the DISEASES array used by /combined-plan.
export const DISEASE_TIPS: Record<string, string[]> = {
  "Diabetes": [
    "Eat between 9am and 7pm, never too early or too late",
    "Drink warm water with a pinch of cinnamon before meals",
    "Walk 100–200 steps after every meal",
    "Daily 3–4 km brisk walk; avoid afternoon naps",
    "Bitter foods help: methi water, karela, neem, jamun",
    "Replace refined sugar with small amounts of jaggery / dates",
    "Sleep by 10pm; poor sleep spikes fasting sugar",
  ],
  "Hypertension": [
    "Cut packaged & deep-fried food; salt < 5g/day",
    "Daily 20 min pranayama: anulom-vilom + bhramari",
    "Soak 5 almonds + 2 walnuts overnight, eat in morning",
    "Garlic on empty stomach (1 pod) + arjuna bark tea",
    "Sleep 7–8 hrs; avoid screens after 10pm",
    "Walk 30–45 min, no heavy weights",
  ],
  "PCOS / PCOD": [
    "16:8 IF helps regulate insulin & androgens",
    "Cut dairy & refined sugar for 8 weeks, then reassess",
    "Spearmint tea 2x/day, methi seed water at night",
    "Strength train 3x/week + 20 min surya namaskar daily",
    "Sleep by 10:30pm — cortisol fixes period cycle",
    "Seed cycling: flax+pumpkin (day 1–14), sesame+sunflower (day 15–28)",
  ],
  "Thyroid": [
    "Avoid raw cruciferous (cabbage/cauliflower) if hypo",
    "Coconut, ghee & ashwagandha support thyroid",
    "20 min sun + 5 min ujjayi pranayama daily",
    "Take thyroid meds on empty stomach, wait 45 min before tea/coffee",
    "Selenium-rich foods: brazil nuts, sunflower seeds",
  ],
  "IBS / Gut issues": [
    "Eat between 9am and 7pm; close dinner by 8pm",
    "Drink warm water first before any meal",
    "Triphala 1 tsp in warm water at night",
    "Avoid milk + heavy fat combinations",
    "Walk 100–200 steps after meals",
    "Eat laxative, fibre-rich foods (papaya, soaked raisins)",
    "12 hr gap between dinner and next morning's first meal",
    "Skip cold drinks & raw salads at night",
  ],
  "Obesity": [
    "Lukewarm water with lemon + honey first thing",
    "Largest meal at lunch, lightest dinner by 7:30pm",
    "Daily 45 min brisk walk + 15 min surya namaskar",
    "Cut wheat & dairy for 6 weeks — reintroduce slowly",
    "Triphala + guggul at night (consult vaidya for dose)",
    "Sleep 7+ hrs — sleep debt = weight gain",
  ],
  "High cholesterol": [
    "Arjuna bark tea once a day",
    "1 tbsp ground flaxseed daily",
    "Replace refined oil with cold-pressed mustard / ghee (small amounts)",
    "30–45 min cardio 5x/week",
    "Soaked almonds + walnuts in the morning",
    "Avoid bakery items, deep-fried & vanaspati",
  ],
  "Fatty liver": [
    "Zero alcohol, zero added sugar for 12 weeks",
    "Bhumi amla + kutki under guidance",
    "Eat between 10am and 7pm (14:10 IF)",
    "Bitter greens daily: methi, palak, karela",
    "Walk 8–10k steps a day",
  ],
  "Acidity / GERD": [
    "Don't lie down for 2 hrs after meals",
    "Coconut water + soaked saunf after meals",
    "Avoid tea/coffee on empty stomach",
    "Skip chilli, vinegar, fermented foods",
    "Eat slowly, chew 20+ times per bite",
    "Sheetali pranayama 5 min twice a day",
  ],
  "Migraine": [
    "Never skip meals — Vata dryness triggers migraine",
    "Nasya: 2 drops anu-tail in each nostril mornings",
    "Sleep & wake at the same time daily",
    "Avoid cheese, chocolate, red wine, MSG",
    "Hydrate: 2.5–3 L water + coconut water",
    "Shitali / bhramari pranayama at first warning sign",
  ],
  "Kidney stones": [
    "Drink 3–4 L water daily — most powerful prevention",
    "Avoid high-oxalate foods: spinach, beetroot, chocolate, nuts",
    "Pattharchatta (Bryophyllum) leaf juice 30ml on empty stomach",
    "1–2 tsp apple cider vinegar in warm water daily",
    "Lemon water daily — citrate dissolves small stones",
    "Cut salt, red meat & cola-type drinks",
  ],
  "Bloating": [
    "Eat between 9am and 7pm; don't eat too early or too late",
    "Drink warm water before each meal",
    "Triphala 1 tsp in warm water at bedtime",
    "Avoid heavy-fat dairy (whole milk, cream)",
    "Skip foods that take long to digest (cheese, fried, leftovers)",
    "Walk 100–200 steps after every meal",
    "Daily 3–4 km walk",
    "Laxative, high-fibre foods (papaya, oats, soaked raisins)",
    "Proper sleep — bed by 10:30pm",
    "Close dinner by 8–8:30pm",
    "12 hr gap between dinner and next morning's first meal",
  ],
};

export const GENERIC_TIPS: string[] = [
  "Sip warm water through the day",
  "Eat fresh, warm, home-cooked food",
  "Walk 100 steps after every meal",
  "Sleep & wake at the same time daily",
  "10 min pranayama every morning",
];

export function tipsFor(conditions: string[], otherText?: string): string[] {
  const set = new Set<string>();
  conditions.forEach((c) => {
    const t = DISEASE_TIPS[c];
    if (t) t.forEach((x) => set.add(x));
  });
  // crude keyword match for "other"
  if (otherText) {
    const o = otherText.toLowerCase();
    Object.entries(DISEASE_TIPS).forEach(([k, arr]) => {
      if (o.includes(k.toLowerCase().split(" ")[0])) arr.forEach((x) => set.add(x));
    });
  }
  if (set.size === 0) GENERIC_TIPS.forEach((x) => set.add(x));
  return Array.from(set);
}
