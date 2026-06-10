# SuperKahoot - AI Agent Instructions

A real-time multiplayer quiz application (Kahoot-like) built with React, TypeScript, and Firebase.

## 🚀 Quick Start

```bash
# Development
npm run dev                    # Start dev server on localhost:5173

# Build & Deploy
npm run build                  # Type-check (tsc -b) then build
npm run preview                # Preview production build
npm run lint                   # ESLint check

# Quiz Management
npm run upload:quizzes         # Upload quizzes from src/data/quizzes.json to Firestore
```

## 🏗️ Architecture

**This is NOT a typical React state management app.** Firebase Realtime Database IS the state engine.

### Dual-Mode Game Architecture
- **GameHost** (`src/games/GameHost.tsx`): Teacher/admin mode - creates games, broadcasts questions, controls flow
- **GameClient** (`src/games/GameClient.tsx`): Player mode - joins via PIN, answers questions in real-time
- **Firebase Realtime DB**: Single source of truth for live game state (low-latency)
- **Firestore**: Durable storage for quizzes, questions, and user metadata

### Key Patterns
1. **DAO Interfaces**: `QuizDAOI`, `IGameDAO` - decouples Firebase from components
2. **Custom Hooks for Firebase**: `useGameFirebase` (host), `useClientFirebase` (player), `useGameActions`
3. **Question Type Registry**: Extensible question system via `QuestionTypeRegistry.ts`
4. **Context-Based Auth**: `AuthContext` with Firestore role lookup (admin/teacher/student)

## 📂 File Organization

```
src/
├── games/                   # Game-specific logic (NOT general components)
│   ├── GameHost.tsx         # Host controller
│   ├── GameClient.tsx       # Player controller
│   ├── GameDAO.ts           # Game data access interface
│   ├── host/                # Host-only screens (ActiveQuestion, Leaderboard, etc.)
│   ├── client/              # Player-only screens (JoinGameForm, QuestionScreen, etc.)
│   └── hooks/               # Firebase integration hooks (NOT UI hooks)
├── components/              # Shared & admin UI components
│   ├── QuizList.tsx         # Admin quiz management
│   ├── ProtectedRoute.tsx   # Role-based route protection
│   └── ui/details/          # Reusable UI primitives (Button, etc.)
├── contexts/                # React contexts (AuthContext)
├── types/                   # TypeScript type definitions
│   ├── game.ts              # Game state types
│   ├── question.ts          # Question union types
│   ├── quiz.ts              # Quiz metadata types
│   └── QuestionTypeRegistry.ts  # Extensibility engine
└── utils/
    ├── firebase.ts          # Firebase config & initialization
    ├── gemini.ts            # Google Gemini AI integration
    ├── openai.ts            # OpenAI integration
    └── DAO/                 # Data access implementations
```

## 🎯 Type System & Question Types

**Question types are union types**, not polymorphic classes:

```typescript
type Question = TrueFalseQuestion | StandardQuestion;
```

### Adding a New Question Type
1. Define interface in `src/types/question.ts`
2. Add to `Question` union type
3. Create handler class implementing `IQuestionHandler` in `src/types/QuestionTypeRegistry.ts`
4. Register in `questionRegistry`

See [QUIZ_CREATION_GUIDE.md](QUIZ_CREATION_GUIDE.md) for complete type definitions.

## 🔥 Firebase Integration

### Realtime Database Structure
```
games/{gamePin}/
  ├── status: "waiting" | "active" | "finished"
  ├── currentQuestionIndex: number
  ├── participants: { [playerId]: { name, score, ... } }
  ├── answeredQuestions: [{ questionId, answers: [...] }]
  └── quizData: Quiz
```

### Firestore Collections
- `quizzes/{quizId}` - Quiz metadata
- `quizzes/{quizId}/questions/{questionId}` - Questions as subcollection
- `users/{uid}` - User roles and profiles

### Critical Firebase Patterns
- **Array-to-Object Conversion**: Firebase Realtime DB stores arrays as objects `{0: item, 1: item}` — always convert back to arrays
- **Race Condition Prevention**: Use `useRef` flags (e.g., `isSubmittingAnswer.current`) to prevent double submissions
- **Firestore Error Handling**: Code gracefully handles Firestore unavailability (role checking disabled)

See [FIREBASE_SETUP.md](FIREBASE_SETUP.md) for configuration details.

## 🔐 Authentication & Authorization

- **Firebase Auth**: Email/password authentication
- **Role Storage**: Firestore `users/{uid}/role` - values: `admin`, `teacher`, `student`
- **ProtectedRoute**: Use `adminOnly` or `teacherOrAdmin` props for route protection
- **Graceful Degradation**: If Firestore unavailable, all routes accessible (dev/testing)

## ⚙️ Configuration

### Environment Variables
```env
VITE_GEMINI_API_KEY=...       # Optional: AI quiz generation
VITE_OPENAI_API_KEY=...       # Optional: AI quiz generation
```

Firebase config is in `src/utils/firebase.ts` (committed).

### Build Configuration
- **TypeScript**: Strict mode, ES2022 target, unused variable checks enabled
- **Vite**: Tailwind CSS via `@tailwindcss/vite` plugin
- **Server**: `host: true` enables LAN access (for classroom testing on multiple devices)

## 🚨 Common Gotchas

1. **Firebase Arrays**: Always convert Realtime DB objects to arrays using `Object.values()` or similar
2. **Answer Submission**: Never submit answers without checking `isSubmittingAnswer.current` flag
3. **Question Indexing**: `currentQuestionIndex` is 0-based; be careful with display counts
4. **Player Reconnection**: Player info stored in localStorage - rejoining restores state
5. **Image Format**: Questions support base64 images or URLs in `image` field

## 📚 Documentation

- [README.md](README.md) - Project overview, features, installation
- [FIREBASE_SETUP.md](FIREBASE_SETUP.md) - Firebase configuration & quiz upload
- [QUIZ_CREATION_GUIDE.md](QUIZ_CREATION_GUIDE.md) - TypeScript interfaces for creating quizzes
- [REMOTE_ACCESS_FIX.md](REMOTE_ACCESS_FIX.md) - Troubleshooting remote device access

## 🎨 UI & Styling

- **Framework**: Tailwind CSS 4.1
- **Typography**: `@tailwindcss/typography` plugin for markdown rendering
- **Icons**: Custom SVG components in `src/components/ui/details/`
- **Fullscreen**: Custom fullscreen hook (`useFullscreen`) for game mode

## 🧪 Development Tips

- **Testing on devices**: Dev server runs with `host: true` - use your local IP to test on phones/tablets
- **Quiz data**: Sample quizzes in `src/data/*.json` - use as templates
- **AI Generation**: Set API keys in `.env` to enable AI quiz generation modal
- **Role testing**: Manually add `role: "admin"` to Firestore `users` collection for admin access
