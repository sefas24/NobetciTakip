import Link from 'next/link';

// DİKKAT: Dosyanın yerini bulması için adresi '../' olarak değiştirdik.
// Eğer yine hata verirse burayı './components/CameraCapture' veya 
// '@/app/components/CameraCapture' olarak değiştirmeyi dene.
import CameraCapture from '../components/CameraCapture';

export default function HomePage() {
  return (
    <main className="min-h-screen bg-gray-100 p-4">
      
      {/* Sağ Üst Navbar (Admin Butonu) */}
      <div className="flex justify-end mb-8">
        <Link 
          href="/login" 
          className="bg-blue-600 text-white px-5 py-2.5 rounded-lg hover:bg-blue-700 transition-colors font-medium shadow-sm"
        >
          Admin Girişi
        </Link>
      </div>

      {/* Senin Kamera Modülün */}
      <div className="flex justify-center items-center mt-10">
        <CameraCapture />
      </div>

    </main>
  );
}
