import { createFileRoute, Link } from "@tanstack/react-router";
import { BottomNav } from "@/components/BottomNav";
import { Settings, Bell, Shield, LogOut, ChevronRight, Leaf, Users } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

export const Route = createFileRoute("/profile")({
  head: () => ({
    meta: [{ title: "Profile · AyuRaise" }],
  }),
  component: ProfilePage,
});

const rows = [
  { icon: Leaf, label: "My Prakriti", value: "View" },
  { icon: Bell, label: "Reminders", value: "On" },
  { icon: Settings, label: "Preferences", value: "" },
  { icon: Shield, label: "Privacy", value: "" },
];

function ProfilePage() {
  const queryClient = useQueryClient();
  const signOut = async () => {
    try {
      await queryClient.cancelQueries();
      queryClient.clear();
      // Clear all local app state so the user is truly signed out.
      try {
        localStorage.removeItem("ayuraise.user");
        localStorage.removeItem("ayuraise.onboarded");
        localStorage.removeItem("ayuraise.profile");
        localStorage.removeItem("ayuraise.profiles");
        localStorage.removeItem("ayuraise.activeProfileId");
        localStorage.removeItem("ayuraise.plan");
      } catch {}
      await supabase.auth.signOut().catch(() => {});
      toast.success("Signed out");
      // Hard redirect so every in-memory state resets and no listener bounces us elsewhere.
      window.location.replace("/login");
    } catch (e) {
      toast.error("Sign out failed", { description: (e as Error).message });
    }
  };

  return (
    <div className="min-h-svh pb-28" style={{ background: "var(--gradient-hero)" }}>
      <div className="mx-auto max-w-xl px-5 pt-[max(1.25rem,env(safe-area-inset-top))]">
        <header className="flex flex-col items-center pt-6">
          <div className="flex h-20 w-20 items-center justify-center rounded-full text-primary-foreground shadow-[var(--shadow-glow)]" style={{ background: "var(--gradient-leaf)" }}>
            <span className="font-display text-2xl">A</span>
          </div>
          <h1 className="mt-3 font-display text-2xl font-semibold">Hello, Friend</h1>
          <p className="text-xs text-muted-foreground">Member since today</p>
        </header>

        <section className="mt-8 overflow-hidden rounded-3xl bg-card shadow-[var(--shadow-soft)] ring-1 ring-border/60">
          {rows.map((r, i) => {
            const I = r.icon;
            return (
              <button key={r.label} className={`flex w-full items-center gap-3 px-5 py-4 text-left ${i > 0 ? "border-t border-border/60" : ""}`}>
                <I size={18} className="text-primary" />
                <span className="flex-1 text-sm font-medium text-foreground">{r.label}</span>
                {r.value && <span className="text-xs text-muted-foreground">{r.value}</span>}
                <ChevronRight size={16} className="text-muted-foreground" />
              </button>
            );
          })}
        </section>

        <Link
          to="/prakriti-guest"
          className="mt-4 flex w-full items-center gap-3 rounded-3xl bg-card px-5 py-4 text-left shadow-[var(--shadow-soft)] ring-1 ring-border/60"
        >
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-primary/10 text-primary">
            <Users size={18} />
          </div>
          <div className="flex-1">
            <p className="text-sm font-semibold text-foreground">Know anyone's prakriti</p>
            <p className="text-[11px] text-muted-foreground">
              Quick quiz for a friend or family member. Results aren't saved — for full plans, add a new profile.
            </p>
          </div>
          <ChevronRight size={16} className="text-muted-foreground" />
        </Link>

        <button onClick={signOut} className="mt-6 flex w-full items-center justify-center gap-2 rounded-2xl bg-card px-5 py-3.5 text-sm font-semibold text-destructive shadow-[var(--shadow-soft)] ring-1 ring-border/60">
          <LogOut size={16} /> Sign out
        </button>

        <p className="mt-6 text-center text-[11px] text-muted-foreground">AyuRaise v0.1 · Wellness in your pocket</p>
      </div>
      <BottomNav />
    </div>
  );
}
