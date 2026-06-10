import { useState, useRef, useEffect } from "react";
import type { Question } from "../../types";
import { MarkdownRenderer } from "../../components/MarkdownRenderer";

interface QuestionScreenProps {
  question: Question;
  questionIndex: number;
  questionCountdown: number;
  onAnswer: (answer: number) => void;
  hasAnswered?: boolean;
}

export function QuestionScreen({
  question,
  questionIndex,
  onAnswer,
  hasAnswered = false,
}: QuestionScreenProps) {
  // Local state to immediately disable buttons on click
  const [isClicked, setIsClicked] = useState(false);
  const clickedRef = useRef(false);

  const handleClick = (answer: number) => {
    console.log("QuestionScreen.handleClick:", {
      answer,
      clickedRef: clickedRef.current,
      isClicked,
      hasAnswered,
    });

    // Immediate synchronous check
    if (clickedRef.current || isClicked || hasAnswered) {
      console.log("Button already clicked, ignoring");
      return;
    }

    console.log("Processing click - setting states and calling onAnswer");
    // Set both ref and state immediately
    clickedRef.current = true;
    setIsClicked(true);

    // Call the parent handler
    onAnswer(answer);
  };

  // Reset click tracking when question changes
  useEffect(() => {
    console.log(
      "QuestionScreen: Resetting click state for question index:",
      questionIndex,
    );
    setIsClicked(false);
    clickedRef.current = false;
  }, [questionIndex]); // Only reset when question index changes, not on every re-render

  const colors = [
    { bg: "bg-red-500", label: "A", text: "text-red-500" },
    { bg: "bg-blue-500", label: "B", text: "text-blue-500" },
    { bg: "bg-yellow-500", label: "C", text: "text-yellow-500" },
    { bg: "bg-green-500", label: "D", text: "text-green-500" },
  ];

  // Determine answer options and labels
  let answerOptions: { text: string; value: string | boolean | number }[];
  if (question.type === "true-false") {
    answerOptions = [
      { text: "True", value: true },
      { text: "False", value: false },
    ];
  } else {
    answerOptions = question.options.slice(0, 4).map((option, idx) => ({
      text: option.text,
      value: idx,
    }));
  }

  return (
    <div className="h-screen flex flex-col items-center justify-center bg-gradient-to-br from-blue-600 to-purple-700 text-white">
      <div className="w-full  bg-opacity-10 rounded-xl p-8 flex flex-col md:flex-row items-center">
        {/* Left: Question and Image */}
        <div className="flex-1 w-full text-center mb-8 md:mb-0 md:mr-8">
          <div className="mb-4 text-2xl prose prose-invert prose-lg max-w-none mx-auto">
            <MarkdownRenderer content={question.question} />
          </div>
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
                key={`${questionIndex}-${idx}`}
                onClick={() => handleClick(idx)}
                disabled={hasAnswered || isClicked}
                className={`${
                  colors[idx]?.bg || "bg-gray-500"
                } p-6 rounded-xl flex items-center justify-start min-h-20 text-2xl font-bold shadow hover:scale-105 transition disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100`}
              >
                <div className="flex items-center gap-4">
                  <div
                    className={`w-12 h-12 bg-white ${
                      colors[idx]?.text || "text-gray-500"
                    } rounded-xl font-bold flex items-center justify-center text-xl`}
                  >
                    {colors[idx]?.label || String.fromCharCode(65 + idx)}
                  </div>
                  <MarkdownRenderer
                    content={ans.text}
                    className="text-left prose prose-invert prose-sm max-w-none"
                  />
                </div>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
