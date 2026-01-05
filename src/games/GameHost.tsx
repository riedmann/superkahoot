import React, { useState } from "react";
import type { Quiz } from "../types/quiz";
import { Countdown } from "./host/Countdown";
import { QuestionFooter } from "./host/QuestionFooter";
import { QuestionResult } from "./host/QuestionResult";
import { QuestionWithoutImage } from "./host/QuestionWithoutImage";
import { WinnersScreen } from "./host/WinnersScreen";
import { FullscreenButton } from "../components/ui/details/FullscreenButton";
import { useFullscreen } from "./hooks/useFullscreen";
import { useCountdown } from "./hooks/useCountdown";
import { useGameWebSocket } from "./hooks/useGameWebSocket";
import { useGameActions } from "./hooks/useGameActions";
import { useAutoFinishQuestion } from "./hooks/useAutoFinishQuestion";
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
    setQuestionCountdown: setWSQuestionCountdown,
  } = useGameWebSocket(quiz);

  const { handleStartGame, handleNextQuestion, handleEndQuestion } =
    useGameActions(game, sendMessage, quiz.questions.length);

  useCountdown(state === "question", questionCountdown, setQuestionCountdown);
  useAutoFinishQuestion(state, game, handleEndQuestion);

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
        <WaitingRoomScreen
          game={game}
          isFullscreen={isFullscreen}
          onToggleFullscreen={toggleFullscreen}
          onStartGame={handleStartGame}
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
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-blue-600 to-purple-700">
        <FullscreenButton
          isFullscreen={isFullscreen}
          onToggle={toggleFullscreen}
        />
        <div className="w-full text-white">
          <QuestionWithoutImage
            currentQuestion={quiz.questions[game.currentQuestionIndex]}
            questionCountdown={questionCountdown}
          />
          <QuestionFooter
            game={game}
            onEndQuestion={handleEndQuestion}
            onExit={onBack}
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
