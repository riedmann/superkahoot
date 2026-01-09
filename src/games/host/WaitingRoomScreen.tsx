import type { Game } from "../../types/game";
import { FullscreenButton } from "../../components/ui/details/FullscreenButton";

interface WaitingRoomScreenProps {
  game: Game;
  isFullscreen: boolean;
  onToggleFullscreen: () => void;
  onStartGame: () => void;
  sendMessage?: (message: any) => void;
}

export function WaitingRoomScreen({
  game,
  isFullscreen,
  onToggleFullscreen,
  onStartGame,
  sendMessage,
}: WaitingRoomScreenProps) {
  const handleDisconnectPlayer = (playerId: string, playerName: string) => {
    if (sendMessage && game.id) {
      if (confirm(`Disconnect ${playerName}?`)) {
        sendMessage({
          type: "disconnect_player",
          gameId: game.id,
          playerId: playerId,
          reason: "Disconnected by host",
        });
      }
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-linear-to-br from-blue-600 to-purple-700 text-black">
      <FullscreenButton
        isFullscreen={isFullscreen}
        onToggle={onToggleFullscreen}
      />
      <div className="bg-white bg-opacity-10 rounded-xl p-8 shadow-lg flex flex-col items-center">
        <h1 className="text-3xl font-bold mb-4">Game PIN</h1>
        <div className="text-5xl font-mono font-extrabold tracking-widest bg-white bg-opacity-20 px-8 py-4 rounded-lg mb-6">
          {game.gamePin}
        </div>
        <h2 className="text-xl mb-2">
          Participants {game.participants.length}
        </h2>
        <div className="mb-6 grid grid-cols-3 gap-2">
          {game.participants.length === 0 && (
            <li className="italic text-gray-200">Waiting for players...</li>
          )}
          {game.participants.map((p) => (
            <div
              key={p.id}
              onClick={() => handleDisconnectPlayer(p.id, p.name)}
              className="text-lg font-semibold cursor-pointer hover:bg-white hover:bg-opacity-20 px-3 py-2 rounded-lg transition-all"
            >
              {p.name}
            </div>
          ))}
        </div>
        <button
          onClick={onStartGame}
          className="bg-green-500 hover:bg-green-600 text-white font-bold py-2 px-6 rounded-lg shadow transition"
          disabled={game.participants.length === 0}
        >
          Start Game
        </button>
      </div>
    </div>
  );
}
