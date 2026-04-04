DROP INDEX "idx_companies_is_verified";--> statement-breakpoint
DROP INDEX "idx_companies_city";--> statement-breakpoint
CREATE INDEX "idx_companies_status" ON "companies" USING btree ("status");--> statement-breakpoint
ALTER TABLE "companies" DROP COLUMN "city";--> statement-breakpoint
ALTER TABLE "companies" DROP COLUMN "district";--> statement-breakpoint
ALTER TABLE "companies" DROP COLUMN "is_verified";