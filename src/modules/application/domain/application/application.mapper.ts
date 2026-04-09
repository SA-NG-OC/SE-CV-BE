import { JobSkillItem } from 'src/modules/job-posting/interfaces';
import { ApplicantCardView, ApplicationCardView } from '../../interfaces/application.interface';
import { ApplicationStatus } from './application.props';

export class ApplicationMapper {
    static toCardView(raw: {
        application_id: number;
        status: string;
        created_at: Date;
        job_id: number;
        job_title: string;
        company_name: string;
        logo_url: string | null;
    }): ApplicationCardView {
        return {
            applicationId: raw.application_id,
            status: raw.status as ApplicationStatus,
            createdAt: raw.created_at,
            job: {
                jobId: raw.job_id,
                jobTitle: raw.job_title,
            },
            company: {
                companyName: raw.company_name,
                logoUrl: raw.logo_url,
            },
        };
    }

    static toApplicantCardView(
        raw: {
            application_id: number;
            status: string;
            cv_url: string;
            created_at: Date;
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
        },
        skills: JobSkillItem[],
    ): ApplicantCardView {
        return {
            applicationId: raw.application_id,
            status: raw.status as ApplicationStatus,
            cvUrl: raw.cv_url,
            createdAt: raw.created_at,
            student: {
                studentId: raw.student_id,
                fullName: raw.full_name,
                email: raw.email_student,
                avatarUrl: raw.avatar_url,
                currentYear: raw.current_year,
                majorName: raw.major_name,
                gpa: raw.gpa,
                phone: raw.phone,
                skills,
            },
            job: {
                jobId: raw.job_id,
                jobTitle: raw.job_title,
            },
        };
    }
}