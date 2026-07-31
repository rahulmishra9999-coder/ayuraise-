// Me / My Data — reports & prescriptions stored locally (base64), with folders
// for family members. The bot reads these for personalised recommendations.

export interface HealthDoc {
  id: string;
  folder: string;          // "Me" or a family member's name
  name: string;            // display name
  kind: "report" | "prescription";
  mime: string;
  dataUrl: string;         // base64 data URL
  note?: string;
  addedAt: number;
}

const DOCS_KEY = "ayuraise.docs";
const FOLDERS_KEY = "ayuraise.docs.folders";

/** localStorage is ~5 MB — keep individual files small. */
export const MAX_FILE_BYTES = 1.5 * 1024 * 1024;

function read<T>(key: string, fb: T): T {
  if (typeof window === "undefined") return fb;
  try { const r = window.localStorage.getItem(key); return r ? (JSON.parse(r) as T) : fb; } catch { return fb; }
}
function write(key: string, v: unknown) {
  if (typeof window === "undefined") return;
  try { window.localStorage.setItem(key, JSON.stringify(v)); } catch {}
}

export function loadFolders(): string[] {
  const extra = read<string[]>(FOLDERS_KEY, []);
  return ["Me", ...extra.filter((f) => f !== "Me")];
}

export function addFolder(name: string): string[] {
  const clean = name.trim();
  if (!clean || clean === "Me") return loadFolders();
  const extra = read<string[]>(FOLDERS_KEY, []);
  if (!extra.includes(clean)) extra.push(clean);
  write(FOLDERS_KEY, extra);
  return loadFolders();
}

export function loadDocs(): HealthDoc[] {
  return read<HealthDoc[]>(DOCS_KEY, []);
}

/** Throws with a friendly message if storage is full. */
export function addDoc(doc: Omit<HealthDoc, "id" | "addedAt">): HealthDoc[] {
  const full: HealthDoc = { ...doc, id: `doc_${Date.now().toString(36)}`, addedAt: Date.now() };
  const all = [...loadDocs(), full];
  try {
    window.localStorage.setItem(DOCS_KEY, JSON.stringify(all));
  } catch {
    throw new Error("Storage is full — delete an old document first (files live on this device).");
  }
  return all;
}

export function deleteDoc(id: string): HealthDoc[] {
  const all = loadDocs().filter((d) => d.id !== id);
  write(DOCS_KEY, all);
  return all;
}

export function docsInFolder(folder: string): HealthDoc[] {
  return loadDocs().filter((d) => d.folder === folder).sort((a, b) => b.addedAt - a.addedAt);
}
