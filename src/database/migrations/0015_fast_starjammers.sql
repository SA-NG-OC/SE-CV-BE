CREATE TYPE "public"."invitation_status" AS ENUM('pending', 'accepted', 'rejected', 'expired');--> statement-breakpoint
CREATE TABLE "job_invitations" (
	"invitation_id" serial PRIMARY KEY NOT NULL,
	"job_id" integer NOT NULL,
	"student_id" integer NOT NULL,
	"message" text,
	"status" "invitation_status" DEFAULT 'pending' NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "job_invitations" ADD CONSTRAINT "job_invitations_job_id_job_postings_job_id_fk" FOREIGN KEY ("job_id") REFERENCES "public"."job_postings"("job_id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "job_invitations" ADD CONSTRAINT "job_invitations_student_id_students_student_id_fk" FOREIGN KEY ("student_id") REFERENCES "public"."students"("student_id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "idx_invitations_student" ON "job_invitations" USING btree ("student_id");--> statement-breakpoint
CREATE UNIQUE INDEX "uq_job_student_invitation" ON "job_invitations" USING btree ("job_id","student_id");