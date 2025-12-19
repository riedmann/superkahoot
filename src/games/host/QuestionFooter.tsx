import React from "react";
import type { Game } from "../../types";

interface QuestionFooterProps {
  game: Game;
  onEndQuestion: () => void;
  onExit: () => void;
}

export function QuestionFooter({
  game,
  onEndQuestion,
  onExit,
}: QuestionFooterProps) {
  // Debug logging
  React.useEffect(() => {
    console.log("QuestionFooter - Current answers:", {
      answersCount: game.currentQuestion?.answers.length || 0,
      participantCount: game.participants.length,
      answers: game.currentQuestion?.answers,
      participants: game.participants.map((p) => ({ id: p.id, name: p.name })),
    });
  }, [game.currentQuestion?.answers, game.participants]);

  return (
    <div className="bg-black bg-opacity-20 p-3 rounded-lg mx-4 mb-3">
      <div className="flex justify-between items-center mb-2">
        <div className="text-sm font-semibold">
          Answers: {game.currentQuestion?.answers.length || 0} /{" "}
          {game.participants.length}
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
            game.currentQuestion?.answers.map((a) => a.participantId) || []
          );
          return game.participants.map((participant) => (
            <div
              key={participant.id}
              className={`px-1 py-0.5 rounded text-xs text-center ${
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
