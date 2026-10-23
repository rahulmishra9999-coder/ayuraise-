// The user's adaptive yoga plans (from the builder) + per-plan progress & reminders.
// localStorage-backed, SSR-safe. Up to 2 active plans (e.g. weight-loss AM + relaxation PM).

export type YogaPlan = {
  id: string;
  primary: string;
  secondary: string | null;
  level: string;
  weeks: number;
  daysPerWeek: number;   // = days.length (kept for the schedule maths)
  days: string[];        // chosen weekday ids, e.g. ["mon","wed","fri"]
  duration: number;      // minutes per session
  protect: string[];     // areas to work around
  updatedAt: number;
  name?: string;         // display name (e.g. "Hatha") — falls back to the goal when absent
  sourceId?: string;     // template id it was started from (pins that program as a favourite)
  variant?: string;      // program-specific note, e.g. "2nd trimester" or "Pranayam + Mudras"
  poseIds?: string[];    // for bundle-based plans — the exact poses to practise
  isPrimary?: boolean;   // the one plan shown on the dashboard
  isFav?: boolean;       // user-marked favourite
  wizard?: Record<string, unknown>; // saved Create-my-plan answers, so the plan can be re-edited
};

export const MAX_PLANS = 3;   // "My Plans" holds up to 3
export function newPlanId() { return `yp_${Date.now().toString(36)}${Math.random().toString(36).slice(2, 6)}`; }

/* ---- weekday schedule (mirrors the exercise builder) ---- */
export const WEEKDAYS: { id: string; label: string; full: string }[] = [
  { id: "mon", label: "Mon", full: "Monday" }, { id: "tue", label: "Tue", full: "Tuesday" },
  { id: "wed", label: "Wed", full: "Wednesday" }, { id: "thu", label: "Thu", full: "Thursday" },
  { id: "fri", label: "Fri", full: "Friday" }, { id: "sat", label: "Sat", full: "Saturday" },
  { id: "sun", label: "Sun", full: "Sunday" },
];
/** Name of the d-th session in a week (1-based), from the plan's chosen weekdays. */
export function dayName(plan: YogaPlan, d: number): string {
  const id = plan.days?.[d - 1];
  return WEEKDAYS.find((w) => w.id === id)?.full ?? `Day ${d}`;
}

const PLANS_KEY = "ayuraise.yogaPlans";
const LEGACY_PLAN_KEY = "ayuraise.yogaPlan";
const PKEY = "ayuraise.yogaProgress";
const RKEY = "ayuraise.yogaReminders";

function normalizePlan(p: YogaPlan): YogaPlan {
  if (!p.id) p.id = newPlanId();
  if (!p.days?.length) p.days = WEEKDAYS.slice(0, p.daysPerWeek || 4).map((w) => w.id);
  p.daysPerWeek = p.days.length;
  return p;
}

/** Load all active plans (0–2). Migrates a legacy single-plan save the first time. */
export function loadYogaPlans(): YogaPlan[] {
  try {
    if (typeof window === "undefined") return [];
    const raw = localStorage.getItem(PLANS_KEY);
    if (raw) return (JSON.parse(raw) as YogaPlan[]).map(normalizePlan).slice(0, MAX_PLANS);
    // migrate legacy single plan (+ its progress/reminders) into the array shape
    const legacy = localStorage.getItem(LEGACY_PLAN_KEY);
    if (!legacy) return [];
    const p = normalizePlan(JSON.parse(legacy) as YogaPlan);
    localStorage.setItem(PLANS_KEY, JSON.stringify([p]));
    const lp = localStorage.getItem(PKEY);
    if (lp) { try { const parsed = JSON.parse(lp); if (parsed && "done" in parsed) localStorage.setItem(PKEY, JSON.stringify({ [p.id]: parsed })); } catch { /* ignore */ } }
    const lr = localStorage.getItem(RKEY);
    if (lr) { try { const parsed = JSON.parse(lr); if (parsed && "times" in parsed) localStorage.setItem(RKEY, JSON.stringify({ [p.id]: parsed })); } catch { /* ignore */ } }
    localStorage.removeItem(LEGACY_PLAN_KEY);
    return [p];
  } catch { return []; }
}

export function saveYogaPlans(plans: YogaPlan[]) {
  try { localStorage.setItem(PLANS_KEY, JSON.stringify(plans.slice(0, MAX_PLANS))); } catch { /* ignore */ }
}
/** Insert or replace a plan by id; returns the new list. */
export function upsertYogaPlan(p: YogaPlan): YogaPlan[] {
  const list = loadYogaPlans();
  const i = list.findIndex((x) => x.id === p.id);
  if (i >= 0) list[i] = p; else list.push(p);
  const next = list.slice(-MAX_PLANS); // keep the most recent MAX_PLANS (so a newly-saved plan is never the one dropped)
  saveYogaPlans(next);
  return next;
}
/** Remove a plan and its progress + reminders. */
export function removeYogaPlan(id: string): YogaPlan[] {
  const next = loadYogaPlans().filter((p) => p.id !== id);
  saveYogaPlans(next);
  const prog = readMap(PKEY); delete prog[id]; writeMap(PKEY, prog);
  const rem = readMap(RKEY); delete rem[id]; writeMap(RKEY, rem);
  return next;
}

/** Mark one plan as the primary (dashboard) plan; clears the flag on the others. */
export function setPrimaryPlan(id: string): YogaPlan[] {
  const next = loadYogaPlans().map((p) => ({ ...p, isPrimary: p.id === id }));
  saveYogaPlans(next);
  return next;
}
/** The primary plan (flagged, else the first, else null). */
export function primaryPlan(): YogaPlan | null {
  const list = loadYogaPlans();
  return list.find((p) => p.isPrimary) ?? list[0] ?? null;
}
export function isBundlePlan(p: YogaPlan) { return !!p.poseIds?.length; }

/* ---- bundles (saved in the pose builder — up to 3; a 4th drops the oldest) ---- */
export const MAX_BUNDLES = 3;
const BUNDLES_KEY = "ayuraise.yogaBundles";
export function loadBundles(): YogaPlan[] {
  try {
    if (typeof window === "undefined") return [];
    const raw = localStorage.getItem(BUNDLES_KEY);
    return raw ? (JSON.parse(raw) as YogaPlan[]).map(normalizePlan) : [];
  } catch { return []; }
}
export function addBundle(p: YogaPlan): YogaPlan[] {
  const next = [p, ...loadBundles()].slice(0, MAX_BUNDLES);   // newest first; a 4th drops the oldest
  try { localStorage.setItem(BUNDLES_KEY, JSON.stringify(next)); } catch { /* ignore */ }
  return next;
}
export function removeBundle(id: string): YogaPlan[] {
  const next = loadBundles().filter((p) => p.id !== id);
  try { localStorage.setItem(BUNDLES_KEY, JSON.stringify(next)); } catch { /* ignore */ }
  return next;
}

/* ---- the arc: each week has a theme + one-line focus, so the journey has a visible shape ---- */
export const WEEK_THEMES = ["Foundations", "Build", "Deepen", "Refine", "Flow", "Integrate", "Strengthen", "Expand", "Sustain", "Master", "Renew", "Flourish"];
export const WEEK_BLURBS = [
  "Learn the core poses and breath — build a steady base.",
  "Add gentle challenge and hold each pose a little longer.",
  "Sink deeper into every posture with cleaner alignment.",
  "Polish your technique and smooth the transitions.",
  "Link poses into one continuous, breathing flow.",
  "Bring strength, flexibility and breath together.",
  "Build stability and staying power in every pose.",
  "Widen your range with fresh variations.",
  "Settle into an easy rhythm you can keep up.",
  "Own the full sequence with quiet confidence.",
  "Restore and rebalance with slower, mindful practice.",
  "Celebrate how far you've come — and keep growing.",
];
export function themeForWeek(w: number): string { return WEEK_THEMES[(w - 1) % WEEK_THEMES.length]; }
export function blurbForWeek(w: number): string { return WEEK_BLURBS[(w - 1) % WEEK_BLURBS.length]; }

/* ---- small map helpers for the per-plan stores ---- */
function readMap<T>(key: string): Record<string, T> {
  try { if (typeof window === "undefined") return {}; const raw = localStorage.getItem(key); return raw ? JSON.parse(raw) : {}; } catch { return {}; }
}
function writeMap<T>(key: string, m: Record<string, T>) { try { localStorage.setItem(key, JSON.stringify(m)); } catch { /* ignore */ } }

/* ---- progress: which sessions are done + light feedback + a per-day count (for the daily cap) ---- */
export type YogaProgress = { done: string[]; feedback: Record<string, string>; daily?: Record<string, number> };
export function dayKey(w: number, d: number) { return `w${w}d${d}`; }
export function sessionKey(i: number) { return `s${i}`; }
/* ---- flat session queue (no weeks in the UI) ---- */
export const DAILY_CAP = 3;      // max sessions a user can open/do in one calendar day
export const BUFFER = 3;         // how many sessions are open at a time
export function totalSessions(plan: YogaPlan) { return Math.max(1, plan.weeks * plan.daysPerWeek); }
export function todayKey() { return new Date().toISOString().slice(0, 10); }
export function doneToday(progress: YogaProgress) { return progress.daily?.[todayKey()] ?? 0; }
/** A session (1-based index) is open when it's within the buffer of what's completed. */
export function isSessionReady(progress: YogaProgress, i: number) { return i <= progress.done.length + BUFFER; }
/** Record a completed session: mark done, log feedback, bump today's count. */
export function completeSession(progress: YogaProgress, i: number, choice: string | null): YogaProgress {
  const key = sessionKey(i);
  const done = progress.done.includes(key) ? progress.done : [...progress.done, key];
  const feedback = choice ? { ...progress.feedback, [key]: choice } : progress.feedback;
  const daily = { ...(progress.daily ?? {}) };
  daily[todayKey()] = (daily[todayKey()] ?? 0) + 1;
  return { done, feedback, daily };
}
export function loadYogaProgress(planId: string): YogaProgress {
  return readMap<YogaProgress>(PKEY)[planId] ?? { done: [], feedback: {} };
}
export function saveYogaProgress(planId: string, p: YogaProgress) {
  const m = readMap<YogaProgress>(PKEY); m[planId] = p; writeMap(PKEY, m);
}
export function resetYogaProgress(planId: string) {
  const m = readMap<YogaProgress>(PKEY); delete m[planId]; writeMap(PKEY, m);
}

/* ---- practice reminders: per-weekday time (24h "HH:MM") + a pause switch, per plan ---- */
export type YogaReminders = { paused: boolean; times: Record<string, string> };
export function loadYogaReminders(planId: string): YogaReminders {
  const r = readMap<YogaReminders>(RKEY)[planId];
  return r ? { paused: !!r.paused, times: r.times ?? {} } : { paused: false, times: {} };
}
export function saveYogaReminders(planId: string, r: YogaReminders) {
  const m = readMap<YogaReminders>(RKEY); m[planId] = r; writeMap(RKEY, m);
}
/** "7:00 AM" from "07:00". */
export function fmtTime(t: string): string {
  const [h, m] = t.split(":").map(Number);
  const ap = h < 12 ? "AM" : "PM";
  return `${((h + 11) % 12) + 1}:${String(m).padStart(2, "0")} ${ap}`;
}
/** Short human summary of the set times, e.g. "Mon, Wed, Fri · 7:00 AM" (or "" when none). */
export function remindersSummary(times: Record<string, string>): string {
  const ids = WEEKDAYS.filter((w) => times[w.id]).map((w) => w.id);
  if (!ids.length) return "";
  const labels = ids.map((id) => WEEKDAYS.find((w) => w.id === id)!.label).join(", ");
  const t = ids.map((id) => times[id]);
  return t.every((x) => x === t[0]) ? `${labels} · ${fmtTime(t[0])}` : `${ids.length} day reminders`;
}

/** Linear session index across the plan (1-based). */
export function dayIndex(plan: YogaPlan, w: number, d: number) { return (w - 1) * plan.daysPerWeek + d; }
/** A day is ready if it's within a 3-session look-ahead of what you've completed. */
export function isDayReady(plan: YogaPlan, progress: YogaProgress, w: number, d: number) {
  return dayIndex(plan, w, d) <= progress.done.length + 3;
}
/** A whole week opens once the previous week is fully done (week 1 always open). */
export function isWeekUnlocked(plan: YogaPlan, progress: YogaProgress, w: number) {
  if (w <= 1) return true;
  for (let d = 1; d <= plan.daysPerWeek; d++) if (!progress.done.includes(dayKey(w - 1, d))) return false;
  return true;
}
