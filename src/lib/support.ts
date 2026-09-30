// Per-goal supportive therapies (detox / fasting / meditation / herbs) + IF eligibility.
// Shared by the Create-my-plan wizard and the saved-plan page. Info is supportive
// lifestyle guidance, shown only where relevant to the goal.

export type SupportInfo = {
  ifEligible?: boolean;
  detox?: { type: string; home: string[] };
  fasting?: string;
  meditation?: string;
  herbs?: string[];
};

const JOINT: SupportInfo = {
  detox: { type: "Warm-oil Abhyanga", home: ["Warm sesame / Mahanarayan oil massage 3×/week", "Hot fomentation on the stiff area", "A warm bath after; keep the joint warm"] },
  herbs: ["Turmeric + black pepper daily", "Shallaki (boswellia)", "Nirgundi oil externally", "Ashwagandha at night"],
};

export const SUPPORT: Record<string, SupportInfo> = {
  "general-wellness": { meditation: "10 min of daily breathwork keeps mind & body in balance.", herbs: ["Chyawanprash 1 tsp AM", "Triphala at night", "Amla daily"] },
  "healthy-ageing": { meditation: "Daily meditation protects memory, mood and sleep as you age.", herbs: ["Chyawanprash", "Ashwagandha", "Brahmi for the mind"] },
  stress: { meditation: "The core practice — Bhramari, Yoga Nidra and slow breathing daily.", herbs: ["Ashwagandha at night", "Brahmi", "Jatamansi tea in the evening"] },
  "better-sleep": { meditation: "Yoga Nidra & a body-scan before bed help you fall asleep faster.", herbs: ["Ashwagandha with warm milk at night", "Nutmeg (jaiphal) in warm milk", "Tagara / Jatamansi (vaidya)"] },
  "weight-loss": { ifEligible: true, detox: { type: "Weekly kapha reset", home: ["A light moong-khichdi day", "CCF (cumin-coriander-fennel) tea through the day", "Warm dry-brushing in the morning"] }, fasting: "16:8 time-restricted eating pairs well with weight loss.", herbs: ["Triphala at night", "Warm lemon water on waking", "Methi (fenugreek) water"] },
  obesity: { ifEligible: true, detox: { type: "Weekly kapha reset", home: ["A moong-khichdi + steamed-veg day", "CCF tea through the day"] }, fasting: "A weekly ekadashi-style liquid fast plus gradual 16:8 supports weight loss.", herbs: ["Triphala at night", "Warm lemon-honey water AM"] },
  metabolic: { ifEligible: true, detox: { type: "Light kapha reset", home: ["A khichdi day", "CCF tea"] }, fasting: "16:8 improves insulin sensitivity.", herbs: ["Methi water", "Cinnamon in warm water", "Triphala"] },
  diabetes: { ifEligible: true, detox: { type: "Weekly kapha reset", home: ["A day on moong khichdi + steamed veg", "CCF tea through the day", "Warm dry-brushing in the morning"] }, fasting: "A gentle 14:10 window can steady blood sugar — with your doctor's ok if you're on medication.", meditation: "Daily calm lowers cortisol, which helps blood-sugar control.", herbs: ["Methi water on waking", "Jamun seed powder", "Gudmar / Vijaysar", "Cinnamon"] },
  "fatty-liver": { ifEligible: true, detox: { type: "3-day liver reset", home: ["Day 1: fruit + veg juice + warm water", "Day 2–3: moong khichdi + steamed veg", "CCF tea + kutki through the day"] }, fasting: "16:8 fasting is one of the fastest ways to reverse early fatty liver.", herbs: ["Bhumi amla juice AM", "Kutki at night (consult a vaidya)", "Amla juice on waking", "Black coffee (protective)"] },
  cholesterol: { ifEligible: true, detox: { type: "Liver-support reset", home: ["A light day on fruit + veg juice", "Warm lemon water"] }, fasting: "14:10–16:8 windows help lipids; ease in gradually.", herbs: ["1 tbsp ground flax daily", "Arjuna bark tea", "Soaked almonds + walnuts"] },
  hypertension: { detox: { type: "Pitta-calming reset", home: ["A low-salt kitchari day", "Extra rest + slow breathing"] }, meditation: "Bhramari + slow breathing twice daily measurably lowers BP.", herbs: ["Arjuna bark tea", "Ashwagandha at night", "1 garlic pod on empty stomach", "Lauki (bottle gourd) juice"] },
  heart: { ifEligible: true, fasting: "A gentle 14:10 window (doctor's ok if on meds).", meditation: "10 min of meditation twice a day is heart-protective.", herbs: ["Arjuna bark tea", "Ground flax", "1 garlic pod AM"] },
  thyroid: { meditation: "Calming practice steadies the nervous system behind thyroid swings.", herbs: ["Ashwagandha with warm milk at night", "Coriander-seed water AM", "2 brazil nuts (selenium)"] },
  migraine: { detox: { type: "Pitta-cooling reset", home: ["A light kitchari day with cooling veg", "Rose-water spray + foot massage in the evening", "No fried / fermented food that day"] }, meditation: "Bhramari & Yoga Nidra raise your threshold and cut attack frequency.", herbs: ["Brahmi in warm water AM", "Jatamansi tea at night", "Ginger tea at first sign", "Nasya: ghee drops in the nostrils"] },
  asthma: { detox: { type: "Lung-clear routine", home: ["Steam with ajwain once daily", "Tulsi tea 2×/day", "Turmeric + mulethi milk at night"] }, meditation: "Slow diaphragmatic breathing eases the airways.", herbs: ["Tulsi leaves AM", "Mulethi (licorice) tea", "Sitopaladi churna with honey", "Chyawanprash"] },
  gout: { detox: { type: "Hydrating low-purine reset", home: ["A day on plenty of water + barley water", "Low-purine foods; cherries / celery"] }, herbs: ["Giloy (guduchi)", "Punarnava", "Water + lemon through the day"] },
  gut: { ifEligible: true, detox: { type: "Agni reset", home: ["A day on warm moong khichdi", "Ginger + rock salt before meals", "Saunf after meals"] }, fasting: "Skipping a meal when not hungry, or a weekly light fast, resets agni.", meditation: "A few calm breaths before meals aids digestion.", herbs: ["Triphala at night", "Hingvashtak before meals", "Jeera-saunf-ajwain tea"] },
  "acidity-gerd": { herbs: ["Avipattikar churna (consult a vaidya)", "Cold milk / coconut water", "Amla", "Don't leave long gaps between meals"] },
  ibs: { meditation: "Gut-directed relaxation calms an over-reactive gut.", herbs: ["Triphala (gentle)", "Buttermilk with jeera", "Isabgol (psyllium husk)"] },
  constipation: { herbs: ["Triphala at night with warm water", "Warm water on waking", "Soaked raisins / figs", "Ghee in warm milk at night"] },
  indigestion: { herbs: ["Ginger + rock salt before meals", "Hingvashtak churna", "Saunf after meals"] },
  "pcos-pcod": { ifEligible: true, detox: { type: "Light kapha reset", home: ["A khichdi day", "Spearmint tea 2×/day"] }, fasting: "16:8 can help the insulin resistance behind PCOS.", meditation: "Lowering stress helps the hormonal balance behind PCOS.", herbs: ["Shatavari", "Spearmint tea", "Cinnamon", "Ashwagandha at night"] },
  menopause: { meditation: "Breathwork eases hot flashes, mood swings and sleep.", herbs: ["Shatavari", "Ashwagandha", "Soy / flax (phytoestrogens)"] },
  pregnancy: { meditation: "Gentle breathing & Yoga Nidra calm you and the baby.", herbs: ["Only with your doctor's guidance"] },
  "post-natal": { meditation: "Short calm breaks support mood and recovery.", herbs: ["Shatavari", "Methi & gond ladoo (traditional)", "Ajwain water"] },
  arthritis: JOINT, osteoarthritis: JOINT, "knee-pain": JOINT, "hip-pain": JOINT, "back-pain": JOINT, "neck-pain": JOINT, sciatica: JOINT,
  osteoporosis: { herbs: ["Sesame / ragi (calcium)", "Ashwagandha", "Vitamin D + morning sunlight"] },
};

export function supportFor(id: string): SupportInfo | undefined { return SUPPORT[id]; }

/** Short, non-crowded explanatory copy reused by the wizard and the plan page. */
export const IF_BENEFITS = [
  "Gives your gut & insulin a daily rest",
  "Supports fat-burning and steadier energy",
  "Simple — just an eating window, no calorie counting",
];
export const DETOX_INTRO = "A short, gentle reset to clear ama (build-up) and rekindle digestion. The steps below you can do at home; deeper cleanses — Panchakarma — are best done at an Ayurveda centre.";
export const FASTING_INTRO = "Traditional fasting (upvas) rests the system and sharpens agni. Start light and build up — never push through dizziness. You can begin whenever you feel ready.";
export const MEDITATION_INTRO = "A few minutes of daily breathwork and stillness. Start whenever you like — even 5 minutes helps.";
export const HERBS_INTRO = "Supportive Ayurvedic herbs & home remedies (nuskhe). Introduce one at a time; check with a vaidya before combining, especially if you're on medication.";
