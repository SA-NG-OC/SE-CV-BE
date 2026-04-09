CREATE TYPE "public"."application_status" AS ENUM('submitted', 'interviewing', 'passed', 'rejected');--> statement-breakpoint
ALTER TABLE "applications" ALTER COLUMN "status" SET DEFAULT 'submitted'::"public"."application_status";--> statement-breakpoint
ALTER TABLE "applications" ALTER COLUMN "status" SET DATA TYPE "public"."application_status" USING "status"::"public"."application_status";--> statement-breakpoint
ALTER TABLE "applications" ALTER COLUMN "status" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "applications" ALTER COLUMN "created_at" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "application_status_history" DROP COLUMN "notes";--> statement-breakpoint
ALTER TABLE "applications" DROP COLUMN "company_notes";--> statement-breakpoint
ALTER TABLE "applications" DROP COLUMN "student_notes";--> statement-breakpoint
ALTER TABLE "applications" DROP COLUMN "interview_date";--> statement-breakpoint
ALTER TABLE "applications" DROP COLUMN "interview_location";--> statement-breakpoint
ALTER TABLE "applications" DROP COLUMN "interview_type";--> statement-breakpoint
ALTER TABLE "applications" DROP COLUMN "interview_notes";--> statement-breakpoint
ALTER TABLE "applications" DROP COLUMN "company_rating";--> statement-breakpoint
ALTER TABLE "applications" DROP COLUMN "company_review";--> statement-breakpoint
ALTER TABLE "applications" DROP COLUMN "viewed_at";--> statement-breakpoint
ALTER TABLE "applications" DROP COLUMN "responded_at";--> statement-breakpoint
ALTER TABLE "job_postings" DROP COLUMN "rejection_reason";