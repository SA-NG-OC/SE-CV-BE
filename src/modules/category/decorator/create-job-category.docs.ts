import { applyDecorators } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiOkResponse, ApiBody } from '@nestjs/swagger';

export const CreateJobCategoryDocs = () => applyDecorators(
    ApiBearerAuth(),
    ApiOperation({
        summary: 'Tạo danh mục (Admin)',
    }),
    ApiBody({
        schema: {
            type: 'object',
            required: ['category_name'],
            properties: {
                category_name: {
                    type: 'string',
                    example: 'IT',
                    minLength: 2,
                    maxLength: 100,
                },
            },
        },
    }),
    ApiOkResponse({
        description: 'Tạo thành công',
        example: {
            success: true,
            message: 'Tạo danh mục thành công',
            data: {
                id: 1
            }
        }
    }),
);