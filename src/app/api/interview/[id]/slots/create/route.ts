import { NextResponse } from "next/server";
import { db } from "@/db";
import { interview, interviewSlot } from "@/db/schema";
import { eq } from "drizzle-orm";
import { v4 as uuidv4 } from "uuid";

export async function POST(
  req: Request,
  props: { params: Promise<{ id: string }> }
) {
  try {
    const { id: interviewId } = await props.params;
    const { slots } = await req.json();

    if (!interviewId) {
      return NextResponse.json({ error: "missing_interviewId" }, { status: 400 });
    }

    if (!Array.isArray(slots) || slots.length === 0) {
      return NextResponse.json({ error: "no_slots_provided" }, { status: 400 });
    }

    // Validate interview exists
    const intr = await db
      .select()
      .from(interview)
      .where(eq(interview.id, interviewId))
      .then((r) => r[0]);

    if (!intr) {
      return NextResponse.json(
        { error: "interview_not_found" },
        { status: 404 }
      );
    }

    // ---------------------------------------------------------
    // ⭐ NEW: Compute expiry date → last slot's end time
    // ---------------------------------------------------------
    const lastSlot = slots[slots.length - 1];
    const expiresAt = new Date(lastSlot.end); // ISO string → Date

    // ---------------------------------------------------------
    // Insert slots into interviewSlot table
    // ---------------------------------------------------------
    await db.insert(interviewSlot).values({
      id: uuidv4(),
      interviewId,
      slots: slots.map((slot) => ({
        start: slot.start,
        end: slot.end,
        capacity: slot.capacity ?? 15,
      })),
    });

    // ---------------------------------------------------------
    // ⭐ NEW: Update interview expiry date
    // ---------------------------------------------------------
    await db
      .update(interview)
      .set({ expiresAt }) // save expiry
      .where(eq(interview.id, interviewId));

    return NextResponse.json({
      success: true,
      message: "Slots created & expiry set successfully.",
      expiresAt,
    });
  } catch (err) {
    console.error("CREATE SLOTS ERROR:", err);
    return NextResponse.json(
      { error: "server_error", details: String(err) },
      { status: 500 }
    );
  }
}