import { useEffect } from "react";
import type { Question } from "../types";

interface QuestionBroadcastProps {
  gameId: string;
  question: Question;
  index: number;
  ws: WebSocket | null;
  timeRemaining: number;
  onEndQuestion: () => void;
}

export function QuestionBroadcast({
  gameId,
  question,
  index,
  ws,
  timeRemaining,
  onEndQuestion,
}: QuestionBroadcastProps) {
  // Broadcast the question to all clients when this component mounts
  useEffect(() => {
    if (ws && ws.readyState === 1) {
      ws.send(
        JSON.stringify({
          type: "question",
          gameId,
          question,
          index,
        })
      );
    }
    // Only send when question or index changes
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [question, index]);

  return (
    <div className="my-8 p-6 bg-white rounded-lg shadow-md">
      <h2 className="text-2xl font-bold mb-4">Question {index + 1}</h2>
      <div className="text-lg mb-4">{question.question}</div>
      <div className="text-3xl font-bold text-red-600 mb-2">
        {timeRemaining}s
      </div>
      <button
        onClick={onEndQuestion}
        className="mt-4 px-6 py-3 bg-red-600 text-white font-bold rounded-lg shadow hover:bg-red-700 transition-colors duration-200"
      >
        End Question
      </button>
    </div>
  );
}
