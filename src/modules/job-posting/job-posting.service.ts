import {
  ForbiddenException,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { I_JOB_POSTING_REPOSITORY } from './job-posting.tokens';
import type { IJobPostingRepository } from './repositories/job-posting-repository.interface';
import { CreateJobPostingDto } from './dto/create-job-posting.dto';
import { AdminJobCard, CategoryItem, CompanyJobCard, JobPostingResponse, JobSkillItem, StudentJobCard, UpdateJobResponse } from './interfaces';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { UpdateJobPostingDto } from './dto/update-job-posting.dto';
import { RoleName } from 'src/common/types/role.enum';
import { PaginationResponse } from 'src/common/types/PaginationResponse';
import { ListJobPostingDto } from './dto/list-job-posting.dto';

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

  async getJobSkill(): Promise<JobSkillItem[]> {
    const data = await this.jobPostingRepository.getJobSkill();
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
}