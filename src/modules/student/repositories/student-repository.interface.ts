import { GeneralInformationDto } from "../dto/general-information.dto";
import { StudentListDto } from "../dto/get-student-items.dto";
import { CreateResumeDto } from "../dto/update-student.dto";
import { StudentAdminListResult, StudentGeneralInfo, StudentResponse, StudentResumeItem } from "../interfaces/student.interface";

export interface IStudentRepository {
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

  setResumeAsDefault(studentId: number, resumeId: number): Promise<StudentResumeItem | null>;
}