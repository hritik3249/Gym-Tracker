import { NextResponse, type NextRequest } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import type { ExerciseCategory, WorkoutWithSets } from "@/types/domain";

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
    .select("*, workout_sets(*, exercises(id, name, category, target_muscle))")
    .eq("user_id", user.id)
    .eq("status", "completed")
    .order("performed_at", { ascending: false })
    .limit(1);

  if (category) query = query.eq("category", category);

  const { data: previous, error: previousError } = await query.maybeSingle();
  if (previousError) return NextResponse.json({ error: previousError.message }, { status: 500 });
  const previousWorkout = previous as unknown as WorkoutWithSets | null;
  if (!previousWorkout) return NextResponse.json({ error: "No previous workout found" }, { status: 404 });

  return NextResponse.json({
    workout: {
      ...previousWorkout,
      id: "",
      performed_at: new Date().toISOString(),
      duration_seconds: 0,
      status: "draft",
      workout_sets: (previousWorkout.workout_sets ?? []).map((set) => ({
        ...set,
        id: `${set.id}-repeat`,
        workout_id: "",
        completed: false,
      })),
    },
  });
}
