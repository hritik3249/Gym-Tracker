import { NextResponse, type NextRequest } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import type { ExerciseCategory } from "@/types/domain";

type SetInput = {
  id?: string;
  exercise_id: string;
  set_index: number;
  reps: number;
  weight: number;
  notes?: string | null;
  completed?: boolean;
};

async function getUserOr401() {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  return { supabase, user };
}

export async function GET(request: NextRequest) {
  const { supabase, user } = await getUserOr401();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const category = request.nextUrl.searchParams.get("category") as ExerciseCategory | null;
  const limit = Number(request.nextUrl.searchParams.get("limit") ?? 60);

  let query = supabase
    .from("workouts")
    .select("*, workout_sets(*, exercises(id, name, category, target_muscle))")
    .eq("user_id", user.id)
    .order("performed_at", { ascending: false })
    .limit(limit);

  if (category) query = query.eq("category", category);

  const { data, error } = await query;
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.json({ workouts: data });
}

export async function POST(request: NextRequest) {
  const { supabase, user } = await getUserOr401();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await request.json();
  const workoutPayload = {
    category: body.category as ExerciseCategory,
    performed_at: body.performed_at ?? new Date().toISOString(),
    duration_seconds: Number(body.duration_seconds ?? 0),
    notes: body.notes?.trim() || null,
    status: body.status === "draft" ? "draft" as const : "completed" as const,
  };

  const workoutMutation = body.id
    ? supabase.from("workouts").update(workoutPayload).eq("id", body.id).eq("user_id", user.id).select("*").single()
    : supabase.from("workouts").insert({ ...workoutPayload, user_id: user.id }).select("*").single();

  const { data: workout, error: workoutError } = await workoutMutation;
  if (workoutError) return NextResponse.json({ error: workoutError.message }, { status: 400 });

  const sets = Array.isArray(body.sets) ? (body.sets as SetInput[]) : [];
  if (sets.length > 0) {
    const { error: deleteError } = await supabase.from("workout_sets").delete().eq("workout_id", workout.id).eq("user_id", user.id);
    if (deleteError) return NextResponse.json({ error: deleteError.message }, { status: 400 });

    const { error: insertError } = await supabase.from("workout_sets").insert(
      sets.map((set) => ({
        user_id: user.id,
        workout_id: workout.id,
        exercise_id: set.exercise_id,
        set_index: Number(set.set_index),
        reps: Number(set.reps || 0),
        weight: Number(set.weight || 0),
        notes: set.notes?.trim() || null,
        completed: set.completed ?? true,
      })),
    );

    if (insertError) return NextResponse.json({ error: insertError.message }, { status: 400 });
  }

  const { data, error } = await supabase
    .from("workouts")
    .select("*, workout_sets(*, exercises(id, name, category, target_muscle))")
    .eq("id", workout.id)
    .eq("user_id", user.id)
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ workout: data }, { status: body.id ? 200 : 201 });
}
