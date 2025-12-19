import type { Game } from "../../types";

interface LeaderboardProps {
  game: Game;
  title?: string;
  showResponseCount?: boolean;
}

export function Leaderboard({
  game,
  title = "Current Leaderboard:",
  showResponseCount = false,
}: LeaderboardProps) {
  return (
    <div className="mb-6">
      <h4 className="text-lg font-semibold text-gray-700 mb-4">{title}</h4>
      <div className="max-w-3xl mx-auto">
        {[...game.participants]
          .sort((a, b) => b.score - a.score)
          .map((participant, index) => {
            const isPodium = index < 3;
            const isFirst = index === 0;

            // Use participant's answer history for accurate statistics
            const answerHistory = participant.answerHistory || [];
            const correctAnswers = answerHistory.filter(
              (answer) => answer.isCorrect
            ).length;
            const wrongAnswers = answerHistory.filter(
              (answer) => !answer.isCorrect
            ).length;
            const totalAnswered = answerHistory.length;
            const percentage =
              totalAnswered > 0
                ? Math.round((correctAnswers / totalAnswered) * 100)
                : 0;

            // Current question status
            const currentQuestionAnswers = game.currentQuestion?.answers || [];
            const participantCurrentAnswer = currentQuestionAnswers.find(
              (answer) => answer.participantId === participant.id
            );

            return (
              <div
                key={participant.id}
                className={`p-4 rounded-lg mb-2 ${
                  isFirst
                    ? "bg-yellow-50 border border-yellow-200"
                    : isPodium
                    ? "bg-blue-50 border border-blue-200"
                    : "bg-gray-50 border border-gray-200"
                }`}
              >
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-3">
                    <div
                      className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
                        isFirst
                          ? "bg-yellow-500 text-white"
                          : isPodium
                          ? "bg-blue-500 text-white"
                          : "bg-gray-400 text-white"
                      }`}
                    >
                      {index + 1}
                    </div>
                    <div>
                      <div className="font-medium text-gray-900">
                        {participant.name}
                      </div>
                      <div className="flex items-center gap-4 text-sm text-gray-600 mt-1">
                        <span className="flex items-center gap-1">
                          <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                          {correctAnswers} correct
                        </span>
                        <span className="flex items-center gap-1">
                          <span className="w-2 h-2 bg-red-500 rounded-full"></span>
                          {wrongAnswers} wrong
                        </span>
                        <span className="font-medium text-gray-700">
                          {percentage}% accuracy
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="text-lg font-bold text-gray-900">
                      {participant.score}
                    </div>
                    <div className="text-sm text-gray-500">pts</div>
                  </div>
                </div>
              </div>
            );
          })}
      </div>
      {showResponseCount && (
        <div className="mt-4 text-sm text-gray-600">
          Total Responses: {game.currentQuestion?.answers.length || 0} /{" "}
          {game.participants.length}
        </div>
      )}
    </div>
  );
}
