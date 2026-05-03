import { Controller, Get, Post, Body, Patch, Param, Put, UseGuards, Query, UseInterceptors, UploadedFile, NotFoundException } from '@nestjs/common';
import { StudentService } from './student.service';
import ResponseSuccess from 'src/common/types/response-success';
import { JwtAuthGuard } from 'src/modules/auth/guards/jwt-auth.guard';
import { RolesGuard } from 'src/modules/auth/guards/roles.guard';
import { Role } from 'src/common/types/role.enum';
import { Roles } from 'src/modules/auth/decorators/roles.decorator';
import { Req } from '@nestjs/common';
import { ParseIntPipe } from '@nestjs/common';
import GetGeneralInformationDocs from './decorators/get-general-information.decorator';
import GetStudentsDocs from './decorators/get-students.decorator';
import GetStudentProfileDocs from './decorators/get-student-profile.decorator';
import { CreateResumeDto, UpdateAvatarDto, UpdateGeneralInfoDto, UpdateJobStatusDto, UpdateSkillsDto } from './dto/update-student.dto';
import { FileInterceptor } from '@nestjs/platform-express';
import { ParseFilePipeBuilder } from '@nestjs/common/pipes';
import { HttpStatus } from '@nestjs/common';
import { CloudinaryService } from 'src/shared/cloudinary/cloudinary.service';
import { SetDefaultResumeDocs, UpdateJobStatusDocs, UpdateSkillsDocs, UploadResumeDocs } from './decorators/student-profile.decorator';
import { GetStudentsQueryDto } from './dto/get-students-query.dto';
import { GetStudentsCardDocs } from './decorators/get-student-card.decorator';
import GetMajorsDocs from './decorators/get-majors.decorator';
import GetMyProfileDocs from './decorators/get-my-profile.decorator';

@Controller('student')
export class StudentController {
  constructor(private readonly studentsService: StudentService,
    private readonly cloudinaryService: CloudinaryService
  ) { }

  @Get('general')
  @GetGeneralInformationDocs()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  async getGeneralInformation() {
    const result = await this.studentsService.getGeneralInformation();
    return new ResponseSuccess('Lấy thông tin thành công', result);
  }

  @Get('majors')
  @GetMajorsDocs()
  @UseGuards(JwtAuthGuard)
  async getMajors() {
    const data = await this.studentsService.getAllMajors();
    return new ResponseSuccess('Lấy danh sách chuyên ngành thành công', data);
  }

  @Get()
  @GetStudentsDocs()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  async getStudents(
    @Query('page') page: string = '1',
    @Query('limit') limit: string = '10',
    @Query('status') status?: "STUDYING" | "GRADUATED" | "DROPPED_OUT",
    @Query('keyword') keyword?: string,
  ) {
    const result = await this.studentsService.getStudentListForAdmin(
      Number(page),
      Number(limit),
      status,
      keyword,
    );
    return new ResponseSuccess('Lấy thông tin thành công', result)
  }

  @Get('card')
  @GetStudentsCardDocs()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.COMPANY)
  async getStudentsCard(@Query() query: GetStudentsQueryDto) {
    const data = await this.studentsService.getStudentCards(query);
    return new ResponseSuccess('Lấy danh sách sinh viên thành công', data);
  }

  @Get('me')
  @GetStudentProfileDocs()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.STUDENT)
  async getMe(@Req() req: any) {
    const studentId = req.user.studentId;
    const data = await this.studentsService.getMyProfile(studentId);
    if (!data) throw new NotFoundException('Không tìm thấy profile');
    return new ResponseSuccess('Lấy profile thành công', data);
  }

  @Patch('me/job-status')
  @UpdateJobStatusDocs()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.STUDENT)
  async updateStatus(@Req() req: any, @Body() body: UpdateJobStatusDto) {
    const studentId = req.user.studentId;
    const data = await this.studentsService.updateJobStatus(studentId, body);
    return new ResponseSuccess('Cập nhật thông tin thành công', {});
  }

  @Put('me/skills')
  @UpdateSkillsDocs()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.STUDENT)
  async updateSkills(@Req() req: any, @Body() body: UpdateSkillsDto) {
    const studentId = req.user.studentId;
    console.log('Id của sinh viên', `${studentId}`);
    const data = await this.studentsService.updateSkills(studentId, body);
    return new ResponseSuccess('Cập nhật thông tin thành công', {});
  }

  @Post('me/resumes')
  @UploadResumeDocs()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.STUDENT)
  @UseInterceptors(FileInterceptor('cvFile'))
  async uploadResume(@Req() req: any,
    @Body() body: any,
    @UploadedFile(
      new ParseFilePipeBuilder()
        .addFileTypeValidator({
          fileType: 'application/pdf',
        })
        .addMaxSizeValidator({
          maxSize: 5 * 1024 * 1024
        })
        .build({
          errorHttpStatusCode: HttpStatus.UNPROCESSABLE_ENTITY,
          fileIsRequired: true,
        }),
    ) file: Express.Multer.File,
  ) {
    const studentId = req.user.studentId;
    const resumeName = body.resumeName || file.originalname;
    const uploadRes = await this.cloudinaryService.uploadDocument(file);
    const data = await this.studentsService.uploadResume(studentId, {
      resumeName: resumeName,
      cvUrl: uploadRes.secure_url,
    });
    console.log('Cloudinary URL:', uploadRes.secure_url);
    console.log('Resource type:', uploadRes.resource_type);
    return new ResponseSuccess('Thêm mới CV thành công', data);
  }

  @Patch('me/resumes/:resumeId/default')
  @SetDefaultResumeDocs()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.STUDENT)
  async setDefaultResume(
    @Req() req: any,
    @Param('resumeId', ParseIntPipe) resumeId: number
  ) {
    const studentId = req.user.studentId;
    const data = await this.studentsService.setDefaultResume(studentId, resumeId);
    return new ResponseSuccess('Cập nhật thông tin thành công', data);
  }

  @Patch('me/avatar')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.STUDENT)
  @UseInterceptors(FileInterceptor("avatar"))
  async updateAvatar(
    @Req() req: any,
    @UploadedFile() file: Express.Multer.File
  ) {
    const userId = req.user.studentId;
    const data = await this.studentsService.updateAvatar(userId, file);
    return new ResponseSuccess('Cập nhật ảnh đại diện thành công', data);
  }

  @Patch('me/info')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.STUDENT)
  async updateInfo(@Req() req: any, @Body() dto: UpdateGeneralInfoDto) {
    const data = await this.studentsService.updateGeneralInfo(req.user.studentId, dto);
    return new ResponseSuccess('Cập nhật thông tin thành công', data);
  }

  @Get(':id')
  @GetMyProfileDocs()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN, Role.COMPANY)
  async getStudentProfile(
    @Param('id', ParseIntPipe) studentId: number,
    @Req() req: any
  ) {
    const role = req.user?.roleName || 'student';

    const result = await this.studentsService.getStudentDetail(studentId, role);
    return new ResponseSuccess('Lấy thông tin thành công', result);
  }

}
