import { Inject, Injectable } from '@nestjs/common';
import { applications, job_postings, companies } from 'src/database/schema';
import * as schema from '../../../database/schema';
import { and, count, eq, desc, sql, gte, SQL, inArray } from 'drizzle-orm';
import { NodePgDatabase } from 'drizzle-orm/node-postgres';
import { DATABASE_CONNECTION } from 'src/database/database.module';

import { ApplicationDomain } from '../domain/application/application.domain';
import { IApplicationRepository } from './application-repository.interface';
import { PaginationResponse } from 'src/common/types/pagination-response';
import { GetCompanyApplicationsFilter, GetMyApplicationsQuery } from '../types/application.interface';
import {
    ApplicationCardRaw,
    ApplicantCardRaw,
    ApplicationStatsRaw,
} from '../types/application.raw';

@Injectable()
export class ApplicationRepository implements IApplicationRepository {
    constructor(
        @Inject(DATABASE_CONNECTION)
        private readonly db: NodePgDatabase<typeof schema>,
    ) { }

    // =========================================================================
    // WRITE 
    // =========================================================================

    async save(application: ApplicationDomain): Promise<ApplicationDomain> {
        if (application.applicationId === 0) {
            const [inserted] = await this.db
                .insert(schema.applications)
                .values(application.toPersistence())
                .returning();

            return ApplicationDomain.fromPersistence(inserted);
        }

        const [updated] = await this.db
            .update(schema.applications)
            .set(application.toUpdatePersistence())
            .where(eq(schema.applications.application_id, application.applicationId))
            .returning();

        return ApplicationDomain.fromPersistence(updated);
    }

    // =========================================================================
    // READ 
    // =========================================================================

    async findById(applicationId: number): Promise<ApplicationDomain | null> {
        const [row] = await this.db
            .select()
            .from(applications)
            .where(eq(applications.application_id, applicationId))
            .limit(1);

        return row ? ApplicationDomain.fromPersistence(row) : null;
    }

    async findByJobAndStudent(
        jobId: number,
        studentId: number,
    ): Promise<ApplicationDomain | null> {
        const [row] = await this.db
            .select()
            .from(applications)
            .where(
                and(
                    eq(applications.job_id, jobId),
                    eq(applications.student_id, studentId),
                ),
            )
            .limit(1);

        return row ? ApplicationDomain.fromPersistence(row) : null;
    }

    async checkApply(companyId: number, studentId: number): Promise<boolean> {
        const result = await this.db
            .select({ id: schema.applications.application_id })
            .from(schema.applications)
            .innerJoin(
                schema.job_postings,
                eq(schema.applications.job_id, schema.job_postings.job_id),
            )
            .where(
                and(
                    eq(schema.applications.student_id, studentId),
                    eq(schema.job_postings.company_id, companyId),
                    inArray(schema.applications.status, ['interviewing', 'passed', 'rejected']),
                ),
            )
            .limit(1);

        return result.length > 0;
    }

    // =========================================================================
    // READ
    // =========================================================================

    async findCardsByStudent(
        studentId: number,
        query: GetMyApplicationsQuery,
    ): Promise<PaginationResponse<ApplicationCardRaw>> {
        const { page, limit, status } = query;
        const offset = (page - 1) * limit;

        const conditions = [eq(applications.student_id, studentId)];
        if (status) conditions.push(eq(applications.status, status));
        const where = and(...conditions);

        const [{ total }] = await this.db
            .select({ total: count() })
            .from(applications)
            .where(where);

        const rows = await this.db
            .select({
                application_id: applications.application_id,
                status: applications.status,
                created_at: applications.created_at,
                job_id: job_postings.job_id,
                job_title: job_postings.job_title,
                company_name: companies.company_name,
                logo_url: companies.logo_url,
            })
            .from(applications)
            .innerJoin(job_postings, eq(applications.job_id, job_postings.job_id))
            .innerJoin(companies, eq(job_postings.company_id, companies.company_id))
            .where(where)
            .orderBy(desc(applications.created_at))
            .limit(limit)
            .offset(offset);

        return new PaginationResponse(rows, page, limit, Number(total));
    }

    async findApplicantCardsByJob(
        filter: GetCompanyApplicationsFilter,
        companyId: number,
    ): Promise<PaginationResponse<ApplicantCardRaw>> {
        const { jobId, status, dateRange, page, limit } = filter;
        const offset = (page - 1) * limit;

        const conditions: SQL[] = [];
        conditions.push(eq(schema.job_postings.company_id, companyId));
        if (typeof jobId === 'number') conditions.push(eq(schema.applications.job_id, jobId));
        if (status) {
            Array.isArray(status)
                ? conditions.push(inArray(schema.applications.status, status))
                : conditions.push(eq(schema.applications.status, status));
        }
        if (dateRange) {
            const from = new Date();
            from.setDate(from.getDate() - (dateRange === '7days' ? 7 : 30));
            conditions.push(gte(schema.applications.created_at, from));
        }
        const where = conditions.length > 0 ? and(...conditions) : undefined;

        const [{ total }] = await this.db
            .select({ total: count() })
            .from(schema.applications)
            .innerJoin(
                schema.job_postings,
                eq(schema.applications.job_id, schema.job_postings.job_id),
            )
            .where(where);

        const rows = await this.db
            .select({
                application_id: schema.applications.application_id,
                status: schema.applications.status,
                cv_url: schema.applications.cv_url,
                created_at: schema.applications.created_at,
                student_id: schema.students.student_id,
                full_name: schema.students.full_name,
                email_student: schema.students.email_student,
                avatar_url: schema.students.avatar_url,
                current_year: schema.students.current_year,
                gpa: schema.students.gpa,
                phone: schema.students.phone,
                major_name: schema.majors.major_name,
                job_id: schema.job_postings.job_id,
                job_title: schema.job_postings.job_title,
                skills: sql<string>`
                    coalesce(
                        json_agg(
                            json_build_object(
                                'skillId', ${schema.skills.skill_id},
                                'skillName', ${schema.skills.skill_name}
                            )
                        ) FILTER (WHERE ${schema.skills.skill_id} IS NOT NULL),
                        '[]'
                    )
                `,
            })
            .from(schema.applications)
            .innerJoin(schema.students, eq(schema.applications.student_id, schema.students.student_id))
            .leftJoin(schema.majors, eq(schema.students.major_id, schema.majors.major_id))
            .leftJoin(schema.student_skills, eq(schema.students.student_id, schema.student_skills.student_id))
            .leftJoin(schema.skills, eq(schema.student_skills.skill_id, schema.skills.skill_id))
            .innerJoin(schema.job_postings, eq(schema.applications.job_id, schema.job_postings.job_id))
            .where(where)
            .groupBy(
                schema.applications.application_id,
                schema.students.student_id,
                schema.majors.major_name,
                schema.job_postings.job_id,
            )
            .orderBy(desc(schema.applications.created_at))
            .limit(limit)
            .offset(offset);

        return new PaginationResponse(rows, page, limit, Number(total));
    }

    async getStatsByStudent(studentId: number): Promise<ApplicationStatsRaw> {
        return this.db
            .select({
                status: applications.status,
                count: count(),
            })
            .from(applications)
            .where(eq(applications.student_id, studentId))
            .groupBy(applications.status);
    }

    async getStats(companyId: number, jobId?: number): Promise<ApplicationStatsRaw> {
        const condition = jobId
            ? and(
                eq(schema.job_postings.company_id, companyId),
                eq(schema.applications.job_id, jobId),
            )
            : eq(schema.job_postings.company_id, companyId);

        return this.db
            .select({
                status: schema.applications.status,
                count: count(),
            })
            .from(schema.applications)
            .innerJoin(
                schema.job_postings,
                eq(schema.applications.job_id, schema.job_postings.job_id),
            )
            .where(condition)
            .groupBy(schema.applications.status);
    }
}