export interface ISavedJobRepository {
  saveJob(studentId: number, jobId: number): Promise<void>;
  unsaveJob(studentId: number, jobId: number): Promise<void>;
  checkSaved(studentId: number, jobId: number): Promise<boolean>;
  getJobSaved(studentId: number): Promise<number[]>;
}

export const I_SAVED_JOB_REPOSITORY = 'I_SAVED_JOB_REPOSITORY';
