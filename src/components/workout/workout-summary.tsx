"use client";

import { CheckCircle, Clock, Dumbbell, Trophy, Zap } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { categoryLabel } from "@/lib/constants";
import { formatNumber } from "@/lib/utils";
import type { ExerciseCategory } from "@/types/domain";

export type SummaryData = {
  category: ExerciseCategory;
  durationSeconds: number;
  totalSets: number;
  completedSets: number;
  volume: number;
  prs: { exercise: string; weight: number }[];
};

function formatDuration(seconds: number) {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  if (m === 0) return `${s}s`;
  return s === 0 ? `${m}m` : `${m}m ${s}s`;
}

export function WorkoutSummary({ data, onDone }: { data: SummaryData; onDone: () => void }) {
  return (
    <div className="animate-fade-up mx-auto max-w-lg space-y-5 py-6">
      <div className="text-center">
        <div className="mx-auto mb-4 grid h-16 w-16 place-items-center rounded-2xl bg-acid/15 text-acid">
          <CheckCircle size={34} />
        </div>
        <h1 className="text-3xl font-black text-cream">Workout complete!</h1>
        <p className="mt-1 text-steel">{categoryLabel(data.category)} session</p>
      </div>

      <Card>
        <div className="grid grid-cols-3 divide-x divide-line text-center">
          <div className="px-4 py-3">
            <div className="mx-auto mb-2 grid h-8 w-8 place-items-center rounded-lg bg-white/8 text-acid">
              <Clock size={16} />
            </div>
            <p className="text-lg font-black text-cream">{formatDuration(data.durationSeconds)}</p>
            <p className="text-xs text-steel">Duration</p>
          </div>
          <div className="px-4 py-3">
            <div className="mx-auto mb-2 grid h-8 w-8 place-items-center rounded-lg bg-white/8 text-acid">
              <Dumbbell size={16} />
            </div>
            <p className="text-lg font-black text-cream">{data.completedSets}<span className="text-sm font-semibold text-steel">/{data.totalSets}</span></p>
            <p className="text-xs text-steel">Sets done</p>
          </div>
          <div className="px-4 py-3">
            <div className="mx-auto mb-2 grid h-8 w-8 place-items-center rounded-lg bg-white/8 text-acid">
              <Zap size={16} />
            </div>
            <p className="text-lg font-black text-cream">{formatNumber(data.volume)}<span className="text-xs font-semibold text-steel"> kg</span></p>
            <p className="text-xs text-steel">Volume</p>
          </div>
        </div>
      </Card>

      {data.prs.length > 0 && (
        <Card>
          <div className="mb-3 flex items-center gap-2">
            <Trophy size={18} className="text-acid" />
            <h2 className="font-black text-cream">Personal Records</h2>
          </div>
          <div className="space-y-2">
            {data.prs.map((pr) => (
              <div key={pr.exercise} className="flex items-center justify-between rounded-lg bg-acid/10 px-3 py-2">
                <span className="text-sm font-semibold text-cream">{pr.exercise}</span>
                <span className="text-sm font-black text-acid">{pr.weight} kg</span>
              </div>
            ))}
          </div>
        </Card>
      )}

      <Button className="w-full" onClick={onDone}>
        View Dashboard
      </Button>
    </div>
  );
}
