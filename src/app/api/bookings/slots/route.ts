// app/api/bookings/slots/route.ts
import { NextResponse } from "next/server";
import { db } from "@/db";
import { interviewSlot, booking, bookingHold } from "@/db/schema";
import { eq, and } from "drizzle-orm";

export async function GET(req: Request) {
  try {
    const url = new URL(req.url);
    const interviewId = url.searchParams.get("interviewId");

    if (!interviewId) {
      return NextResponse.json(
        { error: "missing_interviewId" },
        { status: 400 }
      );
    }

    // Fetch 1 row (we only have ONE per interview now)
    const slotRows = await db
      .select()
      .from(interviewSlot)
      .where(eq(interviewSlot.interviewId, interviewId));

    if (slotRows.length === 0) {
      return NextResponse.json({ slots: [] });
    }

    const slotRecord = slotRows[0]; // only one row
    const slots = slotRecord.slots ?? [];

    const now = new Date();

    // Fetch holds (slotRecordId + slotIndex)
    const holds = await db
      .select()
      .from(bookingHold)
      .where(eq(bookingHold.interviewId, interviewId));

    // Fetch confirmed bookings (slotRecordId + slotIndex)
    const confirmedBookings = await db
      .select()
      .from(booking)
      .where(
        and(eq(booking.interviewId, interviewId), eq(booking.status, "confirmed"))
      );

    // Expand JSON array into individual slots
    const formatted = slots.map((slot, index) => {
      // active holds for this slot index
      const activeHolds = holds.filter(
        (h) =>
          h.slotId === slotRecord.id &&
          h.slotIndex === index &&
          new Date(h.expiresAt) > now
      ).length;

      // confirmed bookings
      const activeBookings = confirmedBookings.filter(
        (b) => b.slotId === slotRecord.id && b.slotIndex === index
      ).length;

      const capacity = slot.capacity ?? 0;
      const capacityLeft = capacity - (activeHolds + activeBookings);

      return {
        slotRecordId: slotRecord.id, // needed for booking
        slotIndex: index,
        start: slot.start,
        end: slot.end,
        capacity,
        capacityLeft,
      };
    });

    return NextResponse.json({ slots: formatted });
  } catch (err) {
    console.error("SLOTS ERROR:", err);
    return NextResponse.json({ error: "server_error" }, { status: 500 });
  }
}
