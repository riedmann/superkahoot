import { useState } from "react";

export interface JoinGameFormProps {
  loading: boolean;
  error: string | null;
  onJoin: (gamePin: string, playerName: string) => void;
}

export function JoinGameForm({ loading, error, onJoin }: JoinGameFormProps) {
  const [gamePin, setGamePin] = useState("");
  const [playerName, setPlayerName] = useState("");

  return (
    <div className="min-h-screen bg-blue-600 flex items-center justify-center">
      <div className="bg-white rounded-lg p-8 shadow-xl max-w-md w-full mx-4">
        <h1 className="text-3xl font-bold text-center mb-8">Join Game</h1>
        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
            {error}
          </div>
        )}
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Game PIN
            </label>
            <input
              type="text"
              value={gamePin}
              onChange={(e) => setGamePin(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-center text-lg font-mono"
              placeholder="Enter PIN"
              maxLength={6}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Your Name
            </label>
            <input
              type="text"
              value={playerName}
              onChange={(e) => setPlayerName(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Enter your name"
              maxLength={20}
            />
          </div>
          <button
            onClick={() => onJoin(gamePin, playerName)}
            disabled={loading || !gamePin || !playerName.trim()}
            className="w-full px-4 py-3 bg-blue-600 text-white font-bold text-lg rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? "Joining..." : "Join Game"}
          </button>
        </div>
      </div>
    </div>
  );
}
