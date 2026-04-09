export type ApplicationStatus =
    | 'submitted'
    | 'interviewing'
    | 'passed'
    | 'rejected';

export interface ApplicationProps {
    id: number;
    jobId: number;
    studentId: number;
    cvUrl: string;
    coverLetter: string | null;
    status: ApplicationStatus;
    createdAt: Date;
    updatedAt: Date;
}