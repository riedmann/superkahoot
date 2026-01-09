import { useEffect, useState } from "react";

interface Winner {
  id: string;
  name: string;
  points: number;
}

interface WinnersScreenProps {
  winners: Winner[];
  onBack: () => void;
}

export function WinnersScreen({ winners, onBack }: WinnersScreenProps) {
  // Sort winners by points descending and take top 6
  const sorted = [...winners].sort((a, b) => b.points - a.points).slice(0, 6);

  // Reverse the order so 6th shows first
  const reversed = [...sorted].reverse();

  // Animation state for staggered entrance
  const [visibleCount, setVisibleCount] = useState(0);

  useEffect(() => {
    if (reversed.length === 0) return;
    const timers: NodeJS.Timeout[] = [];

    reversed.forEach((_, index) => {
      const timer = setTimeout(() => {
        setVisibleCount(index + 1);
      }, index * 1000); // Stagger by 1000ms
      timers.push(timer);
    });

    return () => timers.forEach(clearTimeout);
  }, [reversed.length]);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-linear-to-br from-purple-600 to-blue-700 text-white p-8">
      <div className="w-full max-w-7xl">
        <h2 className="text-5xl font-extrabold mb-8 text-center bg-linear-to-br from-yellow-400 to-orange-400 bg-clip-text text-transparent">
          🏆 Final Results 🏆
        </h2>

        <div className="flex justify-center mb-8">
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
            {reversed.map((winner, displayIndex) => {
              // Calculate actual rank (reversed order)
              const actualRank = sorted.length - displayIndex;
              const isPodium = actualRank <= 3;
              const isFirst = actualRank === 1;
              const isVisible = displayIndex < visibleCount;

              return (
                <div
                  key={winner.id}
                  className={`relative p-3 rounded-xl backdrop-blur-sm transition-all duration-500 ${
                    isVisible ? "opacity-100 scale-100" : "opacity-0 scale-50"
                  } ${
                    isFirst
                      ? "bg-linear-to-br from-yellow-400/30 to-orange-500/30 border-2 border-yellow-400 shadow-yellow-400/50 shadow-lg hover:scale-110"
                      : actualRank === 2
                      ? "bg-linear-to-br from-gray-300/30 to-gray-400/30 border-2 border-gray-300 shadow-gray-300/50 shadow-lg hover:scale-110"
                      : actualRank === 3
                      ? "bg-linear-to-br from-amber-600/30 to-amber-700/30 border-2 border-amber-600 shadow-amber-600/50 shadow-lg hover:scale-110"
                      : "bg-white/10 border border-white/20 hover:scale-105"
                  }`}
                >
                  {/* Rank Badge */}
                  <div
                    className={`absolute -top-2 -left-2 w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold shadow-lg ${
                      isFirst
                        ? "bg-linear-to-br from-yellow-400 to-orange-500 text-white"
                        : actualRank === 2
                        ? "bg-linear-to-br from-gray-300 to-gray-400 text-gray-800"
                        : actualRank === 3
                        ? "bg-linear-to-br from-amber-600 to-amber-700 text-white"
                        : "bg-linear-to-br from-blue-500 to-purple-600 text-white"
                    }`}
                  >
                    {actualRank}
                  </div>

                  {/* Trophy for top 3 */}
                  {isPodium && (
                    <div className="absolute -top-1 -right-1 text-xl animate-bounce">
                      {isFirst ? "🏆" : actualRank === 2 ? "🥈" : "🥉"}
                    </div>
                  )}

                  {/* Player Name */}
                  <div className="font-bold text-white text-center truncate text-sm mb-2 mt-1">
                    {winner.name}
                  </div>

                  {/* Score */}
                  <div className="text-lg font-extrabold text-white text-center bg-black/20 rounded-lg py-1">
                    {winner.points}
                    <span className="text-xs ml-1 font-normal opacity-75">
                      pts
                    </span>
                  </div>

                  {/* Podium label */}
                  {isPodium && (
                    <div className="text-xs text-center mt-1 font-semibold opacity-90">
                      {isFirst
                        ? "1st Place"
                        : actualRank === 2
                        ? "2nd Place"
                        : "3rd Place"}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        <div className="text-center">
          <button
            onClick={onBack}
            className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white font-bold py-3 px-8 rounded-lg shadow-lg transition-all duration-300 hover:scale-105 hover:shadow-xl"
          >
            Back to Main Menu
          </button>
        </div>
      </div>
    </div>
  );
}
