"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Check, Copy, Plus, Save, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input, Select, Textarea } from "@/components/ui/input";
import { RestTimer } from "@/components/workout/rest-timer";
import { CATEGORIES, categoryLabel, getNextCategory } from "@/lib/constants";
import { resilientFetch } from "@/lib/offline";
import type { Exercise, ExerciseCategory, WorkoutWithSets } from "@/types/domain";

type DraftSet = {
  localId: string;
  exercise_id: string;
  set_index: number;
  reps: number | "";
  weight: number | "";
  notes: string;
  completed: boolean;
};

function toDraftSets(workout?: WorkoutWithSets | null): DraftSet[] {
  return (workout?.workout_sets ?? []).map((set) => ({
    localId: set.id,
    exercise_id: set.exercise_id,
    set_index: set.set_index,
    reps: Number(set.reps),
    weight: Number(set.weight),
    notes: set.notes ?? "",
    completed: set.completed,
  }));
}

export function WorkoutLogger({
  initialExercises,
  previousWorkout,
  recentWorkouts,
}: {
  initialExercises: Exercise[];
  previousWorkout: WorkoutWithSets | null;
  recentWorkouts: WorkoutWithSets[];
}) {
  const router = useRouter();
  const [exercises] = useState<Exercise[]>(initialExercises);
  const [workoutId, setWorkoutId] = useState<string | null>(null);
  const [category, setCategory] = useState<ExerciseCategory>(getNextCategory(previousWorkout?.category));
  const [notes, setNotes] = useState("");
  const [durationSeconds, setDurationSeconds] = useState(0);
  const [sets, setSets] = useState<DraftSet[]>([]);
  const [saveState, setSaveState] = useState<"idle" | "saving" | "saved" | "offline">("idle");

  useEffect(() => {
    const interval = window.setInterval(() => setDurationSeconds((seconds) => seconds + 1), 1000);
    return () => window.clearInterval(interval);
  }, []);

  const finishWorkout = useCallback(
    async () => {
      setSaveState("saving");
      const response = await resilientFetch("/api/workouts", {
        method: "POST",
        json: {
          id: workoutId,
          category,
          notes,
          duration_seconds: durationSeconds,
          status: "completed",
          sets: sets.map((set) => ({
            ...set,
            reps: Number(set.reps || 0),
            weight: Number(set.weight || 0),
          })),
        },
      });

      const payload = await response.json();
      setWorkoutId(payload.workout.id);
      setSaveState("saved");
      localStorage.setItem("liftloop:workout-finished", new Date().toISOString());
      window.dispatchEvent(new Event("liftloop:workout-finished"));
      setWorkoutId(null);
      setSets([]);
      setNotes("");
      setCategory(getNextCategory(category));
      setDurationSeconds(0);
      router.push("/");
      router.refresh();
    },
    [category, durationSeconds, notes, router, sets, workoutId],
  );

  const filteredExercises = useMemo(() => exercises.filter((exercise) => exercise.category === category), [category, exercises]);
  const groupedSets = useMemo(() => {
    return filteredExercises.map((exercise) => ({
      exercise,
      sets: sets.filter((set) => set.exercise_id === exercise.id).sort((a, b) => a.set_index - b.set_index),
    }));
  }, [filteredExercises, sets]);
  const previousSetsByExercise = useMemo(() => {
    const map = new Map<string, WorkoutWithSets["workout_sets"]>();

    for (const workout of recentWorkouts) {
      for (const set of workout.workout_sets ?? []) {
        if (!map.has(set.exercise_id)) {
          map.set(
            set.exercise_id,
            workout.workout_sets
              .filter((candidate) => candidate.exercise_id === set.exercise_id)
              .sort((a, b) => a.set_index - b.set_index),
          );
        }
      }
    }

    return map;
  }, [recentWorkouts]);

  function addSet(exerciseId: string) {
    const exerciseSets = sets.filter((set) => set.exercise_id === exerciseId);
    setSets((current) => [
      ...current,
      {
        localId: crypto.randomUUID(),
        exercise_id: exerciseId,
        set_index: exerciseSets.length + 1,
        reps: 8,
        weight: "",
        notes: "",
        completed: false,
      },
    ]);
  }

  function updateSet(localId: string, patch: Partial<DraftSet>) {
    setSets((current) => current.map((set) => (set.localId === localId ? { ...set, ...patch } : set)));
  }

  function deleteSet(localId: string) {
    setSets((current) => current.filter((set) => set.localId !== localId));
  }

  async function repeatPrevious() {
    const response = await fetch("/api/workouts/repeat", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ category }),
    });
    const payload = await response.json();
    if (!response.ok) return;
    const workout = payload.workout as WorkoutWithSets;
    setWorkoutId(null);
    setCategory(workout.category);
    setNotes(workout.notes ?? "");
    setSets(toDraftSets(workout));
  }

  function addFirstSet() {
    if (filteredExercises[0]) addSet(filteredExercises[0].id);
  }

  return (
    <div className="grid gap-5 xl:grid-cols-[1fr_22rem]">
      <div className="space-y-5">
        <Card className="p-4">
          <div className="grid gap-3 md:grid-cols-[12rem_1fr_auto] md:items-center">
            <Select value={category} onChange={(event) => setCategory(event.target.value as ExerciseCategory)}>
              {CATEGORIES.map((item) => (
                <option key={item.value} value={item.value}>
                  {item.label}
                </option>
              ))}
            </Select>
            <Textarea placeholder="Session notes" value={notes} onChange={(event) => setNotes(event.target.value)} />
            <div className="flex flex-wrap gap-2">
              <Button variant="secondary" onClick={repeatPrevious}>
                <Copy size={18} />
                Repeat
              </Button>
              <Button onClick={() => finishWorkout().catch(() => setSaveState("offline"))} disabled={sets.length === 0 || saveState === "saving"}>
                <Check size={18} />
                Finish
              </Button>
            </div>
          </div>
        </Card>

        {filteredExercises.length === 0 && (
          <Card>
            <p className="text-sm text-steel">Add {categoryLabel(category)} exercises before logging this workout.</p>
          </Card>
        )}

        {groupedSets.map(({ exercise, sets: exerciseSets }) => (
          <Card key={exercise.id} className="p-0">
            <div className="flex flex-col gap-4 border-b border-line p-4 sm:flex-row sm:items-start sm:justify-between">
              <div className="min-w-0">
                <h2 className="font-black">{exercise.name}</h2>
                <p className="text-sm text-steel">{exercise.target_muscle ?? categoryLabel(exercise.category)}</p>
                <div className="mt-3 flex flex-wrap gap-2">
                  {(previousSetsByExercise.get(exercise.id) ?? []).length === 0 && (
                    <span className="rounded-md bg-white/[0.04] px-2 py-1 text-xs text-steel">No previous sets</span>
                  )}
                  {(previousSetsByExercise.get(exercise.id) ?? []).map((previousSet) => (
                    <span key={previousSet.id} className="rounded-md bg-white/[0.06] px-2 py-1 text-xs font-semibold text-steel">
                      Prev {previousSet.set_index}: {previousSet.weight}kg x {previousSet.reps}
                    </span>
                  ))}
                </div>
              </div>
              <Button variant="secondary" onClick={() => addSet(exercise.id)}>
                <Plus size={18} />
                Set
              </Button>
            </div>

            <div className="space-y-3 p-4 md:hidden">
              {exerciseSets.map((set) => (
                <div key={set.localId} className="rounded-lg border border-line bg-white/[0.03] p-3">
                  <div className="mb-3 flex items-center justify-between gap-3">
                    <span className="text-sm font-black">Set {set.set_index}</span>
                    <div className="flex items-center gap-3">
                      <label className="flex items-center gap-2 text-sm text-steel">
                        <input
                          type="checkbox"
                          className="h-5 w-5 accent-lime-300"
                          checked={set.completed}
                          onChange={(event) => updateSet(set.localId, { completed: event.target.checked })}
                        />
                        Done
                      </label>
                      <Button className="h-9 w-9 p-0" variant="ghost" aria-label="Delete set" onClick={() => deleteSet(set.localId)}>
                        <Trash2 size={16} />
                      </Button>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="mb-1 block text-xs font-bold uppercase tracking-[0.14em] text-steel">Weight</label>
                      <Input
                        type="number"
                        min={0}
                        inputMode="decimal"
                        value={set.weight}
                        onFocus={(event) => event.currentTarget.select()}
                        onChange={(event) =>
                          updateSet(set.localId, {
                            weight: event.target.value === "" ? "" : Number(event.target.value),
                          })
                        }
                      />
                    </div>
                    <div>
                      <label className="mb-1 block text-xs font-bold uppercase tracking-[0.14em] text-steel">Reps</label>
                      <Input
                        type="number"
                        min={0}
                        inputMode="numeric"
                        value={set.reps}
                        onFocus={(event) => event.currentTarget.select()}
                        onChange={(event) =>
                          updateSet(set.localId, {
                            reps: event.target.value === "" ? "" : Number(event.target.value),
                          })
                        }
                      />
                    </div>
                  </div>

                  <div className="mt-3">
                    <label className="mb-1 block text-xs font-bold uppercase tracking-[0.14em] text-steel">Notes</label>
                    <Input value={set.notes} onChange={(event) => updateSet(set.localId, { notes: event.target.value })} />
                  </div>
                </div>
              ))}
            </div>

            <div className="hidden overflow-x-auto md:block">
              <table className="w-full min-w-[680px] text-left text-sm">
                <thead className="text-xs uppercase tracking-[0.16em] text-steel">
                  <tr>
                    <th className="px-4 py-3">Set</th>
                    <th className="px-4 py-3">Weight</th>
                    <th className="px-4 py-3">Reps</th>
                    <th className="px-4 py-3">Notes</th>
                    <th className="px-4 py-3">Done</th>
                    <th className="px-4 py-3" />
                  </tr>
                </thead>
                <tbody>
                  {exerciseSets.map((set) => (
                    <tr key={set.localId} className="border-t border-line">
                      <td className="px-4 py-3 font-bold">{set.set_index}</td>
                      <td className="px-4 py-3">
                        <Input
                          type="number"
                          min={0}
                          inputMode="decimal"
                          value={set.weight}
                          onFocus={(event) => event.currentTarget.select()}
                          onChange={(event) =>
                            updateSet(set.localId, {
                              weight: event.target.value === "" ? "" : Number(event.target.value),
                            })
                          }
                        />
                      </td>
                      <td className="px-4 py-3">
                        <Input
                          type="number"
                          min={0}
                          inputMode="numeric"
                          value={set.reps}
                          onFocus={(event) => event.currentTarget.select()}
                          onChange={(event) =>
                            updateSet(set.localId, {
                              reps: event.target.value === "" ? "" : Number(event.target.value),
                            })
                          }
                        />
                      </td>
                      <td className="px-4 py-3">
                        <Input value={set.notes} onChange={(event) => updateSet(set.localId, { notes: event.target.value })} />
                      </td>
                      <td className="px-4 py-3">
                        <input
                          type="checkbox"
                          className="h-5 w-5 accent-lime-300"
                          checked={set.completed}
                          onChange={(event) => updateSet(set.localId, { completed: event.target.checked })}
                        />
                      </td>
                      <td className="px-4 py-3">
                        <Button className="h-9 w-9 p-0" variant="ghost" aria-label="Delete set" onClick={() => deleteSet(set.localId)}>
                          <Trash2 size={16} />
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
        ))}
      </div>

      <aside className="space-y-5">
        <RestTimer />
        <Card>
          <p className="text-xs font-bold uppercase tracking-[0.18em] text-steel">Save mode</p>
          <p className="mt-2 flex items-center gap-2 text-lg font-black">
            <Save size={18} className="text-acid" />
            {saveState === "idle" && "Local draft"}
            {saveState === "saving" && "Finishing"}
            {saveState === "saved" && "Saved"}
            {saveState === "offline" && "Queued offline"}
          </p>
          <Button className="mt-5 w-full" variant="secondary" onClick={addFirstSet} disabled={!filteredExercises[0]}>
            <Plus size={18} />
            Quick add set
          </Button>
        </Card>
      </aside>
    </div>
  );
}
