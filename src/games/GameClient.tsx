import React, { useEffect, useRef, useState } from "react";
import type { GameStatus } from "../types/common";
import type { Question } from "../types/question";
import { CountdownScreen } from "./client/CountdownScreen";
import { QuestionScreen } from "./client/QuestionScreen";
import { ResultsScreen } from "./client/ResultsScreen";
import { WaitingRoom } from "./client/WaitingRoom";

type Props = {};

export default function GameClient({}: Props) {
  const [gamePin, setGamePin] = useState("");
  const [id, setId] = useState("");
  const [nickname, setNickname] = useState("");
  const [joined, setJoined] = useState(false);

  // State management
  const [state, setState] = useState<GameStatus>("waiting");
  const [countdown, setCountdown] = useState<number>(3);
  const [questionIndex, setQuestionIndex] = useState<number>(0);
  const [questionCountdown, setQuestionCountdown] = useState<number>(30);
  const [question, setQuestion] = useState<string>("");
  const [questionType, setQuestionType] = useState<string>("");

  const ws = useRef<WebSocket | null>(null);
  const gamePinRef = useRef(gamePin);

  console.log("state", state);

  // Keep gamePinRef in sync with gamePin state
  useEffect(() => {
    gamePinRef.current = gamePin;
  }, [gamePin]);

  // Effect for reading messages and opening socket
  useEffect(() => {
    ws.current = new WebSocket("ws://localhost:8080");
    ws.current.onmessage = (event) => {
      const msg = JSON.parse(event.data);
      console.log("incomming message", msg);
      if (msg.type === "joined" && msg.gameId === gamePinRef.current) {
        setJoined(true);
      }
      if (msg.type === "error") {
        alert(msg.message);
      }
      if (msg.type === "countdown") {
        setCountdown(msg.seconds);
        setState("countdown");
      }
      if (msg.type === "question") {
        setQuestion(msg.question);
        setQuestionIndex(msg.index);
        setQuestionType(msg.questionType);
        setCountdown(3);
        setQuestionCountdown(30);
        setState("question");
      }
      if (msg.type === "results") {
        setState("results");
      }
    };
    return () => {
      ws.current?.close();
    };
  }, []);

  // Countdown effect for game start
  useEffect(() => {
    if (state !== "countdown") return;
    if (countdown === 0) {
      setState("question");
      return;
    }
    const timer = setTimeout(() => {
      setCountdown((c) => (c > 0 ? c - 1 : 0));
    }, 1000);
    return () => clearTimeout(timer);
  }, [state, countdown]);

  // Countdown effect for question
  useEffect(() => {
    if (state !== "question") return;
    if (questionCountdown === 0) return;
    const timer = setTimeout(() => {
      setQuestionCountdown((c) => (c > 0 ? c - 1 : 0));
    }, 1000);
    return () => clearTimeout(timer);
  }, [state, questionCountdown]);

  const handleJoin = (e: React.FormEvent) => {
    e.preventDefault();
    if (!ws.current) return;
    const playerId = Date.now().toString();
    setId(playerId);

    const sendJoin = () => {
      ws.current?.send(
        JSON.stringify({
          type: "join_game",
          gameId: gamePinRef.current,
          player: { id: playerId, name: nickname },
        })
      );
    };

    if (ws.current.readyState === WebSocket.OPEN) {
      sendJoin();
      setState("waiting");
    } else {
      ws.current.onopen = sendJoin;
    }
  };

  // Send answer to server
  const handleAnswer = (answer: string) => {
    ws.current?.send(
      JSON.stringify({
        type: "addAnswer",
        gameId: gamePinRef.current,
        playerId: id,
        answer,
        questionIndex,
      })
    );
  };

  // Styled screens
  if (!joined) {
    return (
      <WaitingRoom
        gamePin={gamePin}
        nickname={nickname}
        setGamePin={setGamePin}
        setNickname={setNickname}
        handleJoin={handleJoin}
      />
    );
  }

  if (state == "waiting") {
    return <div>waiting</div>;
  }

  if (state === "countdown") {
    return <CountdownScreen countdown={countdown} />;
  }

  if (state === "question") {
    if (!question) return <div>Loading question...</div>;
    return (
      <QuestionScreen
        question={question}
        questionType={questionType}
        questionIndex={questionIndex}
        questionCountdown={questionCountdown}
        onAnswer={handleAnswer}
      />
    );
  }

  if (state === "results") {
    return <ResultsScreen />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-600 to-purple-700" />
  );
}
