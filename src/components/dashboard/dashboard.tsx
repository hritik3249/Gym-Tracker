"use client";

import { useEffect, useState } from "react";
import { CalendarCheck, Dumbbell, Flame, Gauge, Trophy } from "lucide-react";
import Link from "next/link";
import { Card } from "@/components/ui/card";
import { categoryLabel } from "@/lib/constants";
import { formatNumber } from "@/lib/utils";
import type { DashboardAnalytics } from "@/types/domain";

function useCountUp(target: number, duration = 700) {
  const [value, setValue] = useState(0);
  useEffect(() => {
    if (target === 0) return;
    let start: number;
    const id = requestAnimationFrame(function step(ts) {
      start ??= ts;
      const p = Math.min((ts - start) / duration, 1);
      setValue(Math.round(p * target));
      if (p < 1) requestAnimationFrame(step);
    });
    return () => cancelAnimationFrame(id);
  }, [target, duration]);
  return value;
}

function Metric({
  icon: Icon,
  label,
  value,
  delay = 0,
}: {
  icon: typeof Trophy;
  label: string;
  value: string | number;
  delay?: number;
}) {
  return (
    <Card className="animate-fade-up p-4" style={{ animationDelay: `${delay}ms` }}>
      <div className="flex items-center justify-between">
        <span className="text-sm font-semibold text-steel">{label}</span>
        <span className="grid h-9 w-9 place-items-center rounded-lg bg-white/8 text-acid">
          <Icon size={18} />
        </span>
      </div>
      <p className="mt-4 text-3xl font-black text-cream">{value}</p>
    </Card>
  );
}

export function Dashboard({ data }: { data: DashboardAnalytics }) {
  const weeklyVolume = data.weeklyConsistency.reduce((total, day) => total + day.volume, 0);
  const maxDailyVolume = Math.max(...data.weeklyConsistency.map((day) => day.volume), 1);

  const countWorkouts = useCountUp(data.totalWorkouts);
  const countStreak   = useCountUp(data.currentStreak);
  const countVolume   = useCountUp(weeklyVolume, 900);
  const countBest     = useCountUp(data.bestLifts[0]?.weight ?? 0);

  if (data.totalWorkouts === 0) {
    return (
      <div className="animate-fade-up">
        <Card className="py-20 text-center">
          <div className="mx-auto mb-5 grid h-20 w-20 place-items-center rounded-2xl bg-acid/10 text-acid">
            <Dumbbell size={40} />
          </div>
          <h2 className="text-2xl font-black text-cream">Welcome to LiftLoop</h2>
          <p className="mt-2 text-steel">Log your first workout to start building your dashboard.</p>
          <Link
            href="/workout"
            className="mt-6 inline-flex h-11 items-center gap-2 rounded-lg bg-acid px-6 text-sm font-semibold text-ink hover:brightness-110"
          >
            <Dumbbell size={18} />
            Start your first workout
          </Link>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-5">
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <Metric icon={CalendarCheck} label="Total workouts"  value={countWorkouts}                                      delay={0}   />
        <Metric icon={Flame}         label="Current streak"  value={`${countStreak} days`}                              delay={70}  />
        <Metric icon={Gauge}         label="Weekly volume"   value={`${formatNumber(countVolume)} kg`}                  delay={140} />
        <Metric icon={Trophy}        label="Best lift"       value={data.bestLifts[0] ? `${countBest} kg` : "New"}      delay={210} />
      </div>

      <div className="grid gap-5 xl:grid-cols-[1.35fr_0.65fr]">
        <Card>
          <div className="mb-5 flex items-center justify-between">
            <h2 className="text-lg font-black text-cream">Weekly consistency</h2>
            <span className="text-sm text-steel">{data.weeklyConsistency.filter((day) => day.completed).length}/7 sessions</span>
          </div>
          <div className="flex h-72 items-end gap-3">
            {data.weeklyConsistency.map((day) => (
              <div key={day.day} className="flex min-w-0 flex-1 flex-col items-center gap-3">
                <div className="flex h-56 w-full items-end rounded-lg bg-white/[0.04] p-1">
                  <div
                    className="w-full rounded-md bg-acid transition-all duration-500"
                    style={{ height: `${Math.max(day.completed ? 8 : 0, (day.volume / maxDailyVolume) * 100)}%` }}
                    title={`${day.day}: ${formatNumber(day.volume)} kg`}
                  />
                </div>
                <span className="text-xs font-semibold text-steel">{day.day}</span>
              </div>
            ))}
          </div>
        </Card>

        <Card>
          <h2 className="mb-4 text-lg font-black text-cream">Best lifts</h2>
          <div className="space-y-3">
            {data.bestLifts.length === 0 && (
              <p className="text-sm text-steel">Complete a workout to start your leaderboard.</p>
            )}
            {data.bestLifts.map((lift) => (
              <div key={lift.exercise} className="flex items-center justify-between rounded-lg bg-white/[0.04] p-3">
                <div>
                  <p className="font-semibold text-cream">{lift.exercise}</p>
                  <p className="text-xs text-steel">{lift.reps} reps</p>
                </div>
                <span className="text-lg font-black text-acid">{lift.weight} kg</span>
              </div>
            ))}
          </div>
        </Card>
      </div>

      <div className="grid gap-5 lg:grid-cols-2">
        <Card>
          <h2 className="mb-4 text-lg font-black text-cream">Volume analytics</h2>
          <div className="space-y-3">
            {data.volumeByCategory.map((item) => (
              <div key={item.category}>
                <div className="mb-2 flex justify-between text-sm">
                  <span className="text-cream">{categoryLabel(item.category)}</span>
                  <span className="text-steel">{formatNumber(item.volume)} kg</span>
                </div>
                <div className="h-2 rounded-full bg-white/8">
                  <div className="h-2 rounded-full bg-acid" style={{ width: `${Math.min(100, item.volume / 100)}%` }} />
                </div>
              </div>
            ))}
          </div>
        </Card>

        <Card>
          <h2 className="mb-4 text-lg font-black text-cream">Muscle frequency</h2>
          <div className="grid grid-cols-2 gap-3">
            {data.muscleFrequency.slice(0, 8).map((item) => (
              <div key={item.muscle} className="rounded-lg bg-white/[0.04] p-3">
                <p className="text-sm font-semibold text-cream">{item.muscle}</p>
                <p className="mt-2 text-2xl font-black text-acid">{item.sessions}</p>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
}
