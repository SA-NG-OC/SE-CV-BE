import { StudentEntity } from "./student.entity";
import { StudentProps, StudentStatus } from "./student.props";

export class StudentDomainError extends Error {
    constructor(message: string) {
        super(message);
        this.name = 'StudentDomainError';
    }
}

export class StudentDomain {
    constructor(private props: StudentProps) { }

    static fromPersistence(raw: StudentEntity) {
        return new StudentDomain({
            id: raw.student_id,
            userId: raw.user_id ?? null,
            fullName: raw.full_name,
            studentCode: raw.student_code,
            emailStudent: raw.email_student ?? null,
            phone: raw.phone ?? null,
            majorId: raw.major_id ?? null,
            currentYear: raw.current_year ?? null,
            enrollmentYear: raw.enrollment_year ?? null,
            gpa: raw.gpa ? Number(raw.gpa) : null,
            studentStatus: (raw.student_status ?? 'STUDYING') as StudentStatus,
            isOpenToWork: raw.is_open_to_work ?? false,
            createdAt: raw.created_at ?? null,
            updatedAt: raw.updated_at ?? null,
        })
    }

    setOpenToWork(isOpen: boolean): void {
        this.props.isOpenToWork = isOpen;
        this.props.updatedAt = new Date();
    }

    validateSkillIds(skillIds: number[]): void {
        if (!Array.isArray(skillIds)) {
            throw new StudentDomainError('Danh sách skill không hợp lệ');
        }
        if (skillIds.some((id) => !Number.isInteger(id) || id < 1)) {
            throw new StudentDomainError('Skill ID phải là số nguyên dương');
        }
    }

    isActive(): boolean {
        return this.props.studentStatus === 'STUDYING';
    }

    isGraduated(): boolean {
        return this.props.studentStatus === 'GRADUATED';
    }

    toUpdatePersistence(): Partial<StudentEntity> {
        return {
            is_open_to_work: this.props.isOpenToWork,
            updated_at: this.props.updatedAt ?? new Date(),
        };
    }

    get studentId() { return this.props.id; }
    get userId() { return this.props.userId; }
    get fullName() { return this.props.fullName; }
    get studentCode() { return this.props.studentCode; }
    get emailStudent() { return this.props.emailStudent; }
    get phone() { return this.props.phone; }
    get majorId() { return this.props.majorId; }
    get currentYear() { return this.props.currentYear; }
    get enrollmentYear() { return this.props.enrollmentYear; }
    get gpa() { return this.props.gpa; }
    get studentStatus() { return this.props.studentStatus; }
    get isOpenToWork() { return this.props.isOpenToWork; }
    get createdAt() { return this.props.createdAt; }
    get updatedAt() { return this.props.updatedAt; }
}