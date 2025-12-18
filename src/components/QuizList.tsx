import { useEffect, useState } from "react";
import { type Quiz } from "../types/quiz";
import { FirebaseQuizDAO } from "../utils/DAO/FirebaseQuizDAO";
import { QuizDetail } from "./QuizDetail";
import { QuizEdit } from "./QuizEdit";
import { QuizOverviewCard } from "./QuizOverviewCard";
import { GameHost } from "../games/GameHost";

const quizDAO = new FirebaseQuizDAO();

export function QuizList() {
  const [quizzes, setQuizzes] = useState<Quiz[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedQuizId, setSelectedQuizId] = useState<string | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [isGameActive, setIsGameActive] = useState(false);

  const selectedQuiz = quizzes.find((q) => q.id === selectedQuizId);

  useEffect(() => {
    setLoading(true);
    const unsubscribe = quizDAO.subscribeToQuizzes(
      (quizzesData) => {
        setQuizzes(quizzesData);
        setError(null);
        setLoading(false);
      },
      (errorMessage) => {
        setError(errorMessage);
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, []);

  const createNewQuiz = () => {
    const newQuiz: Quiz = {
      id: `quiz_${Date.now()}`,
      title: "New Quiz",
      description: "",
      questions: [],
      difficulty: "medium",
      category: "",
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    // Add to local state temporarily
    setQuizzes([...quizzes, newQuiz]);
    setSelectedQuizId(newQuiz.id);
    setIsEditing(true);
  };

  const handleSaveQuiz = async (updatedQuiz: Quiz) => {
    try {
      // Check if this is a new quiz (starts with quiz_ and not in Firestore yet)
      const isNewQuiz = updatedQuiz.id.startsWith("quiz_");

      if (isNewQuiz) {
        // For new quizzes, create a new document with auto-generated ID
        const savedQuiz = await quizDAO.createQuiz(updatedQuiz);

        // Remove the temporary quiz and add the saved one
        setQuizzes(
          quizzes.filter((q) => q.id !== updatedQuiz.id).concat(savedQuiz)
        );
        setSelectedQuizId(savedQuiz.id);
      } else {
        // For existing quizzes, update normally
        await quizDAO.saveQuiz(updatedQuiz);

        // Refresh the quiz from Firestore to ensure latest data
        const refreshedQuiz = await quizDAO.fetchQuizById(updatedQuiz.id);
        setQuizzes(
          quizzes.map((q) => (q.id === updatedQuiz.id ? refreshedQuiz : q))
        );
      }

      setIsEditing(false);
      alert("Quiz saved successfully!");
    } catch (err) {
      alert(
        "Error saving quiz: " +
          (err instanceof Error ? err.message : "Unknown error")
      );
    }
  };

  const handleStartGame = () => {
    setIsGameActive(true);
  };

  // Show game if active
  if (isGameActive && selectedQuiz) {
    return (
      <GameHost
        quiz={selectedQuiz}
        onBack={() => {
          setIsGameActive(false);
          setSelectedQuizId(null);
        }}
      />
    );
  }

  // Show game if active
  if (isGameActive && selectedQuiz) {
    return (
      <GameHost
        quiz={selectedQuiz}
        onBack={() => {
          setIsGameActive(false);
          setSelectedQuizId(null);
        }}
      />
    );
  }

  // Show quiz edit if editing
  if (isEditing && selectedQuiz) {
    return (
      <QuizEdit
        quiz={selectedQuiz}
        onBack={() => setIsEditing(false)}
        onSave={handleSaveQuiz}
      />
    );
  }

  // Show quiz detail if selected
  if (selectedQuiz) {
    return (
      <QuizDetail
        quiz={selectedQuiz}
        onBack={() => setSelectedQuizId(null)}
        onEdit={() => setIsEditing(true)}
        onStartGame={handleStartGame}
      />
    );
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-96 text-gray-600">
        Loading quizzes...
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-96 bg-red-50 border border-red-200 rounded-lg text-red-600">
        Error: {error}
      </div>
    );
  }

  return (
    <div className="px-6 py-8 max-w-6xl mx-auto">
      <div className="flex justify-between items-center mb-8">
        <h2 className="text-3xl font-bold text-gray-900">Available Quizzes</h2>
        <button
          onClick={createNewQuiz}
          className="px-6 py-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
        >
          <span className="text-lg">+</span>
          New Quiz
        </button>
      </div>

      {quizzes.length === 0 ? (
        <div className="flex flex-col items-center justify-center min-h-96 text-gray-600">
          <p className="mb-4">No quizzes available</p>
          <button
            onClick={createNewQuiz}
            className="px-6 py-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition-colors"
          >
            Create Your First Quiz
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {quizzes.map((quiz) => (
            <QuizOverviewCard
              key={quiz.id}
              quiz={quiz}
              onClick={() => setSelectedQuizId(quiz.id)}
            />
          ))}
        </div>
      )}
    </div>
  );
}
