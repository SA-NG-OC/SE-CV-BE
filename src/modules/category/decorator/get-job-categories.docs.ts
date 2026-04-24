import { applyDecorators } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiOkResponse, ApiQuery } from '@nestjs/swagger';

export const GetJobCategoriesDocs = () => applyDecorators(
    ApiBearerAuth(),
    ApiOperation({
        summary: 'Lấy danh sách danh mục (Admin)',
        description: 'Trả về danh sách danh mục có phân trang',
    }),
    ApiQuery({ name: 'page', required: false, example: 1 }),
    ApiQuery({ name: 'limit', required: false, example: 10 }),
    ApiOkResponse({
        description: 'Lấy danh sách thành công',
        example: {
            success: true,
            message: 'Lấy danh sách thành công',
            data: {
                data: [
                    {
                        categoryId: 1,
                        categoryName: 'IT',
                        isActive: true,
                        jobCount: 12,
                        createdAt: '2026-04-24T00:00:00.000Z'
                    }
                ],
                meta: {
                    currentPage: 1,
                    itemsPerPage: 10,
                    totalItems: 50,
                    totalPages: 5
                }
            }
        }
    }),
);