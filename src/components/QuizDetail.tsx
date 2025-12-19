import { useState } from "react";
import type { Quiz, Question } from "../types";
import { DIFFICULTY_VARIANTS } from "../types";
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
  const [expandedQuestions, setExpandedQuestions] = useState<Set<string>>(
    new Set() // Start with all questions closed
  );

  const toggleQuestionExpansion = (questionId: string) => {
    setExpandedQuestions((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(questionId)) {
        newSet.delete(questionId);
      } else {
        newSet.add(questionId);
      }
      return newSet;
    });
  };
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
              const typedQuestion = question as Question;
              const isExpanded = expandedQuestions.has(typedQuestion.id);

              return (
                <div
                  key={typedQuestion.id}
                  className="bg-white border border-gray-200 rounded-lg overflow-hidden"
                >
                  {/* Accordion Header */}
                  <div
                    className="p-4 cursor-pointer hover:bg-gray-50 transition-colors"
                    onClick={() => toggleQuestionExpansion(typedQuestion.id)}
                  >
                    <div className="flex justify-between items-center">
                      <div className="flex items-center gap-3">
                        <svg
                          className={`w-5 h-5 text-gray-400 transition-transform ${
                            isExpanded ? "rotate-90" : ""
                          }`}
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M9 5l7 7-7 7"
                          />
                        </svg>
                        <div className="text-sm font-medium text-gray-900">
                          Question {index + 1}
                        </div>
                        <Badge variant="default">
                          {typedQuestion.type === "true-false"
                            ? "True/False"
                            : "Multiple Choice"}
                        </Badge>
                      </div>
                      <div className="text-sm text-gray-600 max-w-lg truncate">
                        {typedQuestion.question}
                      </div>
                    </div>
                  </div>

                  {/* Accordion Content */}
                  {isExpanded && (
                    <div className="border-t border-gray-200 p-4">
                      <QuestionCard question={typedQuestion} />
                    </div>
                  )}
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
