"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";

const STORAGE_KEY = "rest-timer-end";

function persistEndTime(endTime: number | null) {
  if (endTime === null) {
    localStorage.removeItem(STORAGE_KEY);
  } else {
    localStorage.setItem(STORAGE_KEY, String(endTime));
  }
}

function readPersistedEndTime(): number | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const t = Number(raw);
    // Discard if already expired
    return t > Date.now() ? t : null;
  } catch {
    return null;
  }
}

function notify(title: string, body: string) {
  if (typeof Notification === "undefined" || Notification.permission !== "granted") return;
  new Notification(title, { body, icon: "/icon-192.png", silent: false });
}

export function useRestTimer(defaultSeconds = 90) {
  const [durationSeconds, setDurationSeconds] = useState(defaultSeconds);

  // Restore timer if the app was suspended while it was running
  const restoredEndTime = useRef<number | null>(null);
  if (restoredEndTime.current === null) {
    restoredEndTime.current = readPersistedEndTime();
  }

  const initialSecondsLeft = restoredEndTime.current
    ? Math.max(0, Math.ceil((restoredEndTime.current - Date.now()) / 1000))
    : defaultSeconds;

  const [secondsLeft, setSecondsLeft] = useState(initialSecondsLeft);
  const [running, setRunning] = useState(() => restoredEndTime.current !== null);

  // Store absolute end time instead of counting ticks — survives screen-off throttling
  const endTimeRef = useRef<number | null>(restoredEndTime.current);
  // Keep a ref to secondsLeft for toggle/resume without stale closure
  const secondsLeftRef = useRef(initialSecondsLeft);
  useEffect(() => { secondsLeftRef.current = secondsLeft; }, [secondsLeft]);

  useEffect(() => {
    if (!running) return;

    const tick = () => {
      if (endTimeRef.current === null) return;
      const remaining = Math.max(0, Math.ceil((endTimeRef.current - Date.now()) / 1000));
      setSecondsLeft(remaining);
      if (remaining <= 0) {
        setRunning(false);
        endTimeRef.current = null;
        persistEndTime(null);
        notify("Rest over!", "Time to get back to it 💪");
      }
    };

    tick(); // immediate sync in case we just restored from suspension
    const intervalId = window.setInterval(tick, 500);

    // When screen wakes up, recalculate immediately instead of waiting for next tick
    const onVisibilityChange = () => { if (!document.hidden) tick(); };
    document.addEventListener("visibilitychange", onVisibilityChange);

    return () => {
      window.clearInterval(intervalId);
      document.removeEventListener("visibilitychange", onVisibilityChange);
    };
  }, [running]);

  const label = useMemo(() => {
    const m = Math.floor(secondsLeft / 60);
    const s = secondsLeft % 60;
    return `${m}:${s.toString().padStart(2, "0")}`;
  }, [secondsLeft]);

  const start = useCallback((seconds?: number) => {
    const s = seconds ?? durationSeconds;
    const endTime = Date.now() + s * 1000;
    endTimeRef.current = endTime;
    persistEndTime(endTime);
    setSecondsLeft(s);
    setRunning(true);
    // Ask for notification permission on first start so the done-alert works from lock screen
    if (typeof Notification !== "undefined" && Notification.permission === "default") {
      Notification.requestPermission();
    }
  }, [durationSeconds]);

  // toggle: pause if running, resume from current secondsLeft if paused
  const toggle = useCallback(() => {
    if (running) {
      setRunning(false);
      endTimeRef.current = null;
      persistEndTime(null);
    } else {
      const endTime = Date.now() + secondsLeftRef.current * 1000;
      endTimeRef.current = endTime;
      persistEndTime(endTime);
      setRunning(true);
    }
  }, [running]);

  const reset = useCallback(() => {
    endTimeRef.current = null;
    persistEndTime(null);
    setSecondsLeft(durationSeconds);
    setRunning(false);
  }, [durationSeconds]);

  return {
    label,
    durationSeconds,
    secondsLeft,
    running,
    setDuration: (seconds: number) => {
      const s = Math.max(1, Math.min(3600, Math.round(seconds)));
      setDurationSeconds(s);
      if (!running) setSecondsLeft(s);
    },
    start,
    toggle,
    pause: () => {
      setRunning(false);
      endTimeRef.current = null;
      persistEndTime(null);
    },
    reset,
  };
}
