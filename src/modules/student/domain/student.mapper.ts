import { StudentDomain } from '../domain/student.domain';
import {
    StudentResponse,
    StudentAdminCard,
    StudentResumeItem,
    StudentGeneralInfo,
    StudentSkillItem,
    StudentCard,
    StudentProfile,
} from '../types/student.interface';
import { StudentStatus } from '../domain/student.props';

export interface RawStudentAdminCard {
    studentId: number;
    fullName: string;
    studentCode: string;
    email: string | null;
    currentYear: number | null;
    enrollmentYear: number | null;
    studentStatus: string | null;
    totalApplications: number;
}

export interface RawResumeRow {
    resumeId: number;
    resumeName: string;
    cvUrl: string;
    isDefault: boolean | null;
}

export interface RawGeneralInfo {
    totalStudents: number;
    studying: number;
    graduated: number;
}

export class StudentMapper {

    // ── Domain → StudentResponse (full detail) ────────────────────────────
    static toResponse(
        domain: StudentDomain,
        extra: {
            majorName: string | null;
            skills: string[];
            resumes: StudentResumeItem[];
            totalApplications: number;
        },
    ): StudentResponse {
        return {
            studentId: domain.studentId,
            fullName: domain.fullName,
            studentCode: domain.studentCode,
            emailStudent: domain.emailStudent,
            phone: domain.phone,
            majorId: domain.majorId,
            majorName: extra.majorName,
            currentYear: domain.currentYear,
            enrollmentYear: domain.enrollmentYear,
            gpa: domain.gpa,
            studentStatus: domain.studentStatus,
            isOpenToWork: domain.isOpenToWork,
            createdAt: domain.createdAt,
            skills: extra.skills,
            resumes: extra.resumes,
            totalApplications: extra.totalApplications,
        };
    }

    // ── Raw DB row → StudentAdminCard ─────────────────────────────────────
    static toAdminCard(row: RawStudentAdminCard): StudentAdminCard {
        return {
            studentId: row.studentId,
            fullName: row.fullName,
            studentCode: row.studentCode,
            email: row.email,
            currentYear: row.currentYear,
            enrollmentYear: row.enrollmentYear,
            studentStatus: (row.studentStatus ?? 'STUDYING') as StudentStatus,
            totalApplications: row.totalApplications,
        };
    }

    // ── Raw resume row → StudentResumeItem ────────────────────────────────
    static toResumeItem(row: RawResumeRow): StudentResumeItem {
        return {
            resumeId: row.resumeId,
            resumeName: row.resumeName,
            cvUrl: row.cvUrl,
            isDefault: row.isDefault,
        };
    }

    // ── Raw general info → StudentGeneralInfo ─────────────────────────────
    static toGeneralInfo(raw: RawGeneralInfo): StudentGeneralInfo {
        return {
            totalStudents: raw.totalStudents,
            studying: raw.studying,
            graduated: raw.graduated,
        };
    }

    static toStudentCard(raw: {
        student_id: number;
        full_name: string;
        avatar_url: string | null;
        current_year: number | null;
        gpa: string | number | null;
        student_status: StudentStatus;
        is_open_to_work: boolean;
        skills: string[];
    }): StudentCard {
        return {
            studentId: raw.student_id,
            fullName: raw.full_name,
            avatarUrl: raw.avatar_url,
            currentYear: raw.current_year,
            gpa: raw.gpa,
            studentStatus: raw.student_status,
            isOpenToWork: raw.is_open_to_work,
            skills: raw.skills,
        };
    }

    static toStudentProfile(raw: {
        student_id: number;
        full_name: string;
        avatar_url: string | null;
        current_year: number | null;
        gpa: string | number | null;
        is_open_to_work: boolean;
        skills: any[];
        resumes: any[];
    }): StudentProfile {
        return {
            studentId: raw.student_id,
            fullName: raw.full_name,
            avatarUrl: raw.avatar_url,
            currentYear: raw.current_year,
            gpa: raw.gpa,
            isOpenToWork: raw.is_open_to_work,
            skills: (raw.skills || []).map((s: any) => ({
                skillId: s.skill_id,
                skillName: s.skill_name
            })),
            resumes: (raw.resumes || []).filter(r => r !== null).map(r => ({
                resumeId: r.resume_id,
                resumeName: r.resume_name,
                cvUrl: r.cv_url,
                isDefault: r.is_default
            }))
        };
    }
}