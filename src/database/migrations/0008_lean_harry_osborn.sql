CREATE TABLE "student_resumes" (
	"resume_id" serial PRIMARY KEY NOT NULL,
	"student_id" integer,
	"resume_name" varchar(255) NOT NULL,
	"cv_url" varchar(500) NOT NULL,
	"is_default" boolean DEFAULT false,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "student_skills" (
	"student_id" integer,
	"skill_id" integer,
	"proficiency_level" varchar(50),
	"created_at" timestamp DEFAULT now(),
	CONSTRAINT "student_skills_student_id_skill_id_pk" PRIMARY KEY("student_id","skill_id")
);
--> statement-breakpoint
ALTER TABLE "student_resumes" ADD CONSTRAINT "student_resumes_student_id_students_student_id_fk" FOREIGN KEY ("student_id") REFERENCES "public"."students"("student_id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "student_skills" ADD CONSTRAINT "student_skills_student_id_students_student_id_fk" FOREIGN KEY ("student_id") REFERENCES "public"."students"("student_id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "student_skills" ADD CONSTRAINT "student_skills_skill_id_skills_skill_id_fk" FOREIGN KEY ("skill_id") REFERENCES "public"."skills"("skill_id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "idx_student_skills_student" ON "student_skills" USING btree ("student_id");--> statement-breakpoint
CREATE INDEX "idx_student_skills_skill" ON "student_skills" USING btree ("skill_id");--> statement-breakpoint
ALTER TABLE "students" DROP COLUMN "cv_url";