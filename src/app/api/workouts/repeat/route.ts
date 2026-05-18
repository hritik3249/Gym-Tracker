import { NextResponse, type NextRequest } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import type { ExerciseCategory, WorkoutSet, WorkoutWithSets } from "@/types/domain";

export async function POST(request: NextRequest) {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await request.json().catch(() => ({}));
  const category = body.category as ExerciseCategory | undefined;

  let query = supabase
    .from("workouts")
    .select("*, workout_sets(*)")
    .eq("user_id", user.id)
    .eq("status", "completed")
    .order("performed_at", { ascending: false })
    .limit(1);

  if (category) query = query.eq("category", category);

  const { data: previous, error: previousError } = await query.maybeSingle();
  if (previousError) return NextResponse.json({ error: previousError.message }, { status: 500 });
  const previousWorkout = previous as unknown as WorkoutWithSets | null;
  if (!previousWorkout) return NextResponse.json({ error: "No previous workout found" }, { status: 404 });

  const { data: workout, error: workoutError } = await supabase
    .from("workouts")
    .insert({
      user_id: user.id,
      category: previousWorkout.category,
      performed_at: new Date().toISOString(),
      duration_seconds: 0,
      notes: previousWorkout.notes,
      status: "draft",
    })
    .select("*")
    .single();

  if (workoutError) return NextResponse.json({ error: workoutError.message }, { status: 400 });

  const sets = previousWorkout.workout_sets ?? [];
  if (sets.length > 0) {
    const { error: setsError } = await supabase.from("workout_sets").insert(
      sets.map((set: WorkoutSet) => ({
        user_id: user.id,
        workout_id: workout.id,
        exercise_id: set.exercise_id,
        set_index: set.set_index,
        reps: set.reps,
        weight: set.weight,
        notes: set.notes,
        completed: false,
      })),
    );
    if (setsError) return NextResponse.json({ error: setsError.message }, { status: 400 });
  }

  const { data, error } = await supabase
    .from("workouts")
    .select("*, workout_sets(*, exercises(id, name, category, target_muscle))")
    .eq("id", workout.id)
    .eq("user_id", user.id)
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ workout: data }, { status: 201 });
}
