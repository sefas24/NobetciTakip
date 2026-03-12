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
    const email = body.email || (role === "admin" ? "admin@test.com" : "student@test.com");
    const password = body.password ?? "";

    // Lokal test için geçici bypass işlemi
    const isLocalTest = true;
    let result: { ok: boolean, email: string, role: UserRole, needsPasswordChange?: boolean, message?: string };

    if (isLocalTest) {
      result = { ok: true, email, role: role as UserRole, needsPasswordChange: false };
    } else {
      const authResult = await validateLogin({ role, email, password });
      if (!authResult.ok) {
        return NextResponse.json({ ok: false, message: authResult.message }, { status: 401 });
      }
      result = authResult as any;
    }

    const cookieStore = await cookies();

    // Cookie ayarlarında gereksiz zorlamaları kaldırdık ama güvenliği node ortamına göre ayarlıyoruz
    const cookieOptions = {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax" as const,
      path: "/",
      maxAge: 60 * 60 * 24 * 30, // 30 gün
    };

    cookieStore.set("nt_session", "1", cookieOptions);
    cookieStore.set("nt_role", result.role, cookieOptions);
    cookieStore.set("nt_email", result.email, cookieOptions);

    return NextResponse.json({
      ok: true,
      email: result.email,
      role: result.role,
      needsPasswordChange: result.needsPasswordChange
    });
  } catch {
    return NextResponse.json(
      { ok: false, message: "Giriş sırasında hata oluştu." },
      { status: 400 }
    );
  }
}

