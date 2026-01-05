import { useCallback } from "react";
import type { Game } from "../../types/game";

export function useGameActions(
  game: Game | undefined,
  sendMessage: (message: any) => boolean,
  questionsLength: number
) {
  const handleStartGame = useCallback(() => {
    if (game?.gamePin) {
      sendMessage({
        type: "start_game",
        gameId: game.gamePin,
      });
    }
  }, [game?.gamePin, sendMessage]);

  const handleNextQuestion = useCallback(() => {
    if (!game?.gamePin) return;

    if (game.currentQuestionIndex + 1 < questionsLength) {
      sendMessage({
        type: "next_question",
        gameId: game.gamePin,
      });
    } else {
      sendMessage({
        type: "finish_game",
        gameId: game.gamePin,
      });
    }
  }, [game, questionsLength, sendMessage]);

  const handleEndQuestion = useCallback(() => {
    if (game?.gamePin) {
      sendMessage({
        type: "question_timeout",
        gameId: game.gamePin,
      });
    }
  }, [game?.gamePin, sendMessage]);

  return {
    handleStartGame,
    handleNextQuestion,
    handleEndQuestion,
  };
}
