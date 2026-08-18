// Workouts library.
//   Practice page holds three category groups, all on one screen:
//     Styles   → Desi Kasrat, Gym, Calisthenics, Pilates, HIIT
//     Goal     → Lose Weight, Diabetic Friendly, Belly Fat, Endurance, Flexibility, Toning
//     Programs → Beginner Fitness, 15-Min Daily, Senior Fitness, Stretching
// Each bucket holds sessions built around a focus area (full body, upper/lower body,
// endurance, arms, legs, chest, shoulders, abs, core), filterable by level, equipment
// and time — plus an exercise pool users can ➕ into their own bundle with sets.

export type BodyPart = "full-body" | "abs" | "arms" | "chest" | "shoulders" | "legs" | "butt" | "back";
export type Focus =
  | "full-body" | "upper-body" | "lower-body" | "endurance"
  | "arms" | "legs" | "chest" | "shoulders" | "abs" | "core";
export type Level = "beginner" | "medium" | "advanced";
export type Intensity = "low" | "medium" | "high";
export type Equip = "none" | "dumbbells" | "gym" | "desi";
export type Kind = "warmup" | "main" | "cooldown";

export interface Exercise {
  id: string; name: string; emoji: string; kind: Kind;
  parts: BodyPart[]; sec: number; met: number; equip: Equip;
  tag?: string;   // form-specific pool: desi | pilates
  how?: string;
}

function e(
  id: string, name: string, emoji: string, kind: Kind, parts: BodyPart[],
  sec: number, met: number, equip: Equip = "none", tag?: string, how?: string,
): Exercise {
  return { id, name, emoji, kind, parts, sec, met, equip, tag, how };
}

/* ================= Exercise pool ================= */

export const EXERCISES: Exercise[] = [
  // ---- warm-ups ----
  e("wu-arm", "Arm Circles", "🔄", "warmup", ["shoulders", "arms"], 30, 3, "none", undefined, "Small circles forward, then backward. Shoulders relaxed."),
  e("wu-elbow", "Elbow Rotations", "💫", "warmup", ["arms", "shoulders"], 30, 3, "none", undefined, "Hands on shoulders, draw big circles with the elbows."),
  e("wu-neck", "Neck Rolls", "🙆", "warmup", ["back"], 20, 2.5, "none", undefined, "Slow half-circles ear to chest to ear. Never force."),
  e("wu-side", "Dynamic Side Bends", "🤸", "warmup", ["abs", "full-body"], 30, 3.2, "none", undefined, "Reach one arm overhead and lean sideways, alternate."),
  e("wu-cross", "Cross-Body Shoulder Stretch", "🫱", "warmup", ["shoulders"], 30, 2.5, "none", undefined, "Draw one arm across the chest, hold, switch."),
  e("wu-roll", "Roll Down", "⬇️", "warmup", ["back"], 30, 2.8, "none", undefined, "Chin to chest, roll down one vertebra at a time."),
  e("wu-hip", "Standing Hip Rotations", "🔁", "warmup", ["legs", "butt"], 30, 3.2, "none", undefined, "Lift one knee and open the hip in a slow circle."),
  e("wu-swing", "Leg Swings", "🦵", "warmup", ["legs"], 30, 3.2, "none", undefined, "Hold support, swing one leg front to back, loose."),
  e("wu-jack", "Jumping Jacks", "⭐", "warmup", ["full-body"], 30, 6, "none", undefined, "Land soft, arms all the way overhead."),
  e("wu-march", "March in Place", "🚶", "warmup", ["legs", "full-body"], 30, 3.5, "none", undefined, "Drive the knees up, swing the arms."),
  e("wu-twist", "Torso Twists", "🌀", "warmup", ["abs", "back"], 30, 3, "none", undefined, "Feet planted, rotate the ribcage side to side."),
  e("wu-shrug", "Shoulder Shrugs", "🤷", "warmup", ["shoulders"], 20, 2.5, "none", undefined, "Lift shoulders to the ears, drop them heavy."),

  // ---- cool-downs / stretches (also the 'main' pool for stretching buckets) ----
  e("cd-hipflex", "Hip Flexor Stretch", "🧎", "cooldown", ["legs"], 30, 2.3, "none", undefined, "Low lunge, tuck the tailbone, breathe into the front hip."),
  e("cd-child", "Child's Pose", "🧘", "cooldown", ["back"], 40, 2, "none", undefined, "Knees wide, hips back to heels, arms long."),
  e("cd-catcow", "Cat to Cow Stretch", "🐈", "cooldown", ["back"], 30, 2.3, "none", undefined, "On all fours, arch and round with the breath."),
  e("cd-dog", "Downward Dog", "🐕", "cooldown", ["full-body"], 30, 3, "none", undefined, "Press hips up and back, heels reaching down."),
  e("cd-ham", "Hamstring Stretch", "🦵", "cooldown", ["legs"], 30, 2.3, "none", undefined, "One leg long, hinge from the hips, back flat."),
  e("cd-quad", "Quad Stretch", "🦿", "cooldown", ["legs"], 30, 2.3, "none", undefined, "Heel to glute, knees together, stand tall."),
  e("cd-chest", "Chest Opener", "🫸", "cooldown", ["chest", "shoulders"], 30, 2.3, "none", undefined, "Clasp hands behind the back, lift the chest."),
  e("cd-fold", "Seated Forward Fold", "🪑", "cooldown", ["back", "legs"], 30, 2.2, "none", undefined, "Legs long, fold from the hips, neck soft."),
  e("cd-twistlay", "Lying Spinal Twist", "🌙", "cooldown", ["back"], 30, 2.2, "none", undefined, "Knees drop to one side, gaze the other way."),
  e("cd-pigeon", "Pigeon Stretch", "🕊️", "cooldown", ["butt", "legs"], 40, 2.3, "none", undefined, "Front shin across, hips square, melt forward."),
  e("cd-calf", "Calf Stretch", "🦶", "cooldown", ["legs"], 30, 2.2, "none", undefined, "Back heel pressing down, front knee bent."),
  e("cd-neckstretch", "Neck Side Stretch", "💆", "cooldown", ["back", "shoulders"], 30, 2, "none", undefined, "Ear towards the shoulder, opposite hand reaching down."),
  e("cd-butterfly", "Butterfly Stretch", "🦋", "cooldown", ["legs"], 40, 2.2, "none", undefined, "Soles together, knees heavy, spine tall."),
  e("cd-breath", "Deep Breathing", "🌬️", "cooldown", ["full-body"], 30, 1.8, "none", undefined, "In through the nose 4, out through the mouth 6."),

  // ---- full body / cardio ----
  e("fb-burpee", "Burpees", "💥", "main", ["full-body"], 40, 8, "none", undefined, "Squat, hands down, hop back, chest to floor, jump up."),
  e("fb-burpeewalk", "Burpee Walk", "🚶", "main", ["full-body"], 40, 6.5, "none", undefined, "Same shape, walk the feet instead of jumping."),
  e("fb-mountain", "Mountain Climbers", "⛰️", "main", ["abs", "full-body"], 40, 8, "none", undefined, "Plank tall, drive the knees in fast, hips low."),
  e("fb-highknee", "High Knees", "🏃", "main", ["legs", "full-body"], 40, 8, "none", undefined, "Knees to hip height, stay on the balls of the feet."),
  e("fb-star", "Star Jumps", "⭐", "main", ["full-body"], 30, 7, "none", undefined, "Explode wide, land soft with bent knees."),
  e("fb-bear", "Bear Crawl", "🐻", "main", ["full-body", "abs"], 40, 6.5, "none", undefined, "Knees hover an inch off the floor, opposite hand and foot."),
  e("fb-inch", "Inchworm", "🐛", "main", ["full-body", "abs"], 40, 5, "none", undefined, "Fold, walk hands to plank, walk back."),
  e("fb-skater", "Skater Hops", "⛸️", "main", ["legs", "full-body"], 40, 7.5, "none", undefined, "Bound side to side, land on one leg and hold."),
  e("fb-plankjack", "Plank Jacks", "🔀", "main", ["abs", "full-body"], 40, 7, "none", undefined, "Plank still, jump the feet wide and back."),
  e("fb-squatpress", "Squat to Press", "🙌", "main", ["full-body", "legs"], 40, 6.5, "none", undefined, "Squat low, drive up and press overhead."),
  e("fb-fastfeet", "Fast Feet", "👟", "main", ["legs", "full-body"], 30, 8, "none", undefined, "Tiny quick steps, stay low and light."),
  e("fb-buttkick", "Butt Kicks", "🦵", "main", ["legs"], 30, 7, "none", undefined, "Heels to glutes, quick turnover."),
  e("fb-rope", "Jump Rope", "🪢", "main", ["full-body", "legs"], 40, 9, "none", undefined, "Small hops, wrists do the work."),
  e("fb-walk", "Brisk Walk in Place", "🚶‍♂️", "main", ["legs", "full-body"], 60, 4.3, "none", undefined, "Steady pace you could just about hold a conversation at."),
  e("fb-stepjack", "Step Jacks (No Jump)", "↔️", "main", ["full-body"], 40, 5, "none", undefined, "Step one foot out at a time — same arms, no impact."),
  e("fb-shadow", "Shadow Boxing", "🥊", "main", ["arms", "full-body"], 40, 7, "none", undefined, "Light on the feet, hands return to the chin."),

  // ---- abs / core ----
  e("ab-crunch", "Crunches", "🔥", "main", ["abs"], 40, 5, "none", undefined, "Ribs to hips, chin off the chest, slow on the way down."),
  e("ab-bicycle", "Bicycle Kicks", "🚲", "main", ["abs"], 40, 6, "none", undefined, "Opposite elbow to knee, extend the other leg long."),
  e("ab-legraise", "Leg Raises", "📐", "main", ["abs"], 40, 5, "none", undefined, "Lower back glued down, lower the legs slowly."),
  e("ab-russian", "Russian Twists", "🌀", "main", ["abs"], 40, 5.5, "none", undefined, "Lean back, rotate shoulder to shoulder."),
  e("ab-flutter", "Flutter Kicks", "🌊", "main", ["abs"], 40, 5, "none", undefined, "Small fast scissors, low back pressed down."),
  e("ab-deadbug", "Dead Bug", "🐞", "main", ["abs"], 30, 4, "none", undefined, "Opposite arm and leg reach out, ribs down."),
  e("ab-plank", "Elbow Plank", "🧱", "main", ["abs"], 40, 4.5, "none", undefined, "Straight line head to heels, squeeze the glutes."),
  e("ab-sideplank", "Side Plank", "📏", "main", ["abs"], 30, 4.5, "none", undefined, "Stack the shoulders and hips, lift tall."),
  e("ab-heeltap", "Heel Taps", "👣", "main", ["abs"], 40, 4.5, "none", undefined, "Crunch up slightly, tap heel to heel side to side."),
  e("ab-situp", "Sit-ups", "🔼", "main", ["abs"], 40, 5.5, "none", undefined, "All the way up, roll down one bone at a time."),
  e("ab-vup", "V-ups", "✅", "main", ["abs"], 40, 6, "none", undefined, "Arms and legs meet over the middle, then lower."),
  e("ab-hollow", "Hollow Hold", "🥄", "main", ["abs"], 30, 4.5, "none", undefined, "Low back pinned, shoulders and heels hover."),
  e("ab-reverse", "Reverse Crunch", "↩️", "main", ["abs"], 40, 5, "none", undefined, "Curl the hips off the floor, knees to chest."),
  e("ab-scissor", "Scissor Kicks", "✂️", "main", ["abs"], 40, 5, "none", undefined, "Legs cross over each other, keep them low."),
  e("ab-standtwist", "Standing Twists", "🔃", "main", ["abs"], 40, 4.5, "none", undefined, "Elbows wide, rotate from the waist — feet stay planted."),
  e("ab-birddog", "Bird Dogs", "🐦", "main", ["back", "abs"], 40, 4, "none", undefined, "Opposite arm and leg reach, no wobble in the hips."),

  // ---- chest / push ----
  e("ch-push", "Push-ups", "🔽", "main", ["chest", "arms"], 40, 7, "none", undefined, "Elbows ~45°, body one line, chest to the floor."),
  e("ch-knee", "Kneeling Push-Ups", "🦵", "main", ["chest", "arms"], 40, 5, "none", undefined, "Knees down, hips in line — same chest depth."),
  e("ch-wide", "Wide Push-ups", "↔️", "main", ["chest"], 40, 7, "none", undefined, "Hands wider than shoulders, chest leads."),
  e("ch-incline", "Incline Push-ups", "📈", "main", ["chest", "arms"], 40, 5, "none", undefined, "Hands on a chair or wall — easier angle."),
  e("ch-decline", "Decline Push-ups", "📉", "main", ["chest", "shoulders"], 40, 8, "none", undefined, "Feet raised — more load on the upper chest."),
  e("ch-diamond", "Diamond Push-ups", "💎", "main", ["arms", "chest"], 40, 8, "none", undefined, "Hands together under the chest, elbows tight."),
  e("ch-pike", "Pike Push-ups", "🔺", "main", ["shoulders"], 40, 7, "none", undefined, "Hips high, crown of the head towards the floor."),
  e("ch-wallpush", "Wall Push-ups", "🧱", "main", ["chest", "arms"], 40, 3.8, "none", undefined, "Stand arm's length from the wall — gentlest version."),
  e("ch-press", "Dumbbell Chest Press", "🏋️", "main", ["chest"], 45, 6, "dumbbells", undefined, "Lower to mid-chest, drive up without locking hard."),
  e("ch-fly", "Dumbbell Chest Flys", "🦋", "main", ["chest"], 45, 5, "dumbbells", undefined, "Soft elbows, wide arc, squeeze at the top."),
  e("ch-machine", "Chest Press Machine", "⚙️", "main", ["chest"], 45, 6, "gym", undefined, "Seat set so the handles sit at mid-chest."),

  // ---- shoulders / arms ----
  e("ar-dip", "Tricep Dips", "🪑", "main", ["arms"], 40, 6, "none", undefined, "Hands on a chair edge, elbows straight back."),
  e("ar-pulse", "Arm Pulses", "💪", "main", ["arms", "shoulders"], 30, 3.5, "none", undefined, "Arms wide at shoulder height, small fast pulses."),
  e("ar-tap", "Shoulder Taps", "👆", "main", ["shoulders", "abs"], 40, 5.5, "none", undefined, "Plank steady, tap opposite shoulder without rocking."),
  e("ar-wall", "Wall Walks", "🧗", "main", ["shoulders", "abs"], 40, 7, "none", undefined, "Feet walk up the wall as the hands walk in."),
  e("ar-curl", "Dumbbell Bicep Curls", "💪", "main", ["arms"], 45, 4.5, "dumbbells", undefined, "Elbows pinned to the ribs, no swinging."),
  e("ar-ohp", "Dumbbell Overhead Press", "🙌", "main", ["shoulders"], 45, 5.5, "dumbbells", undefined, "Brace the core, press straight overhead."),
  e("ar-kick", "Tricep Kickbacks", "🔙", "main", ["arms"], 45, 4.5, "dumbbells", undefined, "Hinge forward, upper arm still, extend back."),
  e("ar-lat", "Lateral Raises", "↔️", "main", ["shoulders"], 45, 4.5, "dumbbells", undefined, "Lift to shoulder height, lead with the elbows."),
  e("ar-front", "Front Raises", "⬆️", "main", ["shoulders"], 45, 4.5, "dumbbells", undefined, "Straight arms to shoulder height, no swinging."),
  e("ar-hammer", "Hammer Curls", "🔨", "main", ["arms"], 45, 4.5, "dumbbells", undefined, "Palms face in the whole way — easier on the wrists."),

  // ---- legs / butt ----
  e("lg-squat", "Bodyweight Squat", "🪑", "main", ["legs", "butt"], 40, 5.5, "none", undefined, "Chest up, knees track over the toes, hips back."),
  e("lg-jumpsquat", "Jump Squats", "⬆️", "main", ["legs", "full-body"], 40, 8, "none", undefined, "Squat then explode up, land soft and low."),
  e("lg-lunge", "Lunges", "🚶", "main", ["legs", "butt"], 40, 6, "none", undefined, "Long step, back knee towards the floor, torso tall."),
  e("lg-reverse", "Reverse Lunges", "↩️", "main", ["legs", "butt"], 40, 6, "none", undefined, "Step back instead of forward — kinder on the knees."),
  e("lg-side", "Side Lunges", "↔️", "main", ["legs", "butt"], 40, 6, "none", undefined, "Wide step out, sit into that hip, other leg straight."),
  e("lg-curtsy", "Curtsy Lunge", "💃", "main", ["butt", "legs"], 40, 6, "none", undefined, "Cross the back leg behind, hips square."),
  e("lg-sumo", "Sumo Squat", "🤼", "main", ["legs", "butt"], 40, 5.5, "none", undefined, "Wide stance, toes out, drop straight down."),
  e("lg-calf", "Calf Raises", "🦶", "main", ["legs"], 30, 3.5, "none", undefined, "Rise to the toes, pause, lower slow."),
  e("lg-wall", "Wall Sit", "🧱", "main", ["legs"], 40, 5, "none", undefined, "Thighs parallel, back flat on the wall, breathe."),
  e("lg-step", "Step-ups", "📶", "main", ["legs", "butt"], 40, 6, "none", undefined, "Drive through the whole front foot, stand tall."),
  e("lg-chairsit", "Chair Sit-to-Stand", "🪑", "main", ["legs", "butt"], 40, 4, "none", undefined, "Stand up and sit down without using the hands."),
  e("bt-bridge", "Glute Bridge", "🌉", "main", ["butt"], 40, 4.5, "none", undefined, "Heels close, squeeze the glutes, ribs down."),
  e("bt-single", "Single-Leg Bridge", "🦵", "main", ["butt"], 40, 5.5, "none", undefined, "One leg extended, hips stay level."),
  e("bt-donkey", "Donkey Kicks", "🐴", "main", ["butt"], 40, 4.5, "none", undefined, "Heel drives to the ceiling, back stays flat."),
  e("bt-hydrant", "Fire Hydrants", "🚰", "main", ["butt"], 40, 4.5, "none", undefined, "Open the knee out to the side, hips square."),
  e("bt-thrust", "Hip Thrust", "🍑", "main", ["butt"], 45, 5.5, "none", undefined, "Shoulders on a couch edge, drive the hips up."),
  e("bt-clam", "Clamshells", "🐚", "main", ["butt"], 30, 3.5, "none", undefined, "Side lying, heels together, open the top knee."),
  e("lg-goblet", "Goblet Squat", "🏺", "main", ["legs", "butt"], 45, 6.5, "dumbbells", undefined, "Weight at the chest, elbows inside the knees."),
  e("lg-dbllunge", "Dumbbell Lunges", "🏋️", "main", ["legs", "butt"], 45, 6.5, "dumbbells", undefined, "A weight in each hand, long step, tall torso."),
  e("lg-rdl", "Dumbbell RDL", "🪝", "main", ["legs", "butt", "back"], 45, 6, "dumbbells", undefined, "Hinge at the hips, flat back, feel the hamstrings."),
  e("lg-press", "Leg Press Machine", "⚙️", "main", ["legs", "butt"], 45, 6, "gym", undefined, "Feet shoulder-width, never lock the knees out."),

  // ---- back ----
  e("bk-superman", "Superman", "🦸", "main", ["back"], 30, 4, "none", undefined, "Lift chest and thighs, gaze down, neck long."),
  e("bk-snow", "Reverse Snow Angel", "❄️", "main", ["back", "shoulders"], 30, 4, "none", undefined, "Face down, sweep the arms overhead and back."),
  e("bk-cobra", "Cobra", "🐍", "main", ["back"], 30, 3, "none", undefined, "Elbows soft, lift the chest, shoulders away from ears."),
  e("bk-ext", "Back Extensions", "⬆️", "main", ["back"], 40, 4.5, "none", undefined, "Lift the chest off the floor, pause, lower slow."),
  e("bk-row", "Dumbbell Bent-over Rows", "🚣", "main", ["back", "arms"], 45, 6, "dumbbells", undefined, "Flat back, pull the elbows past the ribs."),
  e("bk-reneg", "Renegade Rows", "🎯", "main", ["back", "abs"], 45, 6.5, "dumbbells", undefined, "Plank wide, row one weight, hips still."),
  e("bk-pull", "Lat Pulldown", "🔽", "main", ["back", "arms"], 45, 5.5, "gym", undefined, "Chest proud, pull the bar to the collarbone."),

  // ---- desi kasrat ----
  e("dk-dand", "Dand (Hindu Push-up)", "🪷", "main", ["chest", "shoulders", "back"], 45, 7.5, "none", "desi", "Dive down and sweep the chest through, hips lift at the end."),
  e("dk-baithak", "Baithak (Hindu Squat)", "🤼", "main", ["legs", "butt"], 45, 7, "none", "desi", "Heels lift, arms swing back, breathe with the rhythm."),
  e("dk-surya", "Surya Namaskar Round", "🌅", "main", ["full-body"], 60, 5.5, "none", "desi", "One full 12-step round, one breath per movement."),
  e("dk-namaskar", "Namaskar Hold", "🙏", "main", ["full-body", "legs"], 30, 3, "none", "desi", "Deep squat, palms together, elbows inside the knees."),
  e("dk-rope", "Rope Skipping", "🪢", "main", ["full-body", "legs"], 60, 9, "none", "desi", "Light bounce, wrists turn the rope."),
  e("dk-gada", "Gada Swing", "🏵️", "main", ["shoulders", "back"], 45, 6.5, "dumbbells", "desi", "Mace or weight swings behind the head — start very light."),
  e("dk-mudgar", "Mudgar Swing", "🪀", "main", ["shoulders", "arms"], 45, 6.5, "dumbbells", "desi", "Club swings, control the arc, brace the core."),
  e("dk-dhakli", "Dhakli (Twisting Squat)", "🌀", "main", ["legs", "abs"], 45, 6.5, "none", "desi", "Squat and rotate, wrestler's rotational conditioning."),
  e("dk-kapal", "Kapalbhati Breathing", "🌬️", "cooldown", ["abs"], 40, 2.5, "none", "desi", "Sharp exhales through the nose, let the inhale happen."),

  // ---- pilates ----
  e("pi-hundred", "The Hundred", "💯", "main", ["abs"], 45, 4.5, "none", "pilates", "Legs at tabletop, pump the arms, breathe 5 in 5 out."),
  e("pi-rollup", "Roll Up", "🌀", "main", ["abs"], 40, 4, "none", "pilates", "Peel up bone by bone, reach past the toes."),
  e("pi-circle", "Single Leg Circle", "⭕", "main", ["legs", "abs"], 40, 3.8, "none", "pilates", "Hips anchored, draw a circle with one straight leg."),
  e("pi-ball", "Rolling Like a Ball", "⚽", "main", ["abs"], 30, 4, "none", "pilates", "Tight tuck, roll back to the shoulder blades and up."),
  e("pi-double", "Double Leg Stretch", "🙆", "main", ["abs"], 40, 4.5, "none", "pilates", "Reach arms and legs long, circle them back in."),
  e("pi-criss", "Criss-Cross", "❌", "main", ["abs"], 40, 5, "none", "pilates", "Slow bicycle with a full rotation each side."),
  e("pi-swan", "Swan", "🦢", "main", ["back"], 30, 3.5, "none", "pilates", "Lengthen forward then lift the chest, glutes soft."),
  e("pi-teaser", "Teaser", "🎯", "main", ["abs"], 40, 5, "none", "pilates", "Balance on the sit bones in a V, arms reaching."),
  e("pi-sidekick", "Side Kick Series", "🦵", "main", ["butt", "legs"], 40, 4.5, "none", "pilates", "Side lying, long body, kick forward and back."),
  e("pi-bridge", "Pilates Bridge", "🌉", "main", ["butt", "abs"], 40, 4.5, "none", "pilates", "Roll the spine up and down one vertebra at a time."),
  e("pi-swim", "Swimming", "🏊", "main", ["back", "butt"], 40, 4.5, "none", "pilates", "Face down, flutter opposite arm and leg."),
  e("pi-plankleg", "Pilates Plank Leg Lift", "📏", "main", ["abs", "butt"], 40, 5, "none", "pilates", "Plank still as one leg lifts — no hip drop."),

  // ---- strength yoga ----
  e("sy-chat", "Chaturanga", "🧘", "main", ["chest", "arms", "abs"], 30, 5.5, "none", "yoga", "Elbows hug the ribs, hover at 90°, shoulders level."),
  e("sy-war1", "Warrior I", "🏹", "main", ["legs", "shoulders"], 40, 4, "none", "yoga", "Front knee over ankle, hips forward, arms up."),
  e("sy-war2", "Warrior II", "⚔️", "main", ["legs", "shoulders"], 40, 4, "none", "yoga", "Arms wide, gaze past the front hand, sink the hips."),
  e("sy-war3", "Warrior III", "✈️", "main", ["legs", "abs", "back"], 30, 5, "none", "yoga", "Hinge to a T, standing leg strong, hips square."),
  e("sy-chair", "Chair Pose", "🪑", "main", ["legs", "shoulders"], 40, 5, "none", "yoga", "Sit back, weight in the heels, ribs knitted in."),
  e("sy-plank", "Plank Hold", "🧱", "main", ["abs", "shoulders"], 40, 4.5, "none", "yoga", "Push the floor away, one long line."),
  e("sy-boat", "Boat Pose", "🛶", "main", ["abs"], 30, 4.5, "none", "yoga", "Lift the chest, shins parallel, spine long not rounded."),
  e("sy-crow", "Crow Pose", "🐦", "main", ["arms", "abs"], 30, 5, "none", "yoga", "Knees high on the triceps, gaze forward, hips lift."),
  e("sy-bridge", "Bridge Pose", "🌉", "main", ["butt", "back"], 40, 4, "none", "yoga", "Press the feet down, lift the hips, chest to chin."),
  e("sy-tree", "Tree Pose", "🌳", "main", ["legs"], 40, 3, "none", "yoga", "Foot to the inner thigh, fix the gaze, breathe tall."),
  e("sy-triangle", "Triangle Pose", "📐", "main", ["legs", "abs"], 40, 3.5, "none", "yoga", "Long side body, reach down and open the chest."),
  e("sy-down", "Downward Dog Flow", "🐕", "main", ["full-body"], 40, 3.8, "none", "yoga", "Press hips up and back, pedal the heels."),

  // ---- dance / zumba ----
  e("dn-salsa", "Salsa Basic", "💃", "main", ["full-body", "legs"], 45, 5.5, "none", "dance", "Quick-quick-slow, let the hips answer the feet."),
  e("dn-mer", "Merengue March", "🎵", "main", ["full-body", "legs"], 45, 5.5, "none", "dance", "March with the hips, weight fully into each step."),
  e("dn-cumbia", "Cumbia Step", "🪘", "main", ["full-body", "legs"], 45, 5.5, "none", "dance", "Drag one foot back, rock the weight, alternate."),
  e("dn-reg", "Reggaeton Bounce", "🔊", "main", ["full-body"], 45, 6.5, "none", "dance", "Soft knees, bounce on the beat, drop the shoulders."),
  e("dn-grape", "Grapevine", "🍇", "main", ["legs", "full-body"], 45, 5.5, "none", "dance", "Side, behind, side, tap — then reverse."),
  e("dn-hip", "Hip Rolls", "🌀", "main", ["abs", "butt"], 40, 4.5, "none", "dance", "Big slow circles from the hips, ribs stay quiet."),
  e("dn-step", "Step Touch", "👟", "main", ["full-body"], 40, 5, "none", "dance", "Step out, touch in, add the arms when it feels easy."),
  e("dn-bhangra", "Bhangra Hop", "🪅", "main", ["full-body", "shoulders"], 45, 7, "none", "dance", "Bounce on one leg, shoulders and arms up and loud."),
  e("dn-shimmy", "Shoulder Shimmy", "✨", "main", ["shoulders"], 30, 4, "none", "dance", "Shoulders alternate fast, everything else still."),
  e("dn-jump", "Jump & Clap", "🙌", "main", ["full-body"], 40, 7, "none", "dance", "Jump wide and clap overhead on the beat."),

  // ---- somatic (gentle, nervous-system) ----
  e("so-pelvic", "Pelvic Tilts", "🔄", "main", ["abs", "back"], 40, 2.5, "none", "somatic", "Rock the pelvis slowly, notice the low back soften."),
  e("so-wave", "Spinal Wave", "🌊", "main", ["back"], 40, 2.6, "none", "somatic", "Move through the spine one segment at a time, unhurried."),
  e("so-rock", "Gentle Rocking", "🍃", "main", ["full-body"], 40, 2.4, "none", "somatic", "Knees to chest, rock side to side, let the floor massage."),
  e("so-shoulder", "Shoulder Release", "💆", "main", ["shoulders", "back"], 40, 2.4, "none", "somatic", "Slow shoulder rolls, pause where it feels stuck."),
  e("so-side", "Side Curl", "🌙", "main", ["abs", "back"], 40, 2.6, "none", "somatic", "Curl slowly to one side, feel the ribs open on the other."),
  e("so-armfloat", "Arm Float", "🕊️", "main", ["shoulders", "arms"], 40, 2.5, "none", "somatic", "Let the arm drift up on the inhale, heavy on the exhale."),
  e("so-reach", "Reach & Yawn", "🙆", "main", ["full-body"], 40, 2.5, "none", "somatic", "A whole-body stretch like waking up — follow the impulse."),
  e("so-hip", "Hip Rocking", "🦴", "main", ["butt", "legs"], 40, 2.5, "none", "somatic", "Sway the hips gently, let the lower back release."),
  e("so-neck", "Neck Melt", "🫧", "main", ["back"], 40, 2.3, "none", "somatic", "Tiny slow head movements, tension leaving with each exhale."),
  e("so-rest", "Constructive Rest", "🛌", "cooldown", ["full-body"], 60, 1.8, "none", "somatic", "Knees up, feet down, let gravity do the work."),

  // ---- classics (bodyweight staples) ----
  e("cl-sapate", "Sapate (Burpees)", "💥", "main", ["full-body"], 40, 8, "none", "classic", "Squat, hands down, hop back, chest to floor, spring up."),
  e("cl-halfdand", "Half Dand (Half-Burpees)", "🔽", "main", ["full-body"], 40, 6.5, "none", "classic", "A burpee without the push-up — squat, step or hop back, stand."),
  e("cl-hindu", "Hindu Push-ups", "🪷", "main", ["chest", "shoulders", "back"], 45, 7.5, "none", "classic", "Dive down and sweep the chest through, hips lift at the end."),
  e("cl-military", "Military Push-ups", "🎖️", "main", ["chest", "arms"], 40, 7, "none", "classic", "Elbows tucked close to the ribs, body one rigid line."),
  e("cl-jack", "Jumping Jacks", "⭐", "main", ["full-body"], 40, 6, "none", "classic", "Land soft, arms all the way overhead."),
  e("cl-squat", "Squats", "🪑", "main", ["legs", "butt"], 40, 5.5, "none", "classic", "Chest up, knees track the toes, hips back and down."),
  e("cl-jumpsquat", "Jumping Squats", "⬆️", "main", ["legs", "full-body"], 40, 8, "none", "classic", "Squat then explode up, land soft and low."),
  e("cl-lunge", "Lunges", "🚶", "main", ["legs", "butt"], 40, 6, "none", "classic", "Long step, back knee towards the floor, torso tall."),
  e("cl-plank", "Plank", "🧱", "main", ["abs"], 40, 4.5, "none", "classic", "Straight line head to heels, squeeze the glutes."),
  e("cl-situp", "Sit-ups & Crunches", "🔼", "main", ["abs"], 40, 5.5, "none", "classic", "Curl all the way up, roll down slow, chin off the chest."),
  e("cl-skip", "Skipping Rope", "🪢", "main", ["full-body", "legs"], 40, 9, "none", "classic", "Small bounces, wrists turn the rope, stay light."),

  // ---- cycling (indoor bike) ----
  e("cy-easy", "Easy Spin", "🚲", "main", ["legs", "full-body"], 60, 5, "none", "cycling", "Light resistance, spin the legs to warm the joints."),
  e("cy-steady", "Steady Ride", "🚴", "main", ["legs", "full-body"], 90, 7, "none", "cycling", "Moderate resistance you can hold a sentence at."),
  e("cy-tempo", "Tempo Ride", "💨", "main", ["legs", "full-body"], 75, 8.5, "none", "cycling", "Comfortably hard — breathing deep but controlled."),
  e("cy-sprint", "Sprint Intervals", "⚡", "main", ["legs", "full-body"], 30, 11, "none", "cycling", "All-out for the interval, then spin easy to recover."),
  e("cy-hill", "Hill Climb", "⛰️", "main", ["legs", "butt"], 90, 9, "none", "cycling", "Heavy resistance, stay seated, drive through the heels."),
  e("cy-stand", "Standing Climb", "🧗", "main", ["legs", "butt"], 45, 9.5, "none", "cycling", "Out of the saddle, sway the bike gently, hips back."),
  e("cy-cadence", "Cadence Pushes", "🔁", "main", ["legs"], 45, 8, "none", "cycling", "Light gear, spin the legs as fast as stays smooth."),
  e("cy-recover", "Recovery Spin", "🌿", "cooldown", ["legs"], 60, 3.5, "none", "cycling", "Very light resistance, let the heart rate come down."),

  // ---- running (treadmill) ----
  e("rn-jog", "Easy Jog", "🏃", "main", ["legs", "full-body"], 90, 7, "none", "running", "Conversational pace, land under the hips, relax the shoulders."),
  e("rn-steady", "Steady Run", "🏃‍♂️", "main", ["legs", "full-body"], 90, 9, "none", "running", "A pace you could hold for a few km, breathing rhythmic."),
  e("rn-tempo", "Tempo Run", "💨", "main", ["legs", "full-body"], 75, 10.5, "none", "running", "Comfortably hard, smooth turnover, quiet feet."),
  e("rn-sprint", "Sprint Intervals", "⚡", "main", ["legs", "full-body"], 30, 13, "none", "running", "Fast for the interval, then walk or jog to recover."),
  e("rn-incline", "Incline Push", "📈", "main", ["legs", "butt"], 90, 9.5, "none", "running", "Raise the incline, shorten the stride, drive the arms."),
  e("rn-hill", "Hill Repeats", "⛰️", "main", ["legs", "butt"], 60, 11, "none", "running", "Hard up the hill, easy recovery between efforts."),
  e("rn-stride", "Stride Outs", "👟", "main", ["legs"], 30, 10, "none", "running", "Build to near-sprint over the interval, tall and relaxed."),
  e("rn-walk", "Recovery Walk", "🚶", "cooldown", ["legs"], 60, 3.5, "none", "running", "Slow the belt right down, breathe and reset."),

  // ---- walking (indoor walking) ----
  e("wk-warm", "Warm-up Walk", "🚶", "main", ["legs", "full-body"], 60, 3.3, "none", "walking", "Easy pace, let the joints loosen and the breath settle."),
  e("wk-brisk", "Brisk Walk", "🚶‍♀️", "main", ["legs", "full-body"], 120, 4.3, "none", "walking", "Purposeful pace, arms swinging, you could just about chat."),
  e("wk-power", "Power Walk", "💪", "main", ["legs", "butt"], 90, 5, "none", "walking", "Fast steps, squeeze the glutes, pump the arms."),
  e("wk-incline", "Incline Walk", "📈", "main", ["legs", "butt"], 90, 6, "none", "walking", "Raise the incline, lean slightly forward from the ankles."),
  e("wk-interval", "Interval Walk", "⏱️", "main", ["legs", "full-body"], 60, 5.5, "none", "walking", "Alternate fast and easy — great for building fitness."),
  e("wk-march", "High-Knee March", "🦵", "main", ["legs", "abs"], 45, 5, "none", "walking", "Drive the knees up as you walk, engage the core."),
  e("wk-stroll", "Recovery Stroll", "🌿", "cooldown", ["legs"], 60, 2.8, "none", "walking", "Gentle pace to bring the heart rate down."),

  // ---- Desi Kasrat (curated akhara catalogue) ----
  // dands (push variations)
  e("dz-basicdand", "Basic Dand", "🪷", "main", ["chest", "shoulders", "back"], 45, 7.5, "none", "desi", "Classic dand — dive through, sweep the chest, hips rise at the end."),
  e("dz-halfdand", "Half Dand", "🔽", "main", ["chest", "arms"], 40, 5.5, "none", "desi", "Half-range dand — builds the strength to go full depth."),
  e("dz-hindupush", "Hindu Push-up", "🐍", "main", ["chest", "shoulders", "back"], 45, 7.5, "none", "desi", "Flow down and forward, cobra at the top, hips back to start."),
  e("dz-mishradand", "Mishra Dand", "🔀", "main", ["chest", "shoulders"], 45, 8, "none", "desi", "Mixed-tempo dand blending straight and circular motion."),
  e("dz-rammurti", "Ram Murti Dand", "💪", "main", ["chest", "back"], 45, 8.5, "none", "desi", "Wide, deep wrestler's dand — full range and powerful."),
  e("dz-hanuman", "Hanuman Dand", "🦿", "main", ["chest", "legs"], 45, 8.5, "none", "desi", "Long lunging dand — big stretch through the hips and chest."),
  e("dz-dandflow", "Dand Flow", "🌊", "main", ["chest", "full-body"], 45, 6.5, "none", "desi", "Continuous flowing dands, breath linked to movement."),
  e("dz-highrepdand", "High-Rep Dands", "🔥", "main", ["chest", "shoulders"], 45, 8, "none", "desi", "Keep the count high — endurance for the shoulders and chest."),
  // baithaks (squat variations)
  e("dz-baithak", "Baithak", "🤼", "main", ["legs", "butt"], 45, 7, "none", "desi", "Hindu squat — heels lift, arms swing, breathe with the rhythm."),
  e("dz-jumpbaithak", "Jump Baithak", "⬆️", "main", ["legs", "full-body"], 40, 8, "none", "desi", "Explosive baithak — drive up off the floor each rep."),
  e("dz-deepbaithak", "Deep Baithaks", "🪑", "main", ["legs", "butt"], 45, 7, "none", "desi", "Full depth, slow and controlled, chest tall."),
  e("dz-highrepbaithak", "High-Rep Baithaks", "🔥", "main", ["legs"], 45, 7.5, "none", "desi", "Wrestler's endurance — high reps, steady breath."),
  // holds & legs
  e("dz-deepsquat", "Deep Squat Hold", "🧘", "main", ["legs"], 45, 4.5, "none", "desi", "Sit into a full squat and hold, heels down, chest open."),
  e("dz-split", "Split Squats", "🚶", "main", ["legs", "butt"], 40, 6, "none", "desi", "Long stance, drop the back knee straight down."),
  e("dz-wallsit", "Wall Sit", "🧱", "main", ["legs"], 40, 5, "none", "desi", "Thighs parallel, back flat on the wall, breathe."),
  e("dz-calf", "Calf Raises", "🦶", "main", ["legs"], 30, 3.5, "none", "desi", "Rise to the toes, pause, lower slow."),
  e("dz-singleleg", "Single-Leg Balance", "🦩", "main", ["legs"], 40, 3, "none", "desi", "Stand tall on one leg, fix the gaze, breathe."),
  // carries & implements
  e("dz-farmerwalk", "Farmer Walk", "🧳", "main", ["full-body", "back"], 45, 6, "none", "desi", "Heavy in both hands, tall posture, walk with control."),
  e("dz-farmercarry", "Farmer Carry", "🧳", "main", ["full-body", "back"], 45, 6, "none", "desi", "Loaded carry — grip hard, brace the core, stay tall."),
  e("dz-sandbag", "Sandbag Carry", "🛢️", "main", ["full-body", "back", "legs"], 45, 6.5, "none", "desi", "Hug or shoulder the bag, brace, walk steady."),
  e("dz-ropepull", "Rope Pull", "🪢", "main", ["back", "arms"], 45, 6.5, "none", "desi", "Hand over hand, drive the elbows, engage the lats."),
  e("dz-gada", "Gada Swings", "🏵️", "main", ["shoulders", "back"], 45, 6.5, "none", "desi", "Mace swings behind the head — start light, control the arc."),
  e("dz-gada360", "360° Gada Swing", "🔄", "main", ["shoulders", "back"], 45, 7, "none", "desi", "Full circle behind the head — smooth, no jerks."),
  e("dz-halo", "Gada Halos", "🌀", "main", ["shoulders"], 40, 4.5, "none", "desi", "Circle the mace around the head — great shoulder prep."),
  e("dz-rotswing", "Rotational Swings", "🌪️", "main", ["abs", "shoulders"], 45, 6, "none", "desi", "Swing across the body, rotate from the waist."),
  e("dz-gadaflow", "Gada Flow", "💫", "main", ["shoulders", "full-body"], 45, 6.5, "none", "desi", "Link swings and halos into one continuous flow."),
  e("dz-mudgar", "Mudgar Swings", "🪀", "main", ["shoulders", "arms"], 45, 6.5, "none", "desi", "Club swings — control the arc, brace the core."),
  // crawls & animal
  e("dz-bear", "Bear Crawl", "🐻", "main", ["full-body", "abs"], 40, 6.5, "none", "desi", "Knees hover, move opposite hand and foot, hips low."),
  e("dz-crab", "Crab Walk", "🦀", "main", ["full-body", "arms"], 40, 6, "none", "desi", "Hips up, walk on hands and feet facing the ceiling."),
  e("dz-duck", "Duck Walk", "🦆", "main", ["legs"], 40, 6.5, "none", "desi", "Stay in a deep squat and walk — brutal on the quads."),
  e("dz-monkey", "Monkey Walk", "🐒", "main", ["full-body"], 40, 6, "none", "desi", "Wide, low side-to-side hops on the hands and feet."),
  e("dz-leopard", "Leopard Crawl", "🐆", "main", ["full-body", "abs"], 40, 7, "none", "desi", "Low crawl, chest close to the floor, controlled."),
  e("dz-frogjump", "Frog Jumps", "🐸", "main", ["legs", "full-body"], 40, 8, "none", "desi", "Deep squat then jump forward, land soft."),
  // conditioning
  e("dz-fastmarch", "Fast March", "🥾", "main", ["legs", "full-body"], 40, 5, "none", "desi", "Quick high-tempo march on the spot, pump the arms."),
  e("dz-sidestep", "Side Steps", "↔️", "main", ["legs"], 40, 5, "none", "desi", "Step side to side low and quick, stay light."),
  e("dz-highknee", "High Knees", "🏃", "main", ["legs", "full-body"], 40, 8, "none", "desi", "Knees to hip height, fast, on the balls of the feet."),
  e("dz-lateral", "Lateral Shuffle", "🔀", "main", ["legs", "full-body"], 40, 6.5, "none", "desi", "Stay low, shuffle side to side, don't cross the feet."),
  e("dz-burpee", "Burpees", "💥", "main", ["full-body"], 40, 8, "none", "desi", "Squat, hands down, hop back, chest down, spring up."),
  e("dz-jumpsquat", "Jump Squats", "⬆️", "main", ["legs", "full-body"], 40, 8, "none", "desi", "Squat then explode up, land soft and low."),
  e("dz-sprint", "Sprint Finishers", "⚡", "main", ["full-body", "legs"], 30, 12, "none", "desi", "All-out sprint — empty the tank to finish."),
  e("dz-skip", "Rope Skipping", "🪢", "main", ["full-body", "legs"], 45, 9, "none", "desi", "Light bounce, wrists turn the rope."),
  // core & planks
  e("dz-plank", "Plank", "🧱", "main", ["abs"], 40, 4.5, "none", "desi", "One straight line head to heels, squeeze the glutes."),
  e("dz-hinduplank", "Hindu Plank", "🐍", "main", ["abs", "shoulders"], 40, 5, "none", "desi", "Hold the bottom of a dand — chest forward, hips low."),
  e("dz-sideplank", "Side Plank", "📏", "main", ["abs"], 30, 4.5, "none", "desi", "Stack the shoulders and hips, lift tall, hold."),
  e("dz-birddog", "Bird Dog", "🐦", "main", ["back", "abs"], 40, 4, "none", "desi", "Opposite arm and leg reach, hips steady."),
  e("dz-shouldertap", "Shoulder Taps", "👆", "main", ["shoulders", "abs"], 40, 5.5, "none", "desi", "Plank steady, tap opposite shoulder without rocking."),
  // warm-ups
  e("dz-wrist", "Wrist Conditioning", "🙌", "warmup", ["arms"], 30, 3, "none", "desi", "Circle and load the wrists gently — vital before dands."),
  e("dz-neck", "Neck Rotation", "🙆", "warmup", ["back"], 30, 2.5, "none", "desi", "Slow half-circles, ear to chest to ear. Never force."),
  e("dz-ankle", "Ankle Mobility", "🦶", "warmup", ["legs"], 30, 2.8, "none", "desi", "Circle the ankles and rock the feet to prep the baithaks."),
  e("dz-arm", "Arm Circles", "🔄", "warmup", ["shoulders", "arms"], 30, 3, "none", "desi", "Small circles forward, then backward. Shoulders relaxed."),
  e("dz-shrug", "Shoulder Rolls", "🤷", "warmup", ["shoulders"], 30, 2.5, "none", "desi", "Roll the shoulders back and down, slow and full."),
  e("dz-hipopen", "Hip Openers", "🔁", "warmup", ["legs", "butt"], 30, 3, "none", "desi", "Lift a knee and open the hip in a slow circle."),
  e("dz-wallangel", "Wall Angels", "😇", "warmup", ["shoulders", "back"], 40, 3, "none", "desi", "Back to the wall, slide the arms up and down, ribs down."),
  e("dz-catcow", "Cat-Cow", "🐈", "warmup", ["back"], 30, 2.5, "none", "desi", "On all fours, arch and round with the breath."),
  // stretches & breath
  e("dz-cobra", "Cobra Stretch", "🐍", "cooldown", ["back"], 30, 3, "none", "desi", "Elbows soft, lift the chest, shoulders away from ears."),
  e("dz-child", "Child's Pose", "🧎", "cooldown", ["back"], 40, 2, "none", "desi", "Knees wide, hips to heels, arms long."),
  e("dz-frogstretch", "Frog Stretch", "🐸", "cooldown", ["legs"], 40, 2.3, "none", "desi", "Knees wide, rock back gently, open the hips."),
  e("dz-butterfly", "Butterfly Stretch", "🦋", "cooldown", ["legs"], 40, 2.2, "none", "desi", "Soles together, knees heavy, spine tall."),
  e("dz-breath", "Deep Breathing", "🌬️", "cooldown", ["full-body"], 40, 1.8, "none", "desi", "Long slow breaths — settle the heart rate and mind."),
  // additions
  e("dz-namaskardand", "Namaskar Dand", "🙏", "main", ["chest", "full-body"], 45, 7, "none", "desi", "Dand flowing into a namaskar — chest sweeps, palms meet at the heart."),
  e("dz-paltidand", "Palti Dand", "🔄", "main", ["chest", "back", "full-body"], 45, 8, "none", "desi", "Rolling dand — flow down, roll through the spine, come back up."),
  e("dz-scorpiondand", "Scorpion Dand", "🦂", "main", ["back", "chest"], 45, 8.5, "none", "desi", "Deep backbend dand — lift one leg high like a scorpion's tail."),
  e("dz-ektangi", "Ek-tangi Baithak", "🦵", "main", ["legs", "butt"], 45, 8, "none", "desi", "Single-leg baithak, pistol-style — control all the way down and up."),
  e("dz-namaskarbaithak", "Namaskar Baithak", "🙏", "main", ["legs", "full-body"], 45, 6.5, "none", "desi", "Squat deep, palms together, elbows press the knees open."),
  e("dz-closebaithak", "Close Leg Baithak", "🦵", "main", ["legs", "butt"], 45, 6.5, "none", "desi", "Feet together, squat straight down — extra load on the quads and balance."),
  e("dz-bridge", "Wrestler's Bridge", "🌉", "main", ["back", "shoulders"], 40, 5, "none", "desi", "Karela — bridge gently onto the crown to build a strong neck and spine."),
];

/** The 11 classic bodyweight staples, in order, for the Classics tab. */
export const CLASSICS: Exercise[] = EXERCISES.filter((x) => x.tag === "classic");

export function getExercise(id: string): Exercise | undefined { return EXERCISES.find((x) => x.id === id); }

/* ================= Focus → body parts ================= */

export const FOCUS_LIST: { id: Focus; label: string }[] = [
  { id: "full-body", label: "Full body" },
  { id: "upper-body", label: "Upper body" },
  { id: "lower-body", label: "Lower body" },
  { id: "endurance", label: "Endurance" },
  { id: "arms", label: "Arms" },
  { id: "legs", label: "Legs" },
  { id: "chest", label: "Chest" },
  { id: "shoulders", label: "Shoulder" },
  { id: "abs", label: "Abs" },
  { id: "core", label: "Core" },
];
export function focusLabel(f: Focus): string { return FOCUS_LIST.find((x) => x.id === f)?.label ?? f; }

const FOCUS_PARTS: Record<Focus, BodyPart[]> = {
  "full-body": ["full-body"],
  "upper-body": ["chest", "arms", "shoulders", "back"],
  "lower-body": ["legs", "butt"],
  endurance: ["full-body", "legs"],
  arms: ["arms", "shoulders"],
  legs: ["legs", "butt"],
  chest: ["chest"],
  shoulders: ["shoulders"],
  abs: ["abs"],
  core: ["abs", "back"],
};
export function partsOfFocus(f: Focus): BodyPart[] { return FOCUS_PARTS[f]; }

/* ================= Buckets ================= */

export type Group = "styles" | "goal" | "programs";

export interface Bucket {
  id: string;
  label: string;
  emoji: string;
  blurb: string;
  group: Group;
  tag?: string;          // desi | pilates | yoga | dance | somatic
  mainKind?: Kind;       // stretching buckets use cool-down moves as the main work
  minMet?: number;       // HIIT-style: only spicy moves
  maxMet?: number;       // senior / diabetic: keep it gentle
  music?: boolean;       // dance / zumba show the music launcher
  curated?: boolean;     // sessions are hand-authored, shown grouped
  groups?: readonly string[]; // ordered sub-group labels for a curated bucket
}

export const BUCKETS: Bucket[] = [
  // ---- Styles ----
  { id: "desi-kasrat", label: "Desi Kasrat", emoji: "🪷", blurb: "Dand, baithak, gada — the akhara way.", group: "styles", tag: "desi", curated: true, groups: ["Foundations", "Strength", "Conditioning", "Mobility & Control", "Full-Body"] },
  { id: "gym", label: "Gym", emoji: "🏋️", blurb: "Dumbbell and machine routines for the gym floor.", group: "styles" },
  { id: "calisthenics", label: "Calisthenics", emoji: "🤸", blurb: "Master your own bodyweight.", group: "styles" },
  { id: "pilates", label: "Pilates", emoji: "🩰", blurb: "Control, posture and long, lean strength.", group: "styles", tag: "pilates" },
  { id: "hiit", label: "HIIT", emoji: "⚡", blurb: "Short, intense bursts for maximum burn.", group: "styles", minMet: 6.5 },
  { id: "cycling", label: "Cycling / Indoor Bike", emoji: "🚴", blurb: "Spin, sprint and climb on the bike.", group: "styles", tag: "cycling" },
  { id: "running", label: "Running / Treadmill", emoji: "🏃", blurb: "Jog, run and interval on the treadmill.", group: "styles", tag: "running" },
  { id: "walking", label: "Walking / Indoor Walking", emoji: "🚶", blurb: "Low-impact walking workouts, indoors.", group: "styles", tag: "walking" },
  { id: "zumba", label: "Zumba", emoji: "🕺", blurb: "Latin-inspired cardio dance party.", group: "styles", tag: "dance", music: true },
  { id: "dance", label: "Dancing Workouts", emoji: "💃", blurb: "Sweat without noticing you're working out.", group: "styles", tag: "dance", music: true },
  { id: "somatic", label: "Somatic", emoji: "🌀", blurb: "Slow, gentle movement to calm the nervous system.", group: "styles", tag: "somatic", maxMet: 3 },

  // ---- Goal ----
  { id: "lose-weight", label: "Lose Weight", emoji: "🔥", blurb: "Burn calories and hold on to muscle.", group: "goal" },
  { id: "diabetic", label: "Diabetic Friendly", emoji: "🩺", blurb: "Steady, gentle sessions that help glucose control.", group: "goal", maxMet: 6 },
  { id: "belly-fat", label: "Belly Fat", emoji: "🎯", blurb: "Core work paired with fat-burning cardio.", group: "goal" },
  { id: "endurance", label: "Endurance", emoji: "🫀", blurb: "Build stamina that lasts all day.", group: "goal" },
  { id: "flexibility", label: "Flexibility", emoji: "🙆", blurb: "Move freely, undo the stiffness.", group: "goal", mainKind: "cooldown" },
  { id: "toning", label: "Toning", emoji: "✨", blurb: "Sculpt and define without bulking up.", group: "goal" },

  // ---- Programs ----
  { id: "beginner", label: "Beginner Fitness", emoji: "🌱", blurb: "Your first few weeks, properly paced.", group: "programs", maxMet: 6.5 },
  { id: "daily15", label: "15-Min Daily Workout", emoji: "⏱️", blurb: "One short session for every day of the week.", group: "programs" },
  { id: "senior", label: "Senior Fitness", emoji: "🧓", blurb: "Gentle, safe and joint-friendly.", group: "programs", maxMet: 5 },
  { id: "stretching", label: "Stretching", emoji: "🧘", blurb: "Loosen up, wind down, recover.", group: "programs", mainKind: "cooldown" },
  { id: "abs-program", label: "Abs Program", emoji: "🔥", blurb: "Carve a strong, stable core.", group: "programs" },
  { id: "cardio", label: "Cardio", emoji: "🫀", blurb: "Get the heart pumping and burn calories.", group: "programs" },
];

export const GROUPS: { id: Group; label: string; sub: string }[] = [
  { id: "styles", label: "Styles", sub: "How you like to train." },
  { id: "goal", label: "Goal", sub: "What you're working towards." },
  { id: "programs", label: "Programs", sub: "Follow-along sets for where you are." },
];

export const bucketsInGroup = (g: Group) => BUCKETS.filter((b) => b.group === g);
export function bucketOf(id: string): Bucket | undefined { return BUCKETS.find((b) => b.id === id); }

/* ================= Sessions ================= */

export interface Session {
  id: string; bucket: string; title: string; focus: Focus;
  minutes: number; level: Level; equip: Equip;
  exIds?: string[];   // curated sessions play this exact list (in order)
  group?: string;     // curated sub-group label (e.g. "Foundations")
}

type Spec = [focus: Focus, title: string, minutes: number, level: Level, equip?: Equip];

const SPECS: Record<string, Spec[]> = {
  gym: [
    ["full-body", "Full-Body Dumbbell", 25, "beginner", "dumbbells"],
    ["upper-body", "Push Day — Chest & Arms", 30, "medium", "dumbbells"],
    ["upper-body", "Pull Day — Back & Biceps", 30, "medium", "dumbbells"],
    ["lower-body", "Leg Day — Quads & Glutes", 35, "advanced", "dumbbells"],
    ["arms", "Arm Pump", 20, "medium", "dumbbells"],
    ["chest", "Chest Builder", 25, "medium", "gym"],
    ["shoulders", "Shoulder Sculpt", 20, "medium", "dumbbells"],
    ["abs", "Weighted Core", 15, "medium", "dumbbells"],
    ["endurance", "Gym Conditioning Circuit", 25, "medium", "dumbbells"],
    ["legs", "Machine Leg Session", 30, "beginner", "gym"],
  ],
  calisthenics: [
    ["full-body", "Full Body Basics", 15, "beginner"],
    ["core", "Core Conditioning", 15, "beginner"],
    ["upper-body", "Upper Body Set", 15, "beginner"],
    ["full-body", "Dynamic Movement Flow", 15, "beginner"],
    ["lower-body", "Legs & Glutes Set", 15, "medium"],
    ["chest", "Push Strength", 20, "medium"],
    ["abs", "Ab Circuit", 12, "medium"],
    ["arms", "Arms & Shoulders", 18, "medium"],
    ["endurance", "Full Body Burn", 25, "advanced"],
    ["full-body", "Skill & Control", 30, "advanced"],
  ],
  pilates: [
    ["full-body", "Beginner Mat Basics", 12, "beginner"],
    ["core", "Core Pilates", 18, "medium"],
    ["core", "Posture & Core Reset", 15, "beginner"],
    ["lower-body", "Pilates Glutes & Legs", 20, "medium"],
    ["upper-body", "Upper Body & Posture", 18, "beginner"],
    ["abs", "Deep Core Control", 20, "advanced"],
    ["full-body", "Classical Mat Flow", 25, "medium"],
    ["endurance", "Pilates Flow & Burn", 25, "medium"],
  ],
  hiit: [
    ["full-body", "Beginner HIIT", 12, "beginner"],
    ["full-body", "Tabata Blast", 10, "advanced"],
    ["abs", "HIIT Abs Melt", 12, "medium"],
    ["full-body", "Total-Body HIIT", 20, "advanced"],
    ["lower-body", "HIIT Legs & Glutes", 15, "medium"],
    ["upper-body", "Upper Body HIIT", 15, "medium"],
    ["core", "Core HIIT Finisher", 10, "medium"],
    ["endurance", "20-Minute Burner", 20, "advanced"],
  ],
  "lose-weight": [
    ["full-body", "Beginner Weight-Loss Start", 15, "beginner"],
    ["full-body", "Fat-Burn Full Body", 20, "medium"],
    ["endurance", "Calorie Crusher Cardio", 25, "medium"],
    ["endurance", "Low-Impact Fat Burn", 20, "beginner"],
    ["lower-body", "Lower Body Burn", 20, "medium"],
    ["upper-body", "Upper Body Shred", 18, "medium"],
    ["core", "Core & Cardio Combo", 15, "medium"],
    ["full-body", "Metabolism Booster", 20, "advanced"],
  ],
  diabetic: [
    ["full-body", "Post-Meal Walk & Move", 15, "beginner"],
    ["endurance", "Steady Aerobic Session", 20, "beginner"],
    ["lower-body", "Leg Strength for Glucose Control", 18, "beginner"],
    ["full-body", "Gentle Full Body Strength", 20, "beginner"],
    ["core", "Seated Core & Breathing", 12, "beginner"],
    ["upper-body", "Light Upper Body", 15, "beginner"],
    ["endurance", "Interval Walk (Low Impact)", 20, "medium"],
    ["full-body", "Evening Sugar-Balance Routine", 15, "beginner"],
  ],
  "belly-fat": [
    ["full-body", "Standing Belly Blast", 12, "beginner"],
    ["core", "Belly Fat Burner", 20, "medium"],
    ["abs", "Waistline Focus", 15, "medium"],
    ["abs", "Lower Belly Focus", 15, "medium"],
    ["core", "Deep Core & Obliques", 18, "medium"],
    ["endurance", "Cardio Belly Burn", 20, "medium"],
    ["full-body", "Low-Impact Belly Burn", 15, "beginner"],
    ["core", "Advanced Midsection Shred", 20, "advanced"],
  ],
  endurance: [
    ["endurance", "Cardio Base Builder", 20, "beginner"],
    ["endurance", "Breath & Stamina", 15, "beginner"],
    ["endurance", "Interval Stamina", 20, "medium"],
    ["full-body", "Full Body Endurance Circuit", 25, "medium"],
    ["lower-body", "Leg Endurance", 20, "medium"],
    ["core", "Core Endurance Holds", 15, "medium"],
    ["endurance", "Long Steady Session", 30, "medium"],
    ["full-body", "Advanced Conditioning", 30, "advanced"],
  ],
  flexibility: [
    ["full-body", "Full Body Stretch", 12, "beginner"],
    ["full-body", "Morning Mobility Flow", 15, "beginner"],
    ["lower-body", "Deep Hip & Hamstring", 15, "beginner"],
    ["upper-body", "Shoulder & Chest Opener", 12, "beginner"],
    ["legs", "Legs & Ankles Mobility", 15, "beginner"],
    ["core", "Spine & Back Release", 12, "beginner"],
    ["full-body", "Evening Wind-Down Stretch", 15, "beginner"],
    ["full-body", "Deep Flexibility Session", 25, "medium"],
  ],
  toning: [
    ["full-body", "Beginner Tone Starter", 10, "beginner"],
    ["full-body", "Full-Body Tone", 20, "medium"],
    ["arms", "Sculpted Arms", 15, "medium"],
    ["arms", "Dumbbell Arm Tone", 18, "medium", "dumbbells"],
    ["lower-body", "Booty & Legs Tone", 18, "medium"],
    ["legs", "Lean Legs", 15, "medium"],
    ["abs", "Tight Core Tone", 12, "beginner"],
    ["upper-body", "Upper Body Definition", 18, "medium"],
    ["full-body", "Total Tone Circuit", 20, "advanced"],
  ],
  beginner: [
    ["full-body", "Day 1 — Full Body Intro", 12, "beginner"],
    ["lower-body", "Day 2 — Legs Basics", 12, "beginner"],
    ["upper-body", "Day 3 — Upper Body Basics", 12, "beginner"],
    ["core", "Day 4 — Core Basics", 10, "beginner"],
    ["endurance", "Day 5 — Easy Cardio", 15, "beginner"],
    ["full-body", "Day 6 — Full Body Repeat", 15, "beginner"],
    ["full-body", "Mobility & Recovery", 12, "beginner"],
    ["full-body", "Week 2 — Step It Up", 18, "medium"],
  ],
  daily15: [
    ["full-body", "Monday — Full Body 15", 15, "beginner"],
    ["lower-body", "Tuesday — Legs 15", 15, "medium"],
    ["upper-body", "Wednesday — Upper Body 15", 15, "medium"],
    ["core", "Thursday — Core 15", 15, "medium"],
    ["endurance", "Friday — Cardio 15", 15, "medium"],
    ["full-body", "Saturday — Total Body 15", 15, "medium"],
    ["full-body", "Sunday — Stretch & Reset", 15, "beginner"],
  ],
  senior: [
    ["full-body", "Morning Movement", 10, "beginner"],
    ["full-body", "Gentle Mobility", 15, "beginner"],
    ["upper-body", "Seated Upper Body", 12, "beginner"],
    ["lower-body", "Chair-Assisted Legs", 12, "beginner"],
    ["full-body", "Balance & Stability", 15, "beginner"],
    ["core", "Gentle Core & Posture", 12, "beginner"],
    ["endurance", "Easy Walking Workout", 20, "beginner"],
    ["full-body", "Joint-Friendly Strength", 18, "beginner"],
  ],
  stretching: [
    ["full-body", "Post-Workout Cool Down", 10, "beginner"],
    ["full-body", "Full Body Stretch", 12, "beginner"],
    ["lower-body", "Hips & Hamstrings", 15, "beginner"],
    ["upper-body", "Neck, Shoulders & Chest", 12, "beginner"],
    ["core", "Back & Spine Release", 12, "beginner"],
    ["legs", "Legs & Calves", 12, "beginner"],
    ["full-body", "Bedtime Stretch", 15, "beginner"],
    ["full-body", "Deep Stretch Session", 25, "medium"],
  ],
  cardio: [
    ["endurance", "Cardio Kickstart", 10, "beginner"],
    ["endurance", "Low-Impact Cardio", 15, "beginner"],
    ["full-body", "Fat-Burning Cardio", 20, "medium"],
    ["full-body", "Cardio & Core", 18, "medium"],
    ["legs", "Cardio Legs", 15, "medium"],
    ["endurance", "Steady Cardio Session", 25, "medium"],
    ["full-body", "HIIT Cardio Mix", 15, "advanced"],
    ["full-body", "Max Burn Cardio", 20, "advanced"],
  ],
  zumba: [
    ["full-body", "Beginner Zumba Steps", 12, "beginner"],
    ["full-body", "Zumba Express", 15, "beginner"],
    ["full-body", "Classic Zumba", 30, "beginner"],
    ["full-body", "Latin Cardio Party", 25, "medium"],
    ["core", "Zumba Core Blast", 18, "medium"],
    ["lower-body", "Zumba Toning Legs", 20, "medium"],
    ["full-body", "High-Energy Zumba", 30, "advanced"],
    ["full-body", "Zumba Cool-Down Dance", 12, "beginner"],
  ],
  dance: [
    ["full-body", "Quick Dance Break", 10, "beginner"],
    ["full-body", "Beginner Dance Basics", 12, "beginner"],
    ["full-body", "Dance Cardio Party", 20, "beginner"],
    ["full-body", "Bollywood Burn", 25, "medium"],
    ["full-body", "Bhangra Workout", 20, "medium"],
    ["full-body", "Freestyle Flow", 20, "medium"],
    ["lower-body", "Dance & Tone", 25, "medium"],
    ["full-body", "Hip-Hop Sweat", 25, "advanced"],
  ],
  cycling: [
    ["endurance", "Beginner Spin", 15, "beginner"],
    ["endurance", "Steady Ride", 25, "beginner"],
    ["endurance", "Interval Ride", 20, "medium"],
    ["endurance", "Hill Climb Ride", 30, "medium"],
    ["endurance", "Fat-Burn Cycle", 25, "medium"],
    ["legs", "Sprint Cycle HIIT", 15, "advanced"],
    ["endurance", "Endurance Ride", 40, "medium"],
  ],
  running: [
    ["endurance", "Beginner Treadmill", 15, "beginner"],
    ["endurance", "Walk-Run Intervals", 20, "beginner"],
    ["endurance", "Steady Run", 25, "medium"],
    ["endurance", "Tempo Run", 25, "medium"],
    ["endurance", "Incline Endurance", 30, "medium"],
    ["legs", "Sprint Intervals", 15, "advanced"],
    ["endurance", "5K Builder", 30, "medium"],
  ],
  walking: [
    ["endurance", "Gentle Indoor Walk", 15, "beginner"],
    ["endurance", "Brisk Walk Workout", 20, "beginner"],
    ["endurance", "Interval Walk", 20, "beginner"],
    ["endurance", "Power Walk", 25, "medium"],
    ["endurance", "Incline Walk", 20, "medium"],
    ["endurance", "Fat-Burn Walk", 30, "medium"],
    ["endurance", "Long Steady Walk", 40, "beginner"],
  ],
  somatic: [
    ["full-body", "Morning Somatic Flow", 12, "beginner"],
    ["full-body", "Somatic Reset", 15, "beginner"],
    ["core", "Spine & Pelvis Release", 15, "beginner"],
    ["upper-body", "Neck & Shoulder Somatics", 12, "beginner"],
    ["lower-body", "Hips & Lower Back Ease", 15, "beginner"],
    ["full-body", "Nervous System Calm", 18, "beginner"],
    ["full-body", "Bedtime Somatic Wind-Down", 15, "beginner"],
    ["full-body", "Deep Somatic Session", 25, "medium"],
  ],
  "abs-program": [
    ["abs", "Beginner Abs", 10, "beginner"],
    ["abs", "Standing Abs", 12, "beginner"],
    ["core", "Core Stability", 15, "beginner"],
    ["abs", "Six-Pack Builder", 15, "medium"],
    ["abs", "Lower Abs Focus", 15, "medium"],
    ["abs", "Obliques & Waist", 15, "medium"],
    ["abs", "Plank Challenge", 10, "advanced"],
    ["core", "Advanced Core Shred", 20, "advanced"],
    ["abs", "Total Ab Circuit", 20, "medium"],
  ],
};

const GENERATED_SESSIONS: Session[] = Object.entries(SPECS).flatMap(([bucket, specs]) =>
  specs.map<Session>(([focus, title, minutes, level, equip], i) => ({
    id: `${bucket}-${i + 1}`, bucket, title, focus, minutes, level, equip: equip ?? "none",
  })),
);

/* ---- Desi Kasrat: curated programs (exact exercise lists, grouped) ---- */

export const DESI_GROUPS = ["Foundations", "Strength", "Conditioning", "Mobility & Control", "Full-Body"] as const;

type DesiSpec = [group: string, title: string, level: Level, minutes: number, focus: Focus, exIds: string[], equip?: Equip];

const DESI_SPECS: DesiSpec[] = [
  // Foundations
  ["Foundations", "Kasrat Basics", "beginner", 20, "full-body", ["dz-deepsquat", "dz-baithak", "dz-halfdand", "dz-wrist", "dz-neck", "dz-ankle", "dz-breath"]],
  ["Foundations", "Dand & Baithak Basics", "beginner", 20, "full-body", ["dz-basicdand", "dz-baithak", "dz-cobra", "dz-child", "dz-deepsquat"]],
  ["Foundations", "Namaskar Flow", "beginner", 20, "full-body", ["dz-namaskarbaithak", "dz-namaskardand", "dz-deepsquat", "dz-cobra", "dz-breath"]],
  ["Foundations", "Daily Desi Fitness", "beginner", 25, "full-body", ["dz-basicdand", "dz-baithak", "dz-farmerwalk", "dz-bear", "dz-plank", "dz-deepsquat"]],
  ["Foundations", "Traditional Conditioning", "medium", 30, "full-body", ["dz-basicdand", "dz-mishradand", "dz-baithak", "dz-frogjump", "dz-bear", "dz-crab"]],
  // Strength
  ["Strength", "Dand Strength", "beginner", 20, "upper-body", ["dz-basicdand", "dz-halfdand", "dz-hindupush", "dz-shouldertap", "dz-cobra"]],
  ["Strength", "Baithak Strength", "medium", 25, "lower-body", ["dz-baithak", "dz-jumpbaithak", "dz-split", "dz-wallsit", "dz-calf"]],
  ["Strength", "Single-Leg Power", "advanced", 30, "lower-body", ["dz-ektangi", "dz-jumpbaithak", "dz-split", "dz-wallsit", "dz-singleleg"]],
  ["Strength", "Gada Strength", "medium", 30, "shoulders", ["dz-gada", "dz-halo", "dz-gada360", "dz-rotswing", "dz-farmercarry"], "desi"],
  ["Strength", "Advanced Dand Mastery", "advanced", 35, "upper-body", ["dz-rammurti", "dz-paltidand", "dz-scorpiondand", "dz-hindupush", "dz-cobra"]],
  ["Strength", "Traditional Power", "advanced", 35, "full-body", ["dz-mishradand", "dz-rammurti", "dz-baithak", "dz-jumpbaithak", "dz-gada", "dz-sandbag"], "desi"],
  ["Strength", "Akhada Strength", "advanced", 40, "full-body", ["dz-rammurti", "dz-hanuman", "dz-deepbaithak", "dz-gadaflow", "dz-mudgar", "dz-ropepull", "dz-farmercarry"], "desi"],
  // Conditioning
  ["Conditioning", "Desi Cardio", "beginner", 20, "endurance", ["dz-baithak", "dz-fastmarch", "dz-farmerwalk", "dz-sidestep", "dz-highknee"]],
  ["Conditioning", "Functional Kasrat", "medium", 25, "full-body", ["dz-bear", "dz-crab", "dz-duck", "dz-monkey", "dz-lateral"]],
  ["Conditioning", "Warrior Conditioning", "medium", 30, "endurance", ["dz-basicdand", "dz-baithak", "dz-bear", "dz-burpee", "dz-jumpsquat", "dz-farmercarry"]],
  ["Conditioning", "Akhada Challenge", "advanced", 40, "full-body", ["dz-mishradand", "dz-rammurti", "dz-baithak", "dz-gada", "dz-sandbag", "dz-sprint"], "desi"],
  ["Conditioning", "Desi Endurance", "advanced", 40, "endurance", ["dz-highrepbaithak", "dz-highrepdand", "dz-farmerwalk", "dz-bear", "dz-skip"]],
  // Mobility & Control
  ["Mobility & Control", "Shoulder Mobility", "beginner", 15, "shoulders", ["dz-halo", "dz-arm", "dz-shrug", "dz-wallangel"], "desi"],
  ["Mobility & Control", "Hip Mobility", "beginner", 15, "lower-body", ["dz-deepsquat", "dz-frogstretch", "dz-hipopen", "dz-butterfly"]],
  ["Mobility & Control", "Spine & Core Flow", "medium", 20, "core", ["dz-catcow", "dz-cobra", "dz-dandflow", "dz-birddog", "dz-hinduplank"]],
  ["Mobility & Control", "Neck & Bridge Strength", "medium", 20, "core", ["dz-bridge", "dz-cobra", "dz-catcow", "dz-birddog", "dz-breath"]],
  ["Mobility & Control", "Balance & Stability", "medium", 20, "core", ["dz-singleleg", "dz-deepsquat", "dz-bear", "dz-sideplank"]],
  ["Mobility & Control", "Animal Movement Flow", "advanced", 30, "full-body", ["dz-bear", "dz-monkey", "dz-crab", "dz-leopard", "dz-frogjump"]],
  // Full-Body
  ["Full-Body", "Full-Body Kasrat", "beginner", 20, "full-body", ["dz-basicdand", "dz-baithak", "dz-farmerwalk", "dz-plank", "dz-cobra"]],
  ["Full-Body", "Total Body Flow", "medium", 30, "full-body", ["dz-mishradand", "dz-baithak", "dz-gada", "dz-bear", "dz-jumpsquat"], "desi"],
  ["Full-Body", "Traditional Full Body", "medium", 30, "full-body", ["dz-rammurti", "dz-baithak", "dz-duck", "dz-monkey", "dz-sandbag"], "desi"],
  ["Full-Body", "Warrior Workout", "advanced", 35, "full-body", ["dz-hanuman", "dz-gadaflow", "dz-baithak", "dz-burpee", "dz-farmercarry", "dz-bear"], "desi"],
  ["Full-Body", "Akhara Mastery", "advanced", 40, "full-body", ["dz-scorpiondand", "dz-paltidand", "dz-ektangi", "dz-gadaflow", "dz-bridge", "dz-sandbag", "dz-sprint"], "desi"],
  ["Full-Body", "Ultimate Akhada", "advanced", 45, "full-body", ["dz-rammurti", "dz-hanuman", "dz-baithak", "dz-gada", "dz-mudgar", "dz-sandbag", "dz-ropepull", "dz-bear", "dz-sprint"], "desi"],
];

const DESI_SESSIONS: Session[] = DESI_SPECS.map(([group, title, level, minutes, focus, exIds, equip], i) => ({
  id: `desi-kasrat-${i + 1}`, bucket: "desi-kasrat", title, focus, minutes, level, equip: equip ?? "none", exIds, group,
}));

export const SESSIONS: Session[] = [...GENERATED_SESSIONS, ...DESI_SESSIONS];

export function sessionsIn(bucket: string): Session[] { return SESSIONS.filter((s) => s.bucket === bucket); }
export function getSession(id: string): Session | undefined { return SESSIONS.find((s) => s.id === id); }
export function intensityOf(level: Level): Intensity { return level === "beginner" ? "low" : level === "medium" ? "medium" : "high"; }

/* ================= Steps ================= */

export interface Step {
  exId: string; name: string; emoji: string; sec: number;
  kind: Kind | "break"; round?: number; setLabel?: string;
  met?: number;   // for ad-hoc steps (e.g. Programs) not in the catalogue
}
export interface Block { label: string; note?: string; steps: Step[] }

function hash(s: string): number { let h = 2166136261; for (let i = 0; i < s.length; i++) { h ^= s.charCodeAt(i); h = Math.imul(h, 16777619); } return h >>> 0; }

/** Exercises a bucket can draw on for a given focus — also powers the bundle list. */
export function poolFor(b: Bucket, kind: Kind, focus?: Focus, equip?: Equip): Exercise[] {
  const wantEquip = equip ?? "none";
  const effKind = kind === "main" && b.mainKind ? b.mainKind : kind;
  let list = EXERCISES.filter((x) => x.kind === effKind);

  // equipment: "none" sessions stay bodyweight; dumbbell/gym may also use bodyweight moves
  list = list.filter((x) => (wantEquip === "none" ? x.equip === "none" : x.equip === "none" || x.equip === wantEquip));

  if (b.tag) {
    const tagged = list.filter((x) => x.tag === b.tag);
    if (effKind === "main" && tagged.length >= 4) list = tagged;
    else list = [...tagged, ...list.filter((x) => !x.tag)];
  } else {
    list = list.filter((x) => !x.tag);
  }

  if (effKind === "main") {
    if (b.minMet) { const hot = list.filter((x) => x.met >= b.minMet!); if (hot.length >= 4) list = hot; }
    if (b.maxMet) { const easy = list.filter((x) => x.met <= b.maxMet!); if (easy.length >= 4) list = easy; }
    if (focus) {
      const parts = partsOfFocus(focus);
      const matched = list.filter((x) => x.parts.some((p) => parts.includes(p)));
      if (matched.length >= 3) return matched;
    }
  }
  return list;
}

export const BREAK_SEC = 30;
function step(x: Exercise, kind: Step["kind"], round?: number): Step {
  return { exId: x.id, name: x.name, emoji: x.emoji, sec: x.sec, kind, round };
}
function breakStep(round: number): Step {
  return { exId: "break", name: "Break", emoji: "⏸️", sec: BREAK_SEC, kind: "break", round };
}

/** Curated sessions: play the given exercise list. Leading warm-ups and trailing
 *  cool-downs run once; the main moves repeat over rounds to fill the stated time. */
function buildCuratedBlocks(s: Session): Block[] {
  const all = (s.exIds ?? []).map(getExercise).filter(Boolean) as Exercise[];
  if (!all.length) return [];
  let lead = 0;
  while (lead < all.length && all[lead].kind === "warmup") lead++;
  let tail = all.length;
  while (tail > lead && all[tail - 1].kind === "cooldown") tail--;
  const warm = all.slice(0, lead);
  const cool = all.slice(tail);
  const mains = all.slice(lead, tail);
  const useMains = mains.length ? mains : all;

  const blocks: Block[] = [];
  if (warm.length) blocks.push({ label: "Warm Up", note: `${warm.length} exercises`, steps: warm.map((x) => step(x, "warmup")) });

  const warmSec = warm.reduce((a, x) => a + x.sec, 0);
  const coolSec = cool.reduce((a, x) => a + x.sec, 0);
  const roundSec = useMains.reduce((a, x) => a + x.sec, 0) + (useMains.length - 1) * BREAK_SEC + BREAK_SEC;
  const budget = Math.max(60, s.minutes * 60 - warmSec - coolSec);
  const rounds = Math.max(1, Math.min(6, Math.round(budget / Math.max(60, roundSec))));

  for (let r = 0; r < rounds; r++) {
    const steps = useMains.map((x) => step(x, "main", r + 1));
    if (r < rounds - 1) steps.push(breakStep(r + 1));
    blocks.push({ label: rounds > 1 ? `Round ${r + 1}` : "Workout", note: `${useMains.length} exercises`, steps });
  }
  if (cool.length) blocks.push({ label: "Cool Down", note: `${cool.length} exercises`, steps: cool.map((x) => step(x, "cooldown")) });
  return blocks;
}

export function buildBlocks(s: Session): Block[] {
  if (s.exIds && s.exIds.length) return buildCuratedBlocks(s);
  const b = bucketOf(s.bucket)!;
  const seed = hash(s.id);
  const warmPool = poolFor(b, "warmup", undefined, s.equip);
  const mainPool = poolFor(b, "main", s.focus, s.equip);
  const coolPool = poolFor(b, "cooldown", undefined, s.equip);

  const pick = (list: Exercise[], n: number, offset: number) => {
    const out: Exercise[] = [];
    if (!list.length) return out;
    for (let i = 0; out.length < n && i < list.length * 3; i++) {
      const x = list[(seed + offset + i * 7) % list.length];
      if (!out.some((o) => o.id === x.id)) out.push(x);
    }
    return out;
  };

  const total = s.minutes * 60;
  const warm = pick(warmPool, s.minutes <= 12 ? 2 : 3, 3);
  const cool = pick(coolPool, s.minutes <= 12 ? 2 : 3, 11);
  const warmSec = warm.reduce((a, x) => a + x.sec, 0);
  const coolSec = cool.reduce((a, x) => a + x.sec, 0);

  const mainBudget = Math.max(120, total - warmSec - coolSec);
  const perRound = s.minutes >= 25 ? 4 : 3;
  const rounds = Math.max(2, Math.min(5, Math.round(mainBudget / (perRound * 40 + BREAK_SEC))));

  const blocks: Block[] = [{ label: "Warm Up", note: `${warm.length} exercises`, steps: warm.map((x) => step(x, "warmup")) }];
  const used = pick(mainPool, perRound * rounds, 23);
  for (let r = 0; r < rounds; r++) {
    const slice = used.slice(r * perRound, r * perRound + perRound);
    const chosen = slice.length ? slice : pick(mainPool, perRound, r * 5 + 31);
    const steps = chosen.map((x) => step(x, "main", r + 1));
    if (r < rounds - 1) steps.push(breakStep(r + 1));
    blocks.push({ label: `Round ${r + 1}`, note: `${chosen.length} exercises`, steps });
  }
  blocks.push({ label: "Cool Down", note: `${cool.length} exercises`, steps: cool.map((x) => step(x, "cooldown")) });
  return blocks;
}

export function flattenBlocks(blocks: Block[]): Step[] { return blocks.flatMap((b) => b.steps); }
export function stepsOf(s: Session): Step[] { return flattenBlocks(buildBlocks(s)); }
export function exerciseCount(s: Session): number { return stepsOf(s).filter((x) => x.kind !== "break").length; }

/* ================= Calories ================= */

export function kcalFor(met: number, sec: number, weightKg: number): number {
  return Math.round((met * 3.5 * weightKg / 200) * (sec / 60));
}
export function stepKcal(st: Step, weightKg: number): number {
  if (st.kind === "break") return 0;
  return kcalFor(st.met ?? getExercise(st.exId)?.met ?? 4, st.sec, weightKg);
}
export function sessionKcal(s: Session, weightKg: number): number {
  return stepsOf(s).reduce((a, st) => a + stepKcal(st, weightKg), 0);
}
export function exKcal(minutes: number, weightKg: number, intensity: Intensity): number {
  const met = intensity === "low" ? 3.8 : intensity === "medium" ? 6 : 8.5;
  return Math.round((met * 3.5 * weightKg / 200) * minutes);
}

/* ================= Filters ================= */

export interface ExFilters { levels: Level[]; focus: Focus[]; equip: Equip[] }
export const EMPTY_FILTERS: ExFilters = { levels: [], focus: [], equip: [] };

export const LEVELS: { id: Level; label: string }[] = [
  { id: "beginner", label: "Beginner" },
  { id: "medium", label: "Medium" },
  { id: "advanced", label: "Advance" },
];
// row filter options
export const EQUIP_FILTERS: { id: Equip; label: string }[] = [
  { id: "none", label: "No equipment" },
  { id: "dumbbells", label: "Only dumbbells" },
  { id: "desi", label: "Desi implements" },
];
// plan sheet needs the full set incl. gym machines
export const EQUIP_ALL: { id: Equip; label: string }[] = [
  { id: "none", label: "No equipment" },
  { id: "dumbbells", label: "Only dumbbells" },
  { id: "gym", label: "Gym machines" },
  { id: "desi", label: "Desi implements" },
];
export const INTENSITIES: { id: Intensity; label: string }[] = [
  { id: "low", label: "Low" }, { id: "medium", label: "Medium" }, { id: "high", label: "High" },
];

export function filterCount(f: ExFilters): number {
  return f.levels.length + f.focus.length + f.equip.length;
}
export function applyFilters(list: Session[], f: ExFilters): Session[] {
  return list.filter((s) => {
    if (f.levels.length && !f.levels.includes(s.level)) return false;
    if (f.focus.length && !f.focus.includes(s.focus)) return false;
    if (f.equip.length && !f.equip.includes(s.equip)) return false;
    return true;
  });
}
export function levelLabel(l: Level): string { return LEVELS.find((x) => x.id === l)?.label ?? l; }
export function equipLabel(eq: Equip): string { return EQUIP_FILTERS.find((x) => x.id === eq)?.label ?? eq; }

/** The bundle exercise list for a bucket, honouring the same filters. */
export function bundlePool(b: Bucket, f: ExFilters): Exercise[] {
  const equips: Equip[] = f.equip.length ? f.equip : ["none", "dumbbells", "gym"];
  const focuses: Focus[] = f.focus.length ? f.focus : [];
  const out = new Map<string, Exercise>();
  for (const eq of equips) {
    for (const kind of ["warmup", "main", "cooldown"] as Kind[]) {
      const list = focuses.length && kind === "main"
        ? focuses.flatMap((fc) => poolFor(b, kind, fc, eq))
        : poolFor(b, kind, undefined, eq);
      list.forEach((x) => { if (!f.equip.length || f.equip.includes(x.equip)) out.set(x.id, x); });
    }
  }
  return [...out.values()];
}

/* ================= Bundles ================= */

export interface BundleItem { exId: string; sets: number; sec: number }
export interface Bundle { id: string; name: string; items: BundleItem[]; createdAt: number }

export const SET_OPTIONS = [1, 2, 3, 4, 5];
export const SEC_OPTIONS = [20, 30, 40, 45, 60];

export function bundleSeconds(items: BundleItem[]): number {
  const work = items.reduce((a, it) => a + it.sets * it.sec, 0);
  const breaks = items.reduce((a, it) => a + (it.sets - 1) * BREAK_SEC, 0) + Math.max(0, items.length - 1) * BREAK_SEC;
  return work + breaks;
}
export function bundleKcal(items: BundleItem[], weightKg: number): number {
  return items.reduce((a, it) => a + kcalFor(getExercise(it.exId)?.met ?? 4, it.sets * it.sec, weightKg), 0);
}
export function bundleSteps(items: BundleItem[]): Step[] {
  const steps: Step[] = [];
  items.forEach((it, i) => {
    const ex = getExercise(it.exId);
    if (!ex) return;
    for (let s = 0; s < it.sets; s++) {
      steps.push({
        exId: ex.id, name: ex.name, emoji: ex.emoji, sec: it.sec, kind: "main",
        setLabel: it.sets > 1 ? `Set ${s + 1} of ${it.sets}` : undefined,
      });
      if (s < it.sets - 1) steps.push({ exId: "break", name: "Break", emoji: "⏸️", sec: BREAK_SEC, kind: "break" });
    }
    if (i < items.length - 1) steps.push({ exId: "break", name: "Break", emoji: "⏸️", sec: BREAK_SEC, kind: "break" });
  });
  return steps;
}

/* ================= Personalized plan ================= */

export interface PlanOptions {
  minutes: number; level: Level; intensity: Intensity; equip: Equip;
  focus: Focus[]; buckets: string[];
}
export interface ExercisePlan { title: string; sessionIds: string[]; minutes: number }

export const PLAN_BUCKETS = BUCKETS.map((b) => ({ id: b.id, label: b.label, emoji: b.emoji }));

export function buildExercisePlan(o: PlanOptions): ExercisePlan {
  let pool = SESSIONS.slice();
  if (o.equip === "none") pool = pool.filter((s) => s.equip === "none");
  const scored = pool.map((s) => {
    let n = 0;
    if (o.buckets.length && o.buckets.includes(s.bucket)) n += 4;
    if (o.focus.length && o.focus.includes(s.focus)) n += 3;
    if (s.level === o.level) n += 2;
    if (intensityOf(s.level) === o.intensity) n += 2;
    return { s, n };
  }).sort((a, b) => b.n - a.n);

  const picked: Session[] = [];
  let total = 0;
  for (const { s } of scored) {
    if (picked.length >= 2 && total >= o.minutes) break;
    if (picked.some((p) => p.id === s.id)) continue;
    picked.push(s); total += s.minutes;
    if (picked.length >= 5) break;
  }
  const label = o.buckets.length ? o.buckets.map((g) => bucketOf(g)?.label).filter(Boolean).join(" + ") : "Custom";
  return { title: `${label} · ${o.minutes} min`, sessionIds: picked.map((p) => p.id), minutes: total };
}

/* ================= Music (dance / zumba) ================= */

export const MUSIC_LINKS: { id: string; label: string; emoji: string; url: string }[] = [
  { id: "apple", label: "Apple Music", emoji: "🍎", url: "https://music.apple.com/us/search?term=dance%20workout" },
  { id: "spotify", label: "Spotify", emoji: "🎧", url: "https://open.spotify.com/search/dance%20workout" },
  { id: "youtube", label: "YouTube Music", emoji: "▶️", url: "https://music.youtube.com/search?q=dance+workout" },
];

/* ================= Stores ================= */

const FAV_KEY = "ayuraise.ex.favs";
const BUNDLE_KEY = "ayuraise.ex.bundles";
const PLANS_KEY = "ayuraise.ex.plans";
const HIST_KEY = "ayuraise.ex.history";
const FEEDBACK_KEY = "ayuraise.ex.feedback";

function read<T>(key: string, fb: T): T {
  if (typeof window === "undefined") return fb;
  try { const r = window.localStorage.getItem(key); return r ? (JSON.parse(r) as T) : fb; } catch { return fb; }
}
function write(key: string, v: unknown) {
  if (typeof window === "undefined") return;
  try { window.localStorage.setItem(key, JSON.stringify(v)); } catch {}
}

export function loadFavs(): string[] { return read<string[]>(FAV_KEY, []); }
export function isFav(id: string): boolean { return loadFavs().includes(id); }
export function toggleFav(id: string): string[] {
  const cur = loadFavs();
  const next = cur.includes(id) ? cur.filter((x) => x !== id) : [...cur, id];
  write(FAV_KEY, next);
  return next;
}

export function loadBundles(): Bundle[] { return read<Bundle[]>(BUNDLE_KEY, []); }
export function saveBundle(name: string, items: BundleItem[]): Bundle[] {
  const all = loadBundles();
  all.unshift({ id: `bn_${Date.now().toString(36)}`, name, items, createdAt: Date.now() });
  write(BUNDLE_KEY, all);
  return all;
}
export function deleteBundle(id: string): Bundle[] {
  const next = loadBundles().filter((b) => b.id !== id);
  write(BUNDLE_KEY, next);
  return next;
}

export interface SavedExPlan extends ExercisePlan { id: string; createdAt: number }
export function loadMyExPlans(): SavedExPlan[] { return read<SavedExPlan[]>(PLANS_KEY, []); }
export function saveMyExPlan(p: ExercisePlan): SavedExPlan[] {
  const all = loadMyExPlans();
  all.unshift({ ...p, id: `ex_${Date.now().toString(36)}`, createdAt: Date.now() });
  write(PLANS_KEY, all);
  return all;
}
export function deleteMyExPlan(id: string): SavedExPlan[] {
  const next = loadMyExPlans().filter((p) => p.id !== id);
  write(PLANS_KEY, next);
  return next;
}

export interface ExHistoryEntry { date: string; label: string; minutes: number; kcal: number }
export function loadExHistory(): ExHistoryEntry[] { return read<ExHistoryEntry[]>(HIST_KEY, []); }
export function addExHistory(en: ExHistoryEntry) {
  const all = loadExHistory();
  all.push(en);
  write(HIST_KEY, all.slice(-60));
}

export interface Feedback { date: string; label: string; effort: string; mood: string; note?: string }
export function addFeedback(f: Feedback) {
  const all = read<Feedback[]>(FEEDBACK_KEY, []);
  all.push(f);
  write(FEEDBACK_KEY, all.slice(-60));
}
export function loadFeedback(): Feedback[] { return read<Feedback[]>(FEEDBACK_KEY, []); }
