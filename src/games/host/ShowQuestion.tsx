import type { Quiz } from "../../types";
import type { Game } from "../../types";

interface ShowQuestionProps {
  game: Game;
  quiz: Quiz;
  onShowQuestion: () => void;
}

export function ShowQuestion({
  game,
  quiz,
  onShowQuestion,
}: ShowQuestionProps) {
  return (
    <div className="text-center">
      <div className="bg-white rounded-lg p-8 shadow-lg">
        <h2 className="text-2xl font-bold mb-4">Ready to start!</h2>
        <div className="text-gray-600 mb-6">
          Question {game.currentQuestionIndex + 2} of {quiz.questions.length}
        </div>
        <button
          onClick={onShowQuestion}
          className="px-8 py-3 bg-blue-600 text-white font-bold text-lg rounded"
        >
          Show Question
        </button>
      </div>
    </div>
  );
}
