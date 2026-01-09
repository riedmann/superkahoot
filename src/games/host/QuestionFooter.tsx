import type { Game, GameAnswer } from "../../types";

interface QuestionFooterProps {
  game: Game;
  onEndQuestion: () => void;
  onExit: () => void;
  sendMessage?: (message: any) => void;
}

export function QuestionFooter({
  game,
  onEndQuestion,
  onExit,
  sendMessage,
}: QuestionFooterProps) {
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
    <div className="bg-opacity-20 p-3 rounded-lg mx-4 mb-3">
      <div className="flex justify-between items-center mb-2">
        <div className="text-sm font-semibold">
          Answers:{" "}
          {game.answeredQuestions[game.currentQuestionIndex]?.answers.length ||
            0}{" "}
          / {game.participants.length}
        </div>
        <div className="flex gap-2">
          <button
            onClick={onEndQuestion}
            className="px-3 py-1 bg-red-600 hover:bg-red-700 text-white rounded text-sm font-medium"
          >
            End Question
          </button>
          <button
            onClick={onExit}
            className="px-3 py-1 bg-gray-600 hover:bg-gray-700 text-white rounded text-sm font-medium"
          >
            Exit
          </button>
        </div>
      </div>

      {/* Show participant status */}
      <div className="grid grid-cols-6 md:grid-cols-8 gap-1">
        {(() => {
          const answeredParticipantIds = new Set(
            game.answeredQuestions[game.currentQuestionIndex]?.answers.map(
              (a: GameAnswer) => a.participant.id
            ) || []
          );
          return game.participants.map((participant) => (
            <div
              key={participant.id}
              onClick={() =>
                handleDisconnectPlayer(participant.id, participant.name)
              }
              className={`px-1 py-0.5 rounded text-xs text-center cursor-pointer hover:opacity-80 transition-opacity ${
                answeredParticipantIds.has(participant.id)
                  ? "bg-green-500 text-white"
                  : "bg-gray-400 text-white"
              }`}
            >
              {answeredParticipantIds.has(participant.id) ? "✓" : "⏳"}{" "}
              {participant.name.length > 8
                ? participant.name.substring(0, 8) + "..."
                : participant.name}
            </div>
          ));
        })()}
      </div>
    </div>
  );
}
