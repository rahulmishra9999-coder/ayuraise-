// Disease Management data layer.
// Two kinds of conditions:
//  - "chronic"  — lifestyle diseases managed via herbs, food, yoga, meditation, fasting…
//  - "seasonal" — acute problems (dengue, cold, typhoid…) — herbs/remedies/diet heavy.
// Every chronic condition supports two tracks: "manage" (has the disease) and
// "prevent" (at risk — lighter tier). Ready plans carry both tiers; `prevent`
// falls back to `manage` items when not authored separately.

import {
  Droplet,
  Activity,
  Wind,
  Brain,
  Bed,
  Scale,
  Salad,
  Zap,
  Leaf,
  CircleDot,
  Waves,
  Bone,
  Heart,
  CloudLightning,
  Bug,
  Moon,
  Thermometer,
  Soup,
  Flower,
  Snowflake,
  Droplets,
  Flame,
  Footprints,
  Armchair,
  Smartphone,
  Sparkles,
  Brush,
  Dumbbell,
  Eye,
  Shield,
  type LucideIcon,
} from "lucide-react";

export type DiseaseKind = "chronic" | "seasonal";
export type Track = "manage" | "prevent";
/** Chronic entries split into two uniform rows: named diseases vs organ-health pages. */
export type ChronicGroup = "condition" | "organ";

export type ToolKey =
  | "diet"
  | "yoga"
  | "exercise"
  | "if"
  | "fasting"
  | "detox"
  | "meditation"
  | "herbs"
  | "remedies";

export type StarRating = 0 | 1 | 2 | 3 | 4 | 5;

export interface ReadyPlan {
  title: string;
  manage: string[];
  /** Lighter prevention tier — falls back to `manage` when absent. */
  prevent?: string[];
}

export interface DiseaseInfo {
  slug: string;
  kind: DiseaseKind;
  /** Chronic only. "organ" = prevention-first organ-health page. Defaults to "condition". */
  group?: ChronicGroup;
  /** Organ pages list the condition slugs they watch over; back-links are computed. */
  related?: string[];
  /** Organ pages: conditions that ORIGINATE in this organ (vs ones it suffers
   *  downstream). A condition's home organ leads its back-link list. */
  homeFor?: string[];

  name: string;
  short: string;
  icon: LucideIcon;
  gradient: string; // css var token from styles.css
  blurb: string;
  basic: {
    what: string;
    causes: string[];
    symptoms: string[];
    redFlags: string[];
  };
  dosDonts: { dos: string[]; donts: string[] };
  relevance: Record<ToolKey, StarRating>;
  readyPlans: Partial<Record<ToolKey, ReadyPlan>>;
}

export const TOOL_META: Record<ToolKey, { label: string; emoji: string }> = {
  diet:       { label: "Diet plan",              emoji: "🥗" },
  yoga:       { label: "Yoga",                   emoji: "🧘" },
  exercise:   { label: "Exercise",               emoji: "🏃" },
  if:         { label: "Intermittent Fasting",   emoji: "⏱️" },
  fasting:    { label: "Traditional Fasting",    emoji: "🌙" },
  detox:      { label: "Detox",                  emoji: "✨" },
  meditation: { label: "Meditation",             emoji: "🕯️" },
  herbs:      { label: "Ayurvedic herbs",        emoji: "🌿" },
  remedies:   { label: "Home remedies (nuskhe)", emoji: "🏠" },
};

/** Resolve plan items for a track, falling back to manage tier. */
export function planItems(plan: ReadyPlan, track: Track): string[] {
  return track === "prevent" && plan.prevent ? plan.prevent : plan.manage;
}

/* ================================================================== */
/*  CHRONIC & LIFESTYLE                                               */
/* ================================================================== */

export const DISEASES: DiseaseInfo[] = [
  {
    slug: "diabetes",
    kind: "chronic",
    name: "Diabetes (Type 2)",
    short: "Diabetes",
    icon: Droplet,
    gradient: "var(--gradient-clay)",
    blurb: "Steady sugars with kapha-pacifying meals, IF, walking and bitters.",
    basic: {
      what: "Type-2 diabetes is a kapha–meda imbalance where insulin loses its edge. Ayurveda calls it Madhumeha — sweet urine from unspent kapha and stalled agni.",
      causes: ["Excess sweet, refined carbs & late-night eating", "Sedentary life, day sleep", "Chronic stress spiking cortisol"],
      symptoms: ["Frequent thirst & urination", "Fatigue after meals", "Slow wound healing", "Sugar cravings"],
      redFlags: ["Fasting sugar > 180 mg/dL repeatedly", "Blurred vision, numb feet", "Unexplained rapid weight loss"],
    },
    dosDonts: {
      dos: ["Walk 100+ steps after every meal", "Front-load food — biggest meal at lunch", "Bitter foods daily: methi, karela, jamun", "Sleep by 10:30 PM"],
      donts: ["No sugary drinks or fruit juice", "Don't skip meals then binge", "No day-time naps after meals", "Don't stop prescribed medication on your own"],
    },
    relevance: { diet: 5, exercise: 5, if: 4, yoga: 4, herbs: 4, remedies: 3, meditation: 3, detox: 2, fasting: 1 },
    readyPlans: {
      diet: {
        title: "Diabetic-friendly day",
        manage: ["6:30 AM — Methi water", "8:30 AM — Besan chilla + mint chutney", "1:00 PM — Bajra roti · dal · sabzi · salad", "4:30 PM — Roasted chana + green tea", "7:00 PM — Moong khichdi + ghee (small)"],
        prevent: ["Swap white rice/maida for millets 5 days a week", "No liquid calories — water, chaas, unsweetened tea", "One bitter food daily (methi, karela, amla)", "Dinner by 8 PM, nothing after"],
      },
      yoga: {
        title: "Blood-sugar yoga (25 min)",
        manage: ["Surya Namaskar × 6 (slow)", "Mandukasana × 3", "Ardha Matsyendrasana × 2 each side", "Paschimottanasana × 3", "Kapalbhati 3 min + Anulom Vilom 5 min"],
        prevent: ["Surya Namaskar × 6, 4 days a week", "Kapalbhati 3 min + Anulom Vilom 5 min", "Any 10-min stretch on rest days"],
      },
      exercise: {
        title: "Post-meal walk protocol",
        manage: ["100–200 steps after every meal", "45 min brisk walk before breakfast", "2× strength (bodyweight) per week"],
        prevent: ["10-min walk after lunch & dinner", "30 min brisk walk 5 days a week", "1× strength session weekly"],
      },
      if: {
        title: "Gentle 14:10 window",
        manage: ["Eat between 9 AM – 7 PM", "Break fast with warm water + soaked almonds", "No sweet at first meal"],
        prevent: ["Start 12:12, move to 14:10 when easy", "Close the kitchen after dinner", "Weekend window can relax by 1 hr"],
      },
      detox: {
        title: "Weekly kapha reset",
        manage: ["Mon: only moong khichdi + steamed veg", "CCF tea 3× daily", "Warm dry brushing 5 min AM"],
      },
      meditation: {
        title: "Cortisol-calming stack",
        manage: ["10 min Anulom Vilom AM", "Yoga Nidra 20 min post-lunch or bedtime", "3-min breath break before meals"],
      },
      herbs: {
        title: "Sugar-steadying herbs",
        manage: ["Methi seeds — 1 tsp soaked overnight, chew AM", "Jamun seed powder 1 tsp with warm water", "Vijaysar — water kept in wood tumbler overnight", "Gudmar leaf powder after lunch", "Madhunashini vati (consult a vaidya)"],
        prevent: ["Methi water on waking, 3–4 days a week", "Amla — fresh or 1 tsp powder daily", "Cinnamon pinch in morning tea"],
      },
      remedies: {
        title: "Desi nuskhe",
        manage: ["Karela juice 30 ml on empty stomach", "Cinnamon in warm water before meals", "Barley (jau) roti mixed into atta", "Amla-haldi shot mid-morning"],
      },
    },
  },
  {
    slug: "hypertension",
    kind: "chronic",
    name: "BP / Hypertension",
    short: "BP/Hypertension",
    icon: Activity,
    gradient: "var(--gradient-dawn)",
    blurb: "Bring BP into range with pranayam, low-salt meals and stress work.",
    basic: {
      what: "High BP is a vata–pitta issue where blood pushes hard on tired vessels. Salt, stress and shallow breath are the usual triggers.",
      causes: ["Excess salt & packaged food", "Chronic stress, poor sleep", "Sedentary + weight gain"],
      symptoms: ["Headaches, neck stiffness", "Ringing in ears", "Palpitations, breathlessness"],
      redFlags: ["BP > 160/100 sustained", "Chest pain, sudden vision change", "Severe morning headache"],
    },
    dosDonts: {
      dos: ["Salt under 5 g/day — taste before adding", "Bhramari or slow breathing twice daily", "Potassium foods: banana, coconut water", "Fixed sleep time, 7–8 hrs"],
      donts: ["No pickles, papad, packaged namkeen", "No breath-holding or heavy lifting", "Don't skip BP medication", "Avoid late-night screens & arguments"],
    },
    relevance: { meditation: 5, diet: 5, yoga: 5, exercise: 4, herbs: 4, remedies: 3, detox: 2, if: 1, fasting: 1 },
    readyPlans: {
      diet: {
        title: "DASH-Ayurvedic day",
        manage: ["Salt < 5 g/day, no pickles", "1 pod garlic on empty stomach", "5 almonds + 2 walnuts (soaked)", "Arjuna bark tea evening", "Dinner by 7:30 PM"],
        prevent: ["Cook with measured salt — under 1 tsp/person/day", "Packaged snacks max 1×/week", "Coconut water or banana daily", "Dinner by 8:30 PM"],
      },
      yoga: {
        title: "BP-calming flow (20 min)",
        manage: ["Shashankasana × 5", "Setu Bandhasana × 3", "Shavasana 10 min", "Anulom Vilom 10 min", "Bhramari × 7"],
        prevent: ["Anulom Vilom 10 min daily", "Shavasana 5 min after work", "Gentle evening stretch 3×/week"],
      },
      meditation: {
        title: "Calm mind protocol",
        manage: ["Bhramari 5 min morning + night", "20 min Yoga Nidra at 3 PM", "10 min silent breath before bed"],
        prevent: ["Bhramari 5 rounds before bed", "One 10-min breathing break daily"],
      },
      exercise: {
        title: "Steady cardio",
        manage: ["30–45 min brisk walk daily", "No heavy weights / breath-holding", "Evening stretch 10 min"],
        prevent: ["30 min walk 5×/week", "Take stairs, skip lifts", "Light strength OK — exhale on effort"],
      },
      herbs: {
        title: "Vessel-friendly herbs",
        manage: ["Arjuna bark tea 1× daily", "Ashwagandha 1/2 tsp with warm milk at night", "Sarpagandha only under a vaidya's care", "Arjunarishta 15 ml after dinner (vaidya)"],
      },
      remedies: {
        title: "Desi nuskhe",
        manage: ["1 garlic pod on empty stomach", "Soaked almonds + walnuts AM", "Lauki (bottle gourd) juice 3×/week", "Rock-salt swap for table salt (still measured)"],
      },
    },
  },
  {
    slug: "migraine",
    kind: "chronic",
    name: "Migraine",
    short: "Migraine",
    icon: CloudLightning,
    gradient: "var(--gradient-violet)",
    blurb: "Raise your trigger threshold with regular meals, sleep, bhramari and cooling herbs.",
    basic: {
      what: "Migraine is a neurological storm — Ayurveda sees it as vata–pitta rising to the head. Attacks are triggered: skipped meals, poor sleep, screens, heat and stress lower the threshold until the storm breaks.",
      causes: ["Skipped or delayed meals, dehydration", "Sleep debt or oversleeping weekends", "Screen strain, bright light, loud sound", "Stress build-up, hormonal shifts", "Trigger foods: aged cheese, chocolate, caffeine swings"],
      symptoms: ["One-sided throbbing headache", "Nausea, sometimes vomiting", "Light & sound sensitivity", "Aura — zigzag lines, blind spots (some people)"],
      redFlags: ["Sudden 'worst-ever' thunderclap headache", "Headache with fever + stiff neck", "Weakness, slurred speech or vision loss — emergency", "New headaches after age 50"],
    },
    dosDonts: {
      dos: ["Eat at the same times daily — never skip", "2.5–3 L water through the day", "Fixed sleep & wake time, even weekends", "Keep a trigger diary for 4 weeks"],
      donts: ["Don't stare at screens without breaks (20-20-20 rule)", "Avoid direct midday sun & strong perfumes", "No long dry fasts — they trigger attacks", "Don't overuse painkillers (>2 days/week worsens it)"],
    },
    relevance: { meditation: 5, diet: 4, yoga: 4, remedies: 4, herbs: 3, detox: 2, exercise: 2, if: 1, fasting: 0 },
    readyPlans: {
      meditation: {
        title: "Threshold-raising calm",
        manage: ["Bhramari 7 rounds AM + PM", "Yoga Nidra 20 min daily (lowers attack frequency)", "10 min dark-room quiet break at first warning sign", "Body-scan before sleep"],
        prevent: ["Bhramari 5 rounds at night", "One 10-min screen-free break every 2 hrs"],
      },
      diet: {
        title: "Trigger-free eating",
        manage: ["Same meal times daily — set alarms", "No aged cheese, processed meats, MSG for 8 weeks", "Steady caffeine — same small amount, same time", "Soaked raisins + almonds as mid-meal snack", "3 L water; coconut water in summer"],
        prevent: ["Never go > 4 waking hours without food", "Watch your personal triggers — note & avoid", "Hydrate: 2.5 L minimum"],
      },
      yoga: {
        title: "Neck-release + cooling flow",
        manage: ["Neck rolls & shoulder shrugs 5 min", "Balasana × 3 (2 min holds)", "Setu Bandhasana × 3", "Sheetali pranayama 5 min (cooling)", "Anulom Vilom 10 min — skip during an attack"],
      },
      remedies: {
        title: "Desi nuskhe",
        manage: ["Ginger tea at the very first sign of attack", "Nutmeg (jaiphal) paste on forehead at night", "Cold compress on head, warm water on feet", "Desi ghee 2 drops in nostrils at bedtime (nasya)"],
      },
      herbs: {
        title: "Head-calming herbs",
        manage: ["Brahmi 1/2 tsp with warm water AM", "Jatamansi tea at night", "Shankhapushpi syrup (vaidya dose)", "Pathyadi kwath (consult vaidya)"],
      },
      detox: {
        title: "Pitta-cooling reset",
        manage: ["Weekly: light kitchari day with cooling veg", "Rose water spray + foot massage PM", "No fried/fermented food that day"],
      },
    },
  },
  {
    slug: "heart",
    kind: "chronic",
    group: "organ",
    related: ["hypertension", "cholesterol", "obesity"],
    homeFor: ["hypertension", "cholesterol"],
    name: "Heart Health",
    short: "Heart",
    icon: Heart,
    gradient: "var(--gradient-clay)",
    blurb: "Protect the heart with arjuna, cardio, meditation and clean fats.",
    basic: {
      what: "Heart health = clean vessels + strong pump + calm mind. Arjuna is Ayurveda's OG cardio herb.",
      causes: ["Refined oils, trans fats", "Chronic stress, poor sleep", "Sedentary life, smoking"],
      symptoms: ["Breathlessness on exertion", "Chest discomfort", "Fatigue, palpitations"],
      redFlags: ["Crushing chest pain", "Pain in left arm / jaw", "Sudden shortness of breath"],
    },
    dosDonts: {
      dos: ["Zone-2 cardio 150 min/week", "1 tbsp ground flax daily", "10 min meditation twice daily", "Annual lipid + BP check"],
      donts: ["No vanaspati, bakery & deep-fried", "No smoking — single biggest factor", "Don't ignore exertion breathlessness", "Avoid chronic sleep debt"],
    },
    relevance: { exercise: 5, diet: 5, meditation: 5, yoga: 4, herbs: 4, if: 3, remedies: 3, detox: 2, fasting: 1 },
    readyPlans: {
      diet: {
        title: "Heart-clean plate",
        manage: ["Arjuna bark tea 1× daily", "1 tbsp ground flax", "Cold-pressed mustard / ghee (small)", "No bakery, no vanaspati"],
        prevent: ["Fried food max 1×/week", "Nuts daily: 5 almonds + 2 walnuts", "Ghee/cold-pressed oils over refined oil"],
      },
      exercise: {
        title: "Cardio protocol",
        manage: ["30–45 min cardio 5×/week", "Zone-2 pace (can hold conversation)", "2× strength / week"],
        prevent: ["30 min brisk walk 5×/week", "Take stairs daily", "1× strength weekly"],
      },
      yoga: {
        title: "Cardio-yoga combo",
        manage: ["Surya Namaskar × 12 (slow)", "Bhujangasana × 5", "Setu Bandhasana × 5", "Bhramari 5 min", "Shavasana 10 min"],
      },
      meditation: {
        title: "Heart-mind reset",
        manage: ["Loving-kindness meditation 10 min", "Bhramari 7 rounds AM+PM", "Gratitude journal 3 lines / day"],
        prevent: ["10 min breath practice daily", "One tech-free hour before bed"],
      },
      herbs: {
        title: "Cardio-protective herbs",
        manage: ["Arjuna bark decoction with milk at night", "Garlic 1 pod AM", "Guggulu (vaidya dose)", "Arjunarishta 15 ml twice daily (vaidya)"],
      },
      remedies: {
        title: "Desi nuskhe",
        manage: ["Arjuna-cinnamon kadha in winter", "1 raw garlic pod with warm water AM", "Flax-jaggery ladoo (small) as snack swap"],
      },
      if: {
        title: "14:10 heart window",
        manage: ["Eat 9 AM – 7 PM (doctor OK if on meds)", "Early light dinner — heaviest meal at lunch", "No late-night snacking"],
      },
    },
  },
  {
    slug: "asthma",
    kind: "chronic",
    name: "Asthma",
    short: "Asthma",
    icon: Wind,
    gradient: "var(--gradient-water)",
    blurb: "Ease breath with pranayam, warm sattvic food and vasa/tulsi.",
    basic: {
      what: "Asthma (Shwasa) is vata-kapha in the lungs — cold, damp, spasm. Breath work and warm food change the game.",
      causes: ["Cold food & drinks, dairy at night", "Dust, pollen, mould", "Emotional suppression"],
      symptoms: ["Wheezing, tight chest", "Night cough", "Breath shortness on stairs"],
      redFlags: ["Blue lips, can't finish a sentence", "Reliever inhaler > 3× / day", "Peak flow < 60% of best"],
    },
    dosDonts: {
      dos: ["Warm, freshly cooked meals only", "Steam with ajwain daily in season", "Dust-proof the bedroom, wash sheets hot", "Always carry the inhaler prescribed"],
      donts: ["No curd, banana, cold drinks at night", "Avoid strong incense & mosquito coils", "Don't exercise in cold, dry air unwarmed", "Never stop controller inhaler without doctor"],
    },
    relevance: { yoga: 5, herbs: 4, diet: 4, remedies: 4, meditation: 3, detox: 2, exercise: 2, if: 0, fasting: 0 },
    readyPlans: {
      yoga: {
        title: "Lung-opening flow",
        manage: ["Bhujangasana × 5", "Ustrasana × 3", "Matsyasana × 3", "Anulom Vilom 10 min", "Bhramari 7 rounds"],
        prevent: ["Anulom Vilom 10 min daily", "Bhujangasana × 5, 4 days/week", "Deep diaphragmatic breathing 5 min"],
      },
      diet: {
        title: "Warming Shwasa diet",
        manage: ["Warm cooked meals only", "No curd / cold drinks at night", "Tulsi + mulethi + ginger tea 2× daily", "Sitopaladi 1/2 tsp with honey AM"],
      },
      meditation: {
        title: "Breath-body calm",
        manage: ["10 min slow diaphragmatic breath", "Yoga Nidra 20 min", "5 min gratitude before sleep"],
      },
      herbs: {
        title: "Airway herbs",
        manage: ["Vasa (adulsa) decoction in flare season", "Tulsi 5 leaves chewed AM", "Pippali + honey (vaidya dose)", "Sitopaladi churna 1/2 tsp with honey", "Kanakasava (consult vaidya)"],
      },
      remedies: {
        title: "Desi nuskhe",
        manage: ["Steam with ajwain 1× daily", "Honey + black pepper + tulsi juice", "Turmeric milk at night (if no phlegm increase)", "Anu tail nasya 2 drops each nostril AM"],
      },
    },
  },
  {
    slug: "kidney",
    kind: "chronic",
    group: "organ",
    related: ["diabetes", "hypertension", "gout"],
    name: "Kidney Health",
    short: "Kidney",
    icon: Droplet,
    gradient: "var(--gradient-water)",
    blurb: "Care for kidneys with hydration, punarnava and low-salt meals.",
    basic: {
      what: "Kidney health = hydration + low salt + herbs like punarnava & gokshura. Filters need slow steady work.",
      causes: ["Chronic dehydration", "High salt, painkillers overuse", "Uncontrolled BP / diabetes"],
      symptoms: ["Swollen feet / face", "Foamy urine", "Fatigue, poor appetite"],
      redFlags: ["Creatinine rising rapidly", "Blood in urine", "Very low urine output"],
    },
    dosDonts: {
      dos: ["3 L warm water spread across the day", "Keep BP & sugar in range — they protect kidneys", "Barley water 3×/week", "Annual creatinine + urine test if at risk"],
      donts: ["No routine painkillers without doctor", "Salt < 4 g/day — no packaged food", "Don't hold urine for long hours", "No unsupervised protein supplements"],
    },
    relevance: { diet: 5, herbs: 4, remedies: 3, yoga: 3, exercise: 3, meditation: 2, detox: 1, if: 0, fasting: 0 },
    readyPlans: {
      diet: {
        title: "Kidney-friendly food",
        manage: ["Salt < 4 g / day", "3 L warm water spread across day", "Punarnava / gokshura tea (consult vaidya)", "Cut red meat, packaged food"],
        prevent: ["2.5–3 L water daily — set reminders", "Salt-check every packaged label", "Painkillers only when truly needed"],
      },
      yoga: {
        title: "Gentle kidney flow",
        manage: ["Bhujangasana × 5", "Ardha Matsyendrasana × 2 each", "Setu Bandhasana × 3", "Anulom Vilom 10 min"],
      },
      exercise: {
        title: "Steady movement",
        manage: ["Walk 30–45 min daily", "Avoid high-protein workouts", "Yoga over HIIT"],
      },
      herbs: {
        title: "Filter-support herbs",
        manage: ["Punarnava tea (vaidya guidance)", "Gokshura 1/2 tsp with warm water", "Varuna bark decoction (vaidya)", "Chandraprabha vati (consult vaidya)"],
      },
      remedies: {
        title: "Desi nuskhe",
        manage: ["Barley (jau) water daily", "Coconut water mid-morning", "Lemon water for citrate", "Kulthi (horse gram) dal 2×/week"],
      },
    },
  },
  {
    slug: "pcod",
    kind: "chronic",
    name: "PCOS",
    short: "PCOS",
    icon: CircleDot,
    gradient: "var(--gradient-violet)",
    blurb: "Regulate cycles via insulin-friendly food, strength & seed cycling.",
    basic: {
      what: "PCOD is insulin resistance + androgen excess. Kapha stagnation in the pelvis and pitta inflammation drive the cycle chaos.",
      causes: ["Refined carbs, dairy overload", "Sleep debt, high cortisol", "Sedentary + weight gain"],
      symptoms: ["Irregular / missed periods", "Acne, hair thinning", "Weight around belly"],
      redFlags: ["No period > 3 months", "Severe cystic acne", "Trying to conceive without success > 1 yr"],
    },
    dosDonts: {
      dos: ["High-protein breakfast daily", "Strength training 3×/week", "Seed cycling with the cycle phases", "Sleep 7–8 hrs, consistent time"],
      donts: ["Cut refined sugar & maida 8 weeks", "No cold smoothies/raw breakfast", "Don't crash diet — worsens hormones", "Avoid late nights (cortisol spike)"],
    },
    relevance: { diet: 5, exercise: 5, yoga: 4, if: 4, herbs: 4, meditation: 3, remedies: 3, detox: 2, fasting: 1 },
    readyPlans: {
      diet: {
        title: "PCOD-friendly plate",
        manage: ["Cut dairy & refined sugar 8 weeks", "Spearmint tea 2× daily", "Seed cycling: flax+pumpkin (d1–14), sesame+sunflower (d15–28)", "Warm cooked breakfast; no cold smoothies"],
        prevent: ["Protein at breakfast daily", "Refined sugar max 2×/week", "Warm cooked meals over raw/cold"],
      },
      yoga: {
        title: "Cycle-regulating flow",
        manage: ["Malasana × 2 min", "Baddha Konasana × 5 min", "Bhujangasana × 5", "Surya Namaskar × 8", "Bhramari + Anulom Vilom 10 min"],
        prevent: ["Surya Namaskar × 6, 4 days/week", "Baddha Konasana 3 min daily", "Bhramari 5 rounds at night"],
      },
      exercise: {
        title: "Strength + walk",
        manage: ["Strength 3× / week", "10k steps / day target", "20 min Surya Namaskar daily"],
        prevent: ["Strength 2×/week", "8k steps daily", "One active hobby weekly"],
      },
      if: {
        title: "16:8 for insulin",
        manage: ["Eat 11 AM – 7 PM", "Break fast with protein + fat", "No liquid calories in fasting window"],
        prevent: ["12:12 baseline — dinner to breakfast", "No snacking after dinner"],
      },
      herbs: {
        title: "Hormone-balancing herbs",
        manage: ["Shatavari 1/2 tsp with warm milk", "Ashwagandha at night (stress arm)", "Spearmint tea 2×/day", "Ashokarishta 15 ml twice daily (vaidya)", "Kanchanar guggulu (consult vaidya)"],
      },
      remedies: {
        title: "Desi nuskhe",
        manage: ["Methi seed water at night", "Cinnamon in warm water/oats AM", "Til-gud ladoo (small) in luteal phase"],
      },
    },
  },
  {
    slug: "thyroid",
    kind: "chronic",
    name: "Thyroid",
    short: "Thyroid",
    icon: Zap,
    gradient: "var(--gradient-gold)",
    blurb: "Support thyroid with ashwagandha, selenium foods and yoga.",
    basic: {
      what: "Hypothyroid = sluggish agni + kapha excess. Hyper = pitta on fire. Both respond well to lifestyle.",
      causes: ["Iodine imbalance", "Autoimmune (Hashimoto's)", "Chronic stress, poor sleep"],
      symptoms: ["Cold hands, weight change", "Hair fall, dry skin", "Mood swings, fatigue"],
      redFlags: ["TSH > 10 or < 0.1", "Neck swelling", "Rapid heart rate + weight loss"],
    },
    dosDonts: {
      dos: ["Take thyroid meds empty-stomach, same time", "2 brazil nuts daily (selenium)", "15 min morning sunlight", "Test TSH every 6–12 months"],
      donts: ["No raw cruciferous if hypothyroid", "Don't take meds with tea/calcium/iron", "Avoid extreme low-calorie diets", "Don't self-adjust the dose"],
    },
    relevance: { diet: 5, yoga: 4, herbs: 4, meditation: 3, exercise: 3, remedies: 2, detox: 1, if: 1, fasting: 0 },
    readyPlans: {
      diet: {
        title: "Thyroid-support food",
        manage: ["Avoid raw cruciferous (if hypo)", "2 brazil nuts / day", "Coconut, ghee, ashwagandha milk night", "Sunlight 15 min AM"],
      },
      yoga: {
        title: "Throat-focused flow",
        manage: ["Sarvangasana / Viparita Karani × 5 min", "Halasana × 2 min", "Matsyasana × 3", "Ujjayi pranayama 10 min", "Bhramari × 7"],
      },
      meditation: {
        title: "Nervous-system reset",
        manage: ["10 min body scan", "Yoga Nidra 20 min", "Journaling 5 min PM"],
      },
      herbs: {
        title: "Thyroid herbs",
        manage: ["Ashwagandha 1/2 tsp with milk at night", "Guggulu (vaidya dose)", "Kanchanar guggulu (consult vaidya)", "Punarnava for water retention"],
      },
      remedies: {
        title: "Desi nuskhe",
        manage: ["Coriander-seed water AM", "Coconut in daily diet", "Ujjayi breath 5 min before meals"],
      },
    },
  },
  {
    slug: "fatty-liver",
    kind: "chronic",
    name: "Fatty Liver",
    short: "Fatty Liver",
    icon: Leaf,
    gradient: "var(--gradient-sage)",
    blurb: "Reverse fatty liver with bitters, zero sugar and gentle detox.",
    basic: {
      what: "NAFLD = fat clogs the liver. Kapha + ama block liver's srotas. Fully reversible in the early stage.",
      causes: ["Sugar, refined oils, alcohol", "Snacking all day, no meal gaps", "Sedentary + obesity"],
      symptoms: ["Right-upper abdominal heaviness", "Fatigue, brain fog", "Belly weight gain"],
      redFlags: ["ALT / AST > 3× normal", "Yellow eyes / skin", "Persistent right-side pain"],
    },
    dosDonts: {
      dos: ["Zero added sugar & juice for 12 weeks", "Bitter foods daily: karela, methi, neem", "10k steps — liver fat burns with movement", "Black coffee 1 cup (protective)"],
      donts: ["No alcohol during reversal", "No all-day snacking — give meal gaps", "Avoid refined seed oils & bakery", "Don't trust 'liver tonics' blindly — ask a vaidya"],
    },
    relevance: { diet: 5, exercise: 5, if: 4, detox: 4, herbs: 4, yoga: 3, remedies: 3, fasting: 2, meditation: 1 },
    readyPlans: {
      diet: {
        title: "Liver-clean day",
        manage: ["Zero sugar, zero fruit juice", "Bitters daily: karela, methi, neem", "Kutki 1 g at night with warm water", "Coffee (black) 1 cup — protective"],
      },
      detox: {
        title: "3-day liver reset",
        manage: ["Day 1: fruit + veg juice + warm water", "Day 2–3: moong khichdi + steamed veg", "CCF tea + kutki through the day"],
      },
      exercise: {
        title: "Fat-burn cardio",
        manage: ["45–60 min brisk walk daily", "2× strength / week", "10k steps minimum"],
      },
      if: {
        title: "14:10 → 16:8",
        manage: ["Start with 14:10 for 2 weeks", "Progress to 16:8", "No snacking between meals"],
      },
      herbs: {
        title: "Liver herbs",
        manage: ["Bhumi amla juice 20 ml AM", "Kutki 1 g at night (vaidya)", "Punarnava tea", "Kalmegh in season", "Arogyavardhini vati (consult vaidya)"],
      },
      remedies: {
        title: "Desi nuskhe",
        manage: ["Amla juice 30 ml on waking", "Warm lemon water AM", "Aloe vera juice 20 ml (unsweetened)"],
      },
    },
  },
  {
    slug: "arthritis",
    kind: "chronic",
    name: "Osteoarthritis",
    short: "Osteoarthritis",
    icon: Bone,
    gradient: "var(--gradient-clay)",
    blurb: "Knees, hips, fingers — rebuild the joint with strength, warm oil and anti-vata food.",
    basic: {
      what: "Osteoarthritis (Sandhivata) is wear + dryness in a joint — most often the knees. The fix is counter-intuitive: muscles around the joint are its shock absorbers, so strength — not rest — is the best long-term painkiller.",
      causes: ["Weak thighs/glutes leave the joint unprotected", "Extra weight — every kilo adds 4 on the knees", "Prolonged sitting, no mobility", "Cold, dry, raw food aggravating vata"],
      symptoms: ["Pain going up/down stairs", "Morning stiffness that eases with movement", "Clicking, reduced range", "Stiffness after long sitting"],
      redFlags: ["Locked joint, can't bend", "Sudden hot swelling", "Fever with joint pain", "Night pain waking you (get checked)"],
    },
    dosDonts: {
      dos: ["Strengthen quads & glutes — the best painkiller", "Warm sesame/mahanarayan oil massage 3×/week", "Gentle mobility 15 min daily — motion is lotion", "Every extra kilo lost = 4 kg off the knees"],
      donts: ["Don't rest completely — joints starve without movement", "Avoid deep squats during flares", "No cold, raw, dry food", "Don't rely on daily painkillers"],
    },
    relevance: { exercise: 5, yoga: 5, remedies: 4, herbs: 4, diet: 4, detox: 3, meditation: 2, if: 0, fasting: 0 },
    readyPlans: {
      exercise: {
        title: "Joint-protection strength",
        manage: ["Wall sits 3 × 30 sec", "Straight-leg raises 3 × 12", "Glute bridges 3 × 12", "Calf raises 3 × 15", "Walk on flat ground — skip stairs marathons during flares"],
        prevent: ["Strength 2×/week — squats to a chair, bridges", "Break sitting every 45 min", "10k steps on soft/flat ground"],
      },
      yoga: {
        title: "Joint-mobility flow",
        manage: ["Pawanmuktasana series 15 min", "Vajrasana 5 min after meals", "Setu Bandhasana × 5", "Marjariasana × 10", "Ankle rotations 20 each side"],
      },
      diet: {
        title: "Anti-ama, anti-inflammatory food",
        manage: ["Warm cooked, oily food (ghee 1 tsp)", "Turmeric + black pepper daily", "Ginger + ajwain water AM", "Avoid curd at night, refined sugar, cold food"],
      },
      detox: {
        title: "Warm oil abhyanga",
        manage: ["Mahanarayan oil massage 3×/week", "Hot fomentation / rock-salt bag on stiff joints", "Warm bath after; steam if no swelling"],
      },
      herbs: {
        title: "Joint herbs",
        manage: ["Shallaki (boswellia) — vaidya dose", "Ashwagandha 1/2 tsp at night", "Nirgundi oil externally", "Yogaraj guggulu (consult vaidya)", "Dashmularishta 15 ml after meals"],
      },
      remedies: {
        title: "Desi nuskhe",
        manage: ["Turmeric milk at night", "Methi seeds 1 tsp soaked, chew AM", "Warm sesame oil massage + hot fomentation", "Methi ladoo (small) in winter"],
      },
    },
  },
  {
    slug: "lungs",
    kind: "chronic",
    group: "organ",
    related: ["asthma"],
    homeFor: ["asthma"],
    name: "Lung Health",
    short: "Lungs",
    icon: Wind,
    gradient: "var(--gradient-water)",
    blurb: "Expand lung capacity with pranayam, steam and tulsi/mulethi.",
    basic: {
      what: "Lung health = capacity + clean srotas. Pranayam + tulsi + steam are unbeatable.",
      causes: ["Pollution, dust exposure", "Smoking, cold food", "Sedentary, shallow breathing"],
      symptoms: ["Breathlessness on stairs", "Frequent colds / cough", "Chest congestion"],
      redFlags: ["Coughing blood", "Persistent cough > 3 weeks", "Sudden breathlessness"],
    },
    dosDonts: {
      dos: ["10 min pranayam every morning", "Steam inhalation 2×/week", "Tulsi tea 2×/day", "Mask up on high-pollution days"],
      donts: ["No smoking — active or passive", "Avoid cold drinks & ice cream in winter", "Don't breathe through the mouth habitually", "Avoid outdoor cardio on smog days"],
    },
    relevance: { yoga: 5, detox: 4, herbs: 4, exercise: 3, diet: 3, remedies: 3, meditation: 2, if: 0, fasting: 0 },
    readyPlans: {
      yoga: {
        title: "Pranayam stack",
        manage: ["Kapalbhati 3 min", "Bhastrika 3 min", "Anulom Vilom 10 min", "Bhramari 5 min"],
      },
      detox: {
        title: "Lung-clear protocol",
        manage: ["Steam inhalation with ajwain 1× daily", "Tulsi tea 2× daily", "Turmeric + mulethi milk night"],
      },
      exercise: {
        title: "Aerobic capacity",
        manage: ["Brisk walk 45 min", "Uphill walk 2× / week", "Skip / dance 15 min alt days"],
      },
      herbs: {
        title: "Respiratory herbs",
        manage: ["Tulsi 5 leaves AM or tea 2×/day", "Mulethi (licorice) tea", "Vasa in congestion season", "Pippali (vaidya dose)", "Chyawanprash 1 tsp AM"],
      },
      remedies: {
        title: "Desi nuskhe",
        manage: ["Steam with eucalyptus/ajwain", "Honey + turmeric + black pepper paste", "Jaggery + ginger after meals (winter)"],
      },
    },
  },
  {
    slug: "brain",
    kind: "chronic",
    group: "organ",
    related: ["migraine", "stress-anxiety", "sleep"],
    homeFor: ["migraine", "stress-anxiety"],
    name: "Brain Health",
    short: "Brain",
    icon: Brain,
    gradient: "var(--gradient-violet)",
    blurb: "Sharpen focus with brahmi, meditation, sleep and nasya.",
    basic: {
      what: "Brain health = calm nervous system + medhya herbs + deep sleep. Brahmi, meditation, nasya.",
      causes: ["Screen overload, poor sleep", "Chronic stress", "Processed food"],
      symptoms: ["Brain fog, poor focus", "Forgetfulness", "Mood swings"],
      redFlags: ["Sudden memory loss", "Speech / vision changes", "Severe unusual headache"],
    },
    dosDonts: {
      dos: ["8 hr sleep — the brain's detox cycle", "10 min meditation daily", "Nasya (anu tail) 2 drops AM", "Learn something new weekly"],
      donts: ["No screens 1 hr before bed", "Don't multitask deep work", "Avoid late-day caffeine", "Don't skip breakfast fats (ghee/nuts)"],
    },
    relevance: { meditation: 5, herbs: 4, diet: 4, yoga: 3, exercise: 3, if: 2, remedies: 2, detox: 1, fasting: 1 },
    readyPlans: {
      meditation: {
        title: "Focus-building stack",
        manage: ["Trataka (candle gaze) 10 min", "Anapana breath 15 min AM", "Yoga Nidra 20 min PM"],
      },
      diet: {
        title: "Medhya food",
        manage: ["Brahmi 1 tsp with warm water AM", "Almonds soaked (5) + walnuts (2)", "Ghee with breakfast", "Cut sugar & processed food"],
      },
      yoga: {
        title: "Blood-to-brain flow",
        manage: ["Sirsasana / Sarvangasana (safe version)", "Bhramari 7 rounds", "Shashankasana × 5"],
      },
      herbs: {
        title: "Medhya herbs",
        manage: ["Brahmi ghrita 1 tsp AM", "Shankhapushpi syrup (vaidya)", "Jatamansi tea at night", "Saraswatarishta 15 ml twice daily (vaidya)"],
      },
      remedies: {
        title: "Desi nuskhe",
        manage: ["Almonds + walnuts + kesar in warm milk", "Nasya with anu tail AM", "Oil head-massage 2×/week"],
      },
    },
  },
  {
    slug: "sleep",
    kind: "chronic",
    name: "Sleep Health",
    short: "Sleep",
    icon: Bed,
    gradient: "var(--gradient-night)",
    blurb: "Deeper sleep with abhyanga, warm milk, screen curfew and bhramari.",
    basic: {
      what: "Poor sleep is vata in the mind — a racing system that can't power down. Fixing sleep first makes every other condition easier to manage.",
      causes: ["Screens & stimulation till late", "Caffeine after 2 PM", "Irregular bed/wake times", "Stress & overthinking at night"],
      symptoms: ["Taking > 30 min to fall asleep", "3 AM wake-ups, racing mind", "Daytime fatigue, irritability", "Needing caffeine to function"],
      redFlags: ["Loud snoring + gasping (apnea — get tested)", "Falling asleep while driving", "Insomnia > 3 months despite hygiene"],
    },
    dosDonts: {
      dos: ["Fixed bed & wake time — even weekends", "Warm milk + nutmeg at night", "Foot massage with sesame oil before bed", "Morning sunlight 15 min"],
      donts: ["No screens 1 hr before bed", "No caffeine after 2 PM", "Don't lie in bed awake > 20 min — get up, reset", "Avoid heavy late dinners"],
    },
    relevance: { meditation: 5, remedies: 4, herbs: 4, yoga: 4, diet: 3, exercise: 3, detox: 2, if: 2, fasting: 0 },
    readyPlans: {
      meditation: {
        title: "Power-down protocol",
        manage: ["Yoga Nidra 30 min (guided)", "Bhramari 7 rounds pre-bed", "Body scan lying down till sleep"],
      },
      yoga: {
        title: "Night wind-down flow",
        manage: ["Supta Baddha Konasana 5 min", "Viparita Karani (legs-up-wall) 10 min", "Slow cat-cow × 10", "Shavasana with 4-7-8 breath"],
      },
      diet: {
        title: "Sleep-friendly eating",
        manage: ["Light dinner by 7:30 PM", "Warm milk + nutmeg + kesar at night", "No caffeine after 2 PM", "Avoid heavy fried dinner"],
      },
      herbs: {
        title: "Nidra herbs",
        manage: ["Ashwagandha 1/2 tsp with milk at night", "Jatamansi or tagara tea (vaidya)", "Brahmi in the evening", "Ashwagandharishta 15 ml PM (vaidya)"],
      },
      remedies: {
        title: "Desi nuskhe",
        manage: ["Warm milk + jaiphal (nutmeg) pinch", "Sesame-oil foot massage before bed", "Lavender / rose water on pillow", "Early dinner + 10-min moonlight walk"],
      },
    },
  },
  {
    slug: "obesity",
    kind: "chronic",
    name: "Obesity",
    short: "Obesity",
    icon: Scale,
    gradient: "var(--gradient-gold)",
    blurb: "Kapha-pacifying food, IF, brisk walks and triphala. Pair with the Weight Loss section for targets & tracking.",
    basic: {
      what: "Obesity (Sthaulya) is kapha + meda accumulation — slow agni storing more than it burns. Ayurveda treats it with light, warm, spiced food and daily movement, not starvation.",
      causes: ["Refined carbs, sugar & fried food", "Sedentary routine, day sleep", "Emotional eating, sleep debt"],
      symptoms: ["Belly-first weight gain", "Breathlessness on mild effort", "Lethargy after meals", "Joint load, snoring"],
      redFlags: ["BMI > 35 or rapid unexplained gain", "Snoring with daytime sleepiness (apnea)", "Weight gain with cold intolerance (check thyroid)"],
    },
    dosDonts: {
      dos: ["Largest meal at lunch, light dinner by 7:30 PM", "45 min brisk walk daily", "16:8 eating window", "Strength training preserves muscle"],
      donts: ["No sugary drinks & juice", "No eating straight from packets", "Don't crash diet — it rebounds", "Avoid sleep under 7 hrs (hunger hormones)"],
    },
    relevance: { diet: 5, exercise: 5, if: 5, yoga: 4, herbs: 3, detox: 3, fasting: 3, meditation: 2, remedies: 2 },
    readyPlans: {
      diet: {
        title: "Kapha-pacifying plate",
        manage: ["Warm, light, spiced meals", "Largest meal at lunch; dinner by 7:30 PM", "Cut wheat & dairy 6 weeks", "Barley, millet, moong as staples"],
      },
      exercise: {
        title: "Burn protocol",
        manage: ["45 min brisk walk + 15 min Surya Namaskar", "Strength 3×/week", "10k steps daily"],
      },
      if: {
        title: "16:8 window",
        manage: ["Eat 11 AM – 7 PM", "Break fast with protein", "No liquid calories while fasting"],
      },
      yoga: {
        title: "Metabolic flow",
        manage: ["Surya Namaskar × 12", "Trikonasana, Navasana", "Kapalbhati 10 min"],
      },
      herbs: {
        title: "Meda herbs",
        manage: ["Triphala churna 1 tsp at night", "Medohar guggulu (vaidya)", "Punarnava for water retention", "Vrikshamla (garcinia) — vaidya dose"],
      },
      remedies: {
        title: "Desi nuskhe",
        manage: ["Warm water + lemon + honey AM", "CCF tea through the day", "Chew slowly — 20 min per meal"],
      },
      fasting: {
        title: "Guided fasts",
        manage: ["Weekly ekadashi liquid fast", "Monthly 24-hr fast under guidance"],
      },
    },
  },
  {
    slug: "gut",
    kind: "chronic",
    group: "organ",
    related: ["acidity-gerd", "ibs", "constipation", "obesity"],
    homeFor: ["acidity-gerd", "ibs", "constipation"],
    name: "Gut Health",
    short: "Gut",
    icon: Salad,
    gradient: "var(--gradient-sage)",
    blurb: "Repair digestion with triphala, warm meals and mindful eating.",
    basic: {
      what: "Gut health is agni — the digestive fire. Bloating, acidity and irregularity are early signs of agni out of rhythm; most chronic disease starts here.",
      causes: ["Irregular meal times, all-day snacking", "Cold, raw, packaged food", "Stress eating & fast eating", "Antibiotic overuse"],
      symptoms: ["Bloating, gas after meals", "Acidity / reflux", "Irregular motion", "Heavy, dull feeling after eating"],
      redFlags: ["Blood in stool", "Unintended weight loss", "Persistent change in bowel habit > 3 weeks", "Severe pain waking you at night"],
    },
    dosDonts: {
      dos: ["Fixed meal times — agni loves rhythm", "Warm, freshly cooked, well-chewed food", "Buttermilk with jeera + hing at lunch", "Walk 100 steps after meals"],
      donts: ["No milk + fruit combos", "Don't eat when not hungry", "Avoid cold water with meals", "No raw salad at dinner"],
    },
    relevance: { diet: 5, remedies: 4, herbs: 4, yoga: 3, meditation: 3, if: 3, fasting: 3, detox: 3, exercise: 2 },
    readyPlans: {
      diet: {
        title: "Agni-friendly eating",
        manage: ["Warm, freshly cooked, well-chewed", "Avoid milk+fruit combos", "Close dinner by 8 PM", "Ginger slice + rock salt before meals"],
      },
      yoga: {
        title: "Digestive flow",
        manage: ["Vajrasana 5 min after meals", "Pawanmuktasana × 10", "Ardha Matsyendrasana × 2 each"],
      },
      herbs: {
        title: "Gut herbs",
        manage: ["Triphala churna 1 tsp at night", "Hingvashtak churna before meals", "Avipattikar churna for acidity (vaidya)", "Jeera-saunf-ajwain tea after meals"],
      },
      remedies: {
        title: "Desi nuskhe",
        manage: ["Warm water first thing AM", "Ajwain + hing + kala namak after heavy meals", "Buttermilk with jeera at lunch", "Saunf after every meal"],
      },
      fasting: {
        title: "Agni-reset fasts",
        manage: ["Weekly ekadashi liquid/fruit fast", "Skip one meal when not hungry — listen to agni"],
      },
    },
  },
  {
    slug: "cholesterol",
    kind: "chronic",
    name: "Cholesterol",
    short: "Cholesterol",
    icon: Waves,
    gradient: "var(--gradient-leaf)",
    blurb: "Lower LDL with arjuna, flax, cardio and clean fats.",
    basic: {
      what: "High LDL silently lines the arteries for decades. Food quality, cardio and a handful of herbs move the lipid panel within 12 weeks.",
      causes: ["Trans fats, refined oils, bakery", "Sedentary routine", "Genetics (familial pattern)", "Smoking lowers good HDL"],
      symptoms: ["Usually none — that's the danger", "Sometimes: xanthelasma (eyelid deposits)", "Fatigue on exertion (late)"],
      redFlags: ["LDL > 190 (familial — needs a doctor)", "Chest pain or exertion breathlessness", "Family history of early heart attacks"],
    },
    dosDonts: {
      dos: ["1 tbsp ground flax daily", "Cardio 45 min, 5×/week", "Soaked almonds + walnuts AM", "Lipid test yearly"],
      donts: ["No vanaspati / bakery / deep-fried", "Don't reuse cooking oil", "No smoking", "Don't ignore a high LDL because you feel fine"],
    },
    relevance: { diet: 5, exercise: 5, herbs: 4, if: 4, yoga: 3, remedies: 3, detox: 2, meditation: 2, fasting: 2 },
    readyPlans: {
      diet: {
        title: "Lipid-friendly plate",
        manage: ["1 tbsp ground flax daily", "Cold-pressed mustard oil / ghee (moderate)", "Oats or barley at breakfast", "Cut vanaspati, bakery, fried"],
      },
      exercise: {
        title: "HDL-raising cardio",
        manage: ["Cardio 45 min 5×/week", "Strength 2×/week", "Post-dinner 15-min walk"],
      },
      yoga: {
        title: "Metabolic yoga",
        manage: ["Surya Namaskar × 12", "Kapalbhati 10 min", "Bhastrika 3 rounds"],
      },
      herbs: {
        title: "Lipid herbs",
        manage: ["Arjuna bark tea daily", "Guggulu (vaidya dose)", "Garlic 1 pod AM", "Amla daily — fresh or powder", "Medohar guggulu (consult vaidya)"],
      },
      remedies: {
        title: "Desi nuskhe",
        manage: ["Arjuna bark tea evening", "Soaked almonds + walnuts AM", "Amla juice 30 ml", "Methi-seed water on waking"],
      },
      if: {
        title: "16:8 lipid window",
        manage: ["Eat 10 AM – 6 PM", "No snacking after dinner", "Black coffee/green tea OK while fasting"],
      },
    },
  },
  {
    slug: "pancreas",
    kind: "chronic",
    group: "organ",
    related: ["diabetes", "obesity"],
    homeFor: ["diabetes"],
    name: "Pancreas Health",
    short: "Pancreas",
    icon: Zap,
    gradient: "var(--gradient-gold)",
    blurb: "Protect the insulin factory — steady sugar, light meals, and real rest between them.",
    basic: {
      what: "The pancreas makes insulin — the hormone that lets sugar leave your blood and enter your cells. Every sugar spike asks it to work. Decades of spikes wear the factory out, and that is how type 2 diabetes begins.",
      causes: ["Constant sugar spikes from refined carbs & sweet drinks", "All-day grazing — the factory never gets a break", "Belly fat, which makes cells deaf to insulin", "Alcohol binges (can inflame it acutely)"],
      symptoms: ["Silent for years — insulin quietly works harder", "Energy crashes 2 hours after meals", "Constant sweet cravings", "Dark velvety patches on neck/underarms (insulin resistance)"],
      redFlags: ["Severe belly pain radiating to the back — pancreatitis needs a doctor now", "Fasting sugar above 100 on repeat tests", "Unexplained weight loss with thirst and frequent urination"],
    },
    dosDonts: {
      dos: ["Protein and fiber before carbs — flattens every spike", "10-minute walk after meals", "Real gaps between meals, no grazing", "Fasting sugar + HbA1c once a year after 30"],
      donts: ["No sweet drinks — the fastest spike there is", "Don't snack all day 'to keep sugar steady' — the opposite is true", "Avoid maida + sugar combos (biscuits, bakery)", "Don't wait for a diagnosis to start — insulin resistance comes years earlier"],
    },
    relevance: { diet: 5, if: 5, exercise: 4, herbs: 4, remedies: 3, yoga: 3, fasting: 3, meditation: 2, detox: 2 },
    readyPlans: {
      diet: {
        title: "Spike-free plate",
        manage: ["Salad or veg first, carbs last", "Protein at every meal — 25 g target", "Millets/whole grains over white rice & maida", "Zero sweet drinks — including fresh juice"],
        prevent: ["Eat protein or fiber before any carb", "Swap sweet drinks for water or chaas", "Keep dessert to a planned joy meal"],
      },
      if: {
        title: "Give the factory a shift break",
        manage: ["14-hour overnight gap", "Three meals, no grazing between", "Dinner by 7 PM"],
        prevent: ["Close the kitchen after dinner", "Let hunger arrive before the next meal"],
      },
      exercise: {
        title: "Muscle: your sugar sink",
        manage: ["10-min walk after every meal", "Strength work 2×/week — muscle pulls sugar without insulin", "150 min/week moderate movement"],
      },
      herbs: {
        title: "Pancreas herbs",
        manage: ["Methi seed water on waking", "Jamun seed powder (season)", "Karela juice 30 ml (vaidya guidance)", "Cinnamon in warm water"],
      },
      remedies: {
        title: "Desi nuskhe",
        manage: ["Methi water first thing AM", "Cinnamon-water after heavy meals", "Amla daily", "Bitter veg weekly: karela, methi"],
      },
      yoga: {
        title: "Pancreas-stimulating flow",
        manage: ["Ardha Matsyendrasana × 2 each side", "Mandukasana × 3", "Kapalbhati 5–10 min", "Vajrasana 5 min after meals"],
      },
    },
  },
  {
    slug: "liver",
    kind: "chronic",
    group: "organ",
    related: ["fatty-liver", "cholesterol"],
    name: "Liver Health",
    short: "Liver",
    icon: Leaf,
    gradient: "var(--gradient-leaf)",
    blurb: "Keep the body's filter strong — amla, light dinners, and giving it quiet hours to work.",
    basic: {
      what: "The liver is the body's filter and metabolic factory — it processes every meal, medicine and toxin. It regenerates remarkably well when given light food and food-free hours.",
      causes: ["Daily fried & packaged food", "Alcohol", "Late heavy dinners — the liver never gets a shift break", "Self-medication (painkiller overuse)"],
      symptoms: ["Usually silent for years", "Heaviness after meals, low appetite", "Fatigue that sleep doesn't fix"],
      redFlags: ["Yellowing of eyes or skin", "Swelling in abdomen or feet", "Dark urine + pale stool", "Persistent right-upper-belly pain"],
    },
    dosDonts: {
      dos: ["Amla daily — fresh, juice or powder", "Finish dinner by 8 PM", "Steamed & lightly cooked over fried", "Yearly LFT if you drink or eat out often"],
      donts: ["No alcohol binges — the liver keeps score", "Don't pop painkillers casually", "Avoid reheated / reused oil", "Don't ignore constant post-meal heaviness"],
    },
    relevance: { diet: 5, detox: 4, herbs: 4, if: 4, fasting: 3, remedies: 3, exercise: 3, yoga: 2, meditation: 1 },
    readyPlans: {
      diet: {
        title: "Liver-light eating",
        manage: ["Light early dinner (by 8)", "Steam/sauté over deep-fry", "Bitter veg weekly: karela, methi", "Amla daily"],
      },
      herbs: {
        title: "Liver herbs",
        manage: ["Amla — fresh or 1 tsp powder", "Kutki (vaidya dose)", "Bhumi amla kadha (seasonal)", "Turmeric with black pepper in food"],
      },
      detox: {
        title: "Gentle liver reset",
        manage: ["1 fruit-only day per fortnight", "Warm lemon water on waking", "One oil-free dinner per week"],
      },
      if: {
        title: "Give the filter quiet hours",
        manage: ["14-hour overnight gap", "Dinner by 7–8 PM", "No late-night snacking — that's the liver's repair shift"],
      },
    },
  },

  /* ================== NEW CONDITIONS (launch 19) ================== */
  {
    slug: "acidity-gerd",
    kind: "chronic",
    name: "Acidity / GERD",
    short: "Acidity/GERD",
    icon: Flame,
    gradient: "var(--gradient-clay)",
    blurb: "Calm the fire — meal timing, trigger discipline and Amlapitta protocols beat lifelong antacids.",
    basic: {
      what: "Acidity (Amlapitta) is pitta out of rhythm — acid arriving when there's no food to digest, or rising where it doesn't belong. Antacids mask it; timing, triggers and gravity actually fix it.",
      causes: ["Irregular meal times — acid shows up, food doesn't", "Lying down within 2–3 hours of eating", "Tea/coffee on empty stomach", "Spicy-fried-late-night trio", "Stress — the gut feels it first"],
      symptoms: ["Burning behind the chest after meals", "Sour burps, regurgitation", "Throat clearing, night cough", "Heaviness even after light meals"],
      redFlags: ["Difficulty swallowing", "Vomiting blood / black stools", "Unintended weight loss", "Chest pain on exertion — rule out the heart first"],
    },
    dosDonts: {
      dos: ["Fixed meal times — acid loves rhythm", "Dinner by 7–8, nothing 3 hours before bed", "Left-side sleeping, head slightly raised", "Small sips of cold milk or coconut water in a flare"],
      donts: ["No tea/coffee on empty stomach", "Don't lie down after meals — gravity is medicine", "Avoid citrus, fried, very spicy in flares", "Don't pop antacids daily without fixing the routine"],
    },
    relevance: { diet: 5, remedies: 4, herbs: 4, yoga: 3, meditation: 3, if: 3, detox: 2, fasting: 2, exercise: 2 },
    readyPlans: {
      diet: {
        title: "Pitta-calming plate",
        manage: ["Fixed meal times, no skipping", "Cooling foods: coconut water, gulkand, soaked raisins", "Small early dinner", "Cut the trigger trio: fried, very spicy, very late"],
        prevent: ["Keep meal times steady", "Tea/coffee only after food", "Dinner by 8"],
      },
      remedies: {
        title: "Desi nuskhe",
        manage: ["Saunf + mishri after meals", "Cold milk sips in a flare", "Gulkand 1 tsp after lunch", "Coconut water between meals"],
      },
      herbs: {
        title: "Amlapitta herbs",
        manage: ["Amla powder 1 tsp with water AM", "Mulethi (licorice) tea — skip if BP is high", "Avipattikar churna (vaidya dose)", "Shatavari with milk at night"],
      },
      yoga: {
        title: "Cooling practice",
        manage: ["Vajrasana 10 min after meals — the one asana for acidity", "Sheetali pranayama 5 min", "Avoid inversions right after eating"],
      },
      if: {
        title: "Timing over suppression",
        manage: ["Same eating window daily", "3-hour gap before lying down", "No grazing — let the stomach empty"],
      },
    },
  },
  {
    slug: "ibs",
    kind: "chronic",
    name: "IBS",
    short: "IBS",
    icon: Waves,
    gradient: "var(--gradient-sage)",
    blurb: "The gut-brain condition — food rhythm + stress work together or neither works.",
    basic: {
      what: "IBS (Grahani) is a sensitive gut-brain loop: stress speaks to the gut, the gut speaks back. No scan shows it, no single pill fixes it — rhythm, food pattern and a calm nervous system do.",
      causes: ["Chronic stress and anxiety — the loop's fuel", "Irregular meals, heavy-light-heavy pattern", "Trigger foods (varies by person — track yours)", "Poor sleep amplifying gut sensitivity"],
      symptoms: ["Cramping relieved after motion", "Alternating loose motion & constipation", "Bloating that builds through the day", "Urgency after meals, especially stressful days"],
      redFlags: ["Blood in stool", "Fever, night symptoms waking you", "Unintended weight loss", "Onset after 50 — get scoped first"],
    },
    dosDonts: {
      dos: ["Same meal times daily — the gut loves boring", "Keep a 2-week food-symptom diary — your triggers are yours", "Buttermilk with jeera at lunch", "20 min daily on the stress side: bhramari, walk, or meditation"],
      donts: ["Don't chase every new 'gut cure' — consistency beats novelty", "No large heavy meals — smaller and warm wins", "Don't skip meals to 'rest' the gut on bad days", "Avoid raw salads in flare weeks"],
    },
    relevance: { diet: 5, meditation: 5, yoga: 4, remedies: 3, herbs: 3, exercise: 3, if: 2, fasting: 2, detox: 2 },
    readyPlans: {
      diet: {
        title: "Grahani rhythm plate",
        manage: ["Warm, cooked, well-spiced (not hot) food", "Fixed times, moderate portions", "Buttermilk + jeera + hing at lunch", "Trigger diary 2 weeks → drop your top 2"],
      },
      meditation: {
        title: "Calm the loop",
        manage: ["Bhramari 10 rounds before meals", "10-min body scan at night", "4-7-8 breathing when cramps start"],
      },
      yoga: {
        title: "Gut-soothing flow",
        manage: ["Pawanmuktasana series", "Vajrasana after meals", "Marjariasana × 10", "Shavasana with belly breathing"],
      },
      herbs: {
        title: "Grahani herbs",
        manage: ["Bilva (bael) — churna or sharbat", "Kutaj (vaidya dose) for loose phases", "Isabgol at night for constipated phases", "Jeera-saunf-ajwain tea after meals"],
      },
      remedies: {
        title: "Desi nuskhe",
        manage: ["Pomegranate peel water (loose phase)", "Soaked raisins AM (constipated phase)", "Ginger + rock salt before meals", "Warm water through the day"],
      },
    },
  },
  {
    slug: "constipation",
    kind: "chronic",
    name: "Constipation",
    short: "Constipation",
    icon: CircleDot,
    gradient: "var(--gradient-gold)",
    blurb: "Vibandha — fiber, water, oil and a fixed morning ritual. The gut is trainable.",
    basic: {
      what: "Constipation (Vibandha) is dry vata in the colon — too little water, fiber, oil or routine. The colon is a creature of habit: give it the same signal daily and it learns.",
      causes: ["Low fiber (maida life), low water", "Ignoring the morning urge — it stops coming", "Zero fat in food — the colon needs oil", "Sedentary days, late nights"],
      symptoms: ["Hard, strained, incomplete motion", "Heaviness and dullness all morning", "Gas, bloating by evening", "Skin dullness, bad breath, headaches"],
      redFlags: ["Blood in stool", "Pencil-thin stools for weeks", "Unintended weight loss", "New constipation after 50 — get checked"],
    },
    dosDonts: {
      dos: ["2 glasses warm water on waking, then sit — same time daily", "1 tsp ghee in dal/rice daily — lubrication", "Fiber up: guava, papaya, soaked figs, whole grains", "Squat position (footstool) on western toilets"],
      donts: ["Never ignore the urge — it's a train that stops coming", "Don't live on churnas — train the colon instead", "No maida bakery as daily food", "Don't strain — soften the stool, not push harder"],
    },
    relevance: { diet: 5, remedies: 4, herbs: 4, yoga: 4, exercise: 3, detox: 2, meditation: 2, if: 2, fasting: 1 },
    readyPlans: {
      diet: {
        title: "Colon-friendly plate",
        manage: ["Warm water 2 glasses on waking", "1 tsp ghee daily in food", "Guava/papaya/soaked figs daily", "Millets & whole grains over maida"],
      },
      remedies: {
        title: "Desi nuskhe",
        manage: ["2 soaked anjeer + 4 munakka AM", "Warm milk + 1 tsp ghee at night", "Ajwain + kala namak after heavy meals", "Footstool under feet on the toilet"],
      },
      herbs: {
        title: "Gentle movers",
        manage: ["Triphala 1 tsp warm water at night — trainer, not laxative", "Isabgol 1 tsp with warm milk/water", "Haritaki (vaidya guidance for daily use)"],
      },
      yoga: {
        title: "Morning motion flow",
        manage: ["Malasana (squat) 2 min", "Pawanmuktasana × 10", "Twists: Ardha Matsyendrasana", "10-min brisk walk after warm water"],
      },
    },
  },
  {
    slug: "gout",
    kind: "chronic",
    name: "Gout / Uric Acid",
    short: "Gout/Uric Acid",
    icon: Footprints,
    gradient: "var(--gradient-clay)",
    blurb: "The midnight toe fire — cut the real culprits (not dal), flush with water, cool the joint.",
    basic: {
      what: "Gout is uric-acid crystals settling in a joint — classically the big toe at 3 AM. Half of what people avoid (dal, tomatoes) barely matters; the real culprits are alcohol, sugary drinks, red meat and dehydration.",
      causes: ["Alcohol (beer worst), sugary drinks & packaged juice", "Dehydration — concentrated blood crystallizes", "Red meat & organ meats (veg diets: much lower risk)", "Crash dieting — rapid weight loss spikes uric acid"],
      symptoms: ["Sudden severe joint pain, often big toe, often at night", "Red, hot, shiny, exquisitely tender joint", "Attacks come and go — silence between is not cure"],
      redFlags: ["Fever with a hot joint — could be infection, ER now", "First attack — confirm with a uric-acid test, don't self-diagnose", "Kidney stone history + gout = see a doctor about both"],
    },
    dosDonts: {
      dos: ["3+ litres water daily — dilution is the cheapest medicine", "Normal dal & vegetables are fine — eat them", "Lose weight slowly if needed (crash diets trigger attacks)", "Test uric acid yearly once you've had one attack"],
      donts: ["No alcohol during and after attacks — beer is the worst offender", "No sugary drinks / packaged juices", "Don't fast dry or crash-diet — both spike uric acid", "Don't massage/heat the joint during an attack — cool it instead"],
    },
    relevance: { diet: 5, remedies: 4, exercise: 3, herbs: 3, yoga: 2, if: 2, detox: 2, meditation: 1, fasting: 0 },
    readyPlans: {
      diet: {
        title: "Uric-acid friendly plate",
        manage: ["3+ litres water — set bottle targets", "Cut: alcohol, sweet drinks, red meat", "Keep: dal (moderate), all vegetables, fruits", "Low-fat dairy daily — it actively lowers uric acid"],
        prevent: ["Hydrate 2.5–3 L daily", "Sweet drinks → nimbu pani (no sugar)", "Weight loss slow and steady, never crash"],
      },
      remedies: {
        title: "Desi nuskhe",
        manage: ["Cold compress on the hot joint (never hot fomentation in attacks)", "Nimbu pani 2–3× daily (citrate helps)", "Cherry / amla daily when available", "Elevate the foot during attacks"],
      },
      herbs: {
        title: "Uric-acid herbs",
        manage: ["Giloy juice/kadha daily", "Punarnava (vaidya dose)", "Gokshura (consult vaidya)", "Triphala at night"],
      },
      exercise: {
        title: "Between-attack movement",
        manage: ["Walking daily once attack settles", "No intense exercise during attacks", "Strength 2×/week between flares — but hydrate around workouts"],
      },
    },
  },
  {
    slug: "back-pain",
    kind: "chronic",
    name: "Back Pain",
    short: "Back Pain",
    icon: Armchair,
    gradient: "var(--gradient-night)",
    blurb: "Your back isn't weak — it's under-used. Core strength + sitting breaks beat any belt.",
    basic: {
      what: "Most chronic back pain isn't damage — it's deconditioning. A weak core makes the spine do muscles' work, and 9 hours of sitting stiffens what remains. Movement is the treatment; rest is the trap.",
      causes: ["Sitting 8+ hours, especially slouched", "Weak core & glutes", "Lifting with the back, not the legs", "Poor mattress, stomach sleeping, stress tension"],
      symptoms: ["Dull ache after sitting or standing long", "Morning stiffness easing with movement", "Spasms after unusual effort", "Pain that travels to the buttock"],
      redFlags: ["Pain shooting below the knee with numbness/tingling", "Loss of bladder/bowel control — ER immediately", "Night pain with fever or weight loss", "After a fall or accident — X-ray first"],
    },
    dosDonts: {
      dos: ["Stand and move 2 min every 45 min — set the alarm", "Core work 10 min daily (it's the spine's scaffolding)", "Lift with legs, load close to body", "Warm oil massage + hot bag for stiff (not acute) phases"],
      donts: ["Don't bed-rest beyond a day or two — it weakens the cure", "No toe-touch stretches in acute pain", "Don't sit on the wallet / one hip", "Avoid sudden heavy lifting after long sitting"],
    },
    relevance: { exercise: 5, yoga: 5, remedies: 3, meditation: 2, diet: 2, herbs: 2, detox: 2, if: 0, fasting: 0 },
    readyPlans: {
      exercise: {
        title: "Core scaffolding",
        manage: ["Cat-cow × 10 AM", "Bird-dog 3 × 8 each side", "Glute bridges 3 × 12", "Plank build-up: 3 × 20–40 sec", "45-min sitting alarm — stand, 20 steps"],
        prevent: ["Plank + bridge 3×/week", "Walk 30 min daily", "Sitting breaks hourly"],
      },
      yoga: {
        title: "Spine-mobility flow",
        manage: ["Marjariasana × 10", "Bhujangasana (gentle) × 5", "Setu Bandhasana × 5", "Supta Matsyendrasana both sides", "Shavasana 5 min"],
      },
      remedies: {
        title: "Desi nuskhe",
        manage: ["Warm sesame/mahanarayan oil massage evening", "Hot water bag on stiff muscles 15 min", "Ginger-turmeric milk at night in achy phases"],
      },
      meditation: {
        title: "Tension release",
        manage: ["Body-scan 10 min — backs hold stress", "4-7-8 breathing before sleep"],
      },
    },
  },
  {
    slug: "neck-pain",
    kind: "chronic",
    name: "Neck Pain",
    short: "Neck Pain",
    icon: Smartphone,
    gradient: "var(--gradient-violet)",
    blurb: "Text-neck & desk-neck — your head weighs 5 kg; posture decides who carries it.",
    basic: {
      what: "Your head weighs ~5 kg upright — but bent 45° over a phone, the neck feels 20+ kg. Hours of that, daily, is why the neck aches. Fix the angles and strengthen the deep neck muscles; the pain follows.",
      causes: ["Phone at chest height — hours of forward bend", "Monitor below eye level, laptop-on-lap life", "Stress shrugging shoulders toward ears", "Thick pillows or stomach sleeping"],
      symptoms: ["Ache at the base of the skull by evening", "Stiffness turning while driving", "Tension headaches starting at the neck", "Shoulder knots, upper-back burning"],
      redFlags: ["Pain radiating down the arm with numbness/tingling", "Weak grip, dropping objects", "Neck pain with fever + stiffness (can't touch chin to chest) — ER", "After any accident — imaging first"],
    },
    dosDonts: {
      dos: ["Raise the phone to eye level — the single biggest fix", "Monitor top at eye height; laptop on a stand", "Chin tucks 10× twice daily", "One thin pillow, back or side sleeping"],
      donts: ["No hour-long chin-down phone sessions", "Don't crack your own neck", "Avoid shoulder-cradling the phone on calls", "Don't sleep on the stomach"],
    },
    relevance: { yoga: 5, exercise: 4, remedies: 3, meditation: 3, diet: 1, herbs: 2, detox: 1, if: 0, fasting: 0 },
    readyPlans: {
      yoga: {
        title: "Neck-release flow",
        manage: ["Neck rotations slow × 5 each way", "Ear-to-shoulder holds 20 sec each", "Shoulder rolls × 10", "Marjariasana × 10", "Bhujangasana gentle × 5"],
      },
      exercise: {
        title: "Deep-neck strength",
        manage: ["Chin tucks 2 × 10 daily", "Wall angels 3 × 8", "Band pull-aparts 3 × 12", "Desk reset: screen up, elbows 90°"],
        prevent: ["Phone at eye level — build the habit", "Hourly shoulder rolls at the desk"],
      },
      remedies: {
        title: "Desi nuskhe",
        manage: ["Warm sesame oil neck massage evening", "Hot bag 15 min on knots", "Rock-salt potli fomentation"],
      },
      meditation: {
        title: "Un-shrug the stress",
        manage: ["Hourly check: are shoulders at your ears? Drop them", "Bhramari 5 min evening"],
      },
    },
  },
  {
    slug: "osteoporosis",
    kind: "chronic",
    name: "Osteoporosis",
    short: "Osteoporosis",
    icon: Bone,
    gradient: "var(--gradient-gold)",
    blurb: "Bones are a bank account — deposit calcium, vitamin D and load-bearing strength before the balance drops.",
    basic: {
      what: "Osteoporosis is bone quietly losing density — no symptoms until a fracture. Bone is living tissue: it grows when loaded (strength work) and fed (calcium + vitamin D + protein). Especially critical for women after menopause.",
      causes: ["Low calcium + vitamin D for years (most Indians are D-deficient)", "No load-bearing exercise — bones need reasons to stay strong", "Post-menopause estrogen drop", "Smoking, excess alcohol, long steroid use"],
      symptoms: ["None — that's the danger. It's silent until a fracture", "Height loss > 3 cm over the years", "Stooping posture developing", "Fracture from a minor fall = the alarm bell"],
      redFlags: ["Fracture from standing height or less — get a DEXA scan", "Sudden severe back pain in seniors (possible vertebral fracture)", "Long-term steroid users — screen early"],
    },
    dosDonts: {
      dos: ["Strength training 2–3×/week — the only signal bones truly obey", "Calcium from food: ragi, til, curd, paneer, moringa", "20 min morning sun on skin (vitamin D) + get levels tested", "Balance work (one-leg stands) — preventing falls prevents fractures"],
      donts: ["Don't rely on calcium tablets alone — without D and loading they don't land", "No smoking; limit alcohol", "Don't do deep forward bends/heavy twists with low bone density", "Don't fear movement — fragility grows in the armchair"],
    },
    relevance: { exercise: 5, diet: 5, yoga: 3, remedies: 2, herbs: 2, meditation: 1, detox: 1, if: 0, fasting: 0 },
    readyPlans: {
      exercise: {
        title: "Bone-loading program",
        manage: ["Strength 3×/week: squats-to-chair, wall push-ups, band rows", "Brisk walking 30 min daily (load-bearing)", "One-leg balance 30 sec each, twice daily", "Avoid high-fall-risk activities in icy/wet conditions"],
        prevent: ["Strength 2×/week from age 35 — peak bone is built early", "Daily walk + stairs"],
      },
      diet: {
        title: "Bone-bank deposits",
        manage: ["Ragi daily (dosa/mudde/porridge) — richest common calcium", "Til (sesame) 1 tbsp — chutney podi or ladoo", "Curd/paneer daily + protein at every meal", "Morning sun 20 min; test vitamin D yearly"],
      },
      yoga: {
        title: "Safe strength & balance",
        manage: ["Tadasana + Vrikshasana (balance)", "Warrior poses (leg loading)", "Avoid deep forward bends & aggressive twists"],
      },
      remedies: {
        title: "Desi nuskhe",
        manage: ["Til-gud ladoo (small) in winter", "Ragi malt mornings", "Moringa (drumstick leaves) sabzi weekly"],
      },
    },
  },
  {
    slug: "stress-anxiety",
    kind: "chronic",
    name: "Stress & Anxiety",
    short: "Stress & Anxiety",
    icon: CloudLightning,
    gradient: "var(--gradient-violet)",
    blurb: "A nervous system stuck in alarm — breath, routine and grounding practices reset it daily.",
    basic: {
      what: "Stress is the alarm system doing its job; anxiety is the alarm stuck ON. The reset lever you control is the breath — it's the only part of the alarm system with a manual override. Daily practice retrains the baseline.",
      causes: ["Always-on screens & news — the alarm never gets an all-clear", "Caffeine excess, skipped meals (blood-sugar dips read as danger)", "Sleep debt — tired brains see threats everywhere", "No daily discharge: the body stores what it doesn't move out"],
      symptoms: ["Racing thoughts, restless body", "Tight chest, shallow breathing, sighing", "Irritability, poor focus, jaw clenching", "Gut symptoms — the second brain feels it too"],
      redFlags: ["Panic attacks disrupting daily life — see a professional, it's very treatable", "Feeling hopeless or thoughts of self-harm — talk to someone NOW: Tele-MANAS 14416 (free, 24×7, all languages)", "Anxiety with chest pain + sweating — rule out the heart once", "Can't function at work/home for weeks — that's the sign to get help, not push harder"],
    },
    dosDonts: {
      dos: ["Bhramari or 4-7-8 breathing 10 min daily — non-negotiable, like brushing", "Morning sunlight walk before screens", "Fixed sleep-wake times — the anxious brain loves predictability", "Name it to tame it: write 3 lines about the worry at a fixed 'worry time'"],
      donts: ["Don't fight thoughts at 2 AM — get up, breathe, warm milk, return", "No caffeine after 2 PM", "Don't doom-scroll the news first thing or last thing", "Don't isolate — one real conversation beats 100 coping reels"],
    },
    relevance: { meditation: 5, yoga: 5, exercise: 4, herbs: 4, diet: 3, remedies: 3, detox: 2, fasting: 1, if: 1 },
    readyPlans: {
      meditation: {
        title: "Daily alarm reset",
        manage: ["Bhramari 10 rounds AM + PM", "4-7-8 breathing when spirals start", "10-min guided body scan at night", "Weekly: one hour fully offline in nature"],
        prevent: ["5 min morning breath practice", "Screen sunset 30 min before bed"],
      },
      yoga: {
        title: "Grounding flow",
        manage: ["Slow Surya Namaskar × 6", "Balasana 2 min", "Viparita Karani (legs up wall) 5 min", "Long Shavasana with belly breathing"],
      },
      herbs: {
        title: "Calming herbs",
        manage: ["Ashwagandha 1/2 tsp with warm milk at night", "Brahmi tea or churna AM", "Jatamansi (vaidya dose) for sleep-linked anxiety", "Chamomile-tulsi tea evenings"],
      },
      exercise: {
        title: "Discharge the charge",
        manage: ["30-min brisk walk daily — outdoors beats treadmill for mood", "Any sport you lose yourself in, weekly", "Strength 2×/week — lifting heavy quiets the mind"],
      },
      remedies: {
        title: "Desi nuskhe",
        manage: ["Warm milk + nutmeg pinch at night", "Warm-oil head massage 2×/week", "Feet in warm salt water 10 min on heavy days"],
      },
    },
  },

  /* ================== NEW PROTECT & STRENGTHEN TILES ================== */
  {
    slug: "skin",
    kind: "chronic",
    group: "organ",
    related: [],
    name: "Skin / Glow",
    short: "Skin/Glow",
    icon: Sparkles,
    gradient: "var(--gradient-gold)",
    blurb: "Glow is an inside job — gut, water, sleep and oils. The skin just reports the news.",
    basic: {
      what: "Skin is the body's mirror: it reports the state of your gut, hydration, sleep and stress. Creams work on the surface; the glow is manufactured inside.",
      causes: ["Gut trouble showing up as dullness & breakouts", "Low water, high sugar (glycation ages skin fastest)", "Sleep debt — repair happens at night", "Harsh scrubbing, over-washing, sun without cover"],
      symptoms: ["Dullness, uneven tone", "Breakouts tracking stress & sugar weeks", "Dryness, early fine lines", "Dark circles from poor sleep"],
      redFlags: ["A mole changing size/shape/color — dermatologist now", "Rashes with fever", "Wounds not healing (test sugar)", "Sudden severe acne with irregular cycles — check PCOS"],
    },
    dosDonts: {
      dos: ["Water 2.5–3 L; seasonal fruit daily", "Sleep 7–8h — the real night cream", "Besan-haldi-malai ubtan weekly", "Coconut/kumkumadi oil few drops at night"],
      donts: ["Cut sugar spikes — glycation dulls collagen", "Don't over-scrub or hot-wash the face", "No sleeping with makeup", "Don't pop — scars outlast pimples"],
    },
    relevance: { diet: 5, remedies: 4, detox: 4, herbs: 3, fasting: 3, meditation: 2, yoga: 2, if: 2, exercise: 2 },
    readyPlans: {
      diet: {
        title: "Glow plate",
        manage: ["Seasonal fruit + salad daily", "Soaked almonds + walnuts AM", "Cut sugar & maida — biggest skin upgrade", "Amla daily; ghee 1 tsp in food"],
      },
      remedies: {
        title: "Desi glow rituals",
        manage: ["Besan + haldi + malai ubtan weekly", "Rose water toner after wash", "Kumkumadi/coconut oil 3 drops at night", "Aloe fresh gel on irritated skin"],
      },
      detox: {
        title: "Skin reset",
        manage: ["1 fruit-only day per fortnight", "Warm lemon water AM", "Dry brushing before bath 2×/week"],
      },
      herbs: {
        title: "Skin herbs",
        manage: ["Amla juice 30 ml AM", "Manjistha (vaidya dose) for recurring breakouts", "Neem for oily/acne phases", "Turmeric in food daily"],
      },
    },
  },
  {
    slug: "hair",
    kind: "chronic",
    group: "organ",
    related: ["thyroid"],
    name: "Hair Health",
    short: "Hair",
    icon: Brush,
    gradient: "var(--gradient-night)",
    blurb: "Hair is fed from the plate and protected at the scalp — protein, iron, oiling, calm.",
    basic: {
      what: "Hair is protein built with iron, zinc and B12 — a well-fed scalp grows it, stress sheds it. Most hair fall is nutrition + stress + rough handling, and all three are fixable. Sudden heavy fall? Test thyroid, iron (ferritin) and vitamin D first.",
      causes: ["Protein & iron gaps (very common in vegetarian diets)", "Crash diets — hair is the first budget cut", "Stress (shedding shows 2–3 months after the stressful phase)", "Tight hairstyles, hot tools, harsh chemicals"],
      symptoms: ["More hair in the comb/drain than usual", "Widening part line, thinning ponytail", "Dry, brittle, split-prone strands", "Itchy or flaky scalp"],
      redFlags: ["Sudden patchy bald spots (alopecia areata — dermatologist)", "Hair fall with fatigue + weight change — test thyroid & ferritin", "Scalp pain, redness or scarring"],
    },
    dosDonts: {
      dos: ["Protein at every meal — hair IS protein", "Warm oil massage 2×/week, wash after 1–2 hrs", "Amla + curry leaves + til in the weekly diet", "Wide-tooth comb, loose styles, cold-end rinse"],
      donts: ["No crash diets — the fastest route to hair fall", "Don't tie wet hair tight", "Limit heat styling & harsh colors", "Don't panic-buy serums before testing thyroid/iron/D"],
    },
    relevance: { diet: 5, remedies: 4, herbs: 4, meditation: 3, yoga: 2, detox: 2, exercise: 2, if: 1, fasting: 1 },
    readyPlans: {
      diet: {
        title: "Hair-building plate",
        manage: ["25g+ protein per meal (dal + paneer/curd/sprouts)", "Iron: garden cress (halim), dates, jaggery + lemon (vit C helps absorb)", "Soaked almonds, walnuts, til daily", "B12 check if strictly vegetarian"],
      },
      remedies: {
        title: "Desi hair rituals",
        manage: ["Warm coconut/bhringraj oil massage 2×/week", "Amla-reetha-shikakai wash option", "Curry-leaves tadka in daily food", "Rice-water rinse weekly"],
      },
      herbs: {
        title: "Hair herbs",
        manage: ["Amla daily — fresh, juice or churna", "Bhringraj oil for the scalp", "Brahmi + ashwagandha if stress-shedding"],
      },
      meditation: {
        title: "Stop stress-shedding",
        manage: ["10-min daily breath practice", "Scalp massage doubles as stress relief", "Fixed sleep schedule"],
      },
    },
  },
  {
    slug: "bones-joints",
    kind: "chronic",
    group: "organ",
    related: ["arthritis", "osteoporosis", "back-pain", "neck-pain", "gout"],
    homeFor: ["arthritis", "osteoporosis", "back-pain", "neck-pain"],
    name: "Bones & Joints",
    short: "Bones & Joints",
    icon: Bone,
    gradient: "var(--gradient-clay)",
    blurb: "Your frame for 80 years — load it, feed it calcium & D, keep it moving.",
    basic: {
      what: "Bones and joints follow one law: use it or lose it. Bones densify under load, joints stay juicy with movement, and both are fed by calcium, vitamin D and protein. Peak bone is built before 35 — after that you defend it.",
      causes: ["Sedentary years — bones lose what they don't need", "Calcium + vitamin D gaps (most Indians are D-deficient)", "Extra body weight loading the knees", "Cold-dry food patterns aggravating vata in joints"],
      symptoms: ["Stiffness after sitting", "Clicks and cracks on movement", "Early fatigue in the back and knees", "Height loss or stooping with age"],
      redFlags: ["Fracture from a minor fall — DEXA scan", "A hot swollen joint — doctor now", "Night bone pain — always get checked"],
    },
    dosDonts: {
      dos: ["Strength training 2–3×/week — the one signal bones obey", "Ragi, til, curd, paneer, moringa in the weekly diet", "20 min morning sun; test vitamin D yearly", "Daily mobility: joints stay juicy with motion"],
      donts: ["Don't out-supplement a sedentary life", "No sudden heavy lifting after years of nothing — build up", "Don't ignore stiffness for years — it compounds", "Don't fear squatting — the Indian squat kept generations mobile"],
    },
    relevance: { exercise: 5, diet: 5, yoga: 4, remedies: 3, herbs: 3, detox: 2, meditation: 1, if: 0, fasting: 0 },
    readyPlans: {
      exercise: {
        title: "Frame-strength program",
        manage: ["Squats-to-chair, wall push-ups, band rows 2–3×/week", "Brisk walk 30 min daily", "One-leg balance 30 sec × 2 daily", "Stairs over lift, always"],
      },
      diet: {
        title: "Bone-feeding plate",
        manage: ["Ragi 3–4×/week", "Til 1 tbsp daily", "Curd/paneer daily + protein every meal", "Morning sun 20 min for vitamin D"],
      },
      yoga: {
        title: "Mobility keeper",
        manage: ["Pawanmuktasana series daily", "Tadasana + Vrikshasana for balance", "Malasana (squat) 2 min", "Warrior poses for leg strength"],
      },
      remedies: {
        title: "Desi nuskhe",
        manage: ["Til-gud ladoo (small) in winter", "Warm sesame oil self-massage weekly", "Turmeric milk at night"],
      },
    },
  },
  {
    slug: "muscles",
    kind: "chronic",
    group: "organ",
    related: ["diabetes", "obesity"],
    name: "Muscle Health",
    short: "Muscles",
    icon: Dumbbell,
    gradient: "var(--gradient-sage)",
    blurb: "Muscle is your metabolism, your sugar sink and your old-age insurance — and it's use-it-or-lose-it.",
    basic: {
      what: "Muscle is not about looks — it's the organ that eats your blood sugar, holds your joints, burns calories at rest, and decides whether 70-year-old you climbs stairs. After 30 you lose 3–8% per decade unless you actively keep it.",
      causes: ["No strength work — walking alone doesn't hold muscle", "Protein far below the 1g/kg minimum (typical Indian veg plate)", "Crash diets — half of fast weight loss is muscle", "Age + inactivity compounding after 40"],
      symptoms: ["Jars getting harder to open", "Needing arms to rise from a chair", "Weight 'normal' but body soft, strength low", "Sugar creeping up despite eating less"],
      redFlags: ["Rapid unexplained muscle loss — see a doctor", "Muscle weakness with pain + dark urine after extreme workouts — ER", "One-sided weakness — rule out neuro causes urgently"],
    },
    dosDonts: {
      dos: ["Strength train 2–3×/week — bodyweight counts", "Protein 1–1.2 g/kg daily, spread across meals", "Eat protein within an hour of workouts", "Keep strength work into your 60s, 70s, 80s — it works at every age"],
      donts: ["Don't crash-diet — you'll lose the engine, not just the fat", "Don't fear 'bulking up' — that takes years of dedicated effort", "Walking is not strength work — do both", "Don't train the same soreness daily — muscles grow on rest days"],
    },
    relevance: { exercise: 5, diet: 5, yoga: 3, remedies: 2, herbs: 3, if: 2, meditation: 1, detox: 1, fasting: 0 },
    readyPlans: {
      exercise: {
        title: "Minimum effective strength",
        manage: ["2×/week: squats, push-ups (wall→floor), rows, lunges — 3 sets each", "Progress: more reps → harder version → add weight", "10-min post-meal walks daily (muscle pulls sugar)", "Rest day between strength days"],
      },
      diet: {
        title: "Muscle-feeding plate",
        manage: ["Protein target: body weight × 1g minimum", "Anchor every meal: dal + paneer/curd/soy/sprouts", "Post-workout: sattu drink or curd bowl", "Don't cut calories hard while building"],
      },
      yoga: {
        title: "Strength-flow",
        manage: ["Surya Namaskar × 12 (it's loaded movement)", "Warrior & chair poses, long holds", "Plank build-ups"],
      },
      herbs: {
        title: "Strength support",
        manage: ["Ashwagandha 1/2 tsp at night (evidence-backed for strength)", "Shatavari with milk (women)", "Dates + soaked almonds AM"],
      },
    },
  },
  {
    slug: "eyes",
    kind: "chronic",
    group: "organ",
    related: ["diabetes"],
    name: "Eye Health",
    short: "Eyes",
    icon: Eye,
    gradient: "var(--gradient-water)",
    blurb: "8 hours of screens need a defense plan — 20-20-20, palming, and food that feeds the retina.",
    basic: {
      what: "Eyes evolved for horizons, not screens at 40 cm. Strain, dryness and early power changes are the tax of modern focus — and high blood sugar quietly damages the retina years before vision blurs. Habits + food + yearly checks protect decades of sight.",
      causes: ["8+ screen hours without breaks (blink rate halves at screens)", "High sugar years — retinopathy is silent early", "Sun exposure without protection", "Vitamin-A-poor diets, low hydration"],
      symptoms: ["Evening eye strain, heaviness", "Dryness, burning, blurring at day's end", "Headaches around the eyes", "Difficulty with night driving"],
      redFlags: ["Sudden vision loss/curtain/flashes — ER same day", "Diabetic? Yearly retina exam is non-negotiable", "Eye pain with redness + halos — emergency (acute glaucoma)", "New floaters shower — retina check now"],
    },
    dosDonts: {
      dos: ["20-20-20: every 20 min, 20 seconds, 20 feet away", "Blink consciously at screens; artificial tears if dry", "Palming 1 min × 3 daily", "Yearly eye exam (with retina check if diabetic)"],
      donts: ["No screens in the dark", "Don't rub itchy eyes — cold splash instead", "Don't ignore 'my power keeps changing' — test sugar", "No self-prescribed eye drops beyond lubricants"],
    },
    relevance: { diet: 4, remedies: 4, yoga: 4, meditation: 2, herbs: 3, exercise: 2, detox: 1, if: 1, fasting: 0 },
    readyPlans: {
      yoga: {
        title: "Eye-yoga breaks",
        manage: ["Palming 1 min × 3 daily", "Slow eye rotations × 5 each way", "Near-far focus shifts × 10", "Trataka (candle gazing) 5 min evenings"],
      },
      diet: {
        title: "Retina-feeding plate",
        manage: ["Carrot/amla/seasonal orange fruit daily", "Green leafy sabzi daily (lutein)", "Soaked almonds + walnuts AM", "Hydration 2.5 L — dry eyes start with a dry body"],
      },
      remedies: {
        title: "Desi eye care",
        manage: ["Cold rose-water pads on tired evenings", "Splash eyes with cool water AM", "Ghee 1 tsp in food (classic netra-rasayana)", "Screen brightness matched to room light"],
      },
      herbs: {
        title: "Eye herbs",
        manage: ["Triphala at night (classic netra tonic)", "Amla daily", "Saffron pinch in milk (evidence for macula)"],
      },
    },
  },
  {
    slug: "immunity",
    kind: "chronic",
    group: "organ",
    related: [],
    name: "Immunity",
    short: "Immunity",
    icon: Shield,
    gradient: "var(--gradient-leaf)",
    blurb: "Ojas — the classic Ayurveda strength. Built daily by sleep, gut, sun and herbs; spent by stress and sugar.",
    basic: {
      what: "Immunity (Ojas) isn't boosted in a week — it's built daily. Sleep is when the immune army trains, the gut is where 70% of it lives, and stress + sugar are its two biggest taxes. Falling sick less starts with boring consistency.",
      causes: ["Sleep debt — one short night measurably drops immune cells", "Chronic stress (cortisol suppresses defense)", "High sugar (white cells sluggish for hours after a spike)", "Weak gut — most immune tissue lines it"],
      symptoms: ["Catching every office cold", "Colds lasting 2 weeks instead of 5 days", "Cold sores / mouth ulcers under stress", "Constant low energy without a diagnosis"],
      redFlags: ["Infections needing antibiotics repeatedly — get evaluated", "Fevers that keep returning", "Unexplained weight loss + night sweats — doctor now"],
    },
    dosDonts: {
      dos: ["7–8h sleep — the #1 immune practice, nothing else is close", "Feed the gut: curd/chaas daily, fiber, fixed meal times", "Morning sun 20 min (vitamin D runs immune genes)", "Seasonal fruit + haldi/ginger/tulsi in daily food"],
      donts: ["Don't live on 5-hour nights and immunity kadhas — sleep wins", "Cut sugar during infection season", "Don't overuse antibiotics for viral colds", "Don't skip meals repeatedly — the gut army eats too"],
    },
    relevance: { herbs: 5, diet: 4, remedies: 4, yoga: 3, meditation: 3, detox: 3, exercise: 3, fasting: 2, if: 2 },
    readyPlans: {
      herbs: {
        title: "Rasayana rack",
        manage: ["Chyawanprash 1 tsp AM (winter)", "Giloy kadha in season changes", "Tulsi 4–5 leaves or tea daily", "Amla — the everyday rasayana", "Haldi + black pepper in food"],
      },
      diet: {
        title: "Ojas-building plate",
        manage: ["Curd or chaas daily (gut army)", "Seasonal fruit — the original supplement", "Soaked almonds + dates AM", "Cut sugar in cold-cough season"],
      },
      remedies: {
        title: "Season-change rituals",
        manage: ["Haldi-milk at night in weather flips", "Steam with ajwain at first sniffle", "Ginger-tulsi-black pepper kadha (small cup, not litres)"],
      },
      yoga: {
        title: "Immune-supportive practice",
        manage: ["Pranayama 10 min daily (anulom-vilom + bhastrika)", "Surya Namaskar × 6", "Deep rest: Yoga Nidra weekly"],
      },
    },
  },
];

/* ================================================================== */
/*  SEASONAL & ACUTE                                                  */
/* ================================================================== */

export const SEASONAL_DISEASES: DiseaseInfo[] = [
  {
    slug: "dengue",
    kind: "seasonal",
    name: "Dengue",
    short: "Dengue",
    icon: Bug,
    gradient: "var(--gradient-clay)",
    blurb: "Recovery support: fluids, papaya leaf, giloy and complete rest — with strict red-flag watch.",
    basic: {
      what: "Dengue is a mosquito-borne viral fever (day-biting Aedes). There is no antiviral — treatment is fluids, rest and platelet watch. Ayurvedic support focuses on hydration, giloy and papaya leaf.",
      causes: ["Aedes mosquito bites (daytime)", "Stagnant water around home", "Monsoon & post-monsoon season"],
      symptoms: ["Sudden high fever", "Severe body & joint pain ('breakbone')", "Pain behind the eyes", "Rash, nausea, weakness"],
      redFlags: ["Bleeding gums / nose, blood in vomit or stool", "Severe abdominal pain, persistent vomiting", "Drowsiness, restlessness, cold clammy skin", "Platelets falling fast — go to hospital NOW"],
    },
    dosDonts: {
      dos: ["Fluids every 30 min — ORS, coconut water, soups", "Complete bed rest till a week after fever ends", "Daily CBC (platelet count) as doctor advises", "Paracetamol only for fever (doctor's dose)"],
      donts: ["NO aspirin, ibuprofen or painkillers (bleeding risk)", "Don't wait out red-flag symptoms at home", "No solid heavy food if nauseous — liquids first", "Don't stop fluid intake even if vomiting"],
    },
    relevance: { remedies: 5, diet: 5, herbs: 5, meditation: 1, yoga: 1, exercise: 0, if: 0, fasting: 0, detox: 0 },
    readyPlans: {
      herbs: {
        title: "Platelet & immunity support",
        manage: ["Giloy (guduchi) kadha 2×/day", "Papaya leaf juice 10 ml 2×/day (platelet support)", "Tulsi + ginger warm water sips", "Amla for vitamin C — fresh or juice"],
      },
      remedies: {
        title: "Fever-care nuskhe",
        manage: ["ORS / coconut water / lemon-salt-sugar water hourly", "Lukewarm sponging for high fever", "Kiwi + pomegranate for recovery", "Complete rest — no work-from-bed either"],
      },
      diet: {
        title: "Recovery diet",
        manage: ["Liquids first: soups, dal water, rice kanji", "Soft khichdi with ghee as appetite returns", "No fried, spicy, heavy food for 2 weeks", "Small frequent meals over 3 big ones"],
      },
      yoga: {
        title: "Recovery-phase only",
        manage: ["Nothing during fever — rest is the medicine", "Week 2+: gentle stretching 10 min", "Yoga Nidra for recovery sleep", "Resume normal practice only after energy returns"],
      },
    },
  },
  {
    slug: "malaria",
    kind: "seasonal",
    name: "Malaria",
    short: "Malaria",
    icon: Moon,
    gradient: "var(--gradient-night)",
    blurb: "Needs antimalarial medicine — Ayurveda supports recovery with giloy, light diet and rest.",
    basic: {
      what: "Malaria is a parasite spread by night-biting Anopheles mosquitoes — cyclical fever with chills and sweats. It NEEDS prescribed antimalarial medicine; herbs and diet are recovery support, not treatment.",
      causes: ["Anopheles mosquito bites (night)", "Stagnant water breeding sites", "Travel to endemic areas without precaution"],
      symptoms: ["Fever in cycles — chills → high fever → sweating", "Headache, body ache", "Fatigue, nausea", "Enlarged spleen feeling (heaviness left side)"],
      redFlags: ["Confusion, seizures, can't stay awake", "Dark or very little urine", "Yellow eyes (jaundice)", "Breathing difficulty — hospital immediately"],
    },
    dosDonts: {
      dos: ["Complete the FULL antimalarial course", "Fluids through the day — fever dehydrates", "Rest till one week after last fever spike", "Mosquito net + repellent for the family"],
      donts: ["Don't stop medicine when fever drops", "No self-medication with leftover pills", "Don't ignore recurring fever after treatment", "No heavy exercise for 2 weeks after"],
    },
    relevance: { remedies: 5, diet: 5, herbs: 4, meditation: 1, yoga: 1, exercise: 0, if: 0, fasting: 0, detox: 0 },
    readyPlans: {
      herbs: {
        title: "Recovery support herbs",
        manage: ["Giloy kadha 2×/day", "Tulsi + black pepper tea", "Chirata decoction (bitter — vaidya dose)", "Amla for strength in recovery"],
      },
      remedies: {
        title: "Fever-cycle nuskhe",
        manage: ["Warm blankets during chills, sponging during peaks", "Jeera water through the day", "Light oil massage on feet at night for sleep", "Sun-dried munakka (raisins) for energy"],
      },
      diet: {
        title: "Recovery diet",
        manage: ["Liquid → soft → normal over a week", "Rice kanji, moong dal water, veg soup", "No oily, spicy, stale food", "Fruit: pomegranate, papaya, sweet orange"],
      },
    },
  },
  {
    slug: "cough-cold",
    kind: "seasonal",
    name: "Cough, Cold & Flu",
    short: "Cold & Flu",
    icon: Wind,
    gradient: "var(--gradient-water)",
    blurb: "Steam, tulsi-ginger kadha, honey-pepper and warm rest — season's classics that work.",
    basic: {
      what: "Common cold and flu are viral — they resolve on their own in 5–10 days. Ayurveda's warming herbs, steam and rest shorten the misery and stop the slide into chest congestion.",
      causes: ["Viral infection (rhinovirus, influenza)", "Cold-damp exposure, season change", "Low ojas (immunity) from poor sleep"],
      symptoms: ["Runny/blocked nose, sneezing", "Sore throat, cough", "Mild fever, body ache (flu: high fever)", "Heaviness in head"],
      redFlags: ["Breathlessness or chest pain", "Fever > 103°F or lasting > 3 days", "Cough > 3 weeks", "Blood in phlegm"],
    },
    dosDonts: {
      dos: ["Steam with ajwain 2–3×/day", "Warm fluids only — kadha, soup, haldi milk", "Rest — pushing through prolongs it", "Salt-water gargle 2×/day"],
      donts: ["No curd, cold drinks, ice cream", "Don't demand antibiotics — it's viral", "Avoid heavy, fried food till appetite returns", "Don't suppress a productive cough at daytime"],
    },
    relevance: { remedies: 5, herbs: 5, diet: 4, yoga: 2, meditation: 1, detox: 1, exercise: 0, if: 0, fasting: 0 },
    readyPlans: {
      remedies: {
        title: "Season's classics",
        manage: ["Steam inhalation with ajwain/eucalyptus 2–3×/day", "Honey + black pepper + ginger juice 1 tsp 3×/day", "Salt-water gargles morning & night", "Haldi milk at bedtime"],
      },
      herbs: {
        title: "Kadha protocol",
        manage: ["Tulsi + ginger + black pepper + dalchini kadha 2×/day", "Mulethi for throat & dry cough", "Sitopaladi churna 1/2 tsp with honey (wet cough)", "Chyawanprash 1 tsp AM during season"],
      },
      diet: {
        title: "Warm & light",
        manage: ["Warm khichdi, dal-rice, soups", "Ginger-tulsi tea instead of regular chai", "No curd, banana, cold water", "Light early dinner"],
      },
      yoga: {
        title: "When nose opens",
        manage: ["Steam first, then gentle Anulom Vilom 5 min", "Bhramari once congestion clears", "No kapalbhati/bhastrika while blocked", "Rest over practice during fever"],
      },
    },
  },
  {
    slug: "fever",
    kind: "seasonal",
    name: "Viral Fever",
    short: "Fever",
    icon: Thermometer,
    gradient: "var(--gradient-dawn)",
    blurb: "Rest, fluids, giloy — and knowing exactly when a fever stops being 'just viral'.",
    basic: {
      what: "Most short fevers are viral and self-limiting — the fever itself is the immune system working. Support it with rest and fluids; watch for the red flags that mean it's something more.",
      causes: ["Viral infections, season change", "Low immunity phases", "Sometimes early sign of dengue/typhoid/malaria"],
      symptoms: ["Raised temperature, body ache", "Weakness, low appetite", "Headache, mild chills"],
      redFlags: ["Fever > 103°F not responding to paracetamol", "Lasting > 3 days — get tested (dengue/malaria/typhoid)", "Stiff neck, severe headache, rash", "Confusion or extreme drowsiness"],
    },
    dosDonts: {
      dos: ["Rest — cancel the day, seriously", "Fluids every hour: water, ORS, soups", "Light food only when hungry", "Track temperature 3×/day"],
      donts: ["Don't bundle up in thick blankets at high fever", "No antibiotics without a doctor", "Don't force-feed heavy meals", "No exercise till 3 days after normal temp"],
    },
    relevance: { remedies: 5, diet: 4, herbs: 4, meditation: 1, yoga: 1, exercise: 0, if: 0, fasting: 0, detox: 0 },
    readyPlans: {
      remedies: {
        title: "Fever-care nuskhe",
        manage: ["Lukewarm sponging on forehead, armpits", "Tulsi-ginger warm water sips through day", "Light cotton clothing, ventilated room", "ORS or lemon-salt-sugar water hourly"],
      },
      herbs: {
        title: "Immune support",
        manage: ["Giloy kadha 2×/day", "Tulsi + black pepper + honey (not in hot water)", "Coriander seed water (cooling, for pitta fevers)"],
      },
      diet: {
        title: "Fever diet",
        manage: ["Liquids first: dal water, rice kanji, soup", "Moong khichdi when appetite returns", "No milk products during fever", "Small frequent sips over big glasses"],
      },
    },
  },
  {
    slug: "typhoid",
    kind: "seasonal",
    name: "Typhoid",
    short: "Typhoid",
    icon: Droplets,
    gradient: "var(--gradient-gold)",
    blurb: "Antibiotics + weeks of gentle gut care — the diet IS the recovery.",
    basic: {
      what: "Typhoid is a bacterial infection (Salmonella typhi) from contaminated food/water. It needs a full antibiotic course — Ayurveda's role is protecting the inflamed gut with an ultra-gentle diet during and after.",
      causes: ["Contaminated water or street food", "Poor hand hygiene around food", "Carriers handling food"],
      symptoms: ["Step-ladder fever rising over days", "Abdominal pain, headache", "Constipation or diarrhea", "Weakness, coated tongue, low appetite"],
      redFlags: ["Severe abdominal pain (perforation risk)", "Blood in stool, black stool", "Confusion, delirium", "Fever not settling after 4–5 days of antibiotics"],
    },
    dosDonts: {
      dos: ["Complete the FULL antibiotic course", "Boiled/RO water only — for the whole family", "Soft, bland, low-fiber food for 2–3 weeks", "Rest a full 2 weeks — relapse is real"],
      donts: ["No raw salads, street food during recovery", "No heavy, spicy, fried food till cleared", "Don't return to work at first energy return", "No self-stopped antibiotics — breeds resistance"],
    },
    relevance: { diet: 5, remedies: 4, herbs: 3, meditation: 1, yoga: 1, exercise: 0, if: 0, fasting: 0, detox: 0 },
    readyPlans: {
      diet: {
        title: "Gut-gentle recovery diet",
        manage: ["Week 1: rice kanji, dal water, curd-rice (if tolerated)", "Week 2: soft khichdi, boiled veg, banana", "Week 3: slowly normal — still no fried/spicy", "High calories in soft form: ghee in khichdi, milk if tolerated"],
      },
      remedies: {
        title: "Recovery nuskhe",
        manage: ["Boiled water with a pinch of saunf, cooled", "Pomegranate juice (fresh, diluted)", "Coconut water for electrolytes", "Sponge bath over cold showers during fever"],
      },
      herbs: {
        title: "Post-recovery strength",
        manage: ["Giloy after antibiotics finish (not during — ask doctor)", "Amla juice for iron & C in week 3+", "Chyawanprash 1 tsp AM in convalescence"],
      },
    },
  },
  {
    slug: "allergies",
    kind: "seasonal",
    name: "Seasonal Allergies",
    short: "Allergy",
    icon: Flower,
    gradient: "var(--gradient-sage)",
    blurb: "Nasya, steam, local honey and kapha-light food to calm the histamine storm.",
    basic: {
      what: "Seasonal allergic rhinitis — pollen/dust triggering a histamine response. Ayurveda treats it as kapha excess with weak respiratory ojas: clear the channels, warm the diet, strengthen over months.",
      causes: ["Pollen (season change), dust mites", "Mould, pet dander", "Weak respiratory immunity"],
      symptoms: ["Sneezing fits, runny/itchy nose", "Itchy watery eyes", "Blocked nose at night", "Sinus heaviness"],
      redFlags: ["Wheezing or breathlessness (asthma crossover)", "Facial swelling, hives spreading fast", "Sinus pain with fever (infection)"],
    },
    dosDonts: {
      dos: ["Jala neti or saline rinse in season", "Anu tail nasya 2 drops each nostril AM", "Shower + change clothes after outdoors", "Local raw honey 1 tsp daily (start pre-season)"],
      donts: ["No curd, cold drinks, ice cream in season", "Don't dry clothes outdoors in pollen weeks", "Avoid morning outdoor workouts (pollen peak)", "Don't overuse decongestant sprays > 3 days"],
    },
    relevance: { remedies: 5, herbs: 4, diet: 4, yoga: 3, detox: 2, meditation: 1, exercise: 1, if: 0, fasting: 0 },
    readyPlans: {
      remedies: {
        title: "Channel-clearing nuskhe",
        manage: ["Jala neti with lukewarm saline (learn properly first)", "Anu tail nasya AM", "Steam with ajwain at night", "Local honey 1 tsp daily"],
      },
      herbs: {
        title: "Anti-allergy herbs",
        manage: ["Haridra (turmeric) + black pepper daily", "Tulsi tea 2×/day", "Sitopaladi with honey", "Chyawanprash through the season"],
      },
      diet: {
        title: "Kapha-light eating",
        manage: ["Warm, light, cooked food", "No curd/paneer/cold milk in season", "Ginger, black pepper, cinnamon in meals", "Early light dinner"],
      },
      yoga: {
        title: "Breath strengthening",
        manage: ["Anulom Vilom 10 min daily", "Kapalbhati 3 min (when nose is clear)", "Bhastrika 2 rounds in winter"],
      },
    },
  },
  {
    slug: "stomach-infection",
    kind: "seasonal",
    name: "Stomach Infection",
    short: "Stomach",
    icon: Soup,
    gradient: "var(--gradient-leaf)",
    blurb: "ORS first, gut rest, then jeera-buttermilk and bael — rebuild in stages.",
    basic: {
      what: "Gastroenteritis / food poisoning — the gut violently clearing an infection. Priority one is hydration; then rest the gut and rebuild with binding, gentle foods.",
      causes: ["Contaminated food or water", "Street food in hot/monsoon months", "Poor hand hygiene"],
      symptoms: ["Loose motions, cramps", "Nausea, vomiting", "Low-grade fever, weakness"],
      redFlags: ["Blood or black color in stool", "No urine for 8+ hrs, sunken eyes, dizziness (dehydration)", "High fever with severe pain", "Vomiting everything including water"],
    },
    dosDonts: {
      dos: ["ORS after every loose motion — non-negotiable", "Gut rest: liquids only for first 6–8 hrs", "BRAT-style rebuild: banana, rice, toast, khichdi", "Wash hands before every bite"],
      donts: ["No milk, raw salad, spicy food for 3–4 days", "Don't take anti-motility pills with fever/blood", "No gym/running till fully rehydrated", "Don't skip ORS because 'it's getting better'"],
    },
    relevance: { remedies: 5, diet: 5, herbs: 4, yoga: 1, meditation: 1, exercise: 0, if: 0, fasting: 0, detox: 0 },
    readyPlans: {
      remedies: {
        title: "Rehydrate & settle",
        manage: ["ORS or lemon-salt-sugar water after each motion", "Jeera water sips through the day", "Later: buttermilk + roasted jeera + hing", "Banana + rice as first solids"],
      },
      herbs: {
        title: "Gut-binding herbs",
        manage: ["Bael fruit pulp or sharbat (classic for loose motion)", "Pomegranate peel decoction", "Jeera + saunf + ajwain tea", "Kutaja (vaidya dose) if prolonged"],
      },
      diet: {
        title: "Staged rebuild",
        manage: ["Stage 1 (day 1): liquids — ORS, rice kanji, coconut water", "Stage 2 (day 2–3): curd-rice, khichdi, banana", "Stage 3 (day 4+): soft normal food, still no fried/spicy", "Probiotic: fresh homemade curd/buttermilk from stage 2"],
      },
    },
  },
  {
    slug: "sore-throat",
    kind: "seasonal",
    name: "Sore Throat",
    short: "Throat",
    icon: Snowflake,
    gradient: "var(--gradient-violet)",
    blurb: "Gargles, mulethi and honey-pepper — settle it in 2–3 days.",
    basic: {
      what: "Most sore throats are viral and settle in 3–5 days with warm care. Ayurveda's gargles, mulethi and honey work directly where it hurts.",
      causes: ["Viral infection, season change", "Cold drinks, ice cream after heat", "Voice overuse, dry air"],
      symptoms: ["Pain on swallowing", "Scratchy, dry throat", "Hoarse voice", "Mild fever sometimes"],
      redFlags: ["Can't swallow even liquids / drooling", "One-sided severe swelling, muffled voice", "White patches + high fever (strep — see doctor)", "Lasting > 1 week"],
    },
    dosDonts: {
      dos: ["Warm salt + haldi water gargle 3×/day", "Sip warm water through the day", "Rest the voice", "Humidify the room or steam at night"],
      donts: ["No cold drinks, curd, ice cream", "Avoid whispering (strains more than talking)", "No smoking / smoke exposure", "Don't scream-test the voice to check it"],
    },
    relevance: { remedies: 5, herbs: 4, diet: 3, yoga: 1, meditation: 1, exercise: 0, if: 0, fasting: 0, detox: 0 },
    readyPlans: {
      remedies: {
        title: "Throat-settling nuskhe",
        manage: ["Salt + haldi warm-water gargle 3×/day", "Honey + black pepper 1/2 tsp, let it coat slowly", "Steam at night", "Warm haldi milk before bed"],
      },
      herbs: {
        title: "Throat herbs",
        manage: ["Mulethi — chew a small stick or tea 2×/day", "Tulsi + ginger kadha", "Sitopaladi with honey", "Clove — suck slowly after meals"],
      },
      diet: {
        title: "Throat-friendly food",
        manage: ["Warm, soft food: khichdi, dal, soup", "Nothing cold or from the fridge", "Warm (not hot) liquids frequently", "Avoid fried & very spicy for 3 days"],
      },
    },
  },
];

/* ================================================================== */

export const ALL_DISEASES: DiseaseInfo[] = [...DISEASES, ...SEASONAL_DISEASES];

export function getDisease(slug: string): DiseaseInfo | undefined {
  return ALL_DISEASES.find((d) => d.slug === slug);
}

export function getChronicDiseases(): DiseaseInfo[] {
  return DISEASES;
}

/** Grid display order — rows of 4, most common problems first (locked with Rahul, Jul 2026). */
const CONDITION_ORDER = [
  "diabetes", "hypertension", "cholesterol", "acidity-gerd",
  "thyroid", "fatty-liver", "constipation", "pcod",
  "gout", "arthritis", "back-pain", "neck-pain",
  "ibs", "migraine", "stress-anxiety", "osteoporosis",
  "sleep", "obesity", "asthma",
];

const ORGAN_ORDER = [
  "heart", "kidney", "lungs", "brain",
  "gut", "pancreas", "liver", "skin",
  "hair", "bones-joints", "muscles", "eyes",
  "immunity",
];

const byOrder = (order: string[]) => (a: DiseaseInfo, b: DiseaseInfo) => {
  const ia = order.indexOf(a.slug); const ib = order.indexOf(b.slug);
  return (ia === -1 ? 99 : ia) - (ib === -1 ? 99 : ib);
};

/** Named diseases only — the "Chronic Conditions" row. */
export function getChronicConditions(): DiseaseInfo[] {
  return DISEASES.filter((d) => d.group !== "organ").sort(byOrder(CONDITION_ORDER));
}

/** Prevention-first organ pages — the "Protect & Strengthen" row. */
export function getOrganHealth(): DiseaseInfo[] {
  return DISEASES.filter((d) => d.group === "organ").sort(byOrder(ORGAN_ORDER));
}

/** Organs that watch over a given condition (computed back-link).
 *  The organ the condition ORIGINATES in leads; organs it damages downstream follow. */
export function organsForCondition(slug: string): DiseaseInfo[] {
  const rank = (d: DiseaseInfo) => (d.homeFor?.includes(slug) ? 0 : 1);
  return DISEASES
    .filter((d) => d.group === "organ" && d.related?.includes(slug))
    .sort((a, b) => rank(a) - rank(b));
}

export function getSeasonalDiseases(): DiseaseInfo[] {
  return SEASONAL_DISEASES;
}

/* ---------------- track persistence (have vs prevent) ---------------- */

export function loadTrack(slug: string): Track {
  // Organ pages are prevention-first; conditions default to manage.
  const fallback: Track = getDisease(slug)?.group === "organ" ? "prevent" : "manage";
  if (typeof window === "undefined") return fallback;
  try {
    const v = window.localStorage.getItem(`ayuraise.disease.${slug}.track`);
    return v === "prevent" ? "prevent" : v === "manage" ? "manage" : fallback;
  } catch {
    return fallback;
  }
}

export function saveTrack(slug: string, track: Track) {
  if (typeof window === "undefined") return;
  try { window.localStorage.setItem(`ayuraise.disease.${slug}.track`, track); } catch {}
}
