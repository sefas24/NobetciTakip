import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { supabase } from "@/lib/supabase";
import type { DbMesaiPreference } from "@/types";

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
    const filePath = `${fileName}`;

    const { error: uploadError } = await supabase.storage
      .from("rapor_fotograflari")
      .upload(filePath, buffer, {
        contentType: file.type,
        upsert: false,
      });

    if (uploadError) {
      console.error("Storage Yükleme Hatası:", uploadError);
      return NextResponse.json(
        {
          ok: false,
          message: "Fotoğraf Storage alanına yüklenemedi.",
          details: JSON.stringify(uploadError),
        },
        { status: 500 }
      );
    }

    const {
      data: { publicUrl },
    } = supabase.storage.from("rapor_fotograflari").getPublicUrl(filePath);

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
      return NextResponse.json({
        ok: true,
        message: "Dosya yüklendi fakat nöbet kaydınız bulunamadığı için veritabanına bağlanamadı. Lütfen yöneticinizle iletişime geçin.",
        url: publicUrl,
      });
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
    if (newNote !== null) {
      updatePayload.note = newNote;
    }

    const { error: dbUpdateError } = await supabase
      .from("mesai_preferences")
      .update(updatePayload)
      .eq("id", latestPref.id);

    if (dbUpdateError) {
      console.error("DB Güncelleme Hatası:", dbUpdateError);
      return NextResponse.json(
        {
          ok: false,
          message: "Dosya yüklendi fakat veritabanına kaydedilemedi.",
          details: dbUpdateError.message,
          url: publicUrl,
        },
        { status: 500 }
      );
    }

    return NextResponse.json({
      ok: true,
      message: "Başarılı",
      url: publicUrl,
    });
  } catch (error: unknown) {
    const errorMsg =
      error instanceof Error
        ? error.message
        : JSON.stringify(error, Object.getOwnPropertyNames(error as object));
    console.error("Sunucu Hatası (Upload):", errorMsg);

    return NextResponse.json(
      {
        ok: false,
        message: "Fotoğraf yüklerken beklenmeyen bir hata oluştu.",
        details: errorMsg,
      },
      { status: 500 }
    );
  }
}