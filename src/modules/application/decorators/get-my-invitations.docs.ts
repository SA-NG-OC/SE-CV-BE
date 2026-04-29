import { applyDecorators } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiResponse, ApiQuery } from '@nestjs/swagger';

export const GetMyInvitationsDocs = () => applyDecorators(
    ApiBearerAuth(),
    ApiOperation({
        summary: 'Danh sách lời mời ứng tuyển (Sinh viên)',
        description: 'Xem các lời mời từ công ty gửi đến sinh viên. Yêu cầu role STUDENT.',
    }),
    ApiQuery({ name: 'status', required: false, enum: ['pending', 'accepted', 'rejected', 'expired'] }),
    ApiQuery({
        name: 'page',
        required: false,
        type: Number,
        example: 1,
        description: 'Số trang hiện tại (mặc định: 1)',
    }),
    ApiQuery({
        name: 'limit',
        required: false,
        type: Number,
        example: 10,
        description: 'Số bản ghi mỗi trang (mặc định: 10, tối đa: 100)',
    }),
    ApiResponse({
        status: 200, description: 'Lấy danh sách lời mời thành công', example: {
            success: true,
            message: "Lấy danh sách lời mời thành công",
            data: {
                data: [
                    {
                        invitationId: 1,
                        status: "pending",
                        message: "Chúng tôi thấy bạn phù hợp với vị trí Backend Intern",
                        createdAt: "2026-04-29T01:11:40.673Z",
                        job: {
                            jobId: 3,
                            jobTitle: "Devops",
                        },
                        company: {
                            companyName: "Tech Solutions Vietnam",
                            logoUrl: null,
                        },
                    },
                ],
                meta: {
                    currentPage: 1,
                    itemsPerPage: 10,
                    totalItems: 1,
                    totalPages: 1,
                },
            },
        }
    }),
);