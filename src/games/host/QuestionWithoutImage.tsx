interface QuestionWithoutImageProps {
  currentQuestion: any;
  questionCountdown?: number;
}

export function QuestionWithoutImage({
  currentQuestion,
  questionCountdown,
}: QuestionWithoutImageProps) {
  const colors = [
    { bg: "bg-red-500", label: "A" },
    { bg: "bg-blue-500", label: "B" },
    { bg: "bg-yellow-500", label: "C" },
    { bg: "bg-green-500", label: "D" },
  ];

  return (
    <div className="text-center mb-8 p-8">
      <h2 className="text-2xl font-bold mb-4">{currentQuestion.question}</h2>
      {typeof questionCountdown === "number" && (
        <div className="mb-6 text-lg font-semibold text-white">
          Time left: <span className="font-mono">{questionCountdown}s</span>
        </div>
      )}
      <div className="grid grid-cols-2 gap-6 mx-auto">
        {(() => {
          if (currentQuestion.type === "true-false") {
            return [
              <div
                key={0}
                className={`${colors[0].bg} p-8 rounded-xl flex items-center justify-center min-h-32 text-white text-2xl font-bold`}
              >
                True
              </div>,
              <div
                key={1}
                className={`${colors[1].bg} p-8 rounded-xl flex items-center justify-center min-h-32 text-white text-2xl font-bold`}
              >
                False
              </div>,
            ];
          } else if (currentQuestion.type === "standard") {
            return currentQuestion.options
              .slice(0, 4)
              .map((option: any, idx: number) => (
                <div
                  key={idx}
                  className={`${colors[idx].bg} p-8 rounded-xl flex items-center justify-center min-h-32 text-white text-2xl font-bold`}
                >
                  <span className="mr-4 bg-white bg-opacity-20 px-3 py-1 rounded">
                    {colors[idx].label}
                  </span>
                  {option.text}
                </div>
              ));
          }
          return null;
        })()}
      </div>
    </div>
  );
}
