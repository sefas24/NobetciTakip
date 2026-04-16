"use client";
import { useState } from "react";

export function DutyPersonCard({
  name,
  photos,
  notes = [],
}: {
  name: string;
  photos: string[];
  notes?: string[];
}) {
  const [modalIndex, setModalIndex] = useState<number | null>(null);

  return (
    <>
      <div className="flex items-start gap-3 bg-white border border-slate-200 rounded-xl p-3">
        <div className="w-9 h-9 rounded-full bg-teal-50 border border-teal-100 flex items-center justify-center text-xs font-bold text-teal-700 flex-shrink-0">
          {name.charAt(0)}
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold text-slate-800">{name}</p>
          <p className="text-[11px] text-slate-400 mt-0.5">Tüm gün · 09:00–17:00</p>
          {photos.length > 0 ? (
            <div className="flex flex-col gap-1.5 mt-2">
              <div className="flex gap-1.5 flex-wrap">
                {photos.map((url, i) => (
                  <button
                    key={i}
                    onClick={() => setModalIndex(i)}
                    className="text-[11px] text-teal-700 font-medium underline underline-offset-2 hover:text-teal-900"
                  >
                    Kanıtı Gör{photos.length > 1 ? ` (${i + 1})` : ""}
                  </button>
                ))}
              </div>
              {notes.some(Boolean) && (
                <p className="text-[11px] text-slate-500 italic bg-slate-50 border border-slate-100 rounded-lg px-2 py-1">
                  📝 Açıklamalar mevcut
                </p>
              )}
            </div>
          ) : (
            <span className="inline-block mt-2 text-[11px] text-amber-600 font-medium bg-amber-50 px-2 py-0.5 rounded-full border border-amber-100">
              Henüz yüklenmedi
            </span>
          )}
        </div>
      </div>

      {/* Modal */}
      {modalIndex !== null && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60"
          onClick={() => setModalIndex(null)}
        >
          <div
            className="bg-white rounded-2xl shadow-2xl max-w-lg w-full mx-4 p-5 flex flex-col gap-4"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between">
              <p className="text-sm font-semibold text-slate-800">{name} — Kanıt</p>
              <button
                onClick={() => setModalIndex(null)}
                className="text-slate-400 hover:text-slate-700 text-lg leading-none"
              >
                ✕
              </button>
            </div>

            {notes[modalIndex] && (
              <div className="bg-slate-50 border border-slate-200 rounded-xl px-3 py-2">
                <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-1">Açıklama</p>
                <p className="text-sm text-slate-700">{notes[modalIndex]}</p>
              </div>
            )}

            <img
              src={photos[modalIndex]}
              alt="Kanıt fotoğrafı"
              className="w-full rounded-xl object-contain max-h-96"
            />

            <a
              href={photos[modalIndex]}
              target="_blank"
              rel="noopener noreferrer"
              className="text-center text-[11px] text-teal-700 underline underline-offset-2"
            >
              Tam ekranda aç
            </a>
          </div>
        </div>
      )}
    </>
  );
}