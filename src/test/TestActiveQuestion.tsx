import { useState } from "react";
import type { Game } from "../types";
import type { Question, StandardQuestion, TrueFalseQuestion } from "../types";
import { ActiveQuestion } from "../games/host/ActiveQuestion";

export function TestActiveQuestion() {
  const [timeRemaining, setTimeRemaining] = useState(30);

  // Mock game data
  const mockGame: Game = {
    id: "test-game-123",
    gamePin: "123456",
    quizId: "test-quiz",
    hostId: "host-123",
    status: "question",
    participants: [
      {
        id: "p1",
        name: "Alice",
        score: 100,
        joinedAt: new Date(),
        isOnline: true,
        answerHistory: [],
      },
      {
        id: "p2",
        name: "Bob",
        score: 80,
        isOnline: false,
        joinedAt: new Date(),
        answerHistory: [],
      },
      {
        id: "p3",
        name: "Charlie",
        isOnline: true,
        score: 120,
        joinedAt: new Date(),
        answerHistory: [],
      },
    ],
    currentQuestionIndex: 0,
    currentQuestion: {
      startedAt: new Date(),
      endsAt: new Date(Date.now() + 30000),
      answers: [
        {
          participantId: "p1",
          answer: 0,
          answeredAt: new Date(),
          questionId: "",
          isCorrect: false,
          points: 0,
        },
        {
          participantId: "p2",
          answer: 1,
          answeredAt: new Date(),
          questionId: "",
          isCorrect: false,
          points: 0,
        },
      ],
      id: "",
      questionIndex: 0,
    },
    createdAt: new Date(),
    quizTitle: "",
    totalQuestions: 0,
    settings: {
      questionTimeLimit: 0,
      showCorrectAnswers: false,
      allowLateJoins: false,
    },
  };

  const mockStandardQuestion: StandardQuestion = {
    id: "q1",
    type: "standard",
    question: "What is the capital of France?",
    options: [
      {
        text: "London",
        image:
          "https://images.unsplash.com/photo-1513635269975-59663e0ac1ad?w=1000&h=400&fit=crop", // London
      },
      {
        text: "Berlin",
        image:
          "https://images.unsplash.com/photo-1513635269975-59663e0ac1ad?w=400&h=400&fit=crop", // Berlin
      },
      {
        text: "Paris",
        image:
          "https://images.unsplash.com/photo-1513635269975-59663e0ac1ad?w=400&h=400&fit=crop", // Paris
      },
      {
        text: "Madrid",
        image:
          "https://images.unsplash.com/photo-1539037116277-4db20889f2d4?w=100&h=100&fit=crop", // Madrid
      },
    ],
    correctAnswers: [2],
  };

  // Mock true/false question
  const mockTrueFalseQuestion: TrueFalseQuestion = {
    id: "q2",
    type: "true-false",
    question: "The Earth is flat.",
    image:
      "https://images.unsplash.com/photo-1446776653964-20c1d3a81b06?w=400&h=200&fit=crop", // Earth from space
    correctAnswer: false,
  };

  const mockQuiz = {
    questions: [mockStandardQuestion, mockTrueFalseQuestion] as Question[],
  };

  const [currentQuestionType, setCurrentQuestionType] = useState<
    "standard" | "true-false"
  >("standard");

  const currentQuestion: Question =
    currentQuestionType === "standard"
      ? mockStandardQuestion
      : mockTrueFalseQuestion;

  const handleEndQuestion = () => {
    console.log("End question called");
  };

  const handleExit = () => {
    console.log("Exit called");
  };

  let timerRef: number | null = null;

  const startTimer = () => {
    if (timerRef) {
      clearInterval(timerRef);
    }
    setTimeRemaining(30);
    timerRef = setInterval(() => {
      setTimeRemaining((prev) => {
        if (prev <= 1) {
          if (timerRef) {
            clearInterval(timerRef);
            timerRef = null;
          }
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  const resetTimer = () => {
    if (timerRef) {
      clearInterval(timerRef);
      timerRef = null;
    }
    setTimeRemaining(30);
  };

  return (
    <div className="h-screen bg-gray-100">
      {/* Test Controls */}
      <div className="h-48 bg-white p-4 border-b shadow-sm">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-2xl font-bold mb-4">
            ActiveQuestion Test Component
          </h1>

          <div className="flex flex-wrap gap-4 mb-4">
            <button
              onClick={() => setCurrentQuestionType("standard")}
              className={`px-4 py-2 rounded ${
                currentQuestionType === "standard"
                  ? "bg-blue-600 text-white"
                  : "bg-gray-200 text-gray-700"
              }`}
            >
              Standard Question
            </button>

            <button
              onClick={() => setCurrentQuestionType("true-false")}
              className={`px-4 py-2 rounded ${
                currentQuestionType === "true-false"
                  ? "bg-blue-600 text-white"
                  : "bg-gray-200 text-gray-700"
              }`}
            >
              True/False Question
            </button>
          </div>

          <div className="flex gap-4 mb-4">
            <button
              onClick={startTimer}
              className="px-4 py-2 bg-green-600 text-white rounded"
            >
              Start Timer
            </button>

            <button
              onClick={resetTimer}
              className="px-4 py-2 bg-yellow-600 text-white rounded"
            >
              Reset Timer
            </button>
          </div>

          <div className="text-sm text-gray-600">
            <p>
              <strong>Current Question Type:</strong> {currentQuestionType}
            </p>
            <p>
              <strong>Time Remaining:</strong> {timeRemaining}s
            </p>
            <p>
              <strong>Participants:</strong> {mockGame.participants.length}
            </p>
            <p>
              <strong>Answers Received:</strong>{" "}
              {mockGame.currentQuestion?.answers.length || 0}
            </p>
          </div>
        </div>
      </div>

      {/* ActiveQuestion Component */}
      <ActiveQuestion
        game={mockGame}
        currentQuestion={currentQuestion}
        timeRemaining={timeRemaining}
        quiz={mockQuiz}
        onEndQuestion={handleEndQuestion}
        onExit={handleExit}
      />
    </div>
  );
}
