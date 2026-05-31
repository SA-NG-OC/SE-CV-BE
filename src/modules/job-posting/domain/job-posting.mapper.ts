// job-posting.mapper.ts
import { toRelativeTime } from "src/utils/relative-time.util";
import {
    AdminJobCard,
    CompanyJobCard,
    JobPostingResponse,
    JobSkillItem,
    JobTag,
    ProfileJobCard,
    StudentJobCard,
} from "../types";
import { JobPostingDomain } from "./job-posting.domain";
import { RawJobWithMeta } from "../types/job-posting.raw";

export class JobPostingMapper {

    // ── Helpers ──────────────────────────────────────────────────────────────

    private static resolveTag(domain: JobPostingDomain): CompanyJobCard['tag'] {
        if (domain.status !== 'approved') return 'Pending';
        if (!domain.isActive) return 'Hidden';
        if (domain.applicationDeadline && new Date(domain.applicationDeadline) < new Date()) {
            return 'Closed';
        }
        return 'Active';
    }

    private static resolveJobTag(domain: JobPostingDomain): JobTag {
        if (domain.status !== 'approved') return JobTag.PENDING;
        if (!domain.isActive) return JobTag.HIDDEN;
        if (domain.applicationDeadline && new Date(domain.applicationDeadline) < new Date()) {
            return JobTag.CLOSED;
        }
        return JobTag.ACTIVE;
    }

    // ── Mappers ──────────────────────────────────────────────────────────────

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
            applicationDeadline: domain.applicationDeadline,
        };
    }

    static toStudentCard(
        domain: JobPostingDomain,
        extra: {
            companyName: string;
            logoUrl: string | null;
            skills: JobSkillItem[];
            applicantCount: number;
            saved?: boolean;
        },
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
            saved: extra.saved ?? false,
        };
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
            tag: this.resolveJobTag(domain),
            saved: false,
        };
    }

    // ── Convenience: map từ RawJobWithMeta ───────────────────────────────────

    static rawToProfileJobCard(raw: RawJobWithMeta): ProfileJobCard {
        return this.toProfileJobCard(raw.domain);
    }

    static rawToStudentCard(raw: RawJobWithMeta, saved: boolean): StudentJobCard {
        return this.toStudentCard(raw.domain, {
            companyName: raw.companyName,
            logoUrl: raw.logoUrl,
            skills: raw.skills,
            applicantCount: raw.applicantCount,
            saved,
        });
    }

    static rawToCompanyCard(raw: RawJobWithMeta): CompanyJobCard {
        return this.toCompanyCard(raw.domain, {
            companyName: raw.companyName,
            logoUrl: raw.logoUrl,
            skills: raw.skills,
            applicantCount: raw.applicantCount,
        });
    }

    static rawToAdminCard(raw: RawJobWithMeta): AdminJobCard {
        return this.toAdminCard(raw.domain, {
            companyName: raw.companyName,
            logoUrl: raw.logoUrl,
        });
    }

    static rawToResponse(raw: RawJobWithMeta, saved: boolean): JobPostingResponse {
        return {
            ...this.toResponse(raw.domain, {
                applicantCount: raw.applicantCount,
                requiredSkills: raw.skills,
                companyName: raw.companyName,
                logoUrl: raw.logoUrl,
            }),
            saved,
        };
    }
}