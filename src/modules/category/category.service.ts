import { Inject, Injectable } from "@nestjs/common";
import type { IJobCategoryRepository } from "./repositories/job-category-repository.interface";
import { JobCategoryResponse, JobCategoryStats } from "./interface";
import { PaginationResponse } from "src/common/types/pagination-response";


@Injectable()
export class JobCategoryService {
  constructor(
    @Inject('I_JOB_CATEGORY_REPOSITORY')
    private readonly repo: IJobCategoryRepository,
  ) { }

  async findAll(
    page: number = 1,
    limit: number = 10
  ): Promise<PaginationResponse<JobCategoryResponse>> {
    return this.repo.findAll(page, limit);
  }

  async create(categoryName: string): Promise<number> {
    return this.repo.create(categoryName);
  }

  async updateName(id: number, categoryName: string): Promise<void> {
    await this.repo.updateName(id, categoryName);
  }

  async delete(id: number): Promise<void> {
    await this.repo.delete(id);
  }

  async toggleActiveStatus(id: number): Promise<void> {
    await this.repo.toggleActiveStatus(id);
  }

  async getStats(): Promise<JobCategoryStats> {
    const raw = await this.repo.getStats();
    return raw;
  }
}