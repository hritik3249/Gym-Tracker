"use client";

import { Pause, Play } from "lucide-react";
import type { useRestTimer } from "@/hooks/use-rest-timer";

export function FloatingRestTimer({ timer }: { timer: ReturnType<typeof useRestTimer> }) {
  if (!timer.running) return null;

  return (
    <div className="animate-fade-up fixed bottom-24 right-4 z-40 md:hidden">
      <div
        className="flex items-center gap-3 rounded-2xl border border-line bg-panel px-4 py-3 backdrop-blur-xl"
        style={{ boxShadow: "0 0 32px rgba(211,150,140,0.22), 0 18px 70px rgba(0,0,0,0.5)" }}
      >
        <div>
          <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-steel">Rest</p>
          <p className="tabular-nums text-2xl font-black text-cream">{timer.label}</p>
        </div>
        <button
          onClick={() => (timer.running ? timer.pause() : timer.start())}
          className="grid h-9 w-9 place-items-center rounded-xl bg-acid/15 text-acid transition-colors active:bg-acid/30"
          aria-label={timer.running ? "Pause timer" : "Resume timer"}
        >
          {timer.running ? <Pause size={16} /> : <Play size={16} />}
        </button>
      </div>
    </div>
  );
}
