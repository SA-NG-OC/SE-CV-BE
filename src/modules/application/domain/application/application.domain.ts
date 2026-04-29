import { DomainErrorType } from 'src/common/types/domain-error.enum';
import { ApplicationProps, ApplicationStatus } from './application.props';
import { ApplicationEntity } from './application.entity';
import { CreateApplicationDto } from '../../dto/create-application.dto';

export class ApplicationDomainError extends Error {
    constructor(
        message: string,
        public readonly type: DomainErrorType = DomainErrorType.INVALID_BUSINESS_RULE,
    ) {
        super(message);
        this.name = 'ApplicationDomainError';
    }
}

export class ApplicationDomain {
    private constructor(private props: ApplicationProps) { }

    // =========================================================================
    // FACTORY
    // =========================================================================

    static create(dto: CreateApplicationDto, studentId: number): ApplicationDomain {
        const now = new Date();
        return new ApplicationDomain({
            id: 0,
            jobId: dto.jobId,
            studentId,
            cvUrl: dto.cvUrl,
            coverLetter: dto.coverLetter ?? null,
            status: 'submitted',
            createdAt: now,
            updatedAt: now,
        });
    }

    static fromPersistence(raw: ApplicationEntity): ApplicationDomain {
        return new ApplicationDomain({
            id: raw.application_id,
            jobId: raw.job_id!,
            studentId: raw.student_id!,
            cvUrl: raw.cv_url,
            coverLetter: raw.cover_letter ?? null,
            status: raw.status as ApplicationStatus,
            createdAt: raw.created_at!,
            updatedAt: raw.updated_at!,
        });
    }

    // =========================================================================
    // BEHAVIOR
    // =========================================================================

    scheduleInterview(): void {
        if (this.props.status !== 'submitted') {
            throw new ApplicationDomainError(
                `Không thể chuyển sang phỏng vấn khi đơn đang ở trạng thái "${this.props.status}"`,
            );
        }
        this.props.status = 'interviewing';
        this.props.updatedAt = new Date();
    }

    pass(): void {
        if (this.props.status !== 'interviewing') {
            throw new ApplicationDomainError(
                `Chỉ có thể đánh dấu đạt sau khi phỏng vấn, trạng thái hiện tại: "${this.props.status}"`,
            );
        }
        this.props.status = 'passed';
        this.props.updatedAt = new Date();
    }

    reject(): void {
        this.props.status = 'rejected';
        this.props.updatedAt = new Date();
    }

    changeStatus(newStatus: ApplicationStatus): void {
        switch (newStatus) {
            case 'interviewing': return this.scheduleInterview();
            case 'passed': return this.pass();
            case 'rejected': return this.reject();
            default:
                throw new ApplicationDomainError(
                    `Không hỗ trợ chuyển sang trạng thái "${newStatus}"`,
                );
        }
    }

    // =========================================================================
    // QUERIES
    // =========================================================================

    isActive(): boolean {
        return this.props.status !== 'passed';
    }

    // =========================================================================
    // PERSISTENCE
    // =========================================================================

    toPersistence(): Omit<ApplicationEntity, 'application_id'> {
        return {
            job_id: this.props.jobId,
            student_id: this.props.studentId,
            cv_url: this.props.cvUrl,
            cover_letter: this.props.coverLetter,
            status: this.props.status,
            created_at: this.props.createdAt,
            updated_at: this.props.updatedAt,
        };
    }

    toUpdatePersistence(): Partial<ApplicationEntity> {
        return {
            status: this.props.status,
            updated_at: this.props.updatedAt,
        };
    }

    // =========================================================================
    // GETTERS
    // =========================================================================
    get applicationId() { return this.props.id; }
    get jobId() { return this.props.jobId; }
    get studentId() { return this.props.studentId; }
    get cvUrl() { return this.props.cvUrl; }
    get coverLetter() { return this.props.coverLetter; }
    get status() { return this.props.status; }
    get createdAt() { return this.props.createdAt; }
    get updatedAt() { return this.props.updatedAt; }
}