import { useRef, useEffect, useState } from "react";
import type { GameStatus } from "../../types/game";

interface UseMusicReturn {
  isMuted: boolean;
  toggleMute: () => void;
}

export function useMusic(state: GameStatus): UseMusicReturn {
  const [isMuted, setIsMuted] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  // Initialize audio once on mount
  useEffect(() => {
    audioRef.current = new Audio("/music/music.ogg");
    audioRef.current.loop = true;
    audioRef.current.volume = 0.3; // Set volume to 30%

    // Cleanup on unmount only
    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }
    };
  }, []);

  // Start playing when game moves beyond waiting state
  useEffect(() => {
    if (state !== "waiting" && audioRef.current && audioRef.current.paused) {
      audioRef.current.play().catch((error) => {
        console.error("Failed to play audio:", error);
      });
    }
  }, [state]);

  // Handle mute/unmute
  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.muted = isMuted;
    }
  }, [isMuted]);

  const toggleMute = () => {
    setIsMuted(!isMuted);
  };

  return {
    isMuted,
    toggleMute,
  };
}
