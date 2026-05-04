import { PaginationResponse } from "src/common/types/pagination-response";
import { CreateResumeDto } from "../dto/update-student.dto";
import { GetStudentsQuery, StudentAdminListResult, StudentCard, StudentGeneralInfo, StudentProfile, StudentResponse, StudentResumeItem } from "../types/student.interface";

export interface IStudentRepository {
  getMajors();
  // Read
  getGeneralInformation(): Promise<StudentGeneralInfo>;

  getStudentListAdmin(
    page: number,
    limit: number,
    status?: "STUDYING" | "GRADUATED" | "DROPPED_OUT",
    keyword?: string
  ): Promise<StudentAdminListResult>;

  getStudentBasicInfo(studentId: number): Promise<StudentResponse | null>;

  getStudentSkills(studentId: number): Promise<string[]>;

  getStudentResumes(studentId: number): Promise<StudentResumeItem[]>;

  getStudentApplicationCount(studentId: number): Promise<number>;

  // Update
  updateJobStatus(studentId: number, isOpenToWork: boolean): Promise<StudentResponse | null>;

  syncStudentSkills(studentId: number, skillIds: number[]): Promise<void>;

  addResume(studentId: number, data: CreateResumeDto): Promise<StudentResumeItem>;

  deleteResume(studentId: number, resumeId: number): Promise<void>;

  setResumeAsDefault(studentId: number, resumeId: number): Promise<StudentResumeItem | null>;

  findStudentCards(
    query: GetStudentsQuery
  ): Promise<PaginationResponse<StudentCard>>;

  findStudentProfileByUserId(userId: number): Promise<StudentProfile | null>;

  updateStudentFields(userId: number, fields: any);
}