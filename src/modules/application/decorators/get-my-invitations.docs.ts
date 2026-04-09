import { applyDecorators } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiResponse, ApiQuery } from '@nestjs/swagger';

export const GetMyInvitationsDocs = () => applyDecorators(
    ApiBearerAuth(),
    ApiOperation({
        summary: 'Danh sách lời mời ứng tuyển (Sinh viên)',
        description: 'Xem các lời mời từ công ty gửi đến sinh viên. Yêu cầu role STUDENT.',
    }),
    ApiQuery({ name: 'status', required: false, enum: ['pending', 'accepted', 'rejected', 'expired'] }),
    ApiResponse({
        status: 200, description: 'Lấy danh sách lời mời thành công', example: {
            success: true,
            message: "Lấy danh sách lời mời thành công",
            data: [
                {
                    invitationId: 2,
                    status: "accepted",
                    message: "Chúng tôi thấy bạn phù hợp với vị trí Backend Intern",
                    createdAt: "2026-04-08T12:41:27.515Z",
                    job: {
                        jobId: 7,
                        jobTitle: "Hahahahahahahahahaha"
                    },
                    company: {
                        companyName: "TechNova Solutions",
                        logoUrl: "https://res.cloudinary.com/deagejli9/image/upload/v1775297599/nest_uploads/lfhhh3dlsvqatwmyibt5.png"
                    }
                }
            ]
        }
    }),
);