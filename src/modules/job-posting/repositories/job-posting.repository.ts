import { Inject, Injectable } from "@nestjs/common";
import { IJobPostingRepository } from "./job-posting-repository.interface";
import { DATABASE_CONNECTION } from 'src/database/database.module';
import { NodePgDatabase } from 'drizzle-orm/node-postgres';
import * as schema from '../../../database/schema';
import { CreateJobPostingDto } from "../dto/create-job-posting.dto";
import { CategoryItem, JobPostingResponse, UpdateJobResponse, JobSkillItem, StudentJobCard, CompanyJobCard, AdminJobCard } from "../interfaces";
import { and, count, eq, ilike, inArray, sql, SQL } from "drizzle-orm";
import { UpdateJobPostingDto } from "../dto/update-job-posting.dto";
import { RoleName } from "src/common/types/role.enum";
import { ListJobPostingDto } from "../dto/list-job-posting.dto";
import { PaginationResponse } from "src/common/types/PaginationResponse";
import { toRelativeTime } from "src/utils/relative-time.util";


@Injectable()
export class JobPostingRepository implements IJobPostingRepository {
    constructor(
        @Inject(DATABASE_CONNECTION) private readonly db: NodePgDatabase<typeof schema>,
    ) { }

    async isCompanyActive(companyId: number): Promise<boolean> {
        const result = await this.db
            .select({ status: schema.companies.status })
            .from(schema.companies)
            .where(eq(schema.companies.company_id, companyId))
            .limit(1);

        if (!result.length) return false;
        return result[0].status === 'APPROVED';
    }

    private async fetchSkillMap(
        jobIds: number[],
    ): Promise<Map<number, { skillId: number; skillName: string }[]>> {
        if (!jobIds.length) return new Map();

        const rows = await this.db
            .select({
                job_id: schema.job_required_skills.job_id,
                skill_id: schema.job_required_skills.skill_id,
                skill_name: schema.skills.skill_name,
            })
            .from(schema.job_required_skills)
            .innerJoin(
                schema.skills,
                eq(schema.job_required_skills.skill_id, schema.skills.skill_id),
            )
            .where(inArray(schema.job_required_skills.job_id, jobIds));

        const map = new Map<number, { skillId: number; skillName: string }[]>();
        for (const r of rows) {
            if (!map.has(r.job_id!)) map.set(r.job_id!, []);
            map.get(r.job_id!)!.push({ skillId: r.skill_id!, skillName: r.skill_name });
        }
        return map;
    }

    // ─────────────────────────────────────────────────────────────────────────
    // HELPER: applicant count map cho một danh sách job_id
    // ─────────────────────────────────────────────────────────────────────────
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

    async createJobPosting(
        companyId: number,
        dto: CreateJobPostingDto,
    ): Promise<number | null> {
        return await this.db.transaction(async (tx) => {
            const [newJob] = await tx
                .insert(schema.job_postings)
                .values({
                    company_id: companyId,
                    category_id: dto.categoryId ?? null,
                    job_title: dto.jobTitle,
                    job_description: dto.jobDescription,
                    requirements: dto.requirements,
                    benefits: dto.benefits ?? null,
                    experience_level: dto.experienceLevel ?? null,
                    position_level: dto.positionLevel ?? null,
                    number_of_positions: dto.numberOfPositions,
                    salary_min: dto.salaryMin ?? null,
                    salary_max: dto.salaryMax ?? null,
                    salary_type: dto.salaryType ?? null,
                    is_salary_negotiable: dto.isSalaryNegotiable,
                    city: dto.city ?? null,
                    application_deadline: dto.applicationDeadline
                        ? dto.applicationDeadline.split('T')[0]
                        : null,
                    is_urgent: dto.isUrgent,
                })
                .returning();

            if (dto.skillIds && dto.skillIds.length > 0) {
                await tx
                    .insert(schema.job_required_skills)
                    .values(
                        dto.skillIds.map((skillId) => ({
                            job_id: newJob.job_id,
                            skill_id: skillId,
                        })),
                    )
            }
            return newJob.job_id;
        })

    }

    async updateJobPosting(
        jobId: number,
        companyId: number,
        dto: UpdateJobPostingDto,
    ): Promise<UpdateJobResponse | null> {
        return await this.db.transaction(async (tx) => {
            // ── 1. Kiểm tra job tồn tại, thuộc đúng company, và đang ở
            //       trạng thái cho phép sửa (pending | rejected) ──────────
            const [existing] = await tx
                .select({
                    job_id: schema.job_postings.job_id,
                    status: schema.job_postings.status,
                })
                .from(schema.job_postings)
                .where(
                    and(
                        eq(schema.job_postings.job_id, jobId),
                        eq(schema.job_postings.company_id, companyId),
                        inArray(schema.job_postings.status, ['pending', 'rejected']),
                    ),
                )
                .limit(1);

            if (!existing) return null;

            // ── 2. Build object update — chỉ set field nào được truyền vào ──
            const updateValues: Record<string, unknown> = {
                updated_at: new Date(),
                status: 'pending',
            };

            if (dto.jobTitle !== undefined) updateValues.job_title = dto.jobTitle;
            if (dto.categoryId !== undefined) updateValues.category_id = dto.categoryId;
            if (dto.city !== undefined) updateValues.city = dto.city;
            if (dto.jobDescription !== undefined) updateValues.job_description = dto.jobDescription;
            if (dto.requirements !== undefined) updateValues.requirements = dto.requirements;
            if (dto.benefits !== undefined) updateValues.benefits = dto.benefits;
            if (dto.experienceLevel !== undefined) updateValues.experience_level = dto.experienceLevel;
            if (dto.positionLevel !== undefined) updateValues.position_level = dto.positionLevel;
            if (dto.numberOfPositions !== undefined) updateValues.number_of_positions = dto.numberOfPositions;
            if (dto.salaryMin !== undefined) updateValues.salary_min = dto.salaryMin;
            if (dto.salaryMax !== undefined) updateValues.salary_max = dto.salaryMax;
            if (dto.salaryType !== undefined) updateValues.salary_type = dto.salaryType;
            if (dto.isSalaryNegotiable !== undefined) updateValues.is_salary_negotiable = dto.isSalaryNegotiable;
            if (dto.isUrgent !== undefined) updateValues.is_urgent = dto.isUrgent;
            if (dto.applicationDeadline !== undefined) {
                const date = new Date(dto.applicationDeadline);

                if (isNaN(date.getTime())) {
                    throw new Error('Invalid date');
                }

                updateValues.application_deadline = date.toISOString().slice(0, 10);
            }

            // ── 3. Update job_postings ─────────────────────────────────────
            await tx
                .update(schema.job_postings)
                .set(updateValues)
                .where(eq(schema.job_postings.job_id, jobId));

            // ── 4. Nếu có skillIds → replace toàn bộ skills ───────────────
            if (dto.skillIds && dto.skillIds.length > 0) {
                // Xóa hết skills cũ
                await tx
                    .delete(schema.job_required_skills)
                    .where(eq(schema.job_required_skills.job_id, jobId));

                // Insert skills mới
                await tx
                    .insert(schema.job_required_skills)
                    .values(
                        dto.skillIds.map((skillId) => ({
                            job_id: jobId,
                            skill_id: skillId,
                        })),
                    );
            }

            return { jobId, jobTitle: dto.jobTitle };
        });
    }

    async getJobCategories(): Promise<CategoryItem[]> {
        const data = await this.db
            .select({
                categoryId: schema.job_categories.category_id,
                categoryName: schema.job_categories.category_name
            })
            .from(schema.job_categories)

        return data as CategoryItem[];
    }

    async getJobSkill(): Promise<JobSkillItem[]> {
        const data = await this.db
            .select({
                skillId: schema.skills.skill_id,
                skillName: schema.skills.skill_name
            })
            .from(schema.skills);

        return data as JobSkillItem[];
    }

    mapToJobResponse(
        row: any,
        applicantCount: number,
        requiredSkills: JobSkillItem[],
    ): JobPostingResponse {
        return {
            jobId: row.job_id,
            companyId: row.company_id!,
            logoUrl: row.logo_url ?? null,
            categoryId: row.category_id ?? null,
            jobTitle: row.job_title,
            jobDescription: row.job_description,
            requirements: row.requirements,
            benefits: row.benefits ?? null,
            employmentType: row.employment_type ?? null,
            experienceLevel: row.experience_level ?? null,
            positionLevel: row.position_level ?? null,
            numberOfPositions: row.number_of_positions ?? 1,
            salaryMin: row.salary_min ?? null,
            salaryMax: row.salary_max ?? null,
            salaryType: row.salary_type ?? null,
            isSalaryNegotiable: row.is_salary_negotiable ?? true,
            city: row.city ?? null,
            applicationDeadline: row.application_deadline ?? null,
            status: row.status ?? 'pending',
            isUrgent: row.is_urgent ?? false,
            isFeatured: row.is_featured ?? false,
            applicantCount,
            createdAt: row.created_at!,
            updatedAt: row.updated_at!,
            requiredSkills,
        };
    }

    async findJobById(
        jobId: number,
        viewer: RoleName,
        companyId?: number,
    ): Promise<JobPostingResponse | null> {
        // build conditions inline
        const conditions = [eq(schema.job_postings.job_id, jobId)];
        console.log('Viwer:', viewer);

        if (viewer === RoleName.STUDENT) {
            conditions.push(eq(schema.job_postings.status, 'approved'));
        }

        if (viewer === RoleName.COMPANY) {
            conditions.push(eq(schema.job_postings.company_id, companyId!));
        }

        // main query
        const [row] = await this.db
            .select({
                job_id: schema.job_postings.job_id,
                company_id: schema.job_postings.company_id,
                logo_url: schema.companies.logo_url,
                category_id: schema.job_postings.category_id,
                job_title: schema.job_postings.job_title,
                job_description: schema.job_postings.job_description,
                requirements: schema.job_postings.requirements,
                benefits: schema.job_postings.benefits,
                employment_type: schema.job_postings.employment_type,
                experience_level: schema.job_postings.experience_level,
                position_level: schema.job_postings.position_level,
                number_of_positions: schema.job_postings.number_of_positions,
                salary_min: schema.job_postings.salary_min,
                salary_max: schema.job_postings.salary_max,
                salary_type: schema.job_postings.salary_type,
                is_salary_negotiable: schema.job_postings.is_salary_negotiable,
                city: schema.job_postings.city,
                application_deadline: schema.job_postings.application_deadline,
                status: schema.job_postings.status,
                is_urgent: schema.job_postings.is_urgent,
                is_featured: schema.job_postings.is_featured,
                created_at: schema.job_postings.created_at,
                updated_at: schema.job_postings.updated_at,
            })
            .from(schema.job_postings)
            .innerJoin(
                schema.companies,
                eq(schema.job_postings.company_id, schema.companies.company_id),
            )
            .where(and(...conditions))
            .limit(1);

        if (!row) return null;

        // run parallel queries
        const [[{ applicantCount }], skillRows] = await Promise.all([
            this.db
                .select({ applicantCount: count() })
                .from(schema.applications)
                .where(eq(schema.applications.job_id, jobId)),

            this.db
                .select({
                    skill_id: schema.job_required_skills.skill_id,
                    skill_name: schema.skills.skill_name,
                })
                .from(schema.job_required_skills)
                .innerJoin(
                    schema.skills,
                    eq(schema.job_required_skills.skill_id, schema.skills.skill_id),
                )
                .where(eq(schema.job_required_skills.job_id, jobId)),
        ]);

        // map skills
        const requiredSkills: JobSkillItem[] = skillRows.map((s) => ({
            skillId: s.skill_id,
            skillName: s.skill_name,
        }));

        // mapper
        return this.mapToJobResponse(row, applicantCount, requiredSkills);
    }

    // ─────────────────────────────────────────────────────────────────────────
    // findAllForAdmin
    // ─────────────────────────────────────────────────────────────────────────
    async findAllForAdmin(dto: ListJobPostingDto): Promise<PaginationResponse<AdminJobCard>> {
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
                    job_id: schema.job_postings.job_id,
                    company_id: schema.job_postings.company_id,
                    company_name: schema.companies.company_name,
                    logo_url: schema.companies.logo_url,
                    job_title: schema.job_postings.job_title,
                    city: schema.job_postings.city,
                    salary_min: schema.job_postings.salary_min,
                    salary_max: schema.job_postings.salary_max,
                    salary_type: schema.job_postings.salary_type,
                    is_salary_negotiable: schema.job_postings.is_salary_negotiable,
                    application_deadline: schema.job_postings.application_deadline,
                    status: schema.job_postings.status,
                })
                .from(schema.job_postings)
                .innerJoin(schema.companies, eq(schema.job_postings.company_id, schema.companies.company_id))
                .where(whereClause)
                .orderBy(sql`${schema.job_postings.created_at} desc`)
                .limit(limit)
                .offset(offset),

            this.db
                .select({ total: count() })
                .from(schema.job_postings)
                .where(whereClause),
        ]);

        const items: AdminJobCard[] = rows.map((r) => ({
            jobId: r.job_id,
            companyId: r.company_id!,
            companyName: r.company_name,
            logoUrl: r.logo_url ?? null,
            jobTitle: r.job_title,
            city: r.city ?? null,
            salaryMin: r.salary_min ?? null,
            salaryMax: r.salary_max ?? null,
            salaryType: (r.salary_type as AdminJobCard['salaryType']) ?? null,
            isSalaryNegotiable: r.is_salary_negotiable ?? true,
            applicationDeadline: r.application_deadline ?? null,
            status: (r.status as AdminJobCard['status']) ?? 'pending',
        }));

        return new PaginationResponse(
            items,
            page,
            limit,
            Number(total)
        );
    }

    // ─────────────────────────────────────────────────────────────────────────
    // findAllForCompany
    // ─────────────────────────────────────────────────────────────────────────
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
                .select({
                    job_id: schema.job_postings.job_id,
                    job_title: schema.job_postings.job_title,
                    city: schema.job_postings.city,
                    salary_min: schema.job_postings.salary_min,
                    salary_max: schema.job_postings.salary_max,
                    salary_type: schema.job_postings.salary_type,
                    is_salary_negotiable: schema.job_postings.is_salary_negotiable,
                    application_deadline: schema.job_postings.application_deadline,
                    status: schema.job_postings.status,
                    created_at: schema.job_postings.created_at,
                })
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

        const items: CompanyJobCard[] = rows.map((r) => ({
            jobId: r.job_id,
            jobTitle: r.job_title,
            city: r.city ?? null,
            salaryMin: r.salary_min ?? null,
            salaryMax: r.salary_max ?? null,
            salaryType: (r.salary_type as CompanyJobCard['salaryType']) ?? null,
            isSalaryNegotiable: r.is_salary_negotiable ?? true,
            applicationDeadline: r.application_deadline ?? null,
            status: (r.status as CompanyJobCard['status']) ?? 'pending',
            applicantCount: countMap.get(r.job_id) ?? 0,
            skills: skillMap.get(r.job_id) ?? [],
            createdAt: r.created_at!,
        }));

        return new PaginationResponse(
            items,
            page,
            limit,
            Number(total)
        );
    }

    // ─────────────────────────────────────────────────────────────────────────
    // findAllForStudent
    // ─────────────────────────────────────────────────────────────────────────
    async findAllForStudent(dto: ListJobPostingDto): Promise<PaginationResponse<StudentJobCard>> {
        const { page, limit, search, city } = dto;
        const offset = (page - 1) * limit;

        // Student luôn chỉ thấy approved — status filter từ DTO bị bỏ qua
        const conditions = [eq(schema.job_postings.status, 'approved')];
        if (search) conditions.push(ilike(schema.job_postings.job_title, `%${search}%`));
        if (city) conditions.push(ilike(schema.job_postings.city, `%${city}%`));

        const whereClause = and(...conditions);

        const [rows, [{ total }]] = await Promise.all([
            this.db
                .select({
                    job_id: schema.job_postings.job_id,
                    company_id: schema.job_postings.company_id,
                    company_name: schema.companies.company_name,
                    logo_url: schema.companies.logo_url,
                    job_title: schema.job_postings.job_title,
                    city: schema.job_postings.city,
                    salary_min: schema.job_postings.salary_min,
                    salary_max: schema.job_postings.salary_max,
                    salary_type: schema.job_postings.salary_type,
                    is_salary_negotiable: schema.job_postings.is_salary_negotiable,
                    employment_type: schema.job_postings.employment_type,
                    created_at: schema.job_postings.created_at,
                })
                .from(schema.job_postings)
                .innerJoin(schema.companies, eq(schema.job_postings.company_id, schema.companies.company_id))
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

        const items: StudentJobCard[] = rows.map((r) => ({
            jobId: r.job_id,
            companyId: r.company_id!,
            companyName: r.company_name,
            logoUrl: r.logo_url ?? null,
            jobTitle: r.job_title,
            city: r.city ?? null,
            salaryMin: r.salary_min ?? null,
            salaryMax: r.salary_max ?? null,
            salaryType: (r.salary_type as StudentJobCard['salaryType']) ?? null,
            isSalaryNegotiable: r.is_salary_negotiable ?? true,
            employmentType: r.employment_type ?? null,
            postedAt: toRelativeTime(r.created_at!),
            applicantCount: countMap.get(r.job_id) ?? 0,
            skills: skillMap.get(r.job_id) ?? [],
        }));

        return new PaginationResponse(
            items,
            page,
            limit,
            Number(total)
        );
    }
}