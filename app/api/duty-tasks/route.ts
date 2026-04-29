import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

export async function GET() {
  const today = new Date().toISOString().split("T")[0];

  const { data, error } = await supabase
    .from("duty_tasks")
    .select("task_id, completed_by_name")
    .eq("date", today);

  if (error) return NextResponse.json({ ok: false, message: error.message }, { status: 500 });

  return NextResponse.json({ ok: true, data });
}

export async function POST(req: Request) {
  const body = await req.json();
  const { task_id, completed_by_name } = body;

  if (!task_id || !completed_by_name) {
    return NextResponse.json({ ok: false, message: "Eksik alan." }, { status: 400 });
  }

  const today = new Date().toISOString().split("T")[0];

  // Aynı görev bugün zaten tamamlanmış mı?
  const { data: existing } = await supabase
    .from("duty_tasks")
    .select("id")
    .eq("task_id", task_id)
    .eq("date", today)
    .single();

  if (existing) {
    return NextResponse.json({ ok: false, message: "Bu görev zaten tamamlandı." }, { status: 409 });
  }

  const { error } = await supabase
    .from("duty_tasks")
    .insert({ task_id, completed_by_name, date: today });

  if (error) return NextResponse.json({ ok: false, message: error.message }, { status: 500 });

  return NextResponse.json({ ok: true });
}