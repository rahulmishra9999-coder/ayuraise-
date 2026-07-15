import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { Leaf } from "lucide-react";

export const Route = createFileRoute("/login")({
  head: () => ({
    meta: [
      { title: "Sign in · AyuRaise" },
      { name: "description", content: "Sign in to your AyuRaise wellness journey." },
    ],
  }),
  component: LoginPage,
});

function LoginPage() {
  const navigate = useNavigate();

  function handleContinue() {
    try {
      localStorage.setItem("ayuraise.onboarded", "1");
      const hasProfile = !!localStorage.getItem("ayuraise.profile");
      navigate({ to: hasProfile ? "/home" : "/onboarding" });
    } catch {
      navigate({ to: "/onboarding" });
    }
  }

  return (
    <div className="relative flex min-h-svh flex-col px-6 pb-10 pt-[max(2rem,env(safe-area-inset-top))]" style={{ background: "var(--gradient-hero)" }}>
      <div className="pointer-events-none absolute -top-24 -right-24 h-72 w-72 rounded-full opacity-50 blur-3xl" style={{ background: "var(--gradient-sage)" }} />
      <div className="pointer-events-none absolute -bottom-32 -left-20 h-80 w-80 rounded-full opacity-40 blur-3xl" style={{ background: "var(--gradient-gold)" }} />

      <div className="relative flex flex-1 flex-col items-center justify-center">
        <div className="mb-6 flex h-16 w-16 items-center justify-center rounded-3xl shadow-[var(--shadow-glow)]" style={{ background: "var(--gradient-leaf)" }}>
          <Leaf size={30} className="text-primary-foreground" strokeWidth={2} />
        </div>
        <h1 className="font-display text-4xl font-semibold text-foreground">AyuRaise</h1>
        <p className="mt-2 text-center text-sm text-muted-foreground">Your complete wellness companion</p>

        <div className="mt-10 w-full max-w-sm space-y-3">
          <button
            onClick={handleContinue}
            className="flex w-full items-center justify-center gap-3 rounded-2xl bg-primary px-5 py-3.5 text-sm font-semibold text-primary-foreground shadow-[var(--shadow-glow)] transition-transform active:scale-[0.98]"
          >
            Continue
          </button>
        </div>

        <p className="mt-10 max-w-xs text-center text-xs leading-relaxed text-muted-foreground">
          By continuing you agree to AyuRaise's{" "}
          <Link to="/" className="font-medium text-foreground underline-offset-2 hover:underline">Terms of Service</Link>{" "}
          and{" "}
          <Link to="/" className="font-medium text-foreground underline-offset-2 hover:underline">Privacy Policy</Link>.
        </p>
      </div>
    </div>
  );
}
