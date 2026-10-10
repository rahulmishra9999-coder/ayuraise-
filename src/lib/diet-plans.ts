// Lightweight "Diets by goal" catalog for the Diet section — concise, condition-specific
// guidance (what to eat / avoid / best timing / a morning detox tip). Fuller day-by-day meal
// plans are generated in the personalized Create flow; these are quick ready reference.

export interface DietPlan {
  id: string;
  title: string;
  emoji: string;
  eat: string;     // foods to favour
  avoid: string;   // foods to limit
  timing: string;  // meal-timing guidance
  morning: string; // a morning detox / helper
}

export const DIET_PLANS: DietPlan[] = [
  { id: "anti-aging", title: "Anti-aging diet", emoji: "⏳", eat: "Colourful veg, berries, amla, nuts, ghee, soaked almonds", avoid: "Fried, refined sugar, excess salt, packaged food", timing: "Light early dinner by 7–8 pm; don't overeat", morning: "Amla + warm water; soaked almonds" },
  { id: "pregnancy", title: "Pregnancy diet", emoji: "🤰", eat: "Iron + folate greens, dates, milk, dal, fruit, ghee", avoid: "Raw papaya, excess caffeine, unpasteurised, heavy fasting", timing: "Small frequent meals; never stay hungry long", morning: "Soaked almonds + a date (doctor-guided)" },
  { id: "pcod", title: "PCOD diet", emoji: "🌸", eat: "Low-GI grains, methi, flax, cinnamon, protein, veg", avoid: "Sugar, refined carbs, dairy excess, fried", timing: "Regular meals; don't skip breakfast", morning: "Methi water or cinnamon water" },
  { id: "gut-health", title: "Gut health diet", emoji: "🌀", eat: "Warm cooked food, buttermilk, jeera, soaked raisins, khichdi", avoid: "Raw cold food, heavy fried, too much coffee", timing: "Fixed meal times; largest meal at midday", morning: "Warm water; jeera-saunf-ajwain tea" },
  { id: "healthy-joint", title: "Healthy joint diet", emoji: "🦴", eat: "Turmeric, ghee, sesame, warm soups, calcium-rich foods", avoid: "Excess sour/fermented, cold food, fried", timing: "Warm cooked meals; avoid late heavy dinner", morning: "Turmeric + warm water" },
  { id: "prostate", title: "Prostate diet", emoji: "🚹", eat: "Pumpkin seeds, tomatoes, water, gourds, whole grains", avoid: "Excess red/processed food, caffeine late, alcohol", timing: "Finish water well before bed to ease night urges", morning: "Soaked pumpkin seeds" },
  { id: "destress", title: "De-stress diet", emoji: "🧘", eat: "Warm sattvic meals, milk, nuts, ashwagandha, bananas", avoid: "Excess caffeine, sugar highs, skipped meals", timing: "Regular, unhurried meals; warm milk at night", morning: "Tulsi tea" },
  { id: "good-sleep", title: "Good sleep diet", emoji: "🌙", eat: "Light early dinner, warm milk + nutmeg, almonds", avoid: "Caffeine after 4 pm, heavy/late dinner, alcohol", timing: "Dinner by 7–8 pm; nothing heavy near bedtime", morning: "Sunlight + hydration to set your rhythm" },
  { id: "healthy-eye", title: "Healthy eye diet", emoji: "👁️", eat: "Carrots, leafy greens, amla, ghee, soaked raisins", avoid: "Excess fried, very spicy, low-nutrient junk", timing: "Regular meals; stay hydrated", morning: "Amla + triphala (netra care)" },
  { id: "healthy-kidney", title: "Healthy kidney diet", emoji: "🫘", eat: "Plenty of water, gourds, barley water, low-salt cooking", avoid: "Excess salt, protein overload, processed food", timing: "Spread fluids through the day", morning: "Warm water; punarnava (if advised)" },
  { id: "healthy-heart", title: "Healthy heart diet", emoji: "❤️", eat: "Oats, flax, nuts, garlic, fruit, high fibre, arjuna", avoid: "Fried, trans fats, excess salt & sugar", timing: "Light dinner; don't overeat", morning: "Arjuna tea or 1 garlic pod + warm water" },
  { id: "healthy-thyroid", title: "Healthy thyroid diet", emoji: "🦋", eat: "Whole grains, nuts, seeds, cooked greens, coriander water", avoid: "Excess raw goitrogens, processed soy, junk", timing: "Regular meals; take meds on empty stomach", morning: "Coriander-seed water" },
  { id: "diabetic", title: "Diabetic-friendly diet", emoji: "💉", eat: "Low-GI grains, methi, karela, jamun, protein, veg", avoid: "Sugar, white rice/maida, sweets, fruit juice", timing: "Fixed meals; eat before activity if on insulin", morning: "Methi water or karela juice" },
  { id: "pre-diabetic", title: "Pre-diabetic diet", emoji: "🩸", eat: "Whole grains, fibre, protein, cinnamon, lots of veg", avoid: "Refined carbs, sugary drinks, late heavy meals", timing: "Regular meals + a 12–14h overnight gap", morning: "Cinnamon or methi water" },
  { id: "fatty-liver", title: "Fatty liver diet", emoji: "🍔", eat: "Greens, bitter veg, oats, amla, kutki, plenty of water", avoid: "Fried, sugar, alcohol, refined carbs", timing: "Light early dinner; consider a 14:10 window", morning: "Warm lemon water; bhumi-amla" },
  { id: "weight-loss", title: "Weight loss diet", emoji: "🔥", eat: "High fibre, protein, veg, salads, warm water", avoid: "Fried, sugar, refined carbs, late snacking", timing: "Early light dinner; 14:10 window helps", morning: "Warm lemon-honey water" },
  { id: "high-protein", title: "High protein diet", emoji: "💪", eat: "Dal, paneer, curd, sprouts, soy, nuts, seeds", avoid: "Empty carbs, fried snacks, sugary drinks", timing: "Spread protein across meals; after workout", morning: "Sprouts or a protein-rich breakfast" },
  { id: "kid-friendly", title: "Kid-friendly diet", emoji: "🧒", eat: "Milk, fruit, dal, ghee, nuts, home-cooked variety", avoid: "Packaged snacks, soft drinks, excess sugar", timing: "Regular meals + healthy snacks; no skipping breakfast", morning: "Soaked almonds + milk" },
  { id: "sr-fitness", title: "Senior fitness diet", emoji: "🧓", eat: "Soft cooked food, protein, calcium, ghee, soups", avoid: "Hard-to-digest, very cold, heavy fried", timing: "Small frequent warm meals", morning: "Soaked almonds; warm water" },
  { id: "women-50", title: "Women 50+ diet", emoji: "🌺", eat: "Calcium, vitamin D, flax, soy, greens, protein", avoid: "Excess caffeine, salt, sugar, fried", timing: "Regular meals; protein at each", morning: "Sesame or flax + warm water" },
  { id: "gout", title: "Gout diet", emoji: "🦶", eat: "Low-purine foods, cherries, plenty of water, gourds", avoid: "Red meat, alcohol, sugary drinks, excess lentils in flares", timing: "Stay well hydrated through the day", morning: "Warm water; giloy/gokshura (if advised)" },
  { id: "high-bp", title: "High BP diet", emoji: "🩺", eat: "Low salt, potassium-rich fruit/veg, oats, garlic", avoid: "Salt, pickles, papad, processed & fried", timing: "Light early dinner; don't overeat", morning: "1 garlic pod or lauki juice" },
  { id: "low-bp", title: "Low BP diet", emoji: "🫀", eat: "Adequate salt & fluids, soaked raisins, dates, small frequent meals", avoid: "Long fasting, alcohol, very heavy meals", timing: "Small frequent meals; don't skip", morning: "Soaked raisins + water" },
  { id: "high-cholesterol", title: "High cholesterol diet", emoji: "🧈", eat: "Oats, flax, nuts, fruit, high fibre, arjuna", avoid: "Fried, saturated fat, sweets, trans fats", timing: "Light dinner; regular meals", morning: "Arjuna tea; soaked flax" },
  { id: "heart-surgery", title: "Heart surgery recovery diet", emoji: "💗", eat: "Soft, light, low-salt, high-fibre, easy protein (doctor-guided)", avoid: "Fried, salty, heavy, gas-forming food", timing: "Small frequent meals as advised", morning: "Warm water; gentle, as cleared by doctor" },
  { id: "healthy-lungs", title: "Healthy lungs diet", emoji: "🫁", eat: "Warm food, tulsi, mulethi, turmeric milk, ginger", avoid: "Cold food, dairy at night, fried", timing: "Warm meals; nothing cold late", morning: "Tulsi tea; turmeric-mulethi" },
  { id: "migraine", title: "Migraine diet", emoji: "🤕", eat: "Regular meals, cooling foods, water, magnesium-rich foods", avoid: "Skipped meals, aged cheese, caffeine swings, fermented", timing: "Never skip meals; fixed times", morning: "Hydrate well; ginger tea at first sign" },
  { id: "hairfall", title: "Hair fall diet", emoji: "💇", eat: "Protein, iron + vitamin C, nuts, seeds, amla, greens", avoid: "Crash diets, junk, excess sugar", timing: "Balanced regular meals", morning: "Amla or soaked methi" },
  { id: "skin-glow", title: "Skin / glow diet", emoji: "✨", eat: "Cooling veg, fruit, water, neem, amla, healthy fats", avoid: "Fried, excess sugar, fermented, very spicy", timing: "Hydrate; light early dinner", morning: "Amla or rose water + hydration" },
  { id: "anti-inflammatory", title: "Anti-inflammatory diet", emoji: "🌿", eat: "Turmeric, ginger, greens, berries, omega-3, whole foods", avoid: "Fried, refined sugar, processed, trans fats", timing: "Regular meals; light dinner", morning: "Turmeric-ginger warm water" },
  { id: "nervous-system", title: "Healthy nervous system diet", emoji: "🧠", eat: "Nuts, seeds, ghee, milk, brahmi, ashwagandha, greens", avoid: "Excess caffeine, alcohol, junk", timing: "Regular unhurried meals", morning: "Soaked almonds; brahmi" },
  { id: "brain-focus", title: "Brain, focus & memory diet", emoji: "🎯", eat: "Walnuts, almonds, blueberries, ghee, brahmi, shankhpushpi", avoid: "Sugar highs, junk, skipped breakfast", timing: "Protein-rich breakfast; steady meals", morning: "Soaked walnuts + almonds" },
  { id: "menopause", title: "Menopause diet", emoji: "🌼", eat: "Phytoestrogens (flax, soy), calcium, greens, shatavari", avoid: "Caffeine, spicy, sugar, alcohol (trigger hot flashes)", timing: "Regular meals; cooling foods", morning: "Soaked flax; shatavari (if advised)" },
];

// ---- Favourites (persisted, same mechanism as exercise/yoga) ----
const DIET_FAV_KEY = "ayuraise.diet.favs";

function readFavs(): string[] {
  if (typeof window === "undefined") return [];
  try { const r = window.localStorage.getItem(DIET_FAV_KEY); return r ? (JSON.parse(r) as string[]) : []; } catch { return []; }
}

export function loadDietFavs(): string[] { return readFavs(); }

export function toggleDietFav(id: string): string[] {
  const cur = readFavs();
  const next = cur.includes(id) ? cur.filter((x) => x !== id) : [...cur, id];
  try { window.localStorage.setItem(DIET_FAV_KEY, JSON.stringify(next)); } catch {}
  return next;
}

export function resetDietFavs(): string[] {
  try { window.localStorage.removeItem(DIET_FAV_KEY); } catch {}
  return [];
}
