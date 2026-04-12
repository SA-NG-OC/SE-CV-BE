import {
  BadRequestException,
  ForbiddenException,
  Inject,
  Injectable,
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

@Injectable()
export class JobPostingService {
  constructor(
    @Inject(I_JOB_POSTING_REPOSITORY)
    private readonly jobPostingRepository: IJobPostingRepository,
    private readonly eventEmitter: EventEmitter2,
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
  ): Promise<JobPostingResponse> {
    const job = await this.jobPostingRepository.findJobById(jobId, viewer, companyId);
    if (!job) {
      throw new NotFoundException('Không tìm thấy tin tuyển dụng.');
    }
    return job;
  }

  async listProfileJobCard(companyId: number, page: number, limit: number): Promise<PaginationResponse<ProfileJobCard>> {
    await this.jobPostingRepository.checkCompany(companyId);
    return await this.jobPostingRepository.findByCompanyId(companyId, page, limit);
  }

  async listJob(companyId: number, page: number, limit: number) {
    return await this.jobPostingRepository.findAllJobList(companyId, page, limit);
  }

  async listJobPostings(
    role: RoleName,
    dto: ListJobPostingDto,
    companyId?: number,
  ): Promise<
    PaginationResponse<AdminJobCard> |
    PaginationResponse<CompanyJobCard> |
    PaginationResponse<StudentJobCard>
  > {

    if (role === RoleName.ADMIN) {
      const data = await this.jobPostingRepository.findAllForAdmin(dto);
      return data;
    }

    if (role === RoleName.COMPANY) {
      if (!companyId) throw new ForbiddenException('Không xác định được công ty.');
      const data = await this.jobPostingRepository.findAllForCompany(companyId, dto);
      return data
    }

    // STUDENT — bỏ qua filter status dù FE có truyền lên
    const data = await this.jobPostingRepository.findAllForStudent(dto);
    return data;
  }

  async changeJobStatus(
    jobId: number,
    dto: ChangeJobPostingStatusDto,
    adminId: number,
  ) {
    try {
      const result = await this.jobPostingRepository.changeJobStatus(jobId, dto, adminId);
      if (!result) throw new NotFoundException(`Không tìm thấy job với ID ${jobId}`);
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