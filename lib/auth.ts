export type UserRole = "admin" | "student";

// İkinci Madde: Admin şifreleri manuel olarak sadece buradan (veya çevre değişkeninden) belirlenir.
const ADMINS = [
  { email: "admin@okul.edu.tr", password: "admin_gizli_sifre_1" },
  { email: "mudur@okul.edu.tr", password: "mudur_gizli_sifre_2" },
];

// Birinci Madde: Öğrenci şifre değişikliklerini geçici olarak tutacak hafıza
// (Backend/DB bağlandığında bu veritabanına yazılmalı)
const STUDENT_PASSWORDS = new Map<string, string>();

export function validateLogin(input: {
  role: UserRole;
  email: string;
  password: string;
}): { ok: true; email: string; role: UserRole; needsPasswordChange?: boolean } | { ok: false; message: string } {
  const email = input.email.trim().toLowerCase();
  const password = input.password;

  if (!email || !password) {
    return { ok: false, message: "E-posta ve şifre zorunludur." };
  }

  if (input.role === "admin") {
    const match = ADMINS.some((u) => u.email.toLowerCase() === email && u.password === password);
    if (!match) {
      return { ok: false, message: "Yönetici e-posta veya şifresi hatalı." };
    }
    return { ok: true, email, role: "admin", needsPasswordChange: false };
  } else {
    // Öğrenci Formati: öğrencinumarası@okul.edu.tr vb.
    const [prefix] = email.split("@");

    // Öğrenci şifre değiştirmişse yeni şifresi, değiştirmemişse default şifresi (numarası/prefix)
    const currentPassword = STUDENT_PASSWORDS.get(email) || prefix;

    if (password !== currentPassword) {
      return { ok: false, message: "Öğrenci numarası (şifre) veya e-posta hatalı." };
    }

    // Eğer şifresi halen prefix (email'in ilk kısmı) ise, şifre belirlemesi gerekiyor demektir.
    const needsPasswordChange = (password === prefix);
    return { ok: true, email, role: "student", needsPasswordChange };
  }
}

// Şifre belirleme formundan gelen yeni şifreyi kaydedecek metod
export function updateStudentPassword(email: string, newPassword: string) {
  STUDENT_PASSWORDS.set(email.toLowerCase(), newPassword);
}

