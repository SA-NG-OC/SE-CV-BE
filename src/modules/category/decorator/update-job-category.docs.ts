import { applyDecorators } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiOkResponse, ApiParam, ApiBody } from '@nestjs/swagger';

export const UpdateJobCategoryDocs = () => applyDecorators(
    ApiBearerAuth(),
    ApiOperation({
        summary: 'Cập nhật danh mục (Admin)',
    }),
    ApiParam({
        name: 'id',
        type: Number,
        example: 1,
    }),
    ApiBody({
        schema: {
            type: 'object',
            properties: {
                categoryName: {
                    type: 'string',
                    example: 'Marketing',
                },
            },
        },
    }),
    ApiOkResponse({
        description: 'Cập nhật thành công',
        example: {
            success: true,
            message: 'Cập nhật thành công',
            data: {}
        }
    }),
);