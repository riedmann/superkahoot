import { Leaderboard } from "../games/host/Leaderboard";
import type { Game } from "../types";
import type { Quiz } from "../types/quiz";

export function LeaderboardMock() {
  const mockQuiz: Quiz = {
    id: "quiz-1",
    title: "Test Quiz",
    description: "A test quiz",
    questions: [],

    createdAt: new Date(),
    difficulty: "medium",
    category: "General",
  };

  const mockGame: Game = {
    id: "mock-game-123",
    quizId: "quiz-1",
    quizTitle: "Test Quiz",
    quizData: mockQuiz,
    hostId: "host-1",
    gamePin: "MOCK01",
    status: "results",
    participants: [
      { id: "player-1", name: "Alice", score: 2850 },
      { id: "player-2", name: "Bob", score: 2400 },
      { id: "player-3", name: "Charlie", score: 2100 },
      { id: "player-4", name: "Diana", score: 1950 },
      { id: "player-5", name: "Eve", score: 1800 },
      { id: "player-6", name: "Frank", score: 1600 },
      { id: "player-7", name: "Grace", score: 1400 },
      { id: "player-8", name: "Henry", score: 1200 },
      { id: "player-9", name: "Alice", score: 2850 },
      { id: "player-10", name: "Bob", score: 2400 },
      { id: "player-11", name: "Charlie", score: 2100 },
      { id: "player-12", name: "Diana", score: 1950 },
      { id: "player-13", name: "Eve", score: 1800 },
      { id: "player-14", name: "Frank", score: 1600 },
      { id: "player-15", name: "Grace", score: 1400 },
      { id: "player-16", name: "Henry", score: 1200 },
    ],
    currentQuestionIndex: 2,
    answeredQuestions: [],
    totalQuestions: 10,
    createdAt: new Date(),
    settings: {
      questionTimeLimit: 30,
      showCorrectAnswers: true,
      allowLateJoins: false,
    },
  };

  return (
    <div className="h-screen">
      <Leaderboard game={mockGame} />
    </div>
  );
}
