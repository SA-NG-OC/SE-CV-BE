import { Inject, Injectable, NotFoundException } from "@nestjs/common";
import { NodePgDatabase } from "drizzle-orm/node-postgres";
import { eq, sql } from "drizzle-orm";

import { DATABASE_CONNECTION } from "src/database/database.module";
import * as schema from "src/database/schema";
import { PaginationResponse } from "src/common/types/pagination-response";

import { IJobCategoryRepository } from "./job-category-repository.interface";
import {
    JobCategoryRaw,
    JobCategoryWithCount,
    JobCategoryStatsRaw,
} from "../types/job-category.raw";

@Injectable()
export class JobCategoryRepository implements IJobCategoryRepository {
    constructor(
        @Inject(DATABASE_CONNECTION)
        private readonly db: NodePgDatabase<typeof schema>,
    ) { }

    async findAll(
        page: number,
        limit: number,
    ): Promise<PaginationResponse<JobCategoryWithCount>> {
        const offset = (page - 1) * limit;

        const data = await this.db
            .select({
                category_id: schema.job_categories.category_id,
                category_name: schema.job_categories.category_name,
                is_active: schema.job_categories.is_active,
                created_at: schema.job_categories.created_at,
                job_count: sql<number>`count(${schema.job_postings.job_id})::int`,
            })
            .from(schema.job_categories)
            .leftJoin(
                schema.job_postings,
                eq(schema.job_categories.category_id, schema.job_postings.category_id),
            )
            .groupBy(schema.job_categories.category_id)
            .limit(limit)
            .offset(offset);

        const [totalResult] = await this.db
            .select({ count: sql<number>`count(*)::int` })
            .from(schema.job_categories);

        return new PaginationResponse(
            data,
            page,
            limit,
            totalResult?.count ?? 0,
        );
    }

    async findById(id: number): Promise<JobCategoryRaw | null> {
        const [result] = await this.db
            .select()
            .from(schema.job_categories)
            .where(eq(schema.job_categories.category_id, id))
            .limit(1);

        return result ?? null;
    }

    async create(categoryName: string): Promise<number> {
        const [result] = await this.db
            .insert(schema.job_categories)
            .values({ category_name: categoryName })
            .returning({ id: schema.job_categories.category_id });

        return result.id;
    }

    async updateName(id: number, categoryName: string): Promise<void> {
        const result = await this.db
            .update(schema.job_categories)
            .set({ category_name: categoryName })
            .where(eq(schema.job_categories.category_id, id))
            .returning({ id: schema.job_categories.category_id });

        if (result.length === 0) {
            throw new NotFoundException("Không tìm thấy danh mục");
        }
    }

    async delete(id: number): Promise<void> {
        const result = await this.db
            .delete(schema.job_categories)
            .where(eq(schema.job_categories.category_id, id))
            .returning({ id: schema.job_categories.category_id });

        if (result.length === 0) {
            throw new NotFoundException("Không tìm thấy danh mục");
        }
    }

    async toggleActiveStatus(categoryId: number): Promise<void> {
        const [existing] = await this.db
            .select({ is_active: schema.job_categories.is_active })
            .from(schema.job_categories)
            .where(eq(schema.job_categories.category_id, categoryId))
            .limit(1);

        if (!existing) {
            throw new NotFoundException("Không tìm thấy danh mục");
        }

        await this.db
            .update(schema.job_categories)
            .set({ is_active: !existing.is_active })
            .where(eq(schema.job_categories.category_id, categoryId));
    }

    async getStats(): Promise<JobCategoryStatsRaw> {
        const [result] = await this.db
            .select({
                total_categories: sql<number>`count(*)::int`,
                active_categories: sql<number>`count(*) filter (where is_active = true)::int`,
                total_jobs: sql<number>`(
                    select count(*) from ${schema.job_postings}
                )::int`,
            })
            .from(schema.job_categories);

        return result;
    }
}