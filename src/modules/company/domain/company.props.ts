export type CompanyStatus = 'PENDING' | 'APPROVED' | 'REJECTED' | 'RESTRICTED';

export type CompanyProps = {
    id: number;
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
};