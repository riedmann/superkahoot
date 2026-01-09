import { QuestionScreen } from "../games/client/QuestionScreen";
import type { StandardQuestion, TrueFalseQuestion } from "../types/quiz";

export function QuestionScreenMock() {
  // Standard question with images
  const mockStandardQuestion: StandardQuestion = {
    id: "q1",
    type: "standard",
    question: "Which city is known as the 'City of Light'?",
    options: [
      {
        text: "Paris",
        image:
          "https://images.unsplash.com/photo-1502602898657-3e91760cbb34?w=1000",
      },
      {
        text: "London",
        image:
          "https://images.unsplash.com/photo-1513635269975-59663e0ac1ad?w=100",
      },
      {
        text: "New York",
        image:
          "https://images.unsplash.com/photo-1496442226666-8d4d0e62e6e9?w=300",
      },
      {
        text: "Tokyo",
        image:
          "https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?w=300",
      },
    ],
    correctAnswers: [0],
    timeLimit: 30,
    image: "https://images.unsplash.com/photo-1499856871958-5b9627545d1a?w=600",
  };

  // True/False question
  const mockTrueFalseQuestion: TrueFalseQuestion = {
    id: "q2",
    type: "true-false",
    question: "The Earth is flat.",
    correctAnswer: false,
    timeLimit: 20,
  };

  return (
    <div className="h-screen">
      <QuestionScreen
        question={mockStandardQuestion}
        questionIndex={0}
        questionCountdown={25}
        onAnswer={(answer) => console.log("Answer selected:", answer)}
      />
    </div>
  );
}
