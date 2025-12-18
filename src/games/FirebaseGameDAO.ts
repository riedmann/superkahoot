import {
  addDoc,
  arrayUnion,
  collection,
  doc,
  getDoc,
  getDocs,
  onSnapshot,
  query,
  serverTimestamp,
  updateDoc,
  where,
} from "firebase/firestore";
import type { Quiz } from "../types";
import { db } from "../utils/firebase";
import type { IGameDAO } from "./GameDAO";
import type {
  Game,
  GameAnswer,
  GameQuestion,
  GameStatus,
  Participant,
} from "../types";

export class FirebaseGameDAO implements IGameDAO {
  private gamesCollection = collection(db, "games");

  private generateGamePin(): string {
    return Math.floor(100000 + Math.random() * 900000).toString();
  }

  async createGame(quiz: Quiz, hostId: string): Promise<Game> {
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
    participant: Omit<Participant, "id" | "joinedAt" | "score">
  ): Promise<Participant> {
    const newParticipant: Participant = {
      id: `p${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      ...participant,
      score: 0,
      joinedAt: new Date(),
      isOnline: true,
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

  async startQuestion(gameId: string, questionIndex: number): Promise<void> {
    const now = new Date();
    const endsAt = new Date(now.getTime() + 30000); // 30 seconds from now

    const currentQuestion: GameQuestion = {
      id: `q${questionIndex}_${Date.now()}`,
      questionIndex,
      startedAt: now,
      endsAt,
      answers: [],
    };

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
    const game = await this.getGame(gameId);
    if (!game || !game.currentQuestion || !game.quizData) return;

    const currentQuestion = game.quizData.questions[game.currentQuestionIndex];
    if (!currentQuestion) return;

    // Calculate if answer is correct
    let isCorrect = false;
    if (currentQuestion.type === "true-false") {
      // For true/false, answer.answer should be a boolean or string "true"/"false"
      const answerBool =
        typeof answer.answer === "boolean"
          ? answer.answer
          : answer.answer === "true";
      isCorrect = answerBool === currentQuestion.correctAnswer;
    } else if (currentQuestion.type === "standard") {
      // For multiple choice, check if the selected option index is in correctAnswers array
      const answerIndex =
        typeof answer.answer === "number"
          ? answer.answer
          : parseInt(String(answer.answer));
      isCorrect =
        currentQuestion.correctAnswers?.includes(answerIndex) || false;
    }

    // Calculate points (base points + time bonus)
    const basePoints = isCorrect ? 1000 : 0;
    const timeLeft = Math.max(
      0,
      game.currentQuestion.endsAt.getTime() - Date.now()
    );
    const timeBonus = isCorrect ? Math.floor((timeLeft / 1000) * 10) : 0; // 10 points per second remaining
    const totalPoints = basePoints + timeBonus;

    const gameAnswer: GameAnswer = {
      ...answer,
      answeredAt: new Date(),
      isCorrect,
      points: totalPoints,
    };

    const updatedAnswers = [...game.currentQuestion.answers, gameAnswer];
    const updatedQuestion = {
      ...game.currentQuestion,
      answers: updatedAnswers,
    };

    // Update participant score
    const updatedParticipants = game.participants.map((p) =>
      p.id === answer.participantId ? { ...p, score: p.score + totalPoints } : p
    );

    const docRef = doc(this.gamesCollection, gameId);
    await updateDoc(docRef, {
      currentQuestion: updatedQuestion,
      participants: updatedParticipants,
    });
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
