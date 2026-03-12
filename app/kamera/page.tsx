import { cookies } from "next/headers";
import CameraCapture from "@/components/CameraCapture";
import SidebarMenu from "@/components/SidebarMenu";

export default async function KameraPage() {
  const store = await cookies();
  const role = store.get("nt_role")?.value;

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <header className="w-full bg-white shadow-sm px-4 py-4 flex justify-between items-center sticky top-0 z-10">
        <div className="flex items-center gap-3">
          <SidebarMenu role={role} />
          <div>
            <h1 className="text-lg font-bold text-gray-900">Kamera</h1>
            <p className="text-xs text-gray-500 mt-1">
              Nöbet kanıtı fotoğrafını çek ve kaydet.
            </p>
          </div>
        </div>
      </header>

      <main className="flex-1 px-6 py-6 space-y-4 max-w-3xl w-full mx-auto flex flex-col items-center">
        <CameraCapture />
      </main>
    </div>
  );
}

