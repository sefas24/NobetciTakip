import CameraCapture from "@/components/CameraCapture"; // Veya '../components/CameraCapture'

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-4 bg-gray-100">
      
      <h1 className="text-3xl font-bold mb-8 text-blue-800">
        Nöbet Takip Sistemi
      </h1>

      {/* Hazırladığımız Kamera Modülü Burada */}
      <CameraCapture />

    </main>
  );
}