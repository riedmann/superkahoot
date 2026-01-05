import { useState, useCallback } from "react";

export function usePlayerInfo() {
  const [gamePin, setGamePin] = useState("");
  const [id, setId] = useState("");
  const [nickname, setNickname] = useState("");

  const generatePlayerId = useCallback(() => {
    const playerId = Date.now().toString();
    setId(playerId);
    return playerId;
  }, []);

  return {
    gamePin,
    setGamePin,
    id,
    nickname,
    setNickname,
    generatePlayerId,
  };
}
