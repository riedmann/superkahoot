import { useState } from "react";
import { questionRegistry } from "../types/QuestionTypeRegistry";
import type { Question, Quiz } from "../types/quiz";
import { Badge } from "./Badge";

interface QuizEditProps {
  quiz: Quiz;
  onBack: () => void;
  onSave?: (quiz: Quiz) => void;
}

export function QuizEdit({ quiz, onBack, onSave }: QuizEditProps) {
  const [title, setTitle] = useState(quiz.title);
  const [description, setDescription] = useState(quiz.description || "");
  const [category, setCategory] = useState(quiz.category || "");
  const [difficulty, setDifficulty] = useState(quiz.difficulty || "medium");
  const [questions, setQuestions] = useState<Question[]>(
    quiz.questions.filter(
      (q) => q && typeof q === "object" && "type" in q
    ) as Question[]
  );
  const [newQuestionType, setNewQuestionType] = useState<string>(
    questionRegistry.getAvailableTypes()[0] || "true-false"
  );

  const addQuestion = (questionType?: string) => {
    const typeToUse = questionType || newQuestionType;
    const handler = questionRegistry.getHandler(typeToUse);
    if (handler) {
      const newQuestion = handler.createNew();
      setQuestions([newQuestion, ...questions]);
    }
  };

  const updateQuestion = (id: string, updatedQuestion: Partial<Question>) => {
    setQuestions(
      questions.map((q: Question) =>
        q.id === id ? ({ ...q, ...updatedQuestion } as Question) : q
      )
    );
  };

  const deleteQuestion = (id: string) => {
    setQuestions(questions.filter((q) => q.id !== id));
  };

  const handleSave = () => {
    const updatedQuiz: Quiz = {
      ...quiz,
      title,
      description,
      category,
      difficulty: difficulty as "easy" | "medium" | "hard",
      questions,
    };
    onSave?.(updatedQuiz);
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
            ← Back
          </button>

          <h1 className="text-3xl font-bold text-gray-900 mb-6">Edit Quiz</h1>

          {/* Quiz Info */}
          <div className="space-y-4 mb-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Title
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Description
              </label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Category
                </label>
                <input
                  type="text"
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Difficulty
                </label>
                <select
                  value={difficulty}
                  onChange={(e) =>
                    setDifficulty(e.target.value as "easy" | "medium" | "hard")
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="easy">Easy</option>
                  <option value="medium">Medium</option>
                  <option value="hard">Hard</option>
                </select>
              </div>
            </div>
          </div>

          <div className="flex gap-2">
            <button
              onClick={handleSave}
              className="px-4 py-2 bg-green-600 text-white font-medium rounded-lg hover:bg-green-700 transition-colors"
            >
              Save Changes
            </button>
            <button
              onClick={onBack}
              className="px-4 py-2 bg-gray-300 text-gray-700 font-medium rounded-lg hover:bg-gray-400 transition-colors"
            >
              Cancel
            </button>
          </div>
        </div>
      </div>

      {/* Questions Editor */}
      <div className="max-w-4xl mx-auto px-6 py-8">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-gray-900">
            Questions ({questions.length})
          </h2>
          <div className="flex gap-2">
            {questionRegistry.getAvailableHandlers().map((handler) => (
              <button
                key={handler.type}
                onClick={() => {
                  addQuestion(handler.type);
                }}
                className="px-4 py-2 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors"
              >
                + Add {handler.label}
              </button>
            ))}
          </div>
        </div>

        <div className="space-y-6">
          {questions.map((question, index) => (
            <div
              key={question.id}
              className="bg-white border border-gray-200 rounded-lg p-6"
            >
              <div className="flex justify-between items-start mb-4">
                <div>
                  <Badge variant="default">
                    {question.type === "true-false"
                      ? "True/False"
                      : "Multiple Choice"}
                  </Badge>
                  <div className="text-sm text-gray-600 mt-2">
                    Question {index + 1}
                  </div>
                </div>
                <button
                  onClick={() => deleteQuestion(question.id)}
                  className="px-3 py-1 text-red-600 hover:text-red-700 font-medium text-sm"
                >
                  Delete
                </button>
              </div>

              {(() => {
                const handler = questionRegistry.getHandler(question.type);
                return handler ? (
                  handler.getEditor(question, (updates) =>
                    updateQuestion(question.id, updates)
                  )
                ) : (
                  <p className="text-red-600">
                    Unknown question type: {question.type}
                  </p>
                );
              })()}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
