import { GoogleGenAI } from "@google/genai";
import type { Quiz } from "../types";

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
  const prompt = `Create a ${difficulty} difficulty multiple choice quiz about ${topic}.\nReturn a JSON object with the following structure:\n{\n  \"title\": \"Quiz title\",\n  \"description\": \"Brief description\",\n  \"difficulty\": \"${difficulty}\",\n  \"category\": \"Category name\",\n  \"questions\": [\n    {\n      \"id\": \"unique_id\",\n      \"type\": \"standard\",\n      \"question\": \"Question text\",\n      \"options\": [\n        {\"id\": \"a\", \"text\": \"Option A\", \"isCorrect\": false},\n        {\"id\": \"b\", \"text\": \"Option B\", \"isCorrect\": true},\n        {\"id\": \"c\", \"text\": \"Option C\", \"isCorrect\": false},\n        {\"id\": \"d\", \"text\": \"Option D\", \"isCorrect\": false}\n      ],\n      \"explanation\": \"Explanation of the correct answer\",\n      \"timeLimit\": 30\n    }\n  ]\n}\n\nGenerate exactly ${questionCount} questions. Make sure exactly one option per question is marked as correct. Only respond with valid JSON, no additional text.`;

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
        parsedQuiz.questions?.map((q: any, index: number) => ({
          id: q.id || `q${index + 1}`,
          type: "standard" as const,
          question: q.question,
          options: q.options || [],
          explanation: q.explanation,
          timeLimit: q.timeLimit || 30,
        })) || [],
    };
    return quiz as Quiz;
  } catch (error) {
    console.error("Error generating quiz with Gemini:", error);
    throw error;
  }
}
