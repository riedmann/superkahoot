import type { Question } from "../../types";
import type { Game } from "../../types";
import { QuestionFooter } from "./QuestionFooter";
import { QuestionWithImage } from "./QuestionWithImage";
import { QuestionWithoutImage } from "./QuestionWithoutImage";

interface ActiveQuestionProps {
  game: Game;
  currentQuestion: Question;
  timeRemaining: number;
  quiz: { questions: Question[] };
  onEndQuestion: () => void;
  onExit: () => void;
}

export function ActiveQuestion({
  game,
  currentQuestion,
  timeRemaining,
  quiz,
  onEndQuestion,
  onExit,
}: ActiveQuestionProps) {
  const hasQuestionImage = !!currentQuestion.image;

  return (
    <div className="fixed inset-0 bg-linear-to-br from-blue-600 to-purple-700 z-50">
      <div className="h-full flex flex-col text-white">
        {/* Header */}
        <div className="flex justify-between items-center p-3">
          <div className="text-base font-semibold">
            Question {game.currentQuestionIndex + 1} of {quiz.questions.length}
          </div>
          <div className="text-2xl font-bold">{timeRemaining}s</div>
        </div>

        {/* Question Display */}
        <div className="flex-1 flex flex-col justify-center px-4">
          {hasQuestionImage ? (
            <QuestionWithImage currentQuestion={currentQuestion} />
          ) : (
            <QuestionWithoutImage currentQuestion={currentQuestion} />
          )}
        </div>

        {/* Footer with participant tracking and controls */}
        <QuestionFooter
          game={game}
          onEndQuestion={onEndQuestion}
          onExit={onExit}
        />
      </div>
    </div>
  );
}
