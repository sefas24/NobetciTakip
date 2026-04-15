"use client";

import { useMemo, useState } from "react";
import Link from "next/link";

type Role = "student" | "admin";

export default function LoginClient({ nextPath }: { nextPath?: string }) {
  const [role, setRole] = useState<Role>("student");
  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const isAdmin = role === "admin";

  const subtitle = useMemo(
    () =>
      isAdmin
        ? "Yönetim paneline sadece yetkililer girebilir."
        : "Öğrenci numaranız ve şifrenizle giriş yapın. (İlk girişte şifreniz öğrenci numaranızdır.)",
    [isAdmin]
  );

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ role, email: identifier, password }),
      });

      const data = (await res.json()) as {
        ok: boolean;
        message?: string;
        needsPasswordChange?: boolean;
      };

      if (!res.ok || !data.ok) {
        setError(data.message || "Giriş başarısız.");
        setLoading(false);
        return;
      }

      let target =
        nextPath && nextPath.startsWith("/") && !nextPath.startsWith("//")
          ? nextPath
          : "/";

      if (data.needsPasswordChange) target = "/sifre-belirle";

      window.location.href = target;
    } catch {
      setError("Giriş sırasında hata oluştu.");
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-white p-4">
      <div className="w-full max-w-sm">

        {/* Logo */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-13 h-13 rounded-2xl bg-teal-700 mb-4 p-3">
            <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
            </svg>
          </div>
          <h1 className="text-2xl font-black text-slate-900">Nöbetçi Takip</h1>
          <p className="text-sm text-slate-500 mt-1 leading-relaxed">{subtitle}</p>
        </div>

        {/* Rol Seçici */}
        <div className="flex gap-1.5 mb-6 p-1 bg-slate-100 rounded-xl">
          <button
            type="button"
            onClick={() => { setRole("student"); setIdentifier(""); setError(null); }}
            className={`flex-1 py-2 rounded-lg text-sm font-semibold transition-all ${
              !isAdmin
                ? "bg-white text-slate-900 shadow-sm"
                : "text-slate-500 hover:text-slate-700"
            }`}
          >
            Öğrenci Girişi
          </button>
          <button
            type="button"
            onClick={() => { setRole("admin"); setIdentifier(""); setError(null); }}
            className={`flex-1 py-2 rounded-lg text-sm font-semibold transition-all ${
              isAdmin
                ? "bg-white text-slate-900 shadow-sm"
                : "text-slate-500 hover:text-slate-700"
            }`}
          >
            Admin Girişi
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-500 mb-1.5 uppercase tracking-wider">
              {isAdmin ? "E-posta" : "Öğrenci Numarası"}
            </label>
            <input
              type={isAdmin ? "email" : "text"}
              inputMode={isAdmin ? "email" : "numeric"}
              placeholder={isAdmin ? "admin@okul.edu.tr" : "230316006"}
              value={identifier}
              onChange={(e) => setIdentifier(e.target.value)}
              autoComplete={isAdmin ? "email" : "username"}
              className="w-full px-4 py-3 border border-slate-200 rounded-xl text-slate-900 text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent transition placeholder:font-normal placeholder:text-slate-400"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-500 mb-1.5 uppercase tracking-wider">
              Şifre
            </label>
            <input
              type="password"
              placeholder={isAdmin ? "••••••••" : "İlk girişte öğrenci numaranız"}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoComplete="current-password"
              className="w-full px-4 py-3 border border-slate-200 rounded-xl text-slate-900 text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent transition placeholder:font-normal placeholder:text-slate-400"
            />
          </div>

          {!isAdmin && (
            <p className="text-xs text-slate-400 bg-slate-50 border border-slate-100 rounded-lg px-3 py-2">
              İlk kez giriş yapıyorsanız şifre alanına öğrenci numaranızı yazın.
            </p>
          )}

          {error && (
            <p className="text-sm text-red-600 bg-red-50 border border-red-100 rounded-xl px-3 py-2.5">
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={loading}
            className={`w-full py-3 px-4 rounded-xl font-bold text-sm transition-all shadow-sm ${
              isAdmin
                ? "bg-slate-900 text-white hover:bg-slate-700"
                : "bg-teal-700 text-white hover:bg-teal-800"
            } ${loading ? "opacity-70 cursor-not-allowed" : ""}`}
          >
            {loading ? "Giriş yapılıyor..." : "Giriş Yap"}
          </button>
        </form>

        {/* Alt */}
        <div className="mt-6 text-center">
          <Link href="/" className="text-xs text-slate-400 hover:text-slate-600 transition">
            ← Ana sayfaya dön
          </Link>
        </div>

        {/* Demo */}
        <div className="mt-6 pt-4 border-t border-slate-100 text-center">
          <button
            type="button"
            onClick={async () => {
              if (confirm("Demo Modu: Tüm öğrencilerin şifrelerini sıfırlamak istediğinize emin misiniz?")) {
                await fetch("/api/auth/reset-demo", { method: "POST" });
                alert("Tüm şifreler sıfırlandı!");
              }
            }}
            className="text-xs text-slate-300 hover:text-red-400 transition underline"
          >
            [Demo] Tüm şifreleri sıfırla
          </button>
        </div>

      </div>
    </div>
  );
}