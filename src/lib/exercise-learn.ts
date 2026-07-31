// "Learn" content for the Workouts section — safety, vegetarian protein, and
// who each training form actually suits.

export interface LearnArticle { title: string; body: string }
export interface LearnSection { id: string; title: string; emoji: string; intro?: string; articles: LearnArticle[] }

export const WORKOUT_LEARN: LearnSection[] = [
  {
    id: "care", title: "Things to take care of", emoji: "🛟",
    intro: "Get these right and you can train for decades without breaking down.",
    articles: [
      { title: "Always warm up, never skip it", body: "5–8 minutes of easy movement raises muscle temperature and joint fluid, which measurably lowers injury risk. Cold muscles tear; warm ones stretch. The warm-up in every session here is there for a reason." },
      { title: "Form beats reps, always", body: "Ten clean squats build more than thirty sloppy ones — and won't wreck your knees. Slow down, film yourself occasionally, and drop the count before you drop the technique." },
      { title: "Breathe — don't hold", body: "Exhale on the effort (pushing up, curling up), inhale on the way back. Holding your breath spikes blood pressure, which matters a lot if you have hypertension or heart issues." },
      { title: "Pain vs discomfort", body: "Burning muscles and heavy breathing are fine. Sharp, stabbing or joint-line pain is a stop sign. Pain that lingers more than 48 hours means you did too much — scale back, don't push through." },
      { title: "Rest days are training days", body: "Muscle is built during recovery, not during the session. Take 1–2 full rest days a week, and sleep 7–8 hours. Under-recovered training is how people plateau and get hurt." },
      { title: "Hydration & the Indian summer", body: "Drink 500 ml in the 2 hours before training and sip through it. In peak summer add a pinch of salt and lemon to water, or take chaas/nimbu paani after — you lose real electrolytes in that heat." },
      { title: "When to check with a doctor first", body: "Get cleared before starting if you have uncontrolled BP or diabetes, heart disease, a recent surgery, a hernia, severe osteoporosis, or you're pregnant. Ayu is not a substitute for that conversation." },
      { title: "Progress slowly — the 10% rule", body: "Add no more than about 10% to your weekly load (time, reps or weight). Most injuries come from doing too much too soon after a motivated week." },
    ],
  },
  {
    id: "protein", title: "Vegetarian protein — where to get it", emoji: "🥗",
    intro: "Muscle needs protein. On an Indian vegetarian plate that takes a little planning, not supplements.",
    articles: [
      { title: "How much do you actually need?", body: "For general health, about 0.8–1 g per kg of body weight daily. If you're strength training or trying to hold muscle while losing fat, aim for 1.2–1.6 g/kg. A 70 kg person training regularly needs roughly 85–110 g a day — spread it across meals, not all at dinner." },
      { title: "Dals & pulses", body: "Moong, masoor, chana, rajma, urad, toor — roughly 7–9 g of protein per cooked katori. Two generous servings a day is the backbone of a vegetarian lifter's diet. Sprouting improves absorption and cuts bloating." },
      { title: "Paneer, curd & milk", body: "Paneer is the heavyweight: about 18–20 g per 100 g. A bowl of curd gives 8–10 g and helps digestion; a glass of milk about 8 g. Choose full-fat or toned based on your calorie target, not on fear of fat." },
      { title: "Soya — the most protein-dense option", body: "Soya chunks are roughly 50 g protein per 100 g dry, tofu around 10–12 g per 100 g. Soya is one of the few plant foods with a complete amino acid profile. Two or three times a week is plenty." },
      { title: "Combine grains + pulses for complete protein", body: "Dal-chawal, rajma-roti, idli-sambar, khichdi — these traditional pairings aren't accidental. Cereals are low in lysine, pulses low in methionine; together they cover the full amino acid set." },
      { title: "Nuts, seeds & the extras", body: "Peanuts (25 g/100 g), almonds, pumpkin and sunflower seeds, and til add 5–8 g per handful plus healthy fat. Great for topping up, but calorie-dense — measure them if you're cutting." },
      { title: "Eating around your workout", body: "Train on a light stomach: a banana or a few dates 30–45 minutes before is enough. Within an hour after, get 20–30 g of protein — a paneer bhurji, a bowl of dal with rice, chaas with sattu, or a soya preparation." },
      { title: "Do you need protein powder?", body: "No — but it's convenient if you're falling short. A plain whey or plant isolate adds 20–25 g per scoop. Treat it as a supplement to a real plate, not a replacement, and check for added sugar." },
    ],
  },
  {
    id: "forms", title: "Which form suits whom", emoji: "🧭",
    intro: "Every style trains something different. Pick the one that fits your body and your week.",
    articles: [
      { title: "Bodyweight / Desi Kasrat", body: "Dand, baithak and surya namaskar — zero equipment, trains the body as one unit, and builds serious tendon strength. Best for: anyone starting out, people who travel, and those who want strength without a gym. Go easy if you have wrist or knee problems." },
      { title: "Gym", body: "The most reliable way to add muscle and bone density, because load is easy to progress. Best for: people with a clear strength or physique goal, and anyone over 40 who wants to protect bone. Needs access and ideally a few sessions of coaching on form." },
      { title: "Calisthenics", body: "Bodyweight skill work — push-ups, pull-ups, planks, progressions toward harder moves. Best for: people who like measurable skill goals and want strength with mobility. Slower to build raw size than weights." },
      { title: "Pilates", body: "Deep core control, posture and spinal health, low impact throughout. Best for: desk workers, back-pain sufferers, post-natal recovery, and anyone who feels 'weak in the middle'. Not a cardio workout — pair it with walking." },
      { title: "Tai Chi", body: "Slow, weight-shifting flow that trains balance and calm at once. Strong evidence for reducing falls in older adults and easing arthritis. Best for: seniors, people with joint pain, high stress or high BP. Almost everyone can do it safely." },
      { title: "Strength Yoga", body: "Power yoga holds — warriors, chaturanga, boat, crow. Builds strength and flexibility together and doubles as stress relief. Best for: people who want strength without equipment, and anyone whose stiffness is holding back other training." },
      { title: "Zumba & Dance", body: "Cardio you'll actually keep doing, because it doesn't feel like exercise. Excellent for mood and heart health. Best for: people who hate structured cardio, and anyone training for consistency over intensity. Watch the knees if you have prior injuries — keep it low-impact." },
      { title: "Boxing", body: "High-intensity conditioning plus coordination, and unmatched for working off a bad day. Best for: fit-and-getting-fitter people, and anyone carrying stress or anger. Wrap the wrists, and skip it if you have shoulder impingement." },
      { title: "HIIT — a caution", body: "Very effective for fat loss and fitness in little time, but it's a high dose. Cap it at 2–3 sessions a week, never on back-to-back days, and avoid it entirely with uncontrolled BP or heart disease until you're cleared." },
    ],
  },
];
