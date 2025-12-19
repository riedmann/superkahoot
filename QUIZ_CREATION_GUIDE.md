# Quiz Creation Guide

This document contains all the TypeScript interfaces and types needed to create quizzes for the SuperKahoot application.

## 📝 Quiz Structure

### Main Quiz Interface

```typescript
interface Quiz {
  id: string;
  title: string;
  description?: string;
  questions: Question[];
  difficulty?: DifficultyLevel;
  category?: string;
  createdAt?: Date;
  updatedAt?: Date;
}
```

### Difficulty Levels

```typescript
type DifficultyLevel = "easy" | "medium" | "hard";
```

## ❓ Question Types

### Question Union Type

```typescript
type Question = TrueFalseQuestion | StandardQuestion;
```

### True/False Questions

```typescript
interface TrueFalseQuestion {
  id: string;
  type: "true-false";
  question: string;
  correctAnswer: boolean;
  image?: string; // Base64 encoded image or URL
}
```

**Example:**
```json
{
  "id": "q1",
  "type": "true-false",
  "question": "The Earth is flat.",
  "correctAnswer": false,
  "image": "data:image/jpeg;base64,..." // optional
}
```

### Multiple Choice Questions

```typescript
interface StandardQuestion {
  id: string;
  type: "standard";
  question: string;
  options: QuestionOption[];
  correctAnswers: number[]; // Array of correct option indices
  image?: string; // Base64 encoded image or URL
}

interface QuestionOption {
  text: string;
  image?: string; // Base64 encoded image or URL
}
```

**Example:**
```json
{
  "id": "q2",
  "type": "standard",
  "question": "Which of the following are programming languages?",
  "options": [
    {
      "text": "JavaScript",
      "image": "optional-image-url"
    },
    {
      "text": "HTML"
    },
    {
      "text": "Python"
    },
    {
      "text": "CSS"
    }
  ],
  "correctAnswers": [0, 2], // JavaScript and Python
  "image": "optional-question-image"
}
```

## 🎯 Complete Quiz Example

```json
{
  "id": "quiz-123",
  "title": "Web Development Basics",
  "description": "Test your knowledge of fundamental web development concepts",
  "difficulty": "medium",
  "category": "Technology",
  "questions": [
    {
      "id": "q1",
      "type": "true-false",
      "question": "HTML stands for HyperText Markup Language.",
      "correctAnswer": true
    },
    {
      "id": "q2",
      "type": "standard",
      "question": "Which of these are CSS properties?",
      "options": [
        { "text": "color" },
        { "text": "font-size" },
        { "text": "margin" },
        { "text": "innerHTML" }
      ],
      "correctAnswers": [0, 1, 2]
    },
    {
      "id": "q3",
      "type": "standard",
      "question": "What does CSS stand for?",
      "options": [
        { "text": "Cascading Style Sheets" },
        { "text": "Computer Style Sheets" },
        { "text": "Creative Style Sheets" },
        { "text": "Colorful Style Sheets" }
      ],
      "correctAnswers": [0]
    }
  ]
}
```

## 🛠️ Creating Quizzes with AI

When asking AI to create quizzes, provide this structure and specify:

### Required Information:
- **Title**: Clear, descriptive quiz title
- **Description**: Brief explanation of the quiz content
- **Difficulty**: `"easy"`, `"medium"`, or `"hard"`
- **Category**: Topic area (e.g., "Science", "History", "Technology")
- **Number of questions**: How many questions you want

### Question Guidelines:
- **Question IDs**: Use unique identifiers (e.g., "q1", "q2", "q3")
- **Question Text**: Clear, unambiguous questions
- **Images**: Optional, can be Base64 encoded strings or URLs
- **True/False**: Simple boolean questions
- **Multiple Choice**: 
  - Provide 2-6 options per question
  - Use `correctAnswers` array with indices (0-based)
  - Can have multiple correct answers

### Example AI Prompt:
```
Create a quiz with the following structure using the provided TypeScript interfaces:

Title: "Space Exploration"
Description: "Test your knowledge about space missions and astronomy"
Difficulty: "medium"
Category: "Science"
Questions: 5 questions (mix of true/false and multiple choice)

Include questions about:
- Historical space missions
- Planets in our solar system
- Famous astronauts
- Space technology

Format the response as a valid JSON object matching the Quiz interface.
```

## 📋 Validation Rules

### Quiz Level:
- `id`: Must be unique string
- `title`: Required, non-empty string
- `questions`: Must contain at least 1 question
- `difficulty`: Must be "easy", "medium", or "hard" if provided

### Question Level:
- `id`: Must be unique within the quiz
- `type`: Must be "true-false" or "standard"
- `question`: Required, non-empty string
- `correctAnswers`: For standard questions, indices must be valid (within options array bounds)
- `options`: For standard questions, must have at least 2 options

### Best Practices:
- Keep question text concise but clear
- Ensure correct answers are actually correct
- For multiple choice, avoid obviously wrong "joke" answers
- Use consistent difficulty throughout the quiz
- Include variety in question types
- Test questions for clarity and accuracy