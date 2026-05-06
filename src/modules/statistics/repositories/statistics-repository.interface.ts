import { DashboardStatsRaw } from "../types/statistics.raw.type";

export const I_STATISTICS_REPOSITORY = 'I_STATISTICS_REPOSITORY';

// statistics.interface.ts
export interface IStatisticsRepository {
    getDashboardStats(): Promise<DashboardStatsRaw>;
}

