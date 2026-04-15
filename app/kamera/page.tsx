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

      <main className="flex-1 p-4 md:p-6 max-w-4xl w-full mx-auto flex flex-col gap-6">

        {/* Top Information Block resembling the Admin Panel UI blocks */}
        <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm">
          <div className="flex justify-between items-start mb-3">
             <div className="flex flex-col gap-1">
               <div className="text-[10px] font-bold uppercase tracking-wider text-gray-400">FOTOĞRAF KANITI</div>
               <h2 className="text-sm sm:text-base font-bold text-slate-800">Nöbetçi Fotoğraf Çekimi</h2>
             </div>
          </div>
          <p className="text-xs text-slate-500 leading-relaxed max-w-2xl">
             Nöbet başlangıcında ve bitişinde ofiste bulunduğuna dair birer fotoğraf çekmelisiniz. Bu fotoğraflar yöneticiler tarafından admin panelinde görüntülenecek ve mesai onayında kanıt olarak kullanılacaktır.
          </p>
        </div>

        <CameraCapture />
      </main>
    </div>
  );
}