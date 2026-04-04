ALTER TYPE "public"."job_status" ADD VALUE 'restricted';--> statement-breakpoint
DROP INDEX "idx_jobs_featured";--> statement-breakpoint
ALTER TABLE "job_postings" DROP COLUMN "employment_type";--> statement-breakpoint
ALTER TABLE "job_postings" DROP COLUMN "start_date";--> statement-breakpoint
ALTER TABLE "job_postings" DROP COLUMN "is_featured";--> statement-breakpoint
ALTER TABLE "job_postings" DROP COLUMN "is_urgent";--> statement-breakpoint
ALTER TABLE "job_postings" DROP COLUMN "view_count";