// Meditation content library — recorded audio (guided + soothing music), Calm-style.
// Audio files stream in later; the app models tracks, categories, favourites & resume state.

export type MedCategory =
  | "quick" | "guided" | "less-guided" | "stress" | "work"
  | "sleep" | "anxiety" | "reflection" | "exercises" | "growth";

export const MED_CATEGORIES: { id: MedCategory; label: string; emoji: string }[] = [
  { id: "quick", label: "Quick", emoji: "⚡" },
  { id: "guided", label: "Guided", emoji: "🧘" },
  { id: "less-guided", label: "Less Guided", emoji: "🤫" },
  { id: "stress", label: "Stress", emoji: "🌊" },
  { id: "work", label: "Work", emoji: "💼" },
  { id: "sleep", label: "Sleep", emoji: "🌙" },
  { id: "anxiety", label: "Anxiety", emoji: "🫧" },
  { id: "reflection", label: "Reflection", emoji: "📓" },
  { id: "exercises", label: "Exercises", emoji: "🌬️" },
  { id: "growth", label: "Personal Growth", emoji: "🌱" },
];

export interface MedTrack {
  id: string;
  title: string;
  narrator?: string;
  minutes: number;
  cats: MedCategory[];
  visual: string;    // gradient token or css gradient — the "AI nature scene"
  scene: string;     // emoji scene
  kind: "guided" | "music";
  audioUrl?: string; // wired when real audio is added
}

export const MED_TRACKS: MedTrack[] = [
  // ---- guided ----
  { id: "m-breath3", title: "3-Minute Breathing Space", narrator: "Ayu", minutes: 3, cats: ["quick", "guided", "exercises"], visual: "linear-gradient(135deg,#a7f3d0,#5eead4)", scene: "🌿", kind: "guided" },
  { id: "m-reset", title: "Midday Reset", narrator: "Ayu", minutes: 5, cats: ["quick", "work", "stress"], visual: "linear-gradient(135deg,#bae6fd,#7dd3fc)", scene: "☁️", kind: "guided" },
  { id: "m-bodyscan", title: "Full Body Scan", narrator: "Ayu", minutes: 15, cats: ["guided", "sleep", "stress"], visual: "linear-gradient(135deg,#c7d2fe,#a5b4fc)", scene: "🏔️", kind: "guided" },
  { id: "m-letgo", title: "Letting Go of Tension", narrator: "Ayu", minutes: 10, cats: ["stress", "guided"], visual: "linear-gradient(135deg,#99f6e4,#2dd4bf)", scene: "🌊", kind: "guided" },
  { id: "m-focus", title: "Focus at Work", narrator: "Ayu", minutes: 8, cats: ["work", "guided"], visual: "linear-gradient(135deg,#fde68a,#fbbf24)", scene: "🌅", kind: "guided" },
  { id: "m-calm-anx", title: "Calm the Anxious Mind", narrator: "Ayu", minutes: 12, cats: ["anxiety", "guided", "stress"], visual: "linear-gradient(135deg,#ddd6fe,#c4b5fd)", scene: "🌌", kind: "guided" },
  { id: "m-panic", title: "Ground Yourself Now", narrator: "Ayu", minutes: 5, cats: ["anxiety", "quick"], visual: "linear-gradient(135deg,#bbf7d0,#86efac)", scene: "🍃", kind: "guided" },
  { id: "m-sleep-deep", title: "Drift into Deep Sleep", narrator: "Ayu", minutes: 25, cats: ["sleep", "guided"], visual: "linear-gradient(135deg,#312e81,#4338ca)", scene: "🌙", kind: "guided" },
  { id: "m-sleep-story", title: "A Walk by the River", narrator: "Ayu", minutes: 20, cats: ["sleep", "less-guided"], visual: "linear-gradient(135deg,#1e3a8a,#3730a3)", scene: "🏞️", kind: "guided" },
  { id: "m-gratitude", title: "Evening Gratitude", narrator: "Ayu", minutes: 10, cats: ["reflection", "growth"], visual: "linear-gradient(135deg,#fbcfe8,#f9a8d4)", scene: "🌇", kind: "guided" },
  { id: "m-selfcompassion", title: "Self-Compassion", narrator: "Ayu", minutes: 12, cats: ["growth", "guided", "anxiety"], visual: "linear-gradient(135deg,#fecaca,#fda4af)", scene: "🤍", kind: "guided" },
  { id: "m-silence10", title: "10 Minutes of Silence", minutes: 10, cats: ["less-guided", "exercises"], visual: "linear-gradient(135deg,#e2e8f0,#cbd5e1)", scene: "⚪", kind: "guided" },
  { id: "m-mantra", title: "So-Ham Mantra", narrator: "Ayu", minutes: 15, cats: ["less-guided", "guided", "growth"], visual: "linear-gradient(135deg,#fed7aa,#fdba74)", scene: "🕉️", kind: "guided" },
  { id: "m-478", title: "4-7-8 Calming Breath", narrator: "Ayu", minutes: 4, cats: ["exercises", "quick", "anxiety"], visual: "linear-gradient(135deg,#a5f3fc,#67e8f9)", scene: "🌬️", kind: "guided" },
  { id: "m-boxbreath", title: "Box Breathing", narrator: "Ayu", minutes: 5, cats: ["exercises", "work", "stress"], visual: "linear-gradient(135deg,#bfdbfe,#93c5fd)", scene: "🟦", kind: "guided" },
  { id: "m-morning-intent", title: "Morning Intention", narrator: "Ayu", minutes: 7, cats: ["growth", "reflection", "quick"], visual: "linear-gradient(135deg,#fef08a,#fde047)", scene: "🌅", kind: "guided" },

  // ---- soothing music ----
  { id: "mu-rain", title: "Gentle Rain", minutes: 30, cats: [], visual: "linear-gradient(135deg,#64748b,#475569)", scene: "🌧️", kind: "music" },
  { id: "mu-waterfall", title: "Forest Waterfall", minutes: 45, cats: [], visual: "linear-gradient(135deg,#0e7490,#0891b2)", scene: "🏞️", kind: "music" },
  { id: "mu-wind", title: "Mountain Wind", minutes: 40, cats: [], visual: "linear-gradient(135deg,#94a3b8,#cbd5e1)", scene: "🏔️", kind: "music" },
  { id: "mu-ocean", title: "Ocean Waves", minutes: 60, cats: [], visual: "linear-gradient(135deg,#0891b2,#22d3ee)", scene: "🌊", kind: "music" },
  { id: "mu-tanpura", title: "Tanpura Drone", minutes: 30, cats: [], visual: "linear-gradient(135deg,#b45309,#d97706)", scene: "🎵", kind: "music" },
  { id: "mu-flute", title: "Bansuri Flute", minutes: 25, cats: [], visual: "linear-gradient(135deg,#15803d,#22c55e)", scene: "🪈", kind: "music" },
  { id: "mu-bowls", title: "Singing Bowls", minutes: 35, cats: [], visual: "linear-gradient(135deg,#7c3aed,#a855f7)", scene: "🎐", kind: "music" },
  { id: "mu-night", title: "Night Crickets", minutes: 50, cats: [], visual: "linear-gradient(135deg,#1e293b,#334155)", scene: "🌌", kind: "music" },
];

export function tracksIn(cat: MedCategory): MedTrack[] { return MED_TRACKS.filter((t) => t.cats.includes(cat)); }
export const MUSIC_TRACKS = MED_TRACKS.filter((t) => t.kind === "music");
export function getTrack(id: string): MedTrack | undefined { return MED_TRACKS.find((t) => t.id === id); }

/* ---- favourites + recently played / resume ---- */

const FAV_KEY = "ayuraise.med.favs";
const RECENT_KEY = "ayuraise.med.recent"; // {id, at, posSec, done}[]

function read<T>(key: string, fb: T): T {
  if (typeof window === "undefined") return fb;
  try { const r = window.localStorage.getItem(key); return r ? (JSON.parse(r) as T) : fb; } catch { return fb; }
}
function write(key: string, v: unknown) {
  if (typeof window === "undefined") return;
  try { window.localStorage.setItem(key, JSON.stringify(v)); } catch {}
}

export function loadFavs(): string[] { return read<string[]>(FAV_KEY, []); }
export function isFav(id: string): boolean { return loadFavs().includes(id); }
export function toggleFav(id: string): string[] {
  const cur = loadFavs();
  const next = cur.includes(id) ? cur.filter((x) => x !== id) : [...cur, id];
  write(FAV_KEY, next);
  return next;
}

export interface RecentEntry { id: string; at: number; posSec: number; done: boolean }
export function loadRecent(): RecentEntry[] {
  return read<RecentEntry[]>(RECENT_KEY, []).sort((a, b) => b.at - a.at);
}
export function markPlayed(id: string, posSec: number, done: boolean) {
  const all = read<RecentEntry[]>(RECENT_KEY, []).filter((x) => x.id !== id);
  all.push({ id, at: Date.now(), posSec, done });
  write(RECENT_KEY, all.slice(-40));
}

export const MED_LEARN = [
  { emoji: "🧠", title: "How meditation works", body: "Focused attention thickens the prefrontal cortex (calm, decisions) and shrinks the amygdala's reactivity (fear, stress). You're literally rewiring the brain toward steadiness — 8 weeks is enough to measure it." },
  { emoji: "❤️", title: "The benefits, by the numbers", body: "Regular practice lowers resting blood pressure, cuts anxiety and improves sleep onset. Even 10 minutes a day improves focus and emotional regulation within a few weeks." },
  { emoji: "🔬", title: "What the research says", body: "Randomised trials show mindfulness rivals medication for mild-to-moderate anxiety and depression as an adjunct, and MRI studies confirm structural brain changes. It's one of the most-studied wellbeing practices in modern science." },
];
