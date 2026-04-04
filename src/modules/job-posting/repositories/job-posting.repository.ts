import { BadRequestException, Inject, Injectable } from '@nestjs/common';
import { DATABASE_CONNECTION } from 'src/database/database.module';
import { NodePgDatabase } from 'drizzle-orm/node-postgres';
import { and, count, eq, ilike, inArray, sql, SQL } from 'drizzle-orm';
import * as schema from 'src/database/schema';

import { IJobPostingRepository } from './job-posting-repository.interface';
import { CreateJobPostingDto } from '../dto/create-job-posting.dto';
import { UpdateJobPostingDto } from '../dto/update-job-posting.dto';
import { ListJobPostingDto } from '../dto/list-job-posting.dto';
import { RoleName } from 'src/common/types/role.enum';
import { PaginationResponse } from 'src/common/types/pagination-response';
import {
    JobPostingResponse,
    StudentJobCard,
    CompanyJobCard,
    AdminJobCard,
    UpdateJobResponse,
    CategoryItem,
    JobSkillItem,
} from '../interfaces';
import { JobPostingDomain, JobPostingDomainError } from '../domain/job-posting.domain';
import { JobPostingMapper } from '../domain/job-posting.mapper';


@Injectable()
export class JobPostingRepository implements IJobPostingRepository {
    constructor(
        @Inject(DATABASE_CONNECTION)
        private readonly db: NodePgDatabase<typeof schema>,
    ) { }

    // =========================================================================
    // PRIVATE HELPERS — Fetch dữ liệu phụ (skills, applicant counts)
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
    // LOOKUP QUERIES
    // =========================================================================

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
            .from(schema.job_categories) as Promise<CategoryItem[]>;
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
    // CREATE
    // Domain.create() đã validate — repo chỉ lưu xuống DB
    // =========================================================================

    async createJobPosting(
        companyId: number,
        dto: CreateJobPostingDto,
    ): Promise<number | null> {
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

    // =========================================================================
    // UPDATE
    // Load domain từ DB → gọi domain.edit() để validate + mutate → lưu lại
    // =========================================================================

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

    // =========================================================================
    // APPROVE / REJECT (Admin)
    // Pattern giống update: load → domain method → save
    // =========================================================================

    async approveJob(jobId: number): Promise<boolean> {
        return this.db.transaction(async (tx) => {
            const [existing] = await tx
                .select()
                .from(schema.job_postings)
                .where(eq(schema.job_postings.job_id, jobId))
                .limit(1);

            if (!existing) return false;

            const domain = JobPostingDomain.fromPersistence(existing);
            domain.approve();

            await tx
                .update(schema.job_postings)
                .set(domain.toUpdatePersistence())
                .where(eq(schema.job_postings.job_id, jobId));

            return true;
        });
    }

    async rejectJob(jobId: number): Promise<boolean> {
        return this.db.transaction(async (tx) => {
            const [existing] = await tx
                .select()
                .from(schema.job_postings)
                .where(eq(schema.job_postings.job_id, jobId))
                .limit(1);

            if (!existing) return false;

            const domain = JobPostingDomain.fromPersistence(existing);
            domain.reject();

            await tx
                .update(schema.job_postings)
                .set(domain.toUpdatePersistence())
                .where(eq(schema.job_postings.job_id, jobId));

            return true;
        });
    }

    // =========================================================================
    // FIND ONE
    // =========================================================================

    async findJobById(
        jobId: number,
        viewer: RoleName,
        companyId?: number,
    ): Promise<JobPostingResponse | null> {
        const conditions = [eq(schema.job_postings.job_id, jobId)];

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

        const domain = JobPostingDomain.fromPersistence(row.job_postings);

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

        return JobPostingMapper.toResponse(domain, {
            applicantCount,
            requiredSkills: skillRows.map((s) => ({
                skillId: s.skillId!,
                skillName: s.skillName,
            })),
            companyName: row.companies.company_name,
            logoUrl: row.companies.logo_url,
        });
    }

    // =========================================================================
    // FIND ALL — ADMIN
    // =========================================================================

    async findAllForAdmin(
        dto: ListJobPostingDto,
    ): Promise<PaginationResponse<AdminJobCard>> {
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

        const items = rows.map((r) => {
            const domain = JobPostingDomain.fromPersistence(r.job);
            return JobPostingMapper.toAdminCard(domain, {
                companyName: r.company_name,
                logoUrl: r.logo_url ?? null,
            });
        });

        return new PaginationResponse(items, page, limit, Number(total));
    }

    // =========================================================================
    // FIND ALL — COMPANY
    // =========================================================================

    async findAllForCompany(
        companyId: number,
        dto: ListJobPostingDto,
    ): Promise<PaginationResponse<CompanyJobCard>> {
        const { page, limit, search, status, city } = dto;
        const offset = (page - 1) * limit;

        const conditions = [eq(schema.job_postings.company_id, companyId)];
        if (search) conditions.push(ilike(schema.job_postings.job_title, `%${search}%`));
        if (status) conditions.push(eq(schema.job_postings.status, status));
        if (city) conditions.push(ilike(schema.job_postings.city, `%${city}%`));

        const whereClause = and(...conditions);

        const [rows, [{ total }]] = await Promise.all([
            this.db
                .select()
                .from(schema.job_postings)
                .where(whereClause)
                .orderBy(sql`${schema.job_postings.created_at} desc`)
                .limit(limit)
                .offset(offset),

            this.db
                .select({ total: count() })
                .from(schema.job_postings)
                .where(whereClause),
        ]);

        const jobIds = rows.map((r) => r.job_id);
        const [skillMap, countMap] = await Promise.all([
            this.fetchSkillMap(jobIds),
            this.fetchApplicantCountMap(jobIds),
        ]);

        const items = rows.map((r) => {
            const domain = JobPostingDomain.fromPersistence(r);
            return JobPostingMapper.toCompanyCard(domain, {
                skills: skillMap.get(r.job_id) ?? [],
                applicantCount: countMap.get(r.job_id) ?? 0,
            });
        });

        return new PaginationResponse(items, page, limit, Number(total));
    }

    // =========================================================================
    // FIND ALL — STUDENT
    // =========================================================================

    async findAllForStudent(
        dto: ListJobPostingDto,
    ): Promise<PaginationResponse<StudentJobCard>> {
        const { page, limit, search, city } = dto;
        const offset = (page - 1) * limit;

        const conditions = [eq(schema.job_postings.status, 'approved')];
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
        const [skillMap, countMap] = await Promise.all([
            this.fetchSkillMap(jobIds),
            this.fetchApplicantCountMap(jobIds),
        ]);

        const items = rows.map((r) => {
            const domain = JobPostingDomain.fromPersistence(r.job);
            return JobPostingMapper.toStudentCard(domain, {
                companyName: r.company_name,
                logoUrl: r.logo_url ?? null,
                skills: skillMap.get(r.job.job_id) ?? [],
                applicantCount: countMap.get(r.job.job_id) ?? 0,
            });
        });

        return new PaginationResponse(items, page, limit, Number(total));
    }
}