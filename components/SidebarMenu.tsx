"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function SidebarMenu({ role }: { role?: string }) {
  const [isOpen, setIsOpen] = useState(false);
  const router = useRouter();

  const toggleSidebar = () => setIsOpen(!isOpen);

  const handleLogout = async () => {
    // Normal link vermek yerine router ile çıkışa yönlendirebiliriz,
    // ya da Next.js <Link> ile doğrudan /logout rotasına gidebiliriz.
    router.push("/logout");
  };

  return (
    <>
      {/* HAMBURGER ICON */}
      <button 
        onClick={toggleSidebar} 
        className="p-2 -ml-2 text-slate-600 hover:bg-slate-100 rounded-full transition-colors z-50 focus:outline-none"
        aria-label="Menüyü Aç"
      >
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-6 h-6">
          <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" />
        </svg>
      </button>

      {/* OVERLAY (Arkaplan Karartması) */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-40 transition-opacity"
          onClick={toggleSidebar}
        />
      )}

      {/* SİDEBAR PANEL (Soldan Çıkan Menü) */}
      <div 
        className={`fixed top-0 left-0 h-full w-72 bg-white shadow-2xl z-50 transform transition-transform duration-300 ease-in-out ${isOpen ? "translate-x-0" : "-translate-x-full"}`}
      >
        <div className="flex flex-col h-full">
          
          {/* Header */}
          <div className="p-5 border-b border-gray-100 flex justify-between items-center bg-slate-50">
            <div>
              <h2 className="font-black text-slate-800 text-lg">Ofis Nöbet</h2>
              <p className="text-[10px] text-slate-500 font-medium">Navigasyon Menüsü</p>
            </div>
            <button onClick={toggleSidebar} className="p-2 text-slate-400 hover:bg-slate-200 hover:text-slate-700 rounded-full transition-colors">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-5 h-5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Menü Linkleri */}
          <nav className="flex-1 px-3 py-4 space-y-1">
            <Link 
              href="/" 
              onClick={toggleSidebar}
              className="flex items-center gap-3 px-4 py-3 text-sm font-medium text-slate-700 rounded-xl hover:bg-indigo-50 hover:text-indigo-600 transition-colors"
            >
              <span className="text-xl">🏠</span>
              Ana Sayfa (Bugün)
            </Link>

            <Link 
              href="/mesai-nobet" 
              onClick={toggleSidebar}
              className="flex items-center gap-3 px-4 py-3 text-sm font-medium text-slate-700 rounded-xl hover:bg-indigo-50 hover:text-indigo-600 transition-colors"
            >
              <span className="text-xl">📋</span>
              Mesai & Nöbetler
            </Link>

            <Link 
              href="/kamera" 
              onClick={toggleSidebar}
              className="flex items-center gap-3 px-4 py-3 text-sm font-medium text-slate-700 rounded-xl hover:bg-indigo-50 hover:text-indigo-600 transition-colors"
            >
              <span className="text-xl">📸</span>
              Kamera & Fotoğraf
            </Link>

            {/* Adminlere Özel Link */}
            {role === "admin" && (
              <>
                <div className="pt-4 pb-2 px-4">
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Yönetim</p>
                </div>
                <Link 
                  href="/admin" 
                  onClick={toggleSidebar}
                  className="flex items-center gap-3 px-4 py-3 text-sm font-medium text-rose-600 rounded-xl hover:bg-rose-50 transition-colors"
                >
                  <span className="text-xl">⚙️</span>
                  Admin Paneli
                </Link>
              </>
            )}
          </nav>

          {/* Çıkış Butonu */}
          <div className="p-4 border-t border-gray-100 bg-slate-50">
            <button 
              onClick={handleLogout}
              className="w-full flex justify-center items-center gap-2 py-3 bg-white border border-gray-200 text-slate-600 rounded-xl text-sm font-semibold shadow-sm hover:shadow-md hover:border-slate-300 transition-all"
            >
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4">
                <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 9V5.25A2.25 2.25 0 0013.5 3h-6a2.25 2.25 0 00-2.25 2.25v13.5A2.25 2.25 0 007.5 21h6a2.25 2.25 0 002.25-2.25V15M12 9l-3 3m0 0l3 3m-3-3h12.75" />
              </svg>
              Sistemden Çıkış Yap
            </button>
          </div>

        </div>
      </div>
    </>
  );
}
