// app/api/bookings/confirm/route.ts

import { NextResponse } from "next/server";
import { db } from "@/db";
import { booking, bookingHold, interviewSlot } from "@/db/schema";
import { eq } from "drizzle-orm";
import { v4 as uuid } from "uuid";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { holdId, candidateId } = body;

    if (!holdId || !candidateId) {
      return NextResponse.json({ error: "missing_fields" }, { status: 400 });
    }

    // --------------------------------------------------
    // Load Hold
    // --------------------------------------------------
    const hold = (
      await db.select().from(bookingHold).where(eq(bookingHold.id, holdId))
    )[0];

    if (!hold) {
      return NextResponse.json({ error: "hold_not_found" }, { status: 404 });
    }

    if (hold.candidateId !== candidateId) {
      return NextResponse.json({ error: "not_owner" }, { status: 403 });
    }

    if (new Date(hold.expiresAt) < new Date()) {
      return NextResponse.json({ error: "hold_expired" }, { status: 410 });
    }

    // --------------------------------------------------
    // Load Slot Record
    // --------------------------------------------------
    const slotRecord = (
      await db
        .select()
        .from(interviewSlot)
        .where(eq(interviewSlot.id, hold.slotId))
    )[0];

    if (!slotRecord) {
      return NextResponse.json(
        { error: "slot_record_not_found" },
        { status: 404 }
      );
    }

    // Ensure slots array exists
    const slots: Array<{ start: string; end: string }> = Array.isArray(
      slotRecord.slots
    )
      ? slotRecord.slots
      : [];

    if (hold.slotIndex < 0 || hold.slotIndex >= slots.length) {
      return NextResponse.json(
        { error: "invalid_slot_index" },
        { status: 400 }
      );
    }

    const selectedSlot = slots[hold.slotIndex];
    let { start, end } = selectedSlot;

    // --------------------------------------------------
    // Convert to real Date objects (IMPORTANT FIX)
    // --------------------------------------------------
    const startDate = new Date(start);
    const endDate = new Date(end);

    if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) {
      return NextResponse.json(
        { error: "invalid_date_format", providedStart: start, providedEnd: end },
        { status: 400 }
      );
    }

    // --------------------------------------------------
    // Insert Booking
    // --------------------------------------------------
    const bookingId = uuid();

    await db.insert(booking).values({
      id: bookingId,
      interviewId: hold.interviewId,
      candidateId: hold.candidateId,
      slotId: hold.slotId,
      slotIndex: hold.slotIndex,
      start: startDate,   // stored as timestamp with timezone
      end: endDate,       // stored as timestamp with timezone
      status: "confirmed",
    });

    // --------------------------------------------------
    // Delete Hold
    // --------------------------------------------------
    await db.delete(bookingHold).where(eq(bookingHold.id, holdId));

    // --------------------------------------------------
    // Return normalized ISO times (frontend will parse correctly)
    // --------------------------------------------------
    return NextResponse.json({
      bookingId,
      slotId: hold.slotId,
      slotIndex: hold.slotIndex,
      start: startDate.toISOString(),
      end: endDate.toISOString(),
    });
  } catch (err) {
    console.error("CONFIRM ERROR:", err);
    return NextResponse.json({ error: "server_error" }, { status: 500 });
  }
}
