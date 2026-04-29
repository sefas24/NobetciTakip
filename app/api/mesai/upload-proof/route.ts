import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { supabase } from "@/lib/supabase";
import type { DbMesaiPreference } from "@/types";
import {
  getCurrentRotationWeek,
  getDutyNamesForDay,
  WORK_DAYS,
  type WorkDay,
} from "@/constants/schedule";

const DAY_NAMES = ["Pazar","Pazartesi","Salı","Çarşamba","Perşembe","Cuma","Cumartesi"];

export async function POST(req: Request) {
  try {
    const jar = await cookies();
    const email = jar.get("nt_email")?.value;

    if (!email) {
      return NextResponse.json(
        { ok: false, message: "Giriş yapmadan fotoğraf yükleyemezsiniz." },
        { status: 401 }
      );
    }

    const formData = await req.formData();
    const file = formData.get("file") as File | null;
    const note = (formData.get("note") as string | null)?.trim() || null;
    // ✅ YENİ: CameraCapture'dan gelen görev listesini al
    const taskIdsRaw = formData.get("task_ids") as string | null;
    const taskIds: string[] = taskIdsRaw ? JSON.parse(taskIdsRaw) : [];

    if (!file) {
      return NextResponse.json(
        { ok: false, message: "Dosya bulunamadı." },
        { status: 400 }
      );
    }

    const buffer = await file.arrayBuffer();
    const fileExt = file.name.split(".").pop();
    const safeEmail = email.replace(/[^a-zA-Z0-9]/g, "_");
    const fileName = `${safeEmail}-${Date.now()}.${fileExt}`;

    const { error: uploadError } = await supabase.storage
      .from("rapor_fotograflari")
      .upload(fileName, buffer, { contentType: file.type, upsert: false });

    if (uploadError) {
      return NextResponse.json(
        { ok: false, message: "Fotoğraf Storage alanına yüklenemedi.", details: JSON.stringify(uploadError) },
        { status: 500 }
      );
    }

    const { data: { publicUrl } } = supabase.storage
      .from("rapor_fotograflari")
      .getPublicUrl(fileName);

    const { data: userRow } = await supabase
      .from("users")
      .select("isim_soyisim, role")
      .eq("email", email)
      .single();

    const now = new Date();
    const todayIndex = now.getDay();
    const todayName = DAY_NAMES[todayIndex];
    const isWeekday = todayIndex >= 1 && todayIndex <= 5;
    const todayWorkDay = isWeekday
      ? (WORK_DAYS.find((d) => d === todayName) as WorkDay | undefined)
      : undefined;

    const rotationWeek = getCurrentRotationWeek(now);
    const todayDutyNames: string[] = todayWorkDay
      ? getDutyNamesForDay(todayWorkDay, rotationWeek)
      : [];

    const fullName = userRow?.isim_soyisim ?? "";
    const firstName = fullName.split(" ")[0].toLowerCase();
    const isDuty = todayDutyNames.some(
      (n) => n.toLowerCase() === firstName
    );
    console.log("DEBUG:", { email, fullName, firstName, todayDutyNames, isDuty, role: userRow?.role });

    if (!isDuty) {
      // Nöbetçi değil — proof_requests tablosuna ekle, task_ids de kaydet
      await supabase.from("proof_requests").insert({
        requester_email: email,
        requester_name: fullName || email,
        image_url: publicUrl,
        note: note ?? null,
        task_ids: taskIds, // ✅ YENİ
      });

      return NextResponse.json({ ok: true, isDuty: false, message: "İstek gönderildi.", url: publicUrl });
    }

    // Nöbetçi — mesai_preferences tablosunu güncelle
    const { data: latestPref, error: fetchError } = await supabase
      .from("mesai_preferences")
      .select("id, image_url, note, status")
      .eq("email", email)
      .order("created_at", { ascending: false })
      .limit(1)
      .single() as {
        data: Pick<DbMesaiPreference, "id" | "image_url" | "note" | "status"> | null;
        error: unknown;
      };

    if (fetchError || !latestPref) {
      return NextResponse.json({ ok: true, message: "Dosya yüklendi fakat kayıt bulunamadı.", url: publicUrl });
    }

    let newImageUrl = publicUrl;
    if (latestPref.image_url) {
      newImageUrl = `${latestPref.image_url},${publicUrl}`;
    }

    let newNote = latestPref.note || null;
    if (note) {
      newNote = latestPref.note ? `${latestPref.note}\n---\n${note}` : note;
    }

    const updatePayload: Record<string, unknown> = { image_url: newImageUrl };
    if (newNote !== null) updatePayload.note = newNote;

    const { error: dbUpdateError } = await supabase
      .from("mesai_preferences")
      .update(updatePayload)
      .eq("id", latestPref.id);

    if (dbUpdateError) {
      return NextResponse.json(
        { ok: false, message: "Dosya yüklendi fakat veritabanına kaydedilemedi.", details: dbUpdateError.message, url: publicUrl },
        { status: 500 }
      );
    }

    // ✅ YENİ: Nöbetçiyse görevleri anında duty_tasks'a kaydet
    if (taskIds.length > 0) {
      const today = now.toISOString().split("T")[0];
      for (const taskId of taskIds) {
        await supabase
          .from("duty_tasks")
          .upsert(
            { task_id: taskId, completed_by_name: fullName, date: today },
            { onConflict: "task_id,date" }
          );
      }
    }

    return NextResponse.json({ ok: true, isDuty: true, message: "Başarılı", url: publicUrl });

  } catch (error: unknown) {
    const errorMsg = error instanceof Error
      ? error.message
      : JSON.stringify(error, Object.getOwnPropertyNames(error as object));
    return NextResponse.json(
      { ok: false, message: "Beklenmeyen bir hata oluştu.", details: errorMsg },
      { status: 500 }
    );
  }
}