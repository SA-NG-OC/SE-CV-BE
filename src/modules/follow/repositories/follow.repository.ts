import { BadRequestException, Inject, Injectable } from "@nestjs/common";
import { IFollowedCompanyRepository } from "./follow-repository.interface";
import { DATABASE_CONNECTION } from "src/database/database.module";
import { NodePgDatabase } from "drizzle-orm/node-postgres";
import { FollowedCompanyRaw } from "../types/followed-company.raw.type";
import { and, eq, sql } from "drizzle-orm";
import * as schema from '../../../database/schema';

// followed-company.repository.ts
@Injectable()
export class FollowedCompanyRepository
    implements IFollowedCompanyRepository {
    constructor(
        @Inject(DATABASE_CONNECTION)
        private readonly db: NodePgDatabase<typeof schema>,
    ) { }

    async follow(
        studentId: number,
        companyId: number,
    ): Promise<void> {
        try {
            await this.db
                .insert(schema.followed_companies)
                .values({
                    student_id: studentId,
                    company_id: companyId,
                })
        } catch (error: any) {
            if (error.code === '23505') {
                throw new BadRequestException('Bạn đã follow công ty này rồi');
            }
            throw error;
        }
    }

    async unfollow(studentId: number, companyId: number): Promise<void> {
        await this.db
            .delete(schema.followed_companies)
            .where(
                and(
                    eq(schema.followed_companies.student_id, studentId),
                    eq(schema.followed_companies.company_id, companyId),
                ),
            );
    }

    async getFollowerUserIdsByCompanyId(companyId: number): Promise<number[]> {
        const result = await this.db
            .select({
                user_id: schema.students.user_id,
            })
            .from(schema.followed_companies)
            .innerJoin(
                schema.students,
                eq(schema.followed_companies.student_id, schema.students.student_id),
            )
            .where(eq(schema.followed_companies.company_id, companyId));

        return result
            .map((r) => r.user_id)
            .filter((id): id is number => id !== null);
    }

    async checkFollowed(userId: number, companyId: number): Promise<boolean> {
        const result = await this.db.execute<{ is_followed: boolean }>(sql`
  SELECT EXISTS (
    SELECT 1
    FROM followed_companies fc
    JOIN students s ON s.student_id = fc.student_id
    WHERE s.user_id = ${userId}
      AND fc.company_id = ${companyId}
  ) AS is_followed
`);

        return Boolean(result.rows[0].is_followed);
    }
}