import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import {
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  Check,
  Sparkles,
  Hourglass,
  Salad,
  Scale,
  Flower2,
  Stethoscope,
  Leaf,
} from "lucide-react";
import { tipsFor } from "@/lib/disease-tips";
import { currentRitu, RITU_NOTE, type Ritu, type Dosha } from "@/lib/diet";


type GoalParam = "disease" | "weight" | "diet";

export const Route = createFileRoute("/combined-plan")({
  validateSearch: (s: Record<string, unknown>) => ({
    goal: (s.goal === "disease" || s.goal === "weight" || s.goal === "diet"
      ? (s.goal as GoalParam)
      : undefined),
    from: s.from === "if" ? ("if" as const) : undefined,
    disease: typeof s.disease === "string" ? (s.disease as string) : undefined,
    tools: typeof s.tools === "string" ? (s.tools as string) : undefined,
  }),

  head: () => ({
    meta: [
      { title: "Create my plan · AyuRaise" },
      {
        name: "description",
        content: "Build a combined Disease, Weight & Diet plan tuned to your prakriti.",
      },
    ],
  }),
  component: CombinedPlanPage,
});

type Goal = "disease" | "weight" | "diet";
type IFWindow = "12:12" | "14:10" | "16:8" | "18:6" | "20:4" | "OMAD";
type PlanKind = "detailed" | "simple";
type DietScope = "1day" | "7day" | "foods";
type DietPref = "veg" | "vegan" | "jain" | "sattvic";
type DietDepth = "foods" | "detailed";
type MealSlot = "Breakfast" | "Brunch" | "Lunch" | "Snack" | "Dinner";


interface State {
  goal?: Goal;
  // disease branch
  intent?: "improve" | "prevent";
  conditions: string[];
  conditionOther: string;
  duration?: string;
  planKind?: PlanKind;
  // diet branch (healthy living)
  dietFor?: "self" | "other";
  dietPicks: string[];           // multi-select from diet_goal screen
  dietPref?: DietPref;
  dietMealsCount?: number;
  dietMealTimes?: string[];
  dietSnackCount?: number; // 0, 1, or 2
  dietSnackTimes?: string[];
  dietScope?: DietScope;
  dietDepth?: DietDepth;
  preventDiseases?: string[];
  planName?: string;
  prakritiSaveChoice?: "overwrite" | "discard";
  // IF
  ifYes?: boolean;
  ifWindow?: IFWindow;
  ifMeals?: number;
  ifMealCombo?: MealSlot[];
  ifDays: string[];
  ifNotify?: boolean;
  offDayPlanWanted?: boolean;

  // Fasting
  fastingYes?: boolean;
  fastingKind?: string;
  fastingEat?: string;
  // Detox
  detoxYes?: boolean;
  detoxDays?: 3 | 5 | 7;
  detoxKind?: string;
  // Weight
  weightYes?: boolean;
  weightDirection?: "loss" | "gain";
  targetWeight?: number;
  paceKg?: number;
  // Yoga
  yogaYes?: boolean;
  yogaTime?: number; // minutes
  arthroIssues?: string;
}

const DISEASES = [
  "Diabetes",
  "Hypertension",
  "PCOS / PCOD",
  "Thyroid",
  "IBS / Gut issues",
  "Obesity",
  "High cholesterol",
  "Fatty liver",
  "Acidity / GERD",
  "Migraine",
];

const DURATIONS = ["< 6 months", "6–12 months", "1–3 years", "3–5 years", "5+ years"];
const FASTS = ["Water fast", "Fruit fast", "Juice fast", "Milk fast", "Ekadashi (one-meal)"];
const DETOX_KINDS = ["Kitchari mono-diet", "Fruit & juice", "Liquids only", "Triphala cleanse"];
const DAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

const IF_TIPS = [
  "Hydrate often during fast hours — warm water, herbal tea, jeera/saunf water.",
  "Break the fast with something light & warm (fruit, soaked nuts, then a proper meal 20 min later).",
  "Front-load protein & fibre in your first meal — keeps hunger flat for hours.",
  "Avoid sugary or refined carbs at the eating window's end; they spike hunger next day.",
  "Sleep 7–8 hrs — poor sleep multiplies hunger hormones (ghrelin).",
  "Skip intense workouts in the first week; walk after meals instead.",
];

// Prakriti-based recommended meals/times (kept inside 9am–8pm)
function prakritiMealDefaults(dosha?: string): { count: number; times: string[]; note: string } {
  if (dosha === "kapha") {
    return {
      count: 2,
      times: ["10:30", "17:30"],
      note: "Kapha is slow & heavy — 2 meals (brunch + early dinner) keep agni light.",
    };
  }
  if (dosha === "vata") {
    return {
      count: 3,
      times: ["09:30", "13:00", "18:00"],
      note: "Vata is irregular — 3 warm, grounding meals at steady times soothe it.",
    };
  }
  return {
    count: 3,
    times: ["09:00", "12:30", "18:30"],
    note: "Pitta has strong agni — 3 meals with the largest at noon balance the fire.",
  };
}

function loadProfile(): { dosha?: string; tdee?: number } {
  if (typeof window === "undefined") return {};
  try {
    const p = JSON.parse(window.localStorage.getItem("ayuraise.profile") ?? "{}");
    return { dosha: p?.prakriti?.dosha, tdee: p?.tdee };
  } catch { return {}; }
}

// Step engine
type StepKey =
  | "goal"
  | "d_intent"
  | "d_condition"
  | "d_duration"
  | "d_tips"
  | "d_plan_kind"
  | "diet_prakriti_gate"
  | "diet_goal"
  | "diet_pref"
  | "diet_depth"
  | "diet_foods_result"
  | "diet_meals"
  | "diet_scope"
  | "if_intro"
  | "if_window"
  | "if_meals"
  | "if_meal_combo"
  | "if_cycles_note"
  | "if_days"
  | "if_notify"
  | "if_tips"
  | "if_offday_ask"
  | "meals_ayurveda"
  | "plan_result"
  | "fasting"
  | "detox"
  | "weight"
  | "yoga"
  | "calories"
  | "done";

function computeSteps(s: State, hideGoalStep: boolean, hasDosha: boolean, fromIf: boolean): StepKey[] {
  const list: StepKey[] = [];
  if (!hideGoalStep) list.push("goal");
  if (!s.goal) return list;

  if (s.goal === "disease") {
    list.push("d_intent", "d_condition", "d_duration", "d_tips", "d_plan_kind");
    if (s.planKind === "simple") {
      list.push("done");
      return list;
    }
    if (s.planKind === "detailed") {
      list.push("if_intro");
      if (s.ifYes) list.push("if_window", "if_meals", "if_tips");
      list.push("fasting", "detox", "weight", "yoga", "calories", "done");
    }
  } else if (s.goal === "weight") {
    list.push("weight");
    list.push("if_intro");
    if (s.ifYes) list.push("if_window", "if_meals", "if_tips");
    list.push("fasting", "detox", "yoga", "calories", "done");
  } else if (s.goal === "diet") {
    // When entering from the IF section ("Yes — IF + diet plan"), the goal &
    // intent are already implied — jump straight to dietary preference.
    if (fromIf) list.push("diet_pref", "diet_depth");
    else list.push("diet_goal", "diet_pref", "diet_depth");
    if (s.dietDepth === "foods") {
      list.push("diet_foods_result", "done");
      return list;
    }
    if (s.dietDepth === "detailed") {
      // When coming from the IF section, IF is already implied — skip the
      // "Restricted eating (Intermittent Fasting)" intro.
      if (!fromIf) list.push("if_intro");
      if (s.ifYes === false) {
        list.push("meals_ayurveda", "plan_result", "done");
      } else if (s.ifYes === true) {
        list.push(
          "if_window",
          "if_meals",
          "if_meal_combo",
          "if_cycles_note",
          "if_tips",
          "plan_result",
          "done",
        );
      }
    }
  }
  return list;
}


function CombinedPlanPage() {
  const navigate = useNavigate();
  const { goal: initialGoal, from } = Route.useSearch();
  const fromIf = from === "if";
  const [s, setS] = useState<State>({
    conditions: [],
    conditionOther: "",
    dietPicks: [],
    ifDays: [],
    goal: initialGoal,
    // Pre-set: coming from IF section means user already wants IF + diet.
    ...(fromIf ? { dietGoal: "healthy-living" as any, dietDepth: "detailed" as DietDepth, ifYes: true } : {}),
  });
  const [idx, setIdx] = useState(0);
  const profile = useMemo(() => loadProfile(), []);
  const hasDosha = Boolean(profile.dosha);
  const steps = useMemo(
    () => computeSteps(s, Boolean(initialGoal), hasDosha, fromIf),
    [s, initialGoal, hasDosha, fromIf],
  );
  const step = steps[idx] ?? (initialGoal ? "d_condition" : "goal");
  const total = Math.max(steps.length, 1);

  const set = (patch: Partial<State>) => setS((p) => ({ ...p, ...patch }));
  const next = () => setIdx((i) => Math.min(i + 1, total - 1));
  const back = () => setIdx((i) => Math.max(i - 1, 0));


  const save = () => {
    try {
      localStorage.setItem("ayuraise.combinedPlan", JSON.stringify({ ...s, createdAt: Date.now() }));
      // Save plan summary so home picks it up
      const pillars: string[] = [];
      if (s.goal === "disease") pillars.push("Disease");
      if (s.weightYes || s.goal === "weight") pillars.push("Weight");
      if (s.ifYes) pillars.push("IF");
      if (s.fastingYes) pillars.push("Fasting");
      if (s.detoxYes) pillars.push("Detox");
      if (s.yogaYes) pillars.push("Yoga");
      pillars.push("Diet");
      const focus =
        s.goal === "disease"
          ? "Disease management"
          : s.goal === "weight"
          ? s.weightDirection === "gain"
            ? "Weight gain"
            : "Weight loss"
          : "Ayurvedic diet";
      localStorage.setItem("ayuraise.plan", JSON.stringify({ pillars, focus }));
      // For diet flow with detailed plan, persist the 7-day plan to dashboard.
      if (s.goal === "diet" && s.dietDepth === "detailed") {
        const plan = buildWeeklyDietPlan(s, profile.dosha as Dosha | undefined);
        const name = (s.planName?.trim() || (s.dietFor === "other" ? "Diet plan for someone" : "My diet plan")).slice(0, 60);
        const existingRaw = localStorage.getItem("ayuraise.dietPlans");
        const existing = existingRaw ? JSON.parse(existingRaw) : [];
        const record = {
          id: `dp_${Date.now()}`,
          name,
          forSelf: s.dietFor !== "other",
          createdAt: Date.now(),
          plan,
        };
        localStorage.setItem("ayuraise.dietPlans", JSON.stringify([record, ...existing]));
        localStorage.setItem("ayuraise.dietPlan", JSON.stringify({ ...plan, name, createdAt: Date.now() }));
      }
      // Restore original prakriti if user planned for someone else and chose discard.
      if (s.goal === "diet" && s.dietFor === "other" && s.prakritiSaveChoice === "discard") {
        const backup = localStorage.getItem("ayuraise.prakritiBackup");
        const profileRaw = localStorage.getItem("ayuraise.profile");
        if (profileRaw) {
          const profileObj = JSON.parse(profileRaw);
          if (backup && backup !== "null") {
            profileObj.prakriti = JSON.parse(backup);
          } else {
            delete profileObj.prakriti;
          }
          localStorage.setItem("ayuraise.profile", JSON.stringify(profileObj));
        }
        localStorage.removeItem("ayuraise.prakritiBackup");
      } else if (s.goal === "diet" && s.dietFor === "other" && s.prakritiSaveChoice === "overwrite") {
        localStorage.removeItem("ayuraise.prakritiBackup");
      }
    } catch {}
    navigate({ to: "/home" });
  };


  return (
    <div className="min-h-svh pb-28" style={{ background: "var(--gradient-hero)" }}>
      <div className="mx-auto max-w-xl px-5 pt-[max(1.25rem,env(safe-area-inset-top))]">
        <header className="flex items-center justify-between pt-2">
          <button
            onClick={() => (idx === 0 ? navigate({ to: "/home" }) : back())}
            className="flex h-9 w-9 items-center justify-center rounded-full bg-card ring-1 ring-border"
          >
            <ChevronLeft size={18} />
          </button>
          <p className="text-xs font-semibold text-muted-foreground">
            Step {idx + 1} of {total}
          </p>
          <Link to="/home" className="text-xs font-semibold text-muted-foreground">
            Cancel
          </Link>
        </header>

        <div className="mt-3 h-1.5 w-full overflow-hidden rounded-full bg-muted">
          <div
            className="h-full rounded-full transition-all"
            style={{ width: `${((idx + 1) / total) * 100}%`, background: "var(--gradient-leaf)" }}
          />
        </div>

        <main className="mt-6">
          {step === "goal" && (
            <StepCard title="What's your primary goal?" subtitle="We'll tailor the next questions to it.">
              <Choice
                options={[
                  { value: "disease", label: "Improve a health condition", icon: Stethoscope },
                  { value: "weight", label: "Lose or gain weight", icon: Scale },
                  { value: "diet", label: "Ayurvedic diet (prakriti & ritucharya)", icon: Salad },
                ]}
                value={s.goal}
                onChange={(v) => {
                  set({ goal: v as Goal });
                  // advance after a tick
                  setTimeout(() => setIdx((i) => i + 1), 50);
                }}
              />
            </StepCard>
          )}

          {step === "d_intent" && (
            <StepCard
              title="What would you like to do?"
              subtitle="Pick one — we'll tailor the next questions to it."
            >
              <Choice
                options={[
                  { value: "improve", label: "Improve an existing health condition", icon: Stethoscope },
                  { value: "prevent", label: "Prevent a condition from happening", icon: Leaf },
                ]}
                value={s.intent}
                onChange={(v) => {
                  set({ intent: v as "improve" | "prevent" });
                  setTimeout(next, 50);
                }}
              />
            </StepCard>
          )}

          {step === "d_condition" && (
            <StepCard
              title={s.intent === "prevent" ? "Which conditions would you like to prevent?" : "Are you struggling with any health condition?"}
              subtitle="Select all that apply. You can add your own."
            >
              <MultiChoice
                options={DISEASES}
                values={s.conditions}
                onToggle={(v) =>
                  set({
                    conditions: s.conditions.includes(v)
                      ? s.conditions.filter((x) => x !== v)
                      : [...s.conditions, v],
                  })
                }
              />
              <input
                value={s.conditionOther}
                onChange={(e) => set({ conditionOther: e.target.value })}
                placeholder="Other (type here)"
                className="mt-3 w-full rounded-2xl bg-card px-4 py-3 text-sm ring-1 ring-border focus:outline-none focus:ring-2 focus:ring-primary/40"
              />
              <PrimaryBtn
                disabled={s.conditions.length === 0 && !s.conditionOther.trim()}
                onClick={next}
              >
                Continue
              </PrimaryBtn>
            </StepCard>
          )}

          {step === "d_duration" && (
            <StepCard title="How long have you been struggling with this?" subtitle="">
              <Choice
                options={DURATIONS.map((d) => ({ value: d, label: d }))}
                value={s.duration}
                onChange={(v) => {
                  set({ duration: v });
                  setTimeout(next, 50);
                }}
              />
            </StepCard>
          )}

          {step === "d_tips" && (
            <StepCard
              title="Lifestyle tips that will help you"
              subtitle="Start these immediately — they accelerate any plan we build next."
            >
              <InfoCard>
                {tipsFor(s.conditions, s.conditionOther).slice(0, 12).map((t) => (
                  <Benefit key={t} text={t} />
                ))}
              </InfoCard>
              <PrimaryBtn onClick={next}>Got it, continue</PrimaryBtn>
            </StepCard>
          )}

          {step === "d_plan_kind" && (
            <StepCard
              title="I can create a diet plan for you"
              subtitle="Pick how detailed you want it."
            >
              <Choice
                options={[
                  {
                    value: "detailed",
                    label: "Full diet plan with each meal & timings",
                    icon: Salad,
                  },
                  {
                    value: "simple",
                    label: "Just foods to eat & avoid for this condition",
                    icon: Leaf,
                  },
                ]}
                value={s.planKind}
                onChange={(v) => {
                  set({ planKind: v as PlanKind });
                  setTimeout(next, 50);
                }}
              />
            </StepCard>
          )}

          {step === "diet_prakriti_gate" && (
            <StepCard
              title="Prakriti check"
              subtitle="Prakriti (Vata / Pitta / Kapha) drives the right foods, meal sizes & timings."
            >
              <div className="mt-2 grid gap-2">
                {hasDosha && (
                  <div className="rounded-2xl bg-accent/40 p-3 ring-1 ring-border/60">
                    <p className="text-[12px] text-foreground/85">
                      Your saved Prakriti: <b className="capitalize">{profile.dosha} dominant</b>.
                    </p>
                  </div>
                )}

                <Link
                  to="/onboarding"
                  search={{ step: "prakriti-intro", returnTo: "/combined-plan?goal=diet" }}
                  onClick={() => {
                    try {
                      if (localStorage.getItem("ayuraise.prakritiBackup") === null) {
                        const profileRaw = localStorage.getItem("ayuraise.profile");
                        const cur = profileRaw ? (JSON.parse(profileRaw)?.prakriti ?? null) : null;
                        localStorage.setItem("ayuraise.prakritiBackup", JSON.stringify(cur));
                      }
                      set({ dietFor: "other" });
                    } catch {}
                  }}
                  className="flex w-full items-center justify-center gap-2 rounded-2xl bg-primary px-4 py-3 text-sm font-semibold text-primary-foreground"
                >
                  <Sparkles size={16} /> Take Prakriti quiz again (for someone else)
                </Link>

                <button
                  onClick={() => { set({ dietFor: "self" }); next(); }}
                  className="w-full rounded-2xl bg-card px-4 py-3 text-sm font-semibold text-foreground ring-1 ring-border"
                >
                  Skip — this plan is for me (use my saved Prakriti)
                </button>
              </div>
            </StepCard>
          )}


          {step === "diet_goal" && (() => {
            type Opt = { value: string; label: string; tooltip: string };
            const HEALTHY_COVERS =
              "Daily diet built around your prakriti (body type)\nSeasonal foods (ritucharya) for current weather\nMeal timings aligned with your agni\nOptional intermittent fasting if it fits you";
            const DISEASE_TOOLTIP = `We help with: ${DISEASES.join(", ")}`;
            const OPTIONS: Opt[] = [
              { value: "Eat healthier", label: "Eat healthier", tooltip: HEALTHY_COVERS },
              { value: "Weight loss", label: "Weight loss", tooltip: "Tailored deficit, pace & food plan" },
              { value: "Gain healthy weight", label: "Gain healthy weight", tooltip: "Healthy surplus with Ayurvedic foods" },
              { value: "Improve any health issues/illness", label: "Improve any health issues / illness", tooltip: DISEASE_TOOLTIP },
              { value: "Prevent a disease", label: "Prevent a disease", tooltip: `Pick what you want to prevent: ${DISEASES.join(", ")}` },
              { value: "Protein rich diet", label: "Protein rich diet", tooltip: "Higher-protein meals for muscle, recovery & satiety" },
              { value: "Low GI diet plan", label: "Low GI diet plan", tooltip: "Low glycemic foods for stable blood sugar & energy" },
              { value: "Reduce inflammation", label: "Reduce inflammation", tooltip: "Anti-inflammatory spices, omega-3s & cooling foods" },
              { value: "Support hormonal balance", label: "Support hormonal balance", tooltip: "Foods that support thyroid, insulin & reproductive hormones" },
              { value: "Healthy aging", label: "Healthy aging", tooltip: "Rasayana foods, antioxidants & joint-supportive meals" },
              { value: "Pregnancy nutrition", label: "Pregnancy nutrition", tooltip: "Garbhini paricharya — nourishing meals trimester-wise" },
              { value: "Postpartum nutrition", label: "Postpartum nutrition", tooltip: "Sutika ahara — recovery, lactation & strength" },
              { value: "Improve immunity", label: "Improve immunity", tooltip: "Ojas-building foods, herbs & seasonal practices" },
            ];
            const pick = s.dietPicks[0];
            const goNextOffset = () => setIdx((i) => Math.min(i + 1, steps.length - 1));
            const choose = (v: string) => {
              set({ dietPicks: [v] });
              setTimeout(() => {
                if (v === "Weight loss") {
                  set({ goal: "weight", weightDirection: "loss" });
                  setIdx(initialGoal ? 0 : 1);
                } else if (v === "Gain healthy weight") {
                  set({ goal: "weight", weightDirection: "gain" });
                  setIdx(initialGoal ? 0 : 1);
                } else if (v === "Improve any health issues/illness") {
                  set({ goal: "disease" });
                  setIdx(initialGoal ? 0 : 1);
                } else if (v === "Prevent a disease") {
                  // stay — show disease picker below
                } else {
                  goNextOffset();
                }
              }, 50);
            };
            return (
              <StepCard
                title="What's behind your diet plan?"
                subtitle="Pick one. Hover (or long-press) any option to see what it covers."
              >
                <div className="grid gap-2">
                  {OPTIONS.map((o) => {
                    const active = pick === o.value;
                    return (
                      <button
                        key={o.value}
                        onClick={() => choose(o.value)}
                        title={o.tooltip}
                        className={`w-full rounded-2xl px-4 py-3 text-left text-sm font-semibold ring-1 ${
                          active
                            ? "bg-primary text-primary-foreground ring-primary"
                            : "bg-card text-foreground ring-border"
                        }`}
                      >
                        {o.label}
                      </button>
                    );
                  })}
                </div>

                {pick === "Prevent a disease" && (
                  <div className="mt-4 rounded-2xl bg-accent/40 p-3 ring-1 ring-border/60">
                    <p className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                      Which disease do you want to prevent?
                    </p>
                    <div className="mt-2 flex flex-wrap gap-1.5">
                      {DISEASES.map((d) => {
                        const on = (s.preventDiseases ?? []).includes(d);
                        return (
                          <button
                            key={d}
                            onClick={() =>
                              set({
                                preventDiseases: on
                                  ? (s.preventDiseases ?? []).filter((x) => x !== d)
                                  : [...(s.preventDiseases ?? []), d],
                              })
                            }
                            className={`rounded-full px-2.5 py-1 text-[11px] font-semibold ring-1 ${
                              on
                                ? "bg-primary text-primary-foreground ring-primary"
                                : "bg-card text-foreground ring-border"
                            }`}
                          >
                            {d}
                          </button>
                        );
                      })}
                    </div>
                    <PrimaryBtn
                      disabled={(s.preventDiseases ?? []).length === 0}
                      onClick={goNextOffset}
                    >
                      Continue
                    </PrimaryBtn>
                  </div>
                )}
              </StepCard>
            );
          })()}




          {step === "diet_pref" && (
            <StepCard
              title="Your dietary preference"
              subtitle="Ayurveda recommends a vegetarian diet — it's the most sattvic and easiest on agni."
            >
              <InfoCard>
                <Benefit text="Easier to digest, lighter on the gut" />
                <Benefit text="More sattvic — supports calm mind & clear thinking" />
                <Benefit text="Reduces ama (toxins) over time" />
              </InfoCard>
              <div className="mt-4">
                <Choice
                  options={[
                    { value: "veg", label: "Vegetarian", icon: Salad },
                    { value: "vegan", label: "Vegan", icon: Leaf },
                    { value: "jain", label: "Jain (no roots)", icon: Leaf },
                    { value: "sattvic", label: "Sattvic (no onion/garlic)", icon: Sparkles },
                  ]}
                  value={s.dietPref}
                  onChange={(v) => {
                    set({ dietPref: v as DietPref });
                    setTimeout(next, 50);
                  }}
                />
              </div>
            </StepCard>
          )}

          {step === "diet_meals" && <DietMealsStep s={s} set={set} onNext={next} />}

          {step === "meals_ayurveda" && <DietMealsStep s={s} set={set} onNext={next} />}

          {step === "diet_depth" && (
            <StepCard
              title="How detailed should your plan be?"
              subtitle="Pick what fits you today — you can come back later."
            >
              <Choice
                options={[
                  {
                    value: "foods",
                    label: "Just show foods I should eat (prakriti + ritucharya)",
                    icon: Leaf,
                  },
                  {
                    value: "detailed",
                    label: "Build a detailed meal-wise diet plan",
                    icon: Salad,
                  },
                ]}
                value={s.dietDepth}
                onChange={(v) => {
                  set({ dietDepth: v as DietDepth });
                  setTimeout(next, 50);
                }}
              />
            </StepCard>
          )}

          {step === "diet_foods_result" && (
            <>
              <DietFoodsResult dosha={profile.dosha as Dosha | undefined} />
              <div className="mt-4"><PrimaryBtn onClick={next}>Continue</PrimaryBtn></div>
            </>
          )}




          {step === "if_intro" && (
            <StepCard
              title="Restricted eating (Intermittent Fasting)"
              subtitle={
                s.goal === "disease"
                  ? "Restricted eating windows can directly improve many of these conditions."
                  : "IF helps regulate insulin, reduce inflammation and improve digestion."
              }
            >
              <InfoCard>
                <Benefit text="Better insulin sensitivity & blood sugar control" />
                <Benefit text="Reduced inflammation, clearer skin" />
                <Benefit text="Improved digestion (agni) and energy" />
                <Benefit text="Easier weight management" />
              </InfoCard>
              <p className="mt-4 text-sm font-medium text-foreground">
                Would you like to include restricted eating?
              </p>
              <YesNo
                value={s.ifYes}
                onChange={(v) => {
                  set({ ifYes: v });
                  setTimeout(next, 50);
                }}
              />
            </StepCard>
          )}

          {step === "if_window" && (() => {
            const TIERS: { id: IFWindow; tier: "green" | "yellow" | "orange" | "red"; headline: string; meals: string; note: string }[] = [
              { id: "12:12", tier: "green",  headline: "12:12 — gentle start",  meals: "3 meals",                                                        note: "Recommended starting point. Easy to sustain — body learns the rhythm." },
              { id: "14:10", tier: "green",  headline: "14:10 — beginner",      meals: "3 meals",                                                        note: "Recommended. Move here once 12:12 feels easy for a week." },
              { id: "16:8",  tier: "yellow", headline: "16:8 — intermediate",   meals: "3 meals",                                                        note: "Step up gradually. Stay 2–3 weeks before going further." },
              { id: "18:6",  tier: "orange", headline: "18:6 — advanced",       meals: "2 meals (or 2 + a snack)",                                       note: "Only after a few weeks of 16:8. Watch energy & sleep." },
              { id: "20:4",  tier: "orange", headline: "20:4",                  meals: "2 meals — e.g. breakfast & lunch, or brunch & early dinner",     note: "Move here once 18:6 feels comfortable. A 4–5 hr gap between the two meals also works — no need to be rigid about a 4-hour window." },
              { id: "OMAD" as IFWindow, tier: "red", headline: "OMAD — one meal a day", meals: "1 large meal",                                            note: "Doctor go-ahead first. Regular OMAD only if one heavy meal can meet your full nutrition needs — otherwise try it 1–2 days a week and use 16/18 the rest of the days." },
            ];
            const TIER_STYLES: Record<string, { bg: string; ring: string; chip: string; chipLabel: string }> = {
              green:  { bg: "bg-emerald-50 dark:bg-emerald-950/30", ring: "ring-emerald-400",  chip: "bg-emerald-500 text-white",  chipLabel: "Recommended" },
              yellow: { bg: "bg-amber-50 dark:bg-amber-950/30",     ring: "ring-amber-400",    chip: "bg-amber-500 text-white",    chipLabel: "Step up gradually" },
              orange: { bg: "bg-orange-50 dark:bg-orange-950/30",   ring: "ring-orange-400",   chip: "bg-orange-500 text-white",   chipLabel: "Advanced" },
              red:    { bg: "bg-rose-50 dark:bg-rose-950/30",       ring: "ring-rose-400",     chip: "bg-rose-600 text-white",     chipLabel: "Doctor go-ahead" },
            };
            return (
              <StepCard
                title="Pick your fasting window — gradually"
                subtitle="Start gentle. We recommend 12 or 14 hrs with 3 meals before moving to 16/18."
              >
                <div className="space-y-2">
                  {TIERS.map((t) => {
                    const st = TIER_STYLES[t.tier];
                    const active = s.ifWindow === t.id;
                    return (
                      <button
                        key={t.id}
                        onClick={() => {
                          set({ ifWindow: t.id });
                          setTimeout(next, 80);
                        }}
                        className={`flex w-full items-start gap-3 rounded-2xl ${st.bg} p-3 text-left ring-1 ${
                          active ? `${st.ring} ring-2` : "ring-border/60"
                        }`}
                      >
                        <div className="flex h-12 w-14 shrink-0 items-center justify-center rounded-xl bg-primary text-primary-foreground font-display text-sm font-bold">
                          {t.id}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex flex-wrap items-center gap-1.5">
                            <span className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${st.chip}`}>{st.chipLabel}</span>
                            <span className="text-[11px] font-semibold text-foreground">{t.meals}</span>
                          </div>
                          <p className="mt-1 text-[12.5px] font-semibold text-foreground">{t.headline}</p>
                          <p className="text-[11px] text-muted-foreground">{t.note}</p>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </StepCard>
            );
          })()}

          {step === "if_meals" && (() => {
            const eatHrs = s.ifWindow ? (s.ifWindow === "OMAD" ? 1 : Number(s.ifWindow.split(":")[1])) : 8;
            const opts = s.ifWindow === "OMAD" ? [1] : (eatHrs >= 6 ? [2, 3] : [2]);
            return (
              <StepCard
                title="Your meals in the eating window"
                subtitle="Ayurveda recommends 2–3 meals a day — both are healthy."
              >
                <InfoCard>
                  <Benefit text="Eat your heaviest meal between 12–2 pm when agni (digestive fire) peaks." />
                  <Benefit text="Keep ~4 hrs between meals so digestion resets fully." />
                  <Benefit text="Finish your last meal 2–3 hrs before sleep — supports detox & deep sleep." />
                  <Benefit text="Warm, cooked, freshly prepared food is preferred over cold/leftover meals." />
                  <Benefit text={`Both 2 and 3 meals work well in your ${s.ifWindow ?? ""} window — pick what fits your hunger.`} />
                </InfoCard>
                <div className="mt-3">
                  <Choice
                    options={opts.map((n) => ({ value: String(n), label: n === 1 ? "1 large meal (OMAD)" : `${n} meals` }))}
                    value={s.ifMeals ? String(s.ifMeals) : undefined}
                    onChange={(v) => {
                      set({ ifMeals: Number(v), ifMealCombo: undefined });
                      setTimeout(next, 50);
                    }}
                  />
                </div>
                {s.ifMeals && s.ifWindow && s.ifWindow !== "OMAD" && (
                  <MealTimes
                    window={s.ifWindow}
                    meals={s.ifMeals}
                    normalTimes={[...(s.dietMealTimes ?? []), ...(s.dietSnackTimes ?? []).slice(0, s.dietSnackCount ?? 0)]}
                  />
                )}
              </StepCard>
            );
          })()}

          {step === "if_meal_combo" && (() => {
            const eatHrs = s.ifWindow ? Number(s.ifWindow.split(":")[1]) : 8;
            const meals = s.ifMeals ?? 2;
            const combos: MealSlot[][] =
              meals === 2
                ? eatHrs <= 5
                  ? [["Brunch", "Dinner"], ["Lunch", "Dinner"]]
                  : [["Breakfast", "Dinner"], ["Lunch", "Dinner"], ["Brunch", "Dinner"]]
                : [["Breakfast", "Lunch", "Dinner"], ["Brunch", "Snack", "Dinner"]];
            const key = (c: MealSlot[]) => c.join(" + ");
            const active = s.ifMealCombo ? key(s.ifMealCombo) : undefined;
            return (
              <StepCard
                title="Pick your meal combination"
                subtitle={`For ${meals} meal${meals > 1 ? "s" : ""} in a ${s.ifWindow ?? ""} window.`}
              >
                <Choice
                  options={combos.map((c) => ({ value: key(c), label: key(c) }))}
                  value={active}
                  onChange={(v) => {
                    const combo = combos.find((c) => key(c) === v);
                    if (combo) set({ ifMealCombo: combo });
                    setTimeout(next, 50);
                  }}
                />
              </StepCard>
            );
          })()}

          {step === "if_cycles_note" && (
            <StepCard
              title="Your body follows cycles"
              subtitle="Stick with IF for a stretch — then switch back."
            >
              <InfoCard>
                <Benefit text="Hormones (insulin, ghrelin, cortisol) adapt over 2–4 weeks of consistent IF." />
                <Benefit text="Constant flipping between IF and regular eating confuses the rhythm." />
                <Benefit text="Do IF for a few days/weeks straight, then return to regular eating for a phase." />
                <Benefit text="Listen to your body — energy, sleep & digestion are your signals." />
              </InfoCard>
              <PrimaryBtn onClick={next}>Got it</PrimaryBtn>
            </StepCard>
          )}




          {step === "if_tips" && (
            <StepCard
              title="Best IF practices to avoid feeling hungry"
              subtitle="Follow these and the first week becomes easy."
            >
              <InfoCard>
                {IF_TIPS.map((t) => (
                  <Benefit key={t} text={t} />
                ))}
              </InfoCard>
              <PrimaryBtn onClick={next}>Got it, continue</PrimaryBtn>
            </StepCard>
          )}


          {step === "plan_result" && (
            <PlanResultStep s={s} dosha={profile.dosha as Dosha | undefined} onSave={save} set={set} />
          )}


          {step === "fasting" && (
            <StepCard
              title="Add weekly fasting?"
              subtitle="Beyond IF — full or partial fasts on some days each week."
            >
              <YesNo
                value={s.fastingYes}
                onChange={(v) => {
                  set({ fastingYes: v });
                  if (!v) setTimeout(next, 50);
                }}
              />
              {s.fastingYes && (
                <>
                  <p className="mt-4 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                    Kind of fast
                  </p>
                  <Choice
                    options={FASTS.map((f) => ({ value: f, label: f }))}
                    value={s.fastingKind}
                    onChange={(v) => set({ fastingKind: v })}
                  />
                  <input
                    value={s.fastingEat ?? ""}
                    onChange={(e) => set({ fastingEat: e.target.value })}
                    placeholder="What do you usually eat on fast days?"
                    className="mt-3 w-full rounded-2xl bg-card px-4 py-3 text-sm ring-1 ring-border focus:outline-none focus:ring-2 focus:ring-primary/40"
                  />
                  <PrimaryBtn disabled={!s.fastingKind} onClick={next}>
                    Continue
                  </PrimaryBtn>
                </>
              )}
            </StepCard>
          )}

          {step === "detox" && (
            <StepCard
              title="Add a seasonal detox?"
              subtitle={
                s.goal === "disease"
                  ? "We recommend detox to support your condition."
                  : "Gentle Ayurvedic cleanse to reset digestion."
              }
            >
              <InfoCard>
                <Benefit text="Resets digestive fire (agni)" />
                <Benefit text="Clears ama (toxins) from tissues" />
                <Benefit text="Improves skin, sleep & mood" />
              </InfoCard>
              <YesNo
                value={s.detoxYes}
                onChange={(v) => {
                  set({ detoxYes: v });
                  if (!v) setTimeout(next, 50);
                }}
              />
              {s.detoxYes && (
                <>
                  <p className="mt-4 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                    Kind of detox
                  </p>
                  <Choice
                    options={DETOX_KINDS.map((k) => ({ value: k, label: k }))}
                    value={s.detoxKind}
                    onChange={(v) => set({ detoxKind: v })}
                  />
                  <p className="mt-4 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                    Duration
                  </p>
                  <Choice
                    options={[3, 5, 7].map((n) => ({ value: String(n), label: `${n} days` }))}
                    value={s.detoxDays ? String(s.detoxDays) : undefined}
                    onChange={(v) => set({ detoxDays: Number(v) as 3 | 5 | 7 })}
                  />
                  <PrimaryBtn disabled={!s.detoxKind || !s.detoxDays} onClick={next}>
                    Continue
                  </PrimaryBtn>
                </>
              )}
            </StepCard>
          )}

          {step === "weight" && (
            <StepCard
              title={
                s.goal === "weight"
                  ? "Your weight target"
                  : "Would you like to lose or gain weight too?"
              }
              subtitle=""
            >
              {s.goal !== "weight" && (
                <YesNo
                  value={s.weightYes}
                  onChange={(v) => {
                    set({ weightYes: v });
                    if (!v) setTimeout(next, 50);
                  }}
                />
              )}
              {(s.goal === "weight" || s.weightYes) && (
                <>
                  <div className="mt-4 grid grid-cols-2 gap-2">
                    {(["loss", "gain"] as const).map((d) => (
                      <button
                        key={d}
                        onClick={() => set({ weightDirection: d })}
                        className={`rounded-2xl px-4 py-3 text-sm font-semibold ring-1 ${
                          s.weightDirection === d
                            ? "bg-primary text-primary-foreground ring-primary"
                            : "bg-card text-foreground ring-border"
                        }`}
                      >
                        {d === "loss" ? "Lose weight" : "Gain weight"}
                      </button>
                    ))}
                  </div>
                  <label className="mt-4 block text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                    Target weight (kg)
                  </label>
                  <input
                    type="number"
                    value={s.targetWeight ?? ""}
                    onChange={(e) => set({ targetWeight: Number(e.target.value) || undefined })}
                    placeholder="e.g. 65"
                    className="mt-2 w-full rounded-2xl bg-card px-4 py-3 text-sm ring-1 ring-border focus:outline-none focus:ring-2 focus:ring-primary/40"
                  />
                  <div className="mt-4">
                    <div className="flex items-center justify-between">
                      <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                        Pace
                      </label>
                      <span className="text-sm font-semibold text-primary">
                        {(s.paceKg ?? 0.5).toFixed(1)} kg / week
                      </span>
                    </div>
                    <input
                      type="range"
                      min={0.1}
                      max={1.0}
                      step={0.1}
                      value={s.paceKg ?? 0.5}
                      onChange={(e) => set({ paceKg: Number(e.target.value) })}
                      className="mt-2 w-full accent-[hsl(var(--primary))]"
                    />
                    <div className="mt-1 flex justify-between text-[10px] text-muted-foreground">
                      <span>Easy 0.1</span>
                      <span>Moderate 0.5</span>
                      <span>Fast 1.0</span>
                    </div>
                  </div>
                  <PrimaryBtn
                    disabled={!s.weightDirection || !s.targetWeight}
                    onClick={next}
                  >
                    Continue
                  </PrimaryBtn>
                </>
              )}
            </StepCard>
          )}

          {step === "yoga" && (
            <StepCard
              title="Add yoga to your plan?"
              subtitle={
                s.goal === "disease"
                  ? "We recommend yoga to support your condition's improvement."
                  : "Yoga adds calorie burn and improves flexibility, sleep and stress."
              }
            >
              <YesNo
                value={s.yogaYes}
                onChange={(v) => {
                  set({ yogaYes: v });
                  if (!v) setTimeout(next, 50);
                }}
              />
              {s.yogaYes && (
                <>
                  <label className="mt-4 block text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                    Minutes per day
                  </label>
                  <Choice
                    options={[15, 30, 45, 60].map((n) => ({
                      value: String(n),
                      label: `${n} min`,
                    }))}
                    value={s.yogaTime ? String(s.yogaTime) : undefined}
                    onChange={(v) => set({ yogaTime: Number(v) })}
                  />
                  <input
                    value={s.arthroIssues ?? ""}
                    onChange={(e) => set({ arthroIssues: e.target.value })}
                    placeholder="Any joint / arthritis issues? (we'll avoid those poses)"
                    className="mt-3 w-full rounded-2xl bg-card px-4 py-3 text-sm ring-1 ring-border focus:outline-none focus:ring-2 focus:ring-primary/40"
                  />
                  <PrimaryBtn disabled={!s.yogaTime} onClick={next}>
                    Continue
                  </PrimaryBtn>
                </>
              )}
            </StepCard>
          )}

          {step === "calories" && <CaloriesStep s={s} onNext={next} />}

          {step === "done" && <DoneStep s={s} onSave={save} />}
        </main>
      </div>
    </div>
  );
}

// ---------------- Sub-components ----------------

function StepCard({
  title,
  subtitle,
  children,
}: {
  title: string;
  subtitle?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="rounded-3xl bg-card/80 p-5 shadow-[var(--shadow-soft)] ring-1 ring-border/60 backdrop-blur-sm">
      <h2 className="font-display text-xl font-semibold text-foreground">{title}</h2>
      {subtitle && <p className="mt-1 text-sm text-muted-foreground">{subtitle}</p>}
      <div className="mt-4">{children}</div>
    </div>
  );
}

function Choice({
  options,
  value,
  onChange,
}: {
  options: { value: string; label: string; icon?: typeof Sparkles }[];
  value?: string;
  onChange: (v: string) => void;
}) {
  return (
    <div className="grid gap-2">
      {options.map((o) => {
        const active = value === o.value;
        const Icon = o.icon;
        return (
          <button
            key={o.value}
            onClick={() => onChange(o.value)}
            className={`flex items-center gap-3 rounded-2xl px-4 py-3 text-left text-sm font-medium ring-1 transition-colors ${
              active
                ? "bg-primary text-primary-foreground ring-primary"
                : "bg-card text-foreground ring-border hover:ring-primary/40"
            }`}
          >
            {Icon && <Icon size={18} />}
            <span className="flex-1">{o.label}</span>
            {active && <Check size={16} />}
          </button>
        );
      })}
    </div>
  );
}

function MultiChoice({
  options,
  values,
  onToggle,
}: {
  options: string[];
  values: string[];
  onToggle: (v: string) => void;
}) {
  return (
    <div className="flex flex-wrap gap-2">
      {options.map((o) => {
        const on = values.includes(o);
        return (
          <button
            key={o}
            onClick={() => onToggle(o)}
            className={`rounded-full px-3 py-1.5 text-[12px] font-semibold ring-1 ${
              on
                ? "bg-primary text-primary-foreground ring-primary"
                : "bg-card text-foreground ring-border"
            }`}
          >
            {o}
          </button>
        );
      })}
    </div>
  );
}

function YesNo({ value, onChange }: { value?: boolean; onChange: (v: boolean) => void }) {
  return (
    <div className="mt-2 grid grid-cols-2 gap-2">
      {[
        { v: true, label: "Yes" },
        { v: false, label: "No" },
      ].map((o) => (
        <button
          key={String(o.v)}
          onClick={() => onChange(o.v)}
          className={`rounded-2xl px-4 py-3 text-sm font-semibold ring-1 ${
            value === o.v
              ? "bg-primary text-primary-foreground ring-primary"
              : "bg-card text-foreground ring-border"
          }`}
        >
          {o.label}
        </button>
      ))}
    </div>
  );
}

function PrimaryBtn({
  onClick,
  disabled,
  children,
}: {
  onClick: () => void;
  disabled?: boolean;
  children: React.ReactNode;
}) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className="mt-5 flex w-full items-center justify-center gap-1.5 rounded-2xl bg-primary px-4 py-3 text-sm font-semibold text-primary-foreground disabled:opacity-50"
    >
      {children} <ChevronRight size={16} />
    </button>
  );
}

function InfoCard({ children }: { children: React.ReactNode }) {
  return (
    <div className="rounded-2xl bg-accent/40 p-4 ring-1 ring-border/60">
      <ul className="grid gap-1.5">{children}</ul>
    </div>
  );
}

function Benefit({ text }: { text: string }) {
  return (
    <li className="flex items-start gap-2 text-[13px] text-foreground/85">
      <Check size={14} className="mt-0.5 text-primary" /> {text}
    </li>
  );
}

function MealTimes({
  window,
  meals,
  normalTimes = [],
}: {
  window: IFWindow;
  meals: number;
  normalTimes?: string[];
}) {
  const fast = Number(window.split(":")[0]);
  const eat = Number(window.split(":")[1]);

  function fmt(h: number) {
    const hr = Math.floor(h);
    const min = Math.round((h - hr) * 60);
    return `${String(hr).padStart(2, "0")}:${String(min).padStart(2, "0")}`;
  }
  function toHr(t: string) {
    const [h, m] = t.split(":").map(Number);
    return h + (m || 0) / 60;
  }

  // Anchor the eating window to the user's last normal meal (cap 20:00)
  const lastNormal =
    normalTimes.length > 0
      ? Math.min(20, Math.max(...normalTimes.map(toHr)))
      : 19;
  const endHour = Math.min(20, lastNormal);
  const startHour = Math.max(6, endHour - eat);

  const initial = useMemo(() => {
    const inWin = normalTimes
      .map(toHr)
      .filter((h) => h >= startHour && h <= endHour)
      .sort((a, b) => a - b);
    if (inWin.length >= meals) {
      // take meals closest to evenly spaced anchors but prefer user's times
      return inWin.slice(-meals).map(fmt);
    }
    const gap = meals > 1 ? (endHour - startHour) / (meals - 1) : 0;
    return Array.from({ length: meals }, (_, i) => fmt(startHour + i * gap));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [window, meals, normalTimes.join(",")]);

  const [times, setTimes] = useState<string[]>(initial);
  // resync when inputs change
  useEffect(() => setTimes(initial), [initial]);

  return (
    <div className="mt-4 space-y-3">
      {normalTimes.length > 0 && (
        <div className="rounded-2xl bg-card p-3 ring-1 ring-border/60">
          <p className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
            Your normal-day meal times
          </p>
          <div className="mt-1 flex flex-wrap gap-1.5">
            {normalTimes.map((t, i) => (
              <span
                key={i}
                className="rounded-full bg-accent/50 px-2 py-0.5 text-[11px] font-semibold text-foreground ring-1 ring-border"
              >
                {t}
              </span>
            ))}
          </div>
          <p className="mt-2 text-[10px] text-muted-foreground">
            We've kept your IF meal times close to these where possible.
          </p>
        </div>
      )}
      <div className="rounded-2xl bg-accent/40 p-3 ring-1 ring-border/60">
        <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
          Suggested IF meal times (edit if you like)
        </p>
        <div className="mt-2 grid grid-cols-2 gap-2">
          {times.map((t, i) => (
            <label key={i} className="flex items-center gap-2 rounded-xl bg-card px-3 py-2 ring-1 ring-border">
              <Hourglass size={14} className="text-primary" />
              <span className="text-[11px] text-muted-foreground">Meal {i + 1}</span>
              <input
                type="time"
                value={t}
                onChange={(e) => {
                  const arr = [...times];
                  arr[i] = e.target.value;
                  setTimes(arr);
                }}
                className="flex-1 bg-transparent text-sm font-semibold text-foreground focus:outline-none"
              />
            </label>
          ))}
        </div>
        <p className="mt-2 text-[10px] text-muted-foreground">
          Window {window} · eat {fmt(startHour)}–{fmt(endHour)} · {meals} meal{meals > 1 ? "s" : ""}
        </p>
      </div>
    </div>
  );
}


function CaloriesStep({ s, onNext }: { s: State; onNext: () => void }) {
  // Read BMR/TDEE from profile
  let tdee = 2000;
  try {
    const p = JSON.parse(localStorage.getItem("ayuraise.profile") ?? "{}");
    if (p.tdee) tdee = p.tdee;
  } catch {}
  const paceDeficit = Math.round(((s.paceKg ?? 0) * 7700) / 7);
  const yogaBurn = s.yogaYes ? Math.round(((s.yogaTime ?? 30) / 60) * 250) : 0;
  const direction = s.weightDirection ?? "loss";
  const target =
    direction === "loss" ? tdee - paceDeficit - yogaBurn : tdee + paceDeficit - yogaBurn;

  return (
    <StepCard
      title="Your calorie plan"
      subtitle="Based on your TDEE, pace and yoga burn — this is what you should eat."
    >
      <div className="grid gap-2 rounded-2xl bg-accent/40 p-4 ring-1 ring-border/60">
        <Row label="Daily need (TDEE)" value={`${tdee} kcal`} />
        <Row
          label={direction === "loss" ? "Pace deficit" : "Pace surplus"}
          value={`${direction === "loss" ? "−" : "+"}${paceDeficit} kcal`}
        />
        {s.yogaYes && <Row label="Yoga burn" value={`−${yogaBurn} kcal`} />}
        <div className="my-1 h-px bg-border" />
        <Row label="Target intake" value={`${target} kcal / day`} bold />
      </div>
      <p className="mt-3 text-xs text-muted-foreground">
        We'll build your diet plan using your prakriti
        {s.ifYes ? `, your ${s.ifWindow} eating window` : ""}
        {s.detoxYes ? `, and a ${s.detoxDays}-day ${s.detoxKind} detox` : ""}.
      </p>
      <PrimaryBtn onClick={onNext}>Build my diet plan</PrimaryBtn>
    </StepCard>
  );
}

function Row({ label, value, bold }: { label: string; value: string; bold?: boolean }) {
  return (
    <div className="flex items-center justify-between text-sm">
      <span className={bold ? "font-semibold text-foreground" : "text-muted-foreground"}>
        {label}
      </span>
      <span className={bold ? "font-display text-base font-semibold text-primary" : "text-foreground"}>
        {value}
      </span>
    </div>
  );
}

function DoneStep({ s, onSave }: { s: State; onSave: () => void }) {
  const pillars = [
    { on: s.goal === "disease", label: "Disease focus", icon: Stethoscope },
    { on: s.goal === "weight" || s.weightYes, label: "Weight target", icon: Scale },
    { on: s.ifYes, label: `IF ${s.ifWindow ?? ""}`, icon: Hourglass },
    { on: s.fastingYes, label: "Weekly fasting", icon: Hourglass },
    { on: s.detoxYes, label: `Detox ${s.detoxDays ?? ""}d`, icon: Sparkles },
    { on: s.yogaYes, label: `Yoga ${s.yogaTime ?? ""}m`, icon: Flower2 },
    { on: true, label: "Ayurvedic diet", icon: Salad },
  ].filter((x) => x.on);

  return (
    <StepCard title="Your plan is ready" subtitle="Save it to your dashboard.">
      <div className="grid grid-cols-2 gap-2">
        {pillars.map((p) => (
          <div
            key={p.label}
            className="flex items-center gap-2 rounded-2xl bg-card px-3 py-2.5 ring-1 ring-border"
          >
            <p.icon size={16} className="text-primary" />
            <span className="text-[12px] font-semibold text-foreground">{p.label}</span>
          </div>
        ))}
      </div>

      {s.goal === "diet" && (
        <p className="mt-4 text-[11px] text-muted-foreground">
          You can delete old diet plans anytime from your dashboard — or keep them for reference.
        </p>
      )}


      <button
        onClick={onSave}
        className="mt-5 flex w-full items-center justify-center gap-2 rounded-2xl px-4 py-3 text-sm font-semibold text-primary-foreground"
        style={{ background: "var(--gradient-leaf)" }}
      >
        <Check size={16} /> Save to dashboard
      </button>
    </StepCard>
  );
}

function DietMealsStep({
  s,
  set,
  onNext,
}: {
  s: State;
  set: (patch: Partial<State>) => void;
  onNext: () => void;
}) {
  const { dosha, tdee } = loadProfile();
  const rec = prakritiMealDefaults(dosha);
  const count = s.dietMealsCount ?? rec.count;
  const times = s.dietMealTimes ?? rec.times.slice(0, count);
  const snackCount = s.dietSnackCount ?? 0;
  const snackTimes = (s.dietSnackTimes ?? ["11:00", "16:30"]).slice(0, Math.max(snackCount, 2));

  const inWindow = (t: string) => {
    const [h, m] = t.split(":").map(Number);
    const v = h + (m || 0) / 60;
    return v >= 9 && v <= 20;
  };
  const allOk =
    times.length === count &&
    times.every(inWindow) &&
    snackTimes.slice(0, snackCount).every(inWindow);

  const OPTIONS: Array<{ id: string; count: number; snackCount: number; label: string }> = [
    { id: "2", count: 2, snackCount: 0, label: "2 meals" },
    { id: "3", count: 3, snackCount: 0, label: "3 meals" },
    { id: "3s1", count: 3, snackCount: 1, label: "3 + 1 snack" },
    { id: "3s2", count: 3, snackCount: 2, label: "3 + 2 snacks" },
  ];
  const activeId = snackCount > 0 ? `3s${snackCount}` : String(count);


  return (
    <StepCard
      title="Your meals as per Ayurveda"
      subtitle={`Based on your prakriti${dosha ? ` (${dosha})` : ""} & sun cycle.`}
    >
      <div className="rounded-2xl bg-accent/40 p-3 ring-1 ring-border/60">
        <p className="text-[12px] text-foreground/85">
          Ayurveda recommends <b>2–3 meals</b> a day, eaten between <b>9 am and 7 pm</b>
          (latest by 8 pm) so agni (digestive fire) can do its work.
        </p>
        <p className="mt-2 text-[11px] text-muted-foreground">{rec.note}</p>
        {tdee && (
          <p className="mt-1 text-[11px] text-muted-foreground">
            Your daily calorie target (from onboarding): <b>{tdee} kcal</b>.
          </p>
        )}
      </div>

      <p className="mt-4 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
        Number of meals
      </p>
      <div className="mt-2 grid grid-cols-2 gap-2">
        {OPTIONS.map((o) => (
          <button
            key={o.id}
            onClick={() =>
              set({
                dietMealsCount: o.count,
                dietMealTimes: rec.times.slice(0, o.count),
                dietSnackCount: o.snackCount,
                dietSnackTimes: o.snackCount > 0 ? snackTimes.slice(0, 2) : undefined,
              })
            }
            className={`rounded-2xl px-3 py-3 text-sm font-semibold ring-1 ${
              activeId === o.id
                ? "bg-primary text-primary-foreground ring-primary"
                : "bg-card text-foreground ring-border"
            }`}
          >
            {o.label}
          </button>
        ))}
      </div>

      <p className="mt-4 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
        Meal times (between 9:00 and 20:00)
      </p>
      <div className="mt-2 grid grid-cols-2 gap-2">
        {Array.from({ length: count }).map((_, i) => (
          <label
            key={i}
            className="flex items-center gap-2 rounded-xl bg-card px-3 py-2 ring-1 ring-border"
          >
            <span className="text-[11px] text-muted-foreground">Meal {i + 1}</span>
            <input
              type="time"
              min="09:00"
              max="20:00"
              value={times[i] ?? ""}
              onChange={(e) => {
                const arr = [...times];
                arr[i] = e.target.value;
                set({ dietMealTimes: arr });
              }}
              className="flex-1 bg-transparent text-sm font-semibold text-foreground focus:outline-none"
            />
          </label>
        ))}
      </div>

      {snackCount > 0 && (
        <>
          <p className="mt-4 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
            Snack times
          </p>
          <div className="mt-2 grid grid-cols-2 gap-2">
            {Array.from({ length: snackCount }).map((_, i) => (
              <label
                key={i}
                className="flex items-center gap-2 rounded-xl bg-card px-3 py-2 ring-1 ring-border"
              >
                <span className="text-[11px] text-muted-foreground">Snack {i + 1}</span>
                <input
                  type="time"
                  min="09:00"
                  max="20:00"
                  value={snackTimes[i] ?? ""}
                  onChange={(e) => {
                    const arr = [...snackTimes];
                    arr[i] = e.target.value;
                    set({ dietSnackTimes: arr });
                  }}
                  className="flex-1 bg-transparent text-sm font-semibold text-foreground focus:outline-none"
                />
              </label>
            ))}
          </div>
        </>
      )}

      {!allOk && (
        <p className="mt-2 text-[11px] text-rose-600">
          Please keep all times between 09:00 and 20:00.
        </p>
      )}

      <PrimaryBtn disabled={!allOk} onClick={onNext}>
        Looks good, continue
      </PrimaryBtn>
    </StepCard>

  );
}

// ---------------- Diet helpers ----------------

type FoodGroups = {
  grains: string[];
  legumes: string[];
  vegetables: string[];
  fruits: string[];
  dairy: string[];
  nutsSeeds: string[];
  spicesHerbs: string[];
  oils: string[];
  sweeteners: string[];
  beverages: string[];
};

const EAT_BY_DOSHA: Record<Dosha, FoodGroups> = {
  vata: {
    grains: ["Basmati rice", "Brown rice", "Wheat", "Oats (cooked)", "Quinoa", "Amaranth"],
    legumes: ["Moong dal (yellow)", "Whole mung", "Urad dal", "Toor dal (small amounts)", "Soaked & sprouted lentils"],
    vegetables: ["Cooked carrots", "Beetroot", "Sweet potato", "Pumpkin", "Bottle gourd", "Zucchini", "Okra", "Spinach (cooked)", "Asparagus", "Green beans"],
    fruits: ["Banana (ripe)", "Mango (ripe)", "Avocado", "Papaya", "Sweet apple (cooked)", "Pear (cooked)", "Soaked raisins", "Soaked dates", "Figs", "Berries"],
    dairy: ["Warm whole milk", "Ghee", "Fresh paneer", "Buttermilk (with cumin)", "Lassi (sweet)"],
    nutsSeeds: ["Soaked almonds", "Walnuts", "Cashews", "Pistachios", "Sesame seeds", "Flax (ground)", "Pumpkin seeds"],
    spicesHerbs: ["Ginger", "Cumin", "Fennel", "Cardamom", "Cinnamon", "Cloves", "Ajwain", "Hing (asafoetida)", "Turmeric", "Black pepper", "Tulsi", "Ashwagandha"],
    oils: ["Sesame oil", "Ghee", "Olive oil", "Mustard oil (small)"],
    sweeteners: ["Jaggery", "Raw honey (not heated)", "Date syrup", "Maple syrup"],
    beverages: ["Warm water", "CCF tea (cumin-coriander-fennel)", "Ginger tea", "Tulsi tea", "Warm spiced milk", "Almond milk"],
  },
  pitta: {
    grains: ["Basmati rice", "Wheat", "Barley", "Oats", "Quinoa"],
    legumes: ["Moong dal (yellow)", "Whole mung", "Chickpeas", "Kidney beans (in moderation)", "Tofu"],
    vegetables: ["Bottle gourd", "Ridge gourd", "Ash gourd", "Cucumber", "Zucchini", "Broccoli", "Cauliflower", "Cabbage", "Asparagus", "Coriander leaves", "Celery", "Sweet potato", "Leafy greens (mild)"],
    fruits: ["Sweet apple", "Pear", "Sweet grapes", "Pomegranate", "Coconut", "Sweet melons", "Sweet mango", "Plums (sweet)", "Soaked dates", "Soaked raisins"],
    dairy: ["Cool milk", "Ghee", "Fresh paneer", "Sweet lassi", "Coconut milk"],
    nutsSeeds: ["Soaked almonds (peeled)", "Sunflower seeds", "Pumpkin seeds", "Coconut", "Flax (ground)"],
    spicesHerbs: ["Coriander", "Fennel", "Cardamom", "Mint", "Turmeric", "Saffron", "Curry leaves", "Rose petals", "Aloe vera", "Amla", "Brahmi", "Shatavari"],
    oils: ["Ghee", "Coconut oil", "Sunflower oil", "Olive oil"],
    sweeteners: ["Maple syrup", "Jaggery (small)", "Rock sugar (mishri)", "Raw honey (sparingly)"],
    beverages: ["Cool (not iced) water", "Coconut water", "Aloe juice", "Rose milk", "Fennel tea", "Mint tea", "Coriander water", "Amla juice"],
  },
  kapha: {
    grains: ["Millet (ragi/bajra/jowar)", "Barley", "Buckwheat", "Quinoa", "Corn", "Brown rice (small amounts)"],
    legumes: ["Moong dal", "Toor dal", "Masoor dal", "Chickpeas", "Black beans", "Sprouted lentils"],
    vegetables: ["Leafy greens (kale, spinach, methi)", "Cabbage", "Cauliflower", "Broccoli", "Sprouts", "Bitter gourd", "Bell peppers", "Asparagus", "Carrots", "Beetroot", "Radish", "Garlic", "Onion (cooked)"],
    fruits: ["Apples", "Pears", "Pomegranate", "Berries", "Cranberries", "Stewed prunes", "Dried figs (small)"],
    dairy: ["Buttermilk (spiced)", "Small ghee", "Goat milk (warm)", "Low-fat paneer (rare)"],
    nutsSeeds: ["Pumpkin seeds", "Sunflower seeds", "Flax seeds", "Chia seeds (small)"],
    spicesHerbs: ["Ginger (fresh & dry)", "Black pepper", "Long pepper", "Cinnamon", "Cloves", "Cardamom", "Turmeric", "Cumin", "Mustard seeds", "Fenugreek", "Tulsi", "Trikatu", "Triphala", "Guggulu"],
    oils: ["Mustard oil", "Sesame oil (small)", "Sunflower oil", "Corn oil"],
    sweeteners: ["Raw honey (1 tsp, never heated)"],
    beverages: ["Warm water with lemon & honey", "Ginger tea", "Tulsi tea", "Cinnamon tea", "Trikatu tea", "Spiced buttermilk"],
  },
};

const AVOID_BY_DOSHA: Record<Dosha, string[]> = {
  vata: ["Raw salads", "Cold/iced drinks", "Carbonated drinks", "Dry crackers, popcorn, chips", "Frozen foods", "Excess raw veggies", "Excess beans", "Caffeine (excess)", "Refined sugar", "Leftovers"],
  pitta: ["Chillies & hot peppers", "Deep-fried foods", "Sour fermented foods (vinegar, pickles)", "Tomatoes (excess)", "Garlic & onion (raw)", "Red meat", "Alcohol", "Coffee on empty stomach", "Aged cheese", "Citrus (sour)"],
  kapha: ["Cheese & heavy dairy", "Cream & butter (excess)", "Fried snacks", "Iced drinks", "Bananas", "Excess wheat & white rice", "Sugar & sweets", "Cold yogurt", "Nuts (heavy)", "Late heavy meals", "Daytime sleeping"],
};

function foodsFor(dosha: Dosha | undefined): FoodGroups {
  return EAT_BY_DOSHA[dosha ?? "pitta"];
}
function avoidFor(dosha: Dosha | undefined): string[] {
  return AVOID_BY_DOSHA[dosha ?? "pitta"];
}

const FOOD_GROUP_LABELS: Array<{ key: keyof FoodGroups; label: string }> = [
  { key: "grains", label: "Grains" },
  { key: "legumes", label: "Legumes & pulses" },
  { key: "vegetables", label: "Vegetables" },
  { key: "fruits", label: "Fruits" },
  { key: "dairy", label: "Dairy" },
  { key: "nutsSeeds", label: "Nuts & seeds" },
  { key: "spicesHerbs", label: "Spices & herbs" },
  { key: "oils", label: "Oils & fats" },
  { key: "sweeteners", label: "Sweeteners" },
  { key: "beverages", label: "Beverages" },
];

function DietFoodsResult({ dosha }: { dosha: Dosha | undefined }) {
  const ritu = currentRitu();
  const f = foodsFor(dosha);
  const avoid = avoidFor(dosha);
  return (
    <StepCard
      title={`Foods for you ${dosha ? `(${dosha})` : ""}`}
      subtitle={`Season: ${ritu}. ${RITU_NOTE[ritu]}`}
    >
      <div className="grid gap-3">
        <div className="rounded-2xl bg-emerald-500/10 p-3 ring-1 ring-emerald-500/20">
          <p className="text-[11px] font-semibold uppercase tracking-wider text-emerald-700 dark:text-emerald-400">
            Favor
          </p>
          <div className="mt-2 grid gap-2">
            {FOOD_GROUP_LABELS.map((g) => (
              <div key={g.key}>
                <p className="text-[11px] font-semibold text-foreground/80">{g.label}</p>
                <p className="text-[12px] text-foreground/85">{f[g.key].join(", ")}</p>
              </div>
            ))}
          </div>
        </div>
        <div className="rounded-2xl bg-rose-500/10 p-3 ring-1 ring-rose-500/20">
          <p className="text-[11px] font-semibold uppercase tracking-wider text-rose-700 dark:text-rose-400">
            Avoid
          </p>
          <p className="mt-1.5 text-[13px] text-foreground/85">{avoid.join(", ")}</p>
        </div>
      </div>
    </StepCard>
  );
}

function FoodList({ title, items }: { title: string; items: string[] }) {
  return (
    <div className="rounded-2xl bg-accent/40 p-3 ring-1 ring-border/60">
      <p className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
        {title}
      </p>
      <ul className="mt-1.5 grid gap-1">
        {items.map((t) => (
          <li key={t} className="flex items-start gap-1.5 text-[13px] text-foreground/90">
            <Check size={13} className="mt-0.5 shrink-0 text-primary" /> {t}
          </li>
        ))}
      </ul>
    </div>
  );
}

// ---------------- Weekly plan builder ----------------

interface DayMeal { slot: string; time: string; items: string[] }
interface WeeklyDay { day: string; isIF: boolean; window?: string; meals: DayMeal[] }
interface WeeklyPlan { dosha?: Dosha; ritu: Ritu; days: WeeklyDay[]; createdAt?: number }

function ifMealTimesFor(window: string, slots: string[]): string[] {
  const eat = Number(window.split(":")[1]);
  const endHour = 20;
  const startHour = Math.max(6, endHour - eat);
  const n = slots.length;
  if (n <= 1) return [`${String(endHour).padStart(2, "0")}:00`];
  const gap = (endHour - startHour) / (n - 1);
  return slots.map((_, i) => {
    const h = startHour + i * gap;
    const hr = Math.floor(h);
    const min = Math.round((h - hr) * 60);
    return `${String(hr).padStart(2, "0")}:${String(min).padStart(2, "0")}`;
  });
}

function itemsForSlot(slot: string, dosha?: Dosha): string[] {
  const f = foodsFor(dosha);
  const s = slot.toLowerCase();
  if (s.includes("breakfast"))
    return [`${f.grains[0]} with ${f.dairy[1] ?? f.dairy[0]}`, f.fruits[0], f.beverages[0]];
  if (s.includes("brunch"))
    return [`${f.grains[0]} + ${f.legumes[0]}`, `${f.vegetables[0]} sabzi`, f.beverages[1] ?? f.beverages[0]];
  if (s.includes("lunch"))
    return [`${f.grains[0]} + ${f.legumes[0]}`, `${f.vegetables[1] ?? f.vegetables[0]} sabzi`, `${f.dairy[3] ?? f.dairy[0]}`];
  if (s.includes("snack"))
    return [f.nutsSeeds[0], f.fruits[1] ?? f.fruits[0], f.beverages[2] ?? f.beverages[0]];
  if (s.includes("dinner"))
    return [`Light ${f.grains[0]} khichdi`, `${f.vegetables[2] ?? f.vegetables[0]} (cooked)`, f.beverages[0]];
  return [f.grains[0], f.legumes[0], f.vegetables[0]];
}

export function buildWeeklyDietPlan(s: State, dosha?: Dosha): WeeklyPlan {
  const ritu = currentRitu();
  // IF, when enabled, now applies to every day of the week
  const ifSlots = (s.ifMealCombo ?? []) as string[];
  const ifWindow = s.ifWindow;
  const ifTimes = ifWindow && ifSlots.length > 0 ? ifMealTimesFor(ifWindow, ifSlots) : [];

  // non-IF day meals
  const offCount = s.dietMealsCount ?? 3;
  const offTimes = s.dietMealTimes ?? (offCount === 2 ? ["10:30", "18:30"] : ["09:00", "13:00", "19:00"]);
  const offSnackCount = s.dietSnackCount ?? 0;
  const offSnackTimes = (s.dietSnackTimes ?? []).slice(0, offSnackCount);

  const offSlots: string[] =
    offCount === 2 ? ["Brunch", "Dinner"] : ["Breakfast", "Lunch", "Dinner"];

  const days: WeeklyDay[] = DAYS.map((d) => {
    const isIF = s.ifYes === true && ifSlots.length > 0;
    if (isIF) {
      return {
        day: d,
        isIF: true,
        window: ifWindow,
        meals: ifSlots.map((slot, i) => ({
          slot,
          time: ifTimes[i] ?? "",
          items: itemsForSlot(slot, dosha),
        })),
      };
    }
    const meals: DayMeal[] = offSlots.map((slot, i) => ({
      slot,
      time: offTimes[i] ?? "",
      items: itemsForSlot(slot, dosha),
    }));
    offSnackTimes.forEach((t, i) =>
      meals.push({ slot: `Snack ${i + 1}`, time: t, items: itemsForSlot("snack", dosha) }),
    );
    meals.sort((a, b) => a.time.localeCompare(b.time));
    return { day: d, isIF: false, meals };
  });

  return { dosha, ritu, days };
}

function PlanResultStep({
  s,
  dosha,
  onSave,
  set,
}: {
  s: State;
  dosha?: Dosha;
  onSave: () => void;
  set: (patch: Partial<State>) => void;
}) {
  const plan = useMemo(() => buildWeeklyDietPlan(s, dosha), [s, dosha]);
  const [open, setOpen] = useState<string | null>(null);
  const isForOther = s.dietFor === "other";
  const planLabel = (s.planName?.trim() || "My diet plan").slice(0, 60);

  const downloadPlan = () => {
    const lines: string[] = [];
    lines.push(planLabel);
    lines.push(`Your 7-day Ayurvedic Diet Plan`);
    lines.push(`Dosha: ${dosha ?? "—"}  ·  Season: ${plan.ritu}`);
    lines.push("");
    plan.days.forEach((d) => {
      lines.push(`=== ${d.day} ${d.isIF ? `(IF · ${d.window})` : "(Regular)"} ===`);
      d.meals.forEach((m) => {
        lines.push(`  ${m.time}  ${m.slot}`);
        m.items.forEach((it) => lines.push(`    - ${it}`));
      });
      lines.push("");
    });
    const blob = new Blob([lines.join("\n")], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${planLabel.replace(/[^a-z0-9-_ ]/gi, "").replace(/\s+/g, "-").toLowerCase() || "diet-plan"}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <StepCard
      title="Your 7-day diet plan"
      subtitle={`Tuned to ${dosha ?? "your body"} · ${plan.ritu} season. Tap a day to see the full plan.`}
    >
      <div className="grid gap-2">
        {plan.days.map((d) => {
          const isOpen = open === d.day;
          return (
            <div
              key={d.day}
              className="overflow-hidden rounded-2xl bg-card ring-1 ring-border/60"
            >
              <button
                onClick={() => setOpen(isOpen ? null : d.day)}
                className="flex w-full items-center justify-between gap-2 px-4 py-3 text-left"
              >
                <div className="flex items-center gap-2">
                  <span className="text-sm font-semibold text-foreground">{d.day}</span>
                  {d.isIF ? (
                    <span className="rounded-full bg-primary/15 px-2 py-0.5 text-[10px] font-semibold text-primary">
                      IF · {d.window}
                    </span>
                  ) : (
                    <span className="rounded-full bg-accent/60 px-2 py-0.5 text-[10px] font-semibold text-foreground/80">
                      Regular
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-[11px] text-muted-foreground">
                    {d.meals.map((m) => m.time).filter(Boolean).join(" · ")}
                  </span>
                  <ChevronDown
                    size={16}
                    className={`text-muted-foreground transition-transform ${isOpen ? "rotate-180" : ""}`}
                  />
                </div>
              </button>
              {isOpen && (
                <div className="grid gap-2 border-t border-border/60 bg-accent/20 p-3">
                  {d.meals.map((m, i) => (
                    <div key={i} className="rounded-xl bg-card p-3 ring-1 ring-border/60">
                      <div className="flex items-center justify-between">
                        <p className="text-[12px] font-semibold text-foreground">{m.slot}</p>
                        <span className="text-[11px] font-semibold text-primary">{m.time}</span>
                      </div>
                      <ul className="mt-1.5 grid gap-1">
                        {m.items.map((it) => (
                          <li key={it} className="flex items-start gap-1.5 text-[12px] text-foreground/85">
                            <Check size={12} className="mt-0.5 shrink-0 text-primary" /> {it}
                          </li>
                        ))}
                      </ul>
                    </div>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Name the plan */}
      <div className="mt-5 rounded-2xl bg-card p-3 ring-1 ring-border/60">
        <label className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
          Name this diet plan (optional)
        </label>
        <input
          value={s.planName ?? ""}
          onChange={(e) => set({ planName: e.target.value })}
          placeholder={isForOther ? "e.g. Mom's diet plan" : "e.g. My summer reset"}
          maxLength={60}
          className="mt-2 w-full rounded-xl bg-background px-3 py-2 text-sm ring-1 ring-border focus:outline-none focus:ring-2 focus:ring-primary/40"
        />
      </div>

      {/* Prakriti save choice when planning for someone else */}
      {isForOther && (
        <div className="mt-3 rounded-2xl bg-amber-50 p-3 ring-1 ring-amber-200 dark:bg-amber-950/30 dark:ring-amber-900">
          <p className="text-[11px] font-semibold uppercase tracking-wider text-foreground/80">
            Their Prakriti results
          </p>
          <p className="mt-1 text-[12px] text-foreground/85">
            You took the quiz for someone else. What should we do with those results on your profile?
          </p>
          <div className="mt-2 grid grid-cols-2 gap-2">
            <button
              onClick={() => set({ prakritiSaveChoice: "overwrite" })}
              className={`rounded-xl px-3 py-2 text-[12px] font-semibold ring-1 ${
                s.prakritiSaveChoice === "overwrite"
                  ? "bg-primary text-primary-foreground ring-primary"
                  : "bg-card text-foreground ring-border"
              }`}
            >
              Save & overwrite mine
            </button>
            <button
              onClick={() => set({ prakritiSaveChoice: "discard" })}
              className={`rounded-xl px-3 py-2 text-[12px] font-semibold ring-1 ${
                s.prakritiSaveChoice === "discard"
                  ? "bg-primary text-primary-foreground ring-primary"
                  : "bg-card text-foreground ring-border"
              }`}
            >
              Discard (keep mine)
            </button>
          </div>
        </div>
      )}

      <p className="mt-3 text-[11px] text-muted-foreground">
        You can delete old diet plans anytime from your dashboard — or keep them for reference.
      </p>

      <div className="mt-4 rounded-2xl bg-primary/10 p-3 text-[12px] text-foreground/85 ring-1 ring-primary/30">
        Want any changes in this plan? Talk to our bot <b>AyurAIse</b> before saving — tweak meals,
        timings, swap foods, anything.
      </div>

      <div className="mt-3 grid gap-2">
        <Link
          to="/health"
          className="flex w-full items-center justify-center gap-2 rounded-2xl bg-card px-4 py-3 text-sm font-semibold text-primary ring-1 ring-primary/40"
        >
          <Sparkles size={16} /> Talk to AyurAIse to refine my plan
        </Link>
        <button
          onClick={downloadPlan}
          className="flex w-full items-center justify-center gap-2 rounded-2xl bg-card px-4 py-3 text-sm font-semibold text-foreground ring-1 ring-border"
        >
          Download plan (.txt)
        </button>
        <button
          onClick={onSave}
          className="flex w-full items-center justify-center gap-2 rounded-2xl px-4 py-3 text-sm font-semibold text-primary-foreground"
          style={{ background: "var(--gradient-leaf)" }}
        >
          <Check size={16} /> Save plan to dashboard
        </button>
      </div>
    </StepCard>
  );
}


