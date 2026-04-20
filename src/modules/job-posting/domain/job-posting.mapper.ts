import { toRelativeTime } from "src/utils/relative-time.util";
import { AdminJobCard, CompanyJobCard, JobPostingResponse, JobSkillItem, ProfileJobCard, StudentJobCard } from "../interfaces";
import { JobPostingDomain } from "./job-posting.domain";

export class JobPostingMapper {

    static toProfileJobCard(domain: JobPostingDomain): ProfileJobCard {
        return {
            jobId: domain.jobId,
            jobTitle: domain.jobTitle,
            city: domain.city,
            categoryId: domain.categoryId,
            status: domain.status,
            salaryMin: domain.salaryMin,
            salaryMax: domain.salaryMax,
            salaryType: domain.salaryType,
            isSalaryNegotiable: domain.isSalaryNegotiable,
            approvedAt: domain.approvedAt
        }
    }

    static toStudentCard(
        domain: JobPostingDomain,
        extra: {
            companyName: string;
            logoUrl: string | null;
            skills: JobSkillItem[];
            applicantCount: number;
        }
    ): StudentJobCard {
        return {
            jobId: domain.jobId,
            companyId: domain.companyId,
            companyName: extra.companyName,
            logoUrl: extra.logoUrl,
            jobTitle: domain.jobTitle,
            city: domain.city,
            salaryMin: domain.salaryMin,
            salaryMax: domain.salaryMax,
            salaryType: domain.salaryType as StudentJobCard['salaryType'],
            isSalaryNegotiable: domain.isSalaryNegotiable,
            postedAt: toRelativeTime(domain.createdAt),
            applicantCount: extra.applicantCount,
            skills: extra.skills,
            // Computed từ domain — mapper chỉ gọi, không tự tính
            //isExpired:           domain.isExpired(),
            //canApply:            domain.canAcceptApplications(),
            //salaryDisplay:       domain.getSalaryDisplay(),
        };
    }

    private static resolveTag(domain: JobPostingDomain): CompanyJobCard['tag'] {
        const now = new Date();

        if (domain.status !== 'approved') {
            return 'Pending';
        }

        if (!domain.isActive) {
            return 'Hidden';
        }

        if (domain.applicationDeadline) {
            const deadline = new Date(domain.applicationDeadline);
            if (deadline < now) {
                return 'Closed';
            }
        }

        return 'Active';
    }

    static toCompanyCard(
        domain: JobPostingDomain,
        extra: {
            companyName: string;
            logoUrl: string | null;
            skills: JobSkillItem[];
            applicantCount: number;
        },
    ): CompanyJobCard {
        return {
            jobId: domain.jobId,
            jobTitle: domain.jobTitle,
            city: domain.city,
            companyName: extra.companyName,
            logoUrl: extra.logoUrl,
            salaryMin: domain.salaryMin,
            salaryMax: domain.salaryMax,
            salaryType: domain.salaryType as CompanyJobCard['salaryType'],
            isSalaryNegotiable: domain.isSalaryNegotiable,
            applicationDeadline: domain.applicationDeadline,
            status: domain.status as CompanyJobCard['status'],
            tag: this.resolveTag(domain),
            applicantCount: extra.applicantCount,
            skills: extra.skills,
            createdAt: domain.createdAt,
        };
    }

    static toAdminCard(
        domain: JobPostingDomain,
        extra: {
            companyName: string;
            logoUrl: string | null;
        },
    ): AdminJobCard {
        return {
            jobId: domain.jobId,
            companyId: domain.companyId,
            companyName: extra.companyName,
            logoUrl: extra.logoUrl,
            jobTitle: domain.jobTitle,
            city: domain.city,
            salaryMin: domain.salaryMin,
            salaryMax: domain.salaryMax,
            salaryType: domain.salaryType as AdminJobCard['salaryType'],
            isSalaryNegotiable: domain.isSalaryNegotiable,
            applicationDeadline: domain.applicationDeadline,
            status: domain.status as AdminJobCard['status'],
        };
    }

    static toResponse(
        domain: JobPostingDomain,
        extra: {
            applicantCount: number;
            requiredSkills: JobSkillItem[];
            // Admin/Company xem thì truyền thêm company info nếu cần
            companyName?: string;
            logoUrl: string | null;
        },
    ): JobPostingResponse {
        return {
            jobId: domain.jobId,
            companyId: domain.companyId,
            categoryId: domain.categoryId,
            logoUrl: extra.logoUrl,
            jobTitle: domain.jobTitle,
            jobDescription: domain.jobDescription,
            requirements: domain.requirements,
            benefits: domain.benefits,
            experienceLevel: domain.experienceLevel,
            positionLevel: domain.positionLevel,
            numberOfPositions: domain.numberOfPositions,
            salaryMin: domain.salaryMin,
            salaryMax: domain.salaryMax,
            salaryType: domain.salaryType as JobPostingResponse['salaryType'],
            isSalaryNegotiable: domain.isSalaryNegotiable,
            city: domain.city,
            applicationDeadline: domain.applicationDeadline,
            isActive: domain.isActive,
            status: domain.status as JobPostingResponse['status'],
            applicantCount: extra.applicantCount,
            createdAt: domain.createdAt,
            updatedAt: domain.updatedAt,
            requiredSkills: extra.requiredSkills,
            adminNote: domain.adminNote,
            // Computed từ domain
            //isExpired:              domain.isExpired(),
            // canAcceptApplications:  domain.canAcceptApplications(),
            // salaryDisplay:          domain.getSalaryDisplay(),
        };
    }
}