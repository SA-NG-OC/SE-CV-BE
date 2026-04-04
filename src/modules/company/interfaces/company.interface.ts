import { CompanyStatus } from "../domain/company.props";


// ── Ảnh văn phòng ──────────────────────────────────────────────────────────
export interface CompanyImageItem {
    imageId: number;
    companyId: number;
    imageUrl: string;
    createdAt: Date | null;
}

// ── Full response (detail page) ────────────────────────────────────────────
export interface CompanyResponse {
    companyId: number;
    userId: number;
    companyName: string;
    industry: string | null;
    slogan: string | null;
    companySize: string | null;
    website: string | null;
    logoUrl: string | null;
    coverImageUrl: string | null;
    description: string | null;
    address: string | null;
    contactEmail: string | null;
    contactPhone: string | null;
    status: CompanyStatus;
    adminNote: string | null;
    rating: number;
    totalJobsPosted: number;
    totalFollowers: number;
    createdAt: Date;
    updatedAt: Date;
    officeImages: CompanyImageItem[];
}

// ── Card dành cho Admin (danh sách + filter theo status) ──────────────────
export interface CompanyAdminCard {
    companyId: number;
    companyName: string;
    logoUrl: string | null;
    industry: string | null;
    status: CompanyStatus;
    rating: number;
    followers: number;
    totalJobs: number;
    companySize: string | null;
    createdAt: Date | null;
}

export interface CompanyStatusCount {
    status: string | null;
    count: number;
}

export interface CompanyAdminListResult {
    companies: CompanyAdminCard[];
    totalItems: number;
    statusCount: CompanyStatusCount[];
}

// ── Card dành cho User/Student (danh sách public) ─────────────────────────
export interface CompanyUserCard {
    companyId: number;
    companyName: string;
    logoUrl: string | null;
    industry: string | null;
    activeJobs: number;
}

export interface CompanyUserListResult {
    companies: CompanyUserCard[];
    totalItems: number;
}

// ── Kết quả sau khi approve/reject (cần email để gửi thông báo) ───────────
export interface CompanyStatusUpdateResult {
    companyId: number;
    status: CompanyStatus;
    adminNote: string | null;
    email: string | undefined;
}