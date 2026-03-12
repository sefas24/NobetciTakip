import Link from "next/link";
import { cookies } from "next/headers";
import GunSecimiClient from "./GunSecimiClient";
import SidebarMenu from "@/components/SidebarMenu";

export default async function GunSecimiPage() {
  const store = await cookies();
  const email = store.get("nt_email")?.value ?? null;
  const fullName = store.get("nt_isim_soyisim")?.value ?? null;
  const displayName = fullName || email;
  const role = store.get("nt_role")?.value;

  const WEEKDAYS = ["Pazartesi", "Salı", "Çarşamba", "Perşembe", "Cuma"];
  const SLOTS = WEEKDAYS.flatMap((day) => [
    `${day} Öğleden Önce`,
    `${day} Öğleden Sonra`,
  ]);

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <header className="w-full bg-white shadow-sm z-10 px-4 py-4 flex justify-between items-center sticky top-0">
        <div className="flex items-center gap-3">
          <SidebarMenu role={role} />
          <div>
            <h1 className="text-lg font-bold text-gray-900">
              Çalışma Günü Tercihi
            </h1>
            <p className="text-xs text-gray-500 mt-1">
              Herkes hangi gün daha rahat nöbet tutuyorsa burada işaretleyebilir.
            </p>
          </div>
        </div>
      </header>

      <GunSecimiClient email={email} displayName={displayName} slots={SLOTS} />
    </div>
  );
}

