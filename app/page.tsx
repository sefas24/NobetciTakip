import Link from "next/link";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";

export default async function AnaSayfa() {
  const store = await cookies();
  const role = store.get("nt_role")?.value;
  const email = store.get("nt_email")?.value;

  // Admin giriş yaptıysa direkt admin paneline gitsin
  if (role === "admin") {
    redirect("/admin");
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Üst Bar */}
      <header className="w-full bg-white shadow-sm z-10 px-4 py-4 flex justify-between items-center">
        <div>
          <h1 className="text-xl font-bold text-gray-900">Ofis Nöbet</h1>
          <p className="text-xs text-gray-500 mt-1">
            Bugün kimin nerede, ne zaman çalıştığını tek yerden takip et.
          </p>
        </div>
        <div className="flex flex-col items-end gap-2">
          <div className="text-[11px] text-gray-500">
            {email ? <span>{email}</span> : <span>Giriş yapıldı</span>}
          </div>
          <div className="flex items-center gap-2">
            <Link
              href="/logout"
              className="text-xs bg-white border border-gray-200 text-gray-700 px-3 py-1.5 rounded-full hover:border-gray-300 transition"
            >
              Çıkış
            </Link>
          </div>
        </div>
      </header>

      {/* Orta: 3 Ana Buton (Öğrenciler için) */}
      <main className="flex-1 flex flex-col items-center justify-center px-6 gap-4">
        {/* 1. Kamera */}
        <Link
          href="/kamera"
          className="w-full max-w-md bg-gradient-to-r from-indigo-500 to-blue-500 text-white rounded-2xl px-6 py-4 shadow-lg flex items-center gap-4 hover:shadow-xl transition"
        >
          <div className="text-3xl">📸</div>
          <div className="flex flex-col">
            <span className="text-base font-semibold">Kamera</span>
            <span className="text-xs text-indigo-100">
              Nöbet kanıtı fotoğraflarını yükle / görüntüle.
            </span>
          </div>
        </Link>

        {/* 2. Mesaisi Olanlar & Nöbetçiler */}
        <Link
          href="/mesai-nobet"
          className="w-full max-w-md bg-white border border-gray-200 text-gray-900 rounded-2xl px-6 py-4 shadow-sm flex items-center gap-4 hover:border-blue-400 hover:shadow-md transition"
        >
          <div className="text-3xl">📋</div>
          <div className="flex flex-col">
            <span className="text-base font-semibold">
              Mesaisi Olanlar & Nöbetçiler
            </span>
            <span className="text-xs text-gray-500">
              Bugün kim nöbetçi, kim mesai yapıyor?
            </span>
          </div>
        </Link>

        {/* 3. Gün Seçimi */}
        <Link
          href="/gun-secimi"
          className="w-full max-w-md bg-white border border-gray-200 text-gray-900 rounded-2xl px-6 py-4 shadow-sm flex items-center gap-4 hover:border-blue-400 hover:shadow-md transition"
        >
          <div className="text-3xl">📅</div>
          <div className="flex flex-col">
            <span className="text-base font-semibold">
              Çalışma Günü Tercihi
            </span>
            <span className="text-xs text-gray-500">
              Hangi günlerde nöbet tutmak istediğini seç.
            </span>
          </div>
        </Link>
      </main>

      {/* Alt küçük açıklama */}
      <footer className="w-full py-3 text-center text-[10px] text-gray-400">
        Nöbetçi Takip Sistemi · Esma & ekip
      </footer>
    </div>
  );
}