import { supabase } from "./supabase";

export type MesaiSlot = string;
export type MesaiPreferenceStatus = "pending" | "approved";

export interface MesaiPreference {
  id: string;
  email: string;
  slots: MesaiSlot[];
  status: MesaiPreferenceStatus;
  dutySlots: string[];
}

export async function addPreference(email: string, slots: MesaiSlot[]): Promise<MesaiPreference> {
  const { data, error } = await supabase
    .from("mesai_preferences")
    .insert({ email, slots, status: "pending", duty_slots: [] })
    .select()
    .single();

  if (error) throw error;

  return {
    id: data.id,
    email: data.email,
    slots: data.slots,
    status: data.status,
    dutySlots: data.duty_slots,
  };
}

export async function listPreferences(): Promise<MesaiPreference[]> {
  const { data, error } = await supabase
    .from("mesai_preferences")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) return [];

  return data.map((p) => ({
    id: p.id,
    email: p.email,
    slots: p.slots,
    status: p.status,
    dutySlots: p.duty_slots,
  }));
}

export async function listApproved(): Promise<MesaiPreference[]> {
  const { data, error } = await supabase
    .from("mesai_preferences")
    .select("*")
    .eq("status", "approved")
    .order("created_at", { ascending: false });

  if (error) return [];

  return data.map((p) => ({
    id: p.id,
    email: p.email,
    slots: p.slots,
    status: p.status,
    dutySlots: p.duty_slots,
  }));
}

// Admin manuel nöbetçi iptal/onayı UI'dan kaldırıldı, bu metod referans olarak boşa döndürüldü
export async function approvePreference(id: string, isDuty: boolean): Promise<MesaiPreference | null> {
  return null;
}

// 3. Madde: Otomatik Nöbetçi Seçimi (Her slot/gün için 3 kişi, en az nöbet tutan öncelikli)
export async function approveAllWithAutomaticDuty(): Promise<{ successCount: number; errorCount: number }> {
  const { data: pendingData } = await supabase
    .from("mesai_preferences")
    .select("*")
    .eq("status", "pending");

  if (!pendingData || pendingData.length === 0) return { successCount: 0, errorCount: 0 };

  const pending: MesaiPreference[] = pendingData.map(p => ({
    id: p.id,
    email: p.email,
    slots: p.slots,
    status: p.status,
    dutySlots: p.duty_slots,
  }));

  // Sistemin bugüne kadar kimin kaç kere nöbet tuttuğunu bilmesi için
  const dutyCounts = new Map<string, number>();

  const { data: approvedData } = await supabase
    .from("mesai_preferences")
    .select("email, duty_slots")
    .eq("status", "approved");

  (approvedData || []).forEach(p => {
    dutyCounts.set(p.email, (dutyCounts.get(p.email) || 0) + (p.duty_slots?.length || 0));
  });

  // 1. Yeni Yaklaşım: Günleri ayrıştır
  const allDays = ["Pazartesi", "Salı", "Çarşamba", "Perşembe", "Cuma"];

  for (const day of allDays) {
    const morningSlot = `${day} Öğleden Önce`;
    const afternoonSlot = `${day} Öğleden Sonra`;

    // Adayları belirle
    const candidates = pending.filter(p => p.slots.includes(morningSlot) || p.slots.includes(afternoonSlot));
    if (candidates.length === 0) continue;

    // Adayları önceki nöbetçi sayısına göre azdan çoğa sırala
    candidates.sort((a, b) => {
      const countA = dutyCounts.get(a.email) || 0;
      const countB = dutyCounts.get(b.email) || 0;
      return countA - countB;
    });

    let assignedThisDay = 0;

    // ADIM A: "Tüm Gün" mesaisi olanları ÖNCELİKLİ ve Kesin Nöbetçi Yap (haftalık kotayı dolmamışsa)
    for (const pref of candidates) {
      if (assignedThisDay >= 3) break;

      const isFullDay = pref.slots.includes(morningSlot) && pref.slots.includes(afternoonSlot);
      // O hafta (şu anki iterasyonda) hala hiç nöbetçi seçilmemişse
      if (isFullDay && pref.dutySlots.length === 0) {
        pref.dutySlots.push(morningSlot, afternoonSlot);
        dutyCounts.set(pref.email, (dutyCounts.get(pref.email) || 0) + 1);
        assignedThisDay++;
      }
    }

    // ADIM B: Eğer 3 kontenjan dolmadıysa (assignedThisDay < 3), sadece tek yarım gün seçenlerden "az nöbet tutanları" listeye dahil et
    for (const pref of candidates) {
      if (assignedThisDay >= 3) break;

      const isFullDay = pref.slots.includes(morningSlot) && pref.slots.includes(afternoonSlot);
      // Eğer tüm günse ve zaten seçildiyse (ADIM A) veya haftalık kotası dolduysa pas geç
      if (!isFullDay && pref.dutySlots.length === 0) {
        // Hangi slotu seçtiyse onu duty'ye yaz
        if (pref.slots.includes(morningSlot)) pref.dutySlots.push(morningSlot);
        if (pref.slots.includes(afternoonSlot)) pref.dutySlots.push(afternoonSlot);

        dutyCounts.set(pref.email, (dutyCounts.get(pref.email) || 0) + 1);
        assignedThisDay++;
      }
    }
  }

  // İşlenmiş "pending" kayıtları topluca DB'ye "approved" olarak yaz
  let successCount = 0;
  for (const pref of pending) {
    const { error } = await supabase
      .from("mesai_preferences")
      .update({ status: "approved", duty_slots: pref.dutySlots })
      .eq("id", pref.id);

    if (!error) successCount++;
  }

  return { successCount, errorCount: pending.length - successCount };
}

// 6. Madde [Ekstra]: Adminin tabloyu sıfırlayabilmesi için
export async function clearAllMesaiPreferences(): Promise<void> {
  // Supabase kütüphanesinde delete yapabilmek için en az 1 filtre (eq/neq vb) zorunludur.
  await supabase.from("mesai_preferences").delete().not("id", "is", null);
}

