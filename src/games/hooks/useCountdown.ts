import { useRef, useEffect } from "react";

export function useCountdown(
  isActive: boolean,
  countdown: number,
  setCountdown: (value: number | ((prev: number) => number)) => void
) {
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (!isActive) {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
        timerRef.current = null;
      }
      return;
    }

    if (countdown === 0) return;

    timerRef.current = setTimeout(() => {
      setCountdown((c) => (c > 0 ? c - 1 : 0));
    }, 1000);

    return () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
        timerRef.current = null;
      }
    };
  }, [isActive, countdown, setCountdown]);
}
