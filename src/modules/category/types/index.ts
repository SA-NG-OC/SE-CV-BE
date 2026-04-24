export interface JobCategoryResponse {
    categoryId: number;
    categoryName: string;
    isActive: boolean;
    jobCount: number;
    createdAt: Date | null;
}

export interface JobCategoryStats {
    totalCategories: number;
    activeCategories: number;
    totalJobs: number;
}