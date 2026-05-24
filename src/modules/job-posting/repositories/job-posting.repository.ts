import {
    BadRequestException,
    Inject,
    Injectable,
    NotFoundException,
} from '@nestjs/common';
import { DATABASE_CONNECTION } from 'src/database/database.module';
import { NodePgDatabase } from 'drizzle-orm/node-postgres';
import {
    and,
    count,
    eq,
    gt,
    gte,
    ilike,
    inArray,
    isNull,
    lt,
    ne,
    or,
    sql,
    SQL,
} from 'drizzle-orm';
import * as schema from 'src/database/schema';

import { IJobPostingRepository } from './job-posting-repository.interface';
import { CreateJobPostingDto } from '../dto/create-job-posting.dto';
import { UpdateJobPostingDto } from '../dto/update-job-posting.dto';
import { ListJobPostingDto } from '../dto/list-job-posting.dto';
import { RoleName } from 'src/common/types/role.enum';
import { PaginationResponse } from 'src/common/types/pagination-response';
import {
    CategoryItem,
    JobSkillItem,
    JobList,
    ProfileJobCard,
    UpdateJobResponse,
    JobPostingStats,
    AdminJobStats,
} from '../interfaces';
import { JobPostingDomain, JobPostingDomainError } from '../domain/job-posting.domain';
import { JobPostingMapper } from '../domain/job-posting.mapper';
import { ChangeJobPostingStatusDto } from '../dto/change-job-posting-status.dto';
import { JobPostingFilterDto } from '../dto/filter-job-card.dto';
import { JobPostingEntity } from '../domain/job-posting.entity';
import { RawJobPage, RawJobWithMeta } from '../types/job-posting.raw';

@Injectable()
export class JobPostingRepository implements IJobPostingRepository {
    constructor(
        @Inject(DATABASE_CONNECTION)
        private readonly db: NodePgDatabase<typeof schema>,
    ) { }

    // =========================================================================
    // PRIVATE HELPERS
    // =========================================================================

    private async fetchSkillMap(jobIds: number[]): Promise<Map<number, JobSkillItem[]>> {
        if (!jobIds.length) return new Map();

        const rows = await this.db
            .select({
                job_id: schema.job_required_skills.job_id,
                skillId: schema.job_required_skills.skill_id,
                skillName: schema.skills.skill_name,
            })
            .from(schema.job_required_skills)
            .innerJoin(
                schema.skills,
                eq(schema.job_required_skills.skill_id, schema.skills.skill_id),
            )
            .where(inArray(schema.job_required_skills.job_id, jobIds));

        const map = new Map<number, JobSkillItem[]>();
        for (const r of rows) {
            if (!map.has(r.job_id!)) map.set(r.job_id!, []);
            map.get(r.job_id!)!.push({ skillId: r.skillId!, skillName: r.skillName });
        }
        return map;
    }

    private async fetchApplicantCountMap(jobIds: number[]): Promise<Map<number, number>> {
        if (!jobIds.length) return new Map();

        const rows = await this.db
            .select({
                job_id: schema.applications.job_id,
                cnt: count(),
            })
            .from(schema.applications)
            .where(inArray(schema.applications.job_id, jobIds))
            .groupBy(schema.applications.job_id);

        const map = new Map<number, number>();
        for (const r of rows) map.set(r.job_id!, Number(r.cnt));
        return map;
    }

    private async fetchSkillAndCountMaps(
        jobIds: number[],
    ): Promise<[Map<number, JobSkillItem[]>, Map<number, number>]> {
        if (!jobIds.length) return [new Map(), new Map()];
        return Promise.all([
            this.fetchSkillMap(jobIds),
            this.fetchApplicantCountMap(jobIds),
        ]);
    }

    private async saveSkills(
        tx: Parameters<Parameters<typeof this.db.transaction>[0]>[0],
        jobId: number,
        skillIds: number[],
        replace = false,
    ): Promise<void> {
        if (replace) {
            await tx
                .delete(schema.job_required_skills)
                .where(eq(schema.job_required_skills.job_id, jobId));
        }
        if (skillIds.length) {
            await tx.insert(schema.job_required_skills).values(
                skillIds.map((skillId) => ({ job_id: jobId, skill_id: skillId })),
            );
        }
    }

    // =========================================================================
    // LOOKUP
    // =========================================================================

    async checkCompany(companyId: number): Promise<true> {
        const [data] = await this.db
            .select({ id: schema.companies.company_id })
            .from(schema.companies)
            .where(eq(schema.companies.company_id, companyId));
        if (!data) throw new NotFoundException('Không tìm thấy công ty');
        return true;
    }

    async isCompanyActive(companyId: number): Promise<boolean> {
        const [result] = await this.db
            .select({ status: schema.companies.status })
            .from(schema.companies)
            .where(eq(schema.companies.company_id, companyId))
            .limit(1);
        return result?.status === 'APPROVED';
    }

    async getJobCategories(): Promise<CategoryItem[]> {
        return this.db
            .select({
                categoryId: schema.job_categories.category_id,
                categoryName: schema.job_categories.category_name,
            })
            .from(schema.job_categories)
            .where(eq(schema.job_categories.is_active, true)) as Promise<CategoryItem[]>;
    }

    async getJobSkills(): Promise<JobSkillItem[]> {
        return this.db
            .select({
                skillId: schema.skills.skill_id,
                skillName: schema.skills.skill_name,
            })
            .from(schema.skills) as Promise<JobSkillItem[]>;
    }

    // =========================================================================
    // WRITES
    // =========================================================================

    async createJobPosting(companyId: number, dto: CreateJobPostingDto): Promise<number> {
        const domain = JobPostingDomain.create(dto, companyId);

        return this.db.transaction(async (tx) => {
            const [newJob] = await tx
                .insert(schema.job_postings)
                .values(domain.toPersistence())
                .returning({ job_id: schema.job_postings.job_id });

            await this.saveSkills(tx, newJob.job_id, dto.skillIds ?? []);

            return newJob.job_id;
        });
    }

    async updateJobPosting(
        jobId: number,
        companyId: number,
        dto: UpdateJobPostingDto,
    ): Promise<UpdateJobResponse | null> {
        return this.db.transaction(async (tx) => {
            const [existing] = await tx
                .select()
                .from(schema.job_postings)
                .where(
                    and(
                        eq(schema.job_postings.job_id, jobId),
                        eq(schema.job_postings.company_id, companyId),
                    ),
                )
                .limit(1);

            if (!existing) return null;

            const domain = JobPostingDomain.fromPersistence(existing);

            try {
                domain.edit(dto);
            } catch (err) {
                if (err instanceof JobPostingDomainError) {
                    throw new BadRequestException(err.message);
                }
                throw err;
            }

            await tx
                .update(schema.job_postings)
                .set(domain.toUpdatePersistence())
                .where(eq(schema.job_postings.job_id, jobId));

            if (dto.skillIds !== undefined) {
                await this.saveSkills(tx, jobId, dto.skillIds, true);
            }

            return { jobId, jobTitle: domain.jobTitle };
        });
    }

    async changeJobStatus(
        jobId: number,
        dto: ChangeJobPostingStatusDto,
        adminId: number,
    ): Promise<JobPostingEntity | null> {
        const [existing] = await this.db
            .select()
            .from(schema.job_postings)
            .where(eq(schema.job_postings.job_id, jobId))
            .limit(1);

        if (!existing) return null;

        const domain = JobPostingDomain.fromPersistence(existing);
        domain.changeStatus(dto, adminId);

        const [updated] = await this.db
            .update(schema.job_postings)
            .set(domain.toUpdatePersistence())
            .where(eq(schema.job_postings.job_id, jobId))
            .returning();

        return updated;
    }

    async toggleActiveStatus(jobId: number, companyId: number): Promise<void> {
        const [existing] = await this.db
            .select({
                isActive: schema.job_postings.is_active,
                status: schema.job_postings.status,
            })
            .from(schema.job_postings)
            .where(
                and(
                    eq(schema.job_postings.job_id, jobId),
                    eq(schema.job_postings.company_id, companyId),
                ),
            )
            .limit(1);

        if (!existing) {
            throw new NotFoundException(
                'Không tìm thấy bài đăng tuyển dụng hoặc bạn không có quyền chỉnh sửa.',
            );
        }
        if (existing.status !== 'approved') {
            throw new BadRequestException(
                'Không thể ẩn/ bỏ ẩn tin tuyển dụng chưa được duyệt hoặc bị hạn chế',
            );
        }

        await this.db
            .update(schema.job_postings)
            .set({ is_active: !existing.isActive })
            .where(eq(schema.job_postings.job_id, jobId));
    }

    // =========================================================================
    // FIND ONE — trả RawJobWithMeta, KHÔNG gọi mapper
    // =========================================================================

    async findJobDetailById(
        jobId: number,
        viewer: RoleName,
        companyId?: number,
    ): Promise<RawJobWithMeta | null> {
        const conditions: SQL[] = [eq(schema.job_postings.job_id, jobId)];

        if (viewer === RoleName.STUDENT) {
            conditions.push(eq(schema.job_postings.status, 'approved'));
        }
        if (viewer === RoleName.COMPANY) {
            conditions.push(eq(schema.job_postings.company_id, companyId!));
        }

        const [row] = await this.db
            .select()
            .from(schema.job_postings)
            .innerJoin(
                schema.companies,
                eq(schema.job_postings.company_id, schema.companies.company_id),
            )
            .where(and(...conditions))
            .limit(1);

        if (!row) return null;

        const [[{ applicantCount }], skillRows] = await Promise.all([
            this.db
                .select({ applicantCount: count() })
                .from(schema.applications)
                .where(eq(schema.applications.job_id, jobId)),
            this.db
                .select({
                    skillId: schema.job_required_skills.skill_id,
                    skillName: schema.skills.skill_name,
                })
                .from(schema.job_required_skills)
                .innerJoin(
                    schema.skills,
                    eq(schema.job_required_skills.skill_id, schema.skills.skill_id),
                )
                .where(eq(schema.job_required_skills.job_id, jobId)),
        ]);

        const skills: JobSkillItem[] = skillRows.map((s) => ({
            skillId: s.skillId!,
            skillName: s.skillName,
        }));

        return {
            domain: JobPostingDomain.fromPersistence(row.job_postings),
            companyName: row.companies.company_name,
            logoUrl: row.companies.logo_url ?? null,
            applicantCount,
            skills,
        };
    }

    async findById(
        jobId: number,
    ): Promise<{ companyId: number | null; applicationDeadline: string | null } | null> {
        const [data] = await this.db
            .select({
                companyId: schema.job_postings.company_id,
                applicationDeadline: schema.job_postings.application_deadline,
            })
            .from(schema.job_postings)
            .where(eq(schema.job_postings.job_id, jobId));

        return data ?? null;
    }

    // =========================================================================
    // FIND LIST — ProfileJobCard (mapper đơn giản, không cần extra data)
    // =========================================================================

    async findByCompanyId(
        companyId: number,
        page: number,
        limit: number,
        roleName: RoleName,
    ): Promise<PaginationResponse<ProfileJobCard>> {
        const offset = (page - 1) * limit;

        const conditions: SQL[] = [eq(schema.job_postings.company_id, companyId)];
        if (roleName === RoleName.STUDENT) {
            conditions.push(eq(schema.job_postings.status, 'approved'));
            conditions.push(eq(schema.job_postings.is_active, true));
        }
        const whereClause = and(...conditions);

        const [rows, totalResult] = await Promise.all([
            this.db
                .select()
                .from(schema.job_postings)
                .where(whereClause)
                .orderBy(sql`${schema.job_postings.created_at} desc`)
                .limit(limit)
                .offset(offset),
            this.db
                .select({ count: sql<number>`count(*)::int` })
                .from(schema.job_postings)
                .where(whereClause),
        ]);

        const totalItems = totalResult[0]?.count ?? 0;
        const data = rows
            .map((r) => JobPostingDomain.fromPersistence(r))
            .map((d) => JobPostingMapper.toProfileJobCard(d));

        return new PaginationResponse(data, page, limit, totalItems);
    }

    async findAllJobList(
        companyId: number,
        page: number,
        limit: number,
    ): Promise<PaginationResponse<JobList>> {
        const offset = (page - 1) * limit;

        const [total, rows] = await Promise.all([
            this.db
                .select({ total: count() })
                .from(schema.job_postings)
                .where(eq(schema.job_postings.company_id, companyId)),
            this.db
                .select({
                    jobId: schema.job_postings.job_id,
                    jobTitle: schema.job_postings.job_title,
                })
                .from(schema.job_postings)
                .where(eq(schema.job_postings.company_id, companyId))
                .limit(limit)
                .offset(offset),
        ]);

        return new PaginationResponse(rows, page, limit, Number(total[0]?.total ?? 0));
    }

    // =========================================================================
    // FIND RAW — Admin / Company / Student / SavedJobs
    // =========================================================================

    async findRawForAdmin(dto: ListJobPostingDto): Promise<RawJobPage<RawJobWithMeta>> {
        const { page, limit, search, status, city } = dto;
        const offset = (page - 1) * limit;

        const conditions: SQL[] = [];
        if (search) conditions.push(ilike(schema.job_postings.job_title, `%${search}%`));
        if (status) conditions.push(eq(schema.job_postings.status, status));
        if (city) conditions.push(ilike(schema.job_postings.city, `%${city}%`));
        const whereClause = conditions.length ? and(...conditions) : undefined;

        const [rows, [{ total }]] = await Promise.all([
            this.db
                .select({
                    job: schema.job_postings,
                    company_name: schema.companies.company_name,
                    logo_url: schema.companies.logo_url,
                })
                .from(schema.job_postings)
                .innerJoin(
                    schema.companies,
                    eq(schema.job_postings.company_id, schema.companies.company_id),
                )
                .where(whereClause)
                .orderBy(sql`${schema.job_postings.created_at} desc`)
                .limit(limit)
                .offset(offset),
            this.db
                .select({ total: count() })
                .from(schema.job_postings)
                .where(whereClause),
        ]);

        const jobIds = rows.map((r) => r.job.job_id);
        const [skillMap, countMap] = await this.fetchSkillAndCountMaps(jobIds);

        return {
            items: rows.map((r) => ({
                domain: JobPostingDomain.fromPersistence(r.job),
                companyName: r.company_name,
                logoUrl: r.logo_url ?? null,
                applicantCount: countMap.get(r.job.job_id) ?? 0,
                skills: skillMap.get(r.job.job_id) ?? [],
            })),
            total: Number(total),
            page,
            limit,
        };
    }

    async findRawForCompany(
        companyId: number,
        dto: JobPostingFilterDto,
    ): Promise<RawJobPage<RawJobWithMeta>> {
        const { page, limit, search, tag, city } = dto;
        const offset = (page - 1) * limit;

        const conditions: SQL[] = [eq(schema.job_postings.company_id, companyId)];

        if (search) conditions.push(ilike(schema.job_postings.job_title, `%${search}%`));
        if (city) conditions.push(ilike(schema.job_postings.city, `%${city}%`));

        if (tag) {
            switch (tag) {
                case 'Pending':
                    conditions.push(ne(schema.job_postings.status, 'approved'));
                    break;
                case 'Hidden':
                    conditions.push(
                        eq(schema.job_postings.status, 'approved'),
                        eq(schema.job_postings.is_active, false),
                    );
                    break;
                case 'Closed':
                    conditions.push(
                        eq(schema.job_postings.status, 'approved'),
                        eq(schema.job_postings.is_active, true),
                        lt(schema.job_postings.application_deadline, sql`now()`),
                    );
                    break;
                case 'Active':
                    conditions.push(
                        eq(schema.job_postings.status, 'approved'),
                        eq(schema.job_postings.is_active, true),
                        or(
                            gt(schema.job_postings.application_deadline, sql`now()`),
                            isNull(schema.job_postings.application_deadline),
                        ) as SQL,
                    );
                    break;
            }
        }

        const whereClause = and(...conditions);

        const [rows, [{ total }]] = await Promise.all([
            this.db
                .select({
                    job: schema.job_postings,
                    company_name: schema.companies.company_name,
                    logo_url: schema.companies.logo_url,
                })
                .from(schema.job_postings)
                .innerJoin(
                    schema.companies,
                    eq(schema.job_postings.company_id, schema.companies.company_id),
                )
                .where(whereClause)
                .orderBy(sql`${schema.job_postings.created_at} desc`)
                .limit(limit)
                .offset(offset),
            this.db
                .select({ total: count() })
                .from(schema.job_postings)
                .where(whereClause),
        ]);

        const jobIds = rows.map((r) => r.job.job_id);
        const [skillMap, countMap] = await this.fetchSkillAndCountMaps(jobIds);

        return {
            items: rows.map((r) => ({
                domain: JobPostingDomain.fromPersistence(r.job),
                companyName: r.company_name,
                logoUrl: r.logo_url ?? null,
                applicantCount: countMap.get(r.job.job_id) ?? 0,
                skills: skillMap.get(r.job.job_id) ?? [],
            })),
            total: Number(total),
            page,
            limit,
        };
    }

    async findRawForStudent(dto: ListJobPostingDto): Promise<RawJobPage<RawJobWithMeta>> {
        const { page, limit, search, city } = dto;
        const offset = (page - 1) * limit;

        const conditions: SQL[] = [
            eq(schema.job_postings.status, 'approved'),
            eq(schema.job_postings.is_active, true),
            gte(schema.job_postings.application_deadline, sql`CURRENT_DATE`),
        ];
        if (search) conditions.push(ilike(schema.job_postings.job_title, `%${search}%`));
        if (city) conditions.push(ilike(schema.job_postings.city, `%${city}%`));
        const whereClause = and(...conditions);

        const [rows, [{ total }]] = await Promise.all([
            this.db
                .select({
                    job: schema.job_postings,
                    company_name: schema.companies.company_name,
                    logo_url: schema.companies.logo_url,
                })
                .from(schema.job_postings)
                .innerJoin(
                    schema.companies,
                    eq(schema.job_postings.company_id, schema.companies.company_id),
                )
                .where(whereClause)
                .orderBy(sql`${schema.job_postings.created_at} desc`)
                .limit(limit)
                .offset(offset),
            this.db
                .select({ total: count() })
                .from(schema.job_postings)
                .where(whereClause),
        ]);

        const jobIds = rows.map((r) => r.job.job_id);
        const [skillMap, countMap] = await this.fetchSkillAndCountMaps(jobIds);

        return {
            items: rows.map((r) => ({
                domain: JobPostingDomain.fromPersistence(r.job),
                companyName: r.company_name,
                logoUrl: r.logo_url ?? null,
                applicantCount: countMap.get(r.job.job_id) ?? 0,
                skills: skillMap.get(r.job.job_id) ?? [],
            })),
            total: Number(total),
            page,
            limit,
        };
    }

    async findRawSavedJobs(
        studentId: number,
        dto: ListJobPostingDto,
    ): Promise<RawJobPage<RawJobWithMeta>> {
        const { page, limit, search, city } = dto;
        const offset = (page - 1) * limit;

        const conditions: SQL[] = [eq(schema.saved_jobs.student_id, studentId)];
        if (search) conditions.push(ilike(schema.job_postings.job_title, `%${search}%`));
        if (city) conditions.push(ilike(schema.job_postings.city, `%${city}%`));
        const whereClause = and(...conditions);

        const [rows, [{ total }]] = await Promise.all([
            this.db
                .select({
                    job: schema.job_postings,
                    company_name: schema.companies.company_name,
                    logo_url: schema.companies.logo_url,
                })
                .from(schema.saved_jobs)
                .innerJoin(
                    schema.job_postings,
                    eq(schema.saved_jobs.job_id, schema.job_postings.job_id),
                )
                .innerJoin(
                    schema.companies,
                    eq(schema.job_postings.company_id, schema.companies.company_id),
                )
                .where(whereClause)
                .orderBy(sql`${schema.saved_jobs.created_at} desc`)
                .limit(limit)
                .offset(offset),
            this.db
                .select({ total: count() })
                .from(schema.saved_jobs)
                .innerJoin(
                    schema.job_postings,
                    eq(schema.saved_jobs.job_id, schema.job_postings.job_id),
                )
                .where(whereClause),
        ]);

        const jobIds = rows.map((r) => r.job.job_id);
        const [skillMap, countMap] = await this.fetchSkillAndCountMaps(jobIds);

        return {
            items: rows.map((r) => ({
                domain: JobPostingDomain.fromPersistence(r.job),
                companyName: r.company_name,
                logoUrl: r.logo_url ?? null,
                applicantCount: countMap.get(r.job.job_id) ?? 0,
                skills: skillMap.get(r.job.job_id) ?? [],
            })),
            total: Number(total),
            page,
            limit,
        };
    }

    // =========================================================================
    // STATS
    // =========================================================================

    async getJobStatsByCompanyId(companyId: number): Promise<JobPostingStats> {
        const [result] = await this.db
            .select({
                total: sql<number>`count(*)`,
                active: sql<number>`
                    count(*) filter (
                        where ${schema.job_postings.status} = 'approved'
                        and (
                            ${schema.job_postings.application_deadline} is null
                            or ${schema.job_postings.application_deadline} >= current_date
                        )
                    )`,
                hidden: sql<number>`
                    count(*) filter (where ${schema.job_postings.is_active} = false)
                `,
                closed: sql<number>`
                    count(*) filter (
                        where ${schema.job_postings.status} = 'approved'
                        and ${schema.job_postings.application_deadline} < current_date
                    )`,
            })
            .from(schema.job_postings)
            .where(eq(schema.job_postings.company_id, companyId));

        return {
            total: Number(result?.total ?? 0),
            active: Number(result?.active ?? 0),
            hidden: Number(result?.hidden ?? 0),
            closed: Number(result?.closed ?? 0),
        };
    }

    async getAdminJobStats(): Promise<AdminJobStats> {
        const [result] = await this.db
            .select({
                total: count(),
                pending: sql<number>`count(*) filter (where ${schema.job_postings.status} = 'pending')`,
                approvedToday: sql<number>`
                    count(*) filter (
                        where ${schema.job_postings.status} = 'approved'
                        and ${schema.job_postings.approved_at} >= date_trunc('day', now())
                    )`,
                rejected: sql<number>`count(*) filter (where ${schema.job_postings.status} = 'rejected')`,
            })
            .from(schema.job_postings);

        return {
            total: Number(result?.total ?? 0),
            pending: Number(result?.pending ?? 0),
            approvedToday: Number(result?.approvedToday ?? 0),
            rejected: Number(result?.rejected ?? 0),
        };
    }
}