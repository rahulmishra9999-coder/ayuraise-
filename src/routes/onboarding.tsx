import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import {
  ArrowLeft, ArrowRight, Sparkles, Flower2, Leaf, HeartPulse, Soup, Wind, Moon, Flame, ClipboardList,
} from "lucide-react";
import { PRAKRITI_QUESTIONS, scorePrakriti, type Dosha, type PrakritiAnswer } from "@/lib/diet";
import { calcBMR, calcTDEE, ACTIVITY_LABEL, type ActivityLevel } from "@/lib/weight-loss";
import { saveAsNewProfile, getActiveProfileId, upsertProfile } from "@/lib/profiles";

export const Route = createFileRoute("/onboarding")({
  validateSearch: (search: Record<string, unknown>) => ({
    step: typeof search.step === "string" ? (search.step as Step) : undefined,
    returnTo: typeof search.returnTo === "string" ? search.returnTo : undefined,
    profileId: typeof search.profileId === "string" ? search.profileId : undefined,
  }),
  head: () => ({
    meta: [
      { title: "Welcome · AyuRaise" },
      { name: "description", content: "Tell us about you so we can personalize your wellness plan." },
    ],
    links: [
      { rel: "stylesheet", href: "https://fonts.googleapis.com/css2?family=Playfair+Display:wght@600;700;800&family=Source+Serif+4:opsz,wght@8..60,400;8..60,500;8..60,600&family=Manrope:wght@400;500;600;700&display=swap" },
      { rel: "stylesheet", href: "https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@20..48,100..700,0..1,-50..200&display=swap" },
    ],
  }),
  component: OnboardingPage,
});

type Step = "welcome" | "about" | "activity" | "sleep" | "food" | "calories" | "prakriti-intro" | "prakriti-quiz" | "prakriti-result" | "prakriti-handoff" | "plan-intro";
const STITCH_STEPS: Step[] = ["about", "activity", "sleep", "food"]; // sage Material-3 screens with their own chrome
const SKIN_STEPS = ["welcome", "calories"];                          // kept on the older navy/serif skin for now

// ---- type helpers (legacy welcome/calories skin) ----
const SERIF = { fontFamily: '"Playfair Display", Georgia, serif' } as const;
const SH_CARD = "0 1px 2px rgba(17,19,24,0.04), 0 10px 26px -14px rgba(17,19,24,0.14)";
const SH_SEL = "0 2px 6px rgba(28,43,74,0.10), 0 14px 30px -12px rgba(28,43,74,0.26)";
const CTA = "mt-6 flex w-full items-center justify-center gap-2 rounded-xl bg-[#121417] px-6 py-4 text-[15px] font-semibold tracking-wide text-[#F5F5F3] shadow-md transition-all duration-200 active:scale-[0.99] active:bg-black disabled:opacity-40";
const EYEBROW = "text-[11px] font-semibold uppercase tracking-[0.24em] text-[#1C2B4A]";

// ---- sage Material-3 "Stitch" design kit (shared by the 4 integrated screens) ----
const SERIF4 = { fontFamily: '"Source Serif 4", Georgia, serif' } as const;
const SANS = { fontFamily: '"Manrope", system-ui, sans-serif' } as const;

function MS({ name, size = 20, fill = false, className = "" }: { name: string; size?: number; fill?: boolean; className?: string }) {
  return <span className={`material-symbols-outlined ${className}`} style={{ fontSize: size, lineHeight: 1, fontVariationSettings: fill ? "'FILL' 1" : "'FILL' 0" }}>{name}</span>;
}

function TopBar({ onBack, progress }: { onBack: () => void; progress?: number }) {
  return (
    <header className="fixed inset-x-0 top-0 z-50 border-b border-black/[0.04] bg-[#f7fafb]/80 pt-[env(safe-area-inset-top)] backdrop-blur-xl">
      <div className="flex h-16 items-center justify-between px-6">
        <button onClick={onBack} aria-label="Back" className="-ml-2 flex h-11 w-11 items-center justify-center rounded-full text-[#181c1d]"><MS name="arrow_back_ios_new" size={22} /></button>
        <div className="flex flex-1 flex-col items-center px-2">
          {progress !== undefined && <div className="h-1 w-24 overflow-hidden rounded-full bg-[#ebeeef]"><div className="h-full rounded-full bg-[#4b6159] transition-all duration-300" style={{ width: `${progress * 100}%` }} /></div>}
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
        <h1 className="text-[26px] font-semibold leading-tight tracking-tight text-[#181c1d]" style={SERIF4}>{title}</h1>
        {subtitle && <p className="mt-0.5 text-[13px] leading-snug text-[#4d635b]">{subtitle}</p>}
      </div>
    </div>
  );
}

function BottomBar({ onClick, disabled, label = "Continue", arrow = true, uppercase = false }: { onClick: () => void; disabled?: boolean; label?: string; arrow?: boolean; uppercase?: boolean }) {
  return (
    <footer className="fixed inset-x-0 bottom-0 z-50 border-t border-black/[0.03] bg-[#f7fafb]/85 px-6 py-2 pb-[max(0.5rem,env(safe-area-inset-bottom))] backdrop-blur-xl">
      <button onClick={onClick} disabled={disabled} className={`flex h-12 w-full items-center justify-center gap-2 rounded-full bg-[#4b6159] text-[15px] font-semibold text-white shadow-md transition-all active:scale-[0.99] disabled:opacity-40 ${uppercase ? "uppercase tracking-wider" : ""}`}>
        <span>{label}</span>{arrow && <MS name="arrow_forward" size={19} />}
      </button>
    </footer>
  );
}

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
function PillGrid({ opts, value, onChange, cols = 4 }: { opts: string[]; value: string; onChange: (v: string) => void; cols?: number }) {
  return (
    <div className="grid gap-2" style={{ gridTemplateColumns: `repeat(${cols}, minmax(0,1fr))` }}>
      {opts.map((o) => {
        const on = value === o;
        return <button key={o} onClick={() => onChange(o)} className={`rounded-full px-2 py-1.5 text-center text-[12px] font-semibold transition-all ${on ? "bg-[#4b6159] text-white shadow-sm" : "bg-[#f1f4f5] text-[#181c1d] hover:bg-[#ebeeef]"}`}>{o}</button>;
      })}
    </div>
  );
}
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

// unit conversions
const cmToFtStr = (cm: number) => { if (!cm) return ""; const t = Math.round(cm / 2.54); const ft = Math.floor(t / 12); return `${ft}'${t - ft * 12}`; };
const ftStrToCm = (s: string) => { const m = s.match(/(\d+)\D+(\d+)/) || s.match(/(\d+)/); if (!m) return 0; return Math.round((Number(m[1] || 0) * 12 + Number(m[2] || 0)) * 2.54); };
const kgToLbStr = (kg: number) => (kg ? (kg * 2.20462).toFixed(1) : "");
const lbToKg = (lb: number) => Math.round((lb / 2.20462) * 10) / 10;

type SleepData = { bedtime: string; durationHrs: number; latency: string; nap: string; waking: string };
type FoodData = { style: string; mainMeals: string; snacks: string; water: string; breakfast: string; dinner: string };

function OnboardingPage() {
  const navigate = useNavigate();
  const { step: stepParam, returnTo, profileId } = Route.useSearch();
  const isNewProfile = profileId === "new";
  const [step, setStep] = useState<Step>(stepParam ?? (isNewProfile ? "about" : "welcome"));

  // Profile
  const [name, setName] = useState("");
  const [age, setAge] = useState("");
  const [gender, setGender] = useState<"male" | "female" | "other" | "">("");
  const [heightCm, setHeightCm] = useState("");
  const [weightKg, setWeightKg] = useState("");

  // Activity
  const [activity, setActivity] = useState<ActivityLevel | "">("");

  // Sleep
  const [sleep, setSleep] = useState<SleepData>({ bedtime: "1030", durationHrs: 7.5, latency: "10–20 min", nap: "Sometimes", waking: "Balanced" });
  // Food & meals
  const [food, setFood] = useState<FoodData>({ style: "Veg", mainMeals: "3", snacks: "1", water: "2.5–3L", breakfast: "8:30 AM", dinner: "7:30 PM" });

  // Prakriti
  const [answers, setAnswers] = useState<PrakritiAnswer[]>([]);
  const [qIdx, setQIdx] = useState(0);
  const [prakritiResult, setPrakritiResult] = useState<{ dosha: Dosha; score: Record<Dosha, number> } | null>(null);

  const profileValid = !!(name.trim() && age && gender && heightCm && weightKg);

  // Hydrate existing profile when deep-linking to a later step (skip for brand-new profile).
  useEffect(() => {
    if (isNewProfile) return;
    if (!stepParam || typeof window === "undefined") return;
    try {
      const raw = localStorage.getItem("ayuraise.profile");
      if (!raw) return;
      const p = JSON.parse(raw);
      if (p?.name) setName(p.name);
      if (p?.age) setAge(String(p.age));
      if (p?.gender) setGender(p.gender);
      if (p?.heightCm) setHeightCm(String(p.heightCm));
      if (p?.weightKg) setWeightKg(String(p.weightKg));
      if (p?.activity) setActivity(p.activity);
      if (p?.sleep) setSleep((s) => ({ ...s, ...p.sleep }));
      if (p?.food) setFood((f) => ({ ...f, ...p.food }));
      if (p?.prakriti) setPrakritiResult(p.prakriti);
    } catch {}
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const calc = useMemo(() => {
    if (!gender || !age || !heightCm || !weightKg || !activity) return null;
    const sex = gender as "male" | "female" | "other";
    const bmrV = Math.round(calcBMR(sex, Number(weightKg), Number(heightCm), Number(age)));
    const tdeeV = calcTDEE(sex, Number(weightKg), Number(heightCm), Number(age), activity as ActivityLevel);
    return { bmr: bmrV, tdee: tdeeV };
  }, [gender, age, heightCm, weightKg, activity]);

  const saveProfile = (prakritiData?: { dosha: Dosha; score: Record<Dosha, number> } | null) => {
    let existing: Record<string, unknown> = {};
    try { existing = JSON.parse(localStorage.getItem("ayuraise.profile") ?? "{}") ?? {}; } catch {}
    const baseNext: Record<string, unknown> = isNewProfile ? {} : { ...existing };
    if (name.trim()) baseNext.name = name.trim();
    if (age) baseNext.age = Number(age);
    if (gender) baseNext.gender = gender;
    if (heightCm) baseNext.heightCm = Number(heightCm);
    if (weightKg) baseNext.weightKg = Number(weightKg);
    if (activity) baseNext.activity = activity as ActivityLevel;
    baseNext.sleep = sleep;
    baseNext.food = food;
    if (calc?.bmr) baseNext.bmr = calc.bmr;
    if (calc?.tdee) baseNext.tdee = calc.tdee;
    if (prakritiData !== undefined) baseNext.prakriti = prakritiData;
    baseNext.onboardedAt = new Date().toISOString();
    localStorage.setItem("ayuraise.profile", JSON.stringify(baseNext));

    try {
      if (isNewProfile) {
        const created = saveAsNewProfile(baseNext as never);
        localStorage.setItem("ayuraise.profile", JSON.stringify(created));
      } else {
        const activeId = getActiveProfileId();
        if (activeId) upsertProfile({ id: activeId, ...baseNext } as never);
        else saveAsNewProfile(baseNext as never);
      }
    } catch {}
  };

  // ---------- the 4 integrated (sage) screens render full-screen with their own chrome ----------
  if (STITCH_STEPS.includes(step)) {
    return (
      <div className="min-h-svh bg-[#f7fafb] text-[#181c1d]" style={SANS}>
        {step === "about" && (
          <AboutStep
            {...{ name, setName, gender, setGender, age, setAge, heightCm, setHeightCm, weightKg, setWeightKg }}
            valid={profileValid}
            onBack={() => setStep("welcome")}
            onNext={() => profileValid && setStep("activity")}
          />
        )}
        {step === "activity" && (
          <ActivityStep activity={activity} setActivity={setActivity} onBack={() => setStep("about")} onNext={() => activity && setStep("sleep")} />
        )}
        {step === "sleep" && (
          <SleepStep sleep={sleep} setSleep={setSleep} onBack={() => setStep("activity")} onNext={() => setStep("food")} />
        )}
        {step === "food" && (
          <FoodStep food={food} setFood={setFood} onBack={() => setStep("sleep")} onNext={() => { saveProfile(); setStep("calories"); }} />
        )}
      </div>
    );
  }

  // ---------- welcome / calories / prakriti keep the previous wrapper ----------
  const skin = SKIN_STEPS.includes(step);
  return (
    <div className="min-h-svh px-5 pb-10 pt-[max(1.5rem,env(safe-area-inset-top))]" style={skin ? { background: "#f7fafb", fontFamily: '"Plus Jakarta Sans", sans-serif' } : { background: "var(--gradient-hero)" }}>
      <div className="mx-auto max-w-md">
        <div className="mb-6 flex items-center justify-between">
          <button
            onClick={() => {
              if (step === "welcome") navigate({ to: "/login" });
              else if (step === "calories") setStep("food");
              else if (step === "prakriti-intro") setStep("calories");
              else if (step === "prakriti-quiz") { if (qIdx === 0) setStep("prakriti-intro"); else setQIdx(qIdx - 1); }
              else if (step === "prakriti-result") setStep("prakriti-quiz");
              else if (step === "plan-intro") setStep(prakritiResult ? "prakriti-result" : "prakriti-intro");
            }}
            className={skin ? "flex h-10 w-10 items-center justify-center rounded-full border border-[#1C2B4A]/20 bg-[#ECECEA] text-[#121417] shadow-sm active:bg-[#E2E2DE]" : "flex h-9 w-9 items-center justify-center rounded-full bg-card/70 ring-1 ring-border"}
            aria-label="Back"
          >
            <ArrowLeft size={16} />
          </button>
          <StepDots step={step} />
          <div className="w-9" />
        </div>

        {step === "welcome" && <WelcomeStep onNext={() => setStep("about")} />}

        {step === "calories" && calc && (
          <CaloriesStep bmr={calc.bmr} tdee={calc.tdee} name={name} activity={activity as ActivityLevel} onNext={() => setStep("prakriti-intro")} />
        )}

        {step === "prakriti-intro" && (
          <PrakritiIntro mandatory onTake={() => { setAnswers([]); setQIdx(0); setStep("prakriti-quiz"); }} />
        )}

        {step === "prakriti-quiz" && (
          <PrakritiQuiz
            qIdx={qIdx}
            answers={answers}
            onAnswer={(dosha) => {
              const next = [...answers.filter((a) => a.q !== qIdx), { q: qIdx, option: dosha }];
              setAnswers(next);
              if (qIdx + 1 < PRAKRITI_QUESTIONS.length) setQIdx(qIdx + 1);
              else setStep("prakriti-result");
            }}
          />
        )}

        {step === "prakriti-result" && (
          <PrakritiResult
            answers={answers}
            onFinish={(data) => {
              setPrakritiResult(data);
              saveProfile(data);
              if (returnTo) { window.location.href = returnTo; }
              else { setStep("prakriti-handoff"); }
            }}
          />
        )}

        {step === "prakriti-handoff" && prakritiResult && (
          <PrakritiHandoff dosha={prakritiResult.dosha} score={prakritiResult.score} onContinue={() => setStep("plan-intro")} />
        )}

        {step === "plan-intro" && (
          <PlanIntro onBuild={() => navigate({ to: "/plan" })} onPark={() => navigate({ to: "/home" })} />
        )}
      </div>
    </div>
  );
}

function StepDots({ step }: { step: Step }) {
  const map: Record<Step, number> = {
    welcome: 0, about: 1, activity: 1, sleep: 1, food: 1, calories: 2,
    "prakriti-intro": 3, "prakriti-quiz": 3, "prakriti-result": 3, "prakriti-handoff": 4, "plan-intro": 4,
  };
  const i = map[step];
  return (
    <div className="flex gap-1.5">
      {[0, 1, 2, 3, 4].map((idx) => <span key={idx} className={`h-1.5 rounded-full transition-all ${idx <= i ? "w-6 bg-[#4b6159]" : "w-1.5 bg-[#ebeeef]"}`} />)}
    </div>
  );
}

/* ================= ABOUT YOU (Step 1) ================= */
function AboutStep(p: {
  name: string; setName: (v: string) => void;
  gender: "male" | "female" | "other" | ""; setGender: (v: "male" | "female" | "other") => void;
  age: string; setAge: (v: string) => void;
  heightCm: string; setHeightCm: (v: string) => void;
  weightKg: string; setWeightKg: (v: string) => void;
  valid: boolean; onBack: () => void; onNext: () => void;
}) {
  const [hUnit, setHUnit] = useState<"cm" | "ft">("cm");
  const [wUnit, setWUnit] = useState<"kg" | "lb">("kg");
  const cm = Number(p.heightCm || 0), kg = Number(p.weightKg || 0);
  const GEN: { k: "male" | "female" | "other"; label: string }[] = [{ k: "male", label: "Male" }, { k: "female", label: "Female" }, { k: "other", label: "Other" }];
  return (
    <>
      <TopBar onBack={p.onBack} />
      <main className="px-6 pb-10 pt-[4.75rem]">
        <div className="mb-6 flex flex-col gap-2.5">
          <div className="flex items-center justify-between text-[12px]"><span className="font-medium tracking-wide text-[#4b6159]">Step 1 of 4</span><span className="text-[#424845]">25% Complete</span></div>
          <div className="h-1.5 w-full overflow-hidden rounded-full bg-[#ebeeef]"><div className="h-full rounded-full bg-[#4b6159]" style={{ width: "25%" }} /></div>
        </div>
        <h1 className="mb-8 text-[28px] font-semibold tracking-tight text-[#181c1d]" style={SERIF4}>About You</h1>

        <div className="flex flex-col gap-4">
          <div className="rounded-xl bg-white p-5 shadow-sm">
            <label className="mb-1.5 block text-[12px] font-medium tracking-wider text-[#424845]">Name</label>
            <div className="flex items-center gap-3">
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#f1f4f5] text-[#4b6159]"><MS name="badge" size={18} /></div>
              <input value={p.name} onChange={(e) => p.setName(e.target.value)} placeholder="Enter your name" className="w-full bg-transparent text-[18px] text-[#181c1d] placeholder:text-[#727875] focus:outline-none" />
            </div>
          </div>

          <div className="rounded-xl bg-white p-5 shadow-sm">
            <label className="mb-3 block text-[12px] font-medium tracking-wider text-[#424845]">Gender</label>
            <div className="grid grid-cols-3 gap-2">
              {GEN.map((g) => {
                const on = p.gender === g.k;
                return <button key={g.k} onClick={() => p.setGender(g.k)} className={`flex items-center justify-center gap-1.5 rounded-full px-3 py-2.5 text-[14px] font-semibold transition-all ${on ? "bg-[#4b6159] text-white shadow-sm" : "bg-[#f1f4f5] text-[#424845]"}`}>{on && <MS name="check" size={16} />}<span>{g.label}</span></button>;
              })}
            </div>
          </div>

          <div className="rounded-xl bg-white p-5 shadow-sm">
            <label className="mb-1.5 block text-[12px] font-medium tracking-wider text-[#424845]">Age</label>
            <div className="flex items-baseline gap-2">
              <input type="number" min={1} max={120} value={p.age} onChange={(e) => p.setAge(e.target.value)} placeholder="28" className="w-20 bg-transparent text-[24px] font-medium text-[#181c1d] focus:outline-none" style={SERIF4} />
              <span className="text-[16px] text-[#424845]">years</span>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            {/* height */}
            <div className="flex flex-col justify-between rounded-xl bg-white p-4 shadow-sm">
              <div className="mb-3 flex items-center justify-between gap-1">
                <span className="truncate text-[12px] font-medium tracking-wider text-[#424845]">Height</span>
                <div className="flex shrink-0 rounded-full bg-[#f1f4f5] p-0.5">
                  {(["cm", "ft"] as const).map((u) => <button key={u} onClick={() => setHUnit(u)} className={`rounded-full px-2 py-0.5 text-[12px] transition-all ${hUnit === u ? "bg-white font-semibold text-[#4b6159] shadow-sm" : "text-[#424845]"}`}>{u}</button>)}
                </div>
              </div>
              <div className="flex items-baseline gap-1.5">
                <input key={hUnit} type="text" inputMode="decimal" defaultValue={hUnit === "cm" ? p.heightCm : cmToFtStr(cm)}
                  onChange={(e) => { const v = e.target.value; p.setHeightCm(hUnit === "cm" ? v.replace(/[^\d.]/g, "") : String(ftStrToCm(v) || "")); }}
                  placeholder={hUnit === "cm" ? "170" : "5'7"} className="w-16 bg-transparent text-[24px] font-medium text-[#181c1d] focus:outline-none" style={SERIF4} />
                <span className="text-[14px] text-[#424845]">{hUnit}</span>
              </div>
              <div className="mt-2 flex items-center gap-1 truncate text-[12px] text-[#727875]"><MS name="height" size={13} className="text-[#4b6159]" />{cm ? (hUnit === "cm" ? cmToFtStr(cm) + " ft/in" : cm + " cm") : "—"}</div>
            </div>
            {/* weight */}
            <div className="flex flex-col justify-between rounded-xl bg-white p-4 shadow-sm">
              <div className="mb-3 flex items-center justify-between gap-1">
                <span className="truncate text-[12px] font-medium tracking-wider text-[#424845]">Weight</span>
                <div className="flex shrink-0 rounded-full bg-[#f1f4f5] p-0.5">
                  {(["kg", "lb"] as const).map((u) => <button key={u} onClick={() => setWUnit(u)} className={`rounded-full px-2 py-0.5 text-[12px] transition-all ${wUnit === u ? "bg-white font-semibold text-[#4b6159] shadow-sm" : "text-[#424845]"}`}>{u}</button>)}
                </div>
              </div>
              <div className="flex items-baseline gap-1.5">
                <input key={wUnit} type="text" inputMode="decimal" defaultValue={wUnit === "kg" ? p.weightKg : kgToLbStr(kg)}
                  onChange={(e) => { const v = e.target.value; p.setWeightKg(wUnit === "kg" ? v.replace(/[^\d.]/g, "") : String(lbToKg(parseFloat(v)) || "")); }}
                  placeholder={wUnit === "kg" ? "65" : "143"} className="w-16 bg-transparent text-[24px] font-medium text-[#181c1d] focus:outline-none" style={SERIF4} />
                <span className="text-[14px] text-[#424845]">{wUnit}</span>
              </div>
              <div className="mt-2 flex items-center gap-1 truncate text-[12px] text-[#727875]"><MS name="monitor_weight" size={13} className="text-[#4b6159]" />{kg ? (wUnit === "kg" ? kgToLbStr(kg) + " lbs" : kg + " kg") : "—"}</div>
            </div>
          </div>

          <div className="mt-2 flex flex-col items-center gap-3 pt-2">
            <button onClick={p.onNext} disabled={!p.valid} className="flex w-full items-center justify-center gap-2 rounded-full bg-[#2d3132] px-6 py-4 text-[14px] font-semibold text-[#eef1f2] shadow-md transition-all active:scale-[0.99] disabled:opacity-40"><span>Continue</span><MS name="arrow_forward" size={18} /></button>
            <div className="flex items-center gap-1.5 text-[12px] text-[#727875]"><MS name="lock" size={14} /><span>Your data is private and encrypted.</span></div>
          </div>
        </div>
      </main>
    </>
  );
}

/* ================= ACTIVITY (Step 2) ================= */
const ACT: { v: ActivityLevel; icon: string; label: string; cal: string; desc: string }[] = [
  { v: "sedentary", icon: "chair", label: "Sedentary", cal: "~50–150 cal/day", desc: "Desk job, mostly sitting. Under 3,000 steps, little to no routine exercise." },
  { v: "light", icon: "directions_walk", label: "Lightly active", cal: "~150–300 cal/day", desc: "Light walking (4,000–6,000 steps), or light workouts/yoga 1–2 days a week." },
  { v: "moderate", icon: "directions_run", label: "Moderately active", cal: "~300–500 cal/day", desc: "Regular movement, 7,000–10,000 steps, or 30–45 min workouts 3–5 days a week." },
  { v: "active", icon: "fitness_center", label: "Active", cal: "~500–700 cal/day", desc: "Daily training or on your feet a lot, 10,000+ steps, workouts 5–6 days a week." },
  { v: "very_active", icon: "bolt", label: "Very active", cal: "~700–1000 cal/day", desc: "Physically demanding job or intense training / sports 6–7 days a week." },
];
function ActivityStep({ activity, setActivity, onBack, onNext }: { activity: ActivityLevel | ""; setActivity: (a: ActivityLevel) => void; onBack: () => void; onNext: () => void }) {
  return (
    <>
      <TopBar onBack={onBack} progress={0.5} />
      <main className="px-6 pb-28 pt-[4.75rem]">
        <ProgressHead step={2} pct={50} title="Activity Level" subtitle="Choose the option that best matches your typical daily routine." />
        <div role="radiogroup" className="mt-5 flex flex-col gap-3.5">
          {ACT.map((a) => {
            const on = activity === a.v;
            return (
              <button key={a.v} role="radio" aria-checked={on} onClick={() => setActivity(a.v)} className="flex flex-col rounded-xl bg-white p-4 text-left transition-all active:scale-[0.99]" style={{ boxShadow: on ? "0 4px 24px rgba(75,97,89,0.10)" : "0 2px 12px rgba(24,28,29,0.03)" }}>
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
      <BottomBar onClick={onNext} disabled={!activity} label="Continue" uppercase />
    </>
  );
}

/* ================= SLEEP (Step 3) ================= */
function SleepStep({ sleep, setSleep, onBack, onNext }: { sleep: SleepData; setSleep: (fn: (s: SleepData) => SleepData) => void; onBack: () => void; onNext: () => void }) {
  return (
    <>
      <TopBar onBack={onBack} progress={0.75} />
      <main className="px-6 pb-28 pt-[4.75rem]">
        <ProgressHead step={3} pct={75} title="Sleep" subtitle="Help us calibrate your circadian baseline and nightly recovery." />
        <div className="mt-5 flex flex-col gap-3">
          <Card className="flex flex-col gap-2">
            <div className="flex items-center justify-between"><SecLabel icon="bedtime">Bedtime</SecLabel><span className="text-[11px] text-[#4d635b]">Usual window</span></div>
            <div className="relative">
              <select value={sleep.bedtime} onChange={(e) => setSleep((s) => ({ ...s, bedtime: e.target.value }))} className="h-10 w-full cursor-pointer appearance-none rounded-lg bg-[#f1f4f5] px-3 pr-8 text-[14px] font-medium text-[#181c1d] focus:outline-none">
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

          <Card className="flex flex-col gap-2.5">
            <div className="flex items-center justify-between"><SecLabel icon="schedule">Sleep Duration</SecLabel><div className="rounded-full bg-[#d0e8de] px-2.5 py-0.5 text-[13px] font-semibold text-[#0a1f19]">{sleep.durationHrs.toFixed(1)} hrs</div></div>
            <div className="flex flex-col gap-1.5 pt-0.5">
              <input type="range" min={5} max={10} step={0.5} value={sleep.durationHrs} onChange={(e) => setSleep((s) => ({ ...s, durationHrs: parseFloat(e.target.value) }))} className="h-1.5 w-full cursor-pointer rounded-full" style={{ accentColor: "#4b6159" }} />
              <div className="flex justify-between px-1 text-[11px] text-[#4d635b]"><span>5h</span><span>6h</span><span>7h</span><span>8h</span><span>9h</span><span>10h</span></div>
            </div>
          </Card>

          <Card className="flex flex-col gap-2"><SecLabel icon="timelapse">Time to Fall Asleep</SecLabel><PillGrid cols={2} opts={["< 10 min", "10–20 min", "20–40 min", "40+ min"]} value={sleep.latency} onChange={(v) => setSleep((s) => ({ ...s, latency: v }))} /></Card>
          <Card className="flex flex-col gap-2"><SecLabel icon="wb_twilight">Daytime Nap</SecLabel><PillTrack opts={["No", "Sometimes", "Daily"]} value={sleep.nap} onChange={(v) => setSleep((s) => ({ ...s, nap: v }))} /></Card>
          <Card className="flex flex-col gap-2"><SecLabel icon="wb_sunny">Waking Feeling</SecLabel><PillTrack opts={["Fresh", "Balanced", "Tired"]} value={sleep.waking} onChange={(v) => setSleep((s) => ({ ...s, waking: v }))} /></Card>
        </div>
      </main>
      <BottomBar onClick={onNext} label="Continue" />
    </>
  );
}

/* ================= FOOD & MEALS (Step 4) ================= */
function FoodStep({ food, setFood, onBack, onNext }: { food: FoodData; setFood: (fn: (f: FoodData) => FoodData) => void; onBack: () => void; onNext: () => void }) {
  return (
    <>
      <TopBar onBack={onBack} progress={1} />
      <main className="px-6 pb-28 pt-[4.75rem]">
        <div className="flex flex-col gap-2.5">
          <div className="pb-1">
            <div className="mb-1.5 flex items-center justify-between text-[11px] uppercase tracking-wider"><span className="font-semibold text-[#727875]">Step 4 of 4</span><span className="font-semibold text-[#4b6159]">100% Complete</span></div>
            <div className="h-1 w-full overflow-hidden rounded-full bg-[#ebeeef]"><div className="h-full w-full rounded-full bg-[#4b6159]" /></div>
          </div>
          <h1 className="text-[24px] font-semibold tracking-tight text-[#181c1d]" style={SERIF4}>Food &amp; Meals</h1>

          <Card className="flex flex-col gap-2"><SecLabel>Food style</SecLabel><PillGrid opts={["Veg", "Vegan", "Egg", "Non-veg"]} value={food.style} onChange={(v) => setFood((f) => ({ ...f, style: v }))} /></Card>
          <Card className="flex flex-col gap-2"><SecLabel>Main meals / day</SecLabel><PillGrid opts={["1", "2", "3", "4+"]} value={food.mainMeals} onChange={(v) => setFood((f) => ({ ...f, mainMeals: v }))} /></Card>
          <Card className="flex flex-col gap-2"><SecLabel>Snacks / day</SecLabel><PillGrid opts={["0", "1", "2", "3+"]} value={food.snacks} onChange={(v) => setFood((f) => ({ ...f, snacks: v }))} /></Card>
          <Card className="flex flex-col gap-2">
            <SecLabel>Meal timing</SecLabel>
            <div className="grid grid-cols-2 gap-2.5">
              {([["Breakfast", food.breakfast], ["Dinner", food.dinner]] as const).map(([k, v]) => (
                <div key={k} className="flex flex-col gap-0.5 rounded-lg bg-[#f1f4f5] p-2.5">
                  <span className="text-[12px] text-[#424845]">{k}</span>
                  <div className="flex items-center justify-between pt-0.5"><span className="text-[18px] font-semibold text-[#181c1d]">{v}</span><MS name="schedule" size={18} className="text-[#727875]" /></div>
                </div>
              ))}
            </div>
          </Card>
          <Card className="flex flex-col gap-2"><SecLabel>Water / day</SecLabel><PillGrid opts={["< 1.5L", "2L", "2.5–3L", "3.5L+"]} value={food.water} onChange={(v) => setFood((f) => ({ ...f, water: v }))} /></Card>
        </div>
      </main>
      <BottomBar onClick={onNext} label="Continue" arrow={false} uppercase />
    </>
  );
}

/* ================= CALORIES (kept) ================= */
function CaloriesStep({ bmr, tdee, name, activity, onNext }: { bmr: number; tdee: number; name: string; activity: ActivityLevel; onNext: () => void }) {
  return (
    <div className="animate-float-up">
      <p className={EYEBROW}>Your daily calories</p>
      <h1 className="mt-1 text-[28px] font-semibold leading-tight tracking-tight text-[#121417]" style={SERIF}>
        {name ? `${name}, you need` : "You need"} ~{tdee} kcal/day
      </h1>
      <p className="mt-2 text-[13px] leading-relaxed text-[#6E727A]">
        This is the energy your body burns to maintain your current weight at <b className="text-[#121417]">{ACTIVITY_LABEL[activity].label.toLowerCase()}</b> activity.
        Eat less to lose, more to gain — and we'll guide you through it in your wellness plan.
      </p>
      <div className="mt-5 grid grid-cols-2 gap-3">
        <div className="rounded-2xl border border-[#E6E6E2] bg-white/70 p-4" style={{ boxShadow: SH_CARD }}>
          <p className="text-[10px] uppercase tracking-wider text-[#6E727A]">BMR (at rest)</p>
          <p className="mt-1 text-[26px] font-semibold text-[#121417]" style={SERIF}>{bmr}</p>
          <p className="text-[10px] text-[#6E727A]">kcal/day</p>
        </div>
        <div className="rounded-2xl border-2 border-[#1C2B4A] bg-white p-4" style={{ boxShadow: SH_SEL }}>
          <p className="text-[10px] uppercase tracking-wider text-[#1C2B4A]">Maintenance (TDEE)</p>
          <p className="mt-1 text-[26px] font-semibold text-[#1C2B4A]" style={SERIF}>{tdee}</p>
          <p className="text-[10px] text-[#6E727A]">kcal/day</p>
        </div>
      </div>
      <p className="mt-4 rounded-2xl border border-[#DDE2EC] bg-[#ECECEA] p-3.5 text-[12px] leading-relaxed text-[#4A4E55]">
        <Flame size={12} className="-mt-0.5 mr-1 inline text-[#1C2B4A]" />
        In Ayurveda, this number is just the start — <em>agni</em> (your digestive fire), prakriti and season all shape how
        food works in your body. We'll layer those next.
      </p>
      <button onClick={onNext} className={CTA}>Continue <ArrowRight size={16} /></button>
    </div>
  );
}

/* ================= PRAKRITI (kept) ================= */
function PrakritiIntro({ onTake, onSkip, mandatory }: { onTake: () => void; onSkip?: () => void; mandatory?: boolean }) {
  return (
    <div className="animate-float-up">
      <p className="text-xs font-semibold uppercase tracking-[0.2em] text-primary/80">Know yourself</p>
      <h1 className="mt-1 font-display text-2xl font-semibold text-foreground">Your Prakriti matters</h1>
      <div className="mt-5 overflow-hidden rounded-3xl shadow-[var(--shadow-soft)] ring-1 ring-border/60" style={{ background: "var(--gradient-violet)" }}>
        <div className="p-5 text-primary-foreground">
          <p className="text-[13px] leading-relaxed opacity-90">
            We are all made of <strong>five elements</strong> — Earth, Water, Fire, Air & Ether. Your
            dominant nature shows up as one (or two) of three doshas:
          </p>
          <div className="mt-4 grid grid-cols-3 gap-2 text-center">
            {[
              { d: "Vata", el: "Air + Ether", c: "from-sky-400/40 to-indigo-400/40" },
              { d: "Pitta", el: "Fire + Water", c: "from-amber-400/40 to-rose-400/40" },
              { d: "Kapha", el: "Earth + Water", c: "from-emerald-400/40 to-teal-400/40" },
            ].map((x) => (
              <div key={x.d} className={`rounded-2xl bg-gradient-to-br ${x.c} p-3 ring-1 ring-white/20 backdrop-blur-sm`}>
                <p className="font-display text-base font-semibold">{x.d}</p>
                <p className="text-[10px] opacity-90">{x.el}</p>
              </div>
            ))}
          </div>
          <p className="mt-4 text-[12px] leading-relaxed opacity-90">
            Your prakriti shapes <strong>who you are</strong> — and is the key to what you should
            eat, the lifestyle that suits you and the diseases you're prone to.
          </p>
        </div>
      </div>
      <div className="mt-4 rounded-2xl bg-card p-4 text-[13px] leading-relaxed text-foreground/85 ring-1 ring-border/60">
        {mandatory
          ? "Prakriti is the foundation of every recommendation on AyuRaise — diet plan, detox protocol, yoga sequences. We'll ask you a quick 1-min survey before you start."
          : "Knowing your prakriti is the centre of a lot of things on AyuRaise — your diet plan, detox protocol and yoga sequences are all tuned to it."}
      </div>
      <div className="mt-6 grid gap-3">
        <button onClick={onTake} className="flex items-center justify-center gap-2 rounded-2xl bg-primary px-5 py-3.5 text-sm font-semibold text-primary-foreground shadow-[var(--shadow-glow)] transition-transform active:scale-[0.98]">
          <Sparkles size={16} /> Take 1-min Prakriti survey
        </button>
        {!mandatory && onSkip && (
          <button onClick={onSkip} className="rounded-2xl bg-card px-5 py-3.5 text-sm font-semibold text-foreground ring-1 ring-border">Skip for now</button>
        )}
      </div>
    </div>
  );
}

function PrakritiHandoff({ dosha, score, onContinue }: { dosha: Dosha; score: Record<Dosha, number>; onContinue: () => void }) {
  void dosha; void score;
  return (
    <div className="animate-float-up">
      <p className="text-xs font-semibold uppercase tracking-[0.2em] text-primary/80">One quick note</p>
      <h1 className="mt-1 font-display text-2xl font-semibold text-foreground">Planning for a loved one?</h1>
      <div className="mt-5 overflow-hidden rounded-3xl shadow-[var(--shadow-soft)] ring-1 ring-border/60" style={{ background: "var(--gradient-violet)" }}>
        <div className="p-5 text-primary-foreground">
          <p className="text-[13px] leading-relaxed opacity-95">
            Every plan in AyuRaise — diet, disease management, fasting, yoga, detox — is tuned
            to <em>this</em> profile's prakriti. So please don't use this profile to create
            plans for someone else.
          </p>
          <p className="mt-3 text-[13px] leading-relaxed opacity-95">
            For a family member, add a separate profile. Take their prakriti quiz, then switch
            between profiles anytime from the top-right of the home screen.
          </p>
          <p className="mt-3 text-[11px] opacity-80">(Meditation is the one thing that works across profiles — guided by ritucharya.)</p>
          <a href="/onboarding?profileId=new" className="mt-4 inline-flex items-center gap-2 rounded-xl bg-white/15 px-3.5 py-2 text-xs font-semibold text-primary-foreground ring-1 ring-white/30 backdrop-blur-sm">+ Add another profile</a>
        </div>
      </div>
      <button onClick={onContinue} className="mt-6 flex w-full items-center justify-center gap-2 rounded-2xl bg-primary px-5 py-3.5 text-sm font-semibold text-primary-foreground shadow-[var(--shadow-glow)]">Got it, take me in</button>
    </div>
  );
}

function PrakritiQuiz({ qIdx, answers, onAnswer }: { qIdx: number; answers: PrakritiAnswer[]; onAnswer: (d: Dosha) => void }) {
  const q = PRAKRITI_QUESTIONS[qIdx];
  const selected = answers.find((a) => a.q === qIdx)?.option;
  return (
    <div className="animate-float-up">
      <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-muted-foreground">Question {qIdx + 1} of {PRAKRITI_QUESTIONS.length}</p>
      <h1 className="mt-1 font-display text-2xl font-semibold text-foreground">{q.q}</h1>
      <div className="mt-6 space-y-3">
        {q.options.map((opt) => {
          const active = selected === opt.dosha;
          return (
            <button key={opt.dosha} onClick={() => onAnswer(opt.dosha)} className={`flex w-full items-center justify-between gap-3 rounded-2xl p-4 text-left ring-1 transition-all ${active ? "bg-primary/10 ring-primary" : "bg-card ring-border"}`}>
              <span className="text-sm text-foreground">{opt.label}</span>
              <span className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">{opt.dosha}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}

function PrakritiResult({ answers, onFinish }: { answers: PrakritiAnswer[]; onFinish: (d: { dosha: Dosha; score: Record<Dosha, number> }) => void }) {
  const result = scorePrakriti(answers);
  const total = result.score.vata + result.score.pitta + result.score.kapha || 1;
  const pct = {
    vata: Math.round((result.score.vata / total) * 100),
    pitta: Math.round((result.score.pitta / total) * 100),
    kapha: Math.round((result.score.kapha / total) * 100),
  };
  const colors: Record<Dosha, string> = { vata: "bg-sky-500", pitta: "bg-rose-500", kapha: "bg-emerald-500" };
  const meaning: Record<Dosha, string> = {
    vata: "Air + Ether — you're creative, quick-thinking and light-framed. Stay warm, grounded and on a steady rhythm.",
    pitta: "Fire + Water — you're sharp, focused and driven. Keep yourself cool, calm and unhurried.",
    kapha: "Earth + Water — you're steady, strong and nurturing. Stay active, light and energised.",
  };
  return (
    <div className="animate-float-up">
      <p className="text-xs font-semibold uppercase tracking-[0.2em] text-primary/80">Your Prakriti</p>
      <h1 className="mt-1 font-display text-3xl font-semibold capitalize text-foreground">{result.dosha}-dominant</h1>
      <div className="mt-6 rounded-3xl bg-card p-5 shadow-[var(--shadow-soft)] ring-1 ring-border/60">
        <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Composition</p>
        <div className="mt-3 flex h-3 w-full overflow-hidden rounded-full bg-muted">
          <div className={colors.vata} style={{ width: `${pct.vata}%` }} />
          <div className={colors.pitta} style={{ width: `${pct.pitta}%` }} />
          <div className={colors.kapha} style={{ width: `${pct.kapha}%` }} />
        </div>
        <div className="mt-4 space-y-2.5 text-sm">
          {(["vata", "pitta", "kapha"] as Dosha[]).map((d) => (
            <div key={d} className="flex items-center justify-between">
              <span className="flex items-center gap-2 capitalize text-foreground"><span className={`h-2.5 w-2.5 rounded-full ${colors[d]}`} />{d}</span>
              <span className="font-semibold text-foreground">{pct[d]}%</span>
            </div>
          ))}
        </div>
        <div className="mt-4 rounded-2xl bg-accent/40 p-3 text-[12.5px] leading-relaxed text-foreground/85 ring-1 ring-border/60">
          <p className="font-semibold capitalize text-primary">What {result.dosha} dominant means</p>
          <p className="mt-1">{meaning[result.dosha]}</p>
        </div>
        <p className="mt-4 text-sm leading-relaxed text-foreground/85">
          We'll now use your prakriti for every recommendation — diet plans, managing health
          conditions, fasting windows, yoga sequences and detox protocols.
        </p>
      </div>
      <button onClick={() => onFinish(result)} className="mt-6 flex w-full items-center justify-center gap-2 rounded-2xl bg-primary px-5 py-3.5 text-sm font-semibold text-primary-foreground shadow-[var(--shadow-glow)] transition-transform active:scale-[0.98]">Continue <ArrowRight size={16} /></button>
    </div>
  );
}

function PlanIntro({ onBuild, onPark }: { onBuild: () => void; onPark: () => void }) {
  return (
    <div className="animate-float-up">
      <p className="text-xs font-semibold uppercase tracking-[0.2em] text-primary/80">One last step</p>
      <h1 className="mt-1 font-display text-2xl font-semibold text-foreground">Build my personalized wellness plan</h1>
      <p className="mt-2 text-[13px] leading-relaxed text-muted-foreground">
        A daily rhythm weaving yoga, pranayam, meditation, diet, fasting and detox — all tuned to your prakriti and the season.
      </p>
      <div className="mt-5 overflow-hidden rounded-3xl p-5 shadow-[var(--shadow-soft)] ring-1 ring-border/60" style={{ background: "var(--gradient-night)" }}>
        <div className="flex items-start gap-3 text-primary-foreground">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-white/15 ring-1 ring-white/25 backdrop-blur-sm"><ClipboardList size={22} /></div>
          <div className="flex-1">
            <p className="font-display text-base font-semibold">Your wellness plan</p>
            <p className="mt-1 text-[12px] leading-relaxed opacity-85">Pick the pillars you care about, your focus, daily time and intensity. We'll do the rest.</p>
          </div>
        </div>
      </div>
      <div className="mt-6 grid gap-3">
        <button onClick={onBuild} className="flex items-center justify-center gap-2 rounded-2xl bg-primary px-5 py-3.5 text-sm font-semibold text-primary-foreground shadow-[var(--shadow-glow)] transition-transform active:scale-[0.98]">
          <Sparkles size={16} /> Build it now
        </button>
        <button onClick={onPark} className="rounded-2xl bg-card px-5 py-3.5 text-sm font-semibold text-foreground ring-1 ring-border">Park for later — let me explore first</button>
      </div>
    </div>
  );
}

/* ================= WELCOME (kept) ================= */
function WelcomeStep({ onNext }: { onNext: () => void }) {
  const offers = [
    { icon: Flower2, title: "Know your Prakriti", desc: "Discover your unique mind–body type and what it means for you." },
    { icon: Soup, title: "Personalized diet", desc: "Foods, meals & spices tuned to your dosha and the season." },
    { icon: HeartPulse, title: "Yoga & pranayam", desc: "Daily sequences for energy, balance and calm." },
    { icon: Wind, title: "Detox & fasting", desc: "Gentle, season-aware cleanses that actually fit your life." },
    { icon: Moon, title: "Sleep & rhythm", desc: "A daily flow (dinacharya) that restores your nervous system." },
  ];
  return (
    <div className="animate-float-up">
      <p className={EYEBROW}>Welcome to AyuRaise</p>
      <h1 className="mt-1 text-[30px] font-semibold leading-tight tracking-tight text-[#121417]" style={SERIF}>Ancient wisdom, made personal</h1>
      <p className="mt-2 text-[13px] leading-relaxed text-[#6E727A]">Here's what you can do on AyuRaise — all woven into one daily rhythm tuned to you.</p>
      <div className="mt-5 overflow-hidden rounded-3xl border border-[#E6E6E2] bg-white p-5" style={{ boxShadow: SH_CARD }}>
        <div className="flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.2em] text-[#1C2B4A]"><Leaf size={12} /> What we offer</div>
        <ul className="mt-4 space-y-3.5">
          {offers.map(({ icon: Icon, title, desc }) => (
            <li key={title} className="flex items-start gap-3.5">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-[#1C2B4A] shadow-sm"><Icon size={18} className="text-white" strokeWidth={1.75} /></div>
              <div className="flex-1">
                <p className="text-[15px] font-semibold tracking-tight text-[#121417]">{title}</p>
                <p className="mt-0.5 text-[12px] leading-relaxed text-[#4A4E55]/80">{desc}</p>
              </div>
            </li>
          ))}
        </ul>
      </div>
      <p className="mt-4 text-[12px] leading-relaxed text-[#6E727A]">Next, we'll learn a little about you so every recommendation is shaped around your body, season and goals.</p>
      <button onClick={onNext} className={CTA}>Get started <ArrowRight size={16} /></button>
    </div>
  );
}
