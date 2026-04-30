ALTER TABLE "majors" DROP CONSTRAINT "majors_major_code_unique";--> statement-breakpoint
DROP INDEX "idx_jobs_fulltext";--> statement-breakpoint
CREATE INDEX "idx_jobs_fulltext" ON "job_postings" USING gin (to_tsvector('simple', coalesce("job_title", '') || ' ' || coalesce("job_description", '') || ' ' || coalesce("requirements", '')));--> statement-breakpoint
ALTER TABLE "majors" DROP COLUMN "major_code";--> statement-breakpoint
ALTER TABLE "majors" DROP COLUMN "description";--> statement-breakpoint
ALTER TABLE "majors" DROP COLUMN "created_at";