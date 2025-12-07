import { NextResponse } from "next/server";
import { db } from "@/db";

export async function GET(
  req: Request,
  { params }: { params: Promise<{ feedback_id: string }> }
) {
  const { feedback_id } = await params; // 👈 IMPORTANT: await it

  try {
    const row = await db.query.feedback.findFirst({
      where: (f, { eq }) => eq(f.id, feedback_id),
    });

    if (!row) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    return NextResponse.json(row);
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
