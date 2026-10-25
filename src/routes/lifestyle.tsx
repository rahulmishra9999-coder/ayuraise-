import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { Fragment, useEffect, useMemo, useState, type ReactNode } from "react";
import { createPortal } from "react-dom";
import { ArrowLeft, Stethoscope, HeartPulse, Dumbbell, Sparkles, Moon, Flower2 } from "lucide-react";
import { BottomNav } from "@/components/BottomNav";
import { conditionSeverity, conditionMeta, resolveConflicts } from "@/lib/clusters";
import { savePersonalPlan } from "@/lib/personalPlan";
import { CuisinePicker } from "@/components/CuisinePicker";
import { cuisineRegion } from "@/lib/cuisines";

/** Ease-out count-up for the calorie number — a small premium touch, no deps. */
function CountUp({ to, className }: { to: number; className?: string }) {
  const [n, setN] = useState(0);
  useEffect(() => {
    let raf = 0; const start = performance.now(); const dur = 750;
    const tick = (t: number) => { const p = Math.min(1, (t - start) / dur); setN(Math.round(to * (1 - Math.pow(1 - p, 3)))); if (p < 1) raf = requestAnimationFrame(tick); };
    raf = requestAnimationFrame(tick); return () => cancelAnimationFrame(raf);
  }, [to]);
  return <span className={className}>{n.toLocaleString()}</span>;
}

const PREMIUM_CSS = `
.lf-step { animation: lfIn .32s cubic-bezier(.22,.61,.36,1) both; }
@keyframes lfIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: none; } }
.lf-hero { animation: lfPop .45s cubic-bezier(.22,.61,.36,1) both; }
@keyframes lfPop { from { opacity: 0; transform: scale(.95); } to { opacity: 1; transform: none; } }
.lf-bar { transition: width .45s cubic-bezier(.22,.61,.36,1); }
.lf-chip, .lf-btn { transition: transform .12s ease, box-shadow .18s ease, background .18s ease, border-color .18s ease; }
.lf-chip:active, .lf-btn:active { transform: scale(.96); }
`;

/* ---------- time helpers (dropdown slots) ---------- */
const fh = (h: number) => `${((h + 11) % 12) + 1} ${h < 12 ? "AM" : "PM"}`;
const ft = (h: number, m: number) => `${((h + 11) % 12) + 1}:${m === 0 ? "00" : "30"} ${h < 12 ? "AM" : "PM"}`;
const BEDTIME = Array.from({ length: 24 }, (_, i) => (19 + i) % 24).map((h) => ({ v: String(h), l: `${fh(h)} – ${fh((h + 1) % 24)}` }));
function makeSlots(startH: number, startM: number, endH: number) {
  const out: { v: string; l: string }[] = [];
  for (let h = startH; h <= endH; h++) for (const m of [0, 30]) {
    if (h === startH && m < startM) continue;
    const hh = h % 24; let eh = hh, em = m + 30; if (em >= 60) { em = 0; eh = (hh + 1) % 24; }
    out.push({ v: `${String(hh).padStart(2, "0")}:${m === 0 ? "00" : "30"}`, l: `${ft(hh, m)}–${ft(eh, em)}` });
  }
  return out;
}
const FIRST_MEAL_SLOTS = makeSlots(5, 30, 15);  // 5:30 am → 3 pm
const LAST_MEAL_SLOTS = makeSlots(16, 0, 23);   // 4 pm → 11:30 pm
const MEAL_SLOTS = makeSlots(5, 30, 23);        // one-meal-a-day (OMAD)

/* ---------- options ---------- */
const SEX = ["Male", "Female", "Other"];
const WATER = ["<1.5", "1.5–2", "2–2.5", "2.5–3", "3–3.5", "3.5+"];
const FOOD_STYLE = ["Veg", "Vegan", "Eggetarian", "Non-veg"];
const MAIN_MEALS = ["1", "2", "3", "4+"];
const MINI_MEALS = ["0", "1", "2", "3", "4+"];
const WAKING = ["Fresh", "Good", "Okay", "Groggy / foggy", "Exhausted"];
const LATENCY = ["Under 10 min", "10–20 min", "20–40 min", "40+ / I struggle"];
const WORKOUTS = ["Walking", "Gym", "Yoga", "Running", "Sports", "Cycling", "Dance", "Swimming", "Household chores"];
const DIGESTION = [
  "Regular, once or twice a day, feel fully clear",
  "Goes daily but I don't feel fully empty",
  "Often hard / constipated",
  "Often loose / urgent",
];
const VISION = ["Clear, no aids", "Fine with glasses", "Struggle even with glasses", "Significant difficulty"];
const MOBILITY_Q = [
  { key: "chair", label: "Get up from a chair without hands" },
  { key: "floor", label: "Sit to the floor and back up" },
  { key: "stairs", label: "Climb a flight of stairs" },
  { key: "balance", label: "Balance on one leg briefly" },
];
const MOBILITY_OPT = ["Easily", "With effort", "Need support", "Can't"];
const CYCLE = ["Regular cycles", "Irregular cycles", "Perimenopause", "Post-menopause", "Prefer not to say"];
const MIND = [
  { key: "mood", q: "How's your mood been lately?", opts: [["😊", "Positive"], ["😐", "Okay"], ["😔", "Low"]] },
  { key: "anxiety", q: "How often do you feel anxious?", opts: [["😌", "Rarely"], ["😬", "Sometimes"], ["😰", "Often"]] },
  { key: "connection", q: "How connected do you feel to people?", opts: [["🤝", "Connected"], ["🙂", "Okay"], ["😞", "Lonely"]] },
  { key: "unwind", q: "Do you get time for yourself?", opts: [["✅", "Daily"], ["🌤️", "Sometimes"], ["🚫", "Rarely"]] },
];
const HABITS_DETAIL: { id: string; label: string; emoji: string; subs?: { key: string; q: string; opts: string[] }[] }[] = [
  { id: "teacoffee", label: "Tea / coffee", emoji: "☕", subs: [
    { key: "count", q: "How many a day?", opts: ["1", "2", "3", "4+"] },
    { key: "sugar", q: "With sugar?", opts: ["No", "Yes", "Sometimes"] },
    { key: "milk", q: "With milk?", opts: ["No", "Yes"] },
  ] },
  { id: "eatout", label: "Eat out / order", emoji: "🍽️", subs: [{ key: "freq", q: "How often?", opts: ["1–2×/week", "3–5×/week", "Daily"] }] },
  { id: "sweets", label: "Desserts / Sweets", emoji: "🍰", subs: [{ key: "freq", q: "How often?", opts: ["Sometimes", "Often", "Daily"] }] },
  { id: "sugarydrinks", label: "Sugar / Soft drinks", emoji: "🥤", subs: [{ key: "freq", q: "How often?", opts: ["Sometimes", "Often", "Daily"] }] },
  { id: "fried", label: "Fried Foods", emoji: "🍟", subs: [{ key: "amt", q: "How much?", opts: ["A little", "Some", "A lot"] }] },
  { id: "packaged", label: "Packaged Food", emoji: "📦", subs: [{ key: "amt", q: "How much?", opts: ["A little", "Some", "A lot"] }] },
  { id: "smoke", label: "Smoking", emoji: "🚬", subs: [{ key: "freq", q: "How often?", opts: ["Occasionally", "Daily"] }, { key: "qty", q: "How many a day?", opts: ["Under 5", "5–10", "10+"] }] },
  { id: "alcohol", label: "Alcohol", emoji: "🍷", subs: [{ key: "freq", q: "How often?", opts: ["Occasionally", "2–3×/week", "Most days"] }, { key: "qty", q: "How many drinks each time?", opts: ["1", "2", "3+"] }] },
];
const ACTIVITY = [
  { id: "sedentary", label: "Sedentary", desc: "Mostly sitting — desk job, driving, screens. Little walking, no real exercise.", note: "~50–150 cal/day burned" },
  { id: "light", label: "Lightly active", desc: "Light chores + some walking; light exercise 1–3 days a week.", note: "~150–300 cal/day burned" },
  { id: "active", label: "Active", desc: "Brisk walks or workouts most days, or a job on your feet. 3–5 days a week.", note: "~350–500 cal/day burned" },
  { id: "very", label: "Very active", desc: "Hard physical work or intense training 6–7 days a week.", note: "~600–900 cal/day burned" },
];
const ACT_FACTOR: Record<string, number> = { sedentary: 1.2, light: 1.375, active: 1.55, very: 1.725 };

type CondSub = { key: string; q: string; opts?: string[]; input?: boolean; ph?: string; multi?: boolean; showIf?: (d: Record<string, string>) => boolean };
// reusable option sets & shared sub-question groups
const YESNO = ["Yes", "No"];
const INRANGE = ["Yes", "No", "Not sure"];
const FAMILY = (what: string): CondSub => ({ key: "family", q: `Family history of ${what}?`, opts: INRANGE });
const DIABETIC = (d: Record<string, string>) => d.type === "Type 2" || d.type === "Type 1";
const JOINT_SUBS: CondSub[] = [
  { key: "when", q: "Pain — when?", opts: ["At rest", "On movement", "Both"] },
  { key: "stiff", q: "Morning stiffness over 30 min?", opts: YESNO },
  { key: "swelling", q: "Any swelling?", opts: YESNO },
  { key: "nerve", q: "Radiating pain / numbness / tingling?", opts: YESNO },
  { key: "since", q: "How long have you had this?", opts: ["<3 months", "3–12 months", "1+ year"] },
];
const ARTHRITIS_SUBS: CondSub[] = [
  { key: "joints", q: "Which joints?", multi: true, opts: ["Hands", "Knees", "Hips", "Spine", "Other"] },
  { key: "rest", q: "Does it hurt even at rest?", opts: ["Yes, even at rest", "No, eases with rest"] },
  { key: "stiff", q: "Morning stiffness over 30 min?", opts: YESNO },
  { key: "swelling", q: "Any swelling?", opts: YESNO },
  { key: "since", q: "How long have you had this?", opts: ["<3 months", "3–12 months", "1+ year"] },
];
const SCIATICA_SUBS: CondSub[] = [
  { key: "nerve", q: "Pain shoots down the leg (numbness / tingling)?", opts: YESNO },
  { key: "trigger", q: "Worse when sitting, coughing, or sneezing?", opts: YESNO },
  { key: "since", q: "How long have you had this?", opts: ["<3 months", "3–12 months", "1+ year"] },
];
const HAIR_SUBS: CondSub[] = [
  { key: "pattern", q: "Where is it thinning?", opts: ["All over (diffuse)", "Hairline / crown", "Widening parting", "Patches", "Mostly scalp / flaking"] },
  { key: "timeline", q: "How long?", opts: ["Recent (under 6 months)", "Gradual over years"] },
  { key: "trigger", q: "Any recent trigger?", multi: true, opts: ["Illness / high fever", "Crash diet / weight loss", "High stress", "Recent childbirth"] },
  { key: "family", q: "Family history of balding?", opts: YESNO },
  { key: "scalp", q: "Scalp type?", opts: ["Oily", "Dry / flaky", "Dandruff"] },
  { key: "pitta", q: "Premature greying or scalp heat?", opts: YESNO },
  { key: "want", q: "What do you want?", opts: ["Reduce shedding", "Regrow", "Maintain / scalp health"] },
];
const CONDITIONS: { g: string; items: { id: string; label: string; emoji: string; note?: string; subs?: CondSub[] }[] }[] = [
  { g: "Health conditions", items: [
    { id: "diabetes", label: "Diabetes / Pre-diabetes", emoji: "💉", subs: [
      { key: "type", q: "Which type?", opts: ["Pre-diabetic", "Type 2", "Type 1", "Not sure"] },
      { key: "hba1c", q: "HbA1c (if known)", input: true, ph: "e.g. 7.2 %" },
      { key: "fasting", q: "Fasting sugar (if known)", input: true, ph: "e.g. 110 mg/dL" },
      { key: "meds", q: "On medication?", opts: ["None", "Oral", "Insulin"], showIf: DIABETIC },
      { key: "symptoms", q: "Any of these?", multi: true, opts: ["Foot numbness/tingling", "Vision changes", "Kidney issues", "Frequent low-sugar dips"], showIf: DIABETIC },
      { key: "since", q: "How long have you had this?", opts: ["<1 yr", "1–5 yrs", "5–10 yrs", "10+ yrs"], showIf: DIABETIC },
      FAMILY("diabetes"),
    ] },
    { id: "hypertension", label: "BP / Hypertension", emoji: "🩺", subs: [
      { key: "meds", q: "On BP medication?", opts: YESNO },
      { key: "bp", q: "Your latest BP reading?", input: true, ph: "e.g. 140/90" },
      { key: "salt", q: "How much salt do you typically eat?", opts: ["Low", "Moderate", "High", "Not sure"] },
      { key: "symptoms", q: "Any of these?", multi: true, opts: ["Headaches", "Dizziness", "Palpitations"] },
      { key: "since", q: "How long have you had this?", opts: ["<1 yr", "1–5 yrs", "5+ yrs"] },
      FAMILY("BP / heart disease"),
    ] },
    { id: "thyroid", label: "Thyroid", emoji: "🦋", subs: [
      { key: "kind", q: "Hypo or hyper?", opts: ["Hypo", "Hyper", "Not sure"] },
      { key: "tsh", q: "Latest TSH (if known)", input: true, ph: "e.g. 4.2" },
      { key: "meds", q: "On thyroid medication?", opts: YESNO },
      { key: "hypo", q: "Feeling slowed down?", multi: true, opts: ["Weight gain", "Feeling cold", "Tired"], showIf: (d) => d.kind !== "Hyper" },
      { key: "hyper", q: "Feeling sped up?", multi: true, opts: ["Weight loss", "Feeling hot", "Palpitations"], showIf: (d) => d.kind !== "Hypo" },
      { key: "since", q: "How long have you had this?", opts: ["<1 yr", "1–5 yrs", "5+ yrs"] },
      FAMILY("thyroid"),
    ] },
    { id: "cholesterol", label: "Cholesterol", emoji: "🧈", subs: [
      { key: "total", q: "Total cholesterol (if known)", input: true, ph: "e.g. 200" },
      { key: "ldl", q: "LDL (if known)", input: true, ph: "e.g. 130" },
      { key: "hdl", q: "HDL (if known)", input: true, ph: "e.g. 45" },
      { key: "trig", q: "Triglycerides (if known)", input: true, ph: "e.g. 150" },
      { key: "meds", q: "On medication?", opts: YESNO },
      { key: "chest", q: "Chest tightness, pain or breathlessness while climbing stairs / exertion?", opts: YESNO },
      { key: "since", q: "How long have you had this?", opts: ["<1 yr", "1–5 yrs", "5+ yrs"] },
      FAMILY("cholesterol / early heart attack"),
    ] },
    { id: "fatty-liver", label: "Fatty Liver", emoji: "🍔", subs: [
      { key: "grade", q: "Grade (if known)", opts: ["Grade 1", "Grade 2", "Grade 3", "Not sure"] },
      { key: "alcohol", q: "Alcohol-related? (drink regularly)", opts: YESNO },
      { key: "since", q: "How long have you had this?", opts: ["<1 yr", "1–3 yrs", "3+ yrs"] },
    ] },
    { id: "asthma", label: "Asthma", emoji: "😮‍💨", subs: [
      { key: "trigger", q: "Main trigger?", opts: ["Dust", "Cold air", "Exercise", "Not sure"] },
      { key: "freq", q: "How often?", opts: ["Rarely", "Monthly", "Weekly", "Daily"] },
      { key: "meds", q: "On inhaler / steroids?", opts: YESNO },
      { key: "since", q: "How long have you had this?", opts: ["<1 yr", "1–5 yrs", "5+ yrs", "Since childhood"] },
    ] },
    { id: "migraine", label: "Migraine", emoji: "🤕", subs: [
      { key: "freq", q: "Attacks per month?", opts: ["1–2", "3–5", "6+"] },
      { key: "triggers", q: "Triggers?", multi: true, opts: ["Skipped meals", "Poor sleep", "Certain foods", "Stress"] },
      { key: "meds", q: "On preventive medication?", opts: YESNO },
      { key: "since", q: "How long have you had this?", opts: ["<1 yr", "1–5 yrs", "5+ yrs", "Since childhood"] },
    ] },
    { id: "gout", label: "Gout / Uric Acid", emoji: "🦶", subs: [
      { key: "level", q: "Uric acid level (if known)", input: true, ph: "e.g. 7.5" },
      { key: "flaring", q: "Painful or swollen right now?", opts: YESNO },
      { key: "freq", q: "Attack frequency?", opts: ["Rare", "A few / year", "Monthly+", "Not sure"] },
      { key: "meds", q: "On uric-acid medication?", opts: YESNO },
      { key: "since", q: "How long have you had this?", opts: ["<1 yr", "1–5 yrs", "5+ yrs"] },
    ] },
    { id: "autoimmune", label: "Auto-immune", emoji: "🛡️", subs: [
      { key: "which", q: "Which one?", opts: ["Rheumatoid arthritis", "Hashimoto's", "Psoriasis", "Celiac"] },
      // Rheumatoid arthritis
      { key: "ra_state", q: "Painful or swollen right now?", opts: YESNO, showIf: (d) => d.which === "Rheumatoid arthritis" },
      { key: "ra_stiff", q: "Morning stiffness over 30 min?", opts: YESNO, showIf: (d) => d.which === "Rheumatoid arthritis" },
      { key: "ra_meds", q: "On medication (DMARDs / steroids)?", opts: YESNO, showIf: (d) => d.which === "Rheumatoid arthritis" },
      { key: "ra_since", q: "How long have you had this?", opts: ["<1 yr", "1–5 yrs", "5+ yrs"], showIf: (d) => d.which === "Rheumatoid arthritis" },
      // Hashimoto's (autoimmune hypothyroid)
      { key: "ha_meds", q: "On thyroid medication?", opts: YESNO, showIf: (d) => d.which === "Hashimoto's" },
      { key: "ha_symptoms", q: "Currently dealing with?", multi: true, opts: ["Weight gain", "Fatigue", "Cold", "Hair fall", "Low mood"], showIf: (d) => d.which === "Hashimoto's" },
      { key: "ha_since", q: "How long have you had this?", opts: ["<1 yr", "1–5 yrs", "5+ yrs"], showIf: (d) => d.which === "Hashimoto's" },
      // Psoriasis
      { key: "ps_state", q: "Is your skin bad right now, or clear?", opts: ["Bad now", "Clear"], showIf: (d) => d.which === "Psoriasis" },
      { key: "ps_joint", q: "Joint pain too?", opts: YESNO, showIf: (d) => d.which === "Psoriasis" },
      { key: "ps_trig", q: "Triggers?", multi: true, opts: ["Stress", "Diet", "Weather", "Infection"], showIf: (d) => d.which === "Psoriasis" },
      { key: "ps_meds", q: "On medication?", opts: YESNO, showIf: (d) => d.which === "Psoriasis" },
      { key: "ps_since", q: "How long have you had this?", opts: ["<1 yr", "1–5 yrs", "5+ yrs"], showIf: (d) => d.which === "Psoriasis" },
      // Celiac (gluten is the lever)
      { key: "ce_gf", q: "Do you avoid wheat/gluten completely?", opts: ["Yes", "Mostly", "No"], showIf: (d) => d.which === "Celiac" },
      { key: "ce_symptoms", q: "Symptoms when you eat gluten?", multi: true, opts: ["Bloating", "Diarrhea", "Fatigue", "Skin"], showIf: (d) => d.which === "Celiac" },
      { key: "ce_def", q: "Known deficiencies?", multi: true, opts: ["Iron", "B12", "Vitamin D"], showIf: (d) => d.which === "Celiac" },
      { key: "ce_since", q: "How long since diagnosis?", opts: ["<1 yr", "1–5 yrs", "5+ yrs"], showIf: (d) => d.which === "Celiac" },
      FAMILY("auto-immune disease"),
    ] },
    { id: "hernia", label: "Hernia", emoji: "🩹", note: "Only if you currently have one.", subs: [
      { key: "type", q: "Which type?", opts: ["Inguinal", "Hiatal", "Umbilical"] },
      { key: "surgery", q: "Had surgery?", opts: ["No, hasn't needed", "Advised, not done yet", "Done, still recovering", "Done, fully recovered", "Done, but it came back"] },
    ] },
    { id: "prostate", label: "Enlarged prostate", emoji: "🚹", subs: [
      { key: "symptoms", q: "Any urinary symptoms?", multi: true, opts: ["Weak / slow flow", "Frequent urge", "Night-time urges", "Trouble starting"] },
      { key: "bph", q: "Diagnosed enlarged prostate (BPH)?", opts: ["Yes", "No", "Not sure"] },
      { key: "since", q: "How long have you had this?", opts: ["<1 yr", "1–5 yrs", "5+ yrs"] },
    ] },
  ] },
  { g: "Joint & Spine", items: [
    { id: "knee-pain", label: "Knee Pain", emoji: "🦵", subs: JOINT_SUBS }, { id: "hip-pain", label: "Hip Pain", emoji: "🦿", subs: JOINT_SUBS },
    { id: "back-pain", label: "Back Pain", emoji: "🦴", subs: JOINT_SUBS }, { id: "neck-pain", label: "Neck Pain", emoji: "💆", subs: JOINT_SUBS },
    { id: "sciatica", label: "Sciatica", emoji: "⚡", subs: SCIATICA_SUBS }, { id: "arthritis", label: "Arthritis", emoji: "🖐️", subs: ARTHRITIS_SUBS },
    { id: "osteoporosis", label: "Osteoporosis", emoji: "🧬", subs: [
      { key: "fracture", q: "Previous fracture?", opts: YESNO },
      { key: "tscore", q: "T-score / DEXA (if known)", input: true, ph: "e.g. -2.6" },
      FAMILY("osteoporosis"),
    ] },
  ] },
  { g: "Gut & Digestion", items: [
    { id: "acidity-gerd", label: "Acidity / GERD", emoji: "🌶️", subs: [
      { key: "dinner", q: "Do you eat heavy dinners?", opts: YESNO },
      { key: "symptoms", q: "What do you usually get?", multi: true, opts: ["Burning in chest / stomach", "Sour liquid comes up", "Cough or throat irritation"] },
      { key: "lying", q: "Does it get worse when you lie down or sleep?", opts: YESNO },
      { key: "meds", q: "Taking acidity/gas medicine (antacids)?", opts: ["No", "Rarely", "Sometimes", "Daily"] },
      { key: "redflag", q: "Any of these?", multi: true, opts: ["Difficulty swallowing", "Unexplained weight loss", "Black stools"] },
      { key: "since", q: "How long have you had this?", opts: ["<3 months", "3–12 months", "1+ year"] },
    ] },
    { id: "ibs", label: "IBS", emoji: "💢", subs: [
      { key: "timing", q: "Eat at irregular timings?", opts: YESNO },
      { key: "pattern", q: "Bowel pattern?", opts: ["More diarrhea", "More constipation", "Mixed"] },
      { key: "redflag", q: "Any of these?", multi: true, opts: ["Blood in stool", "Unexplained weight loss", "Abdominal pain / diarrhea that wakes you at night"] },
      { key: "since", q: "How long have you had this?", opts: ["<3 months", "3–12 months", "1+ year"] },
    ] },
    { id: "constipation", label: "Constipation", emoji: "🚽", subs: [
      { key: "fibre", q: "Do you eat enough fibre (fruit, veg, whole grains)?", opts: ["Enough", "Moderate", "Low"] },
      { key: "freq", q: "How often do you pass stool?", opts: ["Daily", "Every 2–3 days", "Less often"] },
      { key: "redflag", q: "Any of these?", multi: true, opts: ["Blood in stool", "Recent change in bowel habits", "Unexplained weight loss"] },
      { key: "since", q: "How long have you had this?", opts: ["<3 months", "3–12 months", "1+ year"] },
    ] },
    { id: "indigestion", label: "Indigestion", emoji: "🤢", subs: [
      { key: "pattern", q: "What do you mostly feel?", multi: true, opts: ["Bloating", "Belching / trapped gas", "Heaviness after eating", "Early fullness"] },
      { key: "since", q: "How long have you had this?", opts: ["<3 months", "3–12 months", "1+ year"] },
    ] },
  ] },
  { g: "Women's health & life stages", items: [
    { id: "pcos-pcod", label: "PCOS / PCOD", emoji: "🌸", subs: [
      { key: "cycle", q: "Your cycle?", opts: ["Regular", "Irregular", "Absent"] },
      { key: "symptoms", q: "Symptoms?", multi: true, opts: ["Acne", "Excess hair", "Scalp hair fall", "Weight gain"] },
      { key: "meds", q: "On hormonal medication?", opts: YESNO },
      { key: "since", q: "How long have you had this?", opts: ["<1 yr", "1–5 yrs", "5+ yrs", "Since teens"] },
      FAMILY("PCOS"),
    ] },
    { id: "menopause", label: "Menopause", emoji: "🌼", subs: [
      { key: "stage", q: "Stage?", opts: ["Peri", "Post"] },
      { key: "symptoms", q: "Symptoms?", multi: true, opts: ["Hot flashes", "Night sweats", "Sleep issues", "Mood"] },
      { key: "hrt", q: "On HRT?", opts: YESNO },
    ] },
    { id: "pregnancy", label: "Pregnancy", emoji: "🤰", note: "If this applies to you now." },
    { id: "post-natal", label: "Post-natal", emoji: "👶", note: "In the months after delivery." },
  ] },
  { g: "Hair & scalp", items: [
    { id: "hair-fall", label: "Hair fall / scalp", emoji: "💇", subs: HAIR_SUBS },
  ] },
];
const COND_LABEL: Record<string, string> = (() => { const m: Record<string, string> = {}; for (const g of CONDITIONS) for (const it of g.items) m[it.id] = it.label; return m; })();
// On the unified Create page these groups collapse into a single tap-to-open icon.
const UMBRELLA_GROUPS = new Set(["Joint & Spine", "Gut & Digestion", "Women's health & life stages"]);
const GROUP_EMOJI: Record<string, string> = { "Joint & Spine": "🦴", "Gut & Digestion": "🌀", "Women's health & life stages": "🌸" };
const FITNESS_GOALS = [
  { id: "weight-loss", label: "Weight Loss", emoji: "🔥" }, { id: "general-wellness", label: "General Wellness", emoji: "🌿" },
  { id: "strength", label: "Strength", emoji: "💪" }, { id: "muscle-building", label: "Muscle Building", emoji: "🏋️" },
  { id: "flexibility", label: "Flexibility", emoji: "🤸" }, { id: "mobility", label: "Mobility", emoji: "🔄" },
];
// Create-wizard pages: organs (prevention, pick ≤2), everyday concerns, women's life stages.
const PREVENTION_ORGANS: { id: string; label: string; emoji: string; hint?: string }[] = [
  { id: "heart", label: "Heart", emoji: "❤️" }, { id: "liver", label: "Liver", emoji: "🟠" },
  { id: "gut", label: "Gut", emoji: "🌀" }, { id: "lungs", label: "Lungs", emoji: "🫁" },
  { id: "kidney", label: "Kidney", emoji: "🫘" }, { id: "brain", label: "Brain & nervous system", emoji: "🧠" },
  { id: "pancreas", label: "Pancreas", emoji: "🩸", hint: "Blood sugar & insulin resistance — helps prevent diabetes" },
  { id: "bones-joints", label: "Bones & Joints", emoji: "🦴" }, { id: "eyes", label: "Eyes", emoji: "👁️" },
];
// A selected condition already strengthens its organ — so we show that organ as auto-covered.
const CONDITION_ORGAN: Record<string, string> = {
  diabetes: "pancreas", "fatty-liver": "liver", cholesterol: "heart", hypertension: "heart",
  asthma: "lungs", "acidity-gerd": "gut", ibs: "gut", constipation: "gut", indigestion: "gut", migraine: "brain",
  gout: "bones-joints", "knee-pain": "bones-joints", "hip-pain": "bones-joints", "back-pain": "bones-joints",
  "neck-pain": "bones-joints", sciatica: "bones-joints", arthritis: "bones-joints", osteoporosis: "bones-joints",
};
const EVERYDAY_ITEMS = [
  { id: "hair-fall", label: "Hair Fall", emoji: "💇" }, { id: "skin", label: "Skin / Glow", emoji: "✨" },
];
const REST_CALM = [
  { id: "better-sleep", label: "Better Sleep", emoji: "🌙" }, { id: "stress", label: "De-stress", emoji: "🧘" },
];
/** Collapsible category section for the unified "pick your goals" page. */
function CatSection({ open, onToggle, emoji, title, hint, count, children }: { open: boolean; onToggle: () => void; emoji: string; title: string; hint?: string; count: number; children: ReactNode }) {
  return (
    <div className="overflow-hidden rounded-2xl bg-card ring-1 ring-border/60">
      <button onClick={onToggle} className="lf-btn flex w-full items-center gap-2.5 p-3 text-left">
        <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-accent/50 text-[17px]">{emoji}</span>
        <div className="min-w-0 flex-1">
          <p className="text-[13px] font-bold text-foreground">{title}</p>
          {hint && <p className="text-[10px] text-muted-foreground">{hint}</p>}
        </div>
        {count > 0 && <span className="shrink-0 rounded-full bg-primary px-1.5 py-0.5 text-[9px] font-bold text-primary-foreground">{count}</span>}
        <span className="shrink-0 text-[11px] text-muted-foreground">{open ? "▾" : "▸"}</span>
      </button>
      {open && <div className="border-t border-border/50 p-3">{children}</div>}
    </div>
  );
}
const WOMEN_ITEMS = [
  { id: "pregnancy", label: "Pregnancy", emoji: "🤰" }, { id: "post-natal", label: "Post-natal", emoji: "👶" },
  { id: "premenopause", label: "Pre-menopause", emoji: "🌼" }, { id: "postmenopause", label: "Post-menopause", emoji: "🌺" },
  { id: "pcos-pcod", label: "PCOD", emoji: "🌸" },
];

const HEAD: Record<string, string> = {
  about: "A few basics", movement: "How active are you?", cuisine: "Cuisine you prefer",
  eating: "Your food & meals", habits: "Your eating habits", "eat-text": "Describe your meals",
  sleep: "Let's start with your sleep", digestion: "Your digestion", mind: "Mental wellbeing", gate: "How would you like to begin?", areas: "Pick your focus areas", conditions: "Any health conditions?", disease: "Manage a condition?", prevention: "Improve & strengthen", women: "Women's health & life stages", everyday: "Hair & skin care", fitness: "Fitness goal", seniors: "Seeing & moving", cycle: "Your cycle", goals: "Your focus for building plan", "pick-all": "Pick your top goals",
};

function chip(on: boolean) {
  return `lf-chip rounded-full px-3.5 py-2 text-[12px] font-semibold ${on ? "bg-primary text-primary-foreground shadow-sm" : "bg-secondary text-foreground/75"}`;
}
function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return <div><p className="mb-1.5 px-1 text-[13px] font-semibold text-foreground/85">{label}</p>{children}</div>;
}
/** Custom dropdown — reliably tappable (native <select> options weren't selecting). */
function SlotPicker({ value, onChange, options, ph, up }: { value?: string; onChange: (v: string) => void; options: { v: string; l: string }[]; ph: string; up?: boolean }) {
  const [open, setOpen] = useState(false);
  const sel = options.find((o) => o.v === value);
  return (
    <div className="relative">
      <button onClick={() => setOpen((o) => !o)} className="lf-btn flex w-full items-center justify-between rounded-xl bg-card px-3 py-2 text-[11px] font-semibold ring-1 ring-border/60">
        <span className={sel ? "text-foreground" : "text-muted-foreground/60"}>{sel ? sel.l : ph}</span>
        <span className="text-[9px] text-muted-foreground">{up ? "▴" : "▾"}</span>
      </button>
      {open && (
        <div className={`absolute z-40 ${up ? "bottom-full mb-1" : "mt-1"} max-h-56 w-full overflow-y-auto rounded-xl bg-card p-1 shadow-xl ring-1 ring-border/60`}>
          {options.map((o) => <button key={o.v} onClick={() => { onChange(o.v); setOpen(false); }} className={`block w-full rounded-lg px-3 py-2 text-left text-[11px] font-semibold ${o.v === value ? "bg-primary text-primary-foreground" : "text-foreground/85 active:bg-secondary"}`}>{o.l}</button>)}
        </div>
      )}
    </div>
  );
}
function NumInput({ value, onChange, ph, suffix, w }: { value?: string; onChange: (v: string) => void; ph?: string; suffix?: string; w?: string }) {
  return (
    <div className={`relative ${w ?? "w-full"}`}>
      <input value={value ?? ""} onChange={(e) => onChange(e.target.value)} inputMode="numeric" placeholder={ph} className="w-full rounded-xl bg-card px-3 py-2 text-[12.5px] font-semibold ring-1 ring-border/60 placeholder:text-muted-foreground/50" />
      {suffix && <span className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 text-[10.5px] text-muted-foreground">{suffix}</span>}
    </div>
  );
}
function MiniToggle({ value, a, b, onPick }: { value: string; a: string; b: string; onPick: (v: string) => void }) {
  return (
    <div className="flex shrink-0 overflow-hidden rounded-md text-[9.5px] font-bold ring-1 ring-border/60">
      <button onClick={() => onPick(a)} className={`px-2 py-0.5 ${value === a ? "bg-primary text-primary-foreground" : "bg-secondary text-foreground/60"}`}>{a}</button>
      <button onClick={() => onPick(b)} className={`px-2 py-0.5 ${value === b ? "bg-primary text-primary-foreground" : "bg-secondary text-foreground/60"}`}>{b}</button>
    </div>
  );
}
function smChip(on: boolean) {
  return `lf-chip rounded-lg px-2.5 py-1 text-[11px] font-bold ${on ? "bg-primary text-primary-foreground shadow-sm" : "bg-secondary text-foreground/75"}`;
}

function LifestylePage() {
  const navigate = useNavigate();
  const [openCat, setOpenCat] = useState<string | null>(null); // which goal category is expanded on the unified pick page
  const [noGoalPopup, setNoGoalPopup] = useState(false); // confirm before leaving pick-all with nothing selected
  const { start, mode, preselect, only } = Route.useSearch();
  const onlyOne = only === "1"; // "Make this a focus area" — just this one screen + focus
  const unified = mode === "unified";                 // Create flow: full wizard, no basics
  const planFlow = unified || start === "conditions"; // skip basics, start at the health screen
  const wizard = unified || !planFlow;                // wizard-style focus page (Create + profile picker); not the short start=conditions flow
  const [a, setA] = useState<Record<string, any>>({ main: "3", mini: "1", sleep: 7, heightUnit: "cm", weightUnit: "kg", habits: [], workouts: [], mobility: {}, habitDetail: {}, openHabit: null, conditions: [], condDetail: {}, openCond: null, chosenGoals: [], pickOwn: false });
  const set = (k: string, v: any) => setA((p) => ({ ...p, [k]: v }));
  const togIn = (k: string, v: string) => setA((p) => { const cur = (p[k] as string[]) ?? []; return { ...p, [k]: cur.includes(v) ? cur.filter((x) => x !== v) : [...cur, v] }; });
  const togCap = (k: string, v: string, cap: number) => setA((p) => { const cur = (p[k] as string[]) ?? []; if (cur.includes(v)) return { ...p, [k]: cur.filter((x) => x !== v) }; return { ...p, [k]: cur.length >= cap ? [...cur.slice(1), v] : [...cur, v] }; });
  const setMob = (k: string, v: string) => setA((p) => ({ ...p, mobility: { ...(p.mobility as Record<string, string>), [k]: v } }));
  const setSub = (hid: string, sk: string, v: string) => setA((p) => { const hd = (p.habitDetail as Record<string, Record<string, string>>) ?? {}; return { ...p, habitDetail: { ...hd, [hid]: { ...(hd[hid] ?? {}), [sk]: v } } }; });
  const clickHabit = (h: { id: string; subs?: unknown }) => {
    if (!h.subs) { togIn("habits", h.id); return; }
    setA((p) => { const open = p.openHabit === h.id; const cur = p.habits as string[]; if (open) return { ...p, openHabit: null, habits: cur.filter((x) => x !== h.id) }; return { ...p, openHabit: h.id, habits: cur.includes(h.id) ? cur : [...cur, h.id] }; });
  };
  const clickCond = (c: { id: string; subs?: unknown }) => {
    if (!c.subs) { togIn("conditions", c.id); return; }
    // One tap toggles selection: selected → deselect (+ close its panel); unselected → select (+ open).
    setA((p) => {
      const cur = (p.conditions as string[]) ?? [];
      if (cur.includes(c.id)) return { ...p, conditions: cur.filter((x) => x !== c.id), openCond: p.openCond === c.id ? null : p.openCond };
      return { ...p, conditions: [...cur, c.id], openCond: c.id };
    });
  };
  const setCondSub = (cid: string, sk: string, v: string) => setA((p) => { const cd = (p.condDetail as Record<string, Record<string, string>>) ?? {}; return { ...p, condDetail: { ...cd, [cid]: { ...(cd[cid] ?? {}), [sk]: v } } }; });
  // multi-select sub-question — value stored as a comma-joined string
  const toggleCondMulti = (cid: string, sk: string, opt: string) => setA((p) => { const cd = (p.condDetail as Record<string, Record<string, string>>) ?? {}; const cur = (cd[cid]?.[sk] ?? "").split(",").filter(Boolean); const next = cur.includes(opt) ? cur.filter((x) => x !== opt) : [...cur, opt]; return { ...p, condDetail: { ...cd, [cid]: { ...(cd[cid] ?? {}), [sk]: next.join(",") } } }; });
  const togGoal = (id: string) => setA((p) => { const cur = (p.chosenGoals as string[]) ?? []; if (cur.includes(id)) return { ...p, chosenGoals: cur.filter((x) => x !== id) }; return { ...p, chosenGoals: cur.length >= 2 ? [...cur.slice(1), id] : [...cur, id] }; });
  const setClusterPrimary = (cid: string, condId: string) => setA((p) => ({ ...p, clusterPrimary: { ...((p.clusterPrimary as Record<string, string>) ?? {}), [cid]: condId } }));
  const [step, setStep] = useState(0);

  // Load any saved profile once (so returning / editing pre-fills every answer), then apply a
  // preselect from Browse ("Customize / Personalize this goal") — disease → conditions, else fitness.
  useEffect(() => {
    let base: Record<string, any> = {};
    try { const raw = localStorage.getItem("ayuraise.lifestyle"); if (raw) base = JSON.parse(raw); } catch { /* ignore */ }
    setA((p) => {
      const merged = { ...p, ...base };
      if (preselect) {
        const add = (k: string) => { merged[k] = Array.from(new Set([...((merged[k] as string[]) ?? []), preselect])); };
        if (PREVENTION_ORGANS.some((o) => o.id === preselect)) add("prevention");
        else if (WOMEN_ITEMS.some((o) => o.id === preselect)) add("women");
        else if (EVERYDAY_ITEMS.some((o) => o.id === preselect) || REST_CALM.some((o) => o.id === preselect)) add("everyday");
        else if (COND_LABEL[preselect]) add("conditions");
        else add("chosenGoals");
      }
      return merged;
    });
    // No setStep needed: the Create wizard reorders so the clicked category's page is first (step 0).
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const older = Number(a.age) >= 60;
  const female = a.sex === "Female";
  const omad = a.main === "1" && a.mini === "0";

  // Two entry modes, ONE set of question screens: the plan flow jumps straight to the disease
  // list → focus → fitness goal (basics are captured in onboarding); full flow runs everything.
  const showWomen = female || (((a.women as string[]) ?? []).length > 0); // show if female, or a women's item was picked (e.g. from Browse)
  const stepKeys = useMemo(() => unified
    ? ["pick-all", "goals"] // Create wizard — one collapsible page for every goal category, then focus
    : planFlow
    ? ["conditions", ...(female ? ["cycle"] : []), "goals"]          // disease-first short flow
    : [ // profile: basics → gate → the 3 core screens → one goal page → focus
        "about", "movement", "sleep", "eating", "habits", "mind", "gate",
        "pick-all",
        ...(older ? ["seniors"] : []),
        "goals",
      ], [older, female, planFlow, unified]);
  const key = stepKeys[Math.min(step, stepKeys.length - 1)];

  const cm = a.heightUnit === "ft" ? ((parseFloat(a.heightFt) || 0) * 30.48 + (parseFloat(a.heightIn) || 0) * 2.54) : (parseFloat(a.heightCm) || 0);
  const kg = a.weightUnit === "lb" ? (parseFloat(a.weightLb) || 0) * 0.453592 : (parseFloat(a.weightKg) || 0);
  const bmrBase = useMemo(() => {
    const age = parseFloat(a.age); if (!cm || !kg || !age) return null;
    return a.sex === "Female" ? 10 * kg + 6.25 * cm - 5 * age - 161 : 10 * kg + 6.25 * cm - 5 * age + 5;
  }, [cm, kg, a.age, a.sex]);
  const tdee = bmrBase ? Math.round(bmrBase * (ACT_FACTOR[a.activity] ?? 1.375)) : null;

  const conds = (a.conditions as string[]) ?? [];
  // `chosen` now holds only the optional wellness goals the user adds — conditions
  // are all auto-included and shown as clusters (no hard 2-cap, nothing dropped).
  const chosen = (a.chosenGoals as string[]) ?? [];
  // Create-wizard selections (prevention organs ≤2, women's life stages, everyday concerns)
  const prevention = (a.prevention as string[]) ?? [];
  const women = (a.women as string[]) ?? [];
  const everyday = (a.everyday as string[]) ?? [];
  // organs that your chosen conditions already strengthen (shown as auto-covered on the prevention page)
  const autoOrgans = Array.from(new Set(conds.map((id) => CONDITION_ORGAN[id]).filter(Boolean)));
  const orgCap = conds.length > 0 ? 1 : 2; // with conditions, add at most 1 more; otherwise up to 2
  const healthIds = Array.from(new Set([...conds, ...prevention, ...women, ...everyday])); // the "health" side for focus ranking

  // ---- active-focus model: diseases (by severity) + indirect signals; top 2, cross-cluster ----
  const cdet = (a.condDetail as Record<string, Record<string, string>>) ?? {};
  const stressedLf = a.mood === "Low" || a.anxiety === "Often" || a.anxiety === "Sometimes" || a.unwind === "Rarely";
  const poorSleepLf = Number(a.waking) >= 4; // how they FEEL waking up (Groggy/foggy or Exhausted) — not hours; hours drive the recommendation
  const indirect: { id: string; label: string; pri: number }[] = [];
  if (stressedLf) indirect.push({ id: "stress", label: "Stress", pri: 0.95 });
  if (poorSleepLf) indirect.push({ id: "better-sleep", label: "Better sleep", pri: 0.9 });
  const focusPool = wizard ? healthIds : conds; // wizard ranks all health selections; short flow ranks conditions
  const candidates = [
    ...focusPool.map((id) => ({ id, label: COND_LABEL[id] ?? conditionMeta(id)?.label ?? id, pri: conditionSeverity(id, cdet[id] ?? {}) })),
    ...indirect.filter((x) => !focusPool.includes(x.id)),
  ].sort((x, y) => y.pri - x.pri);
  // auto-detected signals (stress / sleep from the Mind & Sleep answers) never auto-fill Primary —
  // they ride along as "Also covered"; Primary stays what the user actually selected.
  const autoActive = candidates.filter((cc) => !indirect.some((x) => x.id === cc.id)).slice(0, 2).map((cc) => cc.id);
  const ovAF = (a.activeFocus as string[]) ?? [];
  const activeFocus = ovAF.length ? ovAF.filter((id) => candidates.some((cc) => cc.id === id)) : autoActive;
  const togActive = (id: string) => setA((p) => { const base = (p.activeFocus as string[])?.length ? (p.activeFocus as string[]) : autoActive; const cur = base.includes(id) ? base.filter((x) => x !== id) : base.length >= 2 ? [...base.slice(1), id] : [...base, id]; return { ...p, activeFocus: cur }; });
  const pickGoal = (id: string) => setA((p) => { const cur = (p.chosenGoals as string[]) ?? []; return { ...p, chosenGoals: cur.includes(id) ? [] : [id] }; }); // only one common goal at a time
  // clear everything the user picked inside one goal category (from the tile badge or the popup)
  const clearCat = (cat: string) => setA((p) => {
    if (cat === "condition") return { ...p, conditions: [], openCond: null };
    if (cat === "organ") return { ...p, prevention: [] };
    if (cat === "fitness") return { ...p, chosenGoals: [] };
    if (cat === "hairskin") return { ...p, everyday: ((p.everyday as string[]) ?? []).filter((x) => !EVERYDAY_ITEMS.some((o) => o.id === x)) };
    if (cat === "calm") return { ...p, everyday: ((p.everyday as string[]) ?? []).filter((x) => !REST_CALM.some((o) => o.id === x)) };
    if (cat === "women") return { ...p, women: [] };
    return p;
  });
  // goals the user explicitly added become focus areas too — but in the Create flow fitness stays
  // its OWN section, never mixed into the primary health focus.
  const pickedCands = wizard ? [] : chosen.filter((id) => !candidates.some((cc) => cc.id === id)).map((id) => ({ id, label: COND_LABEL[id] ?? FITNESS_GOALS.find((x) => x.id === id)?.label ?? id, pri: 1 }));
  const allCands = [...candidates, ...pickedCands];
  const topIds = wizard ? new Set(activeFocus) : new Set([...activeFocus, ...chosen]);
  const toggleFocus = (id: string) => { if (chosen.includes(id)) pickGoal(id); else togActive(id); };
  const activeClusters = new Set(Array.from(topIds).map((id) => conditionMeta(id)?.cluster).filter(Boolean) as string[]);

  // lifestyle-based habit nudges (shown when no conditions selected)
  const habitSuggestions = useMemo(() => {
    const s: { id: string; t: string }[] = [];
    const hd = (a.habitDetail as Record<string, Record<string, string>>) ?? {};
    const H = (a.habits as string[]) ?? [];
    const lastH = a.lastMeal ? parseInt(String(a.lastMeal).split(":")[0], 10) : null;
    if (H.includes("smoke") && hd.smoke?.freq === "Daily") s.push({ id: "smoke", t: "Cut smoking toward 1 a day" });
    if (H.includes("sweets")) s.push({ id: "sweets", t: "Cut back on sweets & sugary drinks" });
    if (H.includes("fried")) s.push({ id: "fried", t: "Reduce fried & packaged food" });
    if (H.includes("alcohol")) s.push({ id: "alcohol", t: "Trim your drinking" });
    if (lastH !== null && lastH >= 21) s.push({ id: "earlydinner", t: "Finish dinner by ~9 pm" });
    s.push({ id: "gap", t: "Keep a 12-hour gap between dinner & breakfast" });
    if (a.water === "<1.5" || a.water === "1.5–2") s.push({ id: "water", t: "Drink a bit more water" });
    if ((a.sleep ?? 7) < 6.5) s.push({ id: "sleep", t: "Aim for 7+ hours of sleep" });
    return s;
  }, [a.habits, a.habitDetail, a.lastMeal, a.water, a.sleep]);

  const canNext = key === "about" ? (!!a.age && !!a.sex && cm > 0 && kg > 0) : true;
  const back = () => (step === 0 ? navigate({ to: "/home" }) : setStep((s) => s - 1));
  const next = () => { if (canNext) setStep((s) => Math.min(stepKeys.length - 1, s + 1)); };
  const persist = () => { try { localStorage.setItem("ayuraise.lifestyle", JSON.stringify({ ...a, cm: Math.round(cm), kg: Math.round(kg), tdee, updatedAt: Date.now() })); } catch { /* ignore */ } };
  const save = () => { persist(); navigate({ to: "/home" }); };
  const buildPlan = () => {
    persist();
    const g = Array.from(new Set([...conds, ...prevention, ...women, ...everyday, ...activeFocus, ...chosen])); // everything selected
    setStep(0); // so returning here lands on the start, not a stale goals page
    if (g.length) { savePersonalPlan(g); navigate({ to: "/create", search: () => ({ goal: g[0], goals: g.join(","), edit: undefined }) }); } // earlier post-goal flow
    else navigate({ to: "/home" });
  };
  const label = (id: string) => COND_LABEL[id] ?? FITNESS_GOALS.find((x) => x.id === id)?.label ?? id;
  // Hair fall: tell the user what's realistic from their answers, rather than asking their goal.
  const hairOutlook = (d: Record<string, string>): string | null => {
    if (!d.pattern) return null;
    if (d.pattern === "Patches") return "⚠ Patchy loss should be seen by a dermatologist — we'll keep your plan gentle meanwhile.";
    const genetic = d.pattern === "Hairline / crown" || d.pattern === "Widening parting" || d.family === "Yes";
    if (genetic) return "This looks like a genetic pattern — we can slow it and support your scalp & nutrition, but full regrowth usually needs a dermatologist's help.";
    if (d.timeline === "Recent (under 6 months)" || (d.trigger && d.trigger.split(",").filter(Boolean).length > 0)) return "This looks like temporary shedding — it usually regrows in 6–12 months with good nutrition, less stress and scalp care. Give it ~3 months.";
    if (d.pattern === "Mostly scalp / flaking") return "This looks scalp-driven — treating the scalp (and cooling pitta) should help noticeably.";
    return "With the right nutrition and scalp care this should improve over ~3 months. Hair is slow — be patient.";
  };
  const renderGoal = (g: { id: string; label: string; emoji: string }) => {
    const on = (a.chosenGoals as string[]).includes(g.id);
    return <button key={g.id} onClick={() => togGoal(g.id)} className={`lf-chip rounded-full px-3 py-1.5 text-[12px] font-semibold ${on ? "bg-primary text-primary-foreground" : "bg-secondary text-foreground/75"}`}>{g.emoji} {g.label}</button>;
  };
  // goal-vs-condition conflict check (uses the profile we already have here)
  const focusCtx = { thyroid: cdet.thyroid?.kind === "Hypo" ? "hypo" as const : cdet.thyroid?.kind === "Hyper" ? "hyper" as const : undefined, frail: cm > 0 && kg > 0 && kg / ((cm / 100) ** 2) < 18.5 };
  const conflicts = resolveConflicts(Array.from(new Set([...conds, ...activeFocus, ...chosen])), focusCtx);
  const bmiHigh = cm > 0 && kg > 0 && kg / ((cm / 100) ** 2) >= 25;
  const metabolicWeightNote = bmiHigh && [...conds, ...activeFocus].some((id) => conditionMeta(id)?.cluster === "metabolic");

  // Reusable condition-group body (chips + the tapped item's sub-questions) — shared by the
  // profile step and the Create "disease" page (where Joint/Gut open from a small icon).
  const condGroupBody = (grp: (typeof CONDITIONS)[number], compact = false) => {
    const openC = grp.items.find((c) => c.id === a.openCond);
    const cd = openC ? ((a.condDetail as Record<string, Record<string, string>>)[openC.id] ?? {}) : {};
    // open the detail right under the row that holds the tapped chip (full-width), not at the bottom of the grid
    const openIdx = openC && openC.subs ? grp.items.findIndex((c) => c.id === openC.id) : -1;
    const rowEndIdx = openIdx < 0 ? -1 : (openIdx % 2 === 0 ? Math.min(openIdx + 1, grp.items.length - 1) : openIdx);
    const detail = openC && openC.subs ? (
      <div key="__detail" className="col-span-2 space-y-2 rounded-2xl bg-card/70 p-3 ring-1 ring-border/60">
        <p className="text-[11.5px] font-bold text-foreground">{openC.emoji} {openC.label}</p>
        {openC.note && <p className="-mt-1 text-[10.5px] text-muted-foreground">{openC.note}</p>}
        {openC.subs.filter((s) => !s.showIf || s.showIf(cd)).map((s) => (
          <div key={s.key}>
            <p className="mb-1 text-[11px] font-semibold text-muted-foreground">{s.q}</p>
            {s.input
              ? <input value={cd[s.key] ?? ""} onChange={(e) => setCondSub(openC.id, s.key, e.target.value)} placeholder={s.ph} className="w-full rounded-xl bg-card px-3 py-2 text-[12px] font-semibold ring-1 ring-border/60 placeholder:text-muted-foreground/50" />
              : s.multi
                ? <div className="flex flex-wrap gap-1.5">{(s.opts ?? []).map((o) => { const sel = (cd[s.key] ?? "").split(",").filter(Boolean).includes(o); return <button key={o} onClick={() => toggleCondMulti(openC.id, s.key, o)} className={`lf-chip rounded-full px-3 py-1.5 text-[11.5px] font-semibold ${sel ? "bg-primary text-primary-foreground" : "bg-secondary text-foreground/75"}`}>{o}</button>; })}</div>
                : <div className="flex flex-wrap gap-1.5">{(s.opts ?? []).map((o) => <button key={o} onClick={() => setCondSub(openC.id, s.key, o)} className={`lf-chip rounded-full px-3 py-1.5 text-[11.5px] font-semibold ${cd[s.key] === o ? "bg-primary text-primary-foreground" : "bg-secondary text-foreground/75"}`}>{o}</button>)}</div>}
          </div>
        ))}
        {openC.id === "hair-fall" && hairOutlook(cd) && <p className="rounded-xl bg-primary/10 px-3 py-2 text-[11px] leading-snug text-foreground/85 ring-1 ring-primary/20">{hairOutlook(cd)}</p>}
        <button onClick={() => set("openCond", null)} className="mt-1 w-full rounded-xl bg-primary py-2 text-[12px] font-bold text-primary-foreground active:scale-[0.99]">Done</button>
      </div>
    ) : null;
    return (
      <div className="grid grid-cols-2 gap-1.5">
        {grp.items.map((c, i) => { const on = conds.includes(c.id); const open = a.openCond === c.id; return (
          <Fragment key={c.id}>
            <button onClick={() => clickCond(c)} className={`lf-chip flex items-center gap-1.5 rounded-xl py-1.5 pl-1.5 pr-2 ${compact ? "text-[11px]" : "text-[11.5px]"} font-semibold ring-1 ${on ? "bg-primary/10 ring-primary" : "bg-card text-foreground/85 ring-border/60"}`}>
              <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-lg text-[12px]" style={{ background: "var(--gradient-water)" }}>{c.emoji}</span>
              <span className="min-w-0 flex-1 truncate text-left">{c.label}</span>
              {c.subs ? <span className="text-[9px] text-muted-foreground">{open ? "▾" : "▸"}</span> : null}
            </button>
            {i === rowEndIdx && detail}
          </Fragment>
        ); })}
      </div>
    );
  };

  const capHint = key === "fitness" ? "Pick any 1" : null;

  return (
    <div className="min-h-svh pb-28" style={{ background: "var(--gradient-hero)" }}>
      <style>{PREMIUM_CSS}</style>
      <div className="relative overflow-hidden px-4 pb-4 pt-[max(1rem,env(safe-area-inset-top))]" style={{ background: "var(--gradient-violet)" }}>
        <div className="relative flex items-center gap-2.5 text-primary-foreground">
          <button onClick={back} className="lf-btn inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-white/15"><ArrowLeft size={15} /></button>
          <div className="min-w-0 flex-1">
            <h1 className="truncate font-display text-[17px] font-extrabold leading-tight">{HEAD[key]}</h1>
            {capHint && <p className="text-[10px] font-semibold uppercase tracking-wide opacity-80">{capHint}</p>}
          </div>
        </div>
        <div className="relative mt-3 h-1.5 overflow-hidden rounded-full bg-white/20">
          <div className="lf-bar absolute inset-y-0 left-0 rounded-full bg-white" style={{ width: `${((step + 1) / stepKeys.length) * 100}%` }} />
        </div>
      </div>

      <div key={key} className="lf-step mx-auto max-w-xl space-y-4 px-4 pt-4">
        {/* ABOUT */}
        {key === "about" && (
          <div className="space-y-3.5">
            <Field label="Name"><input value={a.name ?? ""} onChange={(e) => set("name", e.target.value)} placeholder="Your name" className="w-full rounded-xl bg-card px-3 py-2 text-[12.5px] font-semibold ring-1 ring-border/60 placeholder:text-muted-foreground/50" /></Field>
            <Field label="Gender"><div className="flex flex-wrap gap-1.5">{SEX.map((s) => <button key={s} onClick={() => set("sex", s)} className={chip(a.sex === s)}>{s}</button>)}</div></Field>
            <Field label="Age"><NumInput value={a.age} onChange={(v) => set("age", v)} ph="25" suffix="years" /></Field>
            <div className="flex gap-3">
              <div className="min-w-0 flex-1">
                <div className="mb-1.5 flex items-center justify-between px-1">
                  <p className="text-[13px] font-semibold text-foreground/85">Height</p>
                  <MiniToggle value={a.heightUnit} a="cm" b="ft" onPick={(u) => set("heightUnit", u)} />
                </div>
                {a.heightUnit === "ft"
                  ? <div className="flex gap-1.5"><NumInput value={a.heightFt} onChange={(v) => set("heightFt", v)} ph="ft" w="flex-1" /><NumInput value={a.heightIn} onChange={(v) => set("heightIn", v)} ph="in" w="flex-1" /></div>
                  : <NumInput value={a.heightCm} onChange={(v) => set("heightCm", v)} ph="175" />}
              </div>
              <div className="min-w-0 flex-1">
                <div className="mb-1.5 flex items-center justify-between px-1">
                  <p className="text-[13px] font-semibold text-foreground/85">Weight</p>
                  <MiniToggle value={a.weightUnit} a="kg" b="lb" onPick={(u) => set("weightUnit", u)} />
                </div>
                {a.weightUnit === "lb"
                  ? <NumInput value={a.weightLb} onChange={(v) => set("weightLb", v)} ph="150" />
                  : <NumInput value={a.weightKg} onChange={(v) => set("weightKg", v)} ph="68" />}
              </div>
            </div>
          </div>
        )}

        {/* MOVEMENT (after about) */}
        {key === "movement" && (
          <div className="space-y-2">
            {ACTIVITY.map((x) => (
              <div key={x.id}>
                <button onClick={() => set("activity", x.id)} className={`lf-btn flex w-full items-start gap-3 rounded-2xl p-3 text-left ring-1 ${a.activity === x.id ? "bg-primary/10 ring-primary" : "bg-card ring-border/60"}`}>
                  <span className={`mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded-full text-[10px] ${a.activity === x.id ? "bg-primary text-primary-foreground" : "bg-secondary"}`}>{a.activity === x.id ? "✓" : ""}</span>
                  <div className="min-w-0">
                    <p className="text-[13px] font-bold text-foreground">{x.label} <span className="text-[10px] font-medium text-primary">{x.note}</span></p>
                    <p className="text-[11px] leading-snug text-muted-foreground">{x.desc}</p>
                  </div>
                </button>
                {a.activity === x.id && x.id !== "sedentary" && (
                  <div className="mt-1.5 rounded-2xl bg-card/70 p-3 ring-1 ring-border/60">
                    <p className="mb-1.5 text-[11px] font-semibold text-muted-foreground">What do you do? — select all that apply</p>
                    <div className="flex flex-wrap gap-1.5">{WORKOUTS.map((w) => <button key={w} onClick={() => togIn("workouts", w)} className={`lf-chip rounded-full px-3 py-1.5 text-[11.5px] font-semibold ${((a.workouts as string[]) ?? []).includes(w) ? "bg-primary text-primary-foreground" : "bg-secondary text-foreground/75"}`}>{w}</button>)}</div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        {/* SLEEP */}
        {key === "sleep" && (
          <div className="space-y-4">
            <Field label="What time do you go to bed?"><SlotPicker value={a.bedtime} onChange={(v) => set("bedtime", v)} options={BEDTIME} ph="Select…" /></Field>
            <Field label="Do you take a daytime nap?"><div className="flex flex-wrap gap-1.5">{["No", "Sometimes", "Daily"].map((n) => <button key={n} onClick={() => set("nap", n)} className={chip(a.nap === n)}>{n}</button>)}</div></Field>
            <Field label={`Hours you actually sleep · ${a.sleep ?? 7}h`}><input type="range" min={4} max={10} step={0.5} value={a.sleep ?? 7} onChange={(e) => set("sleep", Number(e.target.value))} className="w-full" style={{ accentColor: "var(--primary)" }} /></Field>
            <Field label="Time to fall asleep"><div className="flex flex-wrap gap-1.5">{LATENCY.map((l) => <button key={l} onClick={() => set("latency", l)} className={chip(a.latency === l)}>{l}</button>)}</div></Field>
            <div>
              <p className="mb-1.5 px-1 text-[11.5px] font-semibold text-foreground/70">How you feel waking up · <span className="text-foreground">{WAKING[(a.waking ?? 3) - 1]}</span></p>
              <div className="mb-1 flex justify-between px-1 text-[10px] text-muted-foreground"><span>Fresh</span><span>Exhausted</span></div>
              <input type="range" min={1} max={5} value={a.waking ?? 3} onChange={(e) => set("waking", Number(e.target.value))} className="w-full" style={{ accentColor: "var(--primary)" }} />
            </div>
          </div>
        )}

        {/* EATING */}
        {key === "eating" && (
          <div className="space-y-4">
            <Field label="Your food style"><div className="flex flex-wrap gap-1.5">{FOOD_STYLE.map((f) => <button key={f} onClick={() => set("foodstyle", f)} className={chip(a.foodstyle === f)}>{f}</button>)}</div></Field>
            <div className="flex gap-4">
              <Field label="Main meals"><div className="flex flex-wrap gap-1">{MAIN_MEALS.map((m) => <button key={m} onClick={() => set("main", m)} className={smChip(a.main === m)}>{m}</button>)}</div></Field>
              <Field label="Snacks"><div className="flex flex-wrap gap-1">{MINI_MEALS.map((m) => <button key={m} onClick={() => set("mini", m)} className={smChip(a.mini === m)}>{m}</button>)}</div></Field>
            </div>
            {omad ? (
              <Field label="What time do you eat? (one meal a day)"><SlotPicker value={a.mealTime} onChange={(v) => set("mealTime", v)} options={MEAL_SLOTS} ph="Select a slot…" up /></Field>
            ) : (
              <Field label="When do you eat?">
                <div className="flex gap-3">
                  <div className="flex-1"><span className="text-[11px] text-muted-foreground">Breakfast</span><div className="mt-1"><SlotPicker value={a.firstMeal} onChange={(v) => set("firstMeal", v)} options={FIRST_MEAL_SLOTS} ph="Select…" /></div></div>
                  <div className="flex-1"><span className="text-[11px] text-muted-foreground">Dinner</span><div className="mt-1"><SlotPicker value={a.lastMeal} onChange={(v) => set("lastMeal", v)} options={LAST_MEAL_SLOTS} ph="Select…" /></div></div>
                </div>
              </Field>
            )}
            <Field label="Water a day (litres)"><div className="flex gap-1">{WATER.map((w) => <button key={w} onClick={() => set("water", w)} className={`lf-chip flex-1 rounded-lg px-1 py-1 text-[10.5px] font-bold ${a.water === w ? "bg-primary text-primary-foreground" : "bg-secondary text-foreground/75"}`}>{w}</button>)}</div></Field>
          </div>
        )}

        {/* HABITS */}
        {key === "habits" && (
          <div className="flex flex-col items-start gap-1.5">
            {HABITS_DETAIL.map((h) => {
              const on = (a.habits as string[]).includes(h.id);
              const open = a.openHabit === h.id;
              const hd = (a.habitDetail as Record<string, Record<string, string>>)[h.id] ?? {};
              return (
                <div key={h.id} className={open ? "w-full" : ""}>
                  <button onClick={() => clickHabit(h)} className={`lf-chip flex items-center gap-1.5 rounded-full py-1 pl-1 pr-2.5 text-[12px] font-semibold ring-1 ${on ? "bg-primary/10 ring-primary" : "bg-card text-foreground/85 ring-border/60"}`}>
                    <span className="flex h-6 w-6 items-center justify-center rounded-full text-[12px] text-primary-foreground shadow-sm" style={{ background: "var(--gradient-gold)" }}>{h.emoji}</span>
                    {h.label}{h.subs ? <span className="text-[9px] text-muted-foreground">{open ? "▾" : "▸"}</span> : null}
                  </button>
                  {open && h.subs && (
                    <div className="mt-1.5 space-y-2 rounded-2xl bg-card/70 p-3 ring-1 ring-border/60">
                      {h.subs.map((s) => (
                        <div key={s.key}>
                          <p className="mb-1 text-[11px] font-semibold text-muted-foreground">{s.q}</p>
                          <div className="flex flex-wrap gap-1.5">{s.opts.map((o) => <button key={o} onClick={() => setSub(h.id, s.key, o)} className={`lf-chip rounded-full px-3 py-1.5 text-[11.5px] font-semibold ${hd[s.key] === o ? "bg-primary text-primary-foreground" : "bg-secondary text-foreground/75"}`}>{o}</button>)}</div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}

        {/* EAT-TEXT (after habits, single flow) */}
        {key === "eat-text" && (
          <div>
            <p className="mb-2 px-1 text-[12px] text-muted-foreground">In your own words — a typical day of eating. Include roughly what & how much, and when.</p>
            <textarea value={a.eatText ?? ""} onChange={(e) => set("eatText", e.target.value)} rows={7} placeholder={"e.g. 7am tea with sugar + 2 biscuits. 9am breakfast: 3 parathas. 1:30pm lunch: rice, dal, sabzi, curd. Evening samosa + tea. 9:30pm dinner: 3 rotis, paneer."} className="w-full rounded-2xl bg-card px-3.5 py-3 text-[12.5px] leading-relaxed ring-1 ring-border/60" />
          </div>
        )}

        {/* CUISINE — its own screen, layered picker */}
        {key === "cuisine" && (
          <div>
            <p className="mb-3 px-1 text-[12px] text-muted-foreground">Pick a region, then narrow it down — your meal plan will use food you enjoy.</p>
            <CuisinePicker
              path={(a.cuisinePath as string[]) ?? []}
              setPath={(p) => { set("cuisinePath", p); set("cuisine", p[p.length - 1] ?? ""); set("cuisineRegion", cuisineRegion(p)); }}
            />
          </div>
        )}

        {/* DIGESTION */}
        {key === "digestion" && (
          <Field label="How are your bowel movements?">
            <p className="mb-1.5 px-1 text-[10.5px] font-semibold text-red-500">⚠ Under review — may be removed once conditions cover this.</p>
            <div className="flex flex-col gap-1.5">{DIGESTION.map((d) => <button key={d} onClick={() => set("digestion", d)} className={`lf-chip w-full rounded-full px-3.5 py-2 text-left text-[12px] font-semibold ${a.digestion === d ? "bg-primary text-primary-foreground shadow-sm" : "bg-secondary text-foreground/75"}`}>{d}</button>)}</div>
          </Field>
        )}

        {/* MIND — livelier: soft cards + emoji options */}
        {key === "mind" && (
          <div className="space-y-2.5">
            <p className="px-1 text-[12px] text-muted-foreground">A quick, no-pressure check-in 💚</p>
            {MIND.map((m) => (
              <div key={m.key} className="rounded-2xl bg-card p-3 ring-1 ring-border/60">
                <p className="mb-2 text-[12.5px] font-semibold text-foreground">{m.q}</p>
                <div className="flex flex-wrap gap-1.5">{m.opts.map(([e, v]) => <button key={v} onClick={() => set(m.key, v)} className={`lf-chip rounded-full px-3 py-1.5 text-[12px] font-semibold ${a[m.key] === v ? "bg-primary text-primary-foreground shadow-sm" : "bg-secondary text-foreground/75"}`}>{e} {v}</button>)}</div>
              </div>
            ))}
            <p className="rounded-2xl bg-amber-50 px-3 py-2 text-[10.5px] leading-snug text-amber-800 ring-1 ring-amber-200 dark:bg-amber-900/20 dark:text-amber-300 dark:ring-amber-800/60">If low mood or anxiety has lasted more than a couple of weeks or affects daily life, please talk to a doctor or a mental-health professional.</p>
          </div>
        )}

        {/* SENIORS */}
        {key === "seniors" && (
          <div className="space-y-4">
            <Field label="Eyesight (reading small print / phone)"><div className="flex flex-col gap-1.5">{VISION.map((v) => <button key={v} onClick={() => set("vision", v)} className={`lf-btn rounded-xl px-3 py-2 text-left text-[12px] font-semibold ring-1 ${a.vision === v ? "bg-primary/10 ring-primary" : "bg-card ring-border/60"}`}>{v}</button>)}</div></Field>
            <div>
              <p className="mb-1.5 px-1 text-[11px] font-bold uppercase tracking-wide text-muted-foreground">Everyday movement — how easily?</p>
              <div className="space-y-2.5">{MOBILITY_Q.map((m) => (
                <div key={m.key}><p className="mb-1 px-1 text-[11.5px] font-semibold text-foreground">{m.label}</p><div className="flex flex-wrap gap-1.5">{MOBILITY_OPT.map((o) => <button key={o} onClick={() => setMob(m.key, o)} className={chip((a.mobility as Record<string, string>)[m.key] === o)}>{o}</button>)}</div></div>
              ))}</div>
            </div>
          </div>
        )}

        {/* WOMEN */}
        {key === "cycle" && <div className="flex flex-wrap gap-1.5">{CYCLE.map((c) => <button key={c} onClick={() => set("cycle", c)} className={chip(a.cycle === c)}>{c}</button>)}</div>}

        {/* GATE — personalized plan vs explore ready-made (same question flow continues for personalized) */}
        {key === "gate" && (
          <div className="space-y-3">
            <p className="px-1 text-[11.5px] leading-relaxed text-muted-foreground"><b className="text-foreground/80">Sections inside:</b> 🧘 Yoga · 🏋️ Exercise · 🥗 Diet · 🕉️ Meditation · ✨ Detox · ⏱️ Fasting · 🌱 Herbs</p>
            <button onClick={() => { set("planMode", "personalized"); next(); }} className="lf-btn block w-full rounded-2xl bg-card p-4 text-left shadow-sm ring-1 ring-primary/40 active:scale-[0.99]">
              <p className="flex items-center gap-2 text-[14px] font-extrabold text-foreground">✨ Pick your goals &amp; create personalized plan</p>
              <ul className="mt-2 space-y-1 text-[11px] leading-snug text-muted-foreground">
                <li><b className="text-foreground/80">Fitness goals</b> like weight loss, muscle building</li>
                <li><b className="text-foreground/80">Manage health conditions</b> like diabetes, gut health, back &amp; spine etc.</li>
                <li><b className="text-foreground/80">General goals</b> like hair fall, stress relief, better sleep</li>
              </ul>
              <p className="mt-2 text-[11px] font-bold text-primary">Continue →</p>
            </button>
            <button onClick={() => { set("planMode", "explore"); persist(); navigate({ to: "/home" }); }} className="lf-btn block w-full rounded-2xl bg-card p-4 text-left shadow-sm ring-1 ring-primary/40 active:scale-[0.99]">
              <p className="flex items-center gap-2 text-[14px] font-extrabold text-foreground">🧭 Explore sections first &amp; create plan later</p>
              <p className="mt-1.5 text-[11px] leading-snug text-muted-foreground">Get access to ready-made plans created around each goal.</p>
              <p className="mt-2 text-[11px] font-bold text-primary">Take me to the sections →</p>
            </button>
          </div>
        )}

        {/* PICK-ALL — a grid of goal areas; tap one to pick from it, or skip to explore */}
        {key === "pick-all" && (() => {
          const cats = [
            { id: "condition", emoji: "🩺", Icon: Stethoscope, title: "Manage a condition", hint: "Pick any number", grad: "var(--gradient-water)", preview: "Diabetes · BP · thyroid · cholesterol · fatty liver · asthma · migraine · gout · auto-immune · hernia · joints · indigestion…", count: conds.length },
            { id: "organ", emoji: "🫀", Icon: HeartPulse, title: "Strengthen an organ", hint: "Pick up to 2", grad: "var(--gradient-leaf)", preview: "Heart · liver · gut · lungs\n· kidney · pancreas · Brain & Nervous System · eyes · bones", count: prevention.length + autoOrgans.length },
            { id: "fitness", emoji: "💪", Icon: Dumbbell, title: "Weight Loss/Fitness", hint: "Pick just 1", grad: "var(--gradient-gold)", preview: "Weight loss · strength\n· muscle · flexibility · mobility", count: chosen.length },
            { id: "hairskin", emoji: "✨", Icon: Sparkles, title: "Hair & Skin", hint: "Pick any", grad: "var(--gradient-gold)", preview: "Hair fall · skin / glow", count: EVERYDAY_ITEMS.filter((o) => everyday.includes(o.id)).length },
            { id: "calm", emoji: "🌙", Icon: Moon, title: "Calm & Rest", hint: "Pick any", grad: "var(--gradient-violet)", preview: "Better sleep · de-stress", count: REST_CALM.filter((o) => everyday.includes(o.id)).length },
            { id: "women", emoji: "🌸", Icon: Flower2, title: "Women's health", hint: "Pick any", grad: "var(--gradient-violet)", preview: "Pregnancy · post-natal · menopause · PCOD", count: women.length },
          ];
          const active = cats.find((c) => c.id === openCat);
          return (
            <div className="space-y-2.5">
              <div className="grid grid-cols-2 gap-1.5">
                {cats.map((c) => (
                  <button key={c.id} onClick={() => setOpenCat(openCat === c.id ? null : c.id)} className={`lf-btn relative flex flex-col rounded-xl p-2 text-left ring-1 transition ${openCat === c.id ? "bg-primary/10 ring-primary" : "bg-card ring-border/60"}`}>
                    {c.count > 0 && (
                      <span className="absolute right-1.5 top-1.5 rounded-full bg-primary px-1.5 text-[8px] font-bold leading-[15px] text-primary-foreground">{c.count}</span>
                    )}
                    <div className="flex items-center gap-1.5">
                      <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-lg text-primary-foreground shadow-sm" style={{ background: c.grad }}><c.Icon size={14} strokeWidth={2.2} /></span>
                      <p className="min-w-0 flex-1 text-[11px] font-bold leading-tight text-foreground">{c.title}</p>
                    </div>
                    <p className="mt-0.5 whitespace-pre-line text-[8px] leading-[1.2] text-muted-foreground/80">{c.preview}</p>
                  </button>
                ))}
              </div>

              {/* options open as a popup — tap outside or ✕ to close; a portal to <body> escapes the wizard's animated container so the backdrop truly covers the viewport */}
              {active && typeof document !== "undefined" && createPortal(
                <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/55 p-4" onClick={() => setOpenCat(null)}>
                  <div className="max-h-[80svh] w-full max-w-sm overflow-y-auto rounded-2xl bg-card p-4 shadow-xl" onClick={(e) => e.stopPropagation()}>
                    <div className="mb-2 flex items-center justify-between gap-2">
                      <p className="min-w-0 flex-1 text-[13px] font-bold text-foreground">{active.emoji} {active.title} <span className="text-[10px] font-medium text-muted-foreground">· {active.hint}</span></p>
                      {active.count > 0 && <button onClick={() => clearCat(active.id)} className="shrink-0 rounded-full bg-secondary px-2.5 py-1 text-[10px] font-bold text-foreground/70 active:scale-95">Clear</button>}
                      <button onClick={() => setOpenCat(null)} aria-label="Close" className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-secondary text-[14px] font-bold text-foreground/70 active:scale-95">✕</button>
                    </div>

                  {openCat === "condition" && (() => {
                    const hc = CONDITIONS.find((g) => g.g === "Health conditions")!;
                    return (
                      <div className="space-y-2.5">
                        {condGroupBody(hc, true)}
                        <div className="grid grid-cols-2 gap-1.5">
                          {["Joint & Spine", "Gut & Digestion"].map((gname) => {
                            const grp = CONDITIONS.find((g) => g.g === gname)!;
                            const sel = grp.items.filter((x) => conds.includes(x.id)).length;
                            const open = a.openGroup === gname;
                            return (
                              <button key={gname} onClick={() => set("openGroup", open ? null : gname)} className={`lf-chip flex items-center gap-1.5 rounded-xl py-1.5 pl-1.5 pr-2 text-[11px] font-semibold ring-1 ${open ? "bg-primary/10 ring-primary" : "bg-card text-foreground/85 ring-border/60"}`}>
                                <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-lg text-[12px]" style={{ background: "var(--gradient-water)" }}>{GROUP_EMOJI[gname]}</span>
                                <span className="min-w-0 flex-1 truncate text-left">{gname}</span>
                                {sel > 0 && <span className="shrink-0 rounded-full bg-primary px-1 text-[8px] font-bold text-primary-foreground">{sel}</span>}
                                <span className="shrink-0 text-[9px] text-muted-foreground">{open ? "▾" : "▸"}</span>
                              </button>
                            );
                          })}
                        </div>
                        {(a.openGroup === "Joint & Spine" || a.openGroup === "Gut & Digestion") && condGroupBody(CONDITIONS.find((g) => g.g === a.openGroup)!, true)}
                      </div>
                    );
                  })()}

                  {openCat === "organ" && (
                    <div className="space-y-2">
                      {autoOrgans.length > 0 && <p className="rounded-xl bg-primary/10 px-3 py-2 text-[10.5px] leading-snug text-foreground/85 ring-1 ring-primary/20">From your conditions, <b>{autoOrgans.map((id) => PREVENTION_ORGANS.find((o) => o.id === id)?.label ?? id).join(", ")}</b> is covered automatically.</p>}
                      <div className="grid grid-cols-2 gap-1.5">
                        {PREVENTION_ORGANS.map((o) => {
                          const auto = autoOrgans.includes(o.id);
                          const on = prevention.includes(o.id);
                          if (auto) return (
                            <span key={o.id} className="flex items-center gap-1.5 rounded-xl bg-primary/10 py-1.5 pl-1.5 pr-2 text-[11.5px] font-semibold text-foreground/70 ring-1 ring-primary/30">
                              <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-lg text-[12px]" style={{ background: "var(--gradient-leaf)" }}>{o.emoji}</span>
                              <span className="min-w-0 flex-1 truncate text-left">{o.label}</span>
                              <span className="shrink-0 text-[8.5px] font-bold uppercase text-primary/70">auto</span>
                            </span>
                          );
                          return (
                            <button key={o.id} onClick={() => togCap("prevention", o.id, 2)} className={`lf-chip flex items-center gap-1.5 rounded-xl py-1.5 pl-1.5 pr-2 text-[11.5px] font-semibold ring-1 ${on ? "bg-primary/10 ring-primary" : "bg-card text-foreground/85 ring-border/60"}`}>
                              <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-lg text-[12px]" style={{ background: "var(--gradient-leaf)" }}>{o.emoji}</span>
                              <span className="min-w-0 flex-1 truncate text-left">{o.label}</span>
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  {openCat === "hairskin" && (
                    <div className="grid grid-cols-2 gap-1.5">
                      {EVERYDAY_ITEMS.map((o) => { const on = everyday.includes(o.id); return (
                        <button key={o.id} onClick={() => togIn("everyday", o.id)} className={`lf-chip flex items-center gap-1.5 rounded-xl py-1.5 pl-1.5 pr-2 text-[11.5px] font-semibold ring-1 ${on ? "bg-primary/10 ring-primary" : "bg-card text-foreground/85 ring-border/60"}`}>
                          <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-lg text-[12px]" style={{ background: "var(--gradient-gold)" }}>{o.emoji}</span>
                          <span className="min-w-0 flex-1 truncate text-left">{o.label}</span>
                        </button>
                      ); })}
                    </div>
                  )}

                  {openCat === "calm" && (
                    <div className="grid grid-cols-2 gap-1.5">
                      {REST_CALM.map((o) => { const on = everyday.includes(o.id); return (
                        <button key={o.id} onClick={() => togIn("everyday", o.id)} className={`lf-chip flex items-center gap-1.5 rounded-xl py-1.5 pl-1.5 pr-2 text-[11.5px] font-semibold ring-1 ${on ? "bg-primary/10 ring-primary" : "bg-card text-foreground/85 ring-border/60"}`}>
                          <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-lg text-[12px]" style={{ background: "var(--gradient-violet)" }}>{o.emoji}</span>
                          <span className="min-w-0 flex-1 truncate text-left">{o.label}</span>
                        </button>
                      ); })}
                    </div>
                  )}

                  {openCat === "fitness" && (
                    <div className="grid grid-cols-2 gap-1.5">
                      {FITNESS_GOALS.map((gg) => { const on = chosen.includes(gg.id); return (
                        <button key={gg.id} onClick={() => togCap("chosenGoals", gg.id, 1)} className={`lf-chip flex items-center gap-1.5 rounded-xl py-1.5 pl-1.5 pr-2 text-[11.5px] font-semibold ring-1 ${on ? "bg-primary/10 ring-primary" : "bg-card text-foreground/85 ring-border/60"}`}>
                          <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-lg text-[12px]" style={{ background: "var(--gradient-gold)" }}>{gg.emoji}</span>
                          <span className="min-w-0 flex-1 truncate text-left">{gg.label}</span>
                        </button>
                      ); })}
                    </div>
                  )}

                  {openCat === "women" && (
                    <div className="grid grid-cols-2 gap-1.5">
                      {WOMEN_ITEMS.map((o) => { const on = women.includes(o.id); return (
                        <button key={o.id} onClick={() => togIn("women", o.id)} className={`lf-chip flex items-center gap-1.5 rounded-xl py-1.5 pl-1.5 pr-2 text-[11.5px] font-semibold ring-1 ${on ? "bg-primary/10 ring-primary" : "bg-card text-foreground/85 ring-border/60"}`}>
                          <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-lg text-[12px]" style={{ background: "var(--gradient-violet)" }}>{o.emoji}</span>
                          <span className="min-w-0 flex-1 truncate text-left">{o.label}</span>
                        </button>
                      ); })}
                    </div>
                  )}

                    <button onClick={() => setOpenCat(null)} className="mt-3 w-full rounded-2xl bg-primary py-2.5 text-[13px] font-bold text-primary-foreground active:scale-[0.99]">Done</button>
                  </div>
                </div>,
                document.body
              )}

              {/* Info — no goal needed; the Continue button handles going Home via a confirm popup */}
              <div className="w-full rounded-2xl bg-card p-3 text-left ring-1 ring-border/60">
                <p className="text-[12.5px] font-bold text-foreground">Don't want to pick a goal as of now?</p>
                <p className="mt-0.5 text-[10.5px] leading-snug text-muted-foreground">Just tap Continue — we'll take you to Home with access to ready-made plans, and you can create your personalized plan later.</p>
              </div>
            </div>
          );
        })()}

        {/* CONDITIONS grid — profile step: all groups, flat */}
        {key === "conditions" && (
          <div className="space-y-3">
            <p className="px-1 text-[12px] text-muted-foreground">Select any you have — tap for a couple of quick details. Skip if none.</p>
            {CONDITIONS.map((grp) => (
              <div key={grp.g}>
                <p className="mb-1.5 px-1 text-[11px] font-bold uppercase tracking-wide text-muted-foreground">{grp.g}</p>
                {condGroupBody(grp)}
              </div>
            ))}
          </div>
        )}

        {/* DISEASE — Create wizard: flat conditions, with Joint & Spine / Gut & Digestion as two small icons */}
        {key === "disease" && (() => {
          const hc = CONDITIONS.find((g) => g.g === "Health conditions")!;
          const openGrp = a.openGroup === "Joint & Spine" || a.openGroup === "Gut & Digestion"
            ? CONDITIONS.find((g) => g.g === a.openGroup) : undefined;
          return (
            <div className="space-y-3">
              <p className="px-1 text-[12px] text-muted-foreground">{onlyOne ? "Tell us about any of the below that apply — we collect this only as a precaution, to keep your plan safe." : "Select if it applies to you — or skip."}</p>
              {condGroupBody(hc, true)}
              <div className="grid grid-cols-2 gap-1.5">
                {["Joint & Spine", "Gut & Digestion"].map((gname) => {
                  const grp = CONDITIONS.find((g) => g.g === gname)!;
                  const sel = grp.items.filter((c) => conds.includes(c.id)).length;
                  const open = a.openGroup === gname;
                  return (
                    <button key={gname} onClick={() => set("openGroup", open ? null : gname)} className={`lf-chip flex items-center gap-1.5 rounded-xl py-1.5 pl-1.5 pr-2 text-[11px] font-semibold ring-1 ${open ? "bg-primary/10 ring-primary" : "bg-card text-foreground/85 ring-border/60"}`}>
                      <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-lg text-[12px]" style={{ background: "var(--gradient-water)" }}>{GROUP_EMOJI[gname]}</span>
                      <span className="min-w-0 flex-1 truncate text-left">{gname}</span>
                      {sel > 0 && <span className="shrink-0 rounded-full bg-primary px-1 text-[8px] font-bold text-primary-foreground">{sel}</span>}
                      <span className="shrink-0 text-[9px] text-muted-foreground">{open ? "▾" : "▸"}</span>
                    </button>
                  );
                })}
              </div>
              {openGrp && condGroupBody(openGrp, true)}
            </div>
          );
        })()}

        {/* IMPROVE & STRENGTHEN — organs + hair/skin/eyes + rest & calm, all on one page */}
        {key === "prevention" && (
          <div className="space-y-4">
            {/* Organs */}
            <div className="space-y-2">
              {autoOrgans.length > 0
                ? <p className="rounded-2xl bg-primary/10 px-3 py-2.5 text-[11px] leading-snug text-foreground/85 ring-1 ring-primary/20">Based on the conditions you picked, your <b>{autoOrgans.map((id) => PREVENTION_ORGANS.find((o) => o.id === id)?.label ?? id).join(", ")}</b> will strengthen automatically. Add more if you like, but picking too many will dilute your plan.</p>
                : <p className="px-1 text-[11.5px] leading-snug text-muted-foreground">Pick what matters — but picking too many will dilute your plan. Skip if none.</p>}
              <div className="grid grid-cols-2 gap-1.5">
                {PREVENTION_ORGANS.map((o) => {
                  const auto = autoOrgans.includes(o.id);
                  const on = prevention.includes(o.id);
                  if (auto) return (
                    <span key={o.id} className="flex items-center gap-1.5 rounded-xl bg-primary/10 py-1.5 pl-1.5 pr-2 text-[11.5px] font-semibold text-foreground/70 ring-1 ring-primary/30">
                      <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-lg text-[12px]" style={{ background: "var(--gradient-leaf)" }}>{o.emoji}</span>
                      <span className="min-w-0 flex-1 truncate text-left">{o.label}</span>
                      <span className="shrink-0 text-[8.5px] font-bold uppercase text-primary/70">auto</span>
                    </span>
                  );
                  return (
                    <button key={o.id} onClick={() => togIn("prevention", o.id)} className={`lf-chip flex items-center gap-1.5 rounded-xl py-1.5 pl-1.5 pr-2 text-[11.5px] font-semibold ring-1 ${on ? "bg-primary/10 ring-primary" : "bg-card text-foreground/85 ring-border/60"}`}>
                      <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-lg text-[12px]" style={{ background: "var(--gradient-leaf)" }}>{o.emoji}</span>
                      <span className="min-w-0 flex-1 truncate text-left">{o.label}</span>
                    </button>
                  );
                })}
              </div>
              {PREVENTION_ORGANS.filter((o) => o.hint).map((o) => (
                <p key={o.id} className="px-1 text-[10.5px] leading-snug text-muted-foreground">{o.emoji} <b className="text-foreground/80">{o.label}</b> — {o.hint}</p>
              ))}
            </div>
            {/* Hair & skin (own colour, no header) */}
            <div className="space-y-2">
              <div className="grid grid-cols-2 gap-1.5">
                {EVERYDAY_ITEMS.map((o) => { const on = everyday.includes(o.id); return (
                  <button key={o.id} onClick={() => togIn("everyday", o.id)} className={`lf-chip flex items-center gap-1.5 rounded-xl py-1.5 pl-1.5 pr-2 text-[11.5px] font-semibold ring-1 ${on ? "bg-primary/10 ring-primary" : "bg-card text-foreground/85 ring-border/60"}`}>
                    <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-lg text-[12px]" style={{ background: "var(--gradient-gold)" }}>{o.emoji}</span>
                    <span className="min-w-0 flex-1 truncate text-left">{o.label}</span>
                  </button>
                ); })}
              </div>
            </div>
            {/* Rest & calm (no header, no intro) */}
            <div className="space-y-2">
              <div className="grid grid-cols-2 gap-1.5">
                {REST_CALM.map((o) => { const on = everyday.includes(o.id); return (
                  <button key={o.id} onClick={() => togIn("everyday", o.id)} className={`lf-chip flex items-center gap-1.5 rounded-xl py-1.5 pl-1.5 pr-2 text-[11.5px] font-semibold ring-1 ${on ? "bg-primary/10 ring-primary" : "bg-card text-foreground/85 ring-border/60"}`}>
                    <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-lg text-[12px]" style={{ background: "var(--gradient-violet)" }}>{o.emoji}</span>
                    <span className="min-w-0 flex-1 truncate text-left">{o.label}</span>
                  </button>
                ); })}
              </div>
            </div>
          </div>
        )}

        {/* WOMEN — life stages (women only) */}
        {key === "women" && (
          <div className="space-y-3">
            <p className="px-1 text-[12px] leading-snug text-muted-foreground">Select if anything below applies to you.</p>
            <div className="grid grid-cols-2 gap-1.5">
              {WOMEN_ITEMS.map((o) => { const on = women.includes(o.id); return (
                <button key={o.id} onClick={() => togIn("women", o.id)} className={`lf-chip flex items-center gap-1.5 rounded-xl py-1.5 pl-1.5 pr-2 text-[11.5px] font-semibold ring-1 ${on ? "bg-primary/10 ring-primary" : "bg-card text-foreground/85 ring-border/60"}`}>
                  <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-lg text-[12px]" style={{ background: "var(--gradient-violet)" }}>{o.emoji}</span>
                  <span className="min-w-0 flex-1 truncate text-left">{o.label}</span>
                </button>
              ); })}
            </div>
          </div>
        )}

        {/* FITNESS GOALS — pick just 1 */}
        {key === "fitness" && (
          <div className="space-y-3">
            {conds.length >= 2
              ? <p className="rounded-2xl bg-primary/10 px-3 py-2.5 text-[11px] leading-snug text-foreground/85 ring-1 ring-primary/20">With the health conditions you're already managing, you'll naturally <b>lose some weight</b> along the way. If you'd still like a fitness goal as a <b>top priority</b>, pick <b>one</b> below.</p>
              : <p className="px-1 text-[12px] leading-snug text-muted-foreground">Pick <b className="text-foreground">any 1</b> — optional.</p>}
            <div className="grid grid-cols-2 gap-1.5">
              {FITNESS_GOALS.map((gg) => { const on = chosen.includes(gg.id); return (
                <button key={gg.id} onClick={() => togCap("chosenGoals", gg.id, 1)} className={`lf-chip flex items-center gap-1.5 rounded-xl py-1.5 pl-1.5 pr-2 text-[11.5px] font-semibold ring-1 ${on ? "bg-primary/10 ring-primary" : "bg-card text-foreground/85 ring-border/60"}`}>
                  <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-lg text-[12px]" style={{ background: "var(--gradient-gold)" }}>{gg.emoji}</span>
                  <span className="min-w-0 flex-1 truncate text-left">{gg.label}</span>
                </button>
              ); })}
            </div>
          </div>
        )}

        {/* GOALS — recommendation + pick */}
        {key === "goals" && (
          <div className="space-y-3">
            {tdee && (
              <div className="lf-hero flex items-baseline gap-2 rounded-2xl px-3.5 py-2.5 text-primary-foreground shadow-[var(--shadow-glow)]" style={{ background: "var(--gradient-violet)" }}>
                <p className="text-[10.5px] font-bold uppercase tracking-wide opacity-90">Daily calories</p>
                <p className="font-display text-[16px] font-extrabold leading-none tracking-tight">≈ <CountUp to={tdee} /> <span className="text-[11px] font-bold opacity-80">kcal</span></p>
              </div>
            )}
            {conflicts.length > 0 && (
              <div className="space-y-1.5">
                {conflicts.map((cf, i) => (
                  <div key={i} className={`rounded-2xl p-3 text-[11.5px] leading-snug ring-1 ${cf.action === "block" ? "bg-red-50 text-red-800 ring-red-200 dark:bg-red-900/20 dark:text-red-300 dark:ring-red-800/60" : "bg-amber-50 text-amber-800 ring-amber-200 dark:bg-amber-900/20 dark:text-amber-300 dark:ring-amber-800/60"}`}>
                    <b>{cf.action === "block" ? "Heads up — " : "Note — "}</b>{cf.note}
                  </div>
                ))}
              </div>
            )}
            {allCands.length > 0 ? (
              <>
                <div className="rounded-2xl bg-card p-3.5 ring-1 ring-border/60">
                  <p className="font-display text-[14px] font-bold text-foreground">Health focus</p>
                  <p className="mt-2 px-0.5 text-[10px] font-bold uppercase tracking-wide text-primary">Primary focus <span className="font-semibold normal-case tracking-normal text-primary/70">(up to 2)</span></p>
                  <div className="mt-1 flex flex-wrap gap-1.5">
                    {allCands.filter((cc) => topIds.has(cc.id)).map((cc) => <button key={cc.id} onClick={() => toggleFocus(cc.id)} className="lf-chip rounded-full bg-primary px-3 py-1.5 text-[12px] font-semibold text-primary-foreground">{cc.label}</button>)}
                  </div>
                  {allCands.some((cc) => !topIds.has(cc.id)) && (
                    <>
                      <p className="mt-2.5 px-0.5 text-[10px] font-bold uppercase tracking-wide text-muted-foreground">Also covered <span className="font-semibold normal-case tracking-normal text-muted-foreground/60">· tap to mark as primary</span></p>
                      <div className="mt-1 flex flex-wrap gap-1.5">
                        {allCands.filter((cc) => !topIds.has(cc.id)).map((cc) => <button key={cc.id} onClick={() => toggleFocus(cc.id)} className="lf-chip rounded-full bg-secondary px-3 py-1.5 text-[12px] font-semibold text-foreground/65">{cc.label}</button>)}
                      </div>
                    </>
                  )}
                  {wizard && chosen.length > 0 && (
                    <>
                      <p className="mt-3 font-display text-[14px] font-bold text-foreground">Fitness focus</p>
                      <div className="mt-1 flex flex-wrap gap-1.5">
                        {chosen.map((id) => { const f = FITNESS_GOALS.find((x) => x.id === id); return <span key={id} className="rounded-full bg-primary px-3 py-1.5 text-[12px] font-semibold text-primary-foreground">{f?.emoji} {f?.label ?? id}</span>; })}
                      </div>
                    </>
                  )}
                  {wizard && everyday.length > 0 && <p className="mt-2.5 text-[10.5px] leading-snug text-muted-foreground">Also caring for: {everyday.map((id) => EVERYDAY_ITEMS.find((e) => e.id === id)?.label ?? id).join(" · ")}.</p>}
                  {metabolicWeightNote && <p className="mt-2.5 text-[10.5px] leading-snug text-primary/80">💪 As your health improves, you'll naturally <b>lose some weight</b> along the way too.</p>}
                </div>
                {habitSuggestions.length > 0 && <p className="px-1 text-[10.5px] leading-snug text-muted-foreground">We'll also nudge your habits: {habitSuggestions.slice(0, 3).map((h) => h.t).join(" · ")}.</p>}
              </>
            ) : (
              <div className="rounded-2xl bg-card p-3.5 ring-1 ring-border/60">
                <p className="text-[12.5px] font-bold text-foreground">Small changes, big wins ✨</p>
                <p className="mt-1 text-[12px] text-muted-foreground">Pick a couple of goals below and we'll build the right yoga, meditation &amp; diet for you.</p>
                {habitSuggestions.length > 0 && <ul className="mt-1.5 list-disc space-y-0.5 pl-4 text-[11.5px] text-foreground/85">{habitSuggestions.slice(0, 4).map((h) => <li key={h.id}>{h.t}</li>)}</ul>}
              </div>
            )}

            {/* add another focus area — only in the short start=conditions flow (fitness has its own page in the wizard) */}
            {!wizard && <div>
              <p className="mb-1.5 px-1 text-[11.5px] font-semibold text-muted-foreground">{allCands.length ? "You can also pick 1 fitness goal" : "What would you like to work on?"}</p>
              <div className="flex flex-wrap gap-1.5">
                {FITNESS_GOALS.map((gg) => {
                  if (allCands.some((c) => c.id === gg.id)) return null; // already shown as a focus / secondary
                  const covered = gg.id !== "weight-loss" && gg.id !== "obesity" && activeClusters.has(conditionMeta(gg.id)?.cluster ?? " ");
                  const conflict = resolveConflicts([gg.id], focusCtx).length > 0;
                  if (covered) return <span key={gg.id} className="rounded-full bg-secondary/30 px-3 py-1.5 text-[11px] font-semibold text-muted-foreground/50">{gg.emoji} {gg.label} · included</span>;
                  if (conflict) return <span key={gg.id} className="rounded-full bg-secondary/30 px-3 py-1.5 text-[11px] font-semibold text-muted-foreground/40">{gg.emoji} {gg.label} · not suitable</span>;
                  const on = chosen.includes(gg.id);
                  return <button key={gg.id} onClick={() => pickGoal(gg.id)} className={`lf-chip rounded-full px-3 py-1.5 text-[12px] font-semibold ${on ? "bg-primary text-primary-foreground" : "bg-secondary text-foreground/75"}`}>{gg.emoji} {gg.label}</button>;
                })}
              </div>
            </div>}
            <p className="px-1 pt-1 text-[10px] leading-snug text-muted-foreground">Supportive lifestyle guidance — not a substitute for medical care. For any health condition, keep following your doctor's advice.</p>
          </div>
        )}
      </div>

      <div className="fixed inset-x-0 z-30 mx-auto flex max-w-xl justify-center gap-2 px-4" style={{ bottom: "calc(4.5rem + env(safe-area-inset-bottom))" }}>
        {key === "gate"
          ? null
          : key !== "goals"
          ? <button onClick={() => { if (key === "pick-all" && conds.length + prevention.length + women.length + everyday.length + chosen.length === 0) { setNoGoalPopup(true); return; } next(); }} disabled={!canNext} className={`lf-btn mx-auto w-full max-w-[18rem] rounded-2xl px-6 py-2.5 text-sm font-bold shadow-lg ${canNext ? "bg-primary text-primary-foreground" : "bg-secondary text-muted-foreground"}`}>Continue</button>
          : (activeFocus.length || chosen.length || healthIds.length)
            ? <button onClick={buildPlan} className="lf-btn mx-auto w-full max-w-[18rem] rounded-2xl bg-primary px-6 py-2.5 text-sm font-bold text-primary-foreground shadow-lg">Build my plan →</button>
            : <button onClick={save} className="lf-btn mx-auto w-full max-w-[18rem] rounded-2xl bg-primary px-6 py-2.5 text-sm font-bold text-primary-foreground shadow-lg">Save profile</button>}
      </div>

      {noGoalPopup && typeof document !== "undefined" && createPortal(
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/55 p-5" onClick={() => setNoGoalPopup(false)}>
          <div className="w-full max-w-xs rounded-2xl bg-card p-5 text-center shadow-xl" onClick={(e) => e.stopPropagation()}>
            <p className="text-[15px] font-extrabold text-foreground">You haven't selected any goal</p>
            <p className="mt-1.5 text-[12px] leading-snug text-muted-foreground">No problem — we'll take you to the Home page, where you can explore ready-made plans and create your personalized plan later.</p>
            <button onClick={() => { set("planMode", "explore"); persist(); navigate({ to: "/home" }); }} className="mt-4 w-full rounded-2xl bg-primary py-2.5 text-[13px] font-bold text-primary-foreground active:scale-[0.99]">Take me to Home →</button>
            <button onClick={() => setNoGoalPopup(false)} className="mt-2 w-full rounded-2xl bg-secondary py-2.5 text-[13px] font-bold text-foreground/80 active:scale-[0.99]">Still want to select a goal</button>
          </div>
        </div>,
        document.body
      )}
      <BottomNav />
    </div>
  );
}

export const Route = createFileRoute("/lifestyle")({
  validateSearch: (s: Record<string, unknown>): { start?: string; mode?: string; preselect?: string; only?: string } => ({
    start: typeof s.start === "string" ? s.start : undefined,
    mode: typeof s.mode === "string" ? s.mode : undefined,
    preselect: typeof s.preselect === "string" ? s.preselect : undefined,
    only: typeof s.only === "string" ? s.only : undefined,
  }),
  component: LifestylePage,
});
