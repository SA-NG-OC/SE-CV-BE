import { Inject, Injectable, NotFoundException } from "@nestjs/common";
import { RuleBasedScorer } from "./scorers/rule-based.scorer";
import { EmbeddingScorer } from "./scorers/embedding.scorer";
import { HybridMerger } from "./merger/hybrid-merger";
import { GetJobRecommendationsDto, GetStudentRecommendationsDto } from "./dto/get-recommendations.dto";
import { JobRecommendationResponse, StudentRecommendationResponse } from "./types/recommendation.types";
import { JobRecommendationMapper } from "./mapper/job-recommendation.mapper";
import { StudentRecommendationMapper } from "./mapper/student-recommendation.mapper";
import { type IRecommendationRepository, RECOMMENDATION_REPOSITORY } from "./repositories/recommendation-repository.interface";

@Injectable()
export class RecommendationsService {
  constructor(
    @Inject(RECOMMENDATION_REPOSITORY)
    private readonly recRepo: IRecommendationRepository,
    private readonly ruleScorer: RuleBasedScorer,
    private readonly embeddingScorer: EmbeddingScorer,
    private readonly merger: HybridMerger
  ) { }

  async getJobRecommendationsForStudent(
    dto: GetJobRecommendationsDto,
    studentId: number
  ): Promise<JobRecommendationResponse[]> {
    const { limit = 10, alpha = 0.6 } = dto;

    const [student, vectorResults] = await Promise.all([
      this.recRepo.getStudentProfile(studentId),
      this.embeddingScorer.scoreJobsForStudent(studentId, limit * 3),
    ]);

    if (!student) throw new NotFoundException("Không tìm thấy thông tin sinh viên");
    if (vectorResults.length === 0) return [];

    const candidateJobIds = vectorResults.map((v) => v.id);
    const jobs = await this.recRepo.getActiveJobsWithSkillsByIds(candidateJobIds);

    if (jobs.length === 0) return [];

    const ruleResults = this.ruleScorer.scoreJobsForStudent({
      student: {
        ...student,
        skill_ids: student.skill_ids
      },
      jobs
    });

    const merged = this.merger.merge(ruleResults, vectorResults, {
      alpha,
      topK: limit,
    });

    const jobMap = new Map(jobs.map((j) => [j.job_id, j]));

    const rawResults = merged
      .filter((m) => jobMap.has(m.id))
      .map((m) => {
        const job = jobMap.get(m.id)!;

        return {
          ...job,
          job_id: m.id,
          rule_score: Math.round(m.rule_score * 100),
          vector_score: Math.round(m.vector_score * 100),
          final_score: Math.round(m.final_score * 100),
          match_reasons: m.reasons,
        };
      });

    return JobRecommendationMapper.toList(rawResults);
  }

  async getStudentRecommendationsForJob(
    dto: GetStudentRecommendationsDto,
  ): Promise<StudentRecommendationResponse[]> {
    const { jobId, limit = 10, alpha = 0.6 } = dto;

    const [job, vectorResults] = await Promise.all([
      this.recRepo.getJobProfile(jobId),
      this.embeddingScorer.scoreStudentsForJob(jobId, limit * 3),
    ]);

    if (!job) throw new NotFoundException("Không tìm thấy thông tin công việc");
    if (vectorResults.length === 0) return [];

    const candidateStudentIds = vectorResults.map((v) => v.id);
    const students = await this.recRepo.getOpenStudentsWithSkillsByIds(candidateStudentIds);

    if (students.length === 0) return [];

    const ruleResults = this.ruleScorer.scoreStudentsForJob({ job, students });

    const merged = this.merger.merge(ruleResults, vectorResults, {
      alpha,
      topK: limit,
    });

    const studentMap = new Map(students.map((s) => [s.student_id, s]));
    const rawResults = merged
      .filter((m) => studentMap.has(m.id))
      .map((m) => {
        const s = studentMap.get(m.id)!;

        return {
          ...s,
          student_id: m.id,
          rule_score: Math.round(m.rule_score * 100),
          vector_score: Math.round(m.vector_score * 100),
          final_score: Math.round(m.final_score * 100),
          match_reasons: m.reasons,
        };
      });

    return StudentRecommendationMapper.toList(rawResults);
  }
}