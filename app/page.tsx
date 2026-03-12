import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { listApproved } from "@/lib/mesaiStore";
import DayCard from "@/components/DayCard";
import SidebarMenu from "@/components/SidebarMenu";

export default async function AnaSayfa() {
  const store = await cookies();
  const role = store.get("nt_role")?.value;
  const email = store.get("nt_email")?.value;
  const fullName = store.get("nt_isim_soyisim")?.value;

  // Admin giriş yaptıysa direkt admin paneline gitsin.
  // Öğrenci panelinin mobil dashboard versiyonunu kodluyoruz:
  if (role === "admin") {
    redirect("/admin");
  }

  const displayName = fullName || email || "Öğrenci";

  // Veritabanından mevcut mesaileri çek
  const approved = await listApproved();

  // BUGÜNÜN GÜNÜNÜ BUL
  // Gerçek kullanımda sunucu/kullanıcı saati uyuşmazlığı olabilir ancak JS ile basitçe:
  const daysTr = ["Pazar", "Pazartesi", "Salı", "Çarşamba", "Perşembe", "Cuma", "Cumartesi"];
  const todayIndex = new Date().getDay();
  const todayName = daysTr[todayIndex];

  // Bugün hafta sonu ise basit bir mesaj çıkar
  const isWeekend = todayIndex === 0 || todayIndex === 6;

  // BUGÜNÜN MESAİ VERİLERİNİ FİLTRELE
  const morningSlot = `${todayName} Öğleden Önce`;
  const afternoonSlot = `${todayName} Öğleden Sonra`;

  // KULLANICI BUGÜN NÖBETÇİ Mİ? (Email ile kontrol ediyoruz listeye isim girmeden önce)
  const isDutyToday = approved.some(p => p.email === email && (p.dutySlots.includes(morningSlot) || p.dutySlots.includes(afternoonSlot)));

  // Listede görünecek isimleri belirle (Ad-Soyad varsa onu kullan, yoksa mecburen mailini göster)
  const morningDuty = approved.filter(p => p.dutySlots.includes(morningSlot)).map(p => p.fullName || p.email);
  const morningMesai = approved.filter(p => p.slots.includes(morningSlot) && !p.dutySlots.includes(morningSlot)).map(p => p.fullName || p.email);

  const afternoonDuty = approved.filter(p => p.dutySlots.includes(afternoonSlot)).map(p => p.fullName || p.email);
  const afternoonMesai = approved.filter(p => p.slots.includes(afternoonSlot) && !p.dutySlots.includes(afternoonSlot)).map(p => p.fullName || p.email);

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Üst Bar (Sidebar ve İsim) */}
      <header className="w-full bg-white shadow-sm z-10 px-4 py-4 flex justify-between items-center sticky top-0">
        <SidebarMenu role={role} />
        
        <div className="flex flex-col items-end">
          <span className="text-sm font-bold text-slate-800">{displayName}</span>
          <span className="text-[10px] text-gray-500">{role === "student" ? "Öğrenci Paneli" : ""}</span>
        </div>
      </header>

      <main className="flex-1 px-4 py-6 max-w-lg mx-auto w-full flex flex-col gap-6">
        
        {/* Karşılama ve Uyarı Afişi */}
        <div className="mb-2">
          <h1 className="text-2xl font-black text-slate-900 tracking-tight mb-1">
            Merhaba, {displayName} 👋
          </h1>
          <p className="text-sm text-slate-500">Bugünkü çalışma durumun ve ofis programı.</p>
        </div>

        {isDutyToday && (
          <div className="bg-red-500 text-white rounded-2xl p-6 shadow-red-200 shadow-lg relative overflow-hidden animate-pulse-slow">
            <div className="absolute top-0 right-0 p-4 opacity-20 text-6xl">🚨</div>
            <h2 className="text-xl font-black mb-1">DİKKAT!</h2>
            <p className="font-medium text-red-50">Bugün ofiste nöbetçi olarak görevlisiniz. Lütfen zaman çizelgesine uyunuz.</p>
          </div>
        )}

        {/* Bugünün Programı (DayCard) */}
        <div>
          <h3 className="text-sm font-bold text-gray-600 uppercase tracking-widest mb-3">
             BUGÜNÜN PROGRAMI ({todayName})
          </h3>
          
          {isWeekend ? (
             <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-8 text-center text-gray-500">
               Bugün hafta sonu, ofiste resmi nöbetçi veya mesai bulunmuyor. İyi tatiller! 🌴
             </div>
          ) : (
            <DayCard
              day={todayName}
              morningDuty={morningDuty}
              morningMesai={morningMesai}
              afternoonDuty={afternoonDuty}
              afternoonMesai={afternoonMesai}
            />
          )}
        </div>

        <div className="text-center mt-4">
           <p className="text-xs text-gray-400">
             Tüm haftanın çalışma listesini görmek için yan menüden <b>Mesai & Nöbetler</b> kısmına bakabilirsiniz.
           </p>
        </div>

      </main>
    </div>
  );
}