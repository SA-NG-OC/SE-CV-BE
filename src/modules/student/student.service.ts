import { Injectable, NotFoundException, Inject, BadRequestException, InternalServerErrorException } from '@nestjs/common';
import { I_STUDENT_REPOSITORY } from './student.token';
import type { IStudentRepository } from './repositories/student-repository.interface';
import { StudentDomainError } from './domain/student.domain';
import { GeneralInformationDto } from './dto/general-information.dto';
import { CreateResumeDto, UpdateJobStatusDto, UpdateSkillsDto } from './dto/update-student.dto';

@Injectable()
export class StudentService {
  constructor(
    @Inject(I_STUDENT_REPOSITORY)
    private readonly repo: IStudentRepository,
  ) { }

  // ── Convert domain error sang HTTP exception ───────────────────────────
  private rethrow(error: unknown): never {
    if (error instanceof StudentDomainError) {
      throw new BadRequestException(error.message);
    }
    throw error;
  }

  // =========================================================================
  // READ
  // =========================================================================

  async getGeneralInformation(): Promise<GeneralInformationDto> {
    return this.repo.getGeneralInformation();
  }

  async getStudentListForAdmin(
    page: number,
    limit: number,
    status?: 'STUDYING' | 'GRADUATED' | 'DROPPED_OUT',
    keyword?: string,
  ) {
    try {
      return await this.repo.getStudentListAdmin(
        Math.max(1, page),
        Math.max(1, Math.min(limit, 100)),
        status,
        keyword,
      );
    } catch (error) {
      throw new InternalServerErrorException('Lỗi khi lấy danh sách sinh viên');
    }
  }

  async getStudentDetail(studentId: number, role: string) {
    const student = await this.repo.getStudentBasicInfo(studentId);
    if (!student) throw new NotFoundException(`Không tìm thấy sinh viên với ID ${studentId}`);

    // applicationCount đã có trong response nhưng chỉ expose cho admin
    if (role !== 'admin') {
      const { totalApplications, ...rest } = student;
      return rest;
    }

    return student;
  }

  // =========================================================================
  // UPDATE
  // =========================================================================

  async updateJobStatus(studentId: number, dto: UpdateJobStatusDto) {
    try {
      const result = await this.repo.updateJobStatus(studentId, dto.isOpenToWork);
      if (!result) throw new NotFoundException(`Không tìm thấy sinh viên với ID ${studentId}`);
      return { message: 'Cập nhật trạng thái tìm việc thành công' };
    } catch (error) {
      this.rethrow(error);
    }
  }

  async updateSkills(studentId: number, dto: UpdateSkillsDto) {
    try {
      await this.repo.syncStudentSkills(studentId, dto.skillIds);
      return { message: 'Cập nhật danh sách kỹ năng thành công' };
    } catch (error) {
      this.rethrow(error);
    }
  }

  async uploadResume(studentId: number, dto: CreateResumeDto) {
    const newResume = await this.repo.addResume(studentId, dto);
    return { message: 'Thêm CV mới thành công', data: newResume };
  }

  async setDefaultResume(studentId: number, resumeId: number) {
    const result = await this.repo.setResumeAsDefault(studentId, resumeId);
    if (!result) throw new NotFoundException('Không tìm thấy CV này hoặc CV không thuộc về bạn');
    return { message: 'Đã cập nhật CV mặc định', data: result };
  }
}