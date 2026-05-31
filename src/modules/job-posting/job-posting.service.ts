import {
  BadRequestException,
  ForbiddenException,
  Inject,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { I_JOB_POSTING_REPOSITORY } from './job-posting.tokens';
import type { IJobPostingRepository } from './repositories/job-posting-repository.interface';
import { CreateJobPostingDto } from './dto/create-job-posting.dto';
import { AdminJobCard, AdminJobStats, CategoryItem, CompanyJobCard, JobPostingResponse, JobPostingStats, JobSkillItem, ProfileJobCard, StudentJobCard, UpdateJobResponse } from './types';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { UpdateJobPostingDto } from './dto/update-job-posting.dto';
import { RoleName } from 'src/common/types/role.enum';
import { PaginationResponse } from 'src/common/types/pagination-response';
import { ListJobPostingDto } from './dto/list-job-posting.dto';
import { ChangeJobPostingStatusDto } from './dto/change-job-posting-status.dto';
import { JobPostingDomainError } from './domain/job-posting.domain';
import { JobPostingFilterDto } from './dto/filter-job-card.dto';
import { EmbeddingQueueService } from '../recommendations/embedding/embedding-queue.service';
import { I_COMPANY_REPOSITORY } from '../company/company.tokens';
import { type ICompanyRepository } from '../company/repositories/company-repository.interface';
import { I_SAVED_JOB_REPOSITORY, type ISavedJobRepository } from '../saved-jobs/repositories/saved-jobs-repository.interface';
import { JobPostingMapper } from './domain/job-posting.mapper';

@Injectable()
export class JobPostingService {
  constructor(
    @Inject(I_JOB_POSTING_REPOSITORY)
    private readonly jobPostingRepository: IJobPostingRepository,
    @Inject(I_COMPANY_REPOSITORY)
    private readonly companyRepository: ICompanyRepository,
    @Inject(I_SAVED_JOB_REPOSITORY)
    private readonly savedJobsRepository: ISavedJobRepository,
    private readonly eventEmitter: EventEmitter2,
    private readonly embeddingQueue: EmbeddingQueueService,
  ) { }

  async createJobPosting(companyId: number, dto: CreateJobPostingDto): Promise<number> {
    const isActive = await this.jobPostingRepository.isCompanyActive(companyId);
    if (!isActive) {
      throw new ForbiddenException(
        'Công ty của bạn chưa được duyệt hoặc đã bị hạn chế. Vui lòng liên hệ quản trị viên.',
      );
    }

    const data = await this.jobPostingRepository.createJobPosting(companyId, dto);
    if (!data) throw new InternalServerErrorException('Thao tác thất bại');

    await this.embeddingQueue.addJobEmbeddingTask(data);
    this.eventEmitter.emit('job.created', {});

    return data;
  }

  async updateJobPosting(
    jobId: number,
    companyId: number,
    dto: UpdateJobPostingDto,
  ): Promise<UpdateJobResponse> {
    const updated = await this.jobPostingRepository.updateJobPosting(jobId, companyId, dto);
    if (!updated) {
      throw new NotFoundException(
        'Không tìm thấy tin tuyển dụng, hoặc bạn không có quyền chỉnh sửa tin này.',
      );
    }

    this.embeddingQueue.addJobEmbeddingTask(updated.jobId);
    this.eventEmitter.emit('job.updated', { jobTitle: updated.jobTitle });

    return updated;
  }

  async getJobCategories(): Promise<CategoryItem[]> {
    return this.jobPostingRepository.getJobCategories();
  }

  async getJobSkills(): Promise<JobSkillItem[]> {
    return this.jobPostingRepository.getJobSkills();
  }

  async getJobById(
    jobId: number,
    viewer: RoleName,
    companyId?: number,
    studentId?: number,
  ): Promise<JobPostingResponse> {
    const raw = await this.jobPostingRepository.findJobDetailById(jobId, viewer, companyId);
    if (!raw) throw new NotFoundException('Không tìm thấy tin tuyển dụng.');

    const saved = studentId
      ? await this.savedJobsRepository.checkSaved(studentId, jobId)
      : false;

    return JobPostingMapper.rawToResponse(raw, saved);
  }

  async listProfileJobCard(
    companyId: number,
    page: number,
    limit: number,
    roleName: RoleName,
  ): Promise<PaginationResponse<ProfileJobCard>> {
    await this.jobPostingRepository.checkCompany(companyId);

    const raw = await this.jobPostingRepository.findByCompanyId(companyId, page, limit, roleName);
    const items = raw.items.map((r) => JobPostingMapper.rawToProfileJobCard(r));

    return new PaginationResponse(items, raw.page, raw.limit, raw.total);
  }

  async listJob(companyId: number, page: number, limit: number) {
    return this.jobPostingRepository.findAllJobList(companyId, page, limit);
  }

  async listJobPostings(
    role: RoleName,
    dto: ListJobPostingDto,
    companyId?: number,
    studentId?: number,
  ): Promise<PaginationResponse<AdminJobCard | CompanyJobCard | StudentJobCard>> {
    if (role === RoleName.ADMIN) {
      const raw = await this.jobPostingRepository.findRawForAdmin(dto);
      const items = raw.items.map((r) => JobPostingMapper.rawToAdminCard(r));
      return new PaginationResponse(items, raw.page, raw.limit, raw.total);
    }

    // Student
    const [raw, savedJobIds] = await Promise.all([
      this.jobPostingRepository.findRawForStudent(dto),
      this.savedJobsRepository.getJobSaved(studentId!),
    ]);
    const savedSet = new Set(savedJobIds);

    const items = raw.items.map((r) =>
      JobPostingMapper.rawToStudentCard(r, savedSet.has(r.domain.jobId)),
    );
    return new PaginationResponse(items, raw.page, raw.limit, raw.total);
  }

  async getSavedJobsForStudent(
    studentId: number,
    dto: ListJobPostingDto,
  ): Promise<PaginationResponse<StudentJobCard>> {
    const raw = await this.jobPostingRepository.findRawSavedJobs(studentId, dto);
    const items = raw.items.map((r) => JobPostingMapper.rawToStudentCard(r, true));
    return new PaginationResponse(items, raw.page, raw.limit, raw.total);
  }

  async getJobCardCompany(
    dto: JobPostingFilterDto,
    companyId?: number,
  ): Promise<PaginationResponse<CompanyJobCard>> {
    if (!companyId) throw new ForbiddenException('Không xác định được công ty.');

    const raw = await this.jobPostingRepository.findRawForCompany(companyId, dto);
    const items = raw.items.map((r) => JobPostingMapper.rawToCompanyCard(r));
    return new PaginationResponse(items, raw.page, raw.limit, raw.total);
  }

  async changeJobStatus(
    jobId: number,
    dto: ChangeJobPostingStatusDto,
    adminId: number,
  ) {
    try {
      const result = await this.jobPostingRepository.changeJobStatus(jobId, dto, adminId);
      if (!result?.company_id) throw new NotFoundException(`Không tìm thấy job với ID ${jobId}`);

      const company = await this.companyRepository.getCompanyName(result.company_id);
      this.eventEmitter.emit('job.statusChanged', {
        companyId: result.company_id,
        companyName: company.company_name,
        userId: company.user_id,
        jobId: result.job_id,
        jobTitle: result.job_title,
        newStatus: result.status,
      });

      return result;
    } catch (error) {
      if (error instanceof JobPostingDomainError) {
        throw new BadRequestException(error.message);
      }
      throw error;
    }
  }

  async getJobStatsByCompanyId(companyId: number): Promise<JobPostingStats> {
    try {
      const stats = await this.jobPostingRepository.getJobStatsByCompanyId(companyId);
      if (!stats) throw new NotFoundException(`Không tìm thấy dữ liệu cho công ty ID ${companyId}`);
      return stats;
    } catch (error) {
      if (error instanceof JobPostingDomainError) throw new BadRequestException(error.message);
      throw error;
    }
  }

  async getAdminJobStats(): Promise<AdminJobStats> {
    return this.jobPostingRepository.getAdminJobStats();
  }

  async toggleActiveStatus(jobId: number, companyId: number): Promise<void> {
    await this.jobPostingRepository.toggleActiveStatus(jobId, companyId);
  }
}