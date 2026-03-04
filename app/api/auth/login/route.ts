import { NextResponse } from "next/server";
import { validateLogin, type UserRole } from "@/lib/auth";
import { cookies } from "next/headers";

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

    const isProduction = process.env.VERCEL_ENV === "production" || process.env.NODE_ENV === "production";

    // NextResponse'u oluştur
    const res = NextResponse.json({ ok: true, email: result.email, role: result.role });

    // Ortak Cookie Ayarları
    const cookieOptions = {
      httpOnly: true,
      secure: isProduction,
      sameSite: "lax" as const,
      path: "/",
      maxAge: 60 * 60 * 24 * 30, // 30 gün
    };

    // Vercel Edge Middleware'inin Response ile dönen çerezleri anında yakalayabilmesi 
    // ve set-cookie header arızasını önlemek için doğrudan res objesine ekliyoruz.
    res.cookies.set("nt_session", "1", cookieOptions);
    res.cookies.set("nt_role", result.role, cookieOptions);
    res.cookies.set("nt_email", result.email, cookieOptions);

    return res;
  } catch {
    return NextResponse.json(
      { ok: false, message: "Giriş sırasında hata oluştu." },
      { status: 400 }
    );
  }
}

