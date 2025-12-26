import React, { useRef, useState, useEffect } from "react";

type Question = {
  question: string;
  // Add other fields as needed
};

type Props = {};

export default function GameClient({}: Props) {
  const [gamePin, setGamePin] = useState("");
  const [id, setId] = useState("");
  const [nickname, setNickname] = useState("");
  const [joined, setJoined] = useState(false);
  const [countdown, setCountdown] = useState<number | null>(null);
  const [question, setQuestion] = useState<Question | null>(null);
  const [questionIndex, setQuestionIndex] = useState<number | null>(null);

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
      }
      if (msg.type === "question") {
        setQuestion(msg.question);
        setQuestionIndex(msg.index);
        setCountdown(null);
      }
      // Handle more message types here as needed
    };
    return () => {
      ws.current?.close();
    };
  }, []);

  // Countdown effect
  useEffect(() => {
    if (countdown === null) return;
    if (countdown === 0) return;
    const timer = setTimeout(() => {
      setCountdown((c) => (c !== null ? c - 1 : null));
    }, 1000);
    return () => clearTimeout(timer);
  }, [countdown]);

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
          {countdown !== null && (
            <div>
              <h2>Game starts in: {countdown}</h2>
            </div>
          )}
          {question && (
            <div>
              <h2>
                Question {questionIndex !== null ? questionIndex + 1 : ""}:
              </h2>
              <p>{question.question}</p>
              {/* Add answer options here */}
            </div>
          )}
          {!question && countdown === null && (
            <p>Waiting for host to start...</p>
          )}
        </div>
      )}
    </div>
  );
}
