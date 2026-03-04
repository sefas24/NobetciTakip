export type MesaiSlot = string;

export type MesaiPreferenceStatus = "pending" | "approved";

export interface MesaiPreference {
  id: string;
  email: string;
  slots: MesaiSlot[];
  status: MesaiPreferenceStatus;
  dutySlots: string[];
}

const globalForStore = globalThis as unknown as {
  __mesai_preferences: MesaiPreference[] | undefined;
};

// Basit bir in-memory store (server yeniden başlarsa sıfırlanır - global dev yalıtımı ile)
const preferences: MesaiPreference[] = globalForStore.__mesai_preferences ?? [];

if (process.env.NODE_ENV !== "production") {
  globalForStore.__mesai_preferences = preferences;
}

function createId() {
  return Math.random().toString(36).slice(2) + Date.now().toString(36);
}

export function addPreference(email: string, slots: MesaiSlot[]): MesaiPreference {
  const pref: MesaiPreference = {
    id: createId(),
    email,
    slots,
    status: "pending",
    dutySlots: [],
  };
  preferences.push(pref);
  return pref;
}

export function listPreferences(): MesaiPreference[] {
  return [...preferences];
}

export function approvePreference(id: string, isDuty: boolean): MesaiPreference | null {
  const pref = preferences.find((p) => p.id === id);
  if (!pref) return null;
  pref.status = "approved";
  if (isDuty) {
    pref.dutySlots = [...pref.slots]; // Manuel nöbetçi seçiminde tercih ettiği tüm günleri nöbetçi yapıyoruz.
  } else {
    pref.dutySlots = [];
  }
  return pref;
}

export function listApproved(): MesaiPreference[] {
  return preferences.filter((p) => p.status === "approved");
}

// 3. Madde: Otomatik Nöbetçi Seçimi (Her slot/gün için 3 kişi, en az nöbet tutan öncelikli)
export function approveAllWithAutomaticDuty(): { successCount: number; errorCount: number } {
  const pending = preferences.filter((p) => p.status === "pending");
  if (pending.length === 0) return { successCount: 0, errorCount: 0 };

  // Sistemin bugüne kadar kimin kaç kere nöbet tuttuğunu bilmesi için:
  const dutyCounts = new Map<string, number>();

  // Önce sistem genelinde çoktan onaylanmış BÜTÜN nöbetçileri say
  preferences.filter(p => p.status === "approved").forEach(p => {
    dutyCounts.set(p.email, (dutyCounts.get(p.email) || 0) + p.dutySlots.length);
  });

  // Bekleyen (pending) kayıtlar içerisinde hangi günlerde (slot) çalışılacak grupla
  const requestsBySlot = new Map<MesaiSlot, MesaiPreference[]>();
  pending.forEach(pref => {
    pref.slots.forEach(slot => {
      const slotRequests = requestsBySlot.get(slot) || [];
      slotRequests.push(pref);
      requestsBySlot.set(slot, slotRequests);
    });
  });

  for (const [slot, slotPrefs] of requestsBySlot.entries()) {
    // Bu slot için adayları önceki nöbetçi olma sayılarına göre azdan çoğa sırala
    slotPrefs.sort((a, b) => {
      const countA = dutyCounts.get(a.email) || 0;
      const countB = dutyCounts.get(b.email) || 0;
      return countA - countB;
    });

    // Sadece bu slottan 3 kişi seç
    let assignedThisSlot = 0;
    for (const pref of slotPrefs) {
      if (assignedThisSlot >= 3) break;

      if (!pref.dutySlots.includes(slot)) {
        pref.dutySlots.push(slot);
        dutyCounts.set(pref.email, (dutyCounts.get(pref.email) || 0) + 1);
        assignedThisSlot++;
      }
    }
  }

  // En son tüm pending kayıtları approved durumuna geçir
  let successCount = 0;
  pending.forEach(pref => {
    pref.status = "approved";
    successCount++;
  });

  return { successCount, errorCount: 0 };
}

