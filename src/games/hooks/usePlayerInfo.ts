import { useState, useCallback, useEffect } from "react";

const STORAGE_KEY_PREFIX = "superkahoot_player_";

interface StoredPlayerData {
  id: string;
  nickname: string;
  gamePin: string;
  timestamp: number;
}

export function usePlayerInfo() {
  const [gamePin, setGamePin] = useState("");
  const [id, setId] = useState("");
  const [nickname, setNickname] = useState("");
  const [hasStoredSession, setHasStoredSession] = useState(false);

  // Load stored player data on mount
  useEffect(() => {
    const storedData = getStoredPlayerData();
    if (storedData) {
      // Only use stored data if it's less than 4 hours old
      const fourHoursAgo = Date.now() - 4 * 60 * 60 * 1000;
      if (storedData.timestamp > fourHoursAgo) {
        setHasStoredSession(true);
      } else {
        // Clear old data
        clearStoredPlayerData();
      }
    }
  }, []);

  const generatePlayerId = useCallback(() => {
    const playerId = Date.now().toString();
    setId(playerId);
    return playerId;
  }, []);

  const savePlayerData = useCallback(
    (playerId: string, playerNickname: string, pin: string) => {
      const data: StoredPlayerData = {
        id: playerId,
        nickname: playerNickname,
        gamePin: pin,
        timestamp: Date.now(),
      };
      localStorage.setItem(STORAGE_KEY_PREFIX + pin, JSON.stringify(data));
    },
    [],
  );

  const loadStoredSession = useCallback(() => {
    const storedData = getStoredPlayerData();
    if (storedData) {
      setId(storedData.id);
      setNickname(storedData.nickname);
      setGamePin(storedData.gamePin);
      return storedData;
    }
    return null;
  }, []);

  const clearSession = useCallback(() => {
    if (gamePin) {
      localStorage.removeItem(STORAGE_KEY_PREFIX + gamePin);
    }
    setHasStoredSession(false);
  }, [gamePin]);

  return {
    gamePin,
    setGamePin,
    id,
    nickname,
    setNickname,
    generatePlayerId,
    savePlayerData,
    loadStoredSession,
    clearSession,
    hasStoredSession,
  };
}

function getStoredPlayerData(): StoredPlayerData | null {
  // Check all storage keys for player data
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i);
    if (key?.startsWith(STORAGE_KEY_PREFIX)) {
      const data = localStorage.getItem(key);
      if (data) {
        try {
          return JSON.parse(data);
        } catch {
          // Invalid data, skip
        }
      }
    }
  }
  return null;
}

function clearStoredPlayerData() {
  const keysToRemove: string[] = [];
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i);
    if (key?.startsWith(STORAGE_KEY_PREFIX)) {
      keysToRemove.push(key);
    }
  }
  keysToRemove.forEach((key) => localStorage.removeItem(key));
}
