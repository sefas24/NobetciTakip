"use client";

import { useState } from "react";
import toast from "react-hot-toast";
import { supabase } from "@/lib/supabase";

interface Props {
  email: string | null;
  displayName?: string | null;
  slots: string[];
}

export default function GunSecimiClient({ email, displayName, slots }: Props) {
  const [selected, setSelected] = useState<string[]>([]);
  const [note, setNote] = useState("");
  const [scheduleFile, setScheduleFile] = useState<File | null>(null);
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
      let scheduleFileUrl = undefined;

      if (scheduleFile) {
        const fileExt = scheduleFile.name.split('.').pop();
        const fileName = `${Date.now()}_${Math.random().toString(36).substring(7)}.${fileExt}`;
        const filePath = `${fileName}`;

        const { data: uploadData, error: uploadError } = await supabase.storage
          .from("mesai-files")
          .upload(filePath, scheduleFile);

        if (uploadError) {
          toast.error("Dosya yüklenirken hata oluştu: " + uploadError.message, { id: loadingToast });
          setSaving(false);
          return;
        }

        const { data: publicUrlData } = supabase.storage
          .from("mesai-files")
          .getPublicUrl(filePath);

        scheduleFileUrl = publicUrlData.publicUrl;
      }

      const res = await fetch("/api/mesai/preferences", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ slots: selected, note, schedule_file_url: scheduleFileUrl }),
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
        setNote("");
        setScheduleFile(null);
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
        <p className="text-xs text-blue-700 bg-blue-50 border border-blue-200 rounded-lg p-3 mb-4 leading-relaxed">
          <span className="font-bold">ÖNEMLİ:</span> Lütfen minimum 2, maksimum 3 gün mesai seçiniz. Ders programınıza göre 1 tam günü, iki farklı gün yarım yarım (Öğleden Önce / Öğleden Sonra) şeklinde bölebilirsiniz.
        </p>
        <div className="grid grid-cols-2 gap-2 text-sm">
          {slots.map((slot) => {
            const active = selected.includes(slot);
            return (
              <button
                key={slot}
                type="button"
                onClick={() => toggleSlot(slot)}
                className={`px-3 py-2 rounded-lg border text-gray-700 transition ${active
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
          2. Adım: Ders Programı Ekle
        </h2>
        <p className="text-xs text-gray-500">
          Ders programını (PDF, Excel, Fotoğraf) formatında yükleyebilirsin.
        </p>
        <input
          type="file"
          accept=".pdf,image/*,.xlsx,.xls,.doc,.docx"
          onChange={(e) => setScheduleFile(e.target.files?.[0] || null)}
          className="w-full text-xs text-gray-500 file:mr-3 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-xs file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
        />
        {scheduleFile && (
          <p className="text-xs text-green-600 font-medium">Seçilen dosya: {scheduleFile.name}</p>
        )}
      </section>

      <section className="bg-white rounded-2xl shadow-sm p-4 space-y-3">
        <h2 className="text-sm font-semibold text-gray-800 mb-1">
          3. Adım: İsteğe Bağlı Not Ekle
        </h2>
        <p className="text-xs text-gray-500">
          Adminin mesaini onaylarken dikkate almasını istediğin özel bir durum varsa buraya yazabilirsin.
        </p>
        <textarea
          className="w-full text-sm p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none resize-none transition"
          rows={3}
          placeholder="Örn: Pazartesi öğleden sonraları hastanede stajım olduğu için katılamıyorum..."
          value={note}
          onChange={(e) => setNote(e.target.value)}
        />
      </section>

      <section className="bg-white rounded-2xl shadow-sm p-4 space-y-3">
        <h2 className="text-sm font-semibold text-gray-800 mb-1">
          4. Adım: Kaydet
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
          className={`w-full bg-blue-600 text-white text-sm font-semibold py-2.5 rounded-lg hover:bg-blue-700 transition ${saving ? "opacity-70 cursor-not-allowed" : ""
            }`}
        >
          {saving ? "Kaydediliyor..." : "Tercihleri Kaydet"}
        </button>
      </section>
    </main>
  );
}

