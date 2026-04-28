import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import Link from "next/link";
import { supabase } from "@/lib/supabase";
import { ProofRequestCard } from "./ProofRequestCard";
import { MesaiDonutChart } from "./MesaiDonutChart";
import { DutyPersonCard } from "./DutyPersonCard";
import {
  getCurrentRotationWeek,
  getDutyNamesForDay,
  WORK_DAYS,
  WEEKLY_MESAI,
  type WorkDay,
} from "@/constants/schedule";

const DAY_NAMES = ["Pazar","Pazartesi","Salı","Çarşamba","Perşembe","Cuma","Cumartesi"];

export default async function AdminDashboard() {
  const jar = await cookies();
  const role = jar.get("nt_role")?.value;
  const adminName = jar.get("nt_isim_soyisim")?.value || jar.get("nt_email")?.value || "Admin";

  if (role !== "admin") redirect("/login");

  const now = new Date();
  const todayIndex = now.getDay();
  const todayName = DAY_NAMES[todayIndex];
  const isWeekday = todayIndex >= 1 && todayIndex <= 5;
  const todayWorkDay = isWeekday
    ? (WORK_DAYS.find((d) => d === todayName) as WorkDay | undefined)
    : undefined;

  // Rotasyondan bugünün nöbetçileri
  const rotationWeek = getCurrentRotationWeek(now);
  const weekLabel = rotationWeek === 0 ? "H1" : "H2";
  const todayDutyNames: string[] = todayWorkDay
    ? getDutyNamesForDay(todayWorkDay, rotationWeek)
    : [];

  // Haftalık rotasyon tablosu (sağ alt)
  const weeklyRows = WORK_DAYS.map((day) => {
    const names = getDutyNamesForDay(day, rotationWeek);
    const dayIdx = DAY_NAMES.indexOf(day);
    const done = isWeekday && dayIdx < todayIndex;
    const isToday = day === todayWorkDay;
    return { day, names, done, isToday };
  });
  const doneCount = weeklyRows.filter((r) => r.done).length;
  const pct = Math.round((doneCount / WORK_DAYS.length) * 100);

  // Fotoğrafları Supabase'den çek
// namePhotoMap: ilk_ad → url[] — DutyPersonCard ve sol alt liste aynı haritayı kullanır
type PhotoRow = { email: string; image_url: string | null; note: string | null };
let namePhotoMap: Record<string, string[]> = {};
let nameNoteMap: Record<string, string[]> = {};
// Bugün mesaide olan kişileri hesapla
  let todayMesaiNames: string[] = [];
  let nonDutyMesaiNames: string[] = [];
  // Pending proof request'leri çek
  const { data: proofRequests } = await supabase
    .from("proof_requests")
    .select("*")
    .eq("status", "pending")
    .order("created_at", { ascending: false });

  const pendingRequests = (proofRequests ?? []) as {
    id: string;
    requester_email: string;
    requester_name: string | null;
    image_url: string;
    note: string | null;
    status: string;
    created_at: string;
  }[];

  if (isWeekday && todayWorkDay) {
    const morningList = WEEKLY_MESAI[todayWorkDay]?.morning ?? [];
    const afternoonList = WEEKLY_MESAI[todayWorkDay]?.afternoon ?? [];
    // Sabah veya öğleden sonra mesaide olan herkesi birleştir
    const allMesai = [...new Set([...morningList, ...afternoonList])];
    todayMesaiNames = allMesai;

    // Nöbetçi olmayanlar — mesaide var ama rotasyonda yok
    nonDutyMesaiNames = allMesai.filter(
      (fullName) =>
        !todayDutyNames.some(
          (firstName) =>
            fullName.toLowerCase().startsWith(firstName.toLowerCase())
        )
    );
  }

  const totalCount = todayMesaiNames.length;
  const dutyCount = todayDutyNames.length;
  const nonDutyCount = nonDutyMesaiNames.length;
  const TOTAL_STAFF = 27;
  const absentCount = TOTAL_STAFF - totalCount;

if (todayDutyNames.length > 0) {
  const { data: allUsers } = await supabase
    .from("users")
    .select("email, isim_soyisim");

  const dutyEmailToFirstName: Record<string, string> = {};
  const dutyEmails: string[] = [];

  for (const dutyFirstName of todayDutyNames) {
    const match = allUsers?.find(
      (u) => u.isim_soyisim?.split(" ")[0].toLowerCase() === dutyFirstName.toLowerCase()
    );
    if (match) {
      dutyEmails.push(match.email);
      dutyEmailToFirstName[match.email] = dutyFirstName;
    }
  }

  if (dutyEmails.length > 0) {
    // status filtresi yok — admin tüm yüklenmiş fotoğrafları görmeli
    const { data: prefs } = await supabase
      .from("mesai_preferences")
      .select("email, image_url, note")
      .in("email", dutyEmails);


    for (const row of (prefs ?? []) as PhotoRow[]) {
      if (row.image_url) {
        const firstName = dutyEmailToFirstName[row.email];
        if (firstName) {
          const urls = row.image_url.split(",").filter(Boolean);
          if (!namePhotoMap[firstName]) namePhotoMap[firstName] = [];
          for (const url of urls) {
            if (!namePhotoMap[firstName].includes(url)) {
              namePhotoMap[firstName].push(url);
              if (row.note) nameNoteMap[firstName] = row.note.split("\n---\n");
            }
          }
        }
      }
    }
  }
}

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-10">
        <div className="max-w-screen-2xl mx-auto px-4 md:px-10 py-4 flex justify-between items-center">
          <div>
            <h1 className="text-lg font-bold text-slate-900 leading-tight">Ofis Nöbet — Admin</h1>
            <p className="text-xs text-slate-500 mt-0.5">
              {todayName} · {weekLabel} Haftası · Hoş geldin, {adminName}
            </p>
          </div>
            <div className="flex items-center gap-2">
              <Link
                href="/"
                className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[11px] font-semibold bg-teal-50 text-teal-700 border border-teal-200 hover:bg-teal-100 hover:border-teal-300 active:scale-95 transition-all duration-150 whitespace-nowrap"
              >
                👤 Öğrenci Paneli
              </Link>
              <Link
                href="/logout"
                className="text-xs bg-slate-900 text-white px-3 py-1.5 rounded-full hover:bg-slate-700 transition"
              >
                Çıkış
              </Link>
            </div>
        </div>
      </header>

      <main className="max-w-screen-2xl mx-auto px-4 md:px-10 py-8">
        <div className="bg-white border border-slate-200 rounded-2xl p-4 flex flex-col gap-4">

          {/* ÜST SATIR: 70 / 30 */}
          <div className="flex flex-col md:grid md:gap-4" style={{ gridTemplateColumns: "7fr 3fr" }}>

            {/* SOL ÜST — Fotoğraf Kanıt */}
            <div className="border border-slate-200 rounded-xl p-5 flex flex-col gap-4 mb-4 md:mb-0">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-0.5">Fotoğraf Kanıt</p>
                  <p className="text-sm font-semibold text-slate-800">Bugünkü nöbetçi kanıtları</p>
                </div>
                <span className="text-[11px] font-semibold px-2.5 py-1 rounded-full bg-teal-50 text-teal-800 border border-teal-100">
                  {weekLabel} · {todayName}
                </span>
              </div>

              <div className="border-t border-slate-100 pt-4">
                {!isWeekday ? (
                  <p className="text-sm text-slate-400 text-center py-4">Bugün hafta sonu — nöbet yok.</p>
                ) : todayDutyNames.length === 0 ? (
                  <p className="text-sm text-slate-400 text-center py-4">Bu gün için nöbet tanımlı değil.</p>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {todayDutyNames.map((isim) => {
                      const photos = namePhotoMap[isim] ?? [];
                      const notes = nameNoteMap[isim] ?? [];
                      return (
                        <DutyPersonCard
                          key={isim}
                          name={isim}
                          photos={photos}
                          notes={notes}
                        />
                      );
                    })}
                  </div>
                )}
              </div>
            </div>

            {/* SAĞ ÜST — Kanıt İstekleri */}
            <div className="border border-slate-200 rounded-xl p-5 flex flex-col gap-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-0.5">Kanıt İstekleri</p>
                  <p className="text-sm font-semibold text-slate-800">Bekleyen onaylar</p>
                </div>
                {pendingRequests.length > 0 && (
                  <span className="text-[11px] font-bold px-2.5 py-1 rounded-full bg-amber-50 text-amber-700 border border-amber-200">
                    {pendingRequests.length} bekliyor
                  </span>
                )}
              </div>

              <div className="border-t border-slate-100 pt-3 flex flex-col gap-3 overflow-y-auto max-h-64">
                {pendingRequests.length === 0 ? (
                  <p className="text-sm text-slate-400 text-center py-4">Bekleyen istek yok.</p>
                ) : (
                  pendingRequests.map((req) => (
                    <ProofRequestCard
                      key={req.id}
                      request={req}
                      dutyNames={todayDutyNames}
                    />
                  ))
                )}
              </div>
            </div>
          </div>

          {/* ALT SATIR: 50 / 50 */}
          <div className="flex flex-col md:grid md:grid-cols-2 gap-4">

            {/* SOL ALT — Bugün nöbetçiler + halka grafik */}
            <div className="border border-slate-200 rounded-xl p-5 flex flex-col gap-3 mb-4 md:mb-0">
              <div className="flex items-center justify-between gap-4">

                {/* Sol — nöbetçi listesi */}
                <div className="flex flex-col gap-3 flex-1 min-w-0">
                  <div>
                    <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-0.5">Bugün Ofiste</p>
                    <p className="text-sm font-semibold text-slate-800">{todayName} — nöbetçiler</p>
                  </div>
                  <div className="border-t border-slate-100 pt-3 flex flex-col gap-2">
                    {!isWeekday ? (
                      <p className="text-sm text-slate-400">Bugün hafta sonu.</p>
                    ) : todayDutyNames.length === 0 ? (
                      <p className="text-sm text-slate-400">Bu gün için nöbet tanımlı değil.</p>
                    ) : (
                      todayDutyNames.map((isim) => (
                        <div key={isim} className="flex items-center gap-2">
                          <div className="w-8 h-8 rounded-full bg-teal-50 border border-teal-100 flex items-center justify-center text-xs font-bold text-teal-700 flex-shrink-0">
                            {isim.charAt(0)}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-semibold text-slate-800">{isim}</p>
                            <p className="text-[11px] text-slate-400">Tüm gün · 09:00–17:00</p>
                          </div>
                          <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-teal-50 text-teal-700 border border-teal-100 flex-shrink-0">
                            Nöbetçi
                          </span>
                        </div>
                      ))
                    )}
                  </div>
                </div>

                {/* Sağ — halka grafik */}
                {isWeekday && totalCount > 0 && (
                  <div className="flex-shrink-0 overflow-visible">
                    <MesaiDonutChart
                      dutyCount={dutyCount}
                      nonDutyCount={nonDutyCount}
                      totalCount={totalCount}
                      absentCount={absentCount}
                    />
                  </div>
                )}
              </div>
            </div>

            {/* SAĞ ALT — Bu hafta rotasyon */}
            <div className="border border-slate-200 rounded-xl p-5 flex flex-col gap-3">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-0.5">Bu Hafta Nöbet</p>
                  <p className="text-sm font-semibold text-slate-800">{weekLabel} Rotasyonu</p>
                </div>
                <span className="text-xs font-bold text-slate-500">{doneCount}/{WORK_DAYS.length}</span>
              </div>
              <div className="h-1.5 rounded-full bg-slate-100 overflow-hidden">
                <div className="h-full rounded-full bg-teal-500 transition-all" style={{ width: `${pct}%` }} />
              </div>
              <div className="border-t border-slate-100 pt-2 flex flex-col gap-2">
                {weeklyRows.map((row) => (
                  <div key={row.day} className="flex items-center gap-2 text-xs">
                    <span className={`w-4 h-4 rounded flex items-center justify-center flex-shrink-0 text-[9px] font-bold ${
                      row.done
                        ? "bg-teal-50 text-teal-700 border border-teal-100"
                        : row.isToday
                        ? "bg-amber-50 text-amber-700 border border-amber-100"
                        : "bg-slate-50 text-slate-400 border border-slate-200"
                    }`}>
                      {row.done ? "✓" : row.isToday ? "→" : "–"}
                    </span>
                    <span className={`flex-1 ${row.isToday ? "font-semibold text-slate-800" : "text-slate-600"}`}>
                      {row.day}
                    </span>
                    <span className="text-slate-400 text-[10px]">
                      {row.names.join(", ")}
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
