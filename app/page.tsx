import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { listApproved } from "@/lib/mesaiStore";
import SidebarMenu from "@/components/SidebarMenu";
import { AdminLoginButton } from "@/components/AdminLoginButton";

const DAY_NAMES = ["Pazar","Pazartesi","Salı","Çarşamba","Perşembe","Cuma","Cumartesi"];

export default async function AnaSayfa() {
  const store = await cookies();
  const role = store.get("nt_role")?.value;
  const email = store.get("nt_email")?.value;
  const name = store.get("nt_isim_soyisim")?.value;

  if (role === "admin") redirect("/admin");

  const displayName = name || email || "Öğrenci";
  const firstName = displayName.split(" ")[0];

  const approved = await listApproved();

  const todayIndex = new Date().getDay();
  const todayName = DAY_NAMES[todayIndex];
  const isWeekend = todayIndex === 0 || todayIndex === 6;

  const morningSlot = `${todayName} Öğleden Önce`;
  const afternoonSlot = `${todayName} Öğleden Sonra`;

  const isDutyToday = approved.some(
    (p) => p.email === email && (p.dutySlots.includes(morningSlot) || p.dutySlots.includes(afternoonSlot))
  );

  const morningDuty   = approved.filter((p) => p.dutySlots.includes(morningSlot));
  const morningMesai  = approved.filter((p) => p.slots.includes(morningSlot) && !p.dutySlots.includes(morningSlot));
  const afternoonDuty = approved.filter((p) => p.dutySlots.includes(afternoonSlot));
  const afternoonMesai= approved.filter((p) => p.slots.includes(afternoonSlot) && !p.dutySlots.includes(afternoonSlot));

  const myMorningSlot   = isDutyToday && approved.find((p) => p.email === email && p.dutySlots.includes(morningSlot));
  const myAfternoonSlot = isDutyToday && approved.find((p) => p.email === email && p.dutySlots.includes(afternoonSlot));

  return (
    <div className="min-h-screen bg-white flex flex-col">
      {/* Header */}
      <header className="bg-white border-b border-slate-800 sticky top-0 z-10 px-4 py-3 flex justify-between items-center">
        <SidebarMenu role={role} />
        <div className="flex items-center gap-2">
          <div className="flex flex-col items-end">
            <span className="text-sm font-semibold text-slate-800 leading-tight">{displayName}</span>
            <span className="text-[10px] text-slate-400">Öğrenci Paneli</span>
          </div>
          <AdminLoginButton />
        </div>
      </header>

      <main className="flex-1 px-4 py-6 max-w-lg mx-auto w-full flex flex-col gap-4">

        {/* Karşılama */}
        <div>
          <h1 className="text-xl font-bold text-slate-900 leading-tight">
            Merhaba, {firstName} 👋
          </h1>
          <p className="text-xs text-slate-400 mt-0.5">Bugünkü ofis programı ve çalışma durumun.</p>
        </div>

        {/* Nöbetçi uyarı kartı */}
        {isDutyToday && (
          <div className="bg-white border border-red-200 rounded-2xl p-4 flex gap-3 items-start">
            <div className="w-8 h-8 rounded-full bg-red-50 border border-red-100 flex items-center justify-center flex-shrink-0 mt-0.5">
              <svg className="w-4 h-4 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" />
              </svg>
            </div>
            <div>
              <p className="text-sm font-bold text-red-700">Bugün nöbetçisiniz</p>
              <p className="text-xs text-red-500 mt-0.5">
                {myMorningSlot && myAfternoonSlot ? "Tüm gün (09:00–17:00)" : myMorningSlot ? "Öğleden önce (09:00–12:30)" : "Öğleden sonra (13:30–17:00)"}
              </p>
            </div>
          </div>
        )}

        {/* Bugünün programı */}
        <div className="bg-white border border-slate-800 rounded-2xl overflow-hidden">
          {/* Kart başlığı */}
          <div className="px-4 py-3 border-b border-slate-800 flex items-center justify-between">
            <div>
              <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Bugünün Programı</p>
              <p className="text-sm font-semibold text-slate-800">{todayName}</p>
            </div>
            <span className={`text-[11px] font-semibold px-2.5 py-1 rounded-full border ${
              isWeekend
                ? "bg-slate-50 text-slate-400 border-slate-800"
                : isDutyToday
                ? "bg-red-50 text-red-700 border-red-100"
                : "bg-teal-50 text-teal-700 border-teal-100"
            }`}>
              {isWeekend ? "Hafta sonu" : isDutyToday ? "Nöbetçisiniz" : "Normal mesai"}
            </span>
          </div>

          {isWeekend ? (
            <div className="px-4 py-8 text-center">
              <p className="text-2xl mb-2">🌴</p>
              <p className="text-sm font-medium text-slate-500">Bugün hafta sonu</p>
              <p className="text-xs text-slate-400 mt-1">Resmi nöbetçi veya mesai bulunmuyor.</p>
            </div>
          ) : (
            <div className="divide-y divide-slate-100">

              {/* Öğleden Önce */}
              <div className="px-4 py-4">
                <div className="flex items-center gap-2 mb-3">
                  <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Öğleden Önce</span>
                  <span className="text-[10px] text-slate-300">09:00–12:30</span>
                </div>

                {/* Nöbetçiler */}
                <div className="mb-3">
                  <p className="text-[10px] font-semibold text-slate-300 uppercase tracking-wider mb-2">Nöbetçiler</p>
                  {morningDuty.length === 0 ? (
                    <p className="text-xs text-slate-300 italic">Atanmadı</p>
                  ) : (
                    <div className="flex flex-wrap gap-1.5">
                      {morningDuty.map((p) => (
                        <span key={p.id}
                          className={`inline-flex items-center gap-1 text-xs font-medium px-2.5 py-1 rounded-full border ${
                            p.email === email
                              ? "bg-red-50 text-red-700 border-red-200"
                              : "bg-amber-50 text-amber-800 border-amber-100"
                          }`}>
                          <span className="w-1.5 h-1.5 rounded-full bg-current opacity-60 flex-shrink-0"></span>
                          {p.fullName || p.email.split("@")[0]}
                        </span>
                      ))}
                    </div>
                  )}
                </div>

                {/* Normal Mesai */}
                <div>
                  <p className="text-[10px] font-semibold text-slate-300 uppercase tracking-wider mb-2">Normal Mesai</p>
                  {morningMesai.length === 0 ? (
                    <p className="text-xs text-slate-300 italic">Kimse yok</p>
                  ) : (
                    <div className="flex flex-wrap gap-1.5">
                      {morningMesai.map((p) => (
                        <span key={p.id}
                          className={`inline-flex items-center gap-1 text-xs px-2.5 py-1 rounded-full border ${
                            p.email === email
                              ? "bg-blue-50 text-blue-700 border-blue-100 font-medium"
                              : "bg-slate-50 text-slate-500 border-slate-800"
                          }`}>
                          {p.fullName || p.email.split("@")[0]}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* Öğleden Sonra */}
              <div className="px-4 py-4">
                <div className="flex items-center gap-2 mb-3">
                  <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Öğleden Sonra</span>
                  <span className="text-[10px] text-slate-300">13:30–17:00</span>
                </div>

                {/* Nöbetçiler */}
                <div className="mb-3">
                  <p className="text-[10px] font-semibold text-slate-300 uppercase tracking-wider mb-2">Nöbetçiler</p>
                  {afternoonDuty.length === 0 ? (
                    <p className="text-xs text-slate-300 italic">Atanmadı</p>
                  ) : (
                    <div className="flex flex-wrap gap-1.5">
                      {afternoonDuty.map((p) => (
                        <span key={p.id}
                          className={`inline-flex items-center gap-1 text-xs font-medium px-2.5 py-1 rounded-full border ${
                            p.email === email
                              ? "bg-red-50 text-red-700 border-red-200"
                              : "bg-amber-50 text-amber-800 border-amber-100"
                          }`}>
                          <span className="w-1.5 h-1.5 rounded-full bg-current opacity-60 flex-shrink-0"></span>
                          {p.fullName || p.email.split("@")[0]}
                        </span>
                      ))}
                    </div>
                  )}
                </div>

                {/* Normal Mesai */}
                <div>
                  <p className="text-[10px] font-semibold text-slate-300 uppercase tracking-wider mb-2">Normal Mesai</p>
                  {afternoonMesai.length === 0 ? (
                    <p className="text-xs text-slate-300 italic">Kimse yok</p>
                  ) : (
                    <div className="flex flex-wrap gap-1.5">
                      {afternoonMesai.map((p) => (
                        <span key={p.id}
                          className={`inline-flex items-center gap-1 text-xs px-2.5 py-1 rounded-full border ${
                            p.email === email
                              ? "bg-blue-50 text-blue-700 border-blue-100 font-medium"
                              : "bg-slate-50 text-slate-500 border-slate-800"
                          }`}>
                          {p.fullName || p.email.split("@")[0]}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              </div>

            </div>
          )}
        </div>

        {/* Alt not */}
        <p className="text-center text-xs text-slate-300 pb-2">
          Tüm haftalık program için yan menüden <span className="font-semibold text-slate-400">Mesai & Nöbetler</span> kısmına bakın.
        </p>

      </main>
    </div>
  );
}
