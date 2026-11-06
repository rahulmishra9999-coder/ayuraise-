import { createFileRoute, Link, useRouter } from "@tanstack/react-router";

export const Route = createFileRoute("/weight-loss")({
  head: () => ({
    meta: [
      { title: "How weight loss works · AyuRaise" },
      { name: "description", content: "Weight loss is mostly about food — the steady, no-starving way." },
    ],
    links: [
      { rel: "stylesheet", href: "https://fonts.googleapis.com/css2?family=Playfair+Display:wght@500;600;700&family=Inter:wght@400;500;600;700&display=swap" },
      { rel: "stylesheet", href: "https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@20..48,100..700,0..1,-50..200&display=swap" },
    ],
  }),
  component: WeightLossScreen,
});

const PLAYFAIR = { fontFamily: '"Playfair Display", Georgia, serif' } as const;
const INTER = { fontFamily: '"Inter", system-ui, sans-serif' } as const;

/** Material Symbol icon. */
function MS({ name, size = 20, fill = false, className = "" }: { name: string; size?: number; fill?: boolean; className?: string }) {
  return <span className={`material-symbols-outlined ${className}`} style={{ fontSize: size, lineHeight: 1, fontVariationSettings: fill ? "'FILL' 1" : "'FILL' 0" }}>{name}</span>;
}

const WL_CARDS: [string, string, string, string, string, string][] = [
  ["Cut calories gently", "A small, sustainable reduction that works", "restaurant", "#FAECE2", "#B05B27", "calories.png"],
  ["Eat enough protein", "Keeps you full for longer", "egg_alt", "#FEF4DC", "#A67812", "protein.png"],
  ["Choose better carbs (low-GI)", "Steady energy, no sudden crashes", "eco", "#EAF4E8", "#3D7834", "carbs.png"],
  ["Start with a salad", "Helps you feel full, so you eat less", "soup_kitchen", "#FFF0E0", "#BC671F", "salad.png"],
  ["Include sprouts at breakfast", "Nutrient-rich and light on calories", "nutrition", "#FCECEE", "#B83D4F", "sprouts.png"],
  ["Go easy on nuts & dry fruits", "Nutritious, but calorie-dense — keep portions small", "grain", "#FBF0DD", "#A66E14", "nuts.png"],
  ["Chew well, eat slowly", "Gives your brain time to feel satisfied", "self_improvement", "#FAEBEE", "#B84058", "chew.png"],
];

const NAV: [string, string][] = [["home", "/home"], ["favorite", "/my-plans"], ["grid_view", "/learn"], ["school", "/diet/academy"], ["auto_awesome", "/coach"], ["person", "/profile"]];

/** "How weight loss works" onboarding screen. Device-first layout: header pinned
 *  to the top, bottom nav pinned to the bottom (safe-area aware), cards scroll in
 *  the middle. Fits one phone screen from iPhone SE up to Pro Max. */
function WeightLossScreen() {
  const router = useRouter();
  return (
    <div className="mx-auto flex h-dvh w-full max-w-[520px] flex-col" style={{ background: "#FFF8F2", color: "#39332F", ...INTER }}>
      {/* pinned header */}
      <header className="shrink-0 px-5 pb-2" style={{ paddingTop: "max(0.9rem, env(safe-area-inset-top))" }}>
        <div className="flex items-center gap-4">
          <button aria-label="Go back" onClick={() => router.history.back()} className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-stone-200/70 bg-white/95 shadow-sm active:scale-95" style={{ color: "#39332F" }}><MS name="arrow_back" size={20} /></button>
          <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-stone-200/80"><div className="h-full rounded-full" style={{ width: "38%", background: "#936548" }} /></div>
        </div>
      </header>
      {/* scrollable content */}
      <main className="relative flex min-h-0 flex-1 flex-col overflow-y-auto px-5 pb-5 pt-2">
        <div className="relative mb-3 shrink-0">
          <h1 className="mb-2 whitespace-nowrap text-[24px] font-semibold leading-[1.15] tracking-[-0.01em]" style={{ ...PLAYFAIR, color: "#2B211B" }}>How weight loss works</h1>
          <p className="text-[13px] leading-[1.5]" style={{ color: "#6B625B", maxWidth: 220 }}>Weight loss is mostly about food — the steady, no-starving way. Tap any card to see why it works.</p>
          <div className="pointer-events-none absolute right-[-10px] top-[-12px] h-[128px] w-[134px]">
            <img src="/images/weightloss/hero.png" alt="" className="h-full w-full object-contain" onError={(e) => { e.currentTarget.style.display = "none"; }} />
          </div>
        </div>
        <div className="flex min-h-0 flex-1 flex-col justify-between gap-2 py-0.5">
          {WL_CARDS.map(([title, sub, icon, bg, fg, img]) => (
            <div key={title} className="group flex shrink-0 cursor-pointer items-center gap-3 rounded-[20px] border px-3 py-2 shadow-[0_1px_5px_rgba(90,60,40,0.045)] transition-all active:scale-[0.99]" style={{ background: "#FFFDF9", borderColor: "#F4EEE5" }}>
              <div className="relative flex h-11 w-11 shrink-0 items-center justify-center overflow-hidden rounded-full" style={{ background: bg, color: fg }}><MS name={icon} size={22} /><img src={`/images/weightloss/${img}`} alt="" className="absolute inset-0 h-full w-full scale-[1.05] object-cover" onError={(e) => { e.currentTarget.style.display = "none"; }} /></div>
              <div className="min-w-0 flex-1">
                <h2 className="text-[14.5px] font-semibold leading-snug" style={{ color: "#39332F" }}>{title}</h2>
                <p className="text-[12px] leading-[1.35]" style={{ color: "#6B625B" }}>{sub}</p>
              </div>
              <span className="shrink-0" style={{ color: "#936548" }}><MS name="chevron_right" size={20} /></span>
            </div>
          ))}
        </div>
        <Link to="/lifestyle" className="mt-3 flex w-full shrink-0 items-center justify-center gap-2 rounded-[26px] px-6 py-3 text-[15px] font-semibold text-white shadow-[0_6px_16px_-8px_rgba(110,70,45,0.55)] active:scale-[0.98]" style={{ background: "#936548" }}>Next <MS name="arrow_forward" size={18} /></Link>
      </main>
      {/* pinned bottom nav (safe-area aware) */}
      <nav aria-label="Bottom Navigation" className="shrink-0 px-5 pt-2" style={{ paddingBottom: "max(0.75rem, env(safe-area-inset-bottom))" }}>
        <div className="flex h-[54px] items-center justify-around rounded-full border px-4" style={{ background: "rgba(255,253,249,0.97)", borderColor: "#EEE2D4", boxShadow: "0 6px 20px -6px rgba(120,80,45,0.16)" }}>
          {NAV.map(([icon, to], i) => (
            <Link key={icon} to={to} aria-label={icon} className="flex items-center justify-center" style={{ color: i === 0 ? "#7E5234" : "#A9815F" }}><MS name={icon} size={23} /></Link>
          ))}
        </div>
      </nav>
    </div>
  );
}
