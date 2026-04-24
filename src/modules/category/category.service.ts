import { Inject, Injectable, NotFoundException } from "@nestjs/common";

import { PaginationResponse } from "src/common/types/pagination-response";
import { I_JOB_CATEGORY_REPOSITORY, type IJobCategoryRepository } from "./repositories/job-category-repository.interface";
import { JobCategoryResponse, JobCategoryStats } from "./types";
import { JobCategoryMapper } from "./mapper/job-category.mapper";


@Injectable()
export class JobCategoryService {
  constructor(
    @Inject(I_JOB_CATEGORY_REPOSITORY)
    private readonly repo: IJobCategoryRepository,
  ) { }

  async findAll(
    page: number,
    limit: number,
  ): Promise<PaginationResponse<JobCategoryResponse>> {
    const raw = await this.repo.findAll(page, limit);

    return {
      ...raw,
      data: JobCategoryMapper.toResponseArray(raw.data),
    };
  }

  async findById(id: number): Promise<JobCategoryResponse> {
    const raw = await this.repo.findById(id);

    if (!raw) {
      throw new NotFoundException("Không tìm thấy danh mục");
    }

    return JobCategoryMapper.toResponse({ ...raw, job_count: 0 });
  }

  async create(categoryName: string): Promise<{ id: number }> {
    const id = await this.repo.create(categoryName);
    return { id };
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
    return JobCategoryMapper.toStatsResponse(raw);
  }
}