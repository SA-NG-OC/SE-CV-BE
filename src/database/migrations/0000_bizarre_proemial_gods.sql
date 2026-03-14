CREATE TABLE "application_status_history" (
	"history_id" serial PRIMARY KEY NOT NULL,
	"application_id" integer,
	"old_status" varchar(50),
	"new_status" varchar(50),
	"changed_by" integer,
	"notes" text,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "applications" (
	"application_id" serial PRIMARY KEY NOT NULL,
	"job_id" integer,
	"student_id" integer,
	"cv_url" varchar(500) NOT NULL,
	"cover_letter" text,
	"status" varchar(50) DEFAULT 'submitted',
	"company_notes" text,
	"student_notes" text,
	"interview_date" timestamp,
	"interview_location" varchar(255),
	"interview_type" varchar(50),
	"interview_notes" text,
	"company_rating" integer,
	"company_review" text,
	"viewed_at" timestamp,
	"responded_at" timestamp,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "blacklist" (
	"blacklist_id" serial PRIMARY KEY NOT NULL,
	"entity_type" varchar(50),
	"entity_id" integer,
	"reason" text NOT NULL,
	"added_by" integer,
	"expires_at" timestamp,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "companies" (
	"company_id" serial PRIMARY KEY NOT NULL,
	"user_id" integer,
	"company_name" varchar(255) NOT NULL,
	"industry" varchar(100),
	"company_size" varchar(50),
	"website" varchar(255),
	"logo_url" varchar(500),
	"description" text,
	"address" text,
	"city" varchar(100),
	"district" varchar(100),
	"contact_email" varchar(255),
	"contact_phone" varchar(20),
	"is_verified" boolean DEFAULT false,
	"rating" numeric(2, 1) DEFAULT '0.0',
	"total_jobs_posted" integer DEFAULT 0,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now(),
	CONSTRAINT "companies_user_id_unique" UNIQUE("user_id")
);
--> statement-breakpoint
CREATE TABLE "company_images" (
	"image_id" serial PRIMARY KEY NOT NULL,
	"company_id" integer NOT NULL,
	"image_url" varchar(500) NOT NULL,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "daily_statistics" (
	"stat_id" serial PRIMARY KEY NOT NULL,
	"stat_date" date NOT NULL,
	"new_jobs" integer DEFAULT 0,
	"new_applications" integer DEFAULT 0,
	"new_companies" integer DEFAULT 0,
	"new_students" integer DEFAULT 0,
	"total_job_views" integer DEFAULT 0,
	"created_at" timestamp DEFAULT now(),
	CONSTRAINT "daily_statistics_stat_date_unique" UNIQUE("stat_date")
);
--> statement-breakpoint
CREATE TABLE "job_categories" (
	"category_id" serial PRIMARY KEY NOT NULL,
	"category_name" varchar(100) NOT NULL,
	"description" text,
	"created_at" timestamp DEFAULT now(),
	CONSTRAINT "job_categories_category_name_unique" UNIQUE("category_name")
);
--> statement-breakpoint
CREATE TABLE "job_postings" (
	"job_id" serial PRIMARY KEY NOT NULL,
	"company_id" integer,
	"category_id" integer,
	"job_title" varchar(255) NOT NULL,
	"job_description" text NOT NULL,
	"requirements" text NOT NULL,
	"benefits" text,
	"employment_type" varchar(50),
	"experience_level" varchar(50),
	"position_level" varchar(50),
	"number_of_positions" integer DEFAULT 1,
	"salary_min" integer,
	"salary_max" integer,
	"salary_type" varchar(20),
	"is_salary_negotiable" boolean DEFAULT true,
	"work_location" varchar(255),
	"city" varchar(100),
	"district" varchar(100),
	"is_remote" boolean DEFAULT false,
	"application_deadline" date,
	"start_date" date,
	"status" varchar(20) DEFAULT 'pending',
	"is_featured" boolean DEFAULT false,
	"is_urgent" boolean DEFAULT false,
	"view_count" integer DEFAULT 0,
	"application_count" integer DEFAULT 0,
	"admin_notes" text,
	"rejection_reason" text,
	"approved_by" integer,
	"approved_at" timestamp,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now(),
	"expires_at" timestamp
);
--> statement-breakpoint
CREATE TABLE "job_required_skills" (
	"job_skill_id" serial PRIMARY KEY NOT NULL,
	"job_id" integer,
	"skill_id" integer,
	"is_required" boolean DEFAULT true,
	"proficiency_level" varchar(20),
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "job_views" (
	"view_id" serial PRIMARY KEY NOT NULL,
	"job_id" integer,
	"student_id" integer,
	"ip_address" varchar(45),
	"user_agent" text,
	"viewed_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "majors" (
	"major_id" serial PRIMARY KEY NOT NULL,
	"major_code" varchar(20) NOT NULL,
	"major_name" varchar(255) NOT NULL,
	"description" text,
	"created_at" timestamp DEFAULT now(),
	CONSTRAINT "majors_major_code_unique" UNIQUE("major_code")
);
--> statement-breakpoint
CREATE TABLE "notifications" (
	"notification_id" serial PRIMARY KEY NOT NULL,
	"user_id" integer,
	"type" varchar(50),
	"title" varchar(255) NOT NULL,
	"message" text NOT NULL,
	"link" varchar(500),
	"is_read" boolean DEFAULT false,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "reports" (
	"report_id" serial PRIMARY KEY NOT NULL,
	"reporter_id" integer,
	"reported_type" varchar(50),
	"reported_id" integer,
	"reason" varchar(255) NOT NULL,
	"description" text,
	"status" varchar(50) DEFAULT 'pending',
	"resolved_by" integer,
	"resolution_notes" text,
	"created_at" timestamp DEFAULT now(),
	"resolved_at" timestamp
);
--> statement-breakpoint
CREATE TABLE "roles" (
	"role_id" serial PRIMARY KEY NOT NULL,
	"role_name" varchar(50) NOT NULL,
	"description" text,
	"created_at" timestamp DEFAULT now(),
	CONSTRAINT "roles_role_name_unique" UNIQUE("role_name")
);
--> statement-breakpoint
CREATE TABLE "saved_jobs" (
	"saved_job_id" serial PRIMARY KEY NOT NULL,
	"student_id" integer,
	"job_id" integer,
	"notes" text,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "saved_searches" (
	"saved_search_id" serial PRIMARY KEY NOT NULL,
	"student_id" integer,
	"search_name" varchar(255),
	"search_query" text,
	"filters" jsonb,
	"is_alert_enabled" boolean DEFAULT false,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "search_history" (
	"search_id" serial PRIMARY KEY NOT NULL,
	"student_id" integer,
	"search_query" text,
	"filters" jsonb,
	"results_count" integer,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "skills" (
	"skill_id" serial PRIMARY KEY NOT NULL,
	"skill_name" varchar(100) NOT NULL,
	"created_at" timestamp DEFAULT now(),
	CONSTRAINT "skills_skill_name_unique" UNIQUE("skill_name")
);
--> statement-breakpoint
CREATE TABLE "students" (
	"student_id" serial PRIMARY KEY NOT NULL,
	"user_id" integer,
	"student_code" varchar(20) NOT NULL,
	"full_name" varchar(255) NOT NULL,
	"date_of_birth" date,
	"gender" varchar(10),
	"phone" varchar(20),
	"avatar_url" varchar(500),
	"address" text,
	"email_student" text,
	"major_id" integer,
	"enrollment_year" integer,
	"expected_graduation_year" integer,
	"current_year" integer,
	"gpa" numeric(3, 2),
	"cv_url" varchar(500),
	"bio" text,
	"career_goals" text,
	"linkedin_url" varchar(255),
	"github_url" varchar(255),
	"portfolio_url" varchar(255),
	"desired_position" varchar(255),
	"desired_salary_min" integer,
	"desired_salary_max" integer,
	"desired_location" varchar(255),
	"work_type" varchar(50),
	"is_open_to_work" boolean DEFAULT true,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now(),
	CONSTRAINT "students_user_id_unique" UNIQUE("user_id"),
	CONSTRAINT "students_student_code_unique" UNIQUE("student_code")
);
--> statement-breakpoint
CREATE TABLE "system_settings" (
	"setting_id" serial PRIMARY KEY NOT NULL,
	"setting_key" varchar(100) NOT NULL,
	"setting_value" text,
	"description" text,
	"updated_at" timestamp DEFAULT now(),
	CONSTRAINT "system_settings_setting_key_unique" UNIQUE("setting_key")
);
--> statement-breakpoint
CREATE TABLE "users" (
	"user_id" serial PRIMARY KEY NOT NULL,
	"email" varchar(255) NOT NULL,
	"password_hash" varchar(255) NOT NULL,
	"role_id" integer,
	"is_active" boolean DEFAULT true,
	"is_verified" boolean DEFAULT false,
	"verification_token" varchar(255),
	"reset_token" varchar(255),
	"reset_token_expires" timestamp,
	"last_login" timestamp,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now(),
	CONSTRAINT "users_email_unique" UNIQUE("email")
);
--> statement-breakpoint
ALTER TABLE "application_status_history" ADD CONSTRAINT "application_status_history_application_id_applications_application_id_fk" FOREIGN KEY ("application_id") REFERENCES "public"."applications"("application_id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "application_status_history" ADD CONSTRAINT "application_status_history_changed_by_users_user_id_fk" FOREIGN KEY ("changed_by") REFERENCES "public"."users"("user_id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "applications" ADD CONSTRAINT "applications_job_id_job_postings_job_id_fk" FOREIGN KEY ("job_id") REFERENCES "public"."job_postings"("job_id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "applications" ADD CONSTRAINT "applications_student_id_students_student_id_fk" FOREIGN KEY ("student_id") REFERENCES "public"."students"("student_id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "blacklist" ADD CONSTRAINT "blacklist_added_by_users_user_id_fk" FOREIGN KEY ("added_by") REFERENCES "public"."users"("user_id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "companies" ADD CONSTRAINT "companies_user_id_users_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("user_id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "company_images" ADD CONSTRAINT "company_images_company_id_companies_company_id_fk" FOREIGN KEY ("company_id") REFERENCES "public"."companies"("company_id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "job_postings" ADD CONSTRAINT "job_postings_company_id_companies_company_id_fk" FOREIGN KEY ("company_id") REFERENCES "public"."companies"("company_id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "job_postings" ADD CONSTRAINT "job_postings_category_id_job_categories_category_id_fk" FOREIGN KEY ("category_id") REFERENCES "public"."job_categories"("category_id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "job_postings" ADD CONSTRAINT "job_postings_approved_by_users_user_id_fk" FOREIGN KEY ("approved_by") REFERENCES "public"."users"("user_id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "job_required_skills" ADD CONSTRAINT "job_required_skills_job_id_job_postings_job_id_fk" FOREIGN KEY ("job_id") REFERENCES "public"."job_postings"("job_id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "job_required_skills" ADD CONSTRAINT "job_required_skills_skill_id_skills_skill_id_fk" FOREIGN KEY ("skill_id") REFERENCES "public"."skills"("skill_id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "job_views" ADD CONSTRAINT "job_views_job_id_job_postings_job_id_fk" FOREIGN KEY ("job_id") REFERENCES "public"."job_postings"("job_id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "job_views" ADD CONSTRAINT "job_views_student_id_students_student_id_fk" FOREIGN KEY ("student_id") REFERENCES "public"."students"("student_id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "notifications" ADD CONSTRAINT "notifications_user_id_users_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("user_id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "reports" ADD CONSTRAINT "reports_reporter_id_users_user_id_fk" FOREIGN KEY ("reporter_id") REFERENCES "public"."users"("user_id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "reports" ADD CONSTRAINT "reports_resolved_by_users_user_id_fk" FOREIGN KEY ("resolved_by") REFERENCES "public"."users"("user_id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "saved_jobs" ADD CONSTRAINT "saved_jobs_student_id_students_student_id_fk" FOREIGN KEY ("student_id") REFERENCES "public"."students"("student_id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "saved_jobs" ADD CONSTRAINT "saved_jobs_job_id_job_postings_job_id_fk" FOREIGN KEY ("job_id") REFERENCES "public"."job_postings"("job_id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "saved_searches" ADD CONSTRAINT "saved_searches_student_id_students_student_id_fk" FOREIGN KEY ("student_id") REFERENCES "public"."students"("student_id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "search_history" ADD CONSTRAINT "search_history_student_id_students_student_id_fk" FOREIGN KEY ("student_id") REFERENCES "public"."students"("student_id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "students" ADD CONSTRAINT "students_user_id_users_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("user_id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "students" ADD CONSTRAINT "students_major_id_majors_major_id_fk" FOREIGN KEY ("major_id") REFERENCES "public"."majors"("major_id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "users" ADD CONSTRAINT "users_role_id_roles_role_id_fk" FOREIGN KEY ("role_id") REFERENCES "public"."roles"("role_id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
CREATE UNIQUE INDEX "uq_application_job_student" ON "applications" USING btree ("job_id","student_id");--> statement-breakpoint
CREATE INDEX "idx_applications_job" ON "applications" USING btree ("job_id");--> statement-breakpoint
CREATE INDEX "idx_applications_student" ON "applications" USING btree ("student_id");--> statement-breakpoint
CREATE INDEX "idx_applications_status" ON "applications" USING btree ("status");--> statement-breakpoint
CREATE INDEX "idx_applications_created_at" ON "applications" USING btree ("created_at");--> statement-breakpoint
CREATE INDEX "idx_companies_user_id" ON "companies" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "idx_companies_is_verified" ON "companies" USING btree ("is_verified");--> statement-breakpoint
CREATE INDEX "idx_companies_city" ON "companies" USING btree ("city");--> statement-breakpoint
CREATE INDEX "idx_companies_fulltext" ON "companies" USING gin (to_tsvector('english', "company_name" || ' ' || coalesce("description", '')));--> statement-breakpoint
CREATE INDEX "idx_jobs_company" ON "job_postings" USING btree ("company_id");--> statement-breakpoint
CREATE INDEX "idx_jobs_category" ON "job_postings" USING btree ("category_id");--> statement-breakpoint
CREATE INDEX "idx_jobs_status" ON "job_postings" USING btree ("status");--> statement-breakpoint
CREATE INDEX "idx_jobs_deadline" ON "job_postings" USING btree ("application_deadline");--> statement-breakpoint
CREATE INDEX "idx_jobs_city" ON "job_postings" USING btree ("city");--> statement-breakpoint
CREATE INDEX "idx_jobs_created_at" ON "job_postings" USING btree ("created_at");--> statement-breakpoint
CREATE INDEX "idx_jobs_featured" ON "job_postings" USING btree ("is_featured");--> statement-breakpoint
CREATE INDEX "idx_jobs_fulltext" ON "job_postings" USING gin (to_tsvector('english', "job_title" || ' ' || "job_description"));--> statement-breakpoint
CREATE UNIQUE INDEX "uq_job_skill" ON "job_required_skills" USING btree ("job_id","skill_id");--> statement-breakpoint
CREATE INDEX "idx_job_skills_job" ON "job_required_skills" USING btree ("job_id");--> statement-breakpoint
CREATE INDEX "idx_job_skills_skill" ON "job_required_skills" USING btree ("skill_id");--> statement-breakpoint
CREATE INDEX "idx_notifications_user" ON "notifications" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "idx_notifications_read" ON "notifications" USING btree ("is_read");--> statement-breakpoint
CREATE UNIQUE INDEX "uq_saved_job_student" ON "saved_jobs" USING btree ("student_id","job_id");--> statement-breakpoint
CREATE INDEX "idx_students_user_id" ON "students" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "idx_students_code" ON "students" USING btree ("student_code");--> statement-breakpoint
CREATE INDEX "idx_students_major" ON "students" USING btree ("major_id");--> statement-breakpoint
CREATE INDEX "idx_students_graduation_year" ON "students" USING btree ("expected_graduation_year");--> statement-breakpoint
CREATE INDEX "idx_users_email" ON "users" USING btree ("email");--> statement-breakpoint
CREATE INDEX "idx_users_role" ON "users" USING btree ("role_id");