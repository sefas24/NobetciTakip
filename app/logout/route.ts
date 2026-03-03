import { NextResponse } from "next/server";

export async function GET(req: Request) {
  const url = new URL(req.url);
  const res = NextResponse.redirect(new URL("/login", url));
  res.cookies.set("nt_session", "", { path: "/", maxAge: 0 });
  res.cookies.set("nt_role", "", { path: "/", maxAge: 0 });
  res.cookies.set("nt_email", "", { path: "/", maxAge: 0 });
  return res;
}

