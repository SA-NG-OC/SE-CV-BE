import { PaginationResponse } from 'src/common/types/pagination-response';
import { CreateJobPostingDto } from '../dto/create-job-posting.dto';
import { ListJobPostingDto } from '../dto/list-job-posting.dto';
import { UpdateJobPostingDto } from '../dto/update-job-posting.dto';
import { AdminJobCard, AdminJobStats, CategoryItem, CompanyJobCard, JobList, JobPostingResponse, JobPostingStats, JobSkillItem, ProfileJobCard, StudentJobCard, UpdateJobResponse } from '../interfaces';
import { ChangeJobPostingStatusDto } from '../dto/change-job-posting-status.dto';

export interface IJobPostingRepository {
    checkCompany(companyId: number): Promise<boolean>

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

    getJobSkills(): Promise<JobSkillItem[]>

    findJobById(
        jobId: number,
        viewer: 'student' | 'company' | 'admin',
        companyId?: number,
    ): Promise<JobPostingResponse | null>;

    findById(jobId: number): Promise<number | null>;

    findAllJobList(companyId: number, page: number, limit: number): Promise<PaginationResponse<JobList>>;

    findAllForAdmin(dto: ListJobPostingDto): Promise<PaginationResponse<AdminJobCard>>;

    findAllForCompany(companyId: number, dto: ListJobPostingDto): Promise<PaginationResponse<CompanyJobCard>>;

    findAllForStudent(dto: ListJobPostingDto): Promise<PaginationResponse<StudentJobCard>>;

    findByCompanyId(companyId: number, page: number, limit: number): Promise<PaginationResponse<ProfileJobCard>>;

    changeJobStatus(jobId: number, dto: ChangeJobPostingStatusDto, adminId: number): Promise<number | null>;

    getJobStatsByCompanyId(companyId: number): Promise<JobPostingStats>

    getAdminJobStats(): Promise<AdminJobStats>

}