import { Inject, Injectable } from "@nestjs/common";
import { DATABASE_CONNECTION } from "src/database/database.module";
import * as schema from "src/database/schema";
import { NodePgDatabase } from "drizzle-orm/node-postgres";
import { and, eq, inArray } from "drizzle-orm";
import { IRecommendationRepository } from "./recommendation-repository.interface";

@Injectable()
export class RecommendationRepository implements IRecommendationRepository {
    constructor(
        @Inject(DATABASE_CONNECTION)
        private readonly db: NodePgDatabase<typeof schema>,
    ) { }

    // Lấy thông tin sinh viên
    async getStudentProfile(studentId: number) {
        const [student] = await this.db
            .select({
                student_id: schema.students.student_id,
                full_name: schema.students.full_name,
                major_id: schema.students.major_id,
                gpa: schema.students.gpa,
                desired_salary_min: schema.students.desired_salary_min,
                desired_salary_max: schema.students.desired_salary_max,
                desired_location: schema.students.desired_location,
            })
            .from(schema.students)
            .where(eq(schema.students.student_id, studentId))
            .limit(1);

        if (!student) return null;

        const skills = await this.db
            .select({ skill_id: schema.student_skills.skill_id })
            .from(schema.student_skills)
            .where(eq(schema.student_skills.student_id, studentId));

        return {
            ...student,
            skill_ids: skills
                .map((s) => s.skill_id)
                .filter((id): id is number => id !== null),
        };
    }

    // Lấy thông tin công việc
    async getJobProfile(jobId: number) {
        const [job] = await this.db
            .select({
                job_id: schema.job_postings.job_id,
                job_title: schema.job_postings.job_title,
                job_description: schema.job_postings.job_description,
                requirements: schema.job_postings.requirements,
                salary_min: schema.job_postings.salary_min,
                salary_max: schema.job_postings.salary_max,
                city: schema.job_postings.city,
                category_id: schema.job_postings.category_id,
            })
            .from(schema.job_postings)
            .where(
                and(
                    eq(schema.job_postings.job_id, jobId),
                    //eq(schema.job_postings.status, "approved"),
                    eq(schema.job_postings.is_active, true),
                ),
            )
            .limit(1);

        if (!job) return null;

        const skills = await this.db
            .select({ skill_id: schema.job_required_skills.skill_id })
            .from(schema.job_required_skills)
            .where(eq(schema.job_required_skills.job_id, jobId));

        return {
            ...job,
            skill_ids: skills
                .map((s) => s.skill_id)
                .filter((id): id is number => id !== null),
        };
    }

    async getActiveJobsWithSkillsByIds(jobIds: number[]) {
        if (jobIds.length === 0) return [];

        const [jobs, allSkills] = await Promise.all([
            this.db
                .select({
                    job_id: schema.job_postings.job_id,
                    job_title: schema.job_postings.job_title,
                    company_id: schema.job_postings.company_id,
                    salary_min: schema.job_postings.salary_min,
                    salary_max: schema.job_postings.salary_max,
                    city: schema.job_postings.city,
                    is_salary_negotiable: schema.job_postings.is_salary_negotiable,
                    salary_type: schema.job_postings.salary_type,
                    application_deadline: schema.job_postings.application_deadline,
                    company_name: schema.companies.company_name,
                    logo_url: schema.companies.logo_url,
                    created_at: schema.job_postings.created_at,
                    is_active: schema.job_postings.is_active,
                })
                .from(schema.job_postings)
                .leftJoin(
                    schema.companies,
                    eq(schema.job_postings.company_id, schema.companies.company_id)
                )
                .where(
                    and(
                        inArray(schema.job_postings.job_id, jobIds),
                        eq(schema.job_postings.status, "approved"),
                        eq(schema.job_postings.is_active, true),
                    )
                ),

            this.db
                .select({
                    job_id: schema.job_required_skills.job_id,
                    skill_id: schema.skills.skill_id,
                    skill_name: schema.skills.skill_name,
                })
                .from(schema.job_required_skills)
                .innerJoin(
                    schema.skills,
                    eq(schema.job_required_skills.skill_id, schema.skills.skill_id)
                )
                .where(inArray(schema.job_required_skills.job_id, jobIds)),
        ]);

        const skillMap = new Map<number, { skill_id: number; skill_name: string }[]>();
        for (const s of allSkills) {
            if (s.job_id) {
                if (!skillMap.has(s.job_id)) skillMap.set(s.job_id, []);
                skillMap.get(s.job_id)!.push({
                    skill_id: s.skill_id,
                    skill_name: s.skill_name
                });
            }
        }

        return jobs.map((j) => ({
            ...j,
            skills: skillMap.get(j.job_id) ?? []
        }));
    }

    async getOpenStudentsWithSkillsByIds(studentIds: number[]) {
        if (studentIds.length === 0) return [];

        const students = await this.db
            .select({
                student_id: schema.students.student_id,
                full_name: schema.students.full_name,
                avatar_url: schema.students.avatar_url,
                gpa: schema.students.gpa,
                current_year: schema.students.current_year,
                student_status: schema.students.student_status,
                desired_salary_min: schema.students.desired_salary_min,
                desired_salary_max: schema.students.desired_salary_max,
                desired_location: schema.students.desired_location,
                major_id: schema.students.major_id,
                major_name: schema.majors.major_name,
                created_at: schema.students.created_at,
            })
            .from(schema.students)
            .leftJoin(schema.majors, eq(schema.students.major_id, schema.majors.major_id))
            .where(
                and(
                    inArray(schema.students.student_id, studentIds),
                    eq(schema.students.is_open_to_work, true),
                )
            );

        const allSkills = await this.db
            .select({
                student_id: schema.student_skills.student_id,
                skill_id: schema.skills.skill_id,
                skill_name: schema.skills.skill_name,
            })
            .from(schema.student_skills)
            .innerJoin(
                schema.skills,
                eq(schema.student_skills.skill_id, schema.skills.skill_id)
            )
            .where(inArray(schema.student_skills.student_id, studentIds));

        const skillMap = new Map<number, { skill_id: number; skill_name: string }[]>();
        for (const s of allSkills) {
            if (s.student_id) {
                if (!skillMap.has(s.student_id)) {
                    skillMap.set(s.student_id, []);
                }
                skillMap.get(s.student_id)!.push({
                    skill_id: s.skill_id,
                    skill_name: s.skill_name,
                });
            }
        }

        return students.map((s) => ({
            ...s,
            skills: skillMap.get(s.student_id) ?? [],
        }));
    }
}