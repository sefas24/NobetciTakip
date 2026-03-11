import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import {
  addPreference,
  listPreferences,
  type MesaiSlot,
} from "@/lib/mesaiStore";

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

  const body = (await req.json()) as { slots?: MesaiSlot[] };
  const slots = body.slots ?? [];

  if (!Array.isArray(slots) || slots.length === 0) {
    return NextResponse.json(
      { ok: false, message: "En az bir zaman dilimi seçmelisin." },
      { status: 400 }
    );
  }

  const prefs = await addPreference(email, slots);
  return NextResponse.json({ ok: true, items: prefs });
}

