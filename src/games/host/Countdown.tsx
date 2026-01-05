import { useEffect, useState } from "react";
import type { Game } from "../../types";
import type { Question } from "../../types/question";

interface CountdownProps {
  game: Game;
  onCountdownComplete: () => void;
  questionNumber: number;
  totalQuestions: number;
  question?: Question;
}

export function Countdown({
  game,
  onCountdownComplete,
  questionNumber,
  totalQuestions,
  question,
}: CountdownProps) {
  const [count, setCount] = useState(3);

  useEffect(() => {
    if (count > 0) {
      const timer = setTimeout(() => {
        setCount(count - 1);
      }, 1000);

      return () => clearTimeout(timer);
    } else {
      // Countdown finished, start the question
      onCountdownComplete();
    }
  }, [count, onCountdownComplete]);

  return (
    <div className="fixed inset-0 bg-gradient-to-br from-blue-600 to-purple-700 z-50 flex items-center justify-center">
      <div className="text-center text-white max-w-4xl px-8">
        {question && (
          <div className="mb-8">
            <h2 className="text-4xl font-bold mb-4">{question.question}</h2>
          </div>
        )}
        <div className="mb-6">
          <h2 className="text-2xl font-bold mb-2">Get Ready!</h2>
          <p className="text-lg opacity-90">
            Question {questionNumber} of {totalQuestions}
          </p>
          <p className="text-sm opacity-75 mt-2">
            {game.participants.length} participant
            {game.participants.length !== 1 ? "s" : ""} joined
          </p>
        </div>

        <div className="relative">
          <div className="text-8xl font-bold mb-4 animate-pulse">{count}</div>

          {/* Circular progress indicator */}
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
            <svg
              className="w-32 h-32 transform -rotate-90"
              viewBox="0 0 100 100"
            >
              <circle
                cx="50"
                cy="50"
                r="45"
                stroke="currentColor"
                strokeWidth="2"
                fill="none"
                className="opacity-20"
              />
              <circle
                cx="50"
                cy="50"
                r="45"
                stroke="currentColor"
                strokeWidth="3"
                fill="none"
                strokeDasharray={`${283} 283`}
                strokeDashoffset={283 - (283 * (3 - count)) / 3}
                className="transition-all duration-1000 ease-linear"
                strokeLinecap="round"
              />
            </svg>
          </div>
        </div>
      </div>
    </div>
  );
}
