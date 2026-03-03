import Link from "next/link";
import { cookies } from "next/headers";
import GunSecimiClient from "./GunSecimiClient";

export default async function GunSecimiPage() {
  const store = await cookies();
  const email = store.get("nt_email")?.value ?? null;

  const WEEKDAYS = ["Pazartesi", "Salı", "Çarşamba", "Perşembe", "Cuma"];
  const SLOTS = WEEKDAYS.flatMap((day) => [
    `${day} Öğleden Önce`,
    `${day} Öğleden Sonra`,
  ]);

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <header className="w-full bg-white shadow-sm px-4 py-4 flex justify-between items-center">
        <div>
          <h1 className="text-lg font-bold text-gray-900">
            Çalışma Günü Tercihi
          </h1>
          <p className="text-xs text-gray-500 mt-1">
            Herkes hangi gün daha rahat nöbet tutuyorsa burada işaretleyebilir.
          </p>
        </div>
        <Link
          href="/"
          className="text-xs text-blue-600 hover:text-blue-800 font-medium"
        >
          Ana menü
        </Link>
      </header>

      <GunSecimiClient email={email} slots={SLOTS} />
    </div>
  );
}

