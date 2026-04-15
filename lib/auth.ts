// =============================================================================
// lib/auth.ts
//
// Kullanıcı kimlik doğrulama işlemleri.
// UserRole ve LoginResult tipleri artık types/index.ts'ten geliyor.
// =============================================================================

import { supabase } from "./supabase";
import type { DbUser, LoginResult, UserRole } from "@/types";

export async function validateLogin(input: {
  role: UserRole;
  email: string;
  password: string;
}): Promise<LoginResult> {
  const rawInput = input.email.trim();
  const queryEmail = input.role === "admin"
  ? rawInput.toLowerCase()
  : rawInput.includes("@") ? rawInput.split("@")[0] : rawInput;
  const { password } = input;

  if (!queryEmail || !password) {
    return { ok: false, message: "E-posta ve şifre zorunludur." };
  }

  const { data: user } = await supabase
    .from("users")
    .select("*")
    .eq("email", queryEmail)
    .maybeSingle() as { data: DbUser | null };

  if (input.role === "admin") {
    if (!user || user.role !== "admin" || user.password !== password) {
      return { ok: false, message: "Yönetici e-posta veya şifresi hatalı." };
    }
    return {
      ok: true,
      email: queryEmail,
      role: "admin",
      fullName: user.isim_soyisim ?? undefined,
      needsPasswordChange: false,
    };
  }

  // Öğrenci
  if (!user) {
    return { ok: false, message: "Kullanıcı bulunamadı. Lütfen yöneticinizle iletişime geçin." };
  }
  if (user.password !== password) {
    return { ok: false, message: "E-posta veya şifre hatalı." };
  }

  return {
    ok: true,
    email: queryEmail,
    role: "student",
    fullName: user.isim_soyisim ?? undefined,
    needsPasswordChange: !user.is_password_changed,
  };
}

export async function updateStudentPassword(email: string, newPassword: string): Promise<void> {
  const normalizedEmail = email.toLowerCase();

  const { data: user } = await supabase
    .from("users")
    .select("id")
    .eq("email", normalizedEmail)
    .maybeSingle() as { data: Pick<DbUser, "id"> | null };

  if (user) {
    await supabase
      .from("users")
      .update({ password: newPassword, is_password_changed: true })
      .eq("email", normalizedEmail);
  } else {
    // Ekstrem durum: admin kullanıcıyı önceden eklemiş olmalıydı
    await supabase.from("users").insert({
      email: normalizedEmail,
      password: newPassword,
      role: "student",
      is_password_changed: true,
    });
  }
}

// Demo/test ortamı için — production'da bu endpoint kaldırılmalıdır
export async function clearDemoPasswords(): Promise<void> {
  await supabase.from("users").delete().eq("role", "student");
}