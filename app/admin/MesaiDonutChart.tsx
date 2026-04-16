"use client";

import { useState } from "react";

export function MesaiDonutChart({
  dutyCount,
  nonDutyCount,
  totalCount,
  absentCount,
}: {
  dutyCount: number;
  nonDutyCount: number;
  totalCount: number;
  absentCount: number;
}) {
  const [visible, setVisible] = useState(false);

  const TOTAL = 27;

  const segments = [
    { label: "Nöbetçi",   count: dutyCount,   color: "#3b82f6", bg: "#eff6ff", border: "#bfdbfe" },
    { label: "Mesaide",   count: nonDutyCount, color: "#eab308", bg: "#fefce8", border: "#fde68a" },
    { label: "Mesai Yok", count: absentCount,  color: "#94a3b8", bg: "#f8fafc", border: "#e2e8f0" },
  ];

  const cx = 60;
  const cy = 60;
  const r = 44;
  const sw = 13;
  const circ = 2 * Math.PI * r;
  const GAP = 4;

  let cum = 0;
  const arcs = segments.map((seg, i) => {
    const pct = seg.count / TOTAL;
    const dash = Math.max(0, pct * circ - GAP);
    const offset = circ / 4 - cum * circ;
    cum += pct;
    return { ...seg, pct, dash, offset, index: i };
  });

  return (
    <div className="flex items-center justify-center h-full w-full">
      <div
        className="relative flex items-center justify-center"
        onMouseEnter={() => setVisible(true)}
        onMouseLeave={() => setVisible(false)}
        onClick={() => setVisible((v) => !v)}
      >
        {/* SVG Halka */}
        <svg
          width="120"
          height="120"
          viewBox="0 0 120 120"
          className="flex-shrink-0 cursor-pointer"
        >
          <circle cx={cx} cy={cy} r={r} fill="none" stroke="#f1f5f9" strokeWidth={sw} />
          {arcs.map((arc) =>
            arc.count > 0 ? (
              <circle
                key={arc.index}
                cx={cx} cy={cy} r={r}
                fill="none"
                stroke={arc.color}
                strokeWidth={visible ? sw + 2 : sw}
                strokeDasharray={`${arc.dash} ${circ - arc.dash}`}
                strokeDashoffset={arc.offset}
                strokeLinecap="butt"
                style={{ transition: "stroke-width 0.15s ease" }}
              />
            ) : null
          )}
          <text x={cx} y={cy - 6} textAnchor="middle"
            style={{ fontSize: 20, fontWeight: 900, fill: "#0f172a" }}>
            {TOTAL}
          </text>
          <text x={cx} y={cy + 10} textAnchor="middle"
            style={{ fontSize: 8, fill: "#94a3b8", fontWeight: 600, letterSpacing: 0.5 }}>
            TOPLAM
          </text>
        </svg>

        {/* Konuşma balonu tooltip */}
        {visible && (
          <div className="absolute bottom-[calc(100%+14px)] left-1/2 -translate-x-1/2 z-50 pointer-events-none"
            style={{ filter: "drop-shadow(0 4px 16px rgba(0,0,0,0.12))" }}
          >
            {/* Balon */}
            <div className="bg-white border border-slate-200 rounded-2xl px-4 py-3 flex flex-col gap-2.5 min-w-[180px]">
              
              {/* Başlık */}
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                Personel Dağılımı
              </p>

              {/* Segmentler */}
              {segments.map((seg, i) => {
                const pct = Math.round(seg.count / TOTAL * 100);
                return (
                  <div key={i} className="flex flex-col gap-1">
                    <div className="flex items-center gap-2">
                      <span
                        className="w-2.5 h-2.5 rounded-full flex-shrink-0"
                        style={{ backgroundColor: seg.color }}
                      />
                      <span className="text-xs text-slate-600 flex-1">{seg.label}</span>
                      <span className="text-xs font-bold" style={{ color: seg.color }}>
                        {seg.count} kişi
                      </span>
                      <span className="text-[10px] text-slate-400 w-8 text-right">
                        %{pct}
                      </span>
                    </div>
                    {/* Mini progress bar */}
                    <div className="h-1 rounded-full bg-slate-100 ml-4">
                      <div
                        className="h-full rounded-full"
                        style={{ backgroundColor: seg.color, width: `${pct}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Ok işareti */}
            <div className="flex justify-center -mt-px">
              <div
                className="w-3.5 h-3.5 rotate-45 bg-white border-r border-b border-slate-200"
                style={{ marginTop: "-7px" }}
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}