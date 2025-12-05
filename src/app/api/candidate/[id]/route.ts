import { NextResponse } from "next/server";
import { db } from "@/db"; // your drizzle instance
import { candidate } from "@/db/schema";
import { eq } from "drizzle-orm";

export async function GET(
  request: Request,
  props: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await props.params;

    if (!id) {
      return NextResponse.json(
        { error: "Candidate ID missing" },
        { status: 400 }
      );
    }

    const result = await db
      .select({
        id: candidate.id,
        fullName: candidate.fullName,
        email: candidate.email,
      })
      .from(candidate)
      .where(eq(candidate.id, id))
      .limit(1);

    if (!result.length) {
      return NextResponse.json(
        { error: "Candidate not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(result[0]);
  } catch (error) {
    console.error("Fetch candidate error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}