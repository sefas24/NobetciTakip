import Link from 'next/link';
import CameraCapture from '../components/CameraCapture';

export default function HomePage() {
  return (
    <main className="min-h-screen bg-gray-100 p-4">
      <div className="flex justify-end mb-8">
        <Link 
          href="/login" 
          className="bg-blue-600 text-white px-5 py-2.5 rounded-lg hover:bg-blue-700 transition-colors font-medium shadow-sm"
        >
          Admin Girişi
        </Link>
      </div>

      <div className="flex justify-center items-center mt-10">
        <CameraCapture />
      </div>
    </main>
  );
}