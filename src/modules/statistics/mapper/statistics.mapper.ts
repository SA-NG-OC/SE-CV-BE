import { DashboardStats } from "../types";
import { DashboardStatsRaw } from "../types/statistics.raw.type";

export class StatisticsMapper {
    static toDashboardStats(raw: DashboardStatsRaw): DashboardStats {
        return {
            totalCompanies: raw.total_companies,
            avgRating: Number(raw.avg_rating),
            totalApplications: raw.total_applications,
            totalPassed: raw.total_passed,
        };
    }
}