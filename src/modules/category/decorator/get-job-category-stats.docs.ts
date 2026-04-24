import { applyDecorators } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiOkResponse } from '@nestjs/swagger';

export const GetJobCategoryStatsDocs = () => applyDecorators(
    ApiBearerAuth(),
    ApiOperation({
        summary: 'Thống kê danh mục (Admin)',
    }),
    ApiOkResponse({
        description: 'Lấy thống kê thành công',
        example: {
            success: true,
            message: 'Lấy thống kê thành công',
            data: {
                totalCategories: 10,
                activeCategories: 8,
                totalJobs: 244
            }
        }
    }),
);