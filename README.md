# 🎮 SuperKahoot

A real-time multiplayer quiz application inspired by Kahoot, built with React, TypeScript, and Firebase Realtime Database for live game interactions. Create, host, and play interactive quizzes with AI-powered question generation.

![React](https://img.shields.io/badge/React-19.2-blue) 
![TypeScript](https://img.shields.io/badge/TypeScript-5.9-blue)
![Vite](https://img.shields.io/badge/Vite-7.2-purple)
![TailwindCSS](https://img.shields.io/badge/TailwindCSS-4.1-teal)
![Firebase](https://img.shields.io/badge/Firebase-12.6-orange)

## ✨ Features

### 🎯 Core Features
- **Real-time Multiplayer** - Live quiz sessions with Firebase Realtime Database
- **Host & Client Modes** - Separate interfaces for quiz hosts and participants
- **Multiple Question Types** - True/False and Multiple Choice questions
- **Image Support** - Add images to questions for visual learning
- **Live Leaderboard** - Real-time scoring and rankings
- **Countdown Timers** - Timed questions for competitive gameplay
- **Serverless Architecture** - No backend server required!

### 🤖 AI-Powered Quiz Generation
- **OpenAI Integration** - Generate quizzes using GPT models
- **Google Gemini Integration** - Alternative AI quiz generation
- **Intelligent Question Creation** - AI-generated questions with multiple difficulty levels

### 🔐 Authentication & Authorization
- **Firebase Authentication** - Secure user login
- **Role-Based Access Control** - Admin, Teacher, and Student roles
- **Protected Routes** - Secure admin and teacher-only sections

### 📊 Quiz Management
- **Quiz CRUD Operations** - Create, read, update, and delete quizzes
- **Firebase Firestore Backend** - Cloud-based quiz storage
- **Quiz Categories & Difficulty** - Organize quizzes by topic and difficulty
- **Bulk Upload** - Import quizzes from JSON files

## 🚀 Getting Started

### Prerequisites

- **Node.js** (v18 or higher)
- **npm** or **yarn**
- **Firebase Project** (for authentication and Realtime Database)

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd superkahoot/Frontend
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Configure Environment Variables**
   
   Create a `.env` file in the project root:
   ```env
   # AI API Keys (optional, for quiz generation)
   VITE_GEMINI_API_KEY=your_gemini_api_key_here
   VITE_OPENAI_API_KEY=your_openai_api_key_here
   ```

4. **Set up Firebase**
   
   Follow the detailed guide in [FIREBASE_SETUP.md](FIREBASE_SETUP.md)

5. **Start the development server**
   ```bash
   npm run dev
   ```

   The app will be available at `http://localhost:5173`

## 🎮 How to Play

### For Participants

1. Navigate to the home page
2. Enter the **Game PIN** provided by the host
3. Enter your name
4. Wait for the host to start the game
5. Answer questions as they appear
6. See your score on the leaderboard after each question

### For Hosts (Teachers/Admins)

1. Log in to the admin panel at `/admin`
2. Select a quiz from your library
3. Click "Host Quiz" to generate a Game PIN
4. Share the PIN with participants
5. Start the quiz when everyone has joined
6. Control the flow of questions
7. View results and leaderboard

## 📁 Project Structure

```
Frontend/
├── src/
│   ├── components/          # Reusable React components
│   │   ├── QuizList.tsx    # Quiz management interface
│   │   ├── QuizEdit.tsx    # Quiz editor
│   │   ├── Login.tsx       # Authentication
│   │   └── ui/             # UI components
│   ├── games/              # Game logic
│   │   ├── GameHost.tsx    # Host game interface
│   │   ├── GameClient.tsx  # Player game interface
│   │   ├── client/         # Client-side screens
│   │   ├── host/           # Host-side screens
│   │   └── hooks/          # Game-related hooks
│   │       ├── useGameWebSocket.ts    # Host WebSocket
│   │       └── useClientWebSocket.ts  # Client WebSocket
│   ├── contexts/           # React contexts
│   │   └── AuthContext.tsx # Authentication context
│   ├── types/              # TypeScript type definitions
│   │   ├── quiz.ts        # Quiz types
│   │   ├── question.ts    # Question types
│   │   └── game.ts        # Game state types
│   ├── utils/              # Utility functions
│   │   ├── firebase.ts    # Firebase configuration
│   │   ├── gemini.ts      # Google Gemini AI
│   │   └── openai.ts      # OpenAI integration
│   ├── data/               # Sample quiz data
│   └── App.tsx             # Main app component
├── scripts/
│   └── uploadQuizzes.ts   # Quiz upload script
├── public/                # Static assets
└── README.md              # This file
```

## 🔧 Available Scripts

```bash
# Development
npm run dev              # Start development server with hot reload

# Build
npm run build            # Build for production

# Linting
npm run lint             # Run ESLint

# Preview
npm run preview          # Preview production build locally

# Quiz Management
npm run upload:quizzes   # Upload quizzes from JSON to Firebase
```

## 🎨 Tech Stack

### Frontend Framework
- **React 19.2** - UI framework
- **TypeScript 5.9** - Type safety
- **Vite 7.2** - Build tool and dev server
- **React Router 7.10** - Client-side routing

### Styling
- **TailwindCSS 4.1** - Utility-first CSS framework
- **@tailwindcss/vite** - Vite integration

### Backend Services
- **Firebase 12.6**
  - Authentication - User management
  - Firestore - Quiz database
  - Hosting - Production deployment

### Real-time Communication
- **WebSocket** - Live game state synchronization

### AI Integration
- **Google Generative AI (@google/genai)** - Gemini API
- **OpenAI API** - GPT models (configured, not in dependencies)

### Development Tools
- **ESLint** - Code linting
- **TypeScript ESLint** - TypeScript-specific linting
- **tsx** - TypeScript execution for scripts

## 🎓 Creating Quizzes

See [QUIZ_CREATION_GUIDE.md](QUIZ_CREATION_GUIDE.md) for detailed documentation on:
- Quiz structure and TypeScript interfaces
- Question types (True/False, Multiple Choice)
- Adding images to questions
- Quiz metadata and organization
- JSON format examples

## 🔐 Authentication & Roles

The application supports three user roles:

- **Admin** - Full access to all features, user management
- **Teacher** - Can create, edit, and host quizzes
- **Student** - Can participate in quizzes

## 📝 Firebase Setup

For detailed Firebase configuration instructions, see [FIREBASE_SETUP.md](FIREBASE_SETUP.md):
- Creating a Firebase project
- Setting up Firestore
- Configuring authentication
- Uploading quizzes to the database

## 🌐 Remote Access

For instructions on accessing the app from other devices on your network, see [REMOTE_ACCESS_FIX.md](REMOTE_ACCESS_FIX.md).

## 🤝 Contributing

Contributions are welcome! Please follow these steps:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is private and not currently licensed for public use.

## 🐛 Troubleshooting

### WebSocket Connection Issues
- Ensure the backend WebSocket server is running
- Check that `VITE_WS_URL` in `.env` points to the correct server
- Verify firewall settings allow WebSocket connections

### Firebase Authentication Errors
- Confirm Firebase configuration in `src/utils/firebase.ts`
- Check that Firebase Authentication is enabled in Firebase Console
- Verify your Firebase project credentials

### AI Quiz Generation Not Working
- Ensure API keys are correctly set in `.env` file
- Verify API keys are valid and have proper permissions
- Check API usage limits and quotas

### Build Errors
- Clear node_modules and reinstall: `rm -rf node_modules && npm install`
- Clear Vite cache: `rm -rf node_modules/.vite`
- Ensure TypeScript version matches project requirements

## 📞 Support

For issues, questions, or feature requests, please open an issue in the repository.

---

Built with ❤️ using React, TypeScript, and modern web technologies
