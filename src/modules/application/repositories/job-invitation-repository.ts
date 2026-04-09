import { Inject, Injectable } from "@nestjs/common";
import { DATABASE_CONNECTION } from "src/database/database.module";
import * as schema from '../../../database/schema';
import { NodePgDatabase } from 'drizzle-orm/node-postgres';
import { JobInvitationDomain } from "../domain/job-invitation/job-invitation.domain";
import { and, desc, eq } from "drizzle-orm";
import { InvitationStatus } from "../domain/job-invitation/job-invitation.props";
import { EmployerInvitationCardView, InvitationCardView, JobInvitationMapper } from "../domain/job-invitation/job-invitation.mapper";
import { IJobInvitationRepository } from "./job-invitation-repository.interface";
import { GetInvitationsQueryDto } from "../dto/get-invitations-query.dto";
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
        status?: InvitationStatus
    ): Promise<InvitationCardView[]> {
        const conditions = [eq(schema.job_invitations.student_id, studentId)];

        if (status) {
            conditions.push(eq(schema.job_invitations.status, status));
        }

        const rows = await this.db
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
            .innerJoin(schema.job_postings, eq(schema.job_invitations.job_id, schema.job_postings.job_id))
            .innerJoin(schema.companies, eq(schema.job_postings.company_id, schema.companies.company_id))
            .where(and(...conditions))
            .orderBy(desc(schema.job_invitations.created_at));

        return rows.map(row => JobInvitationMapper.toStudentInvitationView(row));
    }

    // =========================================================================
    // READ — List cho Nhà tuyển dụng (Dùng Mapper)
    // =========================================================================

    async findByCompany(
        companyId: number,
        status?: InvitationStatus
    ): Promise<EmployerInvitationCardView[]> {
        const conditions = [eq(schema.job_postings.company_id, companyId)];

        if (status) {
            conditions.push(eq(schema.job_invitations.status, status));
        }

        const rows = await this.db
            .select({
                invitation_id: schema.job_invitations.invitation_id,
                status: schema.job_invitations.status,
                message: schema.job_invitations.message,
                created_at: schema.job_invitations.created_at,
                student_id: schema.students.student_id,
                full_name: schema.students.full_name,
                email: schema.students.email_student, // Sử dụng cột email_student từ schema bạn cung cấp
                avatar_url: schema.students.avatar_url,
                job_title: schema.job_postings.job_title,
            })
            .from(schema.job_invitations)
            .innerJoin(schema.job_postings, eq(schema.job_invitations.job_id, schema.job_postings.job_id))
            .innerJoin(schema.students, eq(schema.job_invitations.student_id, schema.students.student_id))
            .where(and(...conditions))
            .orderBy(desc(schema.job_invitations.created_at));

        return rows.map(row => JobInvitationMapper.toEmployerInvitationView(row));
    }
}