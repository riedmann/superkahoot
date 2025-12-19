import { type Quiz } from "../types";
import { DIFFICULTY_VARIANTS } from "../types";
import { Badge } from "./Badge";

interface QuizOverviewCardProps {
  quiz: Quiz;
  onClick?: () => void;
  onDelete?: (quizId: string) => void;
}

export function QuizOverviewCard({
  quiz,
  onClick,
  onDelete,
}: QuizOverviewCardProps) {
  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation();

    if (
      window.confirm(
        `Are you sure you want to delete "${quiz.title}"?\n\nThis action cannot be undone.`
      )
    ) {
      onDelete?.(quiz.id);
    }
  };

  return (
    <div
      className="bg-white border border-gray-200 rounded-lg p-4 cursor-pointer transition-all duration-300 hover:shadow-lg hover:-translate-y-1 relative group"
      onClick={onClick}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === "Enter" && onClick) onClick();
      }}
    >
      {onDelete && (
        <button
          onClick={handleDelete}
          className="absolute top-2 right-2 w-8 h-8 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex items-center justify-center hover:bg-red-600 z-10"
          title="Delete Quiz"
        >
          <svg
            className="w-4 h-4"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
            />
          </svg>
        </button>
      )}

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
