"use client";

import { useEffect, useMemo, useState } from "react";

export function useRestTimer(defaultSeconds = 90) {
  const [durationSeconds, setDurationSeconds] = useState(defaultSeconds);
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
    durationSeconds,
    secondsLeft,
    running,
    setDuration: (seconds: number) => {
      const nextSeconds = Math.max(1, Math.min(60 * 60, Math.round(seconds)));
      setDurationSeconds(nextSeconds);
      if (!running) setSecondsLeft(nextSeconds);
    },
    start: (seconds = durationSeconds) => {
      setSecondsLeft(seconds);
      setRunning(true);
    },
    pause: () => setRunning(false),
    reset: () => {
      setSecondsLeft(durationSeconds);
      setRunning(false);
    },
  };
}
