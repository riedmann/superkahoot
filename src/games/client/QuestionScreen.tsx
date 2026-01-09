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
    <div className="h-screen flex flex-col items-center justify-center bg-gradient-to-br from-blue-600 to-purple-700 text-white">
      <div className="w-full  bg-opacity-10 rounded-xl p-8 flex flex-col md:flex-row items-center">
        {/* Left: Question and Image */}
        <div className="flex-1 w-full text-center mb-8 md:mb-0 md:mr-8">
          <p className="mb-4 text-2xl">{question.question}</p>
          {question.image && (
            <img
              src={question.image}
              alt="Question"
              className="w-full max-h-64 rounded-lg mx-auto object-cover"
            />
          )}
        </div>
        {/* Right: Answer Options */}
        <div className="flex-1 w-full">
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
                } p-6 rounded-xl flex items-center justify-between min-h-20 text-2xl font-bold shadow hover:scale-105 transition`}
              >
                <div className="flex items-center gap-4">
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
                    className="w-16 h-16 object-cover rounded-lg ml-3 flex-shrink-0"
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
