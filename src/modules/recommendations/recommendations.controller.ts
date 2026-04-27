import { Controller, Get, Query, Req, UseGuards } from "@nestjs/common";
import { GetJobRecommendationsDto, GetStudentRecommendationsDto } from "./dto/get-recommendations.dto";
import { RecommendationsService } from "./recommendations.service";
import { JwtAuthGuard } from "../auth/guards/jwt-auth.guard";
import { Roles } from "../auth/decorators/roles.decorator";
import { Role } from "src/common/types/role.enum";
import ResponseSuccess from "src/common/types/response-success";
import { GetJobRecommendationsDocs } from "./decorators/get-job-recommendations.decorator";
import { GetStudentRecommendationsDocs } from "./decorators/get-student-recommendations.decorator";

@Controller("recommendations")
@UseGuards(JwtAuthGuard)
export class RecommendationsController {
  constructor(private readonly service: RecommendationsService) { }

  @Get("jobs")
  @GetJobRecommendationsDocs()
  @Roles(Role.STUDENT)
  async getJobsForStudent(
    @Query() dto: GetJobRecommendationsDto,
    @Req() req) {
    const studentId = req.user.studentId;
    const data = await this.service.getJobRecommendationsForStudent(dto, studentId);
    return new ResponseSuccess('Lấy đề xuất thành công', data);
  }

  @Get("students")
  @GetStudentRecommendationsDocs()
  @Roles(Role.COMPANY)
  async getStudentsForJob(@Query() dto: GetStudentRecommendationsDto) {
    const data = await this.service.getStudentRecommendationsForJob(dto);
    return new ResponseSuccess('Lấy đề xuất thành công', data);
  }
}