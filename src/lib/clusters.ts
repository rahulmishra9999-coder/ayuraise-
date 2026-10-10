// clusters.ts — the plan engine.
//
// Turns a user's selected conditions/goals into a coherent plan using a
// 3-RESOLUTION model, because the three layers don't collapse at the same
// granularity:
//   • DIET  → cluster-level (conditions in a cluster share ~80% of the diet)
//   • YOGA  → a protocol library, chosen per condition, then filtered by
//             contraindications (BP → no inversions, etc.)
//   • DETOX → a protocol library, chosen per dosha/organ, filtered by
//             contraindications + fasting blocks (gout / T1)
//
// Diseases are also TIERED: Tier 1 (systemic — metabolic/gut/etc.) DRIVE the
// plan; Tier 2 (joint & spine) ride along as a safe CARE-LAYER. Nothing is
// dropped — safety-only conditions (hernia, kidney) still apply their rules.
//
// Standalone: not wired into the UI yet. `resolvePlan(ids, ctx)` is the entry.

export type ClusterId = "metabolic" | "joint" | "gut" | "calm" | "womens" | "respiratory" | "fitness";

export type YogaProtocolId =
  | "calm" | "energize" | "wind-down" | "cool" | "metabolic-flow" | "digestive"
  | "joint-mobility" | "spine-care" | "bone-strength" | "breath-airway"
  | "pelvic-hormonal" | "thyroid-stim" | "prenatal" | "strength-flex";

export type DetoxProtocolId =
  | "kapha-reset" | "liver-reset" | "pitta-cooling" | "agni-reset"
  | "lung-clear" | "hydrate-alkaline" | "blood-purify";

/** Tags on a practice; a practice is stripped when a selected condition forbids that tag. */
export type AvoidTag =
  | "inversion" | "retention" | "heating" | "deep-flexion" | "deep-twist"
  | "core-pressure" | "high-impact" | "fall-risk" | "throat-stim" | "prone-backbend";

export type Tier = 1 | 2; // 1 = drives the plan (systemic) · 2 = safe care-layer (joint/spine)

export interface ClusterMeta {
  id: ClusterId;
  label: string;
  emoji: string;
  covers: string[];   // related wellness areas this cluster naturally also works on
  sharedDiet: string;
  sharedHerbs: string[];
}

export interface Practice { name: string; tags?: AvoidTag[] }
export interface YogaProtocol {
  id: YogaProtocolId;
  label: string;
  timeOfDay: "am" | "pm" | "any";
  include: Practice[];
}
export interface DetoxProtocol {
  id: DetoxProtocolId;
  label: string;
  home: string[];
  fasting?: boolean;            // langhana/fasting reset → suppressed when ifBlock is on
  contraindications: string[]; // human-readable (pregnancy, frail, kidney disease…)
}

export interface ConditionMods {
  diet?: string[];
  herbs?: string[];
  safety?: string[];
}
export interface ConditionMeta {
  label: string;
  cluster: ClusterId | null;          // null = safety-only / foundation / concern
  secondary?: ClusterId;              // documentation of cross-cluster overlap
  collapsible: boolean;               // false = never a root focus (safety modifier / special)
  tier?: Tier;                        // when collapsible
  role?: "foundation" | "concern" | "safety";
  ifBlock?: boolean;                  // fasting / rapid weight-loss contraindicated
  flips?: "hypo-hyper" | "flare";     // needs a state signal to finish routing
  yogaProtocols?: YogaProtocolId[];
  detoxProtocol?: DetoxProtocolId;
  yogaAvoid?: AvoidTag[];
  mods?: ConditionMods;
}

// ------------------------------------------------------------------ clusters
export const CLUSTERS: Record<ClusterId, ClusterMeta> = {
  metabolic: { id: "metabolic", label: "Metabolic reset", emoji: "🔴", covers: ["Weight & belly fat", "Blood sugar", "Steady energy", "Intermittent fasting"], sharedDiet: "Kapha-reducing, low-GI, light & warm food; daily movement; stress care.", sharedHerbs: ["Triphala at night", "Warm lemon water on waking"] },
  joint: { id: "joint", label: "Joint & spine care", emoji: "🦴", covers: ["Mobility", "Less stiffness", "Strength"], sharedDiet: "Anti-inflammatory, warm, easy to digest.", sharedHerbs: ["Turmeric + black pepper", "Shallaki (boswellia)", "Ashwagandha"] },
  gut: { id: "gut", label: "Gut & digestion", emoji: "🌀", covers: ["Better digestion", "Less bloating", "Regular bowels"], sharedDiet: "Warm, cooked, regular meals; kindle agni; keep gaps between meals.", sharedHerbs: ["Triphala", "Jeera-saunf-ajwain tea"] },
  calm: { id: "calm", label: "Calm & sleep", emoji: "🧘", covers: ["Stress relief", "Better sleep", "Mood"], sharedDiet: "Sattvic, warm, regular meals; less caffeine.", sharedHerbs: ["Ashwagandha", "Brahmi", "Jatamansi tea in the evening"] },
  womens: { id: "womens", label: "Women's balance", emoji: "🌸", covers: ["Hormone balance", "Cycle support", "Bone health"], sharedDiet: "Hormone-supportive, stage-aware, iron-rich.", sharedHerbs: ["Shatavari"] },
  respiratory: { id: "respiratory", label: "Respiratory", emoji: "😮‍💨", covers: ["Easier breathing", "Fewer flare-ups"], sharedDiet: "Warm, kapha-reducing; avoid cold food & dairy at night.", sharedHerbs: ["Tulsi", "Mulethi", "Sitopaladi"] },
  fitness: { id: "fitness", label: "Fitness & movement", emoji: "🏋️", covers: ["Strength", "Flexibility", "Stamina"], sharedDiet: "Balanced, with adequate protein.", sharedHerbs: [] },
};

// ---------------------------------------------------------- yoga protocols
export const YOGA_PROTOCOLS: Record<YogaProtocolId, YogaProtocol> = {
  calm: { id: "calm", label: "Calm", timeOfDay: "pm", include: [{ name: "Slow forward folds" }, { name: "Nadi Shodhana" }, { name: "Bhramari" }, { name: "Yoga Nidra" }, { name: "Shavasana" }] },
  energize: { id: "energize", label: "Energize", timeOfDay: "am", include: [{ name: "Surya Namaskar", tags: ["high-impact"] }, { name: "Bhujangasana", tags: ["prone-backbend"] }, { name: "Ustrasana", tags: ["prone-backbend"] }, { name: "Bhastrika", tags: ["retention", "heating"] }, { name: "Chest openers" }] },
  "wind-down": { id: "wind-down", label: "Wind-down", timeOfDay: "pm", include: [{ name: "Legs-up-the-wall" }, { name: "Supta Baddha Konasana" }, { name: "Slow breathing" }, { name: "Yoga Nidra" }] },
  cool: { id: "cool", label: "Cool", timeOfDay: "any", include: [{ name: "Sheetali / Sheetkari" }, { name: "Chandra Namaskar (moon salutation)" }, { name: "Slow breathing" }] },
  "metabolic-flow": { id: "metabolic-flow", label: "Metabolic flow", timeOfDay: "am", include: [{ name: "Surya Namaskar rounds", tags: ["high-impact"] }, { name: "Twists", tags: ["deep-twist"] }, { name: "Mandukasana" }, { name: "Brisk standing flow" }] },
  digestive: { id: "digestive", label: "Digestive", timeOfDay: "any", include: [{ name: "Pawanmuktasana" }, { name: "Vajrasana (after meals)" }, { name: "Gentle twists", tags: ["deep-twist"] }, { name: "Malasana" }] },
  "joint-mobility": { id: "joint-mobility", label: "Joint mobility", timeOfDay: "any", include: [{ name: "Gentle range-of-motion" }, { name: "Marjariasana (cat-cow)" }, { name: "Supported poses" }] },
  "spine-care": { id: "spine-care", label: "Spine care", timeOfDay: "any", include: [{ name: "Core strengthening", tags: ["core-pressure"] }, { name: "Setu Bandha (bridge)" }, { name: "Gentle Bhujangasana", tags: ["prone-backbend"] }, { name: "Bird-dog" }] },
  "bone-strength": { id: "bone-strength", label: "Bone strength", timeOfDay: "any", include: [{ name: "Weight-bearing standing poses" }, { name: "Gentle back-extension", tags: ["prone-backbend"] }, { name: "Supported balance work", tags: ["fall-risk"] }] },
  "breath-airway": { id: "breath-airway", label: "Breath & airway", timeOfDay: "any", include: [{ name: "Diaphragmatic breathing" }, { name: "Bhramari" }, { name: "Chest opening" }] },
  "pelvic-hormonal": { id: "pelvic-hormonal", label: "Pelvic & hormonal", timeOfDay: "any", include: [{ name: "Baddha Konasana" }, { name: "Supta Baddha Konasana" }, { name: "Malasana" }, { name: "Gentle hip openers" }] },
  "thyroid-stim": { id: "thyroid-stim", label: "Thyroid-stimulating", timeOfDay: "am", include: [{ name: "Sarvangasana", tags: ["inversion", "throat-stim"] }, { name: "Halasana", tags: ["inversion", "throat-stim"] }, { name: "Ustrasana", tags: ["prone-backbend", "throat-stim"] }, { name: "Ujjayi / Simhasana", tags: ["throat-stim"] }] },
  prenatal: { id: "prenatal", label: "Prenatal (gentle)", timeOfDay: "any", include: [{ name: "Gentle stretching" }, { name: "Cat-cow" }, { name: "Supported breathing" }, { name: "Pelvic tilts" }] },
  "strength-flex": { id: "strength-flex", label: "Strength & flexibility", timeOfDay: "any", include: [{ name: "Bodyweight strength", tags: ["core-pressure"] }, { name: "Dynamic stretches" }, { name: "Standing balance", tags: ["fall-risk"] }] },
};

// --------------------------------------------------------- detox protocols
export const DETOX_PROTOCOLS: Record<DetoxProtocolId, DetoxProtocol> = {
  "kapha-reset": { id: "kapha-reset", label: "Kapha reset", home: ["A light moong-khichdi day", "CCF (cumin-coriander-fennel) tea through the day", "Morning dry-brushing"], fasting: true, contraindications: ["pregnancy", "frail / underweight", "type 1 diabetes"] },
  "liver-reset": { id: "liver-reset", label: "Liver reset", home: ["Day 1: fruit + veg juice + warm water", "Day 2-3: moong khichdi + steamed veg", "CCF tea + kutki"], fasting: true, contraindications: ["pregnancy", "grade 3 / cirrhosis", "frail"] },
  "pitta-cooling": { id: "pitta-cooling", label: "Pitta-cooling reset", home: ["A light cooling kitchari day", "Rose-water spray, coconut water", "No fried / fermented that day"], contraindications: ["pregnancy"] },
  "agni-reset": { id: "agni-reset", label: "Agni reset", home: ["A day on warm moong khichdi", "Ginger + rock salt before meals", "Saunf after meals"], contraindications: ["pregnancy (gentle only)"] },
  "lung-clear": { id: "lung-clear", label: "Lung-clear routine", home: ["Steam with ajwain once daily", "Tulsi tea twice a day", "Turmeric + mulethi milk at night"], contraindications: [] },
  "hydrate-alkaline": { id: "hydrate-alkaline", label: "Hydrating alkaline reset", home: ["Plenty of water + barley water", "Low-purine, alkalizing foods", "No alcohol / sugary drinks"], contraindications: ["kidney disease → doctor first"] },
  "blood-purify": { id: "blood-purify", label: "Blood-purify (raktashodhana)", home: ["Neem / manjistha (short course)", "Amla daily", "Bitter greens"], contraindications: ["pregnancy"] },
};

// -------------------------------------------------- condition & goal → meta
export const CONDITIONS_META: Record<string, ConditionMeta> = {
  // ---- Metabolic (Tier 1) ----
  diabetes: { label: "Diabetes", cluster: "metabolic", collapsible: true, tier: 1, yogaProtocols: ["metabolic-flow", "digestive"], detoxProtocol: "kapha-reset", mods: { diet: ["Low-GI; bitter foods (methi, karela, jamun)"], herbs: ["Gudmar", "Vijaysar", "Cinnamon"], safety: ["On insulin/sulfonylurea: eat before practice; don't fast without a doctor", "Vision changes → avoid inversions & breath-retention", "Foot numbness → foot-safe yoga, no risky balances"] } },
  hypertension: { label: "BP / Hypertension", cluster: "metabolic", collapsible: true, tier: 1, yogaProtocols: ["calm", "cool"], yogaAvoid: ["inversion", "retention", "heating"], detoxProtocol: "pitta-cooling", mods: { diet: ["Low salt"], herbs: ["Arjuna bark tea", "1 garlic pod on empty stomach", "Lauki (bottle-gourd) juice"], safety: ["Very high reading or chest pain / vision changes → urgent care"] } },
  thyroid: { label: "Thyroid", cluster: "metabolic", collapsible: true, tier: 1, flips: "hypo-hyper", yogaProtocols: ["calm"], mods: { herbs: ["Ashwagandha (hypo)", "Coriander-seed water"], safety: ["Uncontrolled on meds → review dose with doctor", "Hyper: avoid throat-stimulating & heating practice"] } },
  cholesterol: { label: "Cholesterol", cluster: "metabolic", collapsible: true, tier: 1, yogaProtocols: ["metabolic-flow"], detoxProtocol: "kapha-reset", mods: { diet: ["High-fibre; flax, oats; high LDL → cut fried/sat-fat, high triglycerides → cut sugar/alcohol"], herbs: ["Arjuna", "Guggulu", "Triphala"] } },
  "fatty-liver": { label: "Fatty Liver", cluster: "metabolic", collapsible: true, tier: 1, yogaProtocols: ["metabolic-flow", "digestive"], detoxProtocol: "liver-reset", mods: { diet: ["No fried / sugar / alcohol; IF is a lead lever"], herbs: ["Kutki", "Bhumi-amla", "Amla"], safety: ["Grade 3 / cirrhosis → gentle + medical monitoring", "Alcohol-related → stopping alcohol is essential; see a doctor"] } },
  gout: { label: "Gout / Uric Acid", cluster: "metabolic", collapsible: true, tier: 1, ifBlock: true, flips: "flare", yogaProtocols: ["joint-mobility"], detoxProtocol: "hydrate-alkaline", mods: { diet: ["Low-purine, high hydration; no alcohol / sugary drinks"], herbs: ["Giloy", "Punarnava", "Gokshura"], safety: ["No aggressive fasting / rapid weight loss (triggers flares)", "Fever + hot swollen joint → could be septic, urgent care", "During a flare: rest the joint, no yoga on it"] } },
  metabolic: { label: "Metabolic health", cluster: "metabolic", collapsible: true, tier: 1, yogaProtocols: ["metabolic-flow"], detoxProtocol: "kapha-reset" },
  "weight-loss": { label: "Weight loss", cluster: "metabolic", collapsible: true, tier: 1, yogaProtocols: ["metabolic-flow"], detoxProtocol: "kapha-reset" },

  // ---- Gut (Tier 1) ----
  "acidity-gerd": { label: "Acidity / GERD", cluster: "gut", collapsible: true, tier: 1, yogaProtocols: ["digestive"], yogaAvoid: ["inversion", "core-pressure", "prone-backbend"], detoxProtocol: "pitta-cooling", mods: { diet: ["Cooling; no chili/coffee/sour/fermented; small, early dinner; don't lie down after eating"], herbs: ["Amla", "Cold milk / coconut water"] } },
  ibs: { label: "IBS", cluster: "gut", collapsible: true, tier: 1, yogaProtocols: ["digestive", "calm"], detoxProtocol: "agni-reset", mods: { diet: ["Warm, cooked, regular meals; buttermilk + jeera"], herbs: ["Isabgol", "Triphala (gentle)"] } },
  constipation: { label: "Constipation", cluster: "gut", collapsible: true, tier: 1, yogaProtocols: ["digestive"], detoxProtocol: "agni-reset", mods: { diet: ["More fibre & water; soaked raisins / figs"], herbs: ["Triphala at night", "Warm water on waking"] } },
  indigestion: { label: "Indigestion", cluster: "gut", collapsible: true, tier: 1, yogaProtocols: ["digestive"], detoxProtocol: "agni-reset", mods: { herbs: ["Ginger + rock salt before meals", "Hingvashtak", "Saunf after meals"] } },

  // ---- Respiratory (Tier 1) ----
  asthma: { label: "Asthma", cluster: "respiratory", collapsible: true, tier: 1, yogaProtocols: ["breath-airway"], detoxProtocol: "lung-clear", mods: { diet: ["Warm; avoid cold food / dairy / curd at night"], herbs: ["Tulsi", "Mulethi", "Sitopaladi", "Chyawanprash"], safety: ["Never do breathwork mid-attack; severe attack → emergency care"] } },

  // ---- Calm & sleep (Tier 1) ----
  migraine: { label: "Migraine", cluster: "calm", secondary: "metabolic", collapsible: true, tier: 1, ifBlock: true, yogaProtocols: ["calm", "cool"], yogaAvoid: ["inversion", "retention", "heating"], detoxProtocol: "pitta-cooling", mods: { diet: ["Regular meals (no fasting); remove trigger foods (fermented, aged, caffeine)"], herbs: ["Brahmi", "Jatamansi", "Ginger tea at first sign"] } },
  stress: { label: "Stress", cluster: "calm", collapsible: true, tier: 1, yogaProtocols: ["calm"], mods: { herbs: ["Ashwagandha", "Brahmi", "Jatamansi tea in the evening"] } },
  "better-sleep": { label: "Better sleep", cluster: "calm", collapsible: true, tier: 1, yogaProtocols: ["wind-down"], mods: { herbs: ["Ashwagandha with warm milk at night", "Nutmeg in warm milk"] } },

  // ---- Joint & spine (Tier 2 — safe care-layer) ----
  "knee-pain": { label: "Knee Pain", cluster: "joint", collapsible: true, tier: 2, yogaProtocols: ["joint-mobility"], yogaAvoid: ["high-impact"] },
  "hip-pain": { label: "Hip Pain", cluster: "joint", collapsible: true, tier: 2, yogaProtocols: ["joint-mobility", "pelvic-hormonal"], yogaAvoid: ["high-impact"] },
  "back-pain": { label: "Back Pain", cluster: "joint", collapsible: true, tier: 2, yogaProtocols: ["spine-care"], yogaAvoid: ["deep-flexion"] },
  "neck-pain": { label: "Neck Pain", cluster: "joint", collapsible: true, tier: 2, yogaProtocols: ["spine-care"], yogaAvoid: ["inversion"] },
  sciatica: { label: "Sciatica", cluster: "joint", collapsible: true, tier: 2, yogaProtocols: ["spine-care"], yogaAvoid: ["deep-flexion", "deep-twist"], mods: { safety: ["New bladder / bowel changes → urgent doctor"] } },
  arthritis: { label: "Arthritis", cluster: "joint", secondary: "metabolic", collapsible: true, tier: 2, yogaProtocols: ["joint-mobility"], mods: { herbs: ["Turmeric", "Shallaki"] } },
  osteoporosis: { label: "Osteoporosis", cluster: "joint", secondary: "womens", collapsible: true, tier: 2, yogaProtocols: ["bone-strength"], yogaAvoid: ["deep-flexion", "deep-twist", "fall-risk", "inversion"], mods: { diet: ["Calcium, vitamin D, sesame, ragi"] } },

  // ---- Women's ----
  "pcos-pcod": { label: "PCOS / PCOD", cluster: "metabolic", secondary: "womens", collapsible: true, tier: 1, yogaProtocols: ["metabolic-flow", "pelvic-hormonal"], detoxProtocol: "kapha-reset", mods: { herbs: ["Shatavari", "Spearmint tea", "Cinnamon"] } },
  menopause: { label: "Menopause", cluster: "womens", secondary: "joint", collapsible: true, tier: 1, yogaProtocols: ["cool", "bone-strength", "pelvic-hormonal"], mods: { diet: ["Phytoestrogens (flax / soy)"], herbs: ["Shatavari", "Ashwagandha"] } },

  // ---- Fitness goals ----
  strength: { label: "Strength", cluster: "fitness", collapsible: true, tier: 1, yogaProtocols: ["strength-flex"] },
  flexibility: { label: "Flexibility", cluster: "fitness", collapsible: true, tier: 1, yogaProtocols: ["strength-flex"] },
  mobility: { label: "Mobility", cluster: "fitness", collapsible: true, tier: 1, yogaProtocols: ["strength-flex", "joint-mobility"] },
  posture: { label: "Posture", cluster: "fitness", collapsible: true, tier: 1, yogaProtocols: ["spine-care", "strength-flex"] },

  // ---- Safety-only modifiers (never a focus, always applied) ----
  hernia: { label: "Hernia", cluster: null, collapsible: false, role: "safety", yogaAvoid: ["core-pressure", "deep-twist", "retention", "inversion", "high-impact"], mods: { safety: ["No heavy lifting or strong core work; hiatal → reflux diet"] } },
  autoimmune: { label: "Auto-immune", cluster: null, collapsible: false, role: "safety", flips: "flare", yogaProtocols: ["calm", "joint-mobility"], mods: { diet: ["Anti-inflammatory; gluten-free if celiac"], safety: ["Gentle-only during a flare; on immunosuppressants → caution"] } },

  // ---- Foundation (used when nothing else is selected) ----
  "general-wellness": { label: "General wellness", cluster: null, collapsible: false, role: "foundation", yogaProtocols: ["calm"], mods: { herbs: ["Chyawanprash", "Triphala", "Amla"] } },
  "healthy-ageing": { label: "Healthy ageing", cluster: null, collapsible: false, role: "foundation", yogaProtocols: ["strength-flex", "calm", "bone-strength"], mods: { herbs: ["Chyawanprash", "Ashwagandha", "Brahmi"] } },

  // ---- Concerns (companion layers — don't take a focus slot) ----
  "hair-fall": { label: "Hair fall / scalp", cluster: null, collapsible: false, role: "concern", detoxProtocol: "blood-purify", mods: { diet: ["Protein, iron + vitamin C, zinc, B12, vitamin D"], herbs: ["Bhringraj / amla / brahmi oil", "Methi", "Shiro abhyanga (scalp massage)"], safety: ["Patchy or scarring loss → see a dermatologist"] } },

  // ---- Special ----
  pregnancy: { label: "Pregnancy", cluster: null, collapsible: false, role: "safety", yogaProtocols: ["prenatal"], yogaAvoid: ["inversion", "retention", "heating", "deep-twist", "deep-flexion", "core-pressure", "prone-backbend", "high-impact", "fall-risk"], mods: { safety: ["Doctor-guided only; no detox / fasting; herbs only with a doctor"] } },

  // ---- App goal vocabulary (goals.ts organ / fitness / women's groups) ----
  obesity: { label: "Obesity", cluster: "metabolic", collapsible: true, tier: 1, yogaProtocols: ["metabolic-flow"], detoxProtocol: "kapha-reset" },
  osteoarthritis: { label: "Osteoarthritis", cluster: "joint", collapsible: true, tier: 2, yogaProtocols: ["joint-mobility"], mods: { herbs: ["Turmeric", "Shallaki"] } },
  heart: { label: "Heart health", cluster: "metabolic", collapsible: true, tier: 1, yogaProtocols: ["calm", "cool"], yogaAvoid: ["retention", "heating"], mods: { diet: ["Heart-friendly: low salt, high fibre, healthy fats"], herbs: ["Arjuna bark tea", "Ground flax"], safety: ["Chest pain / breathlessness on exertion → urgent care"] } },
  liver: { label: "Liver health", cluster: "metabolic", collapsible: true, tier: 1, yogaProtocols: ["metabolic-flow", "digestive"], detoxProtocol: "liver-reset", mods: { diet: ["No fried / alcohol / excess sugar"], herbs: ["Kutki", "Bhumi-amla", "Amla"] } },
  gut: { label: "Gut health", cluster: "gut", collapsible: true, tier: 1, yogaProtocols: ["digestive"], detoxProtocol: "agni-reset" },
  lungs: { label: "Lung health", cluster: "respiratory", collapsible: true, tier: 1, yogaProtocols: ["breath-airway"], detoxProtocol: "lung-clear", mods: { herbs: ["Tulsi", "Mulethi", "Chyawanprash"] } },
  brain: { label: "Brain & focus", cluster: "calm", collapsible: true, tier: 1, yogaProtocols: ["calm"], mods: { herbs: ["Brahmi", "Shankhpushpi"] } },
  pancreas: { label: "Pancreas / blood sugar", cluster: "metabolic", collapsible: true, tier: 1, yogaProtocols: ["metabolic-flow"], detoxProtocol: "kapha-reset", mods: { herbs: ["Methi water", "Gudmar"] } },
  "bones-joints": { label: "Bones & joints", cluster: "joint", collapsible: true, tier: 2, yogaProtocols: ["joint-mobility", "bone-strength"], mods: { diet: ["Calcium, vitamin D, sesame"] } },
  muscles: { label: "Muscles", cluster: "fitness", collapsible: true, tier: 1, yogaProtocols: ["strength-flex"] },
  "muscle-building": { label: "Muscle building", cluster: "fitness", collapsible: true, tier: 1, yogaProtocols: ["strength-flex"] },
  premenopause: { label: "Pre-menopause", cluster: "womens", collapsible: true, tier: 1, yogaProtocols: ["cool", "pelvic-hormonal"], mods: { herbs: ["Shatavari"] } },
  postmenopause: { label: "Post-menopause", cluster: "womens", secondary: "joint", collapsible: true, tier: 1, yogaProtocols: ["cool", "bone-strength", "pelvic-hormonal"], mods: { diet: ["Phytoestrogens (flax / soy)"], herbs: ["Shatavari", "Ashwagandha"] } },
  "sr-fitness": { label: "Senior fitness", cluster: "fitness", collapsible: true, tier: 1, yogaProtocols: ["joint-mobility", "bone-strength", "strength-flex"] },
  balance: { label: "Balance & stability", cluster: "fitness", collapsible: true, tier: 1, yogaProtocols: ["bone-strength", "strength-flex"] },
  mood: { label: "Lift mood", cluster: "calm", collapsible: true, tier: 1, yogaProtocols: ["energize", "calm"], mods: { herbs: ["Ashwagandha", "Brahmi"] } },
  pranayam: { label: "Breathwork", cluster: "calm", collapsible: true, tier: 1, yogaProtocols: ["calm", "breath-airway"] },
  "post-natal": { label: "Post-natal", cluster: "womens", collapsible: true, tier: 1, yogaProtocols: ["pelvic-hormonal", "calm"], mods: { herbs: ["Shatavari", "Ajwain water"] } },
  // concerns / organ goals with no single cluster
  hair: { label: "Hair fall / scalp", cluster: null, collapsible: false, role: "concern", detoxProtocol: "blood-purify", mods: { diet: ["Protein, iron + vitamin C, zinc, B12, vitamin D"], herbs: ["Bhringraj / amla / brahmi oil", "Methi", "Shiro abhyanga (scalp massage)"], safety: ["Patchy or scarring loss → see a dermatologist"] } },
  skin: { label: "Skin / glow", cluster: null, collapsible: false, role: "concern", detoxProtocol: "blood-purify", mods: { diet: ["Cooling, anti-inflammatory; enough water"], herbs: ["Neem", "Manjistha", "Amla"], safety: ["Spreading rash or severe skin issue → see a doctor"] } },
  immunity: { label: "Immunity", cluster: null, collapsible: false, role: "concern", yogaProtocols: ["breath-airway"], mods: { herbs: ["Chyawanprash", "Tulsi", "Amla"] } },
  eyes: { label: "Eye health", cluster: null, collapsible: false, role: "foundation", yogaProtocols: ["calm"], mods: { herbs: ["Triphala (netra care)", "Amla"], safety: ["Sudden vision changes → see a doctor"] } },
  prostate: { label: "Prostate", cluster: null, collapsible: false, role: "foundation", mods: { herbs: ["Gokshura", "Varun (crataeva)"], safety: ["Trouble urinating or blood in urine → see a doctor"] } },
  kidney: { label: "Kidney", cluster: null, collapsible: false, role: "foundation", mods: { diet: ["Plenty of water; low salt; go easy on protein if advised"], herbs: ["Punarnava", "Gokshura"], safety: ["Known kidney disease → check with your doctor before any detox, fasting or new herbs"] } },
};

export function conditionMeta(id: string): ConditionMeta | undefined { return CONDITIONS_META[id]; }

/** Rough 1–3 severity from a condition's answers (numbers vs ranges). Higher = worse / less controlled. */
export function conditionSeverity(id: string, d: Record<string, string> = {}): number {
  const num = (s?: string) => { const n = parseFloat(String(s ?? "").replace(/[^0-9.]/g, "")); return Number.isNaN(n) ? NaN : n; };
  switch (id) {
    case "diabetes": {
      let s = 1;
      const h = num(d.hba1c); if (!Number.isNaN(h)) s = h >= 9 ? 3 : h >= 7 ? 2 : 1;
      const f = num(d.fasting); if (!Number.isNaN(f)) s = Math.max(s, f >= 180 ? 3 : f >= 126 ? 2 : 1);
      if (d.control === "No") s = Math.max(s, 2.5);
      if (d.symptoms) s += Math.min(1, d.symptoms.split(",").filter(Boolean).length * 0.3);
      if (d.type === "Pre-diabetic") s = Math.min(s, 1);
      return s;
    }
    case "hypertension": {
      let s = 1;
      const m = String(d.bp ?? "").match(/(\d+)\s*\/\s*(\d+)/);
      if (m) { const sys = +m[1], dia = +m[2]; s = (sys >= 160 || dia >= 100) ? 3 : (sys >= 140 || dia >= 90) ? 2 : 1; }
      if (d.control === "No") s = Math.max(s, 2.5);
      return s;
    }
    case "cholesterol": {
      let s = 1;
      const ldl = num(d.ldl); if (!Number.isNaN(ldl)) s = ldl >= 160 ? 3 : ldl >= 130 ? 2 : 1;
      const tg = num(d.trig); if (!Number.isNaN(tg)) s = Math.max(s, tg >= 200 ? 2.5 : 1);
      return s;
    }
    case "thyroid": {
      const t = num(d.tsh);
      if (!Number.isNaN(t)) { const dev = t > 4 ? t - 4 : t < 0.4 ? 0.4 - t : 0; return dev > 6 ? 3 : dev > 2 ? 2 : dev > 0 ? 1.5 : 1; }
      return d.control === "No" ? 2 : 1;
    }
    case "fatty-liver": return d.grade === "Grade 3" ? 3 : d.grade === "Grade 2" ? 2 : 1;
    case "gout": { let s = d.flaring === "Yes" ? 3 : 1; if (d.freq === "Monthly+") s = Math.max(s, 2.5); else if (d.freq === "A few / year") s = Math.max(s, 1.5); return s; }
    case "asthma": return d.freq === "Daily" ? 3 : d.freq === "Weekly" ? 2.5 : d.freq === "Monthly" ? 1.5 : 1;
    default: {
      let s = 1.2;
      if (d.nerve === "Yes" || d.swelling === "Yes") s += 0.5;
      if (d.redflag && d.redflag.split(",").filter(Boolean).length) s += 0.5;
      return s;
    }
  }
}

// ------------------------------------------------------------------ resolver
export interface ResolveCtx {
  thyroid?: "hypo" | "hyper"; // finishes the thyroid flip
  pregnant?: boolean;
  frail?: boolean;            // underweight / depleted → detox suppressed
  stressed?: boolean;         // assessed from the Mind step → light auto calm layer
  poorSleep?: boolean;        // waking tired (Groggy/Exhausted) → light auto sleep layer
  sleepHours?: number;        // actual hours slept — decides extend-duration vs improve-quality advice
}

export interface RootFocus {
  cluster: ClusterMeta;
  tier: Tier;
  conditionIds: string[];
  primaryId: string;  // highest-severity condition in the cluster (auto)
  diet: string;      // the cluster's shared diet direction
  dietMods: string[]; // per-condition diet tweaks, merged
  herbs: string[];   // shared + per-condition herbs, merged
}

export interface CollapseResult {
  rootFoci: RootFocus[];   // Tier 1 clusters — drive the plan (most conditions first)
  careLayers: RootFocus[]; // Tier 2 clusters (joint/spine) — ride along
  safety: string[];        // always-on safety lines (deduped)
  concerns: string[];      // concern ids (hair, …)
  foundation: string[];    // foundation ids used when nothing else applies
  flips: { id: string; kind: "hypo-hyper" | "flare" }[];
  ifBlocked: boolean;
}

export interface ResolvedYoga { am: string[]; pm: string[]; anytime: string[]; avoided: AvoidTag[] }
export interface ResolvedDetox { protocols: DetoxProtocol[]; skipped: { id: DetoxProtocolId; reason: string }[] }

/** A light, auto-included support block (from assessment, not a chosen goal). */
export interface SupportLayer { id: string; label: string; note: string; practices: string[]; herbs: string[] }

/** A chosen goal that clashes with a condition/state — surfaced as a warning. */
export interface Conflict { goal: string; action: "block" | "adapt" | "caution"; note: string }

// Light "background" versions of stress/sleep support — auto-added when the profile
// shows the need but the user hasn't chosen them as a headline (deeper) goal.
const AUTO_LAYERS: Record<string, SupportLayer> = {
  calm: { id: "calm", label: "Everyday calm", note: "Added because your answers point to some stress.", practices: ["5 min of Bhramari or slow breathing", "A short evening wind-down"], herbs: ["Ashwagandha or Tulsi tea"] },
  sleep: { id: "sleep", label: "Better sleep", note: "Added because your sleep looks a bit disrupted.", practices: ["A calming wind-down routine", "Legs-up-the-wall before bed"], herbs: ["Warm milk with a pinch of nutmeg"] },
};

export interface Plan {
  focus: RootFocus[];
  careLayers: RootFocus[];
  layers: SupportLayer[];   // auto-included stress/sleep support (assessment-driven)
  yoga: ResolvedYoga;
  detox: ResolvedDetox;
  safety: string[];
  concerns: string[];
  foundation: string[];
  flips: { id: string; kind: "hypo-hyper" | "flare" }[];
  conflicts: Conflict[];    // chosen goals that clash with a condition/state
}

const uniq = (xs: string[]): string[] => Array.from(new Set(xs));

/** Group conditions into clusters (diet + tiering), collect safety/concerns/flags. */
export function collapseConditions(ids: string[], details: Record<string, Record<string, string>> = {}): CollapseResult {
  const safety: string[] = [];
  const concerns: string[] = [];
  const foundation: string[] = [];
  const flips: { id: string; kind: "hypo-hyper" | "flare" }[] = [];
  let ifBlocked = false;
  const byCluster = new Map<ClusterId, string[]>();

  for (const id of ids) {
    const m = CONDITIONS_META[id];
    if (!m) continue;
    if (m.mods?.safety) safety.push(...m.mods.safety);
    if (m.ifBlock) ifBlocked = true;
    if (m.flips) flips.push({ id, kind: m.flips });
    if (m.role === "foundation") { foundation.push(id); continue; }
    if (m.role === "concern") { concerns.push(id); continue; }
    if (!m.collapsible || !m.cluster) continue; // safety-only — its mods are already captured
    const arr = byCluster.get(m.cluster) ?? [];
    arr.push(id);
    byCluster.set(m.cluster, arr);
  }

  const makeFocus = (cid: ClusterId, condIds: string[]): RootFocus => {
    const cluster = CLUSTERS[cid];
    const dietMods: string[] = [];
    const herbs: string[] = [];
    let tier: Tier = 1;
    for (const id of condIds) {
      const m = CONDITIONS_META[id];
      if (!m) continue;
      if (m.tier === 2) tier = 2;
      if (m.mods?.diet) dietMods.push(...m.mods.diet);
      if (m.mods?.herbs) herbs.push(...m.mods.herbs);
    }
    let primaryId = condIds[0] ?? "";
    let best = -1;
    for (const id of condIds) { const sv = conditionSeverity(id, details[id] ?? {}); if (sv > best) { best = sv; primaryId = id; } }
    return { cluster, tier, conditionIds: uniq(condIds), primaryId, diet: cluster.sharedDiet, dietMods: uniq(dietMods), herbs: uniq([...cluster.sharedHerbs, ...herbs]) };
  };

  const foci: RootFocus[] = [];
  byCluster.forEach((condIds, cid) => foci.push(makeFocus(cid, condIds)));

  const rootFoci = foci.filter((f) => f.tier === 1).sort((a, b) => b.conditionIds.length - a.conditionIds.length);
  const careLayers = foci.filter((f) => f.tier === 2);

  return { rootFoci, careLayers, safety: uniq(safety), concerns: uniq(concerns), foundation: uniq(foundation), flips, ifBlocked };
}

/** Union of yoga protocols across selected conditions, time-split, minus contraindicated poses. */
export function resolveYoga(ids: string[], ctx: ResolveCtx = {}, avoidFrom: string[] = []): ResolvedYoga {
  const avoid = new Set<AvoidTag>();
  const protoIds = new Set<YogaProtocolId>();

  for (const id of ids) {
    const m = CONDITIONS_META[id];
    if (!m) continue;
    (m.yogaAvoid ?? []).forEach((t) => avoid.add(t));
    (m.yogaProtocols ?? []).forEach((p) => protoIds.add(p));
    if (id === "thyroid" && ctx.thyroid === "hypo") protoIds.add("thyroid-stim");
  }
  // background conditions add their contraindications (safety) — not new protocols
  for (const id of avoidFrom) {
    const m = CONDITIONS_META[id];
    if (m) (m.yogaAvoid ?? []).forEach((t) => avoid.add(t));
  }
  if (ctx.thyroid === "hyper") { avoid.add("throat-stim"); avoid.add("heating"); }
  if (ctx.pregnant) {
    (["inversion", "retention", "heating", "deep-twist", "deep-flexion", "core-pressure", "prone-backbend", "high-impact", "fall-risk"] as AvoidTag[]).forEach((t) => avoid.add(t));
    protoIds.clear();
    protoIds.add("prenatal");
  }

  const am: string[] = [];
  const pm: string[] = [];
  const anytime: string[] = [];
  const used = new Set<string>();
  const avoided = new Set<AvoidTag>();

  protoIds.forEach((pid) => {
    const proto = YOGA_PROTOCOLS[pid];
    if (!proto) return;
    for (const pr of proto.include) {
      const blocked = (pr.tags ?? []).find((t) => avoid.has(t));
      if (blocked) { avoided.add(blocked); continue; }
      if (used.has(pr.name)) continue;
      used.add(pr.name);
      (proto.timeOfDay === "am" ? am : proto.timeOfDay === "pm" ? pm : anytime).push(pr.name);
    }
  });

  return { am, pm, anytime, avoided: Array.from(avoided) };
}

/** Pick detox protocols per dosha/organ, minus contraindications and fasting blocks. */
export function resolveDetox(ids: string[], ctx: ResolveCtx = {}, blockFrom: string[] = []): ResolvedDetox {
  const wantIds = new Set<DetoxProtocolId>();
  let ifBlocked = false;
  for (const id of ids) {
    const m = CONDITIONS_META[id];
    if (!m) continue;
    if (m.detoxProtocol) wantIds.add(m.detoxProtocol);
    if (m.ifBlock) ifBlocked = true;
  }
  // background conditions can still block fasting (e.g. a gout the plan isn't focused on)
  for (const id of blockFrom) { const m = CONDITIONS_META[id]; if (m?.ifBlock) ifBlocked = true; }

  const protocols: DetoxProtocol[] = [];
  const skipped: { id: DetoxProtocolId; reason: string }[] = [];

  wantIds.forEach((pid) => {
    const p = DETOX_PROTOCOLS[pid];
    if (!p) return;
    if (ctx.pregnant && p.contraindications.some((c) => c.startsWith("pregnancy"))) { skipped.push({ id: pid, reason: "pregnancy" }); return; }
    if (ctx.frail && p.contraindications.some((c) => c.includes("frail"))) { skipped.push({ id: pid, reason: "frail / low reserves" }); return; }
    if (ifBlocked && p.fasting) { skipped.push({ id: pid, reason: "fasting not advised (e.g. gout / type 1 diabetes)" }); return; }
    protocols.push(p);
  });

  return { protocols, skipped };
}

// A chosen goal can clash with a condition/state. The plan still stays safe (the
// pose/fasting filters handle execution), but these surface a plain-language warning.
interface ConflictRule { goal: string; test: (ctx: ResolveCtx, ids: string[]) => boolean; action: "block" | "adapt" | "caution"; note: string }
const CONFLICT_RULES: ConflictRule[] = [
  { goal: "weight-loss", test: (c) => !!c.pregnant, action: "block", note: "We won't push weight loss while you're pregnant — we'll support you gently instead." },
  { goal: "obesity", test: (c) => !!c.pregnant, action: "block", note: "No weight-loss push while pregnant — gentle support only." },
  { goal: "metabolic", test: (c) => !!c.pregnant, action: "block", note: "We'll pause fasting / metabolic work while you're pregnant." },
  { goal: "weight-loss", test: (c) => !!c.frail, action: "adapt", note: "Your BMI is low — we'll focus on nourishing you steadily, not a calorie deficit." },
  { goal: "obesity", test: (c) => !!c.frail, action: "adapt", note: "Your BMI is low — we'll nourish rather than restrict." },
  { goal: "weight-loss", test: (c) => c.thyroid === "hyper", action: "caution", note: "An overactive thyroid can itself cause weight loss — let's steady your thyroid first, with your doctor." },
  { goal: "strength", test: (_c, ids) => ids.includes("hernia"), action: "adapt", note: "With a hernia, we'll build strength gently — no heavy lifting or strong core work." },
  { goal: "strength", test: (_c, ids) => ids.includes("osteoporosis"), action: "adapt", note: "With osteoporosis, we'll keep strength safe — no high-impact or fall-risk moves." },
  { goal: "mobility", test: (_c, ids) => ids.includes("osteoporosis"), action: "adapt", note: "With osteoporosis, mobility work stays gentle and fall-safe." },
];

/** Chosen goals that clash with a condition/state (goalIds = chosen; allIds = full picture). */
export function resolveConflicts(goalIds: string[], ctx: ResolveCtx = {}, allIds: string[] = goalIds): Conflict[] {
  const out: Conflict[] = [];
  for (const r of CONFLICT_RULES) {
    if (goalIds.includes(r.goal) && r.test(ctx, allIds)) out.push({ goal: r.goal, action: r.action, note: r.note });
  }
  return out;
}

/** Full plan from selected condition/goal ids + optional context signals. */
export function resolvePlan(ids: string[], ctx: ResolveCtx = {}, background: string[] = [], details: Record<string, Record<string, string>> = {}): Plan {
  const all = Array.from(new Set([...ids, ...background]));
  const c = collapseConditions(ids, details);    // focus / diet from the chosen goals (keeps plans distinct)
  const cAll = collapseConditions(all, details); // safety / care-layers / concerns from the whole person

  // Auto-layers: assessed stress/sleep get a LIGHT background layer — unless the user
  // chose them as a headline goal, in which case they're already the (deeper) focus.
  const layers: SupportLayer[] = [];
  if (ctx.stressed && !ids.includes("stress") && !ids.includes("mood")) layers.push(AUTO_LAYERS.calm);
  if (ctx.poorSleep && !ids.includes("better-sleep")) {
    // waking tired on short sleep → extend duration; waking tired despite enough hours → a quality problem
    const short = typeof ctx.sleepHours === "number" && ctx.sleepHours > 0 && ctx.sleepHours < 6.5;
    layers.push({
      ...AUTO_LAYERS.sleep,
      note: short
        ? "Added because you're waking tired on short sleep — let's gently extend it."
        : "Added because you're waking tired even with enough hours — let's work on sleep quality.",
      practices: short
        ? ["Aim to add 30–60 min of sleep", "A calming wind-down routine", "Legs-up-the-wall before bed"]
        : ["Keep a steady sleep & wake time", "A calming wind-down routine", "Legs-up-the-wall before bed"],
    });
  }

  return {
    focus: c.rootFoci,
    careLayers: cAll.careLayers,
    layers,
    yoga: resolveYoga(ids, ctx, background),
    detox: resolveDetox(ids, ctx, background),
    safety: cAll.safety,
    concerns: cAll.concerns,
    foundation: c.foundation,
    flips: cAll.flips,
    conflicts: resolveConflicts(ids, ctx, all),
  };
}
