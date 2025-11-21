import { NextResponse } from "next/server";
import { db } from "@/db";
import { feedback } from "@/db/schema";
import { eq } from "drizzle-orm";

export async function GET(req: Request, { params }: { params: Promise<{ feedback_id: string }> }) {
  const { feedback_id } = await params;

  try {
    const row = await db.query.feedback.findFirst({
      where: (f, { eq }) => eq(f.id, feedback_id),
    });

    if (!row) {
      return new Response("Not found", { status: 404 });
    }

    return Response.json(row);
  } catch (error) {
    console.error(error);
    return new Response("Server error", { status: 500 });
  }
}
