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
    // Load hold
    // --------------------------------------------------
    const hold = (
      await db.select().from(bookingHold).where(eq(bookingHold.id, holdId))
    )[0];

    if (!hold)
      return NextResponse.json({ error: "hold_not_found" }, { status: 404 });

    if (hold.candidateId !== candidateId)
      return NextResponse.json({ error: "not_owner" }, { status: 403 });

    if (new Date(hold.expiresAt) < new Date())
      return NextResponse.json({ error: "hold_expired" }, { status: 410 });


    // --------------------------------------------------
    // Load slotRecord to extract start/end from JSON array
    // --------------------------------------------------
    const slotRecord = (
      await db
        .select()
        .from(interviewSlot)
        .where(eq(interviewSlot.id, hold.slotId))
    )[0];

    if (!slotRecord)
      return NextResponse.json({ error: "slot_record_not_found" }, { status: 404 });

    const slots = slotRecord.slots || [];

    if (
      hold.slotIndex < 0 ||
      hold.slotIndex >= slots.length
    ) {
      return NextResponse.json({ error: "invalid_slot_index" }, { status: 400 });
    }

    const selectedSlot = slots[hold.slotIndex];
    const { start, end } = selectedSlot;

    // --------------------------------------------------
    // Complete booking
    // --------------------------------------------------
    const bookingId = uuid();

    await db.insert(booking).values({
      id: bookingId,
      interviewId: hold.interviewId,
      candidateId,
      slotId: hold.slotId,
      slotIndex: hold.slotIndex,
      start,
      end,
      status: "confirmed",
    });

    // --------------------------------------------------
    // Remove hold
    // --------------------------------------------------
    await db.delete(bookingHold).where(eq(bookingHold.id, holdId));

    return NextResponse.json({
      bookingId,
      slotId: hold.slotId,
      slotIndex: hold.slotIndex,
      start: new Date(start).toISOString(),
      end: new Date(end).toISOString(),
    });
  } catch (err) {
    console.error("CONFIRM ERROR:", err);
    return NextResponse.json({ error: "server_error" }, { status: 500 });
  }
}
