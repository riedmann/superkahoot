import React, { useEffect, useRef, useState } from "react";
import type { Game, GameStatus, Participant } from "../types/game";
import type { Quiz } from "../types/quiz";
import { Countdown } from "./host/Countdown";
import { QuestionWithImage } from "./host/QuestionWithImage";
import { QuestionWithoutImage } from "./host/QuestionWithoutImage";
import { QuestionFooter } from "./host/QuestionFooter";
import { Leaderboard } from "./host/Leaderboard";
import { QuestionResult } from "./host/QuestionResult";

interface GameHostProps {
  quiz: Quiz;
}

export const GameHost: React.FC<GameHostProps> = ({ quiz }) => {
  const [game, setGame] = useState<Game>();
  const [participants, setParticipants] = useState<Participant[]>([]);
  const [state, setState] = useState<GameStatus>("waiting");
  const [countdown, setCountdown] = useState<number>(3);
  const [questionIndex, setQuestionIndex] = useState<number>(0);
  const [questionCountdown, setQuestionCountdown] = useState<number>(30);
  const ws = useRef<WebSocket | null>(null);

  // Create game on mount
  useEffect(() => {
    ws.current = new WebSocket("ws://localhost:8080");
    ws.current.onopen = () => {
      ws.current?.send(
        JSON.stringify({
          type: "create_game",
          data: {
            quizData: quiz,
            settings: {
              questionTimeLimit: 30,
              showCorrectAnswers: true,
              allowLateJoins: true,
            },
          },
        })
      );
    };

    ws.current.onmessage = (event) => {
      const msg = JSON.parse(event.data);
      console.log("incomming message", msg);

      if (msg.type === "game_created") {
        setGame(msg.game);
      }
      if (msg.type === "joined") {
        setParticipants((prev) => [...prev, msg.player]);
      }
      if (msg.type === "countdown") {
        setCountdown(msg.seconds);
        setState("countdown");
      }
      if (msg.type === "results") {
        setState("results");
      }
      if (msg.type === "question") {
        console.log("question", msg);

        setState("question");
        setQuestionIndex(msg.index);
        setCountdown(3);
        setQuestionCountdown(30); // reset question countdown
      }
    };

    return () => {
      ws.current?.close();
    };
  }, [quiz]);

  // Countdown effect for question
  useEffect(() => {
    if (state !== "question") return;
    if (questionCountdown === 0) return;
    const timer = setTimeout(() => {
      setQuestionCountdown((c) => (c > 0 ? c - 1 : 0));
    }, 1000);
    return () => clearTimeout(timer);
  }, [state, questionCountdown]);

  const handleStartGame = () => {
    if (game?.gamePin && ws.current) {
      ws.current.send(
        JSON.stringify({
          type: "start_game",
          gameId: game.gamePin,
        })
      );
    }
  };

  const handleNextQuestion = () => {
    if (game?.gamePin && ws.current) {
      ws.current.send(
        JSON.stringify({
          type: "next_question",
          gameId: game.gamePin,
        })
      );
    }
  };

  const hanldeEndQuestion = () => {
    if (game?.gamePin && ws.current) {
      ws.current.send(
        JSON.stringify({
          type: "question_timeout",
          gameId: game.gamePin,
        })
      );
    }
  };

  // Styled waiting room screen
  if (state === "waiting" && game?.gamePin) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-blue-600 to-purple-700 text-black">
        <div className="bg-white bg-opacity-10 rounded-xl p-8 shadow-lg flex flex-col items-center">
          <h1 className="text-3xl font-bold mb-4">Game PIN</h1>
          <div className="text-5xl font-mono font-extrabold tracking-widest bg-white bg-opacity-20 px-8 py-4 rounded-lg mb-6">
            {game.gamePin}
          </div>
          <h2 className="text-xl mb-2">Participants</h2>
          <ul className="mb-6">
            {participants.length === 0 && (
              <li className="italic text-gray-200">Waiting for players...</li>
            )}
            {participants.map((p) => (
              <li key={p.id} className="text-lg font-semibold">
                {p.name}
              </li>
            ))}
          </ul>
          <button
            onClick={handleStartGame}
            className="bg-green-500 hover:bg-green-600 text-white font-bold py-2 px-6 rounded-lg shadow transition"
            disabled={participants.length === 0}
          >
            Start Game
          </button>
        </div>
      </div>
    );
  }

  // Show countdown overlay
  if (state === "countdown" && game) {
    return (
      <Countdown
        game={game}
        onCountdownComplete={() => setState("question")}
        questionNumber={questionIndex + 1}
        totalQuestions={quiz.questions.length}
      />
    );
  }

  if (state === "question") {
    if (!game) return <div>error no game</div>;
    return (
      <div>
        <QuestionWithoutImage currentQuestion={quiz.questions[questionIndex]} />
        <QuestionFooter
          game={game}
          onEndQuestion={hanldeEndQuestion}
          onExit={function (): void {
            throw new Error("Function not implemented.");
          }}
        />
      </div>
    );
  }

  if (state === "results") {
    if (!game) return <div>error no game</div>;
    if (!game.quizData) return <div>error no quiz data</div>;
    const currentQuestion = game.quizData.questions[questionIndex];
    if (!currentQuestion) return <div>error no question</div>;
    return (
      <QuestionResult
        game={game}
        currentQuestion={currentQuestion}
        quiz={game.quizData}
        onShowNextQuestion={handleNextQuestion}
      />
    );
  }
  return <div />; // Placeholder for other states
};

export default GameHost;
