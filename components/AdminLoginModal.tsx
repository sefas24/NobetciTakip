"use client";

import { useState, useEffect, useRef } from "react";

interface AdminLoginModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function AdminLoginModal({ isOpen, onClose }: AdminLoginModalProps) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const emailRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen) {
      setError(null);
      setEmail("");
      setPassword("");
      setTimeout(() => emailRef.current?.focus(), 50);
    }
  }, [isOpen]);

  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    if (isOpen) window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ role: "admin", email, password }),
      });
      const data = (await res.json()) as { ok: boolean; message?: string };
      if (!res.ok || !data.ok) {
        setError(data.message ?? "Giriş başarısız.");
        return;
      }
      onClose();
      window.location.href = "/admin";
    } catch {
      setError("Sunucu hatası.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-slate-900/50 backdrop-blur-sm px-4 pb-4 sm:pb-0"
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div className="w-full max-w-sm rounded-2xl bg-white shadow-2xl overflow-hidden">
        <div className="px-5 pt-5 pb-4 border-b border-gray-100 flex items-start justify-between">
          <div>
            <h2 className="text-base font-bold text-gray-900">Admin Girişi</h2>
            <p className="text-xs text-gray-500 mt-0.5">Mevcut öğrenci oturumunuz kapatılacak</p>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 p-1 rounded-lg hover:bg-gray-100">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        <form onSubmit={handleSubmit} className="px-5 py-4 space-y-4">
          <div className="space-y-1">
            <label className="text-xs font-semibold text-gray-700" htmlFor="admin-modal-email">Admin E-posta</label>
            <input
              id="admin-modal-email"
              ref={emailRef}
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              placeholder="admin@okul.edu.tr"
              className="w-full px-3 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-slate-800 focus:border-transparent transition"
            />
          </div>
          <div className="space-y-1">
            <label className="text-xs font-semibold text-gray-700" htmlFor="admin-modal-password">Şifre</label>
            <input
              id="admin-modal-password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              placeholder="••••••••"
              className="w-full px-3 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-slate-800 focus:border-transparent transition"
            />
          </div>
          {error && (
            <p className="text-xs text-red-600 bg-red-50 border border-red-100 px-3 py-2 rounded-xl">{error}</p>
          )}
          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 rounded-xl bg-slate-900 hover:bg-slate-700 disabled:opacity-60 disabled:cursor-not-allowed text-white text-sm font-bold transition-colors"
          >
            {loading ? "Giriş yapılıyor…" : "Admin Olarak Giriş Yap"}
          </button>
        </form>
      </div>
    </div>
  );
}
