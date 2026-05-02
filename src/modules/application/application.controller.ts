import { Controller, Get, Post, Body, Patch, Param, Query, UseGuards, Req } from '@nestjs/common';
import { ApplicationService } from './application.service';
import { CreateApplicationDto } from './dto/create-application.dto';
import { ApplicationDomain } from './domain/application/application.domain';
import { ApplicationStatus } from './domain/application/application.props';
import { PaginationResponse } from 'src/common/types/pagination-response';
import { ApplicantCardView, ApplicationStats } from './types/application.interface';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { Role } from 'src/common/types/role.enum';
import ResponseSuccess from 'src/common/types/response-success';
import { GetCompanyApplicationsQuery } from './dto/get-company-applications.dto';
import { ChangeApplicationStatusDto } from './dto/change-application-status.dto';
import { RespondInvitationDto } from './dto/respond-invitation.dto';
import { CreateJobInvitationDto } from './dto/create-job-invitation.dto';
import { GetInvitationsQueryDto } from './dto/get-invitations-query.dto';
import { ApplyJobDocs, ChangeApplicationStatusDocs, GetApplicantsDocs, GetCompanyInvitationsDocs, GetInvitationStatsDocs, GetJobStatsDocs, GetMyApplicationsDocs, GetMyInvitationsDocs, GetMyStatsDocs, GetStudentInvitationStatsDocs, InviteCandidateDocs, RespondInvitationDocs } from './decorators';

@Controller('application')
export class ApplicationController {
  constructor(private readonly applicationService: ApplicationService) { }

  @Post()
  @ApplyJobDocs()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.STUDENT)
  async apply(
    @Body() dto: CreateApplicationDto,
    @Req() req,
  ) {
    const studentId = req.user.studentId;
    const data = await this.applicationService.applyJob(dto, studentId);
    return new ResponseSuccess('Nộp đơn ứng tuyển thành công', data);
  }

  @Get('me')
  @GetMyApplicationsDocs()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.STUDENT)
  async getMyApplications(
    @Req() req,
    @Query('page') page = 1,
    @Query('limit') limit = 10,
    @Query('status') status?: ApplicationStatus | undefined,
  ) {
    const studentId = req.user.studentId;
    const data = await this.applicationService.getMyApplications(studentId, {
      page: Number(page),
      limit: Number(limit),
      status,
    });
    return new ResponseSuccess('Lấy thông tin thành công', data);
  }

  @Get('me/stats')
  @GetMyStatsDocs()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.STUDENT)
  async getMyStats(
    @Req() req,
  ) {
    const studentId = req.user.studentId;
    const data = await this.applicationService.getMyStats(studentId);
    return new ResponseSuccess('Lấy thông tin thành công', data);
  }

  @Get('company/applications')
  @GetApplicantsDocs()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.COMPANY)
  async getApplicants(
    @Query() query: GetCompanyApplicationsQuery,
    @Req() req
  ): Promise<ResponseSuccess<PaginationResponse<ApplicantCardView>>> {
    const companyId = req.user.companyId;
    const data = await this.applicationService.getApplicantsByJob(companyId, {
      jobId: query.jobId,
      status: query.status as ApplicationStatus | undefined,
      dateRange: query.dateRange,
      categoryId: query.categoryId,
      search: query.search,
      page: query.page,
      limit: query.limit,
    });
    return new ResponseSuccess('Lấy thông tin thành công', data);
  }

  @Get('company/applications/stats')
  @GetJobStatsDocs()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.COMPANY)
  async getJobStats(
    @Query('jobId') jobId: string,
    @Req() req
  ): Promise<ResponseSuccess<ApplicationStats>> {
    const companyId = req.user.companyId;

    const parsedJobId = jobId ? Number(jobId) : undefined;

    const data = await this.applicationService.getJobStats(companyId, parsedJobId);
    return new ResponseSuccess('Lấy thông tin thành công', data);
  }

  @Patch('company/applications/:id/status')
  @ChangeApplicationStatusDocs()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.COMPANY)
  async changeStatus(
    @Param('id') id: number,
    @Body() dto: ChangeApplicationStatusDto,
    @Req() req,
  ): Promise<ResponseSuccess<ApplicationDomain>> {
    const companyId = req.user.companyId;
    const data = await this.applicationService.changeApplicationStatus(
      companyId,
      Number(id),
      dto,
    );
    return new ResponseSuccess('Chuyển trạng thái thành công', data);
  }

  @Post('invitation')
  @InviteCandidateDocs()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.COMPANY)
  async inviteCandidate(
    @Body() dto: CreateJobInvitationDto,
    @Req() req,
  ) {
    const companyId = req.user.companyId;
    const data = await this.applicationService.inviteCandidate(companyId, dto);
    return new ResponseSuccess('Gửi lời mời ứng tuyển thành công', data);
  }

  @Get('company/invitation/stats')
  @GetInvitationStatsDocs()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.COMPANY)
  async getInvitationStats(
    @Req() req,
  ) {
    const companyId = req.user.companyId;
    const data = await this.applicationService.getInvitationStats(companyId);
    return new ResponseSuccess('Lấy thông tin thành công', data);
  }

  @Get('company/invitations')
  @GetCompanyInvitationsDocs()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.COMPANY)
  async getCompanyInvitations(
    @Req() req,
    @Query() query: GetInvitationsQueryDto,
  ) {
    const companyId = req.user.companyId;

    const data = await this.applicationService.getCompanyInvitations(
      companyId,
      query
    );

    return new ResponseSuccess('Lấy danh sách lời mời đã gửi thành công', data);
  }

  // =========================================================================
  // SINH VIÊN (STUDENT)
  // =========================================================================

  @Get('me/invitations')
  @GetMyInvitationsDocs()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.STUDENT)
  async getMyInvitations(
    @Req() req,
    @Query() query: GetInvitationsQueryDto,
  ) {
    const studentId = req.user.studentId;

    const data = await this.applicationService.getMyInvitations(
      studentId,
      query
    );

    return new ResponseSuccess('Lấy danh sách lời mời thành công', data);
  }

  @Patch('me/invitations/:id/respond')
  @RespondInvitationDocs()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.STUDENT)
  async respondInvitation(
    @Param('id') id: number,
    @Body() dto: RespondInvitationDto,
    @Req() req,
  ) {
    const studentId = req.user.studentId;
    await this.applicationService.respondToInvitation(
      studentId,
      Number(id),
      dto.action,
      dto.cvUrl,
    );

    const message = dto.action === 'accept'
      ? 'Đã chấp nhận lời mời và tạo đơn ứng tuyển'
      : 'Đã từ chối lời mời ứng tuyển';

    return new ResponseSuccess(message, {});
  }

  @Get('student/invitation/stats')
  @GetStudentInvitationStatsDocs()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.STUDENT)
  async getStudentInvitationStats(
    @Req() req,
  ) {
    const studentId = req.user.studentId;
    console.log(`[Application Controller]: ${studentId}`);
    const data = await this.applicationService.getStudentInvitationStats(studentId);
    return new ResponseSuccess('Lấy thông tin thành công', data);
  }

}
