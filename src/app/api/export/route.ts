import { NextResponse, type NextRequest } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import type { WorkoutWithSets } from "@/types/domain";

function csvEscape(value: unknown) {
  const text = String(value ?? "");
  return `"${text.replaceAll('"', '""')}"`;
}

export async function GET(request: NextRequest) {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { data, error } = await supabase
    .from("workouts")
    .select("*, workout_sets(*, exercises(id, name, category, target_muscle))")
    .eq("user_id", user.id)
    .order("performed_at", { ascending: false });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  if (request.nextUrl.searchParams.get("format") === "csv") {
    const workouts = (data ?? []) as unknown as WorkoutWithSets[];
    const rows = [
      ["date", "workout_category", "exercise", "set", "reps", "weight", "volume", "notes"],
      ...workouts.flatMap((workout) =>
        (workout.workout_sets ?? []).map((set) => [
          workout.performed_at,
          workout.category,
          set.exercises?.name ?? "",
          set.set_index,
          set.reps,
          set.weight,
          Number(set.weight) * Number(set.reps),
          set.notes ?? "",
        ]),
      ),
    ];

    return new NextResponse(rows.map((row) => row.map(csvEscape).join(",")).join("\n"), {
      headers: {
        "content-type": "text/csv; charset=utf-8",
        "content-disposition": "attachment; filename=liftloop-workouts.csv",
      },
    });
  }

  return NextResponse.json({ workouts: data ?? [] });
}
