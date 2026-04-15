import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import Link from "next/link";
import { listApproved, listPreferences } from "@/lib/mesaiStore";
import { WORK_DAYS, morningSlot, afternoonSlot } from "@/constants/schedule";
import type { MesaiPreference } from "@/types";

const DAY_NAMES = ["Pazar","Pazartesi","Salı","Çarşamba","Perşembe","Cuma","Cumartesi"];

function getTodayName() {
  return DAY_NAMES[new Date().getDay()];
}

function buildWeeklyDutyStatus(approved: MesaiPreference[]) {
  const rows: { slot: string; day: string; period: string; people: string[]; done: boolean }[] = [];
  for (const day of WORK_DAYS) {
    for (const slotFn of [morningSlot, afternoonSlot]) {
      const slot = slotFn(day);
      const period = slot.includes("Önce") ? "Öğleden Önce" : "Öğleden Sonra";
      const dutyPeople = approved
        .filter((p) => p.dutySlots.includes(slot))
        .map((p) => p.fullName || p.email.split("@")[0]);
      const todayIdx = new Date().getDay();
      const dayIdx = DAY_NAMES.indexOf(day);
      const done = dayIdx < todayIdx && dayIdx !== 0;
      rows.push({ slot, day, period, people: dutyPeople, done });
    }
  }
  return rows;
}

export default async function AdminDashboard() {
  const jar = await cookies();
  const role = jar.get("nt_role")?.value;
  const adminName = jar.get("nt_isim_soyisim")?.value || jar.get("nt_email")?.value || "Admin";

  if (role !== "admin") redirect("/login");

  const [approved, allPrefs] = await Promise.all([listApproved(), listPreferences()]);

  const todayName = getTodayName();
  const isWeekday = !["Pazar", "Cumartesi"].includes(todayName);

  const todayMorning = morningSlot(todayName as Parameters<typeof morningSlot>[0]);
  const todayAfternoon = afternoonSlot(todayName as Parameters<typeof afternoonSlot>[0]);

  const todayDuty = approved.filter(
    (p) => p.dutySlots.includes(todayMorning) || p.dutySlots.includes(todayAfternoon)
  );
  const todayMesai = approved.filter(
    (p) =>
      !p.dutySlots.includes(todayMorning) &&
      !p.dutySlots.includes(todayAfternoon) &&
      (p.slots.includes(todayMorning) || p.slots.includes(todayAfternoon))
  );
  const todayOff = allPrefs.filter(
    (p) =>
      p.status === "approved" &&
      !p.slots.includes(todayMorning) &&
      !p.slots.includes(todayAfternoon)
  );

  const totalToday = todayDuty.length + todayMesai.length + todayOff.length;

  const withPhotoToday = approved.filter(
    (p) => p.imageUrl && (p.dutySlots.includes(todayMorning) || p.dutySlots.includes(todayAfternoon))
  );
  const pendingPhotoToday = todayDuty.filter((p) => !p.imageUrl);

  const weeklySlots = buildWeeklyDutyStatus(approved);
  const doneCount = weeklySlots.filter((s) => s.done).length;
  const totalSlots = weeklySlots.length;
  const pct = totalSlots > 0 ? Math.round((doneCount / totalSlots) * 100) : 0;

  const R = 32;
  const CIRC = 2 * Math.PI * R;
  const dutyDash = totalToday > 0 ? (todayDuty.length / totalToday) * CIRC : 0;
  const mesaiDash = totalToday > 0 ? (todayMesai.length / totalToday) * CIRC : 0;
  const offDash = totalToday > 0 ? (todayOff.length / totalToday) * CIRC : 0;

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="bg-white border-b border-slate-300 sticky top-0 z-10">
        <div className="max-w-screen-2xl mx-auto px-4 md:px-10 py-4 flex justify-between items-center">
          <div>
            <h1 className="text-lg font-bold text-slate-900 leading-tight">Ofis Nöbet — Admin Paneli</h1>
            <p className="text-xs text-slate-500 mt-0.5">{todayName} · Hoş geldin, {adminName}</p>
          </div>
          <Link
            href="/logout"
            className="text-xs bg-slate-900 text-white px-3 py-1.5 rounded-full hover:bg-slate-700 transition"
          >
            Çıkış
          </Link>
        </div>
      </header>

      <main className="max-w-screen-2xl mx-auto px-4 md:px-10 py-8">
        <div className="bg-white border border-slate-300 rounded-2xl p-4 flex flex-col gap-4">

          {/* ÜST SATIR: mobilde alt alta, masaüstünde 70/30 */}
          <div className="flex flex-col md:grid md:gap-4" style={{ gridTemplateColumns: "7fr 3fr" }}>

            {/* SOL ÜST — Fotoğraf Kanıt */}
            <div className="border border-slate-300 rounded-xl p-5 flex flex-col gap-4 bg-white mb-4 md:mb-0">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-0.5">Fotoğraf Kanıt Sistemi</p>
                  <p className="text-sm font-semibold text-slate-800">Bugünkü nöbetçi kanıtları</p>
                </div>
                <div className="flex gap-2">
                  <span className="inline-flex items-center gap-1 text-[11px] font-semibold px-2.5 py-1 rounded-full bg-teal-50 text-teal-800 border border-teal-100">
                    <span className="w-1.5 h-1.5 rounded-full bg-teal-500 inline-block"></span>
                    {withPhotoToday.length} kanıt yüklendi
                  </span>
                  {pendingPhotoToday.length > 0 && (
                    <span className="inline-flex items-center gap-1 text-[11px] font-semibold px-2.5 py-1 rounded-full bg-amber-50 text-amber-800 border border-amber-100">
                      <span className="w-1.5 h-1.5 rounded-full bg-amber-400 inline-block"></span>
                      {pendingPhotoToday.length} bekleniyor
                    </span>
                  )}
                </div>
              </div>

              <div className="border-t border-slate-300 pt-4">
                {!isWeekday ? (
                  <p className="text-sm text-slate-400 text-center py-4">Bugün hafta sonu — nöbet yok.</p>
                ) : todayDuty.length === 0 ? (
                  <p className="text-sm text-slate-400 text-center py-4">Bugün için nöbetçi atanmamış.</p>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {todayDuty.map((p) => {
                      const photos = p.imageUrl ? p.imageUrl.split(",") : [];
                      const hasMorning = p.dutySlots.includes(todayMorning);
                      const hasAfternoon = p.dutySlots.includes(todayAfternoon);
                      return (
                        <div key={p.id} className="flex items-start gap-3 bg-white border border-slate-300 rounded-xl p-3">
                          <div className="w-9 h-9 rounded-full bg-slate-100 flex items-center justify-center text-xs font-bold text-slate-600 flex-shrink-0">
                            {(p.fullName || p.email).charAt(0).toUpperCase()}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-semibold text-slate-800 truncate">
                              {p.fullName || p.email.split("@")[0]}
                            </p>
                            <p className="text-[11px] text-slate-400 mt-0.5">
                              {hasMorning && hasAfternoon ? "Tüm gün" : hasMorning ? "Öğleden önce" : "Öğleden sonra"}
                            </p>
                            {photos.length > 0 ? (
                              <div className="flex gap-1.5 mt-2 flex-wrap">
                                {photos.map((url, i) => (
                                  <a key={i} href={url} target="_blank" rel="noopener noreferrer"
                                    className="text-[11px] text-teal-700 font-medium underline underline-offset-2">
                                    Kanıt {photos.length > 1 ? i + 1 : ""}
                                  </a>
                                ))}
                              </div>
                            ) : (
                              <span className="inline-block mt-2 text-[11px] text-amber-600 font-medium bg-amber-50 px-2 py-0.5 rounded-full border border-amber-100">
                                Henüz yüklenmedi
                              </span>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>

            {/* SAĞ ÜST — Donut Grafik */}
            <div className="border border-slate-300 rounded-xl p-5 flex flex-col gap-4 bg-white">
              <div>
                <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-0.5">Bugünkü Durum</p>
                <p className="text-sm font-semibold text-slate-800">{totalToday} kişi kayıtlı</p>
              </div>
              <div className="flex-1 flex flex-col items-center justify-center gap-4">
                <svg width="100" height="100" viewBox="0 0 80 80">
                  <circle cx="40" cy="40" r={R} fill="none" stroke="#F1EFE8" strokeWidth="12" />
                  {totalToday === 0 ? (
                    <circle cx="40" cy="40" r={R} fill="none" stroke="#E2E8F0" strokeWidth="12" />
                  ) : (
                    <>
                      <circle cx="40" cy="40" r={R} fill="none" stroke="#1D9E75" strokeWidth="12"
                        strokeDasharray={`${dutyDash} ${CIRC - dutyDash}`}
                        strokeDashoffset={CIRC * 0.25} strokeLinecap="butt" transform="rotate(-90 40 40)" />
                      <circle cx="40" cy="40" r={R} fill="none" stroke="#378ADD" strokeWidth="12"
                        strokeDasharray={`${mesaiDash} ${CIRC - mesaiDash}`}
                        strokeDashoffset={CIRC * 0.25 - dutyDash} strokeLinecap="butt" transform="rotate(-90 40 40)" />
                      <circle cx="40" cy="40" r={R} fill="none" stroke="#D3D1C7" strokeWidth="12"
                        strokeDasharray={`${offDash} ${CIRC - offDash}`}
                        strokeDashoffset={CIRC * 0.25 - dutyDash - mesaiDash} strokeLinecap="butt" transform="rotate(-90 40 40)" />
                    </>
                  )}
                  <text x="40" y="37" textAnchor="middle" fontSize="14" fontWeight="600" fill="#1E293B" fontFamily="system-ui">{totalToday}</text>
                  <text x="40" y="50" textAnchor="middle" fontSize="9" fill="#94A3B8" fontFamily="system-ui">kişi</text>
                </svg>
                <div className="w-full space-y-2">
                  <div className="flex items-center justify-between text-xs">
                    <div className="flex items-center gap-1.5">
                      <span className="w-2.5 h-2.5 rounded-full bg-teal-500 inline-block flex-shrink-0"></span>
                      <span className="text-slate-600">Nöbetçi</span>
                    </div>
                    <span className="font-semibold text-slate-800">{todayDuty.length}</span>
                  </div>
                  <div className="flex items-center justify-between text-xs">
                    <div className="flex items-center gap-1.5">
                      <span className="w-2.5 h-2.5 rounded-full bg-blue-400 inline-block flex-shrink-0"></span>
                      <span className="text-slate-600">Mesaili</span>
                    </div>
                    <span className="font-semibold text-slate-800">{todayMesai.length}</span>
                  </div>
                  <div className="flex items-center justify-between text-xs">
                    <div className="flex items-center gap-1.5">
                      <span className="w-2.5 h-2.5 rounded-full bg-slate-300 inline-block flex-shrink-0"></span>
                      <span className="text-slate-600">Ofis dışı</span>
                    </div>
                    <span className="font-semibold text-slate-800">{todayOff.length}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* ALT SATIR: mobilde alt alta, masaüstünde 50/50 */}
          <div className="flex flex-col md:grid md:grid-cols-2 gap-4">

            {/* SOL ALT — Bugün ofiste olanlar */}
            <div className="border border-slate-300 rounded-xl p-5 flex flex-col gap-3 bg-white mb-4 md:mb-0">
              <div>
                <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-0.5">Bugün Ofiste</p>
                <p className="text-sm font-semibold text-slate-800">{todayName} — kimler var?</p>
              </div>
              <div className="border-t border-slate-300 pt-3 flex flex-col gap-3 overflow-y-auto max-h-52">
                {!isWeekday ? (
                  <p className="text-sm text-slate-400">Bugün hafta sonu.</p>
                ) : (
                  <>
                    {todayDuty.length > 0 && (
                      <div>
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">Nöbetçiler</p>
                        <div className="space-y-1.5">
                          {todayDuty.map((p) => (
                            <div key={p.id} className="flex items-center gap-2">
                              <span className="w-2 h-2 rounded-full bg-teal-500 flex-shrink-0"></span>
                              <span className="text-sm text-slate-700">{p.fullName || p.email.split("@")[0]}</span>
                              <span className="ml-auto text-[10px] font-semibold px-2 py-0.5 rounded-full bg-teal-50 text-teal-700 border border-teal-100">
                                {p.dutySlots.includes(todayMorning) && p.dutySlots.includes(todayAfternoon)
                                  ? "Tüm gün"
                                  : p.dutySlots.includes(todayMorning) ? "Sabah" : "Öğleden sonra"}
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                    {todayMesai.length > 0 && (
                      <div>
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">Normal Mesai</p>
                        <div className="space-y-1.5">
                          {todayMesai.map((p) => (
                            <div key={p.id} className="flex items-center gap-2">
                              <span className="w-2 h-2 rounded-full bg-blue-400 flex-shrink-0"></span>
                              <span className="text-sm text-slate-700">{p.fullName || p.email.split("@")[0]}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                    {todayDuty.length === 0 && todayMesai.length === 0 && (
                      <p className="text-sm text-slate-400">Bugün ofiste kimse yok.</p>
                    )}
                  </>
                )}
              </div>
            </div>

            {/* SAĞ ALT — Haftalık nöbet durumu */}
            <div className="border border-slate-300 rounded-xl p-5 flex flex-col gap-3 bg-white">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-0.5">Bu Hafta Nöbet</p>
                  <p className="text-sm font-semibold text-slate-800">Tamamlanan görevler</p>
                </div>
                <span className="text-xs font-bold text-slate-500">{doneCount}/{totalSlots}</span>
              </div>
              <div className="h-1.5 rounded-full bg-slate-100 overflow-hidden">
                <div className="h-full rounded-full bg-teal-500 transition-all" style={{ width: `${pct}%` }} />
              </div>
              <div className="border-t border-slate-300 pt-2 flex flex-col gap-1.5 overflow-y-auto max-h-44">
                {weeklySlots.map((row) => (
                  <div key={row.slot} className="flex items-center gap-2 text-xs">
                    <span className={`w-4 h-4 rounded flex items-center justify-center flex-shrink-0 text-[9px] font-bold ${
                      row.done ? "bg-teal-50 text-teal-700 border border-teal-200" : "bg-slate-100 text-slate-400 border border-slate-300"
                    }`}>
                      {row.done ? "✓" : "–"}
                    </span>
                    <span className="text-slate-600 flex-1 truncate">{row.day} {row.period}</span>
                    <span className={`text-[10px] font-semibold flex-shrink-0 ${row.done ? "text-teal-600" : "text-slate-400"}`}>
                      {row.done ? "Tamamlandı" : row.people.length > 0 ? "Devam ediyor" : "Bekliyor"}
                    </span>
                  </div>
                ))}
              </div>
            </div>

          </div>
        </div>
      </main>
    </div>
  );
}
