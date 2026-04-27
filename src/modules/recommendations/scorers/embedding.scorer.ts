import { Inject, Injectable, Logger } from "@nestjs/common";
import { EmbeddingRepository } from "../embedding/repositories/embedding.repository";
import { RecommendationRepository } from "../repositories/recommendation.repository";
import { ScoreResult } from "../types/recommendation.types";
import { OpenAIEmbeddingService } from "src/common/services/openai-embedding.service";
import { EMBEDDING_REPOSITORY } from "../embedding/repositories/embedding-repository.interface";
import { RECOMMENDATION_REPOSITORY } from "../repositories/recommendation-repository.interface";

@Injectable()
export class EmbeddingScorer {
    private readonly logger = new Logger(EmbeddingScorer.name);

    constructor(
        @Inject(EMBEDDING_REPOSITORY)
        private readonly embeddingRepo: EmbeddingRepository,
        @Inject(RECOMMENDATION_REPOSITORY)
        private readonly recommendationRepo: RecommendationRepository,
        private readonly openaiEmbedding: OpenAIEmbeddingService,
    ) { }

    async scoreJobsForStudent(studentId: number, limit: number): Promise<ScoreResult[]> {
        let embedding = await this.embeddingRepo.getStudentEmbedding(studentId);

        // 1. TRƯỜNG HỢP THIẾU: Tự động tạo mới sử dụng logic từ Service
        if (!embedding) {
            this.logger.log(`Embedding missing for student ${studentId}. Generating now...`);
            const student = await this.recommendationRepo.getStudentProfile(studentId);

            if (!student) return [];

            const textToEmbed = this.openaiEmbedding.buildStudentText(student);
            const contentHash = this.openaiEmbedding.hashContent(textToEmbed);

            embedding = await this.openaiEmbedding.generate(textToEmbed);

            await this.embeddingRepo.upsertStudentEmbedding(studentId, embedding, contentHash);
        }

        // 2. Tìm kiếm các Job tương đồng bằng pgvector
        const candidates = await this.embeddingRepo.findSimilarJobs(embedding, limit);

        return candidates.map((c) => ({
            id: c.job_id,
            score: c.similarity,
            reasons: [
                {
                    type: "semanticMatch" as const,
                    similarity: Math.round(c.similarity * 100) / 100,
                    label: "Phù hợp với định hướng và hồ sơ của bạn"
                },
            ],
        }));
    }

    async scoreStudentsForJob(jobId: number, limit: number): Promise<ScoreResult[]> {
        let embedding = await this.embeddingRepo.getJobEmbedding(jobId);

        // 1. TRƯỜNG HỢP THIẾU: Tự động tạo mới
        if (!embedding) {
            this.logger.log(`[embedding.scorer.ts] Embedding missing for job ${jobId}. Generating now...`);
            const job = await this.recommendationRepo.getJobProfile(jobId);

            if (!job) return [];

            const textToEmbed = this.openaiEmbedding.buildJobText(job);
            const contentHash = this.openaiEmbedding.hashContent(textToEmbed);

            embedding = await this.openaiEmbedding.generate(textToEmbed);

            // Lưu vào bảng job_embeddings
            await this.embeddingRepo.upsertJobEmbedding(jobId, embedding, contentHash);
        }

        // 2. Tìm kiếm sinh viên tương đồng
        const candidates = await this.embeddingRepo.findSimilarStudents(embedding, limit);

        return candidates.map((c) => ({
            id: c.student_id,
            score: c.similarity,
            reasons: [
                {
                    type: "semanticMatch" as const,
                    similarity: Math.round(c.similarity * 100) / 100,
                    label: "Hồ sơ ứng viên rất gần với yêu cầu công việc"
                },
            ],
        }));
    }
}