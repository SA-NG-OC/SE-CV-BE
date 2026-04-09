import { InvitationStatus } from './job-invitation.props';

export interface InvitationCardView {
    invitationId: number;
    status: InvitationStatus;
    message: string | null;
    createdAt: Date;
    job: {
        jobId: number;
        jobTitle: string;
    };
    company: {
        companyName: string;
        logoUrl: string | null;
    };
}

export interface EmployerInvitationCardView {
    invitationId: number;
    status: InvitationStatus;
    message: string | null;
    createdAt: Date;

    student: {
        studentId: number;
        fullName: string;
        avatarUrl: string | null;
        email: string | null;
    };

    job: {
        jobTitle: string;
    };
}

export class JobInvitationMapper {
    /**
     * Dùng cho phía Sinh viên: Xem danh sách lời mời mình nhận được
     */
    static toStudentInvitationView(raw: {
        invitation_id: number;
        status: string;
        message: string | null;
        created_at: Date;
        job_id: number;
        job_title: string;
        company_name: string;
        logo_url: string | null;
    }): InvitationCardView {
        return {
            invitationId: raw.invitation_id,
            status: raw.status as InvitationStatus,
            message: raw.message,
            createdAt: raw.created_at,
            job: {
                jobId: raw.job_id,
                jobTitle: raw.job_title,
            },
            company: {
                companyName: raw.company_name,
                logoUrl: raw.logo_url,
            },
        };
    }

    /**
     * Dùng cho phía Nhà tuyển dụng: Xem lịch sử các lời mời đã gửi cho ứng viên
     */
    static toEmployerInvitationView(raw: {
        invitation_id: number;
        status: string;
        message: string | null;
        created_at: Date;
        student_id: number;
        full_name: string;
        email: string | null;
        avatar_url: string | null;
        job_title: string;
    }): EmployerInvitationCardView {
        return {
            invitationId: raw.invitation_id,
            status: raw.status as InvitationStatus,
            message: raw.message,
            createdAt: raw.created_at,

            student: {
                studentId: raw.student_id,
                fullName: raw.full_name,
                avatarUrl: raw.avatar_url,
                email: raw.email
            },

            job: {
                jobTitle: raw.job_title,
            },
        };
    }
}