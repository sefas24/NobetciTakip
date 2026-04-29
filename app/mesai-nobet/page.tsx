import { cookies } from "next/headers";
import SidebarMenu from "@/components/SidebarMenu";
import MesaiNobetClient from "./mesaiNobetClient";
import {
  getWeeklyDutySchedule,
  getCurrentRotationWeek,
} from "@/constants/schedule";

export default async function MesaiNobetPage() {
  const store = await cookies();
  const role = store.get("nt_role")?.value;
  const name = store.get("nt_isim_soyisim")?.value;

  const currentWeek = getCurrentRotationWeek();
  const h1Schedule = getWeeklyDutySchedule(0);
  const h2Schedule = getWeeklyDutySchedule(1);

  const userFirstName = name ? name.split(" ")[0] : null;

  return (
    <div className="min-h-screen bg-white flex flex-col">
      <header className="bg-white border-b border-slate-200 sticky top-0 z-10 px-4 py-3 flex items-center gap-3">
        <SidebarMenu role={role} />
        <div>
          <h1 className="text-base font-bold text-slate-900 leading-tight">Haftalık Nöbet Planı</h1>
          <p className="text-[11px] text-slate-400">2 haftalık rotasyon sistemi.</p>
        </div>
      </header>

      <MesaiNobetClient
        currentWeek={currentWeek}
        h1Schedule={h1Schedule}
        h2Schedule={h2Schedule}
        userFirstName={userFirstName}
      />
    </div>
  );
}