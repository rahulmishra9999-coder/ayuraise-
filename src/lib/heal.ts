import {
  Droplet,
  Activity,
  HeartPulse,
  Wind,
  Brain,
  Bed,
  Scale,
  Salad,
  Flower2,
  Dumbbell,
  Hourglass,
  Sparkles,
  Stethoscope,
  Bone,
  Heart,
  Zap,
  Leaf,
  CircleDot,
  Waves,
  type LucideIcon,
} from "lucide-react";
import { DISEASE_TIPS } from "./disease-tips";

export interface HealthGoal {
  slug: string;
  title: string;
  short: string;
  icon: LucideIcon;
  gradient: string;
  blurb: string;
  matchKey?: string; // key in DISEASE_TIPS
}

export const HEALTH_GOALS: HealthGoal[] = [
  { slug: "diabetes", title: "Manage Diabetes", short: "Diabetes", icon: Droplet, gradient: "var(--gradient-clay)", blurb: "Steady sugars with kapha-pacifying meals, IF, walking and bitters.", matchKey: "Diabetes" },
  { slug: "hypertension", title: "Manage Hypertension", short: "BP", icon: Activity, gradient: "var(--gradient-dawn)", blurb: "Bring BP into range with pranayam, low-salt meals and stress work.", matchKey: "Hypertension" },
  { slug: "pcod", title: "Manage PCOD", short: "PCOD", icon: CircleDot, gradient: "var(--gradient-violet)", blurb: "Regulate cycles via insulin-friendly food, strength & seed cycling.", matchKey: "PCOS / PCOD" },
  { slug: "fatty-liver", title: "Manage Fatty Liver", short: "Liver", icon: Leaf, gradient: "var(--gradient-sage)", blurb: "Reverse fatty liver with bitters, zero sugar and gentle detox.", matchKey: "Fatty liver" },
  { slug: "asthma", title: "Manage Asthma", short: "Asthma", icon: Wind, gradient: "var(--gradient-water)", blurb: "Ease breath with pranayam, warm sattvic food and vasa/tulsi.", },
  { slug: "thyroid", title: "Manage Thyroid", short: "Thyroid", icon: Zap, gradient: "var(--gradient-gold)", blurb: "Support thyroid with ashwagandha, selenium foods and yoga.", matchKey: "Thyroid" },
  { slug: "arthritis", title: "Manage Arthritis", short: "Arthritis", icon: Bone, gradient: "var(--gradient-clay)", blurb: "Reduce joint pain with warm oils, gentle mobility and anti-vata food.", },
  { slug: "knee-pain", title: "Manage Knee Pain", short: "Knees", icon: Bone, gradient: "var(--gradient-clay)", blurb: "Rebuild knees with strength, oil massage and turmeric-milk protocols.", },
  { slug: "heart", title: "Improve Heart Health", short: "Heart", icon: Heart, gradient: "var(--gradient-clay)", blurb: "Protect the heart with arjuna, cardio, meditation and clean fats.", },
  { slug: "lungs", title: "Improve Lungs Health", short: "Lungs", icon: Wind, gradient: "var(--gradient-water)", blurb: "Expand lung capacity with pranayam, steam and tulsi/mulethi.", },
  { slug: "brain", title: "Improve Brain Health", short: "Brain", icon: Brain, gradient: "var(--gradient-violet)", blurb: "Sharpen focus with brahmi, meditation, sleep and nasya.", },
  { slug: "kidney", title: "Improve Kidney Health", short: "Kidney", icon: Droplet, gradient: "var(--gradient-water)", blurb: "Care for kidneys with hydration, punarnava and low-salt meals.", matchKey: "Kidney stones" },
  { slug: "sleep", title: "Improve Sleep", short: "Sleep", icon: Bed, gradient: "var(--gradient-night)", blurb: "Deeper sleep with abhyanga, warm milk, screen curfew and bhramari.", },
  { slug: "obesity", title: "Manage Obesity", short: "Obesity", icon: Scale, gradient: "var(--gradient-gold)", blurb: "Kapha-pacifying food, IF, brisk walks and triphala.", matchKey: "Obesity" },
  { slug: "weight", title: "Weight Loss / Gain", short: "Weight", icon: Scale, gradient: "var(--gradient-gold)", blurb: "Set a target and pace; combine diet, IF, yoga & strength.", },
  { slug: "gut", title: "Improve Gut Health", short: "Gut", icon: Salad, gradient: "var(--gradient-sage)", blurb: "Repair digestion with triphala, warm meals and mindful eating.", matchKey: "IBS / Gut issues" },
  { slug: "cholesterol", title: "Manage Cholesterol", short: "Cholesterol", icon: Waves, gradient: "var(--gradient-leaf)", blurb: "Lower LDL with arjuna, flax, cardio and clean fats.", matchKey: "High cholesterol" },
];

export interface Practice {
  slug: string;
  title: string;
  icon: LucideIcon;
  gradient: string;
  route: string;
}

export const PRACTICES: Practice[] = [
  { slug: "yoga", title: "Yoga", icon: Flower2, gradient: "var(--gradient-leaf)", route: "/section/yoga" },
  { slug: "meditation", title: "Meditation", icon: Brain, gradient: "var(--gradient-violet)", route: "/section/yoga" },
  { slug: "exercise", title: "Exercise", icon: Dumbbell, gradient: "var(--gradient-clay)", route: "/section/exercise" },
  { slug: "diet", title: "Diet", icon: Salad, gradient: "var(--gradient-sage)", route: "/section/diet" },
  { slug: "if", title: "Intermittent Fasting", icon: Hourglass, gradient: "var(--gradient-dawn)", route: "/section/fasting" },
  { slug: "fasting", title: "Fasting", icon: Hourglass, gradient: "var(--gradient-gold)", route: "/section/fasting" },
  { slug: "detox", title: "Detox", icon: Sparkles, gradient: "var(--gradient-water)", route: "/section/detox" },
];

export interface GoalContent {
  best: string[];
  yoga: string[];
  meditation: string[];
  exercise: string[];
  diet: string[];
  if: string[];
  fasting: string[];
  detox: string[];
  herbs: string[];
  nuskhe: string[];
  aushadi: string[];
}

const DEFAULT_MED = ["10 min anapana / breath awareness", "Yoga Nidra 20 min at 3pm or bedtime", "Bhramari 5 rounds to calm nervous system"];
const DEFAULT_EX = ["30–45 min brisk walk daily", "2× strength sessions per week", "10 min mobility drills every morning"];
const DEFAULT_DETOX = ["3-day kitchari reset every change of season", "Warm oil abhyanga 2× a week", "Herbal tea: CCF (cumin-coriander-fennel) through the day"];

function base(slug: string, over: Partial<GoalContent>): GoalContent {
  const g = HEALTH_GOALS.find((x) => x.slug === slug)!;
  const tips = g.matchKey ? DISEASE_TIPS[g.matchKey] ?? [] : [];
  return {
    best: over.best ?? (tips.length ? tips : ["Warm, freshly cooked meals", "Sleep by 10:30pm", "Walk 100 steps after every meal"]),
    yoga: over.yoga ?? ["Surya Namaskar × 6", "Anulom Vilom 10 min", "Shavasana 10 min"],
    meditation: over.meditation ?? DEFAULT_MED,
    exercise: over.exercise ?? DEFAULT_EX,
    diet: over.diet ?? ["Prakriti + season aligned meals", "Cut refined sugar & maida", "Largest meal at lunch"],
    if: over.if ?? ["Start with 12:12, progress to 14:10 / 16:8", "Break fast with warm water + soaked nuts"],
    fasting: over.fasting ?? ["Weekly ekadashi liquid fast", "Monthly 24hr water/juice fast (under guidance)"],
    detox: over.detox ?? DEFAULT_DETOX,
    herbs: over.herbs ?? ["Triphala", "Ashwagandha", "Tulsi"],
    nuskhe: over.nuskhe ?? ["Warm water + lemon on waking", "Ginger-honey for digestion", "Turmeric milk at night"],
    aushadi: over.aushadi ?? ["Chyawanprash 1 tsp AM", "Triphala churna 1 tsp PM"],
  };
}

export const GOAL_CONTENT: Record<string, GoalContent> = {
  diabetes: base("diabetes", {
    yoga: ["Mandukasana 5 min", "Ardha Matsyendrasana", "Kapalbhati 5 min", "Bhastrika 3 rounds"],
    exercise: ["Post-meal 15 min walk × 3", "Resistance training 3×/wk", "Daily 8–10k steps"],
    diet: ["Low GI: millets, oats, sprouts", "Bitter foods: methi, karela, jamun", "Avoid refined sugar & white rice"],
    if: ["16:8 works well for T2D", "Eat between 9am–5pm", "Break fast with cinnamon water"],
    fasting: ["Weekly 24hr liquid fast under supervision", "Ekadashi upvas"],
    herbs: ["Jamun seed powder", "Methi seeds", "Vijaysar", "Gudmar"],
    nuskhe: ["Methi water overnight-soak", "Cinnamon in warm water pre-meal", "Karela juice on empty stomach"],
    aushadi: ["Madhunashini vati", "Vasant Kusumakar Ras (vaidya)"],
  }),
  hypertension: base("hypertension", {
    yoga: ["Shavasana 15 min", "Anulom Vilom 15 min", "Bhramari 7 rounds", "Avoid inversions"],
    exercise: ["Walk 30–45 min daily", "Swimming / cycling; no heavy weights"],
    diet: ["Salt < 5g/day", "Cut packaged & fried food", "Potassium: banana, coconut water"],
    if: ["Gentle 12:12 or 14:10", "Avoid long fasts if on BP meds"],
    fasting: ["Not advised without doctor sign-off"],
    herbs: ["Arjuna", "Sarpagandha (vaidya)", "Ashwagandha"],
    nuskhe: ["Garlic pod on empty stomach", "Soaked almonds + walnuts AM", "Arjuna bark tea"],
    aushadi: ["Arjunarishta 15ml BD", "Mukta Vati (vaidya)"],
  }),
  pcod: base("pcod", {
    yoga: ["Baddha Konasana", "Malasana", "Bhujangasana", "Surya Namaskar × 12"],
    exercise: ["Strength train 3×/wk", "20 min HIIT 2×/wk", "Daily walk"],
    diet: ["Cut dairy & refined sugar 8 wks", "High-protein breakfast", "Seed cycling"],
    if: ["16:8 helps insulin & androgens", "Skip late dinners"],
    fasting: ["Ekadashi liquid fast weekly"],
    herbs: ["Shatavari", "Ashoka", "Ashwagandha", "Spearmint"],
    nuskhe: ["Methi seed water at night", "Spearmint tea 2×/day", "Cinnamon in oats"],
    aushadi: ["Ashokarishta 15ml BD", "Kanchanar Guggulu"],
  }),
  "fatty-liver": base("fatty-liver", {
    yoga: ["Dhanurasana", "Ardha Matsyendrasana", "Kapalbhati 10 min"],
    exercise: ["8–10k steps daily", "Strength 2×/wk"],
    diet: ["Zero alcohol & added sugar 12 wks", "Bitter greens: methi, palak, karela", "14:10 eating window"],
    if: ["14:10 → 16:8 progressively"],
    fasting: ["Weekly juice fast (bottle gourd / amla)"],
    herbs: ["Bhumi Amla", "Kutki", "Punarnava", "Kalmegh"],
    nuskhe: ["Amla juice 30ml AM", "Warm water + lemon on waking"],
    aushadi: ["Liv-52", "Arogyavardhini Vati (vaidya)"],
  }),
  asthma: base("asthma", {
    best: ["Warm, freshly cooked food; avoid cold/fermented", "Steam inhalation with ajwain 1×/day", "Nasya with anu tail 2 drops each nostril AM", "Avoid dust, cold water, banana at night"],
    yoga: ["Bhastrika (gentle)", "Anulom Vilom", "Bhujangasana", "Ustrasana"],
    exercise: ["Brisk walk in clean air", "Swimming builds lung capacity"],
    diet: ["Warm sattvic meals", "Ginger-tulsi tea 2×/day", "Avoid curd at night, banana, cold drinks"],
    if: ["Light 12:12; avoid dry long fasts"],
    fasting: ["Not recommended during flare-ups"],
    herbs: ["Vasa", "Tulsi", "Mulethi", "Pippali"],
    nuskhe: ["Honey + black pepper + tulsi juice", "Steam with ajwain", "Turmeric milk at night"],
    aushadi: ["Sitopaladi churna 1 tsp with honey", "Vasavaleha", "Kanakasava"],
  }),
  thyroid: base("thyroid", {
    yoga: ["Sarvangasana", "Halasana", "Matsyasana", "Ujjayi pranayama 10 min"],
    exercise: ["Moderate cardio 30 min", "Strength 2×/wk"],
    diet: ["Avoid raw cruciferous if hypo", "Coconut, ghee, brazil nuts", "Cook cruciferous well"],
    if: ["Gentle 12:12; take meds first"],
    fasting: ["Long fasts not advised"],
    herbs: ["Ashwagandha", "Guggulu", "Kanchanar", "Punarnava"],
    nuskhe: ["Coriander seed water", "Coconut in daily diet"],
    aushadi: ["Kanchanar Guggulu", "Ashwagandha churna 1 tsp BD"],
  }),
  arthritis: base("arthritis", {
    best: ["Warm oil abhyanga daily", "Avoid cold, dry, raw food", "Daily gentle mobility 15 min", "Turmeric milk at night"],
    yoga: ["Tadasana", "Vrikshasana", "Setu Bandhasana", "Avoid deep squats"],
    exercise: ["Water walking", "Isometrics for weak joints", "Resistance bands"],
    diet: ["Warm, oily, unctuous food", "Ginger, garlic, turmeric daily", "Avoid nightshades if sensitive"],
    if: ["12:12 only; avoid long dry fasts (aggravates vata)"],
    fasting: ["Not advised"],
    herbs: ["Ashwagandha", "Shallaki (boswellia)", "Guggulu", "Nirgundi"],
    nuskhe: ["Warm sesame oil massage", "Turmeric + black pepper + ghee daily", "Fomentation with rock salt bag"],
    aushadi: ["Yogaraj Guggulu", "Maharasnadi Kwath", "Dashmularishta"],
  }),
  "knee-pain": base("knee-pain", {
    best: ["Daily oil massage on knees (mahanarayan tail)", "Strengthen quads & glutes", "Avoid stairs during flare-ups", "Keep knees warm"],
    yoga: ["Setu Bandhasana", "Tadasana", "Supta Padangusthasana", "Avoid deep squats"],
    exercise: ["Quad sets & straight-leg raises", "Wall sits 30s × 3", "Swimming/cycling"],
    diet: ["Anti-inflammatory: turmeric, ginger", "Bone broth / methi seeds", "Vitamin D + calcium"],
    if: ["Light 12:12"],
    fasting: ["Not advised"],
    herbs: ["Shallaki", "Ashwagandha", "Guggulu"],
    nuskhe: ["Mahanarayan tail massage + hot fomentation", "Turmeric-milk at night"],
    aushadi: ["Yogaraj Guggulu", "Ashwagandha churna"],
  }),
  heart: base("heart", {
    best: ["Arjuna bark tea daily", "30–45 min cardio 5×/wk", "10 min meditation twice a day", "Cut trans fats and refined sugar"],
    yoga: ["Bhujangasana", "Setu Bandhasana", "Anulom Vilom", "Bhramari"],
    exercise: ["Zone-2 cardio 150 min/wk", "Strength 2×/wk"],
    diet: ["Mediterranean-Ayurveda hybrid", "Flax, walnuts, olive oil", "Avoid vanaspati & fried"],
    if: ["14:10 or 16:8 (with doctor OK)"],
    fasting: ["Weekly ekadashi liquid fast"],
    herbs: ["Arjuna", "Pushkarmool", "Guggulu", "Garlic"],
    nuskhe: ["Arjuna bark decoction with milk", "1 raw garlic pod AM"],
    aushadi: ["Arjunarishta 15ml BD", "Hridayarnava Ras (vaidya)"],
  }),
  lungs: base("lungs", {
    best: ["10 min pranayam daily", "Steam inhalation 2×/wk", "Avoid cold/pollution exposure", "Tulsi tea 2×/day"],
    yoga: ["Bhastrika", "Kapalbhati", "Ujjayi", "Anulom Vilom"],
    exercise: ["Swimming", "Interval running", "Diaphragmatic breathing"],
    diet: ["Warm, moist food", "Ginger-tulsi-mulethi tea", "Avoid dairy in phlegm phase"],
    if: ["12:12 gentle"],
    fasting: ["Not during infection"],
    herbs: ["Tulsi", "Mulethi", "Vasa", "Pippali"],
    nuskhe: ["Steam with eucalyptus/ajwain", "Honey + turmeric + pepper"],
    aushadi: ["Sitopaladi churna", "Chyawanprash 1 tsp AM"],
  }),
  brain: base("brain", {
    best: ["8hr sleep, screen curfew 1hr before bed", "Nasya with anu tail AM", "10 min meditation daily", "Brahmi ghee 1 tsp AM"],
    yoga: ["Sirsasana (advanced only)", "Sarvangasana", "Bhramari", "Trataka"],
    exercise: ["Cardio 30 min", "Balance drills", "Coordination games"],
    diet: ["Almonds, walnuts, ghee", "Amla daily", "Avoid stimulants late day"],
    if: ["16:8 supports autophagy (with balance)"],
    fasting: ["Ekadashi liquid fast weekly"],
    herbs: ["Brahmi", "Shankhapushpi", "Jatamansi", "Mandukparni"],
    nuskhe: ["Almonds + walnuts + kesar in milk", "Nasya with anu tail"],
    aushadi: ["Saraswatarishta 15ml BD", "Brahmi ghrita 1 tsp AM"],
  }),
  kidney: base("kidney", {
    yoga: ["Bhujangasana", "Dhanurasana", "Ardha Matsyendrasana"],
    exercise: ["Walk 30 min daily", "Avoid over-training / dehydration"],
    diet: ["3–4L water daily", "Cut salt & red meat", "Avoid high-oxalate: spinach, beetroot in excess"],
    if: ["Only under supervision; hydration critical"],
    fasting: ["Not advised"],
    herbs: ["Punarnava", "Gokshura", "Varuna", "Pattharchatta"],
    nuskhe: ["Barley water daily", "Lemon-water for citrate", "Coconut water"],
    aushadi: ["Chandraprabha Vati", "Punarnavarishta 15ml BD"],
  }),
  sleep: base("sleep", {
    best: ["Fixed bed/wake time", "Screens off 1 hr before bed", "Warm shower + foot oil massage", "No caffeine after 2pm"],
    yoga: ["Supta Baddha Konasana", "Viparita Karani (legs-up-wall)", "Yoga Nidra 30 min"],
    exercise: ["Morning sun + walk", "No intense exercise post 7pm"],
    diet: ["Warm milk + nutmeg + jaiphal at night", "Light dinner by 7:30pm", "Avoid heavy fried at dinner"],
    if: ["Close eating window by 7pm"],
    fasting: ["Not advised — worsens vata & sleep"],
    herbs: ["Ashwagandha", "Jatamansi", "Tagara", "Brahmi"],
    nuskhe: ["Warm milk + jaiphal (nutmeg) + kesar", "Bhramari 7 rounds pre-bed", "Foot massage with sesame oil"],
    aushadi: ["Ashwagandharishta 15ml PM", "Sarpagandha Ghan Vati (vaidya)"],
  }),
  obesity: base("obesity", {
    yoga: ["Surya Namaskar × 12", "Trikonasana", "Navasana", "Kapalbhati 10 min"],
    exercise: ["45 min brisk walk + 15 min surya namaskar", "Strength 3×/wk", "10k steps daily"],
    diet: ["Kapha-pacifying: warm, light, spiced", "Largest meal at lunch, light dinner by 7:30pm", "Cut wheat & dairy 6 wks"],
    if: ["16:8 works well"],
    fasting: ["Monthly liquid fast under guidance"],
    herbs: ["Triphala", "Guggulu", "Vrikshamla (garcinia)", "Punarnava"],
    nuskhe: ["Warm water + lemon + honey AM", "CCF tea through the day"],
    aushadi: ["Triphala churna 1 tsp PM", "Medohar Guggulu"],
  }),
  weight: base("weight", {
    best: ["Set target & pace (0.1–1 kg/week)", "Calorie math: BMR + activity + yoga burn", "Track daily; adjust weekly"],
    yoga: ["Surya Namaskar × 12", "Power yoga 30 min", "Kapalbhati for loss / Shavasana for gain"],
    exercise: ["Strength 3×/wk", "Cardio 3×/wk", "Progressive overload"],
    diet: ["Prakriti-aligned; deficit for loss, surplus for gain", "3 solid meals; no random snacking"],
    if: ["16:8 for loss; skip IF for gain"],
    fasting: ["Ekadashi liquid fast weekly (loss)"],
    herbs: ["Triphala (loss)", "Ashwagandha (gain)", "Shatavari (gain)"],
    nuskhe: ["Warm lemon-honey water AM (loss)", "Dry-fruit ladoo AM (gain)"],
    aushadi: ["Medohar Guggulu (loss)", "Chyawanprash 1 tsp BD (gain)"],
  }),
  gut: base("gut", {
    yoga: ["Vajrasana after meals 5 min", "Pawanmuktasana", "Ardha Matsyendrasana"],
    exercise: ["Walk 100 steps after every meal", "Gentle daily 30 min"],
    diet: ["Warm, freshly cooked, well-chewed", "Avoid milk+fruit combos", "Close dinner by 8pm"],
    if: ["12:12 baseline; 14:10 if strong agni"],
    fasting: ["Weekly ekadashi liquid fast"],
    herbs: ["Triphala", "Hing", "Ajwain", "Jeera"],
    nuskhe: ["Warm water first thing", "Ajwain-hing-kala namak after meals", "Buttermilk with jeera+hing at lunch"],
    aushadi: ["Triphala churna 1 tsp PM", "Avipattikar churna", "Hingvashtak churna"],
  }),
  cholesterol: base("cholesterol", {
    yoga: ["Surya Namaskar × 12", "Kapalbhati 10 min", "Bhastrika"],
    exercise: ["Cardio 45 min 5×/wk", "Strength 2×/wk"],
    diet: ["1 tbsp ground flax daily", "Cold-pressed mustard / ghee (moderate)", "Cut vanaspati, bakery, fried"],
    if: ["16:8 helps lipid panel"],
    fasting: ["Ekadashi liquid fast weekly"],
    herbs: ["Arjuna", "Guggulu", "Garlic", "Amla"],
    nuskhe: ["Arjuna bark tea", "Soaked almonds + walnuts AM", "Amla juice 30ml"],
    aushadi: ["Medohar Guggulu", "Arjunarishta 15ml BD"],
  }),
};

export function getGoal(slug: string): HealthGoal | undefined {
  return HEALTH_GOALS.find((g) => g.slug === slug);
}
