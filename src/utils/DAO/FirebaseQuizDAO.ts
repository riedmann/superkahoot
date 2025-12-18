import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  getDoc,
  getDocs,
  onSnapshot,
  query,
  serverTimestamp,
  setDoc,
  updateDoc,
} from "firebase/firestore";
import type { Quiz } from "../../types/quiz";
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

            // Fetch questions subcollection
            const questionsRef = collection(db, "quizzes", doc.id, "questions");
            const questionsSnapshot = await getDocs(questionsRef);
            const questions = questionsSnapshot.docs.map((qDoc) => ({
              ...qDoc.data(),
            }));

            quizzesData.push({
              id: doc.id,
              title: quizData.title,
              description: quizData.description,
              difficulty: quizData.difficulty,
              category: quizData.category,
              questions: quizData.questions || questions,
            });
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

    // Fetch questions subcollection
    const questionsRef = collection(db, "quizzes", quizId, "questions");
    const questionsSnapshot = await getDocs(questionsRef);
    const questions = questionsSnapshot.docs.map((qDoc) => ({
      ...qDoc.data(),
    }));

    return {
      id: quizSnap.id,
      title: quizData.title,
      description: quizData.description,
      difficulty: quizData.difficulty,
      category: quizData.category,
      questions: quizData.questions || questions,
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
      updatedAt: new Date(),
    });
  }

  async saveQuestions(
    quizId: string,
    questions: Quiz["questions"]
  ): Promise<void> {
    // Get current questions from Firestore to find deleted ones
    const questionsRef = collection(db, "quizzes", quizId, "questions");
    const existingSnapshot = await getDocs(questionsRef);
    const existingQuestionIds = new Set(
      existingSnapshot.docs.map((doc) => doc.id)
    );

    // Get new question IDs
    const newQuestionIds = new Set(questions.map((q) => q.id));

    // Delete questions that are no longer in the new questions array
    for (const existingId of existingQuestionIds) {
      if (!newQuestionIds.has(existingId)) {
        const questionRef = doc(db, "quizzes", quizId, "questions", existingId);
        await deleteDoc(questionRef);
      }
    }

    // Add or update questions
    for (const question of questions) {
      const questionRef = doc(db, "quizzes", quizId, "questions", question.id);
      await setDoc(questionRef, question, { merge: true });
    }
  }

  async saveQuiz(quiz: Quiz): Promise<void> {
    // Update quiz metadata
    await this.updateQuizMetadata(quiz.id, quiz);
    // Save/update questions
    await this.saveQuestions(quiz.id, quiz.questions);
  }

  async createQuiz(quiz: Omit<Quiz, "id">): Promise<Quiz> {
    const docRef = await addDoc(collection(db, "quizzes"), {
      ...quiz,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });

    return {
      ...quiz,
      id: docRef.id,
    };
  }
}
