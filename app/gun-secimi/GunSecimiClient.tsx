"use client";

import { useState } from "react";
import toast from "react-hot-toast";

interface Props {
  email: string | null;
  displayName?: string | null;
  slots: string[];
}

export default function GunSecimiClient({ email, displayName, slots }: Props) {
  const [selected, setSelected] = useState<string[]>([]);
  const [saving, setSaving] = useState(false);
  const [errorDetails, setErrorDetails] = useState<string | null>(null);

  const toggleSlot = (slot: string) => {
    setSelected((prev) =>
      prev.includes(slot) ? prev.filter((s) => s !== slot) : [...prev, slot]
    );
  };

  const handleSave = async () => {
    setErrorDetails(null);
    if (selected.length === 0) {
      toast.error("Önce en az bir zaman dilimi seçmelisin.");
      return;
    }
    setSaving(true);
    const loadingToast = toast.loading("Kaydediliyor...");
    
    try {
      const res = await fetch("/api/mesai/preferences", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ slots: selected }),
      });
      const data = (await res.json()) as { ok: boolean; message?: string; details?: any };
      
      if (!res.ok || !data.ok) {
        let errDesc = typeof data.details === "string" ? data.details : JSON.stringify(data.details);
        console.error("API Hatası (Client):", errDesc);
        toast.error(data.message ?? "Tercihler kaydedilemedi.", { id: loadingToast });
        setErrorDetails(errDesc);
      } else {
        toast.success("Talebiniz başarıyla oluşturuldu!", { id: loadingToast });
        setSelected([]); // Formu temizle
      }
    } catch (err) {
      const errDesc = err instanceof Error ? err.message : JSON.stringify(err);
      console.error("Fetch Hatası (Client):", errDesc);
      toast.error("Bir hata oluştu, lütfen tekrar dene.", { id: loadingToast });
      setErrorDetails(errDesc);
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
          {displayName || email ? (
            <span className="font-semibold">{displayName || email}</span>
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
        {errorDetails && (
          <p className="text-xs text-red-600 bg-red-50 border border-red-100 rounded-lg px-3 py-2">
            Detay: {errorDetails}
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

