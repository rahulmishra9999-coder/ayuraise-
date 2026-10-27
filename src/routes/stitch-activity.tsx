import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { ArrowLeft, Check, Home, Heart, LayoutGrid, GraduationCap, Sparkles, User } from "lucide-react";

export const Route = createFileRoute("/stitch-activity")({
  head: () => ({
    links: [
      { rel: "stylesheet", href: "https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@500;600;700&display=swap" },
    ],
  }),
  component: StitchActivity,
});

const OPTS = [
  { v: "sedentary", label: "Sedentary", cal: "~50–150 cal/day burned", desc: "Mostly sitting — desk job, driving, screens. Little walking, no real exercise." },
  { v: "lightly_active", label: "Lightly active", cal: "~150–300 cal/day burned", desc: "Light chores + some walking; light exercise 1–3 days a week." },
  { v: "active", label: "Active", cal: "~350–500 cal/day burned", desc: "Brisk walks or workouts most days, or a job on your feet. 3–5 days a week." },
  { v: "very_active", label: "Very active", cal: "~600–900 cal/day burned", desc: "Hard physical work or intense training 6–7 days a week." },
];

const SERIF = { fontFamily: '"Cormorant Garamond", Georgia, serif' } as const;
const SHADOW_SEL = "0 8px 24px -4px rgba(158,125,83,0.12), 0 2px 6px -1px rgba(158,125,83,0.06)";
const SHADOW_CARD = "0 4px 20px -2px rgba(30,27,24,0.05), 0 2px 6px -1px rgba(30,27,24,0.03)";

function StitchActivity() {
  const [selected, setSelected] = useState(0);

  return (
    <div className="min-h-svh bg-[#FAF7F2] text-[#1E1B18]" style={{ fontFamily: '"Plus Jakarta Sans", sans-serif' }}>
      <div className="mx-auto flex min-h-svh w-full max-w-md flex-col justify-between px-5 pb-6 pt-4">
        <div>
          {/* header + progress */}
          <header className="pb-5 pt-2">
            <div className="mb-5 flex items-center gap-3.5">
              <button aria-label="Go back" onClick={() => window.history.back()} className="flex h-10 w-10 items-center justify-center rounded-full border border-[#9E7D53]/20 bg-[#F4EFE6] text-[#1E1B18] shadow-sm transition-colors active:bg-[#EDE6DB]">
                <ArrowLeft className="h-5 w-5" strokeWidth={1.75} />
              </button>
              <h1 className="pt-0.5 text-2xl font-semibold leading-none tracking-tight text-[#1E1B18] sm:text-[28px]" style={SERIF}>How active are you?</h1>
            </div>
            <div className="h-1.5 w-full overflow-hidden rounded-full bg-[#EAE2D5]">
              <div className="h-full w-2/5 rounded-full bg-[#9E7D53] transition-all duration-500 ease-out" />
            </div>
          </header>

          {/* options */}
          <div role="radiogroup" aria-label="Select your physical activity level" className="mt-2 space-y-3.5">
            {OPTS.map((o, i) => {
              const on = selected === i;
              return (
                <button key={o.v} role="radio" aria-checked={on} onClick={() => setSelected(i)}
                  style={{ boxShadow: on ? SHADOW_SEL : SHADOW_CARD }}
                  className={`relative block w-full overflow-hidden rounded-2xl p-4 text-left transition-all duration-200 active:scale-[0.985] sm:p-5 ${on ? "border-2 border-[#9E7D53] bg-white" : "border border-[#E5DCD0] bg-white/70"}`}>
                  <div className="flex items-start gap-3.5">
                    {on ? (
                      <div className="mt-0.5 flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-full bg-[#9E7D53] shadow-sm">
                        <Check className="h-3.5 w-3.5 text-white" strokeWidth={2.5} />
                      </div>
                    ) : (
                      <div className="mt-0.5 h-5 w-5 flex-shrink-0 rounded-full border border-[#9E7D53]/30 bg-[#FAF7F2]" />
                    )}
                    <div className="flex-1">
                      <div className="flex flex-wrap items-baseline gap-x-1.5 leading-snug">
                        <span className="text-base font-semibold tracking-tight text-[#1E1B18]">{o.label}</span>
                        <span className={`text-xs font-medium tracking-normal ${on ? "text-[#9E7D53]" : "text-[#7D603A]"}`}>{o.cal}</span>
                      </div>
                      <p className="mt-1 text-[13px] leading-relaxed text-[#4A4643]/80">{o.desc}</p>
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* footer: CTA + bottom tab bar */}
        <footer className="space-y-4 pb-2 pt-6">
          <button className="flex w-full items-center justify-center rounded-full bg-[#24201D] px-6 py-4 text-base font-semibold tracking-wide text-[#F8F5EE] shadow-md transition-all duration-200 active:scale-[0.99] active:bg-[#1E1B18]">
            Continue
          </button>
          <nav aria-label="Bottom Navigation" className="flex w-full items-center justify-between rounded-full border border-[#E8DFC8]/60 bg-white/90 px-5 py-2.5 text-[#7B756F] shadow-sm backdrop-blur-md">
            {[Home, Heart, LayoutGrid, GraduationCap, Sparkles, User].map((Ic, idx) => (
              <span key={idx} className={`p-1.5 ${idx === 0 ? "text-[#9E7D53]" : ""}`}>
                <Ic className="h-5 w-5" strokeWidth={1.75} />
              </span>
            ))}
          </nav>
          <div className="h-1 w-full" />
        </footer>
      </div>
    </div>
  );
}
