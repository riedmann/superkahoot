import React, { useCallback, useRef } from "react";
import { CountdownScreen } from "./client/CountdownScreen";
import { QuestionScreen } from "./client/QuestionScreen";
import { ResultsScreen } from "./client/ResultsScreen";
import { WaitingRoom } from "./client/WaitingRoom";
import { WaitingForHostScreen } from "./client/WaitingForHostScreen";
import { FinishedScreen } from "./client/FinishedScreen";
import { FullscreenButton } from "../components/ui/details/FullscreenButton";
import { useFullscreen } from "./hooks/useFullscreen";
import { useCountdown } from "./hooks/useCountdown";
import { useClientFirebase } from "./hooks/useClientFirebase";
import { usePlayerInfo } from "./hooks/usePlayerInfo";

export default function GameClient() {
  const { gamePin, setGamePin, id, nickname, setNickname, generatePlayerId } =
    usePlayerInfo();

  const { isFullscreen, toggleFullscreen } = useFullscreen();

  // Track if we're currently processing an answer at the GameClient level
  const isProcessingAnswer = useRef(false);

  const {
    joined,
    state,
    countdown,
    setCountdown,
    questionIndex,
    questionCountdown,
    setQuestionCountdown,
    question,
    hasAnswered,
    sendJoinGame,
    sendAnswer,
  } = useClientFirebase(gamePin, id);

  useCountdown(state === "countdown", countdown, setCountdown);
  useCountdown(state === "question", questionCountdown, setQuestionCountdown);

  // Reset processing flag when question changes
  React.useEffect(() => {
    console.log(
      "GameClient: Question changed to index",
      questionIndex,
      "- resetting processing flag",
    );
    isProcessingAnswer.current = false;
  }, [questionIndex]);

  // Log when hasAnswered changes
  React.useEffect(() => {
    console.log("GameClient: hasAnswered changed to:", hasAnswered);
  }, [hasAnswered]);

  const handleJoin = useCallback(
    (e: React.FormEvent) => {
      e.preventDefault();
      const playerId = generatePlayerId();
      sendJoinGame(gamePin, playerId, nickname);
    },
    [gamePin, nickname, generatePlayerId, sendJoinGame],
  );

  const handleAnswer = useCallback(
    (answer: number) => {
      // FIRST: Check ref synchronously (most reliable)
      if (isProcessingAnswer.current) {
        console.log(
          "GameClient: Already processing answer, ignoring duplicate call",
        );
        return;
      }

      // SECOND: Check hasAnswered state
      if (hasAnswered) {
        console.log("GameClient: Already answered, ignoring click");
        return;
      }

      console.log(
        "GameClient: handleAnswer called with answer:",
        answer,
        "question type:",
        question?.type,
      );

      // Set ref immediately to block any subsequent calls
      isProcessingAnswer.current = true;

      let answerValue: boolean | number;
      if (question?.type === "true-false") {
        answerValue = answer === 0 ? true : false;
      } else {
        answerValue = answer;
      }
      console.log(
        "GameClient: Sending answer:",
        answerValue,
        "for question index:",
        questionIndex,
      );
      sendAnswer(gamePin, id, answerValue, questionIndex);
    },
    [question, gamePin, id, questionIndex, sendAnswer, hasAnswered],
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
    // Log the current state for debugging
    console.log("GameClient render: state=question, hasAnswered=", hasAnswered);

    // If player has already answered, show the "thank you" screen
    if (hasAnswered) {
      console.log("GameClient: Showing ResultsScreen (thank you)");
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

    console.log("GameClient: Showing QuestionScreen");
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
          hasAnswered={hasAnswered}
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
