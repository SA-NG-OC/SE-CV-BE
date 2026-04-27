export const RECOMMENDATION_REPOSITORY = "RECOMMENDATION_REPOSITORY";

export interface IRecommendationRepository {
    getStudentProfile(studentId: number);

    getJobProfile(jobId: number);

    getActiveJobsWithSkillsByIds(jobIds: number[]);

    getOpenStudentsWithSkillsByIds(studentIds: number[]);
}