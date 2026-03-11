"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

type Role = "student" | "admin";

export default function LoginClient({ nextPath }: { nextPath?: string }) {
  const [role, setRole] = useState<Role>("student");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const title = useMemo(
    () => (role === "admin" ? "Admin Girişi" : "Öğrenci Girişi"),
    [role]
  );

  const subtitle = useMemo(
    () =>
      role === "admin"
        ? "Yönetim paneline sadece yetkililer girebilir"
        : "Okul mailiniz ve şifreniz (İlk kez girecekseniz öğrenci numaranız) ile giriş yapın",
    [role]
  );

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ role, email, password }),
      });

      const data = (await res.json()) as { ok: boolean; message?: string; needsPasswordChange?: boolean };
      if (!res.ok || !data.ok) {
        setError(data.message || "Giriş başarısız.");
        setLoading(false);
        return;
      }

      let target =
        nextPath && nextPath.startsWith("/") && !nextPath.startsWith("//")
          ? nextPath
          : "/";

      // Eğer öğrencinin şifre belirlemesi gerekiyorsa (ilk kez girdiyse)
      if (data.needsPasswordChange) {
        target = "/sifre-belirle";
      }

      window.location.href = target;
    } catch {
      setError("Giriş sırasında hata oluştu.");
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 p-4">
      <div className="bg-white p-8 rounded-2xl shadow-lg w-full max-w-md">
        <div className="flex gap-2 mb-6">
          <button
            type="button"
            onClick={() => setRole("student")}
            className={`flex-1 py-2 rounded-lg text-sm font-semibold border transition ${role === "student"
              ? "bg-blue-600 text-white border-blue-600"
              : "bg-white text-gray-700 border-gray-200 hover:border-blue-400"
              }`}
          >
            Normal Giriş
          </button>
          <button
            type="button"
            onClick={() => setRole("admin")}
            className={`flex-1 py-2 rounded-lg text-sm font-semibold border transition ${role === "admin"
              ? "bg-gray-900 text-white border-gray-900"
              : "bg-white text-gray-700 border-gray-200 hover:border-gray-400"
              }`}
          >
            Admin Girişi
          </button>
        </div>

        <div className="text-center mb-6">
          <h1 className="text-3xl font-extrabold text-gray-900">{title}</h1>
          <p className="text-gray-500 mt-2 text-sm">{subtitle}</p>
        </div>

        <form onSubmit={handleLogin} className="space-y-5">
          <div>
            <label className="block text-sm font-bold text-gray-900 mb-1">
              E-posta
            </label>
            <input
              type="email"
              placeholder={
                role === "admin" ? "admin@okul.edu.tr" : "ogrencinumarasi@okul.edu.tr"
              }
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg text-gray-900 font-semibold focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">
              Şifre
            </label>
            <input
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg text-gray-900 font-semibold focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
              required
            />
          </div>

          {error && (
            <p className="text-sm text-red-600 bg-red-50 border border-red-100 rounded-md px-3 py-2">
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={loading}
            className={`w-full bg-blue-600 text-white font-bold py-3 px-4 rounded-lg hover:bg-blue-700 transition-colors shadow-md mt-4 ${loading ? "opacity-70 cursor-not-allowed" : ""
              }`}
          >
            {loading ? "Giriş yapılıyor..." : "Giriş Yap"}
          </button>
        </form>

        {/* Ana Sayfaya Dönüş Linki */}
        <div className="mt-6 text-center">
          <Link href="/" className="text-sm text-blue-600 hover:text-blue-800 font-medium transition">
            &larr; Kameraya (Ana Sayfaya) Dön
          </Link>
        </div>

        {/* DEMO / TEST AMAÇLI SIFIRLAMA BUTONU */}
        <div className="mt-8 border-t pt-4 text-center">
          <button
            onClick={async () => {
              if (confirm("Demo Modu: Tüm öğrencilerin yeni belirlediği şifreleri silecek ve herkesi tekrar ilk giriş haline döndüreceksiniz. Emin misiniz?")) {
                await fetch('/api/auth/reset-demo', { method: 'POST' });
                alert("Bütün şifreler sıfırlandı! Artık herhangi bir öğrenciyle tekrar '@ öncesi' şifresiyle ilk defa giriyormuş gibi giriş yapabilirsiniz.");
              }
            }}
            type="button"
            className="text-xs text-red-500 hover:text-red-700 underline"
          >
            [Demo Modu] Tüm Şifreleri Sıfırla
          </button>
        </div>

      </div>
    </div>
  );
}

