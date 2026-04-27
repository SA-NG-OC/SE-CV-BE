export interface JobRecommendationResponse {
    jobId: number;
    companyId: number;
    companyName: string;
    logoUrl: string;
    jobTitle: string;
    city: string;
    salaryMin: number;
    salaryMax: number;
    salaryType: string;
    isSalaryNegotiable: boolean;
    postedAt: string;

    skills: {
        skillId: number;
        skillName: string;
    }[];
    ruleScore: number;
    vectorScore: number;
    finalScore: number;

    matchReasons: string[];
}

export interface StudentRecommendationResponse {
    studentId: number;
    fullName: string;
    avatarUrl: string | null;
    currentYear: number | null;
    gpa: string | null;
    isOpenToWork: boolean;
    skills: string[];
    studentStatus: string;
    ruleScore: number;
    vectorScore: number;
    finalScore: number;

    matchReasons: MatchReason[];
}

export type MatchReason =
    | { type: "skillMatch"; matched: object[] | number[] }
    | { type: "salaryMatch"; overlapPct: number }
    | { type: "locationMatch" }
    | { type: "semanticMatch"; similarity: number };

export interface ScoreResult {
    id: number;
    score: number;
    reasons: MatchReason[];
}