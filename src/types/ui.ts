import type { DifficultyLevel } from "./common";

export type BadgeVariant =
  | "difficulty-easy"
  | "difficulty-medium"
  | "difficulty-hard"
  | "default";

// Constants
export const DIFFICULTY_VARIANTS: Record<DifficultyLevel, BadgeVariant> = {
  easy: "difficulty-easy",
  medium: "difficulty-medium",
  hard: "difficulty-hard",
};
