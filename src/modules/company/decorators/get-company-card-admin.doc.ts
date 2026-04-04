import { applyDecorators } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiOkResponse, ApiQuery } from '@nestjs/swagger';

export const GetCompanyCardAdminDocs = () => applyDecorators(
    ApiBearerAuth(),
    ApiOperation({
        summary: 'Lấy danh sách công ty (Admin)',
        description: 'Trả về danh sách công ty có phân trang và bộ lọc theo trạng thái. Yêu cầu role ADMIN.',
    }),
    ApiQuery({ name: 'page', required: false, type: Number, example: 1 }),
    ApiQuery({ name: 'limit', required: false, type: Number, example: 10 }),
    ApiQuery({
        name: 'status',
        required: false,
        enum: ['PENDING', 'APPROVED', 'REJECTED', 'RESTRICTED'],
        description: 'Lọc theo trạng thái công ty',
    }),
    ApiOkResponse({
        description: 'Lấy danh sách công ty thành công',
        example: {
            success: true,
            message: "Lấy thông tin thành công",
            data: {
                data: [
                    {
                        companyId: 7,
                        companyName: "TechNova Solutions",
                        logoUrl: "https://res.cloudinary.com/deagejli9/image/upload/v1775297599/nest_uploads/lfhhh3dlsvqatwmyibt5.png",
                        industry: "Information Technology",
                        status: "PENDING",
                        rating: 0,
                        followers: 0,
                        totalJobs: 0,
                        companySize: "50-100",
                        createdAt: "2026-04-04T10:13:24.754Z"
                    }
                ],
                meta: {
                    currentPage: 1,
                    itemsPerPage: 10,
                    totalItems: 1,
                    totalPages: 1
                },
                status: [
                    {
                        status: "PENDING",
                        count: 1
                    }
                ]
            }
        },
    }),
);