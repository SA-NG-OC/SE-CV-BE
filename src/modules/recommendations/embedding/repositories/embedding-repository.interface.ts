export const EMBEDDING_REPOSITORY = 'EMBEDDING_REPOSITORY';

export interface IEmbeddingRepository {
    findSimilarJobs(
        studentEmbedding: number[],
        limit: number
    )

    findSimilarStudents(
        jobEmbedding: number[],
        limit: number
    )

    getJobEmbedding(jobId: number)

    getStudentEmbedding(studentId: number)

    upsertJobEmbedding(
        jobId: number,
        embedding: number[],
        contentHash: string
    ): Promise<void>;

    upsertStudentEmbedding(
        studentId: number,
        embedding: number[],
        contentHash: string
    ): Promise<void>;
}