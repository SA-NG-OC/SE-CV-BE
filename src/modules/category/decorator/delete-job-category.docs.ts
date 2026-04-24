import { applyDecorators } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiOkResponse, ApiParam } from '@nestjs/swagger';

export const DeleteJobCategoryDocs = () => applyDecorators(
    ApiBearerAuth(),
    ApiOperation({
        summary: 'Xóa danh mục (Admin)',
    }),
    ApiParam({
        name: 'id',
        type: Number,
        example: 1,
    }),
    ApiOkResponse({
        description: 'Xóa thành công',
        example: {
            success: true,
            message: 'Xóa thành công',
            data: {}
        }
    }),
);