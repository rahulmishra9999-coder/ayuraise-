import {
  Stethoscope,
  Flower2,
  Dumbbell,
  Brain,
  Salad,
  Scale,
  Hourglass,
  Sparkles,
  type LucideIcon,
} from "lucide-react";

export type SectionSlug =
  | "disease"
  | "yoga"
  | "exercise"
  | "meditation"
  | "diet"
  | "weight-loss"
  | "fasting"
  | "detox";

export interface Section {
  slug: SectionSlug;
  title: string;
  short: string;
  blurb: string;
  icon: LucideIcon;
  gradient: string; // css var name
  highlights: string[];
}

export const SECTIONS: Section[] = [
  {
    slug: "disease",
    title: "Disease Management",
    short: "Heal",
    blurb: "Ayurvedic protocols for common chronic conditions — diabetes, hypertension, PCOS, IBS, thyroid and more.",
    icon: Stethoscope,
    gradient: "var(--gradient-clay)",
    highlights: ["Condition-specific routines", "Dosha-aware herbs", "Daily tracking"],
  },
  {
    slug: "yoga",
    title: "Yoga & Pranayam",
    short: "Move",
    blurb: "Asana sequences and pranayam practices tailored to your body type, energy level and time of day.",
    icon: Flower2,
    gradient: "var(--gradient-leaf)",
    highlights: ["Beginner → advanced", "5 to 60 min flows", "Breath techniques"],
  },
  {
    slug: "exercise",
    title: "Exercise & Vyayam",
    short: "Strength",
    blurb: "Traditional vyayam, mobility and strength drills paired with modern functional training — strong body, calm mind.",
    icon: Dumbbell,
    gradient: "var(--gradient-clay)",
    highlights: ["Surya namaskar variations", "Bodyweight strength", "Mobility & joints"],
  },
  {
    slug: "meditation",
    title: "Meditation",
    short: "Still",
    blurb: "Guided meditations rooted in yogic tradition — mindfulness, mantra, yoga nidra and trataka.",
    icon: Brain,
    gradient: "var(--gradient-violet)",
    highlights: ["Sleep & focus", "Mantra library", "Yoga Nidra"],
  },
  {
    slug: "diet",
    title: "Diet Plan",
    short: "Eat",
    blurb: "Meals matched to your prakriti and the current ritu (season). Recipes that taste good and balance doshas.",
    icon: Salad,
    gradient: "var(--gradient-sage)",
    highlights: ["Prakriti-based", "Seasonal foods", "Veg & vegan"],
  },
  {
    slug: "weight-loss",
    title: "Weight Loss",
    short: "Shape",
    blurb: "Sustainable weight loss using kapha-pacifying foods, movement and lifestyle — no crash diets.",
    icon: Scale,
    gradient: "var(--gradient-gold)",
    highlights: ["Target & timeline", "Daily punch-in", "Habit loops"],
  },
  {
    slug: "fasting",
    title: "Fasting & IF",
    short: "Pause",
    blurb: "Intermittent fasting windows (12:12 to 18:6) and traditional ekadashi fasts with reminders and tracking.",
    icon: Hourglass,
    gradient: "var(--gradient-dawn)",
    highlights: ["16:8 / 18:6 / OMAD", "Weekly window view", "Break-fast guides"],
  },
  {
    slug: "detox",
    title: "Detox",
    short: "Cleanse",
    blurb: "Gentle seasonal cleanses inspired by panchakarma — kitchari resets, oil massage and herbal teas.",
    icon: Sparkles,
    gradient: "var(--gradient-water)",
    highlights: ["3 / 7 / 21 day", "Daily checklist", "Herbal protocols"],
  },
];

export function getSection(slug: string): Section | undefined {
  return SECTIONS.find((s) => s.slug === slug);
}
