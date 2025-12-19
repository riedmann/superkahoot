import {
  addDoc,
  collection,
  doc,
  deleteDoc,
  getDoc,
  getDocs,
  onSnapshot,
  query,
  serverTimestamp,
  updateDoc,
} from "firebase/firestore";
import type { Quiz } from "../../types";
import { db } from "../firebase";
import type { QuizDAOI } from "./QuizDAOI";

export class FirebaseQuizDAO implements QuizDAOI {
  subscribeToQuizzes(
    onSuccess: (quizzes: Quiz[]) => void,
    onError: (error: string) => void
  ): () => void {
    const quizzesCollection = collection(db, "quizzes");
    const q = query(quizzesCollection);

    const unsubscribe = onSnapshot(
      q,
      async (snapshot) => {
        try {
          const quizzesData: Quiz[] = [];

          for (const doc of snapshot.docs) {
            const quizData = doc.data();

            // Check if questions are in main document first
            if (quizData.questions && quizData.questions.length > 0) {
              quizzesData.push({
                id: doc.id,
                title: quizData.title,
                description: quizData.description,
                difficulty: quizData.difficulty,
                category: quizData.category,
                questions: quizData.questions,
              });
            } else {
              // Fallback: try to fetch questions from subcollection
              const questionsRef = collection(
                db,
                "quizzes",
                doc.id,
                "questions"
              );
              const questionsSnapshot = await getDocs(questionsRef);
              const questions = questionsSnapshot.docs.map((qDoc) => ({
                ...qDoc.data(),
              })) as Quiz["questions"];

              quizzesData.push({
                id: doc.id,
                title: quizData.title,
                description: quizData.description,
                difficulty: quizData.difficulty,
                category: quizData.category,
                questions,
              });
            }
          }

          onSuccess(quizzesData);
        } catch (err) {
          onError(
            err instanceof Error ? err.message : "Failed to load quizzes"
          );
        }
      },
      (err) => {
        onError(err.message);
      }
    );

    return unsubscribe;
  }

  async fetchQuizById(quizId: string): Promise<Quiz> {
    const quizRef = doc(db, "quizzes", quizId);
    const quizSnap = await getDoc(quizRef);

    if (!quizSnap.exists()) {
      throw new Error(`Quiz with id ${quizId} not found`);
    }

    const quizData = quizSnap.data();

    // Check if questions are in main document first
    if (quizData.questions && quizData.questions.length > 0) {
      return {
        id: quizSnap.id,
        title: quizData.title,
        description: quizData.description,
        difficulty: quizData.difficulty,
        category: quizData.category,
        questions: quizData.questions,
      };
    }

    // Fallback: try to fetch questions from subcollection
    const questionsRef = collection(db, "quizzes", quizId, "questions");
    const questionsSnapshot = await getDocs(questionsRef);
    const questions = questionsSnapshot.docs.map((qDoc) => ({
      ...qDoc.data(),
    })) as Quiz["questions"];

    return {
      id: quizSnap.id,
      title: quizData.title,
      description: quizData.description,
      difficulty: quizData.difficulty,
      category: quizData.category,
      questions,
    };
  }

  async updateQuizMetadata(
    quizId: string,
    updates: Partial<Quiz>
  ): Promise<void> {
    const quizRef = doc(db, "quizzes", quizId);
    await updateDoc(quizRef, {
      title: updates.title,
      description: updates.description,
      category: updates.category,
      difficulty: updates.difficulty,
      questions: updates.questions, // Include questions in metadata update
      updatedAt: new Date(),
    });
  }

  async saveQuestions(
    quizId: string,
    questions: Quiz["questions"]
  ): Promise<void> {
    // Update the questions directly in the main quiz document
    const quizRef = doc(db, "quizzes", quizId);
    await updateDoc(quizRef, {
      questions: questions,
      updatedAt: new Date(),
    });
  }

  async saveQuiz(quiz: Quiz): Promise<void> {
    // Update entire quiz document including questions
    const quizRef = doc(db, "quizzes", quiz.id);
    await updateDoc(quizRef, {
      title: quiz.title,
      description: quiz.description,
      category: quiz.category,
      difficulty: quiz.difficulty,
      questions: quiz.questions,
      updatedAt: new Date(),
    });
  }

  async createQuiz(quiz: Omit<Quiz, "id">): Promise<Quiz> {
    const docRef = await addDoc(collection(db, "quizzes"), {
      title: quiz.title,
      description: quiz.description || "",
      category: quiz.category || "",
      difficulty: quiz.difficulty || "medium",
      questions: quiz.questions || [],
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });

    return {
      ...quiz,
      id: docRef.id,
    };
  }

  async deleteQuiz(quizId: string): Promise<void> {
    const quizRef = doc(db, "quizzes", quizId);
    await deleteDoc(quizRef);
  }
}
