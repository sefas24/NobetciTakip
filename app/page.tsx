import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import SidebarMenu from "@/components/SidebarMenu";
import {
  getCurrentRotationWeek,
  getDutyNamesForDay,
  WEEKLY_MESAI,
  WORK_DAYS,
  type WorkDay,
} from "@/constants/schedule";

const DAY_NAMES = ["Pazar","Pazartesi","Salı","Çarşamba","Perşembe","Cuma","Cumartesi"];

export default async function AnaSayfa() {
  const store = await cookies();
  const role = store.get("nt_role")?.value;
  const email = store.get("nt_email")?.value;
  const name = store.get("nt_isim_soyisim")?.value;

  if (role === "admin") redirect("/admin");

  const displayName = name || email || "Öğrenci";
  const firstName = name ? name.split(" ")[0] : (email || "Öğrenci");

  const now = new Date();
  const todayIndex = now.getDay();
  const todayName = DAY_NAMES[todayIndex];
  const isWeekend = todayIndex === 0 || todayIndex === 6;

  const rotationWeek = getCurrentRotationWeek(now);
  const weekLabel = rotationWeek === 0 ? "H1" : "H2";

  const todayWorkDay = isWeekend
    ? null
    : (WORK_DAYS.find((d) => d === todayName) as WorkDay | undefined);

  const rotationDutyNames: string[] = todayWorkDay
    ? getDutyNamesForDay(todayWorkDay, rotationWeek)
    : [];

  const todayMesai = todayWorkDay ? WEEKLY_MESAI[todayWorkDay] : null;

  const userFirstName = name ? name.split(" ")[0] : null;
  const userFullName = name ?? null;

  const isUserOnDutyToday =
    userFirstName !== null &&
    rotationDutyNames.some((n) => n.toLowerCase() === userFirstName.toLowerCase());

  const isUserMorningMesai = userFullName !== null && todayMesai
    ? todayMesai.morning.some((n) => n.toLowerCase() === userFullName.toLowerCase())
    : false;

  const isUserAfternoonMesai = userFullName !== null && todayMesai
    ? todayMesai.afternoon.some((n) => n.toLowerCase() === userFullName.toLowerCase())
    : false;

  return (
    <div className="min-h-screen bg-white flex flex-col">

      {/* Header */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-10 px-4 py-3 flex justify-between items-center">
        <SidebarMenu role={role} />
        <div className="flex items-center gap-3">
          
          <a href="/login"
            className="text-[11px] font-semibold text-slate-400 hover:text-slate-700 border border-slate-200 rounded-lg px-2.5 py-1 transition"
          >
            Admin
          </a>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-sky-100 flex items-center justify-center flex-shrink-0">
              <span className="text-xs font-bold text-sky-700">
                {(name || email || "?")[0].toUpperCase()}
              </span>
            </div>
            <div className="flex flex-col items-start">
              <span className="text-sm font-semibold text-slate-800 leading-tight">{displayName}</span>
              <span className="text-[10px] text-slate-400">Öğrenci</span>
            </div>
          </div>
        </div>
      </header>

      <main className="flex-1 px-4 py-6 max-w-lg mx-auto w-full flex flex-col gap-4">

        {/* Karşılama */}
        <div>
          <h1 className="text-xl font-bold text-slate-900 leading-tight">
            Merhaba, {firstName} 👋
          </h1>
          <p className="text-xs text-slate-400 mt-0.5">Bugünkü nöbet ve mesai durumu.</p>
        </div>

        {/* Nöbetçi uyarı */}
        {isUserOnDutyToday && !isWeekend && (
          <div className="bg-red-50 border border-red-100 rounded-xl p-4 flex gap-3 items-center">
            <svg className="w-4 h-4 text-red-500 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" />
            </svg>
            <div>
              <p className="text-sm font-bold text-red-700">Bugün nöbetçisiniz</p>
              <p className="text-xs text-red-500 mt-0.5">Tüm gün · 09:00–17:00</p>
            </div>
          </div>
        )}

        {/* Bugün mesaidesin uyarısı */}
        {!isUserOnDutyToday && (isUserMorningMesai || isUserAfternoonMesai) && !isWeekend && (
          <div className="bg-sky-50 border border-sky-100 rounded-xl p-4 flex gap-3 items-center">
            <svg className="w-4 h-4 text-sky-500 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            <div>
              <p className="text-sm font-bold text-sky-700">Bugün mesaidasınız</p>
              <p className="text-xs text-sky-500 mt-0.5">
                {isUserMorningMesai && isUserAfternoonMesai
                  ? "Tüm gün · 09:00–17:00"
                  : isUserMorningMesai
                  ? "Öğleden önce · 09:00–12:30"
                  : "Öğleden sonra · 13:30–17:00"}
              </p>
            </div>
          </div>
        )}

        {/* Nöbetçiler */}
        <div className="bg-white border border-slate-200 rounded-xl overflow-hidden">
          <div className="px-4 py-3 border-b border-slate-100 flex items-center justify-between">
            <div>
              <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Nöbetçiler</p>
              <p className="text-sm font-semibold text-slate-800">{todayName}</p>
            </div>
            {!isWeekend && (
              <span className="text-[11px] font-semibold px-2.5 py-1 rounded-lg border bg-sky-50 text-sky-700 border-sky-100">
                {weekLabel} · Rotasyon
              </span>
            )}
          </div>

          {isWeekend ? (
            <div className="px-4 py-8 text-center">
              <p className="text-2xl mb-2">🌴</p>
              <p className="text-sm font-medium text-slate-500">Bugün hafta sonu</p>
            </div>
          ) : (
            <div className="px-4 py-3 flex flex-wrap gap-2">
              {rotationDutyNames.length === 0 ? (
                <p className="text-xs text-slate-400 italic">Bu gün için nöbet tanımlı değil.</p>
              ) : (
                rotationDutyNames.map((isim) => {
                  const isSelf = userFirstName &&
                    isim.toLowerCase() === userFirstName.toLowerCase();
                  return (
                    <div key={isim} className={`flex items-center gap-2 px-3 py-2 rounded-lg border text-sm font-medium ${
                      isSelf ? "bg-red-50 text-red-700 border-red-100" : "bg-sky-50 text-sky-800 border-sky-100"
                    }`}>
                      <div className={`w-6 h-6 rounded-full flex items-center justify-center text-[11px] font-bold flex-shrink-0 ${
                        isSelf ? "bg-red-100 text-red-700" : "bg-sky-200 text-sky-800"
                      }`}>
                        {isim[0]}
                      </div>
                      {isim}
                      {isSelf && <span className="text-[10px] opacity-70">(Sen)</span>}
                    </div>
                  );
                })
              )}
            </div>
          )}
        </div>

        {/* Mesai */}
        {!isWeekend && todayMesai && (
          <div className="bg-white border border-slate-200 rounded-xl overflow-hidden">
            <div className="px-4 py-3 border-b border-slate-100">
              <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Mesai Programı</p>
              <p className="text-sm font-semibold text-slate-800">{todayName}</p>
            </div>

            <div className="divide-y divide-slate-100">
              {/* Öğleden Önce */}
              <div className="px-4 py-3">
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">
                  Öğleden Önce · 09:00–12:30
                </p>
                <div className="flex flex-wrap gap-1.5">
                  {todayMesai.morning.map((isim) => {
                    const isSelf = userFullName &&
                      isim.toLowerCase() === userFullName.toLowerCase();
                    return (
                      <span key={isim} className={`text-xs px-2.5 py-1 rounded-lg border font-medium ${
                        isSelf
                          ? "bg-sky-100 text-sky-800 border-sky-200"
                          : "bg-slate-50 text-slate-600 border-slate-200"
                      }`}>
                        {isim}
                      </span>
                    );
                  })}
                </div>
              </div>

              {/* Öğleden Sonra */}
              <div className="px-4 py-3">
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">
                  Öğleden Sonra · 13:30–17:00
                </p>
                <div className="flex flex-wrap gap-1.5">
                  {todayMesai.afternoon.map((isim) => {
                    const isSelf = userFullName &&
                      isim.toLowerCase() === userFullName.toLowerCase();
                    return (
                      <span key={isim} className={`text-xs px-2.5 py-1 rounded-lg border font-medium ${
                        isSelf
                          ? "bg-sky-100 text-sky-800 border-sky-200"
                          : "bg-slate-50 text-slate-600 border-slate-200"
                      }`}>
                        {isim}
                      </span>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        )}

        <p className="text-center text-xs text-slate-300 pb-2">
          Tüm haftalık plan için{" "}
          <span className="font-semibold text-slate-400">Mesai & Nöbetler</span> bölümüne bakın.
        </p>

      </main>
    </div>
  );
}