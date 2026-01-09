import { QuestionResult } from "../games/host/QuestionResult";
import type { Game } from "../types/game";
import type { Quiz, StandardQuestion } from "../types/quiz";

export function QuestionResultMock() {
  const mockQuestion: StandardQuestion = {
    id: "q1",
    type: "standard",
    question: "What is the capital of France?",
    options: [
      { text: "Paris" },
      { text: "London" },
      { text: "Berlin" },
      { text: "Madrid" },
    ],
    correctAnswers: [0],
    timeLimit: 30,
    image: "https://images.unsplash.com/photo-1499856871958-5b9627545d1a?w=600",
  };

  const mockQuiz: Quiz = {
    id: "quiz-1",
    title: "Geography Quiz",
    description: "Test your geography knowledge",
    questions: [mockQuestion],
    createdAt: new Date(),
    difficulty: "medium",
    category: "Geography",
  };

  const mockGame: Game = {
    id: "game-123",
    quizId: "quiz-1",
    quizTitle: "Geography Quiz",
    quizData: mockQuiz,
    hostId: "host-1",
    gamePin: "ABC123",
    status: "results",
    participants: [
      { id: "p1", name: "Alice", score: 1000 },
      { id: "p2", name: "Bob", score: 850 },
      { id: "p3", name: "Charlie", score: 750 },
      { id: "p4", name: "Diana", score: 600 },
    ],
    currentQuestionIndex: 0,
    answeredQuestions: [
      {
        id: "aq1",
        questionIndex: 0,
        startedAt: new Date(),
        endsAt: new Date(),
        answers: [
          {
            participant: { id: "p1", name: "Alice", score: 1000 },
            questionId: "q1",
            answer: 0, // Paris (correct)
            answeredAt: new Date(),
            isCorrect: true,
            points: 1000,
          },
          {
            participant: { id: "p2", name: "Bob", score: 850 },
            questionId: "q1",
            answer: 0, // Paris (correct)
            answeredAt: new Date(),
            isCorrect: true,
            points: 850,
          },
          {
            participant: { id: "p3", name: "Charlie", score: 750 },
            questionId: "q1",
            answer: 1, // London (wrong)
            answeredAt: new Date(),
            isCorrect: false,
            points: 0,
          },
          {
            participant: { id: "p4", name: "Diana", score: 600 },
            questionId: "q1",
            answer: 2, // Berlin (wrong)
            answeredAt: new Date(),
            isCorrect: false,
            points: 0,
          },
        ],
      },
    ],
    totalQuestions: 1,
    createdAt: new Date(),
    settings: {
      questionTimeLimit: 30,
      showCorrectAnswers: true,
      allowLateJoins: false,
    },
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-600 to-blue-700 p-8">
      <QuestionResult
        game={mockGame}
        currentQuestion={mockQuestion}
        quiz={mockQuiz}
        onShowNextQuestion={() => console.log("Next question clicked")}
      />
    </div>
  );
}
