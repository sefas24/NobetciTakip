"use client";

import { useState } from "react";

interface Props {
  email: string | null;
  slots: string[];
}

export default function GunSecimiClient({ email, slots }: Props) {
  const [selected, setSelected] = useState<string[]>([]);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const toggleSlot = (slot: string) => {
    setSelected((prev) =>
      prev.includes(slot) ? prev.filter((s) => s !== slot) : [...prev, slot]
    );
  };

  const handleSave = async () => {
    setMessage(null);
    setError(null);
    if (selected.length === 0) {
      setError("Önce en az bir zaman dilimi seçmelisin.");
      return;
    }
    setSaving(true);
    try {
      const res = await fetch("/api/mesai/preferences", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ slots: selected }),
      });
      const data = (await res.json()) as { ok: boolean; message?: string };
      if (!res.ok || !data.ok) {
        setError(data.message ?? "Tercihler kaydedilemedi.");
      } else {
        setMessage(
          "Tercihlerin alındı. Admin onayladıktan sonra mesai listesinde gözükecek."
        );
      }
    } catch {
      setError("Bir hata oluştu, lütfen tekrar dene.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <main className="flex-1 px-6 py-6 space-y-6">
      <section className="bg-white rounded-2xl shadow-sm p-4">
        <h2 className="text-sm font-semibold text-gray-800 mb-2">
          Giriş yapan kullanıcı
        </h2>
        <p className="text-sm text-gray-700">
          {email ? (
            <span className="font-semibold">{email}</span>
          ) : (
            <span className="text-gray-400">-</span>
          )}
        </p>
      </section>

      <section className="bg-white rounded-2xl shadow-sm p-4">
        <h2 className="text-sm font-semibold text-gray-800 mb-3">
          1. Adım: Uygun Olduğun Günleri İşaretle
        </h2>
        <div className="grid grid-cols-2 gap-2 text-sm">
          {slots.map((slot) => {
            const active = selected.includes(slot);
            return (
              <button
                key={slot}
                type="button"
                onClick={() => toggleSlot(slot)}
                className={`px-3 py-2 rounded-lg border text-gray-700 transition ${
                  active
                    ? "border-blue-500 bg-blue-50 font-semibold"
                    : "border-gray-200 bg-gray-50 hover:border-blue-400 hover:bg-blue-50"
                }`}
              >
                {slot}
              </button>
            );
          })}
        </div>
      </section>

      <section className="bg-white rounded-2xl shadow-sm p-4 space-y-3">
        <h2 className="text-sm font-semibold text-gray-800 mb-1">
          2. Adım: Kaydet
        </h2>
        <p className="text-xs text-gray-500">
          Tercihlerin önce admin ekranına düşecek, o onayladıktan sonra kesin
          mesai listesi oluşturulacak.
        </p>
        {error && (
          <p className="text-xs text-red-600 bg-red-50 border border-red-100 rounded-lg px-3 py-2">
            {error}
          </p>
        )}
        {message && (
          <p className="text-xs text-green-700 bg-green-50 border border-green-100 rounded-lg px-3 py-2">
            {message}
          </p>
        )}
        <button
          type="button"
          onClick={handleSave}
          disabled={saving}
          className={`w-full bg-blue-600 text-white text-sm font-semibold py-2.5 rounded-lg hover:bg-blue-700 transition ${
            saving ? "opacity-70 cursor-not-allowed" : ""
          }`}
        >
          {saving ? "Kaydediliyor..." : "Tercihleri Kaydet"}
        </button>
      </section>
    </main>
  );
}

