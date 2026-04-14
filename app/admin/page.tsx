"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import MesaiPreferencesPanel from "./MesaiPreferencesPanel";
import AdminTable, { DashboardShift } from "@/components/AdminTable";
import { listApproved } from "@/lib/mesaiStore";
import type { ShiftStatus } from "@/types";

export default function AdminDashboard() {
  const [filter, setFilter] = useState("all"); // all, completed, pending
  const [shifts, setShifts] = useState<DashboardShift[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      const approved = await listApproved();
      // Veritabanından gelen onaylı izinleri (mesai_preferences) Admin Tablosu formatına çeviriyoruz
      const mappedShifts: DashboardShift[] = approved.map((pref) => ({
        id: pref.id as unknown as number,
        name: pref.email.split("@")[0], // Sadece isim kısmını al
        date: "Sürekli", // Mevcut sistemde spesifik gün yok, "slots" kullanılıyor
        status: "completed", // Onaylandığı için tamamlanmış sayıyoruz (ya da duruma göre ayarlayabiliriz)
        time: pref.dutySlots?.join(", ") || "-", // Adminin atadığı saatler
        photoUrl: pref.imageUrl || null,
      }));
      setShifts(mappedShifts);
      setLoading(false);
    }
    fetchData();
  }, []);

  // Seçilen filtreye göre veriyi süzelim
  const filteredShifts = shifts.filter((shift) => {
    if (filter === "all") return true;
    return shift.status === filter;
  });

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-6xl mx-auto">
        <header className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-800">
              Ofis Nöbet Kontrol Paneli
            </h1>
            <p className="text-xs text-gray-500 mt-1 max-w-xl">
              Buradan hem nöbetçi kanıt fotoğraflarını hem de öğrencilerin
              gönderdiği mesai tercihlerini kontrol edebilirsin.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Link
              href="/logout"
              className="text-xs bg-gray-900 text-white px-3 py-1.5 rounded-full shadow hover:bg-gray-700 transition"
            >
              Çıkış
            </Link>
          </div>
        </header>

        {loading ? (
          <div className="flex justify-center p-8 bg-white border rounded-xl shadow-sm mb-8">
            <p className="text-gray-500 font-medium">Kanıtlar yükleniyor...</p>
          </div>
        ) : (
          <AdminTable
            shifts={filteredShifts}
            filter={filter as any}
            onFilterChange={(newFilter: any) => setFilter(newFilter)}
          />
        )}

        {/* Mesai tercihlerini onaylama paneli */}
        <MesaiPreferencesPanel />
      </div>
    </div>
  );
}
