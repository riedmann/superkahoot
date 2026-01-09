import React, { useState, useEffect } from "react";
import type { Question, Quiz } from "../types/quiz";
import { Countdown } from "./host/Countdown";
import { QuestionFooter } from "./host/QuestionFooter";
import { QuestionResult } from "./host/QuestionResult";
import { QuestionWithoutImage } from "./host/QuestionWithoutImage";
import { QuestionWithImage } from "./host/QuestionWithImage";
import { WinnersScreen } from "./host/WinnersScreen";
import { FullscreenButton } from "../components/ui/details/FullscreenButton";
import { useFullscreen } from "./hooks/useFullscreen";
import { useCountdown } from "./hooks/useCountdown";
import { useGameWebSocket } from "./hooks/useGameWebSocket";
import { useGameActions } from "./hooks/useGameActions";
import { useAutoFinishQuestion } from "./hooks/useAutoFinishQuestion";
import { useMusic } from "./hooks/useMusic";
import { ErrorScreen } from "./host/ErrorScreen";
import { WaitingRoomScreen } from "./host/WaitingRoomScreen";

interface GameHostProps {
  quiz: Quiz;
  onBack: () => void;
}

export const GameHost: React.FC<GameHostProps> = ({ quiz, onBack }) => {
  const [questionCountdown, setQuestionCountdown] = useState(30);

  const { isFullscreen, toggleFullscreen } = useFullscreen();
  const {
    game,
    state,
    finalScore,
    wsError,
    isReconnecting,
    sendMessage,
    connectWebSocket,
  } = useGameWebSocket(quiz);

  const { isMuted, toggleMute } = useMusic(state);

  const { handleStartGame, handleNextQuestion, handleEndQuestion } =
    useGameActions(game, sendMessage, quiz.questions.length);

  // Reset countdown when entering question state
  useEffect(() => {
    if (state === "question" && game) {
      const currentQuestion: Question =
        quiz.questions[game.currentQuestionIndex];
      setQuestionCountdown(currentQuestion.timeLimit || 60);
    }
  }, [state, game?.currentQuestionIndex]);

  useCountdown(state === "question", questionCountdown, setQuestionCountdown);
  useAutoFinishQuestion(state, game, handleEndQuestion);

  if (wsError) {
    return (
      <ErrorScreen
        error={wsError}
        isReconnecting={isReconnecting}
        onRetry={connectWebSocket}
      />
    );
  }

  if (state === "waiting" && game?.gamePin) {
    return (
      <>
        <FullscreenButton
          isFullscreen={isFullscreen}
          onToggle={toggleFullscreen}
        />
        <button
          onClick={toggleMute}
          className="fixed top-4 left-4 z-50 bg-white/20 hover:bg-white/30 backdrop-blur-sm text-white p-3 rounded-full shadow-lg transition-all"
          title={isMuted ? "Unmute" : "Mute"}
        >
          {isMuted ? (
            <svg
              className="w-6 h-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z"
              />
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M17 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2"
              />
            </svg>
          ) : (
            <svg
              className="w-6 h-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z"
              />
            </svg>
          )}
        </button>
        <WaitingRoomScreen
          game={game}
          isFullscreen={isFullscreen}
          onToggleFullscreen={toggleFullscreen}
          onStartGame={handleStartGame}
          sendMessage={sendMessage}
        />
      </>
    );
  }

  if (state === "countdown" && game) {
    // For the first countdown, currentQuestionIndex is 0 but no questions answered yet
    // For subsequent countdowns, currentQuestionIndex points to the last completed question
    const isFirstQuestion = game.answeredQuestions?.length === 0;
    const questionIndex = isFirstQuestion ? 0 : game.currentQuestionIndex + 1;
    const question = quiz.questions[questionIndex];

    return (
      <>
        <FullscreenButton
          isFullscreen={isFullscreen}
          onToggle={toggleFullscreen}
        />
        <button
          onClick={toggleMute}
          className="fixed top-4 left-4 z-50 bg-white/20 hover:bg-white/30 backdrop-blur-sm text-white p-3 rounded-full shadow-lg transition-all"
          title={isMuted ? "Unmute" : "Mute"}
        >
          {isMuted ? (
            <svg
              className="w-6 h-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z"
              />
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M17 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2"
              />
            </svg>
          ) : (
            <svg
              className="w-6 h-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z"
              />
            </svg>
          )}
        </button>
        <Countdown
          game={game}
          onCountdownComplete={() => {}}
          questionNumber={questionIndex + 1}
          totalQuestions={quiz.questions.length}
          question={question}
        />
      </>
    );
  }

  if (state === "question" && game) {
    const currentQuestion = quiz.questions[game.currentQuestionIndex];
    const hasImage =
      currentQuestion.image ||
      (currentQuestion.type === "standard" &&
        currentQuestion.options.some((opt) => opt.image));

    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-blue-600 to-purple-700">
        <FullscreenButton
          isFullscreen={isFullscreen}
          onToggle={toggleFullscreen}
        />
        <button
          onClick={toggleMute}
          className="fixed top-4 left-4 z-50 bg-white/20 hover:bg-white/30 backdrop-blur-sm text-white p-3 rounded-full shadow-lg transition-all"
          title={isMuted ? "Unmute" : "Mute"}
        >
          {isMuted ? (
            <svg
              className="w-6 h-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z"
              />
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M17 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2"
              />
            </svg>
          ) : (
            <svg
              className="w-6 h-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z"
              />
            </svg>
          )}
        </button>
        <div className="w-full text-white">
          {hasImage ? (
            <QuestionWithImage currentQuestion={currentQuestion} />
          ) : (
            <QuestionWithoutImage
              currentQuestion={currentQuestion}
              questionCountdown={questionCountdown}
            />
          )}
          <QuestionFooter
            game={game}
            onEndQuestion={handleEndQuestion}
            onExit={onBack}
            sendMessage={sendMessage}
          />
        </div>
      </div>
    );
  }

  if (state === "results" && game?.quizData) {
    const currentQuestion = game.quizData.questions[game.currentQuestionIndex];
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-blue-600 to-purple-700">
        <FullscreenButton
          isFullscreen={isFullscreen}
          onToggle={toggleFullscreen}
        />
        <button
          onClick={toggleMute}
          className="fixed top-4 left-4 z-50 bg-white/20 hover:bg-white/30 backdrop-blur-sm text-white p-3 rounded-full shadow-lg transition-all"
          title={isMuted ? "Unmute" : "Mute"}
        >
          {isMuted ? (
            <svg
              className="w-6 h-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z"
              />
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M17 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2"
              />
            </svg>
          ) : (
            <svg
              className="w-6 h-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z"
              />
            </svg>
          )}
        </button>
        <div className="w-full text-white">
          <QuestionResult
            game={game}
            currentQuestion={currentQuestion}
            quiz={game.quizData}
            onShowNextQuestion={handleNextQuestion}
          />
        </div>
      </div>
    );
  }

  if (state === "finished") {
    return <WinnersScreen winners={finalScore || []} onBack={onBack} />;
  }

  return null;
};

export default GameHost;
