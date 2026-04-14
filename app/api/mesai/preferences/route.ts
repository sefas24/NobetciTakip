import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import {
  addPreference,
  listPreferences,
} from "@/lib/mesaiStore";
import type { MesaiSlot } from "@/types";

export async function GET() {
  const all = await listPreferences();
  return NextResponse.json({ ok: true, items: all });
}

export async function POST(req: Request) {
  const jar = await cookies();
  const email = jar.get("nt_email")?.value;

  if (!email) {
    return NextResponse.json(
      { ok: false, message: "Giriş yapmadan tercih kaydedilemez." },
      { status: 401 }
    );
  }

  const body = (await req.json()) as { slots?: MesaiSlot[], note?: string, schedule_file_url?: string };
  const slots = body.slots ?? [];

  if (!Array.isArray(slots) || slots.length === 0) {
    return NextResponse.json(
      { ok: false, message: "En az bir zaman dilimi seçmelisin." },
      { status: 400 }
    );
  }

  try {
    const prefs = await addPreference(email, slots, body.note, body.schedule_file_url);
    return NextResponse.json({ ok: true, items: prefs });
  } catch (error: any) {
    const errorMsg = error instanceof Error ? error.message : JSON.stringify(error, Object.getOwnPropertyNames(error));
    console.error("Veritabanı Kayıt Hatası (API):", errorMsg);
    
    return NextResponse.json(
      { 
        ok: false, 
        message: "Veritabanına kaydedilirken bir hata oluştu.", 
        details: errorMsg 
      },
      { status: 500 }
    );
  }
}