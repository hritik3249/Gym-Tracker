"use client";

import { useMemo, useState } from "react";
import { format } from "date-fns";
import { Dumbbell, GitCompareArrows, Trash2 } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Select } from "@/components/ui/input";
import { useToast } from "@/components/ui/toast";
import { CATEGORIES, categoryLabel } from "@/lib/constants";
import { formatNumber } from "@/lib/utils";
import type { ExerciseCategory, WorkoutWithSets } from "@/types/domain";

function workoutVolume(workout: WorkoutWithSets) {
  return workout.workout_sets.reduce((total, set) => total + Number(set.weight) * Number(set.reps), 0);
}

export function WorkoutHistory({ initialWorkouts }: { initialWorkouts: WorkoutWithSets[] }) {
  const { toast } = useToast();
  const [workouts, setWorkouts] = useState<WorkoutWithSets[]>(initialWorkouts);
  const [filter, setFilter] = useState<ExerciseCategory | "all">("all");
  const [compareIds, setCompareIds] = useState<string[]>([]);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);

  const visibleWorkouts = useMemo(
    () => workouts.filter((workout) => filter === "all" || workout.category === filter),
    [workouts, filter],
  );
  const compared = workouts.filter((workout) => compareIds.includes(workout.id)).slice(0, 2);

  function toggleCompare(id: string) {
    setCompareIds((current) => {
      if (current.includes(id)) return current.filter((item) => item !== id);
      return [...current.slice(-1), id];
    });
  }

  async function deleteWorkout(id: string) {
    setDeletingId(id);
    const response = await fetch(`/api/workouts/${id}`, { method: "DELETE" });
    setDeletingId(null);
    setConfirmDeleteId(null);
    if (!response.ok) return;
    setWorkouts((current) => current.filter((workout) => workout.id !== id));
    setCompareIds((current) => current.filter((compareId) => compareId !== id));
    localStorage.setItem("liftloop:workout-finished", new Date().toISOString());
    window.dispatchEvent(new Event("liftloop:workout-finished"));
    toast("Workout deleted");
  }

  return (
    <div className="space-y-5">
      <Card className="flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
        <h2 className="text-lg font-black text-cream">Complete workout history</h2>
        <Select className="sm:w-48" value={filter} onChange={(event) => setFilter(event.target.value as ExerciseCategory | "all")}>
          <option value="all">All categories</option>
          {CATEGORIES.map((item) => (
            <option key={item.value} value={item.value}>
              {item.label}
            </option>
          ))}
        </Select>
      </Card>

      {compared.length === 2 && (
        <Card>
          <h2 className="mb-4 flex items-center gap-2 text-lg font-black text-cream">
            <GitCompareArrows size={20} className="text-acid" />
            Workout comparison
          </h2>
          <div className="grid gap-3 md:grid-cols-2">
            {compared.map((workout) => (
              <div key={workout.id} className="rounded-lg bg-white/[0.04] p-4">
                <p className="font-black text-cream">{categoryLabel(workout.category)}</p>
                <p className="text-sm text-steel">{format(new Date(workout.performed_at), "PPp")}</p>
                <p className="mt-3 text-2xl font-black text-acid">{formatNumber(workoutVolume(workout))} kg</p>
                <p className="text-sm text-steel">{workout.workout_sets.length} sets</p>
              </div>
            ))}
          </div>
        </Card>
      )}

      {visibleWorkouts.length === 0 && (
        <Card className="py-14 text-center">
          <div className="mx-auto mb-4 grid h-14 w-14 place-items-center rounded-2xl bg-acid/10 text-acid">
            <Dumbbell size={28} />
          </div>
          <p className="font-black text-cream">
            {filter === "all" ? "No workouts logged yet" : `No ${categoryLabel(filter as ExerciseCategory)} workouts`}
          </p>
          <p className="mt-1 text-sm text-steel">
            {filter === "all" ? "Complete a session to see it here." : "Try a different category filter."}
          </p>
          {filter === "all" && (
            <Link
              href="/workout"
              className="mt-5 inline-flex h-11 items-center gap-2 rounded-lg bg-acid px-5 text-sm font-semibold text-ink"
            >
              Start a workout
            </Link>
          )}
        </Card>
      )}

      <div className="grid gap-4">
        {visibleWorkouts.map((workout) => (
          <Card key={workout.id}>
            <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-start">
              <div>
                <p className="text-xs font-bold uppercase tracking-[0.18em] text-acid">{categoryLabel(workout.category)}</p>
                <h2 className="mt-1 text-xl font-black text-cream">{format(new Date(workout.performed_at), "EEEE, MMM d")}</h2>
                <p className="text-sm text-steel">{formatNumber(workoutVolume(workout))} kg volume &bull; {workout.workout_sets.length} sets</p>
              </div>
              <div className="flex flex-wrap items-center gap-2">
                <Button variant={compareIds.includes(workout.id) ? "primary" : "secondary"} onClick={() => toggleCompare(workout.id)}>
                  <GitCompareArrows size={18} />
                  Compare
                </Button>
                {confirmDeleteId === workout.id ? (
                  <>
                    <span className="text-sm font-semibold text-ember">Delete this workout?</span>
                    <Button
                      variant="danger"
                      onClick={() => deleteWorkout(workout.id)}
                      disabled={deletingId === workout.id}
                    >
                      {deletingId === workout.id ? "Deleting…" : "Yes, delete"}
                    </Button>
                    <Button variant="secondary" onClick={() => setConfirmDeleteId(null)}>
                      Cancel
                    </Button>
                  </>
                ) : (
                  <Button variant="danger" onClick={() => setConfirmDeleteId(workout.id)}>
                    <Trash2 size={18} />
                    Delete
                  </Button>
                )}
              </div>
            </div>

            {/* Mobile: stacked rows grouped by exercise */}
            <div className="mt-4 space-y-3 md:hidden">
              {Object.entries(
                workout.workout_sets.reduce<Record<string, typeof workout.workout_sets>>((acc, set) => {
                  const name = set.exercises?.name ?? "Exercise";
                  (acc[name] ??= []).push(set);
                  return acc;
                }, {}),
              ).map(([name, sets]) => (
                <div key={name}>
                  <p className="mb-1.5 text-xs font-bold uppercase tracking-[0.14em] text-acid">{name}</p>
                  <div className="space-y-1.5">
                    {sets.map((set) => (
                      <div key={set.id} className="flex items-center justify-between rounded-lg bg-white/[0.04] px-3 py-2">
                        <span className="text-xs font-semibold text-steel">Set {set.set_index}</span>
                        <span className="text-sm font-black text-cream">{set.weight} kg × {set.reps}</span>
                        {set.notes ? <span className="max-w-[100px] truncate text-xs text-steel">{set.notes}</span> : null}
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>

            {/* Desktop: full table */}
            <div className="mt-5 hidden overflow-x-auto md:block">
              <table className="w-full text-sm">
                <thead className="text-left text-xs uppercase tracking-[0.16em] text-steel">
                  <tr>
                    <th className="py-2">Exercise</th>
                    <th className="py-2">Set</th>
                    <th className="py-2">Weight</th>
                    <th className="py-2">Reps</th>
                    <th className="py-2">Notes</th>
                  </tr>
                </thead>
                <tbody>
                  {workout.workout_sets.map((set) => (
                    <tr key={set.id} className="border-t border-line">
                      <td className="py-3 font-semibold text-cream">{set.exercises?.name ?? "Exercise"}</td>
                      <td className="py-3 text-steel">{set.set_index}</td>
                      <td className="py-3 text-cream">{set.weight} kg</td>
                      <td className="py-3 text-cream">{set.reps}</td>
                      <td className="py-3 text-steel">{set.notes}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
