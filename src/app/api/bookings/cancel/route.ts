// app/api/bookings/cancel/route.ts

import { NextResponse } from "next/server";
import { db } from "@/db";
import { bookingHold } from "@/db/schema";
import { eq } from "drizzle-orm";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { holdId, candidateId } = body;

    if (!holdId || !candidateId) {
      return NextResponse.json({ error: "missing_fields" }, { status: 400 });
    }

    // Fetch hold
    const hold = (
      await db
        .select()
        .from(bookingHold)
        .where(eq(bookingHold.id, holdId))
    )[0];

    if (!hold)
      return NextResponse.json({ error: "hold_not_found" }, { status: 404 });

    // Only owner can delete
    if (hold.candidateId !== candidateId) {
      return NextResponse.json({ error: "not_owner" }, { status: 403 });
    }

    // Delete hold
    await db.delete(bookingHold).where(eq(bookingHold.id, holdId));

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("CANCEL ERROR:", err);
    return NextResponse.json({ error: "server_error" }, { status: 500 });
  }
}
