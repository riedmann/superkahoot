import { useState } from "react";

interface AIQuizGeneratorModalProps {
  isOpen: boolean;
  onClose: () => void;
  onGenerate: (
    topic: string,
    difficulty: string,
    questionCount: number
  ) => void;
  isGenerating: boolean;
  error?: string | null;
  onClearError?: () => void;
}

export function AIQuizGeneratorModal({
  isOpen,
  onClose,
  onGenerate,
  isGenerating,
  error,
  onClearError,
}: AIQuizGeneratorModalProps) {
  const [topic, setTopic] = useState("");
  const [difficulty, setDifficulty] = useState("medium");
  const [questionCount, setQuestionCount] = useState(5);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (topic.trim()) {
      onClearError?.();
      onGenerate(topic.trim(), difficulty, questionCount);
    }
  };

  const handleClose = () => {
    if (!isGenerating) {
      setTopic("");
      onClearError?.();
      onClose();
    }
  };

  console.log("error", error);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
        <h2 className="text-xl font-bold text-gray-900 mb-4">
          Generate Quiz with AI (Gemini)
        </h2>

        {/* Error Display */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-3 flex items-start gap-2">
            <svg
              className="w-5 h-5 text-red-600 shrink-0 mt-0.5"
              fill="currentColor"
              viewBox="0 0 20 20"
            >
              <path
                fillRule="evenodd"
                d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                clipRule="evenodd"
              />
            </svg>
            <div className="flex-1">
              <p className="text-sm font-medium text-red-800">Error</p>
              <p className="text-sm text-red-700 mt-1">
                {JSON.parse(error).error.message}
              </p>
            </div>
            <button
              type="button"
              onClick={onClearError}
              className="text-red-600 hover:text-red-800 transition-colors"
              aria-label="Dismiss error"
            >
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                <path
                  fillRule="evenodd"
                  d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                  clipRule="evenodd"
                />
              </svg>
            </button>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label
              htmlFor="topic"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Topic *
            </label>
            <input
              type="text"
              id="topic"
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              placeholder="e.g., JavaScript basics, World History, Biology..."
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              required
              disabled={isGenerating}
            />
          </div>

          <div>
            <label
              htmlFor="difficulty"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Difficulty
            </label>
            <select
              id="difficulty"
              value={difficulty}
              onChange={(e) => setDifficulty(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              disabled={isGenerating}
            >
              <option value="easy">Easy</option>
              <option value="medium">Medium</option>
              <option value="hard">Hard</option>
            </select>
          </div>

          <div>
            <label
              htmlFor="questionCount"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Number of Questions
            </label>
            <input
              type="number"
              id="questionCount"
              value={questionCount}
              onChange={(e) =>
                setQuestionCount(
                  Math.max(1, Math.min(15, parseInt(e.target.value) || 5))
                )
              }
              min="1"
              max="15"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              disabled={isGenerating}
            />
          </div>

          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={handleClose}
              className="flex-1 px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors disabled:opacity-50"
              disabled={isGenerating}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={!topic.trim() || isGenerating}
              className="flex-1 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
            >
              {isGenerating ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  Generating...
                </>
              ) : (
                "Generate Quiz"
              )}
            </button>
          </div>
        </form>

        <p className="text-xs text-gray-500 mt-3">
          * Requires Google Gemini API key configured in environment variables
        </p>
      </div>
    </div>
  );
}
