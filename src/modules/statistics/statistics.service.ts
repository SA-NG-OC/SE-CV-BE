import { Inject, Injectable } from "@nestjs/common";
import { I_STATISTICS_REPOSITORY, type IStatisticsRepository } from "./repositories/statistics-repository.interface";
import { DashboardStats } from "./types";
import { StatisticsMapper } from "./mapper/statistics.mapper";

// statistics.service.ts
@Injectable()
export class StatisticsService {
  constructor(
    @Inject(I_STATISTICS_REPOSITORY)
    private readonly repo: IStatisticsRepository
  ) { }

  async getDashboardStats(): Promise<DashboardStats> {
    const raw = await this.repo.getDashboardStats();
    return StatisticsMapper.toDashboardStats(raw);
  }
}