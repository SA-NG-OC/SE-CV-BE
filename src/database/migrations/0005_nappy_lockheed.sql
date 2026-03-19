CREATE TYPE "public"."company_status" AS ENUM('PENDING', 'APPROVED', 'REJECTED', 'RESTRICTED');--> statement-breakpoint
ALTER TABLE "companies" ADD COLUMN "status" "company_status" DEFAULT 'PENDING' NOT NULL;--> statement-breakpoint
ALTER TABLE "companies" ADD COLUMN "admin_note" text;