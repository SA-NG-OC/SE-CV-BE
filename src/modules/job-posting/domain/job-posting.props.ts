export type JobPostingStatus = 'pending' | 'approved' | 'rejected' | 'restricted';
export type JobPostingProps = {
    id: number;
    companyId: number;
    categoryId: number | null;

    jobTitle: string;
    jobDescription: string;
    requirements: string;
    benefits: string | null;

    experienceLevel: string | null;
    positionLevel: string | null;
    numberOfPositions: number;

    salaryMin: number | null;
    salaryMax: number | null;
    salaryType: string | null;
    isSalaryNegotiable: boolean;

    city: string | null;
    applicationDeadline: string | null;

    status: JobPostingStatus;
    adminNote: string | null;
    applicationCount: number;
    approvedAt: Date | null,
    approvedBy: number | null,
    createdAt: Date;
    updatedAt: Date;
};