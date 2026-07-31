// Yoga "Learn" — merges About Yoga + Learn. Two groups (Getting Started, Master the
// Practice), each a set of expandable sections. Technique sections pull live from the
// asana/pranayama/bandha lists in yoga-library.ts via `showAll`.

export interface LearnArticle { title: string; body: string }
export interface LearnSection {
  id: string;
  title: string;
  emoji: string;
  group: "start" | "master";
  intro?: string;
  articles: LearnArticle[];
  showAll?: "asana" | "pranayama" | "bandha"; // renders the full technique list
}

export const YOGA_LEARN_SECTIONS: LearnSection[] = [
  /* ---------------- Getting Started ---------------- */
  {
    id: "basics", title: "Yoga Basics", emoji: "🌱", group: "start",
    articles: [
      { title: "What is Yoga & its benefits", body: "Yoga is a 5,000-year-old system uniting body, breath and mind. Regular practice improves flexibility, strength, balance, sleep and mood — and lowers stress, blood pressure and inflammation." },
      { title: "The 8 Limbs of Yoga", body: "Patanjali's path: Yama (ethics), Niyama (discipline), Asana (posture), Pranayama (breath), Pratyahara (withdrawal), Dharana (focus), Dhyana (meditation), Samadhi (union). Asana is just one limb." },
      { title: "Types of Yoga", body: "Hatha (gentle, foundational), Vinyasa (flowing), Ashtanga (vigorous set sequence), Iyengar (alignment & props), Yin (long-held), Restorative (deep rest), Kundalini (energy & breath)." },
      { title: "How to get started", body: "Start with 10–15 min, 3–4 days a week. Empty stomach, comfortable clothes, a non-slip mat. Move slowly, never force a stretch, and rest whenever you need. Consistency beats intensity." },
      { title: "Common myths", body: "You don't need to be flexible to start — yoga makes you flexible. It's not just stretching (it builds real strength), it's not religious, and it's not only for women or the young." },
    ],
  },
  {
    id: "lifestyle", title: "Lifestyle & Routine", emoji: "🌇", group: "start",
    articles: [
      { title: "Morning routine", body: "Warm water on waking, then 10–20 min of Surya Namaskar + gentle stretches sets the tone for the day and wakes digestion." },
      { title: "Evening routine", body: "Slow, calming poses — forward folds, gentle twists, legs-up-the-wall — plus a few minutes of pranayama to unwind the nervous system before sleep." },
      { title: "What to eat before / after", body: "Practise on an empty or light stomach (2–3 hrs after a meal). After, wait ~30 min then eat something light and warm — fruit, nuts, or a proper meal." },
      { title: "Best time to practice", body: "Early morning (Brahma muhurta) is traditional and ideal for energy. Evening works for calm & flexibility. The best time is the one you'll keep." },
      { title: "Building a daily habit", body: "Anchor it to something you already do (after brushing, before chai). Keep the mat visible. Start tiny — even 5 minutes counts — and let it grow." },
    ],
  },
  {
    id: "faqs", title: "FAQs", emoji: "❓", group: "start",
    articles: [
      { title: "Can I do yoga every day?", body: "Yes — daily gentle practice is beneficial. Vary intensity: vigorous flows 3–4×/week, restorative or pranayama on other days. Listen to your body." },
      { title: "How long should I practice?", body: "10–15 min daily is a great start and enough to see benefits. Build toward 30–45 min as it becomes a habit." },
      { title: "Yoga vs Exercise", body: "Exercise mainly trains muscles & heart; yoga also trains the nervous system, breath and mind. Best results come from doing both — yoga complements strength/cardio." },
      { title: "Yoga during pregnancy", body: "Prenatal yoga is wonderful, but avoid deep twists, strong core work, lying flat on the back (late), and inversions. Always practise under qualified guidance." },
      { title: "Beginner questions", body: "It's normal to feel wobbly, to not touch your toes, and to breathe hard at first. Props help. Never push into sharp pain — discomfort is fine, pain is a stop sign." },
    ],
  },

  /* ---------------- Master the Practice ---------------- */
  {
    id: "asana-guide", title: "Asana Guides", emoji: "🧘", group: "master", showAll: "asana",
    intro: "Alignment & posture matter more than depth. Here's the full asana set — tap to explore each.",
    articles: [
      { title: "Common mistakes", body: "Holding the breath, forcing range, collapsing the lower back, locking joints, and comparing to others. Ease off 10% and breathe." },
      { title: "Benefits", body: "Asanas build strength and mobility, improve posture and circulation, massage internal organs, and calm the mind through breath-linked movement." },
      { title: "Contraindications", body: "Skip inversions with high BP or glaucoma, deep backbends with disc issues, and strong twists after abdominal surgery. When unsure, ask a teacher or doctor." },
      { title: "Beginner tips", body: "Use props (blocks, straps, a wall), keep a soft gaze, and prioritise steady breath over depth. Rest in Child's Pose anytime." },
      { title: "Best time to practise", body: "Morning for energising standing poses; evening for calming forward folds and restorative shapes." },
    ],
  },
  {
    id: "pranayama-guide", title: "Breathing (Pranayama)", emoji: "🌬️", group: "master", showAll: "pranayama",
    intro: "Breath is the bridge between body and mind. Here are the core techniques.",
    articles: [
      { title: "When to practice", body: "On an empty stomach, seated tall. Calming breaths (Anulom Vilom, Bhramari) anytime; energising ones (Kapalbhati, Bhastrika) in the morning, not before bed." },
      { title: "Benefits", body: "Lowers stress and blood pressure, improves lung capacity and focus, balances the nervous system, and prepares the mind for meditation." },
      { title: "Mistakes to avoid", body: "Straining or forcing the breath, practising on a full stomach, over-doing Kapalbhati/Bhastrika (dizziness), and holding the breath if pregnant or hypertensive." },
    ],
  },
  {
    id: "bandha-guide", title: "Bandhas (Locks)", emoji: "🔒", group: "master", showAll: "bandha",
    intro: "Bandhas contain and channel energy. Learn them gently, after breath is steady.",
    articles: [
      { title: "When to practice", body: "Introduce after you're comfortable with asana and pranayama. Practise on an empty stomach, and only under guidance for Uddiyana." },
      { title: "Benefits", body: "Bandhas support core stability, improve digestion, steady the mind, and deepen pranayama and meditation." },
      { title: "Mistakes to avoid", body: "Never force. Avoid Uddiyana Bandha with high BP, heart conditions, ulcers, or during pregnancy and menstruation." },
    ],
  },
  {
    id: "health", title: "Yoga for Health", emoji: "🫀", group: "master",
    articles: [
      { title: "The science behind yoga", body: "Yoga shifts you into the parasympathetic ('rest & digest') state, lowering cortisol and heart rate. MRI studies show it thickens brain regions for focus and calm." },
      { title: "How yoga supports each body system", body: "Heart: lowers BP. Lungs: expands capacity. Gut: eases digestion & acidity. Joints: builds protective strength. Hormones: supports thyroid & PCOS. Mind: cuts anxiety." },
      { title: "Evidence-based articles", body: "Trials support yoga as an adjunct for hypertension, type-2 diabetes, chronic back pain, anxiety and PCOS — often reducing the medication needed, alongside your doctor." },
    ],
  },
  {
    id: "safety", title: "Safety & Recovery", emoji: "🛟", group: "master",
    articles: [
      { title: "Who should avoid certain poses", body: "High BP & glaucoma: skip inversions. Pregnancy: avoid deep twists, strong core, prone poses. Recent surgery or acute injury: rest and get cleared first." },
      { title: "Modifications", body: "Bend the knees in forward folds, use blocks under hands, a strap for reach, a wall for balance, and a bolster under hips or back for support." },
      { title: "Injury prevention", body: "Warm up first, move with the breath, never bounce into stretches, engage muscles around joints, and stop at sharp pain — not push through it." },
      { title: "Recovery practices", body: "Yin, restorative poses, legs-up-the-wall, gentle twists and Yoga Nidra speed recovery and calm the nervous system on rest days." },
    ],
  },
];
