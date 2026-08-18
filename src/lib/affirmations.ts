// Gentle, no-action micro-copy shown as a brief daily flash when the app opens.
// Calm reminders, fun facts and nudges — nothing to answer, just a moment.

export const AFFIRMATIONS: string[] = [
  // calm / breath / yoga
  "Take a deep breath.",
  "You are doing great already.",
  "Relax your shoulders right now.",
  "Soften your jaw and breathe.",
  "Your breath is your only anchor.",
  "Stiffness is just a starting point.",
  "A five-minute practice still counts.",
  "Inhale strength, exhale tension.",
  "Quiet the mind, free the body.",
  "Yoga improves your brain health.",
  "Savasana heals the nervous system.",
  "Slow down for a second.",
  "Good things take a moment.",
  "Let your mind rest.",
  // food facts
  "Purple food helps your brain.",
  "Blueberries improve your memory.",
  "Avocados are actually single-seeded berries.",
  "Bananas are curved because they grow toward the sun.",
  "Pumpkins and watermelons are giant berries.",
  "Pineapples take two years to grow.",
  "Strawberries wear their seeds on the outside.",
  // nutrition / weight
  "Water boosts your metabolism.",
  "Protein keeps you full longer.",
  "Sleep helps burn fat.",
  "Fiber tames your hunger.",
  "Eat slow, stress less.",
  "Fuel your body, don't just fill it.",
  // intermittent fasting
  "Intermittent fasting wakes up your brain power.",
  "Stored fat burns fast during intermittent fasting.",
  "Intermittent fasting gives your cells a deep clean.",
  "Your metabolism reboots with intermittent fasting.",
  "Intermittent fasting turns fat into pure energy.",
  // detox
  "Your liver is your body's primary detox organ.",
  "Water and fiber naturally speed up your detox process.",
  "Detox happens naturally every time you sweat.",
  "Sleep is the ultimate detox for your brain.",
  "Deep breathing helps your lungs detox harmful gases.",
  "A digital detox clears your mental space.",
  "Detox your life by removing negative thoughts.",
  "Real detox means fuelling the body, not starving it.",
  "Sweat out the toxins, breathe in the peace.",
  "Clean food is the best tool for a detox.",
  // glucose / heart / BP
  "Walking after meals naturally lowers glucose spikes.",
  "Stable blood sugar starts with smart fiber choices.",
  "Healthy fats keep your arteries clear and flexible.",
  "Less salt today means a stronger heart tomorrow.",
  "Monitoring your levels is tracking your victories.",
  "Lowering stress is direct medicine for your arteries.",
  "Potassium-rich foods gently help balance your blood pressure.",
  "Every calm moment reduces the strain on your heart.",
  "Deep breathing instantly helps soothe high blood pressure.",
];

/** A line that stays stable for the whole day, then rotates. */
export function affirmationForToday(): string {
  const day = Math.floor(Date.now() / 86400000);
  return AFFIRMATIONS[day % AFFIRMATIONS.length];
}
