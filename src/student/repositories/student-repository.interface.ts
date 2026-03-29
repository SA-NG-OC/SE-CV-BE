import { GeneralInformationDto } from "../dto/general-information.dto";
import { StudentListDto } from "../dto/get-student-items.dto";
import { CreateResumeDto } from "../dto/update-student.dto";

export interface IStudentRepository {
  // Read
  getGeneralInformation(): Promise<GeneralInformationDto>;

  getStudentListAdmin(
    page: number,
    limit: number,
    status?: "STUDYING" | "GRADUATED" | "DROPPED_OUT",
    keyword?: string
  ): Promise<StudentListDto>;

  getStudentBasicInfo(studentId: number): Promise<any>;

  getStudentSkills(studentId: number): Promise<string[]>;

  getStudentResumes(studentId: number): Promise<any[]>;

  getStudentApplicationCount(studentId: number): Promise<number>;

  // Update
  updateJobStatus(studentId: number, isOpenToWork: boolean): Promise<any>;

  syncStudentSkills(studentId: number, skillIds: number[]): Promise<void>;

  addResume(studentId: number, data: CreateResumeDto): Promise<any>;

  setResumeAsDefault(studentId: number, resumeId: number): Promise<any>;
}