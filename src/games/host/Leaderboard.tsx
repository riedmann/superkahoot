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

            // Only show current question statistics if available (accurate but limited scope)
            const currentQuestionAnswers = game.currentQuestion?.answers || [];
            const participantCurrentAnswer = currentQuestionAnswers.find(
              (answer) => answer.participantId === participant.id
            );

            // For overall game statistics, we don't have historical data
            // So we'll show simplified info: questions attempted vs total questions
            const questionsAttempted =
              game.status === "finished"
                ? game.totalQuestions
                : game.currentQuestionIndex +
                  (participantCurrentAnswer ? 1 : 0);

            const totalQuestions =
              game.status === "finished"
                ? game.totalQuestions
                : game.totalQuestions;

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
                          <span className="w-2 h-2 bg-blue-500 rounded-full"></span>
                          {questionsAttempted} / {totalQuestions} questions
                        </span>
                        {participantCurrentAnswer && (
                          <span className="flex items-center gap-1">
                            <span
                              className={`w-2 h-2 rounded-full ${
                                participantCurrentAnswer.isCorrect
                                  ? "bg-green-500"
                                  : "bg-red-500"
                              }`}
                            ></span>
                            Last:{" "}
                            {participantCurrentAnswer.isCorrect
                              ? "Correct"
                              : "Wrong"}
                          </span>
                        )}
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
