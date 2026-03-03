export type UserRole = "admin" | "student";

// Şimdilik sahte kullanıcılar (backend gelince burası DB/Supabase olur)
const ADMINS = [
  { email: "admin@okul.com", password: "1234" },
  { email: "mudur@okul.com", password: "1234" },
];

const STUDENTS = [
  { email: "ogrenci1@okul.com", password: "1234" },
  { email: "ogrenci2@okul.com", password: "1234" },
];

export function validateLogin(input: {
  role: UserRole;
  email: string;
  password: string;
}): { ok: true; email: string; role: UserRole } | { ok: false; message: string } {
  const email = input.email.trim().toLowerCase();
  const password = input.password;

  if (!email || !password) {
    return { ok: false, message: "E-posta ve şifre zorunludur." };
  }

  const list = input.role === "admin" ? ADMINS : STUDENTS;
  const match = list.some((u) => u.email.toLowerCase() === email && u.password === password);

  if (!match) {
    return { ok: false, message: "E-posta veya şifre hatalı." };
  }

  return { ok: true, email, role: input.role };
}

