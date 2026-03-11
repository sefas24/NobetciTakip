import Link from "next/link";
import { cookies } from "next/headers";
import { listApproved } from "@/lib/mesaiStore";

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
      <header className="w-full bg-white shadow-sm z-10 px-4 py-4 flex justify-between items-center">
        <div>
          <h1 className="text-lg font-bold text-gray-900">
            Haftalık Mesai & Nöbet Listesi
          </h1>
          <p className="text-xs text-gray-500 mt-1">
            Hangi gün kimin nerede çalıştığını aşağıdan görebilirsin.
          </p>
        </div>
        <Link
          href="/"
          className="text-xs text-blue-600 hover:text-blue-800 font-medium"
        >
          Ana menü
        </Link>
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
              const morningDuty = approved.filter(p => p.dutySlots.includes(morningSlot)).map(p => p.email);
              const morningMesai = approved.filter(p => p.slots.includes(morningSlot) && !p.dutySlots.includes(morningSlot)).map(p => p.email);

              const afternoonDuty = approved.filter(p => p.dutySlots.includes(afternoonSlot)).map(p => p.email);
              const afternoonMesai = approved.filter(p => p.slots.includes(afternoonSlot) && !p.dutySlots.includes(afternoonSlot)).map(p => p.email);

              return (
                <div key={day} className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden flex flex-col">
                  {/* Kart Başlığı (GÜN) */}
                  <div className="bg-slate-800 px-4 py-3 flex justify-between items-center">
                    <h2 className="text-sm font-bold text-white uppercase tracking-wide">{day}</h2>
                  </div>

                  <div className="p-0 flex-1 flex flex-col divide-y divide-gray-100">

                    {/* ÖĞLEDEN ÖNCE BÖLÜMÜ */}
                    <div className="p-4 bg-slate-50/50">
                      <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider mb-3 flex items-center gap-2">
                        <span>🌅</span> Öğleden Önce
                      </h3>

                      <div className="space-y-3">
                        {/* Sabah Nöbetçileri */}
                        <div>
                          <p className="text-[10px] font-semibold text-gray-400 uppercase mb-1.5">Nöbetçiler</p>
                          {morningDuty.length === 0 ? (
                            <p className="text-xs text-gray-400 italic">Nöbetçi yok</p>
                          ) : (
                            <ul className="space-y-1">
                              {morningDuty.map(name => (
                                <li key={`m-d-${name}`} className="text-sm px-2.5 py-1 rounded bg-amber-50 text-amber-900 border border-amber-100 font-medium inline-block mr-1 mb-1">
                                  ⭐ {name}
                                </li>
                              ))}
                            </ul>
                          )}
                        </div>

                        {/* Sabah Mesaisi */}
                        <div>
                          <p className="text-[10px] font-semibold text-gray-400 uppercase mb-1.5">Normal Mesai</p>
                          {morningMesai.length === 0 ? (
                            <p className="text-xs text-gray-400 italic">Mesaiye kalan yok</p>
                          ) : (
                            <ul className="space-y-1">
                              {morningMesai.map(name => (
                                <li key={`m-m-${name}`} className="text-sm px-2.5 py-1 text-gray-600 inline-block mr-1 mb-1">
                                  {name}
                                </li>
                              ))}
                            </ul>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* ÖĞLEDEN SONRA BÖLÜMÜ */}
                    <div className="p-4 bg-white">
                      <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider mb-3 flex items-center gap-2">
                        <span>🌇</span> Öğleden Sonra
                      </h3>

                      <div className="space-y-3">
                        {/* Akşam Nöbetçileri */}
                        <div>
                          <p className="text-[10px] font-semibold text-gray-400 uppercase mb-1.5">Nöbetçiler</p>
                          {afternoonDuty.length === 0 ? (
                            <p className="text-xs text-gray-400 italic">Nöbetçi yok</p>
                          ) : (
                            <ul className="space-y-1">
                              {afternoonDuty.map(name => (
                                <li key={`a-d-${name}`} className="text-sm px-2.5 py-1 rounded bg-amber-50 text-amber-900 border border-amber-100 font-medium inline-block mr-1 mb-1">
                                  ⭐ {name}
                                </li>
                              ))}
                            </ul>
                          )}
                        </div>

                        {/* Akşam Mesaisi */}
                        <div>
                          <p className="text-[10px] font-semibold text-gray-400 uppercase mb-1.5">Normal Mesai</p>
                          {afternoonMesai.length === 0 ? (
                            <p className="text-xs text-gray-400 italic">Mesaiye kalan yok</p>
                          ) : (
                            <ul className="space-y-1">
                              {afternoonMesai.map(name => (
                                <li key={`a-m-${name}`} className="text-sm px-2.5 py-1 text-gray-600 inline-block mr-1 mb-1">
                                  {name}
                                </li>
                              ))}
                            </ul>
                          )}
                        </div>
                      </div>
                    </div>

                  </div>
                </div>
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

