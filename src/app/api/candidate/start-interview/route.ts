import { NextResponse } from "next/server";
import { db } from "@/db";
import { booking } from "@/db/schema";
import { eq } from "drizzle-orm";
import { issueInterviewToken } from "@/services/tokens";

const TOKEN_PREWARM = Number(process.env.TOKEN_PREWARM_MINUTES ?? 10);

export async function GET(req: Request) {
  try {
    const url = new URL(req.url);
    const bookingId = url.searchParams.get("bookingId");
    const candidateId = url.searchParams.get("candidateId");

    if (!bookingId || !candidateId)
      return NextResponse.json({ error: "missing_fields" }, { status: 400 });

    const b = await db
      .select()
      .from(booking)
      .where(eq(booking.id, bookingId))
      .then((x) => x[0]);

    if (!b) return NextResponse.json({ error: "booking_not_found" }, { status: 404 });
    if (b.candidateId !== candidateId)
      return NextResponse.json({ error: "not_owner" }, { status: 403 });

    const now = Date.now();
    const start = new Date(b.start).getTime();

    if (now < start - TOKEN_PREWARM * 60000)
      return NextResponse.json({ error: "too_early" }, { status: 403 });

    const token = issueInterviewToken({ candidateId, bookingId });

    return NextResponse.json({ token });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "server_error" }, { status: 500 });
  }
}