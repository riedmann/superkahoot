import type { Game, GameAnswer } from "../../types";

interface QuestionFooterProps {
  game: Game;
  onEndQuestion: () => void;
  onExit: () => void;
  onRemoveParticipant?: (playerId: string) => void;
}

export function QuestionFooter({
  game,
  onEndQuestion,
  onExit,
  onRemoveParticipant,
}: QuestionFooterProps) {
  const handleRemoveParticipant = (
    participantId: string,
    participantName: string,
  ) => {
    if (
      onRemoveParticipant &&
      window.confirm(`Remove ${participantName} from the game?`)
    ) {
      onRemoveParticipant(participantId);
    }
  };

  // Debug logging
  console.log(
    "QuestionFooter - game.currentQuestionIndex:",
    game.currentQuestionIndex,
  );
  console.log(
    "QuestionFooter - game.answeredQuestions:",
    game.answeredQuestions,
  );
  console.log(
    "QuestionFooter - current answers:",
    game.answeredQuestions[game.currentQuestionIndex]?.answers,
  );

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
              (a: GameAnswer) => a.participant.id,
            ) || [],
          );
          return game.participants.map((participant) => (
            <div
              key={participant.id}
              onClick={() =>
                onRemoveParticipant &&
                handleRemoveParticipant(participant.id, participant.name)
              }
              className={`px-1 py-0.5 rounded text-xs text-center group relative ${
                answeredParticipantIds.has(participant.id)
                  ? "bg-green-500 text-white"
                  : "bg-gray-400 text-white"
              } ${onRemoveParticipant ? "cursor-pointer hover:ring-2 hover:ring-red-300" : ""}`}
            >
              {answeredParticipantIds.has(participant.id) ? "✓" : "⏳"}{" "}
              {participant.name.length > 8
                ? participant.name.substring(0, 8) + "..."
                : participant.name}
              {onRemoveParticipant && (
                <span className="absolute top-0 right-0 text-red-300 opacity-0 group-hover:opacity-100 transition-opacity text-xs">
                  ✕
                </span>
              )}
            </div>
          ));
        })()}
      </div>
    </div>
  );
}
