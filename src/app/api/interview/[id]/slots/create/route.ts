import { NextResponse } from "next/server";
import { db } from "@/db";
import { interview, interviewSlot } from "@/db/schema";
import { eq } from "drizzle-orm";
import { v4 as uuidv4 } from "uuid";

export async function POST(req: Request, context: { params: { id: string } }) {
  try {
    const { id: interviewId } =  await context.params;
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

    // Insert 1 row containing all slots
    await db.insert(interviewSlot).values({
      id: uuidv4(),
      interviewId,
      slots: slots.map((slot) => ({
        start: slot.start,
        end: slot.end,
        capacity: slot.capacity ?? 15,
      })),
    });

    return NextResponse.json({
      success: true,
      message: "Slots created successfully.",
    });
  } catch (err) {
    console.error("CREATE SLOTS ERROR:", err);
    return NextResponse.json(
      { error: "server_error", details: String(err) },
      { status: 500 }
    );
  }
}
