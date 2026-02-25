"use client"; // Form kullanacağımız için burası client-side çalışmalı

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function LoginPage() {
  // Kullanıcının girdiği verileri tuttuğumuz hafızalar (State'ler)
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const router = useRouter();

  // "Giriş Yap" butonuna basıldığında çalışacak fonksiyon
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault(); // Sayfanın beyaz ekran olup yenilenmesini engeller
    
    console.log("Girilen Bilgiler:", email, password);
    
    // NOT: Backend ekibi (Buğra/Esma) Supabase giriş kodlarını buraya yazacak!
    // Şimdilik test amaçlı direkt admin sayfasına yönlendiriyoruz:
    router.push('/admin'); 
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 p-4">
      
      {/* Giriş Kartı */}
      <div className="bg-white p-8 rounded-2xl shadow-lg w-full max-w-md">
        
        {/* Başlık */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-extrabold text-gray-900">Admin Girişi</h1>
          <p className="text-gray-500 mt-2 text-sm">Nöbetçi Takip Sistemi Yönetim Paneli</p>
        </div>

        {/* Giriş Formu */}
        <form onSubmit={handleLogin} className="space-y-5">
          
          {/* Email Kutusu */}
          <div>
            <label className="block text-sm font-bold text-gray-900 mb-1">E-posta Adresi</label>
                <input 
                    type="email" 
                    placeholder="admin@okul.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    // text-gray-900 ve font-semibold ekledik:
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg text-gray-900 font-semibold focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                    required
                    />
          </div>

          {/* Şifre Kutusu */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">Şifre</label>
                <input 
                    type="password" 
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    // text-gray-900 ve font-semibold ekledik:
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg text-gray-900 font-semibold focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                    required
                />
          </div>

          {/* Buton */}
          <button 
            type="submit" 
            className="w-full bg-blue-600 text-white font-bold py-3 px-4 rounded-lg hover:bg-blue-700 transition-colors shadow-md mt-4"
          >
            Sisteme Giriş Yap
          </button>
          
        </form>

        {/* Ana Sayfaya Dönüş Linki */}
        <div className="mt-6 text-center">
          <Link href="/" className="text-sm text-blue-600 hover:text-blue-800 font-medium transition">
            &larr; Kameraya (Ana Sayfaya) Dön
          </Link>
        </div>

      </div>
    </div>
  );
}