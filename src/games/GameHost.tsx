import React, { useEffect, useRef, useState, useCallback } from "react";
import type { Game, GameStatus } from "../types/game";
import type { Quiz } from "../types/quiz";
import { Countdown } from "./host/Countdown";
import { QuestionFooter } from "./host/QuestionFooter";
import { QuestionResult } from "./host/QuestionResult";
import { QuestionWithoutImage } from "./host/QuestionWithoutImage";
import { WinnersScreen } from "./host/WinnersScreen";

interface GameHostProps {
  quiz: Quiz;
  onBack: () => void;
}

// WebSocket URL aus Environment-Variable oder Fallback
const WS_URL = "ws://localhost:8080";
//  const WS_URL = process.env.REACT_APP_WS_URL || "ws://localhost:8080";
export const GameHost: React.FC<GameHostProps> = ({ quiz, onBack }) => {
  const [game, setGame] = useState<Game>();
  const [state, setState] = useState<GameStatus>("waiting");
  const [finalScore, setFinalScore] = useState<any>();
  const [questionCountdown, setQuestionCountdown] = useState<number>(30);
  const [wsError, setWsError] = useState<string | null>(null);
  const [isReconnecting, setIsReconnecting] = useState(false);

  const ws = useRef<WebSocket | null>(null);
  const reconnectTimeout = useRef<NodeJS.Timeout | null>(null);
  const questionTimer = useRef<NodeJS.Timeout | null>(null);

  // Cleanup function for timers
  const cleanupTimers = useCallback(() => {
    if (questionTimer.current) {
      clearTimeout(questionTimer.current);
      questionTimer.current = null;
    }
    if (reconnectTimeout.current) {
      clearTimeout(reconnectTimeout.current);
      reconnectTimeout.current = null;
    }
  }, []);

  // WebSocket connection with error handling and reconnect
  const connectWebSocket = useCallback(() => {
    try {
      ws.current = new WebSocket(WS_URL);

      ws.current.onopen = () => {
        console.log("WebSocket connected");
        setWsError(null);
        setIsReconnecting(false);

        ws.current?.send(
          JSON.stringify({
            type: "create_game",
            data: {
              quizData: quiz,
              settings: {
                questionTimeLimit: 30,
                showCorrectAnswers: true,
                allowLateJoins: true,
              },
            },
          })
        );
      };

      ws.current.onmessage = (event) => {
        try {
          const msg = JSON.parse(event.data);
          console.log("Incoming message:", msg);

          switch (msg.type) {
            case "game_created":
              setGame(msg.game);
              break;

            case "joined":
              setGame((prev) =>
                prev
                  ? {
                      ...prev,
                      participants: [...prev.participants, msg.player],
                    }
                  : prev
              );
              break;

            case "countdown":
              setState("countdown");
              break;

            case "results":
              setState("results");
              break;

            case "answer_update":
              setGame((prev) =>
                prev
                  ? {
                      ...prev,
                      answeredQuestions: msg.answeredQuestions,
                    }
                  : prev
              );
              break;

            case "question":
              setState("question");
              setQuestionCountdown(30);
              setGame((prev) =>
                prev
                  ? {
                      ...prev,
                      currentQuestionIndex: msg.index,
                    }
                  : prev
              );
              break;

            case "game_finished":
              setFinalScore(msg.winners);
              setState("finished");
              break;

            default:
              console.warn("Unknown message type:", msg.type);
          }
        } catch (error) {
          console.error("Error parsing WebSocket message:", error);
        }
      };

      ws.current.onerror = (error) => {
        console.error("WebSocket error:", error);
        setWsError("Connection error occurred");
      };

      ws.current.onclose = (event) => {
        console.log("WebSocket closed:", event.code, event.reason);

        // Don't reconnect if it was a normal closure
        if (event.code !== 1000 && !isReconnecting) {
          setIsReconnecting(true);
          setWsError("Connection lost. Reconnecting...");

          // Attempt to reconnect after 3 seconds
          reconnectTimeout.current = setTimeout(() => {
            console.log("Attempting to reconnect...");
            connectWebSocket();
          }, 3000);
        }
      };
    } catch (error) {
      console.error("Failed to create WebSocket:", error);
      setWsError("Failed to connect to server");
    }
  }, [quiz, isReconnecting]);

  // Initialize WebSocket on mount
  useEffect(() => {
    connectWebSocket();

    return () => {
      cleanupTimers();
      if (ws.current) {
        ws.current.close(1000, "Component unmounted");
        ws.current = null;
      }
    };
  }, [connectWebSocket, cleanupTimers]);

  // Countdown effect for question with proper cleanup
  useEffect(() => {
    if (state !== "question") {
      if (questionTimer.current) {
        clearTimeout(questionTimer.current);
        questionTimer.current = null;
      }
      return;
    }

    if (questionCountdown === 0) return;

    questionTimer.current = setTimeout(() => {
      setQuestionCountdown((c) => (c > 0 ? c - 1 : 0));
    }, 1000);

    return () => {
      if (questionTimer.current) {
        clearTimeout(questionTimer.current);
        questionTimer.current = null;
      }
    };
  }, [state, questionCountdown]);

  // Send WebSocket message with error handling
  const sendMessage = useCallback((message: any) => {
    if (!ws.current || ws.current.readyState !== WebSocket.OPEN) {
      console.error("WebSocket is not connected");
      setWsError("Not connected to server");
      return false;
    }

    try {
      ws.current.send(JSON.stringify(message));
      return true;
    } catch (error) {
      console.error("Failed to send message:", error);
      setWsError("Failed to send message");
      return false;
    }
  }, []);

  const handleStartGame = useCallback(() => {
    if (game?.gamePin) {
      sendMessage({
        type: "start_game",
        gameId: game.gamePin,
      });
    }
  }, [game?.gamePin, sendMessage]);

  const handleNextQuestion = useCallback(() => {
    if (!game?.gamePin) return;

    if (game.currentQuestionIndex + 1 < quiz.questions.length) {
      sendMessage({
        type: "next_question",
        gameId: game.gamePin,
      });
    } else {
      sendMessage({
        type: "finish_game",
        gameId: game.gamePin,
      });
    }
  }, [game, quiz.questions.length, sendMessage]);

  const handleEndQuestion = useCallback(() => {
    if (game?.gamePin) {
      sendMessage({
        type: "question_timeout",
        gameId: game.gamePin,
      });
    }
  }, [game?.gamePin, sendMessage]);

  // Auto-finish question when all participants have answered
  useEffect(() => {
    if (state !== "question" || !game) return;

    const answeredCount =
      game.answeredQuestions[game.currentQuestionIndex]?.answers.length || 0;
    const totalParticipants = game.participants.length;

    // If all participants have answered and there's at least one participant
    if (totalParticipants > 0 && answeredCount === totalParticipants) {
      console.log("All participants answered - auto-finishing question");
      handleEndQuestion();
    }
  }, [state, game, handleEndQuestion]);

  if (wsError) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-red-100 text-red-800">
        <div className="bg-white bg-opacity-90 rounded-xl p-8 shadow-lg flex flex-col items-center">
          <h1 className="text-2xl font-bold mb-4">
            Verbindungsfehler mit WebSocket
          </h1>
          <p className="mb-6">{wsError}</p>
          {isReconnecting ? (
            <p className="italic">Attempting to reconnect...</p>
          ) : (
            <button
              onClick={connectWebSocket}
              className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-6 rounded-lg shadow transition"
            >
              Retry Connection
            </button>
          )}
        </div>
      </div>
    );
  }
  // Styled waiting room screen
  if (state === "waiting" && game?.gamePin) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-blue-600 to-purple-700 text-black">
        <div className="bg-white bg-opacity-10 rounded-xl p-8 shadow-lg flex flex-col items-center">
          <h1 className="text-3xl font-bold mb-4">Game PIN</h1>
          <div className="text-5xl font-mono font-extrabold tracking-widest bg-white bg-opacity-20 px-8 py-4 rounded-lg mb-6">
            {game.gamePin}
          </div>
          <h2 className="text-xl mb-2">Participants</h2>
          <ul className="mb-6">
            {game.participants.length === 0 && (
              <li className="italic text-gray-200">Waiting for players...</li>
            )}
            {game.participants.map((p) => (
              <li key={p.id} className="text-lg font-semibold">
                {p.name}
              </li>
            ))}
          </ul>
          <button
            onClick={handleStartGame}
            className="bg-green-500 hover:bg-green-600 text-white font-bold py-2 px-6 rounded-lg shadow transition"
            disabled={game.participants.length === 0}
          >
            Start Game
          </button>
        </div>
      </div>
    );
  }

  // Show countdown overlay
  if (state === "countdown" && game) {
    return (
      <Countdown
        game={game}
        onCountdownComplete={() => setState("question")}
        questionNumber={game.currentQuestionIndex + 1}
        totalQuestions={quiz.questions.length}
      />
    );
  }

  if (state === "question") {
    if (!game) return <div>error no game</div>;
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-blue-600 to-purple-700">
        <div className="w-full text-white">
          <QuestionWithoutImage
            currentQuestion={quiz.questions[game.currentQuestionIndex]}
            questionCountdown={questionCountdown}
          />
          <QuestionFooter
            game={game}
            onEndQuestion={handleEndQuestion}
            onExit={onBack}
          />
        </div>
      </div>
    );
  }

  if (state === "results") {
    if (!game) return <div>error no game</div>;
    if (!game.quizData) return <div>error no quiz data</div>;
    const currentQuestion = game.quizData.questions[game.currentQuestionIndex];
    if (!currentQuestion) return <div>error no question</div>;
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-blue-600 to-purple-700">
        <div className="w-full text-white">
          <QuestionResult
            game={game}
            currentQuestion={currentQuestion}
            quiz={game.quizData}
            onShowNextQuestion={handleNextQuestion}
          />
        </div>
      </div>
    );
  }

  if (state === "finished") {
    return <WinnersScreen winners={finalScore || []} onBack={onBack} />;
  }

  return <div />; // Placeholder for other states
};

export default GameHost;
