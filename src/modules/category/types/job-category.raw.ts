import { InferSelectModel } from "drizzle-orm";
import * as schema from "src/database/schema";

export type JobCategoryRaw = InferSelectModel<typeof schema.job_categories>;
export type JobCategoryWithCount = JobCategoryRaw & { job_count: number };
export type JobCategoryStatsRaw = {
    total_categories: number;
    active_categories: number;
    total_jobs: number;
};