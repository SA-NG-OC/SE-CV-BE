import { Injectable, NotFoundException, Inject } from '@nestjs/common';
import { GeneralInformationDto } from './dto/general-information.dto';
import { StudentListDto } from './dto/get-student-items.dto';
import { InternalServerErrorException } from '@nestjs/common';
import { StudentDetailDto } from './dto/student-detail.dto';
import { CreateResumeDto, UpdateJobStatusDto, UpdateSkillsDto } from './dto/update-student.dto';
import { I_STUDENT_REPOSITORY } from './student.token';
import type { IStudentRepository } from './repositories/student-repository.interface';
@Injectable()
export class StudentService {
  constructor(
    @Inject(I_STUDENT_REPOSITORY)
    private readonly repo: IStudentRepository
  ) {

  }

  async getGeneralInformation(): Promise<GeneralInformationDto> {
    const result = await this.repo.getGeneralInformation();
    return result;
  }

  async getStudentListForAdmin(
    page: number,
    limit: number,
    status?: "STUDYING" | "GRADUATED" | "DROPPED_OUT",
    keyword?: string,
  ): Promise<StudentListDto> {
    try {
      const validatedPage = Math.max(1, page);
      const validatedLimit = Math.max(1, Math.min(limit, 100));

      return await this.repo.getStudentListAdmin(
        validatedPage,
        validatedLimit,
        status,
        keyword,
      );
    } catch (error) {
      throw new InternalServerErrorException('Lỗi khi lấy danh sách sinh viên');
    }
  }

  async getStudentDetail(studentId: number, role: string): Promise<StudentDetailDto> {
    // Lấy data cơ bản trước để check tồn tại
    const basicInfo = await this.repo.getStudentBasicInfo(studentId);

    if (!basicInfo) {
      throw new NotFoundException(`Không tìm thấy sinh viên với ID ${studentId}`);
    }

    // Chạy song song lấy Skills và Resumes
    const [skills, resumes] = await Promise.all([
      this.repo.getStudentSkills(studentId),
      this.repo.getStudentResumes(studentId),
    ]);

    let applicationStats: { totalApplications: number } | undefined = undefined;

    if (role === 'admin') {
      const totalApplications = await this.repo.getStudentApplicationCount(studentId);
      applicationStats = { totalApplications };
    }

    return {
      ...basicInfo,
      gpa: basicInfo.gpa ? Number(basicInfo.gpa) : null,
      skills,
      resumes,
      applicationStats,
    };
  }

  async updateJobStatus(studentId: number, dto: UpdateJobStatusDto) {
    await this.repo.updateJobStatus(studentId, dto.isOpenToWork);
    return { message: "Cập nhật trạng thái tìm việc thành công" };
  }

  async updateSkills(studentId: number, dto: UpdateSkillsDto) {
    await this.repo.syncStudentSkills(studentId, dto.skillIds);
    return { message: "Cập nhật danh sách kỹ năng thành công" };
  }

  async uploadResume(studentId: number, dto: CreateResumeDto) {
    const newResume = await this.repo.addResume(studentId, dto);
    return { message: "Thêm CV mới thành công", data: newResume };
  }

  async setDefaultResume(studentId: number, resumeId: number) {
    const result = await this.repo.setResumeAsDefault(studentId, resumeId);
    if (!result) {
      throw new NotFoundException("Không tìm thấy CV này hoặc CV không thuộc về bạn");
    }
    return { message: "Đã cập nhật CV mặc định", data: result };
  }

}
