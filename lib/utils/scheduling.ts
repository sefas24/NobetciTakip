import type { SchedulingCandidate, SchedulingResult, MesaiSlot } from "@/types";
import { WORK_DAYS, MAX_DUTY_PER_DAY, morningSlot, afternoonSlot } from "@/constants/schedule";

export function computeSchedule(
  candidates: SchedulingCandidate[],
  dutyCounts: Map<string, number>
): SchedulingResult {
  const working = candidates.map((c) => ({
    ...c,
    dutySlots: [...c.dutySlots],
  }));

  for (const day of WORK_DAYS) {
    const morning   = morningSlot(day);
    const afternoon = afternoonSlot(day);

    const dayPool = working.filter(
      (c) => c.slots.includes(morning) || c.slots.includes(afternoon)
    );

    if (dayPool.length === 0) continue;

    dayPool.sort((a, b) => {
      const countA = dutyCounts.get(a.email) ?? 0;
      const countB = dutyCounts.get(b.email) ?? 0;
      return countA - countB;
    });

    let assignedThisDay = 0;

    for (const candidate of dayPool) {
      if (assignedThisDay >= MAX_DUTY_PER_DAY) break;
      const isFullDay = candidate.slots.includes(morning) && candidate.slots.includes(afternoon);
      if (isFullDay && candidate.dutySlots.length === 0) {
        candidate.dutySlots.push(morning, afternoon);
        dutyCounts.set(candidate.email, (dutyCounts.get(candidate.email) ?? 0) + 1);
        assignedThisDay++;
      }
    }

    for (const candidate of dayPool) {
      if (assignedThisDay >= MAX_DUTY_PER_DAY) break;
      const isFullDay = candidate.slots.includes(morning) && candidate.slots.includes(afternoon);
      if (!isFullDay && candidate.dutySlots.length === 0) {
        if (candidate.slots.includes(morning))   candidate.dutySlots.push(morning);
        if (candidate.slots.includes(afternoon)) candidate.dutySlots.push(afternoon);
        dutyCounts.set(candidate.email, (dutyCounts.get(candidate.email) ?? 0) + 1);
        assignedThisDay++;
      }
    }
  }

  const assignments = new Map<string, MesaiSlot[]>();
  for (const candidate of working) {
    assignments.set(candidate.id, candidate.dutySlots);
  }

  return { assignments };
}