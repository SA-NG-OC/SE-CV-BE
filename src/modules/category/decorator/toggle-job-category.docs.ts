import { applyDecorators } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiOkResponse, ApiParam } from '@nestjs/swagger';

export const ToggleJobCategoryDocs = () => applyDecorators(
    ApiBearerAuth(),
    ApiOperation({
        summary: 'Bật/tắt trạng thái danh mục (Admin)',
    }),
    ApiParam({
        name: 'id',
        type: Number,
        example: 1,
    }),
    ApiOkResponse({
        description: 'Cập nhật trạng thái thành công',
        example: {
            success: true,
            message: 'Cập nhật trạng thái thành công',
            data: {}
        }
    }),
);