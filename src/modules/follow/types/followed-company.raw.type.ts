// followed-company.raw.type.ts
export interface FollowedCompanyRaw extends Record<string, unknown> {
    follow_id: number;
    student_id: number;
    company_id: number;
    created_at: Date;
}