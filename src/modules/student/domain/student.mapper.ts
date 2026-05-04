import { StudentDomain } from '../domain/student.domain';
import {
    MajorResponse,
    StudentAdminCard,
    StudentCard,
    StudentGeneralInfo,
    StudentProfile,
    StudentResponse,
    StudentResumeItem,
    StudentSkillItem,
} from '../types/student.interface';
import { StudentStatus } from '../domain/student.props';
import {
    MajorRaw,
    StudentAdminCardRaw,
    StudentCardRaw,
    StudentGeneralInfoRaw,
    StudentProfileRaw,
    StudentResumeRaw,
} from '../types/student.raw';

export class StudentMapper {
    static toMajorResponse(raw: MajorRaw): MajorResponse {
        return {
            majorId: raw.major_id,
            majorName: raw.major_name,
        };
    }

    static toGeneralInfo(raw: StudentGeneralInfoRaw): StudentGeneralInfo {
        return {
            totalStudents: raw.total_students,
            studying: raw.studying,
            graduated: raw.graduated,
        };
    }

    static toAdminCard(raw: StudentAdminCardRaw): StudentAdminCard {
        return {
            studentId: raw.student_id,
            fullName: raw.full_name,
            studentCode: raw.student_code,
            email: raw.email_student,
            currentYear: raw.current_year,
            enrollmentYear: raw.enrollment_year,
            studentStatus: (raw.student_status ?? 'STUDYING') as StudentStatus,
            totalApplications: raw.total_applications,
        };
    }

    static toResumeItem(raw: StudentResumeRaw): StudentResumeItem {
        return {
            resumeId: raw.resume_id,
            resumeName: raw.resume_name,
            cvUrl: raw.cv_url,
            isDefault: raw.is_default,
        };
    }

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

    static toStudentCard(raw: StudentCardRaw): StudentCard {
        return {
            studentId: raw.student_id,
            fullName: raw.full_name,
            avatarUrl: raw.avatar_url,
            currentYear: raw.current_year,
            gpa: raw.gpa,
            studentStatus: raw.student_status as StudentStatus,
            isOpenToWork: raw.is_open_to_work,
            skills: raw.skills,
        };
    }

    static toStudentProfile(raw: StudentProfileRaw): StudentProfile {
        const skills: StudentSkillItem[] = (raw.skills ?? []).map((s: any) => ({
            skillId: s.skill_id,
            skillName: s.skill_name,
        }));

        const resumes: StudentResumeItem[] = (raw.resumes ?? [])
            .filter(Boolean)
            .map((r: any) => ({
                resumeId: r.resume_id,
                resumeName: r.resume_name,
                cvUrl: r.cv_url,
                isDefault: r.is_default,
            }));

        return {
            studentId: raw.student_id,
            fullName: raw.full_name,
            avatarUrl: raw.avatar_url,
            currentYear: raw.current_year,
            gpa: raw.gpa,
            isOpenToWork: raw.is_open_to_work,
            skills,
            resumes,
        };
    }
}