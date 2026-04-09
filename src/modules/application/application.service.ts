import { BadRequestException, ConflictException, ForbiddenException, Inject, Injectable, NotFoundException } from '@nestjs/common';
import { CreateApplicationDto } from './dto/create-application.dto';
import type { IApplicationRepository } from './repositories/application-repository.interface';
import { ApplicationDomain, ApplicationDomainError } from './domain/application/application.domain';
import { ApplicantCardView, ApplicationCardView, ApplicationStats, GetCompanyApplicationsFilter, GetMyApplicationsQuery } from './interfaces/application.interface';
import { PaginationResponse } from 'src/common/types/pagination-response';
import { I_APPLICATION_REPOSITORY, I_JOB_INVITATION } from './application.token';
import { ChangeApplicationStatusDto } from './dto/change-application-status.dto';
import { ApplicationStatus } from './domain/application/application.props';
import { I_JOB_POSTING_REPOSITORY } from '../job-posting/job-posting.tokens';
import type { IJobPostingRepository } from '../job-posting/repositories/job-posting-repository.interface';
import type { IJobInvitationRepository } from './repositories/job-invitation-repository.interface';
import { CreateJobInvitationDto } from './dto/create-job-invitation.dto';
import { JobInvitationDomain } from './domain/job-invitation/job-invitation.domain';
import { EmployerInvitationCardView, InvitationCardView } from './domain/job-invitation/job-invitation.mapper';
import { GetInvitationsQueryDto } from './dto/get-invitations-query.dto';


@Injectable()
export class ApplicationService {
  constructor(@Inject(I_APPLICATION_REPOSITORY) private readonly applicationRepo: IApplicationRepository,
    @Inject(I_JOB_POSTING_REPOSITORY) private readonly jobPostingRepo: IJobPostingRepository,
    @Inject(I_JOB_INVITATION) private readonly jobInvitationRepo: IJobInvitationRepository) {

  }

  private rethrow(error: unknown): never {
    if (error instanceof ApplicationDomainError) {
      throw new BadRequestException(error.message);
    }
    throw error;
  }

  async applyJob(
    dto: CreateApplicationDto,
    studentId: number,
  ): Promise<ApplicationDomain> {
    // Check trùng đơn
    const existing = await this.applicationRepo.findByJobAndStudent(
      dto.jobId,
      studentId,
    );
    if (existing) {
      throw new ConflictException('Bạn đã nộp đơn cho công việc này rồi');
    }

    const application = ApplicationDomain.create(dto, studentId);
    return this.applicationRepo.save(application);
  }

  async getMyApplications(
    studentId: number,
    query: GetMyApplicationsQuery,
  ): Promise<PaginationResponse<ApplicationCardView>> {
    return this.applicationRepo.findCardsByStudent(studentId, query);
  }

  async getMyStats(studentId: number): Promise<ApplicationStats> {
    return this.applicationRepo.getStatsByStudent(studentId);
  }

  private async checkJobCompany(companyId, jobId): Promise<void> {
    const job = await this.jobPostingRepo.findById(jobId);
    if (!job || job !== companyId) {
      throw new ForbiddenException('Bạn không có quyền xem thông tin của tin tuyển dụng này');
    }
  }

  async getApplicantsByJob(
    companyId: number,
    filter: GetCompanyApplicationsFilter,
  ): Promise<PaginationResponse<ApplicantCardView>> {
    if (filter.jobId)
      await this.checkJobCompany(companyId, filter.jobId);
    return await this.applicationRepo.findApplicantCardsByJob(filter);
  }

  async getJobStats(
    companyId: number,
    jobId?: number,
  ): Promise<ApplicationStats> {
    if (jobId) {
      await this.checkJobCompany(companyId, jobId);
    }
    return this.applicationRepo.getStats(companyId, jobId);
  }

  async changeApplicationStatus(
    companyId: number,
    applicationId: number,
    dto: ChangeApplicationStatusDto,
  ): Promise<ApplicationDomain> {
    const application = await this.applicationRepo.findById(applicationId);
    if (!application) throw new NotFoundException('Không tìm thấy đơn ứng tuyển');

    this.checkJobCompany(companyId, application.jobId);

    application.changeStatus(dto.status as ApplicationStatus);
    return this.applicationRepo.save(application);
  }

  // =========================================================================
  // JOB INVITATION LOGIC (Dành cho Nhà tuyển dụng)
  // =========================================================================

  async inviteCandidate(
    companyId: number,
    dto: CreateJobInvitationDto,
  ): Promise<JobInvitationDomain> {
    await this.checkJobCompany(companyId, dto.jobId);

    const existingInvitation = await this.jobInvitationRepo.findByJobId(dto.jobId, dto.studentId);
    if (existingInvitation && existingInvitation.status === 'pending') {
      throw new ConflictException('Bạn đã gửi lời mời cho ứng viên này rồi và đang chờ phản hồi');
    }
    const existingApp = await this.applicationRepo.findByJobAndStudent(dto.jobId, dto.studentId);
    if (existingApp) {
      throw new ConflictException('Ứng viên này đã nộp đơn ứng tuyển vào công việc này');
    }

    // 4. Tạo lời mời
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
  ): Promise<EmployerInvitationCardView[]> {

    return this.jobInvitationRepo.findByCompany(
      companyId,
      query.status
    );
  }

  // =========================================================================
  // JOB INVITATION LOGIC (Dành cho Sinh viên)
  // =========================================================================

  async getMyInvitations(
    studentId: number,
    query: GetInvitationsQueryDto,
  ): Promise<InvitationCardView[]> {

    return this.jobInvitationRepo.findByStudent(
      studentId,
      query.status
    );
  }

  async respondToInvitation(
    studentId: number,
    invitationId: number,
    action: 'accept' | 'reject',
    cvUrl?: string
  ): Promise<void> {
    const invitation = await this.jobInvitationRepo.findById(invitationId);

    if (!invitation) throw new NotFoundException('Không tìm thấy lời mời');
    if (invitation.studentId !== studentId) throw new ForbiddenException('Bạn không có quyền thực hiện thao tác này');

    try {
      if (action === 'accept') {
        invitation.accept();

        // --- LOGIC QUAN TRỌNG: TỰ ĐỘNG TẠO ĐƠN ỨNG TUYỂN ---
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
}
