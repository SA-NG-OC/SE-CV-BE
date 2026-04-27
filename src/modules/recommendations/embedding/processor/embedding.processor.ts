import { OnWorkerEvent, Processor, WorkerHost } from "@nestjs/bullmq";
import { Inject, Logger } from "@nestjs/common";
import { Job } from "bullmq";
import { QUEUE_NAMES, EMBEDDING_JOBS } from "src/common/constants/queue.constants";
import { RecommendationRepository } from "../../repositories/recommendation.repository";
import { EmbeddingRepository } from "../repositories/embedding.repository";
import { OpenAIEmbeddingService } from "src/common/services/openai-embedding.service";
import { RECOMMENDATION_REPOSITORY } from "../../repositories/recommendation-repository.interface";
import { EMBEDDING_REPOSITORY } from "../repositories/embedding-repository.interface";

@Processor(QUEUE_NAMES.EMBEDDING, {
    concurrency: 2,
})
export class EmbeddingProcessor extends WorkerHost {
    private readonly logger = new Logger(EmbeddingProcessor.name);

    constructor(
        @Inject(RECOMMENDATION_REPOSITORY)
        private readonly recommendationRepo: RecommendationRepository,
        @Inject(EMBEDDING_REPOSITORY)
        private readonly embeddingRepo: EmbeddingRepository,
        private readonly embeddingService: OpenAIEmbeddingService,
    ) {
        super();
    }

    async process(job: Job) {
        switch (job.name) {
            case EMBEDDING_JOBS.GENERATE_JOB:
                return this.handleJobEmbedding(job);
            case EMBEDDING_JOBS.GENERATE_STUDENT:
                return this.handleStudentEmbedding(job);
            default:
                throw new Error(`${job.name} không tồn tại`);
        }
    }

    private async handleJobEmbedding(job: Job<{ jobId: number }>) {
        const { jobId } = job.data;
        const jobData = await this.recommendationRepo.getJobProfile(jobId);

        const text = this.embeddingService.buildJobText(jobData);
        const hash = this.embeddingService.hashContent(text);

        const vector = await this.embeddingService.generate(text);

        await this.embeddingRepo.upsertJobEmbedding(jobId, vector, hash);
        return { jobId, status: 'complete' };
    }

    private async handleStudentEmbedding(job: Job<{ studentId: number }>) {
        const { studentId } = job.data;
        const student = await this.recommendationRepo.getStudentProfile(studentId);
        if (!student) throw new Error(`Không tìm thấy dữ liệu`);

        const text = this.embeddingService.buildStudentText(student);
        const hash = this.embeddingService.hashContent(text);
        const vector = await this.embeddingService.generate(text);

        await this.embeddingRepo.upsertStudentEmbedding(studentId, vector, hash);

        return { studentId, status: 'completed' };
    }

    @OnWorkerEvent('failed')
    onFailed(job: Job, error: Error) {
        this.logger.error(`❌ Embedding failed [${job.name}] id=${job.id}: ${error.message}`);
    }
}