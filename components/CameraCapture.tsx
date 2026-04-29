"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import toast from "react-hot-toast";

const NOBET_GOREVLERI = [
  { id: "sabah_cay_kahve", label: "Sabah çay ve kahveyi hazırladım",    zaman: "Sabah · Erken geliş" },
  { id: "aksam_temizlik",  label: "Akşam çay/kahve alanını temizledim", zaman: "Akşam · Geç çıkış"   },
  { id: "tezgah_temiz",    label: "Tezgahı temiz bıraktım",              zaman: "Akşam · Geç çıkış"   },
  { id: "masalar_temiz",   label: "Masaları temizledim",                 zaman: "Akşam · Geç çıkış"   },
  { id: "sandalyeler",     label: "Sandalyeleri düzenledim",             zaman: "Akşam · Geç çıkış"   },
] as const;

export default function CameraCapture() {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);

  const [running, setRunning] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [photoDataUrl, setPhotoDataUrl] = useState<string | null>(null);
  const [photoFilename, setPhotoFilename] = useState<string>("nobet-kanit.jpg");
  const [uploading, setUploading] = useState(false);
  const [note, setNote] = useState<string>("");

  const [checkedGorevler, setCheckedGorevler] = useState<Record<string, boolean>>({});

  type CompletedTask = { task_id: string; completed_by_name: string };
  const [completedTasks, setCompletedTasks] = useState<CompletedTask[]>([]);
  const [loadingTasks, setLoadingTasks] = useState(true);

  const enAzBirSecili = NOBET_GOREVLERI.some((g) => checkedGorevler[g.id]);
  const tamamlananSayi = completedTasks.length;

  const isSecureContextHint = useMemo(() => {
    if (typeof window === "undefined") return null;
    if (window.isSecureContext) return null;
    return "Kamera için HTTPS gerekir. (Localhost hariç) Uygulamayı HTTPS üzerinde açmayı deneyin.";
  }, []);

  const stopCamera = async () => {
    const stream = streamRef.current;
    if (stream) {
      stream.getTracks().forEach((t) => t.stop());
    }
    streamRef.current = null;
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
    setRunning(false);
  };

  const startCamera = async () => {
    setError(null);
    setPhotoDataUrl(null);

    if (typeof navigator === "undefined" || !navigator.mediaDevices?.getUserMedia) {
      setError("Bu cihaz/tarayıcı kamera erişimini desteklemiyor.");
      return;
    }

    try {
      await stopCamera();
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: { ideal: "environment" } },
        audio: false,
      });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play();
      }
      setRunning(true);
    } catch (e) {
      const msg = e instanceof Error ? e.message : "Kameraya erişilemedi. İzin verdiğinizden emin olun.";
      setError(msg);
      setRunning(false);
    }
  };

  const takePhoto = () => {
    setError(null);
    const video = videoRef.current;
    const canvas = canvasRef.current;
    if (!video || !canvas) return;

    const width = video.videoWidth || 1280;
    const height = video.videoHeight || 720;
    canvas.width = width;
    canvas.height = height;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    ctx.drawImage(video, 0, 0, width, height);
    const dataUrl = canvas.toDataURL("image/jpeg", 0.92);
    setPhotoDataUrl(dataUrl);
    const stamp = new Date().toISOString().replaceAll(":", "-").replaceAll(".", "-");
    setPhotoFilename(`nobet-kanit-${stamp}.jpg`);
  };

  useEffect(() => {
    fetch("/api/duty-tasks")
      .then((r) => r.json())
      .then((d) => { if (d.ok) setCompletedTasks(d.data); })
      .finally(() => setLoadingTasks(false));
  }, []);

  useEffect(() => {
    return () => { void stopCamera(); };
  }, []);

  useEffect(() => {
    if (running && !photoDataUrl && videoRef.current && streamRef.current) {
      if (videoRef.current.srcObject !== streamRef.current) {
        videoRef.current.srcObject = streamRef.current;
        videoRef.current.play().catch(() => {});
      }
    }
  }, [running, photoDataUrl]);

  const validateFile = (file: File) => {
    const validTypes = ["image/jpeg", "image/png", "image/webp"];
    if (!validTypes.includes(file.type)) {
      toast.error("Lütfen sadece JPEG, PNG veya WEBP türünde bir resim seçin.");
      return false;
    }
    const maxSizeInBytes = 5 * 1024 * 1024;
    if (file.size > maxSizeInBytes) {
      toast.error("Dosya boyutu 5MB'den büyük olamaz.");
      return false;
    }
    return true;
  };

  const handleFileUploadMenu = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!validateFile(file)) {
      e.target.value = "";
      return;
    }
    await uploadFileToSupabase(file, note.trim() || null);
    e.target.value = "";
  };

  const handleUploadCapturedPhoto = async () => {
    if (!photoDataUrl) return;
    try {
      const res = await fetch(photoDataUrl);
      const blob = await res.blob();
      const file = new File([blob], photoFilename, { type: "image/jpeg" });
      await uploadFileToSupabase(file, note.trim() || null);
    } catch {
      toast.error("Kamera fotoğrafı dönüştürülürken hata oluştu.");
    }
  };

  const uploadFileToSupabase = async (file: File, noteText: string | null) => {
    setUploading(true);
    const loadingToast = toast.loading("Fotoğraf yükleniyor...");

    try {
      const formData = new FormData();
      formData.append("file", file);
      if (noteText) formData.append("note", noteText);

      // Seçilen görev ID'lerini de gönder
      const secilenGorevIds = NOBET_GOREVLERI
        .filter((g) => checkedGorevler[g.id] && !completedTasks.find((c) => c.task_id === g.id))
        .map((g) => g.id);
      formData.append("task_ids", JSON.stringify(secilenGorevIds));

      const res = await fetch("/api/mesai/upload-proof", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();

      if (!res.ok || !data.ok) {
        throw new Error(data.message || "Fotoğraf yüklenemedi.");
      }

      // Nöbetçiyse görevler upload-proof içinde zaten kaydedildi
      // Nöbetçi değilse görevler admin onayında kaydedilecek
      // Burada duty-tasks çağrısı YOK

      toast.success("Fotoğraf başarıyla nöbet kaydınıza eklendi!", { id: loadingToast });
      setPhotoDataUrl(null);
      setNote("");
      setCheckedGorevler({});
      const refreshed = await fetch("/api/duty-tasks").then((r) => r.json());
      if (refreshed.ok) setCompletedTasks(refreshed.data);

    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Bilinmeyen bir hata oluştu.";
      toast.error(msg, { id: loadingToast });
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="w-full space-y-4">
      {isSecureContextHint ? (
        <div className="bg-amber-50 border border-amber-200 text-amber-700 rounded-xl px-4 py-3 text-xs flex items-center gap-2">
          <svg className="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
          <p>{isSecureContextHint}</p>
        </div>
      ) : null}

      {error ? (
        <div className="bg-red-50 border border-red-100 text-red-600 rounded-xl px-4 py-3 text-xs flex items-center gap-2">
          <svg className="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <p>{error}</p>
        </div>
      ) : null}

      {/* Nöbet Görevleri */}
      <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm">
        <div className="px-4 py-3 border-b border-slate-100 bg-slate-50/50 flex items-center justify-between">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Nöbet Görevleri</span>
          <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-amber-50 text-amber-700 border border-amber-100">
            {tamamlananSayi}/{NOBET_GOREVLERI.length} tamamlandı
          </span>
        </div>

        <div className="divide-y divide-slate-50 px-4">
          {loadingTasks ? (
            <p className="text-xs text-slate-400 py-4 text-center">Yükleniyor...</p>
          ) : (
            NOBET_GOREVLERI.map((gorev) => {
              const completed = completedTasks.find((c) => c.task_id === gorev.id);
              const checked = !!checkedGorevler[gorev.id];

              if (completed) {
                return (
                  <div key={gorev.id} className="flex items-center gap-3 py-3 opacity-60">
                    <div className="w-5 h-5 rounded-md bg-teal-500 border-2 border-teal-500 flex-shrink-0 flex items-center justify-center">
                      <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-xs font-semibold line-through text-slate-400">{gorev.label}</p>
                      <p className="text-[10px] text-teal-600 mt-0.5">{completed.completed_by_name} tamamladı</p>
                    </div>
                  </div>
                );
              }

              return (
                <div
                  key={gorev.id}
                  onClick={() => setCheckedGorevler((prev) => ({ ...prev, [gorev.id]: !prev[gorev.id] }))}
                  className="flex items-center gap-3 py-3 cursor-pointer group"
                >
                  <div
                    className={`w-5 h-5 rounded-md border-2 flex-shrink-0 flex items-center justify-center transition-all ${
                      checked ? "bg-teal-500 border-teal-500" : "border-slate-300 group-hover:border-teal-400"
                    }`}
                  >
                    {checked && (
                      <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                      </svg>
                    )}
                  </div>
                  <div className="min-w-0">
                    <p className={`text-xs font-semibold ${checked ? "text-teal-700" : "text-slate-700"}`}>
                      {gorev.label}
                    </p>
                    <p className="text-[10px] text-slate-400 mt-0.5">{gorev.zaman}</p>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

      {!running && !photoDataUrl && (
        <div className="bg-white border border-slate-200 rounded-xl p-8 flex flex-col items-center justify-center text-center space-y-4 shadow-sm min-h-[300px]">
          <div className="w-14 h-14 bg-teal-50 text-teal-600 rounded-full flex items-center justify-center mb-1 border border-teal-100">
            <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
          </div>
          <div>
            <h3 className="text-[13px] font-bold text-slate-800">Kamera Kapalı</h3>
            <p className="text-xs text-slate-500 mt-1 max-w-[280px] mx-auto leading-relaxed"></p>
          </div>
          <button
            onClick={startCamera}
            disabled={uploading}
            className="mt-3 px-6 py-2.5 rounded-full bg-teal-600 text-white text-xs font-bold hover:bg-teal-700 transition shadow-sm border border-teal-700"
          >
            Kamerayı Aç
          </button>
        </div>
      )}

      {running && !photoDataUrl && (
        <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm flex flex-col">
          <div className="border-b border-slate-100 p-3 px-4 flex justify-between items-center bg-slate-50/50">
            <div className="flex gap-2.5 items-center">
              <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse shadow-[0_0_8px_rgba(239,68,68,0.6)]" />
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Canlı Önizleme</span>
            </div>
            <button onClick={stopCamera} className="text-slate-400 hover:text-slate-700 text-xs font-semibold transition">
              Kapat
            </button>
          </div>
          <div className="relative aspect-video sm:aspect-video w-full bg-slate-900 flex items-center justify-center">
            <video ref={videoRef} className="w-full h-full object-cover" playsInline muted autoPlay />
          </div>
          <div className="p-4 bg-white flex justify-center border-t border-slate-100">
            <button
              onClick={takePhoto}
              disabled={uploading}
              className="px-8 py-3 rounded-full bg-teal-600 hover:bg-teal-700 text-white text-xs font-bold shadow-sm transition border border-teal-700"
            >
              Fotoğrafı Çek ve İncele
            </button>
          </div>
        </div>
      )}

      {photoDataUrl && (
        <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm flex flex-col">
          <div className="border-b border-slate-100 p-3 px-4 flex justify-between items-center bg-slate-50/50">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Çekilen Fotoğraf</span>
            <button onClick={() => setPhotoDataUrl(null)} className="text-slate-400 hover:text-slate-700 text-xs font-semibold transition">
              İptal Et
            </button>
          </div>
          <div className="relative aspect-video sm:aspect-video w-full bg-slate-100 flex items-center justify-center">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={photoDataUrl} alt="Önizleme" className="w-full h-full object-cover" />
          </div>
          <div className="px-4 pt-4 pb-2">
            <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1.5">
              Açıklama <span className="text-slate-400 font-normal normal-case">(isteğe bağlı)</span>
            </label>
            <textarea
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="Kamera erişiminiz yoksa veya başka bir cihazdan yükleme yapıyorsanız kısa bir açıklama yazabilirsiniz..."
              rows={3}
              className="w-full text-xs text-slate-700 bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 resize-none focus:outline-none focus:ring-2 focus:ring-teal-400 focus:border-transparent placeholder:text-slate-400 leading-relaxed"
            />
          </div>
          <div className="p-4 bg-white flex justify-center flex-wrap gap-3 border-t border-slate-100">
            <a
              href={photoDataUrl}
              download={photoFilename}
              className="inline-flex items-center justify-center px-6 py-2.5 rounded-lg bg-white border border-slate-200 text-slate-700 text-[13px] font-bold hover:bg-slate-50 transition"
            >
              Cihaza İndir
            </a>
            <button
              onClick={handleUploadCapturedPhoto}
              disabled={uploading || !enAzBirSecili}
              title={!enAzBirSecili ? "En az bir nöbet görevini işaretlemelisin" : undefined}
              className={`inline-flex items-center justify-center px-6 py-2.5 rounded-lg text-[13px] font-bold transition shadow-sm border disabled:cursor-not-allowed ${
                enAzBirSecili
                  ? "bg-teal-600 text-white hover:bg-teal-700 border-teal-700 disabled:opacity-70"
                  : "bg-slate-100 text-slate-400 border-slate-200"
              }`}
            >
              {uploading ? (
                <>
                  <svg className="animate-spin w-4 h-4 mr-2" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                  Yükleniyor...
                </>
              ) : (
                "Sisteme Kanıt Olarak Yükle"
              )}
            </button>
          </div>
        </div>
      )}

      <canvas ref={canvasRef} className="hidden" />
    </div>
  );
}