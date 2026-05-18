"use client";

import { useEffect, useMemo, useState } from "react";

export function useRestTimer(defaultSeconds = 90) {
  const [secondsLeft, setSecondsLeft] = useState(defaultSeconds);
  const [running, setRunning] = useState(false);

  useEffect(() => {
    if (!running) return;
    const interval = window.setInterval(() => {
      setSecondsLeft((seconds) => {
        if (seconds <= 1) {
          setRunning(false);
          return 0;
        }
        return seconds - 1;
      });
    }, 1000);

    return () => window.clearInterval(interval);
  }, [running]);

  const label = useMemo(() => {
    const minutes = Math.floor(secondsLeft / 60);
    const seconds = secondsLeft % 60;
    return `${minutes}:${seconds.toString().padStart(2, "0")}`;
  }, [secondsLeft]);

  return {
    label,
    secondsLeft,
    running,
    start: (seconds = defaultSeconds) => {
      setSecondsLeft(seconds);
      setRunning(true);
    },
    pause: () => setRunning(false),
    reset: () => {
      setSecondsLeft(defaultSeconds);
      setRunning(false);
    },
  };
}
