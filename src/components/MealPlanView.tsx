import { useState, Fragment, createContext, useContext } from "react";
import { Link } from "@tanstack/react-router";
import { RefreshCw, Leaf, Scale, ChevronDown, BookOpen, ChevronLeft, ChevronRight, Download } from "lucide-react";
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
export function MealPlanView({ plan }: { plan: GeneratedMealPlan }) {
  const todayIdx = (new Date().getDay() + 6) % 7; // Mon = 0
  const [dayIdx, setDayIdx] = useState(todayIdx);
  const [acrossMeal, setAcrossMeal] = useState<string | null>(null); // slot name → that meal across the week
  const [swaps, setSwaps] = useState<Record<string, number>>({});
  const [detailAll, setDetailAll] = useState(false);
  const [openMeals, setOpenMeals] = useState<Record<string, boolean>>({});
  const [openRecipes, setOpenRecipes] = useState<Record<string, boolean>>({});
  const [tip, setTip] = useState<{ text: string; ex?: string; macro?: FoodMacro; left: number; top: number } | null>(null);
  const go = (d: number) => setDayIdx((i) => (i + d + 7) % 7);

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
    const idx = swaps[key] ?? 0;
    const dish = m.options[idx % m.options.length];
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
            onClick={() => setSwaps((p) => ({ ...p, [key]: (idx + 1) % m.options.length }))}
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
        <div className="flex items-end justify-between">
          <div>
            <p className="text-[10px] font-bold uppercase tracking-wide text-muted-foreground">Your calorie need</p>
            <p className="font-display text-xl font-bold text-foreground">{plan.kcalTarget.toLocaleString()} kcal<span className="text-[11px] font-semibold text-muted-foreground">/day</span></p>
          </div>
          <p className="max-w-[55%] text-right text-[10.5px] leading-snug text-muted-foreground">
            {plan.goalLabel}{plan.complete ? ` · maintenance ${plan.maintenance.toLocaleString()}` : ""}
          </p>
        </div>
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

      {/* 2 · Recommended foods */}
      <div className="rounded-xl bg-accent/20 p-3">
        <p className="mb-2 text-[10px] font-bold uppercase tracking-wide text-primary">Recommended foods for you</p>
        <div className="space-y-1.5 text-[11px] text-foreground/85">
          <p><b className="text-emerald-600">Protein ({plan.macros.protein}g):</b> <TermList items={plan.foodRecos.protein} /></p>
          <p><b className="text-amber-600">Low-GI carbs ({plan.macros.carbs}g):</b> <TermList items={plan.foodRecos.carbs} /></p>
          <p><b className="text-rose-500">Healthy fats ({plan.macros.fat}g):</b> <TermList items={plan.foodRecos.fats} /></p>
        </div>
        <p className="mt-1.5 text-[9.5px] text-muted-foreground">Tap an underlined term to see examples.</p>
      </div>

      {/* 3 · Per-goal favour / limit */}
      {plan.perGoal.length > 0 && (
        <div>
          <p className={SECTION_HEAD}>As you chose {plan.perGoal.map((p) => p.label).join(", ")} — here's what we favour &amp; limit</p>
          <div className="space-y-1.5">
            {plan.perGoal.map((p, i) => <EatAvoidRow key={i} item={p} />)}
          </div>
          {plan.fitnessNote && (
            <p className="mt-1.5 rounded-xl bg-emerald-50 px-3 py-2 text-[11px] leading-snug text-emerald-800 ring-1 ring-emerald-100 dark:bg-emerald-900/20 dark:text-emerald-200 dark:ring-emerald-900/40">
              {plan.fitnessNote}
            </p>
          )}
        </div>
      )}

      {/* 4 · Prakriti */}
      {plan.prakriti && (
        <div>
          <p className={SECTION_HEAD}>As per your prakriti (body type)</p>
          <EatAvoidRow item={plan.prakriti} />
        </div>
      )}

      {/* 5 · Ritucharya */}
      <div>
        <p className={`${SECTION_HEAD} flex items-center gap-1`}><Leaf size={11} className="text-emerald-600" /> This season — {plan.ritucharya.label} (ritucharya)</p>
        <EatAvoidRow item={plan.ritucharya} />
      </div>

      {/* 6 · 1-week plan */}
      <div>
        <div className="mb-2 flex items-center justify-between gap-2">
          <p className="text-[11px] font-bold uppercase tracking-wide text-muted-foreground">Your week</p>
          <div className="flex items-center gap-1.5">
            <select
              value={acrossMeal ?? "day"}
              onChange={(e) => setAcrossMeal(e.target.value === "day" ? null : e.target.value)}
              className="rounded-full bg-secondary px-2.5 py-1 text-[10px] font-bold text-foreground/75"
            >
              <option value="day">Day by day</option>
              {slots.map((sl) => <option key={sl} value={sl}>{sl} · all week</option>)}
            </select>
            <button
              onClick={() => setDetailAll((q) => !q)}
              className={`flex items-center gap-1 rounded-full px-2.5 py-1 text-[10px] font-bold ${detailAll ? "bg-primary text-primary-foreground" : "bg-secondary text-foreground/75"}`}
            >
              <Scale size={11} /> Detail
            </button>
            <button onClick={downloadPDF} aria-label="Download PDF" title="Download PDF" className="flex h-7 w-7 items-center justify-center rounded-full bg-secondary text-foreground/70"><Download size={12} /></button>
          </div>
        </div>

        {acrossMeal ? (
          <>
            <p className="mb-1.5 text-[10px] text-muted-foreground">{acrossMeal} · all 7 days · tap ↻ to swap</p>
            <div className="space-y-2">
              {plan.week.map((d, dayI) => {
                const si = d.meals.findIndex((m) => m.slot === acrossMeal);
                return si >= 0 ? renderMeal(d.meals[si], dayI, si, true) : null;
              })}
            </div>
          </>
        ) : (
          <>
            {/* day selector with prev/next */}
            <div className="flex items-center gap-1.5">
              <button onClick={() => go(-1)} aria-label="Previous day" className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-secondary text-foreground/70 active:scale-95"><ChevronLeft size={13} /></button>
              <div className="flex min-w-0 flex-1 gap-1 overflow-x-auto">
                {plan.week.map((d, i) => (
                  <button key={d.day} onClick={() => setDayIdx(i)} className={`shrink-0 rounded-full px-2.5 py-0.5 text-[11px] font-bold ${i === dayIdx ? "bg-primary text-primary-foreground" : "bg-secondary text-foreground/60"}`}>{d.day}</button>
                ))}
              </div>
              <button onClick={() => go(1)} aria-label="Next day" className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-secondary text-foreground/70 active:scale-95"><ChevronRight size={13} /></button>
            </div>
            <p className="mt-1 text-[10px] text-muted-foreground">Day {dayIdx + 1} of 7 · tap a meal for quantities &amp; recipe · auto-generates next week</p>
            <div className="mt-2 space-y-2">
              {plan.week[dayIdx].meals.map((m, si) => renderMeal(m, dayIdx, si, false))}
            </div>
          </>
        )}
      </div>
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
    </TermTipCtx.Provider>
  );
}
