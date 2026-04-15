import { cookies } from "next/headers";
import SidebarMenu from "@/components/SidebarMenu";

type Role = "admin" | "student" | "unknown";

// ─── Sahte veri ──────────────────────────────────────────────────────────────
// Kural: Öğleden önce ve sonra aynı kişi → nöbetçi (tam 3 kişi/gün)
// Her günde morning ∩ afternoon = nöbetçiler (3 kişi), geri kalanlar normal mesai

const MOCK_DATA = [
  {
    day: "Pazartesi",
    // Nöbetçiler (her iki slotta da var): Hakan, Feyza, Hasan Arda
    morningDuty:   ["Hakan Özdil", "Feyza Korkmaz", "Hasan Arda Yaman"],
    morningMesai:  ["Sefa Sağırlı", "Esma Elif Öztürk", "Buğra Öztürk", "Furkan Çetin", "Begüm Çetin"],
    afternoonDuty: ["Hakan Özdil", "Feyza Korkmaz", "Hasan Arda Yaman"],
    afternoonMesai:["Sefa Sağırlı", "Esma Elif Öztürk", "Buğra Öztürk", "Utku Gümüş"],
  },
  {
    day: "Salı",
    // Nöbetçiler: Fatih, Bedirhan, Hasan Emre
    morningDuty:   ["Fatih Ege", "Bedirhan Yalap", "Hasan Emre Kaya"],
    morningMesai:  ["Tunahan Fırat", "Sefa Sağırlı", "Buğra Öztürk", "Asya Özdem", "Esma Elif Öztürk"],
    afternoonDuty: ["Fatih Ege", "Bedirhan Yalap", "Hasan Emre Kaya"],
    afternoonMesai:["Tunahan Fırat", "Sefa Sağırlı", "Buğra Öztürk", "Asya Özdem", "Oğuzhan Önder"],
  },
  {
    day: "Çarşamba",
    // Nöbetçiler: Tunahan, Yusuf Eren, Beril
    morningDuty:   ["Tunahan Fırat", "Yusuf Eren Bozkurt", "Beril Kalmaz"],
    morningMesai:  ["Fatih Ege", "Bedirhan Yalap", "Hakan Özdil", "Sefa Sağırlı", "Hamza Aydemirdir"],
    afternoonDuty: ["Tunahan Fırat", "Yusuf Eren Bozkurt", "Beril Kalmaz"],
    afternoonMesai:["Fatih Ege", "Bedirhan Yalap", "Hakan Özdil", "Oğuzhan Önder", "Esma Elif Öztürk"],
  },
  {
    day: "Perşembe",
    // Nöbetçiler: Mehmet Burak, Hilmi Melih, Sefa
    morningDuty:   ["Mehmet Burak Tarcan", "Hilmi Melih Şanlı", "Sefa Sağırlı"],
    morningMesai:  ["Beril Kalmaz", "Begüm Çetin", "Furkan Çetin", "Hamza Aydemirdir"],
    afternoonDuty: ["Mehmet Burak Tarcan", "Hilmi Melih Şanlı", "Sefa Sağırlı"],
    afternoonMesai:["Beril Kalmaz", "Begüm Çetin", "Furkan Çetin"],
  },
  {
    day: "Cuma",
    // Nöbetçiler: Amine Beyza, Yiğit, Sultan
    morningDuty:   ["Amine Beyza Seyitoğlu", "Yiğit Ünal", "Sultan Yüksel"],
    morningMesai:  ["Tunahan Fırat", "Bedirhan Yalap", "Oğuzhan Önder", "Eren Gönel"],
    afternoonDuty: ["Amine Beyza Seyitoğlu", "Yiğit Ünal", "Sultan Yüksel"],
    afternoonMesai:["Tunahan Fırat", "Bedirhan Yalap", "Eren Gönel", "Begüm Çetin", "Furkan Çetin"],
  },
];

// ─── Renk yardımcıları ────────────────────────────────────────────────────────
const DAY_COLORS: Record<string, { badge: string; dot: string; header: string }> = {
  Pazartesi: { badge: "bg-blue-50 text-blue-700 border-blue-100",   dot: "bg-blue-400",   header: "border-blue-100" },
  Salı:      { badge: "bg-violet-50 text-violet-700 border-violet-100", dot: "bg-violet-400", header: "border-violet-100" },
  Çarşamba:  { badge: "bg-teal-50 text-teal-700 border-teal-100",   dot: "bg-teal-500",   header: "border-teal-100" },
  Perşembe:  { badge: "bg-amber-50 text-amber-700 border-amber-100", dot: "bg-amber-400",  header: "border-amber-100" },
  Cuma:      { badge: "bg-rose-50 text-rose-700 border-rose-100",   dot: "bg-rose-400",   header: "border-rose-100" },
};

function DutyBadge({ name }: { name: string }) {
  return (
    <span className="inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-1 rounded-full bg-amber-50 text-amber-800 border border-amber-100">
      <span className="w-1.5 h-1.5 rounded-full bg-amber-400 flex-shrink-0"></span>
      {name}
    </span>
  );
}

function MesaiBadge({ name }: { name: string }) {
  return (
    <span className="inline-flex items-center text-xs px-2.5 py-1 rounded-full bg-slate-50 text-slate-500 border border-slate-300">
      {name}
    </span>
  );
}

function DayCard({ day, morningDuty, morningMesai, afternoonDuty, afternoonMesai }: typeof MOCK_DATA[0]) {
  const color = DAY_COLORS[day] ?? DAY_COLORS["Pazartesi"];
  return (
    <div className={`bg-white border border-slate-300 rounded-2xl overflow-hidden flex flex-col`}>
      {/* Kart başlık */}
      <div className={`px-4 py-3 border-b ${color.header} flex items-center justify-between`}>
        <div className="flex items-center gap-2">
          <span className={`w-2 h-2 rounded-full ${color.dot}`}></span>
          <span className="text-sm font-bold text-slate-800">{day}</span>
        </div>
        <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border ${color.badge}`}>
          {morningDuty.length + afternoonDuty.length} nöbetçi
        </span>
      </div>

      <div className="divide-y divide-slate-100 flex-1">
        {/* Öğleden Önce */}
        <div className="px-4 py-3">
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2 flex items-center gap-1.5">
            <span>Öğleden Önce</span>
            <span className="text-slate-200 font-normal">09:00–12:30</span>
          </p>
          <div className="mb-2">
            <p className="text-[10px] text-slate-300 uppercase tracking-wide mb-1.5">Nöbetçiler</p>
            <div className="flex flex-wrap gap-1.5">
              {morningDuty.map((n) => <DutyBadge key={n} name={n} />)}
            </div>
          </div>
          <div>
            <p className="text-[10px] text-slate-300 uppercase tracking-wide mb-1.5">Normal Mesai</p>
            <div className="flex flex-wrap gap-1.5">
              {morningMesai.map((n) => <MesaiBadge key={n} name={n} />)}
            </div>
          </div>
        </div>

        {/* Öğleden Sonra */}
        <div className="px-4 py-3">
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2 flex items-center gap-1.5">
            <span>Öğleden Sonra</span>
            <span className="text-slate-200 font-normal">13:30–17:00</span>
          </p>
          <div className="mb-2">
            <p className="text-[10px] text-slate-300 uppercase tracking-wide mb-1.5">Nöbetçiler</p>
            <div className="flex flex-wrap gap-1.5">
              {afternoonDuty.map((n) => <DutyBadge key={n} name={n} />)}
            </div>
          </div>
          <div>
            <p className="text-[10px] text-slate-300 uppercase tracking-wide mb-1.5">Normal Mesai</p>
            <div className="flex flex-wrap gap-1.5">
              {afternoonMesai.map((n) => <MesaiBadge key={n} name={n} />)}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default async function MesaiNobetPage() {
  const store = await cookies();
  const role = (store.get("nt_role")?.value as Role | undefined) ?? "unknown";

  return (
    <div className="min-h-screen bg-white flex flex-col">
      {/* Header */}
      <header className="bg-white border-b border-slate-300 sticky top-0 z-10 px-4 py-3 flex items-center gap-3">
        <SidebarMenu role={role} />
        <div>
          <h1 className="text-base font-bold text-slate-900 leading-tight">Haftalık Mesai & Nöbet</h1>
          <p className="text-[11px] text-slate-400">Kimin hangi gün ofiste olduğunu görebilirsin.</p>
        </div>
      </header>

      <main className="flex-1 px-4 py-6 max-w-5xl mx-auto w-full">

        {/* ── 3 + 2 Çapraz Grid ── */}
        <div className="flex flex-col gap-4">

          {/* Üst satır: 3 kutucuk */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {MOCK_DATA.slice(0, 3).map((d) => (
              <DayCard key={d.day} {...d} />
            ))}
          </div>

          {/* Alt satır: 2 kutucuk — çapraz efekt için px-[8.33%] ile ortaya hizalama */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:px-[16.66%]">
            {MOCK_DATA.slice(3, 5).map((d) => (
              <DayCard key={d.day} {...d} />
            ))}
          </div>

        </div>

        {/* Alt not */}
        <p className="text-center text-xs text-slate-300 mt-8">
          Bu liste admin tarafından onaylanan mesai tercihlerini gösterir.
        </p>
      </main>
    </div>
  );
}
