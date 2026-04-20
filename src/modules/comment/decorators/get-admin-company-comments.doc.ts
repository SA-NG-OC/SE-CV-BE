import { applyDecorators } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiOkResponse, ApiParam, ApiQuery } from '@nestjs/swagger';

export const GetAdminCompanyCommentsDocs = () => applyDecorators(
    ApiBearerAuth(),
    ApiOperation({ summary: 'Admin xem đánh giá của một công ty' }),
    ApiParam({ name: 'companyId', type: Number, description: 'ID của công ty cần xem' }),
    ApiQuery({ name: 'page', required: false, type: Number }),
    ApiQuery({ name: 'limit', required: false, type: Number }),
    ApiOkResponse({
        description: 'Tải dữ liệu thành công',
        example: {
            success: true,
            message: "Đánh giá được tải thành công",
            data: {
                data: [
                    {
                        id: 1,
                        studentId: 100,
                        studentName: "Nguyễn Văn B",
                        studentAvatar: "https://res.cloudinary.com/deagejli9/image/upload/v1776239999/nest_uploads/qwio1okqffu5en7ddxjo.png",
                        companyId: 7,
                        rating: 3,
                        content: "Công ty có nhiều người không tốt",
                        createdAt: "2026-04-20T07:18:29.309Z",
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