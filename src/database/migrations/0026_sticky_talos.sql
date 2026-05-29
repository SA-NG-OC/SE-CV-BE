ALTER TABLE "messages" ALTER COLUMN "content" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "messages" ADD COLUMN "image_urls" text[];--> statement-breakpoint
ALTER TABLE "saved_jobs" DROP COLUMN "notes";