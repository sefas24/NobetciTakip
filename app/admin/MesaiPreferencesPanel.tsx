"use client";

import { useEffect, useState } from "react";
import type { MesaiPreference } from "@/lib/mesaiStore";

interface ApiListResponse {
  ok: boolean;
  items?: MesaiPreference[];
  message?: string;
}

export default function MesaiPreferencesPanel() {
  const [items, setItems] = useState<MesaiPreference[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/mesai/preferences", { cache: "no-store" });
      const data = (await res.json()) as ApiListResponse;
      if (!res.ok || !data.ok || !data.items) {
        setError(data.message ?? "Veriler alınamadı.");
        setItems([]);
      } else {
        setItems(data.items);
      }
    } catch {
      setError("Veriler alınamadı.");
      setItems([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void load();
  }, []);



  const pending = items.filter((i) => i.status === "pending");
  const approved = items.filter((i) => i.status === "approved");

  const handleApproveAll = async () => {
    if (!confirm(`Bekleyen ${pending.length} adet mesai onayını topluca kabul etmek istediğinize emin misiniz?\n\nNot: Sistem bu listede yer alan bütün günler için ayrı ayrı en fazla 3 kişiyi otomatik olarak nöbetçi belirleyecektir!`)) return;

    setLoading(true);

    try {
      const res = await fetch("/api/mesai/approve-all", {
        method: "POST",
      });
      const data = await res.json() as { ok: boolean; message?: string };

      if (!res.ok) {
        alert(data.message || "Toplu onay sırasında bir hata oluştu.");
      } else {
        alert(data.message || "Tüm bekleyen mesailer başarıyla kabul edildi!");
      }
    } catch {
      alert("Sunucuya bağlanılırken hata oluştu.");
    }

    await load();
  };

  const handleResetAll = async () => {
    if (!confirm("DİKKAT! Onaylanmış veya bekleyen TÜM mesai ve nöbetçi kayıtları silinecek. Test/Sıfırlama yapmak istediğinize emin misiniz?")) return;

    setLoading(true);

    try {
      const res = await fetch("/api/mesai/reset-all", {
        method: "POST",
      });
      const data = await res.json() as { ok: boolean; message?: string };

      if (!res.ok) {
        alert(data.message || "Sıfırlama sırasında bir hata oluştu.");
      } else {
        alert(data.message || "Tüm kayıtlar silindi!");
      }
    } catch {
      alert("Sunucuya bağlanılırken hata oluştu.");
    }

    await load();
  };

  return (
    <div className="mt-10">
      <div className="flex justify-end mb-4">
        <button
          onClick={handleResetAll}
          disabled={loading}
          className="px-4 py-2 bg-red-50 hover:bg-red-100 text-red-600 border border-red-200 text-xs font-bold rounded-lg shadow-sm transition whitespace-nowrap"
        >
          🗑️ Tüm Kayıtları & Nöbetçileri Sıfırla (Test)
        </button>
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <section className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
          <div className="flex justify-between items-start mb-3">
            <div>
              <h2 className="text-sm font-semibold text-gray-900 mb-1">
                Onay Bekleyen Mesai Tercihleri
              </h2>
              <p className="text-xs text-gray-500">
                Öğrencilerin seçtiği günler önce buraya düşer. Uygun gördüklerini{" "}
                <span className="font-semibold">normal mesai</span> veya{" "}
                <span className="font-semibold">nöbetçi</span> olarak onayla.
              </p>
            </div>

            {pending.length > 0 && (
              <button
                onClick={handleApproveAll}
                disabled={loading}
                className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-lg shadow-sm transition whitespace-nowrap"
              >
                ✓ Tümünü Kabul Et ({pending.length})
              </button>
            )}
          </div>
          {loading ? (
            <p className="text-xs text-gray-500">Yükleniyor...</p>
          ) : pending.length === 0 ? (
            <p className="text-xs text-gray-400">
              Şu anda onay bekleyen tercih yok.
            </p>
          ) : (
            <ul className="space-y-3 text-sm">
              {pending.map((p) => (
                <li
                  key={p.id}
                  className="border border-gray-100 rounded-lg px-3 py-2 flex flex-col gap-1"
                >
                  <div className="flex justify-between items-center">
                    <span className="font-semibold text-gray-900">
                      {p.email}
                    </span>
                  </div>
                  <div className="text-xs text-gray-600">
                    <span className="font-semibold">Mesai Günü Tercihleri:</span> {p.slots.join(", ")}
                  </div>
                </li>
              ))}
            </ul>
          )}
          {error && (
            <p className="mt-2 text-xs text-red-600">
              Hata: {error} — sayfayı yenilemeyi deneyebilirsin.
            </p>
          )}
        </section>

        <section className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
          <h2 className="text-sm font-semibold text-gray-900 mb-2">
            Oluşan Mesai Listesi (Onaylanmışlar)
          </h2>
          <p className="text-xs text-gray-500 mb-3">
            Bu liste, öğrenci ekranındaki{" "}
            <span className="font-semibold">“Mesaisi Olanlar & Nöbetçiler”</span>{" "}
            sayfasına yansır.
          </p>
          {approved.length === 0 ? (
            <p className="text-xs text-gray-400">
              Henüz onaylanmış mesai kaydı yok.
            </p>
          ) : (
            <ul className="space-y-2 text-sm">
              {approved.map((p) => (
                <li
                  key={p.id}
                  className="border border-gray-100 rounded-lg px-3 py-2 flex justify-between items-start"
                >
                  <div>
                    <p className="font-semibold text-gray-900">{p.email}</p>
                    <p className="text-xs text-gray-600 mt-1">
                      <span className="font-semibold">Mesai:</span>{" "}
                      {p.slots.filter(s => !p.dutySlots.includes(s)).join(", ") || "-"}
                    </p>
                    {p.dutySlots.length > 0 && (
                      <p className="text-xs text-amber-700 mt-1 font-medium bg-amber-50 rounded-md px-1 py-0.5 inline-block border border-amber-200">
                        Nöbetçi: {p.dutySlots.join(", ")}
                      </p>
                    )}
                  </div>
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>
    </div>
  );
}
