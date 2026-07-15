import { Link, useRouterState } from "@tanstack/react-router";
import { Home, HeartPulse, LayoutDashboard, Sparkles, GraduationCap, User } from "lucide-react";

const items = [
  { to: "/home", label: "Home", icon: Home },
  { to: "/section/disease", label: "Heal", icon: HeartPulse },
  { to: "/dashboard", label: "Today", icon: LayoutDashboard },
  { to: "/learn", label: "Learn", icon: GraduationCap },
  { to: "/coach", label: "Ayu", icon: Sparkles },
  { to: "/profile", label: "Me", icon: User },
] as const;

/**
 * UI v2 floating dock — inactive tabs are quiet icons; the active tab
 * expands into a soft sage pill with its label.
 */
export function BottomNav() {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 pb-[env(safe-area-inset-bottom)]">
      <div className="mx-auto max-w-xl px-4 pb-3.5 pt-2">
        <div className="glass flex items-center justify-between gap-1 rounded-[26px] px-2 py-2 shadow-[var(--shadow-tile)]">
          {items.map(({ to, label, icon: Icon }) => {
            const active = pathname === to;
            return (
              <Link
                key={to}
                to={to}
                aria-label={label}
                className={`flex items-center justify-center gap-1.5 rounded-full transition-all duration-300 ${
                  active
                    ? "bg-primary px-4 py-2.5 text-primary-foreground shadow-[var(--shadow-glow)]"
                    : "h-10 w-10 text-muted-foreground hover:bg-secondary/80 hover:text-foreground"
                }`}
              >
                <Icon size={19} strokeWidth={active ? 2.3 : 1.8} />
                {active && <span className="text-[12px] font-semibold leading-none">{label}</span>}
              </Link>
            );
          })}
        </div>
      </div>
    </nav>
  );
}
