import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  Query,
  UseGuards,
} from "@nestjs/common";
import { JobCategoryService } from "./category.service";
import ResponseSuccess from "src/common/types/response-success";
import { CreateJobCategoryDto } from "./dto/create-category.dto";
import { UpdateJobCategoryDto } from "./dto/update-category.dto";
import { JwtAuthGuard } from "../auth/guards/jwt-auth.guard";
import { RolesGuard } from "../auth/guards/roles.guard";
import { Roles } from "../auth/decorators/roles.decorator";
import { Role } from "src/common/types/role.enum";
import { CreateJobCategoryDocs, DeleteJobCategoryDocs, GetJobCategoriesDocs, GetJobCategoryStatsDocs, ToggleJobCategoryDocs, UpdateJobCategoryDocs } from "./decorator";


@Controller('job-categories')
@UseGuards(JwtAuthGuard, RolesGuard)
export class JobCategoryController {
  constructor(private readonly service: JobCategoryService) { }

  @Get()
  @GetJobCategoriesDocs()
  @Roles(Role.ADMIN)
  async findAll(
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ) {
    const pageNum = page ? parseInt(page, 10) : 1;
    const limitNum = limit ? parseInt(limit, 10) : 10;

    const data = await this.service.findAll(pageNum, limitNum);

    return new ResponseSuccess('Lấy danh sách thành công', data);
  }

  @Post()
  @CreateJobCategoryDocs()
  @Roles(Role.ADMIN)
  async create(@Body() dto: CreateJobCategoryDto) {
    const id = await this.service.create(dto.category_name);

    return new ResponseSuccess('Tạo danh mục thành công', { id });
  }

  @Patch(':id')
  @UpdateJobCategoryDocs()
  @Roles(Role.ADMIN)
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateJobCategoryDto
  ) {
    if (dto.category_name !== undefined) {
      await this.service.updateName(id, dto.category_name);
    }

    return new ResponseSuccess('Cập nhật thành công', {});
  }

  @Delete(':id')
  @DeleteJobCategoryDocs()
  @Roles(Role.ADMIN)
  async delete(@Param('id', ParseIntPipe) id: number) {
    await this.service.delete(id);
    return new ResponseSuccess('Xóa thành công', {});
  }

  @Patch(':id/toggle')
  @ToggleJobCategoryDocs()
  @Roles(Role.ADMIN)
  async toggle(@Param('id', ParseIntPipe) id: number) {
    await this.service.toggleActiveStatus(id);
    return new ResponseSuccess('Cập nhật trạng thái thành công', {});
  }

  @Get('stats')
  @GetJobCategoryStatsDocs()
  @Roles(Role.ADMIN)
  async getStats() {
    const data = await this.service.getStats();
    return new ResponseSuccess('Lấy thống kê thành công', data);
  }
}