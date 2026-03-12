import React from "react";

interface DayCardProps {
  day: string;
  morningDuty: string[];
  morningMesai: string[];
  afternoonDuty: string[];
  afternoonMesai: string[];
}

export default function DayCard({
  day,
  morningDuty,
  morningMesai,
  afternoonDuty,
  afternoonMesai,
}: DayCardProps) {
  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden flex flex-col">
      {/* Kart Başlığı (GÜN) */}
      <div className="bg-slate-800 px-4 py-3 flex justify-between items-center">
        <h2 className="text-sm font-bold text-white uppercase tracking-wide">
          {day}
        </h2>
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
              <p className="text-[10px] font-semibold text-gray-400 uppercase mb-1.5">
                Nöbetçiler
              </p>
              {morningDuty.length === 0 ? (
                <p className="text-xs text-gray-400 italic">Nöbetçi yok</p>
              ) : (
                <ul className="space-y-1">
                  {morningDuty.map((name) => (
                    <li
                      key={`m-d-${name}`}
                      className="text-sm px-2.5 py-1 rounded bg-amber-50 text-amber-900 border border-amber-100 font-medium inline-block mr-1 mb-1"
                    >
                      ⭐ {name}
                    </li>
                  ))}
                </ul>
              )}
            </div>

            {/* Sabah Mesaisi */}
            <div>
              <p className="text-[10px] font-semibold text-gray-400 uppercase mb-1.5">
                Normal Mesai
              </p>
              {morningMesai.length === 0 ? (
                <p className="text-xs text-gray-400 italic">Mesaiye kalan yok</p>
              ) : (
                <ul className="space-y-1">
                  {morningMesai.map((name) => (
                    <li
                      key={`m-m-${name}`}
                      className="text-sm px-2.5 py-1 text-gray-600 inline-block mr-1 mb-1"
                    >
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
              <p className="text-[10px] font-semibold text-gray-400 uppercase mb-1.5">
                Nöbetçiler
              </p>
              {afternoonDuty.length === 0 ? (
                <p className="text-xs text-gray-400 italic">Nöbetçi yok</p>
              ) : (
                <ul className="space-y-1">
                  {afternoonDuty.map((name) => (
                    <li
                      key={`a-d-${name}`}
                      className="text-sm px-2.5 py-1 rounded bg-amber-50 text-amber-900 border border-amber-100 font-medium inline-block mr-1 mb-1"
                    >
                      ⭐ {name}
                    </li>
                  ))}
                </ul>
              )}
            </div>

            {/* Akşam Mesaisi */}
            <div>
              <p className="text-[10px] font-semibold text-gray-400 uppercase mb-1.5">
                Normal Mesai
              </p>
              {afternoonMesai.length === 0 ? (
                <p className="text-xs text-gray-400 italic">Mesaiye kalan yok</p>
              ) : (
                <ul className="space-y-1">
                  {afternoonMesai.map((name) => (
                    <li
                      key={`a-m-${name}`}
                      className="text-sm px-2.5 py-1 text-gray-600 inline-block mr-1 mb-1"
                    >
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
}
