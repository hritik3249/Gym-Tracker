"use client";

import Link from "next/link";
import { useCallback, useEffect, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Dumbbell, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";

export function DashboardActions() {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const refreshDashboard = useCallback(() => {
    startTransition(() => router.refresh());
  }, [router]);

  useEffect(() => {
    const handleRefresh = () => refreshDashboard();
    const handleVisibility = () => {
      if (document.visibilityState === "visible") refreshDashboard();
    };

    window.addEventListener("liftloop:workout-finished", handleRefresh);
    window.addEventListener("storage", handleRefresh);
    document.addEventListener("visibilitychange", handleVisibility);
    const interval = window.setInterval(refreshDashboard, 30000);

    return () => {
      window.removeEventListener("liftloop:workout-finished", handleRefresh);
      window.removeEventListener("storage", handleRefresh);
      document.removeEventListener("visibilitychange", handleVisibility);
      window.clearInterval(interval);
    };
  }, [refreshDashboard]);

  return (
    <div className="flex flex-wrap gap-2">
      <Button variant="secondary" onClick={refreshDashboard} disabled={isPending}>
        <RefreshCw size={18} className={isPending ? "animate-spin" : ""} />
        Refresh
      </Button>
      <Link
        href="/workout"
        className="inline-flex h-11 items-center justify-center gap-2 rounded-lg bg-acid px-4 text-sm font-semibold text-ink transition duration-200 hover:bg-lime-200"
      >
        <Dumbbell size={18} />
        Track workout
      </Link>
    </div>
  );
}
