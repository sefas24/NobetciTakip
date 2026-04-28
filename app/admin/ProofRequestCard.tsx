"use client";

import { useState } from "react";

type ProofRequest = {
  id: string;
  requester_email: string;
  requester_name: string | null;
  image_url: string;
  note: string | null;
  status: string;
  created_at: string;
};

export function ProofRequestCard({
  request,
  dutyNames,
}: {
  request: ProofRequest;
  dutyNames: string[];
}) {
  const [expanded, setExpanded] = useState(false);
  const [decision, setDecision] = useState<"accepted" | "rejected" | null>(null);
  const [assignedTo, setAssignedTo] = useState("");
  const [rejectionReason, setRejectionReason] = useState("");
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit() {
  if (decision === "accepted" && !assignedTo) return;
  if (decision === "rejected" && !rejectionReason.trim()) return;

  setLoading(true);
  setError(null);
  try {
    const res = await fetch("/api/proof-requests", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        id: request.id,
        decision,
        assigned_to: assignedTo || undefined,
        rejection_reason: rejectionReason || undefined,
      }),
    });
    if (res.ok) {
      setDone(true);
    } else {
      const data = await res.json().catch(() => ({}));
      setError(data?.message ?? `İşlem başarısız (${res.status}). Sayfayı yenileyip tekrar deneyin.`);
    }
  } catch {
    setError("Sunucu bağlantı hatası. Lütfen tekrar deneyin.");
  } finally {
    setLoading(false);
  }
}

  if (done) {
    return (
      <div className="rounded-xl border border-slate-100 bg-slate-50 px-3 py-2 text-[11px] text-slate-400 text-center">
        {decision === "accepted" ? "✓ Kabul edildi" : "✕ Reddedildi"}
      </div>
    );
  }

  return (
    <div className="border border-slate-200 rounded-xl p-3 flex flex-col gap-2">
      {/* Üst satır — isim + tarih */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-full bg-amber-50 border border-amber-100 flex items-center justify-center text-[11px] font-bold text-amber-700 flex-shrink-0">
            {(request.requester_name ?? request.requester_email).charAt(0).toUpperCase()}
          </div>
          <div>
            <p className="text-xs font-semibold text-slate-800">
              {request.requester_name ?? request.requester_email}
            </p>
            <p className="text-[10px] text-slate-400">
              {new Date(request.created_at).toLocaleTimeString("tr-TR", {
                hour: "2-digit",
                minute: "2-digit",
              })}
            </p>
          </div>
        </div>
        <button
          onClick={() => setExpanded((v) => !v)}
          className="text-[11px] text-teal-700 font-medium underline underline-offset-2"
        >
          {expanded ? "Kapat" : "İncele"}
        </button>
      </div>

      {/* Not varsa göster */}
      {request.note && (
        <p className="text-[11px] text-slate-500 italic bg-slate-50 border border-slate-100 rounded-lg px-2 py-1">
          📝 {request.note}
        </p>
      )}

      {/* Genişletilmiş panel */}
      {expanded && (
        <div className="flex flex-col gap-3 pt-1">
          {/* Fotoğraf */}
          <img
            src={request.image_url}
            alt="Kanıt"
            className="w-full rounded-xl object-contain max-h-48 border border-slate-100"
          />

          {/* Karar butonları */}
          {decision === null && (
            <div className="flex gap-2">
              <button
                onClick={() => setDecision("accepted")}
                className="flex-1 text-[11px] font-semibold py-1.5 rounded-full bg-teal-50 text-teal-700 border border-teal-200 hover:bg-teal-100 transition"
              >
                ✓ Kabul Et
              </button>
              <button
                onClick={() => setDecision("rejected")}
                className="flex-1 text-[11px] font-semibold py-1.5 rounded-full bg-red-50 text-red-600 border border-red-200 hover:bg-red-100 transition"
              >
                ✕ Reddet
              </button>
            </div>
          )}

          {/* Kabul — nöbetçi seç */}
          {decision === "accepted" && (
            <div className="flex flex-col gap-2">
              <p className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
                Hangi nöbetçi adına kabul edilsin?
              </p>
              <div className="flex flex-col gap-1">
                {dutyNames.map((isim) => (
                  <label
                    key={isim}
                    className={`flex items-center gap-2 px-3 py-1.5 rounded-xl border cursor-pointer transition text-xs ${
                      assignedTo === isim
                        ? "bg-teal-50 border-teal-300 text-teal-800 font-semibold"
                        : "border-slate-200 text-slate-600 hover:bg-slate-50"
                    }`}
                  >
                    <input
                      type="radio"
                      name={`assign-${request.id}`}
                      value={isim}
                      checked={assignedTo === isim}
                      onChange={() => setAssignedTo(isim)}
                      className="accent-teal-600"
                    />
                    {isim}
                  </label>
                ))}
              </div>
              <div className="flex gap-2 mt-1">
                <button
                  onClick={() => setDecision(null)}
                  className="flex-1 text-[11px] py-1.5 rounded-full border border-slate-200 text-slate-500 hover:bg-slate-50 transition"
                >
                  Geri
                </button>
                <button
                  onClick={handleSubmit}
                  disabled={!assignedTo || loading}
                  className="flex-1 text-[11px] font-semibold py-1.5 rounded-full bg-teal-500 text-white hover:bg-teal-600 transition disabled:opacity-40"
                >
                  {loading ? "..." : "Onayla"}
                </button>
              </div>
            </div>
          )}

          {/* Ret — gerekçe yaz */}
          {decision === "rejected" && (
            <div className="flex flex-col gap-2">
              <p className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
                Red gerekçesi
              </p>
              <textarea
                value={rejectionReason}
                onChange={(e) => setRejectionReason(e.target.value)}
                placeholder="Gerekçenizi yazın..."
                rows={3}
                className="text-xs text-slate-800 placeholder:text-slate-400 border border-slate-200 rounded-xl px-3 py-2 resize-none focus:outline-none focus:ring-1 focus:ring-slate-300"
              />
              <div className="flex gap-2">
                <button
                  onClick={() => setDecision(null)}
                  className="flex-1 text-[11px] py-1.5 rounded-full border border-slate-200 text-slate-500 hover:bg-slate-50 transition"
                >
                  Geri
                </button>
                <button
                  onClick={handleSubmit}
                  disabled={!rejectionReason.trim() || loading}
                  className="flex-1 text-[11px] font-semibold py-1.5 rounded-full bg-red-500 text-white hover:bg-red-600 transition disabled:opacity-40"
                >
                  {loading ? "..." : "Reddet"}
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}