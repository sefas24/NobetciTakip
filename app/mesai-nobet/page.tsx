// Bu sayfa, eski ana sayfadaki "mesaisi olan kişiler ve nöbetçiler" listesini temsil edecek.
// Şimdilik mock veriyi burada da kullanıyoruz.

import Link from "next/link";
import { cookies } from "next/headers";
import { listApproved } from "@/lib/mesaiStore";

type Role = "admin" | "student" | "unknown";

export default async function MesaiNobetPage() {
  const store = await cookies();
  const role = (store.get("nt_role")?.value as Role | undefined) ?? "unknown";
  const approved = listApproved();

  const dutyNames = Array.from(
    new Set(approved.filter((p) => p.isDuty).map((p) => p.email))
  );
  const mesaiNames = Array.from(
    new Set(approved.map((p) => p.email))
  );

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col relative">
      <header className="w-full bg-white shadow-sm z-10 px-4 py-4 flex justify-between items-center">
        <div>
          <h1 className="text-lg font-bold text-gray-900">
            Mesaisi Olanlar & Nöbetçiler
          </h1>
          <p className="text-xs text-gray-500 mt-1">
            Bugün mesaisi olan herkes ve nöbetçiler
          </p>
        </div>
        <Link
          href="/"
          className="text-xs text-blue-600 hover:text-blue-800 font-medium"
        >
          Ana menü
        </Link>
      </header>

      <main className="flex-1 pt-20 pb-6 p-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <section className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
            <h2 className="text-sm font-semibold text-gray-900 mb-2">
              Bugünün Nöbetçileri
            </h2>
            {dutyNames.length === 0 ? (
              <p className="text-xs text-gray-400">
                Henüz nöbetçi atanmadı. Admin onayladığında burada gözükecek.
              </p>
            ) : (
              <ul className="space-y-1 text-sm">
                {dutyNames.map((name) => (
                  <li
                    key={name}
                    className="px-3 py-1.5 rounded-lg bg-amber-50 text-amber-900"
                  >
                    {name}
                  </li>
                ))}
              </ul>
            )}
          </section>

          <section className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
            <h2 className="text-sm font-semibold text-gray-900 mb-2">
              Bugün Mesaisi Olanlar
            </h2>
            {mesaiNames.length === 0 ? (
              <p className="text-xs text-gray-400">
                Henüz mesai listesi oluşmadı.
              </p>
            ) : (
              <ul className="space-y-1 text-sm">
                {mesaiNames.map((name) => (
                  <li
                    key={name}
                    className="px-3 py-1.5 rounded-lg bg-gray-50 text-gray-900"
                  >
                    {name}
                  </li>
                ))}
              </ul>
            )}
          </section>
        </div>

        {role === "admin" && (
          <p className="mt-4 text-[11px] text-gray-500">
            Detaylı onay ve düzenleme için{" "}
            <span className="font-semibold">Admin Paneli</span> üzerinden
            &quot;Mesai Tercihleri&quot; bölümünü kullanabilirsin.
          </p>
        )}
      </main>
    </div>
  );
}

