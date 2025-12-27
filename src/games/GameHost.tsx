import React, { useEffect, useRef, useState } from "react";
import type { Game, GameStatus, Participant } from "../types/game";
import type { Quiz } from "../types/quiz";
import { Countdown } from "./host/Countdown";
import { QuestionFooter } from "./host/QuestionFooter";
import { QuestionResult } from "./host/QuestionResult";
import { QuestionWithoutImage } from "./host/QuestionWithoutImage";

interface GameHostProps {
  quiz: Quiz;
}

export const GameHost: React.FC<GameHostProps> = ({ quiz }) => {
  const [game, setGame] = useState<Game>();

  const [state, setState] = useState<GameStatus>("waiting");
  // const [countdown, setCountdown] = useState<number>(3);

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
        setGame((prev) =>
          prev
            ? {
                ...prev,
                participants: [...prev.participants, msg.player],
              }
            : prev
        );
      }
      if (msg.type === "countdown") {
        setState("countdown");
      }
      if (msg.type === "results") {
        setState("results");
      }
      if (msg.type === "answer_update") {
        // Update the game state with the new answeredQuestions from the server
        setGame((prev) =>
          prev
            ? {
                ...prev,
                answeredQuestions: msg.answeredQuestions,
              }
            : prev
        );
        console.log("updated game with new answers", msg.answeredQuestions);
      }
      if (msg.type === "question") {
        setState("question");

        setQuestionCountdown(30); // reset question countdown
        setGame((prev) =>
          prev
            ? {
                ...prev,
                currentQuestionIndex: msg.index,
              }
            : prev
        );
      }
    };

    return () => {
      ws.current?.close();
    };
  }, [quiz]);

  useEffect(() => {
    console.log("game answered", game?.answeredQuestions);
  }, [game]);

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
            {game.participants.length === 0 && (
              <li className="italic text-gray-200">Waiting for players...</li>
            )}
            {game.participants.map((p) => (
              <li key={p.id} className="text-lg font-semibold">
                {p.name}
              </li>
            ))}
          </ul>
          <button
            onClick={handleStartGame}
            className="bg-green-500 hover:bg-green-600 text-white font-bold py-2 px-6 rounded-lg shadow transition"
            disabled={game.participants.length === 0}
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
        questionNumber={game.currentQuestionIndex + 1}
        totalQuestions={quiz.questions.length}
      />
    );
  }

  if (state === "question") {
    if (!game) return <div>error no game</div>;
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-blue-600 to-purple-700">
        <div className="w-full text-white">
          <QuestionWithoutImage
            currentQuestion={quiz.questions[game.currentQuestionIndex]}
          />
          <QuestionFooter
            game={game}
            onEndQuestion={hanldeEndQuestion}
            onExit={function (): void {
              throw new Error("Function not implemented.");
            }}
          />
        </div>
      </div>
    );
  }

  if (state === "results") {
    if (!game) return <div>error no game</div>;
    if (!game.quizData) return <div>error no quiz data</div>;
    const currentQuestion = game.quizData.questions[game.currentQuestionIndex];
    if (!currentQuestion) return <div>error no question</div>;
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-blue-600 to-purple-700">
        <div className="w-full text-white">
          <QuestionResult
            game={game}
            currentQuestion={currentQuestion}
            quiz={game.quizData}
            onShowNextQuestion={handleNextQuestion}
          />
        </div>
      </div>
    );
  }
  return <div />; // Placeholder for other states
};

export default GameHost;
