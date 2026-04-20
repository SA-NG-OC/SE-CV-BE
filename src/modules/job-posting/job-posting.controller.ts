import {
  Body,
  Controller,
  HttpCode,
  HttpStatus,
  Post,
  Req,
  UseGuards,
  Get,
  Put,
  Param,
  ParseIntPipe,
  Query,
  Patch,
  DefaultValuePipe
} from '@nestjs/common';
import { JobPostingService } from './job-posting.service';
import { JwtAuthGuard } from 'src/modules/auth/guards/jwt-auth.guard';
import { RolesGuard } from 'src/modules/auth/guards/roles.guard';
import { Roles } from 'src/modules/auth/decorators/roles.decorator';
import { Role, RoleName } from 'src/common/types/role.enum';
import { CreateJobPostingDto } from './dto/create-job-posting.dto';
import { JobSkillItem, CategoryItem, UpdateJobResponse, JobPostingResponse } from './interfaces';
import ResponseSuccess from 'src/common/types/response-success';
import { UpdateJobPostingDto } from './dto/update-job-posting.dto';
import { ListJobPostingDto } from './dto/list-job-posting.dto';
import { ChangeJobPostingStatusDto } from './dto/change-job-posting-status.dto';
import { ChangeJobStatusDocs, CreateJobPostingDocs, GetAdminJobStatsDocs, GetJobByIdDocs, GetJobCardCompanyDocs, GetJobCategoriesDocs, GetJobListDocs, GetJobSkillsDocs, GetJobStatsDocs, GetProfileJobDocs, ListJobPostingsDocs, ToggleJobActiveDocs, UpdateJobPostingDocs } from './decorators';
import { JobPostingFilterDto } from './dto/filter-job-card.dto';

@Controller('job-postings')
export class JobPostingController {
  constructor(private readonly jobPostingService: JobPostingService) { }

  @Post()
  @CreateJobPostingDocs()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.COMPANY)
  @HttpCode(HttpStatus.CREATED)
  async createJobPosting(
    @Req() req,
    @Body() dto: CreateJobPostingDto,
  ) {
    const companyId = req.user.companyId;

    const newJobId = await this.jobPostingService.createJobPosting(companyId, dto);

    return new ResponseSuccess('Đăng tin tuyển dụng thành công', { jobId: newJobId });
  }

  @Get('categories')
  @GetJobCategoriesDocs()
  async getJobCategories(): Promise<ResponseSuccess<CategoryItem[]>> {
    const data = await this.jobPostingService.getJobCategories();
    return new ResponseSuccess('Lấy thông tin thành công', data);
  }

  @Get('skills')
  @GetJobSkillsDocs()
  async getJobSkills(): Promise<ResponseSuccess<JobSkillItem[]>> {
    const data = await this.jobPostingService.getJobSkills();
    return new ResponseSuccess('Lấy thông tin thành công', data);
  }

  @Get('all')
  @GetJobListDocs()
  @Roles(Role.COMPANY)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @HttpCode(HttpStatus.OK)
  async listJob(
    @Req() req,
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) page: number,
    @Query('limit', new DefaultValuePipe(10), ParseIntPipe) limit: number,
  ) {
    const companyId = req.user.companyId;
    const data = await this.jobPostingService.listJob(companyId, page = 1, limit = 10);
    return new ResponseSuccess('Lấy thông tin thành công', data);
  }

  @Get('card')
  @ListJobPostingsDocs()
  @Roles(Role.ADMIN, Role.COMPANY, Role.STUDENT)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @HttpCode(HttpStatus.OK)
  async listJobPostings(
    @Req() req,
    @Query() dto: ListJobPostingDto,
  ) {
    const role: RoleName = req.user.roleName;
    const companyId = role === RoleName.COMPANY ? req.user.companyId : undefined;

    const result = await this.jobPostingService.listJobPostings(role, dto, companyId);
    return new ResponseSuccess('Lấy thông tin thành công', result);
  }

  @Get('card/company')
  @GetJobCardCompanyDocs()
  @Roles(Role.COMPANY)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @HttpCode(HttpStatus.OK)
  async getJobCardCompany(
    @Req() req,
    @Query() dto: JobPostingFilterDto,
  ) {
    const companyId = req.user.companyId;

    const result = await this.jobPostingService.getJobCardCompany(dto, companyId);
    return new ResponseSuccess('Lấy thông tin thành công', result);
  }

  @Get('stats')
  @GetJobStatsDocs()
  @Roles(Role.COMPANY)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @HttpCode(HttpStatus.OK)
  async getStats(@Req() req) {
    const companyId = req.user.companyId;
    const data = await this.jobPostingService.getJobStatsByCompanyId(companyId);
    return new ResponseSuccess('Lấy thống kê thành công', data);
  }

  @Get('admin/stats')
  @GetAdminJobStatsDocs()
  @Roles(Role.ADMIN) // Role Admin
  @UseGuards(JwtAuthGuard, RolesGuard)
  @HttpCode(HttpStatus.OK)
  async getAdminStats() {
    const data = await this.jobPostingService.getAdminJobStats();
    return new ResponseSuccess('Lấy thống kê thành công', data);
  }

  @Get(':id')
  @GetJobByIdDocs()
  @HttpCode(HttpStatus.OK)
  @UseGuards(JwtAuthGuard, RolesGuard)
  async getJobById(
    @Param('id', ParseIntPipe) jobId: number,
    @Req() req,
  ): Promise<ResponseSuccess<JobPostingResponse>> {
    const role: RoleName = req.user.roleName;

    const companyId =
      role === RoleName.COMPANY ? req.user.companyId : undefined;

    const job: JobPostingResponse = await this.jobPostingService.getJobById(
      jobId,
      role,
      companyId,
    );

    return new ResponseSuccess('Lấy thông tin thành công', job);
  }
  @Patch(':id/status')
  @ChangeJobStatusDocs()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  async changeJobStatus(
    @Req() req,
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: ChangeJobPostingStatusDto,
  ) {
    const adminId = req.user.userId;
    const data = await this.jobPostingService.changeJobStatus(id, dto, adminId);
    return new ResponseSuccess('Cập nhật trạng thái bài đăng thành công', data);
  }

  @Put(':id')
  @UpdateJobPostingDocs()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.COMPANY)
  @HttpCode(HttpStatus.OK)
  async updateJobPosting(
    @Param('id', ParseIntPipe) jobId: number,
    @Req() req,
    @Body() dto: UpdateJobPostingDto,
  ): Promise<ResponseSuccess<UpdateJobResponse | null>> {
    const updatedId = await this.jobPostingService.updateJobPosting(
      jobId,
      req.user.companyId,
      dto,
    );

    return new ResponseSuccess('Cập nhật thông tin tuyển dụng thành công', updatedId);
  }

  @Get('company/:companyId')
  @GetProfileJobDocs()
  @UseGuards(JwtAuthGuard)
  async getProfileJob(
    @Req() req,
    @Param('companyId', ParseIntPipe) companyId: number,
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) page: number,
    @Query('limit', new DefaultValuePipe(10), ParseIntPipe) limit: number,
  ) {
    const roleName: RoleName = req.user.roleName;
    const data = await this.jobPostingService.listProfileJobCard(companyId, page, limit, roleName);
    return new ResponseSuccess('Lấy dữ liệu thành công', data);
  }

  @Patch(':id/toggle-active')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @ToggleJobActiveDocs()
  @Roles(Role.COMPANY)
  async toggleActive(
    @Param('id', ParseIntPipe) jobId: number,
    @Req() req: any
  ) {
    const companyId = req.user.companyId;

    await this.jobPostingService.toggleActiveStatus(jobId, companyId);
    return new ResponseSuccess('Cập nhật trạng thái thành công', {});
  }
}