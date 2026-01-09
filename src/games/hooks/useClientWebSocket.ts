import { useRef, useEffect, useState, useCallback } from "react";
import type { GameStatus } from "../../types/common";
import type { Question } from "../../types/question";

interface WebSocketMessage {
  type: string;
  gameId?: string;
  message?: string;
  reason?: string;
  seconds?: number;
  question?: Question;
  index?: number;
  score?: number;
  isCorrect?: boolean;
  points?: number;
}

interface UseClientWebSocketReturn {
  joined: boolean;
  joining: boolean;
  state: GameStatus;
  countdown: number;
  setCountdown: (value: number | ((prev: number) => number)) => void;
  questionIndex: number;
  questionCountdown: number;
  setQuestionCountdown: (value: number | ((prev: number) => number)) => void;
  question: Question | null;
  disconnectReason: string | null;
  score: number;
  lastAnswerCorrect: boolean | null;
  lastAnswerPoints: number;
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
  const [joining, setJoining] = useState(false);
  const [state, setState] = useState<GameStatus>("waiting");
  const [countdown, setCountdown] = useState(3);
  const [questionIndex, setQuestionIndex] = useState(0);
  const [questionCountdown, setQuestionCountdown] = useState(30);
  const [question, setQuestion] = useState<Question | null>(null);
  const [disconnectReason, setDisconnectReason] = useState<string | null>(null);
  const [score, setScore] = useState(0);
  const [lastAnswerCorrect, setLastAnswerCorrect] = useState<boolean | null>(
    null
  );
  const [lastAnswerPoints, setLastAnswerPoints] = useState(0);

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
          setJoining(false);
        }
        break;

      case "error":
        alert(msg.message);
        setJoining(false);
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
        if (msg.score !== undefined) setScore(msg.score);
        if (msg.isCorrect !== undefined) setLastAnswerCorrect(msg.isCorrect);
        if (msg.points !== undefined) setLastAnswerPoints(msg.points);
        setState("results");
        break;

      case "finish_game":
        setState("finished");
        break;

      case "disconnected":
        setDisconnectReason(
          msg.reason || "You have been disconnected from the game"
        );
        setState("finished");
        setJoined(false);
        break;
    }
  }, []);

  useEffect(() => {
    const wsUrl = import.meta.env.VITE_WS_URL || "ws://localhost:8080";
    ws.current = new WebSocket(wsUrl);

    ws.current.onopen = () => {
      console.log("WebSocket connected");
    };

    ws.current.onmessage = handleMessage;

    ws.current.onerror = (error) => {
      console.error("WebSocket error:", error);
      setJoining(false);
    };

    ws.current.onclose = (event) => {
      console.log("WebSocket closed:", event.code, event.reason);
      if (!event.wasClean) {
        console.warn("WebSocket closed unexpectedly");
      }
    };

    return () => {
      ws.current?.close();
    };
  }, [handleMessage]);

  const sendJoinGame = useCallback(
    (gameId: string, playerId: string, name: string) => {
      setJoining(true);
      let attempts = 0;
      const maxAttempts = 50; // 5 seconds max wait (50 * 100ms)

      const sendJoin = () => {
        if (ws.current?.readyState === WebSocket.OPEN) {
          ws.current.send(
            JSON.stringify({
              type: "join_game",
              gameId,
              player: { id: playerId, name },
            })
          );
          setState("waiting");
        } else if (attempts < maxAttempts) {
          // Wait for connection to open, then send
          attempts++;
          setTimeout(() => sendJoin(), 100);
        } else {
          // Connection timeout
          setJoining(false);
          alert(
            "Failed to connect to game server. Please refresh the page and try again."
          );
        }
      };

      sendJoin();
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
    joining,
    state,
    countdown,
    setCountdown,
    questionIndex,
    questionCountdown,
    setQuestionCountdown,
    question,
    disconnectReason,
    score,
    lastAnswerCorrect,
    lastAnswerPoints,
    sendJoinGame,
    sendAnswer,
  };
}
