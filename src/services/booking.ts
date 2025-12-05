// services/booking.ts
import { addMinutes } from "date-fns/addMinutes";



/**
 * Generate slots for a simple availability object.
 * Availability shape accepted:
 *  - { startTime: Date, endTime: Date }  OR
 *  - your DB recruiterAvailability row (with startTime/endTime)
 *
 * Options:
 *  - slotDuration (minutes)
 *  - daysAhead (number)
 *  - tz: currently expects UTC Dates
 */
export function generateSlotsForAvailability(avail: any, opts: { slotDuration: number, daysAhead: number, tz?: string }) {
  const { slotDuration, daysAhead } = opts;
  const slots: Array<{ start: Date; end: Date }> = [];

  // If avail has recurring rules you can expand here — for now handle single day windows or DB style row
  // If avail covers multiple days, assume startTime/endTime are Dates for a particular day.
  // For convenience, allow avail to represent daily window repeated daysAhead times if `avail.recurring` is absent.

  if (avail.startTime && avail.endTime) {
    // If avail is a single-day window, generate for that day only
    const start = new Date(avail.startTime);
    const end = new Date(avail.endTime);
    let cursor = new Date(start);

    while (cursor.getTime() + slotDuration * 60 * 1000 <= end.getTime()) {
      const s = new Date(cursor);
      const e = addMinutes(s, slotDuration);
      slots.push({ start: s, end: e });
      cursor = e;
    }
    return slots;
  }

  // Otherwise create `daysAhead` daily slots using startHour/endHour in UTC on current day..daysAhead-1
  const startHour = avail.startHour ?? 9;
  const endHour = avail.endHour ?? 18;
  const now = new Date();

  for (let d = 0; d < daysAhead; d++) {
    const day = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate() + d, 0, 0, 0));
    const dayStart = new Date(Date.UTC(day.getUTCFullYear(), day.getUTCMonth(), day.getUTCDate(), startHour, 0, 0));
    const dayEnd = new Date(Date.UTC(day.getUTCFullYear(), day.getUTCMonth(), day.getUTCDate(), endHour, 0, 0));
    let cursor = new Date(dayStart);
    while (cursor.getTime() + slotDuration * 60 * 1000 <= dayEnd.getTime()) {
      const s = new Date(cursor);
      const e = addMinutes(s, slotDuration);
      slots.push({ start: s, end: e });
      cursor = e;
    }
  }
  return slots;
}

/** True if two half-open intervals overlap: [aStart, aEnd) and [bStart, bEnd) */
export function slotOverlaps(aStart: Date | string, aEnd: Date | string, bStart: Date | string, bEnd: Date | string) {
  const as = typeof aStart === "string" ? new Date(aStart) : aStart;
  const ae = typeof aEnd === "string" ? new Date(aEnd) : aEnd;
  const bs = typeof bStart === "string" ? new Date(bStart) : bStart;
  const be = typeof bEnd === "string" ? new Date(bEnd) : bEnd;
  return as.getTime() < be.getTime() && bs.getTime() < ae.getTime();
}