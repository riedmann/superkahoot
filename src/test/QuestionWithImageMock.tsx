import { QuestionWithImage } from "../games/host/QuestionWithImage";
import type { StandardQuestion } from "../types/quiz";

export function QuestionWithImageMock() {
  const mockQuestion: StandardQuestion = {
    id: "q1",
    type: "standard",
    question: "What is the capital of France?",
    options: [
      {
        text: "Paris",
        image:
          "https://images.unsplash.com/photo-1502602898657-3e91760cbb34?w=400",
      },
      {
        text: "London",
        image:
          "https://images.unsplash.com/photo-1513635269975-59663e0ac1ad?w=200",
      },
      {
        text: "Berlin",
        image:
          "https://images.unsplash.com/photo-1587330979470-3595ac045ab7?w=200",
      },
      {
        text: "Madrid",
        image:
          "https://images.unsplash.com/photo-1539037116277-4db20889f2d4?w=400",
      },
    ],
    correctAnswers: [0], // Paris is correct
    timeLimit: 30,
    image: "https://images.unsplash.com/photo-1499856871958-5b9627545d1a?w=100",
  };

  return (
    <div className="h-screen bg-gradient-to-br from-purple-600 to-blue-700">
      <QuestionWithImage currentQuestion={mockQuestion} />
    </div>
  );
}
