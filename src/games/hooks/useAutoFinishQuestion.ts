import { useEffect } from "react";
import type { Game, GameStatus } from "../../types/game";

export function useAutoFinishQuestion(
  state: GameStatus,
  game: Game | undefined,
  handleEndQuestion: () => void
) {
  useEffect(() => {
    if (state !== "question" || !game) return;

    const answeredCount =
      game.answeredQuestions[game.currentQuestionIndex]?.answers.length || 0;
    const totalParticipants = game.participants.length;

    if (totalParticipants > 0 && answeredCount === totalParticipants) {
      console.log("All participants answered - auto-finishing question");
      handleEndQuestion();
    }
  }, [state, game, handleEndQuestion]);
}
