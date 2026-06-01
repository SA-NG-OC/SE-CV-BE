import { Inject, Injectable } from '@nestjs/common';
import {
  I_STATISTICS_REPOSITORY,
  type IStatisticsRepository,
} from './repositories/statistics-repository.interface';
import { DashboardStats } from './types';
import { StatisticsMapper } from './mapper/statistics.mapper';

// statistics.service.ts
@Injectable()
export class StatisticsService {
  constructor(
    @Inject(I_STATISTICS_REPOSITORY)
    private readonly repo: IStatisticsRepository,
  ) {}

  async getDashboardStats(): Promise<DashboardStats> {
    const raw = await this.repo.getDashboardStats();
    return StatisticsMapper.toDashboardStats(raw);
  }

  async getDashboard(companyId: number) {
    return this.repo.getCompanyDashboardStats(companyId);
  }

  async getApplicationsLast7Days(companyId: number) {
    return this.repo.getApplicationsLast7Days(companyId);
  }

  async getJobsByCategory(companyId: number) {
    return this.repo.getJobsByCategory(companyId);
  }

  async getAdminDashboard() {
    return this.repo.getAdminDashboardStats();
  }

  async getJobsCountByCategory() {
    return this.repo.getJobsCountByCategory();
  }

  async getApplicationSuccessRateLast12Months() {
    return this.repo.getApplicationSuccessRateLast12Months();
  }

  async getApplicationCountLast12Months() {
    return this.repo.getApplicationCountLast12Months();
  }

  async getTopCompaniesByJobCount() {
    return this.repo.getTopCompaniesByJobCount();
  }
}
