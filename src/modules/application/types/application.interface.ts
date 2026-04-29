import { JobSkillItem } from "src/modules/job-posting/interfaces";
import { ApplicationStatus } from "../domain/application/application.props";

export interface ApplicationCardView {
    applicationId: number;
    status: ApplicationStatus;
    createdAt: Date;
    job: {
        jobId: number;
        jobTitle: string;
    };
    company: {
        companyName: string;
        logoUrl: string | null;
    };
}

export interface ApplicationStats {
    total: number;
    byStatus: Record<ApplicationStatus, number>;
}

export interface GetMyApplicationsQuery {
    page: number;
    limit: number;
    status?: ApplicationStatus;
}

export interface ApplicantCardView {
    applicationId: number;
    status: ApplicationStatus;
    cvUrl: string;
    createdAt: Date;
    updatedAt: Date | null;
    student: {
        studentId: number;
        fullName: string;
        email: string | null;
        avatarUrl: string | null;
        currentYear: number | null;
        majorName: string | null;
        gpa: string | null;
        phone: string | null;
        skills: JobSkillItem[];
    };
    job: {
        jobId: number;
        jobTitle: string;
    };
}

export interface GetMyApplicationsQuery {
    page: number;
    limit: number;
    status?: ApplicationStatus;
}

export interface GetCompanyApplicationsFilter {
    jobId?: number;
    status?: ApplicationStatus | ApplicationStatus[];
    dateRange?: '7days' | '30days';
    page: number;
    limit: number;
}