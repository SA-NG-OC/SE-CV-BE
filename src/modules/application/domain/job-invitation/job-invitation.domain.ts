import { DomainErrorType } from 'src/common/types/domain-error.enum';
import { InvitationStatus, JobInvitationProps } from './job-invitation.props';
// Giả định bạn có file entity cho bảng mới
import { JobInvitationEntity } from './job-invitation.entity';
import { CreateJobInvitationDto } from '../../dto/create-job-invitation.dto';

export class InvitationDomainError extends Error {
    constructor(
        message: string,
        public readonly type: DomainErrorType = DomainErrorType.INVALID_BUSINESS_RULE,
    ) {
        super(message);
        this.name = 'InvitationDomainError';
    }
}

export class JobInvitationDomain {
    private constructor(private props: JobInvitationProps) { }

    // =========================================================================
    // FACTORY
    // =========================================================================

    static create(data: CreateJobInvitationDto): JobInvitationDomain {
        const now = new Date();
        return new JobInvitationDomain({
            id: 0,
            jobId: data.jobId,
            studentId: data.studentId,
            message: data.message ?? null,
            status: 'pending',
            createdAt: now,
            updatedAt: now,
        });
    }

    static fromPersistence(raw: JobInvitationEntity): JobInvitationDomain {
        return new JobInvitationDomain({
            id: raw.invitation_id,
            jobId: raw.job_id,
            studentId: raw.student_id,
            message: raw.message,
            status: raw.status as InvitationStatus,
            createdAt: raw.created_at,
            updatedAt: raw.updated_at,
        });
    }

    // =========================================================================
    // BEHAVIOR
    // =========================================================================

    accept(): void {
        if (this.props.status !== 'pending') {
            throw new InvitationDomainError(
                `Không thể chấp nhận lời mời đã ở trạng thái "${this.props.status}"`,
            );
        }
        this.props.status = 'accepted';
        this.props.updatedAt = new Date();
    }

    reject(): void {
        if (this.props.status !== 'pending') {
            throw new InvitationDomainError(
                `Không thể từ chối lời mời đã ở trạng thái "${this.props.status}"`,
            );
        }
        this.props.status = 'rejected';
        this.props.updatedAt = new Date();
    }

    expire(): void {
        this.props.status = 'expired';
        this.props.updatedAt = new Date();
    }

    pending(): void {
        this.props.status = 'pending';
        this.props.updatedAt = new Date();
    }

    updateMessage(message: string | null) {
        this.props.message = message;
    }

    // =========================================================================
    // PERSISTENCE
    // =========================================================================

    toPersistence(): Omit<JobInvitationEntity, 'invitation_id'> {
        return {
            job_id: this.props.jobId,
            student_id: this.props.studentId,
            message: this.props.message,
            status: this.props.status,
            created_at: this.props.createdAt,
            updated_at: this.props.updatedAt,
        };
    }

    // =========================================================================
    // GETTERS
    // =========================================================================
    get invitationId() { return this.props.id; }
    get jobId() { return this.props.jobId; }
    get studentId() { return this.props.studentId; }
    get message() { return this.props.message; }
    get status() { return this.props.status; }
    get createdAt() { return this.props.createdAt; }
}