import { useEffect, useState, useRef } from "react";
import { collection, addDoc } from "firebase/firestore";

import { type Quiz } from "../types";
import { FirebaseQuizDAO } from "../utils/DAO/FirebaseQuizDAO";
import { QuizDetail } from "./QuizDetail";
import { QuizEdit } from "./QuizEdit";
import { QuizOverviewCard } from "./QuizOverviewCard";
import { GameHost } from "../games/GameHost";
import { db } from "../utils/firebase";
import { useAuth } from "../contexts/AuthContext";

const quizDAO = new FirebaseQuizDAO();

export function QuizList() {
  const [quizzes, setQuizzes] = useState<Quiz[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedQuizId, setSelectedQuizId] = useState<string | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [isGameActive, setIsGameActive] = useState(false);
  const [importing, setImporting] = useState(false);
  const [importError, setImportError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { user, isAdmin, isTeacher } = useAuth();

  const selectedQuiz = quizzes.find((q) => q.id === selectedQuizId);

  // Helper function to check if current user can edit/delete a quiz
  const canEditQuiz = (quiz: Quiz) => {
    if (!user) return false;

    // If quiz has no creator (legacy quiz), only admins can edit
    if (!quiz.creatorId) {
      return isAdmin;
    }

    // Quiz has creator - check if current user is creator or admin
    const isCreator = quiz.creatorId === user.uid;
    return isCreator || isAdmin;
  };

  // Get unique categories from quizzes
  const categories = Array.from(
    new Set(quizzes.map((quiz) => quiz.category).filter(Boolean))
  ).sort();

  // Filter quizzes based on search term and category
  const filteredQuizzes = quizzes.filter((quiz) => {
    const matchesSearch =
      quiz.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      quiz.description?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory =
      selectedCategory === "" || quiz.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

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
      creatorId: user?.uid,
      creatorEmail: user?.email || undefined,
      creatorDisplayName: user?.displayName || user?.email || "Unknown User",
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

      if (!isNewQuiz && !canEditQuiz(updatedQuiz)) {
        const errorMessage = !updatedQuiz.creatorId
          ? "This quiz has no creator assigned. Only administrators can edit legacy quizzes."
          : "You don't have permission to save changes to this quiz. Only the creator can edit their own quizzes.";
        alert(errorMessage);
        return;
      }

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

  const handleDeleteQuiz = async (quizId: string) => {
    const quizToDelete = quizzes.find((q) => q.id === quizId);
    if (!quizToDelete || !canEditQuiz(quizToDelete)) {
      const errorMessage = !quizToDelete?.creatorId
        ? "This quiz has no creator assigned. Only administrators can delete legacy quizzes."
        : "You don't have permission to delete this quiz. Only the creator can delete their own quizzes.";
      alert(errorMessage);
      return;
    }

    try {
      await quizDAO.deleteQuiz(quizId);
      // Remove from local state immediately for better UX
      setQuizzes(quizzes.filter((q) => q.id !== quizId));

      // If the deleted quiz was selected, clear the selection
      if (selectedQuizId === quizId) {
        setSelectedQuizId(null);
      }

      alert("Quiz deleted successfully!");
    } catch (err) {
      alert(
        "Error deleting quiz: " +
          (err instanceof Error ? err.message : "Unknown error")
      );
    }
  };

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file && file.type === "application/json") {
      importJsonFile(file);
    } else {
      setImportError("Please select a valid JSON file");
    }
  };

  const importJsonFile = async (file: File) => {
    setImporting(true);
    setImportError(null);

    try {
      const fileContent = await file.text();
      const quizData = JSON.parse(fileContent);

      // Validate required fields
      if (
        !quizData.title ||
        !quizData.questions ||
        !Array.isArray(quizData.questions)
      ) {
        throw new Error("Invalid quiz format: missing title or questions");
      }

      // Add timestamps if they don't exist
      const quizToImport = {
        ...quizData,
        createdAt: quizData.createdAt
          ? new Date(quizData.createdAt)
          : new Date(),
        updatedAt: quizData.updatedAt
          ? new Date(quizData.updatedAt)
          : new Date(),
        // Generate ID if it doesn't exist
        id: quizData.id || `quiz-${Date.now()}`,
        // Add creator information
        creatorId: user?.uid,
        creatorEmail: user?.email || undefined,
        creatorDisplayName: user?.displayName || user?.email || "Unknown User",
      };

      const docRef = await addDoc(collection(db, "quizzes"), quizToImport);

      console.log("Quiz imported successfully with ID: ", docRef.id);

      // Refresh the quiz list (assuming you have a function to reload quizzes)
      // You might need to call your existing function to reload the quiz list
      window.location.reload(); // Simple refresh for now
    } catch (error) {
      console.error("Error importing quiz: ", error);
      setImportError(
        error instanceof Error ? error.message : "Failed to import quiz"
      );
    } finally {
      setImporting(false);
      // Reset file input
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  const triggerFileSelect = () => {
    fileInputRef.current?.click();
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
    // Double-check permissions before showing edit
    if (!canEditQuiz(selectedQuiz)) {
      const errorMessage = !selectedQuiz.creatorId
        ? "This quiz has no creator assigned. Only administrators can edit legacy quizzes."
        : "You don't have permission to edit this quiz.";
      alert(errorMessage);
      setIsEditing(false);
      return null;
    }

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
        onEdit={
          canEditQuiz(selectedQuiz) ? () => setIsEditing(true) : undefined
        }
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
        <div className="flex gap-3">
          {/* Import Button - Only for teachers and admins */}
          {isTeacher && (
            <button
              onClick={triggerFileSelect}
              disabled={importing}
              className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
              {importing ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  Importing...
                </>
              ) : (
                <>
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
                      d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
                    />
                  </svg>
                  Import JSON
                </>
              )}
            </button>
          )}

          {/* Create New Quiz Button - Only for teachers and admins */}
          {isTeacher && (
            <button
              onClick={createNewQuiz}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2"
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
                  d="M12 4v16m8-8H4"
                />
              </svg>
              New Quiz
            </button>
          )}
        </div>
      </div>

      {/* Search and Filter Controls */}
      <div className="mb-6 space-y-4">
        <div className="flex flex-col md:flex-row gap-4">
          {/* Search Input */}
          <div className="flex-1">
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <svg
                  className="h-5 w-5 text-gray-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                  />
                </svg>
              </div>
              <input
                type="text"
                placeholder="Search quizzes by name or description..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>

          {/* Category Filter */}
          <div className="md:w-64">
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="block w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="">All Categories</option>
              {categories.map((category) => (
                <option key={category} value={category}>
                  {category}
                </option>
              ))}
            </select>
          </div>

          {/* Clear Filters Button */}
          {(searchTerm || selectedCategory) && (
            <button
              onClick={() => {
                setSearchTerm("");
                setSelectedCategory("");
              }}
              className="px-4 py-2 text-sm text-gray-600 hover:text-gray-800 border border-gray-300 rounded-lg hover:bg-gray-50"
            >
              Clear Filters
            </button>
          )}
        </div>

        {/* Results Count */}
        <div className="text-sm text-gray-600">
          {searchTerm || selectedCategory ? (
            <>
              Showing {filteredQuizzes.length} of {quizzes.length} quizzes
              {searchTerm && <span> matching "{searchTerm}"</span>}
              {selectedCategory && (
                <span> in category "{selectedCategory}"</span>
              )}
            </>
          ) : (
            `${quizzes.length} quizzes available`
          )}
        </div>
      </div>

      {/* Hidden File Input */}
      <input
        ref={fileInputRef}
        type="file"
        accept=".json,application/json"
        onChange={handleFileSelect}
        className="hidden"
      />

      {/* Import Error Display */}
      {importError && (
        <div className="mb-4 p-4 bg-red-100 border border-red-300 text-red-700 rounded-lg">
          <div className="flex items-center gap-2">
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
              <path
                fillRule="evenodd"
                d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
                clipRule="evenodd"
              />
            </svg>
            <span className="font-medium">Import Error:</span>
          </div>
          <p className="mt-1">{importError}</p>
        </div>
      )}

      {/* Success Message (optional) */}
      {/* You could add a success state similar to the error state */}

      {/* Quiz List Content */}
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
      ) : filteredQuizzes.length === 0 ? (
        <div className="flex flex-col items-center justify-center min-h-96 text-gray-600">
          <svg
            className="w-16 h-16 text-gray-400 mb-4"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
            />
          </svg>
          <p className="mb-2 font-medium">No quizzes match your filters</p>
          <p className="text-sm text-gray-500 mb-4">
            Try adjusting your search term or category filter
          </p>
          <button
            onClick={() => {
              setSearchTerm("");
              setSelectedCategory("");
            }}
            className="px-4 py-2 text-blue-600 hover:text-blue-700 border border-blue-300 rounded-lg hover:bg-blue-50"
          >
            Clear All Filters
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredQuizzes.map((quiz) => (
            <QuizOverviewCard
              key={quiz.id}
              quiz={quiz}
              onClick={() => setSelectedQuizId(quiz.id)}
              onDelete={canEditQuiz(quiz) ? handleDeleteQuiz : undefined}
            />
          ))}
        </div>
      )}
    </div>
  );
}
