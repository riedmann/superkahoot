import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import type { Quiz } from "../types/quiz";
import { FirebaseQuizDAO } from "../utils/DAO/FirebaseQuizDAO";
import { isTrueFalseQuestion } from "../types/question";
import { FullscreenButton } from "../components/ui/details/FullscreenButton";
import { useFullscreen } from "../games/hooks/useFullscreen";

const quizDAO = new FirebaseQuizDAO();

type AnswerResult = {
  questionIndex: number;
  isCorrect: boolean;
  userAnswer: boolean | number[];
  correctAnswer: boolean | number[];
};

export function PracticeQuiz() {
  const { quizId } = useParams<{ quizId: string }>();
  const navigate = useNavigate();

  const [quiz, setQuiz] = useState<Quiz | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState<number[]>([]);
  const [hasAnswered, setHasAnswered] = useState(false);
  const [answerResults, setAnswerResults] = useState<AnswerResult[]>([]);
  const [showResults, setShowResults] = useState(false);

  const { isFullscreen, toggleFullscreen } = useFullscreen();

  useEffect(() => {
    async function loadQuiz() {
      if (!quizId) {
        setError("No quiz ID provided");
        setLoading(false);
        return;
      }

      try {
        const loadedQuiz = await quizDAO.fetchQuizById(quizId);
        if (!loadedQuiz) {
          setError("Quiz not found");
        } else {
          setQuiz(loadedQuiz);
        }
      } catch (err) {
        setError("Failed to load quiz");
        console.error(err);
      } finally {
        setLoading(false);
      }
    }

    loadQuiz();
  }, [quizId]);

  const currentQuestion = quiz?.questions[currentQuestionIndex];

  const handleAnswerSelect = (answerIndex: number) => {
    if (hasAnswered) return;

    if (currentQuestion?.type === "true-false") {
      setSelectedAnswers([answerIndex]);
    } else {
      // For standard questions, toggle selection
      if (selectedAnswers.includes(answerIndex)) {
        setSelectedAnswers(selectedAnswers.filter((i) => i !== answerIndex));
      } else {
        setSelectedAnswers([...selectedAnswers, answerIndex]);
      }
    }
  };

  const handleSubmitAnswer = () => {
    if (!currentQuestion || selectedAnswers.length === 0) return;

    let isCorrect = false;
    let correctAnswer: boolean | number[];

    if (isTrueFalseQuestion(currentQuestion)) {
      const userAnswer = selectedAnswers[0] === 0;
      correctAnswer = currentQuestion.correctAnswer;
      isCorrect = userAnswer === currentQuestion.correctAnswer;
    } else {
      const userAnswer = selectedAnswers.sort();
      const correctAnswersArray = [...currentQuestion.correctAnswers].sort();
      correctAnswer = correctAnswersArray;
      isCorrect =
        userAnswer.length === correctAnswersArray.length &&
        userAnswer.every((val, idx) => val === correctAnswersArray[idx]);
    }

    const result: AnswerResult = {
      questionIndex: currentQuestionIndex,
      isCorrect,
      userAnswer: isTrueFalseQuestion(currentQuestion)
        ? selectedAnswers[0] === 0
        : selectedAnswers,
      correctAnswer,
    };

    setAnswerResults([...answerResults, result]);
    setHasAnswered(true);
  };

  const handleNextQuestion = () => {
    if (!quiz) return;

    if (currentQuestionIndex < quiz.questions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
      setSelectedAnswers([]);
      setHasAnswered(false);
    } else {
      setShowResults(true);
    }
  };

  const handleRestart = () => {
    setCurrentQuestionIndex(0);
    setSelectedAnswers([]);
    setHasAnswered(false);
    setAnswerResults([]);
    setShowResults(false);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-600 via-blue-600 to-indigo-700 flex items-center justify-center">
        <div className="text-white text-2xl">Quiz wird geladen...</div>
      </div>
    );
  }

  if (error || !quiz) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-600 via-blue-600 to-indigo-700 flex items-center justify-center">
        <div className="bg-white rounded-lg p-8 shadow-xl max-w-md">
          <h2 className="text-2xl font-bold text-red-600 mb-4">Fehler</h2>
          <p className="text-gray-700 mb-6">{error || "Quiz nicht gefunden"}</p>
          <button
            onClick={() => navigate("/")}
            className="bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700"
          >
            Zur Startseite
          </button>
        </div>
      </div>
    );
  }

  if (showResults) {
    const correctCount = answerResults.filter((r) => r.isCorrect).length;
    const totalQuestions = quiz.questions.length;
    const percentage = Math.round((correctCount / totalQuestions) * 100);

    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-600 via-blue-600 to-indigo-700 flex items-center justify-center p-4">
        <div className="bg-white rounded-lg p-8 shadow-xl max-w-2xl w-full">
          <h1 className="text-3xl font-bold text-center mb-6 text-gray-800">
            {quiz.title} - Ergebnisse
          </h1>

          <div className="text-center mb-8">
            <div className="text-6xl font-bold text-blue-600 mb-2">
              {percentage}%
            </div>
            <p className="text-xl text-gray-600">
              {correctCount} von {totalQuestions} richtig
            </p>
          </div>

          <div className="space-y-4 mb-8">
            {quiz.questions.map((question, idx) => {
              const result = answerResults[idx];
              return (
                <div
                  key={question.id}
                  className={`p-4 rounded-lg ${
                    result?.isCorrect
                      ? "bg-green-100 border-2 border-green-500"
                      : "bg-red-100 border-2 border-red-500"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-semibold">Frage {idx + 1}</span>
                    <span
                      className={`text-sm font-bold ${
                        result?.isCorrect ? "text-green-700" : "text-red-700"
                      }`}
                    >
                      {result?.isCorrect ? "✓ Richtig" : "✗ Falsch"}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="flex gap-4 justify-center">
            <button
              onClick={handleRestart}
              className="bg-blue-600 text-white px-8 py-3 rounded-lg hover:bg-blue-700 font-semibold"
            >
              Nochmal versuchen
            </button>
            <button
              onClick={() => navigate("/")}
              className="bg-gray-600 text-white px-8 py-3 rounded-lg hover:bg-gray-700 font-semibold"
            >
              Beenden
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (!currentQuestion) {
    return null;
  }

  const progress = ((currentQuestionIndex + 1) / quiz.questions.length) * 100;

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-600 via-blue-600 to-indigo-700 flex flex-col">
      {/* Header */}
      <div className="bg-white shadow-md p-4">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-start justify-between mb-2">
            <h1 className="text-2xl font-bold text-gray-800">{quiz.title}</h1>
            <FullscreenButton
              isFullscreen={isFullscreen}
              onToggle={toggleFullscreen}
              className="bg-gray-800 hover:bg-gray-700 text-white p-2 rounded-lg transition"
            />
          </div>
          <div className="flex items-center justify-between text-sm text-gray-600">
            <span>
              Frage {currentQuestionIndex + 1} von {quiz.questions.length}
            </span>
            <span>{Math.round(progress)}% Abgeschlossen</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
            <div
              className="bg-blue-600 h-2 rounded-full transition-all duration-300"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>
      </div>

      {/* Question */}
      <div className="flex-1 flex items-center justify-center p-4">
        <div className="bg-white rounded-lg shadow-xl p-8 max-w-4xl w-full">
          {currentQuestion.image && (
            <div className="mb-6">
              <img
                src={currentQuestion.image}
                alt="Question"
                className="max-w-full h-auto rounded-lg mx-auto max-h-64 object-contain"
              />
            </div>
          )}

          <h2 className="text-2xl font-bold text-gray-800 mb-6">
            {currentQuestion.question}
          </h2>

          <div className="space-y-3 mb-6">
            {isTrueFalseQuestion(currentQuestion) ? (
              <>
                <button
                  onClick={() => handleAnswerSelect(0)}
                  disabled={hasAnswered}
                  className={`w-full p-4 rounded-lg text-left font-semibold text-lg transition-all ${
                    selectedAnswers.includes(0)
                      ? hasAnswered
                        ? currentQuestion.correctAnswer
                          ? "bg-green-500 text-white"
                          : "bg-red-500 text-white"
                        : "bg-blue-600 text-white"
                      : hasAnswered && currentQuestion.correctAnswer
                        ? "bg-green-100 border-2 border-green-500"
                        : "bg-gray-100 hover:bg-gray-200"
                  } ${hasAnswered ? "cursor-not-allowed" : "cursor-pointer"}`}
                >
                  Wahr
                </button>
                <button
                  onClick={() => handleAnswerSelect(1)}
                  disabled={hasAnswered}
                  className={`w-full p-4 rounded-lg text-left font-semibold text-lg transition-all ${
                    selectedAnswers.includes(1)
                      ? hasAnswered
                        ? !currentQuestion.correctAnswer
                          ? "bg-green-500 text-white"
                          : "bg-red-500 text-white"
                        : "bg-blue-600 text-white"
                      : hasAnswered && !currentQuestion.correctAnswer
                        ? "bg-green-100 border-2 border-green-500"
                        : "bg-gray-100 hover:bg-gray-200"
                  } ${hasAnswered ? "cursor-not-allowed" : "cursor-pointer"}`}
                >
                  Falsch
                </button>
              </>
            ) : (
              currentQuestion.options.map((option, idx) => {
                const isCorrect = currentQuestion.correctAnswers.includes(idx);
                const isSelected = selectedAnswers.includes(idx);

                return (
                  <button
                    key={idx}
                    onClick={() => handleAnswerSelect(idx)}
                    disabled={hasAnswered}
                    className={`w-full p-4 rounded-lg text-left font-semibold transition-all ${
                      isSelected
                        ? hasAnswered
                          ? isCorrect
                            ? "bg-green-500 text-white"
                            : "bg-red-500 text-white"
                          : "bg-blue-600 text-white"
                        : hasAnswered && isCorrect
                          ? "bg-green-100 border-2 border-green-500"
                          : "bg-gray-100 hover:bg-gray-200"
                    } ${hasAnswered ? "cursor-not-allowed" : "cursor-pointer"}`}
                  >
                    <div className="flex items-center gap-3">
                      {option.image && (
                        <img
                          src={option.image}
                          alt={`Option ${idx + 1}`}
                          className="w-16 h-16 object-cover rounded"
                        />
                      )}
                      <span>{option.text}</span>
                    </div>
                  </button>
                );
              })
            )}
          </div>

          {hasAnswered && (
            <div
              className={`mb-6 p-4 rounded-lg ${
                answerResults[answerResults.length - 1]?.isCorrect
                  ? "bg-green-100 text-green-800"
                  : "bg-red-100 text-red-800"
              }`}
            >
              <p className="font-bold text-lg">
                {answerResults[answerResults.length - 1]?.isCorrect
                  ? "✓ Richtig!"
                  : "✗ Falsch"}
              </p>
            </div>
          )}

          <div className="flex justify-end gap-4">
            {!hasAnswered ? (
              <button
                onClick={handleSubmitAnswer}
                disabled={selectedAnswers.length === 0}
                className={`px-8 py-3 rounded-lg font-semibold ${
                  selectedAnswers.length === 0
                    ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                    : "bg-blue-600 text-white hover:bg-blue-700"
                }`}
              >
                Antwort abschicken
              </button>
            ) : (
              <button
                onClick={handleNextQuestion}
                className="bg-blue-600 text-white px-8 py-3 rounded-lg hover:bg-blue-700 font-semibold"
              >
                {currentQuestionIndex < quiz.questions.length - 1
                  ? "Nächste Frage"
                  : "Ergebnisse anzeigen"}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
