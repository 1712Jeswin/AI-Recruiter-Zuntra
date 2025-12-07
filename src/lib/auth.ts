import { db } from "@/db";
import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { headers } from "next/headers";

// ------------------------------
// CORRECT SESSION TYPE
// ------------------------------
export type BetterAuthSession = {
  session: {
    id: string;
    createdAt: Date;
    updatedAt: Date;
    userId: string;
    expiresAt: Date;
    token: string;
    ipAddress?: string | null;
    userAgent?: string | null;
  };
  user: {
    id: string;
    name?: string | null;
    email: string;
    image?: string | null;
  };
};

// ------------------------------
// AUTH INITIALIZATION
// ------------------------------
export const auth = betterAuth({
  database: drizzleAdapter(db, {
    provider: "pg",
  }),

  pages: {
    signIn: "/login",
  },

  socialProviders: {
    github: {
      clientId: process.env.GITHUB_CLIENT_ID!,
      clientSecret: process.env.GITHUB_CLIENT_SECRET!,
    },
    google: {
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    },
  },
});

// ------------------------------
// FIXED getSession FUNCTION
// ------------------------------
export const getSession = async (): Promise<BetterAuthSession | null> => {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  // Better-auth returns `null` or `{ session, user }`
  if (!session) return null;

  return session as BetterAuthSession;
};