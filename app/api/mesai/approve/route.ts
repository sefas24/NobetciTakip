import { NextResponse } from "next/server";
import { processPreference } from "@/lib/mesaiStore";

export async function POST(req: Request) {
  const body = (await req.json()) as {
    id?: string;
    decision?: "approved" | "rejected";
    feedback?: string;
  };

  if (!body.id || !body.decision) {
    return NextResponse.json(
      { ok: false, message: "Geçersiz istek. ID ve karar (decision) zorunludur." },
      { status: 400 }
    );
  }

  const updated = await processPreference(body.id, body.decision, body.feedback);
  if (!updated) {
    return NextResponse.json(
      { ok: false, message: "Kayıt bulunamadı veya güncellenemedi." },
      { status: 404 }
    );
  }

  return NextResponse.json({ ok: true, item: updated });
}

