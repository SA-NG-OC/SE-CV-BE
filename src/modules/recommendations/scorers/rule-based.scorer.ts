import { Injectable } from "@nestjs/common";
import { IScorer } from "../types/scorer.interface";
import { MatchReason, ScoreResult } from "../types/recommendation.types";

// Context tính score cho student
export interface JobScoringContext {
    student: {
        skill_ids: number[]; // Tạm thời giữ nguyên theo yêu cầu của bạn
        desired_salary_min: number | null;
        desired_salary_max: number | null;
        desired_location: string | null;
        gpa: string | null;
        major_id?: number | null;
    };
    jobs: Array<{
        job_id: number;
        skills: Array<{ skill_id: number; skill_name: string }>;
        salary_min: number | null;
        salary_max: number | null;
        city: string | null;
        created_at?: Date | null;
        is_active?: boolean;
    }>;
}

export interface StudentScoringContext {
    job: {
        skill_ids: number[];
        salary_min: number | null;
        salary_max: number | null;
        city: string | null;
    };
    students: Array<{
        student_id: number;
        skills: Array<{ skill_id: number; skill_name: string }>;
        desired_salary_min: number | null;
        desired_salary_max: number | null;
        desired_location: string | null;
        gpa: string | null;
    }>;
}

@Injectable()
export class RuleBasedScorer {
    private readonly WEIGHTS = {
        skill: 0.50,
        salary: 0.25,
        location: 0.15,
        gpa: 0.10,
    }

    scoreJobsForStudent(ctx: JobScoringContext): ScoreResult[] {
        return ctx.jobs.map((job) => {
            const reasons: MatchReason[] = [];
            let score = 0;
            // 1. Skill match 
            const matched = job.skills.filter((skill) =>
                ctx.student.skill_ids.includes(skill.skill_id));

            if (job.skills.length > 0) {
                const skillScore = matched.length / job.skills.length;
                score += skillScore * this.WEIGHTS.skill;

                if (matched.length > 0) {
                    reasons.push({
                        type: "skillMatch",
                        matched: matched.map((s) => ({
                            skillId: s.skill_id,
                            skillName: s.skill_name,
                        })),
                    });
                }
            }
            else {
                // Nếu không có yêu cầu về skill cụ thể thì phần này được điểm tối đa
                score += this.WEIGHTS.skill;
            }

            // 2. Salary overlap
            const salaryScore = this.calcSalaryOverlap(
                ctx.student.desired_salary_min,
                ctx.student.desired_salary_max,
                job.salary_min,
                job.salary_max,
            );
            score += salaryScore * this.WEIGHTS.salary;
            if (salaryScore > 0.5) {
                reasons.push({
                    type: "salaryMatch",
                    overlapPct: Math.round(salaryScore * 100),
                });
            }

            //3. Location
            if (
                ctx.student.desired_location &&
                job.city &&
                job.city
                    .toLowerCase()
                    .includes(ctx.student.desired_location.toLowerCase())
            ) {
                score += this.WEIGHTS.location;
                reasons.push({ type: "locationMatch" });
            }

            //4. GPA
            const gpa = parseFloat(ctx.student.gpa ?? "0");
            if (gpa >= 3.2) score += this.WEIGHTS.gpa;
            else if (gpa >= 2.8) score += this.WEIGHTS.gpa * 0.5;

            return { id: job.job_id, score, reasons };
        })
    }

    scoreStudentsForJob(ctx: StudentScoringContext): ScoreResult[] {
        return ctx.students.map((student) => {
            const reasons: MatchReason[] = [];
            let score = 0;

            // 1. Skill match
            const studentSkillIds = student.skills.map(s => s.skill_id);

            const matched = ctx.job.skill_ids.filter(id =>
                studentSkillIds.includes(id)
            );
            if (ctx.job.skill_ids.length > 0) {
                const skillScore = matched.length / ctx.job.skill_ids.length;
                score += skillScore * this.WEIGHTS.skill;
                if (matched.length > 0) {
                    reasons.push({
                        type: "skillMatch",
                        matched: matched.map((id) => ({
                            skillId: id,
                        })),
                    });
                }
            } else {
                score += this.WEIGHTS.skill;
            }

            // 2. Salary overlap (job offer vs student expectation)
            const salaryScore = this.calcSalaryOverlap(
                student.desired_salary_min,
                student.desired_salary_max,
                ctx.job.salary_min,
                ctx.job.salary_max,
            );
            score += salaryScore * this.WEIGHTS.salary;
            if (salaryScore > 0.5) {
                reasons.push({
                    type: "salaryMatch",
                    overlapPct: Math.round(salaryScore * 100),
                });
            }

            // 3. Location
            if (
                student.desired_location &&
                ctx.job.city &&
                ctx.job.city
                    .toLowerCase()
                    .includes(student.desired_location.toLowerCase())
            ) {
                score += this.WEIGHTS.location;
                reasons.push({ type: "locationMatch" });
            }

            // 4. GPA bonus
            const gpa = parseFloat(student.gpa ?? "0");
            if (gpa >= 3.2) score += this.WEIGHTS.gpa;
            else if (gpa >= 2.8) score += this.WEIGHTS.gpa * 0.5;

            return { id: student.student_id, score, reasons };
        });
    }

    private calcSalaryOverlap(
        sMin: number | null,
        sMax: number | null,
        jMin: number | null,
        jMax: number | null,
    ): number {
        if (!sMin && !sMax) return 1.0;
        if (!jMin && !jMax) return 0.5;

        const studMin = sMin ?? 0;
        const studMax = sMax ?? Number.MAX_SAFE_INTEGER;
        const jobMin = jMin ?? 0;
        const jobMax = jMax ?? Number.MAX_SAFE_INTEGER;

        if (jobMax < studMin) return 0;

        if (jobMin >= studMax) return 1.0;

        const overlapStart = Math.max(studMin, jobMin);
        const overlapEnd = Math.min(studMax, jobMax);
        const overlap = Math.max(0, overlapEnd - overlapStart);

        const studRange = studMax - studMin;

        if (studRange <= 0) {
            return (studMin >= jobMin && studMin <= jobMax) ? 1.0 : 0.1;
        }

        let score = overlap / studRange;

        if (jobMin >= studMin) {
            score = Math.max(score, 0.7);
        }

        return Math.min(score, 1.0);
    }
}