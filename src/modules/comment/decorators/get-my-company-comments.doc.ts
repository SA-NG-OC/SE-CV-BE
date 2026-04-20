import { applyDecorators } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiOkResponse, ApiQuery } from '@nestjs/swagger';

export const GetMyCompanyCommentsDocs = () => applyDecorators(
    ApiBearerAuth(),
    ApiOperation({
        summary: 'Công ty xem đánh giá của chính mình',
        description: 'Lấy danh sách đánh giá ẩn danh dành cho phía công ty quản lý. Nhưng chỉ có thể xem ẩn danh'
    }),
    ApiQuery({ name: 'page', required: false, type: Number, example: 1 }),
    ApiQuery({ name: 'limit', required: false, type: Number, example: 10 }),
    ApiOkResponse({
        description: 'Tải dữ liệu thành công',
        example: {
            success: true,
            message: "Đánh giá được tải thành công",
            data: {
                data: [
                    {
                        id: 2,
                        companyId: 7,
                        rating: 4,
                        content: "Công ty rất tốt, môi trường chuyên nghiệp",
                        createdAt: "2026-04-20T07:53:11.709Z",
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