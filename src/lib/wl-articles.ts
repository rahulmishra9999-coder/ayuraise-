// Weight-loss "Coach Reads" — evidence-based articles, Indian vegetarian context.
// Grounded in: Harvard Health (0.5–1 kg/week, 500–750 kcal deficit), Mayo Clinic
// (6 strategies), NIDDK (150 min/week, plate guidance), protein-satiety RCTs
// (≥25 g protein at a meal → ghrelin ↓, PYY ↑, less eaten at next meal).
// Style: docs/content-style-guide.md — short lines, numbers over adjectives.

export interface ArticleFoodRow {
  label: string;
  value: string;
}

export interface ArticleSection {
  h: string;
  paras?: string[];
  bullets?: string[];
  items?: ArticleFoodRow[];
}

export interface WLArticle {
  id: string;
  title: string;
  emoji: string;
  tint: string;
  minutes: number;
  tag: string;
  intro: string[];
  sections: ArticleSection[];
}

export const WL_ARTICLES: WLArticle[] = [
  /* ---------------------------------------------------------- 1 */
  {
    id: "protein-breakfasts",
    title: "50 High-Protein Veg Breakfasts That Keep You Full",
    emoji: "🍳",
    tint: "linear-gradient(135deg,#fef3c7,#fbbf24)",
    minutes: 6,
    tag: "Protein",
    intro: [
      "Research is unusually clear on one breakfast rule.",
      "25–30 grams of protein at breakfast switches hunger off till lunch.",
      "In trials, that much protein dropped the hunger hormone ghrelin by ~27% and cut what people ate at lunch.",
      "Here are 50 vegetarian ways to hit the number — with the math shown.",
    ],
    sections: [
      {
        h: "Chillas & cheelas (the workhorses)",
        paras: ["One chilla alone won't reach 25 g. The pairings below will."],
        items: [
          { label: "2 moong dal chillas + 1 bowl curd", value: "~22 g · 380 kcal" },
          { label: "2 besan chillas + paneer stuffing (50 g)", value: "~26 g · 420 kcal" },
          { label: "2 ragi chillas + 1 glass milk", value: "~18 g · 390 kcal" },
          { label: "Pesarattu (green moong dosa) ×2 + sambar", value: "~24 g · 400 kcal" },
          { label: "Besan-oats chilla ×2 + hung curd dip", value: "~25 g · 410 kcal" },
        ],
      },
      {
        h: "Paneer first",
        paras: ["Paneer is the vegetarian protein king: 18 g per 100 g."],
        items: [
          { label: "Paneer bhurji (100 g) + 1 phulka", value: "~24 g · 380 kcal" },
          { label: "Grilled paneer (80 g) + veg sandwich", value: "~22 g · 400 kcal" },
          { label: "Paneer-stuffed 2 mini parathas + chaas", value: "~23 g · 450 kcal" },
          { label: "Paneer + capsicum skewers (100 g)", value: "~20 g · 280 kcal" },
        ],
      },
      {
        h: "Curd & milk bowls",
        paras: ["Hung curd doubles the protein of regular dahi."],
        items: [
          { label: "Hung curd bowl (200 g) + fruit + pumpkin seeds", value: "~22 g · 320 kcal" },
          { label: "Dahi (250 g) + 2 tbsp sattu stirred in + banana", value: "~21 g · 350 kcal" },
          { label: "Milk-oats (40 g oats, 300 ml milk) + almonds", value: "~19 g · 380 kcal" },
          { label: "Paneer + curd smoothie with dates", value: "~24 g · 340 kcal" },
        ],
      },
      {
        h: "Sprouts & legumes",
        items: [
          { label: "Steamed moong sprouts (1 big bowl) + peanuts", value: "~18 g · 300 kcal" },
          { label: "Sprouts chaat + 1 boiled potato + curd", value: "~20 g · 360 kcal" },
          { label: "Boiled chana bowl (150 g) + onion-tomato", value: "~19 g · 330 kcal" },
          { label: "Misal (moth sprouts) + 1 pav only", value: "~21 g · 420 kcal" },
        ],
      },
      {
        h: "Sattu — the desi protein powder",
        paras: ["Sattu is ~20 g protein per 100 g and costs a tenth of whey."],
        items: [
          { label: "Sattu drink (4 tbsp) + lemon + jeera", value: "~13 g · 220 kcal" },
          { label: "Sattu paratha ×1 + curd bowl", value: "~19 g · 400 kcal" },
          { label: "Sattu drink + 1 moong chilla", value: "~20 g · 350 kcal" },
        ],
      },
      {
        h: "Soy — the heavyweight",
        paras: ["Soy chunks: 52 g protein per 100 g dry. Nothing vegetarian comes close."],
        items: [
          { label: "Soy chunk bhurji (40 g dry) + 1 phulka", value: "~24 g · 340 kcal" },
          { label: "Tofu bhurji (150 g) + toast", value: "~20 g · 350 kcal" },
          { label: "Soy milk (300 ml) + peanut butter toast", value: "~18 g · 380 kcal" },
        ],
      },
      {
        h: "South Indian, upgraded",
        paras: ["Idli-dosa are carb-heavy alone — sambar and podi fix that."],
        items: [
          { label: "3 idlis + 2 bowls sambar + podi", value: "~16 g · 380 kcal" },
          { label: "Adai (mixed-dal dosa) ×2 + chutney", value: "~22 g · 420 kcal" },
          { label: "Upma + 2 tbsp roasted chana dal + curd", value: "~15 g · 400 kcal" },
        ],
      },
      {
        h: "The pattern to remember",
        bullets: [
          "Anchor: dal, paneer, curd, sprouts, sattu or soy — every single morning.",
          "A grain alone (poha, upma, dalia, toast) is a 5–8 g breakfast. Add an anchor.",
          "Add good fats to seal it: 4–5 walnuts, soaked almonds, pumpkin seeds, 2 soaked figs.",
          "Target: 25 g. Count it once, then eyeball forever.",
        ],
      },
    ],
  },

  /* ---------------------------------------------------------- 2 */
  {
    id: "meals-under-500",
    title: "Healthy Indian Meals Under 500 Calories",
    emoji: "🍛",
    tint: "linear-gradient(135deg,#bbf7d0,#4ade80)",
    minutes: 5,
    tag: "Meals",
    intro: [
      "A weight-loss lunch isn't a sad salad.",
      "It's your normal thali with the math done once.",
      "Each meal below lands at 400–500 kcal with 15–25 g protein.",
      "Portions use katori (150 ml bowl) so you can eyeball them.",
    ],
    sections: [
      {
        h: "North Indian thalis",
        items: [
          { label: "2 phulkas + 1 katori dal + 1 katori sabzi + salad + chaas", value: "~470 kcal · 18 g protein" },
          { label: "1 katori rajma + 1 katori rice + salad + curd", value: "~480 kcal · 19 g" },
          { label: "2 phulkas + palak paneer (80 g paneer) + salad", value: "~490 kcal · 21 g" },
          { label: "1 katori chole + 1 phulka + big salad + chaas", value: "~450 kcal · 17 g" },
          { label: "Moong khichdi (1.5 katori) + curd + papad-free pickle", value: "~430 kcal · 16 g" },
        ],
      },
      {
        h: "South Indian plates",
        items: [
          { label: "2 idlis + 2 katori sambar + beans poriyal", value: "~420 kcal · 15 g" },
          { label: "1 plain dosa + sambar + tomato chutney", value: "~440 kcal · 12 g" },
          { label: "Curd rice (1.5 katori) + rasam + steamed veg", value: "~450 kcal · 14 g" },
          { label: "Lemon millet rice + 1 katori sambar + salad", value: "~460 kcal · 13 g" },
        ],
      },
      {
        h: "One-bowl dinners",
        items: [
          { label: "Veg-dal soup (2 katori) + 1 slice millet toast", value: "~320 kcal · 14 g" },
          { label: "Stir-fried veg + 100 g roasted paneer", value: "~380 kcal · 22 g" },
          { label: "Steamed sprouts bowl + peanuts + lemon", value: "~330 kcal · 17 g" },
          { label: "Sattu drink + 1 moong chilla + salad", value: "~380 kcal · 20 g" },
          { label: "Vegetable dalia (1.5 katori) + 1 glass chaas", value: "~360 kcal · 12 g" },
        ],
      },
      {
        h: "What made these under 500",
        bullets: [
          "One grain serving, not two — the dal/sabzi/salad do the filling.",
          "Ghee measured: 1 tsp on the dal, not poured.",
          "Salad or soup starts the meal — volume first, density last.",
          "Curd or chaas closes it — protein and satisfaction, minimal calories.",
        ],
      },
    ],
  },

  /* ---------------------------------------------------------- 3 */
  {
    id: "plate-method",
    title: "What Your Plate Should Look Like",
    emoji: "🍽️",
    tint: "linear-gradient(135deg,#fed7aa,#fb923c)",
    minutes: 4,
    tag: "Meals",
    intro: [
      "Forget counting for a moment.",
      "Nutrition science compresses into one picture: the plate.",
      "Half vegetables. Quarter protein. Quarter whole grains.",
      "Get the picture right and the calories mostly take care of themselves.",
    ],
    sections: [
      {
        h: "The half-quarter-quarter rule",
        bullets: [
          "½ plate — vegetables: sabzi, salad, poriyal, raita-veg. Volume that fills.",
          "¼ plate — protein: dal, rajma, chole, paneer, sprouts, curd, soy.",
          "¼ plate — whole grains: phulka, brown/red rice, millets, dalia.",
          "1 tsp ghee on top is welcome. 1 tbsp poured is dessert pretending to be tadka.",
        ],
      },
      {
        h: "Translated to a thali",
        paras: [
          "The traditional thali already knows this — it just drifted over time.",
          "Two katori sabzi + one big salad = your half plate.",
          "One katori dal or 80 g paneer = your protein quarter.",
          "Two phulkas OR one katori rice = your grain quarter. Not both.",
        ],
      },
      {
        h: "The hand guide (no weighing scale needed)",
        items: [
          { label: "Vegetables", value: "2 open palms" },
          { label: "Dal / paneer / protein", value: "1 fist / 1 palm" },
          { label: "Grain (rice, roti)", value: "1 cupped hand" },
          { label: "Ghee / oil / nuts", value: "1 thumb" },
        ],
      },
      {
        h: "Eat in this order",
        bullets: [
          "Salad and veg first — they part-fill the stomach for near-zero calories.",
          "Dal and paneer next — protein tells the brain 'we're done soon'.",
          "Grain last — you'll naturally take less of it.",
        ],
      },
    ],
  },

  /* ---------------------------------------------------------- 4 */
  {
    id: "perfect-day",
    title: "The Perfect Day for Sustainable Weight Loss",
    emoji: "🌤️",
    tint: "linear-gradient(135deg,#99f6e4,#2dd4bf)",
    minutes: 5,
    tag: "Routine",
    intro: [
      "Sustainable means: you could do this day for a year without hating it.",
      "It creates a quiet 500–750 kcal daily deficit — Harvard's number for losing 0.5–1 kg a week.",
      "Nothing here is extreme. That's the point.",
    ],
    sections: [
      {
        h: "Morning",
        items: [
          { label: "6:30–7:00 · Wake, warm water (lemon/ginger if you like)", value: "hydrate first" },
          { label: "7:15 · 30–40 min movement: brisk walk, yoga, strength ×2/week", value: "~200–300 kcal" },
          { label: "9:00–9:30 · Protein breakfast (≥25 g — see the 50 breakfasts)", value: "~350–420 kcal" },
        ],
      },
      {
        h: "Midday",
        items: [
          { label: "11:30 · Fruit or roasted chana if hungry", value: "~100 kcal" },
          { label: "1:30–2:00 · Thali by the plate rule — salad first", value: "~450–500 kcal" },
          { label: "2:15 · 10-minute stroll — flattens the lunch sugar spike", value: "free" },
        ],
      },
      {
        h: "Evening",
        items: [
          { label: "4:30 · Chai (1 tsp sugar max) + a <200 kcal snack", value: "~200 kcal" },
          { label: "6:45 · Light dinner: soup, khichdi, sprouts, paneer-veg", value: "~350–400 kcal" },
          { label: "7:00 · Kitchen closes. The 14-hour gap begins", value: "0 kcal, big returns" },
        ],
      },
      {
        h: "Night",
        items: [
          { label: "8:00 · Post-dinner family walk", value: "~100 kcal" },
          { label: "10:00 · Screens off — short sleep raises tomorrow's hunger ~300 kcal", value: "protect it" },
          { label: "10:30 · Lights out. 7–8 hours", value: "the silent fat-loss lever" },
        ],
      },
      {
        h: "The weekly rhythm around it",
        bullets: [
          "One weigh-in, fixed day and time — track the trend, not the Tuesday.",
          "One planned joy meal — anticipation beats deprivation.",
          "150+ minutes of movement across the week, however it adds up.",
          "Optional: one fruit/nariyal-pani day for a gentle gut reset.",
        ],
      },
    ],
  },

  /* ---------------------------------------------------------- 5 */
  {
    id: "snacks-under-200",
    title: "25 Veg Snacks Under 200 Calories",
    emoji: "🥜",
    tint: "linear-gradient(135deg,#fde68a,#f59e0b)",
    minutes: 4,
    tag: "Snacks",
    intro: [
      "Snacking isn't the enemy. Blind snacking is.",
      "Every snack here is portioned, counted, and actually available in an Indian kitchen.",
      "Rule of thumb: a snack with protein or fiber holds you; a snack of maida just books the next snack.",
    ],
    sections: [
      {
        h: "Roasted & crunchy",
        items: [
          { label: "Roasted chana (30 g)", value: "~120 kcal · 6 g protein" },
          { label: "Roasted makhana in 1 tsp ghee (25 g)", value: "~130 kcal" },
          { label: "Roasted peanuts (25 g)", value: "~145 kcal · 7 g" },
          { label: "1 khakhra + green chutney", value: "~130 kcal" },
          { label: "Popcorn, home-popped (3 cups)", value: "~120 kcal" },
          { label: "Roasted moong (30 g)", value: "~110 kcal · 7 g" },
        ],
      },
      {
        h: "Fresh & cooling",
        items: [
          { label: "1 guava with chaat masala", value: "~60 kcal · 5 g fiber" },
          { label: "Cucumber-tomato plate + lemon", value: "~50 kcal" },
          { label: "1 bowl papaya or watermelon", value: "~60–80 kcal" },
          { label: "Chaas (1 big glass, thin)", value: "~60 kcal" },
          { label: "1 apple + 4 almonds", value: "~150 kcal" },
          { label: "Coconut water + its malai", value: "~80 kcal" },
        ],
      },
      {
        h: "Protein-forward",
        items: [
          { label: "Sprouts chaat (1 katori)", value: "~120 kcal · 8 g" },
          { label: "Boiled chana (100 g) + onion + lemon", value: "~160 kcal · 9 g" },
          { label: "Hung curd (100 g) + jeera + mint", value: "~90 kcal · 10 g" },
          { label: "Paneer cubes (50 g) + pepper", value: "~130 kcal · 9 g" },
          { label: "Sattu drink, salted (2 tbsp)", value: "~110 kcal · 7 g" },
          { label: "1 boiled egg-style tofu bhurji (100 g)", value: "~90 kcal · 8 g" },
        ],
      },
      {
        h: "Sweet tooth, handled",
        items: [
          { label: "2 dates + 2 walnuts", value: "~150 kcal" },
          { label: "1 small anjeer + 5 almonds", value: "~120 kcal" },
          { label: "Fruit + 1 tbsp peanut butter", value: "~180 kcal" },
          { label: "Warm milk + jaggery pinch + nutmeg", value: "~150 kcal" },
          { label: "1 small piece dark chocolate + 4 peanuts", value: "~120 kcal" },
          { label: "Roasted til-gud ladoo (1 small)", value: "~150 kcal" },
          { label: "Baked shakarkandi (100 g) + chaat masala", value: "~90 kcal" },
        ],
      },
      {
        h: "The two snack rules",
        bullets: [
          "Portion it into a bowl. Never eat from the packet — packets have no bottom.",
          "If it's maida + sugar + oil ('diet' biscuits included), it's not a snack, it's a trap.",
        ],
      },
    ],
  },

  /* ---------------------------------------------------------- 6 */
  {
    id: "meal-prep",
    title: "Meal Prep for Busy Professionals",
    emoji: "🫙",
    tint: "linear-gradient(135deg,#c7d2fe,#818cf8)",
    minutes: 5,
    tag: "Routine",
    intro: [
      "Weight loss fails at 8 PM on a tired Tuesday.",
      "Not from weak will — from an empty fridge and a full food-delivery app.",
      "90 minutes on Sunday removes that Tuesday forever.",
    ],
    sections: [
      {
        h: "The Sunday 90 (do these in parallel)",
        bullets: [
          "Soak: moong for sprouts, chana, rajma — jars, water, done (10 min).",
          "Boil: 1 big batch dal + 1 batch chana. Fridge for 3 days (30 min, mostly unattended).",
          "Batter: moong-dal chilla batter + dosa batter — 3 days of instant breakfasts (15 min).",
          "Chop: onion, tomato, capsicum, lauki boxes. Salad veg washed and dried (20 min).",
          "Set: a big batch of curd. Hang half of it → hung curd for snacks (5 min active).",
          "Roast: chana, peanuts, makhana into labelled jars — your snack wall (10 min).",
        ],
      },
      {
        h: "The 10-minute weekday formula",
        paras: [
          "Every meal becomes assembly, not cooking.",
          "Grain + protein + veg + something fresh.",
        ],
        items: [
          { label: "Breakfast", value: "batter → chilla + ready curd (8 min)" },
          { label: "Lunch dabba", value: "phulkas + reheated dal + chopped-veg sabzi + salad box (15 min)" },
          { label: "Dinner", value: "soup from chopped veg + sprouts stir-fry (12 min)" },
        ],
      },
      {
        h: "The office dabba pattern",
        bullets: [
          "Box 1: grain (2 phulkas / 1 katori millet rice).",
          "Box 2: protein (dal / chole / paneer bhurji).",
          "Box 3: the biggest one — salad + sabzi.",
          "Small box: roasted chana for the 4 PM chai — so the office biscuits lose.",
        ],
      },
      {
        h: "Three prep truths",
        bullets: [
          "Prep removes decisions, and decisions are where diets die.",
          "Cooked dal keeps 3 days refrigerated; sprouts 2 days; batters 3 days.",
          "Prep the snacks too — hunger between meals is a when, not an if.",
        ],
      },
    ],
  },

  /* ---------------------------------------------------------- 7 */
  {
    id: "eating-out",
    title: "Eating Out Without Ruining Your Weight Loss",
    emoji: "🍽️",
    tint: "linear-gradient(135deg,#fbcfe8,#f472b6)",
    minutes: 4,
    tag: "Out & About",
    intro: [
      "You'll eat out. You should eat out.",
      "A weight-loss plan that can't survive a restaurant isn't a plan — it's a countdown.",
      "Here's the playbook.",
    ],
    sections: [
      {
        h: "Order like a pro",
        bullets: [
          "Decide before the menu opens — menus are engineered temptation.",
          "Start with soup (not creamy) or salad. Old trick, still undefeated.",
          "Dry > gravy: restaurant gravies are cream, cashew and oil. Tandoori paneer beats butter paneer by ~300 kcal.",
          "Roti or phulka over butter naan (a naan is ~300+ kcal before the sabzi arrives).",
          "One rice OR one bread — not the wedding-style both.",
        ],
      },
      {
        h: "The buffet strategy",
        bullets: [
          "Walk the full buffet once before touching a plate. Survey, then select.",
          "One plate, salad-heavy first round. No 'trying everything' — pick your top 3.",
          "Dessert: yes, one, shared, savoured slowly. Eaten guilt-free counts as part of the plan.",
        ],
      },
      {
        h: "Party & drinks math",
        items: [
          { label: "1 sweet mocktail / soft drink", value: "~150–200 kcal" },
          { label: "Nimbu-soda (no sugar) / jaljeera", value: "~10–30 kcal" },
          { label: "Fried starters round ×3", value: "~400+ kcal, quietly" },
          { label: "Paneer tikka / grilled starters", value: "~200 kcal, filling" },
        ],
        paras: ["Eat a small protein snack before leaving home — you'll graze half as much."],
      },
      {
        h: "And if it became a feast?",
        bullets: [
          "It was one meal. One meal never made anyone gain — patterns do.",
          "No punishment, no skipping the next meal (that's the binge cycle talking).",
          "Next morning: normal protein breakfast, a longer walk, back on rhythm.",
        ],
      },
    ],
  },

  /* ---------------------------------------------------------- 8 */
  {
    id: "protein-science",
    title: "The Science of Protein for Fat Loss",
    emoji: "🧬",
    tint: "linear-gradient(135deg,#e9d5ff,#a78bfa)",
    minutes: 5,
    tag: "Protein",
    intro: [
      "Every macro debate eventually surrenders to one fact.",
      "In a calorie deficit, protein decides WHAT you lose — fat or muscle.",
      "Here's the science, then the vegetarian playbook.",
    ],
    sections: [
      {
        h: "Three reasons protein wins",
        bullets: [
          "It burns to digest: 20–30% of protein's calories are spent digesting it (carbs: 5–10%).",
          "It silences hunger: ≥25 g at a meal drops ghrelin (~27% in trials) and raises the fullness hormone PYY (~48%).",
          "It protects muscle: Harvard notes rapid low-protein loss sheds muscle — which drags metabolism down with it.",
        ],
      },
      {
        h: "How much do you need?",
        paras: [
          "Maintenance: ~0.8 g per kg of body weight.",
          "During weight loss: 1.2–1.6 g per kg preserves muscle while fat goes.",
          "A 70 kg person losing weight: aim for 85–110 g a day.",
          "Split it: 25–30 g per meal beats 60 g at dinner — satiety works per-meal.",
        ],
      },
      {
        h: "The vegetarian top 12 (protein per serving)",
        items: [
          { label: "Soy chunks (50 g dry)", value: "26 g" },
          { label: "Paneer (100 g)", value: "18 g" },
          { label: "Tofu (150 g)", value: "12 g" },
          { label: "Sattu (4 tbsp)", value: "13 g" },
          { label: "Moong sprouts (1 big bowl)", value: "9–12 g" },
          { label: "Cooked dal (1 katori)", value: "6–7 g" },
          { label: "Rajma / chole (1 katori)", value: "7–8 g" },
          { label: "Hung curd (150 g)", value: "12–15 g" },
          { label: "Milk (1 glass, 250 ml)", value: "8 g" },
          { label: "Peanuts (30 g)", value: "8 g" },
          { label: "Besan (2 chillas' worth)", value: "10 g" },
          { label: "Whole moong (1 katori cooked)", value: "9 g" },
        ],
      },
      {
        h: "The dal myth, gently corrected",
        paras: [
          "'We eat dal daily, protein is covered' — the most common Indian nutrition myth.",
          "One katori of dal is 6–7 g. Your daily need is 80–110 g.",
          "Dal is a contributor, not a strategy.",
          "The fix: one CONCENTRATED protein (paneer, soy, sattu, sprouts, hung curd) at every meal, dal as the supporting act.",
          "Bonus: grain + dal together (khichdi, dal-chawal, idli-sambar) completes the amino-acid profile — the combination your grandmother already knew.",
        ],
      },
    ],
  },

  /* ---------------------------------------------------------- 9 */
  {
    id: "satiety-foods",
    title: "Foods That Keep You Full for Longer",
    emoji: "🫗",
    tint: "linear-gradient(135deg,#a7f3d0,#34d399)",
    minutes: 4,
    tag: "Meals",
    intro: [
      "Fullness isn't luck. It's three measurable properties.",
      "Water content. Fiber. Protein.",
      "Foods carrying all three keep you full for hours on few calories.",
      "Ranked for the Indian kitchen:",
    ],
    sections: [
      {
        h: "The satiety champions",
        items: [
          { label: "🥣 Dal-veg soup (water + fiber + protein)", value: "all three — dinner MVP" },
          { label: "🌱 Steamed sprouts", value: "protein + fiber, dense chew" },
          { label: "🍲 Moong khichdi with veg", value: "complete protein + warm volume" },
          { label: "🥒 Cucumber, tomato, lauki (95%+ water)", value: "volume for free" },
          { label: "🍈 Guava (5 g fiber each)", value: "the most filling fruit per calorie" },
          { label: "🥛 Curd / chaas", value: "protein + volume, cools cravings" },
          { label: "🌾 Dalia or oats cooked in milk", value: "slow carb + protein — IF milk is in it" },
          { label: "🥔 Boiled potato (yes, boiled)", value: "top of satiety research charts — frying reverses it" },
        ],
      },
      {
        h: "The hunger boomerangs (full now, hungry in 90 minutes)",
        bullets: [
          "Maida anything: white bread, biscuits, rusk, bakery.",
          "Sugary drinks — including fresh juice.",
          "Fried snacks: the oil adds calories, not staying power.",
          "Poha/upma/dalia ALONE — good base, but without dal/curd/peanuts it's a 2-hour meal.",
        ],
      },
      {
        h: "Build every meal like this",
        bullets: [
          "Something watery (salad, soup, veg) — volume.",
          "Something fibrous (whole grain, legume) — duration.",
          "Something protein (the anchor) — the off-switch.",
          "That trio is why a 450-kcal thali outlasts a 600-kcal burger.",
        ],
      },
    ],
  },

  /* ---------------------------------------------------------- 10 */
  {
    id: "seven-day-plan",
    title: "7-Day Beginner Weight Loss Meal Plan",
    emoji: "📅",
    tint: "linear-gradient(135deg,#fecdd3,#fb7185)",
    minutes: 6,
    tag: "Routine",
    intro: [
      "A gentle first week: ~1,450–1,550 kcal a day, 60–75 g protein.",
      "Structure: warm water on waking · breakfast 9:30 · lunch 1:30 · snack 4:30 · dinner by 7.",
      "Swap any meal with its same-slot neighbour — the math still works.",
    ],
    sections: [
      {
        h: "Day 1 & 4",
        items: [
          { label: "Breakfast", value: "2 moong chillas + curd (~380 kcal)" },
          { label: "Lunch", value: "2 phulkas + dal + sabzi + salad + chaas (~470)" },
          { label: "Snack", value: "roasted chana + chai, 1 tsp sugar (~200)" },
          { label: "Dinner", value: "veg-dal soup + stir-fried veg (~350)" },
        ],
      },
      {
        h: "Day 2 & 5",
        items: [
          { label: "Breakfast", value: "hung curd bowl + fruit + pumpkin seeds (~330)" },
          { label: "Lunch", value: "rajma (1 katori) + rice (1 katori) + salad (~480)" },
          { label: "Snack", value: "1 guava + 4 almonds (~120)" },
          { label: "Dinner", value: "paneer bhurji (80 g) + 1 phulka + salad (~400)" },
        ],
      },
      {
        h: "Day 3 & 6",
        items: [
          { label: "Breakfast", value: "besan chilla ×2 + mint chutney + milk (~400)" },
          { label: "Lunch", value: "3 idlis + 2 katori sambar + poriyal (~430)" },
          { label: "Snack", value: "sprouts chaat (~120)" },
          { label: "Dinner", value: "moong khichdi + curd (~400)" },
        ],
      },
      {
        h: "Day 7 — the joy-meal day",
        items: [
          { label: "Breakfast", value: "fruit-only or nariyal pani morning (gut reset)" },
          { label: "Lunch", value: "YOUR JOY MEAL — the biryani/pizza you planned. Enjoy it loudly." },
          { label: "Snack", value: "chaas or coconut water (~60)" },
          { label: "Dinner", value: "light: veg soup + salad (~250)" },
        ],
      },
      {
        h: "Week-1 companions",
        bullets: [
          "10-minute walk after lunch and dinner — non-negotiable, it's the cheat code.",
          "Weigh in ONCE, morning of Day 1 and Day 8 — same time, same clothes.",
          "Expect 0.3–0.8 kg down. Harvard's healthy pace is 0.5–1 kg/week — slower IS the strategy.",
          "Repeat the week with swaps from the other articles. Boring wins.",
        ],
      },
    ],
  },
];

export function getArticle(id: string): WLArticle | undefined {
  return WL_ARTICLES.find((a) => a.id === id);
}
