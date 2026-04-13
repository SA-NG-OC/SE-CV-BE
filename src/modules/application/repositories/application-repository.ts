import { Inject, Injectable } from '@nestjs/common';
import { applications, job_postings, companies } from 'src/database/schema';
import * as schema from '../../../database/schema';
import { and, count, eq, desc, sql, gte, SQL, inArray } from 'drizzle-orm';
import { NodePgDatabase } from 'drizzle-orm/node-postgres';
import { ApplicationDomain } from '../domain/application/application.domain';
import {
    ApplicantCardView,
    ApplicationCardView,
    ApplicationStats,
    GetCompanyApplicationsFilter,
    GetMyApplicationsQuery,
} from '../interfaces/application.interface';
import { ApplicationStatus } from '../domain/application/application.props';
import { IApplicationRepository } from './application-repository.interface';
import { PaginationResponse } from 'src/common/types/pagination-response';
import { ApplicationMapper } from '../domain/application/application.mapper';
import { DATABASE_CONNECTION } from 'src/database/database.module';
import { JobSkillItem } from 'src/modules/job-posting/interfaces';
import { JobPostingDomainError } from 'src/modules/job-posting/domain/job-posting.domain';

@Injectable()
export class ApplicationRepository implements IApplicationRepository {
    constructor(@Inject(DATABASE_CONNECTION) private readonly db: NodePgDatabase<typeof schema>) { }

    // =========================================================================
    // WRITE
    // =========================================================================

    async save(application: ApplicationDomain): Promise<ApplicationDomain> {
        if (application.applicationId === 0) {
            const jobId = application.jobId;
            const [job] = await this.db
                .select({
                    deadline: schema.job_postings.application_deadline
                })
                .from(schema.job_postings)
                .where(eq(schema.job_postings.job_id, jobId))
                .limit(1);

            if (!job) {
                throw new JobPostingDomainError("Không tìm thấy tin tuyển dụng này.");
            }

            if (job.deadline) {
                const now = new Date();
                const deadlineDate = new Date(job.deadline);
                deadlineDate.setHours(23, 59, 59, 999);

                if (now > deadlineDate) {
                    throw new JobPostingDomainError("Hết hạn ứng tuyển! Bạn không thể nộp hồ sơ cho tin này nữa.");
                }
            }

            // 3. Nếu còn hạn thì mới tiến hành insert
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
    // READ — single
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

    // =========================================================================
    // READ — card list
    // =========================================================================

    async findCardsByStudent(
        studentId: number,
        query: GetMyApplicationsQuery,
    ): Promise<PaginationResponse<ApplicationCardView>> {
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

        return new PaginationResponse(
            rows.map(ApplicationMapper.toCardView),
            page,
            limit,
            Number(total),
        );
    }

    // =========================================================================
    // READ — stats
    // =========================================================================

    async getStatsByStudent(studentId: number): Promise<ApplicationStats> {
        const rows = await this.db
            .select({
                status: applications.status,
                count: count(),
            })
            .from(applications)
            .where(eq(applications.student_id, studentId))
            .groupBy(applications.status);

        const byStatus = {
            submitted: 0,
            interviewing: 0,
            passed: 0,
            rejected: 0,
        } as Record<ApplicationStatus, number>;

        let total = 0;
        for (const row of rows) {
            const s = row.status as ApplicationStatus;
            byStatus[s] = Number(row.count);
            total += Number(row.count);
        }

        return { total, byStatus };
    }

    async findApplicantCardsByJob(
        filter: GetCompanyApplicationsFilter,
    ): Promise<PaginationResponse<ApplicantCardView>> {
        const { jobId, status, dateRange, page, limit } = filter;
        const offset = (page - 1) * limit;

        const conditions: SQL[] = [];
        if (typeof jobId === 'number') {
            conditions.push(eq(schema.applications.job_id, jobId));
        }
        if (status) {
            if (Array.isArray(status)) {
                conditions.push(inArray(schema.applications.status, status));
            } else {
                conditions.push(eq(schema.applications.status, status));
            }
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
            .innerJoin(
                schema.students,
                eq(schema.applications.student_id, schema.students.student_id),
            )
            .leftJoin(
                schema.majors,
                eq(schema.students.major_id, schema.majors.major_id),
            )
            .leftJoin(
                schema.student_skills,
                eq(schema.students.student_id, schema.student_skills.student_id),
            )
            .leftJoin(
                schema.skills,
                eq(schema.student_skills.skill_id, schema.skills.skill_id),
            )
            .innerJoin(
                schema.job_postings,
                eq(schema.applications.job_id, schema.job_postings.job_id),
            )
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

        const cards = rows.map((row) => {
            const skills: JobSkillItem[] =
                typeof row.skills === 'string'
                    ? JSON.parse(row.skills)
                    : row.skills;

            return ApplicationMapper.toApplicantCardView(row, skills);
        });

        return new PaginationResponse(cards, page, limit, Number(total));
    }

    async getStats(companyId: number, jobId?: number): Promise<ApplicationStats> {
        const condition = jobId
            ? and(
                eq(schema.job_postings.company_id, companyId),
                eq(schema.applications.job_id, jobId)
            )
            : eq(schema.job_postings.company_id, companyId);

        const rows = await this.db
            .select({
                status: schema.applications.status,
                count: count(),
            })
            .from(schema.applications)
            .innerJoin(
                schema.job_postings,
                eq(schema.applications.job_id, schema.job_postings.job_id)
            )
            .where(condition)
            .groupBy(schema.applications.status);

        const byStatus: Record<ApplicationStatus, number> = {
            submitted: 0,
            interviewing: 0,
            passed: 0,
            rejected: 0,
        };

        let total = 0;
        for (const row of rows) {
            const s = row.status as ApplicationStatus;
            byStatus[s] = Number(row.count);
            total += Number(row.count);
        }

        return { total, byStatus };
    }
}