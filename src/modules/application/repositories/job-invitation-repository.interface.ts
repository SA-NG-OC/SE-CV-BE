import { JobInvitationDomain } from "../domain/job-invitation/job-invitation.domain";
import { InvitationStatus } from "../domain/job-invitation/job-invitation.props";
import { InvitationCardView, EmployerInvitationCardView } from "../domain/job-invitation/job-invitation.mapper";

export interface IJobInvitationRepository {
    // WRITE
    save(invitation: JobInvitationDomain): Promise<JobInvitationDomain>;

    // READ — Single
    findById(invitationId: number): Promise<JobInvitationDomain | null>;

    findByJobId(jobId: number, studentId: number): Promise<JobInvitationDomain | null>;

    // READ — Student view
    findByStudent(
        studentId: number,
        status?: InvitationStatus
    ): Promise<InvitationCardView[]>;

    // READ — Employer view
    findByCompany(
        companyId: number,
        status?: InvitationStatus
    ): Promise<EmployerInvitationCardView[]>;
}