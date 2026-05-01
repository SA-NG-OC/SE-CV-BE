import { applyDecorators } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiResponse, ApiQuery } from '@nestjs/swagger';

export const GetCompanyInvitationsDocs = () => applyDecorators(
    ApiBearerAuth(),

    ApiOperation({
        summary: 'Danh sách lời mời đã gửi',
        description: 'Xem các lời mời mà công ty đã gửi cho các ứng viên. Yêu cầu role COMPANY.',
    }),

    // ===== FILTER =====
    ApiQuery({
        name: 'status',
        required: false,
        enum: ['pending', 'accepted', 'rejected', 'expired'],
        description: 'Lọc theo trạng thái lời mời',
    }),

    ApiQuery({
        name: 'search',
        required: false,
        type: String,
        example: 'An',
        description: 'Tìm kiếm theo tên sinh viên, email hoặc tiêu đề job',
    }),

    ApiQuery({
        name: 'categoryId',
        required: false,
        type: Number,
        example: 2,
        description: 'Lọc theo danh mục công việc',
    }),

    ApiQuery({
        name: 'dateRange',
        required: false,
        enum: ['7days', '30days'],
        example: '7days',
        description: 'Lọc theo thời gian tạo (7 ngày hoặc 30 ngày gần nhất)',
    }),

    // ===== PAGINATION =====
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

    // ===== RESPONSE =====
    ApiResponse({
        status: 200,
        description: 'Lấy danh sách thành công',
        example: {
            success: true,
            message: "Lấy danh sách lời mời đã gửi thành công",
            data: {
                data: [
                    {
                        invitationId: 1,
                        status: "pending",
                        message: "Chúng tôi thấy bạn phù hợp với vị trí Backend Intern",
                        createdAt: "2026-04-29T01:11:40.673Z",
                        student: {
                            studentId: 100,
                            fullName: "Nguyễn Văn A",
                            avatarUrl: null,
                            email: "nguyenvana@student.edu.vn",
                            currentYear: 4,
                            gpa: "3.45",
                            isOpenToWork: true,
                            studentStatus: 'GRADUATED',
                        },
                        job: {
                            jobId: 3,
                            jobTitle: "Devops",
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
        },
    }),
);