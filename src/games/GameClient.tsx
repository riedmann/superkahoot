import React, { useRef, useState, useEffect } from "react";
import type { GameStatus } from "../types/common";
import type { Question } from "../types/question";

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
  const [question, setQuestion] = useState<Question | null>(null);

  const ws = useRef<WebSocket | null>(null);
  const gamePinRef = useRef(gamePin);

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
        setCountdown(3);
        setQuestionCountdown(30);
        setState("question");
      }
      if (msg.type === "results") {
        setState("results");
      }
      // Handle more message types here as needed
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

  return (
    <div>
      {!joined ? (
        <form onSubmit={handleJoin}>
          <label>
            Game PIN:
            <input
              type="text"
              value={gamePin}
              onChange={(e) => setGamePin(e.target.value)}
              required
            />
          </label>
          <br />
          <label>
            Nickname:
            <input
              type="text"
              value={nickname}
              onChange={(e) => setNickname(e.target.value)}
              required
            />
          </label>
          <br />
          <button type="submit" className="border hover:cursor-pointer">
            Join Game
          </button>
        </form>
      ) : (
        <div>
          {state === "countdown" && (
            <div>
              <h2>Game starts in: {countdown}</h2>
            </div>
          )}
          {state === "question" && (
            <div>
              <div>
                <strong>Time left: {questionCountdown}s</strong>
              </div>
              <h2>Question {questionIndex + 1}:</h2>
              <p>Test</p>
              {/* Example answer buttons */}
              <button onClick={() => handleAnswer("A")}>A</button>
              <button onClick={() => handleAnswer("B")}>B</button>
              <button onClick={() => handleAnswer("C")}>C</button>
              <button onClick={() => handleAnswer("D")}>D</button>
            </div>
          )}
          {state === "results" && (
            <div>
              <h2>Results</h2>
              {/* Show results here */}
            </div>
          )}
          {state === "waiting" && <p>Waiting for host to start...</p>}
        </div>
      )}
    </div>
  );
}
