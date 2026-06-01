import { Controller, Get, Req, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { StatisticsService } from './statistics.service';
import { Roles } from '../auth/decorators/roles.decorator';
import { Role } from 'src/common/types/role.enum';
import ResponseSuccess from 'src/common/types/response-success';
import { GetMonitorStatsDocs } from './decorators/get-monitor-stats.decorator';
import {
  GetAdminDashboardDocs,
  GetApplicationsPerMonthDocs,
  GetApplicationSuccessRateDocs,
  GetCompanyDashboardDocs,
  GetJobsByCategoryDocs,
  GetJobsCountByCategoryDocs,
  GetTopCompaniesDocs,
} from './decorators';

// statistics.controller.ts
@Controller('statistics')
@UseGuards(JwtAuthGuard, RolesGuard)
export class StatisticsController {
  constructor(private readonly service: StatisticsService) {}

  @Get('monitor')
  @Roles(Role.ADMIN)
  @GetMonitorStatsDocs()
  async getDashboardStats() {
    const data = await this.service.getDashboardStats();
    return new ResponseSuccess('Lấy thống kê thành công', data);
  }

  @Get('company/stats')
  @GetCompanyDashboardDocs()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.COMPANY)
  async getDashboard(@Req() req) {
    const companyId = req.user.companyId;

    const data = await this.service.getDashboard(companyId);

    return new ResponseSuccess('Lấy thống kê thành công', data);
  }

  @Get('applications/7-days')
  @GetApplicationSuccessRateDocs()
  @Roles(Role.COMPANY)
  async getApplications7Days(@Req() req) {
    const companyId = req.user.companyId;

    const data = await this.service.getApplicationsLast7Days(companyId);

    return new ResponseSuccess(
      'Lấy thống kê ứng tuyển 7 ngày thành công',
      data,
    );
  }

  @Get('jobs/by-category')
  @GetJobsByCategoryDocs()
  @Roles(Role.COMPANY)
  async getJobsByCategory(@Req() req) {
    const companyId = req.user.companyId;

    const data = await this.service.getJobsByCategory(companyId);

    return new ResponseSuccess(
      'Lấy thống kê job theo category thành công',
      data,
    );
  }

  @Get('admin/dashboard')
  @GetAdminDashboardDocs()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  async getAdminDashboard() {
    const data = await this.service.getAdminDashboard();

    return new ResponseSuccess('Lấy thống kê admin thành công', data);
  }

  @Get('admin/jobs-by-category')
  @GetJobsCountByCategoryDocs()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  async getJobsCountByCategory() {
    const data = await this.service.getJobsCountByCategory();

    return new ResponseSuccess(
      'Lấy thống kê job theo danh mục thành công',
      data,
    );
  }

  @Get('admin/application-success-rate-monthly')
  @GetApplicationSuccessRateDocs()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  async getApplicationSuccessRateMonthly() {
    const data = await this.service.getApplicationSuccessRateLast12Months();

    return new ResponseSuccess(
      'Lấy tỉ lệ application thành công 12 tháng gần nhất thành công',
      data,
    );
  }

  @Get('admin/applications-per-month')
  @GetApplicationsPerMonthDocs()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  async getApplicationsPerMonth() {
    const data = await this.service.getApplicationCountLast12Months();

    return new ResponseSuccess(
      'Lấy số lượng application theo tháng thành công',
      data,
    );
  }

  @Get('admin/top-companies')
  @GetTopCompaniesDocs()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  async getTopCompanies() {
    const data = await this.service.getTopCompaniesByJobCount();

    return new ResponseSuccess(
      'Lấy top 5 công ty có nhiều tin tuyển dụng nhất thành công',
      data,
    );
  }
}
