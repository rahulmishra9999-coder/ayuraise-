// Multi-profile support. Each profile is a full snapshot of the onboarding
// data (name, age, gender, height, weight, location, activity, prakriti, etc.).
// The "active" profile is mirrored to the legacy `ayuraise.profile` key so the
// rest of the app continues to work without changes.

export type ProfileRecord = {
  id: string;
  name?: string;
  age?: number;
  gender?: "male" | "female" | "other";
  heightCm?: number;
  weightKg?: number;
  location?: string;
  activity?: string;
  bmr?: number;
  tdee?: number;
  prakriti?: { dosha: string; score: Record<string, number> } | null;
  onboardedAt?: string;
  createdAt?: number;
};

const LIST_KEY = "ayuraise.profiles";
const ACTIVE_KEY = "ayuraise.activeProfileId";
const MIRROR_KEY = "ayuraise.profile";

function ssr() { return typeof window === "undefined"; }

function read<T>(key: string, fallback: T): T {
  if (ssr()) return fallback;
  try {
    const raw = localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch { return fallback; }
}
function write(key: string, value: unknown) {
  if (ssr()) return;
  localStorage.setItem(key, JSON.stringify(value));
}

export function listProfiles(): ProfileRecord[] {
  return read<ProfileRecord[]>(LIST_KEY, []);
}

export function getActiveProfileId(): string | null {
  if (ssr()) return null;
  return localStorage.getItem(ACTIVE_KEY);
}

export function getActiveProfile(): ProfileRecord | null {
  const id = getActiveProfileId();
  if (!id) return null;
  return listProfiles().find((p) => p.id === id) ?? null;
}

function mirrorActive(profile: ProfileRecord) {
  write(MIRROR_KEY, profile);
}

export function setActiveProfileId(id: string) {
  if (ssr()) return;
  localStorage.setItem(ACTIVE_KEY, id);
  const p = listProfiles().find((x) => x.id === id);
  if (p) mirrorActive(p);
}

export function upsertProfile(profile: ProfileRecord): ProfileRecord {
  const list = listProfiles();
  const idx = list.findIndex((p) => p.id === profile.id);
  if (idx === -1) list.push(profile);
  else list[idx] = { ...list[idx], ...profile };
  write(LIST_KEY, list);
  // If this is the active profile, keep the mirror in sync.
  if (getActiveProfileId() === profile.id) mirrorActive(list[idx === -1 ? list.length - 1 : idx]);
  return list[idx === -1 ? list.length - 1 : idx];
}

export function saveAsNewProfile(data: Partial<ProfileRecord>): ProfileRecord {
  const id = `p_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 6)}`;
  const record: ProfileRecord = { id, createdAt: Date.now(), ...data };
  const list = listProfiles();
  list.push(record);
  write(LIST_KEY, list);
  setActiveProfileId(id);
  return record;
}

// One-time migration: if the user has a legacy `ayuraise.profile` but no
// profiles list, lift the legacy profile into the new structure.
export function ensureMigrated() {
  if (ssr()) return;
  if (listProfiles().length > 0) return;
  try {
    const legacy = localStorage.getItem(MIRROR_KEY);
    if (!legacy) return;
    const parsed = JSON.parse(legacy);
    if (!parsed || typeof parsed !== "object") return;
    const id = `p_self`;
    const record: ProfileRecord = { id, createdAt: Date.now(), ...parsed };
    write(LIST_KEY, [record]);
    localStorage.setItem(ACTIVE_KEY, id);
  } catch {}
}
