import { OnWorkerEvent, Processor, WorkerHost } from "@nestjs/bullmq";
import { Logger } from "@nestjs/common";
import { MAIL_JOBS, QUEUE_NAMES } from "src/common/constants/queue.constants";
import { MailService } from "./mail.service";
import { Job } from "bullmq";

@Processor(QUEUE_NAMES.MAIL)
export class MailProcessor extends WorkerHost {
    private readonly logger = new Logger(MailProcessor.name);

    constructor(private readonly mailService: MailService) {
        super();
    }

    async process(job: Job) {
        this.logger.log(`Đang xử lý job [${job.name}] id=${job.id}`);

        switch (job.name) {
            case MAIL_JOBS.SEND_VERIFICATION:
                return this.handleSendVerification(job);

            case MAIL_JOBS.SEND_RESET_PASSWORD:
                return this.handleSendOtp(job);

            case MAIL_JOBS.SEND_WELCOME:
                return this.handleSendWelcome(job);

            default:
                throw new Error(`Job không xác định: ${job.name}`);
        }
    }

    private async handleSendVerification(job: Job) {
        const { email, token } = job.data;
        await this.mailService.sendVerificationEmail({ email, token });
        return { success: true, email };
    }

    private async handleSendOtp(job: Job) {
        const { email, otp } = job.data;
        await this.mailService.sendOtp({ email: email, name: email },
            otp,);
        return { success: true, email };
    }

    private async handleSendWelcome(job: Job) {
        const { email, name } = job.data;
        await this.mailService.sendWelcome({ email: email, name: name });
        return { success: true, email };
    }

    // --- Event listeners ---

    @OnWorkerEvent('completed')
    onCompleted(job: Job) {
        this.logger.log(`✅ Job [${job.name}] id=${job.id} hoàn thành`);
    }

    @OnWorkerEvent('failed')
    onFailed(job: Job, error: Error) {
        this.logger.error(
            `❌ Job [${job.name}] id=${job.id} thất bại: ${error.message}`
        );
    }

    @OnWorkerEvent('active')
    onActive(job: Job) {
        this.logger.debug(`⚙️  Job [${job.name}] id=${job.id} bắt đầu xử lý`);
    }
}