import { useEffect, useState } from "react";
import { Link, useNavigate } from "@tanstack/react-router";
import { Plus, Check, ChevronDown } from "lucide-react";
import {
  listProfiles,
  getActiveProfileId,
  setActiveProfileId,
  ensureMigrated,
  type ProfileRecord,
} from "@/lib/profiles";

function initialsOf(p?: ProfileRecord | null) {
  const n = (p?.name ?? "").trim();
  if (!n) return "A";
  return n[0]!.toUpperCase();
}

const GRADIENTS = [
  "var(--gradient-leaf)",
  "var(--gradient-violet)",
  "var(--gradient-water)",
  "var(--gradient-sun)",
];

export function ProfileSwitcher() {
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const [profiles, setProfiles] = useState<ProfileRecord[]>([]);
  const [activeId, setActive] = useState<string | null>(null);

  useEffect(() => {
    const refresh = () => {
      ensureMigrated();
      setProfiles(listProfiles());
      setActive(getActiveProfileId());
    };
    refresh();
    window.addEventListener("focus", refresh);
    window.addEventListener("storage", refresh);
    return () => {
      window.removeEventListener("focus", refresh);
      window.removeEventListener("storage", refresh);
    };
  }, []);

  const active = profiles.find((p) => p.id === activeId) ?? null;

  function pick(id: string) {
    setActiveProfileId(id);
    setActive(id);
    setOpen(false);
    // Force a reload so every screen re-reads the mirrored profile.
    if (typeof window !== "undefined") window.location.reload();
  }

  // If only one profile (or none migrated yet), show a single avatar that links to /profile.
  if (profiles.length <= 1) {
    return (
      <div className="relative">
        <div className="flex items-center gap-1">
          <Link
            to="/profile"
            className="flex h-10 w-10 items-center justify-center rounded-full text-primary-foreground shadow-[var(--shadow-soft)]"
            style={{ background: GRADIENTS[0] }}
            aria-label="My profile"
          >
            <span className="text-sm font-semibold">{initialsOf(active)}</span>
          </Link>
          <button
            onClick={() => navigate({ to: "/onboarding", search: { profileId: "new" } as any })}
            className="flex h-7 w-7 items-center justify-center rounded-full bg-card text-foreground ring-1 ring-border"
            aria-label="Add another profile"
            title="Add another profile"
          >
            <Plus size={14} />
          </button>
        </div>
      </div>
    );
  }

  // Multiple profiles → show all avatars + a chevron menu.
  return (
    <div className="relative">
      <div className="flex items-center gap-1.5">
        {profiles.map((p, idx) => {
          const isActive = p.id === activeId;
          return (
            <button
              key={p.id}
              onClick={() => pick(p.id)}
              className={`flex h-9 w-9 items-center justify-center rounded-full text-primary-foreground shadow-[var(--shadow-soft)] ${
                isActive ? "ring-2 ring-primary ring-offset-2 ring-offset-background" : "opacity-70"
              }`}
              style={{ background: GRADIENTS[idx % GRADIENTS.length] }}
              title={p.name || `Profile ${idx + 1}`}
            >
              <span className="text-[12px] font-semibold">{initialsOf(p)}</span>
            </button>
          );
        })}
        <button
          onClick={() => setOpen((o) => !o)}
          className="flex h-7 w-7 items-center justify-center rounded-full bg-card ring-1 ring-border"
          aria-label="Profile menu"
        >
          <ChevronDown size={14} />
        </button>
      </div>

      {open && (
        <div className="absolute right-0 z-30 mt-2 w-60 rounded-2xl bg-card p-2 shadow-2xl ring-1 ring-border/70">
          <p className="px-2 pt-1 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">Switch profile</p>
          <div className="mt-1 space-y-1">
            {profiles.map((p) => {
              const isActive = p.id === activeId;
              return (
                <button
                  key={p.id}
                  onClick={() => pick(p.id)}
                  className={`flex w-full items-center justify-between rounded-xl px-2.5 py-2 text-left text-[13px] ${
                    isActive ? "bg-primary/10 text-foreground" : "hover:bg-secondary/40"
                  }`}
                >
                  <span className="truncate font-medium">{p.name || "Unnamed"}</span>
                  {isActive && <Check size={14} className="text-primary" />}
                </button>
              );
            })}
          </div>
          <div className="mt-2 border-t border-border/60 pt-1">
            <button
              onClick={() => {
                setOpen(false);
                navigate({ to: "/onboarding", search: { profileId: "new" } as any });
              }}
              className="flex w-full items-center gap-2 rounded-xl px-2.5 py-2 text-left text-[13px] font-semibold text-primary hover:bg-primary/10"
            >
              <Plus size={14} /> Add another profile
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
