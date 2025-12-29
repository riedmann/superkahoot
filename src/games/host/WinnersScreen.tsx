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
  // Sort winners by points descending
  const sorted = [...winners].sort((a, b) => b.points - a.points);

  // Animation state: 0 = none, 1 = third, 2 = second, 3 = first
  const [show, setShow] = useState(0);

  useEffect(() => {
    if (sorted.length === 0) return;
    let t1: NodeJS.Timeout, t2: NodeJS.Timeout, t3: NodeJS.Timeout;
    t1 = setTimeout(() => setShow(1), 700);
    t2 = setTimeout(() => setShow(2), 1700);
    t3 = setTimeout(() => setShow(3), 2700);
    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
      clearTimeout(t3);
    };
  }, [winners.length]);

  // Only show up to top 3
  const podium = sorted.slice(0, 3);

  // Map for place and emoji
  const placeMap = [
    { place: "3rd", emoji: "🥉", color: "bg-yellow-700" },
    { place: "2nd", emoji: "🥈", color: "bg-gray-400" },
    { place: "1st", emoji: "🥇", color: "bg-yellow-400" },
  ];

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-yellow-400 to-purple-700 text-white">
      <div className="bg-white bg-opacity-10 rounded-xl p-8 shadow-lg flex flex-col items-center">
        <h2 className="text-4xl font-extrabold mb-6">
          🏆 Winner{podium.length > 1 ? "s" : ""}!
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-8 mb-8 min-w-[300px]">
          {podium.map((winner, idx) => {
            // Show 3rd, then 2nd, then 1st
            const showIdx = 3 - idx;
            if (show < showIdx) {
              return (
                <div
                  key={winner.id}
                  className="flex flex-col items-center opacity-0"
                  style={{ minHeight: 180 }}
                />
              );
            }
            return (
              <div
                key={winner.id}
                className={`flex flex-col items-center rounded-lg p-6 shadow-lg animate-bounce-in`}
                style={{
                  animation: show === showIdx ? "bounce-in 0.7s" : undefined,
                  background:
                    idx === 2
                      ? "rgba(251, 191, 36, 0.3)"
                      : idx === 1
                      ? "rgba(156, 163, 175, 0.3)"
                      : "rgba(253, 224, 71, 0.3)",
                  minHeight: 180,
                }}
              >
                <div className="text-5xl mb-2">{placeMap[idx].emoji}</div>
                <div className="text-2xl font-bold">{winner.name}</div>
                <div className="text-lg mt-2">{winner.points} pts</div>
                <div className="mt-1 text-sm text-yellow-200">
                  {placeMap[idx].place}
                </div>
              </div>
            );
          })}
        </div>
        <button
          onClick={onBack}
          className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-6 rounded-lg shadow transition"
        >
          Back to Main Menu
        </button>
      </div>
      {/* Animation keyframes */}
      <style>{`
        @keyframes bounce-in {
          0% { opacity: 0; transform: scale(0.7) translateY(60px);}
          60% { opacity: 1; transform: scale(1.1) translateY(-10px);}
          80% { transform: scale(0.95) translateY(5px);}
          100% { opacity: 1; transform: scale(1) translateY(0);}
        }
        .animate-bounce-in {
          animation: bounce-in 0.7s;
        }
      `}</style>
    </div>
  );
}
