export type MesaiSlot = string;

export type MesaiPreferenceStatus = "pending" | "approved";

export interface MesaiPreference {
  id: string;
  email: string;
  slots: MesaiSlot[];
  status: MesaiPreferenceStatus;
  isDuty: boolean;
}

// Basit bir in-memory store (server yeniden başlarsa sıfırlanır)
// Basit bir in-memory store (server yeniden başlarsa sıfırlanır)
const preferences: MesaiPreference[] = [];

function createId() {
  return Math.random().toString(36).slice(2) + Date.now().toString(36);
}

export function addPreference(email: string, slots: MesaiSlot[]): MesaiPreference[] {
  const newPrefs = slots.map(slot => {
    const pref: MesaiPreference = {
      id: createId(),
      email,
      slots: [slot],
      status: "pending",
      isDuty: false,
    };
    preferences.push(pref);
    return pref;
  });
  return newPrefs;
}

export function listPreferences(): MesaiPreference[] {
  return [...preferences];
}

export function approvePreference(id: string, isDuty: boolean): MesaiPreference | null {
  const pref = preferences.find((p) => p.id === id);
  if (!pref) return null;
  pref.status = "approved";
  pref.isDuty = isDuty;
  return pref;
}

export function listApproved(): MesaiPreference[] {
  return preferences.filter((p) => p.status === "approved");
}

// 3. Madde: Otomatik Nöbetçi Seçimi (Her gün için 3 kişi, en az nöbet tutan öncelikli)
export function approveAllWithAutomaticDuty(): { successCount: number; errorCount: number } {
  const pending = preferences.filter((p) => p.status === "pending");
  if (pending.length === 0) return { successCount: 0, errorCount: 0 };

  // Sistemin bugüne kadar kimin kaç kere nöbet tuttuğunu bilmesi için:
  const dutyCounts = new Map<string, number>();

  // Önce onaylanmış nöbetçileri say
  preferences.filter(p => p.status === "approved" && p.isDuty).forEach(p => {
    dutyCounts.set(p.email, (dutyCounts.get(p.email) || 0) + 1);
  });

  // Bekleyen (pending) kayıtlar içerisinde hangi günlerde (slot) çalışılacak grupla
  const requestsByDay = new Map<MesaiSlot, MesaiPreference[]>();

  pending.forEach(pref => {
    pref.slots.forEach(slot => {
      const dayRequests = requestsByDay.get(slot) || [];
      dayRequests.push(pref);
      requestsByDay.set(slot, dayRequests);
    });
  });

  // Her gün için sırayla nöbetçi seçeceğiz (Eğer kişi o gün için seçildiyse isDuty=true olur)
  for (const [day, dayPrefs] of requestsByDay.entries()) {
    // Bu gün için potansiyel nöbetçi adaylarını geçmiş nöbet sayılarına göre azdan çoğa sırala
    // Not: Bir kişi birden fazla gün mesai girmiş olabilir, bu sayede en az nöbet tutan önceliklenir
    dayPrefs.sort((a, b) => {
      const countA = dutyCounts.get(a.email) || 0;
      const countB = dutyCounts.get(b.email) || 0;
      return countA - countB;
    });

    // Bu günden 3 kişi seç (Eğer 3'ten az kişi mesaiye kalıyorsa hepsini seçer)
    let assignedToday = 0;
    for (const pref of dayPrefs) {
      if (assignedToday >= 3) break;

      // Eğer bu kullanıcı başka bir günde çoktan nöbetçi yapıldıysa bu döngüde ve yine isDuty=true ise bir manası yok ama 
      // isDuty flag'i "genel" olduğu için, aslında öğrencinin genel durumuna bakıyoruz.
      // (Gerçek bir veritabanında slot bazlı isDuty tutulur, biz basit store'da pref objesine true veriyoruz)
      if (!pref.isDuty) {
        pref.isDuty = true;
        dutyCounts.set(pref.email, (dutyCounts.get(pref.email) || 0) + 1);
        assignedToday++;
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

