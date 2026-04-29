import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { supabase } from "@/lib/supabase";

// GET — pending istekleri listele
export async function GET() {
  const jar = await cookies();
  if (jar.get("nt_role")?.value !== "admin") {
    return NextResponse.json({ ok: false, message: "Yetkisiz" }, { status: 401 });
  }

  const { data, error } = await supabase
    .from("proof_requests")
    .select("*")
    .eq("status", "pending")
    .order("created_at", { ascending: false });

  if (error) return NextResponse.json({ ok: false, message: error.message }, { status: 500 });

  return NextResponse.json({ ok: true, data });
}

// POST — admin kararı (kabul/ret)
export async function POST(req: Request) {
  const jar = await cookies();
  if (jar.get("nt_role")?.value !== "admin") {
    return NextResponse.json({ ok: false, message: "Yetkisiz" }, { status: 401 });
  }

  const body = await req.json();
  const { id, decision, assigned_to, rejection_reason } = body;

  console.log("PROOF REQUEST DECISION:", { id, decision, assigned_to, rejection_reason });

  if (!id || !decision) {
    return NextResponse.json({ ok: false, message: "Eksik parametre" }, { status: 400 });
  }

  const updatePayload: Record<string, string> = { status: decision };
  if (decision === "accepted" && assigned_to) updatePayload.assigned_to = assigned_to;
  if (decision === "rejected" && rejection_reason) updatePayload.rejection_reason = rejection_reason;

  const { error } = await supabase
    .from("proof_requests")
    .update(updatePayload)
    .eq("id", id);

  if (error) return NextResponse.json({ ok: false, message: error.message }, { status: 500 });

  if (decision === "accepted" && assigned_to) {
    // ✅ YENİ: task_ids'i de çek
    const { data: proofRow } = await supabase
      .from("proof_requests")
      .select("image_url, note, task_ids, requester_name")
      .eq("id", id)
      .single();

    if (proofRow?.image_url) {
      const { data: allUsers } = await supabase
        .from("users")
        .select("email, isim_soyisim");

      const match = allUsers?.find(
        (u) => u.isim_soyisim?.split(" ")[0].toLowerCase() === assigned_to.toLowerCase()
      );

      console.log("ASSIGNED USER MATCH:", match);

      if (match) {
        const { data: pref } = await supabase
          .from("mesai_preferences")
          .select("id, image_url, note")
          .eq("email", match.email)
          .order("created_at", { ascending: false })
          .limit(1)
          .single();

        if (pref) {
          const newImageUrl = pref.image_url
            ? `${pref.image_url},${proofRow.image_url}`
            : proofRow.image_url;

          const newNote = pref.note && proofRow.note
            ? `${pref.note}\n---\n${proofRow.note}`
            : proofRow.note ?? pref.note ?? null;

          await supabase
            .from("mesai_preferences")
            .update({ image_url: newImageUrl, ...(newNote ? { note: newNote } : {}) })
            .eq("id", pref.id);

          console.log("PREF UPDATED for:", match.email);
        } else {
          console.log("NO PREF FOUND for:", match.email);
        }
      }
    }

    // ✅ YENİ: Onay anında duty_tasks'a kaydet
    if (proofRow?.task_ids?.length) {
      const today = new Date().toISOString().split("T")[0];
      for (const taskId of proofRow.task_ids) {
        await supabase
          .from("duty_tasks")
          .upsert(
            {
              task_id: taskId,
              completed_by_name: proofRow.requester_name ?? assigned_to,
              date: today,
            },
            { onConflict: "task_id,date" }
          );
      }
      console.log("DUTY TASKS SAVED for:", proofRow.requester_name);
    }
  }

  return NextResponse.json({ ok: true });
}