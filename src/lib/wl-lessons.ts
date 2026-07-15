// Weight-loss Learn content — built on docs/content-style-guide.md ("The Staircase").
// One sentence per line. Bare quiz options. Answers get their own screen.
// Named concepts, cliffhangers, if→try examples, recap into a real tool.
// Evidence: NIDDK/NIH weight-management guidance (150 min/wk activity,
// 5–10% in 6 months, whole fruits over juice, weekly weigh-ins, fad red flags).

export type VisualKey = "calorieBalance" | "sugarCurve" | "mealClock";

export type LessonCard =
  | { kind: "cover"; emoji: string; tagline: string }
  | { kind: "text"; lines: string[]; highlight?: number; visual?: VisualKey }
  | { kind: "quiz"; q: string; options: string[]; best: number }
  | { kind: "answer"; beats: string[]; cliffhanger?: string }
  | { kind: "examples"; intro: string; items: { when: string; then: string }[] }
  | { kind: "recap"; bullets: string[]; action: string; cta?: { label: string; to: string } };

export interface WLLesson {
  id: string;
  title: string;
  emoji: string;
  tint: string;
  minutes: number;
  category: "How Weight Works" | "Eat Smarter" | "Move & Rest" | "Stay on Track";
  cards: LessonCard[];
}

/* Use {name} anywhere — the player swaps it for the user's first name. */

export const WL_LESSONS: WLLesson[] = [
  /* ============ COURSE 1 · HOW WEIGHT WORKS ============ */

  {
    id: "the-only-equation",
    title: "The Only Equation That Matters",
    emoji: "⚖️",
    tint: "linear-gradient(135deg,#fed7aa,#fb923c)",
    minutes: 2,
    category: "How Weight Works",
    cards: [
      { kind: "cover", emoji: "⚖️", tagline: "Every diet ever invented is hiding this one line." },
      {
        kind: "text",
        lines: [
          "Weight feels complicated.",
          "Keto, detox teas, fat-burner powders, 6 AM bootcamps.",
          "Underneath all of it sits one quiet equation.",
          "Calories in, calories out.",
          "Everything that works, works because of it.",
          "Everything that fails, fails because it ignored it.",
        ],
        highlight: 3,
      },
      {
        kind: "quiz",
        q: "So to lose weight, you need to…",
        options: ["Eat much less food", "Tip the equation", "Give up carbs"],
        best: 1,
      },
      {
        kind: "answer",
        beats: [
          "You just need OUT to stay ahead of IN.",
          "Here's the happy part — your stomach measures volume, not calories.",
          "So the trick is eating MORE volume with FEWER calories, not eating less food.",
        ],
        cliffhanger: "In the next lesson, two foods from the same plant will prove it.",
      },
      {
        kind: "text",
        lines: [
          "No need to eat less.",
          "Just eat right.",
          "That's the whole philosophy, {name}.",
        ],
        highlight: 1,
        visual: "calorieBalance",
      },
      {
        kind: "recap",
        bullets: [
          "Weight = calories in vs calories out.",
          "Your stomach counts volume, not calories.",
          "Win by eating right, not eating less.",
        ],
        action: "Swap one calorie-dense snack today for something water-rich. Same fullness, half the calories.",
        cta: { label: "See my calorie target", to: "/section/weight-loss" },
      },
    ],
  },

  {
    id: "raisins-grapes",
    title: "Raisins or Grapes?",
    emoji: "🍇",
    tint: "linear-gradient(135deg,#e9d5ff,#a78bfa)",
    minutes: 2,
    category: "How Weight Works",
    cards: [
      { kind: "cover", emoji: "🍇", tagline: "Same plant. Opposite effect on your weight." },
      {
        kind: "quiz",
        q: "You're reaching for a snack. Which is the smarter choice?",
        options: ["Grapes", "Raisins"],
        best: 0,
      },
      {
        kind: "answer",
        beats: [
          "But wait — aren't raisins just dried grapes?",
          "That's exactly it. Grapes are 81% water, so a big bowl is only ~120 calories.",
          "Dry that water away and the same calories shrink into two small handfuls that never fill you.",
        ],
        cliffhanger: "This trick has a name — and once you know it, you'll see it everywhere.",
      },
      {
        kind: "text",
        lines: [
          "It's called caloric density.",
          "How many calories live inside one bite of a food.",
          "Water-rich foods carry few calories per bite.",
          "Dried, fried and processed foods carry many.",
          "Fill your plate with low-density food and you get full before you get heavy.",
          "You never had a willpower problem — you had a density problem.",
        ],
        highlight: 0,
      },
      {
        kind: "examples",
        intro: "Spot the density swap:",
        items: [
          { when: "you'd grab raisins or dried fruit", then: "eat the fresh fruit instead" },
          { when: "you'd pour a bowl of namkeen", then: "roast some chana or makhana" },
          { when: "the meal feels small", then: "add cucumber, tomato, soup — volume without density" },
        ],
      },
      {
        kind: "recap",
        bullets: [
          "Caloric density = calories per bite.",
          "Water-rich food fills you on fewer calories.",
          "Eat your calories with their water still in.",
        ],
        action: "At your next snack, ask one question: fresh or dried? Pick the one with its water still in.",
        cta: { label: "Build my diet plan", to: "/section/diet" },
      },
    ],
  },

  {
    id: "scale-truth",
    title: "What the Scale Isn't Telling You",
    emoji: "📉",
    tint: "linear-gradient(135deg,#c7d2fe,#818cf8)",
    minutes: 2,
    category: "How Weight Works",
    cards: [
      { kind: "cover", emoji: "📉", tagline: "The morning the scale betrayed you — explained." },
      {
        kind: "quiz",
        q: "Salty dinner last night. The scale shows +1.2 kg this morning. What did you gain?",
        options: ["Fat", "Water", "Muscle"],
        best: 1,
      },
      {
        kind: "answer",
        beats: [
          "Gaining 1 kg of actual fat takes about 7,700 extra calories — roughly 10 extra meals.",
          "One salty dinner just made your body hold water for a day or two.",
          "The scale wasn't lying — it was measuring the wrong thing for you.",
        ],
        cliffhanger: "So when SHOULD you weigh yourself? Science has a surprisingly exact answer.",
      },
      {
        kind: "text",
        lines: [
          "Daily weight swings ±1.5 kg on water alone.",
          "Fat moves slowly — half to one kilo a week, says Harvard.",
          "Faster than that and you're mostly losing muscle — which slows your burn and invites the weight back.",
          "So track the trend, not the Tuesday.",
          "Weigh once a week: same day, same time, empty stomach.",
          "Six-month target: 5–10% of your starting weight. That's the pace that stays lost.",
        ],
        highlight: 3,
      },
      {
        kind: "recap",
        bullets: [
          "1 kg of fat = 7,700 calories. Overnight jumps are water.",
          "Weekly weigh-in, fixed ritual, watch the trend line.",
          "Healthy pace: 5–10% of your weight in 6 months.",
        ],
        action: "Set your weigh-in ritual now: pick the day, the time, the spot for the scale.",
        cta: { label: "Punch my weight", to: "/section/weight-loss" },
      },
    ],
  },

  /* ============ COURSE 2 · EAT SMARTER ============ */

  {
    id: "protein-fullness",
    title: "Why Hunger Comes Back at 11 AM",
    emoji: "🥚",
    tint: "linear-gradient(135deg,#fef3c7,#fbbf24)",
    minutes: 3,
    category: "Eat Smarter",
    cards: [
      { kind: "cover", emoji: "🥚", tagline: "Two breakfasts. Same calories. Completely different day." },
      {
        kind: "quiz",
        q: "Which breakfast keeps you full till lunch?",
        options: ["Toast and jam", "Moong dal chilla"],
        best: 1,
      },
      {
        kind: "answer",
        beats: [
          "Toast is a fast carb — its sugar floods in within minutes.",
          "Your body fires insulin to clear the flood, and blood sugar crashes BELOW where it started.",
          "That crash at 11 AM? It has a name: rebound hunger.",
        ],
        cliffhanger: "The chilla plays an entirely different game. Watch.",
      },
      {
        kind: "text",
        lines: [
          "Protein digests slowly, steadily, quietly.",
          "Slow carbs release sugar like a drip, not a flood.",
          "No flood means no insulin spike.",
          "No spike means no crash.",
          "No crash means no 11 AM biscuit hunt.",
          "Protein + slow carbs = hunger switched off for hours.",
        ],
        highlight: 5,
        visual: "sugarCurve",
      },
      {
        kind: "text",
        lines: [
          "One more thing, and it's important.",
          "Eat fast carbs daily and your body tunes itself to running on sugar floods.",
          "Cravings aren't weakness — they're the tuning.",
          "Two weeks of protein-first breakfasts re-tunes the whole system.",
        ],
        highlight: 2,
      },
      {
        kind: "recap",
        bullets: [
          "Fast carbs: spike → crash → rebound hunger.",
          "Protein + slow carbs: steady line, no crash.",
          "The magic dose: ~25 g protein at breakfast — in trials it cut the hunger hormone by 27%.",
        ],
        action: "Tomorrow: chilla + curd, sprouts + peanuts, or dalia cooked in milk. Note what time hunger actually returns.",
        cta: { label: "Plan my meals", to: "/section/diet" },
      },
    ],
  },

  {
    id: "salad-first",
    title: "The Salad-First Trick",
    emoji: "🥗",
    tint: "linear-gradient(135deg,#bbf7d0,#4ade80)",
    minutes: 2,
    category: "Eat Smarter",
    cards: [
      { kind: "cover", emoji: "🥗", tagline: "Shrink every meal without touching the menu." },
      {
        kind: "text",
        lines: [
          "You sit down hungry.",
          "Hungry-you eats fast.",
          "Fast eating outruns your fullness signal — it needs 20 minutes to arrive.",
          "By the time your brain says 'enough', the damage is two extra rotis deep.",
        ],
        highlight: 2,
      },
      {
        kind: "quiz",
        q: "What's the fix?",
        options: ["Eat slower", "Salad before the meal", "Smaller plate"],
        best: 1,
      },
      {
        kind: "answer",
        beats: [
          "All three help — but one does the work FOR you.",
          "A cucumber is 95% water: a big plate of salad part-fills your stomach for almost nothing.",
          "Now hungry-you never meets the main course — calm-you does, and calm-you eats 15–20% less.",
        ],
        cliffhanger: "There's an order to the rest of the meal too.",
      },
      {
        kind: "text",
        lines: [
          "The eating order:",
          "Salad first — 250 to 500 grams of it.",
          "Then protein and slow carbs.",
          "Volume first, density last.",
          "Same food, new sequence, smaller waist.",
        ],
        highlight: 3,
      },
      {
        kind: "recap",
        bullets: [
          "Your fullness signal runs 20 minutes late.",
          "Salad-first fills the gap for near-zero calories.",
          "Order: salad → protein → slow carbs.",
        ],
        action: "Tonight, one full plate of salad before dinner. Change nothing else. Watch your portion shrink by itself.",
        cta: { label: "Build my diet plan", to: "/section/diet" },
      },
    ],
  },

  {
    id: "perfect-morning",
    title: "The Perfect Morning Sequence",
    emoji: "🌅",
    tint: "linear-gradient(135deg,#fecdd3,#fb7185)",
    minutes: 3,
    category: "Eat Smarter",
    cards: [
      { kind: "cover", emoji: "🌅", tagline: "Mornings run on autopilot. Let's redesign the autopilot." },
      {
        kind: "quiz",
        q: "You wake up. What goes into your body first?",
        options: ["Chai and biscuits", "A warm drink", "Straight to breakfast"],
        best: 1,
      },
      {
        kind: "answer",
        beats: [
          "Sugar and maida on an empty stomach start the spike-crash cycle before the day even begins.",
          "Warm water — plain, or with lemon, ginger, turmeric — hydrates you and wakes digestion gently.",
          "You arrive at breakfast calm and unhurried, instead of raiding the kitchen ravenous.",
        ],
        cliffhanger: "Then breakfast has one job: hit the protein number.",
      },
      {
        kind: "text",
        lines: [
          "The sequence:",
          "Wake → warm drink → a short unhurried gap → protein breakfast at 9–9:30.",
          "The target at breakfast: about 25 grams of protein.",
          "That's the dose research says switches hunger off till lunch.",
          "In winter, the drink can be amla, beetroot or carrot juice.",
        ],
        highlight: 2,
      },
      {
        kind: "examples",
        intro: "Build your 25-gram breakfast:",
        items: [
          { when: "you like something warm", then: "moong/ragi/besan chilla with a bowl of curd" },
          { when: "you want zero cooking", then: "steamed moong sprouts + peanuts, or hung curd with fruit" },
          { when: "you love dalia or oats", then: "cook them in milk and add nuts — alone they're only 5 g" },
          { when: "the body feels heavy some morning", then: "make it a fruit-only breakfast — a gentle mini-fast" },
        ],
      },
      {
        kind: "recap",
        bullets: [
          "Warm drink first, breakfast 30 minutes later.",
          "Protein anchors the morning; good fats seal it.",
          "Once a week or two, a fruit-only day lets the gut heal.",
        ],
        action: "Tonight, set up tomorrow: lemon or ginger by the kettle, chilla batter decided. Autopilot, redesigned.",
        cta: { label: "Set my meal plan", to: "/section/diet" },
      },
    ],
  },

  {
    id: "light-dinner",
    title: "Dinner Decides Your Weight",
    emoji: "🌙",
    tint: "linear-gradient(135deg,#c7d2fe,#818cf8)",
    minutes: 2,
    category: "Eat Smarter",
    cards: [
      { kind: "cover", emoji: "🌙", tagline: "The same meal weighs different at 7 PM and 10 PM." },
      {
        kind: "quiz",
        q: "Same dinner, eaten at 7 PM or 10 PM. Any difference?",
        options: ["No difference", "7 PM wins"],
        best: 1,
      },
      {
        kind: "answer",
        beats: [
          "Your metabolism follows the sun — it burns brightest at midday and barely at midnight.",
          "A 10 PM dinner gets processed sluggishly and stored more readily.",
          "And it steals from your sleep, which quietly raises tomorrow's hunger.",
        ],
        cliffhanger: "Early dinner also unlocks something bigger — you'll meet it in the last course.",
      },
      {
        kind: "examples",
        intro: "Light dinners that still satisfy:",
        items: [
          { when: "you want comfort", then: "veggie soup, oatmeal, or vegetable dalia" },
          { when: "you want protein", then: "roasted paneer, steamed sprouts, boiled chana" },
          { when: "you want quick", then: "a sattu drink and stir-fried vegetables" },
        ],
      },
      {
        kind: "text",
        lines: [
          "The two dinner rules:",
          "Keep it light.",
          "Finish by 7 PM.",
          "That's it — the sun does the rest.",
        ],
        highlight: 2,
      },
      {
        kind: "recap",
        bullets: [
          "Late meals are stored, not burned.",
          "Light + early beats heavy + late, same calories.",
          "Kitchen closes at 7.",
        ],
        action: "Set a 6:45 PM 'kitchen closes' alarm tonight. One alarm, one rule.",
        cta: { label: "Plan light dinners", to: "/section/diet" },
      },
    ],
  },

  {
    id: "drink-vs-eat",
    title: "Never Drink Your Calories",
    emoji: "🍊",
    tint: "linear-gradient(135deg,#fed7aa,#fdba74)",
    minutes: 2,
    category: "Eat Smarter",
    cards: [
      { kind: "cover", emoji: "🍊", tagline: "The healthiest-looking glass on your table is fooling you." },
      {
        kind: "quiz",
        q: "Better morning choice?",
        options: ["Fresh orange juice", "A whole orange"],
        best: 1,
      },
      {
        kind: "answer",
        beats: [
          "One glass of juice takes 3–4 oranges — and throws their fiber away.",
          "What's left is fruit-flavored sugar water that never registers as food in your brain.",
          "NIH guidance says it plainly: whole fruits, not juices.",
        ],
        cliffhanger: "Juice is just the beginning — count what else you drink in a day.",
      },
      {
        kind: "text",
        lines: [
          "Liquid calories are invisible calories.",
          "The stomach barely notices them.",
          "The brain never logs them as eating.",
          "So you drink 300 calories and eat a full lunch anyway.",
          "Chai with sugar, packaged juice, cold drinks, sweet lassi — same story, different glass.",
        ],
        highlight: 0,
      },
      {
        kind: "examples",
        intro: "Keep the ritual, drop the sugar:",
        items: [
          { when: "you love your chai rounds", then: "keep them — at 1 tsp sugar, or slowly none" },
          { when: "you'd grab juice", then: "eat the fruit, drink plain water" },
          { when: "you want something festive", then: "nariyal pani, nimbu-soda without sugar, chaas" },
        ],
      },
      {
        kind: "recap",
        bullets: [
          "The brain doesn't count what you drink.",
          "Whole fruit beats juice — fiber is the point.",
          "Chew your calories; drink your water.",
        ],
        action: "Count today's drinkable calories honestly — every chai, every glass. Just count. Tomorrow, halve one.",
      },
    ],
  },

  /* ============ COURSE 3 · MOVE & REST ============ */

  {
    id: "walk-after-meals",
    title: "The 10-Minute Cheat Code",
    emoji: "🚶",
    tint: "linear-gradient(135deg,#a7f3d0,#34d399)",
    minutes: 2,
    category: "Move & Rest",
    cards: [
      { kind: "cover", emoji: "🚶", tagline: "The laziest exercise in the world — and why it works." },
      {
        kind: "quiz",
        q: "Which handles your lunch sugar better?",
        options: ["Evening gym session", "10-min walk after eating"],
        best: 1,
      },
      {
        kind: "answer",
        beats: [
          "It's about timing, not effort.",
          "While food digests, walking muscles pull sugar straight out of the blood — the spike flattens in real time.",
          "The gym is great, but it arrives hours after the sugar already spiked, crashed and stored.",
        ],
        cliffhanger: "Even 100 steps count. Here's how to never miss them.",
      },
      {
        kind: "examples",
        intro: "Attach the walk to something you already do:",
        items: [
          { when: "you finish lunch at work", then: "take your phone call standing and strolling" },
          { when: "dinner ends at home", then: "clear the table, then 100 steps on the terrace" },
          { when: "it's too hot or raining", then: "walk the corridor — the muscle doesn't care about the view" },
        ],
      },
      {
        kind: "recap",
        bullets: [
          "Post-meal walks flatten the sugar spike as it happens.",
          "Timing beats intensity — 3 strolls > 1 workout for sugar control.",
          "Attach walks to meals so they run on autopilot.",
        ],
        action: "After your very next meal: 10 minutes, any pace, anywhere. That's the whole assignment.",
        cta: { label: "Set my movement plan", to: "/section/exercise" },
      },
    ],
  },

  {
    id: "move-your-week",
    title: "150 Minutes, Zero Gym",
    emoji: "🏃",
    tint: "linear-gradient(135deg,#fecaca,#f87171)",
    minutes: 2,
    category: "Move & Rest",
    cards: [
      { kind: "cover", emoji: "🏃", tagline: "The official number for weight loss — and the unofficial way to hit it." },
      {
        kind: "text",
        lines: [
          "Health agencies agree on the number.",
          "150 minutes of moderate movement a week.",
          "Plus muscle work twice a week.",
          "Sounds like a gym membership, doesn't it?",
          "It isn't — brisk walking counts, dancing counts, stairs count.",
        ],
        highlight: 1,
      },
      {
        kind: "quiz",
        q: "Over a full week, which burns more?",
        options: ["Three gym sessions", "Everyday movement"],
        best: 1,
      },
      {
        kind: "answer",
        beats: [
          "Three gym hours burn about 1,000 calories — genuinely good.",
          "But daily steps, stairs and chores across 112 waking hours quietly burn double that.",
          "Scientists call it NEAT — and it's why active-day people stay lean without 'working out'.",
        ],
        cliffhanger: "The trick is making movement the default, not the event.",
      },
      {
        kind: "examples",
        intro: "Sneak the 150 minutes in:",
        items: [
          { when: "there's a lift and a staircase", then: "the staircase, always (under 4 floors)" },
          { when: "the phone rings", then: "walk while you talk" },
          { when: "you park or take an auto", then: "stop 500 meters early" },
          { when: "it's Sunday", then: "one thing you love that moves you — cricket, dancing, a long walk" },
        ],
      },
      {
        kind: "recap",
        bullets: [
          "Target: 150 min/week moderate + strength 2×.",
          "Everyday movement (NEAT) out-burns the gym.",
          "Make moving the default, exercising the bonus.",
        ],
        action: "Pick two swaps from the list and start today. They cost nothing after week one.",
        cta: { label: "Build my exercise plan", to: "/section/exercise" },
      },
    ],
  },

  {
    id: "sleep-diet",
    title: "The Diet That Starts at 10:30 PM",
    emoji: "😴",
    tint: "linear-gradient(135deg,#ddd6fe,#a78bfa)",
    minutes: 2,
    category: "Move & Rest",
    cards: [
      { kind: "cover", emoji: "😴", tagline: "Tomorrow's cravings are being decided right now." },
      {
        kind: "quiz",
        q: "You slept 5 hours. What happens to your appetite tomorrow?",
        options: ["Nothing much", "It gets louder"],
        best: 1,
      },
      {
        kind: "answer",
        beats: [
          "Short sleep raises ghrelin — the 'eat!' hormone — by about 15%.",
          "It also mutes leptin, the hormone that says 'enough'.",
          "Result: tomorrow-you eats ~300 extra calories and calls it a mood.",
        ],
        cliffhanger: "Which means the easiest diet change of all happens in bed.",
      },
      {
        kind: "text",
        lines: [
          "Fighting cravings on 5 hours of sleep is playing on hard mode.",
          "The same day on 8 hours feels effortless.",
          "Not because you got stronger.",
          "Because the hormones stopped working against you.",
          "Sleep isn't rest from the plan.",
          "Sleep IS the plan.",
        ],
        highlight: 5,
      },
      {
        kind: "recap",
        bullets: [
          "Short sleep = louder hunger, muted fullness.",
          "7–8 hours makes the same diet feel easy.",
          "Screens off at 10, lights out by 10:30.",
        ],
        action: "Tonight: phone charges outside the bedroom. Notice how quiet tomorrow's cravings are.",
      },
    ],
  },

  /* ============ COURSE 4 · STAY ON TRACK ============ */

  {
    id: "fourteen-hour-gap",
    title: "The 14-Hour Gap",
    emoji: "⏰",
    tint: "linear-gradient(135deg,#99f6e4,#2dd4bf)",
    minutes: 3,
    category: "Stay on Track",
    cards: [
      { kind: "cover", emoji: "⏰", tagline: "You already fast every night. Stretch it a little and it starts paying." },
      {
        kind: "text",
        lines: [
          "Remember dinner by 7?",
          "And breakfast at 9?",
          "Count the hours between them.",
          "Fourteen.",
          "You just did intermittent fasting without noticing.",
        ],
        highlight: 3,
        visual: "mealClock",
      },
      {
        kind: "quiz",
        q: "What is your body doing in those 14 food-free hours?",
        options: ["Slowing down", "Repairing itself"],
        best: 1,
      },
      {
        kind: "answer",
        beats: [
          "Insulin stays low, so stored fat finally becomes the fuel.",
          "The gut gets uninterrupted hours to clean and heal.",
          "Fourteen hours is nowhere near starvation — metabolism doesn't dip until multi-day fasts.",
        ],
        cliffhanger: "And a few days a month, you can go one gentle step further.",
      },
      {
        kind: "text",
        lines: [
          "The full rhythm:",
          "Breakfast 9:30. Lunch 2. Mini-meal at 11 or 4. Dinner by 7.",
          "Every meal you love, comfortably placed.",
          "And once a week or two, a fruit-only or nariyal-pani day.",
          "A deeper reset, zero drama.",
        ],
        highlight: 1,
      },
      {
        kind: "recap",
        bullets: [
          "Dinner by 7 + breakfast at 9 = 14-hour fast, free.",
          "Low insulin hours are fat-burning, gut-healing hours.",
          "Occasional fruit-day = deeper reset.",
        ],
        action: "Count tonight's gap: dinner end to breakfast start. Under 14? Move dinner earlier, not breakfast later.",
        cta: { label: "Set my fasting window", to: "/section/fasting" },
      },
    ],
  },

  {
    id: "spot-the-fad",
    title: "How to Smell a Fad Diet",
    emoji: "🚩",
    tint: "linear-gradient(135deg,#fecaca,#fb7185)",
    minutes: 2,
    category: "Stay on Track",
    cards: [
      { kind: "cover", emoji: "🚩", tagline: "A 30-second test that protects you from every scam diet ever." },
      {
        kind: "quiz",
        q: "Which weight-loss promise can you actually trust?",
        options: ["Lose 15 kg in 30 days", "Eat all you want and still lose", "5–10% of your weight in 6 months"],
        best: 2,
      },
      {
        kind: "answer",
        beats: [
          "That unsexy third option is the official NIH benchmark for safe, lasting loss.",
          "The first two are on NIH's literal red-flag list — along with 'no diet or exercise needed' and belly-only 'spot reduction'.",
          "Rule of thumb: the more exciting the promise, the faster the weight comes back.",
        ],
        cliffhanger: "Here's the full red-flag checklist — screenshot it.",
      },
      {
        kind: "text",
        lines: [
          "Walk away when you hear:",
          "'No diet or exercise needed.'",
          "'Eat as much as you want.'",
          "'30 kilos in 30 days.'",
          "'Melts belly fat specifically.'",
          "Or when the truth hides in small print and asterisks.",
        ],
        highlight: 0,
      },
      {
        kind: "recap",
        bullets: [
          "Safe pace: 5–10% of body weight in 6 months.",
          "Exciting promises = red flags, per NIH.",
          "Boring and sustainable beats thrilling and temporary.",
        ],
        action: "Think of the last diet ad you saw. Run it against the checklist. Feels different now, doesn't it?",
      },
    ],
  },

  {
    id: "joy-meal",
    title: "The Joy Meal Rule",
    emoji: "🍕",
    tint: "linear-gradient(135deg,#fbcfe8,#f472b6)",
    minutes: 2,
    category: "Stay on Track",
    cards: [
      { kind: "cover", emoji: "🍕", tagline: "Yes, the biryani fits. Here's the math that lets it." },
      {
        kind: "text",
        lines: [
          "A weight-loss week is simple math.",
          "About 500 calories under your burn, daily.",
          "That's roughly 3,500 for the week — half a kilo of fat.",
          "Now, where does Saturday's biryani fit?",
        ],
      },
      {
        kind: "quiz",
        q: "What's the smarter reward?",
        options: ["One planned joy meal", "A full cheat day"],
        best: 0,
      },
      {
        kind: "answer",
        beats: [
          "A joy meal costs ~800 extra calories — your week absorbs it and keeps 80% of the progress.",
          "A cheat day easily runs 3,000+ over and erases the entire week in 12 hours.",
          "Same pleasure, wildly different price.",
        ],
        cliffhanger: "And the joy meal has a superpower the cheat day doesn't…",
      },
      {
        kind: "text",
        lines: [
          "Anticipation.",
          "A joy meal you PLANNED kills cravings all week.",
          "'Not now — Saturday' is easier than 'never'.",
          "Deprivation was never the goal, {name}.",
          "Arithmetic is.",
        ],
        highlight: 2,
      },
      {
        kind: "recap",
        bullets: [
          "Weekly deficit ≈ 3,500 calories = half a kilo.",
          "Joy meal: 20% dent. Cheat day: 100% erase.",
          "Planned pleasure protects the plan.",
        ],
        action: "Name next week's joy meal right now — the dish, the day, the place. Look forward to it loudly.",
        cta: { label: "See my weekly plan", to: "/section/weight-loss" },
      },
    ],
  },
];

export const WL_LESSON_CATEGORIES = [
  "All",
  "How Weight Works",
  "Eat Smarter",
  "Move & Rest",
  "Stay on Track",
] as const;

const PROGRESS_KEY = "ayuraise.wl.lessons";

export function loadLessonProgress(): Record<string, number> {
  if (typeof window === "undefined") return {};
  try { return JSON.parse(window.localStorage.getItem(PROGRESS_KEY) || "{}"); } catch { return {}; }
}

export function saveLessonProgress(id: string, pct: number) {
  if (typeof window === "undefined") return;
  try {
    const raw = loadLessonProgress();
    raw[id] = Math.max(raw[id] ?? 0, pct);
    window.localStorage.setItem(PROGRESS_KEY, JSON.stringify(raw));
  } catch {}
}
