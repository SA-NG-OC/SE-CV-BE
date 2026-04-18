import { CreateJobPostingDto } from '../dto/create-job-posting.dto';
import { UpdateJobPostingDto } from '../dto/update-job-posting.dto';
import { ChangeJobPostingStatusDto } from '../dto/change-job-posting-status.dto';
import { JobPostingEntity } from './job-posting.entity';
import { DomainErrorType } from 'src/common/types/domain-error.enum';
import { JobPostingProps, JobPostingStatus } from './job-posting.props';

export class JobPostingDomainError extends Error {
    constructor(
        message: string,
        public readonly type: DomainErrorType = DomainErrorType.INVALID_BUSINESS_RULE,
    ) {
        super(message);
        this.name = 'JobPostingDomainError';
    }
}

export class JobPostingDomain {
    private constructor(private props: JobPostingProps) { }

    // =========================================================================
    // FACTORY
    // =========================================================================

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
            isActive: true,
            status: 'pending',
            adminNote: null,
            applicationCount: 0,
            approvedAt: null,
            approvedBy: null,
            createdAt: now,
            updatedAt: now,
        });
    }

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
            positionLevel: raw.position_level, // Lưu ý check key mapping với entity
            numberOfPositions: raw.number_of_positions ?? 1,
            salaryMin: raw.salary_min ? Number(raw.salary_min) : null,
            salaryMax: raw.salary_max ? Number(raw.salary_max) : null,
            salaryType: raw.salary_type,
            isSalaryNegotiable: raw.is_salary_negotiable ?? true,
            city: raw.city,
            applicationDeadline: raw.application_deadline,
            isActive: raw.is_active ?? true, // Map từ db
            status: raw.status as JobPostingStatus,
            adminNote: raw.admin_notes ?? null,
            applicationCount: raw.application_count ?? 0,
            approvedAt: raw.approved_at,
            approvedBy: raw.approved_by,
            createdAt: raw.created_at!,
            updatedAt: raw.updated_at!,
        });
    }

    // =========================================================================
    // BEHAVIOR — STATE TRANSITION
    // =========================================================================

    approve(adminId: number): void {
        if (this.props.status !== 'pending') {
            throw new JobPostingDomainError(
                `Không thể duyệt bài đăng đang ở trạng thái "${this.props.status}"`,
            );
        }
        this.props.status = 'approved';
        this.props.approvedAt = new Date();
        this.props.approvedBy = adminId;
        this.props.adminNote = null;
        this.props.updatedAt = new Date();
    }

    reject(adminNote?: string | null): void {
        if (this.props.status !== 'pending') {
            throw new JobPostingDomainError(
                `Không thể từ chối bài đăng đang ở trạng thái "${this.props.status}"`,
            );
        }
        this.props.adminNote = adminNote ?? null;
        this.props.status = 'rejected';
        this.props.updatedAt = new Date();
    }

    restrict(adminNote?: string | null): void {
        if (this.props.status !== 'approved') {
            throw new JobPostingDomainError(
                `Không thể hạn chế bài đăng đang ở trạng thái "${this.props.status}"`,
            );
        }
        this.props.status = 'restricted';
        this.props.adminNote = adminNote?.trim() ?? null;
        this.props.updatedAt = new Date();
    }

    /**
     * Tạm ẩn hoặc mở lại bài đăng (do User chủ động)
     */
    toggleVisibility(isActive: boolean): void {
        this.props.isActive = isActive;
        this.props.updatedAt = new Date();
    }

    changeStatus(dto: ChangeJobPostingStatusDto, adminId: number): void {
        switch (dto.status) {
            case 'approved':
                this.approve(adminId);
                break;
            case 'rejected':
                this.reject(dto.admin_note);
                break;
            case 'restricted':
                this.restrict(dto.admin_note);
                break;
            default:
                throw new JobPostingDomainError(
                    `Không hỗ trợ chuyển sang trạng thái "${dto.status}"`,
                );
        }
    }

    edit(dto: UpdateJobPostingDto): void {
        if (!this.canBeEditedByCompany()) {
            throw new JobPostingDomainError(
                `Không thể chỉnh sửa khi trạng thái là "${this.props.status}"`,
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
            salaryMin: dto.salaryMin !== undefined ? dto.salaryMin : this.props.salaryMin,
            salaryMax: dto.salaryMax !== undefined ? dto.salaryMax : this.props.salaryMax,
            salaryType: dto.salaryType ?? this.props.salaryType,
            isSalaryNegotiable: dto.isSalaryNegotiable ?? this.props.isSalaryNegotiable,
            isActive: dto.isActive ?? this.props.isActive,
            applicationDeadline: dto.applicationDeadline
                ? dto.applicationDeadline.split('T')[0]
                : this.props.applicationDeadline,
        });

        // Khi edit, nếu bài đăng bị Rejected thì đẩy lại về Pending để Admin duyệt lại
        if (this.props.status === 'rejected') {
            this.props.status = 'pending';
        }

        this.props.updatedAt = new Date();
    }

    // =========================================================================
    // QUERIES
    // =========================================================================

    isVisible(): boolean {
        return this.props.status === 'approved' && this.props.isActive === true;
    }

    isExpired(): boolean {
        if (!this.props.applicationDeadline) return false;
        const deadline = new Date(this.props.applicationDeadline);
        deadline.setHours(23, 59, 59, 999);
        return deadline < new Date();
    }

    canBeEditedByCompany(): boolean {
        return this.props.status === 'pending' || this.props.status === 'rejected' || this.props.status === 'approved';
    }

    canAcceptApplications(): boolean {
        return this.isVisible() && !this.isExpired();
    }

    getSalaryDisplay(): string {
        if (this.props.isSalaryNegotiable || (this.props.salaryMin === null && this.props.salaryMax === null)) {
            return 'Thỏa thuận';
        }
        const fmt = (n: number) => new Intl.NumberFormat('vi-VN').format(n) + ' VNĐ';
        if (this.props.salaryMin !== null && this.props.salaryMax !== null) {
            return `${fmt(this.props.salaryMin)} – ${fmt(this.props.salaryMax)}`;
        }
        return this.props.salaryMin !== null ? `Từ ${fmt(this.props.salaryMin)}` : `Đến ${fmt(this.props.salaryMax!)}`;
    }

    // =========================================================================
    // PERSISTENCE
    // =========================================================================

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
            is_active: this.props.isActive, // mapping
            city: this.props.city,
            application_deadline: this.props.applicationDeadline,
            status: this.props.status,
            admin_notes: this.props.adminNote,
            application_count: this.props.applicationCount,
            approved_at: this.props.approvedAt,
            approved_by: this.props.approvedBy,
            created_at: this.props.createdAt,
            updated_at: this.props.updatedAt,
        };
    }

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
            is_active: this.props.isActive, // mapping
            city: this.props.city,
            application_deadline: this.props.applicationDeadline,
            status: this.props.status,
            admin_notes: this.props.adminNote,
            approved_at: this.props.approvedAt,
            approved_by: this.props.approvedBy,
            updated_at: this.props.updatedAt,
        };
    }

    // =========================================================================
    // GETTERS
    // =========================================================================
    get jobId() { return this.props.id; }
    get companyId() { return this.props.companyId; }
    get categoryId() { return this.props.categoryId; }
    get jobTitle() { return this.props.jobTitle; }
    get jobDescription() { return this.props.jobDescription; }
    get requirements() { return this.props.requirements; }
    get benefits() { return this.props.benefits; }
    get experienceLevel() { return this.props.experienceLevel; }
    get positionLevel() { return this.props.positionLevel; }
    get numberOfPositions() { return this.props.numberOfPositions; }
    get salaryMin() { return this.props.salaryMin; }
    get salaryMax() { return this.props.salaryMax; }
    get salaryType() { return this.props.salaryType; }
    get isSalaryNegotiable() { return this.props.isSalaryNegotiable; }
    get isActive() { return this.props.isActive; }
    get city() { return this.props.city; }
    get applicationDeadline() { return this.props.applicationDeadline; }
    get status() { return this.props.status; }
    get adminNote() { return this.props.adminNote; }
    get applicationCount() { return this.props.applicationCount; }
    get approvedAt() { return this.props.approvedAt; }
    get approvedBy() { return this.props.approvedBy; }
    get createdAt() { return this.props.createdAt; }
    get updatedAt() { return this.props.updatedAt; }

    // =========================================================================
    // PRIVATE GUARDS
    // =========================================================================

    private static guardSalary(min?: number | null, max?: number | null): void {
        if (min != null && min < 0)
            throw new JobPostingDomainError('Lương tối thiểu không được âm');
        if (max != null && max < 0)
            throw new JobPostingDomainError('Lương tối đa không được âm');
        if (min != null && max != null && min > max)
            throw new JobPostingDomainError('Lương tối thiểu không được lớn hơn lương tối đa');
    }

    private static guardDeadline(deadline?: string | null): void {
        if (!deadline) return;
        const date = new Date(deadline);
        if (isNaN(date.getTime()))
            throw new JobPostingDomainError('Ngày hết hạn không hợp lệ');
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        if (date < today)
            throw new JobPostingDomainError('Ngày hết hạn không được ở quá khứ');
    }

    private static guardPositions(count?: number): void {
        if (count == null) return;
        if (!Number.isInteger(count) || count < 1)
            throw new JobPostingDomainError('Số lượng vị trí phải là số nguyên dương');
    }
}