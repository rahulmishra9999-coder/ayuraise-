import { Link } from "@tanstack/react-router";
import { MessageCircle } from "lucide-react";

/** Floating "Ask Ayu" button — sits above the BottomNav, bottom-right. Links to the coach.
 *  Pass a `seed` to pre-fill the coach with a starter question for the current context. */
export function AyuBot({ seed }: { seed?: string }) {
  return (
    <Link
      to="/coach"
      search={seed ? { seed } : undefined}
      aria-label="Ask Ayu"
      className="fixed right-4 z-40 flex items-center gap-1.5 rounded-full px-3.5 py-2.5 text-primary-foreground shadow-[var(--shadow-glow)] active:scale-[0.95]"
      style={{ bottom: "calc(5.25rem + env(safe-area-inset-bottom))", background: "var(--gradient-violet)" }}
    >
      <MessageCircle size={17} strokeWidth={2.2} />
      <span className="text-[12.5px] font-bold">Ask Ayu</span>
    </Link>
  );
}
