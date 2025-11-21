CREATE TABLE "feedback" (
	"id" text PRIMARY KEY NOT NULL,
	"candidate_id" text NOT NULL,
	"interview_id" text NOT NULL,
	"overall_score" integer,
	"tone_style_score" integer,
	"content_score" integer,
	"structure_score" integer,
	"skills_score" integer,
	"ats_score" integer,
	"full_report" jsonb,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "feedback" ADD CONSTRAINT "feedback_candidate_id_candidate_id_fk" FOREIGN KEY ("candidate_id") REFERENCES "public"."candidate"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "feedback" ADD CONSTRAINT "feedback_interview_id_interview_id_fk" FOREIGN KEY ("interview_id") REFERENCES "public"."interview"("id") ON DELETE cascade ON UPDATE no action;