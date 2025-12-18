import type { Quiz, Question } from "../types/quiz";
import { DIFFICULTY_VARIANTS } from "../types/quiz";
import { Badge } from "./Badge";
import { QuestionCard } from "./QuestionCard";

interface QuizDetailProps {
  quiz: Quiz;
  onBack: () => void;
  onEdit?: () => void;
  onStartGame: () => void;
}

export function QuizDetail({
  quiz,
  onBack,
  onEdit,
  onStartGame,
}: QuizDetailProps) {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-4xl mx-auto px-6 py-8">
          <button
            onClick={onBack}
            className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-700 font-medium mb-6"
          >
            ← Back to Quizzes
          </button>

          <div className="flex justify-between items-start gap-4 mb-4">
            <div>
              <h1 className="text-4xl font-bold text-gray-900 mb-2">
                {quiz.title}
              </h1>
              {quiz.description && (
                <p className="text-lg text-gray-600">{quiz.description}</p>
              )}
            </div>
            <div className="flex flex-col gap-2">
              {quiz.difficulty && (
                <Badge variant={DIFFICULTY_VARIANTS[quiz.difficulty]}>
                  {quiz.difficulty}
                </Badge>
              )}
              {onEdit && (
                <button
                  onClick={onEdit}
                  className="px-4 py-2 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors text-sm"
                >
                  Edit Quiz
                </button>
              )}
              {onStartGame && (
                <button
                  onClick={onStartGame}
                  className="px-4 py-2 bg-green-600 text-white font-medium rounded-lg hover:bg-green-700 transition-colors text-sm"
                >
                  Start Game
                </button>
              )}
            </div>
          </div>

          <div className="flex gap-4">
            {quiz.category && <Badge variant="default">{quiz.category}</Badge>}
            <div className="text-sm text-gray-600 font-medium">
              {quiz.questions.length} Questions
            </div>
          </div>
        </div>
      </div>

      {/* Questions */}
      <div className="max-w-4xl mx-auto px-6 py-8">
        <div className="space-y-4">
          {quiz.questions.map((question, index) => {
            // Type guard to ensure question is a proper Question object
            if (
              typeof question === "object" &&
              question !== null &&
              "id" in question &&
              "type" in question
            ) {
              return (
                <div key={question.id}>
                  <div className="text-sm font-semibold text-gray-500 mb-2">
                    Question {index + 1}
                  </div>
                  <QuestionCard question={question as Question} />
                </div>
              );
            }
            return null;
          })}
        </div>
      </div>
    </div>
  );
}
