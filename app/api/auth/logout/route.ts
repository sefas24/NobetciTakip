import { NextResponse } from "next/server";

export async function POST() {
  const res = NextResponse.json({ ok: true });
  res.cookies.set("nt_session", "", { 
    httpOnly: true,
    secure: true, 
    sameSite: "lax",
    path: "/", 
    maxAge: 0 
  });
  res.cookies.set("nt_role", "", { 
    httpOnly: true,
    secure: true, 
    sameSite: "lax",
    path: "/", 
    maxAge: 0 
  });
  res.cookies.set("nt_email", "", { 
    httpOnly: true,
    secure: true, 
    sameSite: "strict",
    path: "/", 
    maxAge: 0 
  });
  return res;
}

