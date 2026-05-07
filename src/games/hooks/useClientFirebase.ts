import { useEffect, useState, useCallback } from "react";
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
  sendJoinGame: (gameId: string, playerId: string, name: string) => void;
  sendAnswer: (
    gameId: string,
    playerId: string,
    answer: boolean | number,
    questionIndex: number,
  ) => void;
}

export function useClientFirebase(gamePin: string): UseClientFirebaseReturn {
  const [joined, setJoined] = useState(false);
  const [state, setState] = useState<GameStatus>("waiting");
  const [countdown, setCountdown] = useState(3);
  const [questionIndex, setQuestionIndex] = useState(0);
  const [questionCountdown, setQuestionCountdown] = useState(30);
  const [question, setQuestion] = useState<Question | null>(null);
  const [hasAnswered, setHasAnswered] = useState(false);

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
        setQuestionIndex(gameData.currentQuestionIndex);
        // Reset hasAnswered when question changes
        setHasAnswered(false);
        console.log(
          "Client: Showing question at index:",
          gameData.currentQuestionIndex,
          currentQuestion,
        );
      }

      // Reset hasAnswered when not in question state
      if (gameData.status !== "question") {
        setHasAnswered(false);
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
    async (gameId: string, playerId: string, name: string) => {
      console.log(
        "Attempting to join game:",
        gameId,
        "as",
        name,
        "with ID:",
        playerId,
      );
      try {
        const gameRef = ref(realtimeDb, `games/${gameId}`);
        const snapshot = await get(gameRef);

        if (!snapshot.exists()) {
          console.error("Game not found:", gameId);
          alert("Game not found");
          return;
        }

        const gameData = snapshot.val();
        console.log("Game found, current participants:", gameData.participants);
        const participants = gameData.participants || {};

        // Check for duplicate name
        const duplicateName = Object.values(participants).find(
          (p: any) => p.name === name && p.id !== playerId,
        );

        if (duplicateName) {
          alert("A player with this name already exists in the game");
          return;
        }

        // Add participant
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
      } catch (error) {
        console.error("Failed to join game:", error);
        alert("Failed to join game");
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
      console.log("sendAnswer called:", {
        gameId,
        playerId,
        answer,
        questionIdx,
      });

      // Optimistically mark as answered to prevent duplicate submissions
      setHasAnswered(true);

      try {
        const gameRef = ref(realtimeDb, `games/${gameId}`);
        const snapshot = await get(gameRef);

        if (!snapshot.exists()) {
          console.error("Game not found");
          setHasAnswered(false);
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
      } catch (error) {
        console.error("Failed to send answer:", error);
        // Reset hasAnswered on error so user can try again
        setHasAnswered(false);
      }
    },
    [setHasAnswered],
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
