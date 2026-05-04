import {
  BadRequestException,
  Inject,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { I_STUDENT_REPOSITORY } from './student.token';
import type { IStudentRepository } from './repositories/student-repository.interface';
import { StudentDomain, StudentDomainError } from './domain/student.domain';
import { StudentMapper } from './domain/student.mapper';
import { CloudinaryService } from 'src/shared/cloudinary/cloudinary.service';

import { CreateResumeDto, UpdateGeneralInfoDto, UpdateJobPreferenceDto, UpdateJobStatusDto, UpdateSkillsDto } from './dto/update-student.dto';
import { GetStudentsQueryDto } from './dto/get-students-query.dto';
import { GeneralInformationDto } from './dto/general-information.dto';

import {
  MajorResponse,
  StudentAdminListResult,
  StudentCard,
  StudentGeneralInfo,
  StudentProfile,
  StudentResponse,
  StudentResumeItem,
} from './types/student.interface';
import { PaginationResponse } from 'src/common/types/pagination-response';

@Injectable()
export class StudentService {
  constructor(
    @Inject(I_STUDENT_REPOSITORY)
    private readonly repo: IStudentRepository,
    private readonly cloudinaryService: CloudinaryService,
  ) { }

  // =========================================================================
  // PRIVATE HELPERS
  // =========================================================================

  private rethrow(error: unknown): never {
    if (error instanceof StudentDomainError) throw new BadRequestException(error.message);
    throw error;
  }

  // =========================================================================
  // READ
  // =========================================================================

  async getAllMajors(): Promise<MajorResponse[]> {
    const raws = await this.repo.getMajors();
    return raws.map(StudentMapper.toMajorResponse);
  }

  async getGeneralInformation(): Promise<StudentGeneralInfo> {
    const raw = await this.repo.getGeneralInformation();
    return StudentMapper.toGeneralInfo(raw);
  }

  async getStudentListForAdmin(
    page: number,
    limit: number,
    status?: 'STUDYING' | 'GRADUATED' | 'DROPPED_OUT',
    keyword?: string,
  ): Promise<StudentAdminListResult> {
    try {
      const raw = await this.repo.getStudentListAdmin(
        Math.max(1, page),
        Math.max(1, Math.min(limit, 100)),
        status,
        keyword,
      );

      return {
        data: raw.data.map(StudentMapper.toAdminCard),
        meta: {
          totalItem: raw.meta.total_item,
          itemsPerPage: raw.meta.items_per_page,
          totalPages: raw.meta.total_pages,
          currentPage: raw.meta.current_page,
        },
      };
    } catch {
      throw new InternalServerErrorException('Lỗi khi lấy danh sách sinh viên');
    }
  }

  async getStudentDetail(studentId: number, role: string): Promise<Omit<StudentResponse, 'totalApplications'> | StudentResponse> {
    // 1. Lấy student + major
    const raw = await this.repo.findStudentWithMajor(studentId);
    if (!raw) throw new NotFoundException(`Không tìm thấy sinh viên với ID ${studentId}`);

    // 2. Fetch thêm skills, resumes, count — service quyết định cần gì
    const [skills, resumes, totalApplications] = await Promise.all([
      this.repo.findSkillsByStudent(studentId),
      this.repo.findResumesByStudent(studentId, true),
      this.repo.countApplicationsByStudent(studentId),
    ]);

    // 3. Tạo Domain từ raw row
    const domain = StudentDomain.fromPersistence(raw.student);

    // 4. Map sang response — mapper nằm ở service
    const response = StudentMapper.toResponse(domain, {
      majorName: raw.major_name,
      skills,
      resumes: resumes.map(StudentMapper.toResumeItem),
      totalApplications,
    });

    // 5. Business rule: non-admin không thấy totalApplications
    if (role !== 'admin') {
      const { totalApplications: _, ...rest } = response;
      return rest;
    }

    return response;
  }

  async getStudentCards(query: GetStudentsQueryDto): Promise<PaginationResponse<StudentCard>> {
    const raw = await this.repo.findStudentCards(query);

    return {
      ...raw,
      data: raw.data.map(StudentMapper.toStudentCard),
    };
  }

  async getMyProfile(userId: number): Promise<StudentProfile | null> {
    const raw = await this.repo.findStudentProfileByUserId(userId);
    if (!raw) return null;

    return StudentMapper.toStudentProfile(raw);
  }

  // =========================================================================
  // UPDATE — business logic ở service, repo chỉ persist
  // =========================================================================

  async updateJobStatus(studentId: number, dto: UpdateJobStatusDto) {
    // 1. Load raw row
    const raw = await this.repo.findRawById2(studentId);
    if (!raw) throw new NotFoundException(`Không tìm thấy sinh viên với ID ${studentId}`);

    // 2. Tạo domain, gọi business method
    const domain = StudentDomain.fromPersistence(raw);
    domain.setOpenToWork(dto.isOpenToWork);

    // 3. Persist — repo không biết gì về domain logic
    await this.repo.updateByStudentId(studentId, domain.toUpdatePersistence());

    return { message: 'Cập nhật trạng thái tìm việc thành công' };
  }

  async updateSkills(studentId: number, dto: UpdateSkillsDto) {
    try {
      // Validate ở service qua domain — không để trong repo
      const raw = await this.repo.findRawById2(studentId);
      if (!raw) throw new NotFoundException(`Không tìm thấy sinh viên với ID ${studentId}`);

      const domain = StudentDomain.fromPersistence(raw);
      domain.validateSkillIds(dto.skillIds); // throw StudentDomainError nếu sai

      await this.repo.replaceSkills(studentId, dto.skillIds);

      return { message: 'Cập nhật danh sách kỹ năng thành công' };
    } catch (error) {
      this.rethrow(error);
    }
  }

  async uploadResume(studentId: number, dto: CreateResumeDto) {
    // Business rule: nếu chưa có resume nào thì set default
    const existingResumes = await this.repo.findResumesByStudent(studentId, true);
    const isDefault = existingResumes.length === 0;

    const raw = await this.repo.insertResume(studentId, dto, isDefault);

    return {
      message: 'Thêm CV mới thành công',
      data: StudentMapper.toResumeItem(raw),
    };
  }

  async deleteResume(studentId: number, resumeId: number): Promise<void> {
    // Business guards ở service, không phải repo
    const resume = await this.repo.findResumeById(resumeId, studentId);
    if (!resume) throw new NotFoundException('CV không tồn tại');
    if (resume.is_default) throw new BadRequestException('Không thể xóa CV mặc định');

    await this.repo.deleteResume(resumeId);
  }

  async setDefaultResume(studentId: number, resumeId: number): Promise<{ message: string; data: StudentResumeItem }> {
    const raw = await this.repo.setDefaultResume(studentId, resumeId);
    if (!raw) throw new NotFoundException('Không tìm thấy CV này hoặc CV không thuộc về bạn');

    return {
      message: 'Đã cập nhật CV mặc định',
      data: StudentMapper.toResumeItem(raw),
    };
  }

  async updateAvatar(userId: number, file: Express.Multer.File) {
    if (!file) throw new BadRequestException('Vui lòng chọn ảnh đại diện.');

    const uploadRes = await this.cloudinaryService.uploadImage(file);
    await this.repo.updateFields(userId, { avatar_url: uploadRes.secure_url });

    return { avatarUrl: uploadRes.secure_url };
  }

  async updateGeneralInfo(userId: number, dto: UpdateGeneralInfoDto) {
    await this.repo.updateFields(userId, {
      full_name: dto.fullName,
      email_student: dto.email,
      phone: dto.phoneNumber,
    });

    return dto;
  }

  async updateJobPreference(userId: number, dto: UpdateJobPreferenceDto) {
    if (
      dto.desiredSalaryMin !== undefined &&
      dto.desiredSalaryMax !== undefined &&
      dto.desiredSalaryMin > dto.desiredSalaryMax
    ) {
      throw new BadRequestException('Mức lương tối thiểu không được lớn hơn tối đa');
    }

    await this.repo.updateFields(userId, {
      desired_salary_min: dto.desiredSalaryMin,
      desired_salary_max: dto.desiredSalaryMax,
      desired_location: dto.desiredLocation,
    });
  }
}