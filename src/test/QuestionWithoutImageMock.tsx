import { QuestionWithoutImage } from "../games/host/QuestionWithoutImage";
import type { StandardQuestion } from "../types/quiz";

export function QuestionWithoutImageMock() {
  const mockQuestion: StandardQuestion = {
    id: "q1",
    type: "standard",
    question:
      "Which programming language is known for its use in web development and runs in the browser?",
    options: [
      { text: "Python" },
      { text: "JavaScript" },
      { text: "C++" },
      { text: "Java" },
    ],
    correctAnswers: [1], // JavaScript is correct
    timeLimit: 30,
  };

  return (
    <div className="h-screen bg-gradient-to-br from-purple-600 to-blue-700">
      <QuestionWithoutImage currentQuestion={mockQuestion} />
    </div>
  );
}
