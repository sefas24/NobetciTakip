// =============================================================================
// types/index.ts
//
// Projedeki tüm TypeScript tip tanımları burada yaşar.
// Üç katman halinde organize edilmiştir:
//   1. Supabase Katmanı  — DB'den ham gelen satırların şekli
//   2. Domain Katmanı    — uygulama içinde dolaşan, UI'a kadar giden tipler
//   3. API Katmanı       — endpoint request/response body'leri
// =============================================================================

// -----------------------------------------------------------------------------
// ORTAK YARDIMCI TİPLER
// -----------------------------------------------------------------------------

/** Kullanıcı rolü: yönetici veya öğrenci */
export type UserRole = "admin" | "student";

/** Mesai/nöbet onay durumu */
export type PreferenceStatus = "pending" | "approved" | "rejected";

/**
 * Bir mesai slotunu temsil eden string.
 * Format: "<Gün> <Periyot>"  →  "Pazartesi Öğleden Önce"
 * Geçerli değerler constants/schedule.ts içindeki SLOTS sabitinden gelir.
 */
export type MesaiSlot = string;

// -----------------------------------------------------------------------------
// KATMAN 1: SUPABASE SATIRLARI (ham DB tipleri)
// Bu tipler yalnızca lib/ içindeki servis fonksiyonlarında kullanılır.
// UI bileşenlerine hiçbir zaman doğrudan geçirilmez.
// -----------------------------------------------------------------------------

/** `users` tablosunun tam satır şekli */
export interface DbUser {
  id: string;
  email: string;
  password: string;
  role: UserRole;
  isim_soyisim: string | null;
  is_password_changed: boolean;
  created_at: string; // ISO 8601
}

/** `mesai_preferences` tablosunun tam satır şekli */
export interface DbMesaiPreference {
  id: string;
  email: string;
  slots: MesaiSlot[];
  duty_slots: MesaiSlot[];         // snake_case: DB sütun adı
  status: PreferenceStatus;
  feedback: string | null;
  image_url: string | null;        // virgülle ayrılmış URL listesi
  note: string | null;
  schedule_file_url: string | null;
  created_at: string;              // ISO 8601
}

// -----------------------------------------------------------------------------
// KATMAN 2: DOMAIN TİPLERİ (uygulama içi)
// camelCase, null → undefined dönüşümü burada yapılır.
// -----------------------------------------------------------------------------

/**
 * Uygulamanın her yerinde kullanılan kullanıcı nesnesi.
 * Şifre alanı kasıtlı olarak dışarıda bırakılmıştır.
 */
export interface User {
  id: string;
  email: string;
  role: UserRole;
  fullName: string | undefined;
  isPasswordChanged: boolean;
}

/**
 * Uygulama içinde dolaşan mesai tercihi nesnesi.
 * `DbMesaiPreference`'tan türetilir, UI'a kadar bu tip taşınır.
 */
export interface MesaiPreference {
  id: string;
  email: string;
  slots: MesaiSlot[];
  dutySlots: MesaiSlot[];          // camelCase: duty_slots'un dönüşümü
  status: PreferenceStatus;
  feedback: string | undefined;
  imageUrl: string | undefined;    // camelCase: image_url'nin dönüşümü
  note: string | undefined;
  scheduleFileUrl: string | undefined;
  fullName: string | undefined;    // users tablosundan JOIN ile gelir
}

/**
 * Fotoğraf URL'lerini ayrıştırılmış dizi olarak sunan yardımcı tip.
 * image_url sütunu virgülle ayrılmış URL'ler içerir; bu tip UI render'ında kullanılır.
 */
export type MesaiPreferenceWithPhotoList = MesaiPreference & {
  photoUrls: string[];
};

/** Oturum bilgisi: cookie'lerden okunur, middleware'de doğrulanır */
export interface SessionInfo {
  email: string;
  role: UserRole;
  fullName: string | undefined;
}

// -----------------------------------------------------------------------------
// KATMAN 3: API REQUEST / RESPONSE TİPLERİ
// -----------------------------------------------------------------------------

/** POST /api/auth/login — istek gövdesi */
export interface LoginRequestBody {
  role: UserRole;
  email: string;
  password: string;
}

/** POST /api/auth/login — başarılı yanıt */
export interface LoginSuccessResponse {
  ok: true;
  email: string;
  role: UserRole;
  name: string | undefined;
  needsPasswordChange: boolean;
}

/** Tüm endpoint'lerden dönen hata yanıtı */
export interface ApiErrorResponse {
  ok: false;
  message: string;
}

/** POST /api/auth/set-password — istek gövdesi */
export interface SetPasswordRequestBody {
  email: string;
  newPassword: string;
}

/** POST /api/mesai/approve — istek gövdesi */
export interface ApproveRequestBody {
  id: string;
  decision: "approved" | "rejected";
  feedback?: string;
}

/** POST /api/mesai/approve-all — başarılı yanıt */
export interface ApproveAllResponse {
  ok: true;
  message: string;
  successCount: number;
  errorCount: number;
}

// -----------------------------------------------------------------------------
// UI BİLEŞEN TİPLERİ
// -----------------------------------------------------------------------------

/** Admin tablosundaki bir nöbet satırının durumu */
export type ShiftStatus = "completed" | "pending" | "all";

/** Admin tablosunda gösterilen nöbet kaydı */
export interface DashboardShift {
  id: number;
  name: string;
  date: string;
  status: ShiftStatus;
  time: string;
  photoUrl: string | null;
}

// -----------------------------------------------------------------------------
// KATMAN 3: SERVİS FONKSİYONLARI İÇİN YARDIMCI TİPLER
// lib/services/ ve lib/utils/ içinde kullanılır.
// -----------------------------------------------------------------------------

/**
 * `validateLogin` fonksiyonunun dönüş tipi.
 * Ayrımcı birleşim (discriminated union) ile tip güvenli hata yönetimi.
 */
export type LoginResult =
  | { ok: true; email: string; role: UserRole; fullName: string | undefined; needsPasswordChange: boolean }
  | { ok: false; message: string };

/**
 * `approveAllWithAutomaticDuty` fonksiyonunun dönüş tipi.
 */
export interface AutoApproveResult {
  successCount: number;
  errorCount: number;
}

/**
 * Nöbetçi atama algoritmasının girdi tipi.
 * Supabase bağımlılığı olmadan, saf fonksiyon olarak test edilebilir.
 */
export interface SchedulingCandidate {
  id: string;
  email: string;
  slots: MesaiSlot[];
  dutySlots: MesaiSlot[];
}

/**
 * Nöbetçi atama algoritmasının çıktı tipi.
 */
export interface SchedulingResult {
  /** Güncellenmesi gereken kayıtlar: id → atanan dutySlots */
  assignments: Map<string, MesaiSlot[]>;
}