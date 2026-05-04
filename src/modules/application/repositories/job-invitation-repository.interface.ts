import { JobInvitationDomain } from "../domain/job-invitation/job-invitation.domain";
import { InvitationStatus } from "../domain/job-invitation/job-invitation.props";
import { InvitationCardView, EmployerInvitationCardView } from "../domain/job-invitation/job-invitation.mapper";
import { PaginationResponse } from "src/common/types/pagination-response";

export interface IJobInvitationRepository {
    // WRITE
    save(invitation: JobInvitationDomain): Promise<JobInvitationDomain>;

    // READ — Single
    findById(invitationId: number): Promise<JobInvitationDomain | null>;

    findByJobId(jobId: number, studentId: number): Promise<JobInvitationDomain | null>;

    // READ — Student view
    findByStudent(
        studentId: number,
        query: { page: number; limit: number; status?: InvitationStatus }
    ): Promise<PaginationResponse<InvitationCardView>>;

    // READ — Employer view
    findByCompany(
        companyId: number,
        query: { page: number; limit: number; status?: InvitationStatus }
    ): Promise<PaginationResponse<EmployerInvitationCardView>>;

    countStatsByCompany(companyId: number): Promise<{
        total: number;
        byStatus: Record<string, number>;
    }>

    countStatsByStudent(studentId: number): Promise<{
        total: number;
        byStatus: Record<string, number>;
    }>
}