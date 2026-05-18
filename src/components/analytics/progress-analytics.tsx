"use client";

import { useEffect, useMemo, useState } from "react";
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

export function ProgressAnalytics() {
  const [data, setData] = useState<AnalyticsPayload | null>(null);
  const [exercise, setExercise] = useState("");

  useEffect(() => {
    fetch("/api/analytics/overview")
      .then((response) => response.json())
      .then((payload) => {
        setData(payload);
        setExercise(payload.progress?.[0]?.exercise ?? "");
      });
  }, []);

  const active = useMemo(() => data?.progress.find((item) => item.exercise === exercise), [data?.progress, exercise]);

  if (!data) return <Card className="h-96 animate-pulse" />;

  return (
    <div className="space-y-5">
      <Card className="flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
        <h2 className="text-lg font-black">Exercise progression</h2>
        <Select className="sm:w-72" value={exercise} onChange={(event) => setExercise(event.target.value)}>
          {data.progress.map((item) => (
            <option key={item.exercise} value={item.exercise}>
              {item.exercise}
            </option>
          ))}
        </Select>
      </Card>

      <div className="grid gap-5 xl:grid-cols-3">
        <Card className="xl:col-span-2">
          <h2 className="mb-4 text-lg font-black">Weight progression</h2>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={active?.points ?? []}>
                <CartesianGrid stroke="rgba(255,255,255,0.08)" vertical={false} />
                <XAxis dataKey="date" tickLine={false} axisLine={false} stroke="#9aa6b2" />
                <YAxis tickLine={false} axisLine={false} stroke="#9aa6b2" />
                <Tooltip contentStyle={{ background: "#10141b", border: "1px solid rgba(255,255,255,0.09)", borderRadius: 8 }} />
                <Line type="monotone" dataKey="weight" stroke="#b7ff3c" strokeWidth={3} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </Card>

        <Card>
          <h2 className="mb-4 text-lg font-black">Personal records</h2>
          <div className="space-y-3">
            {data.personalRecords.slice(0, 8).map((record) => (
              <div key={record.exercise_id} className="rounded-lg bg-white/[0.04] p-3">
                <p className="font-semibold">{record.exercise_name}</p>
                <p className="mt-1 text-sm text-steel">
                  {record.max_weight} kg • {record.max_reps} reps • {record.max_volume_set} volume
                </p>
              </div>
            ))}
          </div>
        </Card>
      </div>

      <div className="grid gap-5 lg:grid-cols-2">
        <Card>
          <h2 className="mb-4 text-lg font-black">Volume progression</h2>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={active?.points ?? []}>
                <CartesianGrid stroke="rgba(255,255,255,0.08)" vertical={false} />
                <XAxis dataKey="date" tickLine={false} axisLine={false} stroke="#9aa6b2" />
                <YAxis tickLine={false} axisLine={false} stroke="#9aa6b2" />
                <Tooltip contentStyle={{ background: "#10141b", border: "1px solid rgba(255,255,255,0.09)", borderRadius: 8 }} />
                <Bar dataKey="volume" fill="#30e6a1" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>

        <Card>
          <h2 className="mb-4 text-lg font-black">Reps progression</h2>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={active?.points ?? []}>
                <CartesianGrid stroke="rgba(255,255,255,0.08)" vertical={false} />
                <XAxis dataKey="date" tickLine={false} axisLine={false} stroke="#9aa6b2" />
                <YAxis tickLine={false} axisLine={false} stroke="#9aa6b2" />
                <Tooltip contentStyle={{ background: "#10141b", border: "1px solid rgba(255,255,255,0.09)", borderRadius: 8 }} />
                <Line type="monotone" dataKey="reps" stroke="#ff6b35" strokeWidth={3} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </Card>
      </div>
    </div>
  );
}
