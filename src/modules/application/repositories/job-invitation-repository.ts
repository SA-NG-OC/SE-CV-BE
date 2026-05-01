import { Inject, Injectable } from "@nestjs/common";
import { DATABASE_CONNECTION } from "src/database/database.module";
import * as schema from '../../../database/schema';
import { NodePgDatabase } from 'drizzle-orm/node-postgres';
import { JobInvitationDomain } from "../domain/job-invitation/job-invitation.domain";
import { and, count, desc, eq, gte, ilike, or, SQL } from "drizzle-orm";
import { InvitationStatus } from "../domain/job-invitation/job-invitation.props";
import { EmployerInvitationCardView, InvitationCardView, JobInvitationMapper } from "../domain/job-invitation/job-invitation.mapper";
import { IJobInvitationRepository } from "./job-invitation-repository.interface";
import { GetInvitationsQueryDto } from "../dto/get-invitations-query.dto";
import { PaginationResponse } from "src/common/types/pagination-response";
@Injectable()
export class JobInvitationRepository implements IJobInvitationRepository {
    constructor(
        @Inject(DATABASE_CONNECTION) private readonly db: NodePgDatabase<typeof schema>
    ) { }

    // =========================================================================
    // WRITE
    // =========================================================================

    /**
     * Tạo mới hoặc cập nhật lời mời (Dùng cho cả gửi lời mời và đổi trạng thái)
     */
    async save(invitation: JobInvitationDomain): Promise<JobInvitationDomain> {
        if (invitation.invitationId === 0) {
            const [inserted] = await this.db
                .insert(schema.job_invitations)
                .values(invitation.toPersistence())
                .returning();
            return JobInvitationDomain.fromPersistence(inserted);
        }

        const [updated] = await this.db
            .update(schema.job_invitations)
            .set({
                status: invitation.status,
                message: invitation.message,
                updated_at: new Date(),
            })
            .where(eq(schema.job_invitations.invitation_id, invitation.invitationId))
            .returning();

        return JobInvitationDomain.fromPersistence(updated);
    }

    // =========================================================================
    // READ — Single
    // =========================================================================

    async findByJobId(jobId: number, studentId: number): Promise<JobInvitationDomain | null> {
        const [row] = await this.db
            .select()
            .from(schema.job_invitations)
            .where(and(eq(schema.job_invitations.job_id, jobId),
                eq(schema.job_invitations.student_id, studentId))
            )
            .limit(1);

        return row ? JobInvitationDomain.fromPersistence(row) : null;
    }

    async findById(invitationId: number): Promise<JobInvitationDomain | null> {
        const [row] = await this.db
            .select()
            .from(schema.job_invitations)
            .where(eq(schema.job_invitations.invitation_id, invitationId),)
            .limit(1);

        return row ? JobInvitationDomain.fromPersistence(row) : null;
    }

    // =========================================================================
    // READ — List cho Sinh viên (Dùng Mapper)
    // =========================================================================

    async findByStudent(
        studentId: number,
        query: { page: number; limit: number; status?: InvitationStatus }
    ): Promise<PaginationResponse<InvitationCardView>> {
        const { page, limit, status } = query;
        const offset = (page - 1) * limit;
        const conditions = [eq(schema.job_invitations.student_id, studentId)];
        if (status) {
            conditions.push(eq(schema.job_invitations.status, status));
        }
        const whereClause = and(...conditions);

        const [totalResult, rows] = await Promise.all([
            this.db
                .select({ total: count() })
                .from(schema.job_invitations)
                .where(whereClause),

            this.db
                .select({
                    invitation_id: schema.job_invitations.invitation_id,
                    status: schema.job_invitations.status,
                    message: schema.job_invitations.message,
                    created_at: schema.job_invitations.created_at,
                    job_id: schema.job_postings.job_id,
                    job_title: schema.job_postings.job_title,
                    company_name: schema.companies.company_name,
                    logo_url: schema.companies.logo_url,
                })
                .from(schema.job_invitations)
                .innerJoin(
                    schema.job_postings,
                    eq(schema.job_invitations.job_id, schema.job_postings.job_id)
                )
                .innerJoin(
                    schema.companies,
                    eq(schema.job_postings.company_id, schema.companies.company_id)
                )
                .where(whereClause)
                .orderBy(desc(schema.job_invitations.created_at))
                .limit(limit)
                .offset(offset),
        ]);

        const totalItems = Number(totalResult[0]?.total || 0);
        const data = rows.map(row => JobInvitationMapper.toStudentInvitationView(row));

        return new PaginationResponse(data, page, limit, totalItems);
    }

    // =========================================================================
    // READ — List cho Nhà tuyển dụng (Dùng Mapper)
    // =========================================================================

    async findByCompany(
        companyId: number,
        query: {
            page: number;
            limit: number;
            status?: InvitationStatus;
            search?: string;
            categoryId?: number;
            dateRange?: '7days' | '30days';
        }
    ): Promise<PaginationResponse<EmployerInvitationCardView>> {
        const { page, limit, status, search, categoryId, dateRange } = query;
        const offset = (page - 1) * limit;

        const conditions: SQL[] = [];

        // bắt buộc
        conditions.push(eq(schema.job_postings.company_id, companyId));

        if (status) {
            conditions.push(eq(schema.job_invitations.status, status));
        }

        if (typeof categoryId === 'number') {
            conditions.push(eq(schema.job_postings.category_id, categoryId));
        }

        if (search) {
            const keyword = `%${search}%`;

            conditions.push(
                or(
                    ilike(schema.students.full_name, keyword),
                    ilike(schema.students.email_student, keyword),
                    ilike(schema.job_postings.job_title, keyword)
                )!
            );
        }

        if (dateRange) {
            const from = new Date();
            from.setDate(from.getDate() - (dateRange === '7days' ? 7 : 30));

            conditions.push(gte(schema.job_invitations.created_at, from));
        }

        const whereClause = conditions.length ? and(...conditions) : undefined;

        // ================= COUNT =================
        const totalResult = await this.db
            .select({ total: count() })
            .from(schema.job_invitations)
            .innerJoin(
                schema.job_postings,
                eq(schema.job_invitations.job_id, schema.job_postings.job_id)
            )
            .innerJoin(
                schema.students,
                eq(schema.job_invitations.student_id, schema.students.student_id)
            )
            .where(whereClause);

        // ================= DATA =================
        const rows = await this.db
            .select({
                invitation_id: schema.job_invitations.invitation_id,
                status: schema.job_invitations.status,
                message: schema.job_invitations.message,
                created_at: schema.job_invitations.created_at,
                student_id: schema.students.student_id,
                full_name: schema.students.full_name,
                email: schema.students.email_student,
                avatar_url: schema.students.avatar_url,
                current_year: schema.students.current_year,
                is_open_to_work: schema.students.is_open_to_work,
                gpa: schema.students.gpa,
                job_title: schema.job_postings.job_title,
                job_id: schema.job_postings.job_id,
                student_status: schema.students.student_status,
            })
            .from(schema.job_invitations)
            .innerJoin(
                schema.job_postings,
                eq(schema.job_invitations.job_id, schema.job_postings.job_id)
            )
            .innerJoin(
                schema.students,
                eq(schema.job_invitations.student_id, schema.students.student_id)
            )
            .where(whereClause)
            .orderBy(desc(schema.job_invitations.created_at))
            .limit(limit)
            .offset(offset);

        const totalItems = Number(totalResult[0]?.total || 0);

        const data = rows.map(row =>
            JobInvitationMapper.toEmployerInvitationView(row)
        );

        return new PaginationResponse(data, page, limit, totalItems);
    }

    async countStatsByCompany(companyId: number): Promise<{
        total: number;
        byStatus: Record<string, number>;
    }> {
        const results = await this.db
            .select({
                status: schema.job_invitations.status,
                count: count(),
            })
            .from(schema.job_invitations)
            .innerJoin(
                schema.job_postings,
                eq(schema.job_invitations.job_id, schema.job_postings.job_id)
            )
            .where(eq(schema.job_postings.company_id, companyId))
            .groupBy(schema.job_invitations.status);

        const stats = {
            total: 0,
            byStatus: {
                pending: 0,
                accepted: 0,
                rejected: 0,
                expired: 0,
            },
        };

        results.forEach((row) => {
            const rowCount = Number(row.count);
            stats.byStatus[row.status] = rowCount;
            stats.total += rowCount;
        });

        return stats;
    }
}