import type { Question } from "../types";
import { questionRegistry } from "../types/QuestionTypeRegistry";
import { Badge } from "./Badge";
import { MarkdownRenderer } from "./MarkdownRenderer";

interface QuestionCardProps {
  question: Question;
}

export function QuestionCard({ question }: QuestionCardProps) {
  const handler = questionRegistry.getHandler(question.type);

  if (!handler) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-6 mb-4 text-red-600">
        Unknown question type: {question.type}
      </div>
    );
  }

  return (
    <div className="bg-white border border-gray-200 rounded-lg p-6 mb-4">
      <div className="flex gap-3 mb-4">
        <Badge variant="default" className="h-fit">
          {handler.label}
        </Badge>
      </div>

      <div className="text-lg font-semibold text-gray-900 mb-4 prose prose-lg max-w-none">
        <MarkdownRenderer content={question.question} />
      </div>

      {handler.getDisplay(question)}
    </div>
  );
}
