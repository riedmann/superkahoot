import { useState, useEffect } from "react";
import type { Game, Participant } from "../types";
import { FirebaseGameDAO } from "./FirebaseGameDAO";

interface GameClientProps {
  gamePin?: string;
}

const gameDAO = new FirebaseGameDAO();

export function GameClient({ gamePin: initialPin }: GameClientProps) {
  const [gamePin, setGamePin] = useState(initialPin || "");
  const [playerName, setPlayerName] = useState("");
  const [game, setGame] = useState<Game | null>(null);
  const [participant, setParticipant] = useState<Participant | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hasAnswered, setHasAnswered] = useState(false);
  const [timeRemaining, setTimeRemaining] = useState(0);

  useEffect(() => {
    if (!game) return;

    const unsubscribe = gameDAO.subscribeToGame(
      game.id,
      (updatedGame) => {
        const prevQuestionIndex = game.currentQuestionIndex;
        setGame(updatedGame);

        // Update participant data with latest from game
        if (participant) {
          const updatedParticipant = updatedGame.participants.find(
            (p) => p.id === participant.id
          );
          if (updatedParticipant) {
            setParticipant(updatedParticipant);
          }
        }

        // Reset hasAnswered when new question starts
        if (updatedGame.currentQuestionIndex !== prevQuestionIndex) {
          setHasAnswered(false);
        }

        // Update timer when question starts
        if (updatedGame.status === "question" && updatedGame.currentQuestion) {
          const currentTime = gameDAO.getCurrentTime();
          const timeLeft = Math.max(
            0,
            updatedGame.currentQuestion!.endsAt.getTime() -
              currentTime.getTime()
          );
          setTimeRemaining(Math.ceil(timeLeft / 1000));
        }
      },
      (error) => setError(error)
    );

    return () => unsubscribe();
  }, [game?.id, game?.currentQuestionIndex, participant?.id]);

  useEffect(() => {
    if (
      timeRemaining > 0 &&
      game?.status === "question" &&
      game.currentQuestion
    ) {
      const timer = setInterval(() => {
        // Use server time for accurate countdown
        const currentTime = gameDAO.getCurrentTime();
        const timeLeft = Math.max(
          0,
          game.currentQuestion!.endsAt.getTime() - currentTime.getTime()
        );
        const newTimeRemaining = Math.ceil(timeLeft / 1000);

        setTimeRemaining(newTimeRemaining);

        if (newTimeRemaining <= 0) {
          setTimeRemaining(0);
        }
      }, 1000);

      return () => clearInterval(timer);
    }
  }, [timeRemaining, game?.status, game?.currentQuestion?.endsAt]);

  const handleJoinGame = async () => {
    if (!gamePin || !playerName.trim()) return;

    setLoading(true);
    setError(null);

    try {
      const foundGame = await gameDAO.getGameByPin(gamePin);

      if (!foundGame) {
        setError("Game not found. Check the PIN and try again.");
        setLoading(false);
        return;
      }

      if (
        foundGame.status !== "waiting" &&
        !foundGame.settings.allowLateJoins
      ) {
        setError("This game has already started and doesn't allow late joins.");
        setLoading(false);
        return;
      }

      const newParticipant = await gameDAO.addParticipant(foundGame.id, {
        name: playerName.trim(),
        isOnline: true,
      });

      setGame(foundGame);
      setParticipant(newParticipant);

      // Fetch quiz data to get question details
      try {
        // We'll need to import QuizDAO to get quiz details
        // For now, we'll work with the game data
      } catch (quizError) {
        console.warn("Could not fetch quiz details:", quizError);
      }

      setLoading(false);
    } catch (err) {
      setError("Failed to join game. Please try again.");
      setLoading(false);
    }
  };

  const handleSubmitAnswer = async (answer: any, retryCount = 0) => {
    if (!game || !participant || !game.currentQuestion || hasAnswered) {
      console.log("Cannot submit answer:", {
        game: !!game,
        participant: !!participant,
        currentQuestion: !!game?.currentQuestion,
        hasAnswered,
      });
      return;
    }

    console.log("Submitting answer:", {
      participantId: participant.id,
      answer,
      gameId: game.id,
      questionId: game.currentQuestion.id,
      retryCount,
    });

    try {
      await gameDAO.submitAnswer(game.id, {
        participantId: participant.id,
        questionId: game.currentQuestion.id,
        answer,
      });
      setHasAnswered(true);
      console.log("Answer submitted successfully");
    } catch (error) {
      console.error(
        `Failed to submit answer (attempt ${retryCount + 1}):`,
        error
      );

      // Retry up to 3 times for network errors
      if (
        retryCount < 2 &&
        error instanceof Error &&
        (error.message.includes("network") ||
          error.message.includes("Failed to submit answer"))
      ) {
        console.log(
          `Retrying answer submission (attempt ${retryCount + 2})...`
        );
        setTimeout(() => {
          handleSubmitAnswer(answer, retryCount + 1);
        }, 1000 * (retryCount + 1)); // Exponential backoff
      } else {
        setError(
          `Failed to submit answer: ${
            error instanceof Error ? error.message : "Unknown error"
          }`
        );
      }
    }
  };

  if (!game) {
    return (
      <div className="min-h-screen bg-blue-600 flex items-center justify-center">
        <div className="bg-white rounded-lg p-8 shadow-xl max-w-md w-full mx-4">
          <h1 className="text-3xl font-bold text-center mb-8">Join Game</h1>

          {error && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
              {error}
            </div>
          )}

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Game PIN
              </label>
              <input
                type="text"
                value={gamePin}
                onChange={(e) => setGamePin(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-center text-lg font-mono"
                placeholder="Enter PIN"
                maxLength={6}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Your Name
              </label>
              <input
                type="text"
                value={playerName}
                onChange={(e) => setPlayerName(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Enter your name"
                maxLength={20}
              />
            </div>

            <button
              onClick={handleJoinGame}
              disabled={loading || !gamePin || !playerName.trim()}
              className="w-full px-4 py-3 bg-blue-600 text-white font-bold text-lg rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? "Joining..." : "Join Game"}
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-blue-600">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-md mx-auto px-4 py-3">
          <div className="text-center">
            <h1 className="text-lg font-bold">{game.quizTitle}</h1>
            <div className="text-sm text-gray-600">{participant?.name}</div>
          </div>
        </div>
      </div>

      {/* Game Content */}
      <div className="max-w-md mx-auto px-4 py-6">
        {game.status === "waiting" && (
          <div className="bg-white rounded-lg p-6 text-center">
            <h2 className="text-xl font-bold mb-4">
              Waiting for game to start...
            </h2>
            <div className="text-gray-600">
              Players joined: {game.participants.length}
            </div>
          </div>
        )}

        {game.status === "active" && (
          <div className="bg-white rounded-lg p-6 text-center">
            <h2 className="text-xl font-bold mb-4">Get Ready!</h2>
            <div className="text-gray-600">Next question is coming up...</div>
          </div>
        )}

        {game.status === "question" && game.currentQuestion && (
          <div className="space-y-4">
            {/* Question Timer */}
            <div className="bg-white rounded-lg p-4 text-center">
              <div className="text-2xl font-bold text-red-600">
                {timeRemaining}s
              </div>
            </div>

            {/* Question Info */}
            <div className="bg-white rounded-lg p-4 text-center">
              <div className="text-sm text-gray-600">
                Question {game.currentQuestionIndex + 1} of{" "}
                {game.totalQuestions}
              </div>
            </div>

            {/* Answer Options - Only Colors */}
            <div className="space-y-4">
              {hasAnswered ? (
                <div className="bg-white rounded-lg p-6 text-center text-green-600 font-bold">
                  ✓ Answer submitted!
                </div>
              ) : (
                <div className="grid grid-cols-2 gap-4">
                  {(() => {
                    const colors = [
                      {
                        bg: "bg-red-500",
                        hover: "hover:bg-red-600",
                        label: "A",
                        icon: "▲",
                      },
                      {
                        bg: "bg-blue-500",
                        hover: "hover:bg-blue-600",
                        label: "B",
                        icon: "◆",
                      },
                      {
                        bg: "bg-yellow-500",
                        hover: "hover:bg-yellow-600",
                        label: "C",
                        icon: "●",
                      },
                      {
                        bg: "bg-green-500",
                        hover: "hover:bg-green-600",
                        label: "D",
                        icon: "■",
                      },
                    ];

                    // For true/false questions, only show 2 options
                    if (game.quizData?.questions) {
                      const currentQuestion =
                        game.quizData.questions[game.currentQuestionIndex];
                      if (currentQuestion?.type === "true-false") {
                        return colors.slice(0, 2).map((color, index) => (
                          <button
                            key={index}
                            onClick={() => handleSubmitAnswer(index === 0)}
                            className={`aspect-square ${color.bg} ${color.hover} text-white font-bold rounded-2xl transition-all duration-200 transform active:scale-95 flex flex-col items-center justify-center text-2xl shadow-lg`}
                          >
                            <div className="text-4xl mb-2">{color.icon}</div>
                            <div className="text-lg">{color.label}</div>
                          </button>
                        ));
                      }
                    }

                    // For multiple choice, show all 4 options
                    return colors.map((color, index) => (
                      <button
                        key={index}
                        onClick={() => handleSubmitAnswer(index)}
                        className={`aspect-square ${color.bg} ${color.hover} text-white font-bold rounded-2xl transition-all duration-200 transform active:scale-95 flex flex-col items-center justify-center text-2xl shadow-lg`}
                      >
                        <div className="text-4xl mb-2">{color.icon}</div>
                        <div className="text-lg">{color.label}</div>
                      </button>
                    ));
                  })()}
                </div>
              )}
            </div>
          </div>
        )}

        {game.status === "results" && (
          <div className="bg-white rounded-lg p-6 text-center">
            <h2 className="text-xl font-bold mb-4">Question Results</h2>

            {(() => {
              // Find the participant's answer for the current question
              const myAnswer = game.currentQuestion?.answers.find(
                (a) => a.participantId === participant?.id
              );

              // Get the correct answer information from quiz data
              const currentQuizQuestion =
                game.quizData?.questions[game.currentQuestionIndex];

              return (
                <div className="space-y-4">
                  {myAnswer ? (
                    <>
                      {/* Correctness Indicator */}
                      <div
                        className={`p-4 rounded-lg ${
                          myAnswer.isCorrect
                            ? "bg-green-100 border-2 border-green-300"
                            : "bg-red-100 border-2 border-red-300"
                        }`}
                      >
                        <div
                          className={`text-3xl font-bold mb-2 ${
                            myAnswer.isCorrect
                              ? "text-green-600"
                              : "text-red-600"
                          }`}
                        >
                          {myAnswer.isCorrect ? "✓ Correct!" : "✗ Incorrect"}
                        </div>

                        {/* Points Earned */}
                        <div
                          className={`text-xl font-semibold ${
                            myAnswer.isCorrect
                              ? "text-green-700"
                              : "text-red-700"
                          }`}
                        >
                          +{myAnswer.points} points
                        </div>
                      </div>

                      {/* Show correct answer if they were wrong */}
                      {!myAnswer.isCorrect && currentQuizQuestion && (
                        <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                          <div className="text-sm font-medium text-blue-800 mb-2">
                            Correct Answer:
                          </div>
                          <div className="text-blue-700">
                            {currentQuizQuestion.type === "true-false" ? (
                              <span className="font-semibold">
                                {currentQuizQuestion.correctAnswer
                                  ? "True"
                                  : "False"}
                              </span>
                            ) : (
                              <span className="font-semibold">
                                {currentQuizQuestion.correctAnswers
                                  ?.map((answerIndex: number) => {
                                    const option =
                                      currentQuizQuestion.options[answerIndex];
                                    return typeof option === "string"
                                      ? option
                                      : option?.text || "Unknown option";
                                  })
                                  .join(", ")}
                              </span>
                            )}
                          </div>
                        </div>
                      )}

                      {/* Current Total Score */}
                      <div className="p-3 bg-gray-50 rounded-lg">
                        <div className="text-sm text-gray-600 mb-1">
                          Your Total Score
                        </div>
                        <div className="text-2xl font-bold text-blue-600">
                          {participant?.score || 0}
                        </div>
                      </div>
                    </>
                  ) : (
                    /* Player didn't answer */
                    <div className="p-4 bg-gray-100 border-2 border-gray-300 rounded-lg">
                      <div className="text-xl font-bold text-gray-600 mb-2">
                        No Answer
                      </div>
                      <div className="text-gray-500">
                        You didn't submit an answer in time
                      </div>

                      {/* Show correct answer */}
                      {currentQuizQuestion && (
                        <div className="mt-3 p-3 bg-blue-50 border border-blue-200 rounded">
                          <div className="text-sm font-medium text-blue-800 mb-1">
                            Correct Answer:
                          </div>
                          <div className="text-blue-700 font-semibold">
                            {currentQuizQuestion.type === "true-false"
                              ? currentQuizQuestion.correctAnswer
                                ? "True"
                                : "False"
                              : currentQuizQuestion.correctAnswers
                                  ?.map((answerIndex: number) => {
                                    const option = currentQuizQuestion.options[answerIndex];
                                    return typeof option === "string" 
                                      ? option 
                                      : option?.text || "Unknown option";
                                  })
                                  .join(", ")}
                          </div>
                        </div>
                      )}
                    </div>
                  )}

                  <div className="text-gray-600 text-sm">
                    Waiting for next question...
                  </div>
                </div>
              );
            })()}
          </div>
        )}

        {game.status === "finished" && (
          <div className="bg-white rounded-lg p-6 text-center">
            <h2 className="text-2xl font-bold mb-4">Game Over!</h2>
            <div className="mb-6">
              <div className="text-3xl font-bold text-blue-600 mb-2">
                {participant?.score || 0}
              </div>
              <div className="text-lg text-gray-600">Your Final Score</div>
            </div>

            {/* Show ranking */}
            {(() => {
              const sortedParticipants = [...game.participants].sort(
                (a, b) => b.score - a.score
              );
              const myRank =
                sortedParticipants.findIndex((p) => p.id === participant?.id) +
                1;

              return (
                <div className="mb-6">
                  <div className="text-lg font-semibold mb-2">
                    You finished #{myRank} out of {game.participants.length}
                  </div>

                  {/* Show top 3 */}
                  <div className="text-sm text-gray-600">
                    <h4 className="font-medium mb-2">Final Rankings:</h4>
                    <div className="space-y-1">
                      {sortedParticipants.slice(0, 3).map((p, index) => (
                        <div
                          key={p.id}
                          className="flex justify-between items-center"
                        >
                          <span>
                            #{index + 1} {p.name}
                          </span>
                          <span className="font-bold">{p.score}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              );
            })()}
          </div>
        )}
      </div>
    </div>
  );
}
