import type { Question, Quiz } from "../../types";
import type { Game } from "../../types";
import { Leaderboard } from "./Leaderboard";
import { Button } from "../../components/ui/details/Button";

interface QuestionResultProps {
  game: Game;
  currentQuestion: Question;
  quiz: Quiz;
  onShowNextQuestion: () => void;
}

export function QuestionResult({
  game,
  currentQuestion,
  quiz,
  onShowNextQuestion,
}: QuestionResultProps) {
  return (
    <div className="text-center text-white">
      {/* Show the question again */}
      <div className="mb-6">
        <h3 className="text-xl font-bold  mb-4">{currentQuestion.question}</h3>
        {currentQuestion.image && (
          <img
            src={currentQuestion.image}
            alt="Question image"
            className="max-w-full max-h-48 rounded-lg border border-gray-200 mx-auto mb-4"
          />
        )}
      </div>

      {/* Show answer results with bars */}
      <div className="mb-6">
        <h4 className="text-lg font-semibold mb-4">Results:</h4>

        {(() => {
          const colors = [
            { bg: "bg-red-500", text: "text-red-500", label: "A" },
            { bg: "bg-blue-500", text: "text-blue-500", label: "B" },
            { bg: "bg-yellow-500", text: "text-yellow-500", label: "C" },
            { bg: "bg-green-500", text: "text-green-500", label: "D" },
          ];

          const answers =
            game.answeredQuestions[game.currentQuestionIndex]?.answers || [];
          const totalResponses = answers.length;

          if (currentQuestion.type === "true-false") {
            // Count true/false answers
            const trueCount = answers.filter((a) => a.answer === true).length;
            const falseCount = answers.filter((a) => a.answer === false).length;
            const correctAnswer = currentQuestion.correctAnswer;

            return (
              <div className="flex gap-4 max-w-4xl mx-auto">
                {/* True option */}
                <div className="flex-1">
                  <div
                    className={`${colors[0].bg} rounded-lg p-3 flex items-center justify-between`}
                  >
                    <div className="flex items-center gap-2">
                      <div
                        className={`w-8 h-8 bg-white ${colors[0].text} rounded-lg font-bold flex items-center justify-center text-sm relative`}
                      >
                        {colors[0].label}
                        {correctAnswer === true && (
                          <div className="absolute -top-1 -right-1 w-5 h-5 bg-green-500 rounded-full flex items-center justify-center">
                            <svg
                              className="w-3 h-3 text-white"
                              fill="currentColor"
                              viewBox="0 0 20 20"
                            >
                              <path
                                fillRule="evenodd"
                                d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                                clipRule="evenodd"
                              />
                            </svg>
                          </div>
                        )}
                      </div>
                      <span className="text-lg font-bold text-white">True</span>
                    </div>
                    <div className="text-lg font-bold text-white">
                      {trueCount}
                    </div>
                  </div>
                  {/* Progress bar */}
                  <div className="mt-2 bg-gray-200 rounded-full h-2">
                    <div
                      className={`${colors[0].bg} h-2 rounded-full transition-all duration-500`}
                      style={{
                        width:
                          totalResponses > 0
                            ? `${(trueCount / totalResponses) * 100}%`
                            : "0%",
                      }}
                    ></div>
                  </div>
                </div>

                {/* False option */}
                <div className="flex-1">
                  <div
                    className={`${colors[1].bg} rounded-lg p-3 flex items-center justify-between`}
                  >
                    <div className="flex items-center gap-2">
                      <div
                        className={`w-8 h-8 bg-white ${colors[1].text} rounded-lg font-bold flex items-center justify-center text-sm relative`}
                      >
                        {colors[1].label}
                        {correctAnswer === false && (
                          <div className="absolute -top-1 -right-1 w-5 h-5 bg-green-500 rounded-full flex items-center justify-center">
                            <svg
                              className="w-3 h-3 text-white"
                              fill="currentColor"
                              viewBox="0 0 20 20"
                            >
                              <path
                                fillRule="evenodd"
                                d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                                clipRule="evenodd"
                              />
                            </svg>
                          </div>
                        )}
                      </div>
                      <span className="text-lg font-bold text-white">
                        False
                      </span>
                    </div>
                    <div className="text-lg font-bold text-white">
                      {falseCount}
                    </div>
                  </div>
                  {/* Progress bar */}
                  <div className="mt-2 bg-gray-200 rounded-full h-2">
                    <div
                      className={`${colors[1].bg} h-2 rounded-full transition-all duration-500`}
                      style={{
                        width:
                          totalResponses > 0
                            ? `${(falseCount / totalResponses) * 100}%`
                            : "0%",
                      }}
                    ></div>
                  </div>
                </div>
              </div>
            );
          } else if (currentQuestion.type === "standard") {
            // Count answers for each option
            const optionCounts = currentQuestion.options.map((_, index) => {
              return answers.filter((a) => a.answer === index).length;
            });

            return (
              <div className="grid grid-cols-2 gap-4 max-w-4xl mx-auto">
                {currentQuestion.options.slice(0, 4).map((option, index) => {
                  const count = optionCounts[index] || 0;
                  const isCorrect =
                    currentQuestion.correctAnswers?.includes(index);

                  return (
                    <div key={index} className="flex-1">
                      <div
                        className={`${colors[index].bg} rounded-lg p-3 flex items-center justify-between`}
                      >
                        <div className="flex items-center gap-2 flex-1 min-w-0">
                          <div
                            className={`w-8 h-8 bg-white ${colors[index].text} rounded-lg font-bold flex items-center justify-center text-sm relative shrink-0`}
                          >
                            {colors[index].label}
                            {isCorrect && (
                              <div className="absolute -top-1 -right-1 w-5 h-5 bg-green-500 rounded-full flex items-center justify-center">
                                <svg
                                  className="w-3 h-3 text-white"
                                  fill="currentColor"
                                  viewBox="0 0 20 20"
                                >
                                  <path
                                    fillRule="evenodd"
                                    d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                                    clipRule="evenodd"
                                  />
                                </svg>
                              </div>
                            )}
                          </div>
                          <span className="text-sm font-bold text-white truncate">
                            {option.text}
                          </span>
                        </div>
                        <div className="text-lg font-bold text-white ml-2 shrink-0">
                          {count}
                        </div>
                      </div>
                      {/* Progress bar */}
                      <div className="mt-2 bg-gray-200 rounded-full h-2">
                        <div
                          className={`${colors[index].bg} h-2 rounded-full transition-all duration-500`}
                          style={{
                            width:
                              totalResponses > 0
                                ? `${(count / totalResponses) * 100}%`
                                : "0%",
                          }}
                        ></div>
                      </div>
                    </div>
                  );
                })}
              </div>
            );
          }
          return null;
        })()}
      </div>

      <Button onClick={onShowNextQuestion} size="lg">
        {game.currentQuestionIndex + 1 < quiz.questions.length
          ? "Next Question"
          : "Finish Game"}
      </Button>

      <Leaderboard game={game} title="Current Leaderboard:" />
    </div>
  );
}
