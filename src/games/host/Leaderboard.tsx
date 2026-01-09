import type { Game } from "../../types/game";

interface LeaderboardProps {
  game: Game;
  title?: string;
}

export function Leaderboard({
  game,
  title = "Current Leaderboard:",
}: LeaderboardProps) {
  // Aggregate scores from all answers
  const participantScores: {
    [id: string]: {
      name: string;
      score: number;
      correct: number;
      total: number;
    };
  } = {};

  game.participants.forEach((p) => {
    participantScores[p.id] = {
      name: p.name,
      score: 0,
      correct: 0,
      total: 0,
    };
  });

  game.answeredQuestions.forEach((question) => {
    question.answers.forEach((ans) => {
      if (participantScores[ans.participant.id]) {
        participantScores[ans.participant.id].score += ans.points;
        participantScores[ans.participant.id].total += 1;
        if (ans.isCorrect) participantScores[ans.participant.id].correct += 1;
      }
    });
  });

  const sorted = Object.entries(participantScores).sort(
    ([, a], [, b]) => b.score - a.score
  );

  return (
    <div className="mb-6">
      <div className="max-w-6xl mx-auto grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 xl:grid-cols-8 gap-3">
        {sorted.map(([id, p], index) => {
          const isPodium = index < 3;
          const isFirst = index === 0;
          const accuracy =
            p.total > 0 ? Math.round((p.correct / p.total) * 100) : 0;

          return (
            <div
              key={id}
              className={`relative p-3 rounded-xl backdrop-blur-sm transition-all duration-300 hover:scale-105 hover:shadow-2xl ${
                isFirst
                  ? "bg-linear-to-br from-yellow-400/30 to-orange-500/30 border-2 border-yellow-400 shadow-yellow-400/50 shadow-lg"
                  : index === 1
                  ? "bg-linear-to-br from-gray-300/30 to-gray-400/30 border-2 border-gray-300 shadow-gray-300/50 shadow-lg"
                  : index === 2
                  ? "bg-linear-to-br from-amber-600/30 to-amber-700/30 border-2 border-amber-600 shadow-amber-600/50 shadow-lg"
                  : "bg-white/10 border border-gray-300/20 shadow-sm shadow-black/20"
              }`}
            >
              {/* Rank Badge */}
              <div
                className={`absolute -top-2 -left-2 w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold shadow-lg ${
                  isFirst
                    ? "bg-linear-to-br from-yellow-400 to-orange-500 text-black"
                    : index === 1
                    ? "bg-linear-to-br from-gray-300 to-gray-400 text-gray-800"
                    : index === 2
                    ? "bg-linear-to-br from-amber-600 to-amber-700 text-black"
                    : "bg-linear-to-br from-blue-500 to-purple-600 text-black"
                }`}
              >
                {index + 1}
              </div>

              {/* Trophy for top 3 */}
              {isPodium && (
                <div className="absolute -top-1 -right-1 text-xl">
                  {isFirst ? "🏆" : index === 1 ? "🥈" : "🥉"}
                </div>
              )}

              {/* Player Name */}
              <div className="font-bold text-black text-center truncate text-sm mb-2 mt-1">
                {p.name}
              </div>

              {/* Stats */}
              <div className="flex items-center justify-center gap-1 text-xs text-black/90 mb-2">
                <span className="flex items-center gap-0.5">
                  <span className="w-1.5 h-1.5 bg-green-400 rounded-full"></span>
                  {p.correct}
                </span>
                <span className="text-black/50">•</span>
                <span className="flex items-center gap-0.5">
                  <span className="w-1.5 h-1.5 bg-red-400 rounded-full"></span>
                  {p.total - p.correct}
                </span>
              </div>

              {/* Accuracy Badge */}
              <div className="bg-white/20 rounded-full px-2 py-0.5 text-xs font-semibold text-black mb-2">
                {accuracy}%
              </div>

              {/* Score */}
              <div className="text-lg font-extrabold text-black text-center bg-black/20 rounded-lg py-1">
                {p.score}
                <span className="text-xs ml-1 font-normal opacity-75">pts</span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
