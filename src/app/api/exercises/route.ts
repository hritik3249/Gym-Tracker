import { NextResponse, type NextRequest } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import type { ExerciseCategory } from "@/types/domain";

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
  let query = supabase
    .from("exercises")
    .select("*")
    .eq("user_id", user.id)
    .is("archived_at", null)
    .order("category")
    .order("name");

  if (category) query = query.eq("category", category);

  const { data, error } = await query;
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.json({ exercises: data });
}

export async function POST(request: NextRequest) {
  const { supabase, user } = await getUserOr401();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await request.json();
  const { data, error } = await supabase
    .from("exercises")
    .insert({
      user_id: user.id,
      name: String(body.name ?? "").trim(),
      category: body.category,
      target_muscle: body.target_muscle?.trim() || null,
      notes: body.notes?.trim() || null,
    })
    .select("*")
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 400 });
  return NextResponse.json({ exercise: data }, { status: 201 });
}
