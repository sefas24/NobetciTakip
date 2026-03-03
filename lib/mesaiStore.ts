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
const preferences: MesaiPreference[] = [];

function createId() {
  return Math.random().toString(36).slice(2) + Date.now().toString(36);
}

export function addPreference(email: string, slots: MesaiSlot[]): MesaiPreference {
  const pref: MesaiPreference = {
    id: createId(),
    email,
    slots,
    status: "pending",
    isDuty: false,
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
  pref.isDuty = isDuty;
  return pref;
}

export function listApproved(): MesaiPreference[] {
  return preferences.filter((p) => p.status === "approved");
}

