import { useEffect, useCallback, useState } from "react";
import { ref, set, update, onValue, get } from "firebase/database";
import { realtimeDb } from "../../utils/firebase";
import type { Game, GameStatus } from "../../types/game";
import type { Quiz } from "../../types/quiz";

interface UseGameFirebaseReturn {
  game: Game | undefined;
  state: GameStatus;
  finalScore: any;
  wsError: string | null;
  isReconnecting: boolean;
  sendMessage: (message: any) => Promise<boolean>;
  connectWebSocket: () => void;
}

export function useGameFirebase(quiz: Quiz): UseGameFirebaseReturn {
  const [game, setGame] = useState<Game>();
  const [gamePin, setGamePin] = useState<string>();
  const [state, setState] = useState<GameStatus>("waiting");
  const [finalScore] = useState<any>();
  const [wsError, setWsError] = useState<string | null>(null);
  const [isReconnecting] = useState(false);

  // Create game in Firebase
  const connectWebSocket = useCallback(async () => {
    try {
      // Generate a unique 6-digit game PIN
      let newGamePin = "";
      let exists = true;

      while (exists) {
        newGamePin = Math.floor(100000 + Math.random() * 900000).toString();
        const gameRef = ref(realtimeDb, `games/${newGamePin}`);
        const snapshot = await get(gameRef);
        exists = snapshot.exists();
      }

      const gameRef = ref(realtimeDb, `games/${newGamePin}`);

      const newGame: Omit<Game, "id"> = {
        quizId: quiz.id,
        quizTitle: quiz.title,
        quizData: quiz,
        hostId: "host", // This should be set from auth context
        gamePin: newGamePin,
        status: "waiting",
        participants: [],
        currentQuestionIndex: 0,
        answeredQuestions: [],
        totalQuestions: quiz.questions.length,
        createdAt: new Date(),
        settings: {
          questionTimeLimit: 30,
          showCorrectAnswers: true,
          allowLateJoins: true,
        },
      };

      // Save to Firebase - convert arrays to objects for Firebase Realtime DB
      await set(gameRef, {
        ...newGame,
        createdAt: newGame.createdAt.toISOString(),
        participants: {}, // Store as empty object, not array
        answeredQuestions: {}, // Store as empty object, not array
      });

      console.log("Game created in Firebase with PIN:", newGamePin);
      setGamePin(newGamePin);
      setGame({ ...newGame, id: newGamePin });
      setWsError(null);
    } catch (error) {
      console.error("Error creating game:", error);
      setWsError("Failed to create game");
    }
  }, [quiz]);

  // Set up listener when gamePin is available
  useEffect(() => {
    if (!gamePin) return;

    console.log("Setting up Firebase listener for game:", gamePin);
    const gameRef = ref(realtimeDb, `games/${gamePin}`);

    const unsubscribe = onValue(gameRef, (snapshot) => {
      const data = snapshot.val();
      console.log("Firebase game data received:", data);
      if (data) {
        console.log("Raw participants:", data.participants);
        console.log("Raw answeredQuestions:", data.answeredQuestions);
        const participantsArray = data.participants
          ? Object.values(data.participants)
          : [];
        console.log("Converted participants array:", participantsArray);

        const gameData: Game = {
          ...data,
          id: gamePin,
          createdAt: new Date(data.createdAt),
          startedAt: data.startedAt ? new Date(data.startedAt) : undefined,
          finishedAt: data.finishedAt ? new Date(data.finishedAt) : undefined,
          participants: participantsArray,
          answeredQuestions: data.answeredQuestions
            ? Object.values(data.answeredQuestions).map((q: any) => ({
                ...q,
                startedAt: new Date(q.startedAt),
                endsAt: q.endsAt ? new Date(q.endsAt) : undefined,
                answers: q.answers ? Object.values(q.answers) : [],
              }))
            : [],
        };
        console.log(
          "Setting game state with participants:",
          gameData.participants,
        );
        console.log(
          "Setting game state with answeredQuestions:",
          gameData.answeredQuestions,
        );
        console.log("Current question index:", gameData.currentQuestionIndex);
        setGame(gameData);
        setState(data.status);
      }
    });

    return () => {
      console.log("Cleaning up Firebase listener for game:", gamePin);
      unsubscribe();
    };
  }, [gamePin]);

  // Define showNextQuestion first so it can be referenced by sendMessage
  const showNextQuestion = useCallback(async (gamePin: string) => {
    console.log("showNextQuestion called for game:", gamePin);
    const gameRef = ref(realtimeDb, `games/${gamePin}`);
    const snapshot = await get(gameRef);
    const gameData = snapshot.val();

    if (!gameData) {
      console.error("Game data not found");
      return;
    }

    console.log(
      "Current question index:",
      gameData.currentQuestionIndex,
      "Total:",
      gameData.totalQuestions,
    );

    if (gameData.currentQuestionIndex >= gameData.totalQuestions) {
      // Finish game
      console.log("All questions completed, finishing game");
      update(gameRef, {
        status: "finished",
        finishedAt: new Date().toISOString(),
      });
      return;
    }

    const questionIndex = gameData.currentQuestionIndex;

    // Create answered question entry
    const answeredQuestionRef = ref(
      realtimeDb,
      `games/${gamePin}/answeredQuestions/${questionIndex}`,
    );
    console.log("Creating answered question entry for index:", questionIndex);
    await set(answeredQuestionRef, {
      questionIndex,
      startedAt: new Date().toISOString(),
      endsAt: null,
      answers: {},
    });

    // Update game status to show question (don't increment index yet)
    console.log("Updating status to 'question'");
    await update(gameRef, {
      status: "question",
    });
    console.log("Question displayed successfully");
  }, []);

  // Handle different message types (converted to Firebase operations)
  const sendMessage = useCallback(
    async (message: any) => {
      if (!game) {
        console.error("Game not initialized");
        setWsError("Game not initialized");
        return false;
      }

      console.log("sendMessage called with:", message);

      try {
        const gameRef = ref(realtimeDb, `games/${game.gamePin}`);

        switch (message.type) {
          case "start_game": {
            console.log("Starting game, updating to countdown status");
            // Start countdown then show first question
            await update(gameRef, {
              status: "countdown",
              startedAt: new Date().toISOString(),
            });
            console.log("Status updated to countdown, waiting 3 seconds");
            setTimeout(() => {
              console.log("Calling showNextQuestion");
              showNextQuestion(game.gamePin);
            }, 3000);
            break;
          }

          case "next_question": {
            // Increment question index then show next question
            const gameRef = ref(realtimeDb, `games/${game.gamePin}`);
            const snapshot = await get(gameRef);
            const currentData = snapshot.val();
            await update(gameRef, {
              currentQuestionIndex: currentData.currentQuestionIndex + 1,
            });
            showNextQuestion(game.gamePin);
            break;
          }

          case "question_timeout": {
            // Mark question as ended and show results
            update(gameRef, { status: "results" });
            break;
          }

          case "disconnect_player": {
            const participantRef = ref(
              realtimeDb,
              `games/${game.gamePin}/participants/${message.playerId}`,
            );
            set(participantRef, null);
            break;
          }

          case "finish_game": {
            update(gameRef, {
              status: "finished",
              finishedAt: new Date().toISOString(),
            });
            break;
          }
        }

        return true;
      } catch (error) {
        console.error("Failed to send message:", error);
        setWsError("Failed to send message");
        return false;
      }
    },
    [game, showNextQuestion],
  );

  return {
    game,
    state,
    finalScore,
    wsError,
    isReconnecting,
    sendMessage,
    connectWebSocket,
  };
}
