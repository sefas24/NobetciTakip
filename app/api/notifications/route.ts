import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { supabase } from "@/lib/supabase";

export async function PATCH(req: Request) {
  const jar = await cookies();
  const email = jar.get("nt_email")?.value;

  if (!email) {
    return NextResponse.json({ ok: false, message: "Yetkisiz" }, { status: 401 });
  }

  const { id } = await req.json();

  if (!id) {
    return NextResponse.json({ ok: false, message: "Eksik parametre" }, { status: 400 });
  }

  // Sadece bu kullanıcıya ait bildirimi işaretle
  const { error } = await supabase
    .from("notifications")
    .update({ is_read: true })
    .eq("id", id)
    .eq("recipient_email", email);

  if (error) {
    return NextResponse.json({ ok: false, message: error.message }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}