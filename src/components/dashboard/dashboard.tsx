import { CalendarCheck, Flame, Gauge, Trophy } from "lucide-react";
import { Card } from "@/components/ui/card";
import { categoryLabel } from "@/lib/constants";
import { formatNumber } from "@/lib/utils";
import type { DashboardAnalytics } from "@/types/domain";

function Metric({ icon: Icon, label, value }: { icon: typeof Trophy; label: string; value: string | number }) {
  return (
    <Card className="p-4">
      <div className="flex items-center justify-between">
        <span className="text-sm font-semibold text-steel">{label}</span>
        <span className="grid h-9 w-9 place-items-center rounded-lg bg-white/8 text-acid">
          <Icon size={18} />
        </span>
      </div>
      <p className="mt-4 text-3xl font-black">{value}</p>
    </Card>
  );
}

export function Dashboard({ data }: { data: DashboardAnalytics }) {
  const weeklyVolume = data.weeklyConsistency.reduce((total, day) => total + day.volume, 0);
  const maxDailyVolume = Math.max(...data.weeklyConsistency.map((day) => day.volume), 1);

  return (
    <div className="space-y-5 animate-fade-up">
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <Metric icon={CalendarCheck} label="Total workouts" value={data.totalWorkouts} />
        <Metric icon={Flame} label="Current streak" value={`${data.currentStreak} days`} />
        <Metric icon={Gauge} label="Weekly volume" value={formatNumber(weeklyVolume)} />
        <Metric icon={Trophy} label="Best lift" value={data.bestLifts[0] ? `${data.bestLifts[0].weight} kg` : "New"} />
      </div>

      <div className="grid gap-5 xl:grid-cols-[1.35fr_0.65fr]">
        <Card>
          <div className="mb-5 flex items-center justify-between">
            <h2 className="text-lg font-black">Weekly consistency</h2>
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
          <h2 className="mb-4 text-lg font-black">Best lifts</h2>
          <div className="space-y-3">
            {data.bestLifts.length === 0 && <p className="text-sm text-steel">Complete a workout to start your leaderboard.</p>}
            {data.bestLifts.map((lift) => (
              <div key={lift.exercise} className="flex items-center justify-between rounded-lg bg-white/[0.04] p-3">
                <div>
                  <p className="font-semibold">{lift.exercise}</p>
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
          <h2 className="mb-4 text-lg font-black">Volume analytics</h2>
          <div className="space-y-3">
            {data.volumeByCategory.map((item) => (
              <div key={item.category}>
                <div className="mb-2 flex justify-between text-sm">
                  <span>{categoryLabel(item.category)}</span>
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
          <h2 className="mb-4 text-lg font-black">Muscle frequency</h2>
          <div className="grid grid-cols-2 gap-3">
            {data.muscleFrequency.slice(0, 8).map((item) => (
              <div key={item.muscle} className="rounded-lg bg-white/[0.04] p-3">
                <p className="text-sm font-semibold">{item.muscle}</p>
                <p className="mt-2 text-2xl font-black text-mint">{item.sessions}</p>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
}
