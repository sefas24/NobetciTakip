"use client";

import Link from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";

export default function KameraPage() {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);

  const [running, setRunning] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [photoDataUrl, setPhotoDataUrl] = useState<string | null>(null);
  const [photoFilename, setPhotoFilename] = useState<string>("nobet-kanit.jpg");

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

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <header className="w-full bg-white shadow-sm px-4 py-4 flex justify-between items-center">
        <div>
          <h1 className="text-lg font-bold text-gray-900">Kamera</h1>
          <p className="text-xs text-gray-500 mt-1">
            Nöbet kanıtı fotoğrafını çek ve kaydet.
          </p>
        </div>
        <Link
          href="/"
          className="text-xs text-blue-600 hover:text-blue-800 font-medium"
        >
          Ana menü
        </Link>
      </header>

      <main className="flex-1 px-6 py-6 space-y-4 max-w-3xl w-full mx-auto">
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
          <div className="aspect-video bg-black flex items-center justify-center">
            <video
              ref={videoRef}
              className="w-full h-full object-contain"
              playsInline
              muted
              autoPlay
            />
          </div>
          <div className="p-4 flex flex-wrap gap-2">
            <button
              onClick={startCamera}
              className="px-4 py-2 rounded-lg bg-blue-600 text-white text-sm font-semibold hover:bg-blue-700 transition"
            >
              Kamerayı Aç
            </button>
            <button
              onClick={stopCamera}
              className="px-4 py-2 rounded-lg bg-white border border-gray-200 text-gray-700 text-sm font-semibold hover:border-gray-300 transition"
            >
              Kamerayı Kapat
            </button>
            <button
              onClick={takePhoto}
              disabled={!running}
              className={`px-4 py-2 rounded-lg text-sm font-semibold transition ${
                running
                  ? "bg-gray-900 text-white hover:bg-gray-800"
                  : "bg-gray-200 text-gray-500 cursor-not-allowed"
              }`}
            >
              Fotoğraf Çek
            </button>
          </div>
        </div>

        {photoDataUrl ? (
          <div className="bg-white border border-gray-200 rounded-2xl p-4 shadow-sm space-y-3">
            <h2 className="text-sm font-semibold text-gray-900">Önizleme</h2>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={photoDataUrl}
              alt="Çekilen fotoğraf"
              className="w-full rounded-xl border border-gray-100"
            />
            <a
              href={photoDataUrl}
              download={photoFilename}
              className="inline-flex items-center justify-center px-4 py-2 rounded-lg bg-blue-600 text-white text-sm font-semibold hover:bg-blue-700 transition"
            >
              İndir (JPG)
            </a>
          </div>
        ) : null}

        <canvas ref={canvasRef} className="hidden" />
      </main>
    </div>
  );
}

