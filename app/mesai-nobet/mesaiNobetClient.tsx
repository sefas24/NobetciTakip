"use client";

import { useState } from "react";
import { WEEKLY_MESAI, type WorkDay } from "@/constants/schedule";

const WORK_DAYS: WorkDay[] = ["Pazartesi", "Salı", "Çarşamba", "Perşembe", "Cuma"];

const DAY_COLORS: Record<string, { badge: string; dot: string; header: string }> = {
  Pazartesi: { badge: "bg-teal-50 text-teal-700 border-teal-100",     dot: "bg-teal-500",    header: "border-teal-100" },
  Salı:      { badge: "bg-violet-50 text-violet-700 border-violet-100", dot: "bg-violet-400", header: "border-violet-100" },
  Çarşamba:  { badge: "bg-amber-50 text-amber-700 border-amber-100",  dot: "bg-amber-400",   header: "border-amber-100" },
  Perşembe:  { badge: "bg-rose-50 text-rose-700 border-rose-100",     dot: "bg-rose-400",    header: "border-rose-100" },
  Cuma:      { badge: "bg-sky-50 text-sky-700 border-sky-100",        dot: "bg-sky-400",     header: "border-sky-100" },
};

interface Props {
  currentWeek: 0 | 1;
  h1Schedule: Record<WorkDay, string[]>;
  h2Schedule: Record<WorkDay, string[]>;
  userFirstName: string | null;
  userFullName: string | null;
}

export default function MesaiNobetClient({ currentWeek, h1Schedule, h2Schedule, userFirstName, userFullName }: Props) {
  const [viewWeek, setViewWeek] = useState<0 | 1>(currentWeek);
  const schedule = viewWeek === 0 ? h1Schedule : h2Schedule;

  return (
    <main className="flex-1 px-4 py-6 max-w-5xl mx-auto w-full">

      {/* Hafta Seçici */}
      <div className="flex items-center gap-3 mb-5">
        <div className="flex gap-1.5 p-1 bg-slate-100 rounded-xl">
          {([0, 1] as const).map((w) => (
            <button
              key={w}
              onClick={() => setViewWeek(w)}
              className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all ${
                viewWeek === w
                  ? "bg-white text-slate-900 shadow-sm"
                  : "text-slate-500 hover:text-slate-700"
              }`}
            >
              {w === 0 ? "H1 Haftası" : "H2 Haftası"}
            </button>
          ))}
        </div>
        {viewWeek === currentWeek && (
          <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-teal-50 text-teal-700 border border-teal-100">
            Bu hafta
          </span>
        )}
      </div>

      {/* 3 + 2 Grid */}
      <div className="flex flex-col gap-4">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {WORK_DAYS.slice(0, 3).map((day) => (
            <DayCard
              key={day}
              day={day}
              dutyNames={schedule[day]}
              userFirstName={userFirstName}
              userFullName={userFullName}
            />
          ))}
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:px-[16.66%]">
          {WORK_DAYS.slice(3).map((day) => (
            <DayCard
              key={day}
              day={day}
              dutyNames={schedule[day]}
              userFirstName={userFirstName}
              userFullName={userFullName}
            />
          ))}
        </div>
      </div>

      <p className="text-center text-xs text-slate-300 mt-8">
        Nöbetçiler 2 haftalık rotasyona göre · Mesai sabit program
      </p>
    </main>
  );
}

function DayCard({ day, dutyNames, userFirstName, userFullName }: {
  day: WorkDay;
  dutyNames: string[];
  userFirstName: string | null;
  userFullName: string | null;
}) {
  const color = DAY_COLORS[day];
  const mesai = WEEKLY_MESAI[day];

  return (
    <div className="bg-white border border-slate-200 rounded-xl overflow-hidden flex flex-col">
      {/* Başlık */}
      <div className={`px-4 py-3 border-b ${color.header} flex items-center justify-between`}>
        <div className="flex items-center gap-2">
          <span className={`w-2 h-2 rounded-full ${color.dot}`} />
          <span className="text-sm font-bold text-slate-800">{day}</span>
        </div>
        <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-lg border ${color.badge}`}>
          {dutyNames.length} nöbetçi
        </span>
      </div>

      {/* Nöbetçiler */}
      <div className="px-4 py-3 border-b border-slate-100">
        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">Nöbetçiler</p>
        <div className="flex flex-wrap gap-1.5">
          {dutyNames.map((isim) => {
            const isSelf = userFirstName &&
              isim.toLowerCase() === userFirstName.toLowerCase();
            return (
              <span key={isim} className={`inline-flex items-center gap-1 text-xs font-medium px-2.5 py-1 rounded-lg border ${
                isSelf ? "bg-red-50 text-red-700 border-red-100" : "bg-sky-50 text-sky-800 border-sky-100"
              }`}>
                <span className="w-1.5 h-1.5 rounded-full bg-current opacity-60 flex-shrink-0" />
                {isim}
                {isSelf && <span className="text-[10px] ml-0.5">(Sen)</span>}
              </span>
            );
          })}
        </div>
      </div>

      {/* Mesai — Öğleden Önce */}
      <div className="px-4 py-3 border-b border-slate-100">
        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">
          Öğleden Önce · 09:00–12:30
        </p>
        <div className="flex flex-wrap gap-1.5">
          {mesai.morning.map((isim) => {
            const isSelf = userFullName &&
              isim.toLowerCase() === userFullName.toLowerCase();
            return (
              <span key={isim} className={`text-xs px-2 py-0.5 rounded-lg border ${
                isSelf ? "bg-sky-100 text-sky-800 border-sky-200 font-semibold" : "bg-slate-50 text-slate-500 border-slate-200"
              }`}>
                {isim}
              </span>
            );
          })}
        </div>
      </div>

      {/* Mesai — Öğleden Sonra */}
      <div className="px-4 py-3">
        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">
          Öğleden Sonra · 13:30–17:00
        </p>
        <div className="flex flex-wrap gap-1.5">
          {mesai.afternoon.map((isim) => {
            const isSelf = userFullName &&
              isim.toLowerCase() === userFullName.toLowerCase();
            return (
              <span key={isim} className={`text-xs px-2 py-0.5 rounded-lg border ${
                isSelf ? "bg-sky-100 text-sky-800 border-sky-200 font-semibold" : "bg-slate-50 text-slate-500 border-slate-200"
              }`}>
                {isim}
              </span>
            );
          })}
        </div>
      </div>
    </div>
  );
}