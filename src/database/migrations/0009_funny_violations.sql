ALTER TABLE "students" ALTER COLUMN "is_open_to_work" SET DEFAULT false;--> statement-breakpoint
ALTER TABLE "job_postings" DROP COLUMN "work_location";--> statement-breakpoint
ALTER TABLE "job_postings" DROP COLUMN "district";--> statement-breakpoint
ALTER TABLE "job_postings" DROP COLUMN "is_remote";