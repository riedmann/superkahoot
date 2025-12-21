import {
  addDoc,
  arrayUnion,
  collection,
  doc,
  getDoc,
  getDocs,
  onSnapshot,
  query,
  runTransaction,
  serverTimestamp,
  updateDoc,
  where,
} from "firebase/firestore";
import type {
  Game,
  GameAnswer,
  GameQuestion,
  GameStatus,
  Participant,
  Quiz,
} from "../types";
import { db } from "../utils/firebase";
import type { IGameDAO } from "./GameDAO";

export class FirebaseGameDAO implements IGameDAO {
  private gamesCollection = collection(db, "games");
  private timeOffset = 0;
  private lastTimeSync = 0;
  private readonly TIME_SYNC_INTERVAL = 300000; // 5 minutes

  private generateGamePin(): string {
    return Math.floor(100000 + Math.random() * 900000).toString();
  }

  // Fetch accurate time from internet time server
  async fetchInternetTime(): Promise<Date> {
    try {
      // Try WorldTimeAPI first
      const response = await fetch("https://worldtimeapi.org/api/timezone/UTC");
      if (response.ok) {
        const data = await response.json();
        return new Date(data.datetime);
      }
    } catch (error) {
      console.warn("WorldTimeAPI failed, trying backup:", error);
    }

    try {
      // Backup: Use timeapi.io
      const response = await fetch(
        "https://timeapi.io/api/Time/current/zone?timeZone=UTC"
      );
      if (response.ok) {
        const data = await response.json();
        return new Date(data.dateTime);
      }
    } catch (error) {
      console.warn("timeapi.io failed, trying final backup:", error);
    }

    try {
      // Final backup: HTTP date header
      const response = await fetch("https://www.google.com", {
        method: "HEAD",
      });
      const dateHeader = response.headers.get("Date");
      if (dateHeader) {
        return new Date(dateHeader);
      }
    } catch (error) {
      console.warn("All time servers failed, using local time:", error);
    }

    // Fallback to local time
    return new Date();
  }

  // Synchronize with internet time server
  async syncWithTimeServer(): Promise<void> {
    const now = Date.now();

    // Only sync if enough time has passed since last sync
    if (now - this.lastTimeSync < this.TIME_SYNC_INTERVAL) {
      return;
    }

    try {
      const localTimeBeforeRequest = Date.now();
      const serverTime = await this.fetchInternetTime();
      const localTimeAfterRequest = Date.now();

      // Account for network delay by taking the average
      const networkDelay = (localTimeAfterRequest - localTimeBeforeRequest) / 2;
      const adjustedServerTime = serverTime.getTime() + networkDelay;

      this.timeOffset = adjustedServerTime - localTimeAfterRequest;
      this.lastTimeSync = now;

      console.log("Time synchronized with internet server:", {
        offset: this.timeOffset,
        networkDelay,
        serverTime: new Date(adjustedServerTime).toISOString(),
      });
    } catch (error) {
      console.error("Failed to sync with time server:", error);
    }
  }

  // Get current accurate time
  getCurrentTime(): Date {
    return new Date(Date.now() + this.timeOffset);
  }

  // Check if time sync is needed
  private needsTimeSync(): boolean {
    return Date.now() - this.lastTimeSync > this.TIME_SYNC_INTERVAL;
  }

  async createGame(quiz: Quiz, hostId: string): Promise<Game> {
    // Sync with internet time server when creating game
    await this.syncWithTimeServer();

    const gamePin = this.generateGamePin();

    const gameData = {
      quizId: quiz.id,
      quizTitle: quiz.title,
      quizData: quiz, // Store full quiz data for clients
      hostId,
      gamePin,
      status: "waiting" as GameStatus,
      participants: [],
      currentQuestionIndex: -1,
      totalQuestions: quiz.questions.length,
      createdAt: serverTimestamp(),
      gameStartTime: this.getCurrentTime(), // Store accurate start time
      settings: {
        questionTimeLimit: 30,
        showCorrectAnswers: true,
        allowLateJoins: true,
      },
    };

    const docRef = await addDoc(this.gamesCollection, gameData);

    return {
      id: docRef.id,
      ...gameData,
      createdAt: new Date(),
    } as Game;
  }

  async getGame(gameId: string): Promise<Game | null> {
    const docRef = doc(this.gamesCollection, gameId);
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
      const data = docSnap.data();
      const game: Game = {
        id: docSnap.id,
        ...data,
        createdAt: data.createdAt?.toDate() || new Date(),
        startedAt: data.startedAt?.toDate(),
        finishedAt: data.finishedAt?.toDate(),
      } as Game;

      // Convert nested timestamp fields in currentQuestion
      if (game.currentQuestion) {
        game.currentQuestion = {
          ...game.currentQuestion,
          startedAt: (game.currentQuestion.startedAt as any)?.toDate
            ? (game.currentQuestion.startedAt as any).toDate()
            : new Date(game.currentQuestion.startedAt),
          endsAt: (game.currentQuestion.endsAt as any)?.toDate
            ? (game.currentQuestion.endsAt as any).toDate()
            : new Date(game.currentQuestion.endsAt),
        };

        // Convert answer timestamps
        if (game.currentQuestion.answers) {
          game.currentQuestion.answers = game.currentQuestion.answers.map(
            (a) => ({
              ...a,
              answeredAt: (a.answeredAt as any)?.toDate
                ? (a.answeredAt as any).toDate()
                : new Date(a.answeredAt),
            })
          );
        }
      }

      // Convert participant timestamps
      if (game.participants) {
        game.participants = game.participants.map((p) => ({
          ...p,
          joinedAt: (p.joinedAt as any)?.toDate
            ? (p.joinedAt as any).toDate()
            : new Date(p.joinedAt),
        }));
      }

      return game;
    }

    return null;
  }

  async updateGameStatus(gameId: string, status: GameStatus): Promise<void> {
    const docRef = doc(this.gamesCollection, gameId);
    const updates: any = { status };

    if (status === "active") {
      updates.startedAt = serverTimestamp();
    } else if (status === "finished") {
      updates.finishedAt = serverTimestamp();
    }

    await updateDoc(docRef, updates);
  }

  subscribeToGame(
    gameId: string,
    onUpdate: (game: Game) => void,
    onError: (error: string) => void
  ): () => void {
    const docRef = doc(this.gamesCollection, gameId);

    return onSnapshot(
      docRef,
      (doc) => {
        if (doc.exists()) {
          const data = doc.data();
          const game: Game = {
            id: doc.id,
            ...data,
            createdAt: data.createdAt?.toDate() || new Date(),
            startedAt: data.startedAt?.toDate(),
            finishedAt: data.finishedAt?.toDate(),
          } as Game;

          // Convert nested timestamp fields in currentQuestion
          if (game.currentQuestion) {
            game.currentQuestion = {
              ...game.currentQuestion,
              startedAt: (game.currentQuestion.startedAt as any)?.toDate
                ? (game.currentQuestion.startedAt as any).toDate()
                : new Date(game.currentQuestion.startedAt),
              endsAt: (game.currentQuestion.endsAt as any)?.toDate
                ? (game.currentQuestion.endsAt as any).toDate()
                : new Date(game.currentQuestion.endsAt),
            };

            // Convert answer timestamps
            if (game.currentQuestion.answers) {
              game.currentQuestion.answers = game.currentQuestion.answers.map(
                (a) => ({
                  ...a,
                  answeredAt: (a.answeredAt as any)?.toDate
                    ? (a.answeredAt as any).toDate()
                    : new Date(a.answeredAt),
                })
              );
            }
          }

          // Convert participant timestamps
          if (game.participants) {
            game.participants = game.participants.map((p) => ({
              ...p,
              joinedAt: (p.joinedAt as any)?.toDate
                ? (p.joinedAt as any).toDate()
                : new Date(p.joinedAt),
            }));
          }

          onUpdate(game);
        }
      },
      (error) => onError(error.message)
    );
  }

  async addParticipant(
    gameId: string,
    participant: Omit<
      Participant,
      "id" | "joinedAt" | "score" | "answerHistory"
    >
  ): Promise<Participant> {
    // Sync with server time for consistent participant joining times
    await this.syncWithTimeServer();

    const newParticipant: Participant = {
      id: `p${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      ...participant,
      score: 0,
      joinedAt: this.getCurrentTime(),
      isOnline: true,
      answerHistory: [],
    };

    const docRef = doc(this.gamesCollection, gameId);
    await updateDoc(docRef, {
      participants: arrayUnion(newParticipant),
    });

    return newParticipant;
  }

  async updateParticipantStatus(
    gameId: string,
    participantId: string,
    isOnline: boolean
  ): Promise<void> {
    const game = await this.getGame(gameId);
    if (!game) return;

    const updatedParticipants = game.participants.map((p) =>
      p.id === participantId ? { ...p, isOnline } : p
    );

    const docRef = doc(this.gamesCollection, gameId);
    await updateDoc(docRef, {
      participants: updatedParticipants,
    });
  }

  async startCountdown(gameId: string, questionIndex: number): Promise<void> {
    // Ensure we have recent time sync
    if (this.needsTimeSync()) {
      await this.syncWithTimeServer();
    }

    const docRef = doc(this.gamesCollection, gameId);
    await updateDoc(docRef, {
      status: "countdown",
      currentQuestionIndex: questionIndex,
      countdownStartTime: this.getCurrentTime(),
    });
  }

  async startQuestion(gameId: string, questionIndex: number): Promise<void> {
    // Use accurate internet time for question timing
    if (this.needsTimeSync()) {
      await this.syncWithTimeServer();
    }

    const now = this.getCurrentTime();
    const endsAt = new Date(now.getTime() + 30000); // 30 seconds from accurate time

    const currentQuestion: GameQuestion = {
      id: `q${questionIndex}_${Date.now()}`,
      questionIndex,
      startedAt: now,
      endsAt,
      answers: [],
    };

    console.log("Starting question with accurate time:", {
      serverTime: now.toISOString(),
      endsAt: endsAt.toISOString(),
      timeOffset: this.timeOffset,
    });

    const docRef = doc(this.gamesCollection, gameId);
    await updateDoc(docRef, {
      status: "question",
      currentQuestionIndex: questionIndex,
      currentQuestion,
    });
  }

  async submitAnswer(
    gameId: string,
    answer: Omit<GameAnswer, "answeredAt" | "isCorrect" | "points">
  ): Promise<void> {
    console.log("Starting answer submission:", {
      participantId: answer.participantId,
      answer: answer.answer,
      gameId,
      questionId: answer.questionId,
    });

    const docRef = doc(this.gamesCollection, gameId);

    try {
      await runTransaction(db, async (transaction) => {
        // Get the current game state within the transaction
        const gameDoc = await transaction.get(docRef);
        if (!gameDoc.exists()) {
          throw new Error("Game not found");
        }

        const gameData = gameDoc.data();
        const game: Game = {
          id: gameDoc.id,
          ...gameData,
          createdAt: gameData.createdAt?.toDate() || new Date(),
          startedAt: gameData.startedAt?.toDate(),
          finishedAt: gameData.finishedAt?.toDate(),
        } as Game;

        // Convert timestamps in currentQuestion
        if (game.currentQuestion) {
          game.currentQuestion = {
            ...game.currentQuestion,
            startedAt: (game.currentQuestion.startedAt as any)?.toDate
              ? (game.currentQuestion.startedAt as any).toDate()
              : new Date(game.currentQuestion.startedAt),
            endsAt: (game.currentQuestion.endsAt as any)?.toDate
              ? (game.currentQuestion.endsAt as any).toDate()
              : new Date(game.currentQuestion.endsAt),
          };

          // Convert answer timestamps
          if (game.currentQuestion.answers) {
            game.currentQuestion.answers = game.currentQuestion.answers.map(
              (a) => ({
                ...a,
                answeredAt: (a.answeredAt as any)?.toDate
                  ? (a.answeredAt as any).toDate()
                  : new Date(a.answeredAt),
              })
            );
          }
        }

        // Convert participant timestamps
        if (game.participants) {
          game.participants = game.participants.map((p) => ({
            ...p,
            joinedAt: (p.joinedAt as any)?.toDate
              ? (p.joinedAt as any).toDate()
              : new Date(p.joinedAt),
            answerHistory: (p.answerHistory || []).map((ah) => ({
              ...ah,
              answeredAt: (ah.answeredAt as any)?.toDate
                ? (ah.answeredAt as any).toDate()
                : new Date(ah.answeredAt),
            })),
          }));
        }

        if (!game.currentQuestion || !game.quizData) {
          throw new Error("No active question");
        }

        // Check if participant has already answered this question
        const existingAnswer = game.currentQuestion.answers.find(
          (a) => a.participantId === answer.participantId
        );
        if (existingAnswer) {
          console.log("Participant has already answered this question");
          return; // Don't submit duplicate answers
        }

        const currentQuestion =
          game.quizData.questions[game.currentQuestionIndex];
        if (!currentQuestion) {
          throw new Error("Current question not found");
        }

        // Calculate if answer is correct
        let isCorrect = false;
        if (currentQuestion.type === "true-false") {
          const answerBool =
            typeof answer.answer === "boolean"
              ? answer.answer
              : answer.answer === "true";
          isCorrect = answerBool === currentQuestion.correctAnswer;
        } else if (currentQuestion.type === "standard") {
          const answerIndex =
            typeof answer.answer === "number"
              ? answer.answer
              : parseInt(String(answer.answer));
          isCorrect =
            currentQuestion.correctAnswers?.includes(answerIndex) || false;
        }

        // Calculate points (base points + time bonus)
        const basePoints = isCorrect ? 1000 : 0;
        const currentTime = this.getCurrentTime();
        const timeLeft = Math.max(
          0,
          game.currentQuestion.endsAt.getTime() - currentTime.getTime()
        );
        const timeBonus = isCorrect ? Math.floor((timeLeft / 1000) * 10) : 0;
        const totalPoints = basePoints + timeBonus;

        const gameAnswer: GameAnswer = {
          ...answer,
          answeredAt: currentTime,
          isCorrect,
          points: totalPoints,
        };

        console.log("Scoring calculation:", {
          participantId: answer.participantId,
          questionIndex: game.currentQuestionIndex,
          basePoints,
          timeLeft: timeLeft / 1000,
          timeBonus,
          totalPoints,
          currentScore:
            game.participants.find((p) => p.id === answer.participantId)
              ?.score || 0,
        });

        // Update the current question with the new answer
        const updatedAnswers = [...game.currentQuestion.answers, gameAnswer];
        const updatedQuestion = {
          ...game.currentQuestion,
          answers: updatedAnswers,
        };

        // Update participant score and answer history
        const updatedParticipants = game.participants.map((p) => {
          if (p.id === answer.participantId) {
            const answerHistoryEntry = {
              questionId: answer.questionId,
              questionIndex: game.currentQuestionIndex,
              answer: answer.answer,
              isCorrect,
              points: totalPoints,
              answeredAt: currentTime,
            };

            return {
              ...p,
              score: p.score + totalPoints,
              answerHistory: [...(p.answerHistory || []), answerHistoryEntry],
            };
          }
          return p;
        });

        console.log("Participant score updated:", {
          participantId: answer.participantId,
          previousScore:
            game.participants.find((p) => p.id === answer.participantId)
              ?.score || 0,
          pointsAdded: totalPoints,
          newScore:
            (game.participants.find((p) => p.id === answer.participantId)
              ?.score || 0) + totalPoints,
        });

        // Atomic update within transaction
        transaction.update(docRef, {
          currentQuestion: updatedQuestion,
          participants: updatedParticipants,
        });

        console.log("Answer submitted successfully in transaction:", {
          participantId: answer.participantId,
          isCorrect,
          points: totalPoints,
          totalAnswers: updatedAnswers.length,
        });
      });
    } catch (error) {
      console.error("Failed to submit answer:", error);
      throw new Error(
        `Failed to submit answer: ${
          error instanceof Error ? error.message : "Unknown error"
        }`
      );
    }
  }

  async endQuestion(gameId: string): Promise<void> {
    const docRef = doc(this.gamesCollection, gameId);
    await updateDoc(docRef, {
      status: "results",
    });
  }

  async finishGame(gameId: string): Promise<void> {
    await this.updateGameStatus(gameId, "finished");
  }

  async getGameByPin(gamePin: string): Promise<Game | null> {
    const q = query(this.gamesCollection, where("gamePin", "==", gamePin));
    const querySnapshot = getDocs(q);

    const docs = (await querySnapshot).docs;
    if (docs.length > 0) {
      const doc = docs[0];
      const data = doc.data();
      const game: Game = {
        id: doc.id,
        ...data,
        createdAt: data.createdAt?.toDate() || new Date(),
        startedAt: data.startedAt?.toDate(),
        finishedAt: data.finishedAt?.toDate(),
      } as Game;

      // Convert nested timestamp fields in currentQuestion
      if (game.currentQuestion) {
        game.currentQuestion = {
          ...game.currentQuestion,
          startedAt: (game.currentQuestion.startedAt as any)?.toDate
            ? (game.currentQuestion.startedAt as any).toDate()
            : new Date(game.currentQuestion.startedAt),
          endsAt: (game.currentQuestion.endsAt as any)?.toDate
            ? (game.currentQuestion.endsAt as any).toDate()
            : new Date(game.currentQuestion.endsAt),
        };

        // Convert answer timestamps
        if (game.currentQuestion.answers) {
          game.currentQuestion.answers = game.currentQuestion.answers.map(
            (a) => ({
              ...a,
              answeredAt: (a.answeredAt as any)?.toDate
                ? (a.answeredAt as any).toDate()
                : new Date(a.answeredAt),
            })
          );
        }
      }

      // Convert participant timestamps
      if (game.participants) {
        game.participants = game.participants.map((p) => ({
          ...p,
          joinedAt: (p.joinedAt as any)?.toDate
            ? (p.joinedAt as any).toDate()
            : new Date(p.joinedAt),
        }));
      }

      return game;
    }

    return null;
  }
}
