import type { Quiz } from "../../types";

export interface QuizDAOI {
  subscribeToQuizzes(
    onSuccess: (quizzes: Quiz[]) => void,
    onError: (error: string) => void
  ): () => void;
  fetchQuizById(quizId: string): Promise<Quiz>;
  updateQuizMetadata(quizId: string, updates: Partial<Quiz>): Promise<void>;
  saveQuestions(quizId: string, questions: Quiz["questions"]): Promise<void>;
  saveQuiz(quiz: Quiz): Promise<void>;
  deleteQuiz(quizId: string): Promise<void>;
}
