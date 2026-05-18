import { buildDashboardAnalytics, buildProgressPoints } from "@/lib/analytics";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import type { Exercise, WorkoutWithSets } from "@/types/domain";

export async function getDashboardData(userId: string) {
  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase
    .from("workouts")
    .select("*, workout_sets(*, exercises(id, name, category, target_muscle))")
    .eq("user_id", userId)
    .order("performed_at", { ascending: false })
    .limit(60);

  if (error) throw new Error(error.message);
  return buildDashboardAnalytics((data ?? []) as unknown as WorkoutWithSets[]);
}

export async function getExercises(userId: string) {
  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase
    .from("exercises")
    .select("*")
    .eq("user_id", userId)
    .is("archived_at", null)
    .order("category")
    .order("name");

  if (error) throw new Error(error.message);
  return (data ?? []) as Exercise[];
}

export async function getWorkouts(userId: string, limit = 80) {
  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase
    .from("workouts")
    .select("*, workout_sets(*, exercises(id, name, category, target_muscle))")
    .eq("user_id", userId)
    .order("performed_at", { ascending: false })
    .limit(limit);

  if (error) throw new Error(error.message);
  return (data ?? []) as unknown as WorkoutWithSets[];
}

export async function getWorkoutBootstrap(userId: string) {
  const [exercises, workouts] = await Promise.all([getExercises(userId), getWorkouts(userId, 1)]);

  return {
    exercises,
    previousWorkout: workouts[0] ?? null,
  };
}

export async function getProgressAnalytics(userId: string) {
  const supabase = await createSupabaseServerClient();
  const [workoutsResult, prsResult] = await Promise.all([
    supabase
      .from("workouts")
      .select("*, workout_sets(*, exercises(id, name, category, target_muscle))")
      .eq("user_id", userId)
      .order("performed_at", { ascending: false })
      .limit(120),
    supabase.from("exercise_personal_records").select("*").eq("user_id", userId).order("max_weight", { ascending: false }),
  ]);

  if (workoutsResult.error) throw new Error(workoutsResult.error.message);
  if (prsResult.error) throw new Error(prsResult.error.message);

  const workouts = (workoutsResult.data ?? []) as unknown as WorkoutWithSets[];
  const sets = workouts.flatMap((workout) => workout.workout_sets ?? []);
  const byExercise = new Map<string, typeof sets>();

  for (const set of sets) {
    const name = set.exercises?.name ?? "Exercise";
    byExercise.set(name, [...(byExercise.get(name) ?? []), set]);
  }

  return {
    progress: [...byExercise.entries()].map(([exercise, exerciseSets]) => ({
      exercise,
      points: buildProgressPoints(exerciseSets),
    })),
    personalRecords: prsResult.data ?? [],
  };
}
