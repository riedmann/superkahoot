import { useEffect, useState } from "react";
import type { Question, Quiz } from "../types/quiz";
import { FirebaseGameDAO } from "./FirebaseGameDAO";
import { ActiveQuestion } from "./host/ActiveQuestion";
import { ShowQuestion } from "./host/ShowQuestion";
import { WaitingForParticipants } from "./host/WaitingForParticipants";
import { QuestionResult } from "./host/QuestionResult";
import type { Game } from "./types";

interface GameHostProps {
  quiz: Quiz;
  onBack: () => void;
}

const gameDAO = new FirebaseGameDAO();

export function GameHost({ quiz, onBack }: GameHostProps) {
  const [game, setGame] = useState<Game | null>(null);
  const [loading, setLoading] = useState(true);
  const [currentQuestion, setCurrentQuestion] = useState<Question | null>(null);
  const [timeRemaining, setTimeRemaining] = useState(0);

  console.log("in host", game?.participants);

  useEffect(() => {
    const initGame = async () => {
      try {
        const newGame = await gameDAO.createGame(quiz, "host123"); // TODO: Get actual host ID
        setGame(newGame);
        setLoading(false);
      } catch (error) {
        console.error("Error creating game:", error);
        setLoading(false);
      }
    };

    initGame();
  }, [quiz]);

  useEffect(() => {
    if (!game) return;

    const unsubscribe = gameDAO.subscribeToGame(
      game.id,
      (updatedGame) => {
        setGame(updatedGame);

        if (updatedGame.status === "question" && updatedGame.currentQuestion) {
          const question = quiz.questions[
            updatedGame.currentQuestionIndex
          ] as Question;
          setCurrentQuestion(question);

          const timeLeft = Math.max(
            0,
            updatedGame.currentQuestion.endsAt.getTime() - Date.now()
          );
          setTimeRemaining(Math.ceil(timeLeft / 1000));
        }
      },
      (error) => console.error("Game subscription error:", error)
    );

    return () => unsubscribe();
  }, [game?.id, quiz.questions]);

  useEffect(() => {
    if (timeRemaining > 0 && game?.status === "question") {
      const timer = setInterval(() => {
        setTimeRemaining((prev) => {
          if (prev <= 1) {
            handleEndQuestion();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);

      return () => clearInterval(timer);
    }
  }, [timeRemaining, game?.status]);

  const handleStartGame = async () => {
    if (!game) return;
    await gameDAO.updateGameStatus(game.id, "active");
  };

  const handleNextQuestion = async () => {
    if (!game) return;

    const nextIndex = game.currentQuestionIndex + 1;
    if (nextIndex < quiz.questions.length) {
      await gameDAO.startQuestion(game.id, nextIndex);
    } else {
      await gameDAO.finishGame(game.id);
    }
  };

  const handleEndQuestion = async () => {
    if (!game) return;
    await gameDAO.endQuestion(game.id);
  };

  const handleShowNextQuestion = () => {
    handleNextQuestion();
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="text-lg">Creating game...</div>
        </div>
      </div>
    );
  }

  if (!game) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="text-red-600">Failed to create game</div>
          <button
            onClick={onBack}
            className="mt-4 px-4 py-2 bg-gray-600 text-white rounded"
          >
            Back to Quiz
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-4xl mx-auto px-6 py-4">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-bold">{quiz.title}</h1>
              <div className="text-sm text-gray-600">
                Game PIN:{" "}
                <span className="font-mono text-lg font-bold text-blue-600">
                  {game.gamePin}
                </span>
              </div>
            </div>
            <div className="flex gap-2">
              <div className="text-sm text-gray-600">
                Participants:{" "}
                <span className="font-bold">{game.participants.length}</span>
              </div>
              <button
                onClick={onBack}
                className="px-4 py-2 bg-gray-600 text-white rounded"
              >
                End Game
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Game Content */}
      <div className="max-w-4xl mx-auto px-6 py-8">
        {game.status === "waiting" && (
          <WaitingForParticipants game={game} onStartGame={handleStartGame} />
        )}

        {game.status === "active" && (
          <ShowQuestion
            game={game}
            quiz={quiz}
            onShowQuestion={handleNextQuestion}
          />
        )}

        {game.status === "question" && currentQuestion && (
          <ActiveQuestion
            game={game}
            currentQuestion={currentQuestion}
            timeRemaining={timeRemaining}
            quiz={{ questions: quiz.questions }}
            onEndQuestion={handleEndQuestion}
            onExit={onBack}
          />
        )}

        {game.status === "results" && currentQuestion && (
          <QuestionResult
            game={game}
            currentQuestion={currentQuestion}
            quiz={quiz}
            onShowNextQuestion={handleShowNextQuestion}
          />
        )}

        {game.status === "finished" && (
          <div className="text-center">
            <div className="bg-white rounded-lg p-8 shadow-lg">
              <h2 className="text-3xl font-bold mb-6">Game Finished!</h2>

              {/* Final Leaderboard */}
              <div className="mb-8">
                <h3 className="text-xl font-semibold mb-4">
                  Final Leaderboard
                </h3>
                <div className="max-w-md mx-auto">
                  {[...game.participants]
                    .sort((a, b) => b.score - a.score)
                    .map((participant, index) => {
                      const isWinner = index === 0;
                      const isPodium = index < 3;

                      return (
                        <div
                          key={participant.id}
                          className={`flex justify-between items-center p-3 rounded-lg mb-2 ${
                            isWinner
                              ? "bg-yellow-100 border-2 border-yellow-400"
                              : isPodium
                              ? "bg-blue-50 border border-blue-200"
                              : "bg-gray-50 border border-gray-200"
                          }`}
                        >
                          <div className="flex items-center gap-3">
                            <div
                              className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
                                isWinner
                                  ? "bg-yellow-500 text-white"
                                  : isPodium
                                  ? "bg-blue-500 text-white"
                                  : "bg-gray-400 text-white"
                              }`}
                            >
                              {index + 1}
                            </div>
                            <div className="font-medium">
                              {participant.name}
                            </div>
                          </div>
                          <div className="text-lg font-bold">
                            {participant.score}
                          </div>
                        </div>
                      );
                    })}
                </div>

                <div className="mt-4 text-sm text-gray-600">
                  Total Participants: {game.participants.length}
                </div>
              </div>

              <button
                onClick={onBack}
                className="px-8 py-3 bg-gray-600 text-white font-bold text-lg rounded"
              >
                Back to Quiz
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
