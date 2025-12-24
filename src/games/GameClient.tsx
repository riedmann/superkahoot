import { useEffect, useRef, useState } from "react";
import { JoinGameForm } from "./client/JoinGameForm";

export function GameClient() {
  const [joined, setJoined] = useState(false);
  const [gamePin, setGamePin] = useState("");
  const [playerName, setPlayerName] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const wsRef = useRef<WebSocket | null>(null);

  useEffect(() => {
    const ws = new window.WebSocket("ws://localhost:8080");
    wsRef.current = ws;
    ws.onmessage = (event) => {
      try {
        const msg = JSON.parse(event.data);
        if (msg.type === "joined") {
          setJoined(true);
          setLoading(false);
        } else if (msg.type === "error") {
          setError(msg.message);
          setLoading(false);
        }
      } catch (e) {
        setError("Invalid message from server");
      }
    };
    return () => ws.close();
  }, []);

  if (!joined) {
    return (
      <JoinGameForm
        loading={loading}
        error={error}
        onJoin={(gamePin, playerName) => {
          setLoading(true);
          setError(null);
          wsRef.current?.send(
            JSON.stringify({
              type: "join_game",
              gameId: gamePin,
              player: playerName.trim(),
            })
          );
          setGamePin(gamePin);
          setPlayerName(playerName);
        }}
      />
    );
  }

  // Waiting screen after joining
  return (
    <div className="min-h-screen bg-blue-600 flex items-center justify-center">
      <div className="bg-white rounded-lg p-8 shadow-xl max-w-md w-full mx-4 text-center">
        <h1 className="text-3xl font-bold mb-6">You have joined!</h1>
        <div className="text-lg text-gray-700 mb-4">
          Waiting for the host to start the game...
        </div>
        <div className="text-gray-500">
          Game PIN: <span className="font-mono font-bold">{gamePin}</span>
        </div>
      </div>
    </div>
  );
}
