import type { Quiz } from "../types";

interface OpenAIResponse {
  choices: Array<{
    message: {
      content: string;
    };
  }>;
}

const OPENAI_API_KEY = import.meta.env.VITE_OPENAI_API_KEY;

export async function generateQuizWithOpenAI(
  topic: string,
  difficulty: string = "medium",
  questionCount: number = 5
): Promise<Quiz> {
  // Debug logging
  console.log("Environment check:", {
    hasKey: !!OPENAI_API_KEY,
    keyLength: OPENAI_API_KEY ? OPENAI_API_KEY.length : 0,
    allEnvVars: Object.keys(import.meta.env).filter((key) =>
      key.includes("OPENAI")
    ),
  });

  if (!OPENAI_API_KEY) {
    throw new Error(`OpenAI API key not found. 

Please follow these steps:
1. Create a .env.local file in your project root
2. Add this line: VITE_OPENAI_API_KEY=your_actual_api_key_here
3. Get your API key from: https://platform.openai.com/api-keys
4. Restart your dev server (npm run dev)

Current environment variables starting with VITE_: ${Object.keys(
      import.meta.env
    )
      .filter((key) => key.startsWith("VITE_"))
      .join(", ")}`);
  }

  const prompt = `Create a ${difficulty} difficulty multiple choice quiz about ${topic}. 
Return a JSON object with the following structure:
{
  "title": "Quiz title",
  "description": "Brief description",
  "difficulty": "${difficulty}",
  "category": "Category name",
  "questions": [
    {
      "id": "unique_id",
      "type": "standard",
      "question": "Question text",
      "options": [
        {"id": "a", "text": "Option A", "isCorrect": false},
        {"id": "b", "text": "Option B", "isCorrect": true},
        {"id": "c", "text": "Option C", "isCorrect": false},
        {"id": "d", "text": "Option D", "isCorrect": false}
      ],
      "explanation": "Explanation of the correct answer",
      "timeLimit": 30
    }
  ]
}

Generate exactly ${questionCount} questions. Make sure exactly one option per question is marked as correct. 
Only respond with valid JSON, no additional text.`;

  try {
    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${OPENAI_API_KEY}`,
      },
      body: JSON.stringify({
        model: "gpt-3.5-turbo",
        messages: [
          {
            role: "system",
            content:
              "You are a helpful assistant that creates educational quizzes. Always respond with valid JSON only.",
          },
          {
            role: "user",
            content: prompt,
          },
        ],
        temperature: 0.7,
        max_tokens: 2000,
      }),
    });

    if (!response.ok) {
      let errorMessage = `OpenAI API error: ${response.status} ${response.statusText}`;

      // Handle specific error codes with helpful messages
      switch (response.status) {
        case 429:
          errorMessage = `Rate limit exceeded. This can happen if:

• You've made too many requests too quickly
• Your OpenAI account has insufficient credits
• You're on the free tier with limited requests

Solutions:
1. Wait a few minutes and try again
2. Check your OpenAI account usage at https://platform.openai.com/usage
3. Consider upgrading your OpenAI plan if needed
4. Try generating fewer questions at once`;
          break;
        case 401:
          errorMessage = `Authentication failed. Please check your OpenAI API key:

• Make sure your API key is correct in .env.local
• Verify your API key is active at https://platform.openai.com/api-keys
• Check if your key has the necessary permissions`;
          break;
        case 402:
          errorMessage = `Payment required. Your OpenAI account may need credits:

• Check your billing at https://platform.openai.com/account/billing
• Add payment method or credits to your account`;
          break;
        case 500:
          errorMessage = `OpenAI server error. This is temporary - please try again in a moment.`;
          break;
      }

      throw new Error(errorMessage);
    }

    const data: OpenAIResponse = await response.json();
    const content = data.choices[0]?.message?.content;

    if (!content) {
      throw new Error("No content received from OpenAI API");
    }

    // Parse the JSON response
    let parsedQuiz;
    try {
      parsedQuiz = JSON.parse(content);
    } catch (parseError) {
      throw new Error("Invalid JSON response from OpenAI API");
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
    console.error("Error generating quiz with OpenAI:", error);
    throw error;
  }
}
