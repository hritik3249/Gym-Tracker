import { NextResponse, type NextRequest } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { buildDashboardAnalytics, buildProgressPoints } from "@/lib/analytics";
import type { WorkoutWithSets } from "@/types/domain";

export async function GET(request: NextRequest) {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const scope = request.nextUrl.searchParams.get("scope");
  const { data: workouts, error: workoutsError } = await supabase
    .from("workouts")
    .select("*, workout_sets(*, exercises(id, name, category, target_muscle))")
    .eq("user_id", user.id)
    .order("performed_at", { ascending: false })
    .limit(scope === "dashboard" ? 60 : 120);

  if (workoutsError) return NextResponse.json({ error: workoutsError.message }, { status: 500 });

  const typedWorkouts = (workouts ?? []) as unknown as WorkoutWithSets[];
  const dashboard = buildDashboardAnalytics(typedWorkouts);

  if (scope === "dashboard") {
    return NextResponse.json(
      { dashboard },
      { headers: { "cache-control": "private, max-age=20, stale-while-revalidate=60" } },
    );
  }

  const { data: prs, error: prsError } = await supabase
    .from("exercise_personal_records")
    .select("*")
    .eq("user_id", user.id)
    .order("max_weight", { ascending: false });

  if (prsError) return NextResponse.json({ error: prsError.message }, { status: 500 });

  const sets = typedWorkouts.flatMap((workout) => workout.workout_sets ?? []);
  const byExercise = new Map<string, typeof sets>();
  for (const set of sets) {
    const name = set.exercises?.name ?? "Exercise";
    byExercise.set(name, [...(byExercise.get(name) ?? []), set]);
  }

  const progress = [...byExercise.entries()].map(([exercise, exerciseSets]) => ({
    exercise,
    points: buildProgressPoints(exerciseSets),
  }));

  return NextResponse.json({
    dashboard,
    personalRecords: prs ?? [],
    progress,
  });
}
