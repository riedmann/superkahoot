interface ResultsScreenProps {
  score: number;
  isCorrect: boolean | null;
  points: number;
}

export function ResultsScreen({
  score,
  isCorrect,
  points,
}: ResultsScreenProps) {
  return (
    <div
      className={`min-h-screen flex flex-col items-center justify-center ${
        isCorrect === true
          ? "bg-linear-to-br from-green-600 to-green-800"
          : isCorrect === false
          ? "bg-linear-to-br from-red-400 to-red-800"
          : "bg-linear-to-br from-blue-600 to-purple-700"
      } text-white`}
    >
      <div className="p-8 flex flex-col items-center">
        {isCorrect === true && (
          <>
            <div className="mb-6">
              <svg
                className="w-24 h-24 text-white"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={3}
                  d="M5 13l4 4L19 7"
                />
              </svg>
            </div>
            <h2 className="text-5xl font-bold mb-4">Richtig!</h2>
            <p className="text-3xl mb-2">+{points} Punkte</p>
          </>
        )}
        {isCorrect === false && (
          <>
            <div className="mb-6">
              <svg
                className="w-24 h-24 text-white"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={3}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </div>
            <h2 className="text-5xl font-bold mb-4">Falsch!</h2>
            <p className="text-3xl mb-2">+0 Punkte</p>
          </>
        )}
        {isCorrect === null && (
          <>
            <h2 className="text-3xl font-bold mb-4">Danke für Deine Antwort</h2>
          </>
        )}
        <div className="mt-6 text-center">
          <p className="text-2xl font-semibold">Deine Punkte: {score}</p>
          <p className="text-lg mt-2">Warte bis zur nächsten Frage!</p>
        </div>
      </div>
    </div>
  );
}
