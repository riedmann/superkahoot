import { useState, useEffect } from "react";
import type { Game, Participant } from "./types";
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

        // Reset hasAnswered when new question starts
        if (updatedGame.currentQuestionIndex !== prevQuestionIndex) {
          setHasAnswered(false);
        }

        // Update timer when question starts
        if (updatedGame.status === "question" && updatedGame.currentQuestion) {
          const timeLeft = Math.max(
            0,
            updatedGame.currentQuestion.endsAt.getTime() - Date.now()
          );
          setTimeRemaining(Math.ceil(timeLeft / 1000));
        }
      },
      (error) => setError(error)
    );

    return () => unsubscribe();
  }, [game?.id, game?.currentQuestionIndex]);

  useEffect(() => {
    if (timeRemaining > 0 && game?.status === "question") {
      const timer = setInterval(() => {
        setTimeRemaining((prev) => {
          if (prev <= 1) {
            return 0;
          }
          return prev - 1;
        });
      }, 1000);

      return () => clearInterval(timer);
    }
  }, [timeRemaining, game?.status]);

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

  const handleSubmitAnswer = async (answer: any) => {
    if (!game || !participant || !game.currentQuestion || hasAnswered) return;

    try {
      await gameDAO.submitAnswer(game.id, {
        participantId: participant.id,
        questionId: game.currentQuestion.id,
        answer,
      });
      setHasAnswered(true);
    } catch (error) {
      console.error("Failed to submit answer:", error);
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
            {/* TODO: Show if answer was correct and current score */}
            <div className="text-gray-600">Waiting for next question...</div>
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
