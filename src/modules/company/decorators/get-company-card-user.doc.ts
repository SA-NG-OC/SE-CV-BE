import { applyDecorators } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiOkResponse, ApiQuery } from '@nestjs/swagger';

export const GetCompanyCardsForUserDocs = () => applyDecorators(
    ApiBearerAuth(),
    ApiOperation({
        summary: 'Lấy danh sách công ty (User)',
        description: 'Trả về danh sách công ty đã được APPROVED, có phân trang. Yêu cầu role STUDENT.',
    }),
    ApiQuery({ name: 'page', required: false, type: Number, example: 1 }),
    ApiQuery({ name: 'limit', required: false, type: Number, example: 10 }),
    // search theo tên công ty
    ApiQuery({
        name: 'search',
        required: false,
        type: String,
        example: 'TechNova',
        description: 'Tìm kiếm theo tên công ty (ilike)',
    }),

    // location (address)
    ApiQuery({
        name: 'location',
        required: false,
        type: String,
        example: 'Hà Nội',
        description: 'Lọc theo địa điểm (match trong address)',
    }),

    // scale
    ApiQuery({
        name: 'scale',
        required: false,
        example: '50-100',
        description: 'Lọc theo quy mô công ty (match exact với DB)',
    }),
    ApiOkResponse({
        description: 'Lấy danh sách công ty thành công',
        example: {
            success: true,
            message: "Lấy danh sách công ty thành công",
            data: {
                data: [
                    {
                        companyId: 7,
                        companyName: "TechNova Solutions",
                        logoUrl: "https://res.cloudinary.com/deagejli9/image/upload/v1775297599/nest_uploads/lfhhh3dlsvqatwmyibt5.png",
                        industry: "Information Technology",
                        activeJobs: 0
                    }
                ],
                meta: {
                    currentPage: 1,
                    itemsPerPage: 10,
                    totalItems: 1,
                    totalPages: 1
                }
            }
        },
    }),
);