import { NextResponse } from "next/server";
import { db } from "@/db";
import { sql } from "drizzle-orm";

export async function GET() {
  try {
    // delete all drafts older than 24 hours
    const result = await db.execute(sql`
      DELETE FROM interview
      WHERE status = 'draft'
      AND created_at < NOW() - INTERVAL '12 hours'
    `);

    return NextResponse.json({
      success: true,
      deleted: result.rowCount ?? 0,
    });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "Cleanup failed" }, { status: 500 });
  }
}
