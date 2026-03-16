"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import toast from "react-hot-toast";

export default function CameraCapture() {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);

  const [running, setRunning] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [photoDataUrl, setPhotoDataUrl] = useState<string | null>(null);
  const [photoFilename, setPhotoFilename] = useState<string>("nobet-kanit.jpg");
  const [uploading, setUploading] = useState(false);

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

    if (
      typeof navigator === "undefined" ||
      !navigator.mediaDevices?.getUserMedia
    ) {
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
      const msg =
        e instanceof Error
          ? e.message
          : "Kameraya erişilemedi. İzin verdiğinizden emin olun.";
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
    const stamp = new Date()
      .toISOString()
      .replaceAll(":", "-")
      .replaceAll(".", "-");
    setPhotoFilename(`nobet-kanit-${stamp}.jpg`);
  };

  useEffect(() => {
    return () => {
      void stopCamera();
    };
  }, []);

  // --- Photo Upload Flow (Phase 7) ---

  const validateFile = (file: File) => {
    const validTypes = ["image/jpeg", "image/png", "image/webp"];
    if (!validTypes.includes(file.type)) {
      toast.error("Lütfen sadece JPEG, PNG veya WEBP türünde bir resim seçin.");
      return false;
    }

    const maxSizeInBytes = 5 * 1024 * 1024; // 5MB
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
      e.target.value = ""; // Formu sıfırla
      return;
    }

    await uploadFileToSupabase(file);
    e.target.value = ""; // Formu sıfırla
  };

  // Convert canvas Base64 Data URL to a native File object and upload it
  const handleUploadCapturedPhoto = async () => {
    if (!photoDataUrl) return;

    try {
      // Decode base64 to Blob -> File
      const res = await fetch(photoDataUrl);
      const blob = await res.blob();
      const file = new File([blob], photoFilename, { type: "image/jpeg" });

      await uploadFileToSupabase(file);
    } catch (err: any) {
      toast.error("Kamera fotoğrafı dönüştürülürken hata oluştu.");
    }
  };

  const uploadFileToSupabase = async (file: File) => {
    setUploading(true);
    const loadingToast = toast.loading("Fotoğraf yükleniyor...");

    try {
      // 1. Create FormData because we are sending a file buffer to our Next.js API route
      const formData = new FormData();
      formData.append("file", file);

      // 2. Call the server action / API route (to keep Supabase keys hidden and session secure)
      const res = await fetch("/api/mesai/upload-proof", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();

      if (!res.ok || !data.ok) {
        throw new Error(data.message || "Fotoğraf yüklenemedi.");
      }

      toast.success("Fotoğraf başarıyla nöbet kaydınıza eklendi!", { id: loadingToast });
      setPhotoDataUrl(null); // Başarılıysa önizlemeyi kapatabiliriz

    } catch (err: any) {
      toast.error(err.message || "Bilinmeyen bir hata oluştu.", { id: loadingToast });
    } finally {
      setUploading(false);
    }
  };


  return (
    <div className="space-y-4 w-full">
      {isSecureContextHint ? (
        <p className="text-xs text-amber-700 bg-amber-50 border border-amber-200 rounded-lg px-3 py-2">
          {isSecureContextHint}
        </p>
      ) : null}

      {error ? (
        <p className="text-sm text-red-600 bg-red-50 border border-red-100 rounded-lg px-3 py-2">
          {error}
        </p>
      ) : null}

      <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden shadow-sm">
        <div className="aspect-video bg-black flex items-center justify-center relative">
          <video
            ref={videoRef}
            className="w-full h-full object-contain"
            playsInline
            muted
            autoPlay
          />
          {!running && !photoDataUrl && (
            <div className="absolute inset-0 flex items-center justify-center text-gray-500 text-sm">
              Kamera Kapalı
            </div>
          )}
        </div>

        <div className="p-4 flex flex-col sm:flex-row flex-wrap gap-2 justify-between items-center sm:items-start border-b border-gray-100">
          <div className="flex gap-2 flex-wrap">
            <button
              onClick={startCamera}
              disabled={uploading}
              className="px-4 py-2 rounded-lg bg-blue-600 text-white text-sm font-semibold hover:bg-blue-700 transition disabled:opacity-50"
            >
              Kamerayı Aç
            </button>
            <button
              onClick={stopCamera}
              disabled={uploading}
              className="px-4 py-2 rounded-lg bg-white border border-gray-200 text-gray-700 text-sm font-semibold hover:border-gray-300 transition disabled:opacity-50"
            >
              Kamerayı Kapat
            </button>
            <button
              onClick={takePhoto}
              disabled={!running || uploading}
              className={`px-4 py-2 rounded-lg text-sm font-semibold transition ${running && !uploading
                  ? "bg-gray-900 text-white hover:bg-gray-800"
                  : "bg-gray-200 text-gray-500 cursor-not-allowed"
                }`}
            >
              Fotoğraf Çek
            </button>
          </div>
        </div>

        {/* GALERİDEN VEYA DOSYA SİSTEMİNDEN YÜKLE */}

      </div>

      {photoDataUrl ? (
        <div className="bg-white border text-center border-gray-200 rounded-2xl p-4 shadow-sm space-y-3">
          <h2 className="text-sm font-semibold text-gray-900 text-left">Çekilen Önizleme</h2>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={photoDataUrl}
            alt="Çekilen fotoğraf"
            className="w-full rounded-xl border border-gray-100 max-h-96 object-contain bg-gray-50"
          />
          <div className="flex flex-wrap gap-2 justify-center pt-2">
            <a
              href={photoDataUrl}
              download={photoFilename}
              className="inline-flex items-center justify-center px-4 py-2 rounded-lg bg-white border border-gray-200 text-gray-700 text-sm font-semibold hover:bg-gray-50 transition"
            >
              Cihaza İndir
            </a>

            <button
              // Directly upload the taken photo to DB
              onClick={handleUploadCapturedPhoto}
              disabled={uploading}
              className="inline-flex items-center justify-center px-4 py-2 rounded-lg bg-emerald-600 text-white text-sm font-semibold hover:bg-emerald-700 transition disabled:opacity-50"
            >
              {uploading ? "Yükleniyor..." : "Sisteme Kanıt Olarak Yükle"}
            </button>
          </div>
        </div>
      ) : null}

      <canvas ref={canvasRef} className="hidden" />
    </div>
  );
}
