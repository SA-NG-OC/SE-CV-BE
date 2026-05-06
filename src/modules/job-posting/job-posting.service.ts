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
import { AdminJobCard, AdminJobStats, CategoryItem, CompanyJobCard, JobPostingResponse, JobPostingStats, JobSkillItem, ProfileJobCard, StudentJobCard, UpdateJobResponse } from './interfaces';
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

  async createJobPosting(
    companyId: number,
    dto: CreateJobPostingDto,
  ): Promise<number | null> {
    const isActive = await this.jobPostingRepository.isCompanyActive(companyId);
    if (!isActive) {
      throw new ForbiddenException(
        'Công ty của bạn chưa được duyệt hoặc đã bị hạn chế. Vui lòng liên hệ quản trị viên.',
      );
    }
    const data = await this.jobPostingRepository.createJobPosting(companyId, dto);
    if (!data) {
      throw new InternalServerErrorException('Thao tác thất bại');
    }
    await this.embeddingQueue.addJobEmbeddingTask(data);
    this.eventEmitter.emit('job.created', {
    })

    return data;
  }

  async updateJobPosting(
    jobId: number,
    companyId: number,
    dto: UpdateJobPostingDto,
  ): Promise<UpdateJobResponse | null> {
    const updated = await this.jobPostingRepository.updateJobPosting(
      jobId,
      companyId,
      dto,
    );

    if (updated === null) {
      throw new NotFoundException(
        'Không tìm thấy tin tuyển dụng, hoặc bạn không có quyền chỉnh sửa tin này.',
      );
    }

    this.embeddingQueue.addJobEmbeddingTask(updated.jobId);
    this.eventEmitter.emit('job.updated', {
      jobTitle: updated.jobTitle,
    });

    return updated;
  }

  async getJobCategories(): Promise<CategoryItem[]> {
    const data = await this.jobPostingRepository.getJobCategories();
    return data as CategoryItem[];
  }

  async getJobSkills(): Promise<JobSkillItem[]> {
    const data = await this.jobPostingRepository.getJobSkills();
    return data as JobSkillItem[];
  }

  async getJobById(
    jobId: number,
    viewer: RoleName,
    companyId?: number,
    studentId?: number
  ): Promise<JobPostingResponse> {
    const job = await this.jobPostingRepository.findJobById(jobId, viewer, companyId);
    let checkSaved: boolean = false;
    if (studentId) {
      checkSaved = await this.savedJobsRepository.checkSaved(studentId, jobId);
    }
    if (!job) {
      throw new NotFoundException('Không tìm thấy tin tuyển dụng.');
    }
    if (checkSaved) {
      job.saved = true;
    }
    return job;
  }

  async listProfileJobCard(companyId: number, page: number, limit: number, roleName: RoleName): Promise<PaginationResponse<ProfileJobCard>> {
    await this.jobPostingRepository.checkCompany(companyId);
    return await this.jobPostingRepository.findByCompanyId(companyId, page, limit, roleName);
  }

  async listJob(companyId: number, page: number, limit: number) {
    return await this.jobPostingRepository.findAllJobList(companyId, page, limit);
  }

  async listJobPostings(
    role: RoleName,
    dto: ListJobPostingDto,
    companyId?: number,
    studentId?: number,
  ): Promise<
    PaginationResponse<AdminJobCard> |
    PaginationResponse<CompanyJobCard> |
    PaginationResponse<StudentJobCard>
  > {

    if (role === RoleName.ADMIN) {
      const data = await this.jobPostingRepository.findAllForAdmin(dto);
      return data;
    }

    // STUDENT — bỏ qua filter status dù FE có truyền lên
    const [data, savedJobIds] = await Promise.all([
      this.jobPostingRepository.findAllForStudent(dto),
      this.savedJobsRepository.getJobSaved(studentId!),
    ]);

    const savedSet = new Set(savedJobIds);

    data.data = data.data.map((job) => ({
      ...job,
      saved: savedSet.has(job.jobId),
    }));

    return data;
  }

  async getSavedJobsForStudent(
    studentId: number,
    dto: ListJobPostingDto,
  ) {
    const data = await this.jobPostingRepository.findSavedJobsForStudent(
      studentId,
      dto,
    );
    return data;
  }

  async getJobCardCompany(
    dto: JobPostingFilterDto,
    companyId?: number,
  ) {
    if (!companyId) throw new ForbiddenException('Không xác định được công ty.');
    const data = await this.jobPostingRepository.findAllForCompany(companyId, dto);
    return data;
  }

  async toggleActiveStatus(jobId: number, companyId: number) {
    await this.jobPostingRepository.toggleActiveStatus(jobId, companyId);
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
        newStatus: result.status
      })
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
      if (!stats) {
        throw new NotFoundException(`Không tìm thấy dữ liệu cho công ty ID ${companyId}`);
      }
      return stats;
    } catch (error) {
      if (error instanceof JobPostingDomainError) {
        throw new BadRequestException(error.message);
      }
      throw error;
    }
  }

  async getAdminJobStats(): Promise<AdminJobStats> {
    try {
      return await this.jobPostingRepository.getAdminJobStats();
    } catch (error) {
      throw error;
    }
  }
}