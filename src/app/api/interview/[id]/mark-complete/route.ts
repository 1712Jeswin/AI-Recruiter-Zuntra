import { db } from "@/db";
import { interview } from "@/db/schema";
import { eq } from "drizzle-orm";

// Route: POST /api/interview/:id/mark-complete
export async function POST(
  req: Request,
  props: { params: Promise<{ id: string }> }
) {
  try {
     const { id: interviewId } = await props.params; // <-- FIXED

    if (!interviewId) {
      return Response.json(
        { error: "Interview ID missing" },
        { status: 400 }
      );
    }

    await db
      .update(interview)
      .set({ status: "completed" })
      .where(eq(interview.id, interviewId));

    return Response.json({ success: true, status: "completed" });
  } catch (error) {
    console.error("Mark complete error:", error);

    return Response.json(
      { error: "Failed to update interview status" },
      { status: 500 }
    );
  }
}