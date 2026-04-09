import { applyDecorators } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiResponse, ApiQuery } from '@nestjs/swagger';

export const GetCompanyInvitationsDocs = () => applyDecorators(
    ApiBearerAuth(),
    ApiOperation({
        summary: 'Danh sách lời mời đã gửi',
        description: 'Xem các lời mời mà công ty đã gửi cho các ứng viên. Yêu cầu role COMPANY.',
    }),
    ApiQuery({ name: 'status', required: false, enum: ['pending', 'accepted', 'rejected', 'expired'] }),
    ApiResponse({
        status: 200, description: 'Lấy danh sách thành công', example: {
            success: true,
            message: "Lấy danh sách lời mời đã gửi thành công",
            data: [
                {
                    invitationId: 3,
                    status: "pending",
                    message: "Chúng tôi thấy bạn phù hợp với vị trí Backend Intern",
                    createdAt: "2026-04-09T01:58:06.812Z",
                    student: {
                        studentId: 100,
                        fullName: "Nguyễn Văn A",
                        avatarUrl: null,
                        email: "nguyenvana@student.edu.vn"
                    },
                    job: {
                        jobTitle: "Frontend Developer Intern 3.0"
                    }
                },
                {
                    invitationId: 2,
                    status: "rejected",
                    message: "Chúng tôi thấy bạn phù hợp với vị trí Backend Intern",
                    createdAt: "2026-04-08T12:41:27.515Z",
                    student: {
                        studentId: 100,
                        fullName: "Nguyễn Văn A",
                        avatarUrl: null,
                        email: "nguyenvana@student.edu.vn"
                    },
                    job: {
                        jobTitle: "Hahahahahahahahahaha"
                    }
                }
            ]
        }
    }),
);