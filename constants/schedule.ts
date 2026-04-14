// =============================================================================
// constants/schedule.ts
//
// Nöbet/mesai çizelgesiyle ilgili tüm sabitler burada tanımlanır.
// Bu değerleri doğrudan string olarak yazmak yerine her zaman bu sabitleri kullanın.
// Değiştirilmesi gereken tek yer burasıdır.
// =============================================================================

import type { MesaiSlot } from "@/types";

// -----------------------------------------------------------------------------
// GÜNLER
// -----------------------------------------------------------------------------

/** Çizelgede yer alan iş günlerinin sıralı listesi */
export const WORK_DAYS = ["Pazartesi", "Salı", "Çarşamba", "Perşembe", "Cuma"] as const;

/** Bir iş gününü temsil eden tip */
export type WorkDay = (typeof WORK_DAYS)[number];

// -----------------------------------------------------------------------------
// PERİYOTLAR
// -----------------------------------------------------------------------------

/** Gün içindeki mesai dilimlerinin etiketleri */
export const PERIODS = {
  MORNING:   "Öğleden Önce",
  AFTERNOON: "Öğleden Sonra",
} as const;

export type Period = (typeof PERIODS)[keyof typeof PERIODS];

// -----------------------------------------------------------------------------
// SLOT OLUŞTURUCULAR
// -----------------------------------------------------------------------------

/**
 * Verilen gün için sabah slot adını döner.
 * @example morningSlot("Pazartesi") → "Pazartesi Öğleden Önce"
 */
export function morningSlot(day: WorkDay): MesaiSlot {
  return `${day} ${PERIODS.MORNING}`;
}

/**
 * Verilen gün için öğleden sonra slot adını döner.
 * @example afternoonSlot("Cuma") → "Cuma Öğleden Sonra"
 */
export function afternoonSlot(day: WorkDay): MesaiSlot {
  return `${day} ${PERIODS.AFTERNOON}`;
}

/**
 * Verilen gün için her iki slotu da döner.
 * @example bothSlots("Çarşamba") → ["Çarşamba Öğleden Önce", "Çarşamba Öğleden Sonra"]
 */
export function bothSlots(day: WorkDay): [MesaiSlot, MesaiSlot] {
  return [morningSlot(day), afternoonSlot(day)];
}

// -----------------------------------------------------------------------------
// TÜM GEÇERLİ SLOTLAR
// -----------------------------------------------------------------------------

/**
 * Sistemdeki tüm geçerli mesai slotlarının listesi.
 * Sıralama: Pazartesi sabah → Pazartesi öğleden sonra → Salı sabah → ...
 *
 * Kullanım: form validasyonu, dropdown seçenekleri, algoritma girdisi.
 */
export const ALL_SLOTS: readonly MesaiSlot[] = WORK_DAYS.flatMap(bothSlots);

/**
 * Hızlı arama için slot geçerlilik seti.
 * @example isValidSlot("Salı Öğleden Önce") → true
 */
export const VALID_SLOT_SET = new Set<MesaiSlot>(ALL_SLOTS);

export function isValidSlot(slot: string): slot is MesaiSlot {
  return VALID_SLOT_SET.has(slot);
}

// -----------------------------------------------------------------------------
// NÖBET KURALLARI
// -----------------------------------------------------------------------------

/** Her gün atanacak maksimum nöbetçi sayısı */
export const MAX_DUTY_PER_DAY = 3 as const;

/** Bir öğrencinin haftalık maksimum nöbet gün sayısı (0 = sınırsız) */
export const MAX_DUTY_DAYS_PER_WEEK = 0 as const;
