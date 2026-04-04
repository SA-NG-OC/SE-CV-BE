import { CompanyDomain } from '../domain/company.domain';
import {
    CompanyResponse,
    CompanyImageItem,
    CompanyAdminCard,
    CompanyUserCard,
    CompanyStatusCount,
    CompanyStatusUpdateResult,
} from '../interfaces/company.interface';
import { CompanyStatus } from './company.props';

// Raw DB row cho admin card (từ Drizzle select cụ thể)
export interface RawAdminCard {
    companyId: number;
    companyName: string;
    logoUrl: string | null;
    industry: string | null;
    status: string | null;
    rating: unknown;
    followers: number | null;
    totalJobs: number | null;
    companySize: string | null;
    createdAt: Date | null;
}

// Raw DB row cho user card
export interface RawUserCard {
    company_id: number;
    company_name: string;
    logo_url: string | null;
    industry: string | null;
    active_jobs: number;
}

// Raw status count từ groupBy
export interface RawStatusCount {
    status: string | null;
    count: number;
}

// Raw image row từ DB
export interface RawImageRow {
    image_id: number;
    company_id: number;
    image_url: string;
    created_at: Date | null;
}

// ─────────────────────────────────────────────────────────────────────────────
// MAPPER
// Nhiệm vụ duy nhất: chuyển đổi Domain / raw DB row → Response shape.
// Không chứa logic nghiệp vụ.
// ─────────────────────────────────────────────────────────────────────────────
export class CompanyMapper {

    // ── Domain → CompanyResponse (full detail) ────────────────────────────
    static toResponse(
        domain: CompanyDomain,
        officeImages: CompanyImageItem[] = [],
    ): CompanyResponse {
        return {
            companyId: domain.companyId,
            userId: domain.userId,
            companyName: domain.companyName,
            industry: domain.industry,
            slogan: domain.slogan,
            companySize: domain.companySize,
            website: domain.website,
            logoUrl: domain.logoUrl,
            coverImageUrl: domain.coverImageUrl,
            description: domain.description,
            address: domain.address,
            contactEmail: domain.contactEmail,
            contactPhone: domain.contactPhone,
            status: domain.status,
            adminNote: domain.adminNote,
            rating: domain.rating,
            totalJobsPosted: domain.totalJobsPosted,
            totalFollowers: domain.totalFollowers,
            createdAt: domain.createdAt,
            updatedAt: domain.updatedAt,
            officeImages,
        };
    }

    // ── Raw DB row → CompanyImageItem ─────────────────────────────────────
    static toImageItem(row: RawImageRow): CompanyImageItem {
        return {
            imageId: row.image_id,
            companyId: row.company_id,
            imageUrl: row.image_url,
            createdAt: row.created_at,
        };
    }

    // ── Raw DB row → CompanyAdminCard ─────────────────────────────────────
    static toAdminCard(row: RawAdminCard): CompanyAdminCard {
        return {
            companyId: row.companyId,
            companyName: row.companyName,
            logoUrl: row.logoUrl,
            industry: row.industry,
            status: (row.status ?? 'PENDING') as CompanyStatus,
            rating: row.rating ? Number(row.rating) : 0,
            followers: row.followers ?? 0,
            totalJobs: row.totalJobs ?? 0,
            companySize: row.companySize,
            createdAt: row.createdAt,
        };
    }

    // ── Raw DB row → CompanyUserCard ──────────────────────────────────────
    static toUserCard(row: RawUserCard): CompanyUserCard {
        return {
            companyId: row.company_id,
            companyName: row.company_name,
            logoUrl: row.logo_url,
            industry: row.industry,
            activeJobs: row.active_jobs,
        };
    }

    // ── Raw status count rows → CompanyStatusCount[] ──────────────────────
    static toStatusCount(rows: RawStatusCount[]): CompanyStatusCount[] {
        return rows.map((r) => ({
            status: r.status,
            count: r.count,
        }));
    }

    // ── Domain + email → CompanyStatusUpdateResult ────────────────────────
    static toStatusUpdateResult(
        domain: CompanyDomain,
        email: string | undefined,
    ): CompanyStatusUpdateResult {
        return {
            companyId: domain.companyId,
            status: domain.status,
            adminNote: domain.adminNote,
            email,
        };
    }
}