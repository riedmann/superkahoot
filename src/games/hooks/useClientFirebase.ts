import { useEffect, useCallback, useState, useRef } from "react";
import { ref, onValue, off, get, set, update } from "firebase/database";
import { realtimeDb } from "../../utils/firebase";
import type { GameStatus } from "../../types/common";
import type { Question } from "../../types/question";

interface UseClientFirebaseReturn {
  joined: boolean;
  state: GameStatus;
  countdown: number;
  setCountdown: (value: number | ((prev: number) => number)) => void;
  questionIndex: number;
  questionCountdown: number;
  setQuestionCountdown: (value: number | ((prev: number) => number)) => void;
  question: Question | null;
  hasAnswered: boolean;
  sendJoinGame: (
    gameId: string,
    playerId: string,
    name: string,
    isReconnect?: boolean,
  ) => Promise<boolean>;
  sendAnswer: (
    gameId: string,
    playerId: string,
    answer: boolean | number,
    questionIndex: number,
  ) => void;
}

export function useClientFirebase(
  gamePin: string,
  playerId?: string,
): UseClientFirebaseReturn {
  const [joined, setJoined] = useState(false);
  const [state, setState] = useState<GameStatus>("waiting");
  const [countdown, setCountdown] = useState(3);
  const [questionIndex, setQuestionIndex] = useState(0);
  const [questionCountdown, setQuestionCountdown] = useState(30);
  const [question, setQuestion] = useState<Question | null>(null);
  const [hasAnswered, setHasAnswered] = useState(false);
  const [previousQuestionIndex, setPreviousQuestionIndex] =
    useState<number>(-1);

  // Use ref to track answer submission synchronously (prevents race conditions)
  const isSubmittingAnswer = useRef(false);

  // Listen to game updates
  useEffect(() => {
    if (!gamePin) return;

    const gameRef = ref(realtimeDb, `games/${gamePin}`);

    const unsubscribe = onValue(gameRef, (snapshot) => {
      const gameData = snapshot.val();

      if (!gameData) {
        console.error("Game not found");
        return;
      }

      // Update state
      setState(gameData.status);

      // Update question - currentQuestionIndex is now the actual 0-based index being shown
      if (gameData.status === "question" && gameData.quizData?.questions) {
        const currentQuestion =
          gameData.quizData.questions[gameData.currentQuestionIndex];
        setQuestion(currentQuestion);

        // Check if this player has already answered the current question
        const currentAnsweredQuestion =
          gameData.answeredQuestions?.[gameData.currentQuestionIndex];
        const playerHasAnswered =
          playerId && currentAnsweredQuestion?.answers?.[playerId];

        // Only reset hasAnswered when question index actually changes
        if (previousQuestionIndex !== gameData.currentQuestionIndex) {
          console.log(
            "Client: Question index changed from",
            previousQuestionIndex,
            "to",
            gameData.currentQuestionIndex,
          );
          setQuestionIndex(gameData.currentQuestionIndex);
          setPreviousQuestionIndex(gameData.currentQuestionIndex);

          // Check if player already answered this question (in case of reconnection)
          if (playerHasAnswered) {
            console.log(
              "Client: Player has answered this question, setting hasAnswered=true",
            );
            setHasAnswered(true);
            isSubmittingAnswer.current = true;
          } else {
            console.log(
              "Client: New question, player hasn't answered, setting hasAnswered=false",
            );
            setHasAnswered(false);
            isSubmittingAnswer.current = false;
          }

          console.log(
            "Client: Showing NEW question at index:",
            gameData.currentQuestionIndex,
            currentQuestion,
          );
        } else if (playerHasAnswered && !isSubmittingAnswer.current) {
          // If we're on the same question but Firebase shows we've answered and we're not currently submitting
          // This handles the case where the answer was saved but state wasn't updated
          console.log(
            "Client: Same question, but player has now answered in Firebase - updating state to hasAnswered=true",
          );
          setHasAnswered(true);
          isSubmittingAnswer.current = true;
        }
      }

      // Reset hasAnswered when not in question state
      if (gameData.status !== "question") {
        setHasAnswered(false);
        isSubmittingAnswer.current = false; // Reset ref
        setPreviousQuestionIndex(-1);
      }

      // Handle countdown based on status
      if (gameData.status === "countdown") {
        setCountdown(3);
        setQuestionCountdown(gameData.settings?.questionTimeLimit || 30);
      }
    });

    return () => {
      off(gameRef);
      unsubscribe();
    };
  }, [gamePin]);

  const sendJoinGame = useCallback(
    async (
      gameId: string,
      playerId: string,
      name: string,
      isReconnect = false,
    ) => {
      console.log(
        "Attempting to join game:",
        gameId,
        "as",
        name,
        "with ID:",
        playerId,
        "(reconnect:",
        isReconnect,
        ")",
      );
      try {
        const gameRef = ref(realtimeDb, `games/${gameId}`);
        const snapshot = await get(gameRef);

        if (!snapshot.exists()) {
          console.error("Game not found:", gameId);
          alert("Game not found");
          return false;
        }

        const gameData = snapshot.val();
        console.log("Game found, current participants:", gameData.participants);
        const participants = gameData.participants || {};

        // Check if this player already exists (reconnection)
        const existingPlayer = participants[playerId];

        if (existingPlayer) {
          // Reconnecting - verify the name matches
          if (existingPlayer.name === name) {
            console.log("Reconnecting existing player:", name);
            setJoined(true);
            return true;
          } else {
            alert(
              "Player ID exists but name doesn't match. Please use a new session.",
            );
            return false;
          }
        }

        // Check for duplicate name (only for new joins)
        const duplicateName = Object.values(participants).find(
          (p: any) => p.name === name && p.id !== playerId,
        );

        if (duplicateName) {
          alert("A player with this name already exists in the game");
          return false;
        }

        // Add new participant
        const participantRef = ref(
          realtimeDb,
          `games/${gameId}/participants/${playerId}`,
        );
        console.log("Adding participant to Firebase...");
        await set(participantRef, {
          id: playerId,
          name,
          score: 0,
        });

        console.log("Participant added successfully!");
        setJoined(true);
        return true;
      } catch (error) {
        console.error("Failed to join game:", error);
        alert("Failed to join game");
        return false;
      }
    },
    [],
  );

  const sendAnswer = useCallback(
    async (
      gameId: string,
      playerId: string,
      answer: boolean | number,
      questionIdx: number,
    ) => {
      // Check ref synchronously to prevent race conditions
      if (isSubmittingAnswer.current) {
        console.log("Already submitting answer, ignoring duplicate call");
        return;
      }

      console.log("sendAnswer called:", {
        gameId,
        playerId,
        answer,
        questionIdx,
      });

      // Mark as submitting immediately (synchronous, no race condition)
      isSubmittingAnswer.current = true;
      // Also set state for UI feedback - this should trigger immediate transition to thank you screen
      setHasAnswered(true);
      console.log(
        "hasAnswered set to true - UI should now show thank you screen",
      );

      try {
        const gameRef = ref(realtimeDb, `games/${gameId}`);
        const snapshot = await get(gameRef);

        if (!snapshot.exists()) {
          console.error("Game not found");
          setHasAnswered(false);
          isSubmittingAnswer.current = false; // Reset ref on error
          return;
        }

        const gameData = snapshot.val();
        console.log("Game data for answer:", gameData);
        const currentQuestion = gameData.quizData.questions[questionIdx];
        console.log("Current question:", currentQuestion);
        const answeredQuestion = gameData.answeredQuestions?.[questionIdx];
        console.log("Answered question data:", answeredQuestion);

        // Check if already answered
        if (answeredQuestion?.answers?.[playerId]) {
          console.error("Already answered this question");
          // Don't reset ref here - keep it true to prevent further attempts
          return;
        }

        // Calculate if answer is correct
        let isCorrect = false;
        if (currentQuestion.type === "true-false") {
          isCorrect = answer === currentQuestion.correctAnswer;
        } else if (currentQuestion.type === "standard") {
          isCorrect =
            currentQuestion.correctAnswers?.includes(answer as number) || false;
        }

        // Calculate points with time bonus
        let points = 0;
        if (isCorrect) {
          const basePoints = 500;
          const maxTimeBonus = 500;
          const penaltyPerSecond = 10;

          const questionStartTime = answeredQuestion?.startedAt
            ? new Date(answeredQuestion.startedAt).getTime()
            : Date.now();
          const answerTime = Date.now();
          const elapsedSeconds = Math.floor(
            (answerTime - questionStartTime) / 1000,
          );
          const timeBonus = Math.max(
            0,
            maxTimeBonus - elapsedSeconds * penaltyPerSecond,
          );

          points = basePoints + timeBonus;
        }

        // Get participant data
        const participant = gameData.participants[playerId];
        console.log("Participant data:", participant);

        // Store answer
        const answerRef = ref(
          realtimeDb,
          `games/${gameId}/answeredQuestions/${questionIdx}/answers/${playerId}`,
        );
        console.log(
          "Storing answer at path:",
          `games/${gameId}/answeredQuestions/${questionIdx}/answers/${playerId}`,
        );
        console.log("Answer data:", {
          participant: {
            id: participant.id,
            name: participant.name,
          },
          questionId: questionIdx.toString(),
          answer,
          answeredAt: new Date().toISOString(),
          isCorrect,
          points,
        });
        await set(answerRef, {
          participant: {
            id: participant.id,
            name: participant.name,
          },
          questionId: questionIdx.toString(),
          answer,
          answeredAt: new Date().toISOString(),
          isCorrect,
          points,
        });
        console.log("Answer stored successfully!");

        // Update participant score
        const participantRef = ref(
          realtimeDb,
          `games/${gameId}/participants/${playerId}`,
        );
        console.log(
          "Updating participant score from",
          participant.score,
          "to",
          (participant.score || 0) + points,
        );
        await update(participantRef, {
          score: (participant.score || 0) + points,
        });
        console.log("Score updated successfully!");

        // Ensure hasAnswered is set after successful score update
        console.log("Confirming hasAnswered state after score update...");
        setHasAnswered(true); // Set again to ensure state is updated
        console.log(
          "hasAnswered confirmed as true - UI should show thank you screen now",
        );
      } catch (error) {
        console.error("Failed to send answer:", error);
        // Reset on error so user can try again
        setHasAnswered(false);
        isSubmittingAnswer.current = false;
      }
    },
    [],
  );

  return {
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
  };
}
