import { NextResponse } from "next/server";

export async function POST() {
  const res = NextResponse.json({ ok: true });
  res.cookies.set("nt_session", "", { path: "/", maxAge: 0 });
  res.cookies.set("nt_role", "", { path: "/", maxAge: 0 });
  res.cookies.set("nt_email", "", { path: "/", maxAge: 0 });
  return res;
}

