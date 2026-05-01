import { StudentStatus } from '../domain/student.props';

export interface StudentSkillItem {
    skillId: number;
    skillName: string;
}

export interface StudentProfile {
    studentId: number;
    fullName: string;
    avatarUrl: string | null;
    currentYear: number | null;
    gpa: string | number | null;
    isOpenToWork: boolean;
    skills: StudentSkillItem[];
    resumes: StudentResumeItem[];
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

export interface StudentCard {
    studentId: number;
    fullName: string;
    avatarUrl: string | null;
    currentYear: number | null;
    gpa: string | number | null;
    studentStatus: StudentStatus;
    isOpenToWork: boolean;
    skills: string[];
}

export interface GetStudentsQuery {
    page: number;
    limit: number;
    search?: string;
    majorId?: number;
    years?: (number | 'GRADUATED')[];
    minGpa?: number;
    skillIds?: number[];
    isOpenToWork?: boolean;
}

export interface MajorResponse {
    id: number;
    name: string;
}