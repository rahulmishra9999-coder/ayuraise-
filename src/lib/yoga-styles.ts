// Yoga Styles: Hatha, Vinyasa, Power, Yin, Restorative.
// Each style has 3 level programs (a named sequence of held poses) plus
// follow-along Weekly Plans (Day 1–7 journeys that reference these programs).

export type StyleId = "hatha" | "vinyasa" | "power" | "yin" | "restorative";
export type YLevel = "beginner" | "medium" | "advance";

export interface StylePose { name: string; sec: number; cue?: string }
export interface StyleProgram {
  id: string; styleId: StyleId; title: string; level: YLevel;
  benefit: string; caution?: string; poses: StylePose[];
}
export interface Style {
  id: StyleId; label: string; emoji: string; blurb: string;
  levelLabels: [string, string, string]; // e.g. ["Beginner","Medium","Advance"] or ["Short","Medium","Deep"]
}

export const STYLES: Style[] = [
  { id: "hatha", label: "Hatha", emoji: "🧘", blurb: "Slow, held postures with careful alignment.", levelLabels: ["Beginner", "Medium", "Advance"] },
  { id: "vinyasa", label: "Vinyasa", emoji: "🌊", blurb: "Breath-linked flowing sequences.", levelLabels: ["Beginner", "Medium", "Advance"] },
  { id: "power", label: "Power Yoga", emoji: "🔥", blurb: "Athletic, strength-building flow.", levelLabels: ["Beginner", "Medium", "Advance"] },
  { id: "yin", label: "Yin", emoji: "🍃", blurb: "Long, passive holds for deep flexibility.", levelLabels: ["Short", "Medium", "Deep"] },
  { id: "restorative", label: "Restorative", emoji: "🌙", blurb: "Fully supported rest & recovery.", levelLabels: ["Short", "Medium", "Deep"] },
];
export function styleOf(id: StyleId): Style { return STYLES.find((s) => s.id === id)!; }

const p = (name: string, sec: number, cue?: string): StylePose => ({ name, sec, cue });

export const STYLE_PROGRAMS: StyleProgram[] = [
  /* ---------------- HATHA ---------------- */
  {
    id: "hatha-beg", styleId: "hatha", title: "Gentle Hatha Basics", level: "beginner",
    benefit: "Learn the foundations — mobility, breath and grounding.",
    poses: [
      p("Seated Breathing", 90, "Sit tall, lengthen each inhale and exhale."),
      p("Neck & Shoulder Rolls", 40), p("Cat-Cow", 60, "Arch and round with the breath."),
      p("Child's Pose", 60), p("Downward Dog", 45), p("Mountain Pose", 40),
      p("Standing Forward Fold", 45), p("Warrior I", 50, "Front knee over ankle, hips forward."),
      p("Triangle", 50), p("Bridge", 45), p("Seated Forward Fold", 60),
      p("Reclined Twist", 60), p("Savasana", 180, "Soften everything, breathe naturally."),
    ],
  },
  {
    id: "hatha-med", styleId: "hatha", title: "Hatha Alignment", level: "medium",
    benefit: "Build strength and balance with precise alignment.",
    poses: [
      p("Seated Breathing", 90), p("Cat-Cow", 60), p("Sun Salutation A (slow)", 90),
      p("Warrior I", 50), p("Warrior II", 50, "Arms wide, gaze past the front hand."),
      p("Extended Side Angle", 50), p("Triangle", 50), p("Tree Pose", 50, "Fix the gaze, breathe tall."),
      p("Chair Pose", 45), p("Camel Pose", 45), p("Half Lord of the Fishes", 50),
      p("Boat Pose", 45), p("Reclined Twist", 60), p("Savasana", 210),
    ],
  },
  {
    id: "hatha-adv", styleId: "hatha", title: "Hatha Deep Practice", level: "advance",
    benefit: "Deep backbends, inversions and long holds.", caution: "Skip inversions with high BP or glaucoma.",
    poses: [
      p("Nadi Shodhana Pranayama", 180, "Alternate-nostril breathing, slow and even."),
      p("Sun Salutation A", 90), p("Sun Salutation B", 90), p("Warrior III", 50),
      p("Half Moon", 50), p("Standing Split", 45), p("Crow Pose", 45, "Gaze forward, hips lift."),
      p("Camel Pose", 50), p("Bridge / Wheel", 50), p("Shoulderstand", 90),
      p("Plow Pose", 60), p("Fish Pose", 45), p("Seated Forward Fold", 60), p("Savasana", 240),
    ],
  },

  /* ---------------- VINYASA ---------------- */
  {
    id: "vin-beg", styleId: "vinyasa", title: "Vinyasa Foundations", level: "beginner",
    benefit: "Learn to link breath with movement, gently.",
    poses: [
      p("Breath Awareness", 60), p("Cat-Cow", 60), p("Sun Salutation A ×3", 150, "One breath per movement."),
      p("Low Lunge", 45), p("Warrior I", 45), p("Warrior II", 45), p("Triangle", 45),
      p("Wide-leg Forward Fold", 45), p("Bridge", 45), p("Reclined Twist", 60), p("Savasana", 180),
    ],
  },
  {
    id: "vin-med", styleId: "vinyasa", title: "Vinyasa Flow", level: "medium",
    benefit: "A creative, continuous breath-linked flow.",
    poses: [
      p("Sun Salutation A ×3", 150), p("Sun Salutation B ×3", 180), p("Crescent Lunge", 45),
      p("Warrior II", 45), p("Reverse Warrior", 45), p("Extended Side Angle", 45), p("Half Moon", 45),
      p("Chair + Chair Twist", 50), p("Dancer Pose", 45), p("Bridge", 45), p("Seated Twist", 50), p("Savasana", 210),
    ],
  },
  {
    id: "vin-adv", styleId: "vinyasa", title: "Vinyasa Peak Flow", level: "advance",
    benefit: "Fast flows, arm balances and inversions.", caution: "Warm up fully before arm balances.",
    poses: [
      p("Sun Salutation A/B (chaturanga)", 240), p("Warrior Sequences", 90), p("Crow Pose", 45),
      p("Side Crow", 45), p("Standing Split", 45), p("Handstand Hops", 45), p("Wheel Pose", 50),
      p("Bird of Paradise", 45), p("Pigeon Pose", 60), p("Shoulderstand", 90), p("Savasana", 210),
    ],
  },

  /* ---------------- POWER ---------------- */
  {
    id: "pow-beg", styleId: "power", title: "Power Starter", level: "beginner",
    benefit: "Build strength with an accessible power flow.",
    poses: [
      p("Cat-Cow + Down Dog Pedals", 60), p("Sun Salutation A (knees-down)", 120), p("Chair Pose", 45),
      p("Warrior I", 45), p("Warrior II", 45), p("High → Low Plank", 45, "Elbows hug the ribs."),
      p("Crescent Lunge", 45), p("Boat Pose", 45), p("Bridge", 45), p("Savasana", 180),
    ],
  },
  {
    id: "pow-med", styleId: "power", title: "Power Strength", level: "medium",
    benefit: "Strength-loaded flow with core and balance.",
    poses: [
      p("Sun Salutation A/B", 210), p("Chair + Chair Twist", 50), p("Warrior Sequences", 90),
      p("Side Plank", 45), p("Plank ↔ Down Dog", 50), p("Crescent → Warrior III", 50),
      p("Boat + Variations", 50), p("Bridge / Wheel prep", 50), p("Pigeon Pose", 60), p("Savasana", 200),
    ],
  },
  {
    id: "pow-adv", styleId: "power", title: "Power Sculpt", level: "advance",
    benefit: "Chaturanga sets, arm balances and deep backbends.", caution: "High intensity — rest as needed.",
    poses: [
      p("Fast Sun Flows (chaturanga)", 240), p("Chaturanga Push-up Sets", 60), p("Crow Pose", 45),
      p("Side Crow", 45), p("Warrior III → Standing Split", 60), p("Handstand Prep", 45),
      p("Wheel Pose", 50), p("Forearm Plank Holds", 60), p("Boat Sets", 50), p("Pigeon Pose", 60), p("Savasana", 210),
    ],
  },

  /* ---------------- YIN (Short / Medium / Deep) ---------------- */
  {
    id: "yin-beg", styleId: "yin", title: "Gentle Yin", level: "beginner",
    benefit: "Short passive holds to release the body.",
    poses: [
      p("Butterfly (Baddha Konasana)", 150, "Let gravity fold you, soften the inner thighs."),
      p("Caterpillar (Seated Fold)", 150), p("Sphinx", 150), p("Child's Pose", 150),
      p("Reclined Twist", 150), p("Happy Baby", 120), p("Savasana", 240),
    ],
  },
  {
    id: "yin-med", styleId: "yin", title: "Yin Hips & Spine", level: "medium",
    benefit: "Deeper holds for the hips and spine.",
    poses: [
      p("Dragon (Low Lunge)", 240, "Sink into the front hip, breathe into the stretch."),
      p("Sleeping Swan (Pigeon)", 240), p("Shoelace", 240), p("Saddle", 210),
      p("Caterpillar", 240), p("Banana", 180), p("Reclined Twist", 210), p("Savasana", 240),
    ],
  },
  {
    id: "yin-adv", styleId: "yin", title: "Deep Yin", level: "advance",
    benefit: "Long, deep holds for advanced flexibility.", caution: "Ease to 90% — never force knees or spine.",
    poses: [
      p("Dragonfly (Straddle)", 300), p("Full Saddle", 300), p("Dragon Variations", 300),
      p("Shoelace", 300), p("Snail / Plow", 240), p("Melting Heart", 300),
      p("Long Reclined Twist", 300), p("Extended Savasana", 300),
    ],
  },

  /* ---------------- RESTORATIVE (Short / Medium / Deep) ---------------- */
  {
    id: "res-beg", styleId: "restorative", title: "Restorative Basics", level: "beginner",
    benefit: "Fully supported rest — calm the nervous system.", caution: "Props: a bolster or pillow and a blanket.",
    poses: [
      p("Supported Child's Pose", 240), p("Reclined Bound Angle", 300, "Bolster along the spine, let the hips open."),
      p("Legs-Up-the-Wall", 300), p("Supported Twist", 240), p("Savasana", 300),
    ],
  },
  {
    id: "res-med", styleId: "restorative", title: "Restorative Unwind", level: "medium",
    benefit: "Longer holds to fully let go.", caution: "Props: bolster, 2 blocks, a blanket.",
    poses: [
      p("Supported Child's Pose", 300), p("Supported Bridge", 300), p("Supported Fish (chest opener)", 300),
      p("Reclined Bound Angle", 360), p("Legs-Up-the-Wall", 360), p("Side-lying Rest", 240), p("Savasana", 300),
    ],
  },
  {
    id: "res-adv", styleId: "restorative", title: "Deep Rest & Yoga Nidra", level: "advance",
    benefit: "Very long stillness plus a guided body-scan.", caution: "Stay warm — use a blanket.",
    poses: [
      p("Reclined Bound Angle", 600), p("Legs-Up-the-Wall", 600),
      p("Supported Savasana", 300), p("Yoga Nidra Body-Scan", 600, "Follow the guided scan, stay awake and aware."),
      p("Gentle Return", 120),
    ],
  },
];

export function programsOf(styleId: StyleId): StyleProgram[] { return STYLE_PROGRAMS.filter((x) => x.styleId === styleId); }
export function getStyleProgram(id: string): StyleProgram | undefined { return STYLE_PROGRAMS.find((x) => x.id === id); }
export function programSeconds(prog: StyleProgram): number { return prog.poses.reduce((a, x) => a + x.sec, 0); }
export function programMinutes(prog: StyleProgram): number { return Math.max(1, Math.round(programSeconds(prog) / 60)); }

/* ================= Weekly Plans (Day 1–7 journeys) ================= */

export interface WeekDay { day: number; programId?: string; rest?: boolean; note: string }
export interface WeeklyPlan {
  id: string; name: string; emoji: string; blurb: string;
  scope: StyleId | "balanced"; days: WeekDay[];
}

const D = (day: number, programId: string | null, note: string): WeekDay =>
  programId ? { day, programId, note } : { day, rest: true, note };

export const WEEKLY_PLANS: WeeklyPlan[] = [
  // ---- balanced / goal weeks ----
  {
    id: "wk-kickstart", name: "7-Day Yoga Kickstart", emoji: "🌱", scope: "balanced",
    blurb: "A gentle, balanced week for brand-new yogis.",
    days: [
      D(1, "hatha-beg", "Learn the foundations"), D(2, "res-beg", "Recover & calm"),
      D(3, "vin-beg", "Add gentle flow"), D(4, "yin-beg", "Release tight hips"),
      D(5, "hatha-med", "Build a little"), D(6, "res-med", "Wind down"),
      D(7, null, "Rest — or 10-min breathing"),
    ],
  },
  {
    id: "wk-sleep", name: "Stress & Sleep Reset", emoji: "🌙", scope: "balanced",
    blurb: "Evening practices to unwind and sleep deeper.",
    days: [
      D(1, "res-beg", "Settle the system"), D(2, "yin-beg", "Soft passive holds"),
      D(3, null, "Legs-up-the-wall + breathing"), D(4, "yin-med", "Deeper release"),
      D(5, "res-med", "Let go fully"), D(6, "res-adv", "Deep rest + Yoga Nidra"),
      D(7, null, "Free choice or rest"),
    ],
  },
  {
    id: "wk-power", name: "Power & Strength Week", emoji: "🔥", scope: "balanced",
    blurb: "Build strength with recovery built in.",
    days: [
      D(1, "pow-med", "Strength flow"), D(2, "vin-med", "Keep it moving"),
      D(3, "yin-med", "Recovery — long holds"), D(4, "pow-adv", "Peak strength"),
      D(5, null, "Rest"), D(6, "pow-med", "Strength again"), D(7, "res-med", "Restore"),
    ],
  },
  // ---- single-style weeks ----
  {
    id: "wk-hatha", name: "7-Day Hatha Immersion", emoji: "🧘", scope: "hatha",
    blurb: "A week living in the slow, aligned Hatha practice.",
    days: [
      D(1, "hatha-med", "Alignment focus"), D(2, "hatha-beg", "Gentle day"),
      D(3, null, "Rest / active recovery"), D(4, "hatha-adv", "Deep practice"),
      D(5, "hatha-med", "Alignment"), D(6, "hatha-beg", "Gentle"), D(7, null, "Rest + meditation"),
    ],
  },
  {
    id: "wk-vinyasa", name: "7-Day Vinyasa Flow", emoji: "🌊", scope: "vinyasa",
    blurb: "Flow a little more each day.",
    days: [
      D(1, "vin-beg", "Foundations"), D(2, "vin-med", "Full flow"),
      D(3, "yin-beg", "Recover"), D(4, "vin-med", "Flow again"),
      D(5, null, "Rest"), D(6, "vin-adv", "Peak flow"), D(7, "res-beg", "Restore"),
    ],
  },
  {
    id: "wk-yin", name: "7-Day Yin Journey", emoji: "🍃", scope: "yin",
    blurb: "Deep flexibility, one long hold at a time.",
    days: [
      D(1, "yin-beg", "Ease in"), D(2, "yin-med", "Hips & spine"),
      D(3, null, "Rest"), D(4, "yin-med", "Go deeper"),
      D(5, "yin-adv", "Deep Yin"), D(6, null, "Rest"), D(7, "yin-beg", "Gentle close"),
    ],
  },
  {
    id: "wk-restorative", name: "7-Day Restorative Reset", emoji: "🌙", scope: "restorative",
    blurb: "A full week of supported rest and recovery.",
    days: [
      D(1, "res-beg", "Basics"), D(2, "res-med", "Unwind"),
      D(3, null, "Rest"), D(4, "res-med", "Let go"),
      D(5, "res-adv", "Deep rest + Nidra"), D(6, null, "Rest"), D(7, "res-beg", "Gentle close"),
    ],
  },
];

export function weeklyPlansFor(styleId: StyleId): WeeklyPlan[] { return WEEKLY_PLANS.filter((w) => w.scope === styleId); }
export const BALANCED_WEEKS = WEEKLY_PLANS.filter((w) => w.scope === "balanced");
export function getWeeklyPlan(id: string): WeeklyPlan | undefined { return WEEKLY_PLANS.find((w) => w.id === id); }

/* ================= Weekly progress store ================= */

const WK_KEY = "ayuraise.yoga.weekprogress"; // { [planId]: number[] (completed days) }

function readWk(): Record<string, number[]> {
  if (typeof window === "undefined") return {};
  try { const r = window.localStorage.getItem(WK_KEY); return r ? JSON.parse(r) : {}; } catch { return {}; }
}
function writeWk(v: Record<string, number[]>) {
  if (typeof window === "undefined") return;
  try { window.localStorage.setItem(WK_KEY, JSON.stringify(v)); } catch {}
}
export function completedDays(planId: string): number[] { return readWk()[planId] ?? []; }
export function setDayDone(planId: string, day: number, done: boolean): number[] {
  const all = readWk();
  const cur = new Set(all[planId] ?? []);
  if (done) cur.add(day); else cur.delete(day);
  all[planId] = [...cur].sort((a, b) => a - b);
  writeWk(all);
  return all[planId];
}

/* ================= Calories ================= */

// yoga ~2.8 MET average (gentle), power ~4.5
const STYLE_MET: Record<StyleId, number> = { hatha: 3, vinyasa: 3.8, power: 4.5, yin: 2.3, restorative: 1.6 };
export function styleKcal(prog: StyleProgram, weightKg: number): number {
  const met = STYLE_MET[prog.styleId];
  return Math.round((met * 3.5 * weightKg / 200) * (programSeconds(prog) / 60));
}
