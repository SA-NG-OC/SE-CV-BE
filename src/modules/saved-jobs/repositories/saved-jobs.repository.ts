import { Inject, Injectable } from "@nestjs/common";
import { ISavedJobRepository } from "./saved-jobs-repository.interface";
import { DATABASE_CONNECTION } from "src/database/database.module";
import { NodePgDatabase } from "drizzle-orm/node-postgres";
import { and, eq } from "drizzle-orm";
import * as schema from '../../../database/schema';

@Injectable()
export class SavedJobRepository implements ISavedJobRepository {
    constructor(
        @Inject(DATABASE_CONNECTION)
        private readonly db: NodePgDatabase<typeof schema>,
    ) { }

    async saveJob(studentId: number, jobId: number): Promise<void> {
        await this.db
            .insert(schema.saved_jobs)
            .values({
                student_id: studentId,
                job_id: jobId,
            })
            .onConflictDoNothing();
    }

    async unsaveJob(studentId: number, jobId: number): Promise<void> {
        await this.db
            .delete(schema.saved_jobs)
            .where(
                and(
                    eq(schema.saved_jobs.student_id, studentId),
                    eq(schema.saved_jobs.job_id, jobId),
                ),
            );
    }

    async checkSaved(studentId: number, jobId: number): Promise<boolean> {
        const result = await this.db
            .select({ id: schema.saved_jobs.saved_job_id })
            .from(schema.saved_jobs)
            .where(
                and(
                    eq(schema.saved_jobs.student_id, studentId),
                    eq(schema.saved_jobs.job_id, jobId),
                ),
            )
            .limit(1);

        return result.length > 0;
    }

    async getJobSaved(studentId: number): Promise<number[]> {
        const data = await this.db
            .select({ id: schema.saved_jobs.job_id })
            .from(schema.saved_jobs)
            .where(eq(schema.saved_jobs.student_id, studentId));
        return data.map(item => item.id).filter((id): id is number => id !== null)
    }
}