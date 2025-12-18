import type { GameStatus } from "./common";

export interface Participant {
  id: string;
  name: string;
  score: number;
  joinedAt: Date;
  isOnline: boolean;
}

export interface GameAnswer {
  participantId: string;
  questionId: string;
  answer: any; // boolean for true/false, number[] for multiple choice
  answeredAt: Date;
  isCorrect: boolean;
  points: number;
}

export interface GameQuestion {
  id: string;
  questionIndex: number;
  startedAt: Date;
  endsAt: Date;
  answers: GameAnswer[];
}

export interface Game {
  id: string;
  quizId: string;
  quizTitle: string;
  quizData?: any; // Full quiz data for client access
  hostId: string;
  gamePin: string;
  status: GameStatus;
  participants: Participant[];
  currentQuestionIndex: number;
  currentQuestion?: GameQuestion;
  totalQuestions: number;
  createdAt: Date;
  startedAt?: Date;
  finishedAt?: Date;
  settings: {
    questionTimeLimit: number; // seconds
    showCorrectAnswers: boolean;
    allowLateJoins: boolean;
  };
}

export interface GameSession {
  gameId: string;
  participantId?: string;
  isHost: boolean;
}

// Re-export common game status type
export type { GameStatus } from "./common";
