import { StudentStatus } from '../domain/student.props';

export interface StudentSkillItem {
    skillName: string;
}

export interface StudentResumeItem {
    resumeId: number;
    resumeName: string;
    cvUrl: string;
    isDefault: boolean | null;
}

export interface StudentResponse {
    studentId: number;
    fullName: string;
    studentCode: string;
    emailStudent: string | null;
    phone: string | null;
    majorId: number | null;
    majorName: string | null;
    currentYear: number | null;
    enrollmentYear: number | null;
    gpa: number | null;
    studentStatus: StudentStatus;
    isOpenToWork: boolean;
    createdAt: Date | null;
    skills: string[];
    resumes: StudentResumeItem[];
    totalApplications: number;
}

export interface StudentAdminCard {
    studentId: number;
    fullName: string;
    studentCode: string;
    email: string | null;
    currentYear: number | null;
    enrollmentYear: number | null;
    studentStatus: StudentStatus;
    totalApplications: number;
}

export interface StudentListMeta {
    currentPage: number;
    itemsPerPage: number;
    totalItem: number;
    totalPages: number;
}

export interface StudentAdminListResult {
    data: StudentAdminCard[];
    meta: StudentListMeta;
}

export interface StudentGeneralInfo {
    totalStudents: number;
    studying: number;
    graduated: number;
}