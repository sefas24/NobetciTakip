import { NextResponse } from "next/server";

export async function POST() {
  const isProduction = process.env.VERCEL_ENV === "production" || process.env.NODE_ENV === "production";
  
  const res = NextResponse.json({ ok: true });
  res.cookies.set("nt_session", "", { 
    httpOnly: true,
    secure: isProduction, 
    sameSite: "lax",
    path: "/", 
    maxAge: 0 
  });
  res.cookies.set("nt_role", "", { 
    httpOnly: true,
    secure: isProduction, 
    sameSite: "lax",
    path: "/", 
    maxAge: 0 
  });
  res.cookies.set("nt_email", "", { 
    httpOnly: true,
    secure: isProduction, 
    sameSite: "lax",
    path: "/", 
    maxAge: 0 
  });
  return res;
}

