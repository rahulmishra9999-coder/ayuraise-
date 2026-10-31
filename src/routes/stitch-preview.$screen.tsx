import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";

export const Route = createFileRoute("/stitch-preview/$screen")({
  head: () => ({
    links: [
      { rel: "stylesheet", href: "https://fonts.googleapis.com/css2?family=Source+Serif+4:opsz,wght@8..60,400;8..60,500;8..60,600&family=Manrope:wght@400;500;600;700&display=swap" },
      { rel: "stylesheet", href: "https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@20..48,100..700,0..1,-50..200&display=swap" },
    ],
  }),
  component: Preview,
});

const SERIF = { fontFamily: '"Source Serif 4", Georgia, serif' } as const;
const SANS = { fontFamily: '"Manrope", system-ui, sans-serif' } as const;

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
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[#33496E]"><MS name="person" size={18} className="text-white" /></div>
        </div>
      </header>

      <main className="flex flex-col gap-6 px-6 pb-32 pt-[4.75rem]">
        {/* stepper */}
        <div className="flex flex-col gap-2">
          <div className="flex items-center justify-between text-[12px] uppercase tracking-wider text-[#424845]"><span>Step 3 of 5</span><span className="font-semibold text-[#33496E]">Metabolic Balance</span></div>
          <div className="h-1.5 w-full overflow-hidden rounded-full bg-[#ebeeef]"><div className="h-full rounded-full bg-[#33496E]" style={{ width: "60%" }} /></div>
        </div>

        {/* intro */}
        <div className="flex flex-col gap-1.5">
          <p className="text-[28px] font-semibold tracking-tight text-[#181c1d]" style={SERIF}>Your Calorie Blueprint</p>
          <p className="text-[16px] leading-relaxed text-[#424845]">Now let's talk calories — what your body burns at stillness, and the mindful number to aim for.</p>
        </div>

        {/* hero BMR card */}
        <div className="relative flex flex-col items-center overflow-hidden rounded-xl bg-[#f1f4f5] p-6 text-center shadow-sm">
          <div className="pointer-events-none absolute -right-12 -top-12 h-36 w-36 rounded-full bg-[#ffdbcc]/40 blur-2xl" />
          <div className="pointer-events-none absolute -bottom-10 -left-10 h-32 w-32 rounded-full bg-[#DCE6F2]/70 blur-2xl" />
          <div className="relative mb-3 inline-flex items-center gap-1.5 rounded-full bg-[#e0e3e4] px-3 py-1 text-[12px] font-semibold uppercase tracking-wider text-[#8d4e2d]"><MS name="local_fire_department" size={16} fill className="text-[#8d4e2d]" /> Your Basal Metabolic Rate</div>
          <div className="relative my-1 flex items-baseline gap-1"><span className="text-[32px] font-semibold tracking-tight text-[#181c1d]" style={SERIF}>1,628</span><span className="text-[14px] font-medium text-[#424845]">kcal</span></div>
          <p className="relative max-w-[220px] text-[12px] leading-relaxed text-[#424845]">The pure vital energy your body burns every single day just staying alive.</p>
        </div>

        {/* target banner */}
        <div className="flex items-center justify-between gap-3 rounded-xl bg-[#33496E] p-4 text-white shadow-md">
          <div className="flex min-w-0 items-center gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-white/10"><MS name="spa" size={22} fill className="text-[#DCE6F2]" /></div>
            <div className="flex min-w-0 flex-col"><span className="text-[14px] font-semibold leading-snug">Gentle sustained loss</span><span className="truncate text-[12px] text-[#DCE6F2]">~0.4 kg/week target</span></div>
          </div>
          <div className="shrink-0 text-right"><span className="text-[24px] font-medium tracking-tight" style={SERIF}>1,425</span><span className="-mt-1 block text-[12px] font-medium text-[#DCE6F2]">kcal/day</span></div>
        </div>

        {/* breakdown */}
        <div className="flex flex-col gap-3">
          <div className="flex items-center justify-between"><span className="text-[14px] font-semibold uppercase tracking-wider text-[#181c1d]">How We Got Here</span><span className="text-[12px] text-[#424845]">Daily Breakdown</span></div>
          <div className="flex flex-col gap-2">
            {[
              { icon: "bedtime", tint: "bg-[#e6e9ea] text-[#424845]", t: "At rest (BMR)", s: "Baseline organs & breath", v: "1,628", vc: "text-[#181c1d]" },
              { icon: "self_improvement", tint: "bg-[#e6e9ea] text-[#33496E]", t: "+ Daily movement", s: "Sedentary desk + 20m yoga", v: "+250", vc: "text-[#33496E]" },
              { icon: "restaurant", tint: "bg-[#e0e3e4] text-[#181c1d]", t: "= Maintain weight", s: "Current equilibrium", v: "1,878", vc: "text-[#181c1d] font-semibold", low: true },
            ].map((r) => (
              <div key={r.t} className={`flex items-center justify-between rounded-lg p-3.5 shadow-sm ${r.low ? "bg-[#f1f4f5]" : "bg-white"}`}>
                <div className="flex items-center gap-3"><div className={`flex h-9 w-9 items-center justify-center rounded-full ${r.tint}`}><MS name={r.icon} size={18} /></div><div className="flex flex-col"><span className="text-[14px] text-[#181c1d]">{r.t}</span><span className="text-[12px] text-[#424845]">{r.s}</span></div></div>
                <div className="text-right"><span className={`text-[14px] ${r.vc}`}>{r.v}</span><span className="-mt-1 block text-[12px] text-[#424845]">kcal</span></div>
              </div>
            ))}
            {/* deficit (terracotta) */}
            <div className="flex items-center justify-between rounded-lg bg-[#ffdbcc]/30 p-3.5">
              <div className="flex items-center gap-3"><div className="flex h-9 w-9 items-center justify-center rounded-full bg-[#fdaa83]/40 text-[#8d4e2d]"><MS name="trending_down" size={18} /></div><div className="flex flex-col"><span className="text-[14px] text-[#8d4e2d]">− Mindful deficit</span><span className="text-[12px] leading-tight text-[#703718]">Safe deficit, no metabolic crash</span></div></div>
              <div className="text-right"><span className="text-[14px] font-semibold text-[#8d4e2d]">−453</span><span className="-mt-1 block text-[12px] text-[#703718]">kcal</span></div>
            </div>
          </div>
        </div>

        {/* quick calorie sense */}
        <div className="flex flex-col gap-3 pt-2">
          <div className="flex flex-col gap-1"><span className="text-[14px] font-semibold uppercase tracking-wider text-[#181c1d]">A Quick Calorie Sense</span><p className="text-[12px] text-[#424845]">Simple benchmarks so portion tracking feels natural and peaceful.</p></div>
          <div className="flex flex-col gap-4 rounded-xl bg-white p-4 shadow-sm">
            <div className="flex flex-col gap-2.5">
              <div className="flex items-center gap-2 pb-1"><MS name="dinner_dining" size={18} className="text-[#8d4e2d]" /><span className="text-[11px] font-semibold uppercase tracking-wider text-[#181c1d]">Daily Plates (In)</span></div>
              <div className="grid grid-cols-2 gap-x-4 gap-y-2">{PLATES_IN.map(([k, v]) => <div key={k} className="flex items-center justify-between py-0.5 text-[12px]"><span className="truncate text-[#424845]">{k}</span><span className="shrink-0 pl-1 font-semibold text-[#33496E]">{v}</span></div>)}</div>
            </div>
            <div className="h-px w-full bg-[#ebeeef]" />
            <div className="flex flex-col gap-2.5">
              <div className="flex items-center gap-2 pb-1"><MS name="directions_run" size={18} className="text-[#33496E]" /><span className="text-[11px] font-semibold uppercase tracking-wider text-[#181c1d]">Movement Spent (Out)</span></div>
              <div className="grid grid-cols-2 gap-x-4 gap-y-2">{MOVE_OUT.map(([k, v]) => <div key={k} className="flex items-center justify-between py-0.5 text-[12px]"><span className="truncate text-[#424845]">{k}</span><span className="shrink-0 pl-1 font-semibold text-[#8d4e2d]">{v}</span></div>)}</div>
            </div>
          </div>
          <div className="flex flex-col gap-2 rounded-xl bg-[#DCE6F2]/40 p-3.5">
            <div className="flex items-center gap-2"><MS name="check_circle" size={18} fill className="text-[#33496E]" /><span className="text-[14px] font-semibold text-[#33496E]">Almost zero calories (&lt; 5 kcal)</span></div>
            <p className="pl-6 text-[12px] leading-relaxed text-[#424845]">Fresh water • Green / black tea • Black coffee (no sugar) • Ginger water • Lemon slice infusion</p>
          </div>
        </div>
      </main>

      {/* sticky CTA */}
      <div className="fixed inset-x-0 bottom-0 z-40 bg-gradient-to-t from-[#f7fafb] via-[#f7fafb]/95 to-transparent px-6 pb-6 pt-3">
        <button className="flex h-14 w-full items-center justify-center gap-2 rounded-full bg-[#33496E] text-[14px] font-semibold text-white shadow-lg transition-all active:scale-[0.98]"><span>Continue to Meal Architecture</span><MS name="arrow_forward" size={20} /></button>
      </div>
    </div>
  );
}

function Preview() {
  const { screen } = Route.useParams();
  const body =
    screen === "about" ? <AboutScreen /> :
    screen === "activity" ? <ActivityScreen /> :
    screen === "sleep" ? <SleepScreen /> :
    screen === "food" ? <FoodScreen /> :
    screen === "calorie" ? <CalorieScreen /> :
    <div className="p-8 text-center text-sm" style={SANS}>Unknown screen. Try /stitch-preview/about · /activity · /sleep · /food · /calorie</div>;
  return <div className="min-h-svh bg-[#f7fafb] text-[#181c1d]" style={SANS}>{body}</div>;
}
