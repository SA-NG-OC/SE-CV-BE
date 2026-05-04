import { Inject, Injectable } from '@nestjs/common';
import { NodePgDatabase } from 'drizzle-orm/node-postgres';
import { sql, eq, and, desc, ilike, or, exists, gte, SQL, inArray, count } from 'drizzle-orm';
import Redis from 'ioredis';

import { DATABASE_CONNECTION } from 'src/database/database.module';
import * as schema from '../../../database/schema';
import { IStudentRepository } from './student-repository.interface';
import { CreateResumeDto } from '../dto/update-student.dto';
import { GetStudentsQuery } from '../types/student.interface';
import { PaginationResponse } from 'src/common/types/pagination-response';
import {
    MajorRaw,
    StudentAdminListRaw,
    StudentApplicationCountRaw,
    StudentCardRaw,
    StudentGeneralInfoRaw,
    StudentProfileRaw,
    StudentRaw,
    StudentResumeRaw,
    StudentSkillsRaw,
    StudentWithMajorRaw,
    StudentAdminCardRaw,
} from '../types/student.raw';

@Injectable()
export class StudentRepository implements IStudentRepository {
    constructor(
        @Inject(DATABASE_CONNECTION)
        private readonly db: NodePgDatabase<typeof schema>,

        @Inject('REDIS_CLIENT')
        private readonly redis: Redis,
    ) { }

    async findRawById(actorId: number): Promise<number | null> {
        const [data] = await this.db
            .select({ id: schema.students.user_id })
            .from(schema.students)
            .where(eq(schema.students.student_id, actorId))
        return data.id;
    }

    // =========================================================================
    // READ — Raw
    // =========================================================================

    async getMajors(): Promise<MajorRaw[]> {
        return this.db
            .select({
                major_id: schema.majors.major_id,
                major_name: schema.majors.major_name,
            })
            .from(schema.majors);
    }

    async getGeneralInformation(): Promise<StudentGeneralInfoRaw> {
        const [result] = await this.db
            .select({
                total_students: sql<number>`cast(count(*) as int)`,
                studying: sql<number>`cast(count(*) filter (where ${schema.students.student_status} = 'STUDYING') as int)`,
                graduated: sql<number>`cast(count(*) filter (where ${schema.students.student_status} = 'GRADUATED') as int)`,
            })
            .from(schema.students);

        return result ?? { total_students: 0, studying: 0, graduated: 0 };
    }

    async getStudentListAdmin(
        page: number,
        limit: number,
        status?: 'STUDYING' | 'GRADUATED' | 'DROPPED_OUT',
        keyword?: string,
    ): Promise<StudentAdminListRaw> {
        const cacheKey = `students:page=${page}:limit=${limit}:status=${status ?? 'all'}:keyword=${keyword ?? ''}`;

        const cached = await this.redis.get(cacheKey);
        if (cached) return JSON.parse(cached);

        const offset = (page - 1) * limit;
        const condition = and(
            status ? eq(schema.students.student_status, status) : undefined,
            keyword
                ? or(
                    ilike(schema.students.full_name, `%${keyword}%`),
                    ilike(schema.students.student_code, `%${keyword}%`),
                )
                : undefined,
        );

        const [rows, [{ total_item }]] = await Promise.all([
            this.db
                .select({
                    student_id: schema.students.student_id,
                    full_name: schema.students.full_name,
                    student_code: schema.students.student_code,
                    email_student: schema.students.email_student,
                    current_year: schema.students.current_year,
                    enrollment_year: schema.students.enrollment_year,
                    student_status: schema.students.student_status,
                    total_applications: sql<number>`
                        coalesce(count(${schema.applications.application_id}), 0)
                    `.mapWith(Number),
                })
                .from(schema.students)
                .leftJoin(
                    schema.applications,
                    eq(schema.applications.student_id, schema.students.student_id),
                )
                .where(condition)
                .groupBy(schema.students.student_id)
                .orderBy(desc(schema.students.created_at))
                .limit(limit)
                .offset(offset),

            this.db
                .select({ total_item: sql<number>`count(*)`.mapWith(Number) })
                .from(schema.students)
                .where(condition),
        ]);

        const result: StudentAdminListRaw = {
            data: rows,
            meta: {
                current_page: page,
                items_per_page: limit,
                total_item,
                total_pages: Math.ceil(total_item / limit),
            },
        };

        await this.redis.set(cacheKey, JSON.stringify(result), 'EX', 60);

        return result;
    }

    async findStudentWithMajor(studentId: number): Promise<StudentWithMajorRaw | null> {
        const [row] = await this.db
            .select({
                student: schema.students,
                major_name: schema.majors.major_name,
            })
            .from(schema.students)
            .leftJoin(schema.majors, eq(schema.majors.major_id, schema.students.major_id))
            .where(eq(schema.students.student_id, studentId))
            .limit(1);

        if (!row) return null;

        return { student: row.student, major_name: row.major_name ?? null };
    }

    async findSkillsByStudent(studentId: number): Promise<StudentSkillsRaw> {
        const rows = await this.db
            .select({ skill_name: schema.skills.skill_name })
            .from(schema.student_skills)
            .innerJoin(schema.skills, eq(schema.skills.skill_id, schema.student_skills.skill_id))
            .where(eq(schema.student_skills.student_id, studentId));

        return rows.map((r) => r.skill_name);
    }

    async findResumesByStudent(
        studentId: number,
        isDefault?: boolean,
    ): Promise<StudentResumeRaw[]> {
        const conditions = [eq(schema.student_resumes.student_id, studentId)];
        if (isDefault) conditions.push(eq(schema.student_resumes.is_default, true));

        return this.db
            .select({
                resume_id: schema.student_resumes.resume_id,
                resume_name: schema.student_resumes.resume_name,
                cv_url: schema.student_resumes.cv_url,
                is_default: schema.student_resumes.is_default,
            })
            .from(schema.student_resumes)
            .where(and(...conditions));
    }

    async countApplicationsByStudent(studentId: number): Promise<StudentApplicationCountRaw> {
        const [result] = await this.db
            .select({
                total: sql<number>`cast(count(${schema.applications.application_id}) as int)`,
            })
            .from(schema.applications)
            .where(eq(schema.applications.student_id, studentId));

        return result?.total ?? 0;
    }

    async findStudentCards(
        query: GetStudentsQuery,
    ): Promise<PaginationResponse<StudentCardRaw>> {
        const { page, limit, search, majorId, years, minGpa, skillIds } = query;
        const offset = (page - 1) * limit;
        const conditions: (SQL | undefined)[] = [];

        if (search) conditions.push(ilike(schema.students.full_name, `%${search}%`));
        if (majorId) conditions.push(eq(schema.students.major_id, majorId));

        if (years && years.length > 0) {
            const yearNumbers = years.filter((y): y is number => typeof y === 'number');
            const hasGraduated = years.some((y) => y === 'GRADUATED');
            const yearConditions: (SQL | undefined)[] = [];
            if (yearNumbers.length > 0) yearConditions.push(inArray(schema.students.current_year, yearNumbers));
            if (hasGraduated) yearConditions.push(eq(schema.students.student_status, 'GRADUATED'));
            if (yearConditions.length > 0) conditions.push(or(...yearConditions));
        }

        if (minGpa !== undefined) conditions.push(gte(schema.students.gpa, minGpa.toString()));

        if (skillIds && skillIds.length > 0) {
            conditions.push(
                exists(
                    this.db
                        .select({ id: schema.student_skills.student_id })
                        .from(schema.student_skills)
                        .where(
                            and(
                                eq(schema.student_skills.student_id, schema.students.student_id),
                                inArray(schema.student_skills.skill_id, skillIds),
                            ),
                        ),
                ),
            );
        }

        conditions.push(eq(schema.students.is_open_to_work, true));

        const whereClause = conditions.length > 0 ? and(...conditions) : undefined;

        const [{ total }] = await this.db
            .select({ total: count() })
            .from(schema.students)
            .where(whereClause);

        const rows = await this.db
            .select({
                student_id: schema.students.student_id,
                full_name: schema.students.full_name,
                avatar_url: schema.students.avatar_url,
                current_year: schema.students.current_year,
                gpa: schema.students.gpa,
                student_status: schema.students.student_status,
                is_open_to_work: sql<boolean>`coalesce(${schema.students.is_open_to_work}, false)`,
                skills: sql<string[]>`
                    coalesce(
                        array_agg(${schema.skills.skill_name})
                        filter (where ${schema.skills.skill_name} is not null),
                        '{}'
                    )
                `,
            })
            .from(schema.students)
            .leftJoin(schema.student_skills, eq(schema.students.student_id, schema.student_skills.student_id))
            .leftJoin(schema.skills, eq(schema.student_skills.skill_id, schema.skills.skill_id))
            .where(whereClause)
            .groupBy(schema.students.student_id)
            .orderBy(desc(schema.students.created_at))
            .limit(limit)
            .offset(offset);

        return new PaginationResponse(rows, page, limit, Number(total));
    }

    async findStudentProfileByUserId(userId: number): Promise<StudentProfileRaw | null> {
        const skillsSub = this.db
            .select({
                student_id: schema.student_skills.student_id,
                skills: sql<any>`
                    coalesce(
                        json_agg(
                            jsonb_build_object(
                                'skill_id', ${schema.skills.skill_id},
                                'skill_name', ${schema.skills.skill_name}
                            )
                        ) filter (where ${schema.skills.skill_id} is not null),
                        '[]'
                    )
                `.as('skills'),
            })
            .from(schema.student_skills)
            .leftJoin(schema.skills, eq(schema.student_skills.skill_id, schema.skills.skill_id))
            .groupBy(schema.student_skills.student_id)
            .as('skills_sub');

        const resumesSub = this.db
            .select({
                student_id: schema.student_resumes.student_id,
                resumes: sql<any>`
                    coalesce(
                        json_agg(
                            jsonb_build_object(
                                'resume_id', ${schema.student_resumes.resume_id},
                                'resume_name', ${schema.student_resumes.resume_name},
                                'cv_url', ${schema.student_resumes.cv_url},
                                'is_default', ${schema.student_resumes.is_default}
                            )
                        ) filter (where ${schema.student_resumes.resume_id} is not null),
                        '[]'
                    )
                `.as('resumes'),
            })
            .from(schema.student_resumes)
            .groupBy(schema.student_resumes.student_id)
            .as('resumes_sub');

        const [row] = await this.db
            .select({
                student_id: schema.students.student_id,
                full_name: schema.students.full_name,
                avatar_url: schema.students.avatar_url,
                current_year: schema.students.current_year,
                gpa: schema.students.gpa,
                is_open_to_work: sql<boolean>`coalesce(${schema.students.is_open_to_work}, false)`,
                skills: skillsSub.skills,
                resumes: resumesSub.resumes,
            })
            .from(schema.students)
            .leftJoin(skillsSub, eq(schema.students.student_id, skillsSub.student_id))
            .leftJoin(resumesSub, eq(schema.students.student_id, resumesSub.student_id))
            .where(eq(schema.students.user_id, userId))
            .limit(1);

        return row ?? null;
    }

    async findRawById2(studentId: number): Promise<StudentRaw | null> {
        const [row] = await this.db
            .select()
            .from(schema.students)
            .where(eq(schema.students.student_id, studentId))
            .limit(1);

        return row ?? null;
    }

    async findResumeById(resumeId: number, studentId: number): Promise<StudentResumeRaw | null> {
        const [row] = await this.db
            .select({
                resume_id: schema.student_resumes.resume_id,
                resume_name: schema.student_resumes.resume_name,
                cv_url: schema.student_resumes.cv_url,
                is_default: schema.student_resumes.is_default,
            })
            .from(schema.student_resumes)
            .where(
                and(
                    eq(schema.student_resumes.resume_id, resumeId),
                    eq(schema.student_resumes.student_id, studentId),
                ),
            )
            .limit(1);

        return row ?? null;
    }

    // =========================================================================
    // WRITE
    // =========================================================================

    async updateFields(
        userId: number,
        fields: Partial<Record<string, unknown>>,
    ): Promise<void> {
        const filtered = Object.fromEntries(
            Object.entries(fields).filter(([, v]) => v !== undefined),
        );

        await this.db
            .update(schema.students)
            .set({ ...filtered, updated_at: new Date() })
            .where(eq(schema.students.user_id, userId));
    }

    async updateByStudentId(
        studentId: number,
        fields: Partial<Record<string, unknown>>,
    ): Promise<void> {
        const filtered = Object.fromEntries(
            Object.entries(fields).filter(([, v]) => v !== undefined),
        );

        await this.db
            .update(schema.students)
            .set({ ...filtered, updated_at: new Date() })
            .where(eq(schema.students.student_id, studentId));
    }

    async replaceSkills(studentId: number, skillIds: number[]): Promise<void> {
        await this.db.transaction(async (tx) => {
            await tx
                .delete(schema.student_skills)
                .where(eq(schema.student_skills.student_id, studentId));

            if (skillIds.length > 0) {
                await tx.insert(schema.student_skills).values(
                    skillIds.map((skillId) => ({
                        student_id: studentId,
                        skill_id: skillId,
                    })),
                );
            }
        });
    }

    async insertResume(
        studentId: number,
        data: CreateResumeDto,
        isDefault: boolean,
    ): Promise<StudentResumeRaw> {
        const [row] = await this.db
            .insert(schema.student_resumes)
            .values({
                student_id: studentId,
                resume_name: data.resumeName,
                cv_url: data.cvUrl,
                is_default: isDefault,
            })
            .returning();

        return {
            resume_id: row.resume_id,
            resume_name: row.resume_name,
            cv_url: row.cv_url,
            is_default: row.is_default,
        };
    }

    async deleteResume(resumeId: number): Promise<void> {
        await this.db
            .delete(schema.student_resumes)
            .where(eq(schema.student_resumes.resume_id, resumeId));
    }

    async setDefaultResume(
        studentId: number,
        resumeId: number,
    ): Promise<StudentResumeRaw | null> {
        return this.db.transaction(async (tx) => {
            await tx
                .update(schema.student_resumes)
                .set({ is_default: false })
                .where(eq(schema.student_resumes.student_id, studentId));

            const [updated] = await tx
                .update(schema.student_resumes)
                .set({ is_default: true })
                .where(
                    and(
                        eq(schema.student_resumes.student_id, studentId),
                        eq(schema.student_resumes.resume_id, resumeId),
                    ),
                )
                .returning();

            if (!updated) return null;

            return {
                resume_id: updated.resume_id,
                resume_name: updated.resume_name,
                cv_url: updated.cv_url,
                is_default: updated.is_default,
            };
        });
    }
}