import type { Quiz } from "../types/quiz";
import type { Game, GameAnswer, Participant } from "./types";

export interface IGameDAO {
  // Game management
  createGame(quiz: Quiz, hostId: string): Promise<Game>;
  getGame(gameId: string): Promise<Game | null>;
  updateGameStatus(gameId: string, status: Game["status"]): Promise<void>;
  subscribeToGame(
    gameId: string,
    onUpdate: (game: Game) => void,
    onError: (error: string) => void
  ): () => void;

  // Participant management
  addParticipant(
    gameId: string,
    participant: Omit<Participant, "id" | "joinedAt" | "score">
  ): Promise<Participant>;
  updateParticipantStatus(
    gameId: string,
    participantId: string,
    isOnline: boolean
  ): Promise<void>;

  // Question management
  startQuestion(gameId: string, questionIndex: number): Promise<void>;
  submitAnswer(
    gameId: string,
    answer: Omit<GameAnswer, "answeredAt" | "isCorrect" | "points">
  ): Promise<void>;
  endQuestion(gameId: string): Promise<void>;

  // Game flow
  finishGame(gameId: string): Promise<void>;
  getGameByPin(gamePin: string): Promise<Game | null>;
}
