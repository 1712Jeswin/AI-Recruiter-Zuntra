import { NextResponse } from "next/server";
import { db } from "@/db";
import { interview } from "@/db/schema";
import { eq } from "drizzle-orm";

export async function GET(
  req: Request,
  context: { params: Promise<{ id: string }> }
) {
  const { id } = await context.params; // ✔ MUST AWAIT

  const results = await db
    .select()
    .from(interview)
    .where(eq(interview.id, id));

  if (!results.length) {
    return NextResponse.json(
      { error: "Interview not found" },
      { status: 404 }
    );
  }

  return NextResponse.json(results[0]);
}
