import type { Game } from "../types";

interface WaitingForParticipantsProps {
  game: Game;
  onStartGame: () => void;
}

export function WaitingForParticipants({
  game,
  onStartGame,
}: WaitingForParticipantsProps) {
  return (
    <div className="text-center">
      <div className="bg-white rounded-lg p-8 shadow-lg">
        <h2 className="text-3xl font-bold mb-4">Waiting for players...</h2>
        <div className="text-6xl font-mono font-bold text-blue-600 mb-4">
          {game.gamePin}
        </div>
        <div className="text-gray-600 mb-6">
          Players can join at kahoot.it with this PIN
        </div>

        {game.participants.length > 0 && (
          <div className="mb-6">
            <h3 className="text-lg font-semibold mb-2">
              Joined Players ({game.participants.length}):
            </h3>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
              {game.participants.map((participant) => (
                <div
                  key={participant.id}
                  className="bg-gray-100 rounded px-3 py-2"
                >
                  {participant.name}
                </div>
              ))}
            </div>
          </div>
        )}

        <button
          onClick={onStartGame}
          disabled={game.participants.length === 0}
          className="px-8 py-3 bg-green-600 text-white font-bold text-lg rounded disabled:opacity-50"
        >
          Start Game
        </button>
      </div>
    </div>
  );
}
