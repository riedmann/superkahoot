import { useEffect, useRef, useState } from "react";
import { QuestionBroadcast } from "./QuestionBroadcast";
import { ParticipantName } from "../components/ui/details/ParticipantName";
import type { Question, Quiz, GameStatus, Game } from "../types";

interface GameHostProps {
  quiz: Quiz;
  onBack: () => void;
}

const WS_URL = "ws://localhost:8080";

export function GameHost({ quiz, onBack }: GameHostProps) {
  const [game, setGame] = useState<Game>();
  const [loading, setLoading] = useState(true);
  const [currentQuestion, setCurrentQuestion] = useState<Question | null>(null);
  const [timeRemaining, setTimeRemaining] = useState(0);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const wsRef = useRef<WebSocket | null>(null);
  const audioRef = useRef<HTMLAudioElement>(null);

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
  // useEffect(() => {
  //   const audio = audioRef.current;
  //   if (audio) {
  //     const handlePlay = () => setIsPlaying(true);
  //     const handlePause = () => setIsPlaying(false);
  //     const handleEnded = () => setIsPlaying(false);

  //     audio.addEventListener("play", handlePlay);
  //     audio.addEventListener("pause", handlePause);
  //     audio.addEventListener("ended", handleEnded);

  //     return () => {
  //       audio.removeEventListener("play", handlePlay);
  //       audio.removeEventListener("pause", handlePause);
  //       audio.removeEventListener("ended", handleEnded);
  //     };
  //   }
  // }, []);

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
  // useEffect(() => {
  //   const handleFullscreenChange = () => {
  //     setIsFullscreen(!!document.fullscreenElement);
  //   };

  //   document.addEventListener("fullscreenchange", handleFullscreenChange);
  //   return () => {
  //     document.removeEventListener("fullscreenchange", handleFullscreenChange);
  //   };
  // }, []);

  // WebSocket setup for host
  useEffect(() => {
    const ws = new window.WebSocket(WS_URL);
    wsRef.current = ws;

    ws.onopen = () => {
      // Send create_game with quiz data
      ws.send(
        JSON.stringify({
          type: "create_game",
          data: {
            quizId: quiz.id,
            quizTitle: quiz.title,
            quizData: quiz,
            hostId: "host123", // TODO: use real host id
          },
        })
      );
    };

    ws.onmessage = (event) => {
      try {
        const msg = JSON.parse(event.data);
        switch (msg.type) {
          case "game_created":
            setGame({
              id: msg.gameId,
              quizId: quiz.id,
              quizTitle: quiz.title,
              participants: [],
              gamePin: msg.gameId,
              status: "waiting" as GameStatus,
              hostId: "host123", // or msg.hostId if available
              currentQuestionIndex: -1,
              totalQuestions: quiz.questions.length,
              createdAt: new Date(),
              settings: {
                questionTimeLimit: 30, // default to 30 seconds
                showCorrectAnswers: true,
                allowLateJoins: false,
              }, // or provide default settings if needed
            });
            setLoading(false);
            break;
          case "joined":
            setGame((g: any) =>
              g
                ? {
                    ...g,
                    participants: [
                      ...(g.participants || []),
                      { name: msg.player, id: msg.player, score: 0 },
                    ],
                  }
                : g
            );
            break;
          case "next_question":
            setGame(msg.game);
            if (msg.game.currentQuestionIndex !== undefined && quiz.questions) {
              const question = quiz.questions[
                msg.game.currentQuestionIndex
              ] as Question;
              setCurrentQuestion(question);
            }
            break;
          case "error":
            setError(msg.message);
            setLoading(false);
            break;
          default:
            break;
        }
      } catch (e) {
        setError("Invalid message from server");
      }
    };

    ws.onerror = (e) => {
      setError("WebSocket error: " + JSON.stringify(e));
    };

    ws.onclose = () => {
      // Optionally handle close
    };

    return () => {
      ws.close();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [quiz.id]);

  // Listen for game updates from ws
  useEffect(() => {
    if (!wsRef.current) return;
    const ws = wsRef.current;
    const handleMessage = (event: MessageEvent) => {
      try {
        const msg = JSON.parse(event.data);
        if (msg.type === "game_update") {
          setGame(msg.game);
          if (msg.game.status === "question" && msg.game.currentQuestion) {
            const question = quiz.questions[
              msg.game.currentQuestionIndex
            ] as Question;
            setCurrentQuestion(question);
            // Use server time if provided, else local
            const endsAt = new Date(msg.game.currentQuestion.endsAt);
            const now = msg.serverTime ? new Date(msg.serverTime) : new Date();
            const timeLeft = Math.max(0, endsAt.getTime() - now.getTime());
            setTimeRemaining(Math.ceil(timeLeft / 1000));
            // Auto end if all answered
            const answered = msg.game.currentQuestion.answers.length;
            const total = msg.game.participants.length;
            if (answered >= total && total > 0) {
              setTimeout(() => handleEndQuestion(), 1000);
            }
          }
        }
      } catch (e) {
        // ignore
      }
    };
    ws.addEventListener("message", handleMessage);
    return () => ws.removeEventListener("message", handleMessage);
  }, [quiz, wsRef, game]);

  useEffect(() => {
    if (
      timeRemaining > 0 &&
      game?.status === "question" &&
      game.currentQuestion
    ) {
      const timer = setInterval(() => {
        // Use local time for countdown (server time sync can be added)
        const endsAt = new Date(game.currentQuestion?.endsAt ?? Date.now());
        const now = new Date();
        const timeLeft = Math.max(0, endsAt.getTime() - now.getTime());
        const newTimeRemaining = Math.ceil(timeLeft / 1000);
        setTimeRemaining(newTimeRemaining);
        if (newTimeRemaining <= 0) {
          handleEndQuestion();
        }
      }, 1000);
      return () => clearInterval(timer);
    }
  }, [timeRemaining, game?.status, game?.currentQuestion?.endsAt]);

  // Host actions via ws
  const sendWs = (msg: any) => {
    if (wsRef.current && wsRef.current.readyState === 1) {
      wsRef.current.send(JSON.stringify(msg));
    }
  };

  const handleStartGame = () => {
    if (!game) return;
    sendWs({ type: "start_game", gameId: game.id });
  };

  const handleNextQuestion = () => {
    if (!game) return;
    const nextIndex = game.currentQuestionIndex + 1;
    if (nextIndex < quiz.questions.length) {
      sendWs({
        type: "start_countdown",
        gameId: game.id,
        questionIndex: nextIndex,
      });
    } else {
      sendWs({ type: "finish_game", gameId: game.id });
    }
  };

  const handleCountdownComplete = () => {
    if (!game) return;
    sendWs({
      type: "start_question",
      gameId: game.id,
      questionIndex: game.currentQuestionIndex,
    });
  };

  const handleEndQuestion = () => {
    if (!game) return;
    sendWs({ type: "end_question", gameId: game.id });
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
                <span className="font-bold">
                  {game.participants ? game.participants.length : 0}
                </span>
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
          <div>
            <h2 className="text-xl font-bold mb-4">
              Waiting for participants...
            </h2>
            <ul className="mb-4 grid grid-cols-1 md:grid-cols-2 gap-2">
              {(game.participants || []).map((p: any) => (
                <ParticipantName key={p.id} name={p.name} />
              ))}
            </ul>
            {game.participants && game.participants.length > 0 && (
              <button
                onClick={handleStartGame}
                className="mt-4 px-6 py-3 bg-blue-600 text-white font-bold rounded-lg shadow hover:bg-blue-700 transition-colors duration-200"
              >
                Start Game
              </button>
            )}
          </div>
        )}

        {game.status === "countdown" && (
          <div className="text-center my-8">
            <h2 className="text-2xl font-bold mb-4">
              Next question starting soon!
            </h2>
            <div className="text-5xl font-bold text-blue-600 mb-2">
              {timeRemaining}s
            </div>
            <button
              onClick={handleCountdownComplete}
              className="mt-4 px-6 py-3 bg-green-600 text-white font-bold rounded-lg shadow hover:bg-green-700 transition-colors duration-200"
            >
              Show Question
            </button>
          </div>
        )}

        {game.status === "question" && currentQuestion && (
          <QuestionBroadcast
            gameId={game.id}
            question={currentQuestion}
            index={game.currentQuestionIndex}
            ws={wsRef.current}
            timeRemaining={timeRemaining}
            onEndQuestion={handleEndQuestion}
          />
        )}
      </div>
    </div>
  );
}
