import { useRef, useEffect, useCallback, useState } from "react";
import type { Game, GameStatus } from "../../types/game";
import type { Quiz } from "../../types/quiz";

interface WebSocketMessage {
  type: string;
  game?: Game;
  player?: any;
  answeredQuestions?: any;
  index?: number;
  winners?: any;
  message?: string;
}

interface UseGameWebSocketReturn {
  game: Game | undefined;
  state: GameStatus;
  finalScore: any;
  wsError: string | null;
  isReconnecting: boolean;
  sendMessage: (message: any) => boolean;
  connectWebSocket: () => void;
  setQuestionCountdown: (value: number) => void;
}

export function useGameWebSocket(quiz: Quiz): UseGameWebSocketReturn {
  const [game, setGame] = useState<Game>();
  const [state, setState] = useState<GameStatus>("waiting");
  const [finalScore, setFinalScore] = useState<any>();
  const [wsError, setWsError] = useState<string | null>(null);
  const [isReconnecting, setIsReconnecting] = useState(false);

  const ws = useRef<WebSocket | null>(null);
  const reconnectTimeout = useRef<NodeJS.Timeout | null>(null);

  const cleanupTimers = useCallback(() => {
    if (reconnectTimeout.current) {
      clearTimeout(reconnectTimeout.current);
      reconnectTimeout.current = null;
    }
  }, []);

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

  const handleMessage = useCallback((event: MessageEvent) => {
    try {
      const msg: WebSocketMessage = JSON.parse(event.data);
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
          setGame((prev) =>
            prev
              ? {
                  ...prev,
                  currentQuestionIndex: msg.index!,
                }
              : prev
          );
          break;

        case "game_finished":
          setFinalScore(msg.winners);
          setState("finished");
          break;

        case "player_disconnected":
          setGame((prev) =>
            prev && msg.player
              ? {
                  ...prev,
                  participants: prev.participants.filter(
                    (p) => p.id !== msg.player.id
                  ),
                }
              : prev
          );
          break;

        default:
          console.warn("Unknown message type:", msg.type);
      }
    } catch (error) {
      console.error("Error parsing WebSocket message:", error);
    }
  }, []);

  const connectWebSocket = useCallback(() => {
    try {
      const wsUrl = import.meta.env.VITE_WS_URL || "ws://localhost:8080";
      ws.current = new WebSocket(wsUrl);

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

      ws.current.onmessage = handleMessage;

      ws.current.onerror = (error) => {
        console.error("WebSocket error:", error);
        setWsError("Connection error occurred");
      };

      ws.current.onclose = (event) => {
        console.log("WebSocket closed:", event.code, event.reason);

        if (event.code !== 1000 && !isReconnecting) {
          setIsReconnecting(true);
          setWsError("Connection lost. Reconnecting...");

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
  }, [quiz, isReconnecting, handleMessage]);

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

  return {
    game,
    state,
    finalScore,
    wsError,
    isReconnecting,
    sendMessage,
    connectWebSocket,
    setQuestionCountdown: () => {}, // Placeholder, implement if needed
  };
}
