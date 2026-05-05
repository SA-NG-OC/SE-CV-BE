import { Controller, Get, UseGuards } from "@nestjs/common";
import { JwtAuthGuard } from "../auth/guards/jwt-auth.guard";
import { RolesGuard } from "../auth/guards/roles.guard";
import { StatisticsService } from "./statistics.service";
import { Roles } from "../auth/decorators/roles.decorator";
import { Role } from "src/common/types/role.enum";
import ResponseSuccess from "src/common/types/response-success";
import { GetMonitorStatsDocs } from "./decorators/get-monitor-stats.decorator";

// statistics.controller.ts
@Controller('statistics')
@UseGuards(JwtAuthGuard, RolesGuard)
export class StatisticsController {
  constructor(private readonly service: StatisticsService) { }

  @Get('monitor')
  @Roles(Role.ADMIN)
  @GetMonitorStatsDocs()
  async getDashboardStats() {
    const data = await this.service.getDashboardStats();
    return new ResponseSuccess('Lấy thống kê thành công', data);
  }
}