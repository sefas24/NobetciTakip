import { supabase } from "./supabase";

export type UserRole = "admin" | "student";

export async function validateLogin(input: {
  role: UserRole;
  email: string;
  password: string;
}): Promise<{ ok: true; email: string; role: UserRole; needsPasswordChange?: boolean } | { ok: false; message: string }> {
  const email = input.email.trim().toLowerCase();
  const password = input.password;

  if (!email || !password) {
    return { ok: false, message: "E-posta ve şifre zorunludur." };
  }

  // Supabase'den kullanıcı sorgula
  const { data: user } = await supabase
    .from("users")
    .select("*")
    .eq("email", email)
    .maybeSingle();

  if (input.role === "admin") {
    // Admin yetkisi kontrolü
    if (!user || user.role !== "admin" || user.password !== password) {
      return { ok: false, message: "Yönetici e-posta veya şifresi hatalı." };
    }
    return { ok: true, email, role: "admin", needsPasswordChange: false };
  } else {
    // Öğrenci Formati: öğrencinumarası@okul.edu.tr vb.
    const [prefix] = email.split("@");

    if (user) {
      // Daha önceden şifresini belirleyip DB'ye kaydedilmiş öğrenci
      if (user.password !== password) {
        return { ok: false, message: "Öğrenci numarası (şifre) veya e-posta hatalı." };
      }
      return { ok: true, email, role: "student", needsPasswordChange: false };
    } else {
      // Veritabanında yoksa, daha şifresini belirlememiş ilk giriş yapan öğrencidir.
      if (password === prefix) {
        return { ok: true, email, role: "student", needsPasswordChange: true };
      } else {
        return { ok: false, message: "Öğrenci numarası (şifre) veya e-posta hatalı." };
      }
    }
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
    // Varsa güncelle
    await supabase.from("users").update({ password: newPassword }).eq("email", normalizedEmail);
  } else {
    // Yoksa (ilk defa belirliyorsa) ekle
    await supabase.from("users").insert({
      email: normalizedEmail,
      password: newPassword,
      role: "student"
    });
  }
}

// Demo Modu İçin: Bütün öğrenci hesaplarını sıfırlayan metod.
export async function clearDemoPasswords() {
  await supabase.from("users").delete().eq("role", "student");
}

