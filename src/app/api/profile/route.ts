import { NextResponse, type NextRequest } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import type { Gender } from "@/types/domain";

const genders = new Set<Gender>(["female", "male", "non_binary", "prefer_not_to_say"]);

export async function GET() {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { data, error } = await supabase.from("profiles").select("*").eq("id", user.id).single();
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.json({ profile: data });
}

export async function PATCH(request: NextRequest) {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await request.json();
  const age = body.age === "" || body.age == null ? null : Number(body.age);
  const bodyWeight = body.body_weight === "" || body.body_weight == null ? null : Number(body.body_weight);
  const gender = genders.has(body.gender) ? body.gender : null;

  const { data, error } = await supabase
    .from("profiles")
    .update({
      display_name: String(body.display_name ?? "").trim() || null,
      age: Number.isFinite(age) ? age : null,
      body_weight: Number.isFinite(bodyWeight) ? bodyWeight : null,
      gender,
    })
    .eq("id", user.id)
    .select("*")
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 400 });
  return NextResponse.json({ profile: data });
}
