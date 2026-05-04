import { InferSelectModel } from 'drizzle-orm';
import * as schema from 'src/database/schema';

export type StudentRaw = InferSelectModel<typeof schema.students>;

export type MajorRaw = {
    major_id: number;
    major_name: string;
};

export type StudentWithMajorRaw = {
    student: StudentRaw;
    major_name: string | null;
};

export type StudentAdminCardRaw = {
    student_id: number;
    full_name: string;
    student_code: string;
    email_student: string | null;
    current_year: number | null;
    enrollment_year: number | null;
    student_status: string | null;
    total_applications: number;
};

export type StudentGeneralInfoRaw = {
    total_students: number;
    studying: number;
    graduated: number;
};

export type StudentResumeRaw = {
    resume_id: number;
    resume_name: string;
    cv_url: string;
    is_default: boolean | null;
};

export type StudentCardRaw = {
    student_id: number;
    full_name: string;
    avatar_url: string | null;
    current_year: number | null;
    gpa: string | number | null;
    student_status: string;
    is_open_to_work: boolean;
    skills: string[];
};

export type StudentProfileRaw = {
    student_id: number;
    full_name: string;
    avatar_url: string | null;
    current_year: number | null;
    gpa: string | number | null;
    is_open_to_work: boolean;
    skills: any[];
    resumes: any[];
};

export type StudentSkillsRaw = string[];
export type StudentApplicationCountRaw = number;

export type StudentAdminListRaw = {
    data: StudentAdminCardRaw[];
    meta: {
        current_page: number;
        items_per_page: number;
        total_item: number;
        total_pages: number;
    };
};