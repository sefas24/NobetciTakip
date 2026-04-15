"use client";

import { useState } from "react";

export default function SetPasswordPage() {
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const strength =
    newPassword.length === 0 ? 0
    : newPassword.length < 4 ? 1
    : newPassword.length < 8 ? 2
    : newPassword.length < 12 ? 3
    : 4;

  const strengthColors = ["", "bg-red-400", "bg-amber-400", "bg-teal-400", "bg-teal-600"];
  const strengthLabels = ["", "Zayıf", "Orta", "İyi", "Güçlü"];

  const handleSetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (newPassword !== confirmPassword) {
      setError("Şifreler birbiriyle eşleşmiyor.");
      return;
    }
    if (newPassword.length < 4) {
      setError("Şifreniz en az 4 karakter uzunluğunda olmalıdır.");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/auth/set-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ newPassword }),
      });
      const data = await res.json();
      if (!res.ok || !data.ok) {
        setError(data.message || "Şifre güncellenemedi.");
        setLoading(false);
        return;
      }
      window.location.href = "/";
    } catch {
      setError("Şifre belirlenirken bir hata oluştu.");
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
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
            </svg>
          </div>
          <h1 className="text-2xl font-black text-slate-900">Hoş Geldin!</h1>
          <p className="text-sm text-slate-500 mt-1">Sisteme ilk girişin için güvenli bir şifre belirle.</p>
        </div>

        {/* Bilgi kutusu */}
        <div className="bg-slate-50 border border-slate-100 rounded-xl px-4 py-3 mb-6 text-xs text-slate-500 leading-relaxed">
          Bu şifreyi bir daha göremeyeceksin. Hatırlaması kolay ama tahmin edilmesi zor bir şifre seç.
        </div>

        <form onSubmit={handleSetPassword} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-500 mb-1.5 uppercase tracking-wider">
              Yeni Şifren
            </label>
            <input
              type="password"
              placeholder="En az 4 karakter"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              className="w-full px-4 py-3 border border-slate-200 rounded-xl text-slate-900 text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent transition placeholder:font-normal placeholder:text-slate-400"
              required
            />
          </div>

          {/* Güç göstergesi */}
          {newPassword.length > 0 && (
            <div className="flex items-center gap-1.5">
              {[1, 2, 3, 4].map((i) => (
                <div
                  key={i}
                  className={`h-1 flex-1 rounded-full transition-colors ${
                    i <= strength ? strengthColors[strength] : "bg-slate-100"
                  }`}
                />
              ))}
              <span className="text-[11px] text-slate-400 ml-1 w-8">
                {strengthLabels[strength]}
              </span>
            </div>
          )}

          <div>
            <label className="block text-xs font-bold text-slate-500 mb-1.5 uppercase tracking-wider">
              Şifren (Tekrar)
            </label>
            <input
              type="password"
              placeholder="Şifreni tekrar gir"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="w-full px-4 py-3 border border-slate-200 rounded-xl text-slate-900 text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent transition placeholder:font-normal placeholder:text-slate-400"
              required
            />
          </div>

          {error && (
            <p className="text-sm text-red-600 bg-red-50 border border-red-100 rounded-xl px-3 py-2.5">
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={loading}
            className={`w-full bg-teal-700 text-white font-bold py-3 px-4 rounded-xl hover:bg-teal-800 transition-all shadow-sm text-sm ${
              loading ? "opacity-70 cursor-not-allowed" : ""
            }`}
          >
            {loading ? "Kaydediliyor..." : "Şifremi Belirle ve Giriş Yap"}
          </button>
        </form>

      </div>
    </div>
  );
}