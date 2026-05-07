import type { Game } from "../../types/game";
import { FullscreenButton } from "../../components/ui/details/FullscreenButton";

interface WaitingRoomScreenProps {
  game: Game;
  isFullscreen: boolean;
  onToggleFullscreen: () => void;
  onStartGame: () => void;
  onRemoveParticipant: (playerId: string) => void;
}

export function WaitingRoomScreen({
  game,
  isFullscreen,
  onToggleFullscreen,
  onStartGame,
  onRemoveParticipant,
}: WaitingRoomScreenProps) {
  console.log("WaitingRoomScreen - game:", game);
  console.log("WaitingRoomScreen - participants:", game.participants);

  const handleRemoveParticipant = (
    participantId: string,
    participantName: string,
  ) => {
    if (window.confirm(`Remove ${participantName} from the game?`)) {
      onRemoveParticipant(participantId);
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
          Participants ({game.participants?.length || 0})
        </h2>
        <ul className="mb-6 space-y-2">
          {(!game.participants || game.participants.length === 0) && (
            <li className="italic text-gray-200">Waiting for players...</li>
          )}
          {game.participants?.map((p) => (
            <li
              key={p.id}
              onClick={() => handleRemoveParticipant(p.id, p.name)}
              className="text-lg font-semibold cursor-pointer hover:bg-white hover:bg-opacity-20 px-4 py-2 rounded-lg transition-colors flex items-center justify-between group"
            >
              <span>{p.name}</span>
              <span className="text-red-300 opacity-0 group-hover:opacity-100 transition-opacity text-sm">
                ✕
              </span>
            </li>
          ))}
        </ul>
        <button
          onClick={() => {
            console.log("Start Game button clicked");
            console.log("Participants count:", game.participants?.length);
            onStartGame();
          }}
          className="bg-green-500 hover:bg-green-600 text-white font-bold py-2 px-6 rounded-lg shadow transition disabled:bg-gray-400 disabled:cursor-not-allowed"
          disabled={!game.participants || game.participants.length === 0}
        >
          Start Game
        </button>
      </div>
    </div>
  );
}
