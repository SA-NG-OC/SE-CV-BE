import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { I_APPLICATION_REPOSITORY, I_JOB_INVITATION } from './application.token';
import { I_JOB_POSTING_REPOSITORY } from '../job-posting/job-posting.tokens';

import type { IApplicationRepository } from './repositories/application-repository.interface';
import type { IJobPostingRepository } from '../job-posting/repositories/job-posting-repository.interface';
import type { IJobInvitationRepository } from './repositories/job-invitation-repository.interface';

import { ApplicationDomain, ApplicationDomainError } from './domain/application/application.domain';
import { JobInvitationDomain } from './domain/job-invitation/job-invitation.domain';
import { ApplicationMapper } from './domain/application/application.mapper';

import { CreateApplicationDto } from './dto/create-application.dto';
import { ChangeApplicationStatusDto } from './dto/change-application-status.dto';
import { CreateJobInvitationDto } from './dto/create-job-invitation.dto';
import { GetInvitationsQueryDto } from './dto/get-invitations-query.dto';

import {
  ApplicantCardView,
  ApplicationCardView,
  ApplicationStats,
  GetCompanyApplicationsFilter,
  GetMyApplicationsQuery,
} from './types/application.interface';
import { ApplicationStatus } from './domain/application/application.props';
import { PaginationResponse } from 'src/common/types/pagination-response';
import { EmployerInvitationCardView, InvitationCardView } from './domain/job-invitation/job-invitation.mapper';

@Injectable()
export class ApplicationService {
  constructor(
    @Inject(I_APPLICATION_REPOSITORY)
    private readonly applicationRepo: IApplicationRepository,
    @Inject(I_JOB_POSTING_REPOSITORY)
    private readonly jobPostingRepo: IJobPostingRepository,
    @Inject(I_JOB_INVITATION)
    private readonly jobInvitationRepo: IJobInvitationRepository,
  ) { }

  // =========================================================================
  // PRIVATE HELPERS
  // =========================================================================

  private rethrow(error: unknown): never {
    if (error instanceof ApplicationDomainError) {
      throw new BadRequestException(error.message);
    }
    throw error;
  }

  private async assertJobBelongsToCompany(companyId: number, jobId: number): Promise<void> {
    const job = await this.jobPostingRepo.findById(jobId);
    if (!job || job.companyId !== companyId) {
      throw new ForbiddenException('Bạn không có quyền thao tác với tin tuyển dụng này');
    }
  }

  private assertJobNotExpired(deadline: string | null): void {
    if (!deadline) return;

    const deadlineDate = new Date(deadline);
    deadlineDate.setHours(23, 59, 59, 999);

    if (new Date() > deadlineDate) {
      throw new BadRequestException('Hết hạn ứng tuyển! Bạn không thể nộp hồ sơ cho tin này nữa.');
    }
  }

  // =========================================================================
  // STUDENT — ứng tuyển
  // =========================================================================

  async applyJob(dto: CreateApplicationDto, studentId: number): Promise<ApplicationDomain> {
    const existing = await this.applicationRepo.findByJobAndStudent(dto.jobId, studentId);
    if (existing) {
      throw new ConflictException('Bạn đã nộp đơn cho công việc này rồi');
    }

    const job = await this.jobPostingRepo.findById(dto.jobId);
    if (!job) {
      throw new NotFoundException('Không tìm thấy tin tuyển dụng này');
    }
    this.assertJobNotExpired(job.applicationDeadline);

    const application = ApplicationDomain.create(dto, studentId);
    return this.applicationRepo.save(application);
  }

  async getMyApplications(
    studentId: number,
    query: GetMyApplicationsQuery,
  ): Promise<PaginationResponse<ApplicationCardView>> {
    const raw = await this.applicationRepo.findCardsByStudent(studentId, query);

    return {
      ...raw,
      data: raw.data.map(ApplicationMapper.toCardView),
    };
  }

  async getMyStats(studentId: number): Promise<ApplicationStats> {
    const raw = await this.applicationRepo.getStatsByStudent(studentId);
    return ApplicationMapper.toStats(raw);
  }

  // =========================================================================
  // COMPANY — quản lý ứng viên
  // =========================================================================

  async getApplicantsByJob(
    companyId: number,
    filter: GetCompanyApplicationsFilter,
  ): Promise<PaginationResponse<ApplicantCardView>> {
    if (filter.jobId) {
      await this.assertJobBelongsToCompany(companyId, filter.jobId);
    }

    const raw = await this.applicationRepo.findApplicantCardsByJob(filter, companyId);

    return {
      ...raw,
      data: raw.data.map(ApplicationMapper.toApplicantCardView),
    };
  }

  async getJobStats(companyId: number, jobId?: number): Promise<ApplicationStats> {
    if (jobId) {
      await this.assertJobBelongsToCompany(companyId, jobId);
    }

    const raw = await this.applicationRepo.getStats(companyId, jobId);
    return ApplicationMapper.toStats(raw);
  }

  async changeApplicationStatus(
    companyId: number,
    applicationId: number,
    dto: ChangeApplicationStatusDto,
  ): Promise<ApplicationDomain> {
    const application = await this.applicationRepo.findById(applicationId);
    if (!application) {
      throw new NotFoundException('Không tìm thấy đơn ứng tuyển');
    }

    await this.assertJobBelongsToCompany(companyId, application.jobId);

    application.changeStatus(dto.status as ApplicationStatus);

    return this.applicationRepo.save(application);
  }

  // =========================================================================
  // JOB INVITATION — Nhà tuyển dụng
  // =========================================================================

  async inviteCandidate(
    companyId: number,
    dto: CreateJobInvitationDto,
  ): Promise<JobInvitationDomain> {
    await this.assertJobBelongsToCompany(companyId, dto.jobId);

    const existingApp = await this.applicationRepo.findByJobAndStudent(dto.jobId, dto.studentId);
    const job = await this.jobPostingRepo.findById(dto.jobId);

    if (job?.applicationDeadline) {
      const now = new Date();
      const deadline = new Date(job.applicationDeadline);

      if (deadline < now) {
        throw new BadRequestException('Job đã hết hạn nhận ứng viên');
      }
    }

    if (existingApp) {
      throw new ConflictException('Ứng viên này đã nộp đơn vào công việc này');
    }

    const existingInvitation =
      await this.jobInvitationRepo.findByJobId(
        dto.jobId,
        dto.studentId
      );

    if (existingInvitation) {
      existingInvitation.updateMessage(dto.message);
      existingInvitation.pending();

      return this.jobInvitationRepo.save(existingInvitation);
    }

    const invitation = JobInvitationDomain.create({
      jobId: dto.jobId,
      studentId: dto.studentId,
      message: dto.message,
    });

    return this.jobInvitationRepo.save(invitation);
  }

  async getCompanyInvitations(
    companyId: number,
    query: GetInvitationsQueryDto,
  ): Promise<PaginationResponse<EmployerInvitationCardView>> {
    return this.jobInvitationRepo.findByCompany(companyId, query);
  }

  // =========================================================================
  // JOB INVITATION — Sinh viên
  // =========================================================================

  async getMyInvitations(
    studentId: number,
    query: GetInvitationsQueryDto,
  ): Promise<PaginationResponse<InvitationCardView>> {
    return this.jobInvitationRepo.findByStudent(studentId, query);
  }

  async respondToInvitation(
    studentId: number,
    invitationId: number,
    action: 'accept' | 'reject',
    cvUrl?: string,
  ): Promise<void> {
    const invitation = await this.jobInvitationRepo.findById(invitationId);
    if (!invitation) throw new NotFoundException('Không tìm thấy lời mời');
    if (invitation.studentId !== studentId) {
      throw new ForbiddenException('Bạn không có quyền thực hiện thao tác này');
    }

    const jobId = invitation.jobId;
    const job = await this.jobPostingRepo.findById(jobId);

    if (job?.applicationDeadline) {
      const now = new Date();
      const deadline = new Date(job.applicationDeadline);

      if (deadline < now) {
        throw new BadRequestException('Job đã hết hạn nhận ứng viên');
      }
    }

    try {
      if (action === 'accept') {
        invitation.accept();

        const application = ApplicationDomain.create({
          jobId: invitation.jobId,
          cvUrl: cvUrl || 'URL_CV_MAC_DINH_CUA_SINH_VIEN',
          coverLetter: `Chấp nhận lời mời ứng tuyển: ${invitation.message || ''}`,
        }, studentId);

        application.scheduleInterview();

        await this.applicationRepo.save(application);
      } else {
        invitation.reject();
      }

      await this.jobInvitationRepo.save(invitation);
    } catch (error) {
      this.rethrow(error);
    }
  }

  async getInvitationStats(companyId: number) {
    return this.jobInvitationRepo.countStatsByCompany(companyId);
  }
}