import { Inject } from "@nestjs/common";
import { NodePgDatabase } from "drizzle-orm/node-postgres";
import { DATABASE_CONNECTION } from "src/database/database.module";
import * as schema from "../../../database/schema";
import { sql, eq, and, desc, ilike, or } from "drizzle-orm";
import {
    GeneralInformationDto,
    generalInformationSchema,
} from "../dto/general-information.dto";
import Redis from "ioredis";
import {
    StudentListDto,
} from "../dto/get-student-items.dto";
import { CreateResumeDto } from "../dto/update-student.dto";
import { IStudentRepository } from "./student-repository.interface";

export class StudentRepository implements IStudentRepository {
    constructor(
        @Inject(DATABASE_CONNECTION)
        private readonly db: NodePgDatabase<typeof schema>,

        @Inject("REDIS_CLIENT")
        private readonly redisClient: Redis
    ) { }

    // Read
    async getGeneralInformation(): Promise<GeneralInformationDto> {
        const [result] = await this.db
            .select({
                totalStudents: sql<number>`cast(count(*) as int)`,
                studying: sql<number>`cast(count(*) filter (where ${schema.students.student_status} = 'STUDYING') as int)`,
                graduated: sql<number>`cast(count(*) filter (where ${schema.students.student_status} = 'GRADUATED') as int)`,
            })
            .from(schema.students);

        return generalInformationSchema.parse(
            result || { totalStudents: 0, studying: 0, graduated: 0 }
        );
    }

    async getStudentListAdmin(
        page: number,
        limit: number,
        status?: "STUDYING" | "GRADUATED" | "DROPPED_OUT",
        keyword?: string
    ): Promise<StudentListDto> {
        const offset = (page - 1) * limit;

        const cacheKey = `students:page=${page}:limit=${limit}:status=${status ?? "all"}:keyword=${keyword ?? ""}`;

        // 1. Check cache
        const cached = await this.redisClient.get(cacheKey);
        if (cached) {
            return JSON.parse(cached);
        }

        // 2. Condition
        const condition = and(
            status
                ? eq(schema.students.student_status, status)
                : undefined,
            keyword
                ? or(
                    ilike(schema.students.full_name, `%${keyword}%`),
                    ilike(schema.students.student_code, `%${keyword}%`)
                )
                : undefined
        );

        const [students, [{ totalItem }]] = await Promise.all([
            // DATA
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
                    eq(
                        schema.applications.student_id,
                        schema.students.student_id
                    )
                )
                .where(condition)
                .groupBy(schema.students.student_id)
                .orderBy(desc(schema.students.created_at))
                .limit(limit)
                .offset(offset),

            // TOTAL
            this.db
                .select({
                    totalItem: sql<number>`count(*)`.mapWith(Number),
                })
                .from(schema.students)
                .where(condition),
        ]);

        const totalPages = Math.ceil(totalItem / limit);

        const result: StudentListDto = {
            data: students,
            meta: {
                currentPage: page,
                itemsPerPage: limit,
                totalItem,
                totalPages,
            },
        };

        // 3. Save cache (TTL 60s)
        await this.redisClient.set(
            cacheKey,
            JSON.stringify(result),
            "EX",
            60
        );

        return result;
    }

    async getStudentBasicInfo(studentId: number) {
        const [student] = await this.db
            .select({
                studentId: schema.students.student_id,
                fullName: schema.students.full_name,
                studentCode: schema.students.student_code,
                email: schema.students.email_student,
                phone: schema.students.phone,
                createdAt: schema.students.created_at,
                studentStatus: schema.students.student_status,
                currentYear: schema.students.current_year,
                enrollmentYear: schema.students.enrollment_year,
                gpa: schema.students.gpa,
                isOpenToWork: schema.students.is_open_to_work,
                majorName: schema.majors.major_name,
            })
            .from(schema.students)
            .leftJoin(schema.majors, eq(schema.majors.major_id, schema.students.major_id))
            .where(eq(schema.students.student_id, studentId));

        return student;
    }

    async getStudentSkills(studentId: number) {
        const skills = await this.db
            .select({
                skillName: schema.skills.skill_name,
            })
            .from(schema.student_skills)
            .innerJoin(schema.skills, eq(schema.skills.skill_id, schema.student_skills.skill_id))
            .where(eq(schema.student_skills.student_id, studentId));

        return skills.map(s => s.skillName);
    }

    async getStudentResumes(studentId: number) {
        return await this.db
            .select({
                resumeId: schema.student_resumes.resume_id,
                resumeName: schema.student_resumes.resume_name,
                cvUrl: schema.student_resumes.cv_url,
                isDefault: schema.student_resumes.is_default,
            })
            .from(schema.student_resumes)
            .where(eq(schema.student_resumes.student_id, studentId));
    }

    async getStudentApplicationCount(studentId: number): Promise<number> {
        const [result] = await this.db
            .select({
                total: sql<number>`cast(count(${schema.applications.application_id}) as int)`,
            })
            .from(schema.applications)
            .where(eq(schema.applications.student_id, studentId));

        return result?.total ?? 0;
    }

    // Update 
    async updateJobStatus(studentId: number, isOpenToWork: boolean) {
        return await this.db
            .update(schema.students)
            .set({ is_open_to_work: isOpenToWork, updated_at: new Date() })
            .where(eq(schema.students.student_id, studentId))
            .returning();
    }

    async syncStudentSkills(studentId: number, skillIds: number[]) {
        return await this.db.transaction(async (tx) => {
            // Bước 1: Xóa trắng list skill cũ của student này
            await tx
                .delete(schema.student_skills)
                .where(eq(schema.student_skills.student_id, studentId));

            // Bước 2: Insert list skill mới (nếu mảng skillIds không rỗng)
            if (skillIds.length > 0) {
                const valuesToInsert = skillIds.map(skillId => ({
                    student_id: studentId,
                    skill_id: skillId,
                }));
                await tx.insert(schema.student_skills).values(valuesToInsert);
            }
        });
    }

    async addResume(studentId: number, data: CreateResumeDto) {
        return await this.db.transaction(async (tx) => {
            // if (data.isDefault) {
            //     await tx
            //         .update(schema.student_resumes)
            //         .set({ is_default: false })
            //         .where(eq(schema.student_resumes.student_id, studentId));
            // }

            // Insert CV mới
            const [newResume] = await tx
                .insert(schema.student_resumes)
                .values({
                    student_id: studentId,
                    resume_name: data.resumeName,
                    cv_url: data.cvUrl,
                    //is_default: data.isDefault,
                })
                .returning();

            return newResume;
        });
    }

    async setResumeAsDefault(studentId: number, resumeId: number) {
        return await this.db.transaction(async (tx) => {
            // Gỡ mặc định của tất cả CV thuộc về sinh viên này
            await tx
                .update(schema.student_resumes)
                .set({ is_default: false })
                .where(eq(schema.student_resumes.student_id, studentId));

            // Set mặc định cho CV được chọn
            const [updatedResume] = await tx
                .update(schema.student_resumes)
                .set({ is_default: true })
                .where(
                    and(
                        eq(schema.student_resumes.student_id, studentId),
                        eq(schema.student_resumes.resume_id, resumeId)
                    )
                )
                .returning();

            return updatedResume;
        });
    }
}