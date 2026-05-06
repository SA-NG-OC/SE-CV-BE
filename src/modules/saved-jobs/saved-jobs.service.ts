import { Inject, Injectable } from "@nestjs/common";
import { I_SAVED_JOB_REPOSITORY, type ISavedJobRepository } from "./repositories/saved-jobs-repository.interface";

@Injectable()
export class SavedJobService {
  constructor(
    @Inject(I_SAVED_JOB_REPOSITORY)
    private readonly repo: ISavedJobRepository) { }

  async saveJob(studentId: number, jobId: number) {
    await this.repo.saveJob(studentId, jobId);

    return {
      jobId,
      isSaved: true,
    };
  }

  async unsaveJob(studentId: number, jobId: number) {
    await this.repo.unsaveJob(studentId, jobId);

    return {
      jobId,
      isSaved: false,
    };
  }
}