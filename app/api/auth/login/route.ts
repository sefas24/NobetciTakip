import { NextResponse } from "next/server";
import { validateLogin } from "@/lib/auth";
import type { UserRole } from "@/types";
import { cookies } from "next/headers";

export async function POST(req: Request) {
  try {
    const body = (await req.json()) as {
      role?: UserRole;
      email?: string;
      password?: string;
    };

    const role = body.role ?? "student";
    const email = body.email || (role === "admin" ? "admin@test.com" : "student@test.com");
    const password = body.password ?? "";

    const authResult = await validateLogin({ role, email, password });
    if (!authResult.ok) {
        return NextResponse.json({ ok: false, message: authResult.message }, { status: 401 });
    }

    const cookieStore = await cookies();

    const cookieOptions = {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax" as const,
      path: "/",
      maxAge: 60 * 60 * 24 * 30, // 30 gün
    };

    cookieStore.set("nt_session", "1", cookieOptions);
    cookieStore.set("nt_role", authResult.role, cookieOptions);
    cookieStore.set("nt_email", authResult.email, cookieOptions);
    
    // Ad-Soyad varsa kaydet
    if (authResult.fullName) {
       cookieStore.set("nt_isim_soyisim", authResult.fullName, cookieOptions);
    } else {
       // Yoksa veya null gelirse eski cookieyi temizle (Güvenlik için)
       cookieStore.delete("nt_isim_soyisim");
    }

    return NextResponse.json({
      ok: true,
      email: authResult.email,
      role: authResult.role,
      name: authResult.fullName,
      needsPasswordChange: authResult.needsPasswordChange
    });
  } catch {
    return NextResponse.json(
      { ok: false, message: "Giriş sırasında hata oluştu." },
      { status: 400 }
    );
  }
}

