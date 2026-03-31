import { PaginationResponse } from 'src/common/types/PaginationResponse';
import { CreateJobPostingDto } from '../dto/create-job-posting.dto';
import { ListJobPostingDto } from '../dto/list-job-posting.dto';
import { UpdateJobPostingDto } from '../dto/update-job-posting.dto';
import { AdminJobCard, CategoryItem, CompanyJobCard, JobPostingResponse, JobSkillItem, StudentJobCard, UpdateJobResponse } from '../interfaces';

export interface IJobPostingRepository {
    createJobPosting(
        companyId: number,
        dto: CreateJobPostingDto,
    ): Promise<number | null>;

    updateJobPosting(
        jobId: number,
        companyId: number,
        dto: UpdateJobPostingDto,
    ): Promise<UpdateJobResponse | null>;

    isCompanyActive(companyId: number): Promise<boolean>;

    getJobCategories(): Promise<CategoryItem[]>;

    getJobSkill(): Promise<JobSkillItem[]>

    findJobById(
        jobId: number,
        viewer: 'student' | 'company' | 'admin',
        companyId?: number,
    ): Promise<JobPostingResponse | null>;

    findAllForAdmin(dto: ListJobPostingDto): Promise<PaginationResponse<AdminJobCard>>;

    findAllForCompany(companyId: number, dto: ListJobPostingDto): Promise<PaginationResponse<CompanyJobCard>>;

    findAllForStudent(dto: ListJobPostingDto): Promise<PaginationResponse<StudentJobCard>>;
}