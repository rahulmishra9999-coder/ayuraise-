// Daily punch-in trackers for the dashboard: water, steps, mood, sleep + vitals (sugar/BP).
// One record per day for counters; an append-only list for vitals readings.

export interface DayLog {
  water?: number;      // glasses
  steps?: number;      // manual punch until native health sync exists
  mood?: string;
  sleepHrs?: number;
  calories?: number;   // punched kcal total for the day
  screenHrs?: number;  // manual screen-time punch
  ateOut?: boolean;    // chose to eat outside the plan today
}

export interface VitalsEntry {
  date: string;                 // yyyy-mm-dd
  time: string;                 // HH:mm
  kind: "sugar" | "bp";
  sugar?: number;               // mg/dL
  sugarType?: "fasting" | "post-meal" | "random";
  sys?: number;                 // mmHg
  dia?: number;
}

export interface TrackerTargets {
  waterGlasses: number;
  steps: number;
}

const DAYS_KEY = "ayuraise.trackers.days";
const VITALS_KEY = "ayuraise.trackers.vitals";
const TARGETS_KEY = "ayuraise.trackers.targets";

export const DEFAULT_TARGETS: TrackerTargets = { waterGlasses: 10, steps: 8000 };

export function todayKey(): string {
  return new Date().toISOString().slice(0, 10);
}

function read<T>(key: string, fb: T): T {
  if (typeof window === "undefined") return fb;
  try { const r = window.localStorage.getItem(key); return r ? (JSON.parse(r) as T) : fb; } catch { return fb; }
}
function write(key: string, v: unknown) {
  if (typeof window === "undefined") return;
  try { window.localStorage.setItem(key, JSON.stringify(v)); } catch {}
  emitChange();
}

/** Cross-component sync: any tracker mutation fires this so cards re-read live. */
export function emitChange() {
  if (typeof window !== "undefined") window.dispatchEvent(new Event("ayu:change"));
}

/* ---- day logs ---- */

export function loadDay(date = todayKey()): DayLog {
  return read<Record<string, DayLog>>(DAYS_KEY, {})[date] ?? {};
}

export function patchDay(patch: Partial<DayLog>, date = todayKey()): DayLog {
  const all = read<Record<string, DayLog>>(DAYS_KEY, {});
  const next = { ...(all[date] ?? {}), ...patch };
  all[date] = next;
  write(DAYS_KEY, all);
  return next;
}

export function loadDays(): Record<string, DayLog> {
  return read<Record<string, DayLog>>(DAYS_KEY, {});
}

/* ---- targets ---- */

export function loadTargets(): TrackerTargets {
  return { ...DEFAULT_TARGETS, ...read<Partial<TrackerTargets>>(TARGETS_KEY, {}) };
}

export function saveTargets(patch: Partial<TrackerTargets>): TrackerTargets {
  const next = { ...loadTargets(), ...patch };
  write(TARGETS_KEY, next);
  return next;
}

/* ---- vitals ---- */

export function loadVitals(): VitalsEntry[] {
  return read<VitalsEntry[]>(VITALS_KEY, []);
}

export function addVitals(entry: Omit<VitalsEntry, "date" | "time"> & { date?: string; time?: string }): VitalsEntry[] {
  const now = new Date();
  const full: VitalsEntry = {
    date: entry.date ?? todayKey(),
    time: entry.time ?? `${String(now.getHours()).padStart(2, "0")}:${String(now.getMinutes()).padStart(2, "0")}`,
    kind: entry.kind,
    sugar: entry.sugar,
    sugarType: entry.sugarType,
    sys: entry.sys,
    dia: entry.dia,
  };
  const all = [...loadVitals(), full]
    .sort((a, b) => `${a.date} ${a.time}`.localeCompare(`${b.date} ${b.time}`)) // backdated punches slot into place
    .slice(-200); // keep the last 200 readings
  write(VITALS_KEY, all);
  return all;
}

export function latestVital(kind: "sugar" | "bp"): VitalsEntry | undefined {
  return [...loadVitals()].reverse().find((v) => v.kind === kind);
}

export function recentVitals(kind: "sugar" | "bp", n = 7): VitalsEntry[] {
  return loadVitals().filter((v) => v.kind === kind).slice(-n);
}

export function vitalsTodayCount(kind: "sugar" | "bp"): number {
  const today = todayKey();
  return loadVitals().filter((v) => v.kind === kind && v.date === today).length;
}

/** Delete one reading (first exact match). */
export function deleteVital(target: VitalsEntry): VitalsEntry[] {
  const all = loadVitals();
  const idx = all.findIndex(
    (v) => v.kind === target.kind && v.date === target.date && v.time === target.time &&
           v.sugar === target.sugar && v.sys === target.sys && v.dia === target.dia,
  );
  if (idx >= 0) all.splice(idx, 1);
  write(VITALS_KEY, all);
  return all;
}

/* ---- clinical range bands (for colour-coding, not diagnosis) ---- */

export type RangeBand = "good" | "borderline" | "high" | "severe";

export function sugarBand(v: number, type: VitalsEntry["sugarType"]): RangeBand {
  if (type === "fasting") {
    if (v < 100) return "good";
    if (v < 126) return "borderline";
    if (v < 180) return "high";
    return "severe";
  }
  // post-meal & random
  if (v < 140) return "good";
  if (v < 200) return "borderline";
  if (v < 250) return "high";
  return "severe";
}

export function bpBand(sys: number, dia: number): RangeBand {
  if (sys >= 160 || dia >= 100) return "severe";
  if (sys >= 140 || dia >= 90) return "high";
  if (sys >= 120 || dia >= 80) return "borderline";
  return "good";
}

export function vitalBand(v: VitalsEntry): RangeBand {
  return v.kind === "sugar" ? sugarBand(v.sugar!, v.sugarType) : bpBand(v.sys!, v.dia!);
}

/* ---- punch reminders (per tracker) ---- */

export interface ReminderCfg {
  channel: "off" | "inapp" | "wa";
  freq: "daily" | "weekly" | "custom";
  weekdays: number[];   // 0=Sun … 6=Sat
  dates: string[];      // specific yyyy-mm-dd picks from the calendar
  time?: string;        // remind at this time (daily/weekly/custom)
  intervalHrs?: number; // water-style: every N hours…
  windowStart?: string; // …between these times
  windowEnd?: string;
}

const REMINDERS_KEY = "ayuraise.trackers.reminders";

const DEFAULT_REMINDER: ReminderCfg = { channel: "off", freq: "daily", weekdays: [], dates: [] };

export function loadReminder(key: string): ReminderCfg {
  const all = read<Record<string, ReminderCfg>>(REMINDERS_KEY, {});
  return { ...DEFAULT_REMINDER, ...(all[key] ?? {}) };
}

export function saveReminder(key: string, cfg: ReminderCfg): ReminderCfg {
  const all = read<Record<string, ReminderCfg>>(REMINDERS_KEY, {});
  all[key] = cfg;
  write(REMINDERS_KEY, all);
  return cfg;
}

export function reminderSummary(cfg: ReminderCfg): string {
  if (cfg.channel === "off") return "Off";
  const ch = cfg.channel === "wa" ? "WhatsApp" : "In-app";
  if (cfg.intervalHrs) return `${ch} · every ${cfg.intervalHrs}h, ${cfg.windowStart ?? "10:00"}–${cfg.windowEnd ?? "22:00"}`;
  const at = cfg.time ? ` at ${cfg.time}` : "";
  if (cfg.freq === "daily") return `${ch} · daily${at}`;
  if (cfg.freq === "weekly") return `${ch} · ${cfg.weekdays.length || 1} day/wk${at}`;
  const n = cfg.weekdays.length + cfg.dates.length;
  return `${ch} · ${n ? `${n} picked` : "custom"}${at}`;
}

/* ---- reminder-only entries (medicine, doctor visits, anything named) ---- */

export interface CustomReminder { id: string; emoji: string; label: string; cfg: ReminderCfg }

const CUSTOM_KEY = "ayuraise.trackers.customReminders";

export function loadCustomReminders(): CustomReminder[] {
  return read<CustomReminder[]>(CUSTOM_KEY, []);
}

export function saveCustomReminder(r: CustomReminder): CustomReminder[] {
  const all = loadCustomReminders().filter((x) => x.id !== r.id);
  all.push(r);
  write(CUSTOM_KEY, all);
  return all;
}

export function deleteCustomReminder(id: string): CustomReminder[] {
  const all = loadCustomReminders().filter((x) => x.id !== id);
  write(CUSTOM_KEY, all);
  return all;
}

/* ---- medicines (multiple, each with its own times + reminders + daily taken-tick) ---- */

export interface Medicine {
  id: string;
  name: string;
  times: string[];                 // ["08:00","21:00"]
  channel: "off" | "inapp" | "wa"; // reminder channel
}

const MEDS_KEY = "ayuraise.medicines";
const MED_TAKEN_KEY = "ayuraise.medTaken"; // Record<date, Record<medId, boolean>>

export function loadMedicines(): Medicine[] { return read<Medicine[]>(MEDS_KEY, []); }
export function saveMedicines(list: Medicine[]) { write(MEDS_KEY, list); }
export function upsertMedicine(m: Medicine): Medicine[] {
  const list = loadMedicines().filter((x) => x.id !== m.id);
  list.push(m);
  saveMedicines(list);
  return list;
}
export function deleteMedicine(id: string): Medicine[] {
  const list = loadMedicines().filter((x) => x.id !== id);
  saveMedicines(list);
  return list;
}
export function loadMedTaken(date = todayKey()): Record<string, boolean> {
  return read<Record<string, Record<string, boolean>>>(MED_TAKEN_KEY, {})[date] ?? {};
}
export function setMedTaken(id: string, taken: boolean, date = todayKey()): Record<string, boolean> {
  const all = read<Record<string, Record<string, boolean>>>(MED_TAKEN_KEY, {});
  const day = { ...(all[date] ?? {}), [id]: taken };
  all[date] = day;
  write(MED_TAKEN_KEY, all);
  return day;
}

/* ---- vacation / recovery plan history (kept when the user restores their real plan) ---- */

const VACATION_HIST_KEY = "ayuraise.vacationHistory";
export function loadVacationHistory(): VacationPlan[] { return read<VacationPlan[]>(VACATION_HIST_KEY, []); }
export function archiveVacationPlan(p: VacationPlan) {
  const all = [...loadVacationHistory(), p].slice(-20);
  write(VACATION_HIST_KEY, all);
}

/* ---- which vitals tiles the user tracks ---- */

/* ---- dashboard section visibility (user can hide sections they don't want) ---- */
const HIDDEN_KEY = "ayuraise.dashboard.hidden";
export function loadHiddenSections(): string[] { return read<string[]>(HIDDEN_KEY, []); }
export function toggleSection(id: string): string[] {
  const cur = loadHiddenSections();
  const next = cur.includes(id) ? cur.filter((x) => x !== id) : [...cur, id];
  write(HIDDEN_KEY, next);
  return next;
}

export interface EnabledTrackers { sugar: boolean; bp: boolean; sleep: boolean; screen: boolean }

const ENABLED_KEY = "ayuraise.trackers.enabled";
const DEFAULT_ENABLED: EnabledTrackers = { sugar: true, bp: true, sleep: false, screen: false };

export function loadEnabled(): EnabledTrackers {
  return { ...DEFAULT_ENABLED, ...read<Partial<EnabledTrackers>>(ENABLED_KEY, {}) };
}

export function saveEnabled(patch: Partial<EnabledTrackers>): EnabledTrackers {
  const next = { ...loadEnabled(), ...patch };
  write(ENABLED_KEY, next);
  return next;
}

/* ---- Today's Tasks: done-state, custom checklist items, meal swaps ---- */

export interface CustomTask { id: string; label: string }

const TASKS_DONE_KEY = "ayuraise.trackers.tasksDone";     // Record<date, Record<taskId, boolean>>
const CUSTOM_TASKS_KEY = "ayuraise.trackers.customTasks"; // CustomTask[]
const MEAL_SWAP_KEY = "ayuraise.trackers.mealSwaps";      // Record<date, Record<slot, sourceDay>>

export function loadTasksDone(date = todayKey()): Record<string, boolean> {
  return read<Record<string, Record<string, boolean>>>(TASKS_DONE_KEY, {})[date] ?? {};
}

export function setTaskDone(id: string, done: boolean, date = todayKey()): Record<string, boolean> {
  const all = read<Record<string, Record<string, boolean>>>(TASKS_DONE_KEY, {});
  const day = { ...(all[date] ?? {}), [id]: done };
  all[date] = day;
  write(TASKS_DONE_KEY, all);
  return day;
}

export function loadCustomTasks(): CustomTask[] {
  return read<CustomTask[]>(CUSTOM_TASKS_KEY, []);
}

export function addCustomTask(label: string): CustomTask[] {
  const all = [...loadCustomTasks(), { id: `ct_${Date.now().toString(36)}`, label }];
  write(CUSTOM_TASKS_KEY, all);
  return all;
}

export function deleteCustomTask(id: string): CustomTask[] {
  const all = loadCustomTasks().filter((t) => t.id !== id);
  write(CUSTOM_TASKS_KEY, all);
  return all;
}

/** Which day's meal is standing in for a slot today (user swapped it). */
export function loadMealSwaps(date = todayKey()): Record<string, string> {
  return read<Record<string, Record<string, string>>>(MEAL_SWAP_KEY, {})[date] ?? {};
}

export function setMealSwap(slot: string, sourceDay: string, date = todayKey()): Record<string, string> {
  const all = read<Record<string, Record<string, string>>>(MEAL_SWAP_KEY, {});
  const day = { ...(all[date] ?? {}), [slot]: sourceDay };
  all[date] = day;
  write(MEAL_SWAP_KEY, all);
  return day;
}

/** Bot-redefined meal text overriding the plan's meal for a slot on a date. */
const MEAL_OVERRIDE_KEY = "ayuraise.mealOverrides";
export function loadMealOverrides(date = todayKey()): Record<string, string> {
  return read<Record<string, Record<string, string>>>(MEAL_OVERRIDE_KEY, {})[date] ?? {};
}
export function setMealOverride(slot: string, text: string, date = todayKey()): Record<string, string> {
  const all = read<Record<string, Record<string, string>>>(MEAL_OVERRIDE_KEY, {});
  const day = { ...(all[date] ?? {}), [slot]: text };
  all[date] = day;
  write(MEAL_OVERRIDE_KEY, all);
  return day;
}

/** Rough kcal by meal slot — used when the user ticks "eaten" and we auto-punch. */
export function mealSlotKcal(slot: string): number {
  const s = slot.toLowerCase();
  if (s.includes("break")) return 350;
  if (s.includes("lunch")) return 500;
  if (s.includes("dinner")) return 400;
  if (s.includes("mini") || s.includes("snack")) return 150;
  return 300;
}

/** Curated Indian-veg alternatives the "swap" uses (stand-in until the live bot redefines). */
export const MEAL_ALTS: Record<string, string[]> = {
  breakfast: ["Moong dal chilla + curd", "Veg poha + peanuts", "Besan cheela + mint chutney", "Vegetable dalia + nuts", "Idli + sambar", "Ragi dosa + chutney"],
  lunch: ["2 phulka + dal + sabzi + salad", "Rajma + rice + salad", "Veg pulao + raita", "Chole + 1 roti + salad", "Curd rice + veg poriyal"],
  dinner: ["Veg soup + stir-fried veg", "Moong khichdi + curd", "Roasted paneer + 1 phulka", "Dal + sautéed greens", "Vegetable dalia + chaas"],
  snack: ["Roasted chana", "Fruit + 4 almonds", "Sprouts chaat", "Chaas + makhana", "1 guava + peanuts"],
};
export function altsForSlot(slot: string): string[] {
  const s = slot.toLowerCase();
  if (s.includes("break")) return MEAL_ALTS.breakfast;
  if (s.includes("lunch")) return MEAL_ALTS.lunch;
  if (s.includes("dinner")) return MEAL_ALTS.dinner;
  return MEAL_ALTS.snack;
}

/* ================= Calories: cal-in (food) + cal-out (activity) ================= */

export interface CalEntry {
  id: string;
  kind: "in" | "out";
  label: string;     // "Breakfast", "Mopping 20 min"…
  slot?: string;     // meal slot for cal-in
  kcal: number;
  minutes?: number;  // for activities
  src?: string;      // links back to a task/meal id (bidirectional tick ↔ calorie)
}

/** Find today's cal entry created by a given task/meal id. */
export function calEntryForSrc(src: string, date = todayKey()): CalEntry | undefined {
  return loadCalEntries(date).find((e) => e.src === src);
}

const CAL_KEY = "ayuraise.cal.entries"; // Record<date, CalEntry[]>

export function loadCalEntries(date = todayKey()): CalEntry[] {
  return read<Record<string, CalEntry[]>>(CAL_KEY, {})[date] ?? [];
}

export function addCalEntry(e: Omit<CalEntry, "id">, date = todayKey()): CalEntry[] {
  const all = read<Record<string, CalEntry[]>>(CAL_KEY, {});
  const day = [...(all[date] ?? []), { ...e, id: `cal_${Date.now().toString(36)}${Math.random().toString(36).slice(2, 5)}` }];
  all[date] = day;
  write(CAL_KEY, all);
  return day;
}

export function deleteCalEntry(id: string, date = todayKey()): CalEntry[] {
  const all = read<Record<string, CalEntry[]>>(CAL_KEY, {});
  all[date] = (all[date] ?? []).filter((e) => e.id !== id);
  write(CAL_KEY, all);
  return all[date];
}

export function calInTotal(date = todayKey()): number {
  return loadCalEntries(date).filter((e) => e.kind === "in").reduce((a, e) => a + e.kcal, 0);
}

export function calOutManual(date = todayKey()): number {
  return loadCalEntries(date).filter((e) => e.kind === "out").reduce((a, e) => a + e.kcal, 0);
}

export const MEAL_SLOTS = ["Breakfast", "Mini-meal", "Lunch", "Snack", "Dinner", "Whole day"] as const;

/** kcal/min = MET × 3.5 × kg / 200. */
export function kcalFor(met: number, minutes: number, weightKg: number): number {
  return Math.round((met * 3.5 * weightKg / 200) * minutes);
}

/** Household & daily chores with MET values — energy people never count. */
export const CHORES: { label: string; emoji: string; met: number }[] = [
  { label: "Mopping (pocha)", emoji: "🧽", met: 3.5 },
  { label: "Sweeping (jhadu)", emoji: "🧹", met: 3.3 },
  { label: "Cooking", emoji: "🍳", met: 2.5 },
  { label: "Washing clothes (hand)", emoji: "👕", met: 3.3 },
  { label: "Washing utensils", emoji: "🍽️", met: 2.5 },
  { label: "Dusting / tidying", emoji: "🪑", met: 2.5 },
  { label: "Gardening", emoji: "🪴", met: 3.8 },
  { label: "Climbing stairs", emoji: "🪜", met: 4.0 },
  { label: "Playing with kids", emoji: "🧒", met: 3.5 },
  { label: "Grocery / errands", emoji: "🛒", met: 2.5 },
];

/** Steps → kcal, scaled by body weight (baseline 68 kg). */
export function stepsKcal(steps: number, weightKg = 68): number {
  return Math.round(steps * 0.04 * (weightKg / 68));
}

/** Last sleep punch across days (today first). */
export function latestSleep(): { date: string; hrs: number } | undefined {
  const days = read<Record<string, DayLog>>(DAYS_KEY, {});
  const dates = Object.keys(days).sort().reverse();
  for (const d of dates) {
    const h = days[d]?.sleepHrs;
    if (typeof h === "number") return { date: d, hrs: h };
  }
  return undefined;
}

export function latestScreen(): { date: string; hrs: number } | undefined {
  const days = read<Record<string, DayLog>>(DAYS_KEY, {});
  const dates = Object.keys(days).sort().reverse();
  for (const d of dates) {
    const h = days[d]?.screenHrs;
    if (typeof h === "number") return { date: d, hrs: h };
  }
  return undefined;
}

export function loadAllTasksDone(): Record<string, Record<string, boolean>> {
  return read<Record<string, Record<string, boolean>>>(TASKS_DONE_KEY, {});
}

/* ================= Intermittent-fasting live state ================= */

export interface IFConfig {
  fastStart: string;  // "19:00" — when the daily fast begins (after dinner)
  fastHours: number;  // 14 → eating opens at 09:00 next day
  perDay?: (number | null)[]; // Mon..Sun override hours; null = rest (no fast) that day
}

/** Today's fast length, honouring any per-day override (null = rest day). */
export function fastHoursToday(cfg = loadIFConfig(), now = new Date()): number | null {
  if (!cfg.perDay) return cfg.fastHours;
  const idx = (now.getDay() + 6) % 7; // Mon=0
  const v = cfg.perDay[idx];
  return v === undefined ? cfg.fastHours : v;
}

export interface IFSession {
  date: string;        // day the fast ENDED
  plannedHrs: number;
  actualHrs: number;
  endedEarly: boolean;
}

const IF_CFG_KEY = "ayuraise.if.config";
const IF_HIST_KEY = "ayuraise.if.history";

export function loadIFConfig(): IFConfig {
  return { fastStart: "19:00", fastHours: 14, ...read<Partial<IFConfig>>(IF_CFG_KEY, {}) };
}

export function saveIFConfig(patch: Partial<IFConfig>): IFConfig {
  const next = { ...loadIFConfig(), ...patch };
  write(IF_CFG_KEY, next);
  return next;
}

export interface IFStatus {
  phase: "fasting" | "eating" | "rest";
  doneHrs: number;     // hours into the current phase
  totalHrs: number;    // length of the current phase
  endsAt: string;      // "09:00" style
  beginDate: string;   // date the current fast began (identity for manual end)
  hoursToday: number;  // the fast length in effect today
}

const IF_OVERRIDE_KEY = "ayuraise.if.overrideStart";
/** Ad-hoc fast start (ISO). Set when the user taps "start the fast again" — timer runs from then. */
export function loadFastOverride(): string | null { return read<string | null>(IF_OVERRIDE_KEY, null); }
export function setFastOverride(iso: string | null) { write(IF_OVERRIDE_KEY, iso); }

export function ifStatus(cfg = loadIFConfig(), now = new Date()): IFStatus {
  const ov = loadFastOverride();
  const hoursToday = ov ? cfg.fastHours : fastHoursToday(cfg, now);
  // rest day (per-day override set to null) — no fast scheduled
  if (hoursToday === null) {
    return { phase: "rest", doneHrs: 0, totalHrs: 0, endsAt: cfg.fastStart, beginDate: now.toISOString().slice(0, 10), hoursToday: 0 };
  }
  let fastBegin: Date;
  if (ov) {
    fastBegin = new Date(ov);
  } else {
    const [sh, sm] = cfg.fastStart.split(":").map(Number);
    const startToday = new Date(now); startToday.setHours(sh, sm, 0, 0);
    fastBegin = now >= startToday ? startToday : new Date(startToday.getTime() - 86400000);
  }
  const fastEnd = new Date(fastBegin.getTime() + hoursToday * 3600000);
  const fmt = (d: Date) => `${String(d.getHours()).padStart(2, "0")}:${String(d.getMinutes()).padStart(2, "0")}`;
  const beginDate = fastBegin.toISOString().slice(0, 10);
  const endedEarly = !ov && fastEndedOn() === beginDate; // an ad-hoc restart supersedes an end mark
  if (now < fastEnd && !endedEarly) {
    return { phase: "fasting", doneHrs: (now.getTime() - fastBegin.getTime()) / 3600000, totalHrs: hoursToday, endsAt: fmt(fastEnd), beginDate, hoursToday };
  }
  const eatHrs = 24 - hoursToday;
  return { phase: "eating", doneHrs: Math.max(0, (now.getTime() - fastEnd.getTime()) / 3600000), totalHrs: eatHrs, endsAt: cfg.fastStart, beginDate, hoursToday };
}

const IF_END_KEY = "ayuraise.if.endedOn";
export function markFastEnded(beginDate: string) { write(IF_END_KEY, beginDate); }
export function fastEndedOn(): string | null { return read<string | null>(IF_END_KEY, null); }

const IF_AUTOLOG_KEY = "ayuraise.if.autolog";
/** When a fast completes naturally (user never ended it manually), log it as completed. */
export function maybeAutoLogFast(beginDate: string, endDate: string, cfg: IFConfig, phase: string) {
  if (phase !== "eating") return;
  if (fastEndedOn() === beginDate) return;               // already logged via manual end
  if (read<string | null>(IF_AUTOLOG_KEY, null) === beginDate) return; // already auto-logged
  addIFSession({ date: endDate, plannedHrs: cfg.fastHours, actualHrs: cfg.fastHours, endedEarly: false });
  write(IF_AUTOLOG_KEY, beginDate);
}

export function loadIFHistory(): IFSession[] {
  return read<IFSession[]>(IF_HIST_KEY, []);
}

export function addIFSession(s: IFSession): IFSession[] {
  const all = [...loadIFHistory().filter((x) => x.date !== s.date), s].slice(-60);
  write(IF_HIST_KEY, all);
  return all;
}

/* ================= Pause & travel mode ================= */

export interface PauseState {
  active: boolean;
  reason: "sick" | "travel" | "other";
  note?: string;
  from: string;   // yyyy-mm-dd
  until?: string; // inclusive; empty = until resumed
}

const PAUSE_KEY = "ayuraise.pause";

export function loadPause(): PauseState | null {
  return read<PauseState | null>(PAUSE_KEY, null);
}

export function savePause(p: PauseState) { write(PAUSE_KEY, p); }

export function clearPause() {
  const vp = loadVacationPlan();
  if (vp && vp.items.length > 0) archiveVacationPlan(vp); // keep the interim plan in history
  write(PAUSE_KEY, null);
  clearVacationPlan();
}

/** A light plan the bot builds for the pause period — shown on the dashboard instead of regular plans. */
export interface VacationPlan {
  createdAt: number;
  reason: string;
  items: { emoji: string; label: string }[];
}

const VACATION_KEY = "ayuraise.vacationPlan";

export function loadVacationPlan(): VacationPlan | null { return read<VacationPlan | null>(VACATION_KEY, null); }
export function saveVacationPlan(p: VacationPlan) { write(VACATION_KEY, p); }
export function clearVacationPlan() { write(VACATION_KEY, null); }

/** Default light plans by pause reason — used when the user asks us to make one. */
export function defaultVacationItems(reason: string): { emoji: string; label: string }[] {
  if (reason === "sick") return [
    { emoji: "💧", label: "Warm water through the day" },
    { emoji: "🍲", label: "Light khichdi / moong dal when hungry" },
    { emoji: "😴", label: "Rest & sleep — no exercise guilt" },
    { emoji: "🌿", label: "Tulsi-ginger kadha if throat/cold" },
  ];
  if (reason === "travel") return [
    { emoji: "🧘", label: "5-min morning stretch in the room" },
    { emoji: "🥗", label: "Salad or soup first when eating out" },
    { emoji: "🚶", label: "10k steps — sightseeing counts" },
    { emoji: "🥥", label: "Nariyal pani / nimbu-soda over sweet drinks" },
  ];
  return [
    { emoji: "💧", label: "One glass of water punched keeps the thread" },
    { emoji: "🚶", label: "A short walk whenever you can" },
    { emoji: "🧘", label: "3 deep breaths before meals" },
  ];
}

/** Active right now? (handles advance travel plans + auto-expiry) */
export function pauseActiveNow(p = loadPause()): boolean {
  if (!p || !p.active) return false;
  const today = todayKey();
  if (p.from > today) return false;         // scheduled for the future
  if (p.until && p.until < today) return false; // expired
  return true;
}
