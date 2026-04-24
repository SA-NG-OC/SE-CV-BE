import { JobCategoryResponse, JobCategoryStats } from "../types";

export class JobCategoryMapper {
    static toResponse(raw: {
        category_id: number,
        category_name: string,
        is_active: boolean,
        created_at: Date | null,
        job_count: number,
    }): JobCategoryResponse {
        return {
            categoryId: raw.category_id,
            categoryName: raw.category_name,
            isActive: raw.is_active,
            createdAt: raw.created_at,
            jobCount: raw.job_count,
        }

    }

    static toResponseArray(raw: {
        category_id: number,
        category_name: string,
        is_active: boolean,
        created_at: Date | null,
        job_count: number,
    }[]): JobCategoryResponse[] {
        return raw.map((item) => this.toResponse(item));
    }

    static toStatsResponse(data: {
        total_categories: number,
        active_categories: number,
        total_jobs: number
    }): JobCategoryStats {
        return {
            totalCategories: data.total_categories ?? 0,
            activeCategories: data.active_categories ?? 0,
            totalJobs: data.total_jobs ?? 0,
        };
    }
}