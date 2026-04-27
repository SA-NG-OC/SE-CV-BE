import { toRelativeTime } from "src/utils/relative-time.util";
import { JobRecommendationResponse } from "../types/recommendation.types";


export class JobRecommendationMapper {
    static toResponse(job: any): JobRecommendationResponse {
        return {
            jobId: job.job_id,
            companyId: job.company_id,
            companyName: job.company_name,
            logoUrl: job.logo_url,
            jobTitle: job.job_title,
            city: job.city,
            salaryMin: job.salary_min,
            salaryMax: job.salary_max,
            salaryType: job.salary_type,
            isSalaryNegotiable: job.is_salary_negotiable,
            postedAt: toRelativeTime(new Date(job.created_at)),
            skills: (job.skills ?? []).map((s: any) => ({
                skillId: s.skill_id,
                skillName: s.skill_name,
            })),
            ruleScore: job.rule_score,
            vectorScore: job.vector_score,
            finalScore: job.final_score,
            matchReasons: job.match_reasons ?? [],
        };
    }

    static toList(jobs: any[]): JobRecommendationResponse[] {
        return jobs.map(this.toResponse);
    }
}