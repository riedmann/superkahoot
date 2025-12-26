import React from "react";

interface WaitingRoomProps {
  gamePin: string;
  nickname: string;
  setGamePin: (pin: string) => void;
  setNickname: (name: string) => void;
  handleJoin: (e: React.FormEvent) => void;
}

export function WaitingRoom({
  gamePin,
  nickname,
  setGamePin,
  setNickname,
  handleJoin,
}: WaitingRoomProps) {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-blue-600 to-purple-700 text-black">
      <form
        onSubmit={handleJoin}
        className="bg-white bg-opacity-10 rounded-xl p-8 shadow-lg flex flex-col items-center"
      >
        <h1 className="text-3xl font-bold mb-6">Join Game</h1>
        <label className="mb-4 w-full">
          <span className="block mb-1 font-semibold">Game PIN</span>
          <input
            type="text"
            value={gamePin}
            onChange={(e) => setGamePin(e.target.value)}
            required
            className="w-full px-4 py-2 rounded bg-white bg-opacity-80 text-gray-800 font-mono text-xl"
          />
        </label>
        <label className="mb-6 w-full">
          <span className="block mb-1 font-semibold">Nickname</span>
          <input
            type="text"
            value={nickname}
            onChange={(e) => setNickname(e.target.value)}
            required
            className="w-full px-4 py-2 rounded bg-white bg-opacity-80 text-gray-800"
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
