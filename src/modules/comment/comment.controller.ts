import { Body, Controller, Delete, Get, Param, ParseIntPipe, Patch, Post, Query, Req, UseGuards } from "@nestjs/common";
import { JwtAuthGuard } from "../auth/guards/jwt-auth.guard";
import { RolesGuard } from "../auth/guards/roles.guard";
import { CommentsService } from "./comment.service";
import { Roles } from "../auth/decorators/roles.decorator";
import { CreateCommentDto } from "./dto/create-comment.dto";
import ResponseSuccess from "src/common/types/response-success";
import { Role, RoleName } from "src/common/types/role.enum";
import { UpdateCommentDto } from "./dto/update-comment.dto";
import { CreateCommentDocs, DeleteCommentDocs, GetAdminCompanyCommentsDocs, GetCompanyCommentStatDocs, GetMyCompanyCommentsDocs, UpdateCommentDocs } from "./decorators";

@Controller('comments')
@UseGuards(JwtAuthGuard, RolesGuard)
export class CommentsController {
  constructor(private readonly commentsService: CommentsService) { }

  @Get('company')
  @Roles(Role.COMPANY)
  @GetMyCompanyCommentsDocs()
  async getCommentOfMyCompany(
    @Req() req,
    @Query('page') page: string,
    @Query('limit') limit: string,
  ) {
    const companyId = req.user.companyId;
    const pageNum = page ? parseInt(page, 10) : 1;
    const limitNum = limit ? parseInt(limit, 10) : 10;

    const data = await this.commentsService.getCommentOfMyCompany(companyId, pageNum, limitNum);
    return new ResponseSuccess('Đánh giá được tải thành công', data);
  }

  @Post()
  @CreateCommentDocs()
  @Roles(Role.STUDENT)
  async create(@Req() req, @Body() dto: CreateCommentDto) {
    const studentId = req.user.studentId;
    const result = await this.commentsService.createComment(studentId, dto);
    return new ResponseSuccess('Đăng đánh giá thành công', result);
  }

  @Get('stat/:companyId')
  @GetCompanyCommentStatDocs()
  @Roles(Role.ADMIN, Role.COMPANY)
  async getCompanyCommentStat(
    @Req() req,
    @Param('companyId', ParseIntPipe) companyId: number,
  ) {
    const roleName: RoleName = req.user.roleName;
    if (roleName === RoleName.COMPANY) {
      companyId = req.user.companyId;
    }
    const data = await this.commentsService.getCompanyCommentStats(companyId);
    return new ResponseSuccess('Dữ liệu được tải thành công', data);
  }

  @Get('admin/:companyId')
  @GetAdminCompanyCommentsDocs()
  @Roles(Role.ADMIN)
  async getByCompanyId(
    @Param('companyId', ParseIntPipe) companyId: number,
    @Query('page') page: string,
    @Query('limit') limit: string,
  ) {
    const pageNum = page ? parseInt(page, 10) : 1;
    const limitNum = limit ? parseInt(limit, 10) : 10;

    const data = await this.commentsService.getCommentByCompany(companyId, pageNum, limitNum);
    return new ResponseSuccess('Đánh giá được tải thành công', data);
  }

  @Patch(':id')
  @UpdateCommentDocs()
  @Roles(Role.STUDENT)
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Req() req,
    @Body() dto: UpdateCommentDto
  ) {
    const studentId = req.user.studentId;
    const result = await this.commentsService.updateComment(id, studentId, dto);
    return new ResponseSuccess('Cập nhật đánh giá thành công', result);
  }

  @Delete(':id')
  @DeleteCommentDocs()
  @Roles(Role.STUDENT)
  async remove(@Param('id', ParseIntPipe) id: number, @Req() req) {
    const studentId = req.user.studentId;
    await this.commentsService.deleteComment(id, studentId);
    return new ResponseSuccess('Xóa đánh giá thành công', {});
  }


}