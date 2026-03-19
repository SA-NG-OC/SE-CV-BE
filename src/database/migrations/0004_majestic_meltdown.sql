CREATE TABLE "followed_companies" (
	"follow_id" serial PRIMARY KEY NOT NULL,
	"student_id" integer NOT NULL,
	"company_id" integer NOT NULL,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
ALTER TABLE "companies" ALTER COLUMN "user_id" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "companies" ADD COLUMN "total_followers" integer DEFAULT 0;--> statement-breakpoint
ALTER TABLE "followed_companies" ADD CONSTRAINT "followed_companies_student_id_students_student_id_fk" FOREIGN KEY ("student_id") REFERENCES "public"."students"("student_id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "followed_companies" ADD CONSTRAINT "followed_companies_company_id_companies_company_id_fk" FOREIGN KEY ("company_id") REFERENCES "public"."companies"("company_id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE UNIQUE INDEX "uq_student_company_follow" ON "followed_companies" USING btree ("student_id","company_id");--> statement-breakpoint
CREATE INDEX "idx_followed_companies_student" ON "followed_companies" USING btree ("student_id");--> statement-breakpoint
CREATE INDEX "idx_followed_companies_company" ON "followed_companies" USING btree ("company_id");