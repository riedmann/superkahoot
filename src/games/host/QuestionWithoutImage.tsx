import type { Question } from "../../types/question";

interface QuestionWithoutImageProps {
  currentQuestion: Question;
}

export function QuestionWithoutImage({
  currentQuestion,
}: QuestionWithoutImageProps) {
  const colors = [
    { bg: "bg-red-500", label: "A", text: "text-red-500" },
    { bg: "bg-blue-500", label: "B", text: "text-blue-500" },
    { bg: "bg-yellow-500", label: "C", text: "text-yellow-500" },
    { bg: "bg-green-500", label: "D", text: "text-green-500" },
  ];

  return (
    <div className="text-center mb-8">
      <h3 className="text-4xl md:text-7xl font-bold mb-8 leading-tight">
        {currentQuestion.question}
      </h3>

      {/* Colored Answer Options Display */}
      <div className="grid grid-cols-2 gap-6  mx-auto">
        {(() => {
          if (currentQuestion.type === "true-false") {
            return [
              <div
                key={0}
                className={`${colors[0].bg} p-8 rounded-xl flex items-center justify-center min-h-32`}
              >
                <div className="flex items-center gap-6">
                  <div className="w-16 h-16 bg-white text-red-500 rounded-xl font-bold flex items-center justify-center text-2xl">
                    {colors[0].label}
                  </div>
                  <span className="text-4xl font-bold">True</span>
                </div>
              </div>,
              <div
                key={1}
                className={`${colors[1].bg} p-8 rounded-xl flex items-center justify-center min-h-32`}
              >
                <div className="flex items-center gap-6">
                  <div className="w-16 h-16 bg-white text-blue-500 rounded-xl font-bold flex items-center justify-center text-2xl">
                    {colors[1].label}
                  </div>
                  <span className="text-4xl font-bold">False</span>
                </div>
              </div>,
            ];
          } else if (currentQuestion.type === "standard") {
            return currentQuestion.options.slice(0, 4).map((option, index) => (
              <div
                key={index}
                className={`${colors[index].bg}  rounded-xl flex items-center justify-between min-h-28`}
              >
                <div className="pl-6 py-6 flex items-center gap-4 flex-1">
                  <div
                    className={`w-12 h-12 bg-white ${colors[index].text} rounded-xl font-bold flex items-center justify-center text-xl flex-shrink-0`}
                  >
                    {colors[index].label}
                  </div>
                  <span className="text-2xl font-bold leading-tight">
                    {option.text}
                  </span>
                </div>
                {option.image && (
                  <img
                    src={option.image}
                    alt="Option image"
                    className="h-40 object-cover rounded-r-lg ml-4 flex-shrink-0"
                  />
                )}
              </div>
            ));
          }
          return null;
        })()}
      </div>
    </div>
  );
}
