export type InvitationStatus = 'pending' | 'accepted' | 'rejected' | 'expired';

export interface JobInvitationProps {
    id: number;
    jobId: number;
    studentId: number;
    message: string | null;
    status: InvitationStatus;
    createdAt: Date;
    updatedAt: Date;
}