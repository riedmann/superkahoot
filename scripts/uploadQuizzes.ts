import * as fs from "fs";
import * as path from "path";
import { fileURLToPath } from "url";
import { initializeApp } from "firebase/app";
import {
  getFirestore,
  collection,
  doc,
  setDoc,
  serverTimestamp,
} from "firebase/firestore";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Firebase config
const firebaseConfig = {
  apiKey: "AIzaSyBzsTw14bIm0rhQ4sMMKnn2Cki970q-AWM",
  authDomain: "demoteachers.firebaseapp.com",
  projectId: "demoteachers",
  storageBucket: "demoteachers.firebasestorage.app",
  messagingSenderId: "900017013166",
  appId: "1:900017013166:web:5a5836b8f85e79c6c3483f",
  measurementId: "G-BHWC9QZ4L6",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

async function uploadQuizzes() {
  try {
    // Read the quizzes.json file
    const quizzesPath = path.join(__dirname, "../src/data/quizzes.json");
    const quizzesData = JSON.parse(fs.readFileSync(quizzesPath, "utf-8"));

    console.log(
      `📚 Starting upload of ${quizzesData.quizzes.length} quizzes...`
    );

    // Upload each quiz to Firestore
    for (const quiz of quizzesData.quizzes) {
      const quizRef = doc(db, "quizzes", quiz.id);

      await setDoc(quizRef, {
        title: quiz.title,
        description: quiz.description || "",
        difficulty: quiz.difficulty || "medium",
        category: quiz.category || "General",
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });

      console.log(`✅ Uploaded quiz: ${quiz.title}`);

      // Upload questions as subcollection
      for (const question of quiz.questions) {
        const questionRef = doc(
          db,
          "quizzes",
          quiz.id,
          "questions",
          question.id
        );
        await setDoc(questionRef, question);
      }

      console.log(`   └─ Added ${quiz.questions.length} questions`);
    }

    console.log("✨ All quizzes uploaded successfully!");
    process.exit(0);
  } catch (error) {
    console.error("❌ Error uploading quizzes:", error);
    process.exit(1);
  }
}

uploadQuizzes();
