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
  Query
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

@Controller('job-postings')
export class JobPostingController {
  constructor(private readonly jobPostingService: JobPostingService) { }

  @Post()
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

  @Put(':id')
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

  @Get('categories')
  async getJobCategories(): Promise<ResponseSuccess<CategoryItem[]>> {
    const data = await this.jobPostingService.getJobCategories();
    return new ResponseSuccess('Lấy thông tin thành công', data);
  }

  @Get('skills')
  async getJobSkills(): Promise<ResponseSuccess<JobSkillItem[]>> {
    const data = await this.jobPostingService.getJobSkills();
    return new ResponseSuccess('Lấy thông tin thành công', data);
  }

  @Get('card')
  @Roles(Role.ADMIN, Role.COMPANY, Role.STUDENT)
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.OK)
  async listJobPostings(
    @Req() req,
    @Query() dto: ListJobPostingDto,
  ) {
    const role: RoleName = req.user.roleName;
    const companyId = role === RoleName.COMPANY ? req.user.companyId : undefined;

    const result = await this.jobPostingService.listJobPostings(role, dto, companyId);
    return { success: true, ...result };
  }

  @Get(':id')
  @HttpCode(HttpStatus.OK)
  @UseGuards(JwtAuthGuard)
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

}