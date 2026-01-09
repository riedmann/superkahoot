export interface QuestionOption {
  text: string;
  image?: string; // Base64 encoded image or URL
}

export interface TrueFalseQuestion {
  id: string;
  type: "true-false";
  question: string;
  correctAnswer: boolean;
  timeLimit?: number;
  image?: string; // Base64 encoded image or URL
}

export interface StandardQuestion {
  id: string;
  type: "standard";
  question: string;
  options: QuestionOption[];
  correctAnswers: number[];
  timeLimit?: number;
  image?: string; // Base64 encoded image or URL
}

export type Question = TrueFalseQuestion | StandardQuestion;

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
