import { GoogleGenAI } from "@google/genai";
import type { Quiz } from "../types";
import type {
  Question,
  StandardQuestion,
  TrueFalseQuestion,
} from "../types/question";

const GEMINI_API_KEY = import.meta.env.VITE_GEMINI_API_KEY;
const GEMINI_API_KEY_STRING = GEMINI_API_KEY as string;

export async function generateQuizWithGemini(
  topic: string,
  difficulty: string = "medium",
  questionCount: number = 5
): Promise<Quiz> {
  if (
    !GEMINI_API_KEY_STRING ||
    typeof GEMINI_API_KEY_STRING !== "string" ||
    GEMINI_API_KEY_STRING.startsWith("undefined")
  ) {
    throw new Error(
      "Gemini API key not found or not set correctly. Please set VITE_GEMINI_API_KEY in your .env.local file and restart the dev server."
    );
  }

  const ai = new GoogleGenAI({ apiKey: GEMINI_API_KEY_STRING });
  const prompt = `
    Create a ${difficulty} difficulty multiple-choice quiz about "${topic}".

    Return ONLY valid JSON (no explanations, no markdown).

    The JSON must conform exactly to the following TypeScript structure:

    Quiz {
      id: string;
      title: string;
      description?: string;
      difficulty: "${difficulty}";
      questions: Question[];
    }

    Question is one of:

    1) StandardQuestion {
      id: string;
      type: "standard";
      question: string;
      options: {
        text: string;
        image?: string;
      }[];
      correctAnswers: number[]; // MUST contain exactly ONE index
    }

    2) TrueFalseQuestion {
      id: string;
      type: "true-false";
      question: string;
      correctAnswer: boolean;
    }

    Rules:
    - Generate EXACTLY ${questionCount} questions.
    - Each question must have a unique id.
    - For StandardQuestion:
      - Provide at least 3 options.
      - correctAnswers MUST contain exactly one valid option index.
    - Do NOT include any text outside the JSON.
    - Ensure the JSON is valid and parseable.

    Return only the JSON object.
`;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
    });
    const content = response.text;
    if (!content) {
      throw new Error("No content received from Gemini API");
    }
    // Parse the JSON response
    let parsedQuiz;
    try {
      // Clean the response in case Gemini adds markdown formatting
      const cleanedContent = content.replace(/```json\n?|\n?```/g, "").trim();
      parsedQuiz = JSON.parse(cleanedContent);
    } catch (parseError) {
      console.error("Failed to parse Gemini response:", content);
      throw new Error("Invalid JSON response from Gemini API");
    }
    // Validate and transform the response to match our Quiz type
    const quiz: Omit<
      Quiz,
      | "id"
      | "createdAt"
      | "updatedAt"
      | "creatorId"
      | "creatorEmail"
      | "creatorDisplayName"
    > = {
      title: parsedQuiz.title || `${topic} Quiz`,
      description: parsedQuiz.description || `AI-generated quiz about ${topic}`,
      difficulty: difficulty as any,
      category: parsedQuiz.category || "AI Generated",
      questions:
        parsedQuiz.questions?.map((q: any, index: number): Question => {
          const baseId = q.id || `q${index + 1}`;

          // Handle true-false questions
          if (q.type === "true-false") {
            const tfQuestion: TrueFalseQuestion = {
              id: baseId,
              type: "true-false",
              question: q.question,
              correctAnswer: q.correctAnswer,
            };
            // Only add image if it exists
            if (q.image) {
              tfQuestion.image = q.image;
            }
            return tfQuestion;
          }

          // Handle standard (multiple choice) questions
          const standardQuestion: StandardQuestion = {
            id: baseId,
            type: "standard",
            question: q.question,
            options: q.options || [],
            correctAnswers: Array.isArray(q.correctAnswers)
              ? q.correctAnswers
              : [],
          };
          // Only add image if it exists
          if (q.image) {
            standardQuestion.image = q.image;
          }
          return standardQuestion;
        }) || [],
    };
    console.log("Quiz", quiz);
    return quiz as Quiz;
  } catch (error) {
    console.error("Error generating quiz with Gemini:", error);
    throw error;
  }
}
