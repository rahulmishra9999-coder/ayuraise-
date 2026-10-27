import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useMemo, useState, Fragment } from "react";
import {
  ArrowLeft, ArrowRight, Sparkles, Flower2, MapPin, Info, ClipboardList,
  Leaf, HeartPulse, Soup, Wind, Moon, Flame, Activity, ChevronRight, Check,
} from "lucide-react";
import { PRAKRITI_QUESTIONS, scorePrakriti, type Dosha, type PrakritiAnswer } from "@/lib/diet";
import { calcBMR, calcTDEE, ACTIVITY_LABEL, type ActivityLevel } from "@/lib/weight-loss";
import { saveAsNewProfile, getActiveProfileId, upsertProfile } from "@/lib/profiles";
import { cuisineRegion } from "@/lib/cuisines";
import { CuisinePicker } from "@/components/CuisinePicker";

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
      { rel: "stylesheet", href: "https://fonts.googleapis.com/css2?family=Playfair+Display:wght@600;700;800&display=swap" },
    ],
  }),
  component: OnboardingPage,
});

// ---- Bronze/serif "luxury" skin for the first 5 profile steps (welcome → calories) ----
const SKIN_STEPS = ["welcome", "profile", "cuisine", "activity", "calories"];
const SERIF = { fontFamily: '"Playfair Display", Georgia, serif' } as const;
const SH_CARD = "0 1px 2px rgba(17,19,24,0.04), 0 10px 26px -14px rgba(17,19,24,0.14)";
const SH_SEL = "0 2px 6px rgba(28,43,74,0.10), 0 14px 30px -12px rgba(28,43,74,0.26)";
// CTA (sharp ink button) + eyebrow + title helpers reused across the skinned steps
const CTA = "mt-6 flex w-full items-center justify-center gap-2 rounded-xl bg-[#121417] px-6 py-4 text-[15px] font-semibold tracking-wide text-[#F5F5F3] shadow-md transition-all duration-200 active:scale-[0.99] active:bg-black disabled:opacity-40";
const EYEBROW = "text-[11px] font-semibold uppercase tracking-[0.24em] text-[#1C2B4A]";

type Step = "welcome" | "profile" | "cuisine" | "activity" | "calories" | "prakriti-intro" | "prakriti-quiz" | "prakriti-result" | "prakriti-handoff" | "plan-intro";

function OnboardingPage() {
  const navigate = useNavigate();
  const { step: stepParam, returnTo, profileId } = Route.useSearch();
  const isNewProfile = profileId === "new";
  const [step, setStep] = useState<Step>(stepParam ?? (isNewProfile ? "profile" : "welcome"));

  // Profile
  const [name, setName] = useState("");
  const [age, setAge] = useState("");
  const [gender, setGender] = useState<"male" | "female" | "other" | "">("");
  const [heightCm, setHeightCm] = useState("");
  const [weightKg, setWeightKg] = useState("");
  const [location, setLocation] = useState("");
  const [cuisinePath, setCuisinePath] = useState<string[]>([]); // [region, sub, local]

  // Activity
  const [activity, setActivity] = useState<ActivityLevel | "">("");

  // Prakriti
  const [answers, setAnswers] = useState<PrakritiAnswer[]>([]);
  const [qIdx, setQIdx] = useState(0);
  const [prakritiResult, setPrakritiResult] = useState<{ dosha: Dosha; score: Record<Dosha, number> } | null>(null);

  const profileValid = name.trim() && age && gender && heightCm && weightKg && location.trim();

  // Hydrate existing profile when deep-linking to a later step.
  // Skip hydration when creating a brand-new profile.
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
      if (p?.location) setLocation(p.location);
      if (Array.isArray(p?.cuisinePath)) setCuisinePath(p.cuisinePath);
      if (p?.activity) setActivity(p.activity);
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
    // Always update the active-profile mirror so the rest of the app reads it.
    let existing: Record<string, unknown> = {};
    try { existing = JSON.parse(localStorage.getItem("ayuraise.profile") ?? "{}") ?? {}; } catch {}
    const baseNext: Record<string, unknown> = isNewProfile ? {} : { ...existing };
    if (name.trim()) baseNext.name = name.trim();
    if (age) baseNext.age = Number(age);
    if (gender) baseNext.gender = gender;
    if (heightCm) baseNext.heightCm = Number(heightCm);
    if (weightKg) baseNext.weightKg = Number(weightKg);
    if (location.trim()) baseNext.location = location.trim();
    if (cuisinePath.length) {
      baseNext.cuisinePath = cuisinePath;
      baseNext.cuisine = cuisinePath[cuisinePath.length - 1]; // most specific, for display
      baseNext.cuisineRegion = cuisineRegion(cuisinePath);    // engine key (Indian regions)
    }
    if (activity) baseNext.activity = activity as ActivityLevel;
    if (calc?.bmr) baseNext.bmr = calc.bmr;
    if (calc?.tdee) baseNext.tdee = calc.tdee;
    if (prakritiData !== undefined) baseNext.prakriti = prakritiData;
    baseNext.onboardedAt = new Date().toISOString();
    localStorage.setItem("ayuraise.profile", JSON.stringify(baseNext));

    // Maintain the profiles array (multi-profile support).
    try {
      if (isNewProfile) {
        const created = saveAsNewProfile(baseNext as any);
        localStorage.setItem("ayuraise.profile", JSON.stringify(created));
      } else {
        const activeId = getActiveProfileId();
        if (activeId) upsertProfile({ id: activeId, ...(baseNext as any) });
        else saveAsNewProfile(baseNext as any);
      }
    } catch {}
  };

  const skin = SKIN_STEPS.includes(step);
  return (
    <div className="min-h-svh px-5 pb-10 pt-[max(1.5rem,env(safe-area-inset-top))]" style={skin ? { background: "#F4F4F2", fontFamily: '"Plus Jakarta Sans", sans-serif' } : { background: "var(--gradient-hero)" }}>
      <div className="mx-auto max-w-md">
        <div className="mb-6 flex items-center justify-between">
          <button
            onClick={() => {
              if (step === "welcome") navigate({ to: "/login" });
              else if (step === "profile") setStep("welcome");
              else if (step === "cuisine") setStep("profile");
              else if (step === "activity") setStep("cuisine");
              else if (step === "calories") setStep("activity");
              else if (step === "prakriti-intro") setStep("calories");
              else if (step === "prakriti-quiz") {
                if (qIdx === 0) setStep("prakriti-intro");
                else setQIdx(qIdx - 1);
              } else if (step === "prakriti-result") setStep("prakriti-quiz");
              else if (step === "plan-intro") setStep(prakritiResult ? "prakriti-result" : "prakriti-intro");
            }}
            className={skin ? "flex h-10 w-10 items-center justify-center rounded-full border border-[#1C2B4A]/20 bg-[#ECECEA] text-[#121417] shadow-sm active:bg-[#E2E2DE]" : "flex h-9 w-9 items-center justify-center rounded-full bg-card/70 ring-1 ring-border"}
            aria-label="Back"
          >
            <ArrowLeft size={16} />
          </button>
          <StepDots step={step} skin={skin} />
          <div className="w-9" />
        </div>

        {step === "welcome" && (
          <WelcomeStep onNext={() => setStep("profile")} />
        )}

        {step === "profile" && (
          <ProfileStep
            {...{ name, setName, age, setAge, gender, setGender, heightCm, setHeightCm, weightKg, setWeightKg, location, setLocation }}
            onNext={() => profileValid && setStep("cuisine")}
            valid={!!profileValid}
          />
        )}

        {step === "cuisine" && (
          <CuisineStep path={cuisinePath} setPath={setCuisinePath} onNext={() => setStep("activity")} />
        )}

        {step === "activity" && (
          <ActivityStep activity={activity} setActivity={setActivity} onNext={() => activity && setStep("calories")} />
        )}

        {step === "calories" && calc && (
          <CaloriesStep
            bmr={calc.bmr} tdee={calc.tdee}
            name={name} activity={activity as ActivityLevel}
            onNext={() => setStep("prakriti-intro")}
          />
        )}

        {step === "prakriti-intro" && (
          <PrakritiIntro
            mandatory
            onTake={() => { setAnswers([]); setQIdx(0); setStep("prakriti-quiz"); }}
          />
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
          <PrakritiHandoff
            dosha={prakritiResult.dosha}
            score={prakritiResult.score}
            onContinue={() => setStep("plan-intro")}
          />
        )}

        {step === "plan-intro" && (
          <PlanIntro
            onBuild={() => navigate({ to: "/plan" })}
            onPark={() => navigate({ to: "/home" })}
          />
        )}
      </div>
    </div>
  );
}

function StepDots({ step, skin }: { step: Step; skin?: boolean }) {
  const map: Record<Step, number> = {
    "welcome": 0, "profile": 1, "cuisine": 2, "activity": 3, "calories": 3,
    "prakriti-intro": 4, "prakriti-quiz": 4, "prakriti-result": 4,
    "prakriti-handoff": 5, "plan-intro": 5,
  };
  const i = map[step];
  const onCls = skin ? "w-6 bg-[#1C2B4A]" : "w-6 bg-primary";
  const offCls = skin ? "w-1.5 bg-[#E0E0DC]" : "w-1.5 bg-foreground/20";
  return (
    <div className="flex gap-1.5">
      {[0, 1, 2, 3, 4, 5].map((idx) => (
        <span key={idx} className={`h-1.5 rounded-full transition-all ${idx <= i ? onCls : offCls}`} />
      ))}
    </div>
  );
}

// ---------------- Cuisine (layered drill-down) ----------------
function CuisineStep({ path, setPath, onNext }: { path: string[]; setPath: (p: string[]) => void; onNext: () => void }) {
  return (
    <div className="animate-float-up">
      <p className={EYEBROW}>Your kitchen</p>
      <h1 className="mt-1 text-[28px] font-semibold leading-none tracking-tight text-[#121417]" style={SERIF}>Your cuisine preference</h1>
      <p className="mt-2 text-[13px] leading-relaxed text-[#6E727A]">
        So your meal plan uses food you actually enjoy. Pick a region, then narrow it down.
      </p>
      <div className="mt-5"><CuisinePicker path={path} setPath={setPath} /></div>
      <button onClick={onNext} disabled={path.length === 0} className={CTA}>
        Continue <ArrowRight size={16} />
      </button>
      <button onClick={onNext} className="mt-3 w-full text-center text-[12px] font-semibold text-[#1C2B4A]">Skip for now</button>
    </div>
  );
}

// ---------------- Profile ----------------
function ProfileStep(p: any) {
  return (
    <div className="animate-float-up">
      <p className={EYEBROW}>About you</p>
      <h1 className="mt-1 text-[28px] font-semibold leading-none tracking-tight text-[#121417]" style={SERIF}>Tell us about you</h1>
      <p className="mt-2 flex items-start gap-1.5 text-[12px] leading-relaxed text-[#6E727A]">
        <Info size={12} className="mt-0.5 shrink-0 text-[#1C2B4A]" />
        We need these to recommend the right calories, diet and meals as per weather conditions (ritucharya).
      </p>

      <div className="mt-6 space-y-4 rounded-3xl bg-white p-5 ring-1 ring-[#E6E6E2]" style={{ boxShadow: SH_CARD }}>
        <Field label="Name">
          <input value={p.name} onChange={(e) => p.setName(e.target.value)} placeholder="Your name" className={inputCls} />
        </Field>

        <div className="grid grid-cols-2 gap-3">
          <Field label="Age">
            <input value={p.age} onChange={(e) => p.setAge(e.target.value)} type="number" min={1} max={120} placeholder="28" className={inputCls} />
          </Field>
          <Field label="Gender">
            <select value={p.gender} onChange={(e) => p.setGender(e.target.value)} className={inputCls}>
              <option value="">Select</option>
              <option value="male">Male</option>
              <option value="female">Female</option>
              <option value="other">Other</option>
            </select>
          </Field>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <Field label="Height (cm)">
            <input value={p.heightCm} onChange={(e) => p.setHeightCm(e.target.value)} type="number" placeholder="170" className={inputCls} />
          </Field>
          <Field label="Weight (kg)">
            <input value={p.weightKg} onChange={(e) => p.setWeightKg(e.target.value)} type="number" placeholder="65" className={inputCls} />
          </Field>
        </div>
        <p className="-mt-2 text-[11px] text-[#6E727A]">Used to recommend right calories &amp; diet for you.</p>

        <Field label="Location">
          <div className="relative">
            <MapPin size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#1C2B4A]" />
            <input value={p.location} onChange={(e) => p.setLocation(e.target.value)} placeholder="City, Country" className={inputCls + " pl-8"} />
          </div>
        </Field>
        <p className="-mt-2 text-[11px] text-[#6E727A]">So we can adjust food &amp; meals to your weather (ritucharya).</p>

      </div>

      <button disabled={!p.valid} onClick={p.onNext} className={CTA}>
        Continue <ArrowRight size={16} />
      </button>
    </div>
  );
}

const inputCls =
  "w-full rounded-xl bg-[#F4F4F2] px-3 py-2.5 text-sm text-[#121417] ring-1 ring-[#E6E6E2] focus:outline-none focus:ring-2 focus:ring-[#1C2B4A] placeholder:text-[#6E727A]/60";

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-[11px] font-semibold uppercase tracking-wider text-[#1C2B4A]">{label}</span>
      {children}
    </label>
  );
}

// ---------------- Activity ----------------
function ActivityStep({ activity, setActivity, onNext }: { activity: ActivityLevel | ""; setActivity: (a: ActivityLevel) => void; onNext: () => void }) {
  const opts: ActivityLevel[] = ["sedentary", "light", "moderate", "active", "very_active"];
  return (
    <div className="animate-float-up">
      <p className={EYEBROW}>Daily movement</p>
      <h1 className="mt-1 text-[28px] font-semibold leading-none tracking-tight text-[#121417]" style={SERIF}>How active are you?</h1>
      <p className="mt-2 text-[13px] text-[#6E727A]">This tunes your daily calorie needs.</p>

      <div role="radiogroup" className="mt-5 space-y-3.5">
        {opts.map((a) => {
          const meta = ACTIVITY_LABEL[a];
          const on = activity === a;
          return (
            <button
              key={a}
              role="radio"
              aria-checked={on}
              onClick={() => setActivity(a)}
              style={{ boxShadow: on ? SH_SEL : SH_CARD }}
              className={`flex w-full items-start gap-3.5 rounded-2xl p-4 text-left transition-all duration-200 active:scale-[0.985] ${
                on ? "border-2 border-[#1C2B4A] bg-white" : "border border-[#E6E6E2] bg-white/70"
              }`}
            >
              {on ? (
                <span className="mt-0.5 flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-full bg-[#1C2B4A] shadow-sm">
                  <Check className="h-3.5 w-3.5 text-white" strokeWidth={2.5} />
                </span>
              ) : (
                <span className="mt-0.5 h-5 w-5 flex-shrink-0 rounded-full border border-[#1C2B4A]/30 bg-[#F4F4F2]" />
              )}
              <div className="flex-1">
                <p className="text-base font-semibold tracking-tight text-[#121417]">{meta.label}</p>
                <p className="mt-0.5 text-[13px] leading-relaxed text-[#4A4E55]/80">{meta.desc}</p>
              </div>
            </button>
          );
        })}
      </div>

      <button disabled={!activity} onClick={onNext} className={CTA}>
        Continue <ArrowRight size={16} />
      </button>
    </div>
  );
}

// ---------------- Calories ----------------
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

      <button onClick={onNext} className={CTA}>
        Continue <ArrowRight size={16} />
      </button>
    </div>
  );
}

// ---------------- Prakriti Intro ----------------
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
          <button onClick={onSkip} className="rounded-2xl bg-card px-5 py-3.5 text-sm font-semibold text-foreground ring-1 ring-border">
            Skip for now
          </button>
        )}
      </div>
    </div>
  );
}

function PrakritiHandoff({ dosha, score, onContinue }: { dosha: Dosha; score: Record<Dosha, number>; onContinue: () => void }) {
  // Details of prakriti now live on the PrakritiResult screen.
  // This handoff is the last-mile disclaimer shown just before the user lands on the app.
  void dosha; void score;
  return (
    <div className="animate-float-up">
      <p className="text-xs font-semibold uppercase tracking-[0.2em] text-primary/80">One quick note</p>
      <h1 className="mt-1 font-display text-2xl font-semibold text-foreground">
        Planning for a loved one?
      </h1>

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
          <p className="mt-3 text-[11px] opacity-80">
            (Meditation is the one thing that works across profiles — guided by ritucharya.)
          </p>
          <a
            href="/onboarding?profileId=new"
            className="mt-4 inline-flex items-center gap-2 rounded-xl bg-white/15 px-3.5 py-2 text-xs font-semibold text-primary-foreground ring-1 ring-white/30 backdrop-blur-sm"
          >
            + Add another profile
          </a>
        </div>
      </div>

      <button
        onClick={onContinue}
        className="mt-6 flex w-full items-center justify-center gap-2 rounded-2xl bg-primary px-5 py-3.5 text-sm font-semibold text-primary-foreground shadow-[var(--shadow-glow)]"
      >
        Got it, take me in
      </button>
    </div>
  );
}

function PrakritiQuiz({ qIdx, answers, onAnswer }: { qIdx: number; answers: PrakritiAnswer[]; onAnswer: (d: Dosha) => void }) {
  const q = PRAKRITI_QUESTIONS[qIdx];
  const selected = answers.find((a) => a.q === qIdx)?.option;
  return (
    <div className="animate-float-up">
      <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-muted-foreground">
        Question {qIdx + 1} of {PRAKRITI_QUESTIONS.length}
      </p>
      <h1 className="mt-1 font-display text-2xl font-semibold text-foreground">{q.q}</h1>

      <div className="mt-6 space-y-3">
        {q.options.map((opt) => {
          const active = selected === opt.dosha;
          return (
            <button key={opt.dosha} onClick={() => onAnswer(opt.dosha)}
              className={`flex w-full items-center justify-between gap-3 rounded-2xl p-4 text-left ring-1 transition-all ${active ? "bg-primary/10 ring-primary" : "bg-card ring-border"}`}>
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
              <span className="flex items-center gap-2 capitalize text-foreground">
                <span className={`h-2.5 w-2.5 rounded-full ${colors[d]}`} />{d}
              </span>
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

      <button onClick={() => onFinish(result)}
        className="mt-6 flex w-full items-center justify-center gap-2 rounded-2xl bg-primary px-5 py-3.5 text-sm font-semibold text-primary-foreground shadow-[var(--shadow-glow)] transition-transform active:scale-[0.98]">
        Continue <ArrowRight size={16} />
      </button>
    </div>
  );
}

// ---------------- Plan Intro ----------------
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
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-white/15 ring-1 ring-white/25 backdrop-blur-sm">
            <ClipboardList size={22} />
          </div>
          <div className="flex-1">
            <p className="font-display text-base font-semibold">Your wellness plan</p>
            <p className="mt-1 text-[12px] leading-relaxed opacity-85">
              Pick the pillars you care about, your focus, daily time and intensity. We'll do the rest.
            </p>
          </div>
        </div>
      </div>

      <div className="mt-6 grid gap-3">
        <button onClick={onBuild} className="flex items-center justify-center gap-2 rounded-2xl bg-primary px-5 py-3.5 text-sm font-semibold text-primary-foreground shadow-[var(--shadow-glow)] transition-transform active:scale-[0.98]">
          <Sparkles size={16} /> Build it now
        </button>
        <button onClick={onPark} className="rounded-2xl bg-card px-5 py-3.5 text-sm font-semibold text-foreground ring-1 ring-border">
          Park for later — let me explore first
        </button>
      </div>
    </div>
  );
}

// ---------------- Welcome / What we offer ----------------
function WelcomeStep({ onNext }: { onNext: () => void }) {
  const offers = [
    { icon: Flower2, title: "Know your Prakriti", desc: "Discover your unique mind–body type and what it means for you.", grad: "from-violet-500/90 to-indigo-500/90" },
    { icon: Soup, title: "Personalized diet", desc: "Foods, meals & spices tuned to your dosha and the season.", grad: "from-amber-500/90 to-rose-500/90" },
    { icon: HeartPulse, title: "Yoga & pranayam", desc: "Daily sequences for energy, balance and calm.", grad: "from-emerald-500/90 to-teal-500/90" },
    { icon: Wind, title: "Detox & fasting", desc: "Gentle, season-aware cleanses that actually fit your life.", grad: "from-sky-500/90 to-cyan-500/90" },
    { icon: Moon, title: "Sleep & rhythm", desc: "A daily flow (dinacharya) that restores your nervous system.", grad: "from-indigo-500/90 to-purple-500/90" },
  ];
  return (
    <div className="animate-float-up">
      <p className={EYEBROW}>Welcome to AyuRaise</p>
      <h1 className="mt-1 text-[30px] font-semibold leading-tight tracking-tight text-[#121417]" style={SERIF}>Ancient wisdom, made personal</h1>
      <p className="mt-2 text-[13px] leading-relaxed text-[#6E727A]">
        Here's what you can do on AyuRaise — all woven into one daily rhythm tuned to you.
      </p>

      <div className="mt-5 overflow-hidden rounded-3xl border border-[#E6E6E2] bg-white p-5" style={{ boxShadow: SH_CARD }}>
        <div className="flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.2em] text-[#1C2B4A]">
          <Leaf size={12} /> What we offer
        </div>
        <ul className="mt-4 space-y-3.5">
          {offers.map(({ icon: Icon, title, desc }) => (
            <li key={title} className="flex items-start gap-3.5">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-[#1C2B4A] shadow-sm">
                <Icon size={18} className="text-white" strokeWidth={1.75} />
              </div>
              <div className="flex-1">
                <p className="text-[15px] font-semibold tracking-tight text-[#121417]">{title}</p>
                <p className="mt-0.5 text-[12px] leading-relaxed text-[#4A4E55]/80">{desc}</p>
              </div>
            </li>
          ))}
        </ul>
      </div>

      <p className="mt-4 text-[12px] leading-relaxed text-[#6E727A]">
        Next, we'll learn a little about you so every recommendation is shaped around your body, season and goals.
      </p>

      <button onClick={onNext} className={CTA}>
        Get started <ArrowRight size={16} />
      </button>
    </div>
  );
}
