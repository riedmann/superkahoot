// Common types and enums used across the application
export type DifficultyLevel = "easy" | "medium" | "hard";
export type QuestionType = "true-false" | "standard";

// Game status types
export type GameStatus =
  | "waiting"
  | "active"
  | "countdown"
  | "question"
  | "results"
  | "finished";
