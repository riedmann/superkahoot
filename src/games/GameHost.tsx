import { useEffect, useState, useRef } from "react";
import type { Question, Quiz } from "../types";
import { FirebaseGameDAO } from "./FirebaseGameDAO";
import { ActiveQuestion } from "./host/ActiveQuestion";
import { ShowQuestion } from "./host/ShowQuestion";
import { WaitingForParticipants } from "./host/WaitingForParticipants";
import { QuestionResult } from "./host/QuestionResult";
import { Leaderboard } from "./host/Leaderboard";
import { Countdown } from "./host/Countdown";
import type { Game } from "../types";

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
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const audioRef = useRef<HTMLAudioElement>(null);

  console.log("in host", game?.participants);

  // Music functionality
  const toggleMusic = () => {
    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.pause();
        setIsPlaying(false);
      } else {
        audioRef.current.play().catch((error) => {
          console.error("Error playing audio:", error);
        });
        setIsPlaying(true);
      }
    }
  };

  // Handle audio events
  useEffect(() => {
    const audio = audioRef.current;
    if (audio) {
      const handlePlay = () => setIsPlaying(true);
      const handlePause = () => setIsPlaying(false);
      const handleEnded = () => setIsPlaying(false);

      audio.addEventListener("play", handlePlay);
      audio.addEventListener("pause", handlePause);
      audio.addEventListener("ended", handleEnded);

      return () => {
        audio.removeEventListener("play", handlePlay);
        audio.removeEventListener("pause", handlePause);
        audio.removeEventListener("ended", handleEnded);
      };
    }
  }, []);

  // Fullscreen functionality
  const toggleFullscreen = async () => {
    if (!document.fullscreenElement) {
      try {
        await document.documentElement.requestFullscreen();
        setIsFullscreen(true);
      } catch (err) {
        console.error("Error attempting to enable fullscreen:", err);
      }
    } else {
      try {
        await document.exitFullscreen();
        setIsFullscreen(false);
      } catch (err) {
        console.error("Error attempting to exit fullscreen:", err);
      }
    }
  };

  // Listen for fullscreen changes (including F11 key)
  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };

    document.addEventListener("fullscreenchange", handleFullscreenChange);
    return () => {
      document.removeEventListener("fullscreenchange", handleFullscreenChange);
    };
  }, []);

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
        console.log("GameHost - Game updated:", {
          status: updatedGame.status,
          currentQuestionIndex: updatedGame.currentQuestionIndex,
          answersCount: updatedGame.currentQuestion?.answers.length || 0,
          participantCount: updatedGame.participants.length,
        });

        setGame(updatedGame);

        if (updatedGame.status === "question" && updatedGame.currentQuestion) {
          const question = quiz.questions[
            updatedGame.currentQuestionIndex
          ] as Question;
          setCurrentQuestion(question);

          const currentTime = gameDAO.getCurrentTime();
          const timeLeft = Math.max(
            0,
            updatedGame.currentQuestion.endsAt.getTime() - currentTime.getTime()
          );
          setTimeRemaining(Math.ceil(timeLeft / 1000));

          // Check if all participants have answered
          const answeredParticipants =
            updatedGame.currentQuestion.answers.length;
          const totalParticipants = updatedGame.participants.length;

          console.log("Checking if all answered:", {
            answered: answeredParticipants,
            total: totalParticipants,
            allAnswered:
              answeredParticipants >= totalParticipants &&
              totalParticipants > 0,
          });

          // If all participants have answered, automatically end the question
          if (
            answeredParticipants >= totalParticipants &&
            totalParticipants > 0
          ) {
            console.log(
              "All participants answered - ending question automatically"
            );
            setTimeout(() => {
              handleEndQuestion();
            }, 1000); // Small delay to show the final answer count
          }
        }
      },
      (error) => console.error("Game subscription error:", error)
    );

    return () => unsubscribe();
  }, [game?.id]);

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
          handleEndQuestion();
        }
      }, 1000);

      return () => clearInterval(timer);
    }
  }, [timeRemaining, game?.status, game?.currentQuestion?.endsAt]);

  const handleStartGame = async () => {
    if (!game) return;
    await gameDAO.updateGameStatus(game.id, "active");
  };

  const handleNextQuestion = async () => {
    if (!game) return;

    const nextIndex = game.currentQuestionIndex + 1;
    if (nextIndex < quiz.questions.length) {
      await gameDAO.startCountdown(game.id, nextIndex);
    } else {
      await gameDAO.finishGame(game.id);
    }
  };

  const handleCountdownComplete = async () => {
    if (!game) return;
    await gameDAO.startQuestion(game.id, game.currentQuestionIndex);
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
      {/* Background Music */}
      <audio ref={audioRef} loop preload="auto" crossOrigin="anonymous">
        {/* Local music file - you can add your own music files to public/music/ */}
        <source src="/music/game-music.mp3" type="audio/mpeg" />
        <source src="/music/game-music.ogg" type="audio/ogg" />
        {/* Fallback online source */}
        <source
          src="https://www.soundboard.com/handler/DownLoadTrack.ashx?cliptitle=Kahoot+Lobby+Music+(Better+Quality)&filename=18/187440_478159-lq.mp3"
          type="audio/mpeg"
        />
        Your browser does not support the audio element.
      </audio>

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
            <div className="flex gap-2 items-center">
              <div className="text-sm text-gray-600">
                Participants:{" "}
                <span className="font-bold">{game.participants.length}</span>
              </div>
              <button
                onClick={toggleMusic}
                className="px-3 py-2 bg-green-600 hover:bg-green-700 text-white rounded transition-colors duration-200 flex items-center gap-1"
                title={isPlaying ? "Stop Music" : "Play Music"}
              >
                {isPlaying ? (
                  // Stop/Pause icon
                  <svg
                    className="w-4 h-4"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fillRule="evenodd"
                      d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zM7 8a1 1 0 012 0v4a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v4a1 1 0 102 0V8a1 1 0 00-1-1z"
                      clipRule="evenodd"
                    />
                  </svg>
                ) : (
                  // Play icon
                  <svg
                    className="w-4 h-4"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fillRule="evenodd"
                      d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z"
                      clipRule="evenodd"
                    />
                  </svg>
                )}
              </button>
              <button
                onClick={toggleFullscreen}
                className="px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded transition-colors duration-200 flex items-center gap-1"
                title={
                  isFullscreen ? "Exit Fullscreen" : "Enter Fullscreen (F11)"
                }
              >
                {isFullscreen ? (
                  // Exit fullscreen icon
                  <svg
                    className="w-4 h-4"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fillRule="evenodd"
                      d="M3 4a1 1 0 011-1h4a1 1 0 010 2H6.414l2.293 2.293a1 1 0 01-1.414 1.414L5 6.414V8a1 1 0 01-2 0V4zm9 1a1 1 0 010-2h4a1 1 0 011 1v4a1 1 0 01-2 0V6.414l-2.293 2.293a1 1 0 01-1.414-1.414L13.586 5H12zm-9 7a1 1 0 012 0v1.586l2.293-2.293a1 1 0 111.414 1.414L6.414 15H8a1 1 0 010 2H4a1 1 0 01-1-1v-4zm13-1a1 1 0 011 1v4a1 1 0 01-1 1h-4a1 1 0 010-2h1.586l-2.293-2.293a1 1 0 111.414-1.414L15 13.586V12a1 1 0 011-1z"
                      clipRule="evenodd"
                    />
                  </svg>
                ) : (
                  // Enter fullscreen icon
                  <svg
                    className="w-4 h-4"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fillRule="evenodd"
                      d="M3 4a1 1 0 011-1h4a1 1 0 010 2H6.414l2.293 2.293a1 1 0 01-1.414 1.414L5 6.414V8a1 1 0 01-2 0V4zm9 1a1 1 0 010-2h4a1 1 0 011 1v4a1 1 0 01-2 0V6.414l-2.293 2.293a1 1 0 01-1.414-1.414L13.586 5H12zm-9 7a1 1 0 012 0v1.586l2.293-2.293a1 1 0 111.414 1.414L6.414 15H8a1 1 0 010 2H4a1 1 0 01-1-1v-4zm13-1a1 1 0 011 1v4a1 1 0 01-1 1h-4a1 1 0 010-2h1.586l-2.293-2.293a1 1 0 111.414-1.414L15 13.586V12a1 1 0 011-1z"
                      clipRule="evenodd"
                    />
                  </svg>
                )}
              </button>
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

        {game.status === "countdown" && (
          <Countdown
            game={game}
            onCountdownComplete={handleCountdownComplete}
            questionNumber={game.currentQuestionIndex + 1}
            totalQuestions={quiz.questions.length}
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

              <Leaderboard game={game} title="Final Leaderboard" />

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
