import { QuestionScreen } from "../games/client/QuestionScreen";
import type { StandardQuestion } from "../types/quiz";

export function ClientQuestionScreenMock1() {
  // Standard question with images
  const mockStandardQuestion: StandardQuestion = {
    id: "q1",
    type: "standard",
    question: "Which city is known as the 'City of Light'?",
    options: [
      {
        text: "Paris",
      },
      {
        text: "London",
      },
      {
        text: "New York",
      },
      {
        text: "Tokyo",
      },
    ],
    correctAnswers: [0],
    timeLimit: 30,
    image: "https://images.unsplash.com/photo-1499856871958-5b9627545d1a?w=600",
  };

  // True/False question

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
