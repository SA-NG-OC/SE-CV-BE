import { InjectQueue } from '@nestjs/bullmq';
import { Queue } from 'bullmq';
import { Injectable } from '@nestjs/common';
import { QUEUE_NAMES, EMBEDDING_JOBS } from 'src/common/constants/queue.constants';

@Injectable()
export class EmbeddingQueueService {
    constructor(
        @InjectQueue(QUEUE_NAMES.EMBEDDING) private readonly embeddingQueue: Queue,
    ) { }

    async addJobEmbeddingTask(jobId: number) {
        await this.embeddingQueue.add(
            EMBEDDING_JOBS.GENERATE_JOB,
            { jobId },
            {
                attempts: 5,
                backoff: {
                    type: 'exponential',
                    delay: 1000,
                },
                removeOnComplete: true,
                priority: 1,
            }
        )
    }

    async addStudentEmbeddingTask(studentId: number) {
        await this.embeddingQueue.add(
            EMBEDDING_JOBS.GENERATE_STUDENT,
            { studentId },
            {
                attempts: 3,
                backoff: { type: 'exponential', delay: 1000 },
                removeOnComplete: true,
            },
        );
    }
}