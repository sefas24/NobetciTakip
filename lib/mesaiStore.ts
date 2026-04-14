// =============================================================================
// lib/mesaiStore.ts
//
// Supabase ile konuşan tek yer burası.
// Bu dosya sadece veri okur, yazar, siler — başka hiçbir şey yapmaz.
// İş mantığı (algoritma) için lib/utils/scheduling.ts'e bakın.
// =============================================================================

import { supabase } from "./supabase";
import { computeSchedule } from "./utils/scheduling";
import type {
  MesaiPreference,
  DbMesaiPreference,
  DbUser,
  AutoApproveResult,
} from "@/types";

// -----------------------------------------------------------------------------
// YARDIMCI: DB satırını domain tipine çevir
// -----------------------------------------------------------------------------

function toMesaiPreference(
  row: DbMesaiPreference,
  fullName?: string
): MesaiPreference {
  return {
    id:              row.id,
    email:           row.email,
    slots:           row.slots,
    dutySlots:       row.duty_slots,
    status:          row.status,
    feedback:        row.feedback          ?? undefined,
    imageUrl:        row.image_url         ?? undefined,
    note:            row.note              ?? undefined,
    scheduleFileUrl: row.schedule_file_url ?? undefined,
    fullName,
  };
}

async function withFullNames(rows: DbMesaiPreference[]): Promise<MesaiPreference[]> {
  const { data: users } = await supabase
    .from("users")
    .select("email, isim_soyisim") as { data: Pick<DbUser, "email" | "isim_soyisim">[] | null };

  const nameByEmail = new Map(
    (users ?? []).map((u) => [u.email, u.isim_soyisim ?? undefined])
  );

  return rows.map((row) => toMesaiPreference(row, nameByEmail.get(row.email)));
}

// -----------------------------------------------------------------------------
// OKUMA
// -----------------------------------------------------------------------------

export async function listPreferences(): Promise<MesaiPreference[]> {
  const { data, error } = await supabase
    .from("mesai_preferences")
    .select("*")
    .order("created_at", { ascending: false }) as { data: DbMesaiPreference[] | null; error: unknown };

  if (error || !data) return [];
  return withFullNames(data);
}

export async function listApproved(): Promise<MesaiPreference[]> {
  const { data, error } = await supabase
    .from("mesai_preferences")
    .select("*")
    .eq("status", "approved")
    .order("created_at", { ascending: false }) as { data: DbMesaiPreference[] | null; error: unknown };

  if (error || !data) return [];
  return withFullNames(data);
}

// -----------------------------------------------------------------------------
// YAZMA
// -----------------------------------------------------------------------------

export async function addPreference(
  email: string,
  slots: string[],
  note?: string,
  scheduleFileUrl?: string
): Promise<MesaiPreference> {
  const { data, error } = await supabase
    .from("mesai_preferences")
    .insert({
      email,
      slots,
      status: "pending",
      duty_slots: [],
      note: note ?? null,
      schedule_file_url: scheduleFileUrl ?? null,
    })
    .select()
    .single() as { data: DbMesaiPreference | null; error: unknown };

  if (error || !data) {
    console.error("addPreference hatası:", error);
    throw error;
  }

  return toMesaiPreference(data);
}

export async function processPreference(
  id: string,
  decision: "approved" | "rejected",
  feedback?: string
): Promise<MesaiPreference | null> {
  const payload: Partial<DbMesaiPreference> = { status: decision };
  if (feedback !== undefined) payload.feedback = feedback;

  const { data, error } = await supabase
    .from("mesai_preferences")
    .update(payload)
    .eq("id", id)
    .select()
    .single() as { data: DbMesaiPreference | null; error: unknown };

  if (error || !data) return null;

  if (decision === "approved") {
    await supabase
      .from("mesai_preferences")
      .delete()
      .eq("email", data.email)
      .eq("status", "approved")
      .neq("id", data.id);
  }

  return toMesaiPreference(data);
}

// -----------------------------------------------------------------------------
// OTOMATİK NÖBET ATAMA
// -----------------------------------------------------------------------------

export async function approveAllWithAutomaticDuty(): Promise<AutoApproveResult> {
  const { data: pendingRows } = await supabase
    .from("mesai_preferences")
    .select("*")
    .eq("status", "pending") as { data: DbMesaiPreference[] | null };

  if (!pendingRows || pendingRows.length === 0) {
    return { successCount: 0, errorCount: 0 };
  }

  const { data: approvedRows } = await supabase
    .from("mesai_preferences")
    .select("email, duty_slots")
    .eq("status", "approved") as { data: Pick<DbMesaiPreference, "email" | "duty_slots">[] | null };

  const dutyCounts = new Map<string, number>();
  (approvedRows ?? []).forEach((row) => {
    dutyCounts.set(row.email, (dutyCounts.get(row.email) ?? 0) + (row.duty_slots?.length ?? 0));
  });

  const candidates = pendingRows.map((row) => ({
    id:        row.id,
    email:     row.email,
    slots:     row.slots,
    dutySlots: row.duty_slots ?? [],
  }));

  const { assignments } = computeSchedule(candidates, dutyCounts);

  let successCount = 0;

  for (const row of pendingRows) {
    const dutySlots = assignments.get(row.id) ?? [];

    const { error } = await supabase
      .from("mesai_preferences")
      .update({ status: "approved", duty_slots: dutySlots })
      .eq("id", row.id);

    if (error) continue;

    successCount++;

    await supabase
      .from("mesai_preferences")
      .delete()
      .eq("email", row.email)
      .eq("status", "approved")
      .neq("id", row.id);
  }

  return { successCount, errorCount: pendingRows.length - successCount };
}

// -----------------------------------------------------------------------------
// SİLME
// -----------------------------------------------------------------------------

export async function clearAllMesaiPreferences(): Promise<void> {
  await supabase.from("mesai_preferences").delete().not("id", "is", null);
}