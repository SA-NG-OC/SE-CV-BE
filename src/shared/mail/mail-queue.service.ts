// mail/mail-queue.service.ts
import { Injectable } from '@nestjs/common';
import { InjectQueue } from '@nestjs/bullmq';
import { Queue } from 'bullmq';
import { MAIL_JOBS, QUEUE_NAMES } from 'src/common/constants/queue.constants';


@Injectable()
export class MailQueueService {
    constructor(
        @InjectQueue(QUEUE_NAMES.MAIL) private readonly mailQueue: Queue,
    ) { }

    async sendVerificationEmail(email: string, token: string) {
        await this.mailQueue.add(
            MAIL_JOBS.SEND_VERIFICATION,
            { email, token },
            {
                attempts: 3,
                backoff: {
                    type: 'exponential',
                    delay: 5000,
                },
                removeOnComplete: true,
                removeOnFail: false,
            },
        );
    }

    async sendResetPasswordEmail(email: string, otp: string) {
        await this.mailQueue.add(
            MAIL_JOBS.SEND_RESET_PASSWORD,
            { email, otp },
            {
                attempts: 3,
                backoff: { type: 'exponential', delay: 5000 },
                removeOnComplete: true,
            },
        );
    }

    async sendWelcomeEmail(email: string, name: string) {
        await this.mailQueue.add(
            MAIL_JOBS.SEND_WELCOME,
            { email, name },
            {
                delay: 2000,
                attempts: 2,
                removeOnComplete: true,
            },
        );
    }
}