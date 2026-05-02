import { useCallback } from "react";
import type { Game } from "../../types/game";

export function useGameActions(
  game: Game | undefined,
  sendMessage: (message: any) => Promise<boolean>,
  questionsLength: number,
) {
  const handleStartGame = useCallback(() => {
    console.log("handleStartGame called, game:", game);
    if (game?.gamePin) {
      console.log("Sending start_game message for PIN:", game.gamePin);
      sendMessage({
        type: "start_game",
        gameId: game.gamePin,
      });
    } else {
      console.error("Cannot start game - no game or gamePin");
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
