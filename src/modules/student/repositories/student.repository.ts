import { BadRequestException, Inject, Injectable, NotFoundException } from '@nestjs/common';
import { NodePgDatabase } from 'drizzle-orm/node-postgres';
import { DATABASE_CONNECTION } from 'src/database/database.module';
import * as schema from '../../../database/schema';
import { sql, eq, and, desc, ilike, or, exists, gte, SQL, inArray, count } from 'drizzle-orm';
import Redis from 'ioredis';

import { IStudentRepository } from './student-repository.interface';
import { StudentDomain } from '../domain/student.domain';
import { StudentMapper } from '../domain/student.mapper';
import { CreateResumeDto } from '../dto/update-student.dto';
import {
    StudentResponse,
    StudentResumeItem,
    StudentGeneralInfo,
    StudentAdminListResult,
    GetStudentsQuery,
    StudentCard,
    StudentProfile,
} from '../types/student.interface';
import { PaginationResponse } from 'src/common/types/pagination-response';

@Injectable()
export class StudentRepository implements IStudentRepository {
    constructor(
        @Inject(DATABASE_CONNECTION)
        private readonly db: NodePgDatabase<typeof schema>,

        @Inject('REDIS_CLIENT')
        private readonly redisClient: Redis,
    ) { }

    // =========================================================================
    // PRIVATE HELPERS
    // =========================================================================

    private async fetchSkills(studentId: number): Promise<string[]> {
        const rows = await this.db
            .select({ skillName: schema.skills.skill_name })
            .from(schema.student_skills)
            .innerJoin(
                schema.skills,
                eq(schema.skills.skill_id, schema.student_skills.skill_id),
            )
            .where(eq(schema.student_skills.student_id, studentId));

        return rows.map((r) => r.skillName);
    }

    private async fetchResumes(
        studentId: number,
        isDefault?: boolean
    ): Promise<StudentResumeItem[]> {
        const conditions = [
            eq(schema.student_resumes.student_id, studentId),
        ];

        if (isDefault) {
            conditions.push(eq(schema.student_resumes.is_default, true));
        }

        const rows = await this.db
            .select({
                resumeId: schema.student_resumes.resume_id,
                resumeName: schema.student_resumes.resume_name,
                cvUrl: schema.student_resumes.cv_url,
                isDefault: schema.student_resumes.is_default,
            })
            .from(schema.student_resumes)
            .where(and(...conditions));

        return rows.map(StudentMapper.toResumeItem);
    }

    private async fetchApplicationCount(studentId: number): Promise<number> {
        const [result] = await this.db
            .select({
                total: sql<number>`cast(count(${schema.applications.application_id}) as int)`,
            })
            .from(schema.applications)
            .where(eq(schema.applications.student_id, studentId));

        return result?.total ?? 0;
    }

    async getMajors() {
        return await this.db
            .select({
                major_id: schema.majors.major_id,
                major_name: schema.majors.major_name,
            })
            .from(schema.majors);
    }

    async getGeneralInformation(): Promise<StudentGeneralInfo> {
        const [result] = await this.db
            .select({
                totalStudents: sql<number>`cast(count(*) as int)`,
                studying: sql<number>`cast(count(*) filter (where ${schema.students.student_status} = 'STUDYING') as int)`,
                graduated: sql<number>`cast(count(*) filter (where ${schema.students.student_status} = 'GRADUATED') as int)`,
            })
            .from(schema.students);

        return StudentMapper.toGeneralInfo(
            result ?? { totalStudents: 0, studying: 0, graduated: 0 },
        );
    }

    async getStudentListAdmin(
        page: number,
        limit: number,
        status?: 'STUDYING' | 'GRADUATED' | 'DROPPED_OUT',
        keyword?: string,
    ): Promise<StudentAdminListResult> {
        const cacheKey = `students:page=${page}:limit=${limit}:status=${status ?? 'all'}:keyword=${keyword ?? ''}`;

        // 1. Check cache
        const cached = await this.redisClient.get(cacheKey);
        if (cached) return JSON.parse(cached);

        // 2. Build condition
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

        const [rows, [{ totalItem }]] = await Promise.all([
            this.db
                .select({
                    studentId: schema.students.student_id,
                    fullName: schema.students.full_name,
                    studentCode: schema.students.student_code,
                    email: schema.students.email_student,
                    currentYear: schema.students.current_year,
                    enrollmentYear: schema.students.enrollment_year,
                    studentStatus: schema.students.student_status,
                    totalApplications: sql<number>`
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
                .select({ totalItem: sql<number>`count(*)`.mapWith(Number) })
                .from(schema.students)
                .where(condition),
        ]);

        const result: StudentAdminListResult = {
            data: rows.map(StudentMapper.toAdminCard),
            meta: {
                currentPage: page,
                itemsPerPage: limit,
                totalItem,
                totalPages: Math.ceil(totalItem / limit),
            },
        };

        // 3. Save cache TTL 60s
        await this.redisClient.set(cacheKey, JSON.stringify(result), 'EX', 60);

        return result;
    }

    async getStudentBasicInfo(studentId: number): Promise<StudentResponse | null> {
        const [row] = await this.db
            .select({
                student: schema.students,
                majorName: schema.majors.major_name,
            })
            .from(schema.students)
            .leftJoin(schema.majors, eq(schema.majors.major_id, schema.students.major_id))
            .where(eq(schema.students.student_id, studentId))
            .limit(1);

        if (!row) return null;

        const domain = StudentDomain.fromPersistence(row.student);

        const [skills, resumes, totalApplications] = await Promise.all([
            this.fetchSkills(studentId),
            this.fetchResumes(studentId, true),
            this.fetchApplicationCount(studentId),
        ]);

        return StudentMapper.toResponse(domain, {
            majorName: row.majorName ?? null,
            skills,
            resumes,
            totalApplications,
        });
    }

    async findStudentProfileByUserId(userId: number): Promise<StudentProfile | null> {
        const skillsSub = this.db
            .select({
                student_id: schema.student_skills.student_id,
                skills: sql<any>`
                COALESCE(
                    JSON_AGG(
                        JSONB_BUILD_OBJECT(
                            'skill_id', ${schema.skills.skill_id},
                            'skill_name', ${schema.skills.skill_name}
                        )
                    ) FILTER (WHERE ${schema.skills.skill_id} IS NOT NULL),
                    '[]'
                )
            `.as('skills')
            })
            .from(schema.student_skills)
            .leftJoin(
                schema.skills,
                eq(schema.student_skills.skill_id, schema.skills.skill_id)
            )
            .groupBy(schema.student_skills.student_id)
            .as('skills_sub');

        const resumesSub = this.db
            .select({
                student_id: schema.student_resumes.student_id,
                resumes: sql<any>`
                COALESCE(
                    JSON_AGG(
                        JSONB_BUILD_OBJECT(
                            'resume_id', ${schema.student_resumes.resume_id},
                            'resume_name', ${schema.student_resumes.resume_name},
                            'cv_url', ${schema.student_resumes.cv_url},
                            'is_default', ${schema.student_resumes.is_default}
                        )
                    ) FILTER (WHERE ${schema.student_resumes.resume_id} IS NOT NULL),
                    '[]'
                )
            `.as('resumes')
            })
            .from(schema.student_resumes)
            .groupBy(schema.student_resumes.student_id)
            .as('resumes_sub');

        const rows = await this.db
            .select({
                student_id: schema.students.student_id,
                full_name: schema.students.full_name,
                avatar_url: schema.students.avatar_url,
                current_year: schema.students.current_year,
                gpa: schema.students.gpa,
                is_open_to_work: sql<boolean>`COALESCE(${schema.students.is_open_to_work}, false)`,
                skills: skillsSub.skills,
                resumes: resumesSub.resumes
            })
            .from(schema.students)
            .leftJoin(skillsSub, eq(schema.students.student_id, skillsSub.student_id))
            .leftJoin(resumesSub, eq(schema.students.student_id, resumesSub.student_id))
            .where(eq(schema.students.user_id, userId))
            .limit(1);

        if (!rows.length) return null;

        return StudentMapper.toStudentProfile(rows[0]);
    }

    async getStudentSkills(studentId: number): Promise<string[]> {
        return this.fetchSkills(studentId);
    }

    async getStudentResumes(studentId: number): Promise<StudentResumeItem[]> {
        return this.fetchResumes(studentId);
    }

    async getStudentApplicationCount(studentId: number): Promise<number> {
        return this.fetchApplicationCount(studentId);
    }

    // =========================================================================
    // UPDATE
    // Pattern: load row → fromPersistence → domain method → save
    // =========================================================================

    async updateJobStatus(studentId: number, isOpenToWork: boolean): Promise<StudentResponse | null> {
        const [row] = await this.db
            .select()
            .from(schema.students)
            .where(eq(schema.students.student_id, studentId))
            .limit(1);

        if (!row) return null;

        const domain = StudentDomain.fromPersistence(row);
        domain.setOpenToWork(isOpenToWork);   // domain mutate

        await this.db
            .update(schema.students)
            .set(domain.toUpdatePersistence())
            .where(eq(schema.students.student_id, studentId));

        // Trả về full response sau khi update
        const [skills, resumes, totalApplications] = await Promise.all([
            this.fetchSkills(studentId),
            this.fetchResumes(studentId),
            this.fetchApplicationCount(studentId),
        ]);

        return StudentMapper.toResponse(domain, {
            majorName: null,  // không cần join major cho update này
            skills,
            resumes,
            totalApplications,
        });
    }

    async syncStudentSkills(studentId: number, skillIds: number[]): Promise<void> {
        // Validate qua domain trước khi thao tác DB
        const [row] = await this.db
            .select()
            .from(schema.students)
            .where(eq(schema.students.student_id, studentId))
            .limit(1);

        if (!row) return;

        const domain = StudentDomain.fromPersistence(row);
        domain.validateSkillIds(skillIds);   // domain throw nếu input sai

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

    async addResume(studentId: number, data: CreateResumeDto): Promise<StudentResumeItem> {
        let isDefault = false;
        const checkDefault = await this.fetchResumes(studentId, true);
        if (checkDefault.length <= 0) {
            isDefault = true;
        }
        const [newResume] = await this.db
            .insert(schema.student_resumes)
            .values({
                student_id: studentId,
                resume_name: data.resumeName,
                cv_url: data.cvUrl,
                is_default: isDefault,
            })
            .returning();

        return StudentMapper.toResumeItem({
            resumeId: newResume.resume_id,
            resumeName: newResume.resume_name,
            cvUrl: newResume.cv_url,
            isDefault: newResume.is_default,
        });
    }

    async deleteResume(studentId: number, resumeId: number): Promise<void> {
        const [resume] = await this.db
            .select({
                resume_id: schema.student_resumes.resume_id,
                is_default: schema.student_resumes.is_default,
            })
            .from(schema.student_resumes)
            .where(
                and(
                    eq(schema.student_resumes.resume_id, resumeId),
                    eq(schema.student_resumes.student_id, studentId),
                )
            );

        if (!resume) {
            throw new NotFoundException('CV không tồn tại');
        }

        if (resume.is_default) {
            throw new BadRequestException('Không thể xóa CV mặc định');
        }

        await this.db
            .delete(schema.student_resumes)
            .where(
                eq(schema.student_resumes.resume_id, resumeId)
            );
    }

    async setResumeAsDefault(studentId: number, resumeId: number): Promise<StudentResumeItem | null> {
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

            return StudentMapper.toResumeItem({
                resumeId: updated.resume_id,
                resumeName: updated.resume_name,
                cvUrl: updated.cv_url,
                isDefault: updated.is_default,
            });
        });
    }

    async updateStudentFields(userId: number, fields: any) {
        const filteredFields = Object.fromEntries(
            Object.entries(fields).filter(([_, v]) => v !== undefined)
        );

        return await this.db
            .update(schema.students)
            .set({
                ...filteredFields,
                updated_at: new Date(),
            })
            .where(eq(schema.students.user_id, userId));
    }

    async findStudentCards(
        query: GetStudentsQuery
    ): Promise<PaginationResponse<StudentCard>> {

        const {
            page,
            limit,
            search,
            majorId,
            years,
            minGpa,
            skillIds,
            isOpenToWork
        } = query;

        const offset = (page - 1) * limit;
        const conditions: (SQL | undefined)[] = [];

        // 1. Search theo tên
        if (search) {
            conditions.push(
                ilike(schema.students.full_name, `%${search}%`)
            );
        }

        // 2. Major
        if (majorId) {
            conditions.push(
                eq(schema.students.major_id, majorId)
            );
        }

        // 3. Years + Graduated
        if (years && years.length > 0) {
            const yearNumbers = years.filter((y): y is number => typeof y === 'number');
            const hasGraduated = years.some((y) => y === 'GRADUATED');
            const yearConditions: (SQL | undefined)[] = [];

            if (yearNumbers.length > 0) {
                yearConditions.push(inArray(schema.students.current_year, yearNumbers));
            }
            if (hasGraduated) {
                yearConditions.push(eq(schema.students.student_status, 'GRADUATED'));
            }
            if (yearConditions.length > 0) {
                conditions.push(or(...yearConditions));
            }
        }

        // 4. GPA
        if (minGpa !== undefined) {
            conditions.push(
                gte(schema.students.gpa, minGpa.toString())
            );
        }

        // 5. Skills (EXISTS subquery)
        if (skillIds && skillIds.length > 0) {
            conditions.push(
                exists(
                    this.db
                        .select({ id: schema.student_skills.student_id })
                        .from(schema.student_skills)
                        .where(
                            and(
                                eq(
                                    schema.student_skills.student_id,
                                    schema.students.student_id
                                ),
                                inArray(schema.student_skills.skill_id, skillIds)
                            )
                        )
                )
            );
        }

        // 6. Open to work
        conditions.push(
            eq(schema.students.is_open_to_work, true)
        );


        const whereClause =
            conditions.length > 0 ? and(...conditions) : undefined;

        const [totalRes] = await this.db
            .select({ total: count() })
            .from(schema.students)
            .where(whereClause ?? undefined);

        const totalItems = Number(totalRes?.total || 0);

        const rows = await this.db
            .select({
                student_id: schema.students.student_id,
                full_name: schema.students.full_name,
                avatar_url: schema.students.avatar_url,
                current_year: schema.students.current_year,
                gpa: schema.students.gpa,
                student_status: schema.students.student_status,
                is_open_to_work: sql<boolean>`
        COALESCE(${schema.students.is_open_to_work}, false)
      `,
                skills: sql`
        COALESCE(
          ARRAY_AGG(${schema.skills.skill_name})
          FILTER (WHERE ${schema.skills.skill_name} IS NOT NULL),
          '{}'
        )
      `
            })
            .from(schema.students)
            .leftJoin(
                schema.student_skills,
                eq(schema.students.student_id, schema.student_skills.student_id)
            )
            .leftJoin(
                schema.skills,
                eq(schema.student_skills.skill_id, schema.skills.skill_id)
            )
            .where(whereClause ?? undefined)
            .groupBy(schema.students.student_id)
            .orderBy(desc(schema.students.created_at))
            .limit(limit)
            .offset(offset);

        // =========================
        // RESPONSE
        // =========================
        return {
            data: rows.map(row =>
                StudentMapper.toStudentCard({
                    ...row,
                    skills: row.skills as string[]
                })
            ),
            meta: {
                totalItems,
                itemsPerPage: limit,
                totalPages: Math.ceil(totalItems / limit),
                currentPage: page,
            }
        };
    }
}