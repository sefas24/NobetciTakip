import { NextResponse } from "next/server";
import { approvePreference } from "@/lib/mesaiStore";

export async function POST(req: Request) {
  const body = (await req.json()) as {
    id?: string;
    isDuty?: boolean;
  };

  if (!body.id) {
    return NextResponse.json(
      { ok: false, message: "Geçersiz istek." },
      { status: 400 }
    );
  }

  const updated = approvePreference(body.id, Boolean(body.isDuty));
  if (!updated) {
    return NextResponse.json(
      { ok: false, message: "Kayıt bulunamadı." },
      { status: 404 }
    );
  }

  return NextResponse.json({ ok: true, item: updated });
}

