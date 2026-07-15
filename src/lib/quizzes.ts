export type QuizCategory =
  | "diet"
  | "weight-loss"
  | "if"
  | "fasting"
  | "yoga"
  | "exercise"
  | "meditation"
  | "detox"
  | "disease";

export interface QuizQuestion {
  q: string;
  options: string[];
  correct: number; // index
  concept: string; // short read shown after answering
  readMore?: { label: string; url: string };
}

export interface Quiz {
  id: QuizCategory;
  title: string;
  emoji: string;
  blurb: string;
  questions: QuizQuestion[];
}

export const QUIZZES: Record<QuizCategory, Quiz> = {
  diet: {
    id: "diet",
    title: "Eat Smart",
    emoji: "🥗",
    blurb: "Ayurvedic eating, the 6 tastes & meal timing.",
    questions: [
      {
        q: "Which meal does Ayurveda say should be the largest?",
        options: ["Breakfast", "Lunch", "Dinner", "Late-night snack"],
        correct: 1,
        concept:
          "Agni (digestive fire) peaks at midday with the sun. A heavy lunch is digested cleanly; a heavy dinner ferments overnight and builds ama (toxins).",
        readMore: { label: "Harvard — The Best Time to Eat", url: "https://www.health.harvard.edu/staying-healthy/when-you-eat-may-be-as-important-as-what-you-eat" },
      },
      {
        q: "Ayurveda recognises how many tastes (rasas) every meal should ideally include?",
        options: ["3", "5", "6", "7"],
        correct: 2,
        concept:
          "Sweet, sour, salty, pungent, bitter, astringent. Including all six in a day balances all three doshas and reduces cravings.",
        readMore: { label: "NIH — Ayurveda overview", url: "https://www.nccih.nih.gov/health/ayurvedic-medicine-in-depth" },
      },
      {
        q: "Which is a LOW-glycemic carb that releases glucose slowly?",
        options: ["White rice", "Cornflakes", "Steel-cut oats", "Watermelon"],
        correct: 2,
        concept:
          "Low-GI foods (oats, legumes, most vegetables) blunt the blood-sugar spike, reduce hunger between meals and lower disease risk.",
        readMore: { label: "Harvard — Glycemic index", url: "https://www.health.harvard.edu/diseases-and-conditions/glycemic-index-and-glycemic-load-for-100-foods" },
      },
      {
        q: "What should you ideally drink with meals?",
        options: ["Ice water", "Warm water, sip by sip", "Cold soda", "Nothing for an hour"],
        correct: 1,
        concept:
          "Ice water shocks agni and slows digestion. Small sips of warm water keep enzymes active and food moving.",
      },
      {
        q: "A Pitta-dominant person should eat MORE of:",
        options: ["Chillies & fried food", "Cooling foods like cucumber, coconut, sweet fruit", "Hot coffee", "Aged cheese"],
        correct: 1,
        concept:
          "Pitta runs hot. Cooling, sweet and bitter foods pacify it; hot, sour, oily, salty foods aggravate it (acidity, anger, rashes).",
        readMore: { label: "InsideTracker — Nutrition", url: "https://blog.insidetracker.com/nutrition" },
      },
      {
        q: "Best gap between dinner and bedtime?",
        options: ["0–30 min", "1 hour", "At least 2–3 hours", "Doesn't matter"],
        correct: 2,
        concept:
          "Eating close to sleep raises insulin overnight, disrupts melatonin and lowers sleep quality. Aim for a light dinner before sunset.",
      },
      {
        q: "Which oil is best for daily Indian cooking?",
        options: ["Refined sunflower", "Cold-pressed mustard or ghee", "Margarine", "Vanaspati"],
        correct: 1,
        concept:
          "Traditional unrefined fats (ghee, cold-pressed mustard, sesame, coconut) handle Indian cooking temperatures without forming trans fats.",
      },
      {
        q: "Eating in front of a screen mainly causes:",
        options: ["Better digestion", "More mindful eating", "Overeating & poor digestion", "Faster metabolism"],
        correct: 2,
        concept:
          "Distracted eating bypasses satiety signals — people consume 25–50% more and digest worse. Eat seated, screen-free, in 15+ minutes.",
        readMore: { label: "Harvard — Mindful eating", url: "https://www.health.harvard.edu/staying-healthy/8-steps-to-mindful-eating" },
      },
    ],
  },

  "weight-loss": {
    id: "weight-loss",
    title: "Lose Weight, Keep It Off",
    emoji: "⚖️",
    blurb: "Calories, metabolism and what actually works.",
    questions: [
      {
        q: "Sustainable, safe weight loss is roughly:",
        options: ["2–4 kg per week", "0.25–1 kg per week", "5 kg per week", "Only by skipping all meals"],
        correct: 1,
        concept:
          "Aggressive losses are mostly water and muscle. 0.25–1 kg/week protects muscle, keeps metabolism steady and is far more likely to stick.",
        readMore: { label: "CDC — Healthy weight loss", url: "https://www.cdc.gov/healthyweight/losing_weight/index.html" },
      },
      {
        q: "Why does crash dieting backfire?",
        options: ["Boosts metabolism", "Increases muscle", "Lowers BMR, raises hunger hormones", "Cures cravings"],
        correct: 2,
        concept:
          "Severe deficits drop your BMR and spike ghrelin (hunger) for months. The body fights to regain the weight — usually with interest.",
        readMore: { label: "InsideTracker — Performance", url: "https://blog.insidetracker.com/performance" },
      },
      {
        q: "Strength training during weight loss mainly helps to:",
        options: ["Burn the most calories per session", "Preserve muscle so most loss is fat", "Replace cardio", "Cause weight gain"],
        correct: 1,
        concept:
          "In a deficit the body sheds muscle unless you lift. Keep 2–3 strength sessions a week to protect lean mass and metabolic rate.",
      },
      {
        q: "Protein recommendation while losing weight (per kg body weight per day):",
        options: ["0.4–0.6 g", "0.8 g", "1.2–1.6 g", "3 g"],
        correct: 2,
        concept:
          "Higher protein preserves muscle and is the most satiating macronutrient. Spread across 3 meals: dal, paneer, eggs, fish, tofu, yogurt.",
        readMore: { label: "Examine — Protein intake", url: "https://examine.com/guides/protein-intake/" },
      },
      {
        q: "Step target linked to lower mortality in large studies?",
        options: ["1,000/day", "3,000/day", "7,000–10,000/day", "20,000/day"],
        correct: 2,
        concept:
          "Benefits plateau around ~10k steps. Even 7k/day cuts all-cause mortality dramatically vs sedentary baselines.",
        readMore: { label: "JAMA — Daily steps & mortality", url: "https://jamanetwork.com/journals/jamainternalmedicine/fullarticle/2783711" },
      },
      {
        q: "Sleeping <6 hours regularly mainly affects weight by:",
        options: ["No effect", "Raising leptin", "Raising ghrelin & cravings, lowering insulin sensitivity", "Burning more fat"],
        correct: 2,
        concept:
          "Sleep debt raises hunger hormones, blunts insulin and impairs decision-making — you eat ~300 more kcal/day on average.",
      },
      {
        q: "Liquid calories (juice, sweet coffee, beer) are problematic because:",
        options: ["They don't trigger satiety", "They're more nutritious", "They speed metabolism", "They're protein-rich"],
        correct: 0,
        concept:
          "Liquid calories barely register on satiety circuits. Switching sugary drinks to water/tea is the single easiest deficit.",
      },
      {
        q: "Weight that's lost & regained repeatedly (yo-yo) tends to:",
        options: ["Improve metabolism", "Be neutral", "Worsen body composition over time", "Cure obesity"],
        correct: 2,
        concept:
          "Each cycle loses some lean mass and regains as fat. Long-term, body-fat % creeps up even at the same scale weight.",
      },
    ],
  },

  if: {
    id: "if",
    title: "Master Intermittent Fasting",
    emoji: "⏱️",
    blurb: "Windows, hormones & overcoming hunger.",
    questions: [
      {
        q: "In 16:8 IF, the '16' is:",
        options: ["Hours of eating", "Hours of fasting", "Total meals", "Days per week"],
        correct: 1,
        concept:
          "Hours fasting : hours eating. So 16:8 means 16 hours without calories and an 8-hour eating window.",
        readMore: { label: "Cleveland Clinic — IF types", url: "https://health.clevelandclinic.org/intermittent-fasting-4-different-types-explained" },
      },
      {
        q: "Glycogen stores in the liver are typically depleted after about:",
        options: ["2 hours", "6 hours", "12–14 hours", "48 hours"],
        correct: 2,
        concept:
          "After ~12h without food, liver glycogen runs low and the body starts mobilising fat — this is when fat-burning (ketosis) ramps up.",
      },
      {
        q: "Autophagy (cellular clean-up) meaningfully kicks in around:",
        options: ["4–6 hours", "16–24 hours fasted", "5 minutes", "Only after 7 days"],
        correct: 1,
        concept:
          "Autophagy starts modestly and ramps up significantly past 16–24 hours fasted. Nobel-winning research links it to longevity & disease resistance.",
        readMore: { label: "NIH — Autophagy & fasting", url: "https://www.ncbi.nlm.nih.gov/pmc/articles/PMC6469458/" },
      },
      {
        q: "Which of these BREAKS a fast?",
        options: ["Plain water", "Black coffee (no sugar)", "A teaspoon of ghee in chai", "Plain green tea"],
        correct: 2,
        concept:
          "Anything with calories breaks the fast. Plain water, black coffee, plain tea, herbal teas are fine. Even a few calories trigger insulin and shut autophagy.",
      },
      {
        q: "Best low-effort tool to overcome hunger in the morning fasting hours:",
        options: ["Skip water", "Warm water with lemon or ginger", "Sugary drink", "Lie down"],
        correct: 1,
        concept:
          "Warm water with lemon/ginger calms vata, hydrates, suppresses appetite and pushes your first meal naturally to 10–11am.",
      },
      {
        q: "Feeling dizzy mid-fast in hot weather usually means:",
        options: ["You're hungry", "Electrolyte depletion — add a pinch of salt + water", "More caffeine needed", "Eat sugar"],
        correct: 1,
        concept:
          "Sodium, potassium and magnesium drop during long fasts, especially in heat. A pinch of pink salt or an electrolyte tab in water resolves dizziness fast.",
      },
      {
        q: "OMAD stands for:",
        options: ["Over-Mature Adult Diet", "One Meal A Day", "Once Monthly Ayurvedic Detox", "Olive Mango Avocado Diet"],
        correct: 1,
        concept:
          "OMAD is the most aggressive IF style — one meal, ~23h fasted. Effective for some but easy to mess up nutrition; not recommended long-term without planning.",
      },
      {
        q: "Best non-food distraction when hunger hits:",
        options: ["Doom-scrolling", "A short walk, herbal tea or meditation", "Lying in bed thinking about food", "More coffee on empty stomach"],
        correct: 1,
        concept:
          "Hunger comes in waves of ~20 min. A walk, warm herbal tea, calling a friend or 5 min of breathwork rides the wave and it passes.",
      },
      {
        q: "IF should be avoided / done only under supervision by:",
        options: ["Healthy adults", "Pregnant or breastfeeding women, children, people with eating disorders or T1 diabetes", "Anyone over 30", "Athletes"],
        correct: 1,
        concept:
          "IF isn't for everyone. Pregnancy, breastfeeding, T1 diabetes, eating-disorder history, underweight, and growing kids/teens are clear no-go's without a clinician.",
      },
    ],
  },

  fasting: {
    id: "fasting",
    title: "Fasting Around the World",
    emoji: "🕊️",
    blurb: "Extended fasts, water fasts & traditions.",
    questions: [
      {
        q: "Difference between IF and Fasting:",
        options: ["No difference", "IF is daily eating-window pattern; fasting is full days with minimal/no food", "Fasting is shorter than IF", "Fasting is only Ayurvedic"],
        correct: 1,
        concept:
          "IF is a daily rhythm. A 'fast' is a chosen day (or multiple days) of zero or minimal calories — water, fruit, juice, khichdi etc.",
      },
      {
        q: "A water fast longer than 48 hours should be done:",
        options: ["Solo for kicks", "With medical supervision", "Only if you skip electrolytes", "On a sports day"],
        correct: 1,
        concept:
          "Beyond 48h, cardiac arrhythmias, refeeding syndrome and severe electrolyte shifts become real risks. Always under a clinician's eye.",
      },
      {
        q: "Ekadashi (Hindu), Ramadan (Islam), Lent (Christian), Yom Kippur (Jewish) share:",
        options: ["Same exact rules", "All are weight-loss diets", "All are traditional fasting practices with spiritual + physiological benefits", "All forbid water"],
        correct: 2,
        concept:
          "Most cultures evolved structured fasts — they pre-date modern science but consistently show metabolic, immune and cognitive benefits.",
      },
      {
        q: "Khichdi cleanse is a traditional Ayurvedic:",
        options: ["Mono-diet that rests digestion while still nourishing", "Water-only fast", "High-protein cleanse", "Modern fad"],
        correct: 0,
        concept:
          "A mono-diet of rice + moong dal + ghee + spices is easy to digest, balances all 3 doshas and gives the gut a real rest — for 1–7 days.",
      },
      {
        q: "Refeeding after a 3+ day fast should be:",
        options: ["A buffet", "Small, simple, easily-digested meals (bone broth, fruit, khichdi)", "Steak & beer", "Only protein shakes"],
        correct: 1,
        concept:
          "After extended fasting, jumping to big rich meals shocks the system (refeeding syndrome). Start small, simple, warm — build over 2–3 days.",
        readMore: { label: "NIH — Refeeding syndrome", url: "https://www.ncbi.nlm.nih.gov/pmc/articles/PMC2440847/" },
      },
      {
        q: "Juice fasting is best for:",
        options: ["Strength training prep", "Short detox/wellness reset (1–3 days)", "Building muscle", "Daily life forever"],
        correct: 1,
        concept:
          "Fresh juices give micronutrients with minimal digestion. Useful as a 1–3 day reset, but high in fructose — not a long-term strategy.",
      },
      {
        q: "During a long fast, the FIRST nutrient most people under-do is:",
        options: ["Protein", "Vitamin C", "Sodium / electrolytes", "Fibre"],
        correct: 2,
        concept:
          "Salt loss is what causes the headaches, fatigue and dizziness people blame on hunger. Pink salt or electrolytes fix 80% of long-fast symptoms.",
      },
      {
        q: "Seasonal fasting (Ritucharya) traditionally happens at:",
        options: ["Random times", "Season transitions (spring & autumn especially)", "Only winter", "Only summer"],
        correct: 1,
        concept:
          "Ayurveda recommends a gentle cleanse at season changes (especially spring) when the body sheds accumulated doshas of the prior season.",
      },
    ],
  },

  yoga: {
    id: "yoga",
    title: "Yoga & Pranayam IQ",
    emoji: "🧘",
    blurb: "Asana, breath & nervous system.",
    questions: [
      {
        q: "Pranayam means:",
        options: ["Posture practice", "Extension of life-force through breath control", "Vegetarian diet", "A type of mantra"],
        correct: 1,
        concept:
          "'Prana' = life force, 'ayama' = extension/control. Controlled breath regulates the autonomic nervous system in seconds.",
      },
      {
        q: "Anulom Vilom (alternate-nostril breathing) primarily:",
        options: ["Builds biceps", "Balances sympathetic & parasympathetic activity", "Spikes heart rate", "Causes hyperventilation"],
        correct: 1,
        concept:
          "Studies show alternate-nostril breathing lowers BP, balances HRV and improves attention within 10–15 minutes of practice.",
        readMore: { label: "NIH — Pranayama effects", url: "https://www.ncbi.nlm.nih.gov/pmc/articles/PMC3198268/" },
      },
      {
        q: "Surya Namaskar A in one round works:",
        options: ["Only legs", "Only arms", "Full body + breath coordination", "Just the spine"],
        correct: 2,
        concept:
          "12 asanas linked to breath: strength, mobility, cardio and meditation in 4–6 minutes. 10–12 rounds = a complete daily practice.",
      },
      {
        q: "Best time of day for yoga, traditionally:",
        options: ["Just after a heavy meal", "Brahma muhurta — pre-dawn, empty stomach", "Right before sleep with full belly", "Midnight"],
        correct: 1,
        concept:
          "Pre-dawn, empty stomach, fresh mind — the body is supple and the air is at its most sattvic (clear, light).",
      },
      {
        q: "Kapalbhati (skull-shining breath) is contraindicated for:",
        options: ["Healthy adults", "Pregnant women, uncontrolled hypertension, recent abdominal surgery", "Children over 12 with guidance", "Athletes"],
        correct: 1,
        concept:
          "It's a vigorous abdominal pump. Skip during pregnancy, uncontrolled BP, hernia, recent surgery, heart conditions or menstruation.",
      },
      {
        q: "Shavasana at the end of practice is for:",
        options: ["Showing off flexibility", "Integrating the practice into nervous system", "Sleep training", "Stretching legs"],
        correct: 1,
        concept:
          "Skipping shavasana is like cooking food and not eating it. 5–10 min of conscious rest is where the nervous-system shift actually consolidates.",
      },
      {
        q: "For high BP, the BEST pranayam is:",
        options: ["Bhastrika (rapid)", "Kapalbhati", "Bhramari (humming) & long slow exhales", "Breath retention"],
        correct: 2,
        concept:
          "Bhramari and extended exhales activate the vagus nerve and reliably lower BP. Avoid heating breaths like bhastrika & kapalbhati.",
      },
      {
        q: "Yoga differs from stretching because it:",
        options: ["Is the same thing", "Pairs breath, attention and movement with intention", "Always uses weights", "Only happens in a studio"],
        correct: 1,
        concept:
          "The breath+awareness layer is what separates yoga from PT/stretching. Same posture, different effect on the nervous system.",
      },
    ],
  },

  exercise: {
    id: "exercise",
    title: "Move Like You Mean It",
    emoji: "💪",
    blurb: "Strength, cardio & recovery basics.",
    questions: [
      {
        q: "WHO weekly minimum for adults:",
        options: ["10 min walking", "30 min walking once a week", "150–300 min moderate aerobic + 2 strength sessions", "Marathon training only"],
        correct: 2,
        concept:
          "Below this, mortality risk climbs sharply. Above it, gains continue but plateau. Strength training is non-negotiable past 40.",
        readMore: { label: "WHO — Physical activity guidelines", url: "https://www.who.int/news-room/fact-sheets/detail/physical-activity" },
      },
      {
        q: "Best single predictor of longevity in midlife:",
        options: ["BMI", "Daily steps", "VO2 max / cardio fitness", "Cholesterol alone"],
        correct: 2,
        concept:
          "Cardiorespiratory fitness predicts mortality more strongly than BMI, BP or cholesterol. Zone-2 cardio + occasional HIIT builds it.",
        readMore: { label: "InsideTracker — Longevity", url: "https://blog.insidetracker.com/longevity" },
      },
      {
        q: "Muscle mass after age 30 declines at roughly:",
        options: ["Nothing — stable forever", "3–8% per decade if untrained", "50% per decade", "It increases automatically"],
        correct: 1,
        concept:
          "Sarcopenia is silent and steady. Resistance training 2–3x/week halts and reverses it well into the 70s.",
      },
      {
        q: "DOMS (sore muscles 24–48h after) is best resolved by:",
        options: ["Total rest until pain gone", "Light movement, hydration, sleep, protein", "Heavy training the same muscle", "Ice for 8 hours"],
        correct: 1,
        concept:
          "Gentle movement raises blood flow and clears soreness faster than sitting still. Sleep + protein do the actual repair.",
      },
      {
        q: "Best 'real-life' strength move:",
        options: ["Bicep curl", "Squat / hip-hinge / carry / push / pull patterns", "Calf raise alone", "Forearm pinch"],
        correct: 1,
        concept:
          "Compound movements train how you move daily — squatting to a chair, picking up a kid, pushing a door. Isolation moves are dessert.",
      },
      {
        q: "Walking right after a meal mainly:",
        options: ["Causes cramps for everyone", "Reduces post-meal blood-sugar spike", "Replaces brushing teeth", "Increases hunger"],
        correct: 1,
        concept:
          "Just 10–15 minutes of easy walking after meals lowers post-meal glucose by 20–30% — a daily habit Ayurveda also recommends.",
        readMore: { label: "Sports Medicine — Postprandial walking", url: "https://link.springer.com/article/10.1007/s40279-022-01649-4" },
      },
      {
        q: "Recovery between hard strength sessions for the same muscle:",
        options: ["0 hours", "8 hours", "48–72 hours", "2 weeks"],
        correct: 2,
        concept:
          "Muscle protein synthesis runs ~48h after a hard session. Hit the same muscle too soon and you cut into adaptation.",
      },
      {
        q: "Vyayam (Ayurvedic exercise) recommends working out to:",
        options: ["Total exhaustion", "Half your capacity, until sweat appears on forehead/armpits/hairline", "5 minutes only", "Never"],
        correct: 1,
        concept:
          "Classical texts say train to about 50% capacity — enough to sweat but leave reserves. Daily sustainability beats burn-out heroics.",
      },
    ],
  },

  meditation: {
    id: "meditation",
    title: "Meditation Basics",
    emoji: "🪷",
    blurb: "Mindfulness, mantra & the wandering mind.",
    questions: [
      {
        q: "Mindfulness is:",
        options: ["Stopping all thoughts", "Non-judgmental awareness of present experience", "Sleeping with eyes open", "A religion"],
        correct: 1,
        concept:
          "You don't stop thoughts — you stop being identified with them. Notice, return to breath, repeat. That return IS the practice.",
      },
      {
        q: "A consistent 10-min daily practice is more effective than:",
        options: ["A 1-hour weekly session", "Doing nothing", "Both — daily wins", "Sleeping in"],
        correct: 2,
        concept:
          "Neuroplastic change is dose-frequency driven. Short and daily reshapes circuits more than long and occasional.",
        readMore: { label: "Harvard — Mindfulness", url: "https://www.health.harvard.edu/blog/mindfulness-meditation-may-ease-anxiety-mental-stress-201401086967" },
      },
      {
        q: "Yoga Nidra is:",
        options: ["A type of nap", "Guided body-scan that produces deep rest while awake", "Sun salutation", "Mantra-only practice"],
        correct: 1,
        concept:
          "20 min of yoga nidra ≈ 2–3 hours of sleep in restorative effect. Excellent for insomnia, anxiety and post-illness recovery.",
      },
      {
        q: "Trataka is:",
        options: ["Steady gazing (often at a candle flame) to build focus", "Mantra chanting", "Group dance", "A breath retention"],
        correct: 0,
        concept:
          "Trataka builds concentration (dharana). 5–10 min daily improves attention, sleep, and reduces 'monkey-mind' scattering.",
      },
      {
        q: "When the mind wanders during meditation, you should:",
        options: ["Get frustrated and quit", "Gently notice and return to the anchor (breath/mantra)", "Force-stop thinking", "Open eyes and scroll"],
        correct: 1,
        concept:
          "The 'return' is the rep. Each gentle return strengthens the prefrontal-cortex circuits behind focus and emotional regulation.",
      },
      {
        q: "Best time of day to start a meditation habit:",
        options: ["Late evening on phone", "Just after waking, before screens", "Right after a heavy meal", "Only weekends"],
        correct: 1,
        concept:
          "Cortisol naturally peaks shortly after waking — channelling that into focus sets the tone for the day and is easier to make non-negotiable.",
      },
      {
        q: "Studies link 8 weeks of consistent meditation to:",
        options: ["Larger amygdala (more anxiety)", "Smaller, less-reactive amygdala & thicker prefrontal cortex", "No measurable change", "Worse sleep"],
        correct: 1,
        concept:
          "MRI studies show structural changes in just 8 weeks: less reactive fear-centre, stronger executive control.",
        readMore: { label: "NIH — Meditation & brain", url: "https://www.ncbi.nlm.nih.gov/pmc/articles/PMC3004979/" },
      },
    ],
  },

  detox: {
    id: "detox",
    title: "Detox, Decoded",
    emoji: "🌿",
    blurb: "What real detox is — and isn't.",
    questions: [
      {
        q: "Your main natural detox organs are:",
        options: ["Skin only", "Liver, kidneys, gut, lungs, skin & lymph", "Heart only", "Stomach"],
        correct: 1,
        concept:
          "'Detoxing' isn't magic — it's helping the liver, kidneys, gut, lungs, lymph and skin do their daily job better.",
      },
      {
        q: "Ayurvedic kitchari reset works by:",
        options: ["Starvation", "Simple mono-diet that lowers digestive load & lets the body clear ama", "Heavy supplementation", "High-protein loading"],
        correct: 1,
        concept:
          "Rice + moong dal + ghee + spices is the easiest meal to digest. 3–7 days frees energy for repair without depriving nutrients.",
      },
      {
        q: "Best single 'detox drink' for daily mornings:",
        options: ["Diet soda", "Warm water with lemon or jeera-saunf water", "Energy drink", "Cold milk"],
        correct: 1,
        concept:
          "Warm water gently stimulates digestion, hydrates the colon and supports natural elimination — the cornerstone of dinacharya.",
      },
      {
        q: "Sweating in a steam/sauna helps detox by:",
        options: ["Burning fat directly", "Supporting elimination via skin & boosting circulation", "Curing infections", "Replacing kidneys"],
        correct: 1,
        concept:
          "Sweating is a supporting pathway — small but real. Combined with hydration it eases the load on liver & kidneys.",
        readMore: { label: "InsideTracker — Recovery", url: "https://blog.insidetracker.com/recovery" },
      },
      {
        q: "A 'detox' that promises 5 kg loss in 3 days is:",
        options: ["Magic", "Mostly water + glycogen, regained on refeeding", "Pure fat loss", "Recommended weekly"],
        correct: 1,
        concept:
          "Rapid scale drops on cleanses are water + carbs in tissue, not fat. They return within days of normal eating.",
      },
      {
        q: "Best fibre source during a detox:",
        options: ["White bread", "Cooked vegetables, soaked oats, fruit, soaked chia", "Cheese", "Fried snacks"],
        correct: 1,
        concept:
          "Soluble fibre binds and escorts toxins out via the gut. Without enough fibre, detox stalls in the colon.",
      },
      {
        q: "Sleep during a cleanse is:",
        options: ["Optional", "Critical — most repair & glymphatic clearance happens in deep sleep", "Bad", "Should be skipped"],
        correct: 1,
        concept:
          "The brain's glymphatic system (its own 'detox') runs primarily during deep sleep. No sleep, no real cleanse.",
      },
    ],
  },

  disease: {
    id: "disease",
    title: "Manage & Reverse",
    emoji: "🩺",
    blurb: "Lifestyle vs chronic conditions.",
    questions: [
      {
        q: "Type 2 diabetes is largely:",
        options: ["Pure genetics — can't change it", "Insulin resistance driven by lifestyle — often reversible early", "Contagious", "Caused only by sugar"],
        correct: 1,
        concept:
          "Diet, sleep, stress, movement and weight together drive insulin sensitivity. Caught early, T2D is often reversible — clinical trials confirm.",
        readMore: { label: "ADA — Diabetes remission", url: "https://diabetesjournals.org/care/article/44/10/2438/138962/Consensus-Report-Definition-and-Interpretation-of" },
      },
      {
        q: "First-line lifestyle change for hypertension:",
        options: ["More salt", "DASH-style eating, daily walking, weight loss, alcohol limit, sleep, stress drop", "Skip sleep", "Heavy lifting only"],
        correct: 1,
        concept:
          "DASH + walking + weight loss + sleep can drop BP 10–15 mmHg — often as much as a starter medication.",
        readMore: { label: "NIH — DASH eating plan", url: "https://www.nhlbi.nih.gov/education/dash-eating-plan" },
      },
      {
        q: "PCOS is best managed long-term by:",
        options: ["A pill alone", "Insulin-sensitising lifestyle: low-GI food, strength training, sleep, stress management", "Skipping breakfast forever", "Crash dieting"],
        correct: 1,
        concept:
          "Root cause is insulin resistance + chronic inflammation. Diet + lifting + sleep + stress moves the needle on cycles, weight and fertility.",
      },
      {
        q: "Best dietary pattern for fatty liver (NAFLD):",
        options: ["High refined-carb + alcohol", "Mediterranean / Ayurvedic-style: whole foods, low sugar, no alcohol, weight loss", "Juice only", "Keep current diet"],
        correct: 1,
        concept:
          "Losing 7–10% body weight + cutting fructose & alcohol clears liver fat in months for most cases.",
      },
      {
        q: "IBS flares often improve with:",
        options: ["Random elimination", "Identifying FODMAP triggers, regular meal timing, stress management, gentle yoga", "Skipping all fibre forever", "Antibiotics only"],
        correct: 1,
        concept:
          "Gut-brain axis is central. Predictable meals, low-FODMAP trial, breathwork, yoga and sleep collectively outperform any single drug.",
      },
      {
        q: "Hypothyroidism — best dietary support:",
        options: ["Megadose iodine", "Adequate iodine, selenium, zinc; manage gluten if Hashimoto's; treat with meds as needed", "Raw cruciferous loading", "Skip meals"],
        correct: 1,
        concept:
          "Nutrients matter, but most hypothyroidism still needs medication. Lifestyle reduces symptom burden and inflammation around it.",
      },
      {
        q: "Single most under-rated 'medicine' for chronic disease:",
        options: ["Expensive supplements", "7–9 hours of consistent quality sleep", "Cold plunges", "Trendy juice"],
        correct: 1,
        concept:
          "Sleep regulates insulin, BP, hunger, immunity, mood and recovery. No supplement comes close. Fix sleep first.",
        readMore: { label: "InsideTracker — Health & Wellness", url: "https://blog.insidetracker.com/health-wellness" },
      },
    ],
  },
};

export const QUIZ_LIST: Quiz[] = [
  QUIZZES.diet,
  QUIZZES["weight-loss"],
  QUIZZES.if,
  QUIZZES.fasting,
  QUIZZES.yoga,
  QUIZZES.exercise,
  QUIZZES.meditation,
  QUIZZES.detox,
  QUIZZES.disease,
];
