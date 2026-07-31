// Me / My Data — reports & prescriptions, with folders for family members.
// Stored on-device; the bot uses them for personalised recommendations.

import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import { BottomNav } from "@/components/BottomNav";
import { toast } from "sonner";
import {
  ArrowLeft, Bot, FileText, FolderPlus, Plus, Trash2, Upload, Eye,
} from "lucide-react";
import {
  loadFolders, addFolder, docsInFolder, addDoc, deleteDoc, MAX_FILE_BYTES,
  type HealthDoc,
} from "@/lib/docs";

export const Route = createFileRoute("/my-data")({
  head: () => ({
    meta: [
      { title: "My Data · AyuRaise" },
      { name: "description", content: "Your reports & prescriptions — stored on your device, readable by your AI coach." },
    ],
  }),
  component: MyDataPage,
});

function MyDataPage() {
  const [folders, setFolders] = useState<string[]>(["Me"]);
  const [folder, setFolder] = useState("Me");
  const [docs, setDocs] = useState<HealthDoc[]>([]);
  const [kind, setKind] = useState<"report" | "prescription">("report");
  const fileRef = useRef<HTMLInputElement>(null);

  const refresh = (f = folder) => setDocs(docsInFolder(f));
  useEffect(() => { setFolders(loadFolders()); refresh(); /* eslint-disable-next-line react-hooks/exhaustive-deps */ }, []);
  useEffect(() => { refresh(folder); /* eslint-disable-next-line react-hooks/exhaustive-deps */ }, [folder]);

  const newFolder = () => {
    const name = prompt("Family member's name (a folder is created for their documents):");
    if (!name?.trim()) return;
    setFolders(addFolder(name));
    setFolder(name.trim());
  };

  const onFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    e.target.value = "";
    if (!f) return;
    if (f.size > MAX_FILE_BYTES) {
      toast.error("File too large — keep files under 1.5 MB (photos: use a smaller/compressed image).");
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      try {
        setDocs(addDoc({ folder, name: f.name, kind, mime: f.type, dataUrl: String(reader.result) }).filter((d) => d.folder === folder).sort((a, b) => b.addedAt - a.addedAt));
        toast.success(`${kind === "report" ? "Report" : "Prescription"} saved to ${folder} ✓`);
      } catch (err) {
        toast.error((err as Error).message);
      }
    };
    reader.readAsDataURL(f);
  };

  const view = (d: HealthDoc) => {
    const w = window.open();
    if (w) w.document.write(`<iframe src="${d.dataUrl}" style="border:0;width:100vw;height:100vh"></iframe>`);
  };

  return (
    <div className="min-h-svh pb-28" style={{ background: "var(--gradient-hero)" }}>
      <div className="mx-auto max-w-xl px-5 pt-[max(1.25rem,env(safe-area-inset-top))]">
        <header className="flex items-center gap-3 pt-2">
          <Link to="/profile" className="inline-flex h-9 w-9 items-center justify-center rounded-full bg-card/70 ring-1 ring-border/60">
            <ArrowLeft size={16} />
          </Link>
          <div>
            <h1 className="font-display text-2xl font-semibold">My Data 📂</h1>
            <p className="text-xs text-muted-foreground">Reports & prescriptions — stored on this device</p>
          </div>
        </header>

        {/* the capability, said explicitly */}
        <div className="mt-4 flex items-start gap-3 rounded-3xl bg-accent/40 p-4 ring-1 ring-border/60">
          <Bot size={18} className="mt-0.5 shrink-0 text-primary" />
          <p className="text-[12.5px] leading-relaxed text-foreground/85">
            <b>Did you know?</b> Ayu can read any report here — yours or a family member's — and suggest
            yoga, diet and lifestyle changes based on it. Upload, then ask Ayu about it.
          </p>
        </div>

        {/* folders */}
        <div className="mt-4 flex flex-wrap items-center gap-1.5">
          {folders.map((f) => (
            <button
              key={f}
              onClick={() => setFolder(f)}
              className={`rounded-full px-3.5 py-2 text-[12.5px] font-semibold ${folder === f ? "bg-primary text-primary-foreground" : "bg-card text-foreground/75 ring-1 ring-border/60"}`}
            >
              {f === "Me" ? "👤 Me" : `👪 ${f}`}
            </button>
          ))}
          <button onClick={newFolder} className="flex items-center gap-1 rounded-full bg-card px-3 py-2 text-[12px] font-semibold text-primary ring-1 ring-border/60">
            <FolderPlus size={13} /> Family member
          </button>
        </div>

        {/* upload */}
        <div className="mt-4 rounded-3xl bg-card p-4 ring-1 ring-border/60">
          <div className="flex gap-1.5">
            {(["report", "prescription"] as const).map((k) => (
              <button key={k} onClick={() => setKind(k)}
                className={`rounded-full px-3 py-1.5 text-[11.5px] font-semibold capitalize ${kind === k ? "bg-primary text-primary-foreground" : "bg-secondary text-foreground/75"}`}>
                {k === "report" ? "🧪 Report" : "💊 Prescription"}
              </button>
            ))}
          </div>
          <button
            onClick={() => fileRef.current?.click()}
            className="mt-3 flex w-full items-center justify-center gap-2 rounded-2xl border-2 border-dashed border-border bg-secondary/40 px-4 py-6 text-[13px] font-semibold text-foreground/70"
          >
            <Upload size={16} className="text-primary" /> Upload {kind} to {folder} (PDF or photo, &lt;1.5 MB)
          </button>
          <input ref={fileRef} type="file" accept="application/pdf,image/*" className="hidden" onChange={onFile} />
        </div>

        {/* documents */}
        <div className="mt-4 space-y-2">
          {docs.map((d) => (
            <div key={d.id} className="flex items-center gap-3 rounded-3xl bg-card p-3.5 ring-1 ring-border/60">
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-accent/50 text-lg">
                {d.kind === "report" ? "🧪" : "💊"}
              </span>
              <div className="min-w-0 flex-1">
                <p className="truncate text-[13px] font-semibold text-foreground">{d.name}</p>
                <p className="text-[10.5px] text-muted-foreground">
                  {d.kind} · {new Date(d.addedAt).toLocaleDateString(undefined, { day: "numeric", month: "short" })}
                </p>
              </div>
              <button onClick={() => view(d)} className="rounded-full bg-secondary p-2 text-foreground/70" title="View">
                <Eye size={14} />
              </button>
              <button
                onClick={() => { if (confirm(`Delete "${d.name}"?`)) setDocs(deleteDoc(d.id).filter((x) => x.folder === folder)); }}
                className="rounded-full p-2 text-muted-foreground hover:text-rose-500"
              >
                <Trash2 size={14} />
              </button>
            </div>
          ))}
          {docs.length === 0 && (
            <div className="rounded-3xl bg-card p-6 text-center ring-1 ring-border/60">
              <FileText size={22} className="mx-auto text-muted-foreground" />
              <p className="mt-2 text-[13px] font-semibold text-foreground">Nothing in {folder}'s folder yet</p>
              <p className="mt-1 text-[11.5px] text-muted-foreground">Blood reports, thyroid panels, prescriptions — upload and they're always in your pocket.</p>
            </div>
          )}
        </div>

        {/* ask the bot */}
        {docs.length > 0 && (
          <Link
            to="/coach"
            className="mt-4 flex items-center gap-3 rounded-3xl bg-primary p-4 text-primary-foreground shadow-[var(--shadow-glow)]"
          >
            <span className="flex h-10 w-10 items-center justify-center rounded-2xl bg-white/15"><Bot size={20} /></span>
            <span className="flex-1">
              <span className="text-[13.5px] font-semibold">Get inputs on {folder === "Me" ? "your" : `${folder}'s`} reports</span>
              <span className="mt-0.5 block text-[11.5px] opacity-85">Ask Ayu what a report means & what lifestyle steps help.</span>
            </span>
            <Plus size={16} className="rotate-45" />
          </Link>
        )}
      </div>
      <BottomNav />
    </div>
  );
}
