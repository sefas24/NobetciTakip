import { cookies } from "next/headers";
import CameraCapture from "@/components/CameraCapture";
import SidebarMenu from "@/components/SidebarMenu";

export default async function KameraPage() {
  const store = await cookies();
  const role = store.get("nt_role")?.value;

  return (
    <div className="min-h-screen bg-white flex flex-col">
      <header className="w-full bg-white border-b border-slate-200 px-4 py-3 flex items-center gap-3 sticky top-0 z-10">
        <SidebarMenu role={role} />
        <div>
          <h1 className="text-base font-bold text-slate-900 leading-tight">Nöbet Kanıtı</h1>
          <p className="text-[11px] text-slate-400">Ofiste olduğunu belgeleyen fotoğrafı çek ve kaydet.</p>
        </div>
      </header>

      <main className="flex-1 px-4 py-6 max-w-lg w-full mx-auto flex flex-col gap-4">

        <div className="bg-amber-50 border border-amber-100 rounded-2xl px-4 py-3 flex gap-3 items-start">
          <svg className="w-4 h-4 text-amber-500 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <p className="text-xs text-amber-700">
            Nöbet başlangıcında ve bitişinde birer fotoğraf çek. Fotoğraflar admin panelinde görüntülenir.
          </p>
        </div>

        <CameraCapture />
      </main>
    </div>
  );
}