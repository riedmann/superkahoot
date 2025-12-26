import type { Question } from "../../types/question";

interface QuestionScreenProps {
  question: string;
  questionIndex: number;
  questionCountdown: number;
  questionType: string;
  onAnswer: (answer: string) => void;
}

export function QuestionScreen({
  question,
  questionIndex,
  questionCountdown,
  questionType,
  onAnswer,
}: QuestionScreenProps) {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-blue-600 to-purple-700 text-black">
      <div className="bg-white bg-opacity-10 rounded-xl p-8 shadow-lg flex flex-col items-center">
        <div className="mb-4 text-lg font-semibold">
          Time left: <span className="font-mono">{questionCountdown}s</span>
        </div>
        <h2 className="text-2xl font-bold mb-2">
          Question {questionIndex + 1}
        </h2>
        <div>{questionType}</div>

        <p className="mb-6 text-xl">{question}</p>
        <div className="grid grid-cols-2 gap-4 w-full">Answers</div>
      </div>
    </div>
  );
}
