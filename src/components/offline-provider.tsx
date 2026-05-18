"use client";

import { useEffect } from "react";
import { syncOfflineQueue } from "@/lib/offline";

export function OfflineProvider() {
  useEffect(() => {
    if ("serviceWorker" in navigator) {
      navigator.serviceWorker.register("/sw.js").catch(() => undefined);
    }

    const handleOnline = () => {
      syncOfflineQueue().catch(() => undefined);
    };

    window.addEventListener("online", handleOnline);
    handleOnline();

    return () => window.removeEventListener("online", handleOnline);
  }, []);

  return null;
}
