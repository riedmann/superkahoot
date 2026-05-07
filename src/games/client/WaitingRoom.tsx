import React from "react";

interface WaitingRoomProps {
  gamePin: string;
  nickname: string;
  setGamePin: (pin: string) => void;
  setNickname: (name: string) => void;
  handleJoin: (e: React.FormEvent) => void;
  handleReconnect?: (e: React.FormEvent) => void;
  hasStoredSession?: boolean;
  clearSession?: () => void;
}

export function WaitingRoom({
  gamePin,
  nickname,
  setGamePin,
  setNickname,
  handleJoin,
  handleReconnect,
  hasStoredSession = false,
  clearSession,
}: WaitingRoomProps) {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-blue-600 to-purple-700 text-black">
      {/* Reconnect Banner */}
      {hasStoredSession && handleReconnect && clearSession && (
        <div className="mb-4 bg-green-500 bg-opacity-90 rounded-xl p-6 shadow-lg text-white max-w-md w-full mx-4">
          <h2 className="text-xl font-bold mb-3">Previous Session Found!</h2>
          <p className="mb-4 text-sm">
            We detected you were in a game. Would you like to reconnect?
          </p>
          <div className="flex gap-3">
            <button
              onClick={handleReconnect}
              className="flex-1 bg-white text-green-600 hover:bg-gray-100 font-bold py-2 px-4 rounded-lg shadow transition"
            >
              Reconnect
            </button>
            <button
              onClick={clearSession}
              className="flex-1 bg-red-500 hover:bg-red-600 text-white font-bold py-2 px-4 rounded-lg shadow transition"
            >
              New Session
            </button>
          </div>
        </div>
      )}

      {/* Join Form */}
      <form
        onSubmit={handleJoin}
        className="bg-white bg-opacity-10 rounded-xl p-8 shadow-lg flex flex-col items-center max-w-md w-full mx-4"
      >
        <h1 className="text-3xl font-bold mb-6">Join Game</h1>
        <label className="mb-4 w-full">
          <span className="block mb-1 font-semibold">Game PIN</span>
          <input
            type="text"
            value={gamePin}
            onChange={(e) => setGamePin(e.target.value)}
            required
            className="w-full px-4 py-2 rounded bg-white bg-opacity-80 text-gray-800 font-mono text-xl border border-gray-300 "
          />
        </label>
        <label className="mb-6 w-full">
          <span className="block mb-1 font-semibold">Nickname</span>
          <input
            type="text"
            value={nickname}
            onChange={(e) => setNickname(e.target.value)}
            required
            className="w-full px-4 py-2 rounded bg-white bg-opacity-80 text-gray-800 border border-gray-300"
          />
        </label>
        <button
          type="submit"
          className="bg-green-500 hover:bg-green-600 text-white font-bold py-2 px-8 rounded-lg shadow transition"
        >
          Join Game
        </button>
      </form>
    </div>
  );
}
