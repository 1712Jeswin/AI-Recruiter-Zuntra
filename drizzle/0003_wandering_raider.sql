CREATE TABLE "resume_questions" (
	"id" text PRIMARY KEY NOT NULL,
	"candidate_id" text NOT NULL,
	"interview_id" text NOT NULL,
	"questions" jsonb NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "resume_questions" ADD CONSTRAINT "resume_questions_candidate_id_candidate_id_fk" FOREIGN KEY ("candidate_id") REFERENCES "public"."candidate"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "resume_questions" ADD CONSTRAINT "resume_questions_interview_id_interview_id_fk" FOREIGN KEY ("interview_id") REFERENCES "public"."interview"("id") ON DELETE cascade ON UPDATE no action;