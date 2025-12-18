import { type Quiz } from "../types/quiz";
import { DIFFICULTY_VARIANTS } from "../types/quiz";
import { Badge } from "./Badge";

interface QuizOverviewCardProps {
  quiz: Quiz;
  onClick?: () => void;
}

export function QuizOverviewCard({ quiz, onClick }: QuizOverviewCardProps) {
  return (
    <div
      className="bg-white border border-gray-200 rounded-lg p-4 cursor-pointer transition-all duration-300 hover:shadow-lg hover:-translate-y-1"
      onClick={onClick}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === "Enter" && onClick) onClick();
      }}
    >
      <div className="flex justify-between items-start gap-3 mb-3">
        <h3 className="text-lg font-semibold text-gray-900 flex-1">
          {quiz.title}
        </h3>
        {quiz.difficulty && (
          <Badge variant={DIFFICULTY_VARIANTS[quiz.difficulty]}>
            {quiz.difficulty}
          </Badge>
        )}
      </div>

      {quiz.description && (
        <p className="text-sm text-gray-600 line-clamp-2 leading-relaxed mb-3">
          {quiz.description}
        </p>
      )}

      <div className="flex justify-between items-center gap-3 pt-3 border-t border-gray-100">
        {quiz.category && (
          <Badge variant="default" className="px-2 py-1">
            {quiz.category}
          </Badge>
        )}
        <span className="text-xs text-gray-400 font-medium">
          {quiz.questions.length} questions
        </span>
      </div>
    </div>
  );
}
