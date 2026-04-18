ALTER TABLE "job_postings" ADD COLUMN IF NOT EXISTS "is_active" boolean DEFAULT true NOT NULL;
CREATE INDEX "idx_jobs_is_active" ON "job_postings" USING btree ("is_active");--> statement-breakpoint
ALTER TABLE "job_postings" DROP COLUMN IF EXISTS "expires_at";