import { useState, Fragment, createContext, useContext, type ReactNode } from "react";
import { Link } from "@tanstack/react-router";
import { RefreshCw, Scale, ChevronDown, BookOpen, Download, Carrot } from "lucide-react";

// Major ingredients the plan leans on — editable in the ingredient sheet.
export const MAIN_INGREDIENTS = ["Paneer", "Tofu", "Dal", "Rajma", "Chana", "Rice", "Roti", "Millet", "Oats", "Curd", "Peanut", "Soya", "Ghee", "Besan", "Makhana"];
const SABZI_OPTIONS = "lauki, bhindi, tinda, cabbage, mixed veg, palak, gobi, tori";

// "Just food tips" mode — per-meal guidance + a static composition example (no fixed 7-day menu).
const MEAL_RECOS: Record<string, { foods: string; make: string }> = {
  Breakfast: { foods: "Complex carb + protein + a fruit/veg", make: "1 bowl poha/oats/daliya (or 2 cheela/idli) + a protein (sprouts/curd/peanuts) + a fruit" },
  Lunch: { foods: "Grain + dal/protein + sabzi + salad/curd", make: "2 roti or 1 cup rice + 1 bowl dal + 1 cup sabzi + salad + small curd" },
  Snack: { foods: "Light protein or fruit — nothing fried", make: "roasted makhana/chana or a fruit + 5 nuts, with tea/buttermilk" },
  Dinner: { foods: "Light & early — khichdi/soup + veg", make: "1 bowl khichdi or 2 phulka + light dal + cooked veg (finish by ~8 pm)" },
};
import type { GeneratedMealPlan, EatAvoid, FoodMacro } from "@/lib/meal-plan";
import { TERM_EXAMPLES, FOOD_MACROS } from "@/lib/meal-plan";
import { getDishDetail, ingredientMacro, dishSeason } from "@/lib/dish-details";

const TermTipCtx = createContext<(text: string, rect: DOMRect) => void>(() => {});

/** A favour/limit or recommended-food term. If we have examples or macros for it, it
 *  becomes tappable and opens a detail card that's kept on-screen. */
function Term({ text }: { text: string }) {
  const openTip = useContext(TermTipCtx);
  if (!TERM_EXAMPLES[text] && !FOOD_MACROS[text]) return <span>{text}</span>;
  return (
    <button
      onClick={(e) => openTip(text, e.currentTarget.getBoundingClientRect())}
      className="underline decoration-dotted underline-offset-2"
    >
      {text}
    </button>
  );
}

function TermList({ items }: { items: string[] }) {
  return <>{items.map((t, i) => <Fragment key={i}><Term text={t} />{i < items.length - 1 ? ", " : ""}</Fragment>)}</>;
}

/** Collapsible info section — closed by default (tap the header to open). */
function Collapse({ title, children }: { title: string; children: ReactNode }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="rounded-xl bg-secondary/40 ring-1 ring-border/60">
      <button onClick={() => setOpen((o) => !o)} className="flex w-full items-center justify-between gap-2 px-3 py-2 text-left">
        <span className="text-[10.5px] font-bold uppercase tracking-wide text-muted-foreground">{title}</span>
        <ChevronDown size={14} className={`shrink-0 text-muted-foreground transition-transform ${open ? "rotate-180" : ""}`} />
      </button>
      {open && <div className="border-t border-border/50 px-3 py-2.5">{children}</div>}
    </div>
  );
}

/** Flat eat/avoid block for per-goal, prakriti and ritucharya. */
function EatAvoidRow({ item }: { item: EatAvoid & { note?: string } }) {
  return (
    <div className="rounded-xl bg-secondary/40 p-2.5 ring-1 ring-border/60">
      <p className="text-[12px] font-bold capitalize text-foreground">{item.label}</p>
      {item.note && <p className="mb-1 text-[10.5px] leading-snug text-muted-foreground">{item.note}</p>}
      <p className="text-[11px] leading-snug text-foreground/85"><b className="text-emerald-600">Favour:</b> <TermList items={item.eat} /></p>
      <p className="text-[11px] leading-snug text-foreground/85"><b className="text-rose-500">Limit:</b> <TermList items={item.avoid} /></p>
    </div>
  );
}

/** Personalized meal plan — calorie need, macros, recommended foods, per-goal +
 *  prakriti + ritucharya favour/limit, and a swappable 7-day schedule with per-dish
 *  quantities, macros and recipes. */
export function MealPlanView({ plan, mode = "detailed", avoid: avoidProp, onAvoidChange }: { plan: GeneratedMealPlan; mode?: "detailed" | "recos"; avoid?: string[]; onAvoidChange?: (next: string[]) => void }) {
  const todayIdx = (new Date().getDay() + 6) % 7; // Mon = 0
  const [dayIdx, setDayIdx] = useState(todayIdx);
  const [acrossMeal, setAcrossMeal] = useState<string | null>(null); // slot name → that meal across the week
  const [swaps, setSwaps] = useState<Record<string, number>>({});
  const [detailAll, setDetailAll] = useState(false);
  const [openMeals, setOpenMeals] = useState<Record<string, boolean>>({});
  const [openRecipes, setOpenRecipes] = useState<Record<string, boolean>>({});
  const [tip, setTip] = useState<{ text: string; ex?: string; macro?: FoodMacro; left: number; top: number } | null>(null);
  const [swapFor, setSwapFor] = useState<{ key: string; n: number } | null>(null);
  const [swapReason, setSwapReason] = useState("");
  const [swapPref, setSwapPref] = useState("");
  const [, setSwapReasons] = useState<Record<string, { reason: string; pref: string }>>({});
  const [avoidInner, setAvoidInner] = useState<string[]>([]);
  const avoid = avoidProp ?? avoidInner;
  const setAvoid = (fn: (prev: string[]) => string[]) => {
    const next = fn(avoid);
    if (onAvoidChange) onAvoidChange(next); else setAvoidInner(next);
  };
  const [ingOpen, setIngOpen] = useState(false);
  const [want, setWant] = useState<string[]>([]);     // ingredients the user wants added in
  const [wantInput, setWantInput] = useState("");
  const addWant = () => { const v = wantInput.trim(); if (v && !want.includes(v)) setWant((w) => [...w, v]); setWantInput(""); };

  const TIP_W = Math.min(250, (typeof window !== "undefined" ? window.innerWidth : 360) - 16);
  const openTip = (text: string, rect: DOMRect, data?: { ex?: string; macro?: FoodMacro }) => {
    const vw = typeof window !== "undefined" ? window.innerWidth : 360;
    const left = Math.max(8, Math.min(rect.left, vw - TIP_W - 8));
    const ex = data ? data.ex : TERM_EXAMPLES[text];
    const macro = data ? data.macro : FOOD_MACROS[text];
    setTip({ text, ex, macro, left, top: rect.bottom + 6 });
  };

  const slots = plan.week[0]?.meals.map((m) => m.slot) ?? [];
  const pCal = plan.macros.protein * 4;
  const cCal = plan.macros.carbs * 4;
  const fCal = plan.macros.fat * 9;
  const totCal = Math.max(1, pCal + cCal + fCal);
  const pct = (v: number) => `${Math.round((v / totCal) * 100)}%`;

  const renderMeal = (m: GeneratedMealPlan["week"][number]["meals"][number], dayI: number, si: number, showDay: boolean) => {
    const key = `${dayI}:${si}`;
    const useOpts = (() => {
      if (!avoid.length) return m.options;
      const filtered = m.options.filter((o) => {
        const hay = (o + " " + getDishDetail(o, m.kcal).ingredients.join(" ")).toLowerCase();
        return !avoid.some((a) => hay.includes(a.toLowerCase()));
      });
      return filtered.length ? filtered : m.options;
    })();
    const idx = swaps[key] ?? 0;
    const dish = useOpts[idx % useOpts.length];
    const det = getDishDetail(dish, m.kcal);
    const open = detailAll || openMeals[key];
    const recipeOpen = openRecipes[key];
    return (
      <div key={key} className="rounded-xl bg-secondary/40 p-2.5 ring-1 ring-border/60">
        <div className="flex items-start gap-2.5">
          <button onClick={() => setOpenMeals((p) => ({ ...p, [key]: !open }))} className="min-w-0 flex-1 text-left">
            <div className="flex items-center gap-1.5">
              <span className="text-[11px] font-bold text-foreground">{showDay ? plan.week[dayI].day : m.slot}</span>
              <span className="text-[9.5px] text-muted-foreground">{m.time}</span>
              <ChevronDown size={13} className={`ml-auto text-muted-foreground transition-transform ${open ? "rotate-180" : ""}`} />
            </div>
            <p className="mt-0.5 text-[12px] font-medium leading-snug text-foreground/90">{dish}</p>
            <p className="mt-0.5 text-[10px] text-muted-foreground">~{det.kcal} kcal · P {det.p} · C {det.c} · F {det.f} g</p>
          </button>
          <button
            onClick={() => setSwapFor({ key, n: useOpts.length })}
            className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-secondary text-foreground/70 active:scale-95"
            aria-label={`Swap ${m.slot}`}
          >
            <RefreshCw size={13} />
          </button>
        </div>
        {open && (
          <div className="mt-2 space-y-1.5 border-t border-border/50 pt-2">
            <p className="text-[10.5px] leading-snug text-foreground/80">
              <span className="font-semibold text-foreground">Best eaten:</span> {m.time} · {dishSeason(dish)}
            </p>
            <div>
              <p className="text-[9.5px] font-bold uppercase tracking-wide text-muted-foreground">How much to take</p>
              <ul className="mt-0.5 space-y-0.5">
                {det.ingredients.map((it, k) => {
                  const im = ingredientMacro(it);
                  return (
                    <li key={k} className="text-[11px] leading-snug text-foreground/85">·{" "}
                      {im
                        ? <button onClick={(e) => openTip(it, e.currentTarget.getBoundingClientRect(), { macro: im })} className="text-left underline decoration-dotted underline-offset-2">{it}</button>
                        : it}
                    </li>
                  );
                })}
              </ul>
              <p className="text-[9px] text-muted-foreground">Tap an underlined item for its macros.</p>
            </div>
            {(dish.toLowerCase().includes("sabzi") || dish.toLowerCase().includes("veg")) && (
              <p className="text-[10px] leading-snug text-muted-foreground"><span className="font-semibold text-foreground/80">Sabzi options:</span> {SABZI_OPTIONS}</p>
            )}
            <button onClick={() => setOpenRecipes((p) => ({ ...p, [key]: !recipeOpen }))} className="flex items-center gap-1 text-[10.5px] font-bold text-primary">
              <BookOpen size={12} /> {recipeOpen ? "Hide recipe" : "See recipe"}
            </button>
            {recipeOpen && (
              <ol className="ml-1 list-decimal space-y-0.5 pl-4">
                {det.recipe.map((st, k) => <li key={k} className="text-[11px] leading-snug text-foreground/80">{st}</li>)}
              </ol>
            )}
          </div>
        )}
      </div>
    );
  };

  const downloadPDF = () => {
    const esc = (s: string) => s.replace(/[&<>]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;" }[c] as string));
    const dayBlocks = plan.week.map((d, dayI) => {
      const rows = d.meals.map((m, si) => {
        const idx = swaps[`${dayI}:${si}`] ?? 0;
        const dish = m.options[idx % m.options.length];
        const det = getDishDetail(dish, m.kcal);
        return `<tr><td class="s">${esc(m.slot)}<br><span class="t">${esc(m.time)}</span></td><td>${esc(dish)}<br><span class="t">${det.kcal} kcal · P ${det.p} · C ${det.c} · F ${det.f} g</span><br><span class="i">${esc(det.ingredients.join(" · "))}</span></td></tr>`;
      }).join("");
      return `<h3>${esc(d.day)}</h3><table>${rows}</table>`;
    }).join("");
    const html = `<!doctype html><html><head><meta charset="utf-8"><title>My meal plan</title><style>
      body{font-family:system-ui,Arial,sans-serif;color:#1a1a1a;max-width:720px;margin:24px auto;padding:0 16px;}
      h1{font-size:20px;margin:0 0 4px} h3{font-size:14px;margin:18px 0 4px;border-bottom:1px solid #ddd;padding-bottom:3px}
      .sub{color:#666;font-size:12px;margin:0 0 12px}
      table{width:100%;border-collapse:collapse;font-size:12px} td{border-bottom:1px solid #eee;padding:6px 4px;vertical-align:top}
      td.s{width:90px;font-weight:600} .t{color:#777;font-size:11px} .i{color:#555;font-size:11px}
      @media print{a{display:none}}
    </style></head><body>
      <h1>My 7-day meal plan</h1>
      <p class="sub">${plan.kcalTarget.toLocaleString()} kcal/day · ${esc(plan.goalLabel)} · Protein ${plan.macros.protein}g · Carbs ${plan.macros.carbs}g · Fat ${plan.macros.fat}g</p>
      ${dayBlocks}
    </body></html>`;
    const w = window.open("", "_blank");
    if (!w) return;
    w.document.write(html);
    w.document.close();
    w.focus();
    setTimeout(() => w.print(), 300);
  };

  const SECTION_HEAD = "mb-1.5 text-[10px] font-bold uppercase tracking-wide text-muted-foreground";

  return (
    <TermTipCtx.Provider value={openTip}>
    <div className="space-y-3">
      {/* 1 · Calorie need + macros */}
      <div className="rounded-xl bg-secondary/60 p-3">
        <p className="text-[12px] leading-snug text-muted-foreground">
          <span className="text-[10px] font-bold uppercase tracking-wide">Your calorie need</span>{" "}
          <b className="font-display text-[15px] text-foreground">{plan.kcalTarget.toLocaleString()} kcal/day</b>
          <span> · {plan.goalLabel}</span>
        </p>
        <div className="mt-2 flex h-2.5 overflow-hidden rounded-full">
          <div style={{ width: pct(pCal) }} className="bg-emerald-500" />
          <div style={{ width: pct(cCal) }} className="bg-amber-400" />
          <div style={{ width: pct(fCal) }} className="bg-rose-400" />
        </div>
        <div className="mt-1.5 flex justify-between text-[10.5px] font-semibold">
          <span className="text-emerald-600">Protein {plan.macros.protein}g</span>
          <span className="text-amber-600">Carbs {plan.macros.carbs}g</span>
          <span className="text-rose-500">Fat {plan.macros.fat}g</span>
        </div>
        {!plan.complete && (
          <Link to="/onboarding" search={{ step: "profile", returnTo: "/myplan/me", profileId: undefined }} className="mt-2 block text-[10.5px] font-semibold text-primary underline">
            Add your age, height & weight for exact numbers →
          </Link>
        )}
      </div>

      {/* energy note — surfaced up top */}
      {plan.fitnessNote && (
        <p className="rounded-xl bg-emerald-50 px-3 py-2 text-[11px] leading-snug text-emerald-800 ring-1 ring-emerald-100 dark:bg-emerald-900/20 dark:text-emerald-200 dark:ring-emerald-900/40">
          {plan.fitnessNote}
        </p>
      )}

      {/* Know your food — grouped info sections */}
      <Collapse title="🍎 Know your food">
        <div className="space-y-2">
          <Collapse title="Recommended foods for you">
            <div className="space-y-1.5 text-[11px] text-foreground/85">
              <p><b className="text-emerald-600">Protein ({plan.macros.protein}g):</b> <TermList items={plan.foodRecos.protein} /></p>
              <p><b className="text-amber-600">Low-GI carbs ({plan.macros.carbs}g):</b> <TermList items={plan.foodRecos.carbs} /></p>
              <p><b className="text-rose-500">Healthy fats ({plan.macros.fat}g):</b> <TermList items={plan.foodRecos.fats} /></p>
            </div>
            <p className="mt-1.5 text-[9.5px] text-muted-foreground">Tap an underlined term for why it helps.</p>
          </Collapse>
          {plan.perGoal.length > 0 && (
            <Collapse title={`Favour & limit — ${plan.perGoal.map((p) => p.label).join(", ")}`}>
              <div className="space-y-1.5">
                {plan.perGoal.map((p, i) => <EatAvoidRow key={i} item={p} />)}
              </div>
            </Collapse>
          )}
          {plan.prakriti && (
            <Collapse title="As per your body type (prakriti)">
              <EatAvoidRow item={plan.prakriti} />
            </Collapse>
          )}
          <Collapse title={`This season — ${plan.ritucharya.label} (ritucharya)`}>
            <EatAvoidRow item={plan.ritucharya} />
          </Collapse>
        </div>
      </Collapse>

      {/* 6 · meals — food tips (per-meal recos) or a full 7-day plan */}
      {mode === "recos" ? (
        <div>
          <p className="mb-2 text-[11px] font-bold uppercase tracking-wide text-muted-foreground">Your meals — recommendations</p>
          <div className="space-y-2">
            {(plan.week[0]?.meals ?? []).map((m) => {
              const r = MEAL_RECOS[m.slot];
              return (
                <div key={m.slot} className="rounded-xl bg-secondary/40 p-2.5 ring-1 ring-border/60">
                  <div className="flex items-center gap-1.5">
                    <span className="text-[11.5px] font-bold text-foreground">{m.slot}</span>
                    <span className="text-[9.5px] text-muted-foreground">{m.time}</span>
                    <span className="ml-auto text-[10px] font-semibold text-primary">~{m.kcal} kcal</span>
                  </div>
                  {r && (
                    <>
                      <p className="mt-1 text-[11px] leading-snug text-foreground/85"><b className="text-emerald-600">Include:</b> {r.foods}</p>
                      <p className="mt-0.5 text-[10.5px] leading-snug text-muted-foreground"><b className="text-foreground/80">A ~{m.kcal} kcal {m.slot.toLowerCase()} =</b> {r.make}</p>
                    </>
                  )}
                </div>
              );
            })}
          </div>
          <p className="mt-2 text-[10px] leading-snug text-muted-foreground">Flexible tips — no fixed menu. Follow them your own way; portions scale with your calorie need.</p>
        </div>
      ) : (
      <div>
        <div className="mb-2 flex items-center justify-between gap-2">
          <p className="text-[11px] font-bold uppercase tracking-wide text-muted-foreground">This week</p>
          <div className="flex items-center gap-1.5">
            <button onClick={() => setIngOpen(true)} title="Add or remove ingredients" className={`flex items-center gap-1 rounded-full px-2 py-1 text-[10px] font-bold ${avoid.length ? "bg-rose-50 text-rose-600" : "bg-secondary text-foreground/75"}`}><Carrot size={11} /> Add / remove{avoid.length ? ` (${avoid.length}✕)` : ""}</button>
            <button onClick={() => setDetailAll((q) => !q)} className={`flex items-center gap-1 rounded-full px-2 py-1 text-[10px] font-bold ${detailAll ? "bg-primary text-primary-foreground" : "bg-secondary text-foreground/75"}`}><Scale size={11} /> Detail</button>
            <button onClick={downloadPDF} aria-label="Download PDF" title="Download PDF" className="flex h-7 w-7 items-center justify-center rounded-full bg-secondary text-foreground/70"><Download size={12} /></button>
          </div>
        </div>
        <div className="flex gap-1">
          {plan.week.map((d, i) => (
            <button key={d.day} onClick={() => setDayIdx(i)} className={`flex-1 rounded-md py-1 text-center text-[10px] font-bold ${i === dayIdx ? "bg-primary text-primary-foreground" : "bg-secondary text-foreground/60"}`}>{d.day}</button>
          ))}
        </div>
        <p className="mt-1.5 text-[10px] leading-snug text-muted-foreground">Use <b>🥕 Add / remove</b> to take out or add ingredients, or <b>⟳</b> to swap a meal — we'll create next week's plan as you progress, based on your feedback.</p>
        <div className="mt-2 space-y-2">
          {plan.week[dayIdx].meals.map((m, si) => renderMeal(m, dayIdx, si, false))}
        </div>
      </div>
      )}
    </div>

    {tip && (
      <>
        <div onClick={() => setTip(null)} className="fixed inset-0 z-40" />
        <div
          className="fixed z-50 rounded-xl bg-card p-3 text-[11.5px] leading-snug text-foreground/85 shadow-xl ring-1 ring-border/70"
          style={{ left: tip.left, top: tip.top, width: TIP_W }}
        >
          <b className="mb-0.5 block text-[12px] text-foreground">{tip.text}</b>
          {tip.ex && <span className="block">e.g. {tip.ex}</span>}
          {tip.macro && (
            <span className="mt-1.5 block border-t border-border/50 pt-1.5">
              <span className="text-[10px] text-muted-foreground">Per {tip.macro.serving}</span>
              <span className="mt-0.5 block font-semibold">
                <span className="text-emerald-600">P {tip.macro.p}g</span> · <span className="text-amber-600">C {tip.macro.c}g</span> · <span className="text-rose-500">F {tip.macro.f}g</span> · ~{tip.macro.kcal} kcal
              </span>
            </span>
          )}
        </div>
      </>
    )}

    {swapFor && (
      <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/40" onClick={() => setSwapFor(null)}>
        <div className="w-full max-w-xl rounded-t-2xl bg-card p-4 pb-[max(1.25rem,env(safe-area-inset-bottom))]" onClick={(e) => e.stopPropagation()}>
          <div className="mx-auto mb-3 h-1 w-10 rounded-full bg-border" />
          <p className="text-[13px] font-bold text-foreground">Swap this meal</p>
          <p className="mt-0.5 text-[11px] text-muted-foreground">Tell us why — your next week's plan learns from it.</p>
          <div className="mt-2.5 flex flex-wrap gap-1.5">
            {["Don't like it", "Not available", "Too heavy", "Want variety", "Avoid an ingredient"].map((r) => (
              <button key={r} onClick={() => setSwapReason(r)} className={`rounded-full px-3 py-1 text-[11px] font-semibold ${swapReason === r ? "bg-primary text-primary-foreground" : "bg-secondary text-foreground/75"}`}>{r}</button>
            ))}
          </div>
          <input value={swapPref} onChange={(e) => setSwapPref(e.target.value)} placeholder="Any preference? e.g. something with paneer, lighter, no onion" className="mt-2.5 w-full rounded-xl bg-background px-3 py-2 text-[12px] ring-1 ring-border/60 focus:outline-none focus:ring-2 focus:ring-primary/40" />
          <button
            onClick={() => {
              const k = swapFor.key;
              setSwaps((p) => ({ ...p, [k]: ((p[k] ?? 0) + 1) % Math.max(1, swapFor.n) }));
              setSwapReasons((p) => ({ ...p, [k]: { reason: swapReason, pref: swapPref } }));
              setSwapFor(null); setSwapReason(""); setSwapPref("");
            }}
            className="mt-3 w-full rounded-2xl bg-primary py-2.5 text-[13px] font-bold text-primary-foreground active:scale-[0.99]"
          >Get a new meal →</button>
        </div>
      </div>
    )}

    {ingOpen && (
      <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/40" onClick={() => setIngOpen(false)}>
        <div className="w-full max-w-xl rounded-t-2xl bg-card p-4 pb-[max(1.25rem,env(safe-area-inset-bottom))]" onClick={(e) => e.stopPropagation()}>
          <div className="mx-auto mb-3 h-1 w-10 rounded-full bg-border" />
          <p className="text-[13px] font-bold text-foreground">Add or remove ingredients</p>
          <p className="mt-0.5 text-[11px] text-muted-foreground">Remove anything you don't want, or add one you'd like — your meals adjust to match.</p>

          <p className="mt-3 text-[10px] font-bold uppercase tracking-wide text-muted-foreground">Tap to remove</p>
          <div className="mt-1.5 flex flex-wrap gap-1.5">
            {MAIN_INGREDIENTS.map((ing) => {
              const off = avoid.includes(ing);
              return (
                <button key={ing} onClick={() => setAvoid((a) => off ? a.filter((x) => x !== ing) : [...a, ing])}
                  className={`rounded-full px-3 py-1 text-[11px] font-semibold ring-1 ${off ? "bg-rose-50 text-rose-600 line-through ring-rose-200" : "bg-secondary text-foreground/80 ring-border/50"}`}>
                  {ing}
                </button>
              );
            })}
          </div>
          <p className="mt-1.5 text-[10px] text-muted-foreground">{avoid.length ? `Removing: ${avoid.join(", ")} — meals using these are swapped out.` : "Nothing removed — tap an item to take it out."}</p>

          <p className="mt-3 text-[10px] font-bold uppercase tracking-wide text-muted-foreground">Add an ingredient you'd like</p>
          {want.length > 0 && (
            <div className="mt-1.5 flex flex-wrap gap-1.5">
              {want.map((w) => (
                <button key={w} onClick={() => setWant((a) => a.filter((x) => x !== w))} className="rounded-full bg-emerald-50 px-3 py-1 text-[11px] font-semibold text-emerald-700 ring-1 ring-emerald-200 dark:bg-emerald-900/30 dark:text-emerald-300">{w} ✕</button>
              ))}
            </div>
          )}
          <div className="mt-1.5 flex gap-2">
            <input value={wantInput} onChange={(e) => setWantInput(e.target.value)} onKeyDown={(e) => { if (e.key === "Enter") addWant(); }} placeholder="e.g. quinoa, mushroom, moringa" className="min-w-0 flex-1 rounded-xl bg-background px-3 py-2 text-[12px] ring-1 ring-border/60 focus:outline-none focus:ring-2 focus:ring-primary/40" />
            <button onClick={addWant} className="shrink-0 rounded-xl bg-primary px-3.5 py-2 text-[12px] font-bold text-primary-foreground active:scale-95">Add</button>
          </div>

          <button onClick={() => setIngOpen(false)} className="mt-3.5 w-full rounded-2xl bg-primary py-2.5 text-[13px] font-bold text-primary-foreground active:scale-[0.99]">Done</button>
        </div>
      </div>
    )}
    </TermTipCtx.Provider>
  );
}
