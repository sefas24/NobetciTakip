"use client";

import Link from "next/link";
import CameraCapture from "@/components/CameraCapture";

export default function KameraPage() {
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

      <main className="flex-1 px-6 py-6 space-y-4 max-w-3xl w-full mx-auto flex flex-col items-center">
        <CameraCapture />
      </main>
    </div>
  );
}

