"use client";

import { useState } from "react";

// Esma API'yi yazana kadar kullanacağımız SAHTE VERİ (Mock Data)
const MOCK_SHIFTS = [
  {
    id: 1,
    name: "Sefa",
    date: "19 Şubat 2026",
    status: "completed",
    time: "08:30",
    photoUrl: "https://via.placeholder.com/300x400?text=Sefa+Kamera+Kanit",
  },
  {
    id: 2,
    name: "Esma",
    date: "19 Şubat 2026",
    status: "pending",
    time: "-",
    photoUrl: null,
  },
  {
    id: 3,
    name: "Buğra",
    date: "18 Şubat 2026",
    status: "completed",
    time: "18:15",
    photoUrl: "https://via.placeholder.com/300x400?text=Bugra+Kamera+Kanit",
  },
];

export default function AdminDashboard() {
  const [filter, setFilter] = useState("all"); // all, completed, pending

  // Seçilen filtreye göre veriyi süzelim
  const filteredShifts = MOCK_SHIFTS.filter((shift) => {
    if (filter === "all") return true;
    return shift.status === filter;
  });

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-800 mb-6">
          Ofis Nöbet Kontrol Paneli
        </h1>

        {/* Filtreleme Butonları */}
        <div className="flex gap-4 mb-6">
          <button
            onClick={() => setFilter("all")}
            className={`px-4 py-2 rounded-md font-medium ${filter === "all" ? "bg-blue-600 text-white" : "bg-white text-gray-600 border"}`}
          >
            Tümü
          </button>
          <button
            onClick={() => setFilter("completed")}
            className={`px-4 py-2 rounded-md font-medium ${filter === "completed" ? "bg-green-600 text-white" : "bg-white text-gray-600 border"}`}
          >
            Tamamlananlar
          </button>
          <button
            onClick={() => setFilter("pending")}
            className={`px-4 py-2 rounded-md font-medium ${filter === "pending" ? "bg-orange-500 text-white" : "bg-white text-gray-600 border"}`}
          >
            Bekleyenler
          </button>
        </div>

        {/* Data Tablosu */}
        <div className="bg-white rounded-lg shadow overflow-hidden">
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
                      className={`px-3 py-1 rounded-full text-xs font-bold ${shift.status === "completed" ? "bg-green-100 text-green-700" : "bg-orange-100 text-orange-700"}`}
                    >
                      {shift.status === "completed" ? "TAMAMLANDI" : "BEKLİYOR"}
                    </span>
                  </td>
                  <td className="p-4 border-b text-center">
                    {shift.status === "completed" ? (
                      <button className="text-blue-600 hover:text-blue-800 font-medium underline">
                        Fotoğrafı Gör
                      </button>
                    ) : (
                      <span className="text-gray-400">-</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
