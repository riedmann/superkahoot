import type { Question } from "../../types";

interface QuestionWithImageProps {
  currentQuestion: Question;
}

export function QuestionWithImage({ currentQuestion }: QuestionWithImageProps) {
  const colors = [
    { bg: "bg-red-500", label: "A", shape: "triangle" },
    { bg: "bg-blue-500", label: "B", shape: "diamond" },
    { bg: "bg-yellow-500", label: "C", shape: "circle" },
    { bg: "bg-green-500", label: "D", shape: "square" },
  ];

  return (
    <div className="flex  items-center  ">
      {/* Left side: Question and Image */}
      <div className="flex-1 text-cente  w-full">
        <h3 className="text-xl md:text-2xl font-bold mb-6 leading-tight text-center">
          {currentQuestion.question}
        </h3>
        <img
          src={currentQuestion.image}
          alt="Question image"
          className="w-full max-h-96 rounded-lg mx-auto"
        />
      </div>

      {/* Right side: Answer Options */}
      <div className="flex-1">
        <div className="grid grid-cols-1 gap-4">
          {(() => {
            if (currentQuestion.type === "true-false") {
              return [
                <div
                  key={0}
                  className={`${colors[0].bg} p-6 rounded-xl flex items-center justify-center min-h-24`}
                >
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-white text-red-500 rounded-xl font-bold flex items-center justify-center text-xl">
                      {colors[0].label}
                    </div>
                    <span className="text-3xl font-bold">True</span>
                  </div>
                </div>,
                <div
                  key={1}
                  className={`${colors[1].bg} p-6 rounded-xl flex items-center justify-center min-h-24`}
                >
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-white text-blue-500 rounded-xl font-bold flex items-center justify-center text-xl">
                      {colors[1].label}
                    </div>
                    <span className="text-3xl font-bold">False</span>
                  </div>
                </div>,
              ];
            } else if (currentQuestion.type === "standard") {
              return currentQuestion.options
                .slice(0, 4)
                .map((option, index) => (
                  <div
                    key={index}
                    className={`${colors[index].bg} p-4 rounded-xl flex items-center justify-between min-h-20`}
                  >
                    <div className="flex items-center gap-3 flex-1">
                      <div
                        className={`w-10 h-10 bg-white text-${
                          colors[index].bg.split("-")[1]
                        }-500 rounded-xl font-bold flex items-center justify-center text-lg flex-shrink-0`}
                      >
                        {colors[index].label}
                      </div>
                      <span className="text-xl font-bold leading-tight">
                        {option.text}
                      </span>
                    </div>
                    {option.image && (
                      <img
                        src={option.image}
                        alt="Option image"
                        className="w-16 h-16 object-cover rounded-lg ml-3 flex-shrink-0"
                      />
                    )}
                  </div>
                ));
            }
            return null;
          })()}
        </div>
      </div>
    </div>
  );
}
