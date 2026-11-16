import { ukDateKey } from "@/lib/weekly";

// Black Friday / Cyber Monday 2026. Update these each year (Black Friday is
// the day after US Thanksgiving - the fourth Thursday of November).
export const BLACK_FRIDAY = "2026-11-27";
export const CYBER_MONDAY = "2026-11-30";
/** Countdown target: midnight UK time at the start of Black Friday. */
export const BLACK_FRIDAY_START_ISO = "2026-11-27T00:00:00Z";
/** Home page banner shows from this UK date until Cyber Monday ends. */
const BANNER_FROM = "2026-11-01";

export type BlackFridayPhase = "before" | "black-friday" | "cyber-monday" | "after";

export function blackFridayPhase(now: Date = new Date()): BlackFridayPhase {
  const today = ukDateKey(now);
  if (today < BLACK_FRIDAY) return "before";
  if (today < CYBER_MONDAY) return "black-friday";
  if (today === CYBER_MONDAY) return "cyber-monday";
  return "after";
}

export function showBlackFridayBanner(now: Date = new Date()): boolean {
  const today = ukDateKey(now);
  return today >= BANNER_FROM && today <= CYBER_MONDAY;
}
