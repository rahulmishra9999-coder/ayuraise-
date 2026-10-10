// Cuisine preference taxonomy — drilled down in layers (region → sub-region → local).
// India goes three layers deep; most other regions are two (region → country), with a few
// three-layer branches (East Asian, Southeast Asian, North African).

export interface CuisineNode { name: string; children?: CuisineNode[] }

export const CUISINES: CuisineNode[] = [
  {
    name: "Indian",
    children: [
      { name: "North Indian" },
      { name: "South Indian", children: [{ name: "Tamil" }, { name: "Kerala" }, { name: "Andhra / Telugu" }, { name: "Karnataka" }] },
      { name: "West Indian", children: [{ name: "Gujarati" }, { name: "Maharashtrian" }, { name: "Goan" }] },
      { name: "East Indian", children: [{ name: "Bengali" }, { name: "Odia" }, { name: "Assamese" }] },
      { name: "Central / North-West", children: [{ name: "Punjabi" }, { name: "Rajasthani" }, { name: "Kashmiri" }, { name: "Himachali" }] },
    ],
  },
  {
    name: "Asian",
    children: [
      { name: "East Asian", children: [{ name: "Chinese" }, { name: "Japanese" }, { name: "Korean" }] },
      { name: "Southeast Asian", children: [{ name: "Thai" }, { name: "Vietnamese" }, { name: "Indonesian" }, { name: "Malaysian" }, { name: "Filipino" }] },
    ],
  },
  {
    name: "Middle Eastern & Mediterranean",
    children: [{ name: "Lebanese" }, { name: "Turkish" }, { name: "Persian" }, { name: "Israeli" }, { name: "Greek" }, { name: "Mediterranean" }],
  },
  {
    name: "European",
    children: [{ name: "Italian" }, { name: "French" }, { name: "Spanish" }, { name: "German" }, { name: "British" }, { name: "Nordic" }],
  },
  {
    name: "American",
    children: [{ name: "American" }, { name: "Mexican" }, { name: "Brazilian" }, { name: "Caribbean" }],
  },
  {
    name: "African",
    children: [
      { name: "North African", children: [{ name: "Moroccan" }, { name: "Egyptian" }] },
      { name: "East African" }, { name: "South African" }, { name: "West African" },
    ],
  },
  {
    name: "Fusion / Global",
    children: [{ name: "Asian Fusion" }, { name: "Indo-Chinese" }, { name: "Indian Fusion" }],
  },
];

/** Map a chosen cuisine path to a region the meal-plan engine has dishes for.
 *  (The app is Indian-veg, so only the Indian regions bias dish selection.) */
export function cuisineRegion(path: string[]): string {
  if (path[0] !== "Indian") return "";
  const mid = path[1] ?? "";
  if (mid === "Central / North-West") return "North Indian"; // closest dish set we have
  return mid; // North/South/West/East Indian
}
