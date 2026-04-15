import type { MesaiSlot } from "@/types";

export const WORK_DAYS = ["Pazartesi", "Salı", "Çarşamba", "Perşembe", "Cuma"] as const;
export type WorkDay = (typeof WORK_DAYS)[number];

export const PERIODS = {
  MORNING:   "Öğleden Önce",
  AFTERNOON: "Öğleden Sonra",
} as const;
export type Period = (typeof PERIODS)[keyof typeof PERIODS];

export function morningSlot(day: WorkDay): MesaiSlot {
  return `${day} ${PERIODS.MORNING}`;
}
export function afternoonSlot(day: WorkDay): MesaiSlot {
  return `${day} ${PERIODS.AFTERNOON}`;
}
export function bothSlots(day: WorkDay): [MesaiSlot, MesaiSlot] {
  return [morningSlot(day), afternoonSlot(day)];
}

export const ALL_SLOTS: readonly MesaiSlot[] = WORK_DAYS.flatMap(bothSlots);
export const VALID_SLOT_SET = new Set<MesaiSlot>(ALL_SLOTS);
export function isValidSlot(slot: string): slot is MesaiSlot {
  return VALID_SLOT_SET.has(slot);
}

export const MAX_DUTY_PER_DAY = 3 as const;
export const MAX_DUTY_DAYS_PER_WEEK = 0 as const;

// ── 2 Haftalık Rotasyon ──────────────────────────────────────────────────────

export type DutyGroup = { isimler: string[] };

export function getCurrentRotationWeek(referenceDate?: Date): 0 | 1 {
  const toMonday = (d: Date): Date => {
    const copy = new Date(d);
    copy.setHours(0, 0, 0, 0);
    const day = copy.getDay();
    copy.setDate(copy.getDate() + (day === 0 ? -6 : 1 - day));
    return copy;
  };
  const refMonday = toMonday(new Date("2024-01-01T00:00:00"));
  const nowMonday = toMonday(referenceDate ?? new Date());
  const msPerWeek = 7 * 24 * 60 * 60 * 1000;
  const weekDiff = Math.round((nowMonday.getTime() - refMonday.getTime()) / msPerWeek);
  return (((weekDiff % 2) + 2) % 2) as 0 | 1;
}

export const DUTY_ROTATION: Record<WorkDay, [DutyGroup, DutyGroup]> = {
  Pazartesi: [
    { isimler: ["Begüm", "Hakan", "Feyza"] },
    { isimler: ["Furkan", "Hasan Emre", "Buğra"] },
  ],
  Salı: [
    { isimler: ["Fatih", "Tunahan", "Bedirhan"] },
    { isimler: ["Sefa", "Esma Elif", "Hasan Arda"] },
  ],
  Çarşamba: [
    { isimler: ["Yusuf Eren", "Yiğit", "Fatma Başak"] },
    { isimler: ["Utku", "Mert Efe", "Asya"] },
  ],
  Perşembe: [
    { isimler: ["Mehmet Burak", "Hilmi"] },
    { isimler: ["Beril", "Hamza"] },
  ],
  Cuma: [
    { isimler: ["Amine Beyza", "Eren"] },
    { isimler: ["Sultan", "Oğuzhan"] },
  ],
};

export function getDutyNamesForDay(day: WorkDay, week: 0 | 1): string[] {
  return DUTY_ROTATION[day][week].isimler;
}

export function getWeeklyDutySchedule(week: 0 | 1): Record<WorkDay, string[]> {
  return Object.fromEntries(
    WORK_DAYS.map((day) => [day, getDutyNamesForDay(day, week)])
  ) as Record<WorkDay, string[]>;
}
// Haftalık mesai listesi — Serhat günceller
// Nöbetçiler buraya dahil değil, rotasyondan ayrı gelir
export const WEEKLY_MESAI: Record<WorkDay, {
  morning: string[];
  afternoon: string[];
}> = {
  Pazartesi: {
    morning: [
      "Begüm Çetin", "Hakan Özdil", "Feyza Korkmaz", "Furkan Çetin",
      "Hasan Emre Kaya", "Buğra Öztürk", "Hasan Arda Yaman", "Utku Gümüş",
      "Mert Efe Ergün", "Ali Alper Tellioğlu", "Mehmet Burak Tarcan",
      "Esma Elif Öztürk", "Beril Kalmaz", "Sultan Yüksel",
      "Fatma Başak Gündüz", "Yusuf Eren Bozkurt", "Hamza Aydemirdir", "Asya Özdem",
    ],
    afternoon: [
      "Begüm Çetin", "Hakan Özdil", "Feyza Korkmaz", "Furkan Çetin",
      "Hasan Emre Kaya", "Buğra Öztürk", "Hasan Arda Yaman", "Utku Gümüş",
      "Mert Efe Ergün", "Ali Alper Tellioğlu", "Mehmet Burak Tarcan",
      "Esma Elif Öztürk", "Beril Kalmaz", "Sultan Yüksel",
      "Fatma Başak Gündüz", "Yusuf Eren Bozkurt",
    ],
  },
  Salı: {
    morning: [
      "Fatih Ege", "Tunahan Fırat", "Bedirhan Yalap", "Hakan Özdil",
      "Feyza Korkmaz", "Hasan Emre Kaya", "Sefa Sağırlı", "Buğra Öztürk",
      "Esma Elif Öztürk", "Hasan Arda Yaman", "Utku Gümüş", "Asya Özdem",
      "Eren Gönel", "Oğuzhan Önder", "Ali Alper Tellioğlu",
      "Mehmet Burak Tarcan", "Yusuf Eren Bozkurt", "Hamza Aydemirdir",
      "Fatma Başak Gündüz", "Mert Efe Ergün", "Furkan Çetin",
    ],
    afternoon: [
      "Fatih Ege", "Tunahan Fırat", "Bedirhan Yalap", "Hakan Özdil",
      "Feyza Korkmaz", "Hasan Emre Kaya", "Sefa Sağırlı", "Buğra Öztürk",
      "Esma Elif Öztürk", "Hasan Arda Yaman", "Utku Gümüş", "Asya Özdem",
      "Eren Gönel", "Oğuzhan Önder", "Ali Alper Tellioğlu",
      "Mehmet Burak Tarcan", "Sultan Yüksel", "Yusuf Eren Bozkurt",
      "Begüm Çetin", "Amine Beyza Seyitoğlu",
    ],
  },
  Çarşamba: {
    morning: [
      "Fatih Ege", "Tunahan Fırat", "Bedirhan Yalap", "Yusuf Eren Bozkurt",
      "Hakan Özdil", "Yiğit Ünal", "Fatma Başak Gündüz", "Hasan Emre Kaya",
      "Sefa Sağırlı", "Buğra Öztürk", "Esma Elif Öztürk", "Utku Gümüş",
      "Mert Efe Ergün", "Asya Özdem", "Eren Gönel", "Oğuzhan Önder",
      "Beril Kalmaz", "Hasan Arda Yaman", "Hamza Aydemirdir",
      "Feyza Korkmaz", "Hilmi Melih Şanlı", "Begüm Çetin",
      "Furkan Çetin", "Amine Beyza Seyitoğlu",
    ],
    afternoon: [
      "Fatih Ege", "Tunahan Fırat", "Bedirhan Yalap", "Yusuf Eren Bozkurt",
      "Hakan Özdil", "Yiğit Ünal", "Fatma Başak Gündüz", "Hasan Emre Kaya",
      "Sefa Sağırlı", "Buğra Öztürk", "Esma Elif Öztürk", "Utku Gümüş",
      "Mert Efe Ergün", "Asya Özdem", "Eren Gönel", "Oğuzhan Önder",
      "Beril Kalmaz", "Hasan Arda Yaman", "Hamza Aydemirdir",
      "Hilmi Melih Şanlı", "Begüm Çetin",
      "Furkan Çetin", "Amine Beyza Seyitoğlu",
    ],
  },
  Perşembe: {
    morning: [
      "Mehmet Burak Tarcan", "Sefa Sağırlı", "Hilmi Melih Şanlı", "Beril Kalmaz",
      "Begüm Çetin", "Furkan Çetin", "Mert Efe Ergün",
      "Hamza Aydemirdir", "Fatma Başak Gündüz",
    ],
    afternoon: [
      "Mehmet Burak Tarcan", "Sefa Sağırlı", "Hilmi Melih Şanlı", "Beril Kalmaz",
      "Begüm Çetin", "Furkan Çetin",
    ],
  },
  Cuma: {
    morning: [
      "Tunahan Fırat", "Bedirhan Yalap", "Amine Beyza Seyitoğlu", "Yiğit Ünal",
      "Eren Gönel", "Oğuzhan Önder", "Sultan Yüksel", "Begüm Çetin",
      "Furkan Çetin", "Fatih Ege", "Asya Özdem",
      "Hamza Aydemirdir", "Hilmi Melih Şanlı",
    ],
    afternoon: [
      "Tunahan Fırat", "Bedirhan Yalap", "Amine Beyza Seyitoğlu", "Yiğit Ünal",
      "Eren Gönel", "Oğuzhan Önder", "Sultan Yüksel", "Begüm Çetin",
      "Furkan Çetin",
    ],
  },
};