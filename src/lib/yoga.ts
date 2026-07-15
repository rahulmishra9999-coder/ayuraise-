// Yoga pose library + disease-safe filtering + localStorage plan store.
// Frontend-only MVP. No backend calls.

export type Goal =
  | "disease-management"
  | "flexibility"
  | "weight-loss"
  | "stress-relief"
  | "strength"
  | "general-wellness";

export type Disease =
  | "none"
  | "hypertension"
  | "diabetes"
  | "back-pain"
  | "knee-pain"
  | "pcos"
  | "thyroid"
  | "anxiety"
  | "acidity"
  | "asthma";

export interface Pose {
  id: string;
  name: string;
  sanskrit: string;
  durationSec: number;
  level: "beginner" | "intermediate" | "advanced";
  benefits: string[];
  steps: string[];
  // Conditions for which this pose is NOT advised
  avoidFor: Disease[];
  emoji: string;
}

export const POSES: Pose[] = [
  {
    id: "tadasana",
    name: "Mountain Pose",
    sanskrit: "Tadasana",
    durationSec: 45,
    level: "beginner",
    benefits: ["Posture", "Grounding", "Focus"],
    steps: [
      "Stand tall with feet together, arms by your side.",
      "Engage thighs, lift kneecaps, tuck tailbone slightly.",
      "Roll shoulders back, lengthen the crown of head upward.",
      "Breathe deep, soft gaze forward.",
    ],
    avoidFor: [],
    emoji: "🧍",
  },
  {
    id: "vrikshasana",
    name: "Tree Pose",
    sanskrit: "Vrikshasana",
    durationSec: 40,
    level: "beginner",
    benefits: ["Balance", "Leg strength", "Calm"],
    steps: [
      "Shift weight to left foot, place right sole on inner thigh or calf (avoid knee).",
      "Bring palms together at heart center.",
      "Optionally raise arms overhead.",
      "Hold, then switch sides.",
    ],
    avoidFor: ["knee-pain"],
    emoji: "🌳",
  },
  {
    id: "bhujangasana",
    name: "Cobra Pose",
    sanskrit: "Bhujangasana",
    durationSec: 30,
    level: "beginner",
    benefits: ["Spine flexibility", "Opens chest", "Digestion"],
    steps: [
      "Lie face down, palms under shoulders.",
      "Inhale, lift chest, keep elbows soft.",
      "Shoulders away from ears, gaze forward.",
      "Exhale, lower down slowly.",
    ],
    avoidFor: ["back-pain"],
    emoji: "🐍",
  },
  {
    id: "balasana",
    name: "Child's Pose",
    sanskrit: "Balasana",
    durationSec: 60,
    level: "beginner",
    benefits: ["Rest", "Releases back", "Calms mind"],
    steps: [
      "Kneel, big toes together, knees apart.",
      "Sit back on heels, fold forward, arms extended.",
      "Forehead to mat, breathe slow.",
    ],
    avoidFor: ["knee-pain"],
    emoji: "🧘",
  },
  {
    id: "marjari",
    name: "Cat-Cow",
    sanskrit: "Marjariasana",
    durationSec: 60,
    level: "beginner",
    benefits: ["Spine mobility", "Warms body", "Back relief"],
    steps: [
      "Tabletop position, wrists under shoulders.",
      "Inhale: drop belly, lift chest (cow).",
      "Exhale: round spine, tuck chin (cat).",
      "Flow with breath, 8–10 rounds.",
    ],
    avoidFor: [],
    emoji: "🐈",
  },
  {
    id: "setubandha",
    name: "Bridge Pose",
    sanskrit: "Setu Bandhasana",
    durationSec: 40,
    level: "beginner",
    benefits: ["Glutes", "Thyroid", "Mild backbend"],
    steps: [
      "Lie on back, knees bent, feet hip width.",
      "Press feet, lift hips up.",
      "Clasp hands under back, roll shoulders under.",
      "Hold, exhale, lower vertebra by vertebra.",
    ],
    avoidFor: ["back-pain"],
    emoji: "🌉",
  },
  {
    id: "shavasana",
    name: "Corpse Pose",
    sanskrit: "Shavasana",
    durationSec: 120,
    level: "beginner",
    benefits: ["Deep rest", "Lowers BP", "Integrates practice"],
    steps: [
      "Lie flat, arms by sides, palms up.",
      "Let feet fall open.",
      "Soften every muscle, breathe naturally.",
      "Stay 2–5 minutes.",
    ],
    avoidFor: [],
    emoji: "😌",
  },
  {
    id: "trikonasana",
    name: "Triangle Pose",
    sanskrit: "Trikonasana",
    durationSec: 45,
    level: "intermediate",
    benefits: ["Hamstrings", "Side body", "Digestion"],
    steps: [
      "Step feet wide, right foot out.",
      "Extend arms, hinge from right hip.",
      "Right hand to shin/block, left arm up.",
      "Hold, switch sides.",
    ],
    avoidFor: ["back-pain", "hypertension"],
    emoji: "📐",
  },
  {
    id: "ardha-matsyendra",
    name: "Half Spinal Twist",
    sanskrit: "Ardha Matsyendrasana",
    durationSec: 40,
    level: "intermediate",
    benefits: ["Spine twist", "Digestion", "Pancreas (good for diabetes)"],
    steps: [
      "Sit tall, bend right knee, foot outside left thigh.",
      "Left elbow outside right knee, twist right.",
      "Inhale length, exhale deepen twist.",
      "Switch sides.",
    ],
    avoidFor: ["back-pain"],
    emoji: "🌀",
  },
  {
    id: "paschimottanasana",
    name: "Seated Forward Bend",
    sanskrit: "Paschimottanasana",
    durationSec: 60,
    level: "intermediate",
    benefits: ["Hamstrings", "Calms nervous system", "Thyroid"],
    steps: [
      "Sit legs extended.",
      "Inhale lengthen, exhale fold forward from hips.",
      "Hold shins, ankles or feet.",
      "Breathe softly, no force.",
    ],
    avoidFor: ["back-pain", "asthma"],
    emoji: "🪷",
  },
  {
    id: "anulom-vilom",
    name: "Alternate Nostril Breathing",
    sanskrit: "Anulom Vilom",
    durationSec: 180,
    level: "beginner",
    benefits: ["Calms nervous system", "Balances doshas", "Lowers BP"],
    steps: [
      "Sit tall, right thumb closes right nostril.",
      "Inhale left, close left with ring finger.",
      "Exhale right, inhale right.",
      "Close right, exhale left. That's one round.",
    ],
    avoidFor: [],
    emoji: "🌬️",
  },
  {
    id: "bhramari",
    name: "Bee Breath",
    sanskrit: "Bhramari Pranayama",
    durationSec: 120,
    level: "beginner",
    benefits: ["Anxiety relief", "BP", "Mind quietness"],
    steps: [
      "Sit comfortably, close eyes.",
      "Inhale deep through nose.",
      "Exhale slowly humming like a bee.",
      "Repeat 6–8 rounds.",
    ],
    avoidFor: [],
    emoji: "🐝",
  },
];

export const DISEASES: { id: Disease; label: string }[] = [
  { id: "none", label: "None" },
  { id: "hypertension", label: "High BP" },
  { id: "diabetes", label: "Diabetes" },
  { id: "back-pain", label: "Back pain" },
  { id: "knee-pain", label: "Knee pain" },
  { id: "pcos", label: "PCOS" },
  { id: "thyroid", label: "Thyroid" },
  { id: "anxiety", label: "Anxiety" },
  { id: "acidity", label: "Acidity" },
  { id: "asthma", label: "Asthma" },
];

export const GOALS: { id: Goal; label: string; desc: string }[] = [
  { id: "disease-management", label: "Manage my condition", desc: "Therapeutic poses for healing" },
  { id: "flexibility", label: "Flexibility", desc: "Open tight muscles & joints" },
  { id: "weight-loss", label: "Weight loss", desc: "Active sequences, kapha-pacifying" },
  { id: "stress-relief", label: "Stress relief", desc: "Calm the nervous system" },
  { id: "strength", label: "Strength", desc: "Build stable, lean strength" },
  { id: "general-wellness", label: "General wellness", desc: "Stay balanced day to day" },
];

export const DURATIONS = [10, 20, 30, 45, 60] as const;

export interface YogaPlan {
  createdAt: number;
  disease: Disease;
  goal: Goal;
  duration: number; // minutes
  poseIds: string[];
}

export function generatePlan(disease: Disease, goal: Goal, duration: number): YogaPlan {
  const safe = POSES.filter((p) => !p.avoidFor.includes(disease));

  // Prefer pranayam for hypertension/anxiety/asthma goals
  const goalBoost: Record<Goal, string[]> = {
    "disease-management": ["anulom-vilom", "bhramari", "shavasana"],
    flexibility: ["marjari", "paschimottanasana", "trikonasana"],
    "weight-loss": ["trikonasana", "setubandha", "marjari"],
    "stress-relief": ["balasana", "anulom-vilom", "bhramari", "shavasana"],
    strength: ["vrikshasana", "setubandha", "bhujangasana"],
    "general-wellness": ["tadasana", "marjari", "shavasana"],
  };

  const targetSec = duration * 60;
  const boost = new Set(goalBoost[goal]);
  const ordered = [
    ...safe.filter((p) => boost.has(p.id)),
    ...safe.filter((p) => !boost.has(p.id)),
  ];

  const chosen: Pose[] = [];
  let acc = 0;
  for (const p of ordered) {
    if (acc + p.durationSec > targetSec && chosen.length >= 4) break;
    chosen.push(p);
    acc += p.durationSec;
    if (acc >= targetSec) break;
  }
  // Always end on shavasana if available & safe
  if (!chosen.find((p) => p.id === "shavasana") && safe.find((p) => p.id === "shavasana")) {
    chosen.push(safe.find((p) => p.id === "shavasana")!);
  }

  return {
    createdAt: Date.now(),
    disease,
    goal,
    duration,
    poseIds: chosen.map((p) => p.id),
  };
}

const STORAGE_KEY = "ayuraise.yoga.plan";

export function savePlan(plan: YogaPlan) {
  if (typeof window === "undefined") return;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(plan));
}

export function loadPlan(): YogaPlan | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as YogaPlan) : null;
  } catch {
    return null;
  }
}

export function posesFor(plan: YogaPlan): Pose[] {
  return plan.poseIds.map((id) => POSES.find((p) => p.id === id)).filter(Boolean) as Pose[];
}

export function speak(text: string) {
  if (typeof window === "undefined" || !("speechSynthesis" in window)) return;
  try {
    window.speechSynthesis.cancel();
    const u = new SpeechSynthesisUtterance(text);
    u.rate = 0.95;
    u.pitch = 1.0;
    u.volume = 1.0;
    window.speechSynthesis.speak(u);
  } catch {
    /* noop */
  }
}

export function stopSpeaking() {
  if (typeof window === "undefined" || !("speechSynthesis" in window)) return;
  try { window.speechSynthesis.cancel(); } catch { /* noop */ }
}
