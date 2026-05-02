import { InferSelectModel } from "drizzle-orm";
import * as schema from "src/database/schema";

export type ApplicationRaw = InferSelectModel<typeof schema.applications>;

export type ApplicationCardRaw = {
    application_id: number;
    status: string;
    created_at: Date;
    company_id: number | null;
    job_id: number;
    job_title: string;
    company_name: string;
    logo_url: string | null;
};

export type ApplicantCardRaw = {
    application_id: number;
    status: string;
    cv_url: string;
    created_at: Date;
    updated_at: Date | null;
    student_id: number;
    full_name: string;
    email_student: string | null;
    avatar_url: string | null;
    current_year: number | null;
    major_name: string | null;
    gpa: string | null;
    phone: string | null;
    job_id: number;
    job_title: string;
    skills: string;
};

export type ApplicationStatsRaw = {
    status: string;
    count: number;
}[];