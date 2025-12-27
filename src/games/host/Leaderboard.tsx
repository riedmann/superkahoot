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
      <h4 className="text-lg font-semibold text-white mb-4">{title}</h4>
      <div className="max-w-5xl mx-auto grid grid-cols-1 sm:grid-cols-3 md:grid-cols-5 lg:grid-cols-7 gap-4">
        {sorted.map(([id, p], index) => {
          const isPodium = index < 3;
          const isFirst = index === 0;
          const accuracy =
            p.total > 0 ? Math.round((p.correct / p.total) * 100) : 0;

          return (
            <div
              key={id}
              className={`p-2 rounded-lg flex flex-col items-center justify-center ${
                isFirst
                  ? "bg-yellow-500 bg-opacity-30 border border-yellow-300"
                  : isPodium
                  ? "bg-blue-500 bg-opacity-30 border border-blue-300"
                  : "bg-gray-500 bg-opacity-20 border border-gray-300"
              }`}
            >
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold mb-1 ${
                  isFirst
                    ? "bg-yellow-500 text-white"
                    : isPodium
                    ? "bg-blue-500 text-white"
                    : "bg-gray-400 text-white"
                }`}
              >
                {index + 1}
              </div>
              <div className="font-medium text-white text-center truncate w-full">
                {p.name}
              </div>
              <div className="flex items-center gap-1 text-xs text-white mt-1">
                <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                {p.correct}
                <span className="w-2 h-2 bg-red-500 rounded-full"></span>
                {p.total - p.correct}
                <span>{accuracy}%</span>
              </div>
              <div className="text-base font-bold text-white mt-1">
                {p.score} pts
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
