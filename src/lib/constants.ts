import type { ExerciseCategory } from "@/types/domain";

export const CATEGORIES: { value: ExerciseCategory; label: string; accent: string }[] = [
  { value: "push", label: "Push", accent: "bg-acid text-ink" },
  { value: "pull", label: "Pull", accent: "bg-mint text-ink" },
  { value: "legs", label: "Legs", accent: "bg-sky-300 text-ink" },
  { value: "arms", label: "Arms", accent: "bg-ember text-white" },
];

export const CATEGORY_ORDER: ExerciseCategory[] = ["push", "pull", "legs", "arms"];

export function getNextCategory(current?: ExerciseCategory): ExerciseCategory {
  if (!current) return "push";
  const index = CATEGORY_ORDER.indexOf(current);
  return CATEGORY_ORDER[(index + 1) % CATEGORY_ORDER.length];
}

export function categoryLabel(category: ExerciseCategory) {
  return CATEGORIES.find((item) => item.value === category)?.label ?? category;
}
