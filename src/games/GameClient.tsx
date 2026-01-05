import React, { useCallback } from "react";
import { CountdownScreen } from "./client/CountdownScreen";
import { QuestionScreen } from "./client/QuestionScreen";
import { ResultsScreen } from "./client/ResultsScreen";
import { WaitingRoom } from "./client/WaitingRoom";
import { WaitingForHostScreen } from "./client/WaitingForHostScreen";
import { FinishedScreen } from "./client/FinishedScreen";
import { FullscreenButton } from "../components/ui/details/FullscreenButton";
import { useFullscreen } from "./hooks/useFullscreen";
import { useCountdown } from "./hooks/useCountdown";
import { useClientWebSocket } from "./hooks/useClientWebSocket";
import { usePlayerInfo } from "./hooks/usePlayerInfo";

export default function GameClient() {
  const { gamePin, setGamePin, id, nickname, setNickname, generatePlayerId } =
    usePlayerInfo();

  const { isFullscreen, toggleFullscreen } = useFullscreen();

  const {
    joined,
    state,
    countdown,
    questionIndex,
    questionCountdown,
    question,
    sendJoinGame,
    sendAnswer,
  } = useClientWebSocket(gamePin);

  useCountdown(state === "countdown", countdown, () => {});
  useCountdown(state === "question", questionCountdown, () => {});

  const handleJoin = useCallback(
    (e: React.FormEvent) => {
      e.preventDefault();
      const playerId = generatePlayerId();
      sendJoinGame(gamePin, playerId, nickname);
    },
    [gamePin, nickname, generatePlayerId, sendJoinGame]
  );

  const handleAnswer = useCallback(
    (answer: number) => {
      let answerValue: boolean | number;
      if (question?.type === "true-false") {
        answerValue = answer === 0 ? true : false;
      } else {
        answerValue = answer;
      }
      sendAnswer(gamePin, id, answerValue, questionIndex);
    },
    [question, gamePin, id, questionIndex, sendAnswer]
  );

  if (!joined) {
    return (
      <WaitingRoom
        gamePin={gamePin}
        nickname={nickname}
        setGamePin={setGamePin}
        setNickname={setNickname}
        handleJoin={handleJoin}
      />
    );
  }

  if (state === "waiting") {
    return (
      <WaitingForHostScreen
        gamePin={gamePin}
        nickname={nickname}
        isFullscreen={isFullscreen}
        onToggleFullscreen={toggleFullscreen}
      />
    );
  }

  if (state === "countdown") {
    return (
      <>
        <FullscreenButton
          isFullscreen={isFullscreen}
          onToggle={toggleFullscreen}
        />
        <CountdownScreen countdown={countdown} />
      </>
    );
  }

  if (state === "question" && question) {
    return (
      <>
        <FullscreenButton
          isFullscreen={isFullscreen}
          onToggle={toggleFullscreen}
        />
        <QuestionScreen
          question={question}
          questionIndex={questionIndex}
          questionCountdown={questionCountdown}
          onAnswer={handleAnswer}
        />
      </>
    );
  }

  if (state === "results") {
    return (
      <>
        <FullscreenButton
          isFullscreen={isFullscreen}
          onToggle={toggleFullscreen}
        />
        <ResultsScreen />
      </>
    );
  }

  if (state === "finished") {
    return (
      <FinishedScreen
        isFullscreen={isFullscreen}
        onToggleFullscreen={toggleFullscreen}
      />
    );
  }

  return null;
}
