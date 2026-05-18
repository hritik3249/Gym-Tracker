"use client";

import { Pause, Play, RotateCcw } from "lucide-react";
import { useRestTimer } from "@/hooks/use-rest-timer";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

export function RestTimer() {
  const timer = useRestTimer(90);

  return (
    <Card className="p-4">
      <div className="flex items-center justify-between gap-3">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.18em] text-steel">Rest timer</p>
          <p className="mt-1 text-3xl font-black">{timer.label}</p>
        </div>
        <div className="flex gap-2">
          <Button className="h-10 w-10 p-0" variant="secondary" aria-label={timer.running ? "Pause timer" : "Start timer"} onClick={() => (timer.running ? timer.pause() : timer.start())}>
            {timer.running ? <Pause size={17} /> : <Play size={17} />}
          </Button>
          <Button className="h-10 w-10 p-0" variant="ghost" aria-label="Reset timer" onClick={timer.reset}>
            <RotateCcw size={17} />
          </Button>
        </div>
      </div>
    </Card>
  );
}
