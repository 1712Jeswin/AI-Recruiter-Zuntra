"use server"

import { db } from "@/db"; // your drizzle connection
import { interview } from "@/db/schema"; 
import { eq, desc } from 'drizzle-orm';

export const getInterviews = async (userEmail: string) => {
  if (!userEmail) return [];

  const result = await db.select()
    .from(interview)
    .where(eq(interview.userEmail, userEmail)) // Filters by the email column in your schema
    .orderBy(desc(interview.createdAt)); // Shows newest first

  return result;
}