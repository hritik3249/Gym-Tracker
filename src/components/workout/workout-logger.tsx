"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type { SummaryData } from "@/components/workout/workout-summary";
import { WorkoutSummary } from "@/components/workout/workout-summary";
import { FloatingRestTimer } from "@/components/workout/floating-rest-timer";
import { PrCelebration } from "@/components/workout/pr-celebration";
import { useRouter } from "next/navigation";
import { Check, Copy, Plus, Save, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input, Select, Textarea } from "@/components/ui/input";
import { useToast } from "@/components/ui/toast";
import { RestTimer } from "@/components/workout/rest-timer";
import { useRestTimer } from "@/hooks/use-rest-timer";
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

const DRAFT_KEY = "liftloop:workout-draft";
type DraftState = { category: ExerciseCategory; notes: string; sets: DraftSet[] };

function loadDraft(): DraftState | null {
  try {
    const raw = localStorage.getItem(DRAFT_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as DraftState;
    return parsed.sets?.length > 0 ? parsed : null;
  } catch { return null; }
}

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
  const { toast } = useToast();
  const timer = useRestTimer(90);
  const timerRef = useRef(timer);
  useEffect(() => { timerRef.current = timer; });

  const [exercises] = useState<Exercise[]>(initialExercises);
  const [workoutId, setWorkoutId] = useState<string | null>(null);

  // Restore draft if the app was closed mid-workout
  const draft = useRef<DraftState | null>(null);
  if (draft.current === null) draft.current = loadDraft();

  const [category, setCategory] = useState<ExerciseCategory>(draft.current?.category ?? getNextCategory(previousWorkout?.category));
  const [notes, setNotes] = useState(draft.current?.notes ?? "");
  const [durationSeconds, setDurationSeconds] = useState(0);
  const [sets, setSets] = useState<DraftSet[]>(draft.current?.sets ?? []);
  const [saveState, setSaveState] = useState<"idle" | "saving" | "saved" | "offline">("idle");
  const [sessionPRs, setSessionPRs] = useState<{ exercise: string; weight: number }[]>([]);
  const [summary, setSummary] = useState<SummaryData | null>(null);
  const [showPr, setShowPr] = useState<{ exercise: string; weight: number } | null>(null);
  const clearPr = useCallback(() => setShowPr(null), []);

  useEffect(() => {
    const handler = () => {
      if (!timerRef.current.running) timerRef.current.start();
    };
    window.addEventListener("liftloop:set-completed", handler);
    return () => window.removeEventListener("liftloop:set-completed", handler);
  }, []);

  const prBaseline = useMemo(() => {
    const map = new Map<string, number>();
    for (const workout of recentWorkouts) {
      for (const set of workout.workout_sets) {
        const w = Number(set.weight);
        if (w > (map.get(set.exercise_id) ?? 0)) map.set(set.exercise_id, w);
      }
    }
    return map;
  }, [recentWorkouts]);

  useEffect(() => {
    const interval = window.setInterval(() => setDurationSeconds((seconds) => seconds + 1), 1000);
    return () => window.clearInterval(interval);
  }, []);

  // Persist draft on every change so closing the app doesn't lose progress
  useEffect(() => {
    if (sets.length === 0 && !notes) {
      localStorage.removeItem(DRAFT_KEY);
    } else {
      localStorage.setItem(DRAFT_KEY, JSON.stringify({ category, notes, sets }));
    }
  }, [category, notes, sets]);

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
      const completedSets = sets.filter((s) => s.completed);
      const summaryData: SummaryData = {
        category,
        durationSeconds,
        totalSets: sets.length,
        completedSets: completedSets.length,
        volume: completedSets.reduce((t, s) => t + Number(s.weight) * Number(s.reps), 0),
        prs: sessionPRs,
      };

      localStorage.removeItem(DRAFT_KEY);
      setWorkoutId(null);
      setSets([]);
      setNotes("");
      setCategory(getNextCategory(category));
      setDurationSeconds(0);
      setSessionPRs([]);
      setSummary(summaryData);
      router.refresh();
    },
    [category, durationSeconds, notes, router, sessionPRs, sets, workoutId],
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

  const sessionBest1RM = useMemo(() => {
    const map = new Map<string, number>();
    for (const set of sets) {
      if (!set.completed) continue;
      const w = Number(set.weight || 0);
      const r = Number(set.reps || 0);
      if (w <= 0 || r <= 0) continue;
      const rm = Math.round(w * (1 + r / 30));
      if (rm > (map.get(set.exercise_id) ?? 0)) map.set(set.exercise_id, rm);
    }
    return map;
  }, [sets]);

  const getOverloadStatus = useCallback(
    (exerciseId: string) => {
      const prev = previousSetsByExercise.get(exerciseId) ?? [];
      if (prev.length === 0) return null;
      const prevBest = Math.max(...prev.map((s) => Number(s.weight)));
      const done = sets.filter((s) => s.exercise_id === exerciseId && s.completed && Number(s.weight) > 0);
      if (done.length === 0) return { type: "target" as const, weight: +(prevBest + 2.5).toFixed(1) };
      const currentBest = Math.max(...done.map((s) => Number(s.weight)));
      const diff = +(currentBest - prevBest).toFixed(1);
      if (diff > 0) return { type: "up" as const, diff };
      if (diff < 0) return { type: "down" as const, diff: Math.abs(diff) };
      return { type: "same" as const };
    },
    [previousSetsByExercise, sets],
  );

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

    if (patch.completed === true) {
      const set = sets.find((s) => s.localId === localId);
      if (set && !set.completed) {
        window.dispatchEvent(new CustomEvent("liftloop:set-completed"));

        const weight = Number(set.weight || 0);
        if (weight > 0) {
          const prevMax = prBaseline.get(set.exercise_id) ?? 0;
          if (weight > prevMax) {
            const name = exercises.find((e) => e.id === set.exercise_id)?.name ?? "exercise";
            setSessionPRs((current) => {
              const already = current.some((pr) => pr.exercise === name);
              return already ? current : [...current, { exercise: name, weight }];
            });
            setShowPr({ exercise: name, weight });
          }
        }
      }
    }
  }

  function deleteSet(localId: string) {
    setSets((current) => current.filter((set) => set.localId !== localId));
  }

  function duplicateSet(localId: string) {
    setSets((current) => {
      const src = current.find((s) => s.localId === localId);
      if (!src) return current;
      const siblings = current.filter((s) => s.exercise_id === src.exercise_id);
      const newSet: DraftSet = {
        ...src,
        localId: crypto.randomUUID(),
        set_index: siblings.length + 1,
        completed: false,
      };
      return [...current, newSet];
    });
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

  if (summary) {
    return (
      <WorkoutSummary
        data={summary}
        onDone={() => {
          setSummary(null);
          router.push("/");
        }}
      />
    );
  }

  return (
    <>
    <PrCelebration pr={showPr} onDone={clearPr} />
    <FloatingRestTimer timer={timer} />
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
                <div className="flex items-center gap-3">
                  <h2 className="font-black text-cream">{exercise.name}</h2>
                  {exerciseSets.length > 0 && (
                    <span className="rounded-full bg-acid/15 px-2 py-0.5 text-xs font-bold text-acid">
                      {exerciseSets.filter((s) => s.completed).length}/{exerciseSets.length}
                    </span>
                  )}
                </div>
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

                {/* 1RM + progressive overload nudge */}
                {(() => {
                  const rm = sessionBest1RM.get(exercise.id);
                  const nudge = getOverloadStatus(exercise.id);
                  if (!rm && !nudge) return null;
                  return (
                    <div className="mt-2 flex flex-wrap items-center gap-2">
                      {nudge?.type === "target" && (
                        <span className="rounded-md bg-white/[0.05] px-2 py-0.5 text-xs font-semibold text-steel">
                          Target {nudge.weight} kg
                        </span>
                      )}
                      {nudge?.type === "up" && (
                        <span className="rounded-md bg-mint/15 px-2 py-0.5 text-xs font-bold text-mint">
                          ↑ +{nudge.diff} kg vs last
                        </span>
                      )}
                      {nudge?.type === "same" && (
                        <span className="rounded-md bg-white/[0.05] px-2 py-0.5 text-xs font-semibold text-steel">
                          = Same as last
                        </span>
                      )}
                      {nudge?.type === "down" && (
                        <span className="rounded-md bg-ember/15 px-2 py-0.5 text-xs font-bold text-ember">
                          ↓ {nudge.diff} kg below last
                        </span>
                      )}
                      {rm && (
                        <span className="rounded-md bg-acid/10 px-2 py-0.5 text-xs font-bold text-acid">
                          Est. 1RM {rm} kg
                        </span>
                      )}
                    </div>
                  );
                })()}
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
                          className="h-5 w-5 accent-[#D3968C]"
                          checked={set.completed}
                          onChange={(event) => updateSet(set.localId, { completed: event.target.checked })}
                        />
                        Done
                      </label>
                      <Button className="h-9 w-9 p-0" variant="ghost" aria-label="Duplicate set" onClick={() => duplicateSet(set.localId)}>
                        <Copy size={16} />
                      </Button>
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
                          className="h-5 w-5 accent-[#D3968C]"
                          checked={set.completed}
                          onChange={(event) => updateSet(set.localId, { completed: event.target.checked })}
                        />
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-1">
                          <Button className="h-9 w-9 p-0" variant="ghost" aria-label="Duplicate set" onClick={() => duplicateSet(set.localId)}>
                            <Copy size={16} />
                          </Button>
                          <Button className="h-9 w-9 p-0" variant="ghost" aria-label="Delete set" onClick={() => deleteSet(set.localId)}>
                            <Trash2 size={16} />
                          </Button>
                        </div>
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
        <RestTimer timer={timer} />
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
    </>
  );
}
