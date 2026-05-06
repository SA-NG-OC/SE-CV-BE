import { DashboardStatsRaw } from "../types/statistics.raw.type";

export const I_STATISTICS_REPOSITORY = 'I_STATISTICS_REPOSITORY';

// statistics.interface.ts
export interface IStatisticsRepository {
    getDashboardStats(): Promise<DashboardStatsRaw>;
    getCompanyDashboardStats(companyId: number);
    getApplicationsLast7Days(companyId: number);
    getJobsByCategory(companyId: number);
    getAdminDashboardStats(): Promise<{
        totalCompanies: number;
        totalStudents: number;
        totalApplications: number;
        totalJobPostings: number;
    }>;
    getJobsCountByCategory(): Promise<
        { categoryId: number; categoryName: string; totalJobs: number }[]
    >;

    getApplicationSuccessRateLast12Months(): Promise<
        { month: string; successRate: number }[]
    >

    getApplicationCountLast12Months(): Promise<
        { month: string; totalApplications: number }[]
    >

    getTopCompaniesByJobCount(): Promise<
        { companyId: number; companyName: string; totalJobs: number }[]
    >
}

