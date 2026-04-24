import { PaginationResponse } from "src/common/types/pagination-response";
import { JobCategoryResponse, JobCategoryStats } from "../interface";

export const I_JOB_CATEGORY_REPOSITORY = 'I_JOB_CATEGORY_REPOSITORY';

export interface IJobCategoryRepository {
    findAll(page: number, limit: number): Promise<PaginationResponse<JobCategoryResponse>>;
    create(categoryName: string): Promise<number>;
    updateName(id: number, categoryName: string): Promise<void>;
    delete(id: number): Promise<void>;
    toggleActiveStatus(categoryId: number): Promise<void>;
    findById(id: number);
    getStats(): Promise<JobCategoryStats>;
}