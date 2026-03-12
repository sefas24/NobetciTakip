import React from "react";

export type ShiftStatus = "completed" | "pending" | "all";

export interface DashboardShift {
  id: number;
  name: string;
  date: string;
  status: ShiftStatus;
  time: string;
  photoUrl: string | null;
}

interface AdminTableProps {
  shifts: DashboardShift[];
  filter: ShiftStatus;
  onFilterChange: (filter: ShiftStatus) => void;
}

export default function AdminTable({ shifts, filter, onFilterChange }: AdminTableProps) {
  const filteredShifts = shifts.filter((shift) => {
    if (filter === "all") return true;
    return shift.status === filter;
  });

  return (
    <section className="bg-white rounded-lg shadow overflow-hidden mb-8">
      <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100">
        <h2 className="text-sm font-semibold text-gray-900">
          Nöbetçi Kanıt Kontrolü
        </h2>
        <div className="flex gap-2 text-xs">
          <button
            onClick={() => onFilterChange("all")}
            className={`px-3 py-1.5 rounded-full font-medium ${
              filter === "all"
                ? "bg-blue-600 text-white"
                : "bg-gray-50 text-gray-600 border border-gray-200"
            }`}
          >
            Tümü
          </button>
          <button
            onClick={() => onFilterChange("completed")}
            className={`px-3 py-1.5 rounded-full font-medium ${
              filter === "completed"
                ? "bg-green-600 text-white"
                : "bg-gray-50 text-gray-600 border border-gray-200"
            }`}
          >
            Tamamlananlar
          </button>
          <button
            onClick={() => onFilterChange("pending")}
            className={`px-3 py-1.5 rounded-full font-medium ${
              filter === "pending"
                ? "bg-orange-500 text-white"
                : "bg-gray-50 text-gray-600 border border-gray-200"
            }`}
          >
            Bekleyenler
          </button>
        </div>
      </div>
      <table className="w-full text-left border-collapse">
        <thead>
          <tr className="bg-gray-100 text-gray-700 uppercase text-sm">
            <th className="p-4 border-b">Görevli</th>
            <th className="p-4 border-b">Tarih</th>
            <th className="p-4 border-b">Saat</th>
            <th className="p-4 border-b">Durum</th>
            <th className="p-4 border-b text-center">Kanıt (Fotoğraf)</th>
          </tr>
        </thead>
        <tbody>
          {filteredShifts.map((shift) => (
            <tr key={shift.id} className="hover:bg-gray-50">
              <td className="p-4 border-b font-semibold text-gray-800">
                {shift.name}
              </td>
              <td className="p-4 border-b text-gray-600">{shift.date}</td>
              <td className="p-4 border-b text-gray-600">{shift.time}</td>
              <td className="p-4 border-b">
                <span
                  className={`px-3 py-1 rounded-full text-xs font-bold ${
                    shift.status === "completed"
                      ? "bg-green-100 text-green-700"
                      : "bg-orange-100 text-orange-700"
                  }`}
                >
                  {shift.status === "completed" ? "TAMAMLANDI" : "BEKLİYOR"}
                </span>
              </td>
              <td className="p-4 border-b text-center">
                {shift.photoUrl ? (
                  <a href={shift.photoUrl} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:text-blue-800 font-medium underline flex items-center justify-center gap-1">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                    <span>Fotoğrafı Gör</span>
                  </a>
                ) : (
                  <span className="text-gray-400">-</span>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </section>
  );
}
