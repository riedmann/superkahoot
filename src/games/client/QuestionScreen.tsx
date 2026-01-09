import type { Question } from "../../types";

interface QuestionScreenProps {
  question: Question;
  questionIndex: number;
  questionCountdown: number;
  onAnswer: (answer: number) => void;
}

export function QuestionScreen({ question, onAnswer }: QuestionScreenProps) {
  const colors = [
    { bg: "bg-red-500", label: "A", text: "text-red-500" },
    { bg: "bg-blue-500", label: "B", text: "text-blue-500" },
    { bg: "bg-yellow-500", label: "C", text: "text-yellow-500" },
    { bg: "bg-green-500", label: "D", text: "text-green-500" },
  ];

  // Determine answer options and labels
  let answerOptions: {
    text: string;
    value: string | boolean | number;
    image?: string;
  }[];
  if (question.type === "true-false") {
    answerOptions = [
      { text: "True", value: true },
      { text: "False", value: false },
    ];
  } else {
    answerOptions = question.options.slice(0, 4).map((option, idx) => ({
      text: option.text,
      value: idx,
      image: option.image,
    }));
  }

  return (
    <div className="h-screen flex flex-col items-center justify-center bg-gradient-to-br from-blue-600 to-purple-700 text-white overflow-hidden">
      <div className="w-full h-full bg-opacity-10 rounded-xl p-4 flex flex-col md:flex-row items-stretch overflow-hidden gap-4">
        {/* Left: Question and Image */}
        <div className="flex-1 flex flex-col justify-center items-center overflow-hidden min-h-0">
          <p className="mb-4 text-4xl font-bold text-center  ">
            {question.question}
          </p>
          {question.image && (
            <img
              src={question.image}
              alt="Question"
              className="max-w-full max-h-full object-contain rounded-lg"
            />
          )}
        </div>
        {/* Right: Answer Options */}
        <div className="flex-1 overflow-y-auto min-h-0">
          <div
            className={`grid gap-4 ${
              answerOptions.length === 2 ? "grid-cols-1" : "grid-cols-1"
            }`}
          >
            {answerOptions.map((ans, idx) => (
              <button
                key={idx}
                onClick={() => onAnswer(idx)}
                className={`${
                  colors[idx]?.bg || "bg-gray-500"
                } p-6 rounded-xl min-h-20 text-2xl font-bold shadow hover:scale-102 transition`}
              >
                <div className="flex items-center gap-4 mb-2">
                  <div
                    className={`w-12 h-12 bg-white ${
                      colors[idx]?.text || "text-gray-500"
                    } rounded-xl font-bold flex items-center justify-center text-xl`}
                  >
                    {colors[idx]?.label || String.fromCharCode(65 + idx)}
                  </div>
                  <span className="text-left">{ans.text}</span>
                </div>
                {ans.image && (
                  <img
                    src={ans.image}
                    alt="Option"
                    className="rounded-lg  shrink-0"
                  />
                )}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
