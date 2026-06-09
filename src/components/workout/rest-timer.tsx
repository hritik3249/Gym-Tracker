"use client";

import { useEffect, useMemo, useRef } from "react";
import { Pause, Play, RotateCcw } from "lucide-react";
import { useRestTimer } from "@/hooks/use-rest-timer";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";

const presets = [60, 90, 120, 180];

export function RestTimer() {
  const timer = useRestTimer(90);
  const timerRef = useRef(timer);
  useEffect(() => { timerRef.current = timer; });

  useEffect(() => {
    const handler = () => {
      if (!timerRef.current.running) timerRef.current.start();
    };
    window.addEventListener("liftloop:set-completed", handler);
    return () => window.removeEventListener("liftloop:set-completed", handler);
  }, []);
  const minutes = useMemo(() => Math.floor(timer.durationSeconds / 60), [timer.durationSeconds]);
  const seconds = useMemo(() => timer.durationSeconds % 60, [timer.durationSeconds]);

  function updateMinutes(value: string) {
    timer.setDuration(Number(value || 0) * 60 + seconds);
  }

  function updateSeconds(value: string) {
    timer.setDuration(minutes * 60 + Number(value || 0));
  }

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
      <div className="mt-4 grid grid-cols-2 gap-3">
        <div>
          <label className="mb-1 block text-xs font-bold uppercase tracking-[0.14em] text-steel">Min</label>
          <Input type="number" min={0} max={60} inputMode="numeric" value={minutes} onChange={(event) => updateMinutes(event.target.value)} />
        </div>
        <div>
          <label className="mb-1 block text-xs font-bold uppercase tracking-[0.14em] text-steel">Sec</label>
          <Input type="number" min={0} max={59} inputMode="numeric" value={seconds} onChange={(event) => updateSeconds(event.target.value)} />
        </div>
      </div>
      <div className="mt-3 grid grid-cols-4 gap-2">
        {presets.map((preset) => (
          <Button key={preset} className="h-9 px-2 text-xs" variant="secondary" onClick={() => timer.setDuration(preset)}>
            {Math.floor(preset / 60)}:{(preset % 60).toString().padStart(2, "0")}
          </Button>
        ))}
      </div>
    </Card>
  );
}
