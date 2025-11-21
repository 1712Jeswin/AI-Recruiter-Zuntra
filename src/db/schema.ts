import {
  pgTable,
  text,
  boolean,
  integer,
  pgEnum,
  timestamp,
  jsonb,
} from "drizzle-orm/pg-core";

export const userRole = pgEnum("user_role", ["admin", "client"]);

export const user = pgTable("user", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  email: text("email").notNull().unique(),
  emailVerified: boolean("email_verified").notNull(),
  image: text("image"),
  role: userRole("role").notNull().default("client"),
  credits: integer("credits").notNull().default(3),
  createdAt: timestamp("created_at").notNull(),
  updatedAt: timestamp("updated_at").notNull(),
});

export const session = pgTable("session", {
  id: text("id").primaryKey(),
  userId: text("user_id")
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }),
  token: text("token").notNull().unique(),
  expiresAt: timestamp("expires_at").notNull(),
  ipAddress: text("ip_address"),
  userAgent: text("user_agent"),
  createdAt: timestamp("created_at").notNull(),
  updatedAt: timestamp("updated_at").notNull(),
});

export const account = pgTable("account", {
  id: text("id").primaryKey(),
  userId: text("user_id")
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }),
  accountId: text("account_id").notNull(),
  providerId: text("provider_id").notNull(),
  accessToken: text("access_token"),
  refreshToken: text("refresh_token"),
  accessTokenExpiresAt: timestamp("access_token_expires_at"),
  refreshTokenExpiresAt: timestamp("refresh_token_expires_at"),
  scope: text("scope"),
  idToken: text("id_token"),
  password: text("password"),
  createdAt: timestamp("created_at").notNull(),
  updatedAt: timestamp("updated_at").notNull(),
});

export const verification = pgTable("verification", {
  id: text("id").primaryKey(),
  identifier: text("identifier").notNull(),
  value: text("value").notNull(),
  expiresAt: timestamp("expires_at").notNull(),
  createdAt: timestamp("created_at").notNull(),
  updatedAt: timestamp("updated_at"),
});

export const interview = pgTable("interview", {
  id: text("id").primaryKey(),
  
  // Recruiter ID
  userId: text("user_id")
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }),
  
  createdAt: timestamp("created_at").notNull().defaultNow(), // ✅ use defaultNow() for consistency
 
  jobPosition: text("job_position"),
  jobDescription: text("job_description"),
  duration: text("duration"), // Kept as text (varchar equivalent)
  type: text("type").array(),
  experienceLevel: text("experience_level"),
  
  // Stores list of generated questions
  questionList: jsonb("question_list"),
  
  // Resume score as integer
  resumeScore: integer("resume_score"),
  
  // Reference to candidate email
  userEmail: text("user_email").references(() => user.email, { onDelete: "cascade" }),
});

export const candidate = pgTable("candidate", {
  id: text("id").primaryKey(),
  
  interviewId: text("interview_id")
    .notNull()
    .references(() => interview.id, { onDelete: "cascade" }),

  fullName: text("full_name").notNull(),
  email: text("email").notNull(),

  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const feedback = pgTable("feedback", {
  id: text("id").primaryKey(),
  
  candidateId: text("candidate_id")
    .notNull()
    .references(() => candidate.id, { onDelete: "cascade" }),

  interviewId: text("interview_id")
    .notNull()
    .references(() => interview.id, { onDelete: "cascade" }),

  overallScore: integer("overall_score"),

  toneStyleScore: integer("tone_style_score"),
  contentScore: integer("content_score"),
  structureScore: integer("structure_score"),
  skillsScore: integer("skills_score"),
  atsScore: integer("ats_score"),

  fullReport: jsonb("full_report"),

  createdAt: timestamp("created_at").notNull().defaultNow(),
});