import { useRef, useEffect, useState, useCallback } from "react";
import type { GameStatus } from "../../types/common";
import type { Question } from "../../types/question";

interface WebSocketMessage {
  type: string;
  gameId?: string;
  message?: string;
  seconds?: number;
  question?: Question;
  index?: number;
}

interface UseClientWebSocketReturn {
  joined: boolean;
  state: GameStatus;
  countdown: number;
  setCountdown: (value: number | ((prev: number) => number)) => void;
  questionIndex: number;
  questionCountdown: number;
  setQuestionCountdown: (value: number | ((prev: number) => number)) => void;
  question: Question | null;
  sendJoinGame: (gameId: string, playerId: string, name: string) => void;
  sendAnswer: (
    gameId: string,
    playerId: string,
    answer: boolean | number,
    questionIndex: number
  ) => void;
}

export function useClientWebSocket(gamePin: string): UseClientWebSocketReturn {
  const [joined, setJoined] = useState(false);
  const [state, setState] = useState<GameStatus>("waiting");
  const [countdown, setCountdown] = useState(3);
  const [questionIndex, setQuestionIndex] = useState(0);
  const [questionCountdown, setQuestionCountdown] = useState(30);
  const [question, setQuestion] = useState<Question | null>(null);

  const ws = useRef<WebSocket | null>(null);
  const gamePinRef = useRef(gamePin);

  useEffect(() => {
    gamePinRef.current = gamePin;
  }, [gamePin]);

  const handleMessage = useCallback((event: MessageEvent) => {
    const msg: WebSocketMessage = JSON.parse(event.data);
    console.log("incoming message", msg);

    switch (msg.type) {
      case "joined":
        if (msg.gameId === gamePinRef.current) {
          setJoined(true);
        }
        break;

      case "error":
        alert(msg.message);
        break;

      case "countdown":
        setCountdown(msg.seconds || 3);
        setState("countdown");
        break;

      case "question":
        setQuestion(msg.question || null);
        setQuestionIndex(msg.index || 0);
        setCountdown(3);
        setQuestionCountdown(30);
        setState("question");
        break;

      case "answer_received":
      case "results":
        setState("results");
        break;

      case "finish_game":
        setState("finished");
        break;
    }
  }, []);

  useEffect(() => {
    const wsUrl = import.meta.env.VITE_WS_URL || "ws://localhost:8080";
    ws.current = new WebSocket(wsUrl);
    ws.current.onmessage = handleMessage;

    return () => {
      ws.current?.close();
    };
  }, [handleMessage]);

  const sendJoinGame = useCallback(
    (gameId: string, playerId: string, name: string) => {
      const sendJoin = () => {
        ws.current?.send(
          JSON.stringify({
            type: "join_game",
            gameId,
            player: { id: playerId, name },
          })
        );
      };

      if (ws.current?.readyState === WebSocket.OPEN) {
        sendJoin();
        setState("waiting");
      } else if (ws.current) {
        ws.current.onopen = sendJoin;
      }
    },
    []
  );

  const sendAnswer = useCallback(
    (
      gameId: string,
      playerId: string,
      answer: boolean | number,
      questionIndex: number
    ) => {
      ws.current?.send(
        JSON.stringify({
          type: "addAnswer",
          gameId,
          playerId,
          answer,
          questionIndex,
        })
      );
    },
    []
  );

  return {
    joined,
    state,
    countdown,
    setCountdown,
    questionIndex,
    questionCountdown,
    setQuestionCountdown,
    question,
    sendJoinGame,
    sendAnswer,
  };
}
