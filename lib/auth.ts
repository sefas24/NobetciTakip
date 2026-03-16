import { supabase } from "./supabase";

export type UserRole = "admin" | "student";

export async function validateLogin(input: {
  role: UserRole;
  email: string;
  password: string;
}): Promise<{ ok: true; email: string; role: UserRole; isim_soyisim?: string; needsPasswordChange?: boolean } | { ok: false; message: string }> {
  const email = input.email.trim().toLowerCase();
  const password = input.password;

  if (!email || !password) {
    return { ok: false, message: "E-posta ve şifre zorunludur." };
  }

  // Supabase'den kullanıcı sorgula
  const { data: user } = await supabase
    .from("users")
    .select("*, is_password_changed")
    .eq("email", email)
    .maybeSingle();

  if (input.role === "admin") {
    // Admin yetkisi kontrolü
    if (!user || user.role !== "admin" || user.password !== password) {
      return { ok: false, message: "Yönetici e-posta veya şifresi hatalı." };
    }
    return { ok: true, email, role: "admin", isim_soyisim: user?.isim_soyisim, needsPasswordChange: false };
  } else {
    // Öğrenci Rolü
    if (!user) {
      return { ok: false, message: "Kullanıcı bulunamadı. Lütfen yöneticinizle iletişime geçin." };
    }

    if (user.password !== password) {
      return { ok: false, message: "E-posta veya şifre hatalı." };
    }

    // Şifre doğruysa is_password_changed alanını kontrol et
    if (!user.is_password_changed) {
      return { ok: true, email, role: "student", isim_soyisim: user.isim_soyisim, needsPasswordChange: true };
    }

    return { ok: true, email, role: "student", isim_soyisim: user.isim_soyisim, needsPasswordChange: false };
  }
}

// Şifre belirleme formundan gelen yeni şifreyi kaydedecek metod
export async function updateStudentPassword(email: string, newPassword: string) {
  const normalizedEmail = email.toLowerCase();
  const { data: user } = await supabase
    .from("users")
    .select("id")
    .eq("email", normalizedEmail)
    .maybeSingle();

  if (user) {
    // Varsa güncelle ve is_password_changed durumunu true yap
    await supabase
      .from("users")
      .update({ password: newPassword, is_password_changed: true })
      .eq("email", normalizedEmail);
  } else {
    // Ekstrem Durum: Yoksa DB'ye yeni bir ekleme yapar (aslında admin'in önceden eklemiş olması beklenir)
    await supabase.from("users").insert({
      email: normalizedEmail,
      password: newPassword,
      role: "student",
      is_password_changed: true,
    });
  }
}

// Demo Modu İçin: Bütün öğrenci hesaplarını sıfırlayan metod.
export async function clearDemoPasswords() {
  await supabase.from("users").delete().eq("role", "student");
}

