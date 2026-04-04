import { NotFoundException } from '@nestjs/common';
import { CreateJobPostingDto } from "../dto/create-job-posting.dto";
import { UpdateJobPostingDto } from "../dto/update-job-posting.dto";
import { JobPostingEntity } from "./job-posting.entity";
import { DomainErrorType } from 'src/common/types/domain-error.enum';
import { JobPostingProps, JobPostingStatus } from './job-posting.props';

export class JobPostingDomainError extends Error {
    constructor(
        message: string,
        public readonly type: DomainErrorType = DomainErrorType.INVALID_BUSINESS_RULE
    ) {
        super(message);
        this.name = 'JobPostingDomainError';
    }
}

export class JobPostingDomain {
    private constructor(private props: JobPostingProps) { }

    // =========================================================================
    // FACTORY — KHÔI PHỤC TỪ DB
    // =========================================================================
    static fromPersistence(raw: JobPostingEntity): JobPostingDomain {
        return new JobPostingDomain({
            id: raw.job_id,
            companyId: raw.company_id!,
            categoryId: raw.category_id,

            jobTitle: raw.job_title,
            jobDescription: raw.job_description,
            requirements: raw.requirements,
            benefits: raw.benefits,

            experienceLevel: raw.experience_level,
            positionLevel: raw.position_level,
            numberOfPositions: raw.number_of_positions ?? 1,

            salaryMin: raw.salary_min ? Number(raw.salary_min) : null,
            salaryMax: raw.salary_max ? Number(raw.salary_max) : null,
            salaryType: raw.salary_type,
            isSalaryNegotiable: raw.is_salary_negotiable ?? true,

            city: raw.city,
            applicationDeadline: raw.application_deadline,

            status: raw.status as JobPostingStatus,
            applicationCount: raw.application_count ?? 0,

            createdAt: raw.created_at!,
            updatedAt: raw.updated_at!,
        });
    }

    // =========================================================================
    // GETTERS
    // =========================================================================
    get jobId() { return this.props.id; }
    get companyId() { return this.props.companyId!; }
    get categoryId() { return this.props.categoryId; }
    get jobTitle() { return this.props.jobTitle; }
    get jobDescription() { return this.props.jobDescription; }
    get requirements() { return this.props.requirements; }
    get benefits() { return this.props.benefits; }
    get experienceLevel() { return this.props.experienceLevel; }
    get positionLevel() { return this.props.positionLevel; }
    get numberOfPositions() { return this.props.numberOfPositions ?? 1; }
    get salaryMin() { return this.props.salaryMin ? Number(this.props.salaryMin) : null; }
    get salaryMax() { return this.props.salaryMax ? Number(this.props.salaryMax) : null; }
    get salaryType() { return this.props.salaryType; }
    get isSalaryNegotiable() { return this.props.isSalaryNegotiable ?? true; }
    get city() { return this.props.city; }
    get applicationDeadline() { return this.props.applicationDeadline; }
    get status() { return this.props.status as JobPostingStatus; }
    get createdAt() { return this.props.createdAt!; }
    get updatedAt() { return this.props.updatedAt!; }

    static create(dto: CreateJobPostingDto, companyId: number): JobPostingDomain {
        this.guardSalary(dto.salaryMin, dto.salaryMax);
        this.guardDeadline(dto.applicationDeadline);
        this.guardPositions(dto.numberOfPositions);

        const now = new Date();

        return new JobPostingDomain({
            id: 0,
            companyId,
            categoryId: dto.categoryId ?? null,

            jobTitle: dto.jobTitle,
            jobDescription: dto.jobDescription,
            requirements: dto.requirements,
            benefits: dto.benefits ?? null,

            experienceLevel: dto.experienceLevel ?? null,
            positionLevel: dto.positionLevel ?? null,
            numberOfPositions: dto.numberOfPositions ?? 1,

            salaryMin: dto.salaryMin ?? null,
            salaryMax: dto.salaryMax ?? null,
            salaryType: dto.salaryType ?? null,
            isSalaryNegotiable: dto.isSalaryNegotiable ?? true,

            city: dto.city ?? null,
            applicationDeadline: dto.applicationDeadline
                ? dto.applicationDeadline.split('T')[0]
                : null,

            status: 'pending',
            applicationCount: 0,

            createdAt: now,
            updatedAt: now,
        });
    }

    // =========================================================================
    // BEHAVIOR — THAY ĐỔI TRẠNG THÁI
    // =========================================================================
    approve(): void {
        if (this.props.status !== 'pending') {
            throw new JobPostingDomainError(`Không thể duyệt bài đăng đang ở trạng thái ${this.status}`, DomainErrorType.INVALID_BUSINESS_RULE);
        }
        this.props.status = 'approved';
    }

    reject(): void {
        if (this.props.status !== 'pending') {
            throw new JobPostingDomainError(
                `Không thể từ chối bài đăng đang ở trạng thái ${this.status}`, DomainErrorType.INVALID_BUSINESS_RULE
            );
        }
        this.props.status = 'rejected';
    }

    edit(dto: UpdateJobPostingDto): void {
        if (!this.canBeEditedByCompany()) {
            throw new JobPostingDomainError(
                `Không thể chỉnh sửa khi trạng thái là ${this.props.status}`
            );
        }

        if (dto.salaryMin !== undefined || dto.salaryMax !== undefined) {
            JobPostingDomain.guardSalary(
                dto.salaryMin ?? this.props.salaryMin,
                dto.salaryMax ?? this.props.salaryMax,
            );
        }

        if (dto.applicationDeadline !== undefined) {
            JobPostingDomain.guardDeadline(dto.applicationDeadline);
        }

        if (dto.numberOfPositions !== undefined) {
            JobPostingDomain.guardPositions(dto.numberOfPositions);
        }

        Object.assign(this.props, {
            jobTitle: dto.jobTitle ?? this.props.jobTitle,
            categoryId: dto.categoryId ?? this.props.categoryId,
            city: dto.city ?? this.props.city,
            jobDescription: dto.jobDescription ?? this.props.jobDescription,
            requirements: dto.requirements ?? this.props.requirements,
            benefits: dto.benefits ?? this.props.benefits,
            experienceLevel: dto.experienceLevel ?? this.props.experienceLevel,
            positionLevel: dto.positionLevel ?? this.props.positionLevel,
            numberOfPositions: dto.numberOfPositions ?? this.props.numberOfPositions,
            salaryMin: dto.salaryMin ?? this.props.salaryMin,
            salaryMax: dto.salaryMax ?? this.props.salaryMax,
            salaryType: dto.salaryType ?? this.props.salaryType,
            isSalaryNegotiable: dto.isSalaryNegotiable ?? this.props.isSalaryNegotiable,
            applicationDeadline: dto.applicationDeadline
                ? dto.applicationDeadline.split('T')[0]
                : this.props.applicationDeadline,
        });

        this.props.status = 'pending';
        this.props.updatedAt = new Date();
    }
    // =========================================================================
    // QUERIES — ĐỌC TRẠNG THÁI
    // =========================================================================
    isVisible(): boolean {
        return this.status === 'approved';
    }

    isExpired(): boolean {
        if (!this.applicationDeadline) return false;
        return new Date(this.applicationDeadline) < new Date();
    }

    canBeEditedByCompany(): boolean {
        return this.props.status === 'pending' || this.props.status === 'rejected';
    }

    canAcceptApplications(): boolean {
        return this.isVisible() && !this.isExpired();
    }

    getSalaryDisplay(): string {
        if (this.props.isSalaryNegotiable || (!this.salaryMin && !this.salaryMax)) {
            return 'Thỏa thuận';
        }
        const fmt = (n: number) =>
            new Intl.NumberFormat('vi-VN').format(n) + ' VNĐ';

        if (this.salaryMin && this.salaryMax) {
            return `${fmt(this.salaryMin)} – ${fmt(this.salaryMax)}`;
        }
        return this.salaryMin
            ? `Từ ${fmt(this.salaryMin)}`
            : `Đến ${fmt(this.salaryMax!)}`;
    }

    /**
     * Dùng khi INSERT mới — trả về toàn bộ props (trừ job_id do DB tự generate)
     */
    toPersistence(): Omit<JobPostingEntity, 'job_id'> {
        return {
            company_id: this.props.companyId,
            category_id: this.props.categoryId,
            job_title: this.props.jobTitle,
            job_description: this.props.jobDescription,
            requirements: this.props.requirements,
            benefits: this.props.benefits,
            experience_level: this.props.experienceLevel,
            position_level: this.props.positionLevel,
            number_of_positions: this.props.numberOfPositions,
            salary_min: this.props.salaryMin,
            salary_max: this.props.salaryMax,
            salary_type: this.props.salaryType,
            is_salary_negotiable: this.props.isSalaryNegotiable,
            city: this.props.city,
            application_deadline: this.props.applicationDeadline,
            status: this.props.status,
            application_count: this.props.applicationCount,
            created_at: this.props.createdAt,
            updated_at: this.props.updatedAt,
            admin_notes: null,
            rejection_reason: null,
            approved_by: null,
            approved_at: null,
            expires_at: null,
        };
    }


    /**
     * Dùng khi UPDATE — chỉ trả về các field có thể thay đổi
     */
    toUpdatePersistence(): Partial<JobPostingEntity> {
        return {
            category_id: this.props.categoryId,
            job_title: this.props.jobTitle,
            job_description: this.props.jobDescription,
            requirements: this.props.requirements,
            benefits: this.props.benefits,
            experience_level: this.props.experienceLevel,
            position_level: this.props.positionLevel,
            number_of_positions: this.props.numberOfPositions,
            salary_min: this.props.salaryMin,
            salary_max: this.props.salaryMax,
            salary_type: this.props.salaryType,
            is_salary_negotiable: this.props.isSalaryNegotiable,
            city: this.props.city,
            application_deadline: this.props.applicationDeadline,
            status: this.props.status,
            updated_at: this.props.updatedAt,
        };
    }

    // =========================================================================
    // PRIVATE GUARDS — Validation thuần, throw JobPostingDomainError
    // =========================================================================

    private static guardSalary(min?: number | null, max?: number | null): void {
        if (min != null && min < 0)
            throw new JobPostingDomainError('Lương tối thiểu không được âm', DomainErrorType.INVALID_BUSINESS_RULE);
        if (max != null && max < 0)
            throw new JobPostingDomainError('Lương tối đa không được âm', DomainErrorType.INVALID_BUSINESS_RULE);
        if (min != null && max != null && min > max)
            throw new JobPostingDomainError('Lương tối thiểu không được lớn hơn lương tối đa', DomainErrorType.INVALID_BUSINESS_RULE);
    }

    private static guardDeadline(deadline?: string | null): void {
        if (!deadline) return;
        const date = new Date(deadline);
        if (isNaN(date.getTime()))
            throw new JobPostingDomainError('Ngày hết hạn không hợp lệ', DomainErrorType.INVALID_BUSINESS_RULE);
        if (date <= new Date())
            throw new JobPostingDomainError('Ngày hết hạn phải ở trong tương lai', DomainErrorType.INVALID_BUSINESS_RULE);
    }

    private static guardPositions(count?: number): void {
        if (count == null) return;
        if (!Number.isInteger(count) || count < 1)
            throw new JobPostingDomainError('Số lượng vị trí phải là số nguyên dương', DomainErrorType.INVALID_BUSINESS_RULE);
    }
}