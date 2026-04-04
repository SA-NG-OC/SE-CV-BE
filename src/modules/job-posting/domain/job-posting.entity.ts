import { InferSelectModel } from "drizzle-orm";
import { job_postings } from "src/database/schema";

export type JobPostingEntity = InferSelectModel<typeof job_postings>;