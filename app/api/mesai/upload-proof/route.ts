import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { supabase } from "@/lib/supabase";

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

    if (!file) {
      return NextResponse.json(
        { ok: false, message: "Dosya bulunamadı." },
        { status: 400 }
      );
    }

    // Convert file to array buffer for Supabase Storage
    const buffer = await file.arrayBuffer();

    // Benzersiz bir dosya adı oluşturalım
    const fileExt = file.name.split(".").pop();
    const safeEmail = email.replace(/[^a-zA-Z0-9]/g, "_");
    const fileName = `${safeEmail}-${Date.now()}.${fileExt}`;
    const filePath = `${fileName}`;

    // Supabase Storage'a yükle ('rapor_fotograflari' bucket'ına)
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
          message: "Fotoğraf Storage alanına yüklenemedi. ('rapor_fotograflari' bucket'ı bulunamadı veya yetki yok)",
          details: JSON.stringify(uploadError),
        },
        { status: 500 }
      );
    }

    // Yüklenen dosyanın public URL'ini al
    const {
      data: { publicUrl },
    } = supabase.storage.from("rapor_fotograflari").getPublicUrl(filePath);

    // KULLANICININ ONAYLANMIŞ SON MESAİSİNE BU URL'Yİ İŞLE
    // Not: "En son onaylanan" kaydı bulup ona attach edelim.
    const { data: latestApprovedPref, error: fetchError } = await supabase
      .from("mesai_preferences")
      .select("id")
      .eq("email", email)
      .eq("status", "approved")
      .order("created_at", { ascending: false })
      .limit(1)
      .single();

    if (fetchError || !latestApprovedPref) {
      // Sadece Storage'a yüklendi ama DB'de atılacak yer bulunamadıysa bile linki dönebiliriz.
      return NextResponse.json({
        ok: true,
        message: "Dosya yüklendi ama onaylı nöbet kaydınız bulunamadığı için veritabanına bağlanamadı.",
        url: publicUrl,
      });
    }

    // Güncelleme İşlemi (image_url) sütunu
    const { error: dbUpdateError } = await supabase
      .from("mesai_preferences")
      .update({ image_url: publicUrl })
      .eq("id", latestApprovedPref.id);

    if (dbUpdateError) {
      console.error("DB URL Güncelleme Hatası:", dbUpdateError);
      return NextResponse.json(
        {
          ok: false,
          message:
            "Dosya yüklendi fakat veritabanına kaydedilemedi. (mesai_preferences tablosunda image_url sütunu oluşturulmuş mu?)",
          details: dbUpdateError.message,
        },
        { status: 500 }
      );
    }

    return NextResponse.json({
      ok: true,
      message: "Başarılı",
      url: publicUrl,
    });
  } catch (error: any) {
    const errorMsg =
      error instanceof Error
        ? error.message
        : JSON.stringify(error, Object.getOwnPropertyNames(error));
    console.error("Sunucu Hatası (Upload):", errorMsg);

    return NextResponse.json(
      { ok: false, message: "Fotoğraf yüklerken beklenmeyen bir hata oluştu.", details: errorMsg },
      { status: 500 }
    );
  }
}
