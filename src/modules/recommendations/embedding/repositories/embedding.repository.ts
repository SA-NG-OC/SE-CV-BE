import { Inject, Injectable } from "@nestjs/common";
import { NodePgDatabase } from "drizzle-orm/node-postgres";
import { eq, sql } from "drizzle-orm";
import { DATABASE_CONNECTION } from "src/database/database.module";
import * as schema from "src/database/schema";
import { IEmbeddingRepository } from "./embedding-repository.interface";

@Injectable()
export class EmbeddingRepository implements IEmbeddingRepository {
    constructor(
        @Inject(DATABASE_CONNECTION)
        private readonly db: NodePgDatabase<typeof schema>,
    ) { }

    async findSimilarJobs(
        studentEmbedding: number[],
        limit: number,
    ): Promise<Array<{ job_id: number; similarity: number }>> {
        const vectorStr = `[${studentEmbedding.join(",")}]`;

        const result = await this.db.execute(sql`
            SELECT
                je.job_id,
                1 - (je.embedding <=> ${vectorStr}::vector) AS similarity
            FROM job_embeddings je
            INNER JOIN job_postings jp ON jp.job_id = je.job_id
            WHERE jp.status = 'approved' AND jp.is_active = true
            ORDER BY je.embedding <=> ${vectorStr}::vector
            LIMIT ${limit}
        `);

        return result.rows as Array<{ job_id: number; similarity: number }>;
    }

    async findSimilarStudents(
        jobEmbedding: number[],
        limit: number,
    ): Promise<Array<{ student_id: number; similarity: number }>> {
        const vectorStr = `[${jobEmbedding.join(",")}]`;

        const result = await this.db.execute(sql`
            SELECT
                se.student_id,
                1 - (se.embedding <=> ${vectorStr}::vector) AS similarity
            FROM student_embeddings se
            INNER JOIN students s ON s.student_id = se.student_id
            WHERE s.is_open_to_work = true
            ORDER BY se.embedding <=> ${vectorStr}::vector
            LIMIT ${limit}
        `);

        return result.rows as Array<{ student_id: number; similarity: number }>;
    }

    async getJobEmbedding(jobId: number): Promise<number[] | null> {
        const [row] = await this.db
            .select({ embedding: schema.job_embeddings.embedding })
            .from(schema.job_embeddings)
            .where(eq(schema.job_embeddings.job_id, jobId))
            .limit(1);
        return row?.embedding ?? null;
    }

    async getStudentEmbedding(studentId: number): Promise<number[] | null> {
        const [row] = await this.db
            .select({ embedding: schema.student_embeddings.embedding })
            .from(schema.student_embeddings)
            .where(eq(schema.student_embeddings.student_id, studentId))
            .limit(1);
        return row?.embedding ?? null;
    }

    async upsertJobEmbedding(
        jobId: number,
        embedding: number[],
        contentHash: string,
    ) {
        await this.db.execute(sql`
            INSERT INTO job_embeddings (job_id, embedding, content_hash)
            VALUES (${jobId}, ${`[${embedding.join(",")}]`}::vector, ${contentHash})
            ON CONFLICT (job_id) DO UPDATE
                SET embedding = EXCLUDED.embedding,
                    content_hash = EXCLUDED.content_hash,
                    updated_at = NOW()
        `);
    }

    async upsertStudentEmbedding(
        studentId: number,
        embedding: number[],
        contentHash: string,
    ) {
        await this.db.execute(sql`
            INSERT INTO student_embeddings (student_id, embedding, content_hash)
            VALUES (${studentId}, ${`[${embedding.join(",")}]`}::vector, ${contentHash})
            ON CONFLICT (student_id) DO UPDATE
                SET embedding = EXCLUDED.embedding,
                    content_hash = EXCLUDED.content_hash,
                    updated_at = NOW()
        `);
    }
}