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

