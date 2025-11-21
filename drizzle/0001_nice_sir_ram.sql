CREATE TABLE "candidate" (
	"id" text PRIMARY KEY NOT NULL,
	"interview_id" text NOT NULL,
	"full_name" text NOT NULL,
	"email" text NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "candidate" ADD CONSTRAINT "candidate_interview_id_interview_id_fk" FOREIGN KEY ("interview_id") REFERENCES "public"."interview"("id") ON DELETE cascade ON UPDATE no action;