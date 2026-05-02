import { JobSkillItem } from 'src/modules/job-posting/interfaces';
import { ApplicationStatus } from './application.props';
import { ApplicantCardRaw, ApplicationCardRaw, ApplicationStatsRaw } from '../../types/application.raw';
import { ApplicantCardView, ApplicationCardView, ApplicationStats } from '../../types/application.interface';

export class ApplicationMapper {
    static toCardView(raw: ApplicationCardRaw): ApplicationCardView {
        return {
            applicationId: raw.application_id,
            status: raw.status as ApplicationStatus,
            createdAt: raw.created_at,
            job: {
                jobId: raw.job_id,
                jobTitle: raw.job_title,
            },
            company: {
                companyId: raw.company_id,
                companyName: raw.company_name,
                logoUrl: raw.logo_url,
            },
        };
    }

    static toApplicantCardView(raw: ApplicantCardRaw): ApplicantCardView {
        const skills: JobSkillItem[] =
            typeof raw.skills === 'string' ? JSON.parse(raw.skills) : raw.skills;

        return {
            applicationId: raw.application_id,
            status: raw.status as ApplicationStatus,
            cvUrl: raw.cv_url,
            createdAt: raw.created_at,
            updatedAt: raw.updated_at,
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

    static toStats(rows: ApplicationStatsRaw): ApplicationStats {
        const byStatus: Record<ApplicationStatus, number> = {
            submitted: 0,
            interviewing: 0,
            passed: 0,
            rejected: 0,
        };

        let total = 0;
        for (const row of rows) {
            const s = row.status as ApplicationStatus;
            byStatus[s] = Number(row.count);
            total += Number(row.count);
        }

        return { total, byStatus };
    }
}