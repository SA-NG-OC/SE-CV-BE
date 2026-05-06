import { Inject, Injectable } from "@nestjs/common";
import { IStatisticsRepository } from "./statistics-repository.interface";
import { DashboardStatsRaw } from "../types/statistics.raw.type";
import { sql } from "drizzle-orm";
import { NodePgDatabase } from "drizzle-orm/node-postgres";
import { DATABASE_CONNECTION } from "src/database/database.module";
import * as schema from "src/database/schema";

// statistics.repository.ts
@Injectable()
export class StatisticsRepository implements IStatisticsRepository {
    constructor(
        @Inject(DATABASE_CONNECTION)
        private readonly db: NodePgDatabase<typeof schema>,
    ) { }

    async getDashboardStats(): Promise<DashboardStatsRaw> {
        const result = await this.db.execute(sql`
  SELECT
    (SELECT COUNT(*) FROM companies) AS total_companies,

    (
      SELECT COALESCE(AVG(rating), 0)
      FROM companies
      WHERE rating IS NOT NULL AND rating::float > 0
    ) AS avg_rating,

    (SELECT COUNT(*) FROM applications) AS total_applications,

    (
      SELECT COUNT(*)
      FROM applications
      WHERE status = 'passed'
    ) AS total_passed
`);

        const row = result.rows[0];

        return {
            total_companies: Number(row.total_companies),
            avg_rating: Number(row.avg_rating),
            total_applications: Number(row.total_applications),
            total_passed: Number(row.total_passed),
        } as DashboardStatsRaw;
    }
}