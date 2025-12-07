import {
  pgTable,
  text,
  boolean,
  integer,
  pgEnum,
  timestamp,
  jsonb,
  unique,
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

  //Status
  status: text("status").notNull().default("draft"),

  // Slot availability range
  expiresAt: timestamp("expires_at"),

  
  // Reference to candidate email
  userEmail: text("user_email").references(() => user.email, { onDelete: "cascade" }),
});

export const candidate = pgTable(
  "candidate",
  {
    id: text("id").primaryKey(),

    interviewId: text("interview_id")
      .notNull()
      .references(() => interview.id, { onDelete: "cascade" }),

    fullName: text("full_name").notNull(),
    email: text("email").notNull(),

    createdAt: timestamp("created_at").notNull().defaultNow(),
  },
  (table) => ({
    uniqueEmailPerInterview: unique().on(table.email, table.interviewId),
    uid_interview_pair: unique().on(table.id, table.interviewId),
  })
);

export const emailVerification = pgTable(
  "email_verification",
  {
    id: text("id").primaryKey(),

    // Candidate email (before candidate account is created)
    email: text("email").notNull(),

    // Interview this email verification is for
    interviewId: text("interview_id")
      .notNull()
      .references(() => interview.id, { onDelete: "cascade" }),
    
    candidateId: text("candidate_id")
    .references(() => candidate.id, { onDelete: "cascade" }),

    // 6-digit OTP 
    otp: text("otp").notNull(),

    // Expiry time
    expiresAt: timestamp("expires_at").notNull(),

    // True after user verifies OTP
    verified: boolean("verified").notNull().default(false),

    createdAt: timestamp("created_at").notNull().defaultNow(),
  },
  (table) => ({
    // Ensures one verification per (email + interview)
    // Supports multi-user safely
    emailInterviewUnique: unique().on(table.email, table.interviewId),
  })
);


export const feedback = pgTable("feedback", {
  id: text("id").primaryKey(),
  
  candidateId: text("candidate_id")
    .notNull()
    .references(() => candidate.id, { onDelete: "cascade" }),
    // Just to verify

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

export const resumeQuestions = pgTable("resume_questions", {
  id: text("id").primaryKey(),

  candidateId: text("candidate_id")
    .notNull()
    .references(() => candidate.id, { onDelete: "cascade" }),

  interviewId: text("interview_id")
    .notNull()
    .references(() => interview.id, { onDelete: "cascade" }),

  questions: jsonb("questions").notNull(), // array of 5 questions

  createdAt: timestamp("created_at").notNull().defaultNow(),
});


// ! Slot Bookibg Table

export const interviewSlot = pgTable("interview_slot", {
  id: text("id").primaryKey(),

  interviewId: text("interview_id")
    .notNull()
    .references(() => interview.id, { onDelete: "cascade" }),

  // Stores all slot ranges as a JSON array
  // [{ start, end, capacity }, ...]
  slots: jsonb("slots").notNull(),

  createdAt: timestamp("created_at").notNull().defaultNow(),
});


// -------------------------------------------------
// BOOKING (Confirmed interviews)
// -------------------------------------------------

export const booking = pgTable("booking", {
  id: text("id").primaryKey(),

  interviewId: text("interview_id").notNull(),
  candidateId: text("candidate_id").notNull(),

  // NEW FIELDS:
  slotId: text("slot_id").notNull(),     // interview_slot.id
  slotIndex: integer("slot_index").notNull(),  // index in JSON array

  status: text("status").notNull(),  // confirmed | cancelled

    start: timestamp("start", { withTimezone: true }).notNull(),
  end: timestamp("end", { withTimezone: true }),


  meetingLink: text("meeting_link"),

  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});


// -------------------------------------------------
// BOOKING HOLD (5 min temporary reservation)
// -------------------------------------------------

export const bookingHold = pgTable("booking_hold", {
  id: text("id").primaryKey(),

  slotId: text("slot_id")
    .notNull()
    .references(() => interviewSlot.id, { onDelete: "cascade" }),

  slotIndex: integer("slot_index").notNull(),

  interviewId: text("interview_id")
    .notNull()
    .references(() => interview.id, { onDelete: "cascade" }),

  candidateId: text("candidate_id")
    .notNull()
    .references(() => candidate.id, { onDelete: "cascade" }),

  expiresAt: timestamp("expires_at").notNull(),

  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const interviewStatus = pgEnum("interview_status", [
  "pending",
  "completed",
  
]);

export const interviewSession = pgTable("interview_session", {
  id: text("id").primaryKey(),

  candidateId: text("candidate_id")
    .notNull()
    .references(() => candidate.id, { onDelete: "cascade" }),

  interviewId: text("interview_id")
    .notNull()
    .references(() => interview.id, { onDelete: "cascade" }),

  // All question + answer pairs
  answers: jsonb("answers").notNull(),
  unblurCount: integer("unblur_count").notNull().default(0),

  status: interviewStatus("status").notNull().default("pending"),

  // Full structured evaluation JSON
  evaluation: jsonb("evaluation"),

  createdAt: timestamp("created_at").notNull().defaultNow(),
});



// export const calendarConnection = pgTable("calendar_connection", {
//   id: text("id").primaryKey(),

//   userId: text("user_id")
//     .notNull()
//     .references(() => user.id, { onDelete: "cascade" }),

//   provider: text("provider").notNull(), // "google" | "microsoft" | "ics"

//   accessToken: text("access_token"),
//   refreshToken: text("refresh_token"),
//   accessTokenExpiresAt: timestamp("access_token_expires_at"),
//   refreshTokenExpiresAt: timestamp("refresh_token_expires_at"),

//   scope: text("scope"),
//   calendarId: text("calendar_id").default("primary"),

//   createdAt: timestamp("created_at").notNull().defaultNow(),
// });
 



