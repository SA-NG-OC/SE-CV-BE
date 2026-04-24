import { PaginationResponse } from "src/common/types/pagination-response";
import {
    JobCategoryRaw,
    JobCategoryWithCount,
    JobCategoryStatsRaw,
} from "../types/job-category.raw";

export const I_JOB_CATEGORY_REPOSITORY = 'I_JOB_CATEGORY_REPOSITORY';

export interface IJobCategoryRepository {
    findAll(page: number, limit: number): Promise<PaginationResponse<JobCategoryWithCount>>;
    findById(id: number): Promise<JobCategoryRaw | null>;
    create(categoryName: string): Promise<number>;
    updateName(id: number, categoryName: string): Promise<void>;
    delete(id: number): Promise<void>;
    toggleActiveStatus(categoryId: number): Promise<void>;
    getStats(): Promise<JobCategoryStatsRaw>;
}