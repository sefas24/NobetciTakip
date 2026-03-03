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

  const handleApprove = async (id: string, isDuty: boolean) => {
    try {
      const res = await fetch("/api/mesai/approve", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, isDuty }),
      });
      const data = (await res.json()) as { ok: boolean; message?: string };
      if (!res.ok || !data.ok) {
        alert(data.message ?? "Onay işlemi başarısız.");
        return;
      }
      await load();
    } catch {
      alert("Onay işlemi sırasında hata oluştu.");
    }
  };

  const pending = items.filter((i) => i.status === "pending");
  const approved = items.filter((i) => i.status === "approved");

  return (
    <div className="mt-10 grid grid-cols-1 lg:grid-cols-2 gap-6">
      <section className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
        <h2 className="text-sm font-semibold text-gray-900 mb-2">
          Onay Bekleyen Mesai Tercihleri
        </h2>
        <p className="text-xs text-gray-500 mb-3">
          Öğrencilerin seçtiği günler önce buraya düşer. Uygun gördüklerini{" "}
          <span className="font-semibold">normal mesai</span> veya{" "}
          <span className="font-semibold">nöbetçi</span> olarak onayla.
        </p>
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
                  {p.slots.join(", ")}
                </div>
                <div className="flex gap-2 mt-2">
                  <button
                    type="button"
                    onClick={() => handleApprove(p.id, false)}
                    className="px-3 py-1.5 rounded-lg bg-emerald-600 text-white text-xs font-semibold hover:bg-emerald-700 transition"
                  >
                    Normal Mesai Olarak Onayla
                  </button>
                  <button
                    type="button"
                    onClick={() => handleApprove(p.id, true)}
                    className="px-3 py-1.5 rounded-lg bg-amber-600 text-white text-xs font-semibold hover:bg-amber-700 transition"
                  >
                    Nöbetçi Olarak Onayla
                  </button>
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
                className="border border-gray-100 rounded-lg px-3 py-2 flex justify-between items-center"
              >
                <div>
                  <p className="font-semibold text-gray-900">{p.email}</p>
                  <p className="text-xs text-gray-600">
                    {p.slots.join(", ")}
                  </p>
                </div>
                <div className="text-right">
                  {p.isDuty ? (
                    <span className="inline-flex items-center px-2 py-1 rounded-full text-[11px] font-semibold bg-amber-100 text-amber-800">
                      Nöbetçi
                    </span>
                  ) : (
                    <span className="inline-flex items-center px-2 py-1 rounded-full text-[11px] font-semibold bg-emerald-50 text-emerald-700">
                      Mesai
                    </span>
                  )}
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}

