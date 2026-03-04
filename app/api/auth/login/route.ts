import { NextResponse } from "next/server";
import { validateLogin, type UserRole } from "@/lib/auth";

export async function POST(req: Request) {
  try {
    const body = (await req.json()) as {
      role?: UserRole;
      email?: string;
      password?: string;
    };

    const role = body.role ?? "student";
    const email = body.email ?? "";
    const password = body.password ?? "";

    const result = validateLogin({ role, email, password });
    if (!result.ok) {
      return NextResponse.json({ ok: false, message: result.message }, { status: 401 });
    }

    // Vercel production'da HTTPS, lokal'de HTTP
    const isProduction = process.env.VERCEL_ENV === "production" || process.env.NODE_ENV === "production";
    
    const res = NextResponse.json({ ok: true, email: result.email, role: result.role });

    // HttpOnly cookie: middleware ve server component'lar okuyabilir, client JS okuyamaz.
    // Basit bir "oturum var" işareti + rol + email tutuyoruz.
    res.cookies.set("nt_session", "1", {
      httpOnly: true,
      secure: isProduction,
      sameSite: "lax",
      path: "/",
      maxAge: 60 * 60 * 24 * 30,
    });
    res.cookies.set("nt_role", result.role, {
      httpOnly: true,
      secure: isProduction,
      sameSite: "lax",
      path: "/",
      maxAge: 60 * 60 * 24 * 30,
    });
    res.cookies.set("nt_email", result.email, {
      httpOnly: true,
      secure: isProduction,
      sameSite: "lax",
      path: "/",
      maxAge: 60 * 60 * 24 * 30,
    });

    return res;
  } catch {
    return NextResponse.json(
      { ok: false, message: "Giriş sırasında hata oluştu." },
      { status: 400 }
    );
  }
}

