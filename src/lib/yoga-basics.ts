// Yoga basics: types, benefits, specialized categories with recorded positions.
// Static content for the Basics tab in the Yoga section.

export interface YogaType {
  id: string;
  name: string;
  origin: string;
  description: string;
  bestFor: string[];
  emoji: string;
}

export const YOGA_TYPES: YogaType[] = [
  {
    id: "hatha",
    name: "Hatha Yoga",
    origin: "15th century India",
    description: "The foundation of all physical yoga. Slow-paced postures with focus on alignment and breath. Perfect for beginners.",
    bestFor: ["Beginners", "Stress relief", "Flexibility"],
    emoji: "🧘",
  },
  {
    id: "ashtanga",
    name: "Ashtanga Yoga",
    origin: "Mysore tradition",
    description: "A rigorous, structured sequence of postures linked with breath. Builds strength, stamina and discipline.",
    bestFor: ["Athletes", "Strength", "Discipline"],
    emoji: "🔥",
  },
  {
    id: "vinyasa",
    name: "Vinyasa Flow",
    origin: "Modern dynamic style",
    description: "Smooth, flowing sequences synchronized with breath. Each class is unique and creative.",
    bestFor: ["Cardio", "Weight loss", "Energy"],
    emoji: "🌊",
  },
  {
    id: "iyengar",
    name: "Iyengar Yoga",
    origin: "B.K.S. Iyengar",
    description: "Precision-focused practice using props (blocks, belts) to perfect alignment. Therapeutic and detailed.",
    bestFor: ["Injuries", "Alignment", "Seniors"],
    emoji: "📐",
  },
  {
    id: "kundalini",
    name: "Kundalini Yoga",
    origin: "Yogi Bhajan tradition",
    description: "Combines postures, breathwork, mantra and meditation to awaken spiritual energy at the base of the spine.",
    bestFor: ["Spiritual growth", "Energy", "Awareness"],
    emoji: "🐍",
  },
  {
    id: "yin",
    name: "Yin Yoga",
    origin: "Taoist tradition",
    description: "Slow practice holding postures 3–5 minutes to target deep connective tissue, fascia and joints.",
    bestFor: ["Deep stretch", "Stillness", "Recovery"],
    emoji: "🌙",
  },
];

export const YOGA_BENEFITS = [
  { icon: "❤️", title: "Heart health", text: "Lowers blood pressure, improves circulation and resting heart rate." },
  { icon: "🧠", title: "Mental clarity", text: "Reduces cortisol, eases anxiety and depression, sharpens focus." },
  { icon: "💪", title: "Strength & tone", text: "Builds lean muscle, core stability and functional strength." },
  { icon: "🦴", title: "Flexibility & joints", text: "Improves range of motion, joint health and posture." },
  { icon: "😴", title: "Better sleep", text: "Calms the nervous system, deepens sleep quality." },
  { icon: "⚖️", title: "Hormonal balance", text: "Supports thyroid, adrenals, reproductive health and metabolism." },
  { icon: "🌬️", title: "Lung capacity", text: "Pranayam expands breath, oxygenates blood, calms the mind." },
  { icon: "🛡️", title: "Immunity", text: "Stimulates lymph flow and reduces chronic inflammation." },
];

export interface RecordedPose {
  name: string;
  sanskrit: string;
  duration: string;
  emoji: string;
  cue: string;
}

export interface YogaCategory {
  id: string;
  name: string;
  audience: string;
  description: string;
  precautions: string[];
  poses: RecordedPose[];
  gradient: string;
  emoji: string;
}

export const YOGA_CATEGORIES: YogaCategory[] = [
  {
    id: "hypertension",
    name: "Yoga for Hypertension",
    audience: "High blood pressure",
    description: "Calming postures and pranayam to lower BP, reduce stress hormones and support cardiovascular health.",
    precautions: ["Avoid inversions (headstand, shoulder stand)", "No breath retention", "Skip intense backbends"],
    gradient: "var(--gradient-water)",
    emoji: "❤️",
    poses: [
      { name: "Easy Pose", sanskrit: "Sukhasana", duration: "2 min", emoji: "🧘", cue: "Sit tall, soften shoulders, breathe slow." },
      { name: "Cat-Cow", sanskrit: "Marjariasana", duration: "1 min", emoji: "🐈", cue: "Flow with breath, gentle spine wave." },
      { name: "Child's Pose", sanskrit: "Balasana", duration: "2 min", emoji: "🙇", cue: "Forehead to mat, surrender weight." },
      { name: "Bridge Pose", sanskrit: "Setu Bandhasana", duration: "30 sec", emoji: "🌉", cue: "Lift hips gently, breathe wide." },
      { name: "Legs up the Wall", sanskrit: "Viparita Karani", duration: "5 min", emoji: "🦵", cue: "Drains legs, calms the nervous system." },
      { name: "Bee Breath", sanskrit: "Bhramari", duration: "3 min", emoji: "🐝", cue: "Hum on exhale, instantly lowers BP." },
      { name: "Corpse Pose", sanskrit: "Shavasana", duration: "5 min", emoji: "😌", cue: "Total relaxation, natural breath." },
    ],
  },
  {
    id: "asthma",
    name: "Yoga for Asthma",
    audience: "Respiratory support",
    description: "Chest-opening postures and pranayam to expand lung capacity, strengthen respiratory muscles and reduce attacks.",
    precautions: ["Avoid practicing during an attack", "No tight forward folds", "Stay warm, avoid cold floors"],
    gradient: "var(--gradient-dawn)",
    emoji: "🌬️",
    poses: [
      { name: "Mountain Pose", sanskrit: "Tadasana", duration: "1 min", emoji: "🧍", cue: "Stand tall, lift chest, breathe deep." },
      { name: "Cobra Pose", sanskrit: "Bhujangasana", duration: "30 sec", emoji: "🐍", cue: "Opens chest and ribcage." },
      { name: "Bow Pose", sanskrit: "Dhanurasana", duration: "20 sec", emoji: "🏹", cue: "Lift chest and thighs, expand front body." },
      { name: "Camel Pose", sanskrit: "Ustrasana", duration: "30 sec", emoji: "🐪", cue: "Heart opener, increases lung capacity." },
      { name: "Fish Pose", sanskrit: "Matsyasana", duration: "1 min", emoji: "🐟", cue: "Arch chest, throat open, breathe wide." },
      { name: "Alternate Nostril", sanskrit: "Anulom Vilom", duration: "5 min", emoji: "🌬️", cue: "Balances airways, clears passages." },
      { name: "Victorious Breath", sanskrit: "Ujjayi", duration: "3 min", emoji: "🌊", cue: "Ocean-sound breath, builds respiratory strength." },
    ],
  },
  {
    id: "stress",
    name: "Yoga for Stress",
    audience: "Daily stress relief",
    description: "Grounding postures and slow breath to switch off fight-or-flight, lower cortisol and restore calm.",
    precautions: ["Practice in a quiet space", "Skip if feverish or unwell"],
    gradient: "var(--gradient-violet)",
    emoji: "🌿",
    poses: [
      { name: "Child's Pose", sanskrit: "Balasana", duration: "3 min", emoji: "🙇", cue: "Fold forward, release tension." },
      { name: "Standing Forward Fold", sanskrit: "Uttanasana", duration: "1 min", emoji: "🙆", cue: "Let head hang heavy, soften neck." },
      { name: "Cat-Cow", sanskrit: "Marjariasana", duration: "2 min", emoji: "🐈", cue: "Mobilize spine with breath." },
      { name: "Seated Forward Bend", sanskrit: "Paschimottanasana", duration: "2 min", emoji: "🪷", cue: "Calms nervous system, releases back." },
      { name: "Reclined Twist", sanskrit: "Supta Matsyendrasana", duration: "1 min each", emoji: "🌀", cue: "Wring out tension from spine." },
      { name: "Bee Breath", sanskrit: "Bhramari", duration: "3 min", emoji: "🐝", cue: "Humming vibration calms the mind." },
      { name: "Corpse Pose", sanskrit: "Shavasana", duration: "7 min", emoji: "😌", cue: "Total surrender, body scan relaxation." },
    ],
  },
  {
    id: "anxiety",
    name: "Yoga for Anxiety",
    audience: "Calm the nervous system",
    description: "Slow, grounding sequences and long exhalations to activate the parasympathetic nervous system.",
    precautions: ["Avoid fast vinyasa flows", "Stay hydrated", "Practice with eyes soft or closed"],
    gradient: "var(--gradient-sage)",
    emoji: "🌸",
    poses: [
      { name: "Easy Pose with Hands on Heart", sanskrit: "Sukhasana", duration: "3 min", emoji: "🧘", cue: "Feel chest rise, ground through sit bones." },
      { name: "Standing Forward Fold", sanskrit: "Uttanasana", duration: "1 min", emoji: "🙆", cue: "Inversion-lite, calms the brain." },
      { name: "Butterfly Pose", sanskrit: "Baddha Konasana", duration: "2 min", emoji: "🦋", cue: "Opens hips where anxiety stores." },
      { name: "Bridge Pose", sanskrit: "Setu Bandhasana", duration: "30 sec x 3", emoji: "🌉", cue: "Heart opener, builds confidence." },
      { name: "Legs up the Wall", sanskrit: "Viparita Karani", duration: "5 min", emoji: "🦵", cue: "Most restorative pose for anxiety." },
      { name: "4-7-8 Breath", sanskrit: "Pranayam", duration: "5 rounds", emoji: "🌬️", cue: "Inhale 4, hold 7, exhale 8. Powerful calmer." },
      { name: "Yoga Nidra Rest", sanskrit: "Shavasana", duration: "10 min", emoji: "😌", cue: "Guided body scan, deep nervous reset." },
    ],
  },
  {
    id: "diabetes",
    name: "Yoga for Diabetes",
    audience: "Type 2 / Insulin support",
    description: "Twists and forward folds that stimulate pancreas, improve insulin sensitivity and aid weight management.",
    precautions: ["Check sugar before & after", "Eat light 2 hours prior", "Avoid practice during hypoglycemia"],
    gradient: "var(--gradient-gold)",
    emoji: "🍯",
    poses: [
      { name: "Mountain Pose", sanskrit: "Tadasana", duration: "1 min", emoji: "🧍", cue: "Warm-up, find your breath." },
      { name: "Sun Salutation A", sanskrit: "Surya Namaskar", duration: "5 rounds", emoji: "☀️", cue: "Full-body flow, improves circulation." },
      { name: "Half Spinal Twist", sanskrit: "Ardha Matsyendrasana", duration: "1 min each", emoji: "🌀", cue: "Massages pancreas, key for diabetes." },
      { name: "Bow Pose", sanskrit: "Dhanurasana", duration: "30 sec", emoji: "🏹", cue: "Stimulates abdominal organs." },
      { name: "Seated Forward Bend", sanskrit: "Paschimottanasana", duration: "2 min", emoji: "🪷", cue: "Stretches pancreas, calms mind." },
      { name: "Shoulder Stand", sanskrit: "Sarvangasana", duration: "2 min", emoji: "🤸", cue: "Stimulates thyroid (clear with doctor)." },
      { name: "Skull-Shining Breath", sanskrit: "Kapalbhati", duration: "3 rounds", emoji: "💨", cue: "Boosts metabolism (skip if BP high)." },
    ],
  },
  {
    id: "pregnancy",
    name: "Yoga for Pregnant Women",
    audience: "Prenatal (all trimesters)",
    description: "Gentle, modified postures to support a healthy pregnancy, ease back pain, and prepare body for birth.",
    precautions: ["No deep twists or backbends", "Avoid lying on belly or back after 1st trimester", "Skip Kapalbhati & breath retention", "Stop if dizzy or short of breath"],
    gradient: "var(--gradient-clay)",
    emoji: "🤰",
    poses: [
      { name: "Cat-Cow", sanskrit: "Marjariasana", duration: "2 min", emoji: "🐈", cue: "Eases back pain, mobilizes pelvis." },
      { name: "Wide-Knee Child's Pose", sanskrit: "Balasana", duration: "2 min", emoji: "🙇", cue: "Knees wide for belly, rest forehead." },
      { name: "Butterfly Pose", sanskrit: "Baddha Konasana", duration: "3 min", emoji: "🦋", cue: "Opens hips for birth prep." },
      { name: "Modified Side Plank", sanskrit: "Vasisthasana", duration: "20 sec each", emoji: "💪", cue: "Knee down, builds core stability." },
      { name: "Goddess Pose", sanskrit: "Utkata Konasana", duration: "30 sec", emoji: "👸", cue: "Strong legs, open hips." },
      { name: "Supported Squat", sanskrit: "Malasana", duration: "1 min", emoji: "🪑", cue: "Use block under hips, opens pelvis." },
      { name: "Alternate Nostril (gentle)", sanskrit: "Anulom Vilom", duration: "5 min", emoji: "🌬️", cue: "No retention, just smooth breath." },
      { name: "Side-Lying Rest", sanskrit: "Shavasana variation", duration: "10 min", emoji: "😌", cue: "Lie on left side with pillow support." },
    ],
  },
  {
    id: "kids",
    name: "Yoga for Kids",
    audience: "Ages 5–12",
    description: "Playful animal poses and games that build focus, flexibility and emotional regulation in a fun way.",
    precautions: ["Keep sessions 20–30 min", "Make it playful, not perfect", "Encourage breath without forcing"],
    gradient: "var(--gradient-sage)",
    emoji: "🧒",
    poses: [
      { name: "Mountain Pose", sanskrit: "Tadasana", duration: "30 sec", emoji: "⛰️", cue: "Stand tall like a mountain — strong and still." },
      { name: "Tree Pose", sanskrit: "Vrikshasana", duration: "30 sec each", emoji: "🌳", cue: "Grow tall, sway with the wind." },
      { name: "Downward Dog", sanskrit: "Adho Mukha Svanasana", duration: "30 sec", emoji: "🐕", cue: "Bark like a happy puppy!" },
      { name: "Cobra Pose", sanskrit: "Bhujangasana", duration: "20 sec", emoji: "🐍", cue: "Hiss like a snake — sssssss." },
      { name: "Butterfly Pose", sanskrit: "Baddha Konasana", duration: "1 min", emoji: "🦋", cue: "Flap your wings, fly high." },
      { name: "Lion's Breath", sanskrit: "Simhasana", duration: "5 rounds", emoji: "🦁", cue: "Stick out tongue, ROAR!" },
      { name: "Star Pose Relaxation", sanskrit: "Shavasana", duration: "3 min", emoji: "⭐", cue: "Sparkle like a star, completely still." },
    ],
  },
  {
    id: "adolescents",
    name: "Yoga for Adolescents",
    audience: "Ages 13–19",
    description: "Builds strength, body confidence and emotional balance during the turbulent teen years. Reduces screen-fatigue.",
    precautions: ["Respect growth-spurt joint sensitivity", "Avoid extreme backbends if back hurts"],
    gradient: "var(--gradient-leaf)",
    emoji: "🧑‍🎓",
    poses: [
      { name: "Sun Salutation A", sanskrit: "Surya Namaskar", duration: "5 rounds", emoji: "☀️", cue: "Full-body warm-up, builds energy." },
      { name: "Warrior II", sanskrit: "Virabhadrasana II", duration: "30 sec each", emoji: "⚔️", cue: "Strong stance, builds confidence." },
      { name: "Tree Pose", sanskrit: "Vrikshasana", duration: "1 min each", emoji: "🌳", cue: "Improves balance and focus." },
      { name: "Plank", sanskrit: "Phalakasana", duration: "30 sec", emoji: "🪵", cue: "Builds core, key for posture." },
      { name: "Bridge Pose", sanskrit: "Setu Bandhasana", duration: "1 min", emoji: "🌉", cue: "Counters slouching from phones/desks." },
      { name: "Camel Pose", sanskrit: "Ustrasana", duration: "30 sec", emoji: "🐪", cue: "Heart opener, releases chest tightness." },
      { name: "Alternate Nostril", sanskrit: "Anulom Vilom", duration: "5 min", emoji: "🌬️", cue: "Calms exam stress and mood swings." },
      { name: "Corpse Pose", sanskrit: "Shavasana", duration: "5 min", emoji: "😌", cue: "Phone-free rest, total recharge." },
    ],
  },
  {
    id: "geriatric",
    name: "Yoga for Seniors",
    audience: "60+ / Geriatric",
    description: "Chair-supported and gentle floor practice to maintain mobility, balance, bone health and independence.",
    precautions: ["Use chair / wall for balance", "Avoid floor transitions if knees hurt", "Skip inversions"],
    gradient: "var(--gradient-dawn)",
    emoji: "👴",
    poses: [
      { name: "Seated Mountain", sanskrit: "Tadasana (chair)", duration: "1 min", emoji: "🪑", cue: "Sit tall, feet grounded, breathe." },
      { name: "Seated Cat-Cow", sanskrit: "Marjariasana (chair)", duration: "2 min", emoji: "🐈", cue: "Gentle spine wave in chair." },
      { name: "Seated Side Stretch", sanskrit: "Parsva Sukhasana", duration: "30 sec each", emoji: "🙆", cue: "Lengthen side body, breathe wide." },
      { name: "Seated Twist", sanskrit: "Bharadvajasana", duration: "30 sec each", emoji: "🌀", cue: "Gentle twist, hand on chair back." },
      { name: "Standing Wall Push", sanskrit: "Adho Mukha Svanasana", duration: "1 min", emoji: "🧱", cue: "Hands on wall, lengthen spine." },
      { name: "Heel-to-Toe Walk", sanskrit: "Balance practice", duration: "2 min", emoji: "🚶", cue: "Improves balance, prevents falls." },
      { name: "Alternate Nostril", sanskrit: "Anulom Vilom", duration: "5 min", emoji: "🌬️", cue: "Balances energy, sharpens mind." },
      { name: "Guided Relaxation", sanskrit: "Shavasana", duration: "5 min", emoji: "😌", cue: "On chair or floor, total rest." },
    ],
  },
];
