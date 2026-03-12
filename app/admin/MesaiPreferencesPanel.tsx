"use client";

import { useEffect, useState } from "react";
import type { MesaiPreference } from "@/lib/mesaiStore";
import toast from "react-hot-toast";

interface ApiListResponse {
  ok: boolean;
  items?: MesaiPreference[];
  message?: string;
}

export default function MesaiPreferencesPanel() {
  const [items, setItems] = useState<MesaiPreference[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Rejection Modal State
  const [rejectingId, setRejectingId] = useState<string | null>(null);
  const [feedback, setFeedback] = useState("");

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

  // Single Approve Logic
  const handleApproveSingle = async (id: string) => {
    const loadingToast = toast.loading("Onaylanıyor...");
    try {
      const res = await fetch("/api/mesai/approve", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, decision: "approved" }),
      });
      const data = await res.json();

      if (!res.ok) throw new Error(data.message || "Onay sırasında hata oluştu.");

      toast.success("Mesai başarıyla onaylandı!", { id: loadingToast });

      // Optimistic Update
      setItems(prev => prev.map(item => item.id === id ? { ...item, status: "approved" as const } : item));
    } catch (err: any) {
      toast.error(err.message, { id: loadingToast });
    }
  };

  // Reject Logic with Modal Feedback
  const handleRejectConfirm = async () => {
    if (!rejectingId) return;

    if (!feedback.trim()) {
      toast.error("Lütfen bir ret nedeni girin.");
      return;
    }

    const loadingToast = toast.loading("Reddediliyor...");
    try {
      const res = await fetch("/api/mesai/approve", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: rejectingId, decision: "rejected", feedback }),
      });
      const data = await res.json();

      if (!res.ok) throw new Error(data.message || "Reddetme sırasında hata oluştu.");

      toast.success("Mesai reddedildi ve öğrenciye geri bildirim kaydedildi.", { id: loadingToast });

      // Optimistic Update
      setItems(prev => prev.map(item => item.id === rejectingId ? { ...item, status: "rejected" as const, feedback } : item));

      setRejectingId(null);
      setFeedback("");
    } catch (err: any) {
      toast.error(err.message, { id: loadingToast });
    }
  };

  const cancelReject = () => {
    setRejectingId(null);
    setFeedback("");
  };

  const handleApproveAll = async () => {
    if (!confirm(`Bekleyen ${pending.length} adet mesai onayını topluca kabul etmek istediğinize emin misiniz?\n\nNot: Sistem bu listede yer alan bütün günler için ayrı ayrı en fazla 3 kişiyi otomatik olarak nöbetçi belirleyecektir!`)) return;

    setLoading(true);
    const loadingToast = toast.loading("Toplu onaylanıyor...");

    try {
      const res = await fetch("/api/mesai/approve-all", {
        method: "POST",
      });
      const data = await res.json() as { ok: boolean; message?: string };

      if (!res.ok) {
        toast.error(data.message || "Toplu onay sırasında bir hata oluştu.", { id: loadingToast });
      } else {
        toast.success(data.message || "Tüm bekleyen mesailer başarıyla kabul edildi!", { id: loadingToast });
      }
    } catch {
      toast.error("Sunucuya bağlanılırken hata oluştu.", { id: loadingToast });
    }

    await load();
  };

  const handleResetAll = async () => {
    if (!confirm("DİKKAT! Onaylanmış veya bekleyen TÜM mesai ve nöbetçi kayıtları silinecek. Test/Sıfırlama yapmak istediğinize emin misiniz?")) return;

    setLoading(true);
    const loadingToast = toast.loading("Sıfırlanıyor...");

    try {
      const res = await fetch("/api/mesai/reset-all", {
        method: "POST",
      });
      const data = await res.json() as { ok: boolean; message?: string };

      if (!res.ok) {
        toast.error(data.message || "Sıfırlama sırasında bir hata oluştu.", { id: loadingToast });
      } else {
        toast.success(data.message || "Tüm kayıtlar silindi!", { id: loadingToast });
      }
    } catch {
      toast.error("Sunucuya bağlanılırken hata oluştu.", { id: loadingToast });
    }

    await load();
  };

  return (
    <div className="mt-10 relative">
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
        {/* Pending Preferences Section */}
        <section className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
          <div className="flex justify-between items-start mb-3">
            <div>
              <h2 className="text-sm font-semibold text-gray-900 mb-1">
                Onay Bekleyen Mesai Tercihleri
              </h2>
              <p className="text-xs text-gray-500">
                Öğrencilerin seçtiği günler önce buraya düşer. Uygun gördüklerini tek tek onaylayabilir veya reddedebilirsin.
              </p>
            </div>

            {pending.length > 0 && (
              <button
                onClick={handleApproveAll}
                disabled={loading}
                className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-lg shadow-sm transition whitespace-nowrap ml-2"
              >
                ✓ Otomatik Toplu Onay ({pending.length})
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
                  className="border border-gray-100 rounded-lg px-4 py-3 flex flex-col gap-3 shadow-sm bg-gray-50/50"
                >
                  <div className="flex justify-between items-start flex-wrap gap-2">
                    <div>
                      <span className="font-bold text-gray-900 block text-base">
                        {p.fullName || p.email}
                      </span>
                      <div className="text-xs text-gray-600 mt-1">
                        <span className="font-semibold text-gray-800">Seçilen Günler:</span> {p.slots.join(", ")}
                      </div>
                    </div>

                    <div className="flex gap-2">
                      <button
                        onClick={() => setRejectingId(p.id)}
                        className="px-3 py-1.5 bg-white border border-red-200 hover:bg-red-50 text-red-600 text-xs font-semibold rounded-md shadow-sm transition"
                      >
                        Reddet
                      </button>
                      <button
                        onClick={() => handleApproveSingle(p.id)}
                        className="px-3 py-1.5 bg-green-600 hover:bg-green-700 text-white text-xs font-semibold rounded-md shadow-sm transition"
                      >
                        Onayla
                      </button>
                    </div>
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

        {/* Approved Preferences Section */}
        <section className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
          <h2 className="text-sm font-semibold text-gray-900 mb-2">
            Oluşan Mesai Listesi (Onaylanmışlar)
          </h2>
          <p className="text-xs text-gray-500 mb-3">
            Bu liste, öğrenci ekranındaki{" "}
            <span className="font-semibold">“Mesaisi Olanlar & Nöbetçiler”</span>{" "}
            sayfasına yansır. İşin rengi burada belli olur.
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
                  className="border border-green-100 bg-green-50/20 rounded-lg px-3 py-2 flex justify-between items-start"
                >
                  <div>
                    <p className="font-semibold text-gray-900">{p.fullName || p.email}</p>
                    <p className="text-xs text-gray-600 mt-1">
                      <span className="font-semibold">Mesai:</span>{" "}
                      {p.slots.filter(s => !p.dutySlots.includes(s)).join(", ") || "-"}
                    </p>
                    {p.dutySlots.length > 0 && (
                      <p className="text-xs text-amber-700 mt-1 font-medium bg-amber-50 rounded-md px-1.5 py-0.5 inline-block border border-amber-200">
                        Nöbetçi: {p.dutySlots.join(", ")}
                      </p>
                    )}
                    {p.image_url && (
                      <a href={p.image_url} target="_blank" rel="noopener noreferrer" className="mt-2 text-xs text-blue-600 hover:text-blue-800 font-medium underline flex items-center gap-1">
                        <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                        <span>Kanıtı Gör</span>
                      </a>
                    )}
                  </div>
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>

      {/* Reject Reason Modal */}
      {rejectingId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="bg-white w-full max-w-sm rounded-2xl shadow-xl overflow-hidden animate-in fade-in zoom-in duration-200">
            <div className="p-5">
              <h3 className="text-lg font-bold text-gray-900 mb-1">Talebi Reddet</h3>
              <p className="text-xs text-gray-500 mb-4">Öğrenciye bu talebinin neden reddedildiğini açıklayan kısa bir geri bildirim bırakın.</p>

              <textarea
                className="w-full text-sm p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 outline-none resize-none transition"
                rows={4}
                placeholder="Örn: Pazartesi günü için kontenjanımız dolmuştur..."
                value={feedback}
                onChange={(e) => setFeedback(e.target.value)}
                autoFocus
              />
            </div>

            <div className="bg-gray-50 px-5 py-3 border-t border-gray-100 flex justify-end gap-2">
              <button
                onClick={cancelReject}
                className="px-4 py-2 text-sm font-semibold text-gray-600 hover:text-gray-900 transition"
              >
                İptal
              </button>
              <button
                onClick={handleRejectConfirm}
                className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white text-sm font-semibold rounded-lg shadow-sm transition"
              >
                Reddetmeyi Onayla
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
