import { Inject, Injectable } from '@nestjs/common';
import { IStatisticsRepository } from './statistics-repository.interface';
import { DashboardStatsRaw } from '../types/statistics.raw.type';
import { and, eq, sql } from 'drizzle-orm';
import { NodePgDatabase } from 'drizzle-orm/node-postgres';
import { DATABASE_CONNECTION } from 'src/database/database.module';
import * as schema from 'src/database/schema';

// statistics.repository.ts
@Injectable()
export class StatisticsRepository implements IStatisticsRepository {
  constructor(
    @Inject(DATABASE_CONNECTION)
    private readonly db: NodePgDatabase<typeof schema>,
  ) {}

  async getCompanyDashboardStats(companyId: number) {
    const result = await this.db.execute<{
      total_jobs: number;
      total_applications: number;
      total_reviews: number;
      total_hired: number;
    }>(sql`
        SELECT
            -- JOBS
            (
                SELECT COUNT(*)
                FROM ${schema.job_postings}
                WHERE company_id = ${companyId}
            ) AS total_jobs,

            -- APPLICATIONS
            (
                SELECT COUNT(*)
                FROM ${schema.applications} a
                JOIN ${schema.job_postings} jp ON a.job_id = jp.job_id
                WHERE jp.company_id = ${companyId}
                
            ) AS total_applications,

            -- REVIEWS
            (
                SELECT COUNT(*)
                FROM ${schema.comments}
                WHERE company_id = ${companyId}
                AND date_trunc('month', created_at) = date_trunc('month', CURRENT_DATE)
            ) AS total_reviews,

            -- HIRED
            (
                SELECT COUNT(*)
                FROM ${schema.applications} a
                JOIN ${schema.job_postings} jp ON a.job_id = jp.job_id
                WHERE jp.company_id = ${companyId}
                AND a.status = 'passed'
                
            ) AS total_hired
    `);

    const row = result.rows[0];

    return {
      totalJobs: Number(row.total_jobs),
      totalApplications: Number(row.total_applications),
      totalReviews: Number(row.total_reviews),
      totalHired: Number(row.total_hired),
    };
  }
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

  async getApplicationsLast7Days(companyId: number) {
    const result = await this.db.execute<{
      date: string;
      count: number;
    }>(sql`
            SELECT 
                gs::date AS date,
                COALESCE(COUNT(a.application_id), 0) AS count
            FROM generate_series(
                CURRENT_DATE - INTERVAL '6 days',
                CURRENT_DATE,
                INTERVAL '1 day'
            ) AS gs

            LEFT JOIN ${schema.job_postings} jp
                ON jp.company_id = ${companyId}

            LEFT JOIN ${schema.applications} a
                ON a.job_id = jp.job_id
                AND DATE(a.created_at) = gs::date

            GROUP BY gs
            ORDER BY gs ASC
        `);

    return result.rows.map((r) => ({
      date: r.date,
      count: Number(r.count),
    }));
  }

  async getJobsByCategory(companyId: number) {
    const rows = await this.db
      .select({
        categoryId: schema.job_categories.category_id,
        categoryName: schema.job_categories.category_name,

        jobId: schema.job_postings.job_id,
        jobTitle: schema.job_postings.job_title,
      })
      .from(schema.job_postings)
      .innerJoin(
        schema.job_categories,
        eq(schema.job_postings.category_id, schema.job_categories.category_id),
      )
      .where(eq(schema.job_postings.company_id, companyId));

    const map = new Map<
      number,
      {
        categoryId: number;
        categoryName: string;
        jobs: { jobId: number; jobTitle: string }[];
      }
    >();

    for (const row of rows) {
      if (!map.has(row.categoryId)) {
        map.set(row.categoryId, {
          categoryId: row.categoryId,
          categoryName: row.categoryName,
          jobs: [],
        });
      }

      map.get(row.categoryId)!.jobs.push({
        jobId: row.jobId,
        jobTitle: row.jobTitle,
      });
    }

    return Array.from(map.values());
  }

  // statistics.repository.ts
  async getAdminDashboardStats(): Promise<{
    totalCompanies: number;
    totalStudents: number;
    totalApplications: number;
    totalJobPostings: number;
  }> {
    const result = await this.db.execute<{
      total_companies: number;
      total_students: number;
      total_applications: number;
      total_job_postings: number;
    }>(sql`
    SELECT
      (SELECT COUNT(*) FROM companies) AS total_companies,
      (SELECT COUNT(*) FROM students) AS total_students,
      (SELECT COUNT(*) FROM applications) AS total_applications,
      (SELECT COUNT(*) FROM job_postings) AS total_job_postings
  `);

    const row = result.rows[0];

    return {
      totalCompanies: Number(row.total_companies),
      totalStudents: Number(row.total_students),
      totalApplications: Number(row.total_applications),
      totalJobPostings: Number(row.total_job_postings),
    };
  }

  async getJobsCountByCategory(): Promise<
    { categoryId: number; categoryName: string; totalJobs: number }[]
  > {
    const result = await this.db
      .select({
        categoryId: schema.job_categories.category_id,
        categoryName: schema.job_categories.category_name,
        totalJobs: sql<number>`COUNT(${schema.job_postings.job_id})`.mapWith(
          Number,
        ),
      })
      .from(schema.job_categories)
      .leftJoin(
        schema.job_postings,
        eq(schema.job_postings.category_id, schema.job_categories.category_id),
      )
      .groupBy(
        schema.job_categories.category_id,
        schema.job_categories.category_name,
      )
      .orderBy(sql`COUNT(${schema.job_postings.job_id}) DESC`);

    return result;
  }

  async getApplicationSuccessRateLast12Months(): Promise<
    { month: string; successRate: number }[]
  > {
    const result = await this.db.execute<{
      month: string;
      success_rate: number;
    }>(sql`
    WITH months AS (
      SELECT generate_series(
        date_trunc('month', CURRENT_DATE) - INTERVAL '11 months',
        date_trunc('month', CURRENT_DATE),
        INTERVAL '1 month'
      ) AS month
    )
    SELECT
      TO_CHAR(m.month, 'YYYY-MM') AS month,
      COALESCE(
        ROUND(
          COUNT(a.application_id) FILTER (WHERE a.status = 'passed')::decimal
          / NULLIF(COUNT(a.application_id), 0) * 100,
          2
        ),
        0
      ) AS success_rate
    FROM months m
    LEFT JOIN applications a
      ON date_trunc('month', a.created_at) = m.month
    GROUP BY m.month
    ORDER BY m.month ASC;
  `);

    return result.rows.map((r) => ({
      month: r.month,
      successRate: Number(r.success_rate),
    }));
  }

  async getApplicationCountLast12Months(): Promise<
    { month: string; totalApplications: number }[]
  > {
    const result = await this.db.execute<{
      month: string;
      total_applications: number;
    }>(sql`
    WITH months AS (
      SELECT generate_series(
        date_trunc('month', CURRENT_DATE) - INTERVAL '11 months',
        date_trunc('month', CURRENT_DATE),
        INTERVAL '1 month'
      ) AS month
    )
    SELECT
      TO_CHAR(m.month, 'YYYY-MM') AS month,
      COUNT(a.application_id) AS total_applications
    FROM months m
    LEFT JOIN applications a
      ON date_trunc('month', a.created_at) = m.month
    GROUP BY m.month
    ORDER BY m.month ASC;
  `);

    return result.rows.map((r) => ({
      month: r.month,
      totalApplications: Number(r.total_applications),
    }));
  }

  async getTopCompaniesByJobCount(): Promise<
    { companyId: number; companyName: string; totalJobs: number }[]
  > {
    const result = await this.db
      .select({
        companyId: schema.companies.company_id,
        companyName: schema.companies.company_name,
        totalJobs: sql<number>`COUNT(${schema.job_postings.job_id})`.mapWith(
          Number,
        ),
      })
      .from(schema.companies)
      .innerJoin(
        schema.job_postings,
        and(
          eq(schema.job_postings.company_id, schema.companies.company_id),
          eq(schema.job_postings.status, 'approved'),
          eq(schema.job_postings.is_active, true),
        ),
      )
      .groupBy(schema.companies.company_id, schema.companies.company_name)
      .orderBy(sql`COUNT(${schema.job_postings.job_id}) DESC`)
      .limit(5);

    return result;
  }
}
