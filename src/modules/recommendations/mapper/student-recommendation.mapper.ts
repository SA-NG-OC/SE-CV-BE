import { StudentRecommendationResponse } from "../types/recommendation.types";

export class StudentRecommendationMapper {
    static toResponse(s: any): StudentRecommendationResponse {
        return {
            studentId: s.student_id,
            fullName: s.full_name,
            avatarUrl: s.avatar_url,
            currentYear: s.current_year,
            gpa: String(s.gpa),
            isOpenToWork: true,
            studentStatus: s.student_status,
            skills: (s.skills ?? []).map((skill) => skill.skill_name),
            ruleScore: s.rule_score,
            vectorScore: s.vector_score,
            finalScore: s.final_score,
            matchReasons: s.match_reasons ?? [],
        };
    }

    static toList(data: any): StudentRecommendationResponse[] {
        return data.map(this.toResponse);
    }
}