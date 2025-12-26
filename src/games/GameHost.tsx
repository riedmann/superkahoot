import React, { useEffect, useRef, useState } from "react";
import { type Game, type GameStatus, type Participant } from "../types/game";
import type { Quiz } from "../types/quiz";
import { QuestionFooter } from "./host/QuestionFooter";
import { QuestionWithoutImage } from "./host/QuestionWithoutImage";

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

  // Countdown effect
  useEffect(() => {
    if (state !== "countdown") return;
    if (countdown === 0) return;
    const timer = setTimeout(() => {
      setCountdown((c) => (c > 0 ? c - 1 : 0));
    }, 1000);
    return () => clearTimeout(timer);
  }, [state, countdown]);

  // 30-second question countdown effect
  useEffect(() => {
    if (state !== "question") return;
    if (questionCountdown === 0) return;
    const timer = setTimeout(() => {
      setQuestionCountdown((c) => (c > 0 ? c - 1 : 0));
    }, 1000);
    return () => clearTimeout(timer);
  }, [state, questionCountdown]);

  // 30-second question timer effect
  useEffect(() => {
    if (state !== "question") return;
    let timer = setTimeout(() => {
      setState("results");
    }, 30000);
    return () => clearTimeout(timer);
  }, [state, questionIndex]);

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
          type: "nextQuestion",
          gameId: game.gamePin,
        })
      );
    }
  };

  const handleEndQuestion = () => {
    console.log("send queseion timeout");

    if (game?.gamePin && ws.current) {
      ws.current.send(
        JSON.stringify({
          type: "question_timeout",
          gameId: game.gamePin,
        })
      );
    }
  };

  return (
    <div>
      <h2>Game Host</h2>
      <p>Quiz: {quiz.title}</p>
      {game?.id ? (
        <div>
          <p>
            Game PIN: <strong>{game.gamePin}</strong>
          </p>

          <h3>Participants:</h3>
          <ul>
            {participants.map((p) => (
              <li key={p.id}>{p.name}</li>
            ))}
          </ul>
          {state == "countdown" && (
            <div>
              <h2>Game starts in: {countdown}</h2>
            </div>
          )}
          {state === "results" && (
            <div>
              results
              <button onClick={handleNextQuestion}>Next Question</button>
            </div>
          )}
          {state == "question" && (
            <div>
              <div>
                <strong>Time left: {questionCountdown}s</strong>
              </div>
              <QuestionWithoutImage
                currentQuestion={quiz.questions[questionIndex ?? 0]}
              />
              <QuestionFooter
                game={game}
                onEndQuestion={handleEndQuestion}
                onExit={function (): void {
                  throw new Error("Function not implemented.");
                }}
              />
            </div>
          )}
          {state != "question" &&
            state != "countdown" &&
            state != "results" && (
              <button
                onClick={handleStartGame}
                className="border hover:cursor-pointer"
              >
                Start Game
              </button>
            )}
        </div>
      ) : (
        <p>Creating game...</p>
      )}
    </div>
  );
};

export default GameHost;
