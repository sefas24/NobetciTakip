import Link from 'next/link';
import CameraCapture from './components/CameraCapture'; // Kameranın olduğu dizine göre ayarla

export default function HomePage() {
  return (
    <main className="min-h-screen bg-gray-100 p-4">
      {/* Sağ Üst Navbar */}
      <div className="flex justify-end mb-8">
        <Link 
          href="/login" 
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition"
        >
          Admin Girişi
        </Link>
      </div>

      {/* Senin Kamera Modülün */}
      <div className="flex justify-center items-center">
        <CameraCapture />
      </div>
    </main>
  );
}
