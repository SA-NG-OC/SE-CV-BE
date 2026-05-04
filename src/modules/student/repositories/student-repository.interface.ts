import { PaginationResponse } from 'src/common/types/pagination-response';
import { CreateResumeDto } from '../dto/update-student.dto';
import { GetStudentsQuery, StudentGeneralInfo } from '../types/student.interface';
import {
  MajorRaw,
  StudentAdminListRaw,
  StudentApplicationCountRaw,
  StudentCardRaw,
  StudentGeneralInfoRaw,
  StudentProfileRaw,
  StudentRaw,
  StudentResumeRaw,
  StudentSkillsRaw,
  StudentWithMajorRaw,
} from '../types/student.raw';

export interface IStudentRepository {
  findRawById(actorId: number): Promise<number | null>
  getMajors();
  // Read
  getGeneralInformation(): Promise<StudentGeneralInfoRaw>
  getStudentListAdmin(
    page: number,
    limit: number,
    status?: 'STUDYING' | 'GRADUATED' | 'DROPPED_OUT',
    keyword?: string,
  ): Promise<StudentAdminListRaw>;

  findStudentWithMajor(studentId: number): Promise<StudentWithMajorRaw | null>;

  findSkillsByStudent(studentId: number): Promise<StudentSkillsRaw>;

  findResumesByStudent(studentId: number, isDefault?: boolean): Promise<StudentResumeRaw[]>;

  countApplicationsByStudent(studentId: number): Promise<StudentApplicationCountRaw>;

  findStudentCards(query: GetStudentsQuery): Promise<PaginationResponse<StudentCardRaw>>;

  findStudentProfileByUserId(userId: number): Promise<StudentProfileRaw | null>;

  findRawById2(studentId: number): Promise<StudentRaw | null>

  updateFields(userId: number, fields: Partial<Record<string, unknown>>): Promise<void>;

  updateByStudentId(studentId: number, fields: Partial<Record<string, unknown>>): Promise<void>;

  replaceSkills(studentId: number, skillIds: number[]): Promise<void>;

  insertResume(
    studentId: number,
    data: CreateResumeDto,
    isDefault: boolean,
  ): Promise<StudentResumeRaw>;

  deleteResume(resumeId: number): Promise<void>;

  setDefaultResume(studentId: number, resumeId: number): Promise<StudentResumeRaw | null>;

  findResumeById(resumeId: number, studentId: number): Promise<StudentResumeRaw | null>;
}