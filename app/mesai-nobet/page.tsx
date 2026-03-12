import Link from "next/link";
import { cookies } from "next/headers";
import { listApproved } from "@/lib/mesaiStore";
import DayCard from "@/components/DayCard";
import SidebarMenu from "@/components/SidebarMenu";

type Role = "admin" | "student" | "unknown";

export default async function MesaiNobetPage() {
  const store = await cookies();
  const role = (store.get("nt_role")?.value as Role | undefined) ?? "unknown";

  // Supabase'den asenkron veriyi çekiyoruz
  const approved = await listApproved();

  // Tüm onaylanmış kayıtlardaki benzersiz slotları (günleri) bulalım ve sıralayalım
  const allSlots = Array.from(new Set(approved.flatMap((p) => p.slots)));

  // Pazartesi'den başlayacak şekilde kabaca bir sıralama
  const daysOrder = ["Pazartesi", "Salı", "Çarşamba", "Perşembe", "Cuma", "Cumartesi", "Pazar"];

  // Sistemde onaylanmış olan kayıtların içinde geçen tüm eşsiz Ana Günleri bulalım
  const activeDays = Array.from(new Set(approved.flatMap((p) =>
    p.slots.map(s => s.split(" ")[0])
  ))).sort((a, b) => daysOrder.indexOf(a) - daysOrder.indexOf(b));

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col relative">
      <header className="w-full bg-white shadow-sm z-10 px-4 py-4 flex justify-between items-center sticky top-0">
        <div className="flex items-center gap-3">
          <SidebarMenu role={role} />
          <div>
            <h1 className="text-lg font-bold text-gray-900">
              Haftalık Mesai & Nöbet Listesi
            </h1>
            <p className="text-xs text-gray-500 mt-1">
              Hangi gün kimin nerede çalıştığını aşağıdan görebilirsin.
            </p>
          </div>
        </div>
      </header>

      <main className="flex-1 pt-6 pb-6 p-4 max-w-5xl mx-auto w-full">
        {activeDays.length === 0 ? (
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-8 text-center text-gray-500">
            Henüz admin tarafından onaylanmış bir mesai listesi bulunmuyor.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 gap-6">
            {activeDays.map((day) => {
              const morningSlot = `${day} Öğleden Önce`;
              const afternoonSlot = `${day} Öğleden Sonra`;

              // Sabah ve Akşam için Nöbetçiler & Mesailer
              const morningDuty = approved.filter(p => p.dutySlots.includes(morningSlot)).map(p => p.fullName || p.email);
              const morningMesai = approved.filter(p => p.slots.includes(morningSlot) && !p.dutySlots.includes(morningSlot)).map(p => p.fullName || p.email);

              const afternoonDuty = approved.filter(p => p.dutySlots.includes(afternoonSlot)).map(p => p.fullName || p.email);
              const afternoonMesai = approved.filter(p => p.slots.includes(afternoonSlot) && !p.dutySlots.includes(afternoonSlot)).map(p => p.fullName || p.email);

              return (
                <DayCard
                  key={day}
                  day={day}
                  morningDuty={morningDuty}
                  morningMesai={morningMesai}
                  afternoonDuty={afternoonDuty}
                  afternoonMesai={afternoonMesai}
                />
              );
            })}
          </div>
        )}

        {role === "admin" && (
          <div className="mt-8 bg-blue-50 border border-blue-100 rounded-xl p-4 text-center">
            <p className="text-xs text-blue-800">
              Detaylı onay ve düzenleme için <Link href="/admin" className="font-bold underline">Admin Paneli</Link> üzerinden "Mesai Tercihleri" bölümünü kullanabilirsin.
            </p>
          </div>
        )}
      </main>
    </div>
  );
}

