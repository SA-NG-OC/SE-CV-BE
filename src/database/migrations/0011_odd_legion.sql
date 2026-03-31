CREATE TYPE "public"."job_status" AS ENUM('pending', 'approved', 'rejected');--> statement-breakpoint
ALTER TABLE "job_postings" ALTER COLUMN "status" SET DEFAULT 'pending'::"public"."job_status";--> statement-breakpoint
ALTER TABLE "job_postings" ALTER COLUMN "status" SET DATA TYPE "public"."job_status" USING "status"::"public"."job_status";