"use client";

import { useMemo, useState } from "react";
import { Bar, BarChart, CartesianGrid, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { Card } from "@/components/ui/card";
import { Select } from "@/components/ui/input";
import type { ProgressPoint } from "@/types/domain";

type ProgressSeries = {
  exercise: string;
  points: ProgressPoint[];
};

type PersonalRecord = {
  exercise_id: string;
  exercise_name: string;
  max_weight: number;
  max_reps: number;
  max_volume_set: number;
};

type AnalyticsPayload = {
  progress: ProgressSeries[];
  personalRecords: PersonalRecord[];
};

const GRID   = "rgba(247,244,213,0.07)";
const AXIS   = "#7a9e6a";
const TT_BG  = { background: "#0A2318", border: "1px solid rgba(247,244,213,0.09)", borderRadius: 8, color: "#F7F4D5" };

export function ProgressAnalytics({ initialData }: { initialData: AnalyticsPayload }) {
  const [data] = useState<AnalyticsPayload>(initialData);
  const [exercise, setExercise] = useState(initialData.progress[0]?.exercise ?? "");

  const active = useMemo(() => data.progress.find((item) => item.exercise === exercise), [data.progress, exercise]);

  return (
    <div className="space-y-5">
      <Card className="flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
        <h2 className="text-lg font-black text-cream">Exercise progression</h2>
        <Select className="sm:w-72" value={exercise} onChange={(event) => setExercise(event.target.value)}>
          {data.progress.map((item) => (
            <option key={item.exercise} value={item.exercise}>
              {item.exercise}
            </option>
          ))}
        </Select>
      </Card>

      {data.progress.length === 0 && (
        <Card className="py-14 text-center">
          <p className="text-steel">No progression data yet. Complete a few workouts to see your progress.</p>
        </Card>
      )}

      {data.progress.length > 0 && (
        <>
          <div className="grid gap-5 xl:grid-cols-3">
            <Card className="xl:col-span-2">
              <h2 className="mb-4 text-lg font-black text-cream">Weight progression</h2>
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={active?.points ?? []}>
                    <CartesianGrid stroke={GRID} vertical={false} />
                    <XAxis dataKey="date" tickLine={false} axisLine={false} stroke={AXIS} tick={{ fill: AXIS, fontSize: 12 }} />
                    <YAxis tickLine={false} axisLine={false} stroke={AXIS} tick={{ fill: AXIS, fontSize: 12 }} />
                    <Tooltip contentStyle={TT_BG} />
                    <Line type="monotone" dataKey="weight" stroke="#D3968C" strokeWidth={3} dot={false} activeDot={{ r: 5, fill: "#D3968C" }} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </Card>

            <Card>
              <h2 className="mb-4 text-lg font-black text-cream">Personal records</h2>
              <div className="space-y-3">
                {data.personalRecords.length === 0 && (
                  <p className="text-sm text-steel">No records yet.</p>
                )}
                {data.personalRecords.slice(0, 8).map((record) => (
                  <div key={record.exercise_id} className="rounded-lg bg-white/[0.04] p-3">
                    <p className="font-semibold text-cream">{record.exercise_name}</p>
                    <p className="mt-1 text-sm text-steel">
                      {record.max_weight} kg &bull; {record.max_reps} reps &bull; {record.max_volume_set} vol
                    </p>
                  </div>
                ))}
              </div>
            </Card>
          </div>

          <div className="grid gap-5 lg:grid-cols-2">
            <Card>
              <h2 className="mb-4 text-lg font-black text-cream">Volume progression</h2>
              <div className="h-72">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={active?.points ?? []}>
                    <CartesianGrid stroke={GRID} vertical={false} />
                    <XAxis dataKey="date" tickLine={false} axisLine={false} stroke={AXIS} tick={{ fill: AXIS, fontSize: 12 }} />
                    <YAxis tickLine={false} axisLine={false} stroke={AXIS} tick={{ fill: AXIS, fontSize: 12 }} />
                    <Tooltip contentStyle={TT_BG} />
                    <Bar dataKey="volume" fill="#839958" radius={[8, 8, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </Card>

            <Card>
              <h2 className="mb-4 text-lg font-black text-cream">Reps progression</h2>
              <div className="h-72">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={active?.points ?? []}>
                    <CartesianGrid stroke={GRID} vertical={false} />
                    <XAxis dataKey="date" tickLine={false} axisLine={false} stroke={AXIS} tick={{ fill: AXIS, fontSize: 12 }} />
                    <YAxis tickLine={false} axisLine={false} stroke={AXIS} tick={{ fill: AXIS, fontSize: 12 }} />
                    <Tooltip contentStyle={TT_BG} />
                    <Line type="monotone" dataKey="reps" stroke="#c06050" strokeWidth={3} dot={false} activeDot={{ r: 5, fill: "#c06050" }} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </Card>
          </div>
        </>
      )}
    </div>
  );
}
