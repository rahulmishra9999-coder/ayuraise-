import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import {
  ArrowLeft, ArrowRight, ChevronRight, Check, Utensils,
  House, Heart, LayoutGrid, GraduationCap, Sparkles, UserRound, Ruler, Scale, Armchair, Footprints,
  Dumbbell, Flame, Moon, Clock, Timer, Sunrise, PersonStanding, Target, Activity, TrendingDown, Droplet,
} from "lucide-react";

export const Route = createFileRoute("/stitch-preview/$screen")({
  head: () => ({
    links: [
      { rel: "stylesheet", href: "https://fonts.googleapis.com/css2?family=Source+Serif+4:opsz,wght@8..60,400;8..60,500;8..60,600;8..60,700&family=Manrope:wght@400;500;600;700&family=Plus+Jakarta+Sans:wght@400;500;600;700&family=Playfair+Display:wght@500;600;700&family=Inter:wght@400;500;600;700&display=swap" },
      { rel: "stylesheet", href: "https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@20..48,100..700,0..1,-50..200&display=swap" },
    ],
  }),
  component: Preview,
});

const SERIF = { fontFamily: '"Source Serif 4", Georgia, serif' } as const;
const SANS = { fontFamily: '"Manrope", system-ui, sans-serif' } as const;
const JAKARTA = { fontFamily: '"Plus Jakarta Sans", system-ui, sans-serif' } as const;
const PLAYFAIR = { fontFamily: '"Playfair Display", Georgia, serif' } as const;
const INTER = { fontFamily: '"Inter", system-ui, sans-serif' } as const;

function MS({ name, size = 20, fill = false, className = "" }: { name: string; size?: number; fill?: boolean; className?: string }) {
  return <span className={`material-symbols-outlined ${className}`} style={{ fontSize: size, lineHeight: 1, fontVariationSettings: fill ? "'FILL' 1" : "'FILL' 0" }}>{name}</span>;
}

/* ---- shared chrome ---- */
function TopBar({ progress }: { progress: number }) {
  return (
    <header className="fixed inset-x-0 top-0 z-50 border-b border-black/[0.04] bg-[#f7fafb]/80 backdrop-blur-xl">
      <div className="flex h-16 items-center justify-between px-6">
        <button aria-label="Back" className="-ml-2 flex h-11 w-11 items-center justify-start text-[#181c1d]"><MS name="arrow_back_ios_new" size={22} /></button>
        <div className="flex flex-1 flex-col items-center px-2">
          <div className="h-1 w-24 overflow-hidden rounded-full bg-[#ebeeef]"><div className="h-full rounded-full bg-[#4b6159] transition-all duration-300" style={{ width: `${progress * 100}%` }} /></div>
        </div>
        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[#4b6159] shadow-sm"><MS name="person" size={18} className="text-white" /></div>
      </div>
    </header>
  );
}

function ProgressHead({ step, pct, title, subtitle }: { step: number; pct: number; title: string; subtitle?: string }) {
  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-center justify-between text-[11px] font-semibold uppercase tracking-wider">
        <span className="text-[#4b6159]">Step {step} of 4</span>
        <span className="font-medium text-[#424845]">{pct}% Complete</span>
      </div>
      <div className="h-1.5 w-full overflow-hidden rounded-full bg-[#ebeeef]"><div className="h-full rounded-full bg-[#4b6159] transition-all duration-500" style={{ width: `${pct}%` }} /></div>
      <div className="pt-1">
        <h1 className="text-[26px] font-semibold leading-tight tracking-tight text-[#181c1d]" style={SERIF}>{title}</h1>
        {subtitle && <p className="mt-0.5 text-[13px] leading-snug text-[#4d635b]">{subtitle}</p>}
      </div>
    </div>
  );
}

function BottomBar({ label = "Continue", arrow = true, uppercase = false }: { label?: string; arrow?: boolean; uppercase?: boolean }) {
  return (
    <footer className="fixed inset-x-0 bottom-0 z-50 border-t border-black/[0.03] bg-[#f7fafb]/85 px-6 py-2 pb-[max(0.5rem,env(safe-area-inset-bottom))] backdrop-blur-xl">
      <button className={`flex h-12 w-full items-center justify-center gap-2 rounded-full bg-[#4b6159] text-[15px] font-semibold text-white shadow-md transition-all active:scale-[0.99] ${uppercase ? "uppercase tracking-wider" : ""}`}>
        <span>{label}</span>{arrow && <MS name="arrow_forward" size={19} />}
      </button>
    </footer>
  );
}

/* a card wrapper */
function Card({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return <div className={`rounded-xl bg-white p-3.5 ${className}`} style={{ boxShadow: "0 2px 12px rgba(24,28,29,0.03)" }}>{children}</div>;
}
function SecLabel({ icon, children }: { icon?: string; children: React.ReactNode }) {
  return (
    <div className="flex items-center gap-1.5 text-[#4d635b]">
      {icon && <MS name={icon} size={16} />}
      <span className="text-[11px] font-semibold uppercase tracking-wider text-[#4d635b]">{children}</span>
    </div>
  );
}

/* a pill-grid segmented selector */
function PillGrid({ opts, value, onChange, cols = 4 }: { opts: string[]; value: string; onChange: (v: string) => void; cols?: number }) {
  return (
    <div className={`grid gap-2`} style={{ gridTemplateColumns: `repeat(${cols}, minmax(0,1fr))` }}>
      {opts.map((o) => {
        const on = value === o;
        return (
          <button key={o} onClick={() => onChange(o)} className={`rounded-full px-2 py-1.5 text-center text-[12px] font-semibold transition-all ${on ? "bg-[#4b6159] text-white shadow-sm" : "bg-[#f1f4f5] text-[#181c1d] hover:bg-[#ebeeef]"}`}>{o}</button>
        );
      })}
    </div>
  );
}
/* a pill track (nap / waking) */
function PillTrack({ opts, value, onChange }: { opts: string[]; value: string; onChange: (v: string) => void }) {
  return (
    <div className="grid gap-1.5 rounded-full bg-[#f1f4f5] p-1" style={{ gridTemplateColumns: `repeat(${opts.length}, minmax(0,1fr))` }}>
      {opts.map((o) => {
        const on = value === o;
        return <button key={o} onClick={() => onChange(o)} className={`h-8 rounded-full text-[13px] font-medium transition-all ${on ? "bg-[#4b6159] text-white shadow-sm" : "text-[#424845] hover:text-[#181c1d]"}`}>{o}</button>;
      })}
    </div>
  );
}

/* ================= ABOUT YOU ================= */
function AboutScreen() {
  const [gender, setGender] = useState("Male");
  const [hUnit, setHUnit] = useState("cm");
  const [wUnit, setWUnit] = useState("kg");
  return (
    <div style={SANS}>
      <header className="fixed inset-x-0 top-0 z-50 border-b border-black/[0.04] bg-[#f7fafb]/80 backdrop-blur-xl">
        <div className="flex h-16 items-center justify-between px-6">
          <button aria-label="Back" className="-ml-2 flex h-11 w-11 items-center justify-center rounded-full text-[#181c1d]"><MS name="arrow_back_ios_new" size={22} /></button>
          <div className="flex-1" />
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[#4b6159]"><MS name="person" size={18} className="text-white" /></div>
        </div>
      </header>

      <main className="px-6 pb-10 pt-[4.5rem]">
        <div className="mb-6 flex flex-col gap-2.5">
          <div className="flex items-center justify-between text-[12px]">
            <span className="font-medium tracking-wide text-[#4b6159]">Step 1 of 4</span>
            <span className="text-[#424845]">25% Complete</span>
          </div>
          <div className="h-1.5 w-full overflow-hidden rounded-full bg-[#ebeeef]"><div className="h-full rounded-full bg-[#4b6159]" style={{ width: "25%" }} /></div>
        </div>
        <h1 className="mb-8 text-[28px] font-semibold tracking-tight text-[#181c1d]" style={SERIF}>About You</h1>

        <div className="flex flex-col gap-4">
          {/* name */}
          <div className="rounded-xl bg-white p-5 shadow-sm">
            <label className="mb-1.5 block text-[12px] font-medium tracking-wider text-[#424845]">Name</label>
            <div className="flex items-center gap-3">
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#f1f4f5] text-[#4b6159]"><MS name="badge" size={18} /></div>
              <input defaultValue="Rahul" placeholder="Enter your name" className="w-full bg-transparent text-[18px] text-[#181c1d] placeholder:text-[#727875] focus:outline-none" />
            </div>
          </div>
          {/* gender */}
          <div className="rounded-xl bg-white p-5 shadow-sm">
            <label className="mb-3 block text-[12px] font-medium tracking-wider text-[#424845]">Gender</label>
            <div className="grid grid-cols-3 gap-2">
              {["Male", "Female", "Other"].map((g) => {
                const on = gender === g;
                return (
                  <button key={g} onClick={() => setGender(g)} className={`flex items-center justify-center gap-1.5 rounded-full px-3 py-2.5 text-[14px] font-semibold transition-all ${on ? "bg-[#4b6159] text-white shadow-sm" : "bg-[#f1f4f5] text-[#424845]"}`}>
                    {on && <MS name="check" size={16} />}<span>{g}</span>
                  </button>
                );
              })}
            </div>
          </div>
          {/* age */}
          <div className="rounded-xl bg-white p-5 shadow-sm">
            <label className="mb-1.5 block text-[12px] font-medium tracking-wider text-[#424845]">Age</label>
            <div className="flex items-baseline gap-2">
              <input type="number" defaultValue={32} className="w-20 bg-transparent text-[24px] font-medium text-[#181c1d] focus:outline-none" style={SERIF} />
              <span className="text-[16px] text-[#424845]">years</span>
            </div>
          </div>
          {/* height + weight */}
          <div className="grid grid-cols-2 gap-3">
            <div className="flex flex-col justify-between rounded-xl bg-white p-4 shadow-sm">
              <div className="mb-3 flex items-center justify-between gap-1">
                <span className="truncate text-[12px] font-medium tracking-wider text-[#424845]">Height</span>
                <div className="flex shrink-0 rounded-full bg-[#f1f4f5] p-0.5">
                  {["cm", "ft"].map((u) => <button key={u} onClick={() => setHUnit(u)} className={`rounded-full px-2 py-0.5 text-[12px] transition-all ${hUnit === u ? "bg-white font-semibold text-[#4b6159] shadow-sm" : "text-[#424845]"}`}>{u}</button>)}
                </div>
              </div>
              <div className="flex items-baseline gap-1.5">
                <span className="text-[24px] font-medium text-[#181c1d]" style={SERIF}>{hUnit === "cm" ? "178" : "5'10"}</span>
                <span className="text-[14px] text-[#424845]">{hUnit}</span>
              </div>
              <div className="mt-2 flex items-center gap-1 truncate text-[12px] text-[#727875]"><MS name="height" size={13} className="text-[#4b6159]" /> 5 ft 10 in</div>
            </div>
            <div className="flex flex-col justify-between rounded-xl bg-white p-4 shadow-sm">
              <div className="mb-3 flex items-center justify-between gap-1">
                <span className="truncate text-[12px] font-medium tracking-wider text-[#424845]">Weight</span>
                <div className="flex shrink-0 rounded-full bg-[#f1f4f5] p-0.5">
                  {["kg", "lb"].map((u) => <button key={u} onClick={() => setWUnit(u)} className={`rounded-full px-2 py-0.5 text-[12px] transition-all ${wUnit === u ? "bg-white font-semibold text-[#4b6159] shadow-sm" : "text-[#424845]"}`}>{u}</button>)}
                </div>
              </div>
              <div className="flex items-baseline gap-1.5">
                <span className="text-[24px] font-medium text-[#181c1d]" style={SERIF}>{wUnit === "kg" ? "72" : "158.7"}</span>
                <span className="text-[14px] text-[#424845]">{wUnit}</span>
              </div>
              <div className="mt-2 flex items-center gap-1 truncate text-[12px] text-[#727875]"><MS name="monitor_weight" size={13} className="text-[#4b6159]" /> 158.7 lbs</div>
            </div>
          </div>

          <div className="mt-2 flex flex-col items-center gap-3 pt-2">
            <button className="flex w-full items-center justify-center gap-2 rounded-full bg-[#2d3132] px-6 py-4 text-[14px] font-semibold text-[#eef1f2] shadow-md transition-all active:scale-[0.99]"><span>Continue</span><MS name="arrow_forward" size={18} /></button>
            <div className="flex items-center gap-1.5 text-[12px] text-[#727875]"><MS name="lock" size={14} /><span>Your data is private and encrypted.</span></div>
          </div>
        </div>
      </main>
    </div>
  );
}

/* ================= ACTIVITY ================= */
const ACT = [
  { v: "sedentary", icon: "chair", label: "Sedentary", cal: "~50–150 cal/day", desc: "Desk job, mostly sitting throughout the day. Under 3,000 steps, little to no routine exercise." },
  { v: "lightly-active", icon: "directions_walk", label: "Lightly active", cal: "~150–300 cal/day", desc: "Some office & household movement, light walking (4,000–6,000 steps), or light workouts/yoga 1–2 days a week." },
  { v: "active", icon: "fitness_center", label: "Active", cal: "~350–500 cal/day", desc: "Regular daily movement, 7,000–10,000 steps, or 30–45 min workouts / yoga 3–5 days a week." },
  { v: "very-active", icon: "bolt", label: "Very active", cal: "~600–900 cal/day", desc: "Physically demanding job or on feet all day, 10,000+ steps, or intense training / sports 5–7 days a week." },
];
function ActivityScreen() {
  const [sel, setSel] = useState("sedentary");
  return (
    <div style={SANS}>
      <TopBar progress={0.5} />
      <main className="px-6 pb-28 pt-[4.75rem]">
        <ProgressHead step={2} pct={50} title="Activity Level" subtitle="Choose the option that best matches your typical daily routine." />
        <div role="radiogroup" className="mt-5 flex flex-col gap-3.5">
          {ACT.map((a) => {
            const on = sel === a.v;
            return (
              <button key={a.v} onClick={() => setSel(a.v)} className="flex flex-col rounded-xl bg-white p-4 text-left transition-all active:scale-[0.99]" style={{ boxShadow: on ? "0 4px 24px rgba(75,97,89,0.10)" : "0 2px 12px rgba(24,28,29,0.03)" }}>
                <div className="flex items-center justify-between gap-2">
                  <div className="flex min-w-0 items-center gap-3">
                    <div className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-full ${on ? "bg-[#d0e8de] text-[#4b6159]" : "bg-[#f1f4f5] text-[#5d5c57]"}`}><MS name={a.icon} size={22} /></div>
                    <div className="flex min-w-0 flex-col">
                      <span className="text-[15px] font-semibold leading-tight text-[#181c1d]">{a.label}</span>
                      <span className={`mt-0.5 text-[11px] font-medium tracking-wide ${on ? "text-[#4b6159]" : "text-[#424845]"}`}>{a.cal}</span>
                    </div>
                  </div>
                  <div className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full transition-all ${on ? "bg-[#4b6159] text-white shadow-sm" : "bg-[#ebeeef] text-transparent"}`}><MS name="check" size={16} fill={on} /></div>
                </div>
                <p className="mt-2 pl-[56px] text-[12px] leading-[16px] text-[#424845]">{a.desc}</p>
              </button>
            );
          })}
        </div>
      </main>
      <BottomBar label="Continue" uppercase />
    </div>
  );
}

/* ================= SLEEP ================= */
function SleepScreen() {
  const [dur, setDur] = useState(7.5);
  const [lat, setLat] = useState("10–20 min");
  const [nap, setNap] = useState("Sometimes");
  const [wake, setWake] = useState("Balanced");
  return (
    <div style={SANS}>
      <TopBar progress={0.75} />
      <main className="px-6 pb-28 pt-[4.75rem]">
        <ProgressHead step={3} pct={75} title="Sleep" subtitle="Help us calibrate your circadian baseline and nightly recovery." />
        <div className="mt-5 flex flex-col gap-3">
          {/* bedtime */}
          <Card className="flex flex-col gap-2">
            <div className="flex items-center justify-between">
              <SecLabel icon="bedtime">Bedtime</SecLabel>
              <span className="text-[11px] text-[#4d635b]">Usual window</span>
            </div>
            <div className="relative">
              <select defaultValue="1030" className="h-10 w-full cursor-pointer appearance-none rounded-lg bg-[#f1f4f5] px-3 pr-8 text-[14px] font-medium text-[#181c1d] focus:outline-none">
                <option value="900">9:00 PM – 9:30 PM</option>
                <option value="930">9:30 PM – 10:00 PM</option>
                <option value="1000">10:00 PM – 10:30 PM</option>
                <option value="1030">10:30 PM – 11:00 PM</option>
                <option value="1100">11:00 PM – 11:30 PM</option>
                <option value="1130">11:30 PM – 12:00 AM</option>
                <option value="1200">12:00 AM or later</option>
              </select>
              <div className="pointer-events-none absolute inset-y-0 right-2.5 flex items-center text-[#4d635b]"><MS name="unfold_more" size={18} /></div>
            </div>
          </Card>
          {/* duration */}
          <Card className="flex flex-col gap-2.5">
            <div className="flex items-center justify-between">
              <SecLabel icon="schedule">Sleep Duration</SecLabel>
              <div className="rounded-full bg-[#d0e8de] px-2.5 py-0.5 text-[13px] font-semibold text-[#0a1f19]">{dur.toFixed(1)} hrs</div>
            </div>
            <div className="flex flex-col gap-1.5 pt-0.5">
              <input type="range" min={5} max={10} step={0.5} value={dur} onChange={(e) => setDur(parseFloat(e.target.value))} className="h-1.5 w-full cursor-pointer rounded-full" style={{ accentColor: "#4b6159" }} />
              <div className="flex justify-between px-1 text-[11px] text-[#4d635b]"><span>5h</span><span>6h</span><span>7h</span><span>8h</span><span>9h</span><span>10h</span></div>
            </div>
          </Card>
          {/* latency */}
          <Card className="flex flex-col gap-2">
            <SecLabel icon="timelapse">Time to Fall Asleep</SecLabel>
            <PillGrid cols={2} opts={["< 10 min", "10–20 min", "20–40 min", "40+ min"]} value={lat} onChange={setLat} />
          </Card>
          {/* nap */}
          <Card className="flex flex-col gap-2">
            <SecLabel icon="wb_twilight">Daytime Nap</SecLabel>
            <PillTrack opts={["No", "Sometimes", "Daily"]} value={nap} onChange={setNap} />
          </Card>
          {/* waking */}
          <Card className="flex flex-col gap-2">
            <SecLabel icon="wb_sunny">Waking Feeling</SecLabel>
            <PillTrack opts={["Fresh", "Balanced", "Tired"]} value={wake} onChange={setWake} />
          </Card>
        </div>
      </main>
      <BottomBar label="Continue" />
    </div>
  );
}

/* ================= FOOD & MEALS ================= */
function FoodScreen() {
  const [style, setStyle] = useState("Non-veg");
  const [meals, setMeals] = useState("3");
  const [snacks, setSnacks] = useState("1");
  const [water, setWater] = useState("2.5–3L");
  return (
    <div style={SANS}>
      <TopBar progress={1} />
      <main className="px-6 pb-28 pt-[4.75rem]">
        <div className="flex flex-col gap-2.5">
          <div className="pb-1">
            <div className="mb-1.5 flex items-center justify-between text-[11px] uppercase tracking-wider">
              <span className="font-semibold text-[#727875]">Step 4 of 4</span>
              <span className="font-semibold text-[#4b6159]">100% Complete</span>
            </div>
            <div className="h-1 w-full overflow-hidden rounded-full bg-[#ebeeef]"><div className="h-full w-full rounded-full bg-[#4b6159]" /></div>
          </div>
          <h1 className="text-[24px] font-semibold tracking-tight text-[#181c1d]" style={SERIF}>Food &amp; Meals</h1>

          <Card className="flex flex-col gap-2"><SecLabel>Food style</SecLabel><PillGrid opts={["Veg", "Vegan", "Egg", "Non-veg"]} value={style} onChange={setStyle} /></Card>
          <Card className="flex flex-col gap-2"><SecLabel>Main meals / day</SecLabel><PillGrid opts={["1", "2", "3", "4+"]} value={meals} onChange={setMeals} /></Card>
          <Card className="flex flex-col gap-2"><SecLabel>Snacks / day</SecLabel><PillGrid opts={["0", "1", "2", "3+"]} value={snacks} onChange={setSnacks} /></Card>
          <Card className="flex flex-col gap-2">
            <SecLabel>Meal timing</SecLabel>
            <div className="grid grid-cols-2 gap-2.5">
              {[["Breakfast", "8:30 AM"], ["Dinner", "7:30 PM"]].map(([k, v]) => (
                <div key={k} className="flex flex-col gap-0.5 rounded-lg bg-[#f1f4f5] p-2.5">
                  <span className="text-[12px] text-[#424845]">{k}</span>
                  <div className="flex items-center justify-between pt-0.5"><span className="text-[18px] font-semibold text-[#181c1d]">{v}</span><MS name="schedule" size={18} className="text-[#727875]" /></div>
                </div>
              ))}
            </div>
          </Card>
          <Card className="flex flex-col gap-2"><SecLabel>Water / day</SecLabel><PillGrid opts={["< 1.5L", "2L", "2.5–3L", "3.5L+"]} value={water} onChange={setWater} /></Card>
        </div>
      </main>
      <BottomBar label="Continue" arrow={false} uppercase />
    </div>
  );
}

/* ================= CALORIE SENSE (green → premium navy; terracotta kept) ================= */
const PLATES_IN = [["1 roti / phulka", "~100"], ["1 bowl rice", "~200"], ["1 bowl dal", "~120"], ["1 cup sabzi", "~150"], ["1 glass milk", "~120"], ["1 tsp ghee / oil", "~45"], ["1 tsp sugar", "~20"], ["1 fruit bowl", "~90"]];
const MOVE_OUT = [["5,000 steps", "~200"], ["20 min yoga", "~90"], ["20 min workout", "~180"], ["20 min cycling", "~160"], ["20 min swim", "~200"], ["30 min housework", "~80"]];
function CalorieScreen() {
  return (
    <div style={SANS}>
      {/* header */}
      <header className="fixed inset-x-0 top-0 z-50 border-b border-black/[0.04] bg-[#f7fafb]/80 pt-[env(safe-area-inset-top)] backdrop-blur-xl">
        <div className="flex h-16 items-center justify-between px-6">
          <button aria-label="Back" className="flex h-11 w-11 items-center justify-center rounded-full text-[#424845]"><MS name="arrow_back_ios_new" size={22} /></button>
          <h1 className="truncate px-2 text-center text-[24px] font-medium tracking-tight text-[#181c1d]" style={SERIF}>Calorie Sense</h1>
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[#3A3E45]"><MS name="person" size={18} className="text-white" /></div>
        </div>
      </header>

      <main className="flex flex-col gap-6 px-6 pb-32 pt-[4.75rem]">
        {/* stepper */}
        <div className="flex flex-col gap-2">
          <div className="flex items-center justify-between text-[12px] uppercase tracking-wider text-[#424845]"><span>Step 3 of 5</span><span className="font-semibold text-[#3A3E45]">Metabolic Balance</span></div>
          <div className="h-1.5 w-full overflow-hidden rounded-full bg-[#ebeeef]"><div className="h-full rounded-full bg-[#3A3E45]" style={{ width: "60%" }} /></div>
        </div>

        {/* intro */}
        <div className="flex flex-col gap-1.5">
          <p className="text-[28px] font-semibold tracking-tight text-[#181c1d]" style={SERIF}>Your Calorie Blueprint</p>
          <p className="text-[16px] leading-relaxed text-[#424845]">Now let's talk calories — what your body burns at stillness, and the mindful number to aim for.</p>
        </div>

        {/* hero BMR card */}
        <div className="relative flex flex-col items-center overflow-hidden rounded-xl bg-[#f1f4f5] p-6 text-center shadow-sm">
          <div className="pointer-events-none absolute -right-12 -top-12 h-36 w-36 rounded-full bg-[#ECE7E1]/40 blur-2xl" />
          <div className="pointer-events-none absolute -bottom-10 -left-10 h-32 w-32 rounded-full bg-[#E6E9ED]/70 blur-2xl" />
          <div className="relative mb-3 inline-flex items-center gap-1.5 rounded-full bg-[#e0e3e4] px-3 py-1 text-[12px] font-semibold uppercase tracking-wider text-[#7E7268]"><MS name="local_fire_department" size={16} fill className="text-[#7E7268]" /> Your Basal Metabolic Rate</div>
          <div className="relative my-1 flex items-baseline gap-1"><span className="text-[32px] font-semibold tracking-tight text-[#181c1d]" style={SERIF}>1,628</span><span className="text-[14px] font-medium text-[#424845]">kcal</span></div>
          <p className="relative max-w-[220px] text-[12px] leading-relaxed text-[#424845]">The pure vital energy your body burns every single day just staying alive.</p>
        </div>

        {/* target banner */}
        <div className="flex items-center justify-between gap-3 rounded-xl bg-[#3A3E45] p-4 text-white shadow-md">
          <div className="flex min-w-0 items-center gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-white/10"><MS name="spa" size={22} fill className="text-[#E6E9ED]" /></div>
            <div className="flex min-w-0 flex-col"><span className="text-[14px] font-semibold leading-snug">Gentle sustained loss</span><span className="truncate text-[12px] text-[#E6E9ED]">~0.4 kg/week target</span></div>
          </div>
          <div className="shrink-0 text-right"><span className="text-[24px] font-medium tracking-tight" style={SERIF}>1,425</span><span className="-mt-1 block text-[12px] font-medium text-[#E6E9ED]">kcal/day</span></div>
        </div>

        {/* breakdown */}
        <div className="flex flex-col gap-3">
          <div className="flex items-center justify-between"><span className="text-[14px] font-semibold uppercase tracking-wider text-[#181c1d]">How We Got Here</span><span className="text-[12px] text-[#424845]">Daily Breakdown</span></div>
          <div className="flex flex-col gap-2">
            {[
              { icon: "bedtime", tint: "bg-[#e6e9ea] text-[#424845]", t: "At rest (BMR)", s: "Baseline organs & breath", v: "1,628", vc: "text-[#181c1d]" },
              { icon: "self_improvement", tint: "bg-[#e6e9ea] text-[#3A3E45]", t: "+ Daily movement", s: "Sedentary desk + 20m yoga", v: "+250", vc: "text-[#3A3E45]" },
              { icon: "restaurant", tint: "bg-[#e0e3e4] text-[#181c1d]", t: "= Maintain weight", s: "Current equilibrium", v: "1,878", vc: "text-[#181c1d] font-semibold", low: true },
            ].map((r) => (
              <div key={r.t} className={`flex items-center justify-between rounded-lg p-3.5 shadow-sm ${r.low ? "bg-[#f1f4f5]" : "bg-white"}`}>
                <div className="flex items-center gap-3"><div className={`flex h-9 w-9 items-center justify-center rounded-full ${r.tint}`}><MS name={r.icon} size={18} /></div><div className="flex flex-col"><span className="text-[14px] text-[#181c1d]">{r.t}</span><span className="text-[12px] text-[#424845]">{r.s}</span></div></div>
                <div className="text-right"><span className={`text-[14px] ${r.vc}`}>{r.v}</span><span className="-mt-1 block text-[12px] text-[#424845]">kcal</span></div>
              </div>
            ))}
            {/* deficit (terracotta) */}
            <div className="flex items-center justify-between rounded-lg bg-[#ECE7E1]/30 p-3.5">
              <div className="flex items-center gap-3"><div className="flex h-9 w-9 items-center justify-center rounded-full bg-[#D8CFC6]/40 text-[#7E7268]"><MS name="trending_down" size={18} /></div><div className="flex flex-col"><span className="text-[14px] text-[#7E7268]">− Mindful deficit</span><span className="text-[12px] leading-tight text-[#5C5349]">Safe deficit, no metabolic crash</span></div></div>
              <div className="text-right"><span className="text-[14px] font-semibold text-[#7E7268]">−453</span><span className="-mt-1 block text-[12px] text-[#5C5349]">kcal</span></div>
            </div>
          </div>
        </div>

        {/* quick calorie sense */}
        <div className="flex flex-col gap-3 pt-2">
          <div className="flex flex-col gap-1"><span className="text-[14px] font-semibold uppercase tracking-wider text-[#181c1d]">A Quick Calorie Sense</span><p className="text-[12px] text-[#424845]">Simple benchmarks so portion tracking feels natural and peaceful.</p></div>
          <div className="flex flex-col gap-4 rounded-xl bg-white p-4 shadow-sm">
            <div className="flex flex-col gap-2.5">
              <div className="flex items-center gap-2 pb-1"><MS name="dinner_dining" size={18} className="text-[#7E7268]" /><span className="text-[11px] font-semibold uppercase tracking-wider text-[#181c1d]">Daily Plates (In)</span></div>
              <div className="grid grid-cols-2 gap-x-4 gap-y-2">{PLATES_IN.map(([k, v]) => <div key={k} className="flex items-center justify-between py-0.5 text-[12px]"><span className="truncate text-[#424845]">{k}</span><span className="shrink-0 pl-1 font-semibold text-[#3A3E45]">{v}</span></div>)}</div>
            </div>
            <div className="h-px w-full bg-[#ebeeef]" />
            <div className="flex flex-col gap-2.5">
              <div className="flex items-center gap-2 pb-1"><MS name="directions_run" size={18} className="text-[#3A3E45]" /><span className="text-[11px] font-semibold uppercase tracking-wider text-[#181c1d]">Movement Spent (Out)</span></div>
              <div className="grid grid-cols-2 gap-x-4 gap-y-2">{MOVE_OUT.map(([k, v]) => <div key={k} className="flex items-center justify-between py-0.5 text-[12px]"><span className="truncate text-[#424845]">{k}</span><span className="shrink-0 pl-1 font-semibold text-[#7E7268]">{v}</span></div>)}</div>
            </div>
          </div>
          <div className="flex flex-col gap-2 rounded-xl bg-[#E6E9ED]/40 p-3.5">
            <div className="flex items-center gap-2"><MS name="check_circle" size={18} fill className="text-[#3A3E45]" /><span className="text-[14px] font-semibold text-[#3A3E45]">Almost zero calories (&lt; 5 kcal)</span></div>
            <p className="pl-6 text-[12px] leading-relaxed text-[#424845]">Fresh water • Green / black tea • Black coffee (no sugar) • Ginger water • Lemon slice infusion</p>
          </div>
        </div>
      </main>

      {/* sticky CTA */}
      <div className="fixed inset-x-0 bottom-0 z-40 bg-gradient-to-t from-[#f7fafb] via-[#f7fafb]/95 to-transparent px-6 pb-6 pt-3">
        <button className="flex h-14 w-full items-center justify-center gap-2 rounded-full bg-[#3A3E45] text-[14px] font-semibold text-white shadow-lg transition-all active:scale-[0.98]"><span>Continue to Meal Architecture</span><MS name="arrow_forward" size={20} /></button>
      </div>
    </div>
  );
}

/* ===== premium graphite/platinum/stone kit (Sattva-inspired, no green) ===== */
const INK = "#181c1d", MUT = "#424845", CARBON = "#3A3E45", PLAT = "#E6E9ED", STONE = "#7E7268", STONE_L = "#ECE7E1";
const GRAD = "linear-gradient(135deg,#4A4F57 0%,#2C2F35 100%)";
function Ring({ pct, size = 184, stroke = 12, track = PLAT, fill = CARBON, children }: { pct: number; size?: number; stroke?: number; track?: string; fill?: string; children?: React.ReactNode }) {
  const r = (size - stroke) / 2, c = 2 * Math.PI * r;
  return (
    <div className="relative" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90">
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke={track} strokeWidth={stroke} />
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke={fill} strokeWidth={stroke} strokeDasharray={c} strokeDashoffset={c * (1 - pct)} strokeLinecap="round" />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center text-center">{children}</div>
    </div>
  );
}
function PremHeader({ title }: { title: string }) {
  return (
    <header className="fixed inset-x-0 top-0 z-50 border-b border-black/[0.04] bg-[#f7fafb]/80 pt-[env(safe-area-inset-top)] backdrop-blur-xl">
      <div className="flex h-16 items-center justify-between px-6">
        <button aria-label="Back" className="flex h-11 w-11 items-center justify-center rounded-full text-[#424845]"><MS name="arrow_back_ios_new" size={22} /></button>
        <h1 className="truncate px-2 text-center text-[20px] font-medium tracking-tight text-[#181c1d]" style={SERIF}>{title}</h1>
        <div className="flex h-8 w-8 items-center justify-center rounded-full" style={{ background: GRAD }}><MS name="person" size={18} className="text-white" /></div>
      </div>
    </header>
  );
}
function Stepper({ step, total, label, pct }: { step: number; total: number; label: string; pct: number }) {
  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-center justify-between text-[11px] uppercase tracking-wider text-[#424845]"><span>Step {step} of {total}</span><span className="font-semibold" style={{ color: STONE }}>{label}</span></div>
      <div className="h-1.5 w-full overflow-hidden rounded-full bg-[#ebeeef]"><div className="h-full rounded-full" style={{ width: `${pct}%`, background: CARBON }} /></div>
    </div>
  );
}
function PremCTA({ label }: { label: string }) {
  return (
    <div className="fixed inset-x-0 bottom-0 z-40 bg-gradient-to-t from-[#f7fafb] via-[#f7fafb]/95 to-transparent px-6 pb-6 pt-4">
      <button className="flex h-14 w-full items-center justify-center gap-2 rounded-full text-[14px] font-semibold text-white shadow-[0_12px_30px_-10px_rgba(44,47,53,0.5)] transition-all active:scale-[0.98]" style={{ background: GRAD }}><span>{label}</span><MS name="arrow_forward" size={20} /></button>
    </div>
  );
}

/* ---- BMR ---- */
function BmrScreen() {
  return (
    <div style={SANS}>
      <PremHeader title="Metabolism" />
      <main className="flex flex-col gap-7 px-6 pb-32 pt-[4.75rem]">
        <Stepper step={2} total={5} label="Metabolic Baseline" pct={40} />
        <div className="flex flex-col gap-1.5">
          <p className="text-[28px] font-semibold leading-tight tracking-tight text-[#181c1d]" style={SERIF}>Your Resting Burn</p>
          <p className="text-[16px] leading-relaxed text-[#424845]">The quiet energy your body spends each day just to keep you alive — before a single step.</p>
        </div>
        {/* hero ring on gradient */}
        <div className="relative overflow-hidden rounded-[28px] p-8" style={{ background: GRAD }}>
          <div className="pointer-events-none absolute -right-16 -top-16 h-44 w-44 rounded-full" style={{ background: "rgba(255,255,255,0.06)", filter: "blur(30px)" }} />
          <div className="relative flex flex-col items-center">
            <Ring pct={1} track="rgba(255,255,255,0.14)" fill="#E6E9ED">
              <span className="text-[11px] uppercase tracking-widest text-white/70">BMR</span>
              <span className="text-[40px] font-semibold tracking-tight text-white" style={SERIF}>1,628</span>
              <span className="text-[12px] font-medium text-white/70">kcal / day</span>
            </Ring>
            <div className="mt-5 inline-flex items-center gap-1.5 rounded-full bg-white/10 px-3 py-1 text-[11px] font-semibold uppercase tracking-wider text-white"><MS name="local_fire_department" size={15} fill /> At complete rest</div>
          </div>
        </div>
        {/* where it goes */}
        <div className="flex flex-col gap-3">
          <span className="text-[14px] font-semibold uppercase tracking-wider text-[#181c1d]">Where it goes</span>
          <div className="flex flex-col gap-2.5">
            {[["psychology", "Brain & nerves", "~20%", CARBON], ["cardiology", "Heart & circulation", "~15%", STONE], ["respiratory_rate", "Breathing & lungs", "~10%", CARBON], ["body_system", "Organs, cells & repair", "~55%", STONE]].map(([ic, t, p, col]) => (
              <div key={t} className="flex items-center justify-between rounded-2xl bg-white p-3.5 shadow-sm">
                <div className="flex items-center gap-3"><div className="flex h-10 w-10 items-center justify-center rounded-full" style={{ background: PLAT, color: col }}><MS name={ic} size={20} /></div><span className="text-[14px] text-[#181c1d]">{t}</span></div>
                <span className="text-[14px] font-semibold" style={{ color: col }}>{p}</span>
              </div>
            ))}
          </div>
        </div>
        <p className="rounded-2xl border border-[#E6E9ED] bg-[#f1f4f5] p-4 text-[13px] leading-relaxed text-[#424845]"><span className="font-semibold text-[#181c1d]">Good to know —</span> a higher muscle mass gently raises this number. Movement and strength compound it over time.</p>
      </main>
      <PremCTA label="See my calorie goal" />
    </div>
  );
}

/* ---- CALORIE GOAL ---- */
function CalGoalScreen() {
  return (
    <div style={SANS}>
      <PremHeader title="Calorie Goal" />
      <main className="flex flex-col gap-6 px-6 pb-32 pt-[4.75rem]">
        <Stepper step={3} total={5} label="Your Target" pct={60} />
        {/* hero gradient banner */}
        <div className="relative overflow-hidden rounded-[28px] p-7 text-white" style={{ background: GRAD }}>
          <div className="pointer-events-none absolute -left-10 -bottom-10 h-40 w-40 rounded-full" style={{ background: "rgba(255,255,255,0.05)", filter: "blur(28px)" }} />
          <div className="relative flex items-center justify-between gap-4">
            <div className="flex flex-col">
              <span className="inline-flex w-fit items-center gap-1.5 rounded-full bg-white/10 px-3 py-1 text-[11px] font-semibold uppercase tracking-wider"><MS name="spa" size={14} fill className="text-white/90" /> Gentle sustained loss</span>
              <span className="mt-3 text-[13px] text-white/70">Daily target</span>
              <div className="flex items-baseline gap-1"><span className="text-[44px] font-semibold leading-none tracking-tight" style={SERIF}>1,425</span><span className="text-[14px] font-medium text-white/70">kcal</span></div>
              <span className="mt-1 text-[12px] text-white/70">≈ 0.4 kg / week</span>
            </div>
            <Ring pct={0.76} size={96} stroke={9} track="rgba(255,255,255,0.14)" fill="#E6E9ED"><span className="text-[18px] font-semibold text-white" style={SERIF}>−453</span><span className="text-[9px] uppercase tracking-wider text-white/70">deficit</span></Ring>
          </div>
        </div>
        {/* breakdown */}
        <div className="flex flex-col gap-3">
          <div className="flex items-center justify-between"><span className="text-[14px] font-semibold uppercase tracking-wider text-[#181c1d]">How we got here</span><span className="text-[12px] text-[#424845]">Daily</span></div>
          <div className="flex flex-col gap-2">
            {[["bedtime", "At rest (BMR)", "1,628", INK, "bg-[#e6e9ea]"], ["directions_walk", "+ Daily movement", "+250", CARBON, "bg-[#e6e9ea]"], ["restaurant", "= Maintain weight", "1,878", INK, "bg-[#e0e3e4]"]].map(([ic, t, v, col, bg]) => (
              <div key={t} className={`flex items-center justify-between rounded-2xl p-3.5 shadow-sm ${t.startsWith("=") ? "bg-[#f1f4f5]" : "bg-white"}`}>
                <div className="flex items-center gap-3"><div className={`flex h-9 w-9 items-center justify-center rounded-full ${bg}`} style={{ color: col }}><MS name={ic} size={18} /></div><span className="text-[14px] text-[#181c1d]">{t}</span></div>
                <div className="text-right"><span className="text-[14px] font-semibold" style={{ color: col }}>{v}</span><span className="-mt-1 block text-[11px] text-[#424845]">kcal</span></div>
              </div>
            ))}
            <div className="flex items-center justify-between rounded-2xl p-3.5" style={{ background: STONE_L }}>
              <div className="flex items-center gap-3"><div className="flex h-9 w-9 items-center justify-center rounded-full" style={{ background: "#D8CFC6", color: STONE }}><MS name="trending_down" size={18} /></div><div className="flex flex-col"><span className="text-[14px]" style={{ color: STONE }}>− Mindful deficit</span><span className="text-[12px] leading-tight" style={{ color: "#5C5349" }}>Safe — no metabolic crash</span></div></div>
              <div className="text-right"><span className="text-[14px] font-semibold" style={{ color: STONE }}>−453</span><span className="-mt-1 block text-[11px]" style={{ color: "#5C5349" }}>kcal</span></div>
            </div>
          </div>
        </div>
        <p className="rounded-2xl border border-[#E6E9ED] bg-[#f1f4f5] p-4 text-[13px] leading-relaxed text-[#424845]"><span className="font-semibold text-[#181c1d]">Mindful, not extreme.</span> This modest gap keeps your energy and metabolism steady while the weight comes off gently.</p>
      </main>
      <PremCTA label="Build my meal plan" />
    </div>
  );
}

/* ---- SLEEP ---- */
function RestScreen() {
  return (
    <div style={SANS}>
      <PremHeader title="Sleep" />
      <main className="flex flex-col gap-6 px-6 pb-32 pt-[4.75rem]">
        <Stepper step={4} total={5} label="Nightly Recovery" pct={80} />
        <div className="flex flex-col gap-1.5">
          <p className="text-[28px] font-semibold leading-tight tracking-tight text-[#181c1d]" style={SERIF}>Your Rest Rhythm</p>
          <p className="text-[16px] leading-relaxed text-[#424845]">Sleep is when the body repairs. Let's set a rhythm that restores you.</p>
        </div>
        {/* hero ring */}
        <div className="relative overflow-hidden rounded-[28px] p-8" style={{ background: GRAD }}>
          <div className="pointer-events-none absolute -right-14 -bottom-14 h-44 w-44 rounded-full" style={{ background: "rgba(255,255,255,0.06)", filter: "blur(30px)" }} />
          <div className="relative flex flex-col items-center">
            <Ring pct={0.78} track="rgba(255,255,255,0.14)" fill="#E6E9ED">
              <MS name="bedtime" size={20} className="text-white/70" />
              <span className="mt-1 text-[40px] font-semibold tracking-tight text-white" style={SERIF}>7.5</span>
              <span className="text-[12px] font-medium text-white/70">hours / night</span>
            </Ring>
            <div className="mt-5 inline-flex items-center gap-1.5 rounded-full bg-white/10 px-3 py-1 text-[11px] font-semibold uppercase tracking-wider text-white"><MS name="check_circle" size={14} fill /> Restorative range</div>
          </div>
        </div>
        {/* bedtime / wake cards */}
        <div className="grid grid-cols-2 gap-3">
          {[["dark_mode", "Bedtime", "10:30 PM"], ["wb_twilight", "Wake", "6:00 AM"]].map(([ic, t, v]) => (
            <div key={t} className="flex flex-col gap-2 rounded-2xl bg-white p-4 shadow-sm">
              <div className="flex h-9 w-9 items-center justify-center rounded-full" style={{ background: PLAT, color: CARBON }}><MS name={ic} size={18} /></div>
              <span className="text-[11px] uppercase tracking-wider text-[#424845]">{t}</span>
              <span className="text-[20px] font-semibold text-[#181c1d]" style={SERIF}>{v}</span>
            </div>
          ))}
        </div>
        {/* quality */}
        <div className="flex items-center justify-between rounded-2xl bg-white p-4 shadow-sm">
          <div className="flex items-center gap-3"><div className="flex h-10 w-10 items-center justify-center rounded-full" style={{ background: STONE_L, color: STONE }}><MS name="self_improvement" size={20} /></div><div className="flex flex-col"><span className="text-[14px] font-semibold text-[#181c1d]">Waking feeling</span><span className="text-[12px] text-[#424845]">How you rise most days</span></div></div>
          <span className="rounded-full px-3 py-1 text-[12px] font-semibold" style={{ background: PLAT, color: CARBON }}>Balanced</span>
        </div>
        <p className="rounded-2xl border border-[#E6E9ED] bg-[#f1f4f5] p-4 text-[13px] leading-relaxed text-[#424845]"><span className="font-semibold text-[#181c1d]">Tonight's nudge —</span> wind down by 10 PM. The deepest cellular repair happens in the first sleep cycles.</p>
      </main>
      <PremCTA label="Continue" />
    </div>
  );
}

/* ===== premium Create-profile flow (graphite + terracotta/stone, image-ready heroes) ===== */
function Hero({ step, pct, title, sub }: { step: string; pct: number; title: string; sub?: string }) {
  return (
    <div className="relative overflow-hidden rounded-b-[32px] px-6 pb-7 pt-[calc(env(safe-area-inset-top)+1.75rem)]" style={{ background: GRAD }}>
      {/* image slot — a real photo drops in here behind the overlay; gradient shows otherwise */}
      <div className="pointer-events-none absolute -right-16 -top-10 h-48 w-48 rounded-full" style={{ background: "rgba(255,255,255,0.06)", filter: "blur(34px)" }} />
      <div className="pointer-events-none absolute -left-12 bottom-0 h-40 w-40 rounded-full" style={{ background: "rgba(126,114,104,0.18)", filter: "blur(30px)" }} />
      <div className="relative flex items-center justify-between text-white">
        <button aria-label="Back" className="-ml-2 flex h-10 w-10 items-center justify-center rounded-full text-white/90"><MS name="arrow_back_ios_new" size={20} /></button>
        <span className="text-[11px] font-semibold uppercase tracking-widest text-white/70">{step}</span>
        <div className="flex h-9 w-9 items-center justify-center rounded-full bg-white/10 ring-1 ring-white/20"><MS name="person" size={18} className="text-white" /></div>
      </div>
      <div className="relative mt-5">
        <div className="h-1 w-full overflow-hidden rounded-full bg-white/15"><div className="h-full rounded-full bg-white/80 transition-all" style={{ width: `${pct}%` }} /></div>
        <h1 className="mt-5 text-[30px] font-semibold leading-tight tracking-tight text-white" style={SERIF}>{title}</h1>
        {sub && <p className="mt-1 text-[14px] leading-snug text-white/70">{sub}</p>}
      </div>
    </div>
  );
}
function Lbl({ children }: { children: React.ReactNode }) { return <span className="text-[11px] font-semibold uppercase tracking-wider text-[#424845]">{children}</span>; }
function PPill({ opts, def, cols = 4 }: { opts: string[]; def?: string; cols?: number }) {
  const [v, setV] = useState(def ?? "");
  return (
    <div className="grid gap-2" style={{ gridTemplateColumns: `repeat(${cols}, minmax(0,1fr))` }}>
      {opts.map((o) => { const on = v === o; return <button key={o} onClick={() => setV(o)} className="rounded-full px-2 py-2 text-center text-[12.5px] font-semibold transition-all active:scale-95" style={on ? { background: CARBON, color: "#fff" } : { background: "#f1f4f5", color: INK }}>{o}</button>; })}
    </div>
  );
}
function WCard({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return <div className={`rounded-2xl bg-white p-4 shadow-[0_8px_24px_-16px_rgba(24,28,29,0.25)] ${className}`}>{children}</div>;
}

function CpAbout() {
  const [gender, setGender] = useState("Female");
  const [hU, setHU] = useState("cm"); const [wU, setWU] = useState("kg");
  return (
    <div style={SANS}>
      <Hero step="Step 1 of 4" pct={25} title="About You" sub="A few essentials to personalise everything." />
      <main className="flex flex-col gap-4 px-6 pb-32 pt-6">
        <WCard>
          <Lbl>Name</Lbl>
          <div className="mt-2 flex items-center gap-3"><div className="flex h-9 w-9 items-center justify-center rounded-full" style={{ background: PLAT, color: CARBON }}><MS name="badge" size={18} /></div><input defaultValue="Elena" className="w-full bg-transparent text-[18px] text-[#181c1d] focus:outline-none" /></div>
        </WCard>
        <WCard>
          <Lbl>Gender</Lbl>
          <div className="mt-3 grid grid-cols-3 gap-2">{["Male", "Female", "Other"].map((g) => { const on = gender === g; return <button key={g} onClick={() => setGender(g)} className="flex items-center justify-center gap-1.5 rounded-full px-3 py-2.5 text-[14px] font-semibold transition-all" style={on ? { background: CARBON, color: "#fff" } : { background: "#f1f4f5", color: MUT }}>{on && <MS name="check" size={16} />}{g}</button>; })}</div>
        </WCard>
        <WCard>
          <Lbl>Age</Lbl>
          <div className="mt-1.5 flex items-baseline gap-2"><input type="number" defaultValue={32} className="w-20 bg-transparent text-[26px] font-semibold text-[#181c1d] focus:outline-none" style={SERIF} /><span className="text-[15px] text-[#424845]">years</span></div>
        </WCard>
        <div className="grid grid-cols-2 gap-3">
          {[["Height", "178", "cm", hU, setHU, ["cm", "ft"], "height"], ["Weight", "68", "kg", wU, setWU, ["kg", "lb"], "monitor_weight"]].map(([lab, val, , u, setU, units, ic]: any) => (
            <WCard key={lab}>
              <div className="flex items-center justify-between"><Lbl>{lab}</Lbl><div className="flex rounded-full bg-[#f1f4f5] p-0.5">{units.map((x: string) => <button key={x} onClick={() => setU(x)} className="rounded-full px-2 py-0.5 text-[12px] transition-all" style={u === x ? { background: "#fff", color: CARBON, fontWeight: 600 } : { color: MUT }}>{x}</button>)}</div></div>
              <div className="mt-2 flex items-baseline gap-1.5"><span className="text-[24px] font-semibold text-[#181c1d]" style={SERIF}>{val}</span><span className="text-[14px] text-[#424845]">{u}</span></div>
              <div className="mt-2 flex items-center gap-1 text-[12px]" style={{ color: STONE }}><MS name={ic} size={13} />{lab === "Height" ? "5 ft 10 in" : "150 lbs"}</div>
            </WCard>
          ))}
        </div>
      </main>
      <PremCTA label="Continue" />
    </div>
  );
}

const CP_ACT = [
  { icon: "chair", label: "Sedentary", cal: "~50–150 cal/day", desc: "Mostly sitting — desk, driving, screens." },
  { icon: "directions_walk", label: "Lightly active", cal: "~150–300 cal/day", desc: "Light chores + walking; 1–2 workouts a week." },
  { icon: "fitness_center", label: "Active", cal: "~350–500 cal/day", desc: "Workouts most days, or on your feet." },
  { icon: "bolt", label: "Very active", cal: "~600–900 cal/day", desc: "Hard physical work or daily training." },
];
function CpActivity() {
  const [sel, setSel] = useState("Lightly active");
  return (
    <div style={SANS}>
      <Hero step="Step 2 of 4" pct={50} title="Activity Level" sub="Choose what best matches your typical routine." />
      <main className="flex flex-col gap-3.5 px-6 pb-32 pt-6">
        {CP_ACT.map((a) => { const on = sel === a.label; return (
          <button key={a.label} onClick={() => setSel(a.label)} className="flex flex-col rounded-2xl p-4 text-left transition-all active:scale-[0.99]" style={on ? { background: "#fff", boxShadow: "0 12px 30px -14px rgba(58,62,69,0.5)", border: `1.5px solid ${CARBON}` } : { background: "#fff", boxShadow: "0 8px 24px -18px rgba(24,28,29,0.3)", border: "1px solid #E6E9ED" }}>
            <div className="flex items-center justify-between gap-2">
              <div className="flex min-w-0 items-center gap-3"><div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full" style={on ? { background: CARBON, color: "#fff" } : { background: PLAT, color: STONE }}><MS name={a.icon} size={22} /></div><div className="flex min-w-0 flex-col"><span className="text-[15px] font-semibold text-[#181c1d]">{a.label}</span><span className="mt-0.5 text-[11px] font-medium" style={{ color: on ? CARBON : STONE }}>{a.cal}</span></div></div>
              <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full" style={on ? { background: CARBON, color: "#fff" } : { background: "#ebeeef", color: "transparent" }}><MS name="check" size={16} fill={on} /></div>
            </div>
            <p className="mt-2 pl-[56px] text-[12px] leading-[16px] text-[#424845]">{a.desc}</p>
          </button>
        ); })}
      </main>
      <PremCTA label="Continue" />
    </div>
  );
}

function CpSleep() {
  return (
    <div style={SANS}>
      <Hero step="Step 3 of 4" pct={75} title="Sleep" sub="Let's calibrate your nightly recovery." />
      <main className="flex flex-col gap-3 px-6 pb-32 pt-6">
        <WCard>
          <div className="flex items-center justify-between"><div className="flex items-center gap-1.5" style={{ color: STONE }}><MS name="bedtime" size={16} /><Lbl>Bedtime</Lbl></div><span className="text-[11px] text-[#424845]">Usual window</span></div>
          <div className="relative mt-2"><div className="flex h-11 items-center justify-between rounded-xl bg-[#f1f4f5] px-3.5 text-[14px] font-medium text-[#181c1d]">10:30 PM – 11:00 PM<MS name="unfold_more" size={18} className="text-[#424845]" /></div></div>
        </WCard>
        <WCard>
          <div className="flex items-center justify-between"><div className="flex items-center gap-1.5" style={{ color: STONE }}><MS name="schedule" size={16} /><Lbl>Sleep Duration</Lbl></div><span className="rounded-full px-2.5 py-0.5 text-[13px] font-semibold" style={{ background: PLAT, color: CARBON }}>7.5 hrs</span></div>
          <div className="mt-3 flex flex-col gap-1.5"><div className="relative h-1.5 w-full rounded-full bg-[#ebeeef]"><div className="absolute inset-y-0 left-0 rounded-full" style={{ width: "62%", background: CARBON }} /><div className="absolute top-1/2 h-4 w-4 -translate-y-1/2 rounded-full bg-white shadow ring-2" style={{ left: "60%", borderColor: CARBON, boxShadow: `0 0 0 2px ${CARBON}` }} /></div><div className="flex justify-between px-1 text-[11px] text-[#424845]"><span>4h</span><span>6h</span><span>8h</span><span>10h</span></div></div>
        </WCard>
        <WCard><div className="mb-2 flex items-center gap-1.5" style={{ color: STONE }}><MS name="timelapse" size={16} /><Lbl>Time to Fall Asleep</Lbl></div><PPill cols={2} opts={["< 10 min", "10–20 min", "20–40 min", "40+ min"]} def="10–20 min" /></WCard>
        <WCard><div className="mb-2 flex items-center gap-1.5" style={{ color: STONE }}><MS name="wb_twilight" size={16} /><Lbl>Daytime Nap</Lbl></div><PPill cols={3} opts={["No", "Sometimes", "Daily"]} def="Sometimes" /></WCard>
        <WCard><div className="mb-2 flex items-center gap-1.5" style={{ color: STONE }}><MS name="wb_sunny" size={16} /><Lbl>Waking Feeling</Lbl></div><PPill cols={3} opts={["Fresh", "Balanced", "Tired"]} def="Balanced" /></WCard>
      </main>
      <PremCTA label="Continue" />
    </div>
  );
}

function CpFood() {
  return (
    <div style={SANS}>
      <Hero step="Step 4 of 4" pct={100} title="Food & Meals" sub="So your plan uses food you love." />
      <main className="flex flex-col gap-3 px-6 pb-32 pt-6">
        <WCard><div className="mb-2"><Lbl>Food style</Lbl></div><PPill opts={["Veg", "Vegan", "Egg", "Non-veg"]} def="Veg" /></WCard>
        <WCard><div className="mb-2"><Lbl>Main meals / day</Lbl></div><PPill opts={["1", "2", "3", "4+"]} def="3" /></WCard>
        <WCard><div className="mb-2"><Lbl>Snacks / day</Lbl></div><PPill cols={5} opts={["0", "1", "2", "3", "4+"]} def="1" /></WCard>
        <WCard>
          <div className="mb-2"><Lbl>Meal timing</Lbl></div>
          <div className="grid grid-cols-2 gap-2.5">{[["Breakfast", "8:30 AM"], ["Dinner", "7:30 PM"]].map(([k, v]) => (
            <div key={k} className="rounded-xl bg-[#f1f4f5] p-3"><span className="text-[12px] text-[#424845]">{k}</span><div className="mt-0.5 flex items-center justify-between"><span className="text-[17px] font-semibold text-[#181c1d]" style={SERIF}>{v}</span><MS name="schedule" size={17} className="text-[#7E7268]" /></div></div>
          ))}</div>
        </WCard>
        <WCard><div className="mb-2"><Lbl>Water / day (L)</Lbl></div><PPill cols={3} opts={["< 1.5", "1.5–2", "2–2.5", "2.5–3", "3–3.5", "3.5+"]} def="2.5–3" /></WCard>
      </main>
      <PremCTA label="Finish profile" />
    </div>
  );
}

/* ===== warm-terracotta button colour comparison ===== */
function BtnCompare() {
  const OPTS: { name: string; note: string; bg: string; pill: string; txt?: string }[] = [
    { name: "Current", note: "Flat, desaturated taupe — reads muddy", bg: "#9C7C6B", pill: "#9C7C6B" },
    { name: "A · Rich terracotta", note: "Warmer + more saturated, still soft", bg: "#B4633C", pill: "#B4633C" },
    { name: "B · Terracotta gradient", note: "Adds depth & premium feel (recommended)", bg: "linear-gradient(135deg,#C67A4E 0%,#A24E28 100%)", pill: "linear-gradient(135deg,#C67A4E,#A24E28)" },
    { name: "C · Burnt sienna", note: "Brighter, confident, energetic", bg: "#C0663A", pill: "#C0663A" },
    { name: "D · Deep espresso", note: "Grounded & luxe, high contrast", bg: "#5A4231", pill: "#5A4231" },
  ];
  return (
    <div style={SANS} className="min-h-svh" >
      <div style={{ background: "#FBF5EE" }} className="min-h-svh px-6 pb-16 pt-[calc(env(safe-area-inset-top)+1.5rem)]">
        <h1 className="text-[26px] font-semibold tracking-tight text-[#2B2119]" style={SERIF}>Button colour options</h1>
        <p className="mt-1 text-[13px] text-[#7A6A5C]">Same warm theme — pick the Next button + selected-pill colour.</p>
        <div className="mt-6 flex flex-col gap-5">
          {OPTS.map((o) => (
            <div key={o.name} className="rounded-2xl bg-white/70 p-4 ring-1 ring-[#EADFD3]">
              <div className="mb-3 flex items-baseline justify-between"><span className="text-[13px] font-bold text-[#2B2119]">{o.name}</span><span className="text-[11px] text-[#9A8676]">{o.note}</span></div>
              <div className="flex items-center gap-2.5">
                {/* selected pill + an unselected for context */}
                <span className="rounded-full px-4 py-2 text-[13px] font-semibold text-white shadow-sm" style={{ background: o.pill }}>Beginner</span>
                <span className="rounded-full bg-[#F1E7DB] px-4 py-2 text-[13px] font-semibold text-[#7A6A5C]">Intermediate</span>
              </div>
              <button className="mt-3 flex h-12 w-full items-center justify-center gap-2 rounded-full text-[14px] font-semibold text-white shadow-[0_12px_28px_-12px_rgba(90,50,30,0.55)] active:scale-[0.99]" style={{ background: o.bg }}>Next <MS name="arrow_forward" size={18} /></button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

/* ===== warm terracotta screens (gradient-B buttons & selected pills) ===== */
const CREAM = "#FBF5EE", INK2 = "#2B2119", MUT2 = "#7A6A5C", FAINT2 = "#9A8676", TERRA = "#A24E28", GRADB = "linear-gradient(135deg,#C67A4E 0%,#A24E28 100%)", TINT2 = "#F3E7DB", BORD2 = "#EADFD3";
/* text hierarchy: softened serif headline → FOOD-STYLE taupe sub-headline → lighter 3rd micro-label → body stays MUT2 */
const HEAD = "#453C35", SUBH = "#94806D", MICRO = "#B2A496";
function HeroArt() {
  return (
    <div className="mb-5 h-[150px] w-full overflow-hidden rounded-2xl ring-1 ring-[#EADFD3]">
      <svg viewBox="0 0 390 150" preserveAspectRatio="xMidYMid slice" className="h-full w-full">
        <defs>
          <linearGradient id="sky" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#FCF3E8" /><stop offset="1" stopColor="#F1DCC6" /></linearGradient>
          <radialGradient id="sun" cx="0.74" cy="0.4" r="0.55"><stop offset="0" stopColor="#F2D0AA" /><stop offset="1" stopColor="#F2D0AA" stopOpacity="0" /></radialGradient>
        </defs>
        <rect width="390" height="150" fill="url(#sky)" />
        <circle cx="286" cy="58" r="82" fill="url(#sun)" />
        <circle cx="286" cy="58" r="25" fill="#E7BA8F" />
        <path d="M0 118 C 90 94, 150 126, 220 110 S 340 94, 390 116 L390 150 L0 150Z" fill="#E8C7A7" />
        <path d="M0 131 C 100 110, 182 140, 262 125 S 360 117, 390 131 L390 150 L0 150Z" fill="#D7AD86" />
        <g stroke="#B4633C" strokeWidth="2" fill="none" strokeLinecap="round"><path d="M62 120 C 59 98, 68 80, 80 70" /></g>
        <g fill="#C98A5E"><ellipse cx="72" cy="92" rx="9" ry="4" transform="rotate(-35 72 92)" /><ellipse cx="84" cy="80" rx="9" ry="4" transform="rotate(-20 84 80)" /><ellipse cx="65" cy="105" rx="8" ry="3.5" transform="rotate(-50 65 105)" /><ellipse cx="300" cy="128" rx="11" ry="4.5" transform="rotate(-28 300 128)" opacity="0.8" /><ellipse cx="316" cy="118" rx="11" ry="4.5" transform="rotate(-12 316 118)" opacity="0.8" /></g>
        <g stroke="#B4633C" strokeWidth="1.8" fill="none" strokeLinecap="round" opacity="0.8"><path d="M322 132 C 318 118, 320 108, 310 100" /></g>
      </svg>
    </div>
  );
}
function WarmShell({ title, pct, cta = "Next", hero = false, children }: { title: string; pct: number; cta?: string; hero?: boolean; children: React.ReactNode }) {
  return (
    <div className="min-h-svh" style={{ background: CREAM, ...SANS }}>
      <header className="fixed inset-x-0 top-0 z-50 border-b border-[#EADFD3] bg-[#FBF5EE]/85 pt-[env(safe-area-inset-top)] backdrop-blur-xl">
        <div className="flex h-16 items-center gap-3 px-6">
          <button aria-label="Back" className="flex h-10 w-10 items-center justify-center rounded-full border border-[#EADFD3] bg-white/70 text-[#2B2119]"><MS name="arrow_back_ios_new" size={18} /></button>
          <h1 className="flex-1 text-center text-[22px] font-semibold tracking-tight" style={{ ...SERIF, color: HEAD }}>{title}</h1>
          <div className="w-10" />
        </div>
        <div className="px-6 pb-2.5"><div className="h-1.5 w-full overflow-hidden rounded-full bg-[#EADFD3]"><div className="h-full rounded-full" style={{ width: `${pct}%`, background: GRADB }} /></div></div>
      </header>
      <main className="px-6 pb-40 pt-[6.25rem]">{hero && <HeroArt />}{children}</main>
      <div className="fixed inset-x-0 bottom-0 z-40 bg-gradient-to-t from-[#FBF5EE] via-[#FBF5EE]/95 to-transparent px-6 pb-3 pt-4">
        <button className="flex h-13 w-full items-center justify-center gap-2 rounded-full py-3.5 text-[14px] font-semibold text-white shadow-[0_14px_30px_-12px_rgba(162,78,40,0.6)] active:scale-[0.99]" style={{ background: GRADB }}>{cta} <MS name="arrow_forward" size={18} /></button>
        <nav className="mt-3 flex items-center justify-around rounded-full border border-[#EADFD3] bg-white/80 px-4 py-2 text-[#9A8676]">
          {["home", "favorite", "grid_view", "school", "auto_awesome", "person"].map((i, n) => <MS key={i} name={i} size={20} className={n === 0 ? "text-[#A24E28]" : ""} />)}
        </nav>
      </div>
    </div>
  );
}
function WIntro({ children }: { children: React.ReactNode }) { return <p className="mb-5 text-[14px] leading-relaxed text-[#7A6A5C]">{children}</p>; }
function WSecLbl({ icon, children, sub }: { icon?: string; children: React.ReactNode; sub?: string }) {
  return <div className="mb-2.5 flex items-center gap-2"><div className="flex items-center gap-2">{icon && <MS name={icon} size={18} className="text-[#A24E28]" />}<span className="text-[13px] font-bold uppercase tracking-wider" style={{ color: SUBH }}>{children}</span></div>{sub && <span className="text-[12px] text-[#9A8676]">· {sub}</span>}</div>;
}
function WPills({ opts, def, cols = 4 }: { opts: { l: string; icon?: string }[]; def: string; cols?: number }) {
  const [v, setV] = useState(def);
  return (
    <div className="grid gap-2" style={{ gridTemplateColumns: `repeat(${cols}, minmax(0,1fr))` }}>
      {opts.map((o) => { const on = v === o.l; return <button key={o.l} onClick={() => setV(o.l)} className="flex items-center justify-center gap-1 rounded-full px-2 py-2.5 text-center text-[12.5px] font-semibold transition-all active:scale-95" style={on ? { background: GRADB, color: "#fff" } : { background: TINT2, color: MUT2 }}>{o.icon && <MS name={o.icon} size={15} />}{o.l}</button>; })}
    </div>
  );
}

function WCalGoal() {
  const rows = [["spa", "At rest (BMR)", "Calories your body needs at complete rest", "1,628", INK2], ["directions_run", "Your activity burn", "Mostly sitting, 20 min yoga", "~250", TERRA], ["restaurant", "Maintenance calories", "To maintain your current weight", "1,878", INK2]];
  return (
    <WarmShell title="Your daily calorie goal" pct={55}>
      <WIntro>Now let's talk calories — what your body burns, and the number to aim for.</WIntro>
      {/* BMR hero */}
      <div className="relative overflow-hidden rounded-2xl p-5" style={{ background: "#FBF3EA", border: `1px solid ${BORD2}` }}>
        <div className="pointer-events-none absolute -right-8 -top-8 h-32 w-32 rounded-full" style={{ background: "rgba(198,122,78,0.14)", filter: "blur(22px)" }} />
        <p className="relative text-[11px] font-bold uppercase tracking-wider" style={{ color: TERRA }}>Your BMR</p>
        <div className="relative flex items-baseline gap-1"><span className="text-[40px] font-semibold leading-none tracking-tight" style={{ ...SERIF, color: TERRA }}>1,628</span></div>
        <p className="relative mt-2 text-[13px] leading-snug text-[#7A6A5C]">kcal your body burns<br />at rest, every day</p>
      </div>
      {/* target banner (gradient) */}
      <div className="mt-4 flex items-center justify-between gap-3 rounded-2xl p-4 text-white shadow-[0_14px_30px_-14px_rgba(162,78,40,0.55)]" style={{ background: GRADB }}>
        <div className="flex items-center gap-3"><div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-white/15"><MS name="target" size={20} fill /></div><div className="flex flex-col"><span className="text-[14px] font-semibold leading-snug">Your daily calorie target</span><span className="text-[12px] text-white/80">to lose weight gently (~0.4 kg/week)</span></div></div>
        <div className="shrink-0 text-right"><span className="text-[26px] font-semibold tracking-tight" style={SERIF}>1,425</span><span className="-mt-1 block text-[11px] text-white/80">kcal/day</span></div>
      </div>
      {/* breakdown */}
      <p className="mb-2.5 mt-6 text-[13px] font-bold uppercase tracking-wider" style={{ color: SUBH }}>How we got here</p>
      <div className="flex flex-col gap-2.5">
        {rows.map(([ic, t, s, v, col]) => (
          <div key={t} className="flex items-center justify-between rounded-2xl bg-white p-3.5 shadow-sm">
            <div className="flex items-center gap-3"><div className="flex h-10 w-10 items-center justify-center rounded-full" style={{ background: "#F3E7DB", color: TERRA }}><MS name={ic} size={19} /></div><div className="flex flex-col"><span className="text-[14px] font-semibold" style={{ color: SUBH }}>{t}</span><span className="text-[11.5px] text-[#9A8676]">{s}</span></div></div>
            <div className="text-right"><span className="text-[15px] font-semibold" style={{ color: col }}>{v}</span><span className="-mt-1 block text-[11px] text-[#9A8676]">kcal/day</span></div>
          </div>
        ))}
        <div className="flex items-center justify-between rounded-2xl p-3.5" style={{ background: "#F7E7DC" }}>
          <div className="flex items-center gap-3"><div className="flex h-10 w-10 items-center justify-center rounded-full bg-white/70" style={{ color: TERRA }}><MS name="trending_down" size={19} /></div><div className="flex flex-col"><span className="text-[14px] font-semibold" style={{ color: TERRA }}>Calorie deficit</span><span className="text-[11.5px]" style={{ color: "#8A5A42" }}>A safe, steady pace — 453 kcal/day below maintenance</span></div></div>
          <div className="text-right"><span className="text-[15px] font-semibold" style={{ color: TERRA }}>−453</span><span className="-mt-1 block text-[11px]" style={{ color: "#8A5A42" }}>kcal/day</span></div>
        </div>
      </div>
    </WarmShell>
  );
}

const CAL_IN = [["🫓", "1 roti/phulka", "~100"], ["🍚", "1 bowl rice", "~200"], ["🥣", "1 bowl dal", "~120"], ["🥗", "1 cup sabzi", "~150"], ["🥛", "1 glass milk", "~120"], ["🧈", "1 tsp ghee/oil", "~45"], ["🍬", "1 tsp sugar", "~20"], ["🍎", "1 fruit bowl", "~90"]];
const CAL_OUT = [["👟", "5,000 steps", "~200"], ["🧘", "20 min yoga", "~90"], ["🏋️", "20 min exercise", "~180"], ["🚴", "20 min cycling", "~160"], ["🏊", "20 min swimming", "~200"], ["🧹", "30 min housework", "~80"]];
function WCalSense() {
  const grid = (items: string[][], col: string) => (
    <div className="grid grid-cols-2 gap-x-3 gap-y-2.5">
      {items.map(([e, n, k]) => (
        <div key={n} className="flex items-center gap-2"><span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#F3E7DB] text-[16px]">{e}</span><span className="min-w-0 flex-1 truncate text-[12.5px] text-[#2B2119]">{n}</span><span className="shrink-0 text-right text-[12px] font-bold" style={{ color: col }}>{k}<span className="block -mt-0.5 text-[9px] font-medium text-[#9A8676]">kcal</span></span></div>
      ))}
    </div>
  );
  return (
    <WarmShell title="A quick calorie sense" pct={45}>
      <WIntro>Now we'll build your diet plan — first, a quick feel for how calories work.</WIntro>
      <div className="rounded-2xl bg-white p-4 shadow-sm"><WSecLbl icon="restaurant" sub="Common everyday foods (approx.)">Calories in</WSecLbl>{grid(CAL_IN, TERRA)}</div>
      <div className="mt-4 rounded-2xl bg-white p-4 shadow-sm"><WSecLbl icon="local_fire_department" sub="Everyday activities (approx.)">Calories out</WSecLbl>{grid(CAL_OUT, "#B4633C")}</div>
      <div className="mt-4 rounded-2xl p-3.5" style={{ background: "#EAF1F7", border: "1px solid #D7E4EF" }}>
        <div className="mb-2 flex items-center gap-1.5"><span className="text-[15px]">💧</span><span className="text-[13px] font-bold text-[#2B5876]">Stay hydrated <span className="font-medium text-[#5E7A94]">(almost zero calories)</span></span></div>
        <div className="flex justify-between gap-1 text-center">{[["💧", "Water"], ["🍵", "Green / black tea"], ["☕", "Black coffee (no sugar)"], ["🫚", "Ginger water"], ["🍋", "Lemon water"]].map(([e, n]) => <div key={n} className="flex flex-1 flex-col items-center gap-1"><span className="flex h-9 w-9 items-center justify-center rounded-full bg-white text-[16px]">{e}</span><span className="text-[9.5px] leading-tight text-[#5E7A94]">{n}</span></div>)}</div>
      </div>
    </WarmShell>
  );
}

function WYoga() {
  return (
    <WarmShell title="Set up your yoga" pct={35}>
      <WIntro>Let's customise your yoga practice to your needs and comfort.</WIntro>
      <WSecLbl>Your level</WSecLbl>
      <WPills cols={3} opts={[{ l: "Beginner" }, { l: "Intermediate" }, { l: "Advanced" }]} def="Beginner" />
      <p className="mt-3 text-[13px] leading-relaxed text-[#7A6A5C]">We start at a pace that suits your level — you can increase it week on week as you progress.</p>
      <div className="mt-5"><WSecLbl>How long each session?</WSecLbl><WPills cols={4} opts={[{ l: "10 min" }, { l: "15 min" }, { l: "20 min" }, { l: "30 min" }, { l: "45 min" }, { l: "60 min" }]} def="20 min" /></div>
      <div className="mt-4 flex items-start gap-3 rounded-2xl p-3.5" style={{ background: "#F7E7DC" }}>
        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-white/70" style={{ color: TERRA }}><MS name="self_improvement" size={19} /></div>
        <div><p className="text-[13px] font-semibold" style={{ color: TERRA }}>~ 90–110 cal burned per session</p><p className="text-[11.5px] text-[#8A5A42]">A 20-min beginner session, for your body weight.</p></div>
      </div>
      <div className="mt-5"><WSecLbl>Any areas to protect?</WSecLbl>
        <WPills cols={3} opts={[{ l: "None", icon: "block" }, { l: "Knees", icon: "accessibility_new" }, { l: "Lower back", icon: "airline_seat_recline_normal" }, { l: "Neck", icon: "face" }, { l: "Shoulders", icon: "sports_gymnastics" }, { l: "Wrists", icon: "back_hand" }, { l: "Hips", icon: "directions_walk" }]} def="None" />
      </div>
    </WarmShell>
  );
}

/* ===== warm create-profile + goals (gradient-B) ===== */
function WLbl({ children }: { children: React.ReactNode }) { return <span className="text-[11px] font-bold uppercase tracking-wider" style={{ color: MICRO }}>{children}</span>; }
function WCardW({ children }: { children: React.ReactNode }) { return <div className="rounded-2xl bg-white p-4 shadow-[0_10px_26px_-18px_rgba(90,50,30,0.35)]">{children}</div>; }

function WAbout() {
  const [g, setG] = useState("Female"); const [hU, setHU] = useState("cm"); const [wU, setWU] = useState("kg");
  return (
    <WarmShell title="About you" pct={20} cta="Continue" hero>
      <WIntro>A few essentials so every plan fits you.</WIntro>
      <div className="flex flex-col gap-4">
        <WCardW><WLbl>Name</WLbl><div className="mt-2 flex items-center gap-3"><div className="flex h-9 w-9 items-center justify-center rounded-full" style={{ background: "#F3E7DB", color: TERRA }}><MS name="badge" size={18} /></div><input defaultValue="Elena" className="w-full bg-transparent text-[18px] text-[#2B2119] focus:outline-none" /></div></WCardW>
        <WCardW><WLbl>Gender</WLbl><div className="mt-3 grid grid-cols-3 gap-2">{["Male", "Female", "Other"].map((x) => { const on = g === x; return <button key={x} onClick={() => setG(x)} className="flex items-center justify-center gap-1.5 rounded-full px-3 py-2.5 text-[14px] font-semibold transition-all" style={on ? { background: GRADB, color: "#fff" } : { background: TINT2, color: MUT2 }}>{on && <MS name="check" size={16} />}{x}</button>; })}</div></WCardW>
        <WCardW><WLbl>Age</WLbl><div className="mt-1.5 flex items-baseline gap-2"><input type="number" defaultValue={32} className="w-20 bg-transparent text-[26px] font-semibold text-[#2B2119] focus:outline-none" style={SERIF} /><span className="text-[15px] text-[#7A6A5C]">years</span></div></WCardW>
        <div className="grid grid-cols-2 gap-3">
          {[["Height", "178", hU, setHU, ["cm", "ft"], "height", "5 ft 10 in"], ["Weight", "68", wU, setWU, ["kg", "lb"], "monitor_weight", "150 lbs"]].map(([lab, val, u, setU, units, ic, conv]: any) => (
            <WCardW key={lab}><div className="flex items-center justify-between"><WLbl>{lab}</WLbl><div className="flex rounded-full bg-[#F3E7DB] p-0.5">{units.map((x: string) => <button key={x} onClick={() => setU(x)} className="rounded-full px-2 py-0.5 text-[12px] transition-all" style={u === x ? { background: "#fff", color: TERRA, fontWeight: 700 } : { color: MUT2 }}>{x}</button>)}</div></div><div className="mt-2 flex items-baseline gap-1.5"><span className="text-[24px] font-semibold text-[#2B2119]" style={SERIF}>{val}</span><span className="text-[14px] text-[#7A6A5C]">{u}</span></div><div className="mt-2 flex items-center gap-1 text-[12px]" style={{ color: TERRA }}><MS name={ic} size={13} />{conv}</div></WCardW>
          ))}
        </div>
      </div>
    </WarmShell>
  );
}

function WActivity() {
  const [sel, setSel] = useState("Lightly active");
  return (
    <WarmShell title="Activity level" pct={40} cta="Continue" hero>
      <WIntro>Choose what best matches your typical daily routine.</WIntro>
      <div className="flex flex-col gap-3.5">
        {CP_ACT.map((a) => { const on = sel === a.label; return (
          <button key={a.label} onClick={() => setSel(a.label)} className="flex flex-col rounded-2xl bg-white p-4 text-left transition-all active:scale-[0.99]" style={on ? { boxShadow: "0 14px 30px -16px rgba(162,78,40,0.5)", border: `1.5px solid ${TERRA}` } : { boxShadow: "0 10px 26px -20px rgba(90,50,30,0.4)", border: `1px solid ${BORD2}` }}>
            <div className="flex items-center justify-between gap-2">
              <div className="flex min-w-0 items-center gap-3"><div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full text-white" style={{ background: on ? GRADB : "#D9C3B2" }}><MS name={a.icon} size={22} /></div><div className="flex min-w-0 flex-col"><span className="text-[15px] font-semibold" style={{ color: SUBH }}>{a.label}</span><span className="mt-0.5 text-[11px] font-semibold" style={{ color: TERRA }}>{a.cal}</span></div></div>
              <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-white" style={on ? { background: GRADB } : { background: "#EFE3D7", color: "transparent" }}><MS name="check" size={16} fill={on} /></div>
            </div>
            <p className="mt-2 pl-[56px] text-[12px] leading-[16px] text-[#7A6A5C]">{a.desc}</p>
          </button>
        ); })}
      </div>
    </WarmShell>
  );
}

function WSleep() {
  return (
    <WarmShell title="Sleep" pct={60} cta="Continue" hero>
      <WIntro>Let's calibrate your nightly recovery rhythm.</WIntro>
      <div className="flex flex-col gap-3">
        <WCardW><div className="flex items-center justify-between"><div className="flex items-center gap-1.5"><MS name="bedtime" size={16} className="text-[#A24E28]" /><WLbl>Bedtime</WLbl></div><span className="text-[11px] text-[#9A8676]">Usual window</span></div><div className="mt-2 flex h-11 items-center justify-between rounded-xl bg-[#F3E7DB] px-3.5 text-[14px] font-medium text-[#2B2119]">10:30 PM – 11:00 PM<MS name="unfold_more" size={18} className="text-[#9A8676]" /></div></WCardW>
        <WCardW><div className="flex items-center justify-between"><div className="flex items-center gap-1.5"><MS name="schedule" size={16} className="text-[#A24E28]" /><WLbl>Sleep duration</WLbl></div><span className="rounded-full px-2.5 py-0.5 text-[13px] font-semibold text-white" style={{ background: GRADB }}>7.5 hrs</span></div><div className="mt-3"><div className="relative h-1.5 w-full rounded-full bg-[#EFE3D7]"><div className="absolute inset-y-0 left-0 rounded-full" style={{ width: "62%", background: GRADB }} /><div className="absolute top-1/2 h-4 w-4 -translate-y-1/2 rounded-full bg-white" style={{ left: "60%", boxShadow: `0 0 0 2px ${TERRA}` }} /></div><div className="mt-1.5 flex justify-between px-1 text-[11px] text-[#9A8676]"><span>4h</span><span>6h</span><span>8h</span><span>10h</span></div></div></WCardW>
        <WCardW><div className="mb-2 flex items-center gap-1.5"><MS name="timelapse" size={16} className="text-[#A24E28]" /><WLbl>Time to fall asleep</WLbl></div><WPills cols={2} opts={[{ l: "< 10 min" }, { l: "10–20 min" }, { l: "20–40 min" }, { l: "40+ min" }]} def="10–20 min" /></WCardW>
        <WCardW><div className="mb-2 flex items-center gap-1.5"><MS name="wb_twilight" size={16} className="text-[#A24E28]" /><WLbl>Daytime nap</WLbl></div><WPills cols={3} opts={[{ l: "No" }, { l: "Sometimes" }, { l: "Daily" }]} def="Sometimes" /></WCardW>
        <WCardW><div className="mb-2 flex items-center gap-1.5"><MS name="wb_sunny" size={16} className="text-[#A24E28]" /><WLbl>Waking feeling</WLbl></div><WPills cols={3} opts={[{ l: "Fresh" }, { l: "Balanced" }, { l: "Tired" }]} def="Balanced" /></WCardW>
      </div>
    </WarmShell>
  );
}

function WFood() {
  return (
    <WarmShell title="Food & meals" pct={80} cta="Continue" hero>
      <WIntro>So your plan uses food you love.</WIntro>
      <div className="flex flex-col gap-3">
        <WCardW><div className="mb-2"><WLbl>Food style</WLbl></div><WPills opts={[{ l: "Veg" }, { l: "Vegan" }, { l: "Egg" }, { l: "Non-veg" }]} def="Veg" /></WCardW>
        <WCardW><div className="mb-2"><WLbl>Main meals / day</WLbl></div><WPills opts={[{ l: "1" }, { l: "2" }, { l: "3" }, { l: "4+" }]} def="3" /></WCardW>
        <WCardW><div className="mb-2"><WLbl>Snacks / day</WLbl></div><WPills cols={5} opts={[{ l: "0" }, { l: "1" }, { l: "2" }, { l: "3" }, { l: "4+" }]} def="1" /></WCardW>
        <WCardW><div className="mb-2"><WLbl>Meal timing</WLbl></div><div className="grid grid-cols-2 gap-2.5">{[["Breakfast", "8:30 AM"], ["Dinner", "7:30 PM"]].map(([k, v]) => <div key={k} className="rounded-xl bg-[#F3E7DB] p-3"><span className="text-[12px] text-[#7A6A5C]">{k}</span><div className="mt-0.5 flex items-center justify-between"><span className="text-[17px] font-semibold text-[#2B2119]" style={SERIF}>{v}</span><MS name="schedule" size={17} className="text-[#A24E28]" /></div></div>)}</div></WCardW>
        <WCardW><div className="mb-2"><WLbl>Water / day (L)</WLbl></div><WPills cols={3} opts={[{ l: "< 1.5" }, { l: "1.5–2" }, { l: "2–2.5" }, { l: "2.5–3" }, { l: "3–3.5" }, { l: "3.5+" }]} def="2.5–3" /></WCardW>
      </div>
    </WarmShell>
  );
}

const GOALS = [["⚖️", "Weight loss"], ["🌙", "Better sleep"], ["🧘", "Stress & calm"], ["⚡", "Energy & vitality"], ["🌀", "Gut & digestion"], ["❤️", "Heart health"], ["💪", "Fitness & strength"], ["🌿", "Healthy ageing"]];
function WGoals() {
  const [sel, setSel] = useState<string[]>(["Weight loss", "Better sleep"]);
  const tog = (l: string) => setSel((s) => s.includes(l) ? s.filter((x) => x !== l) : s.length >= 2 ? s : [...s, l]);
  return (
    <WarmShell title="Pick your top goals" pct={100} cta="Continue" hero>
      <WIntro>Choose up to 2 — we'll build your whole plan around them.</WIntro>
      <div className="grid grid-cols-2 gap-3">
        {GOALS.map(([e, l]) => { const on = sel.includes(l); return (
          <button key={l} onClick={() => tog(l)} className="relative flex flex-col items-start gap-3 rounded-2xl bg-white p-4 text-left transition-all active:scale-[0.98]" style={on ? { border: `1.5px solid ${TERRA}`, boxShadow: "0 14px 30px -16px rgba(162,78,40,0.5)" } : { border: `1px solid ${BORD2}`, boxShadow: "0 10px 26px -20px rgba(90,50,30,0.4)" }}>
            {on && <div className="absolute right-3 top-3 flex h-5 w-5 items-center justify-center rounded-full text-white" style={{ background: GRADB }}><MS name="check" size={13} fill /></div>}
            <span className="flex h-12 w-12 items-center justify-center rounded-2xl text-[22px]" style={{ background: on ? "#F7E7DC" : "#F3E7DB" }}>{e}</span>
            <span className="text-[14.5px] font-semibold leading-tight" style={{ color: SUBH }}>{l}</span>
          </button>
        ); })}
      </div>
      <p className="mt-4 text-center text-[12px] text-[#9A8676]">{sel.length}/2 selected</p>
    </WarmShell>
  );
}

/* ===================== NEW WARM BASE (from WeightLossScreen.tsx) ===================== */
const NW_BG = "#FFF8F1";
const NW_CARD_GRAD = "radial-gradient(ellipse at top right,#F9E8D5 0%,#FFF8F1 48%,#FFF4EA 100%)";
const NW_INK = "#2B211B";     // serif headline / big values
const NW_TEXT = "#39332F";    // card title / primary
const NW_SUB = "#6B625B";     // body / subtitle
const NW_LABEL = "#9A8575";   // micro field label
const NW_ACCENT = "#8F4B25";  // brown accent (icons, chevrons)
const NW_GRAD = "linear-gradient(to right,#8F4B25,#C88A60)";  // progress + selected
const NW_CTA = "linear-gradient(to right,#A77B60,#95674D)";   // next button
const NW_TONES: Record<string, string> = {
  peach: "bg-[#FCE9D8] text-[#9A4D1D]",
  cream: "bg-[#F9EED6] text-[#A36A22]",
  green: "bg-[#EEF1D0] text-[#557C20]",
  rose: "bg-[#FCE3DF] text-[#C83B35]",
};
const NW_NAV: [string, any][] = [["Home", House], ["Favorites", Heart], ["Explore", LayoutGrid], ["Learn", GraduationCap], ["Wellness", Sparkles], ["Profile", UserRound]];

function NWShell({ title, subtitle, pct, cta = "Next", emoji, leaf = true, heroArt, children }: { title: string; subtitle?: string; pct: number; cta?: string; emoji?: string; leaf?: boolean; heroArt?: React.ReactNode; children: React.ReactNode }) {
  return (
    <div className="min-h-svh w-full px-4 py-5" style={{ background: NW_BG, color: NW_TEXT, ...SANS }}>
      <div className="mx-auto flex min-h-[calc(100svh-2.5rem)] w-full max-w-[440px] flex-col overflow-hidden rounded-[30px] shadow-[0_8px_32px_rgba(105,67,42,0.10)]" style={{ background: NW_CARD_GRAD }}>
        <header className="relative px-5 pt-5">
          <div className="flex items-center gap-3">
            <button aria-label="Back" className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-white/85 shadow-sm" style={{ color: NW_TEXT }}><ArrowLeft size={19} strokeWidth={1.8} /></button>
            <div className="h-[6px] flex-1 overflow-hidden rounded-full" style={{ background: "#E5D9D0" }}><div className="h-full rounded-full" style={{ width: `${pct}%`, background: NW_GRAD }} /></div>
          </div>
          {heroArt ? (
            <div className="pointer-events-none absolute right-1 top-[30px] h-[122px] w-[152px]">{heroArt}</div>
          ) : emoji && (
            <div className="pointer-events-none absolute right-4 top-[62px] flex h-[110px] w-[110px] items-center justify-center">
              {leaf && <div className="absolute -right-1 top-0 text-[28px] opacity-80">🌿</div>}
              <div className="relative mt-6 text-[64px] leading-none drop-shadow-sm">{emoji}</div>
            </div>
          )}
          <div className="relative z-10 mt-6 pr-2">
            <h1 className="text-[30px] font-semibold leading-[1.12] tracking-[-0.6px]" style={{ ...SERIF, color: NW_INK, maxWidth: emoji || heroArt ? 235 : undefined }}>{title}</h1>
            {subtitle && <p className="mt-3 text-[14px] leading-[1.55]" style={{ color: NW_SUB, maxWidth: heroArt ? 225 : 270 }}>{subtitle}</p>}
          </div>
        </header>
        <div className="mt-5 flex flex-1 flex-col gap-3 px-4">{children}</div>
        <div className="px-5 pb-4 pt-5">
          <button className="flex h-[52px] w-full items-center justify-center gap-3 rounded-full text-[15px] font-medium text-white shadow-[0_4px_12px_rgba(116,72,45,0.16)]" style={{ background: NW_CTA }}>{cta} <ArrowRight size={19} strokeWidth={1.8} /></button>
        </div>
        <nav className="mx-4 mb-4 flex h-[58px] items-center justify-around rounded-full border border-white/90 bg-white/65 px-2 shadow-[0_3px_12px_rgba(121,79,50,0.06)]">
          {NW_NAV.map(([label, Icon]) => <button key={label} aria-label={label} className="grid h-10 w-10 place-items-center rounded-full" style={{ color: "#75401F" }}><Icon size={19} strokeWidth={1.65} /></button>)}
        </nav>
      </div>
    </div>
  );
}
function NWCard({ children }: { children: React.ReactNode }) { return <div className="rounded-[22px] border border-white/90 bg-white/65 p-4 shadow-[0_3px_12px_rgba(121,79,50,0.06)]">{children}</div>; }
function NWLbl({ children }: { children: React.ReactNode }) { return <span className="text-[11px] font-bold uppercase tracking-wider" style={{ color: NW_LABEL }}>{children}</span>; }
function NWPills({ opts, def, cols = 4 }: { opts: { l: string }[]; def: string; cols?: number }) {
  const [v, setV] = useState(def);
  return (
    <div className="grid gap-2" style={{ gridTemplateColumns: `repeat(${cols},minmax(0,1fr))` }}>
      {opts.map((o) => { const on = v === o.l; return <button key={o.l} onClick={() => setV(o.l)} className="flex items-center justify-center rounded-full px-2 py-2.5 text-center text-[12.5px] font-medium transition-all active:scale-95" style={on ? { background: NW_GRAD, color: "#fff" } : { background: "#F4E9DB", color: NW_SUB }}>{o.l}</button>; })}
    </div>
  );
}

/* Weight-loss screen — faithful rebuild of the shared HTML (terracotta #8E5A3C,
   Plus Jakarta Sans, Material Symbols icons in pastel circles, 🥗 badge). */
const WL_CARDS: [string, string, string, string, string, string][] = [
  ["Cut calories gently", "A small, sustainable reduction that works", "restaurant", "#FAECE2", "#B05B27", "calories.png"],
  ["Eat enough protein", "Keeps you full for longer", "egg_alt", "#FEF4DC", "#A67812", "protein.png"],
  ["Choose better carbs (low-GI)", "Steady energy, no sudden crashes", "eco", "#EAF4E8", "#3D7834", "carbs.png"],
  ["Start with a salad", "Helps you feel full, so you eat less", "soup_kitchen", "#FFF0E0", "#BC671F", "salad.png"],
  ["Include sprouts at breakfast", "Nutrient-rich and light on calories", "nutrition", "#FCECEE", "#B83D4F", "sprouts.png"],
  ["Go easy on nuts & dry fruits", "Nutritious, but calorie-dense — keep portions small", "grain", "#FBF0DD", "#A66E14", "nuts.png"],
  ["Chew well, eat slowly", "Gives your brain time to feel satisfied", "self_improvement", "#FAEBEE", "#B84058", "chew.png"],
];
function NWWeightLoss() {
  return (
    <div className="min-h-svh" style={{ background: "#FFF8F2", color: "#39332F", ...INTER }}>
      <main className="relative mx-auto flex min-h-svh w-full flex-col overflow-hidden" style={{ background: "#FFF8F2" }}>
        <div className="pointer-events-none absolute -right-10 -top-10 h-52 w-52 rounded-full bg-amber-100/35 blur-3xl" />
        <div className="pointer-events-none absolute -left-12 top-1/3 h-48 w-48 rounded-full bg-orange-100/25 blur-3xl" />
        <div className="relative z-10 flex-1 overflow-y-auto px-5 pb-24 pt-5">
          <header className="mb-5 flex items-center gap-4">
            <button aria-label="Go back" className="flex h-10 w-10 items-center justify-center rounded-full border border-stone-200/70 bg-white/95 text-stone-700 shadow-sm active:scale-95"><MS name="arrow_back" size={20} /></button>
            <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-stone-200/80"><div className="h-full rounded-full" style={{ width: "38%", background: "#A07859" }} /></div>
          </header>
          <div className="relative mb-4">
            <h1 className="mb-2 whitespace-nowrap text-[24px] font-semibold leading-[1.15] tracking-[-0.01em]" style={{ ...PLAYFAIR, color: "#2B211B" }}>How weight loss works</h1>
            <p className="text-[13px] leading-[1.5]" style={{ color: "#6B625B", maxWidth: 220 }}>Weight loss is mostly about food — the steady, no-starving way. Tap any card to see why it works.</p>
            {/* Hero illustration — /images/weightloss/hero.png (🥗 badge is the fallback) */}
            <div className="pointer-events-none absolute right-[-6px] top-[2px] h-[100px] w-[104px]">
              <img src="/images/weightloss/hero.png" alt="" className="h-full w-full object-contain drop-shadow-sm" onError={(e) => { const el = e.currentTarget; el.style.display = "none"; const fb = el.nextElementSibling as HTMLElement | null; if (fb) fb.style.display = "flex"; }} />
              <div className="absolute right-3 top-5 hidden h-16 w-16 rotate-6 items-center justify-center rounded-full border border-stone-200/60 bg-amber-50/90 shadow-sm"><span className="select-none text-3xl">🥗</span></div>
            </div>
          </div>
          <div className="space-y-3">
            {WL_CARDS.map(([title, sub, icon, bg, fg, img]) => (
              <div key={title} className="group flex cursor-pointer items-center gap-3 rounded-[20px] border px-3 py-2 shadow-[0_1px_5px_rgba(90,60,40,0.045)] transition-all active:scale-[0.99]" style={{ background: "#FFFDF9", borderColor: "#F4EEE5" }}>
                <div className="relative flex h-11 w-11 shrink-0 items-center justify-center overflow-hidden rounded-full" style={{ background: bg, color: fg }}><MS name={icon} size={22} /><img src={`/images/weightloss/${img}`} alt="" className="absolute inset-0 h-full w-full scale-[1.05] object-cover" onError={(e) => { e.currentTarget.style.display = "none"; }} /></div>
                <div className="min-w-0 flex-1">
                  <h2 className="text-[14.5px] font-semibold leading-snug" style={{ color: "#39332F" }}>{title}</h2>
                  <p className="text-[12px] leading-[1.35]" style={{ color: "#6B625B" }}>{sub}</p>
                </div>
                <span className="shrink-0" style={{ color: "#8E5A3C" }}><MS name="chevron_right" size={20} /></span>
              </div>
            ))}
          </div>
          <div className="mb-1 mt-4">
            <button className="flex w-full items-center justify-center gap-2 rounded-[26px] px-6 py-3.5 text-[15px] font-semibold text-white shadow-[0_6px_16px_-8px_rgba(110,70,45,0.55)] active:scale-[0.98]" style={{ background: "#8E5A3C" }}>Next <MS name="arrow_forward" size={18} /></button>
          </div>
        </div>
        <nav aria-label="Bottom Navigation" className="absolute inset-x-5 bottom-5 z-20 flex h-[54px] items-center justify-around rounded-full border px-4 backdrop-blur-md" style={{ background: "rgba(255,253,249,0.97)", borderColor: "#EEE2D4", boxShadow: "0 6px 20px -6px rgba(120,80,45,0.16)" }}>
          {["home", "favorite", "grid_view", "school", "auto_awesome", "person"].map((n, i) => (
            <button key={n} aria-label={n} className="flex items-center justify-center" style={{ color: i === 0 ? "#7E5234" : "#A9815F" }}><MS name={n} size={23} /></button>
          ))}
        </nav>
      </main>
    </div>
  );
}

function NWAbout() {
  const [g, setG] = useState("Male"); const [hU, setHU] = useState("cm"); const [wU, setWU] = useState("kg");
  return (
    <NWShell title="A little about you" subtitle="This helps us personalise your plan." pct={20} emoji="🌸" cta="Continue">
      <NWCard><NWLbl>Name</NWLbl>
        <div className="mt-2 flex items-center gap-3"><span className="grid h-9 w-9 place-items-center rounded-full bg-[#FCE9D8] text-[#9A4D1D]"><UserRound size={18} /></span><input defaultValue="rahul" className="w-full bg-transparent text-[18px] focus:outline-none" style={{ color: NW_INK }} /></div>
      </NWCard>
      <NWCard><NWLbl>Gender</NWLbl>
        <div className="mt-3 grid grid-cols-3 gap-2">{["Male", "Female", "Other"].map((x) => { const on = g === x; return <button key={x} onClick={() => setG(x)} className="flex items-center justify-center gap-1.5 rounded-full px-3 py-2.5 text-[14px] font-medium transition-all" style={on ? { background: NW_GRAD, color: "#fff" } : { background: "#F4E9DB", color: NW_SUB }}>{on && <Check size={15} />}{x}</button>; })}</div>
      </NWCard>
      <NWCard><NWLbl>Age</NWLbl>
        <div className="mt-1.5 flex items-baseline gap-2"><input type="number" defaultValue={32} className="w-20 bg-transparent text-[26px] font-semibold focus:outline-none" style={{ ...SERIF, color: NW_INK }} /><span className="text-[15px]" style={{ color: NW_SUB }}>years</span></div>
      </NWCard>
      <div className="grid grid-cols-2 gap-3">
        {[["Height", "178", hU, setHU, ["cm", "ft"], Ruler], ["Weight", "72", wU, setWU, ["kg", "lb"], Scale]].map(([lab, val, u, setU, units, Ic]: any) => (
          <NWCard key={lab}>
            <div className="flex items-center justify-between"><NWLbl>{lab}</NWLbl><div className="flex rounded-full bg-[#F4E9DB] p-0.5">{units.map((x: string) => <button key={x} onClick={() => setU(x)} className="rounded-full px-2 py-0.5 text-[12px]" style={u === x ? { background: "#fff", color: NW_ACCENT, fontWeight: 700 } : { color: NW_SUB }}>{x}</button>)}</div></div>
            <div className="mt-2 flex items-baseline gap-1.5"><span className="text-[24px] font-semibold" style={{ ...SERIF, color: NW_INK }}>{val}</span><span className="text-[14px]" style={{ color: NW_SUB }}>{u}</span><span className="ml-auto" style={{ color: NW_ACCENT }}><Ic size={16} /></span></div>
          </NWCard>
        ))}
      </div>
    </NWShell>
  );
}

const NW_ACT: [string, string, string, any, string][] = [
  ["Sedentary", "~50–150 cal/day", "Mostly sitting — desk, driving, screens.", Armchair, "cream"],
  ["Lightly active", "~150–300 cal/day", "Light chores + walking; 1–2 workouts a week.", Footprints, "peach"],
  ["Active", "~350–500 cal/day", "Workouts most days, or on your feet.", Dumbbell, "green"],
  ["Very active", "~600–900 cal/day", "Hard physical work or intense training.", Flame, "rose"],
];
function NWActivity() {
  const [sel, setSel] = useState("Lightly active");
  return (
    <NWShell title="Activity level" subtitle="Choose what best matches your typical day." pct={40} emoji="🚶" cta="Continue">
      {NW_ACT.map(([lab, cal, desc, Ic, tone]) => { const on = sel === lab; return (
        <button key={lab} onClick={() => setSel(lab)} className="flex w-full items-start gap-3 rounded-[22px] border bg-white/65 px-3.5 py-3 text-left transition" style={on ? { borderColor: NW_ACCENT, boxShadow: "0 6px 18px rgba(143,75,37,0.16)" } : { borderColor: "rgba(255,255,255,0.9)", boxShadow: "0 3px 12px rgba(121,79,50,0.06)" }}>
          <span className={`grid h-[52px] w-[52px] shrink-0 place-items-center rounded-full ${NW_TONES[tone]}`}><Ic size={24} strokeWidth={1.8} /></span>
          <span className="min-w-0 flex-1">
            <span className="flex items-center justify-between gap-2"><span className="text-[15px] font-semibold" style={{ color: NW_TEXT }}>{lab}</span><span className="grid h-5 w-5 shrink-0 place-items-center rounded-full" style={on ? { background: NW_GRAD } : { border: "2px solid #E0D2C6" }}>{on && <Check size={12} className="text-white" />}</span></span>
            <span className="mt-0.5 block text-[12px] font-semibold" style={{ color: NW_ACCENT }}>{cal}</span>
            <span className="mt-1 block text-[12px] leading-[1.35]" style={{ color: NW_SUB }}>{desc}</span>
          </span>
        </button>
      ); })}
    </NWShell>
  );
}

function NWSleep() {
  return (
    <NWShell title="Sleep" subtitle="Help us calibrate your nightly recovery." pct={60} emoji="🌙" cta="Continue">
      <NWCard>
        <div className="flex items-center justify-between"><div className="flex items-center gap-2"><Moon size={16} style={{ color: NW_ACCENT }} /><NWLbl>Bedtime</NWLbl></div><span className="text-[11px]" style={{ color: NW_LABEL }}>Usual window</span></div>
        <div className="mt-2 flex h-11 items-center justify-between rounded-xl bg-[#F4E9DB] px-3.5 text-[14px] font-medium" style={{ color: NW_INK }}>10:30 PM – 11:00 PM<ChevronRight size={16} style={{ color: NW_LABEL }} /></div>
      </NWCard>
      <NWCard><div className="mb-2 flex items-center gap-2"><Clock size={16} style={{ color: NW_ACCENT }} /><NWLbl>Sleep duration</NWLbl></div><NWPills cols={6} opts={[{ l: "5h" }, { l: "6h" }, { l: "7h" }, { l: "8h" }, { l: "9h" }, { l: "10h" }]} def="7h" /></NWCard>
      <NWCard><div className="mb-2 flex items-center gap-2"><Timer size={16} style={{ color: NW_ACCENT }} /><NWLbl>Time to fall asleep</NWLbl></div><NWPills cols={2} opts={[{ l: "< 10 min" }, { l: "10–20 min" }, { l: "20–40 min" }, { l: "40+ min" }]} def="10–20 min" /></NWCard>
      <NWCard><div className="mb-2 flex items-center gap-2"><Sunrise size={16} style={{ color: NW_ACCENT }} /><NWLbl>Daytime nap</NWLbl></div><NWPills cols={3} opts={[{ l: "No" }, { l: "Sometimes" }, { l: "Daily" }]} def="Sometimes" /></NWCard>
      <NWCard><div className="mb-2 flex items-center gap-2"><Sparkles size={16} style={{ color: NW_ACCENT }} /><NWLbl>Waking feeling</NWLbl></div><NWPills cols={3} opts={[{ l: "Fresh" }, { l: "Balanced" }, { l: "Tired" }]} def="Balanced" /></NWCard>
    </NWShell>
  );
}

function NWYoga() {
  return (
    <NWShell title="Set up your yoga" subtitle="Customise your practice to your comfort." pct={35} emoji="🧘" cta="Continue">
      <NWCard><div className="mb-2"><NWLbl>Your level</NWLbl></div><NWPills cols={3} opts={[{ l: "Beginner" }, { l: "Intermediate" }, { l: "Advanced" }]} def="Beginner" /></NWCard>
      <NWCard><div className="mb-2"><NWLbl>Session length</NWLbl></div><NWPills cols={3} opts={[{ l: "10 min" }, { l: "15 min" }, { l: "20 min" }, { l: "30 min" }, { l: "45 min" }, { l: "60 min" }]} def="20 min" /></NWCard>
      <div className="flex items-start gap-3 rounded-[22px] px-3.5 py-3" style={{ background: "#FBEEE0", border: "1px solid rgba(255,255,255,0.9)" }}>
        <span className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-white/70" style={{ color: NW_ACCENT }}><PersonStanding size={19} /></span>
        <div><p className="text-[13px] font-semibold" style={{ color: NW_ACCENT }}>~ 90–110 cal per session</p><p className="text-[12px]" style={{ color: NW_SUB }}>A 20-min beginner session, for your weight.</p></div>
      </div>
      <NWCard><div className="mb-2"><NWLbl>Any areas to protect?</NWLbl></div><NWPills cols={3} opts={[{ l: "None" }, { l: "Knees" }, { l: "Lower back" }, { l: "Neck" }, { l: "Shoulders" }, { l: "Wrists" }, { l: "Hips" }]} def="None" /></NWCard>
    </NWShell>
  );
}

function NWFood() {
  return (
    <NWShell title="Food & meals" subtitle="So your plan uses food you love." pct={80} emoji="🥘" cta="Continue">
      <NWCard><div className="mb-2"><NWLbl>Food style</NWLbl></div><NWPills opts={[{ l: "Veg" }, { l: "Vegan" }, { l: "Egg" }, { l: "Non-veg" }]} def="Veg" /></NWCard>
      <NWCard><div className="mb-2"><NWLbl>Main meals / day</NWLbl></div><NWPills opts={[{ l: "1" }, { l: "2" }, { l: "3" }, { l: "4+" }]} def="3" /></NWCard>
      <NWCard><div className="mb-2"><NWLbl>Snacks / day</NWLbl></div><NWPills cols={5} opts={[{ l: "0" }, { l: "1" }, { l: "2" }, { l: "3" }, { l: "4+" }]} def="1" /></NWCard>
      <NWCard><div className="mb-2"><NWLbl>Meal timing</NWLbl></div>
        <div className="grid grid-cols-2 gap-2.5">{[["Breakfast", "8:30 AM"], ["Dinner", "7:30 PM"]].map(([k, v]) => <div key={k} className="rounded-xl bg-[#F4E9DB] p-3"><span className="text-[12px]" style={{ color: NW_SUB }}>{k}</span><div className="mt-0.5 flex items-center justify-between"><span className="text-[17px] font-semibold" style={{ ...SERIF, color: NW_INK }}>{v}</span><Clock size={16} style={{ color: NW_ACCENT }} /></div></div>)}</div>
      </NWCard>
      <NWCard><div className="mb-2"><NWLbl>Water / day (L)</NWLbl></div><NWPills cols={3} opts={[{ l: "< 1.5" }, { l: "1.5–2" }, { l: "2–2.5" }, { l: "2.5–3" }, { l: "3+" }]} def="2–2.5" /></NWCard>
    </NWShell>
  );
}

function NWCalGoal() {
  const rows: [string, string, string, any][] = [["At rest (BMR)", "Calories burned at complete rest", "1,628", Activity], ["Activity burn", "Mostly sitting, 20 min yoga", "~250", Footprints], ["Maintenance", "To keep your current weight", "1,878", Scale]];
  return (
    <NWShell title="Your daily calorie goal" subtitle="Your target — based on your profile and activity." pct={55} emoji="🔥" cta="Continue">
      <div className="relative overflow-hidden rounded-[22px] border border-white/90 bg-white/70 p-5 shadow-[0_3px_12px_rgba(121,79,50,0.06)]">
        <div className="flex items-center gap-2"><Flame size={16} style={{ color: NW_ACCENT }} /><span className="text-[11px] font-bold uppercase tracking-wider" style={{ color: NW_ACCENT }}>Your BMR</span></div>
        <div className="mt-1 flex items-baseline gap-1.5"><span className="text-[40px] font-semibold leading-none" style={{ ...SERIF, color: NW_INK }}>1,628</span><span className="text-[14px]" style={{ color: NW_SUB }}>kcal/day</span></div>
        <p className="mt-1 text-[13px]" style={{ color: NW_SUB }}>what your body burns at rest, every day</p>
      </div>
      <div className="flex items-center justify-between gap-3 rounded-[22px] p-4 text-white shadow-[0_6px_18px_rgba(143,75,37,0.2)]" style={{ background: NW_GRAD }}>
        <div className="flex items-center gap-3"><span className="grid h-10 w-10 place-items-center rounded-full bg-white/15"><Target size={20} /></span><div><p className="text-[14px] font-semibold leading-snug">Daily calorie target</p><p className="text-[12px] text-white/80">to lose weight gently</p></div></div>
        <div className="text-right"><span className="text-[26px] font-semibold" style={SERIF}>1,425</span><span className="-mt-1 block text-[11px] text-white/80">kcal/day</span></div>
      </div>
      <p className="mb-1 mt-3 text-[11px] font-bold uppercase tracking-wider" style={{ color: NW_LABEL }}>How we got here</p>
      {rows.map(([t, s, v, Ic]) => (
        <div key={t} className="flex items-center justify-between rounded-[18px] border border-white/90 bg-white/65 p-3.5"><div className="flex items-center gap-3"><span className="grid h-10 w-10 place-items-center rounded-full bg-[#FCE9D8]" style={{ color: "#9A4D1D" }}><Ic size={18} /></span><div><p className="text-[14px] font-semibold" style={{ color: NW_TEXT }}>{t}</p><p className="text-[11.5px]" style={{ color: NW_SUB }}>{s}</p></div></div><span className="text-[15px] font-semibold" style={{ color: NW_INK }}>{v}</span></div>
      ))}
      <div className="flex items-center justify-between rounded-[18px] p-3.5" style={{ background: "#FBEEE0" }}><div className="flex items-center gap-3"><span className="grid h-10 w-10 place-items-center rounded-full bg-white/70" style={{ color: NW_ACCENT }}><TrendingDown size={18} /></span><div><p className="text-[14px] font-semibold" style={{ color: NW_ACCENT }}>Calorie deficit</p><p className="text-[11.5px]" style={{ color: NW_SUB }}>453 kcal/day below maintenance</p></div></div><span className="text-[15px] font-semibold" style={{ color: NW_ACCENT }}>−453</span></div>
    </NWShell>
  );
}

const NW_CALIN: string[][] = [["🫓", "1 roti", "~100"], ["🍚", "1 bowl rice", "~200"], ["🥣", "1 bowl dal", "~120"], ["🥗", "1 cup sabzi", "~150"], ["🥛", "1 glass milk", "~120"], ["🍎", "1 fruit bowl", "~90"]];
const NW_CALOUT: string[][] = [["👟", "5,000 steps", "~200"], ["🧘", "20 min yoga", "~90"], ["🏋️", "20 min workout", "~180"], ["🚴", "20 min cycling", "~160"]];
function NWCalSense() {
  const grid = (items: string[][], col: string) => (
    <div className="grid grid-cols-2 gap-x-3 gap-y-2.5">{items.map(([e, n, k]) => <div key={n} className="flex items-center gap-2"><span className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-[#F4E9DB] text-[16px]">{e}</span><span className="min-w-0 flex-1 truncate text-[12.5px]" style={{ color: NW_TEXT }}>{n}</span><span className="shrink-0 text-right text-[12px] font-bold" style={{ color: col }}>{k}<span className="-mt-0.5 block text-[9px] font-medium" style={{ color: NW_LABEL }}>kcal</span></span></div>)}</div>
  );
  return (
    <NWShell title="A quick calorie sense" subtitle="A quick feel for how calories work." pct={45} emoji="🍽️" cta="Continue">
      <NWCard><div className="mb-2.5 flex items-center gap-2"><Utensils size={16} style={{ color: NW_ACCENT }} /><NWLbl>Calories in</NWLbl></div>{grid(NW_CALIN, "#9A4D1D")}</NWCard>
      <NWCard><div className="mb-2.5 flex items-center gap-2"><Flame size={16} style={{ color: NW_ACCENT }} /><NWLbl>Calories out</NWLbl></div>{grid(NW_CALOUT, "#C83B35")}</NWCard>
      <div className="rounded-[22px] p-3.5" style={{ background: "#EAF1F7", border: "1px solid #D7E4EF" }}>
        <div className="mb-2 flex items-center gap-1.5"><Droplet size={15} style={{ color: "#2F6E8F" }} /><span className="text-[13px] font-bold" style={{ color: "#2B5876" }}>Stay hydrated <span className="font-medium" style={{ color: "#5E7A94" }}>(almost zero cal)</span></span></div>
        <div className="flex justify-between gap-1 text-center">{[["💧", "Water"], ["🍵", "Green tea"], ["☕", "Black coffee"], ["🍋", "Lemon water"]].map(([e, n]) => <div key={n} className="flex flex-1 flex-col items-center gap-1"><span className="grid h-9 w-9 place-items-center rounded-full bg-white text-[16px]">{e}</span><span className="text-[9.5px] leading-tight" style={{ color: "#5E7A94" }}>{n}</span></div>)}</div>
      </div>
    </NWShell>
  );
}

function Preview() {
  const { screen } = Route.useParams();
  const body =
    screen === "nw-weightloss" ? <NWWeightLoss /> :
    screen === "nw-about" ? <NWAbout /> :
    screen === "nw-activity" ? <NWActivity /> :
    screen === "nw-sleep" ? <NWSleep /> :
    screen === "nw-yoga" ? <NWYoga /> :
    screen === "nw-food" ? <NWFood /> :
    screen === "nw-calgoal" ? <NWCalGoal /> :
    screen === "nw-calsense" ? <NWCalSense /> :
    screen === "w-about" ? <WAbout /> :
    screen === "w-activity" ? <WActivity /> :
    screen === "w-sleep" ? <WSleep /> :
    screen === "w-food" ? <WFood /> :
    screen === "w-goals" ? <WGoals /> :
    screen === "w-calgoal" ? <WCalGoal /> :
    screen === "w-calsense" ? <WCalSense /> :
    screen === "w-yoga" ? <WYoga /> :
    screen === "buttons" ? <BtnCompare /> :
    screen === "about" ? <AboutScreen /> :
    screen === "activity" ? <ActivityScreen /> :
    screen === "sleep" ? <SleepScreen /> :
    screen === "food" ? <FoodScreen /> :
    screen === "calorie" ? <CalorieScreen /> :
    screen === "bmr" ? <BmrScreen /> :
    screen === "calgoal" ? <CalGoalScreen /> :
    screen === "rest" ? <RestScreen /> :
    screen === "cp-about" ? <CpAbout /> :
    screen === "cp-activity" ? <CpActivity /> :
    screen === "cp-sleep" ? <CpSleep /> :
    screen === "cp-food" ? <CpFood /> :
    <div className="p-8 text-center text-sm" style={SANS}>Unknown screen. Try /stitch-preview/cp-about · /cp-activity · /cp-sleep · /cp-food · /bmr · /calgoal · /rest</div>;
  return <div className="min-h-svh bg-[#f7fafb] text-[#181c1d]" style={SANS}>{body}</div>;
}
