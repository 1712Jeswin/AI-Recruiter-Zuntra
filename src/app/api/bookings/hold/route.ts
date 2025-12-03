// app/api/bookings/hold/route.ts

import { NextResponse } from "next/server";
import { db } from "@/db";
import { interviewSlot, booking, bookingHold, candidate } from "@/db/schema";
import { eq, and } from "drizzle-orm";
import { v4 as uuid } from "uuid";

const HOLD_TTL = 300; // 5 minutes

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { interviewId, candidateId, slotRecordId, slotIndex } = body;

    if (!interviewId || !candidateId || slotRecordId == null || slotIndex == null) {
      return NextResponse.json({ error: "missing_fields" }, { status: 400 });
    }

    // Validate candidate
    const cand = await db.select().from(candidate).where(eq(candidate.id, candidateId));

    if (!cand.length)
      return NextResponse.json({ error: "candidate_not_found" }, { status: 404 });

    if (cand[0].interviewId !== interviewId)
      return NextResponse.json({ error: "invalid_candidate" }, { status: 403 });

    // Prevent creating hold if already booked
    const existingBooking = await db
      .select()
      .from(booking)
      .where(and(eq(booking.interviewId, interviewId), eq(booking.candidateId, candidateId)));

    if (existingBooking.length > 0)
      return NextResponse.json({ error: "already_booked" }, { status: 409 });

    // Get slot record
    const slotRows = await db.select().from(interviewSlot).where(eq(interviewSlot.id, slotRecordId));

    if (!slotRows.length)
      return NextResponse.json({ error: "slot_record_not_found" }, { status: 404 });

    const slotRecord = slotRows[0];
    const slots = slotRecord.slots || [];

    if (slotIndex < 0 || slotIndex >= slots.length) {
      return NextResponse.json({ error: "invalid_slot_index" }, { status: 400 });
    }

    const selectedSlot = slots[slotIndex];
    const { start, end, capacity } = selectedSlot;

    const now = new Date();

    // Confirmed bookings
    const confirmed = await db
      .select()
      .from(booking)
      .where(
        and(
          eq(booking.interviewId, interviewId),
          eq(booking.slotId, slotRecordId),
          eq(booking.slotIndex, slotIndex)
        )
      );

    // FIX: Correct table for holds
    const holds = await db
      .select()
      .from(bookingHold)
      .where(
        and(
          eq(bookingHold.interviewId, interviewId),
          eq(bookingHold.slotId, slotRecordId),
          eq(bookingHold.slotIndex, slotIndex)
        )
      );

    const activeHolds = holds.filter((h) => new Date(h.expiresAt) > now).length;
    const confirmedCount = confirmed.length;

    if (confirmedCount + activeHolds >= capacity) {
      return NextResponse.json({ error: "slot_full" }, { status: 409 });
    }

    // Create HOLD
    const holdId = uuid();
    const expiresAt = new Date(Date.now() + HOLD_TTL * 1000);

    await db.insert(bookingHold).values({
      id: holdId,
      interviewId,
      candidateId,
      slotId: slotRecordId,
      slotIndex,
      expiresAt,
    });

    return NextResponse.json({
      holdId,
      slotRecordId,
      slotIndex,
      expiresAt: expiresAt.toISOString(),
      start,
      end,
    });
  } catch (err) {
    console.error("HOLD ERROR:", err);
    return NextResponse.json({ error: "server_error" }, { status: 500 });
  }
}
