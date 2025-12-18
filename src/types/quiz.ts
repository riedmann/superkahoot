export type QuestionType = "true-false" | "standard";
export type DifficultyLevel = "easy" | "medium" | "hard";
export type BadgeVariant =
  | "difficulty-easy"
  | "difficulty-medium"
  | "difficulty-hard";

export interface TrueFalseQuestion {
  id: string;
  type: "true-false";
  question: string;
  correctAnswer: boolean;
  image?: string; // Base64 encoded image or URL
}

export interface QuestionOption {
  text: string;
  image?: string; // Base64 encoded image or URL
}

export interface StandardQuestion {
  id: string;
  type: "standard";
  question: string;
  options: QuestionOption[];
  correctAnswers: number[];
  image?: string; // Base64 encoded image or URL
}

export type Question = TrueFalseQuestion | StandardQuestion;

export interface Quiz {
  id: string;
  title: string;
  description?: string;
  questions: Question[]; // Allow Firestore objects to be cast
  difficulty?: "easy" | "medium" | "hard";
  category?: string;
  createdAt?: Date;
  updatedAt?: Date;
}

// Type guard functions
export function isTrueFalseQuestion(
  question: any
): question is TrueFalseQuestion {
  return question?.type === "true-false";
}

export function isStandardQuestion(
  question: any
): question is StandardQuestion {
  return question?.type === "standard";
}

// Constants
export const DIFFICULTY_VARIANTS: Record<DifficultyLevel, BadgeVariant> = {
  easy: "difficulty-easy",
  medium: "difficulty-medium",
  hard: "difficulty-hard",
};
