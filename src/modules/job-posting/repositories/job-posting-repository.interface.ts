// repositories/job-posting-repository.interface.ts

import { JobPostingDomain } from '../domain/job-posting.domain';
import { JobPostingEntity } from '../domain/job-posting.entity';
import {
    CategoryItem,
    JobSkillItem,
    JobPostingStats,
    AdminJobStats,
    UpdateJobResponse,
    JobList,
    ProfileJobCard,
} from '../interfaces';
import { CreateJobPostingDto } from '../dto/create-job-posting.dto';
import { UpdateJobPostingDto } from '../dto/update-job-posting.dto';
import { ChangeJobPostingStatusDto } from '../dto/change-job-posting-status.dto';
import { ListJobPostingDto } from '../dto/list-job-posting.dto';
import { JobPostingFilterDto } from '../dto/filter-job-card.dto';
import { RoleName } from 'src/common/types/role.enum';
import { PaginationResponse } from 'src/common/types/pagination-response';
import { RawJobWithMeta, RawJobPage } from '../types/job-posting.raw';

export interface IJobPostingRepository {
    // ── Lookup ──────────────────────────────────────────────────────────────
    checkCompany(companyId: number): Promise<true>;
    isCompanyActive(companyId: number): Promise<boolean>;
    getJobCategories(): Promise<CategoryItem[]>;
    getJobSkills(): Promise<JobSkillItem[]>;

    // ── Writes ──────────────────────────────────────────────────────────────
    createJobPosting(companyId: number, dto: CreateJobPostingDto): Promise<number>;
    updateJobPosting(
        jobId: number,
        companyId: number,
        dto: UpdateJobPostingDto,
    ): Promise<UpdateJobResponse | null>;
    changeJobStatus(
        jobId: number,
        dto: ChangeJobPostingStatusDto,
        adminId: number,
    ): Promise<JobPostingEntity | null>;
    toggleActiveStatus(jobId: number, companyId: number): Promise<void>;

    // ── Single read — trả domain thuần, service lo mapper ───────────────────
    findJobDetailById(
        jobId: number,
        viewer: RoleName,
        companyId?: number,
    ): Promise<RawJobWithMeta | null>;

    findById(
        jobId: number,
    ): Promise<{ companyId: number | null; applicationDeadline: string | null } | null>;

    // ── List reads — trả RawJobPage<RawJobWithMeta> ──────────────────────────
    findByCompanyId(
        companyId: number,
        page: number,
        limit: number,
        roleName: RoleName,
    ): Promise<PaginationResponse<ProfileJobCard>>;   // ProfileJobCard nhẹ, mapper đơn giản → giữ nguyên ở repo cũng OK, hoặc kéo lên service

    findAllJobList(companyId: number, page: number, limit: number): Promise<PaginationResponse<JobList>>;

    findRawForAdmin(dto: ListJobPostingDto): Promise<RawJobPage<RawJobWithMeta>>;
    findRawForCompany(companyId: number, dto: JobPostingFilterDto): Promise<RawJobPage<RawJobWithMeta>>;
    findRawForStudent(dto: ListJobPostingDto): Promise<RawJobPage<RawJobWithMeta>>;
    findRawSavedJobs(studentId: number, dto: ListJobPostingDto): Promise<RawJobPage<RawJobWithMeta>>;

    // ── Stats ────────────────────────────────────────────────────────────────
    getJobStatsByCompanyId(companyId: number): Promise<JobPostingStats>;
    getAdminJobStats(): Promise<AdminJobStats>;
}