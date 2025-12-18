import type { Question } from "./question";
import type { DifficultyLevel } from "./common";

export interface Quiz {
  id: string;
  title: string;
  description?: string;
  questions: Question[];
  difficulty?: DifficultyLevel;
  category?: string;
  createdAt?: Date;
  updatedAt?: Date;
}

// Re-export question types for backward compatibility
export type {
  Question,
  TrueFalseQuestion,
  StandardQuestion,
  QuestionOption,
} from "./question";
export { isTrueFalseQuestion, isStandardQuestion } from "./question";
