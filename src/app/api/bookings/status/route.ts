// app/api/bookings/status/route.ts
import { NextResponse } from "next/server";
import { db } from "@/db";
import { booking } from "@/db/schema";
import { and, eq } from "drizzle-orm";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const interviewId = searchParams.get("interviewId");
    const candidateId = searchParams.get("candidateId");

    if (!interviewId || !candidateId) {
      return NextResponse.json({ error: "missing_params" }, { status: 400 });
    }

    // Only check CONFIRMED bookings
    const existing = await db
      .select()
      .from(booking)
      .where(
        and(
          eq(booking.interviewId, interviewId),
          eq(booking.candidateId, candidateId),
          eq(booking.status, "confirmed")
        )
      );

    return NextResponse.json({
      hasBooking: existing.length > 0,
      booking: existing[0] || null,
    });
  } catch (err) {
    console.error("STATUS API ERROR:", err);
    return NextResponse.json({ error: "server_error" }, { status: 500 });
  }
}
