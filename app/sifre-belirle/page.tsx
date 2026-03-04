"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function SetPasswordPage() {
    const [newPassword, setNewPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [error, setError] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);
    const router = useRouter();

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

            // Başarılıysa anasayfaya yönlendir
            window.location.href = "/";
        } catch {
            setError("Şifre belirlenirken bir hata oluştu.");
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-100 p-4">
            <div className="bg-white p-8 rounded-2xl shadow-lg w-full max-w-md">
                <div className="text-center mb-8">
                    <h1 className="text-3xl font-extrabold text-gray-900">Hoş Geldin!</h1>
                    <p className="text-gray-500 mt-2 text-sm">
                        Sisteme ilk kez giriş yaptığın için kendi güvenli şifreni belirlemelisin.
                    </p>
                </div>

                <form onSubmit={handleSetPassword} className="space-y-5">
                    <div>
                        <label className="block text-sm font-bold text-gray-900 mb-1">
                            Yeni Şifren
                        </label>
                        <input
                            type="password"
                            placeholder="En az 4 karakter"
                            value={newPassword}
                            onChange={(e) => setNewPassword(e.target.value)}
                            className="w-full px-4 py-3 border border-gray-300 rounded-lg text-gray-900 font-semibold focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                            required
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-1">
                            Yeni Şifren (Tekrar)
                        </label>
                        <input
                            type="password"
                            placeholder="Şifreni tekrar gir"
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
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
                        className={`w-full bg-green-600 text-white font-bold py-3 px-4 rounded-lg hover:bg-green-700 transition-colors shadow-md mt-4 ${loading ? "opacity-70 cursor-not-allowed" : ""
                            }`}
                    >
                        {loading ? "Kaydediliyor..." : "Şifremi Belirle"}
                    </button>
                </form>
            </div>
        </div>
    );
}
